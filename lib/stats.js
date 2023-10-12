
export function locationListStats(LIST) {
	let types = ['clinic', 'ward', 'room']
	let output = Object.fromEntries(types.map(x => [x, {}]))
	for (let type of types) {
		for (let row in LIST) {
			let value = LIST[row][type]
			if (!value) continue
			output[type][value] ??= 0
			output[type][value]++
		}
	}
	return output
}

export function groupDistanceMatrixByDistance(dist, schemaLength) {
	let out = {}
	// let schemaLength = Number.isInteger(schema) ? schema : Object.keys(Object.values(schema)[0]).length
	// console.log(data)
	for (let id1 in dist) {
		// out[pid1] = {}
		for (let id2 in dist[id1]) {
			if (id1 <= id2) continue
			// console.log(pid1,pid2,data[pid1][pid2])
			let distance = String(dist[id1][id2])?.split('|')?.[0]
			// if (distance === 0) console.log('000', pid1, pid2, distance)
			if (distance === undefined) continue
			// console.log('dista', distance)
			// if (!val) continue
			out[distance] ??= []
			out[distance].push([id1, id2])
		}
	}
	// console.log('size', Object.keys(out).length)
	if (schemaLength)
		for (let distance = 0; distance <= schemaLength; distance++)
			out[distance] ??= []
	// console.log('size', Object.keys(out).length)
	return out
}







export function groupDistanceMatrixByPatientID(matrix, metaData) {//, first = false) {
	let output = {}
	let sampleIDs = Object.keys(matrix).sort()
	// let same = {}
	for (let sid1 of sampleIDs) {
		let pid1 = metaData[sid1]?.patientID
		if (!pid1) continue
		for (let sid2 of sampleIDs) {
			let pid2 = metaData[sid2]?.patientID
			if (!pid2) continue
			// if (pid1 == pid2) output[pid1][pid2] = ''
			if (sid1 <= sid2) continue
			let dist = matrix[sid1][sid2]
			// if (sid1 == '15d7u' && sid2 == 'ix6ii') console.log(sid1, sid2, pid1, pid2)
			if (dist === null) continue
			if (dist === undefined) continue
			// if (dist > 0) { console.log(">0"); continue }
			// if (dist == 0) console.log(sid1, pid1, pid2, sid2, dist)
			output[pid1] ??= {}
			output[pid1][pid2] ??= []
			output[pid1][pid2].push(dist * 1)
			// if (pid1 == pid2) same[pid1] = dist
			if (pid1 == pid2) continue//console.log("YEAH", pid1)
			output[pid2] ??= {}
			output[pid2][pid1] ??= []
			output[pid2][pid1].push(dist * 1)
		}
	}
	// console.log(output)
	// sort and join arrays for saving
	for (let pid1 in output) {
		for (let pid2 in output[pid1])
			// {
			if (output[pid1][pid2])
				// output[pid1][pid2] = output[pid1][pid2].sort((a, b) => a - b).join('|') 
				// if (first)
				output[pid1][pid2] = output[pid1][pid2].sort((a, b) => a - b)[0] * 1 //?? undefined
		// 	else
		// 		output[pid1][pid2] = output[pid1][pid2].sort((a, b) => a - b).join('|') ?? undefined
		// }
	}

	for (let pid1 in output)
		for (let pid2 in output[pid1])
			if (pid1 < pid2)
				delete output[pid1][pid2]// = null
	// console.log(same, 'same')
	return output
}




export function matrixFilter(data, options = {}) { // { distance: x, removeDiagonal: true, removeMultipleValues: true }
	let out = {}
	for (let id1 in data) {
		for (let id2 in data[id1]) {
			if (id1 > id2) continue
			let dist = String(data[id1][id2] ?? '')?.split('|')?.map(x => x * 1)?.sort((a, b) => a - b)?.[0]
			if (options.maxDistance && dist > options.maxDistance) continue
			if (options.minDistance && dist < options.minDistance) continue
			if (options.removeDiagonal && id1 == id2) continue
			out[id1] ??= {}
			out[id2] ??= {}
			out[id2][id1] = null
			out[id1][id2] = options.removeMultipleValues ? dist : data[id1][id2]
		}
	}
	return out
}


