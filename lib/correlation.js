import { mapValues } from './deps.js'
import { groupDistanceMatrixByPatientID, groupDistanceMatrixByDistance, matrixFilter } from './stats.js'
import { matrixToList, rowsAndCols, diagonalX } from './matrix.js'
// import { TALI } from './deps.js'

onmessage = event => {
	let [LIST, DIST, OPTIONS] = event.data
	// console.log('hello from CORREL matrix::', LIST)
	reduce(LIST, DIST, OPTIONS)
}


function reduce(LIST, DIST, OPTIONS) {
	console.log("reduce", OPTIONS)
	// let typingDates = getTypingDates(LIST.cgmlst)

	let seq = DIST.cgmlst

	// console.log('filter sequence matrix by date...')
	let seqCount1 = matrixToList(seq).length
	seq = OPTIONS.TI ? matrixDateFilter(DIST.cgmlst, LIST.cgmlst, OPTIONS.TI) : DIST.cgmlst // TI==0 -> no filter
	// rowsAndCols(seq, 'after date')
	let seqCount2 = matrixToList(seq).length
	postMessage(['TI', { dropped: seqCount1 - seqCount2 }])

	// console.log('filter sequence matrix by distance...')
	seq = matrixDistanceFilter(seq, { maxDistance: OPTIONS.TD })
	let seqCount3 = matrixToList(seq).length
	postMessage(['TD', { dropped: seqCount2 - seqCount3 }])

	// console.log('group sequence matrix ...')
	let pat = groupDistanceMatrixByPatientID(seq, LIST.cgmlst)
	diagonalX(seq)
	diagonalX(pat)
	// console.log('seq', seq)
	// console.log('pat', pat)


	console.log('seq count', seqCount1, seqCount2, seqCount3)
	postMessage(['cgmlst', { cgmlst: pat, count: matrixToList(pat).length }])

	let loc = DIST.locations[OPTIONS.CL]
	let locCount1 = matrixToList(loc).length
	postMessage(['CL', { count: locCount1 }])

	loc = matrixDistanceFilter(loc, { minDistance: OPTIONS.CI })
	let locCount2 = matrixToList(loc).length
	postMessage(['CI', { dropped: locCount1 - locCount2 }])

	postMessage(['CD', { dropped: locCount1 - locCount2 }])
	console.log('loc count ', locCount1, locCount2)

	diagonalX(loc)
	// console.log('loc', loc)
	postMessage(['location', { location: loc, count: matrixToList(loc).length }])

	let pairs = groupDistanceMatrixByDistance(pat, OPTIONS.TD)
	console.log('pairs', pairs)
	let data = correlate(pairs, loc)
	postMessage(['correlate', data])

}




export function matrixDateFilter(DIST, LIST, days) {
	// let typingDates = getTypingDates(LIST)
	let typingDates = mapValues(LIST, x => Date.parse(x.typingDate) / 1000 / 60 / 60 / 24)
	// console.log('typingDates', typingDates)
	// let dropped = 0
	// DIST = structuredClone(DIST)
	let out = {}
	for (let id1 in DIST) {
		let d1 = typingDates[id1]
		// let d1 = Date.parse(LIST[id1].typingDate)
		for (let id2 in DIST[id1]) {
			if (id1 <= id2) continue
			let d2 = typingDates[id2]
			// let d2= Date.parse(LIST[id2].typingDate)
			let dd = Math.abs(d1 - d2) // date difference 
			// let ddd = dd / 1000 / 60 / 60 / 24 // date difference in days
			// console.log('diff', days, ddd, ddd < days)
			if (dd <= days) {
				out[id1] ??= {}
				out[id1][id2] = DIST[id1][id2]
			} //else dropped++
			// console.log(pid1, pid2, data.seq[pid1][pid2], data.meta[pid1].typingDate, ddd)
		}
	}
	// console.log('message TI', dropped)
	// postMessage(['TI', { dropped }])
	return out
}

export function matrixDistanceFilter(data, options = {}) { // { distance: x, removeDiagonal: true, removeMultipleValues: true }
	let out = {}
	// let dropped = 0
	for (let id1 in data) {
		for (let id2 in data[id1]) {
			if (id1 <= id2) continue
			let dist = String(data[id1][id2] ?? '')?.split('|')?.map(x => x * 1)?.sort((a, b) => a - b)?.[0] * 1
			if (('maxDistance' in options) && dist > options.maxDistance) continue
			if (('minDistance' in options) && dist < options.minDistance) continue
			// if (options.removeDiagonal && id1 == id2) continue
			out[id1] ??= {}
			out[id2] ??= {}
			// out[id2][id1] = null
			// out[id1][id2] = options.removeMultipleValues ? dist : data[id1][id2]
			out[id1][id2] = dist
		}
	}
	return out
}


