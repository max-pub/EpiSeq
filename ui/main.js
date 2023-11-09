import { $, $$, download, getCorrelationSettings, getFilterSettings } from './dom.js'
// import { unique } from '../lib/deps.js'
import { TALI, template } from '../lib/deps.js'
import { showCorrelationChart, showLocationChart, showTypeChart } from './chart.js'
// import * as clear from './clear.js'

import * as FLOW from './flow.js'
import { diagonalX } from '../lib/matrix.js'

export let DATA = {
	// source: {},
	parsed: {},
	filtered: {},
	filterStats: {},
	pseudonymizationStats: {},
	distanceMatrix: {},
	correlation: {},
	// LIST: {}, DIST: {}, CORR: {}, STAT: {}, PSEUDO: {}, 
	filterStats: {}
}
let TIMER = {}

export const TEMPLATE = Object.fromEntries(await Promise.all(['stat_list', 'stat_dist'].map(async x => [x, template(await fetch(`./templates/${x}.html`).then(x => x.text()))])))

export const WORKER = Object.fromEntries(['input', 'matrix_typings', 'matrix_locations', 'filter', 'pseudonymize', 'correlation'].map(worker => [worker, new Worker(`./workers/${worker}.js`, { type: "module" })]))


for (let name in WORKER)
	WORKER[name].onmessage = event => {
		// console.log("RESPONSE", name, event.data[0])
		FLOW[name][event.data[0]]?.(...event.data.slice(1))
	}




export function startFilter() {
	// console.log('start filter', DATA.parsed)
	// $('#filter').innerHTML = ''
	// $('#filter-state').innerHTML = ''
	// $$('#filter .help').map(x => x.innerHTML = '')
	WORKER.filter.postMessage([DATA.parsed, getFilterSettings()])
}









export function showCorrelationTables() {
	let tables = TALI.grid.stringify(DATA.correlation, { flip: true, format: 'html', caption: true })
	tables = tables.replaceAll('<table>', '<div class="wrap"><table>').replaceAll('</table>', `</table><a class='remove'>remove</a> </div>`)
	$('#correlationTables').innerHTML = tables
	$$(`#correlationTables a.remove`).map(a => a.addEventListener('click', e => removeCorrelation(e)))
}

export function removeCorrelation(event) {
	let caption = event.target.closest('div').querySelector('caption')
	let id = caption.textContent
	console.log('remove', id)
	delete DATA.correlation[id]
	showCorrelationTables()
	showCorrelationChart()
}


export function cleanNumbers(data) {
	let out = {}
	for (let table in data) {
		out[table] ??= {}
		for (let row in data[table]) {
			out[table][row] ??= {}
			for (let col in data[table][row]) {
				out[table][row][col] = null
				if (![undefined, null, 'xxx'].includes(data[table][row][col]))
					out[table][row][col] = data[table][row][col].toFixed(2)
			}
		}
	}
	for (let cl in out)
		diagonalX(out[cl])
	return out
}




// let getCorrelationID = () => Object.entries(getCorrelationSettings()).map(x => `${x[0]}_${x[1]}`).join('__')


// function showEntriesAndPatients(grid) {
// 	let entries = Object.keys(grid).length
// 	let patients = unique(Object.values(grid).map(x => x.patientID)).length
// 	return `${patients} patients (${entries} entries)`
// }

// function getAllPatientAndEntryCounts(list) {
// 	return {
// 		typings: getPatientAndEntryCounts(list.typings),
// 		locations: getPatientAndEntryCounts(list.locations),
// 	}
// }
// function getPatientAndEntryCounts(list) {
// 	return {
// 		patients: unique(Object.values(list).map(x => x.patientID)).length,
// 		entries: Object.keys(list).length
// 	}
// }



// import { templates } from '../templates/mod.js'
// import { workers } from '../workers/mod.js'
// let workers = {}
// for (let worker of ['matrix_typings', 'matrix_locations', 'filter', 'pseudonymize', 'correlation'])
// 	workers[worker] = new Worker(`./workers/${worker}.js`, { type: "module" })



// export function start() {
// 	console.log('start', DATA.source)
// 	for (let type of TYPES) {
// 		// if (!DATA.source[type]) return // input data not yet fully available
// 		// $(`#source .paths .${type}`).innerHTML = DATA.source[type].url.toString()
// 	}
// 	console.log('start parsing', DATA.source)
// 	for (let type of TYPES)
// 		WORKER.io.postMessage(['parse', type, DATA.source[type]])
// 	// show('#source .output')
// 	// for (let type of types) { // parse TSV
// 	// 	// let bytes = DATA.filtered[x].length
// 	// 	// let mb = (bytes / 1024 / 1024).toFixed(1)
// 	// 	DATA.parse[type] = parseTSV(DATA.source[type].text)
// 	// 	// console.log(x, DATA.filtered[x])
// 	// 	// $(`#source .output #${x} .help`).innerHTML = showEntriesAndPatients(DATA.filtered[x]) + `, ${mb} MB`
// 	// }
// 	// $('#source').innerHTML = `<legend>source data</legend>` + TEMPLATE.stat_list(getAllPatientAndEntryCounts(DATA.parsed))
// 	// $('#source .output').innerHTML = `<hr/>` + TEMPLATE.stat_list(getAllPatientAndEntryCounts(DATA.parsed))
// 	// startFilter()
// }


// const workers = Object.fromEntries(['matrix_typings', 'matrix_locations', 'filter', 'pseudonymize', 'correlation'].map(worker => [worker, new Worker(`./workers/${worker}.js`, { type: "module" })]))
// const templates = Object.fromEntries(await Promise.all(['stat_list'].map(async x => [x, template(await fetch(`./templates/${x}.html`).then(x => x.text()))])))


// import { locationListStats } from '../lib/stats.js'
// import { rowsAndCols } from '../lib/matrix.js'
// import {  download } from './io.js'

// import { typeDateFilter, locationDateFilter } from '../workers/filter.js'
