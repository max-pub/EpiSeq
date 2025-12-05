import { postProgress } from "../../lib/Progress.js"
import { Matrix } from "../../lib/Matrix.js"

import { arithmeticMean, standardDeviation, median, medianAbsoluteDeviation } from "../../lib/ext/bundle.js"

export function correlate(typingMatrix, contacts, OPTIONS) {
	// console.log('correlate called with options', OPTIONS, typingMatrix, contacts)
	let out = new Matrix('absolute')
	for (let i = 0; i < OPTIONS.TD; i++) { // set all to '0'
		out.set(i, 'total', 0)
		for (let j = 0; j <= OPTIONS.CD; j++) {
			out.set(i, 'cd' + j, 0)
		}
	}
	// console.log("corr-base", JSON.stringify(out.data, 0, '\t'))

	for (let [pid1, pid2, distance] of typingMatrix.iterate({ onProgress: postProgress('correlate typing and contact distances') })) {
		if (distance > OPTIONS.TD) continue
		out.inc(distance, 'total')

		let x = deepFind([pid1], pid2, contacts, typingMatrix, distance + OPTIONS.MR, 0, OPTIONS.CD)

		if (x > -1) {
			out.inc(distance, 'cd' + x)
		}
	}
	return out
}

// export function correlate(typingMatrix, contacts, OPTIONS) {
// 	console.log('correlate called with options', OPTIONS, typingMatrix, contacts)
// 	let out = {}
// 	let baseInfo = { typings: 0, ...Object.fromEntries(Array(OPTIONS.CD * 1 + 1).fill(1).map((x, i) => ['cd' + i, 0])) }

// 	for (let [pid1, pid2, distance] of typingMatrix.iterate({ onProgress: postProgress('correlate typing and contact distances') })) {
// 		if (distance > OPTIONS.TD) continue
// 		out[distance] ??= { ...baseInfo }

// 		out[distance].typings++

// 		let x = deepFind([pid1], pid2, contacts, typingMatrix, distance + OPTIONS.MR, 0, OPTIONS.CD)

// 		if (x > -1) {
// 			out[distance]['cd' + x]++
// 		}
// 	}
// 	return new Matrix(out)
// }



function deepFind(sourcePIDs, targetPID, contacts, typingMatrix, threshold, depth, maxDepth) {
	// console.log('deepFind', sourcePIDs, targetPID, `${depth}/${maxDepth}`, threshold)
	if (depth > maxDepth) return -1
	let nextSourcePIDs = []
	for (let sourcePID of sourcePIDs) {
		for (let pid of contacts[sourcePID] ?? []) {
			if (pid == targetPID)
				return depth
			// if (ddGet(typingMatrix, sourcePID, pid) < threshold)
			if (typingMatrix.get(sourcePID, pid) < threshold)
				nextSourcePIDs.push(pid)
		}
	}
	return deepFind(nextSourcePIDs, targetPID, contacts, typingMatrix, threshold, depth + 1, maxDepth)
}



/// STATS
export function relative(correlationAbsolute) {
	var correlationRelative = new Matrix('relative')
	for (let distance of correlationAbsolute.rowKeys()) {
		// console.log('dist', distance)
		let total = correlationAbsolute.get(distance, 'total')
		// correlationRelative[distance] = {}
		for (let cd of correlationAbsolute.colKeys()) {
			// console.log('xx', distance, cd)
			if (cd != 'total') {
				let relativeValue = (correlationAbsolute.get(distance, cd) / total * 100).toFixed(2) * 1
				correlationRelative.set(distance, cd, relativeValue)
			}
			// correlationRelative[distance][cd] = (correlationAbsolute[distance][cd] / total * 100).toFixed(2) //* 1
			// if (cd != 'typings') console.log('rel', distance, cd, correlationAbsolute[distance][cd], total, (correlationAbsolute[distance][cd] / total * 100).toFixed(2) * 1)
		}
	}
	// console.log('rel', correlationRelative)
	return correlationRelative
}

// export function relative(correlationAbsolute) {
// 	var correlationRelative = new Matrix()
// 	for (let distance in correlationAbsolute) {
// 		// console.log('dist', distance)
// 		let total = correlationAbsolute[distance].typings
// 		correlationRelative[distance] = {}
// 		for (let cd in correlationAbsolute[distance]) {
// 			// console.log('xx', distance, cd)
// 			if (cd != 'typings') correlationRelative[distance][cd] = (correlationAbsolute[distance][cd] / total * 100).toFixed(2) //* 1
// 			// if (cd != 'typings') console.log('rel', distance, cd, correlationAbsolute[distance][cd], total, (correlationAbsolute[distance][cd] / total * 100).toFixed(2) * 1)
// 		}
// 	}
// 	console.log('rel', correlationRelative)
// 	return correlationRelative
// }


