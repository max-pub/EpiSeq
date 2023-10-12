import { $, $$ } from './dom.js'
import { parseTSV, download } from './io.js'

import { typeDateFilter, locationDateFilter } from '../workers/filter.js'
import { unique } from '../lib/deps.js'
import { rowsAndCols } from '../lib/matrix.js'

import { TALI, template } from '../lib/deps.js'
import { showCorrelationChart, showLocationChart, showTypeChart } from './chart.js'
import { locationListStats } from '../lib/stats.js'

// import { templates } from '../templates/mod.js'
// import { workers } from '../workers/mod.js'
// let workers = {}
// for (let worker of ['matrix_typings', 'matrix_locations', 'filter', 'pseudonymize', 'correlation'])
// 	workers[worker] = new Worker(`./workers/${worker}.js`, { type: "module" })

const workers = Object.fromEntries(['matrix_typings', 'matrix_locations', 'filter', 'pseudonymize', 'correlation'].map(worker => [worker, new Worker(`./workers/${worker}.js`, { type: "module" })]))
const templates = Object.fromEntries(await Promise.all(['chart_typings', 'chart_locations', 'stat_list'].map(async x => [x, template(await fetch(`./templates/${x}.html`).then(x => x.text()))])))
// console.log('workers', workers)
// console.log('templates', templates)


export let DATA = { SOURCE: {}, LIST: {}, DIST: {}, CORR: {}, STAT: {}, PSEUDO: {} }



export function start() {
	let PARTS = ['typings', 'locations']
	for (let x of PARTS)
		if (!DATA.SOURCE[x]) return // input data not yet fully available

	// show('#source .output')
	for (let x of PARTS) { // parse TSV
		// let bytes = DATA.LIST[x].length
		// let mb = (bytes / 1024 / 1024).toFixed(1)
		DATA.SOURCE[x] = parseTSV(DATA.SOURCE[x])
		// console.log(x, DATA.LIST[x])
		// $(`#source .output #${x} .help`).innerHTML = showEntriesAndPatients(DATA.LIST[x]) + `, ${mb} MB`
	}
	$('#source').innerHTML = `<legend>source data</legend>` + templates.stat_list(getAllPatientAndEntryCounts(DATA.SOURCE))
	startFilter()
}



export function startFilter() {
	console.log('start filter', DATA.SOURCE)
	$('#filter-stats').innerHTML = ''
	$$('#filter .help').map(x => x.innerHTML = '')
	workers.filter.postMessage([DATA.SOURCE, getFilterSettings()])
}



workers.filter.onmessage = event => {
	// console.log('corrrr', getCorrelationSettings())
	// console.log('yeah'); return
	let [action, data] = event.data
	let total = { rows: Object.values(DATA.SOURCE.typings).length, cols: Object.values(Object.values(DATA.SOURCE.typings)[0]).length }
	if (action == 'from')
		$(`#filter #from .help`).innerHTML = `removed ${data[0]} typings and ${data[1]} locations`
	if (action == 'till')
		$(`#filter #till .help`).innerHTML = `removed ${data[0]} typings and ${data[1]} locations`
	if (action == 'rows') {
		$(`#filter #rows .help`).innerHTML = `removed ${data.dropped}/${total.rows} typings that had less than ${data.cutoffValue}/${data.maxEntries} values`
		$('#filter #rows .download').innerHTML = ` <a> download </a>`
		$('#filter #rows .download a').addEventListener('click', () => download(`typing.rows.tsv`, TALI.grid.stringify({ '': data.stats }, { sortCol: 'count', pretty: 4 })))
	}
	if (action == 'cols') {
		$(`#filter #cols .help`).innerHTML = `removed ${data.dropped}/${total.cols} type-columns that had less than ${data.cutoffValue}/${data.maxEntries} values`
		$('#filter #cols .download').innerHTML = ` <a> download </a>`
		$('#filter #cols .download a').addEventListener('click', () => download(`typing.cols.tsv`, TALI.grid.stringify({ '': data.stats }, { sortCol: 'count', pretty: 4 })))
	}
	if (action == 'hasRoom')
		$(`#filter #hasRoom .help`).innerHTML = `removed ${data} locations`
	if (action == 'matchingPatients')
		$(`#filter #matchingPatients .help`).innerHTML = `removed ${data.typings} typings and ${data.locations} locations`

	if (action == 'result') {
		DATA.LIST = data
		$('#filter-stats').innerHTML = `<hr/>` + templates.stat_list(getAllPatientAndEntryCounts(DATA.LIST)) //+ 		`<hr/>` + templates.listStats(getAllPatientAndEntryCounts(DATA.SOURCE))

		// for (let x of PARTS) {
		// $('#filter-stats').innerHTML = `<hr/>` + templates.listStats(getAllPatientAndEntryCounts(DATA.LIST))

		// $(`#filterResults #${x} .help`).innerHTML = showEntriesAndPatients(DATA.LIST[x])
		// show(`#filterResults #${x} a`)
		// }

		if (getFilterSettings().pseudonymize) {// optionally anonymize all data
			$('#filter #pseudonymize .help').innerHTML = `<progress value="0" max="100"> </progress>`
			workers.pseudonymize.postMessage(DATA.LIST)
		} else calculateDistanceMatrices()
	}
}



