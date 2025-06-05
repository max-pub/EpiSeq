import { Base } from '../lib/mod.base.js'
import { download, prettyNumber } from '../lib/deps.js'
import { TALI } from "../lib/deps.js"
// import { showTypeChart } from '../charts/chart.js'
import { sourceInput, sourceFilter, typeFilter, locationDistance } from '../lib/mod.js'



export default new class extends Base {
	domID = 'typing_distance'

	constructor() {
		super()
		this.addThreads({ thread: './worker.js' }, import.meta.url)
		this.addTemplates({ template: './template.html' }, import.meta.url)
	}


	async run(event) {
		await this.start(event)
		await this.thread.start(sourceFilter.data.typingList, this.formData)
	}
	async done(){
		await this.exit()
		// typeChart.initAndRun()
		locationDistance.initAndRun()
	}

	get formData() {
		return {
			countNull: this.find('form #countNull input').checked,
		}
	}

	// addMatrixDownload(type, stats) {
	// 	this.addDownload(type, `${type} distance matrix`, {
	// 		tsv: () => download(`${sourceInput.title_}_${type}_distance_matrix.tsv`, TALI.grid.stringify({ [type + 's']: this.data[type + 'Matrix'] }, { sortRows: true, sortCols: true, pretty: 1 }))
	// 	}, `(${Object.keys(this.data[type + 'Matrix']).length} ${type}s)`)
	// }



	typingMatrix(data, count) {
		this.data.typingMatrix = data
		this.addDone(`calculated distance-matrix with ${prettyNumber(count)} entries`)
		// this.addMatrixDownload('sequence')
		// this.addDownload('sequences', `typing distance matrix`, {
		// 	tsv: () => download(`${sourceInput.title_}_typing_distance_matrix.tsv`, TALI.grid.stringify({ '': this.data.typingMatrix }, { sortRows: true, sortCols: true, pretty: 1 }))
		// }, `(${Object.keys(this.data.typingMatrix).length} sequences)`)
		// this.addResult('typing - distance - matrix', `with ${Object.keys(data).length} sequences`)
		// console.log('seq', data) 
	}
	dateMatrix(data,count) {
		// console.log('date matrix', data)
		this.data.dateMatrix = data
		// console.log('dateMatrix',data)
		this.addDone(`calculated date-matrix with ${prettyNumber(count)} entries`)
		// this.addDownload('sequences', `typing distance matrix`, {
		// 	tsv: () => download(`${sourceInput.title_}_typing_distances.tsv`, TALI.grid.stringify({ typingMatrix: this.data.typingMatrix, dateMatrix: this.data.dateMatrix }, { sortRows: true, sortCols: true, pretty: 1 }))
		// }, `(${Object.keys(this.data.typingMatrix).length} sequences)`)
	}
	sequencePatientMap(data) {
		// console.log('sequencePatientMap', data)
		// this.addDone(`calculated sequence patient map`)
		// this.addDone(`calculated `)
		this.data.sequencePatientMap = data
	}

	info(data) {
		// console.log('info', data)
		// this.data.info ??= {}
		this.data.info = data
		// this.data.schema = data
		this.addDownload('sequences', `typing distances`, {
			// json: () => download(`${sourceInput.title_}_typing_distances.json`, JSON.stringify(this.data)),
			tsv: () => download(`${sourceInput.title_}_typing_distance_matrix.tsv`, TALI.grid.stringify(this.data, { sortRows: true, sortCols: true, pretty: 0 })),
		}, `(${Object.keys(this.data.typingMatrix).length} sequences)`)

	}


	// typingMatrixByPatient(data) {
	// 	this.data.typingMatrixByPatient = data
	// 	this.addDone(`grouped distance-matrix by patient`)
	// 	this.addDownload('patients', `typing distance matrix by patient`, {
	// 		tsv: () => download(`${sourceInput.title_}_typing_distance_matrix_by_patient.tsv`, TALI.grid.stringify({ '': this.data.typingMatrixByPatient }, { sortRows: true, sortCols: true, pretty: 1 }))
	// 	}, `(${Object.keys(this.data.typingMatrixByPatient).length} patients)`)
	// 	this.addResult('typing - distance - matrix', `with ${Object.keys(data).length} patients`)
	// 	// this.addMatrixDownload('patient')
	// 	// console.log('pat', data)
	// }
	// typingMatrixByPatientHistogram(data) {
	// 	this.addDone(`calculated distance distribution`)
	// 	let val = Object.values(data.absolute)
	// 	let max = Math.max(...val)
	// 	let key = val.indexOf(max)
	// 	let len = val.length
	// 	this.addDownload('stats', `distance distribution`, {
	// 		tsv: () => download(`${sourceInput.title_}_patient_distance_distribution.tsv`, TALI.grid.stringify({ '': data }, { pretty: 1 }))
	// 	}, `(schema-length: ${len}, peak at a distance of ${key} with ${max} values)`)
	// 	showTypeChart(data.absolute)
	// }

}



