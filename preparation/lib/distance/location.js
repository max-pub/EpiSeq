// import { Thread, mapValues, keep, unique } from '../lib/deps.js'
// import { diagonalNull, ddLog, ddCountAndValidate } from '../lib/matrix.js'
import { DistanceMatrix } from "../../../lib/DistanceMatrix.js"
import { keep } from "../../../lib/ext/bundle.js"
import { postProgress } from "../../../lib/Progress.js"

// export function start(matrix) {
// 	console.log('start contact calculation worker')
// 	let locationTree = groupByPatientID(matrix)
// 	// parseDateStrings(locationTree)
// 	// Thread.post.locationTree(locationTree)

// 	let contactTree = calculateDistanceTree(locationTree)
// 	// Thread.post.contactTree(contactTree)

// 	let contactMatrix = calculateContactMatrix(contactTree)
// 	// for (let type in contactMatrix)
// 		// diagonalNull(contactMatrix[type])
// 	// ddLog(contactMatrix,'contact matrix')
// 	// let counts = mapValues(contactMatrix, v => ddCountAndValidate(v, 'calc contactMatrix'))
// 	// Thread.post.contactMatrix(contactMatrix, counts)

// 	// Thread.post.done()
// 	// let contactTree = calculateDistanceTree(locationTree, flatPairs)
// 	// Thread.post.contactTree(contactTree)
// }






export function groupByPatientID(matrix) {
	let tree = {}
	for (let [id, row] of matrix.iterateRows({onProgress: postProgress('group locations by patientID')})) {
		// Thread.post.progress(patientIDs.indexOf(p1), patientIDs.length)
		if (!row.patientID) continue
		row.from = Date.parse(row.from.replace(' ', 'T')) / 1000
		row.till = Date.parse(row.till.replace(' ', 'T')) / 1000
		tree[row.patientID] ??= {}
		tree[row.patientID][id] ??= { ...keep(row, 'from', 'till', 'clinic', 'ward', 'room') }
	}
	return tree
}

// export function parseDateStrings(tree) {
// 	for (let patientID in tree) {
// 		for (let locationID in tree[patientID]) {
// 			let x = tree[patientID][locationID]
// 			x.from = Date.parse(x.from.replaceAll(' ', 'T')) / 1000
// 			x.till = Date.parse(x.till.replaceAll(' ', 'T')) / 1000
// 		}
// 	}
// }







function getDuration(e1, e2) {
	if (e1.from > e2.till2 || e1.till < e2.from) {  // no time overlap, calculate distance instead
		let distance1 = Math.abs(e1.till - e2.from)
		let distance2 = Math.abs(e2.till - e1.from)
		return - Math.min(distance1, distance2)
	} else {  // calculate overlap in seconds
		let a = Math.max(e1.from, e2.from)
		let b = Math.min(e1.till, e2.till)
		return (b - a)
	}
}

function addLocations(result, e1, e2, type, overlap) {
	let newValue
	if (e1[type] && e1[type] == e2[type]) {
		if (!result[type]) result[type] = {}
		let oldValue = result[type][e1[type]]
		newValue = overlap // assume oldValue is undefined
		if (oldValue !== undefined) {
			if (oldValue > 0 && overlap > 0) newValue = oldValue + overlap // sum up old and new values
			if (oldValue > 0 && overlap < 0) newValue = oldValue // keep old value
			if (oldValue < 0 && overlap > 0) newValue = overlap // use new overlap
			if (oldValue < 0 && overlap < 0) newValue = Math.max(oldValue, overlap) // use the bigger of the negative values
		} // else { like default }
		result[type][e1[type]] = newValue
	}
	// return newValue
}

export function contactBetweenTwoPatients(p1, p2) {
	let result = {}
	for (let e1 of p1) {
		for (let e2 of p2) {
			let duration = getDuration(e1, e2)
			for (let type of ['clinic', 'ward', 'room'])
				addLocations(result, e1, e2, type, duration)
		}
	}
	return result
}


export function calculateDistanceTree(tree) {
	let output = {}
	let patientIDs = Object.keys(tree).sort()
    let progressReporter = postProgress('calculate location distance tree')
	for (let p1 of patientIDs) {
        progressReporter(patientIDs.indexOf(p1) + 1, patientIDs.length)
		let epi1 = Object.values(tree[p1])
		for (let p2 of patientIDs) {
			if (p1 <= p2) continue
			let epi2 = Object.values(tree[p2])
			let result = contactBetweenTwoPatients(epi1, epi2)
			if (Object.keys(result).length == 0) continue
			output[p1] ??= {}
			output[p2] ??= {}
			output[p1][p2] = result
			output[p2][p1] = result
		}
		// Thread.post.progress(patientIDs.indexOf(p1), patientIDs.length)
	}
	// console.log('contact tree', output)
	return output
}


export function calculateContactMatrix(tree) {
	let out = { clinic: new DistanceMatrix('clinic'), ward: new DistanceMatrix('ward'), room: new DistanceMatrix('room'), }
	let patientIDs = Object.keys(tree).sort()
    let progressReporter = postProgress('calculate location distance matrix')
	for (let p1 of patientIDs) {
        progressReporter(patientIDs.indexOf(p1) + 1, patientIDs.length)
		for (let p2 in tree[p1]) {
			if (p1 <= p2) continue
			for (let type in tree[p1][p2]) {
				// out[type][p1] ??= {}
				// console.log('values', type, p1, p2, Object.values(tree[p1][p2][type]))
				// out[type][p1][p2] ??= Math.round(Math.max(...Object.values(tree[p1][p2][type])) / 60 / 60 / 24)//.toFixed(0)
				let val = Math.round(Math.max(...Object.values(tree[p1][p2][type])) / 60 / 60 / 24)//.toFixed(0)
                out[type].set(p1, p2, val)
			}
		}
	}
	// console.log('contact matrix', out)
	return out
}



// export function calculateDistanceTreeForTypingPairs(tree, pairs) {
// 	let output = {}
// 	if (!pairs.length) return {}
// 	let total = 0
// 	for (let i = 0; i < pairs.length; i++) {
// 		let [id1, id2] = pairs[i]
// 		let epi1 = Object.values(tree[id1])
// 		let epi2 = Object.values(tree[id2])
// 		let result = contactBetweenTwoPatients(epi1, epi2)
// 		if (Object.keys(result).length == 0) continue
// 		total++
// 		output[id1] ??= {}
// 		output[id2] ??= {}
// 		output[id1][id2] = result
// 		output[id2][id1] = result
// 		Thread.post.progress(i + 1, pairs.length)
// 		// postMessage(['progress', i + 1, pairs.length])
// 	}
// 	// postMessage(['contactTree', output, total])
// 	// Thread.post.contactTree(output, total)
// 	return output
// }
