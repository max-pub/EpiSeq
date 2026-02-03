import { postProgress } from "../../lib/Progress.js"
import { Matrix } from "../../lib/Matrix.js"
import { arithmeticMean, standardDeviation, median, medianAbsoluteDeviation, sum } from "../../lib/ext/bundle.js"

export let debug = {}

export function correlate(typingMatrix, contacts, OPTIONS) {
	// console.log('correlate called with options', OPTIONS, typingMatrix, contacts)
	let out = new Matrix('correlation')
	for (let i = 0; i <= OPTIONS.schemaLength; i++) { // set all to '0'
		out.set(i, 'total', 0)
		for (let j = 0; j <= OPTIONS.CD; j++) {
			// out.set(i, 'cd' + j, 0)
			out.set(i, 'C_hop_' + j, 0)
		}
	}
	// console.log("corr-base", JSON.stringify(out.data, 0, '\t'))

	// debug = {}
	// debug = []
	debug = new Matrix('debug')
	for (let [pid1, pid2, distance] of typingMatrix.iterate({ onProgress: postProgress('correlate typing and contact distances') })) {
		// if (distance > OPTIONS.TD) continue
		out.inc(distance, 'total')
		let weightBounds = [distance - OPTIONS.MR, distance + OPTIONS.MR]
		let paths = findContactPath(pid1, pid2, contacts, typingMatrix, OPTIONS.CD, weightBounds, OPTIONS.findFirstContactOnly)
		// console.log('paths between', pid1, pid2)
		// for (let path of x) console.log(path)
		// let x = deepFind([pid1], pid2, contacts, typingMatrix, distance, OPTIONS, 0)
		if (paths.length > 0) {
			let cd = (paths[0].length - 1) / 2 - 1
			// if (cd > 0) console.log(cd, paths[0])
			out.inc(distance, 'C_hop_' + cd)
			// out.inc(distance, 'cd' + cd)
			// if (cd > 0) debug.push(paths)
			// if (cd > 0) debug.push(paths[0].join('-'))
			if (cd > 0) debug.set(paths[0].join('-'), 'distance', distance)
			// if (cd > 0) debug[paths[0].join('-')] = {distance}
			// if (cd > 0) { // debugging output
			// 	debug[cd] ??= {}
			// 	debug[cd][distance] ??= []
			// 	let weights = paths[0].filter((x, i) => i % 2 == 1)
			// 	let sum_ = sum(weights)
			// 	// debug[cd][distance].push({ path: paths[0], weights, sum: sum_ })
			// 	debug[cd][distance].push(`[sum:${sum_}] ${paths[0].join('-')}`)
			// }
			// console.log(distance, `[${weightBounds.join(',')}]`, '-', sum(paths[0].filter((x, i) => i % 2 == 1)), paths[0].filter((x, i) => i % 2 == 1))
		}

	}
	// console.log('correlation debug info', JSON.stringify(debug, 0, '\t'))
	console.log('correlation debug info', debug.data)
	// console.log("correlationAbsolute", out.data)
	return out
}


// /**
//  * A dictionary of contact relationships.
//  * Maps a contact identifier to an array of related contact identifiers.
//  * * @typedef {Record<string, string[]>} ContactMap
//  */

// /**
//  * @type {ContactMap}
//  * @example
//  * const contacts = {
//  * "pat1": ["pat3", "pat5"],
//  * "pat2": ["pat8"]
//  * };
//  */
// function deepFind(sourcePIDs, targetPID, contacts, typingMatrix, distance, OPTIONS, depth) {
// 	// console.log('deepFind', sourcePIDs, targetPID, `${depth}/${maxDepth}`, threshold)
// 	if (depth > OPTIONS.CD) return -1
// 	let nextSourcePIDs = []
// 	for (let sourcePID of sourcePIDs) {
// 		for (let pid of contacts[sourcePID] ?? []) {
// 			if (pid == targetPID)
// 				return depth
// 			// if (ddGet(typingMatrix, sourcePID, pid) < threshold)
// 			let dist = typingMatrix.get(sourcePID, pid)
// 			if ((dist < distance + OPTIONS.MR) && (dist > distance - OPTIONS.MR))
// 				nextSourcePIDs.push(pid)
// 		}
// 	}
// 	return deepFind(nextSourcePIDs, targetPID, contacts, typingMatrix, distance, OPTIONS, depth + 1)
// }

export function findContactPath(sourcePID, targetPID, contacts, typingMatrix, maxDepth, weightBounds, fast = true) {
	let paths = [];
	function breadthFirstSearch(queue, visited) {
		let front = 0;
		while (front < queue.length) {
			let { node, path, sum } = queue[front++];
			if (node === targetPID) {
				if (sum >= weightBounds[0] && sum <= weightBounds[1]) {
					paths.push(path);
					if (fast) return;
				}
				continue;
			}
			// `path` contains alternating nodes and weights, so its length
			// is `2*nodes - 1`. Limit path length accordingly for `maxDepth`.
			if (path.length > (2 * maxDepth + 1)) continue;
			for (let next of contacts[node] || []) {
				if (!visited.has(next)) {
					let weight = typingMatrix.get(node, next);
					let newSum = sum + weight;
					if (newSum <= weightBounds[1]) {  // Prune if sum exceeds upper bound
						let newPath = [...path, weight, next];
						queue.push({ node: next, path: newPath, sum: newSum });
						visited.add(next);
					}
				}
			}
		}
	}
	let queue = [{ node: sourcePID, path: [sourcePID], sum: 0 }];
	let visited = new Set();
	visited.add(sourcePID);
	breadthFirstSearch(queue, visited);
	return paths;
}

