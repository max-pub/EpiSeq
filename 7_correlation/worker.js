
import { Thread, average, mapValues, median, sum, standardDeviation } from '../lib/deps.js'
import { lowPassFilter, mergeFilter } from '../lib/filter.js'
import { groupMatrixByValueAndFillGaps } from '../lib/group.js'
import { ddCountAndValidate, ddGet, ddGetInt, ddIterator, diagonalNull } from '../lib/matrix.js'



export function start(typingMatrix, contactMatrix, OPTIONS) {
	// console.log('start correlation', TD, CD, CM)
	// let type5 = lowPassFilter(typingMatrix, 5)

	// let baseMatrix = diagonalNull(mergeFilter(typingMatrix, contactMatrix))
	// let lev1 = addUp(baseMatrix, baseMatrix)
	// Thread.post.baseMatrix(typingMatrix, baseMatrix)

	// let baseContactMatrix = diagonalNull(mergeFilter(contactMatrix, typingMatrix))
	// let plusContactMatrix = diagonalNull(mergeFilter(contactMatrix, lowPassFilter(typingMatrix, CM)))
	// console.log('baseContactMatrix', baseContactMatrix)
	// console.log('plusContactMatrix', plusContactMatrix)
	// diagonalNull(contactMatrix)
	// Thread.post.CT(ddCountAndValidate(contactMatrix, 'correlate contacts typings'))
	// Thread.post.contactMatrix(contactMatrix)

	// let typingPairs = groupMatrixByValueAndFillGaps(typingMatrix, TD)
	// return
	// console.log('correlation worker', typingPairs, contactMatrix, TD, CD)
	// Thread.post.contactCount(ddCountAndValidate(contactMatrix, 'correlate contacts'))
	// let contacts = getContactsForTypings(contactMatrix, typingPairs)
	// console.log('contacts', contacts)
	// return Thread.post.done()
	let contacts = calculateContacts(contactMatrix)
	// console.log('contacts', contacts)
	// let contactTree = calculateContactTree(contacts)

	let correlation = correlate(typingMatrix, contacts, OPTIONS)
	// console.log('correlation', correlation)
	Thread.post.result(correlation)

	// let pc = Object.values(correlation).map(x => x.percentage * 1)
	// let med = median(pc)
	// let avg = average(pc)
	// let sd = standardDeviation(pc)
	// Thread.post.info(med, Math.max(...pc), firstBelow(mapValues(correlation, v => v.percentage * 1), med * 10))
	// Thread.post.info2(avg, sd)

	// let seg = segregate(correlation)
	// Thread.post.segregation(seg, biggestDifference(seg))

	// let seg2 = segregate2(correlation)
	// Thread.post.segregation2(seg2, biggestDifference(seg2))
	// postMessage(['result', correlation])
	// let rel = absolute2relative(correlation)
	// Thread.post.relative(rel)
	// postMessage(['relative', rel])
	Thread.post.done()
}


function calculateContacts(contactMatrix) {
	let out = {}
	for (let [k1, k2, v] of ddIterator(contactMatrix, 'contact list')) {
		if (v === null) continue
		out[k1] ??= []
		out[k2] ??= []
		out[k1].push(k2)
		out[k2].push(k1)
	}
	return out
}



function correlate(typingMatrix, contacts, OPTIONS) {
	let out = {}
	let contactTree = {}
	// console.log('correlate', typingMatrix, contacts)
	let baseInfo = { typings: 0, ...Object.fromEntries(Array(OPTIONS.CD*1+1).fill(1).map((x, i) => ['c' + i, 0])) }
	// console.log('baseInfo', baseInfo)
	for (let [pid1, pid2, distance] of ddIterator(typingMatrix, 'correlate')) {
		if (distance > OPTIONS.TD) continue
		// console.log('dist_' + distance, pid1, pid2)
		out[distance] ??= { ...baseInfo }
		// out[distance] ??= { typings: 0 }//, c0: 0, c1: 0, c2: 0, }//c1x: 0, c2x: 0 }
		// for (let i = 0; i < OPTIONS.CD; i++)
		// 	out[distance]['c' + i] ??= 0
		out[distance].typings++

		// if (!contacts[pid1]) {
		// 	console.log(`- ${pid1} has no contacts`)
		// 	// console.log(pid1, 'has no contacts')
		// 	continue
		// }
		// if (contacts[pid1].includes(pid2)) {
		// 	console.log(`- direct contact (c0)`)
		// 	// console.log(pid1, 'direct contact to', pid2)
		// 	out[distance].c0++
		// 	continue
		// }
		let x = deepFind([pid1], pid2, contacts, typingMatrix, distance + OPTIONS.MR, 0, OPTIONS.CD)

		// let x = deepFind(pid1, pid2, contacts, typingMatrix, distance + OPTIONS.MR)
		// console.log('deepFind', x)
		if (x > -1) {
			// console.log(`- found contact in depth ${x}`)
			// out[distance]['c' + x] ??= 0
			out[distance]['c' + x]++
		}
		// else
		// console.log(`- no contact found up to depth of ${OPTIONS.CD}`)
	}
	// console.log('corr res', out)
	return out
}

