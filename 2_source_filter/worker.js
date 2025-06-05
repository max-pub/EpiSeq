
import { intersection, unique, Thread } from '../lib/deps.js'
// import { getPatientAndEntryCounts } from '../lib/stats.js'
// import { Thread } from '../lib/deps.js'


export function start(typingList, locationList, options) {
	let a = typeDateFilter(typingList, options)
	let b = locationDateFilter(locationList, options)
	Thread.post.from(a.from, b.from)
	Thread.post.till(a.till, b.till)

	Thread.post.countBothIDs({ typings: countBothIDs(typingList), locations: countBothIDs(locationList) })

	let grid = gridStats(typingList)

	if (options.requiredRowCompleteness) {
		let rows = rowFilter(typingList, grid.rows, options)
		Thread.post.rows(rows)
	}
	if (options.requiredColumnCompleteness) {
		let cols = colFilter(typingList, grid.cols, options)
		Thread.post.cols(cols)
	}

	if (options.roomRequired) {
		let dropped = removeEntriesWithout(locationList, 'room')
		Thread.post.typeRequired(dropped, 'room')
	}

	if (options.wardRequired) {
		let dropped = removeEntriesWithout(locationList, 'ward')
		Thread.post.typeRequired(dropped, 'ward')
	}
	if (options.removeOpenEnds) {
		// let dropped1 = removeEntriesWithout(locationList, 'from')
		// let dropped2 = removeEntriesWithout(locationList, 'till')
		let dropped3 = removeOpenEnds(locationList)
		Thread.post.typeRequired( dropped3, 'start or end date')
	}
	// if (options.adjustOpenEnds) {
	// 	let dropped = adjustOpenEnds(locationList)
	// 	Thread.post.openEnds(dropped)
	// }


	// if (options.patientsWithRoom) {
	// 	let dropped = roomFilter(locationList)
	// 	Thread.post.patientsWithRoom(dropped)
	// }

	let dropped = patientIntersectionFilter(typingList, locationList)
	Thread.post.patientIntersectionFilter(dropped)

	Thread.post.countBothIDs({ typings: countBothIDs(typingList), locations: countBothIDs(locationList) })

	if (options.pseudonymize) {
		typingList = pseudonymizeTypings(typingList)
		locationList = pseudonymizeLocations(locationList)
		Thread.post.pseudonymizationMap(pseudoMAP)
	}

	Thread.post.typingList(typingList)
	Thread.post.locationList(locationList)


	
	// let table = infoTable(typingList, locationList)
	// Thread.post.infoTable(table)

	// Thread.post.typingHistogram(histogram_t1(typingList))


	// Thread.post.locationHistogram(histogram_l1(locationList))
	// Thread.post.locationHistogramDays(histogram_l2(locationList))

	Thread.post.done()
}

export function countBothIDs(list) {
	let ids = new Set(), pids = new Set()
	for (let id in list) {
		ids.add(id)
		pids.add(list[id].patientID)
	}
	return { ids: ids.size, pids: pids.size }
}

export function histogram_t1(data) {
	let out = {}
	for (let row in data) {
		for (let col in data[row]) {
			out[col] ??= new Set()
			out[col].add(data[row][col])
		}
	}
	// console.log('t1a', out)
	for (let col in out) {
		out[col] = out[col].size
	}
	// console.log('t1', out)
	return out
}

export function histogram_l1(data) {
	let tmp = {}
	let out = {}
	for (let row in data) {
		let x = data[row]
		tmp[x.patientID] ??= new Set()
		// tmp[x.patientID].add(row)
		tmp[x.patientID].add(x.room)
	}
	console.log('histo l1', tmp)
	// console.log('t1a', out)
	for (let pid in tmp) {
		let len = tmp[pid].size
		out[len] ??= 0
		out[len] += 1
	}
	// console.log('t1', out)
	return out
}
export function histogram_l2(data) {
	let tmp = {}
	let out = {}
	for (let row in data) {
		let x = data[row]
		let from = Date.parse(x.from.replaceAll(' ', 'T')) / 1000
		let till = Date.parse(x.till.replaceAll(' ', 'T')) / 1000
		let days = (till - from) / 60 / 60 / 24
		tmp[x.patientID] ??= 0
		tmp[x.patientID] += days
	}
	console.log('l2a', tmp)
	for (let pid in tmp) {
		let days = Math.round(tmp[pid])
		out[days] ??= 0
		out[days] += 1
	}
	console.log('l2b', out)
	return out
}