export function correlate(pairs, loc) {
	let out = {}
	for (let dist in pairs) {
		out[dist] = { total: pairs[dist].length, contacts: 0, }
		for (let pair of pairs[dist]) {
			let [p1, p2] = pair
			let contact = loc[p1]?.[p2] ?? loc[p2]?.[p1]
			if (contact)
				out[dist].contacts++
			// console.log(dist, pair, contact)
		}
		out[dist].percentage = (out[dist].total ? out[dist].contacts * 100 / out[dist].total : 0).toFixed(1) + '%'
	}
	// console.log('correlate', out)
	return out
}


// function typingFilter(LIST, DIST, TD, TP, typingDates) {
// 	console.log('filter sequence matrix by date...')
// 	let seq = TP ? matrixDateFilter(DIST.cgmlst, typingDates, TP) : DIST.cgmlst // TP==0 -> no filter
// 	console.log('group sequence matrix ...')
// 	let pat = groupDistanceMatrixByPatientID(seq, LIST.cgmlst)
// 	console.log('filter sequence matrix by distance...')
// 	pat = matrixFilter(pat, { maxDistance: TD, removeDiagonal: true, removeMultipleValues: true })
// 	console.log('build sequence matrix pairs...')
// 	let pairsPerDistance = groupDistanceMatrixByDistance(pat, TD)
// 	return pairsPerDistance
// }



function locationFilter_1(DIST, CL, pairs) {
	// console.log('ad')
	const CONTACT_LOCATION = { a: 'any', c: 'clinic', w: 'ward', r: 'room' }
	let dist = DIST[CONTACT_LOCATION[CL.toLowerCase()]]
	let out = {}
	let ids = Object.keys(dist).sort()
	for (let id1 of ids) {
		for (let id2 of ids) {
			if (id1 <= id2) continue
			if (dist[id1][id2] === undefined) continue
			if (!pairs.includes(id1 + '-' + id2)) continue
			out[id1] ??= {}
			out[id1][id2] = dist[id1][id2]
			// out[id2] ??= {}
			// out[id2][id1] == ''
		}
	}
	return out
}


// function locationFilter(DIST, CL, TI, flatPairs) {
// 	const CONTACT_LOCATION = { a: 'any', c: 'clinic', w: 'ward', r: 'room' }
// 	let dist = DIST[CONTACT_LOCATION[CL.toLowerCase()]]
// 	dist = matrixFilter(dist, { minDistance: TI })
// 	return dist
// }

// function getTypingDates(LIST) {
// 	let out = {}
// 	for (let id in LIST)
// 		out[id] = Date.parse(LIST[id].typingDate)
// 	return out
// }





function addDepth(DATA, CD) {
	if (CD == 0) return DATA[0]
	let t0 = Date.now()
	console.log('calculate depth', CD, '...')
	let base = DATA[0]
	let prev = DATA[CD - 1]
	let next = {}
	let pids = Object.keys(base).sort()
	for (let pid1 of pids) {
		for (let pid2 of pids) {
			if (pid1 > pid2) continue
			let distA = prev?.[pid1]?.[pid2]
			if (distA == undefined) continue
			for (let pid3 of pids) {
				if (pid1 == pid3) continue
				let distB = base?.[pid2]?.[pid3] ?? base?.[pid3]?.[pid2]
				if (distB == undefined) continue
				let distAB = Math.min(distA, distB)
				// console.log(pid1, pid2, pid3, '|', base[pid1][pid3], distAB, '|', distA, distB)
				let [pid13a, pid13b] = [pid1, pid3].sort()
				next[pid13a] ??= {}
				if (next[pid13a][pid13b] > distAB) continue
				// if ((next[pid1][pid3] == undefined) || (next[pid1][pid3] < distAB))
				next[pid13a][pid13b] = distAB

			}
		}
	}
	console.log('calculate depth', CD, 'in', Date.now() - t0, 'ms')
	DATA[CD] = next
	return next
}




