import { ddGet, ddIterator, ddSet } from "./matrix.js"


export function lowPassFilter(matrix, cutOff) {
	// console.log('low pass filter', matrix, cutOff)
	let out = {}
	for (let [k1, k2, v] of ddIterator(matrix))
		if (v <= cutOff)
			ddSet(out, k1, k2, v)
	return out
}

export function highPassFilter(matrix, cutOff) {
	// console.log('low pass filter', matrix, cutOff)
	let out = {}
	for (let [k1, k2, v] of ddIterator(matrix, 'high pass filter ' + cutOff))
		if (v >= cutOff)
			ddSet(out, k1, k2, v)
	return out
}

export function mergeFilter(matrix1, matrix2) {
	let out = {}
	for (let [k1, k2, v1] of ddIterator(matrix1)) {
		// let v2 = matrix2?.[k1]?.[k2]
		let v2 = ddGet(matrix2, k1, k2)
		// if (k1 == 'sequence_83661' && k2 == 'sequence_10522')
		// 	console.log("UUUU",k1, k2, v1, v2)
		if (v1 != null && v2 != null)
			ddSet(out, k1, k2, v1)
	}
	return out
}




// export function matrixFilter(data, options = {}) { // { distance: x, removeDiagonal: true, removeMultipleValues: true }
// 	let out = {}
// 	for (let id1 in data) {
// 		for (let id2 in data[id1]) {
// 			if (id1 > id2) continue
// 			let dist = String(data[id1][id2] ?? '')?.split('|')?.map(x => x * 1)?.sort((a, b) => a - b)?.[0]
// 			if (options.maxDistance && dist > options.maxDistance) continue
// 			if (options.minDistance && dist < options.minDistance) continue
// 			if (options.removeDiagonal && id1 == id2) continue
// 			out[id1] ??= {}
// 			out[id2] ??= {}
// 			out[id2][id1] = null
// 			out[id1][id2] = options.removeMultipleValues ? dist : data[id1][id2]
// 		}
// 	}
// 	return out
// }