workers.pseudonymize.onmessage = event => {
	let [action, data] = event.data
	if (action == 'progress') {
		let [current, total] = data
		$(`#filter #pseudonymize progress`).value = current
		$(`#filter #pseudonymize progress`).max = total
	}
	if (action == 'result') {
		// console.log('pseudo', 'done', data)
		DATA.LIST = data[0]
		DATA.PSEUDO = data[1]
		$('#filter #pseudonymize .download').innerHTML = ` <a> download </a>`
		$('#filter #pseudonymize .download a').addEventListener('click', () => download(`pseudonym.mapping.tsv`, TALI.grid.stringify(DATA.PSEUDO, { sortCol: 'count', pretty: 4 })))
		calculateDistanceMatrices()
		// $(`#distance #${name} [hidden]`).hidden = false
	}
}



function calculateDistanceMatrices() {
	console.log('calculateDistanceMatrices')
	$('#location-chart').innerHTML = templates.chart_locations()
	$$('#location-chart a.chart').map(node => node.addEventListener('click', event => showLocationChart(event.target.textContent.trim())))
	console.log('links', $$('#location-chart a.chart'))
	showLocationChart()
	DATA.DIST = {}
	console.log('start matrix workers')
	workers.matrix_typings.postMessage(DATA.LIST.typings)
	workers.matrix_locations.postMessage(DATA.LIST.locations)
	console.log('done matrix workers')
}



['typings', 'locations'].map(name => {
	console.log('worker', workers['matrix_' + name])
	workers['matrix_' + name].onmessage = event => {
		// console.log('worker message', name)
		let [action, data] = event.data
		if (action == 'progress') {
			let [current, total] = data
			$(`#distance #${name} progress`).value = current
			$(`#distance #${name} progress`).max = total
			// $(`#distance #${name} .current`).innerText = current
			// $(`#distance #${name} .total`).innerText = total
		}
		if (action == 'result') {
			// if (name == 'cgmlst')
			// rowsAndCols(data, 'dist')
			// console.log(name, 'done', data)
			DATA.DIST[name] = data
			// show(`#distance #${name} [hidden]`)
			startCorrelation()
			// if (name == 'cgmlst')
		}
	}
})



export function startCorrelation() {
	if (!(DATA.DIST.typings && DATA.DIST.locations)) return
	$('#distance-chart').innerHTML = templates.chart_typings()
	$$('#distance-chart a.chart').map(x => x.addEventListener('click', event => showTypeChart(event.target.id)))

	showTypeChart(100)
	console.log('start correlation', DATA, getCorrelationSettings())
	// DATA.CORR = {}
	workers.correlation.postMessage([DATA.LIST, DATA.DIST, getCorrelationSettings()])
}