// function depth() {
// 	for (let CD of CORRELATION.CD) {
// 		DATA[CD + 1] = {}
// 		for (let type in DATA[depth]) {
// 			// if (type != 'room') continue
// 			console.log(depth, type)
// 			let data = JSON.parse(JSON.stringify(DATA[depth][type]))
// 			DATA[CD + 1] = JSON.parse(JSON.stringify(DATA[depth][type]))
// 			let PIDS = Object.keys(data)
// 			for (let pid1 in data) {
// 				console.log(germ.name, depth, type, PIDS.indexOf(pid1), PIDS.length, pid1)
// 				// data[pid1] ??= {}
// 				for (let pid2 in data) {
// 					// if (pid1 > pid2) continue
// 					let distA = data[pid1][pid2]
// 					if (distA != undefined) {
// 						// console.log(data[pid1][pid2])
// 						for (let pid3 in DATA[0][type][pid2]) {
// 							if (pid1 == pid3) continue
// 							let distB = DATA[0][type][pid2][pid3]
// 							if (distB != undefined) {
// 								let distAB = Math.min(distA, distB)
// 								// console.log(pid1, pid2, pid3, '|', data[pid1][pid3], distAB, '|', distA, distB)
// 								if ((data[pid1][pid3] == undefined) || (data[pid1][pid3] < distAB))
// 									DATA[depth + 1][type][pid1][pid3] = distAB
// 							}
// 						}
// 					}
// 					// data[pid1][pid2] = 1
// 					// console.log(pid1,pid2)
// 				}
// 			}
// 			// DATA[depth + 1][type] = data
// 			// germ.folder('epi').folder(depth + 1).make.file(type + '.tsv').text = TALI.grid.stringify({ [type]: DATA[depth + 1][type] }, { sortRows: true, sortCols: true })
// 		}
// 	}
// }




export function correlation(LIST, DIST, CORRELATION, debugFolder) {
	console.log(`\nstart correlation ...`)
	let typingDates = getTypingDates(LIST.cgmlst)
	// let patientIDs = Object.keys(LIST.cgmlst).sort()
	// Deno.writeTextFileSync(`test_000.tsv`, TALI.grid.stringify({ locations: DIST.locations.room }, { sortRows: true, sortCols: true }))
	addAnyLocation(DIST.locations)

	// return
	let REL = {}, ABS = {}
	for (let TP of CORRELATION.TP) {
		let tableKey = 'TP=' + TP
		ABS[tableKey] = { TOTAL: {} }
		REL[tableKey] = {}
		let pairsPerDistance = typingFilter(LIST, DIST, CORRELATION.TD, TP, typingDates)
		// let flatPairs = Object.values(pairsPerDistance).flat()
		// console.log('flat', flatPairs)
		// return
		// console.log('dist', dist, 'pairs', pairs.length)
		let accPairs = []
		for (let dist in pairsPerDistance) {
			let t0 = Date.now()
			let pairs = pairsPerDistance[dist]
			accPairs = [...accPairs, ...pairs.map(x => x[0] + '-' + x[1])]
			console.log('accPairs', accPairs.length)
			ABS[tableKey].TOTAL[dist] ??= pairs.length
			// continue
			for (let CL of CORRELATION.CL) {
				let locations = locationFilter_1(DIST.locations, CL, accPairs)
				// Deno.writeTextFileSync(`loc/${CL}_${dist}.tsv`, TALI.grid.stringify({ locations }, { sortRows: true, sortCols: true }))
				// continue
				for (let TI of CORRELATION.TI) {
					let loc = [matrixFilter(locations, { minDistance: TI })]
					// let locations = locationFilter(DIST.locations, CL, TI)
					// Deno.writeTextFileSync(`test_${CL}_${TI}.json`, JSON.stringify(locations, 0, 4))
					// debugFolder.folder('loc').folder(CL).folder(TI).make.file(dist + '.tsv').text = TALI.grid.stringify({ loc:loc[0] }, { sortRows: true, sortCols: true })
					// continue
					// Deno.writeTextFileSync(`loc/${CL}_${TI}.tsv`, TALI.grid.stringify({ locations }, { sortRows: true, sortCols: true }))
					// console.log(locations,'locations')
					// return
					for (let CD of CORRELATION.CD) {
						loc[CD] = addDepth(loc, CD)
						debugFolder.folder('loc').folder(CL).folder(TI).folder(CD).make.file(dist + '.tsv').text = TALI.grid.stringify({ loc: loc[CD] }, { sortRows: true, sortCols: true })
						let rowKey = 'CL=' + CL[0].toUpperCase() + '___TI=' + String(TI).padStart(2, '0') + '___CD=' + CD
						ABS[tableKey][rowKey] ??= {}
						REL[tableKey][rowKey] ??= {}
						// console.log('distance:', dist, 'pairs:', pairs.length)
						let contactCount = 0
						for (let [pid1, pid2] of pairs) {
							let contact = locations?.[pid1]?.[pid2]
							// console.log('contact', pid1, pid2, contact, locations?.[pid2]?.[pid1], TI, contact > TI)
							if (contact > TI)
								contactCount++
						}
						ABS[tableKey][rowKey][dist] = contactCount
						REL[tableKey][rowKey][dist] = (contactCount * 100 / ABS[tableKey].TOTAL[dist]).toFixed(1)
						console.log(tableKey, rowKey, dist, 'contacts:', contactCount, '/', pairs.length, (Date.now() - t0) + 'ms')
					}
				}
			}
		}
	}
	return { ABS, REL }
}
