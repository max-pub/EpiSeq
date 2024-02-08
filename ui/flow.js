import { TALI } from "../lib/deps.js"
import { showLocationChart, showCorrelationChart, showTypeChart } from "./chart.js"
import { $, $$, download } from "./dom.js"
import { DATA, STATS, TEMPLATE, WORKER, cleanNumbers, clear, updateState } from "./main.js"
import * as FORM from './forms.js'
// import { clear, updateState } from "./forms.js"
// let TIMER = {}

const AUTO = true

function DEBUG() {
	// return false
	return true
	return document.location.hash.includes('hyms')
}

class Base {
	// &darr; &bull; &check;
	_downloads = []

	find(path) {
		return document.querySelector('#' + this.base).querySelector(path)
	}
	list() {
		return this.find('ul.info')
	}
	table() {
		return this.find('table.info')
	}
	addTR(clas = '', ...tds) {
		this.table().innerHTML += `<tr class='${clas}'> ${tds.map(x => `<td>${x}</td>`).join(' ')} </tr>`
	}
	addLI(clas = '', x) {
		this.list().innerHTML += `<li class='${clas}'>${x}</li>`
	}

	progress(x, max) {
		let p = this.find('progress')
		// console.log('progress',p)
		if (max) {
			// if (x % 100 == 0)
			// console.log('update progress', x, max)
			p.value = x * 1
			p.max = max * 1
		} else {
			p.hidden = !x
		}
	}
	addDone(text, time) {
		this.find('.done').innerHTML += `<div>&check; <span>${text}</span> <span class='milliseconds'>(${(time)} ms)</span></div>`
	}
	addDownload(key, text, a = { tsv: '', json: '' }, info = '') {
		this.find('.downloads').innerHTML += `<div class='${key}'>&darr; download <b>${text}</b> as ${Object.keys(a).map(x => `<a class='passive ${x}'>${x}</a>`).join(' or ')} <info>${info}</info> </div>`
		for (let x in a)
			// this._downloads.push([this.find(`.downloads .${key} a.${x}`), a[x]])
			this._downloads.push([`.downloads .${key} a.${x}`, a[x]])
		// setTimeout(() => {
		// 	for (let x in a) {
		// 		console.log('down', key, this.find(`.downloads .${key}`), this.find(`.downloads .${key} a.${x}`), a[x])
		// 		this.find(`.downloads .${key} a.${x}`).addEventListener('click', a[x])
		// 		this.find(`.downloads .${key} a.${x}`).classList.add('active')
		// 	}
		// }, 100)

	}
	activateDownloads() {
		// setTimeout(() => {
		while (this._downloads.length) {
			let x = this._downloads.pop()
			// console.log('activate', x)
			this.find(x[0]).addEventListener('click', x[1])
			// this.find(x[0]).classList.add('active')
			this.find(x[0]).classList.remove('passive')
		}
		// }, 500)
	}

	milliseconds(html = false) {
		let diff = Date.now() - this.t0
		this.t0 = Date.now()
		return html ? `<span class='milliseconds'>(${diff} ms)</span>` : diff
	}
	seconds(decimals = 1) {
		return (this.milliseconds() / 1000).toFixed(decimals)
	}
}


export const source = new class extends Base {
	base = 'source'
	started(key, name) {
		// FORM.filter.clear()
		// this.t0 = Date.now()
		// console.log('source started', key, name, this.find('progress'))
		// this.find('progress').hidden = false
		this.progress(true)
	}
	parsed(key, name, time) {
		this.addDone(`parsed ${key}`, time)
		if (Object.keys(DATA.source).length == 2) {
			// startFilter()
			updateState()
			if (AUTO) source_filter.run()
			this.progress(false)
			// this.find('progress').hidden = true

			// if (DEBUG())
			this.activateDownloads()
			// for (let key in DATA.source) {
			// 	this.addDownload(key,
			// 		`${key} list`,
			// 		{
			// 			tsv: () => download(`${key}.tsv`, TALI.grid.stringify({ [key]: DATA.source[key] }, { sortRows: true }))
			// 		},
			// 		// `(${data.entries} entries from ${data.patients} patients)`
			// 	)
			// }
			// this.count = 0
			// for (let key of ['typings', 'locations'])
			// $(`#source .stats .${key} a`).addEventListener('click', () => download(`${key}.tsv`, TALI.grid.stringify({ [key]: DATA.parsed[key] }, { sortRows: true })))

			// setTimeout(()=>$('#source .parse').innerHTML='',1000)
		}
	}
	runDemo(mro) {
		clear(0)
		console.log('loadDemo', mro)
		// console.log('demo url', window.location.href + `demo/${mro}/cgmlst.tsv`)
		// clear.input()
		// console.log('next',WORKER.input)
		let mroNames = { coli: 'MDR E.coli', mrsa: 'MRSA', vre: 'VRE' }
		WORKER.source.postMessage(['url', 'typings', window.location.href + `demo/${mro}/cgmlst.tsv`])
		WORKER.source.postMessage(['url', 'locations', window.location.href + `demo/${mro}/locations.tsv`])
		FORM.source.find('.title input').value = mroNames[mro]
	}

	run(event) {
		event?.preventDefault?.()
		clear(0)
		let data = FORM[this.base].data()
		WORKER.source.postMessage(['file', 'typings', data.typings])
		WORKER.source.postMessage(['file', 'locations', data.locations])
		FORM[this.base].reset()
	}

	loaded(key, name, time) {
		// console.log('add', key, name)
		// $(`#source>ul`).innerHTML += `<li class="${key} loading">loading ${key}... </li>`
		// $(`#source .done`).innerHTML += `<span class='milliseconds'>(${(size / 1024).toFixed(0)} KB)</span>`
		this.addDone(`loaded ${key}`, time)
	}
	// keys(count) {
	// 	if (count == 2)
	// 		$$('#source form').map(form => form.reset())
	// }
	// size(key, name, size) {
	// 	$(`#source>ul .${key}.loading`).innerHTML += `<span class='milliseconds'>(${(size / 1024).toFixed(0)} KB)</span>`
	// 	$(`#source>ul`).innerHTML += `<li class="${key} parsing">parsing ${key}... </li>`
	// }
	// time(key, name, time) {

	// 	// $(`#source>ul .${key}.parsing`).innerHTML += `${(time / 1000).toFixed(1)} seconds`
	// 	$(`#source>ul .${key}.parsing`).innerHTML += `<span class='milliseconds'>(${(time)} ms)</span>`
	// }
	data(key, name, data) {
		DATA.source[key] = data
		// if (Object.keys(DATA.source).length == 2) {
		// 	// startFilter()
		// 	updateState()
		// 	if (AUTO) source_filter.run()
		// 	// this.count = 0
		// 	// for (let key of ['typings', 'locations'])
		// 	// $(`#source .stats .${key} a`).addEventListener('click', () => download(`${key}.tsv`, TALI.grid.stringify({ [key]: DATA.parsed[key] }, { sortRows: true })))

		// 	// setTimeout(()=>$('#source .parse').innerHTML='',1000)
		// }
		// WORKER.filter.postMessage([DATA.parsed, getFilterSettings()])
	}
	stat(key, name, data) {
		// $(`#source>table .${key}`).innerHTML = TEMPLATE.stat_list(key, data)
		// $(`#source>table .${key} a`).addEventListener('click', () => download(`${key}.tsv`, TALI.grid.stringify({ [key]: DATA.source[key] }, { sortRows: true })))
		if (DEBUG())
			this.addDownload(key,
				`${key} list`,
				{
					tsv: () => download(`${key}.tsv`, TALI.grid.stringify({ [key]: DATA.source[key] }, { sortRows: true }))
				},
				`(${data.entries} entries from ${data.patients} patients)`)

		// console.log('stats', data)
		// console.log('download', key, $(`#source .stats .${key} a`))
	}

	// done(){

	// }
}