// export function compact(data) {
// 	let out = {}
// 	let tmp = {}
// 	for (let id1 in data) {
// 		for (let id2 in data[id1]) {
// 			let val = data[id1][id2]
// 			tmp[id1] ??= []
// 			tmp[id1].push(val)
// 			tmp[id2] ??= []
// 			tmp[id2].push(val)
// 		}
// 	}
// 	console.log('compact', tmp)
// 	return out
// }













// export function distanceFilter(data, DIST = 20) {
// 	let out = {}
// 	for (let id1 in data) {
// 		for (let id2 in data[id1]) {
// 			if (id1 > id2) continue
// 			let dist = data[id1][id2]?.split('|')?.map(x => x * 1)?.sort((a, b) => a - b)?.[0]
// 			if (dist > DIST) continue
// 			out[id1] ??= {}
// 			out[id2] ??= {}
// 			out[id2][id1] = ''
// 			out[id1][id2] = data[id1][id2]
// 		}
// 	}
// 	return out
// }

// export function cleanMatrix(data) {
// 	let out = {}
// 	for (let id1 in data) {
// 		for (let id2 in data[id1]) {
// 			let dist = data[id1][id2]?.split('|')?.map(x => x * 1)?.sort((a, b) => a - b)?.[0]
// 			if (dist === undefined) continue
// 			if (id1 >= id2) continue
// 			out[id1] ??= {}
// 			out[id2] ??= {}
// 			out[id2][id1] = ''
// 			out[id1][id2] = dist
// 		}
// 	}
// 	return out
// }


// export function cgmlstFilter(data, distance = 0) {
//     let out = {}
//     for (let pid1 in data) {
//         for (let pid2 in data[pid1]) {
//             // console.log("test",data[pid1][pid2],'--',distance)
//             if (data[pid1][pid2] != distance) continue
//             // console.log(pid1,pid2,distance)
//             out[pid1] ??= []
//             out[pid1].push(pid2)
//         }
//     }
//     return out
// }



// export function cgmlstPreparation(data) {
//     let out = {}
//     for (let pid1 in data) {
//         out[pid1] = {}
//         for (let pid2 in data[pid1]) {
//             out[pid1][pid2] = data[pid1][pid2]?.split('|')?.map(x => x * 1)?.sort((a, b) => a - b)?.[0]
//         }
//     }
//     return out
// }







// export const filterKeys = (o, f) => Object.fromEntries(Object.entries(o).filter(([k, v]) => [f(k),v]))
// export const filter = (o, f) => Object.fromEntries(Object.entries(o).filter(([k, v]) => f(k, v)))

// let VV = {
// 	maxTimespanBetweenSequences: [],
// 	locationLayer: [],
// 	maxTimespanBetweensContacts: [],
// 	maxContactDepth: [],
// }

