import { Thread, dictFilter, mapValues, sum } from '../lib/deps.js'
import { diagonalNull, ddLog, ddSetInt, ddCountAndValidate } from '../lib/matrix.js'
// import { groupDistanceMatrixByDistance } from '../lib/stats.js'
// import { groupDistanceMatrixByPatientID } from '../lib/stats.js'
// import { typeStats } from '../lib/type.stats.js'
// import { groupDistanceMatrixByPatientID as GDM } from '../lib/stats.js'


export function start(typingList = {}, options = {}) {
	let typingMatrix = calculateTypingDistanceMatrix(typingList, options)
	Thread.post.typingMatrix(typingMatrix, ddCountAndValidate(typingMatrix, 'calc typingMatrix'))
	// console.log('typingMatrix', typingMatrix)

	let dateMatrix = calculateDateDistanceMatrix(typingList, options)
	Thread.post.dateMatrix(dateMatrix, ddCountAndValidate(dateMatrix, 'calc dateMatrix'))
	// console.log('dateMatrix', dateMatrix)

	// Thread.post.sequencePatientMap(mapValues(typingList, val => val.patientID))
	Thread.post.sequencePatientMap(mapValues(typingList, val => ({ patientID: val.patientID })))

	// Thread.post.schema(Object.keys(Object.values(typingList)[0]).filter(x => !['sampleDate', 'patientID'].includes(x)))
	let schema = Object.keys(Object.values(typingList)[0]).filter(x => !['sampleDate', 'patientID'].includes(x))
	Thread.post.info({ schemaLength: { value: schema.length } })

	Thread.post.done()
}

// export function schemaLength(typingList) {
// 	console.log('schema', typingList)
// 	return Object.keys(Object.values(typingList)[0]).length
// }




export function calculateDateDistanceMatrix(typingList = {}, options = {}) {
	// console.log('date dist start',typingList)
	let output = {}
	let ids = Object.keys(typingList).sort()
	let list = mapValues(typingList, val => Date.parse(val.sampleDate.replaceAll(' ', 'T')) / 1000)
	// console.log('date-dist-list', list)

	for (let id1 of ids) {
		output[id1] ??= {}
		for (let id2 of ids) {
			// if (id1 == id2) output[id1][id2] = null
			if (id1 <= id2) continue
			// let dist = 
			let dist = Math.abs(list[id1] - list[id2]) / 24 / 60 / 60
			ddSetInt(output, id1, id2, dist)
			// output[id1][id2] = dist
		}
		Thread.post.progress(ids.indexOf(id1) + 1, ids.length, 'date distance')
		// postMessage(['progress', ids.indexOf(id1) + 1, ids.length, 'date matrix'])
	}
	diagonalNull(output)
	// console.log('dat-dist', output)
	return output
}





export function calculateTypingDistanceMatrix(typingList = {}, options = {}) {
	// postMessage(['started'])
	// console.log("USE CALCULATION METRIC ", options)
	let calculateDistanceBetweenTwoSequences = options.countNull ? calculateDistanceBetweenTwoSequences2 : calculateDistanceBetweenTwoSequences1
	// let t0 = Date.now()
	// let alleles = {}
	let output = {}
	let typingList_int16 = convertToTypedArrays(typingList)
	// let typingList2 = cleanTypingList(typingList)
	// let typingList2 = (typingList)
	// console.log('norma array', typingList2['sequence_10434'])
	// console.log('typed array', typingList_int16['sequence_10434'])

	let ids = Object.keys(typingList_int16).sort()
	for (let id1 of ids) {
		output[id1] ??= {}
		for (let id2 of ids) {
			// if (id1 == id2) output[id1][id2] = null
			if (id1 <= id2) continue
			let dist = calculateDistanceBetweenTwoSequences(typingList_int16[id1], typingList_int16[id2])
			ddSetInt(output, id1, id2, dist)

			// let diff = calculateDistanceBetweenTwoSequences(typingList_int16[id1], typingList_int16[id2])
			// let dist = diff.length
			// ddSetInt(output, id1, id2, dist)
			// alleles[dist] ??= {}
			// for (let x of diff) {
			// 	alleles[dist][x] ??= 0
			// 	alleles[dist][x]++
			// }
		}
		Thread.post.progress(ids.indexOf(id1) + 1, ids.length, 'typing distance')
		// postMessage(['progress', ids.indexOf(id1) + 1, ids.length, 'seqMat'])
	}
	diagonalNull(output)

	// console.log('alleles', alleles)
	// let alleles2 = {}
	// let distances = Object.keys(alleles).map(x => x * 1).sort()
	// console.log('distances', distances)
	// for (let dist1 of distances) {
	// 	if (dist1 > 10) continue
	// 	console.log('dist1', dist1)
	// 	Thread.post.progress(distances.indexOf(dist1) + 1, distances.length, 'alleles')

	// 	alleles2[dist1] = new Set()
	// 	for (let dist2 of distances) {
	// 		if (dist1 < dist2) continue
	// 		console.log('dist1-2', dist1, dist2)

	// 		// console.log('dist2',dist2)

	// 		alleles2[dist1] = new Set([...alleles2[dist1], ...Object.keys(alleles[dist2])])
	// 	}
	// }
	// console.log('alleles2', alleles2)
	return output
}