export const source_filter = new class extends Base {
	base = 'source_filter'
	run(event) {
		event?.preventDefault?.()
		clear(1)
		WORKER[this.base].postMessage([DATA.source, FORM[this.base].data()])
		// $('#filter>ul').innerHTML = ``
		// $('#filter>table').innerHTML = `<tr class='typings'></tr> <tr class='locations'></tr>`
	}
	started() {
		// FORM.filter.clear()
		this.t0 = Date.now()
		this.progress(true)
	}


	from(data) {
		this.addDone(`removed ${data[0]} typings and ${data[1]} locations < ${FORM[this.base].data().from}`, this.milliseconds())
		// this.list().innerHTML += `<li>removed ${data[0]} typings and ${data[1]} locations < ${FORM[this.base].data().from} ${this.milliseconds(1)} </li>`
	}
	till(data) {
		this.addDone(`removed ${data[0]} typings and ${data[1]} locations > ${FORM[this.base].data().till}`, this.milliseconds())
		// this.list().innerHTML += `<li>removed ${data[0]} typings and ${data[1]} locations > ${FORM[this.base].data().till} ${this.milliseconds(1)} </li>`
	}
	rows(data) {
		let rowCount = Object.values(DATA.source.typings).length
		STATS[this.base].rows = data.stats
		this.addDone(`removed ${data.dropped}/${rowCount} sequences that had less than ${data.cutoffPercentage}% = ${data.cutoffValue}/${data.maxEntries} values`, this.milliseconds())
		this.addDownload('rows', `typing sequence statistics`, {
			tsv: () => download(`${FORM.title()}_typing_sequences_stats.tsv`, TALI.grid.stringify({ '': STATS[this.base].rows }, { sortCol: 'count', pretty: 4 }))
		}, `(${Object.keys(STATS[this.base].rows).length} sequences)`)
		// this.find(`.rows a`).addEventListener('click', () => download(`${FORM.title()}_typing_rows.tsv`, TALI.grid.stringify({ '': STATS[this.base].rows }, { sortCol: 'count', pretty: 4 })))
		// this.list().innerHTML += `<li class='rows'>removed ${data.dropped}/${rowCount} typings that had less than ${data.cutoffPercentage}% or ${data.cutoffValue}/${data.maxEntries} values <a class='download'>tsv</a> ${this.milliseconds(1)} </li>`
	}
	cols(data) {
		let columnCount = Object.values(Object.values(DATA.source.typings)[0]).length
		STATS[this.base].cols = data.stats
		this.addDone(`removed ${data.dropped}/${columnCount} loci that had less than ${data.cutoffPercentage}% = ${data.cutoffValue}/${data.maxEntries} values`, this.milliseconds())
		// this.find('.cols a').addEventListener('click', () => download(`${FORM.title()}_typing_columns.tsv`, TALI.grid.stringify({ '': STATS[this.base].cols }, { sortCol: 'count', pretty: 4 })))
		this.addDownload('cols', `typing schema statistics`, {
			tsv: () => download(`${FORM.title()}_typing_schema_stats.tsv`, TALI.grid.stringify({ '': STATS[this.base].cols }, { sortCol: 'count', pretty: 4 }))
		}, `(${Object.keys(STATS[this.base].cols).length} loci)`)
		// this.addDone(``,this.milliseconds())
		// this.list().innerHTML += `<li class='cols'>removed ${data.dropped}/${columnCount} type-columns that had less than ${data.cutoffPercentage}% or ${data.cutoffValue}/${data.maxEntries} values <a class='download'>tsv</a> ${this.milliseconds(1)} </li>`
		// console.log('filter COLS', $('#filter .cols a'))
	}
	hasRoom(data) {
		this.addDone(`removed ${data} locations from patients without room-entries`, this.milliseconds())
		// this.list().innerHTML += `<li>removed ${data} locations from patients without room-entries ${this.milliseconds(1)} </li>`
	}
	matchingPatients(data) {
		this.addDone(`removed ${data.typings} typings and ${data.locations} locations that didnt have corresponding patient-ids`, this.milliseconds())
		// this.list().innerHTML += `<li>removed ${data.typings} typings and ${data.locations} locations that didnt have corresponding patient-ids ${this.milliseconds(1)} </li>`
	}


	result(data) {
		DATA[this.base] = data
		// updateState()
		// if (FORM[this.base].data().pseudonymize) {// optionally anonymize all data
		// updateState()
		// pseudonymize.run()
		// } else {
		// updateState()
		// showLocationChart()
		// if (AUTO) typing_distance.run()
		// }

	}

	stat(data) {
		// console.log('-------stat', data)
		// for (let key in data)
		// console.log("KEYYY", key,)
		// for (let key in data)
		// 	this.addTR(key, key, `${data[key].patients} patients`, `${data[key].entries} entries`, `${(data[key].entries / data[key].patients).toFixed(2)} entries/patient`, `<a>tsv</a>`)
		if (DEBUG())
			for (let key in data)
				this.addDownload(key, `${key} list`, {
					tsv: () => download(`${FORM.title()}_${key}_filtered.tsv`, TALI.grid.stringify({ [key]: DATA[this.base][key] }, { sortRows: true })),
				}, `(${data[key].patients} patients, ${data[key].entries} entries, ${(data[key].entries / data[key].patients).toFixed(2)} entries/patient)`)
		// 	<td> ${type} </td>
		// <td class="patient-count">${x.patients} patients</td>
		// <td class="entry-count">${x.entries} entries</td>
		// <td class="relation">${(x.entries/x.patients).toFixed(2)} entries/patient</td>
		// <td class="download"> <a>tsv</a> </td>
		// for (let key in data)
		// 	this.table().querySelector(`.${key}`).innerHTML = TEMPLATE.stat_list(key, data[key]) //+ 		`<hr/>` + TEMPLATE.listStats(getAllPatientAndEntryCounts(DATA.parsed))
		// for (let key in data)
		// 	this.table().querySelector(`.${key} a`).addEventListener('click', () => download(`${key}.tsv`, TALI.grid.stringify({ [key]: DATA.filter[key] }, { sortRows: true })))

	}

	pseudoMap(data, pseudoMap) {
		// console.log('pseudo-map', data, pseudoMap)
		DATA[this.base] = data
		STATS.pseudonymization = pseudoMap

		this.addDone('pseudonymized all IDs', this.milliseconds())
		this.addDownload('pseudo', 'mapping tables', {
			tsv: () => download(`${FORM.title()}_pseudonym_mapping.tsv`, TALI.grid.stringify(STATS.pseudonymization, { sortCol: 'count', pretty: 4 }))
		}, ``)

	}
	// activateLinks() {
	// 	this.activateDownloads()
	// 	// for (let key in DATA[this.base]) {
	// 	// 	// console.log('activate', key, this.table().querySelector(`.${key} a`))
	// 	// 	this.table().querySelector(`.${key} a`).addEventListener('click', () => download(`${FORM.title()}_${key}_filtered.tsv`, TALI.grid.stringify({ [key]: DATA[this.base][key] }, { sortRows: true })))
	// 	// }
	// 	// this.find(`.rows a`).addEventListener('click', () => download(`${FORM.title()}_typing_rows.tsv`, TALI.grid.stringify({ '': STATS[this.base].rows }, { sortCol: 'count', pretty: 4 })))
	// 	// this.find('.cols a').addEventListener('click', () => download(`${FORM.title()}_typing_columns.tsv`, TALI.grid.stringify({ '': STATS[this.base].cols }, { sortCol: 'count', pretty: 4 })))

	// }
	finished() {
		this.progress(false)
		this.activateDownloads()

		updateState()
		if (AUTO) typing_distance.run()
	}
}







