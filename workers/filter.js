
import { intersection, unique } from '../lib/deps.js'
import { getPatientAndEntryCounts } from '../lib/stats.js'

onmessage = event => {
	let [LIST, FILTER] = event.data
	console.log('start filter worker', LIST, FILTER)
	filterAll(LIST, FILTER)
}

function filterAll(LIST, FILTER) {
	postMessage(['start'])
	// let FILTER = getFilterSettings()
	console.log('FILTER', FILTER)
	// console.log('pat ids',patientIDs(LIST.typings))
	dateFilter(LIST, FILTER)
	// console.log('pat ids',patientIDs(LIST.typings))
	completenessFilter(LIST, FILTER)
	// console.log('pat ids',patientIDs(LIST.typings))
	if (FILTER.hasRoom) {
		let dropped = roomFilter(LIST.locations)
		postMessage(['hasRoom', dropped])
		// $(`#filter #hasRoom .help`).innerHTML = `removed ${dropped} locations`
	}
	// console.log('pat ids',patientIDs(LIST.typings))
	let dropped = patientIntersectionFilter(LIST)
	postMessage(['matchingPatients', dropped])
	// console.log("FILTER RESULT", LIST)
	// return
	// console.log('matchingPatients',dropped)

	// console.log("FILTER RESULT", LIST)
	postMessage(['result', LIST])

	// postMessage(['stat', 'typings', getPatientAndEntryCounts(LIST.typings)])
	// postMessage(['stat', ƒ'locations', getPatientAndEntryCounts(LIST.locations)])

	postMessage(['stat',{
		typings: getPatientAndEntryCounts(LIST.typings),
		locations: getPatientAndEntryCounts(LIST.locations),
	}])
	// $(`#filter #matchingPatients .help`).innerHTML = `removed ${dropped.typings} typings and ${dropped.locations} locations`
}



function dateFilter(LIST, FILTER) {
	let a = typeDateFilter(LIST.typings, FILTER)
	let b = locationDateFilter(LIST.locations, FILTER)
	postMessage(['from', [a.from, b.from]])
	postMessage(['till', [a.till, b.till]])
}
function completenessFilter(LIST, FILTER) {
	// let total = { rows: Object.values(LIST.typings).length, cols: Object.values(Object.values(LIST.typings)[0]).length }
	let grid = gridStats(LIST.typings)
	// console.log('grid', grid)
	// console.log('pat ids',patientIDs(LIST.typings))

	postMessage(['grid', grid])
	let rows = rowFilter(LIST.typings, grid.rows, FILTER)
	postMessage(['rows', rows])
	// console.log('pat ids',patientIDs(LIST.typings))
	// console.log('rows',rows)
	let cols = colFilter(LIST.typings, grid.cols, FILTER)
	postMessage(['cols', cols])
	// console.log('pat ids',patientIDs(LIST.typings))
	// console.log(grid, rows, cols)
	// $(`#filter #rows .help`).innerHTML = `removed ${rows.dropped}/${total.rows} rows that had less than ${rows.cutoffValue}/${rows.maxEntries} values`
	// $(`#filter #cols .help`).innerHTML = `removed ${cols.dropped}/${total.cols} columns that had less than ${cols.cutoffValue}/${cols.maxEntries} values`
}

// export function filter(DATA, FILTER) {
// 	let STATS = {}
// 	STATS.typings = typingFilter(DATA.typings, FILTER)
// 	STATS.locations = locationFilter(DATA.locations, FILTER)
// 	STATS.patientIntersection = patientIntersectionFilter(DATA)
// 	STATS.otherStats = otherStats(DATA)
// 	return STATS
// }


// function otherStats(DATA) {
// 	let stats = {}
// 	for (let x of ['cgmlst', 'locations'])
// 		stats[x] = {
// 			IDs: Object.keys(DATA[x]).length,
// 			patientIDs: patientIDs(DATA[x]).length,
// 			recordsPerPatient: (Object.keys(DATA[x]).length / patientIDs(DATA[x]).length).toFixed(2) * 1
// 		}
// 	return stats
// }



// export function typingFilter(DATA, FILTER) {
// 	let STATS = {}
// 	STATS.date = typeDateFilter(DATA, FILTER)
// 	STATS.grid = gridStats(DATA)
// 	STATS.rows = rowFilter(DATA, STATS.grid, FILTER)
// 	STATS.columns = colFilter(DATA, STATS.grid, FILTER)
// 	return STATS
// }



export function typeDateFilter(DATA, FILTER) {
	let stats = { from: 0, till: 0 }
	for (let id in DATA) {
		if (DATA[id].typingDate < FILTER.from) {
			delete DATA[id]
			stats.from++
			continue
		}
		if (DATA[id].typingDate > FILTER.till) {
			delete DATA[id]
			stats.till++
		}
	}
	return stats
}