/// STATS
export function absoluteTC(correlationAbsolute, settings) {
	var out = new Matrix('absoluteTC')
	for (let [distance, row] of correlationAbsolute.iterateRows({ onProgress: postProgress('apply TC threshold to correlation absolute') })) {
		// let total = correlationAbsolute.get(distance, 'total')
		if (row.total * 1 >= settings.TC)
			out.setRow(distance, row)
		// else
		// out.setRow(distance, { total: 0, cd0: 0 })
	}
	// console.log('correlationAbsoluteTC', out.data)
	return out
}


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
				if (isNaN(relativeValue)) relativeValue = 0
				correlationRelative.set(distance, cd, relativeValue)
			}
			// correlationRelative[distance][cd] = (correlationAbsolute[distance][cd] / total * 100).toFixed(2) //* 1
			// if (cd != 'typings') console.log('rel', distance, cd, correlationAbsolute[distance][cd], total, (correlationAbsolute[distance][cd] / total * 100).toFixed(2) * 1)
		}
	}
	// console.log('correlationRelative', correlationRelative.data)
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



export function stats_AMxSD(correlationRelativeCompounded, factor=2) {
	let out = new Matrix('AMxSD')
	for (let cd of correlationRelativeCompounded.colKeys().sort()) {
		let cmp = correlationRelativeCompounded.columnValues(cd)
		let avg = arithmeticMean(cmp)
		let sd = standardDeviation(cmp)
		let cutoff = avg + (sd * factor)
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
export function stats_MEDxMAD(correlationRelativeCompounded, factor=6) {
	let out = new Matrix('MEDxMAD')
	for (let cd of correlationRelativeCompounded.colKeys().sort()) {
		let cmp = correlationRelativeCompounded.columnValues(cd)
		let med = median(cmp)
		let mad = medianAbsoluteDeviation(cmp)
		let cutoff = med + (mad * factor)
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
export function stats_xMED(correlationRelativeCompounded, factor=3) {
	let out = new Matrix('xMED')
	for (let cd of correlationRelativeCompounded.colKeys().sort()) {
		let cmp = correlationRelativeCompounded.columnValues(cd)
		let med = median(cmp)
		let cutoff = med * factor
		let threshold = findThreshold(cmp, cutoff)
		out.setRow(cd, {
			median: med.toFixed(2) * 1,
			cutOff: cutoff.toFixed(2) * 1,
			threshold
		})
	}
	return out.flip()
}







function findThreshold(list, cutoff) {
	for (let i in list)
		if (list[i] < cutoff)
			return (i * 1) - 1 // last item above threshold
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

// function deepFind2(sourcePID, targetPID, contacts, typingMatrix, OPTIONS) {
// 	let paths = [];
// 	function dfs(current, path, visited) {
// 		if (current === targetPID) {
// 			let arr = [path[0]];
// 			for (let i = 1; i < path.length; i++) {
// 				arr.push(typingMatrix.get(path[i - 1], path[i]));
// 				arr.push(path[i]);
// 			}
// 			paths.push(arr);
// 			return;
// 		}
// 		if (path.length > OPTIONS.CD + 1) return;
// 		visited.add(current);
// 		for (let next of contacts[current] || []) {
// 			if (!visited.has(next)) {
// 				path.push(next);
// 				dfs(next, path, visited);
// 				path.pop();
// 			}
// 		}
// 		visited.delete(current);
// 	}
// 	dfs(sourcePID, [sourcePID], new Set());
// 	return paths;
// }




// function deepFind2(sourcePID, targetPID, contacts, typingMatrix, maxDepth, weightBounds, fast = true) {
// 	let paths = [];
// 	let found = false;
// 	function dfs(current, path, visited) {
// 		if (found) return;
// 		if (current === targetPID) {
// 			let arr = [path[0]];
// 			let sum = 0;
// 			for (let i = 1; i < path.length; i++) {
// 				let weight = typingMatrix.get(path[i - 1], path[i]);
// 				arr.push(weight);
// 				sum += weight;
// 				arr.push(path[i]);
// 			}
// 			if (sum >= weightBounds[0] && sum <= weightBounds[1]) {
// 				paths.push(arr);
// 				found = true;
// 			}
// 			return;
// 		}
// 		if (path.length > maxDepth + 1) return;
// 		visited.add(current);
// 		for (let next of contacts[current] || []) {
// 			if (!visited.has(next)) {
// 				path.push(next);
// 				dfs(next, path, visited);
// 				path.pop();
// 			}
// 		}
// 		visited.delete(current);
// 	}
// 	dfs(sourcePID, [sourcePID], new Set());
// 	return fast ? (paths.length > 0 ? [paths[0]] : []) : paths;
// }
