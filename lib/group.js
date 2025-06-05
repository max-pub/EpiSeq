import { Thread, sum } from "./deps.js"
import { ddIterator, ddSet, ddSetInt } from "./matrix.js"

export function groupMatrixByValueAndFillGaps(dd, max) {
	let out = groupMatrixByValue(dd)
	fillArrayGaps(out, max, [])
	return out
}
export function groupMatrixByValue(dd) {
	// export function groupDistanceMatrixByDistance(dd) {
	let out = {}
	for (let [id1, id2, val] of ddIterator(dd)) {
		if (val == null) continue
		out[val] ??= []
		out[val].push([id1, id2].sort())
	}
	return out
}
export function fillArrayGaps(list, max, fill) {
	for (let i = 0; i <= max; i++)
		list[i] ??= fill
}


export function groupMatrixByNewID(dd, idMap) {
	let output = {}
	for (let [sid1, sid2, dist] of ddIterator(dd)) {
		let pid1 = idMap[sid1]
		let pid2 = idMap[sid2]
		if (!pid1 || !pid2) continue
		if (pid1 == pid2) continue
		if (dist == null) continue
		// ddSetInt(output,pid1,pid2,dist)
		let [p2, p1] = [pid1, pid2].sort()
		output[p1] ??= {}
		output[p1][p2] ??= []
		output[p1][p2].push(dist)
	}
	// Thread.post.progress(sampleIDs.indexOf(sid1) + 1, sampleIDs.length, 'patMat')
	// postMessage(['progress', sampleIDs.indexOf(sid1) + 1, sampleIDs.length, 'patMat'])
	return output
}


export function selectLowestValuePerCell(dd) {
	// console.log('selectLowestValuePerCell', dd)
	let output = {}
	for (const [id1, id2, val] of ddIterator(dd)) {
		// if (id1 <= id2) continue
		// console.log(x)
		// console.log('select', id1, id2, val, id1 <= id2)
		if (val == null) continue
		ddSetInt(output, id1, id2, Math.min(...val))
		// try {
		// } catch {
		// 	console.log('ERROR', id1, id2, val)
		// 	// console.log('select', id1, id2, Math.min(...val))
		// }
	}
	return output
	// console.log('---END')
}





// export function groupMatrixByNewID(matrix, idMap) {//, first = false) {
// 	let output = {}
// 	let sampleIDs = Object.keys(matrix).sort()
// 	// let same = {}
// 	for (let sid1 of sampleIDs) {
// 		let pid1 = idMap[sid1]
// 		if (!pid1) continue
// 		for (let sid2 of sampleIDs) {
// 			let pid2 = idMap[sid2]
// 			if (!pid2) continue
// 			// if (pid1 == pid2) output[pid1][pid2] = ''
// 			if (sid1 <= sid2) continue
// 			let dist = matrix[sid1][sid2]
// 			// if (sid1 == '15d7u' && sid2 == 'ix6ii') console.log(sid1, sid2, pid1, pid2)
// 			if (dist === null) continue
// 			if (dist === undefined) continue
// 			// if (dist > 0) { console.log(">0"); continue }
// 			// if (dist == 0) console.log(sid1, pid1, pid2, sid2, dist)
// 			output[pid1] ??= {}
// 			output[pid1][pid2] ??= []
// 			output[pid1][pid2].push(dist * 1)
// 			// if (pid1 == pid2) same[pid1] = dist
// 			if (pid1 == pid2) continue//console.log("YEAH", pid1)
// 			output[pid2] ??= {}
// 			output[pid2][pid1] ??= []
// 			output[pid2][pid1].push(dist * 1)
// 		}
// 		Thread.post.progress(sampleIDs.indexOf(sid1) + 1, sampleIDs.length, 'groupMatrixByNewID')
// 		// postMessage(['progress', sampleIDs.indexOf(sid1) + 1, sampleIDs.length, 'groupMatrixByNewID'])

// 	}
// 	// console.log(output)
// 	// sort and join arrays for saving
// 	for (let pid1 in output) {
// 		for (let pid2 in output[pid1])
// 			// {
// 			if (output[pid1][pid2])
// 				// output[pid1][pid2] = output[pid1][pid2].sort((a, b) => a - b).join('|') 
// 				// if (first)
// 				output[pid1][pid2] = output[pid1][pid2].sort((a, b) => a - b)[0] * 1 //?? undefined
// 		// 	else
// 		// 		output[pid1][pid2] = output[pid1][pid2].sort((a, b) => a - b).join('|') ?? undefined
// 		// }
// 		// Thread.post.progress(sampleIDs.indexOf(sid1) + 1, sampleIDs.length, 'groupMatrixByNewID')
// 	}

// 	for (let pid1 in output)
// 		for (let pid2 in output[pid1])
// 			if (pid1 < pid2)
// 				// output[pid1][pid2] = null
// 				delete output[pid1][pid2]// = null
// 	// console.log(same, 'same')
// 	return output
// }




// export function groupMatrixByValue(matrix) {
// 	let out = {}
// 	let ids = Object.keys(matrix)
// 	for (let id1 in matrix) {
// 		for (let id2 in matrix[id1]) {
// 			if (id1 <= id2) continue
// 			let value = String(matrix[id1][id2])?.split('|')?.[0] * 1
// 			if (value === undefined) continue
// 			out[value] ??= []
// 			out[value].push([id1, id2])
// 		}
// 		Thread.post.progress(ids.indexOf(id1) + 1, ids.length, 'groupMatrixByValue')
// 		// postMessage(['progress', ids.indexOf(id1) + 1, ids.length, 'groupMatrixByValue'])
// 	}
// 	return out
// }


// function fillGaps(list, upperLimit, filler = 0) {
// 	for (let i = 0; i <= upperLimit; i++)
// 		list[i] ??= filler
// }
// function fillGaps2(list2, upperLimit, filler = 0) {
// 	let keys = Object.keys(list2)
// 	for (let key in list2) {
// 		fillGaps(list2[key], upperLimit)
// 		Thread.post.progress(keys.indexOf(key) + 1, keys.length, 'fill gaps')
// 	}
// }


export function matrixHistogram(matrix) {
	let valueGroups = groupMatrixByValue(matrix)
	// console.log('value group 0',valueGroups[0])
	// console.log('valueGroups', valueGroups)

	let out = { absolute: {}, relative: {} }
	for (let i in valueGroups)
		out.absolute[i] = valueGroups[i]?.length ?? 0

	let total = sum(Object.values(out.absolute))

	for (let i in valueGroups)
		out.relative[i] = (out.absolute[i] / total * 1).toFixed(5) //* 1

	return out
}