// export const pseudonymize = new class extends Base {
// 	base = 'source_filter'
// 	run() {
// 		WORKER.pseudonymize.postMessage(DATA[this.base])

// 	}
// 	started() {
// 		this.t0 = Date.now()
// 		// this.
// 		// this.addLI('pseudo', `pseudonymizing... <progress value="0" max="100"> </progress>`)
// 		// this.list().innerHTML += `<li class='pseudo'> <progress value="0" max="100"> </progress> </li>`
// 	}

// 	// progress(data) {
// 	// 	let [current, total] = data
// 	// 	this.find(`.pseudo progress`).value = current
// 	// 	this.find(`.pseudo progress`).max = total
// 	// }
// 	result(data) {
// 		DATA[this.base] = data[0]
// 		STATS.pseudonymization = data[1]

// 		this.addDone('pseudonymized all IDs', this.milliseconds())
// 		this.addDownload('pseudo','mapping tables',{
// 			tsv:() => download(`${FORM.title()}_pseudonym_mapping.tsv`, TALI.grid.stringify(STATS.pseudonymization, { sortCol: 'count', pretty: 4 }))
// 		},``)
// 		// this.find(`.pseudo`).innerHTML = `pseudonymized all ids.  <a class='download'> tsv </a> ${this.milliseconds(1)}`
// 		// this.find(`.pseudo .download`).addEventListener('click', () => download(`${FORM.title()}_pseudonym_mapping.tsv`, TALI.grid.stringify(STATS.pseudonymization, { sortCol: 'count', pretty: 4 })))
// 		// distance.run()
// 		updateState()
// 		// showLocationChart()
// 		if (AUTO) typing_distance.run()
// 		// startCrossMatch()
// 	}
// }