function contactsWithinThreshold(pid, contacts, typingMatrix, threshold) {
	let out = []
	for (let pid2 of contacts[pid]) {
		// console.log('typing distance:', pid, pid2, ddGet(typingMatrix, pid, pid2))
		if (ddGet(typingMatrix, pid, pid2) < threshold)
			out.push(pid2)
	}
	// console.log('contacts', contacts[pid].length, '-', out.length, '=', contacts[pid].length - out.length)
	return out
}

function deepFind(sourcePIDs, targetPID, contacts, typingMatrix, threshold, depth, maxDepth) {
	// console.log('deepFind', sourcePIDs, targetPID, `${depth}/${maxDepth}`, threshold)
	if (depth > maxDepth) return -1
	let nextSourcePIDs = []
	for (let sourcePID of sourcePIDs) {
		for (let pid of contacts[sourcePID] ?? []) {
			if (pid == targetPID)
				return depth
			if (ddGet(typingMatrix, sourcePID, pid) < threshold)
				nextSourcePIDs.push(pid)
		}
	}
	return deepFind(nextSourcePIDs, targetPID, contacts, typingMatrix, threshold, depth + 1, maxDepth)
}




// let con = contactsWithinThreshold(contacts, pid1, typingMatrix, distance + OPTIONS.CM)

// console.log("CON", con)
// // calculate secondary now
// if (!contactTree[pid1]) {
// 	console.log(`- calculate contact tree for ${pid1}`)
// 	contactTree[pid1] ??= calculateContactTree(contacts, pid1)
// }
// if (findInLevel2(contactTree, pid1, pid2, typingMatrix, OPTIONS.CM + distance)) {
// 	console.log('dist++')
// 	out[distance].c1++
// 	continue
// }



// function deepFind2(pid1, pid2, contacts, typingMatrix, threshold) {
// 	for (let x of contactsWithinThreshold(pid1, contacts, typingMatrix, threshold)) { // primary contacts
// 		if ([pid1].includes(x)) continue
// 		if (x == pid2) return 0
// 		for (let y of contactsWithinThreshold(x, contacts, typingMatrix, threshold)) { // secondary contacts
// 			if ([pid1, x].includes(y)) continue
// 			if (y == pid2) return 1
// 			// for (let z of contactsWithinThreshold(y, contacts, typingMatrix, threshold)) { // tertiary contacts
// 			// 	if ([pid1, x, y].includes(z)) continue
// 			// 	if (z == pid2) return 2
// 			// }
// 		}
// 	}
// 	return -1
// }


// function findInLevel2(contactTree, pid1, pid2, typingMatrix, maxDistance) {
// 	for (let x in contactTree[pid1]) {
// 		if (contactTree?.[pid1]?.[x]?.[pid2]) {
// 			let dist2 = distanceList(typingMatrix, pid1, x, pid2)
// 			// let distSum = sum(dist2)
// 			// if (distSum + 5 <= distance)
// 			if (dist2.filter(x => x < maxDistance).length == dist2.length) {
// 				// if (dist2.filter(x => x < distance + OPTIONS.CM).length == dist2.length) {
// 				console.log(`- indirect contact (c1) via ${x}: ${dist2.join('-')}`)
// 				// console.log('C1', distance, '--', dist2,)// '--', dist2.filter(x => x < distance + 5).length)
// 				// out[distance].c1++
// 				return true
// 			} else {
// 				console.log(`- invalid indirect contact (c1-x) via ${x}: ${dist2.join('-')}`)
// 				// console.log('C1 X', distance, '--', dist2,)// '--', dist2.filter(x => x < distance + 5).length)
// 				// out[distance].c1x++
// 			}
// 			// continue
// 		}
// 	}

