import { select, unique } from '../lib/deps.js'

onmessage = event => {
	run(...event.data)
}

function run(locations, typingPairs) {
	// console.log('find contacts')
	// console.log('locations', locations)
	// console.log('typingPairs', typingPairs)
	postMessage(['started'])

	let flatPairs = Object.values(typingPairs).flat()
	// console.log('f.atpairs',flatPairs)
	let pids = unique(flatPairs.flat()).sort()
	// console.log('pids', pids)
	let len1 = Object.keys(locations).length
	for (let id in locations) {
		if (!pids.includes(locations[id].patientID))
			delete locations[id]
	}
	let len2 = Object.keys(locations).length
	postMessage(['locationList', locations, len1, len2])

	let locationTree = groupByPatientID(locations)
	parseDateStrings(locationTree)
	postMessage(['locationTree', locationTree])

	let contactTree = calculateDistanceTree(locationTree, flatPairs)
	// postMessage(['contactTree', contactTree])

	postMessage(['finished'])
}




export function groupByPatientID(list) {
	let tree = {}
	for (let [id, row] of Object.entries(list)) {
		if (!row.patientID) continue
		tree[row.patientID] ??= {}
		tree[row.patientID][id] ??= { ...select(row, 'from', 'till', 'clinic', 'ward', 'room') }
	}
	return tree
}

export function parseDateStrings(tree) {
	for (let patientID in tree) {
		for (let locationID in tree[patientID]) {
			let x = tree[patientID][locationID]
			x.from = Date.parse(x.from.replaceAll(' ', 'T')) / 1000
			x.till = Date.parse(x.till.replaceAll(' ', 'T')) / 1000
		}
	}
}







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


export function calculateDistanceTree(tree, pairs) {
	let output = {}
	if (!pairs.length) return {}
	let total = 0
	for (let i = 0; i < pairs.length; i++) {
		let [id1, id2] = pairs[i]
		let epi1 = Object.values(tree[id1])
		let epi2 = Object.values(tree[id2])
		let result = contactBetweenTwoPatients(epi1, epi2)
		if (Object.keys(result).length == 0) continue
		total++
		output[id1] ??= {}
		output[id2] ??= {}
		output[id1][id2] = result
		output[id2][id1] = result
		postMessage(['progress', i + 1, pairs.length])
	}
	postMessage(['contactTree', output, total])
	return output
}
