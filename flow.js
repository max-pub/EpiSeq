import { $, $$, download } from './helper.js'
import { parseTSV } from './lib/fs.js'

import { typeDateFilter, locationDateFilter } from './lib/filter.js'
import { unique } from './lib/deps.js'
import { rowsAndCols } from './lib/matrix.js'

import { TALI } from './lib/deps.js'
import { showCorrelationChart } from './chart.js'


const worker = {
	filter: new Worker("./lib/filter.js", { type: "module" }),
	pseudonymize: new Worker("./lib/pseudonymize.js", { type: "module" }),
	correlation: new Worker("./lib/correlation.js", { type: "module" })
}
const distanceWorker = {
	cgmlst: new Worker("./lib/typings.matrix.js", { type: "module" }),
	locations: new Worker("./lib/locations.matrix.js", { type: "module" })
}

export let DATA = { LIST: {}, DIST: {}, CORR: {}, PSEUDO: {} }
let PARTS = ['cgmlst', 'locations']

export function start() {
	for (let x of PARTS)
		if (!DATA.LIST[x]) return // input data not yet fully available

	for (let x of PARTS) { // parse TSV
		let bytes = DATA.LIST[x].length
		let mb = (bytes / 1024 / 1024).toFixed(1)
		DATA.LIST[x] = parseTSV(DATA.LIST[x])
		// console.log(x, DATA.LIST[x])
		$(`#source #${x} .help`).innerHTML = showEntriesAndPatients(DATA.LIST[x])
	}
	console.log('start filter', DATA.LIST)
	worker.filter.postMessage([DATA.LIST, getFilterSettings()])
}



worker.filter.onmessage = event => {
	// console.log('corrrr', getCorrelationSettings())
	// console.log('yeah'); return
	let [action, data] = event.data
	let total = { rows: Object.values(DATA.LIST.cgmlst).length, cols: Object.values(Object.values(DATA.LIST.cgmlst)[0]).length }
	if (action == 'from')
		$(`#filter #from .help`).innerHTML = `removed ${data[0]} typings and ${data[1]} locations`
	if (action == 'till')
		$(`#filter #till .help`).innerHTML = `removed ${data[0]} typings and ${data[1]} locations`
	if (action == 'rows')
		$(`#filter #rows .help`).innerHTML = `removed ${data.dropped}/${total.rows} rows that had less than ${data.cutoffValue}/${data.maxEntries} values`
	if (action == 'cols')
		$(`#filter #cols .help`).innerHTML = `removed ${data.dropped}/${total.cols} columns that had less than ${data.cutoffValue}/${data.maxEntries} values`
	if (action == 'hasRoom')
		$(`#filter #hasRoom .help`).innerHTML = `removed ${data} locations`
	if (action == 'matchingPatients')
		$(`#filter #matchingPatients .help`).innerHTML = `removed ${data.cgmlst} typings and ${data.locations} locations`

	if (action == 'result') {
		DATA.LIST = data
		for (let x of PARTS) {
			$(`#filterResults #${x} .help`).innerHTML = showEntriesAndPatients(DATA.LIST[x])
			show(`#filterResults #${x} a`)
		}

		if (getFilterSettings().pseudonymize) {// optionally anonymize all data
			$('#filter #pseudonymize .help').innerHTML = `<progress value="0" max="100"> </progress>`
			worker.pseudonymize.postMessage(DATA.LIST)
		} else calculateDistanceMatrices()
	}
}
worker.pseudonymize.onmessage = event => {
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
		$('#filter #pseudonymize .help').innerHTML += ` <a> download mapping </a>`
		$('#filter #pseudonymize .help a').addEventListener('click', () => download(`pseudonym.map.tsv`, TALI.grid.stringify(DATA.PSEUDO, { sortCol: 'count', pretty: 4 })))
		calculateDistanceMatrices()
		// $(`#distance #${name} [hidden]`).hidden = false
	}
}

function calculateDistanceMatrices() {
	DATA.DIST = {}
	distanceWorker.cgmlst.postMessage(DATA.LIST.cgmlst)
	distanceWorker.locations.postMessage(DATA.LIST.locations)
}

Object.entries(distanceWorker).map(([name, worker]) =>
	worker.onmessage = event => {
		let [action, data] = event.data
		if (action == 'progress') {
			let [current, total] = data
			$(`#distance #${name} progress`).value = current
			$(`#distance #${name} progress`).max = total
			$(`#distance #${name} .current`).innerText = current
			$(`#distance #${name} .total`).innerText = total
		}
		if (action == 'result') {
			if (name == 'cgmlst')
				rowsAndCols(data, 'dist')
			// console.log(name, 'done', data)
			DATA.DIST[name] = data
			show(`#distance #${name} [hidden]`)
			startCorrelation()
		}
	}
)
export function startCorrelation() {
	console.log('start correlation', DATA, getCorrelationSettings())
	// DATA.CORR = {}
	if (DATA.DIST.cgmlst && DATA.DIST.locations)
		worker.correlation.postMessage([DATA.LIST, DATA.DIST, getCorrelationSettings()])
}
worker.correlation.onmessage = event => {
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
		// DATA.CORR.cgmlst = data.cgmlst
		// console.log('correlation', DATA)
		// console.log('cor mro', DATA.CORR.cgmlst)
		// rowsAndCols(DATA.CORR.cgmlst, 'corr')
		show(`#correlationResult #cgmlst [hidden]`)
		$(`#correlationResult #cgmlst .count`).innerHTML = `${data.count} pairs`
	}
	if (action == 'location') {
		// DATA.CORR.location = data.location
		show(`#correlationResult #locations [hidden]`)
		$(`#correlationResult #locations .count`).innerHTML = `${data.count} pairs`
	}
	if (action == 'correlate') {
		console.log('correlate22', data)
		DATA.CORR[getCorrelationString()] = data
		// for(let dist in data)
		// data[dist].percentage = data[dist].percentage.toFixed(1) + '%'
		$('#correlationTables').innerHTML = TALI.grid.stringify(DATA.CORR, { flip: true, format: 'html', caption: true })
		showCorrelationChart(DATA.CORR)
	}
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
		TI: $('#correlation #ti input').value * 1,
		TD: $('#correlation #td input').value * 1,
		CL: $('#correlation #cl select').value,
		CI: $('#correlation #ci input').value * 1,
		CD: $('#correlation #cd input').value * 1,
	}
}
function getCorrelationString() {
	let x = getCorrelationSettings()
	return Object.entries(x).map(x => `${x[0]} = ${x[1]}`).join('     ')
}
function showEntriesAndPatients(grid) {
	let entries = Object.keys(grid).length
	let patients = unique(Object.values(grid).map(x => x.patientID)).length
	return `${entries} entries, ${patients} patients`
}