// }

// function calculateContactTree(contacts, pid) {
// 	let out = {}
// 	for (let x of contacts[pid]) {
// 		// if (x in [pid]) continue
// 		if ([pid].includes(x)) continue
// 		out[x] = {} // level 1
// 		for (let y of contacts[x]) {
// 			// console.log(pid, x, y, y in [pid, x])
// 			// if (y in [pid, x]) continue
// 			if ([pid, x].includes(y)) continue
// 			out[x][y] = {}
// 		}
// 	}
// 	console.log('distance tree for', pid, out)
// 	return out
// }


// function addUp(m1, m2) {
// 	let c1 = getContactsFromMatrix(m1)
// 	let c2 = getContactsFromMatrix(m2)
// 	let out = {}
// 	for (let [k1, k2, val] of ddIterator(m1)) {

// 	}
// 	return out
// }


// function firstBelow(values, value) {
// 	// console.log('first below', values, '--', value)
// 	// console.log('keys',Object.keys(values).sort())
// 	for (let i in values)
// 		if (values[i] < value)
// 			return i - 1
// }




// function correlate(typingMatrix, contactTree, OPTIONS) {
// 	let out = {}
// 	console.log('correlate', typingMatrix, contactTree)
// 	for (let [pid1, pid2, distance] of ddIterator(typingMatrix, 'correlate')) {
// 		if (distance > OPTIONS.CD) continue
// 		// console.log('corr', pid1, pid2, distance)
// 		out[distance] ??= { typings: 0, c0: 0, c1: 0, c2: 0, c1x: 0 }
// 		out[distance].typings++
// 		if (!(pid1 in contactTree)) {
// 			console.log(pid1, 'has no contacts')
// 			continue
// 		}
// 		if (contactTree?.[pid1]?.[pid2]) {
// 			console.log(pid1, 'direct contact to', pid2)
// 			out[distance].c0++
// 			continue
// 		}
// 		for (let x in contactTree[pid1]) {
// 			if (contactTree?.[pid1]?.[x]?.[pid2]) {
// 				let dist2 = distanceList(typingMatrix, pid1, x, pid2)
// 				// let distSum = sum(dist2)
// 				// if (distSum + 5 <= distance)
// 				if (dist2.filter(x => x < distance + OPTIONS.CM).length == dist2.length) {
// 					console.log('C2', distance, '--', dist2, '--', dist2.filter(x => x < distance + 5).length)
// 					out[distance].c1++
// 				} else {
// 					console.log('C2 X', distance, '--', dist2, '--', dist2.filter(x => x < distance + 5).length)
// 					out[distance].c1x++
// 				}
// 				continue
// 			}

// 		}

// 	}
// 	console.log('corr res', out)
// 	return out
// }


// function correlate(typingPairs, contactTree, typingMatrix) {
// 	let out = {}
// 	console.log('contact tree', contactTree)
// 	for (let distance in typingPairs) {
// 		if(distance>50) break
// 		console.log("-------DISTANCE",distance)
// 		let count = { typings: typingPairs[distance].length, c0: 0, c1: 0, c2: 0 }
// 		for (let [pid1, pid2] of typingPairs[distance]) {
// 			// console.log('test', pid1, pid2)
// 			if (!(pid1 in contactTree)) console.log("NOT", pid1)
// 			if (contactTree?.[pid1]?.[pid2]) {
// 				count.c0++
// 				continue
// 			}
// 			for (let x in contactTree[pid1]) {
// 				if (contactTree?.[pid1]?.[x]?.[pid2]) {
// 					let dist2 = distanceList(typingMatrix, pid1, x, pid2)
// 					let distSum = sum(dist2)
// 					console.log('L2 --', distance, '--', pid1, x, pid2, '--', dist2, '--', distSum)
// 					if (distSum + 5 <= distance)
// 						count.c1++
// 					continue
// 				}

// 			}

// 		}
// 		// count.percentage = count.typings > 0 ? ((count.contacts / count.typings) * 100).toFixed(1) : '0.0'
// 		out[distance] = count
// 		Thread.post.progress(distance * 1, Object.keys(typingPairs).length)
// 	}
// 	return out
// }