export const typing_distance = new class extends Base {
	base = 'typing_distance'
	run(event) {
		event?.preventDefault?.()
		clear(2)
		// console.log('start distance', DATA.source_filter, FORM[this.base].data())
		WORKER[this.base].postMessage([DATA.source_filter.typings, FORM[this.base].data()])
		// WORKER.matrix_locations.postMessage(DATA.filter.locations)
	}

	started() {
		this.t0 = Date.now()
		this.progress(true)
		// this.list().innerHTML += `<li>calculated typing - distance - matrix <progress value="0" max="100"> </progress> </li>`
		// this.list().innerHTML += `<li>calculating typing - distances ... </li>`
	}
	// progress(current, total) {
	// 	// let [current, total] = data
	// 	this.find(`li progress`).value = current
	// 	this.find(`li progress`).max = total
	// }
	// this.addDone(`removed ${data.dropped}/${rowCount} sequences that had less than ${data.cutoffPercentage}% = ${data.cutoffValue}/${data.maxEntries} values`, this.milliseconds())
	// this.addDownload('rows', `typing sequence statistics`, {
	// 	tsv: () => download(`${FORM.title()}_typing_sequences_stats.tsv`, TALI.grid.stringify({ '': STATS[this.base].rows }, { sortCol: 'count', pretty: 4 }))
	// }, `(${Object.keys(STATS[this.base].rows).length} sequences)`)

	addMatrixDownload(type, stats) {
		this.addDownload(type, `${type} distance matrix`, {
			tsv: () => download(`${FORM.title_()}_${type}_distance_matrix.tsv`, TALI.grid.stringify({ [type]: DATA[this.base][type + 's'] }, { sortRows: true, sortCols: true, pretty: 1 }))
		}, `(${stats.keys} ${type}s, ${stats.values} distances)`)
	}
	seq(data, stats) {
		// console.log('seq distance', data)
		// DATA[this.base].typings ??= {}
		DATA[this.base].sequences = data
		this.addDone(`calculated typing - distance - matrix`, this.milliseconds())
		this.addMatrixDownload('sequence', stats)
		// this.addDownload('seqMat', `sequence distance matrix`, {
		// 	tsv: () => download(`${FORM.title_()}_sequence_distance_matrix.tsv`, TALI.grid.stringify({ [key]: DATA[this.base][key] }, { sortRows: true, sortCols: true, pretty: 1 }))
		// 	tsv: () => download(`${FORM.title()}_sequence_distance_matrix.tsv`, TALI.grid.stringify({ '': STATS[this.base].rows }, { sortCol: 'count', pretty: 4 }))
		// }, `(${Object.keys(STATS[this.base].rows).length} sequences)`)
		// this.addRow('sequences', stats)
		// this.find('progress').replaceWith(stringToNode(`${this.milliseconds(1)} ms`))
	}
	pat(data, stats) {
		// console.log('pat distance', data)
		DATA[this.base].patients = data
		this.addDone(`converted sequence-matrix to patient-matrix`, this.milliseconds())
		this.addMatrixDownload('patient', stats)
		// this.addRow('patients', stats)
		// this.list().innerHTML += `<li>converted sequence-matrix to patient-matrix ${this.milliseconds(1)} </li>`
	}
	stats(data) {
		// console.log("dist stats", data)
		STATS[this.base] = data
		this.addDone(`grouped values by typing-distance for visualisation`, this.milliseconds())
		this.addDownload('stats', `distance distribution`, {
			tsv: () => download(`${FORM.title_()}_distance_distribution.tsv`, TALI.grid.stringify(data, { pretty: 1 }))
		}, ``)
		// this.addLI('stats', 'grouped values by typing-distance for visualisation' + this.milliseconds(1))
	}
	// addRow(key, x) {
	// this.addTR(key, `${x.patients} ${key}`, `${x.entries} entries`, `<a>tsv</a>`)
	// this.table().innerHTML += `<tr class='${key}'> <td>${x.patients} ${key}</td> <td>${x.entries} entries</td> <td><a>tsv</a></td> </tr>`
	// }

	// activateLinks(...keys) {
	// 	for (let key of keys) {
	// 		// console.log('3. activate', key)
	// 		this.table().querySelector(`tr.${key} a`).addEventListener('click', () => download(`${FORM.title()}_typing_distance_${key}.tsv`, TALI.grid.stringify({ [key]: DATA[this.base][key] }, { sortRows: true, sortCols: true, pretty: 1 })))
	// 	}
	// }

	finished() {
		// this.list().innerHTML += `<li>processed in ${((Date.now() - this.t0) / 1000).toFixed(1)} seconds</li>`
		// this.find('.progress').remove()
		// this.activateLinks('sequences', 'patients')
		this.progress(false)
		this.activateDownloads()
		showTypeChart()
		updateState()
		if (AUTO) typing_filter.run()
	}
}






