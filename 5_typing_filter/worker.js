import { Thread, mapValues } from '../lib/deps.js'
import { diagonalNull, ddCountAndValidate, ddGet, ddSet, ddIterator } from '../lib/matrix.js'
import { lowPassFilter, mergeFilter } from '../lib/filter.js'
import { groupMatrixByNewID, groupMatrixByValueAndFillGaps, selectLowestValuePerCell } from '../lib/group.js'


export function start(sequenceDistanceMatrix, dateDistanceMatrix, sequencePatientMap, info, maxDays) {
	// console.log('thread start', info)
	let filteredSequenceDistanceMatrix = filterSequenceDistanceMatrixByDate(sequenceDistanceMatrix, dateDistanceMatrix, maxDays)
	// console.log('filteredSequenceDistanceMatrix', filteredSequenceDistanceMatrix)
	// sequencePatientMap = mapValues(sequencePatientMap, x => x.patientID)
	let patientDistanceMatrix = sequenceMatrix_to_patientMatrix(filteredSequenceDistanceMatrix, sequencePatientMap)
	diagonalNull(patientDistanceMatrix)
	// console.log('patientDistanceMatrix', patientDistanceMatrix)
	Thread.post.patientDistanceMatrix(patientDistanceMatrix)

	let histogram = matrixHistogram(patientDistanceMatrix, info.schemaLength.value)
	Thread.post.histogram(histogram)

	Thread.post.done()
}

function filterSequenceDistanceMatrixByDate(sequenceDistanceMatrix, dateDistanceMatrix, maxDays) {
	let filteredSequenceDistanceMatrix = {}
	let count = { total: 0, valid: 0 }
	// sequencePatientMap = mapValues(sequencePatientMap, x => x.patientID)

	for (const [k1, k2, val] of ddIterator(sequenceDistanceMatrix, 'filter by date')) {
		count.total++
		if ((maxDays === 0) || (ddGet(dateDistanceMatrix, k1, k2) <= maxDays)) {
			ddSet(filteredSequenceDistanceMatrix, k1, k2, val)
			count.valid++
		}
	}
	Thread.post.filterCount(count.valid, count.total, maxDays)
	// console.log('filter count', count)
	return filteredSequenceDistanceMatrix
}



export function sequenceMatrix_to_patientMatrix(sequenceDistanceMatrix, idMap) {
	let output = {}
	let count = { patients: 0 }
	for (let [sid1, sid2, dist] of ddIterator(sequenceDistanceMatrix, 'group by patient')) {
		let pid1 = idMap[sid1].patientID
		let pid2 = idMap[sid2].patientID
		if (!pid1 || !pid2) continue
		if (pid1 == pid2) continue
		if (dist == null) continue
		// ddSetInt(output,pid1,pid2,dist)
		let [p2, p1] = [pid1, pid2].sort()
		output[p1] ??= {}
		if ([null, undefined].includes(output[p1]?.[p2]))
			count.patients++
		if (dist < (output[p1]?.[p2] ?? 9999))
			output[p1][p2] = dist
		// output[p1][p2].push(dist)
	}
	Thread.post.patientCount(count.patients)
	// console.log('patient count', count)
	// Thread.post.progress(sampleIDs.indexOf(sid1) + 1, sampleIDs.length, 'patMat')
	// postMessage(['progress', sampleIDs.indexOf(sid1) + 1, sampleIDs.length, 'patMat'])
	return output
}


export function matrixHistogram(matrix, schemaLength) {
	// console.log('schema len', schemaLength)
	// let out = { absolute: {} }
	let out = Object.fromEntries(new Array(schemaLength + 1).fill(0).map((x, i) => [i, x]))
	for (let [pid1, pid2, dist] of ddIterator(matrix, 'calculate histogram')) {
		// out.absolute[dist] ??= 0
		out[dist] += 1
	}
	// console.log('histogram', out)
	return out
}

