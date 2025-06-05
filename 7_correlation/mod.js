
import { Base } from '../lib/mod.base.js'
import { TALI, download, prettyNumber } from '../lib/deps.js'
import { sourceInput, typeFilter, locationFilter } from '../lib/mod.js'
import { showCorrelationChart } from './chart.js'
// import { showCorrelationChart } from '../charts/chart.js'



export default new class extends Base {
	domID = 'correlation'

	constructor() {
		super()
		this.addThreads({ thread: './worker.js' }, import.meta.url)
		this.addTemplates({ template: './template.html', chart: './chart.html' }, import.meta.url)
	}


	async run(event) {
		await this.start(event)
		// await this.isDefined(typeFilter.data, 'typingPairsByPatient') // only for firefox bug
		// await this.isDefined(locationFilter.data, 'contactTree') // only for firefox bug
		// await this.isDefined(locationFilter, 'data') // only for firefox bug
		// await this.thread.start(typeFilter.data.typingPairsByPatient, locationFilter.data, locationFilter.formData.CD)
		// this.find('#th').addEventListener('input', () => this.showChart())
		// let typingMatrix = await this.isDefined(typeFilter.data, 'typingMatrixByPatient')
		let typingMatrix = await this.isDefined(typeFilter.data, 'typingMatrixByPatient')
		// let typingPairs = await this.isDefined(typeFilter.data, 'typingPairsByPatient')
		// let contactTree = await this.isDefined(locationFilter.data, 'contactTree')
		let contactMatrix = await this.isDefined(locationFilter.data, 'contactMatrix')
		// let CD = locationFilter.formData.CD
		// let CM = locationFilter.formData.CM
		// let TD = typeFilter.formData.TD
		await this.thread.start(typingMatrix, contactMatrix, this.formData)
	}
	async done() {
		await this.exit()
	}

	get formData() {
		return {
			TD: this.find('#td input').value * 1,
			MR: this.find('#mr input').value * 1,
			CD: this.find('#cd input').value * 1,
			// CD: this.find('#cd input').value * 1,
			// CM: this.find('#cm input').value * 1,
		}
	}
	result(data) {
		this.data = data
		// console.log("CORRE RESULT", data)
		// this.data = data
		// this.data.absolute = data
		// console.log('result', data)
		// this.addDone('correlated typing-distance- and contact-data')
		this.find('div.table').innerHTML = TALI.grid.stringify({ '': data }, { flip: true, format: 'html', caption: true })
		// showCorrelationChart4(data)
		this.addDownload(`correlation`, `correlation`, {
			tsv: () => download(`${sourceInput.title_}_correlation.tsv`, TALI.grid.stringify({ '': data }, { flip: false, pretty: 4 })),
		}, ``)
		this.showChart()
	}
	showChart() {
		// showCorrelationChart(this.chartBox, this.chart, this.data, { CD: locationFilter.formData.CD })
		showCorrelationChart(this.chartBox, this.chart, this.data, this.formData.CD, 'SD')
	}
	info(med, max, cutoff) {
		// console.log('DATA', this.data)
		// this.addDone(`median at ${med}%, threshold at ${med * 10}%, cutoff at cgmlst-distance > ${cutoff}`)
		this.addDone(`median at ${med}%   &rarr;   threshold at ${med * 10}%   &rarr;   cutoff at cgmlst-distance > ${cutoff}`)
		// this.addDone(`threshold at ${med * 10}%`)
		// this.addDone(`cutoff at cgmlst-distance > ${cutoff}`)
		this.addDone(`maximimum at ${max}%`)
	}
	info2(avg, sd) { }

	relative(data) {
		// this.data.relative = data
		// this.addDone('relative')
		// this.addDownload(`correlation`, `correlation`, {
		// 	tsv: () => download(`${sourceInput.title_}_correlation.tsv`, TALI.grid.stringify(data, { flip: true, pretty: 4 })),
		// }, ``)
		// this.find('div.table').innerHTML += TALI.grid.stringify({ [FORM.correlationParameters()]: data }, { flip: true, format: 'html', caption: true })
	}

	contactMatrix(data, total) {
		this.addDownload(`matrix`, `contact matrix`, {
			tsv: () => download(`${sourceInput.title_}_contacts.tsv`, TALI.grid.stringify({ contacts: data }, { sortRows: true, sortCols: true, pretty: 1 })),
			// json: () => download(`${sourceInput.title_}_contacts.json`, JSON.stringify(this.data.contactTree, 0, '\t')),
		}, ``)
	}

	CT(count) {
		this.addDone(`${prettyNumber(count)} contact-pairs with corresponding typing-pairs`)
	}

	baseMatrix(m, matrix) {
		this.addDownload(`matrix`, `base matrix`, {
			tsv: () => download(`${sourceInput.title_}_base_matrix.tsv`, TALI.grid.stringify({ '': matrix }, { sortRows: true, sortCols: true, pretty: 1 })),
			// json: () => download(`${sourceInput.title_}_contacts.json`, JSON.stringify(this.data.contactTree, 0, '\t')),
		}, ``)
		this.addDownload(`matrix2`, `base matrix2`, {
			tsv: () => download(`${sourceInput.title_}_base_matrix2.tsv`, TALI.grid.stringify({ '': m }, { sortRows: true, sortCols: true, pretty: 1 })),
			// json: () => download(`${sourceInput.title_}_contacts.json`, JSON.stringify(this.data.contactTree, 0, '\t')),
		}, ``)

	}

	// segregation(data, diff) {
	// 	this.find('div.table2').innerHTML = TALI.grid.stringify({ 'relative': data }, { flip: true, format: 'html', caption: true })
	// 	this.addDone(`${diff.position}: ${diff.difference}`)
	// }

	// segregation2(data, diff) {
	// 	this.find('div.table3').innerHTML = TALI.grid.stringify({ 'absolute': data }, { flip: true, format: 'html', caption: true })
	// 	this.addDone(`${diff.position}: ${diff.difference}`)
	// }


	// finished() {
	// 	this.progress(false)
	// 	this.activateDownloads()
	// 	// this.find('progress').replaceWith(stringToNode(`${this.milliseconds(1)} ms`))
	// }


	// get formData() {
	// 	return {
	// 		CL: this.find('#cl select').value,
	// 		CI: this.find('#ci input').value * 1,
	// 		CD: this.find('#cd input').value * 1,
	// 	}
	// }


	// result(data, total) {
	// 	// console.log('contact results', data, total)
	// 	// DATA[this.base].contacts = data
	// 	this.data.contactTree = data
	// 	this.addDone(`filtered contacts by given criteria`)
	// 	this.addDownload(`matrix`, `contact matrix`, {
	// 		json: () => download(`${sourceInput.title_}_contacts.json`, JSON.stringify(this.data.contactTree, 0, '\t')),
	// 	}, ``)
	// 	// this.find('progress').replaceWith(stringToNode(`${this.milliseconds(1)} ms`))
	// 	// this.addTR('contacts', `${Object.keys(data).length} patients`, `${total} contacts`, ``, `<a class='json'>json</a>`)

	// }

	// summary(data) {
	// 	// console.log('summary', data)
	// 	// DATA[this.base].summary = data
	// 	this.data.summary = data
	// 	this.addDone(`calculated distribution`)
	// 	this.addDownload(`distri`, `contact distribution`, {
	// 		tsv: () => download(`${sourceInput.title_}_locations.tsv`, TALI.grid.stringify(this.data.summary, { sortCol: 'count', pretty: 4 })),
	// 	}, ``)
	// 	// if (DEBUG())
	// 	// showLocationChart(data)
	// 	// this.addTR('summary', `${Object.keys(data.clinic).length} clinics`, `${Object.keys(data.ward).length} wards`, `${Object.keys(data.room).length} rooms`, `<a class='tsv'>tsv</a>`)
	// }



}