export const typing_filter = new class extends Base {
	base = 'typing_filter'
	run(event) {
		event?.preventDefault?.()
		clear(3)
		// console.log('start correlation', DATA, FORM.correlation.data())
		WORKER[this.base].postMessage([DATA.source_filter.typings, DATA.typing_distance.sequences, FORM[this.base].data()])
	}
	started() {
		// $(`#correlation>ul`).innerHTML = ''
		this.t0 = Date.now()
		this.progress(true)
	}
	addMatrixDownload(type, stats) {
		// console.log('stats', stats)
		this.addDownload(type, `${type} distance matrix`, {
			tsv: () => download(`${FORM.title_()}_${type}_distance_matrix.tsv`, TALI.grid.stringify({ [type]: DATA[this.base][type + 's'].matrix }, { sortRows: true, sortCols: true, pretty: 1 })),
			json: () => download(`${FORM.title()}_${type}_pairs.json`, JSON.stringify(DATA[this.base][type + 's'].pairs, 0, '\t')),
		}, `(${stats.keys} ${type}s, ${stats.values} distances)`)
		// 	this.table().querySelector(`tr.${key} .tsv`).addEventListener('click', () => download(`${FORM.title()}_${key}_matrix.tsv`, TALI.grid.stringify({ [key]: DATA[this.base][key].matrix }, { sortRows: true, sortCols: true, pretty: 1 })))
		// 	this.table().querySelector(`tr.${key} .json`).addEventListener('click', () => download(`${FORM.title()}_${key}_pairs.json`, JSON.stringify(DATA[this.base][key].pairs, 0, '\t')))
	}

	TI(data) {
		this.addDone(`removed ${data.dropped} sequence-pairs with more than ${FORM[this.base].data().TI} days between them`, this.milliseconds())
		// this.list().innerHTML += `<li>removed ${data.dropped} sequence-pairs with more than ${FORM[this.base].data().TI} days between them ${this.milliseconds(1)}</li>`
	}
	TD(data) {
		this.addDone(`removed ${data.dropped} sequence-pairs with distance > ${FORM[this.base].data().TD}`, this.milliseconds())
		// this.list().innerHTML += `<li>removed ${data.dropped} sequence-pairs with distance > ${FORM[this.base].data().TD} ${this.milliseconds(1)}</li>`
	}
	seq(matrix, pairs, stats) {
		// console.log('seq typing', data)
		// DATA.typing.typings ??= {}
		DATA[this.base].sequences = { matrix, pairs }
		this.addDone(`filtered sequence-matrix`, this.milliseconds())
		this.addMatrixDownload('sequence', stats)
		// this.addRow('sequences', stats)
		// this.list().innerHTML += `<li>filtered sequence-matrix ${this.milliseconds(1)} </li>`
	}
	pat(matrix, pairs, stats) {
		// console.log('pat pairs', pairs)
		DATA[this.base].patients = { matrix, pairs }
		this.addDone(`converted to patient-matrix`, this.milliseconds())
		this.addMatrixDownload('patient', stats)
		// this.addRow('patients', stats)
		// this.list().innerHTML += `<li>converted to patient-matrix ${this.milliseconds(1)} </li>`
	}
	// addRow(key, x) {
	// this.addTR(key, `${x.patients} ${key}`, `${x.entries} entries`, `<a class='tsv'>tsv</a>`, `<a class='json'>json</a>`)
	// this.table().innerHTML += `<tr class='${key}'> <td>${x.patients} ${key}</td> <td>${x.entries} entries</td> <td><a class='tsv'>tsv</a></td>  <td><a class='json'>json</a></td> </tr>`
	// }

	// activateLinks(key) {
	// 	// for (let key in ['sequences', 'patients'])
	// 	this.table().querySelector(`tr.${key} .tsv`).addEventListener('click', () => download(`${FORM.title()}_${key}_matrix.tsv`, TALI.grid.stringify({ [key]: DATA[this.base][key].matrix }, { sortRows: true, sortCols: true, pretty: 1 })))
	// 	this.table().querySelector(`tr.${key} .json`).addEventListener('click', () => download(`${FORM.title()}_${key}_pairs.json`, JSON.stringify(DATA[this.base][key].pairs, 0, '\t')))
	// }
	finished() {
		// console.log("DONNNE")
		this.progress(false)
		updateState()
		// this.activateLinks('sequences')
		// this.activateLinks('patients')
		this.activateDownloads()
		if (AUTO) location_contacts.run()
	}

}






let stringToNode = str => new DOMParser().parseFromString(str, 'text/html').body.firstChild;

export const location_contacts = new class extends Base {
	base = 'location_contacts'
	run(event) {
		event?.preventDefault?.()
		clear(4)
		// console.log('start correlation', DATA, FORM.correlation.data())
		WORKER[this.base].postMessage([DATA.source_filter.locations, DATA.typing_filter.patients.pairs])
	}

	started() {
		// console.log('contact start')
		this.t0 = Date.now()
		this.progress(true)
	}

	locationList(data, len1, len2) {
		// console.log('contact list', data)
		DATA[this.base].list = data
		this.addDone(`removed ${len1 - len2} entries from location-list`, this.milliseconds())
		// this.addDownload('list', 'location list', {
		// 	tsv: () => download(`${FORM.title_()}_locations_${FORM.typing_filter.string_()}.tsv`, TALI.grid.stringify({ '': DATA[this.base].list }, { sortRows: true, sortCols: true, pretty: 1 })),
		// }, ``)
		// this.addLI('locationList', `removed ${len1 - len2} entries from location-list  ${this.milliseconds(1)}`)
	}
	locationTree(data) {
		// console.log('contact tree', data)
		DATA[this.base].tree = data
		this.addDone(`converted list to tree`, this.milliseconds())
		this.addDownload('locList', 'location list', {
			tsv: () => download(`${FORM.title_()}_locations_${FORM.typing_filter.string_()}.tsv`, TALI.grid.stringify({ '': DATA[this.base].list }, { sortRows: true, sortCols: true, pretty: 1 })),
			json: () => download(`${FORM.title_()}_locations_${FORM.typing_filter.string_()}.json`, JSON.stringify(DATA[this.base].tree, 0, '\t')),
		}, ``)

		// this.addLI('locationTree', `converted to tree  ${this.milliseconds(1)}`)
		// this.list().innerHTML += `<li>calculating contacts <progress value="0" max="100"> </progress> </li>`
		// this.addTR('locations', `${Object.keys(data).length} patients`, `${Object.keys(DATA[this.base].list).length} locations`, `<a class='tsv'>tsv</a>`, `<a class='json'>json</a>`)
	}

	// progress(current, total) {
	// 	this.find(`progress`).value = current
	// 	this.find(`progress`).max = total
	// }
	contactTree(data, total) {
		// console.log('contacts::', data)
		DATA[this.base].contacts = data
		this.addDone(`calculated contacts between patients`, this.milliseconds())
		this.addDownload('contacts', 'contact matrix', {
			json: () => download(`${FORM.title_()}_contacts_${FORM.typing_filter.string_()}.json`, JSON.stringify(DATA[this.base].contacts, 0, '\t')),
		}, ``)		// this.find('progress').replaceWith(stringToNode(`${this.milliseconds(1)} ms`))
		// this.addTR('contacts', `${Object.keys(data).length} patients`, `${total} contacts`, ``, `<a class='json'>json</a>`)

	}

	// addTR(key, x) {
	// 	this.table().innerHTML += `<tr class='${key}'> <td>${x.patients} ${key}</td> <td>${x.entries} entries</td> <td><a class='tsv'>tsv</a></td>  <td><a class='json'>json</a></td> </tr>`
	// }
	// activateLinks() {
	// for (let key in ['sequences', 'patients'])
	// this.table().querySelector(`tr.locations .tsv`).addEventListener('click', () => download(`${FORM.title_()}_locations_${FORM.typing_filter.string_()}.tsv`, TALI.grid.stringify({ '': DATA[this.base].list }, { sortRows: true, sortCols: true, pretty: 1 })))
	// this.table().querySelector(`tr.locations .json`).addEventListener('click', () => download(`${FORM.title_()}_locations_${FORM.typing_filter.string_()}.json`, JSON.stringify(DATA[this.base].tree, 0, '\t')))
	// this.table().querySelector(`tr.contacts .json`).addEventListener('click', () => download(`${FORM.title_()}_contacts_${FORM.typing_filter.string_()}.json`, JSON.stringify(DATA[this.base].contacts, 0, '\t')))
	// }

	finished() {
		// console.log("DONNNE")
		this.progress(false)
		updateState()
		this.activateDownloads()
		// this.activateLinks()
		// this.activateLinks('sequences')
		// this.activateLinks('patients')
		if (AUTO) location_filter.run()
	}
}