// export function calc(sequenceMatrix, contactMatrix, VARS = {}, KEY, folder) {
// 	// console.log("folder'",folder)
// 	folder = folder.folder('debug').make
// 	for (let key in VV)
// 		if (VARS[key].length > 1)
// 			KEY = key
// 	console.log("KEY", KEY)
// 	// console.log('calc',)
// 	// const DEFAULT_VARS = { maxTimespanBetweenSequences: [90], maxTimespanBetweensContacts: [0], locationLayer: ['room'], maxContactDepth: [0] }
// 	// VARS = { ...DEFAULT_VARS, ...VARS }
// 	// console.log('seq',sequenceMatrix)
// 	// console.log('cg',cgmlstDist)
// 	// console.log(germ.name,"dist",JSON.stringify(distances).length)
// 	// console.log(distances)
// 	let output = { REL: {}, ABS: {} }
// 	for (let maxTimespanBetweenSequences of VARS.maxTimespanBetweenSequences) {
// 		console.log('filter and group sequence matrix ...')
// 		let seq = seqDateFilter(sequenceMatrix, maxTimespanBetweenSequences)
// 		// console.log('seq',seq)
// 		let pat = groupDistanceMatrixByPatientID(seq.seq, seq.meta)
// 		pat = type.filter(pat, VARS.maxDistanceBetweenSequences)
// 		// folder.file(`pat.${maxTimespanBetweenSequences}.tsv`).text = TALI.grid.stringify({pat}, { sortRows: true, sortCols: true })
// 		// console.log('pat',pat)
// 		let pairsAtDistance = cgmlstPairs(pat)
// 		// console.log('pairs',pairs)
// 		folder.file(`pairs.${maxTimespanBetweenSequences}.json`).json = pairsAtDistance
// 		// continue
// 		for (let maxTimespanBetweensContacts of VARS.maxTimespanBetweensContacts) {
// 			for (let locationLayer of VARS.locationLayer) {
// 				console.log('filter contact matrix ...')
// 				let epiContacts = contactFilter(contactMatrix, locationLayer, maxTimespanBetweensContacts)
// 				// console.log('epiContacts',epiContacts)
// 				console.log('epiContacts', Object.keys(epiContacts).length)
// 				// console.log('epicon',epiContacts)
// 				for (let maxContactDepth of VARS.maxContactDepth) {
// 					let cgmlstPatients = new Set()
// 					for (let dist in pairsAtDistance) {
// 						// let cgmlstContacts = cgmlstFilter(cgmlstDist, dist)
// 						let cgmlstContacts = pairsAtDistance[dist]
// 						// console.log("DEBUG",cgmlstContacts)
// 						for (let p of cgmlstContacts.flat())
// 							cgmlstPatients.add(p)
// 						let epiContactsBelowCgmlst = filter(epiContacts, p => cgmlstPatients.has(p))
// 						for (let p in epiContactsBelowCgmlst)
// 							epiContactsBelowCgmlst[p] = epiContactsBelowCgmlst[p].filter(x => cgmlstPatients.has(x))
// 						// console.log('epiContactsBelowCgmlst', epiContactsBelowCgmlst)
// 						// console.log('cgmlstContacts',cgmlstContacts.flat())
// 						// console.log('cgmlstPatients',[...cgmlstPatients].sort())
// 						console.log('cgmlstPatients', cgmlstPatients.size)
// 						// console.log(germ.name, dist, "dist", Object.keys(distances).length)
// 						// if(deg>0) contacts = addContactDegree(contacts)
// 						console.log(KEY.toUpperCase(), `cgMLST-distance:${dist} | maxTimespanBetweenSequences: ${maxTimespanBetweenSequences} | maxTimespanBetweensContacts:${maxTimespanBetweensContacts} | locationLayer:${locationLayer} | maxContactDepth: ${maxContactDepth}`)//, '---', JSON.stringify(VARS))
// 						let stat = { pairs: cgmlstContacts.length, contacts: 0 }
// 						for (let [pid1, pid2] of cgmlstContacts) {
// 							// let con = contactsForPID(epiContacts, pid1, deg)
// 							let t0 = Date.now()
// 							let con = contactsForPID(epiContactsBelowCgmlst, pid1, maxContactDepth)
// 							// console.log(pid1, pid2, 'contacts', con.length, Date.now() - t0,'ms')
// 							// debugFolder.file(pid1 + '.json').json = con
// 							if (!con) console.log("ALARM", pid1)
// 							if (con?.includes(pid2)) stat.contacts++
// 							// console.log(pid1, pid2,con )
// 						}
// 						// let key = Object.entries(VARS)//.filter((key, val) => val.length > 1)
// 						// console.log("KEY",key)
// 						let key
// 						if (KEY == 'maxTimespanBetweenSequences') key = maxTimespanBetweenSequences
// 						if (KEY == 'maxTimespanBetweensContacts') key = maxTimespanBetweensContacts
// 						if (KEY == 'locationLayer') key = locationLayer
// 						if (KEY == 'maxContactDepth') key = maxContactDepth
// 						// console.log("KEY", key)
// 						// console.log(stat)
// 						output.ABS.TOTAL ??= {}
// 						output.ABS.TOTAL[dist] = stat.pairs
// 						output.ABS[key] ??= {}
// 						output.ABS[key][dist] = stat.contacts
// 						output.REL[key] ??= {}
// 						output.REL[key][dist] = (stat.contacts * 100 / stat.pairs).toFixed(1)
// 						// output.abs[key ][dist+ "tot"] = stat.pairs

