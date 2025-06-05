import { Base } from '../lib/mod.base.js'
import { download, prettyNumber } from '../lib/deps.js'
import { TALI } from "../lib/deps.js"
import { locationFilter, sourceFilter, sourceInput, typeDist, typeFilter } from '../lib/mod.js'
import { ddLog, diagonalNull } from '../lib/matrix.js'


export default new class extends Base {
	domID = 'location_distance'

	constructor() {
		super()
		this.addThreads({ thread: './worker.js' }, import.meta.url)
		this.addTemplates({ template: './template.html' }, import.meta.url)
	}


	async run(event) {
		await this.start(event)

		await this.isDefined(sourceFilter.data, 'locationList') // only for firefox bug
		// await this.isDefined(typeFilter.data, 'typingPairsByPatient') // only for firefox bug
		// await this.thread.start(sourceFilter.data.locationList, typeFilter.data.typingPairsByPatient, this.formData)
		await this.thread.start(sourceFilter.data.locationList)

	}

	async done() {
		await this.exit()
		typeFilter.initAndRun()
		// locationChart.initAndRun()
	}


	locationList(data, dropped) {
		// this.data.locationList = data
		// this.addDone(`removed ${dropped} entries from location-list where patients were filtered out of the typing-distance-matrix`)
		// this.addDownload('list', 'location list', {
		// 	tsv: () => download(`${sourceInput.title_}_locations_${typeFilter.string_}.tsv`, TALI.grid.stringify({ '': DATA[this.base].list }, { sortRows: true, sortCols: true, pretty: 1 })),
		// }, ``)
		// this.addResult('location list', `with ${Object.keys(data).length} entries`)
	}

	locationTree(data) {
		// this.data.locationTree = data
		// this.addDone(`converted list to tree`)
		// let filename = `${sourceInput.title}_locations_${typeFilter.formString_}`
		// this.addDownload('locList', 'location list', {
		// 	// tsv: () => download(`${filename}.tsv`, TALI.grid.stringify({ '': data }, { sortRows: true, sortCols: true, pretty: 1 })),
		// 	json: () => download(`${filename}.json`, JSON.stringify(data, 0, '\t')),
		// }, ``)
		// this.addResult('location list',`with ${Object.keys(data).length} entries`)
		// this.addResult('location list', `with ${Object.keys(data).length} patients`)
	}

	contactTree(data, total) {
		// this.data.contactTree = data
		// this.addDone(`calculated contacts between patients`)
		// this.addDownload('contacts', 'contact matrix', {
		// 	json: () => download(`${sourceInput.title}_contacts_${typeFilter.formString_}.json`, JSON.stringify(data, 0, '\t')),
		// }, ``)		// this.find('progress').replaceWith(stringToNode(`${this.milliseconds(1)} ms`))
		// this.addResult('location - contact - matrix', `with ${Object.keys(data).length} patients`)
	}

	contactMatrix(data, counts) {
		this.addDone(`calculated contacts between patients`)
		this.data = data
		for (let type in counts)
			this.addCount(`${type}-level:  ${prettyNumber(counts[type])} contacts`, false)
			// this.addCount(`${type}: ${Object.keys(this.data[type]).length} patients with ${prettyNumber(counts[type])} contacts`, false)
		// this.data.contactMatrix = data
		console.log('contactMatrix counts', counts)
		// ddLog(data,'contact matrix mod')
		this.addDownload('contacts', `contact distance matrix`, {
			tsv: () => download(`${sourceInput.title_}_location_distance_matrix.tsv`, TALI.grid.stringify(this.data, { sortRows: true, sortCols: true, pretty: 0 })),
			// json: () => download(`${sourceInput.title_}_typing_pairs_by_patient.json`, JSON.stringify(this.data.typingPairsByPatient, 0, '\t')),
		})//, `(${Object.keys(data).length} patients)`)

	}
}