export const location_filter = new class extends Base {
	base = 'location_filter'

	run(event) {
		event?.preventDefault?.()
		// if (!(DATA.distance.typings && DATA.distance.locations)) return
		clear(5)
		// console.log('data', DATA.location_contacts.contacts)
		// console.log('options', FORM[this.base].data())
		WORKER[this.base].postMessage([DATA.location_contacts.contacts, FORM[this.base].data()])
	}

	started() {
		this.t0 = Date.now()
		this.progress(true)
		// console.log('loc filter started')
		// $(`#correlation>ul`).innerHTML = ''
	}
	// CL(data) {
	// 	$(`#correlation>ul`).innerHTML += `<li>${FORM.correlation.data().CL}-location has ${data.count} locations-pairs</li>`
	// }
	// CI(data) {
	// 	$(`#correlation>ul`).innerHTML += `<li>removed ${data.dropped} locations-pairs with more than ${FORM.correlation.data().CI} days between them</li>`
	// }
	// CD(data) {
	// 	$(`#correlation>ul`).innerHTML += `<li>not yet implemented</li>`
	// }

	// CL(data) {
	// 	this.addDone(`removed ${data.dropped} sequence-pairs with more than ${FORM[this.base].data().TI} days between them`, this.milliseconds())
	// 	// this.list().innerHTML += `<li>removed ${data.dropped} sequence-pairs with more than ${FORM[this.base].data().TI} days between them ${this.milliseconds(1)}</li>`
	// }
	contacts(data, total) {
		// console.log('contact results', data, total)
		DATA[this.base].contacts = data
		this.addDone(`filtered contacts by given criteria`, this.milliseconds())
		this.addDownload(`matrix`, `contact matrix`, {
			json: () => download(`${FORM.title_()}_contacts.json`, JSON.stringify(DATA[this.base].contacts, 0, '\t')),
		}, ``)
		// this.find('progress').replaceWith(stringToNode(`${this.milliseconds(1)} ms`))
		// this.addTR('contacts', `${Object.keys(data).length} patients`, `${total} contacts`, ``, `<a class='json'>json</a>`)

	}

	summary(data) {
		// console.log('summary', data)
		DATA[this.base].summary = data
		this.addDone(`calculated distribution`, this.milliseconds())
		this.addDownload(`distri`, `contact distribution`, {
			tsv: () => download(`${FORM.title_()}_locations.tsv`, TALI.grid.stringify(DATA[this.base].summary, { sortCol: 'count', pretty: 4 })),
		}, ``)
		// if (DEBUG())
		// showLocationChart(data)
		// this.addTR('summary', `${Object.keys(data.clinic).length} clinics`, `${Object.keys(data.ward).length} wards`, `${Object.keys(data.room).length} rooms`, `<a class='tsv'>tsv</a>`)
	}

	// activateLinks() {
	// 	this.find('.json').addEventListener('click', () => download(`${FORM.title_()}_contacts.json`, JSON.stringify(DATA[this.base].contacts, 0, '\t')))
	// 	// this.find('.tsv').addEventListener('click', () => download(`${FORM.title()}_locations.tsv`, TALI.grid.stringify({ location: DATA[this.base].summary }, { sortCol: 'count', pretty: 4 })))
	// 	this.find('.tsv').addEventListener('click', () => download(`${FORM.title_()}_locations.tsv`, TALI.grid.stringify(DATA[this.base].summary, { sortCol: 'count', pretty: 4 })))
	// }

	finished() {
		this.progress(false)
		this.activateDownloads()
		// this.activateLinks()
		updateState()
		// this.activateLinks('sequences')
		// this.activateLinks('patients')
		if (AUTO) correlation.run()

	}
	// correlate(data) {
	// 	DATA.correlation = data
	// 	// DATA.correlation[FORM.correlation.string()] = data
	// 	console.log("CORR", DATA.correlation)
	// 	$('#correlation table.info').innerHTML = TALI.grid.stringify({ [FORM.correlation.string()]: DATA.correlation }, { flip: true, format: 'html', caption: true })
	// 	showCorrelationChart3()
	// }



}