// export const correlation = new class extends Base {
// 	base = 'correlation'

// 	run(event) {
// 		event?.preventDefault?.()
// 		// if (!(DATA.distance.typings && DATA.distance.locations)) return
// 		clear(6)
// 		// console.log('data', DATA.location_contacts.contacts)
// 		// console.log('options', FORM[this.base].data())
// 		// console.log('pairs', DATA.typing_filter.patients.pairs)
// 		// console.log('contacts', DATA.location_filter)
// 		WORKER[this.base].postMessage([DATA.typing_filter.patients.pairs, DATA.location_filter.contacts, FORM.location_filter.data().CD])
// 	}
// 	started() {
// 		this.t0 = Date.now()
// 		this.progress(true)
// 		// console.log('correlation started')
// 		// this.addLI('progress', `calculating contacts <progress value="0" max="100"> </progress>`)
// 	}
// 	// progress(current, total) {
// 	// 	this.find(`progress`).value = current
// 	// 	this.find(`progress`).max = total
// 	// }
// 	result(data) {
// 		DATA[this.base].absolute = data
// 		// console.log('result', data)
// 		this.addDone('absolute', this.milliseconds())
// 		this.find('div.table').innerHTML = TALI.grid.stringify({ [FORM.correlationParameters()]: data }, { flip: true, format: 'html', caption: true })
// 		// showCorrelationChart4(data)
// 		showCorrelationChart(data, FORM.location_filter.data().CD)
// 	}
// 	relative(data) {
// 		DATA[this.base].relative = data
// 		this.addDone('relative', this.milliseconds())
// 		this.addDownload(`correlation`, `correlation`, {
// 			tsv: () => download(`${sourceInput.title_}_correlation.tsv`, TALI.grid.stringify(DATA[this.base], { flip: true, pretty: 4 })),
// 		}, ``)
// 		// this.find('div.table').innerHTML += TALI.grid.stringify({ [FORM.correlationParameters()]: data }, { flip: true, format: 'html', caption: true })
// 	}
// 	finished() {
// 		this.progress(false)
// 		this.activateDownloads()
// 		// this.find('progress').replaceWith(stringToNode(`${this.milliseconds(1)} ms`))
// 	}

// }
