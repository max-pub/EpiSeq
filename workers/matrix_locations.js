import { select } from '../lib/deps.js'
import { matrixToList, rowsAndCols, diagonalX } from '../lib/matrix.js'


onmessage = event => {
	console.log('start location worker')
	let list = event.data
	// console.log('hello from LOCATION matrix::', list)
	calculateDistanceMatrix(list)

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


export function calculateDistanceTree(tree) {
	let output = {}
	let t0 = Date.now()
	let ids = Object.keys(tree).sort()//.slice(0,100)
	if (!ids.length) return {}
	for (let id1 of ids) {
		output[id1] ??= {}
		let epi1 = Object.values(tree[id1])
		// console.log('cross match', p1, ids.indexOf(p1) + '/' + ids.length)
		for (let id2 of ids) {
			if (id1 <= id2) continue
			let epi2 = Object.values(tree[id2])
			let result = contactBetweenTwoPatients(epi1, epi2)
			// console.log(p1, p2, result)
			if (Object.keys(result).length == 0) continue
			output[id1][id2] = result
		}
		postMessage(['progress', [ids.indexOf(id1) + 1, ids.length]])
		// console.log('locations distance', id1, ids.indexOf(id1), '/', ids.length, (Date.now() - t0) + 'ms')
	}
	// postMessage(['result', output])
	return output
}


export function distanceTreeToDistanceMatrix(data, options = {}) {
	let DAY = 24 * 60 * 60
	let out = { room: {}, ward: {}, clinic: {} }
	for (let pid1 in data) {
		for (let pid2 in data[pid1]) {
			for (let locType in data[pid1][pid2]) {
				// if (location != 'any' && location != locType) continue
				for (let [loc, dur] of Object.entries(data[pid1][pid2][locType])) {
					// console.log(pid1, pid2, locType, loc, dur)
					// out[locType] ??= {}
					out[locType][pid1] ??= {}
					dur = (dur / DAY)//.toFixed(2) * 1
					let old = out[locType][pid1][pid2]
					if (!old) {
						out[locType][pid1][pid2] = dur
					} else {
						if (old < 0 && dur < 0) {
							out[locType][pid1][pid2] = Math.max(old, dur) // Math.min???
							// console.log(pid1, pid2, old, dur, Math.min(old, dur), Math.max(old, dur))
						}
						if (old < 0 && dur > 0)
							out[locType][pid1][pid2] = dur
						if (old > 0 && dur > 0)
							out[locType][pid1][pid2] += dur
					}
					// if (old > 0 && dur < 0) // verfallen lassen
					// 	out[locType][pid1][pid2] += dur

					// if (out[locType][pid1][pid2] < -options.maxDays) delete out[locType][pid1][pid2]
					// out[pid1] ??= []
					// out[pid1].push(pid2)
					// out[pid1].sort()
				}
			}
		}
	}
	// console.log(out)
	return out
}



export function calculateDistanceMatrix(locationList, info = {}) {
	let t0 = Date.now()
	info.locationsByPatient = groupByPatientID(locationList)
	parseDateStrings(info.locationsByPatient)
	info.locationDistanceTree = calculateDistanceTree(info.locationsByPatient)
	let output = distanceTreeToDistanceMatrix(info.locationDistanceTree, { maxDays: 50 })
	// cleanNumbers(output)
	for (let cl in output)
		diagonalX(output[cl])
	addAnyLocation(output)
	diagonalX(output.any)

	postMessage(['result', output])
	// postMessage(['time', Date.now() - t0])
	postMessage(['stats', {
		patients: Object.keys(output.any).length,
		entries: matrixToList(output.any).length,
		time: ((Date.now() - t0)/1000).toFixed(1)
	}])
	// return output
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



function addAnyLocation(DIST) {
	// let t0 = Date.now()
	// console.log('add ANY location...')
	console.log('clinic', matrixToList(DIST.clinic).length)
	console.log('ward', matrixToList(DIST.ward).length)
	// console.log('ward', matrixToList(DIST.ward))
	let patientIDs = [...new Set([...Object.keys(DIST.clinic), ...Object.keys(DIST.ward)])]
	DIST.any = {}
	for (let id1 of patientIDs) {
		for (let id2 of patientIDs) {
			if (id1 < id2) continue
			DIST.any[id1] ??= {}
			// console.log(id1, id2, DIST.clinic)
			// DIST.any[id1][id2] = Math.max(DIST.clinic?.[id1]?.[id2] ?? -1000, DIST.ward?.[id1]?.[id2] ?? -1000)
			let val = [DIST.clinic?.[id1]?.[id2], DIST.ward?.[id1]?.[id2]].filter(x => ![NaN, undefined, null, 'xxx'].includes(x)).sort((a, b) => b - a)
			// console.log('val', val)
			if (val.length > 0)
				DIST.any[id1][id2] = val[0]
		}
	}
	console.log('any', matrixToList(DIST.any).length)
	// console.log('any', matrixToList(DIST.any))

	// console.log('...done in ', (Date.now() - t0), 'ms')
}