// 					}
// 				}
// 			}
// 		}
// 	}
// 	// console.log("CALC",output)
// 	return output
// }



// export function seqDateFilter(data, days) {
// 	// console.log('date filter',data,days)
// 	// console.log('clone')
// 	data = JSON.parse(JSON.stringify(data))
// 	// console.log('clone')
// 	for (let pid1 in data.seq) {
// 		let d1 = Date.parse(data.meta[pid1].typingDate)
// 		// console.log(d1)
// 		for (let pid2 in data.seq[pid1]) {
// 			let d2 = Date.parse(data.meta[pid2].typingDate)
// 			let dd = Math.abs(d1 - d2)
// 			let ddd = dd / 1000 / 60 / 60 / 24
// 			if (ddd > days) data.seq[pid1][pid2] = undefined
// 			// console.log(pid1, pid2, data.seq[pid1][pid2], data.meta[pid1].typingDate, ddd)
// 		}
// 	}
// 	return data
// }

// // import * as type from "../1.dist.gen/lib.js"
// import { unique, TALI } from "../dependencies/cache.js"

// export function contactFilter(data, location = 'any', maxTimespanBetweensContacts = 0) {
// 	// let DAY = 24 * 60 * 60
// 	let out = {}
// 	for (let locType in data) {
// 		if (location != 'any' && location != locType) continue
// 		for (let pid1 in data[locType]) {
// 			for (let pid2 in data[locType][pid1]) {
// 				let dur = data[locType][pid1][pid2]
// 				if (!dur) continue
// 				if (dur * 1 < -maxTimespanBetweensContacts) continue
// 				// console.log(locType, pid1, pid2, dur*1, '::', duration)
// 				out[pid1] ??= []
// 				out[pid1].push(pid2)
// 				out[pid1] = unique(out[pid1]).sort()
// 				out[pid1].sort()
// 			}
// 		}
// 	}
// 	// out = unique(out).sort()
// 	// console.log('con',out)
// 	return out
// }

// // export function addContactDegree(data) { // takes to long, find another approach
// // 	let out = {}
// // 	for (let pid1 in data) {
// // 		out[pid1] = data[pid1]
// // 		for (let pid2 of data[pid1]) {
// // 			out[pid1] = [...out[pid1], ...data[pid2]]
// // 		}
// // 	}
// // 	return out
// // }

// export function contactsForPID(data, PID, degree = 0) {
// 	// console.log('contactsForPID', Object.keys(data).length, PID)
// 	// console.log('contacts',data)
// 	let out = data[PID] ?? []
// 	// console.log("\ncontactsForPID start", degree, out.length)
// 	for (let i = 0; i < degree; i++) {
// 		for (let pid2 of out ?? []) {
// 			out = [...out, ...data[pid2]]
// 		}
// 		// console.log("contactsForPID", i, out.length)
// 	}
// 	// console.log("contactsForPID final", degree, out.length, '//', unique(out).sort().length)
// 	// return out
// 	return unique(out).sort()
// }