workers.correlation.onmessage = event => {
	let [action, data] = event.data
	if (action == 'TI')
		$(`#correlation #ti .help`).innerHTML = `removed ${data.dropped} sequence-pairs`
	if (action == 'TD')
		$(`#correlation #td .help`).innerHTML = `removed ${data.dropped} sequence-pairs`
	if (action == 'CL')
		$(`#correlation #cl .help`).innerHTML = `${data.count} locations-pairs`
	if (action == 'CI')
		$(`#correlation #ci .help`).innerHTML = `removed ${data.dropped} locations-pairs`
	if (action == 'CD')
		$(`#correlation #cd .help`).innerHTML = `not yet implemented`

	if (action == 'cgmlst') {
		// DATA.CORR.typings = data.typings
		// console.log('correlation', DATA)
		// console.log('cor mro', DATA.CORR.typings)
		// rowsAndCols(DATA.CORR.typings, 'corr')
		show(`#correlationResult #typings [hidden]`)
		$(`#correlationResult #typings .count`).innerHTML = `${data.count} pairs`
	}
	if (action == 'location') {
		// DATA.CORR.location = data.location
		show(`#correlationResult #locations [hidden]`)
		$(`#correlationResult #locations .count`).innerHTML = `${data.count} pairs`
	}
	if (action == 'correlate') {
		// console.log('correlate22', data)
		DATA.CORR[getCorrelationString()] = data
		// for(let dist in data)
		// data[dist].percentage = data[dist].percentage.toFixed(1) + '%'
		showCorrelationTables()
		showCorrelationChart()
	}
}
function showCorrelationTables() {
	let tables = TALI.grid.stringify(DATA.CORR, { flip: true, format: 'html', caption: true })
	tables = tables.replaceAll('<table>', '<div><table>').replaceAll('</table>', `</table><a class='remove'>remove</a> </div>`)
	$('#correlationTables').innerHTML = tables
	$$(`#correlationTables a.remove`).map(a => a.addEventListener('click', e => removeCorrelation(e)))
}

function removeCorrelation(event) {
	let caption = event.target.closest('div').querySelector('caption')
	let id = caption.textContent
	console.log('remove', id)
	delete DATA.CORR[id]
	showCorrelationTables()
	showCorrelationChart()
}

function show(path) {
	try {
		$(path).hidden = false
	} catch { }
}







function getFilterSettings() {
	return {
		from: $('#filter #from input').value,
		till: $('#filter #till input').value,
		requiredRowCompleteness: $('#filter #rows input').value * 1,
		requiredColumnCompleteness: $('#filter #cols input').value * 1,
		hasRoom: $('#filter #hasRoom input').checked,
		pseudonymize: $('#filter #pseudonymize input').checked,
	}
}
function getCorrelationSettings() {
	// $$('#correlation select, #correlation input')
	return {
		TD: $('#correlation #td input').value * 1,
		TI: $('#correlation #ti input').value * 1,
		CL: $('#correlation #cl select').value,
		CI: $('#correlation #ci input').value * 1,
		CD: $('#correlation #cd input').value * 1,
	}
}
function getCorrelationString() {
	let x = getCorrelationSettings()
	return Object.entries(getCorrelationSettings()).filter(x => x[0] != 'TD').map(x => `${x[0]} = ${x[1]}`).join('     ')
}
// let getCorrelationID = () => Object.entries(getCorrelationSettings()).map(x => `${x[0]}_${x[1]}`).join('__')


// function showEntriesAndPatients(grid) {
// 	let entries = Object.keys(grid).length
// 	let patients = unique(Object.values(grid).map(x => x.patientID)).length
// 	return `${patients} patients (${entries} entries)`
// }

function getAllPatientAndEntryCounts(list) {
	return {
		typings: getPatientAndEntryCounts(list.typings),
		locations: getPatientAndEntryCounts(list.locations),
	}
}
function getPatientAndEntryCounts(list) {
	return {
		patients: unique(Object.values(list).map(x => x.patientID)).length,
		entries: Object.keys(list).length
	}
}