export function locationDateFilter(DATA, FILTER) {
	let stats = { from: 0, till: 0 }
	for (let id in DATA) {
		if (DATA[id].till < FILTER.from) {
			delete DATA[id]
			stats.from++
			continue
		}
		if (DATA[id].from > FILTER.till) {
			delete DATA[id]
			stats.till++
		}
	}
	return stats
}







export function gridStats(DATA) {
	let stat = { rows: {}, cols: {} }
	for (let row in DATA) {
		stat.rows[row] ??= { count: 0 }
		for (let col in DATA[row]) {
			if (col == 'patientID') continue
			if (col == 'typingDate') continue
			stat.cols[col] ??= { count: 0, distinctValues: new Set() }
			if (!DATA[row][col]) continue
			stat.rows[row].count++
			stat.cols[col].count++
			stat.cols[col].distinctValues.add(DATA[row][col])
		}
		// if (row == '71438935') {
		// 	console.log('row stat', stat.rows[row])
		// }
	}
	for (let col in stat.cols)
		stat.cols[col].distinctValues = stat.cols[col].distinctValues.size
	return stat
}

export function rowFilter(DATA, STAT, FILTER) {
	// let items = { before: Object.values(DATA).length, dropped: 0 }
	let dropped = 0
	let maxEntries = Object.values(Object.values(DATA)[0]).length
	let cutoffPercentage = FILTER.requiredRowCompleteness * 1
	let cutoffValue = Math.round(maxEntries * cutoffPercentage / 100)
	// console.log('\nrowFilter...items:', items, 'max entries: ', maxEntries, 'cutoff: ', cutoffValue)

	for (let id in STAT) {
		if (STAT[id].count < cutoffValue) {
			// console.log('delete row', id, STAT.rows[id].count, '<', cutoffValue)
			delete DATA[id]
			dropped++
		}
	}
	// items.after = items.before - items.dropped
	return { cutoffPercentage, maxEntries, cutoffValue, dropped, stats: STAT }
}



export function colFilter(DATA, STAT, FILTER) {
	// let items = { before: Object.values(Object.values(DATA)[0]).length, dropped: 0 }
	let dropped = 0
	let maxEntries = Object.values(DATA).length
	let cutoffPercentage = FILTER.requiredColumnCompleteness * 1
	let cutoffValue = Math.round(maxEntries * cutoffPercentage / 100)
	// console.log('\ncolFilter...items:', items, 'max entries: ', maxEntries, 'cutoff: ', cutoffValue)

	for (let col in STAT) {
		if (STAT[col].count < cutoffValue) {
			// console.log('delete column', col, STAT.cols[col].count, '<', cutoffValue)
			for (let row in DATA)
				delete DATA[row][col]
			dropped++
		}
	}
	// items.after = items.before - items.dropped
	return { cutoffPercentage, maxEntries, cutoffValue, dropped, stats: STAT }
	// return { items, maxEntries, cutoffValue, cutoffPercentage }
}






function patientsWithGoodLocationData(DATA) { // == patients that have at least one room-entry
	let goodPIDs = []
	for (let id in DATA) {
		if (DATA[id].room)
			goodPIDs.push(DATA[id].patientID)
	}
	return unique(goodPIDs)
}

function keepOnlyGoodLocations(DATA, goodPIDs) {
	let dropped = 0
	for (let id in DATA)
		if (!goodPIDs.includes(DATA[id].patientID)) {
			delete DATA[id]
			dropped++
		}
	return dropped
}
export function roomFilter(DATA) {
	let goodLocationPIDs = patientsWithGoodLocationData(DATA)
	return keepOnlyGoodLocations(DATA, goodLocationPIDs)
}


export function locationFilter(DATA, FILTER) {
	let STATS = {}
	STATS.date = locationDateFilter(DATA, FILTER)
	let goodLocationPIDs = patientsWithGoodLocationData(DATA)
	STATS.good = keepOnlyGoodLocations(DATA, goodLocationPIDs)
	return STATS
}



export const patientIDs = DATA => unique(Object.values(DATA).map(x => x.patientID))

export function patientIntersectionFilter(DATA) {
	// console.log('intersection',JSON.stringify(DATA.typings))
	let typingPatientIDs = patientIDs(DATA.typings)
	let locationPatientIDs = patientIDs(DATA.locations)
	let IS = intersection(typingPatientIDs, locationPatientIDs)
	// console.log('intersection filter', cgmlstPatientIDs.length, locationPatientIDs.length, IS.length)
	for (let x of ['typings', 'locations'])
		for (let id in DATA[x])
			if (!IS.includes(DATA[x][id].patientID))
				delete DATA[x][id]

	return {
		typings: typingPatientIDs.length - patientIDs(DATA.typings).length,
		locations: locationPatientIDs.length - patientIDs(DATA.locations).length,
	}
}