function getSchema(list) {
	let set = new Set()
	let filter = ['patientID', 'sampleDate']
	for (let k1 in list) {
		for (let k2 in list[k1]) {
			if (filter.includes(k2)) continue
			set.add(k2)
		}
	}
	return [...set].sort()
}

function convertToTypedArrays(list) {
	let out = {}
	// ddLog(list,'typed array')
	let schema = getSchema(list)
	console.log('schema', schema, schema.length)
	for (let id in list) {
		let int = schema.map(x => list[id][x])
		out[id] = new Uint16Array(int)
		// if (id == 'sequence_10434' || id == 'sequence_09285') {
		// 	console.log('schema', schema.join('\t') + '\n'
		// 		+ out[id].join('\t') + '\n'
		// 		+ int.join('\t') + '\n'
		// 		+ out[id].join('\t') + '\n'
		// 	)
		// 	let i = schema.indexOf('ECs3676')
		// 	console.log('ECs3676', i, out[id][i], int[i], list[id]['ECs3676'])
		// 	// console.log('typed', out[id].join('\t'))
		// 	// console.log('norma', int.join('\t'))
		// }
	}
	return out
}


// function calculateDistanceBetweenTwoSequences1(s1, s2) {
// 	let diff = []
// 	for (let pos = 0, len = s1.length; pos < len; pos++) {
// 		if (s1[pos] != s2[pos] && s1[pos] && s2[pos])
// 			diff.push(pos)
// 	}
// 	return diff
// }


// function calculateDistanceBetweenTwoSequences2(s1, s2) {
// 	let diff = []
// 	for (let pos = 0, len = s1.length; pos < len; pos++)
// 		if (s1[pos] != s2[pos] || !s1[pos] || !s2[pos])
// 			diff.push(pos)
// 	return diff
// }


function calculateDistanceBetweenTwoSequences1(s1, s2) {
	let diff = 0
	for (let pos = 0, len = s1.length; pos < len; pos++) {
		if (s1[pos] != s2[pos] && s1[pos] && s2[pos])
			diff += 1
	}
	return diff
}


function calculateDistanceBetweenTwoSequences2(s1, s2) {
	let diff = 0
	for (let pos = 0, len = s1.length; pos < len; pos++)
		if (s1[pos] != s2[pos] || !s1[pos] || !s2[pos])
			diff += 1
	return diff
}






function cleanTypingList(list) {
	let output = {}
	// console.log('clean typing', list)
	for (let x in list)
		output[x] = dictFilter(list[x], (k, v) => !['patientID', 'sampleDate'].includes(k))
	return output
}

function calculateDistanceBetweenTwoSequences0(s1, s2, print = false) {
	// let t0 = new Date()
	// console.log('22',s1,s2)
	let diff = 0
	let same = 0
	for (let pos in s1) {
		// console.log(s1[pos], s2[pos], s1[pos] != s2[pos])
		if (s1[pos] != s2[pos] && s1[pos] && s2[pos]) {
			diff += 1
			if (print)
				console.log('----', pos, s1[pos], s2[pos])
			// console.log(pos, s1[pos], s2[pos],)
		} else {
			same += 1
		}
		// if (diff > 50) return 9999
	}
	// console.log('33', s1, s2, '>>', diff, same)
	// console.log('diff', new Date() - t0)
	return diff
}




// function idMapFromSequenceList(sequenceList) {
// 	return Object.fromEntries(Object.entries(sequenceList).map(x => [x[0], x[1]?.patientID]))
// }

// export function groupDistanceMatrixByPatientID(matrix, sequenceList) {
// 	let output = groupMatrixByNewID(matrix, idMapFromSequenceList(sequenceList))
// 	diagonalNull(output)
// 	return output
// }


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
// 		postMessage(['progress', sampleIDs.indexOf(sid1) + 1, sampleIDs.length, 'groupMatrixByNewID'])

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
// 		postMessage(['progress', ids.indexOf(id1) + 1, ids.length, 'groupMatrixByValue'])
// 	}
// 	return out
// }


// function fillGaps(list, upperLimit, filler = 0) {
// 	for (let i = 0; i <= upperLimit; i++)
// 		list[i] ??= filler
// }
// function fillGaps2(list2, upperLimit, filler = 0) {
// 	for (let key in list2)
// 		fillGaps(list2[key], upperLimit)
// }


// export function matrixHistogram(matrix) {
// 	let valueGroups = groupMatrixByValue(matrix)

// 	let out = { absolute: {}, relative: {} }
// 	for (let i in valueGroups)
// 		out.absolute[i] = valueGroups[i]?.length ?? 0

// 	let total = sum(Object.values(out.absolute))

// 	for (let i in valueGroups)
// 		out.relative[i] = (out.absolute[i] / total * 1000).toFixed(2) * 1

// 	return out
// }







// export function convertToTypedArrays(list) {
// 	let out = {}
// 	for (let id in list) {
// 		let items = Object.entries(list[id])
// 			.filter(x => !['patientID', 'sampleDate'].includes(x[0])) // remove meta-data
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

// let x = Object.entries(list[id])
// 	.filter(x => !['patientID', 'sampleDate'].includes(x[0])) // remove meta-data
// 	.sort((a, b) => a[0] < b[0]) // sort by allele-key
// 	.map((x, i) => x[1] * 1) // map to allele-value
// out[id] = new Uint16Array(x)