export function infoTable(typingList, locationList) {
	let table = {}
	for (let id in typingList) {
		let x = typingList[id]
		let year = x.sampleDate.slice(0, 4)
		table[year] ??= { patients: [], sequences: [], locations: [], clinics: [], wards: [], rooms: [] }
		table[year].sequences.push(id)
		table[year].patients.push(x.patientID)
	}
	let tot = new Set()
	for (let id in locationList) {
		let x = locationList[id]
		// if (!x.from || !x.till) console.log("NO DATEEEEEE", x)
		for (let year of [x.from.slice(0, 4), x.till.slice(0, 4)]) {
			table[year] ??= { patients: [], sequences: [], locations: [], clinics: [], wards: [], rooms: [] }
			// table[year] ??= { patients: [], sequences: [], locations: [] }
			table[year]?.locations?.push(id)
			tot.add(id)
			for (let type of ['clinic', 'ward', 'room'])
				table[year]?.[type + 's'].push(locationList[id][type])
			// if (year == '2014' || year == '2024') console.log(year, x)
		}
	}
	console.log("SIZE:", tot.size)
	table.total = {}
	for (let type of ['patients', 'sequences', 'locations', 'clinics', 'wards', 'rooms']) {
		table.total[type] ??= []
		for (let year in table) {
			table.total[type] = [...table.total[type], ...table[year][type]]
		}
	}
	console.log('total', table.total)
	for (let type of ['patients', 'sequences', 'locations', 'clinics', 'wards', 'rooms']) {
		for (let year in table) {
			table[year][type] = [...new Set(table[year][type])].length
			// table[year].patients = [...new Set(table[year].patients)].length
			// table[year].sequences = [...new Set(table[year].sequences)].length
			// table[year].locations = [...new Set(table[year].locations)].length
		}
	}
	return table
}


export function typeDateFilter(list, FILTER) {
	let stats = { from: 0, till: 0 }
	let ids = Object.keys(list)
	for (let id of ids) {
		Thread.post.progress(ids.indexOf(id), ids.length, 'typing date filter')
		if (list[id].sampleDate.slice(0, 10) < FILTER.from) {
			delete list[id]
			stats.from++
			continue
		}
		if (list[id].sampleDate.slice(0, 10) >= FILTER.till) {
			delete list[id]
			stats.till++
		}
	}
	return stats
}


export function locationDateFilter(list, FILTER) {
	let stats = { from: 0, till: 0 }
	let ids = Object.keys(list)
	for (let id of ids) {
		Thread.post.progress(ids.indexOf(id), ids.length, 'location date filter')
		if (list[id].till.slice(0, 10) < FILTER.from) {
			delete list[id]
			stats.from++
			continue
		}
		if (list[id].from.slice(0, 10) >= FILTER.till) {
			delete list[id]
			stats.till++
		}
	}
	return stats
}







export function gridStats(DATA) {
	let stat = { rows: {}, cols: {} }
	let ids = Object.keys(DATA)
	for (let row of ids) {
		Thread.post.progress(ids.indexOf(row), ids.length, 'adjustOpenEnds')
		// for (let row in DATA) {
		stat.rows[row] ??= { count: 0 }
		for (let col in DATA[row]) {
			if (col == 'patientID') continue
			if (col == 'sampleDate') continue
			stat.cols[col] ??= { count: 0, distinctValues: new Set() }
			if (!DATA[row][col]) continue
			stat.rows[row].count++
			stat.cols[col].count++
			stat.cols[col].distinctValues.add(DATA[row][col])
		}
	}
	for (let col in stat.cols)
		stat.cols[col].distinctValues = stat.cols[col].distinctValues.size
	return stat
}

export function rowFilter(DATA, STAT, FILTER) {
	let dropped = 0
	let maxEntries = Object.values(Object.values(DATA)[0]).length
	let cutoffPercentage = FILTER.requiredRowCompleteness * 1
	let cutoffValue = Math.round(maxEntries * cutoffPercentage / 100)

	for (let id in STAT) {
		if (STAT[id].count < cutoffValue) {
			delete DATA[id]
			dropped++
		}
	}
	return { cutoffPercentage, maxEntries, cutoffValue, dropped, stats: STAT }
}



export function colFilter(DATA, STAT, FILTER) {
	let dropped = 0
	let maxEntries = Object.values(DATA).length
	let cutoffPercentage = FILTER.requiredColumnCompleteness * 1
	let cutoffValue = Math.round(maxEntries * cutoffPercentage / 100)

	for (let col in STAT) {
		if (STAT[col].count < cutoffValue) {
			for (let row in DATA)
				delete DATA[row][col]
			dropped++
		}
	}
	return { cutoffPercentage, maxEntries, cutoffValue, dropped, stats: STAT }
}




export function removeEntriesWithout(DATA, type) {
	// let list = this.data.locationList
	// let a = Object.keys(DATA).length
	let dropped = 0
	let ids = Object.keys(DATA)
	for (let id of ids) {
		Thread.post.progress(ids.indexOf(id), ids.length, 'removeEntriesWithout ' + type)
		// for (let id in DATA) {
		if (!DATA[id][type]) {
			delete DATA[id]
			dropped += 1
		}
	}
	return dropped
	// let b = Object.keys(DATA).length
	// return a - b
	// this.addDone(`removed ${a - b} locations without ${type}`)
}

