import { Base } from '../lib/mod.base.js'
import { download } from '../lib/deps.js'
import { TALI } from "../lib/deps.js"
// import { showTypeChart } from '../ui/chart.js'
import { sourceInput, typeDist } from '../lib/mod.js'
import { adjustOpenEnds, removeOpenEnds } from './worker.js'
import { showT1Chart, showL1Chart, showL2Chart } from './chart.js'



export default new class extends Base {
	domID = 'source_filter'

	constructor() {
		super()
		// this.addDefaultThreadsAndTemplates()
		this.addThreads({ thread: './worker.js' }, import.meta.url)
		this.addTemplates({ template: './template.html', chart_t1: './chart.t1.html', chart_l1: './chart.l1.html', chart_l2: './chart.l2.html' }, import.meta.url)
		// 	// console.log("INIT", this.domID, this._templatesLoaded)
	}

	async run(event) {
		await this.isDefined(sourceInput.data, 'typingList')
		await this.isDefined(sourceInput.data, 'locationList')
		// console.log('type', sourceInput.data.typingList)
		// console.log('loc', sourceInput.data.locationList)
		this.start(event)
		await this.thread.start(sourceInput.data.typingList, sourceInput.data.locationList, this.formData)
	}

	async done() {
		// this.removeEmty('room')
		// this.removeEmty('ward')
		// this.adjustOpenEnds()
		await this.exit()
		typeDist.initAndRun()
		// typeDist.init()
	}

	get formData() {
		return {
			from: this.find('#from input').value,
			till: this.find('#till input').value,
			requiredRowCompleteness: this.find('#rows input').value * 1,
			requiredColumnCompleteness: this.find('#cols input').value * 1,
			roomRequired: this.find('#roomRequired input')?.checked,
			wardRequired: this.find('#wardRequired input')?.checked,
			removeOpenEnds: this.find('#removeOpenEnds input')?.checked,
			adjustOpenEnds: this.find('#adjustOpenEnds input')?.checked,
			// hasRoom: this.find('#hasRoom input').checked,
			pseudonymize: this.find('#pseudonymize input')?.checked,
		}
	}









	// grid()
	from(sequences, locations) {
		this.addDone(`removed ${sequences} typings and ${locations} locations < ${this.formData.from}`)
		// this.list().innerHTML += `<li>removed ${data[0]} typings and ${data[1]} locations < ${FORM[this.base].data().from} ${this.milliseconds(1)} </li>`
	}
	till(sequences, locations) {
		this.addDone(`removed ${sequences} typings and ${locations} locations > ${this.formData.till}`)
		// this.list().innerHTML += `<li>removed ${data[0]} typings and ${data[1]} locations > ${FORM[this.base].data().till} ${this.milliseconds(1)} </li>`
	}
	rows(data) {
		// console.log('rows', data)
		let rowCount = Object.values(sourceInput.data.typingList).length
		this.addDone(`removed ${data.dropped}/${rowCount} sequences that had less than ${data.cutoffPercentage}% = ${data.cutoffValue}/${data.maxEntries} values`)
		// this.addDownload('rows', `typing statistics`, {
		// 	tsv: () => download(`${sourceInput.title_}_typing_sequences_stats.tsv`, TALI.grid.stringify({ '': data.stats }, { sortCol: 'count', pretty: 4 }))
		// }, `(${Object.keys(data.stats).length} sequences)`)
	}
	cols(data) {
		let columnCount = Object.values(Object.values(sourceInput.data.typingList)[0]).length
		this.addDone(`removed ${data.dropped}/${columnCount} loci that had less than ${data.cutoffPercentage}% = ${data.cutoffValue}/${data.maxEntries} values`)
		this.addDownload('cols', `typing schema statistics`, {
			tsv: () => download(`${sourceInput.title_}_typing_schema_stats.tsv`, TALI.grid.stringify({ '': data.stats }, { sortCol: 'count', pretty: 4 }))
		}, `(${Object.keys(data.stats).length} loci)`)
	}
	hasRoom(data) {
		this.addDone(`removed ${data} locations from patients without room-entries`)
		// this.list().innerHTML += `<li>removed ${data} locations from patients without room-entries ${this.milliseconds(1)} </li>`
	}
	typeRequired(dropped, type) {
		this.addDone(`removed ${dropped} location records without ${type}`)
	}
	openEnds(dropped) {
		this.addDone(`adjusted ${dropped} location records with open ends`)
	}
	countBothIDs(x) {
		this.addCount(`${x.typings.ids} sequences (${x.typings.pids} patients) and ${x.locations.ids} locations (${x.locations.pids} patients)`)
	}

	patientIntersectionFilter(data) {
		this.addDone(`removed ${data.sequences} typings and ${data.locations} locations that didnt have corresponding patient-ids`)
		// this.list().innerHTML += `<li>removed ${data.typings} typings and ${data.locations} locations that didnt have corresponding patient-ids ${this.milliseconds(1)} </li>`
	}


	addListDownload(key, data) {
		let len = Object.values(data).length
		this.addDownload(key, `${key} list`, {
			tsv: () => download(`${sourceInput.title_}_${key}_filtered.tsv`, TALI.grid.stringify({ [key]: data }, { sortRows: true })),
		}, `(${len} ${key}s)`)
		// }, `(${data[key].patients} patients, ${data[key].entries} entries, ${(data[key].entries / data[key].patients).toFixed(2)} entries/patient)`)
	}

	pseudonymizationMap(map) {
		this.addDone('pseudonymized all IDs')
		this.addDownload('pseudo', 'pseudonymization mapping tables', {
			tsv: () => download(`${sourceInput.title}_pseudonym_mapping.tsv`, TALI.grid.stringify(map, { sortCol: 'count', pretty: 4 }))
		}, ``)

	}

	typingList(data) {
		this.data.typingList = data
		this.addListDownload('typing', data)
		// this.addResult('typing list', Object.keys(data).length + ' entries')
	}
	locationList(data) {
		this.data.locationList = data
		this.addListDownload('location', data)
		// this.addResult('location list', Object.keys(data).length + ' entries')
	}

	infoTable(table) {
		// console.log('table', table)
		this.find('div.table').innerHTML = TALI.grid.stringify({ '': table }, { flip: true, format: 'html', caption: true })
		this.addDownload('infoTable', 'source stats', {
			tsv: () => download(`${sourceInput.title}_source_filtered_distribution.tsv`, TALI.grid.stringify({ '': table }, { flip: true, pretty: 4 }))
		}, ``)
	}

	typingHistogram(data) {
		showT1Chart(this.find('.chart-box.t1'), this.chart_t1, data)
	}

	locationHistogram(data) {
		showL1Chart(this.find('.chart-box.l1'), this.chart_l1, data)
	}
	locationHistogramDays(data) {
		showL2Chart(this.find('.chart-box.l2'), this.chart_l2, data)
	}
}



