
import { intersection, unique } from './deps.js'

onmessage = event => {
	let [LIST, FILTER] = event.data
	// console.log('hello from FILTER::', LIST, FILTER)
	filterAll(LIST, FILTER)
}

function filterAll(LIST, FILTER) {
	// let FILTER = getFilterSettings()
	console.log('FILTER', FILTER)
	dateFilter(LIST, FILTER)
	completenessFilter(LIST, FILTER)
	if (FILTER.hasRoom) {
		let dropped = roomFilter(LIST.locations)
		postMessage(['hasRoom', dropped])
		// $(`#filter #hasRoom .help`).innerHTML = `removed ${dropped} locations`
	}
	let dropped = patientIntersectionFilter(LIST)
	postMessage(['matchingPatients', dropped])
	// console.log('matchingPatients',dropped)

	postMessage(['result', LIST])
	// $(`#filter #matchingPatients .help`).innerHTML = `removed ${dropped.cgmlst} typings and ${dropped.locations} locations`
}
function dateFilter(LIST, FILTER) {
	let a = typeDateFilter(LIST.cgmlst, FILTER)
	let b = locationDateFilter(LIST.locations, FILTER)
	postMessage(['from', [a.from, b.from]])
	postMessage(['till', [a.till, b.till]])
}
function completenessFilter(LIST, FILTER) {
	// let total = { rows: Object.values(LIST.cgmlst).length, cols: Object.values(Object.values(LIST.cgmlst)[0]).length }
	let grid = gridStats(LIST.cgmlst)
	postMessage(['grid', grid])
	let rows = rowFilter(LIST.cgmlst, grid, FILTER)
	postMessage(['rows', rows])
	// console.log('rows',rows)
	let cols = colFilter(LIST.cgmlst, grid, FILTER)
	postMessage(['cols', cols])
	// console.log(grid, rows, cols)
	// $(`#filter #rows .help`).innerHTML = `removed ${rows.dropped}/${total.rows} rows that had less than ${rows.cutoffValue}/${rows.maxEntries} values`
	// $(`#filter #cols .help`).innerHTML = `removed ${cols.dropped}/${total.cols} columns that had less than ${cols.cutoffValue}/${cols.maxEntries} values`
}

// export function filter(DATA, FILTER) {
// 	let STATS = {}
// 	STATS.cgmlst = typingFilter(DATA.cgmlst, FILTER)
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
		for (let col in DATA[row]) {
			if (col == 'patientID') continue
			if (col == 'typingDate') continue
			if (!DATA[row][col]) continue
			stat.rows[row] ??= { count: 0 }
			stat.rows[row].count++
			stat.cols[col] ??= { count: 0 }
			stat.cols[col].count++
		}
	}
	return stat
}

export function rowFilter(DATA, STAT, FILTER) {
	// let items = { before: Object.values(DATA).length, dropped: 0 }
	let dropped = 0
	let maxEntries = Object.values(Object.values(DATA)[0]).length
	let cutoffPercentage = FILTER.requiredRowCompleteness * 1
	let cutoffValue = Math.round(maxEntries * cutoffPercentage / 100)
	// console.log('\nrowFilter...items:', items, 'max entries: ', maxEntries, 'cutoff: ', cutoffValue)

	for (let id in STAT.rows) {
		if (STAT.rows[id].count < cutoffValue) {
			// console.log('delete row', id, STAT.rows[id].count, '<', cutoffValue)
			delete DATA[id]
			dropped++
		}
	}
	// items.after = items.before - items.dropped
	return { cutoffPercentage, maxEntries, cutoffValue, dropped }
}



export function colFilter(DATA, STAT, FILTER) {
	// let items = { before: Object.values(Object.values(DATA)[0]).length, dropped: 0 }
	let dropped = 0
	let maxEntries = Object.values(DATA).length
	let cutoffPercentage = FILTER.requiredColumnCompleteness * 1
	let cutoffValue = Math.round(maxEntries * cutoffPercentage / 100)
	// console.log('\ncolFilter...items:', items, 'max entries: ', maxEntries, 'cutoff: ', cutoffValue)

	for (let col in STAT.cols) {
		if (STAT.cols[col].count < cutoffValue) {
			// console.log('delete column', col, STAT.cols[col].count, '<', cutoffValue)
			for (let row in DATA)
				delete DATA[row][col]
			dropped++
		}
	}
	// items.after = items.before - items.dropped
	return { cutoffPercentage, maxEntries, cutoffValue, dropped }
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
	let cgmlstPatientIDs = patientIDs(DATA.cgmlst)
	let locationPatientIDs = patientIDs(DATA.locations)
	let IS = intersection(cgmlstPatientIDs, locationPatientIDs)
	for (let x of ['cgmlst', 'locations'])
		for (let id in DATA[x])
			if (!IS.includes(DATA[x][id].patientID))
				delete DATA[x][id]

	return {
		cgmlst: cgmlstPatientIDs.length - patientIDs(DATA.cgmlst).length,
		locations: locationPatientIDs.length - patientIDs(DATA.locations).length,
	}
}