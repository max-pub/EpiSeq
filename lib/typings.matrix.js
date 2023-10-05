import { matrixToList, rowsAndCols, diagonalX } from './matrix.js'

onmessage = event => {
	let list = event.data
	// console.log('hello from type matrix::', message)
	calculateDistanceMatrix(list)
}


export function calculateDistanceMatrix(input = {}) {
	let t0 = Date.now()
	let output = {}
	input = convertToTypedArrays(input)
	let ids = Object.keys(input).sort()
	for (let id1 of ids) {
		output[id1] ??= {}
		for (let id2 of ids) {
			// if (id1 == id2) output[id1][id2] = null
			if (id1 <= id2) continue
			let dist = calculateDistanceBetweenTwoSequences(input[id1], input[id2])
			output[id1][id2] = dist
		}
		postMessage(['progress', [ids.indexOf(id1) + 1, ids.length]])
		// console.log('cgmlst distance', id1, ids.indexOf(id1), '/', ids.length, (Date.now() - t0) + 'ms')
	}
	// console.log('total time', (Date.now() - t0) + 'ms')
	diagonalX(output)
	postMessage(['result', output])
	return output
}






function convertToTypedArrays(list) {
	let out = {}
	let filter = ['patientID', 'typingDate']
	for (let id in list) {
		let int = []
		for (let key in list[id]) {
			if (filter.includes(key)) continue
			int.push(list[id][key] * 1)
		}
		out[id] = new Uint16Array(int)
		// let x = Object.entries(list[id])
		// 	.filter(x => !['patientID', 'typingDate'].includes(x[0])) // remove meta-data
		// 	.sort((a, b) => a[0] < b[0]) // sort by allele-key
		// 	.map((x, i) => x[1] * 1) // map to allele-value
		// out[id] = new Uint16Array(x)
	}
	return out
}


function calculateDistanceBetweenTwoSequences(s1, s2) {
	// let t0 = new Date()
	let diff = 0
	// for (let pos in s1)
	for (let pos = 0, len = s1.length; pos < len; pos++)
		if (s1[pos] != s2[pos] && s1[pos] && s2[pos])
			diff += 1
	// console.log('diff', new Date() - t0)
	return diff
}







// export function convertToTypedArrays(list) {
// 	let out = {}
// 	for (let id in list) {
// 		let items = Object.entries(list[id])
// 			.filter(x => !['patientID', 'typingDate'].includes(x[0])) // remove meta-data
// 			.sort((a, b) => a[0] < b[0]) // sort by allele-key
// 		let sabSize = Uint16Array.BYTES_PER_ELEMENT * items.length
// 		// console.log('sabSize', sabSize)
// 		out[id] = new Uint16Array(new SharedArrayBuffer(sabSize))
// 		items
// 			.map((x, i) => out[id][i] = x[1] * 1) // map to allele-value
// 		// console.log(out[id])
// 		// out[id] = new Uint16Array(sab)
// 	}
// 	return out
// }