export const correlation = new class extends Base {
	base = 'correlation'

	run(event) {
		event?.preventDefault?.()
		// if (!(DATA.distance.typings && DATA.distance.locations)) return
		clear(6)
		// console.log('data', DATA.location_contacts.contacts)
		// console.log('options', FORM[this.base].data())
		// console.log('pairs', DATA.typing_filter.patients.pairs)
		// console.log('contacts', DATA.location_filter)
		WORKER[this.base].postMessage([DATA.typing_filter.patients.pairs, DATA.location_filter.contacts, FORM.location_filter.data().CD])
	}
	started() {
		this.t0 = Date.now()
		this.progress(true)
		// console.log('correlation started')
		// this.addLI('progress', `calculating contacts <progress value="0" max="100"> </progress>`)
	}
	// progress(current, total) {
	// 	this.find(`progress`).value = current
	// 	this.find(`progress`).max = total
	// }
	result(data) {
		DATA[this.base].absolute = data
		// console.log('result', data)
		this.addDone('absolute', this.milliseconds())
		this.find('div.table').innerHTML = TALI.grid.stringify({ [FORM.correlationParameters()]: data }, { flip: true, format: 'html', caption: true })
		// showCorrelationChart4(data)
		showCorrelationChart(data, FORM.location_filter.data().CD)
	}
	relative(data) {
		DATA[this.base].relative = data
		this.addDone('relative', this.milliseconds())
		this.addDownload(`correlation`, `correlation`, {
			tsv: () => download(`${FORM.title_()}_correlation.tsv`, TALI.grid.stringify(DATA[this.base], { flip: true, pretty: 4 })),
		}, ``)
		// this.find('div.table').innerHTML += TALI.grid.stringify({ [FORM.correlationParameters()]: data }, { flip: true, format: 'html', caption: true })
	}
	finished() {
		this.progress(false)
		this.activateDownloads()
		// this.find('progress').replaceWith(stringToNode(`${this.milliseconds(1)} ms`))
	}

}









// export function startCorrelation() {
// 	if (!(DATA.distance.typings && DATA.distance.locations)) return
// 	// $('#distance-chart').innerHTML = TEMPLATE.chart_typings()
// 	// $$('#distance-chart a.chart').map(x => x.addEventListener('click', event => showTypeChart(event.target.id)))
// 	console.log('start correlation', DATA, FORM.correlation.data())
// 	// DATA.correlation = {}
// 	WORKER.correlation.postMessage([DATA.filter, DATA.distance, FORM.correlation.data()])
// }




// export function startCrossMatch() {
// 	// console.log('startCrossMatch')
// 	// $('#filter-stats .rows .download').addEventListener('click', () => download(`typing.rows.tsv`, TALI.grid.stringify({ '': DATA.filterStats.rows }, { sortCol: 'count', pretty: 4 })))
// 	// $('#filter-stats .cols .download').addEventListener('click', () => download(`typing.cols.tsv`, TALI.grid.stringify({ '': DATA.filterStats.cols }, { sortCol: 'count', pretty: 4 })))

// 	// $('#location-chart').innerHTML = TEMPLATE.chart_locations()
// 	// $$('#location-chart a.chart').map(node => node.addEventListener('click', event => showLocationChart(event.target.textContent.trim())))
// 	// console.log('links', $$('#location-chart a.chart'))
// 	showLocationChart()
// 	$$('#distance>*').map(node => node.innerHTML = '')
// 	// $('#distance').innerHTML = '<table class="info typings"></table> <table class="info locations"></table>'
// 	// for (let type of ['typings', 'locations'])
// 	// $('#distance .info').innerHTML += `<tr id="${type}"> <td> ${type} </td> <td> <progress value="0" max="100"> </progress> </td> </tr>`
// 	for (let type of ['typings', 'locations']){
// 		$('#distance ul').innerHTML += `<li id="${type}"> ${type}  <progress value="0" max="100"> </progress> </li>`
// 		$(`#distance table.${type}`).innerHTML+= `<caption>${type}</caption>`
// 	}
// 	DATA.distance = {}
// 	// console.log('start matrix workers')
// 	WORKER.matrix_typings.postMessage(DATA.filter.typings)
// 	WORKER.matrix_locations.postMessage(DATA.filter.locations)
// 	// console.log('done matrix workers')
// }


// export function startFilter(event) {
// 	// console.log('start filter', DATA.parsed)
// 	// $('#filter').innerHTML = ''
// 	// $('#filter-state').innerHTML = ''
// 	// $$('#filter .help').map(x => x.innerHTML = '')
// 	WORKER.filter.postMessage([DATA.source, FORM.filter.data()])
// }







// export function showCorrelationResults() {

// 	let html = `<div id="${key.replace(/\W/gmi, '')}" class="wrap">`
// 	// html += `<h3>${key}</h3>`
// 	html += `<div class='chart-box'>chart</div>`
// 	html += TALI.grid.stringify({ [key]: DATA.correlation[key] }, { flip: true, format: 'html', caption: true })
// 	// .replace('<table>', `<div id="${key}" class="wrap">  <div class="chart" style="border:2px solid red;"></div> <table>`)
// 	// .replace('</table>', `</table><a class='remove'>remove</a> </div>`)
// 	html += "</div>"
// 	$('#correlationResults').innerHTML = html
// 	showCorrelationChart2(key)

// 	// $$(`#correlationTables a.remove`).map(a => a.addEventListener('click', e => removeCorrelation(e)))
// }

// export function showCorrelationResults() {
// 	let results = []
// 	for (let key in DATA.correlation) {

// 		let html = `<div id="${key.replace(/\W/gmi, '')}" class="wrap">`
// 		// html += `<h3>${key}</h3>`
// 		html += `<div class='chart-box'>chart</div>`
// 		html += TALI.grid.stringify({ [key]: DATA.correlation[key] }, { flip: true, format: 'html', caption: true })
// 		// .replace('<table>', `<div id="${key}" class="wrap">  <div class="chart" style="border:2px solid red;"></div> <table>`)
// 		// .replace('</table>', `</table><a class='remove'>remove</a> </div>`)
// 		html += "</div>"
// 		results.push(html)
// 	}
// 	$('#correlationResults').innerHTML = results.join('\n\n')
// 	for (let key in DATA.correlation) {
// 		showCorrelationChart2(key)
// 	}
// 	// $$(`#correlationTables a.remove`).map(a => a.addEventListener('click', e => removeCorrelation(e)))
// }