function distanceList(typingMatrix, ...pids) {
	// console.log('distance lsit', pids)
	let out = []
	for (let i = 0; i < pids.length - 1; i++) {
		let [p1, p2] = [pids[i], pids[i + 1]]
		// let v = [typingMatrix?.[p1]?.[p2], typingMatrix?.[p2]?.[p1], '--', ddGet(typingMatrix, p1, p2)]
		// out.push(typingMatrix?.[p1]?.[p2] || typingMatrix?.[p2]?.[p1])
		// console.log(p1, p2, v)
		out.push(ddGet(typingMatrix, p1, p2))
	}
	return out
}


function expand(pids, contacts) {
	return pids.flatMap(pid => contacts[pid] ?? [])
}

function getContactsFromMatrix(matrix) {
	let out = {}
	for (let [k1, k2, val] of ddIterator(matrix))
		addContacts(out, k1, k2)
	for (let p in out)
		out[p] = [...out[p]]
	return out
}

function getContactsForTypings(contactMatrix, typingPairs) {
	console.log('find', contactMatrix, '--', typingPairs)
	let out = {}
	for (let dist in typingPairs) {
		out[dist] = {}
		console.log('calc', dist, typingPairs[dist])
		for (let [p1, p2] in typingPairs[dist]) {
			let contact = ddGetInt(contactMatrix, p1, p2)
			if (contact != null) {
				console.log('contact!', p1, p2)
				for (let i = 0; i <= dist * 1; i++) {
					addContact(out[i], p1, p2)
					addContact(out[i], p2, p1)
				}
			}
		}
	}
	return out
	// let allPairs = Object.values(typingPairs).flat()
	// console.log('allPairs', allPairs)
	// let out = {}
	// for (let [p1, p2, v] of ddIterator(contactMatrix))
	// 	if (v != null) {
	// 		addContact(out, p1, p2)
	// 		addContact(out, p2, p1)
	// 	}
	// return out
}

function addContacts(out, p1, p2) {
	// console.log('add contacts', p1, p2)
	addContact(out, p1, p2)
	addContact(out, p2, p1)
}
function addContact(out, p1, p2) {
	out[p1] ??= new Set()
	out[p1].add(p2)
}




function segregate(data) {
	let out = {}
	data = Object.entries(data)//.slice(0,20)
	for (let i = 0; i <= 10; i++) {
		out[i] = {
			a: average(data.filter(x => x[0] <= i).map(x => x[1].percentage * 1)).toFixed(2) * 1,
			b: average(data.filter(x => x[0] > i).map(x => x[1].percentage * 1)).toFixed(2) * 1,
		}
		out[i].diff = (out[i].a - out[i].b).toFixed(2) * 1
	}
	return out
}

function absoluteAverage(data) {
	return ((sum(data.map(x => x[1].contacts * 1)) / sum(data.map(x => x[1].typings * 1))) * 100).toFixed(2) * 1
}

function segregate2(data) {
	let out = {}
	data = Object.entries(data)//.slice(0,20)
	for (let i = 0; i <= 10; i++) {
		out[i] = {
			a: absoluteAverage(data.filter(x => x[0] <= i)),
			b: absoluteAverage(data.filter(x => x[0] > i)),
		}
		out[i].diff = (out[i].a - out[i].b).toFixed(2) * 1
	}
	return out
}

function biggestDifference(segData) {
	let out = { position: 0, difference: 0 }
	for (let position in segData) {
		let difference = segData[position].a - segData[position].b
		if (difference >= out.difference)
			out = { position, difference }
	}
	return out
}


function buildRollingAverage(sourceData, rolling) {
	let rollingData = {}
	// console.log('buidl rolling', Object.keys(sourceData).length - rolling)
	for (let i = 0; i < Object.keys(sourceData).length - rolling * 1; i++) {
		// console.log('build rolling', i)
		rollingData[i] ??= {}
		for (let key in sourceData[i]) {
			rollingData[i][key] = 0
			for (let j = i; j <= i + rolling * 1; j++) {
				// console.log('build', i, j, key)
				rollingData[i][key] += sourceData[j][key]
			}
		}
	}
	return rollingData
}