export function compound(correlationRelative) {
	// console.log('compound', data, CD)
	let out = new Matrix('compounded')
	let rowKeys = correlationRelative.rowKeys().sort()
	let colKeys = correlationRelative.colKeys().sort()
	for (let distance of rowKeys) {
		for (let cd of colKeys) {
			let lastValue = 0
			let i = cd.slice(2) * 1
			if (i > 0) lastValue = out.get(distance, 'cd' + (i - 1)) * 1
			let compoundValue = (lastValue + correlationRelative.get(distance, cd) * 1).toFixed(2) * 1
			out.set(distance, cd, compoundValue)
		}
	}
	return out
}



export function stats_AM2SD(correlationRelativeCompounded) {
	let out = new Matrix('am2sd')
	for (let cd of correlationRelativeCompounded.colKeys().sort()) {
		let cmp = correlationRelativeCompounded.columnValues(cd)
		let avg = arithmeticMean(cmp)
		let sd = standardDeviation(cmp)
		let cutoff = avg + (sd * 2)
		let threshold = findThreshold(cmp, cutoff)
		out.setRow(cd, {
			arithmeticMean: avg.toFixed(2) * 1,
			standardDeviation: sd.toFixed(2) * 1,
			cutOff: cutoff.toFixed(2) * 1,
			threshold
		})
	}
	return out.flip()
}
export function stats_MED20MAD(correlationRelativeCompounded) {
	let out = new Matrix('med20mad')
	for (let cd of correlationRelativeCompounded.colKeys().sort()) {
		let cmp = correlationRelativeCompounded.columnValues(cd)
		let med = median(cmp)
		let mad = medianAbsoluteDeviation(cmp)
		let cutoff = med + (mad * 20)
		let threshold = findThreshold(cmp, cutoff)
		out.setRow(cd, {
			median: med.toFixed(2) * 1,
			medianAbsoluteDeviation: mad.toFixed(2) * 1,
			cutOff: cutoff.toFixed(2) * 1,
			threshold
		})
	}
	return out.flip()
}






function findThreshold(list, threshold) {
	for (let i in list)
		if (list[i] < threshold)
			return i * 1
}


// let series = Object.keys(sourceData[0]).filter(x => x != 'typings').map(mode => ({
// 	// let series = ['c0', 'c1', 'c2'].map(mode => ({
// 	name: mode.replace('c0', 'primary contacts').replace('c1', 'secondary contacts').replace('c2', 'tertiary contacts'),
// 	data: Object.entries(sourceData).map(([x, y]) => ({ x: x * 1, y: (y[mode] / y.typings * 100).toFixed(2) * 1 }))
// }))

// let dat = series.map(x => x.data.map(y => y.y))
// let xMax = dat[0].length
// // console.log('xMax', xMax)
// // let cmp = compound(dat, cd * 1)
// // console.log('dat,cmp', dat, cmp)

// let info = {}, yLines = {}
// for (let cd = 0; cd <= settings.CD; cd++) {
// 	let cmp = compound(dat, cd)
// 	if (type == 'SD') {
// 		let avg = average(cmp)
// 		let sd = standardDeviation(cmp)
// 		let cutoff = avg + (sd * 2)
// 		let threshold = findThreshold(cmp, cutoff)
// 		yLines[cutoff] = cd
// 		info[cd] = { 'arithmetic mean': avg, 'standard deviation': sd, cutoff, threshold, }
// 	}
// 	if (type == 'MAD') {
// 		let med = median(cmp)
// 		let mad = MAD(cmp)
// 		let cutoff = med + (mad * 20)
// 		let threshold = findThreshold(cmp, cutoff)
// 		yLines[cutoff] = cd
// 		info[cd] = { median: med, MAD: mad, cutoff, threshold, }
// 	}
// 	if (type == 'med') {
// 		let med = median(cmp)
// 		let cutoff = med * 10
// 		let threshold = findThreshold(cmp, cutoff)
// 		yLines[cutoff] = cd
// 		info[cd] = { median: med, cutoff, threshold, }
// 	}
// 	// console.log('yLines', yLines)
// 	// console.log('info', info)
// }



// function contactsWithinThreshold(pid, contacts, typingMatrix, threshold) {
// 	let out = []
// 	for (let pid2 of contacts[pid]) {
// 		// console.log('typing distance:', pid, pid2, ddGet(typingMatrix, pid, pid2))
// 		if (ddGet(typingMatrix, pid, pid2) < threshold)
// 			out.push(pid2)
// 	}
// 	// console.log('contacts', contacts[pid].length, '-', out.length, '=', contacts[pid].length - out.length)
// 	return out
// }