// export function showCorrelationTables() {
// 	let tables = TALI.grid.stringify(DATA.correlation, { flip: true, format: 'html', caption: true })
// 	tables = tables.replaceAll('<table>', '<div class="wrap"><table>').replaceAll('</table>', `</table><a class='remove'>remove</a> </div>`)
// 	$('#correlationTables').innerHTML = tables
// 	$$(`#correlationTables a.remove`).map(a => a.addEventListener('click', e => removeCorrelation(e)))
// }

// export function removeCorrelation(event) {
// 	let caption = event.target.closest('div').querySelector('caption')
// 	let id = caption.textContent
// 	console.log('remove', id)
// 	delete DATA.correlation[id]
// 	showCorrelationTables()
// 	showCorrelationChart()
// }






// class Matrix {
// 	// constructor(name) {
// 	// 	this.name = name
// 	// }
// 	// start() {

// 	// }
// 	started() {
// 		$('#distance ul').innerHTML += `<li id="${this.name}"> ${this.name}  <progress value="0" max="100"> </progress> </li>`
// 	}
// 	progress(current, total) {
// 		// let [current, total] = data
// 		$(`#distance li#${this.name} progress`).value = current
// 		$(`#distance li#${this.name} progress`).max = total
// 	}
// 	result(data) {
// 		DATA.distance[this.name] = data
// 		console.log('matrix', this.name, data)
// 	}
// 	// stats(data) {
// 	// 	// console.log('distance stats', this.name, data)
// 	// 	$(`#distance #${this.name}`).innerHTML = TEMPLATE.stat_dist(this.name, data)
// 	// 	if (this.name == 'typings')
// 	// 		$(`#distance #${this.name} a`).addEventListener('click', () => download(`${this.name}.matrix.tsv`, TALI.grid.stringify({ [this.name]: DATA.distanceMatrix[this.name] }, { sortRows: true, sortCols: true })))
// 	// 	else
// 	// 		$(`#distance #${this.name} a`).addEventListener('click', () => download(`${this.name}.matrix.tsv`, TALI.grid.stringify(cleanNumbers(DATA.distanceMatrix[this.name]), { sortRows: true, sortCols: true })))

// 	// 	// console.log('clean', cleanNumbers(DATA.distanceMatrix.locations))
// 	// }
// 	addDownload(data) {
// 		for (let key in data)
// 			$(`#distance table.${this.name} tr.${key} a`).addEventListener('click', () => download(`${this.name}.${key}.matrix.tsv`, TALI.grid.stringify({ [key]: DATA.distance[this.name][key] }, { sortRows: true, sortCols: true })))
// 	}
// 	time(time) {
// 		$(`#distance li#${this.name}`).innerHTML = this.name + ` processed in ${time} seconds`
// 	}
// }
// class TypingMatrix extends Matrix {
// 	name = 'typings'
// 	modifier(matrix) {
// 		return matrix
// 	}
// 	stats(data) {
// 		for (let key in data) {
// 			let x = data[key]
// 			// $(`#distance table.${this.name}`).innerHTML += TEMPLATE.stat_dist(key, data[key])
// 			$(`#distance table.${this.name}`).innerHTML += `<tr class='${key}'> <td>${x.patients} ${key}</td> <td>${x.entries} entries</td> <td><a>tsv</a></td> </tr>`
// 			// $(`#distance table.${this.name} a`).addEventListener('click', () => download(`${this.name}.matrix.tsv`, TALI.grid.stringify({ [this.name]: DATA.distanceMatrix[this.name] }, { sortRows: true, sortCols: true })))
// 		}
// 		this.addDownload(data)
// 	}
// 	finished() {
// 		showTypeChart(100)
// 		updateState()
// 		if (AUTO) correlation.run()
// 	}
// }
// class LocationMatrix extends Matrix {
// 	name = 'locations'
// 	modifier(matrix) {
// 		return matrix
// 	}
// 	stats(data) {
// 		for (let key in data) {
// 			let x = data[key]
// 			// $(`#distance table.${this.name}`).innerHTML += TEMPLATE.stat_dist(key, data[key])
// 			$(`#distance table.${this.name}`).innerHTML += `<tr class='${key}'> <td>${key}</td> <td>${x.patients} patients</td> <td>${x.entries} entries</td> <td><a>tsv</a></td> </tr>`
// 			// $(`#distance table.${this.name} a`).addEventListener('click', () => download(`${this.name}.matrix.tsv`, TALI.grid.stringify({ [this.name]: DATA.distanceMatrix[this.name] }, { sortRows: true, sortCols: true })))
// 		}
// 		this.addDownload(data)
// 		// $(`#distance #${this.name}`).innerHTML = TEMPLATE.stat_dist(this.name, data)
// 		// $(`#distance #${this.name} a`).addEventListener('click', () => download(`${this.name}.matrix.tsv`, TALI.grid.stringify(cleanNumbers(DATA.distanceMatrix[this.name]), { sortRows: true, sortCols: true })))
// 	}
// 	finished() {
// 		updateState()
// 		if (AUTO) correlation.run()
// 	}
// }
// // export const typing = new TypingMatrix()
// export const matrix_typings = new TypingMatrix()
// export const matrix_locations = new LocationMatrix()
// export const distance = new class {
// 	run(event) {
// 		event?.preventDefault?.()
// 		clear('distance', 'correlation')
// 		console.log('start distance', DATA.filter)
// 		WORKER.matrix_typings.postMessage([DATA.filter.typings, FORM.distance.data()])
// 		// WORKER.matrix_locations.postMessage(DATA.filter.locations)
// 	}
// }