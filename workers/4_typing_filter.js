import { TALI, mapValues } from '../lib/deps.js'
import { groupDistanceMatrixByPatientID, groupDistanceMatrixByDistance, matrixFilter } from '../lib/stats.js'
import { matrixToList, rowsAndCols, diagonalX } from '../lib/matrix.js'
import { typeStats } from '../lib/type.stats.js'

onmessage = event => {
	let [LIST, DIST, OPTIONS] = event.data
	// console.log('hello from CORREL matrix::', LIST)
	// postMessage(['start'])
	run(LIST, DIST, OPTIONS)
}

function stats(v) {
	return {
		keys: Object.keys(v).length,
		values: matrixToList(v).length,
	}
}

function run(LIST, DIST, OPTIONS) {
	// console.log("correlate reduce", OPTIONS)
	// let typingDates = getTypingDates(LIST.typings)
	postMessage(['started'])

	let seq = DIST

	let seqCount1 = matrixToList(seq).length

	if (OPTIONS.TD)
		seq = matrixDistanceFilter(seq, { maxDistance: OPTIONS.TD })
	// rowsAndCols(seq, 'after date')
	let seqCount2 = matrixToList(seq).length
	postMessage(['TD', { dropped: seqCount1 - seqCount2 }])
	// let s1 = JSON.stringify(seq)
	// let s1 = TALI.grid.stringify({ seq }, { sortRows: true, sortCols: true })

	if (OPTIONS.TI)
		seq = matrixDateFilter(seq, LIST, OPTIONS.TI)
	// seq = OPTIONS.TI ? matrixDateFilter(seq, LIST.typings, OPTIONS.TI) : seq // TI==0 -> no filter
	let seqCount3 = matrixToList(seq).length
	postMessage(['TI', { dropped: seqCount2 - seqCount3 }])
	postMessage(['seq', seq, groupDistanceMatrixByDistance(seq, OPTIONS.TD), stats(seq)])

	let pat = groupDistanceMatrixByPatientID(seq, LIST)
	diagonalX(pat)
	postMessage(['pat', pat, groupDistanceMatrixByDistance(pat, OPTIONS.TD), stats(pat)])

	postMessage(['finished'])
}




export function matrixDateFilter(DIST, LIST, days) {
	// console.log('date-filter 1', DIST)
	// diagonalX(DIST)
	// let t1 = TALI.grid.stringify({ x: DIST }, { sortRows: true, sortCols: true })
	// let typingDates = getTypingDates(LIST)
	let typingDates = mapValues(LIST, x => Date.parse(x.typingDate) / 1000 / 60 / 60 / 24)
	// console.log('typingDates', typingDates)
	// let dropped = 0
	// DIST = structuredClone(DIST)
	let out = {}
	for (let id1 in DIST) {
		let d1 = typingDates[id1]
		// let d1 = Date.parse(LIST[id1].typingDate)
		for (let id2 in DIST[id1]) {
			if (id1 <= id2) continue
			let d2 = typingDates[id2]
			// let d2= Date.parse(LIST[id2].typingDate)
			let dd = Math.abs(d1 - d2) // date difference 
			// let ddd = dd / 1000 / 60 / 60 / 24 // date difference in days
			// console.log('diff', days, ddd, ddd < days)
			if (dd <= days) {
				// if (DIST[id1][id2] == 2)
				// console.log('date filter rr', id1, id2, '-', dd, 'max', days, d1, d2)
				out[id1] ??= {}
				out[id1][id2] = DIST[id1][id2]
			} //else dropped++
			// console.log(pid1, pid2, data.seq[pid1][pid2], data.meta[pid1].typingDate, ddd)
		}
	}
	// console.log('message TI', dropped)
	// postMessage(['TI', { dropped }])
	// console.log('date-filter 2', out)
	diagonalX(out)
	// let t2 = TALI.grid.stringify({ x: out }, { sortRows: true, sortCols: true })
	// console.log('date-filter 3', t1 == t2)
	return out
}

export function matrixDistanceFilter(data, options = {}) { // { distance: x, removeDiagonal: true, removeMultipleValues: true }
	let out = {}
	// let dropped = 0
	for (let id1 in data) {
		for (let id2 in data[id1]) {
			if (id1 <= id2) continue
			let dist = String(data[id1][id2] ?? '')?.split('|')?.map(x => x * 1)?.sort((a, b) => a - b)?.[0] * 1
			if (('maxDistance' in options) && dist > options.maxDistance) continue
			if (('minDistance' in options) && dist < options.minDistance) continue
			// if (options.removeDiagonal && id1 == id2) continue
			out[id1] ??= {}
			out[id2] ??= {}
			// out[id2][id1] = null
			// out[id1][id2] = options.removeMultipleValues ? dist : data[id1][id2]
			out[id1][id2] = dist
		}
	}
	return out
}