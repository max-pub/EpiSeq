import { Base } from '../lib/mod.base.js'
import { download } from '../lib/deps.js'
import { TALI, prettyNumber } from "../lib/deps.js"
import { sourceInput, typeDist, locationFilter } from '../lib/mod.js'
import { showTypeChart } from './chart.js'


function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export default new class extends Base {
	domID = 'typing_filter'

	constructor() {
		super()
		this.addThreads({ thread: './worker.js' }, import.meta.url)
		// this.addTemplates({ template: './template.html' }, import.meta.url)
		this.addTemplates({ template: './template.html', chart: './chart.html' }, import.meta.url)
	}


	async run(event) {
		await this.start(event)
		await this.isDefined(typeDist.data, 'typingMatrix')
		// console.log('type-dist', typeDist.data.info)
		await this.thread.start(typeDist.data.typingMatrix, typeDist.data.dateMatrix, typeDist.data.sequencePatientMap, typeDist.data.info, this.formData.TT)
	}
	async done() {
		await this.exit()
		// locationFilter.initAndRun()
		// typeChart.initAndRun()
		locationFilter.initAndRun()
	}

	get formData() {
		return {
			// TD: this.find('#td input').value * 1,
			TT: this.find('#tt input').value * 1,
		}
	}



	// T0(count) {
	// 	this.addDone(`${prettyNumber(count)} sequence-pairs`)
	// }
	// TI(count) {
	// 	this.addDone(`${prettyNumber(count)} sequence-pairs with sample date distance < ${this.formData.TI} days`)
	// }
	// TD(count) {
	// 	this.addDone(`${prettyNumber(count)} sequence-pairs with typing distance < ${this.formData.TD}`)
	// }
	// T2(count) {
	// 	this.addDone(`${prettyNumber(count)} sequence-pairs satisfying both filters`)
	// }
	// TX(count) {
	// 	this.addDone(`${prettyNumber(count)} patient-pairs satisfying both filters`)
	// }
	filterCount(valid, total, maxDays) {
		// this.addDone(`${prettyNumber(total)} -> ${prettyNumber(valid)} sequence-pairs `)
		this.addDone(`${prettyNumber(total)} sequence-pairs in total`)
		this.addDone(`${prettyNumber(valid)} sequence-pairs after applying <i>temporal</i> filter ("< ${maxDays} days")`)
	}
	patientCount(count) {
		this.addDone(`${prettyNumber(count)} patient-pairs after grouping by patientID`)
	}

	patientDistanceMatrix(typingMatrixByPatient) {
		// console.log('type filter results', typingMatrixByPatient)
		this.data.typingMatrixByPatient = typingMatrixByPatient
		this.addDownload('filtered_typing_dist', `filtered typing distances`, {
			tsv: () => download(`${sourceInput.title_}_type_dist_${this.formData.TT}.tsv`, TALI.grid.stringify({ '': typingMatrixByPatient }, { sortRows: true, sortCols: true, pretty: 0 })),
		}, `(${Object.keys(typingMatrixByPatient).length} patients)`)
	}

	histogram(data) {
		showTypeChart(this.chartBox, this.chart, data)
	}


	// typingMatrix(matrix, pairs, stats) {
	// 	this.data.typingMatrix = matrix
	// 	this.data.typingPairs = pairs
	// 	// this.addDone(`filtered sequence-matrix`)
	// 	// this.addMatrixDownload('sequence', stats)
	// 	this.addDownload('sequences', `typing distance matrix`, {
	// 		tsv: () => download(`${sourceInput.title_}_typing_distance_matrix.tsv`, TALI.grid.stringify({ '': this.data.typingMatrix }, { sortRows: true, sortCols: true, pretty: 1 })),
	// 		json: () => download(`${sourceInput.title_}_typing_pairs.json`, JSON.stringify(this.data.typingPairs, 0, '\t')),
	// 	}, `(${stats.keys} sequences, ${stats.values} distances)`)
	// 	// this.addResult('typing - distance - matrix',`with ${Object.keys(matrix).length} sequences`)
	// }


	// typingPairsByPatient(data){
	// 	this.data.typingPairsByPatient = data

	// }
	// typingMatrixByPatient(data) {
	// 	// console.log('pat pairs', pairs)
	// 	this.data.typingMatrixByPatient = data
	// 	// this.data.typingPairsByPatient = pairs
	// 	// console.log("PAIRS",pairs)
	// 	// console.log("PAIRS PP",pairs)
	// 	// this.addDone(`grouped filtered distance - matrix by patient`)
	// 	this.addDownload('filtered_typing_dist', `filtered typing distances`, {
	// 		tsv: () => download(`${sourceInput.title_}_type_dist_${this.formData().TD}_${this.formData().TI}.tsv`, TALI.grid.stringify({ 'x': this.data.typingMatrixByPatient }, { sortRows: true, sortCols: true, pretty: 0 })),
	// 		// json: () => download(`${sourceInput.title_}_typing_pairs_by_patient.json`, JSON.stringify(this.data.typingPairsByPatient, 0, '\t')),
	// 	}, `(${Object.keys(data).length} patients)`)

	// 	// this.addDownload('patients', `typing distance pairs`, {
	// 	// 	// tsv: () => download(`${sourceInput.title_}_typing_distance_matrix_by_patient.tsv`, TALI.grid.stringify({ '': this.data.typingMatrixByPatient }, { sortRows: true, sortCols: true, pretty: 1 })),
	// 	// 	json: () => download(`${sourceInput.title_}_typing_pairs.json`, JSON.stringify(this.data.typingPairsByPatient, 0, '\t')),
	// 	// }, `(${Object.keys(pairs).length} distances)`)
	// 	// this.addResult('typing - distance - matrix',`with ${Object.keys(matrix).length} patients`)
	// 	// this.addMatrixDownload('patient', stats)
	// }

	// result(typingMatrixByPatient, typingPairsByPatient) {
	// 	console.log('type filter results', typingMatrixByPatient, typingPairsByPatient)
	// 	this.data.typingMatrixByPatient = typingMatrixByPatient
	// 	this.data.typingPairsByPatient = typingPairsByPatient
	// 	this.addDownload('filtered_typing_dist', `filtered typing distances`, {
	// 		tsv: () => download(`${sourceInput.title_}_type_dist_${this.formData.TD}_${this.formData.TI}.tsv`, TALI.grid.stringify({ '': this.data.typingMatrixByPatient }, { sortRows: true, sortCols: true, pretty: 0 })),
	// 		json: () => download(`${sourceInput.title_}_type_pairs_${this.formData.TD}_${this.formData.TI}.json`, JSON.stringify(this.data.typingPairsByPatient, 0, '\t')),
	// 	}, `(${Object.keys(typingMatrixByPatient).length} patients)`)
	// }




	// addMatrixDownload(type, stats) {
	// 	this.addDownload(type, `${type} distance matrix`, {
	// 		tsv: () => download(`${sourceInput.title_}_${type}_distance_matrix.tsv`, TALI.grid.stringify({ [type]: this.data[type + 'Matrix'] }, { sortRows: true, sortCols: true, pretty: 1 })),
	// 		json: () => download(`${sourceInput.title}_${type}_pairs.json`, JSON.stringify(this.data[type + 'Pairs'], 0, '\t')),
	// 	}, `(${stats.keys} ${type}s, ${stats.values} distances)`)
	// }
}