export function removeOpenEnds(DATA) {
	// let list = this.data.locationList
	let dropped = 0
	let ids = Object.keys(DATA)
	for (let id of ids) {
		Thread.post.progress(ids.indexOf(id), ids.length, 'removeOpenEnds')
		if (!DATA[id].from || !DATA[id].till || DATA[id].till.startsWith('4000-')) {
			// console.log(list[id])
			delete DATA[id]
			dropped += 1
		}
	}
	return dropped
	// this.addDone(`adjusted ${openEnd} locations with open ends`)
}

export function adjustOpenEnds(DATA) {
	// let list = this.data.locationList
	let adjusted = 0
	let ids = Object.keys(DATA)
	for (let id of ids) {
		Thread.post.progress(ids.indexOf(id), ids.length, 'adjustOpenEnds')
		if (DATA[id].till.startsWith('4000-')) {
			// console.log(list[id])
			DATA[id].till = DATA[id].from
			adjusted += 1
		}
	}
	return adjusted
	// this.addDone(`adjusted ${openEnd} locations with open ends`)
}



function patientsWith(DATA, type) { // == patients that have at least one room-entry
	let goodPIDs = []
	for (let id in DATA) {
		if (DATA[id].room)
			goodPIDs.push(DATA[id].patientID)
	}
	return unique(goodPIDs)
}

function patientWhitelist(DATA, goodPIDs) {
	let dropped = 0
	for (let id in DATA)
		if (!goodPIDs.includes(DATA[id].patientID)) {
			delete DATA[id]
			dropped++
		}
	return dropped
}
export function roomFilter(DATA) {
	let patientsWithRoom = patientsWith(DATA, 'room')
	return patientWhitelist(DATA, patientsWithRoom)
}


export function locationFilter(DATA, FILTER) {
	let STATS = {}
	STATS.date = locationDateFilter(DATA, FILTER)
	let goodLocationPIDs = patientsWithGoodLocationData(DATA)
	STATS.good = keepOnlyGoodLocations(DATA, goodLocationPIDs)
	return STATS
}



export const patientIDs = DATA => unique(Object.values(DATA).map(x => x.patientID))

export function patientIntersectionFilter(typingList, locationList) {
	// console.log('intersection',JSON.stringify(DATA.typings))
	let a = Object.keys(typingList)
	let b = Object.keys(locationList)
	let typingPatientIDs = patientIDs(typingList)
	let locationPatientIDs = patientIDs(locationList)
	let IS = intersection(typingPatientIDs, locationPatientIDs)
	// console.log('intersection filter', cgmlstPatientIDs.length, locationPatientIDs.length, IS.length)
	for (let list of [typingList, locationList]) {
		let ids = Object.keys(list)
		for (let id of ids) {
			Thread.post.progress(ids.indexOf(id), ids.length, 'intersection filter')
			// for (let id in list)
			if (!IS.includes(list[id].patientID))
				delete list[id]
		}
	}

	return {
		// typings: typingPatientIDs.length - patientIDs(typingList).length,
		// locations: locationPatientIDs.length - patientIDs(locationList).length,
		sequences: a.length - Object.keys(typingList).length,
		locations: b.length - Object.keys(locationList).length,
	}
}







// ==================
// PSEUDONYMIZATION
// ==================

import { pseudonymize, pseudoMAP } from "../lib/deps.js"

function pseudonymizeLocations(list) {
	let NEW = {}
	let ids = Object.keys(list).sort()
	for (let id of ids) {
		let val = list[id]
		NEW[pseudonymize(id, { bucket: 'locations', prefix: 'loc' })] = {
			patientID: pseudonymize(val.patientID, { bucket: 'patients', prefix: 'pat', length: 4 }),
			from: val.from,
			till: val.till,
			clinic: pseudonymize(val.clinic, { bucket: 'clinics', prefix: 'c', length: 3 }),
			ward: pseudonymize(val.ward, { bucket: 'wards', prefix: 'w', length: 3 }),
			room: pseudonymize(val.room, { bucket: 'rooms', prefix: 'r', length: 4 }),
		}
		Thread.post.progress(ids.indexOf(id) + 1, ids.length, 'pseudonymize locations')
		// postMessage(['progress', ids.indexOf(id) + 1, ids.length])
	}
	return NEW
}

function pseudonymizeTypings(list) {
	let NEW = {}
	let ids = Object.keys(list).sort()
	for (let id of ids) {
		let val = list[id]
		val.patientID = pseudonymize(val.patientID, { bucket: 'patients', prefix: 'pat', length: 4 })
		NEW[pseudonymize(id, { bucket: 'sequences', prefix: 'seq', length: 5 })] = val
		Thread.post.progress(ids.indexOf(id) + 1, ids.length, 'pseudonymize typings')
		// postMessage(['progress', ids.indexOf(id) + 1, ids.length])
	}
	return NEW
}


