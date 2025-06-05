import { Base } from '../lib/mod.base.js'
import { download, sum } from '../lib/deps.js'
import { TALI, prettyNumber } from "../lib/deps.js"
import { correlation, locationDistance, sourceInput, typeFilter } from '../lib/mod.js'
import { showContactChart1, showContactChart2 } from './chart.js'
// import { locationFilter } from '../2_source_filter/worker.js'

export default new class extends Base {
	domID = 'location_filter'

	constructor() {
		super()
		this.addThreads({ thread: './worker.js' }, import.meta.url)
		// this.addTemplates({ template: './template.html' }, import.meta.url)
		this.addTemplates({ template: './template.html', chart1: './chart1.html', chart2: './chart2.html' }, import.meta.url)
	}


	async run(event) {
		await this.start(event)
		// await this.isDefined(locationContacts.data, 'contactTree') // only for firefox bug
		// await this.thread.start(locationContacts.data.contactTree, this.formData)
		await this.isDefined(locationDistance, 'data') // only for firefox bug
		// await this.thread.start(locationDistance.data, typeFilter.data.typingMatrixByPatient, this.formData)
		await this.thread.start(locationDistance.data, this.formData)
	}

	async done() {
		await this.exit()
		// locationChart.initAndRun()
		correlation.initAndRun()
		// correlation.initAndRun()
	}

	get formData() {
		return {
			CS: this.find('#cs select').value,
			CT: this.find('#ct input').value * 1,
			// CD: this.find('#cd input').value * 1,
			// CM: this.find('#cm input').value * 1,
		}
	}

	CS(count) {
		this.addDone(`${prettyNumber(count)} contacts after applying <i>spacial</i> filter ("${this.formData.CS}")`)
	}
	CT(count) {
		this.addDone(`${prettyNumber(count)} contacts after applying <i>temporal</i> filter (>= ${this.formData.CT} days)`)
	}
	// CT(count) {
	// 	this.addDone(`${prettyNumber(count)} patient-pairs with corresponding typing-pairs`)
	// }
	// CD(count) {
	// 	this.addDone(`${prettyNumber(count)} patient-pairs at a depth of ${this.formData.CD}`)
	// }


	contactMatrix(contactMatrix) {
		// console.log('contactMatrix',contactMatrix)
		this.data.contactMatrix = contactMatrix
		// this.addDone(`filtered contacts by given criteria`)
		this.addDownload(`matrix`, `filtered contacts`, {
			tsv: () => download(`${sourceInput.title_}_contacts_${this.formData.CS}_${this.formData.CT}.tsv`, TALI.grid.stringify({ contacts: contactMatrix }, { sortRows: true, sortCols: true, pretty: 0 })),
			// json: () => download(`${sourceInput.title_}_contacts_${this.formData.CL}_${this.formData.CI}.json`, JSON.stringify(contactTree, 0, '\t')),
		}, `(${Object.keys(contactMatrix).length} patients)`)
		// this.find('progress').replaceWith(stringToNode(`${this.milliseconds(1)} ms`))
		// this.addTR('contacts', `${Object.keys(data).length} patients`, `${total} contacts`, ``, `<a class='json'>json</a>`)
		// this.addResult('location - contact - matrix',`with ${Object.keys(data).length} patients`)
	}

	contactTree(contactTree) {
		this.data.contactTree = contactTree
		// this.addDone(`filtered contacts by given criteria`)
		this.addDownload(`matrix`, `contact tree`, {
			json: () => download(`${sourceInput.title_}_contacts_${this.formData.CS}_${this.formData.CT}.json`, JSON.stringify(contactTree, 0, '\t')),
		}, `(${Object.keys(contactTree).length} patients)`)
		// this.find('progress').replaceWith(stringToNode(`${this.milliseconds(1)} ms`))
		// this.addTR('contacts', `${Object.keys(data).length} patients`, `${total} contacts`, ``, `<a class='json'>json</a>`)
		// this.addResult('location - contact - matrix',`with ${Object.keys(data).length} patients`)
	}

	contactHistogram(histogram) {
		// console.log('mod contact histogrm',histogram)
		// showContactChart(this.chartBox, this.chart, histogram)
		showContactChart1(this.find('.chart-box.a'), this.chart1, histogram)
		// showContactChart(this.chartBox, this.chart, histogram)

	}


	contactCountHistogram(contacts) {
		let stats = []
		for (let pid in typeFilter.data.typingMatrixByPatient) {
			let len = contacts[pid]?.length ?? 0
			// if (len == 0) console.log("NULL", pid, contacts[pid])
			// if (len > 100) console.log('HUGE', pid, contacts[pid])
			stats[len] ??= 0
			stats[len]++
		}
		console.log('con-stat.len', stats.length)
		for (let i = 0; i < stats.length; i++)
			stats[i] ??= 0
		console.log('con-stat SUM', sum(stats))
		return stats

	}
	contacts(contacts) {
		this.data.contacts = contacts
		// showContactChart2(this.find('.chart-box.b'), this.chart2, contacts)
		showContactChart2(this.find('.chart-box.b'), this.chart2, this.contactCountHistogram(contacts))
		// showContactChart2(this.find('.chart-box.t1'))
	}

	// contacts(contactMatrix, contactTree, contacts) {
	// 	// console.log('filter contacts', FormData)
	// 	// console.log('contact results', data, total)
	// 	// DATA[this.base].contacts = data
	// 	// this.data.contactTree = data
	// 	this.data.contactMatrix = contactMatrix
	// 	this.data.contactTree = contactTree
	// 	// this.addDone(`filtered contacts by given criteria`)
	// 	this.addDownload(`matrix`, `filtered contact distances`, {
	// 		tsv: () => download(`${sourceInput.title_}_contacts_${this.formData.CL}_${this.formData.CI}.tsv`, TALI.grid.stringify({ contacts: contactMatrix }, { sortRows: true, sortCols: true, pretty: 0 })),
	// 		json: () => download(`${sourceInput.title_}_contacts_${this.formData.CL}_${this.formData.CI}.json`, JSON.stringify(contactTree, 0, '\t')),
	// 	}, `(${Object.keys(contactMatrix).length} patients)`)
	// 	// this.find('progress').replaceWith(stringToNode(`${this.milliseconds(1)} ms`))
	// 	// this.addTR('contacts', `${Object.keys(data).length} patients`, `${total} contacts`, ``, `<a class='json'>json</a>`)
	// 	// this.addResult('location - contact - matrix',`with ${Object.keys(data).length} patients`)
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


	// distribution(table) {
	// 	let table2 = {}
	// 	for (let type in table) {
	// 		table2[type] = {}
	// 		for (let dist in table[type]) {
	// 			if (dist * 1 <= 21 && dist * 1 >= -21)
	// 				table2[type][dist * 1 > 0 ? '+' + dist : dist] = table[type][dist]
	// 		}
	// 	}
	// 	this.find('div.table').innerHTML = TALI.grid.stringify({ 'days': table2 }, { format: 'html', caption: true, sortCols: true, sortStyle: 'numeric' })
	// 	this.addDownload('infoTable', 'contact distribution', {
	// 		tsv: () => download(`${sourceInput.title}_contact_distribution.tsv`, TALI.grid.stringify({ 'days': table }, { flip: true, pretty: 4 }))
	// 	}, ``)

	// }

}


