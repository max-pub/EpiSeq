import { Thread } from '../lib/deps.js'
import { highPassFilter, mergeFilter } from '../lib/filter.js'
import { groupMatrixByValue } from '../lib/group.js'
import { ddCountAndValidate, ddGet, ddIterator, ddSet, diagonalNull } from '../lib/matrix.js'


export function start(contactMatrix, options) {
	// console.log('location filter worker', contactMatrix, options)
	// contacts = filter(contacts, options)
	// let summary = locationSummary(contacts)
	// Thread.post.summary(summary)
	// console.log('contacts', contactMatrix)
	// let stat = {}
	// for(let type in contactMatrix)
	// 	stat[type] = matrixHistogram(contactMatrix[type])
	// Thread.post.distribution(stat)
	// let stat = matrixHistogram(contactMatrix.clinic)
	// let stat = groupMatrixByValue(contactMatrix.clinic)
	// console.log('stat', stat)
	contactMatrix = selectLevel(contactMatrix, options.CS)
	Thread.post.CS(ddCountAndValidate(contactMatrix, 'spacial filter'))

	contactMatrix = highPassFilter(contactMatrix, options.CT)
	Thread.post.CT(ddCountAndValidate(contactMatrix, 'temporal filter'))

	diagonalNull(contactMatrix)
	Thread.post.contactMatrix(contactMatrix)
	// console.log('worker cm', contactMatrix)
	// contactMatrix = mergeFilter(contactMatrix, typingMatrix)
	// diagonalNull(contactMatrix)
	// Thread.post.CT(ddCountAndValidate(contactMatrix, 'filter contacts typings'))
	// // Thread.post.contacts(contactMatrix)

	// if (options.CD > 0) {
	// 	contactMatrix = addDepth(contactMatrix, options.CD)
	// 	Thread.post.CD(ddCountAndValidate(contactMatrix, 'filter contacts depth'))
	// }


	// show histogram 1
	// let histogram = matrixHistogram(contactMatrix)
	// Thread.post.contactHistogram(histogram)


	// show histogram 2
	// let contacts = calculateContacts(contactMatrix)
	// Thread.post.contacts(contacts)

	
	// let contactTree = calculateContactTree(contacts)
	// // console.log('contacts',contacts)
	// // console.log('tree', contactTree)
	// Thread.post.contactTree(contactTree)

	Thread.post.done()
}

// export function matrixHistogram(matrix) {
// 	let valueGroups = groupMatrixByValue(matrix)
// 	// console.log('value group 0',valueGroups[0])
// 	// console.log('valueGroups', valueGroups)
// 	let keys = Object.keys(valueGroups).map(x => x * 1).sort()
// 	let min = Math.min(...keys)
// 	let max = Math.max(...keys)
// 	console.log('min', min, 'max', max)
// 	let out = {}
// 	for (let i = max; i >= min; i--)
// 		out[i] = valueGroups[i]?.length ?? 0

// 	return out
// }

function calculateContacts(contactMatrix) {
	let out = {}
	// for(let p in contactMatrix)
	// 	out[p] = []
	for (let [k1, k2, v] of ddIterator(contactMatrix, 'contact list')) {
		if (v === null) continue
		out[k1] ??= []
		out[k2] ??= []
		out[k1].push(k2)
		out[k2].push(k1)
	}
	return out
}
function calculateContactTree(contacts) {
	let out = {}
	let pids = Object.keys(contacts)
	for (let pid of pids) {
		Thread.post.progress(pids.indexOf(pid), pids.length, 'contact tree')
		out[pid] ??= {}
		for (let x of contacts[pid]) {
			if ([pid].includes(x)) continue
			out[pid][x] = {} // level 1
			for (let y of contacts[x]) {
				if ([pid, x].includes(y)) continue
				out[pid][x][y] = {}
				// for (let z of contacts[y]) {
				// 	if ([pid, x, y].includes(z)) continue
				// 	out[pid][x][y][z] = {}
				// }
			}
		}
	}
	return out
}

function selectLevel(contacts, CL) {
	if (['clinic', 'ward', 'room'].includes(CL)) return contacts[CL]

	// console.log('calculate ANY from clinic,ward,room')
	let out = {}
	for (let level in contacts) {
		let pids = Object.keys(contacts[level])
		// for (let p1 in contacts[level]) {
		for (let p1 of pids) {
			Thread.post.progress(pids.indexOf(p1), pids.length, `add ${level}`)
			for (let p2 in contacts[level][p1]) {
				let v = contacts[level][p1][p2]
				out[p1] ??= {}
				if (out[p1][p2] == null || out[p1][p2] < v)
					out[p1][p2] = v
			}
		}
	}
	return out
}



function addDepth(contacts, depth) {
	console.log("DEPTH")
	if (depth == 0) return contacts

	// set all current valid contacts to degree = 0 
	// and create list of contact-ids
	let out = {}
	let direct = {}
	for (let [k1, k2, v] of ddIterator(contacts))
		if (v != null) {
			ddSet(out, k1, k2, 0)
			direct[k1] ??= new Set()
			direct[k2] ??= new Set()
			direct[k1].add(k2)
			direct[k2].add(k1)
		}
	console.log('0 degree', out)
	console.log('direct', direct)
	console.log('direct', Object.values(direct).map(x => x.length))

	// add depth
	for (let i = 1; i <= depth; i++) {
		addDepthX(out, direct, i)
		console.log(i, 'degree', out)
	}
	diagonalNull(out)
	return out
}


function addDepthX(matrix, contacts, depth) {
	for (let [k1, k2, val] of ddIterator(matrix)) {
		if (val == null) continue
		addLinks(matrix, k1, contacts[k2], depth)
		addLinks(matrix, k2, contacts[k1], depth)
	}
}

function addLinks(matrix, pid, contacts, depth) {
	// console.log('addLinks', pid, contacts, depth)
	for (let contact of contacts) {
		let link = ddGet(matrix, pid, contact)
		if (link == null)
			// ddSet(matrix, pid, contact, pid.replace('patient_', ''))
			ddSet(matrix, pid, contact, depth)
	}
}


export function matrixHistogram(matrix, schemaLength) {
	// console.log('schema len', schemaLength)
	let out = {}
	// let out = Object.fromEntries(new Array(schemaLength + 1).fill(0).map((x, i) => [i, x]))
	for (let [pid1, pid2, dist] of ddIterator(matrix, 'calculate histogram')) {
		out[dist] ??= 0
		out[dist] += 1
	}
	let vals = Object.keys(out).map(x => x * 1)
	let min = Math.min(...vals)
	let max = Math.max(...vals)
	// console.log('histo max',max)
	for (let i = min; i <= max; i++)
		out[i] ??= 0
	// console.log('contact histogram', out)
	return out
}

