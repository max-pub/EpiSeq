import { Base } from '../lib/mod.base.js'
import { download } from '../lib/deps.js'
import { TALI } from "../lib/deps.js"
import { locationDistance, sourceFilter, sourceInput, typeDist, typeFilter } from '../lib/mod.js'
import { ddLog } from '../lib/matrix.js';
import { countBothIDs, infoTable } from '../2_source_filter/worker.js'

// Node.prototype.$$ = (x)=>[...this.querySelectorAll(x)]

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}


export default new class extends Base {
	domID = 'source'
	appMode = ''
	mroNames = { coli: 'MDR E. coli', mrsa: 'MRSA', vre: 'VRE', monas: 'P. aeruginosa' }

	constructor() {
		super()
		this.addThreads({ thread: './worker.js'}, import.meta.url)
		this.addTemplates({ base: './base.html', upload: './upload.html', demo: './demo.html' }, import.meta.url)
	}

	async setup() {
		await this.isReady()
		this.domRoot = this.base()
		this?.find('#upload-list')?.addEventListener('click', () => this.customList())
		this?.find('#demo-list')?.addEventListener('click', () => this.demoList())
		this?.find('#demo-dist')?.addEventListener('click', () => this.demoDist())
	}
	updateState() {
		this.enabled(this.formData.typings && this.formData.locations)
	}

	init() {
		this.clear()
		this.clearBelow()
	}

	customList() {
		this.init()
		this.appMode = 'uploadList'
		this.find('#app-mode').innerHTML = this.upload()
		// upload listeners
		for (let type of ['typings', 'locations'])
			this.find(`.${type} input`).addEventListener('change', event => this.updateState())
		this.find('form').addEventListener('submit', event => this.loadCustomList(event))

	}
	demoList() {
		this.init()
		this.appMode = 'demoList'
		this.find('#app-mode').innerHTML = this.demo()
		// demo listeners
		this.domRoot.querySelectorAll('[demo]') // activate demo - links
			.forEach(node => node.addEventListener('click', () => this.loadDemoList(node.getAttribute('demo'))))

	}
	demoDist() {
		this.init()
		this.appMode = 'demoDist'
		this.find('#app-mode').innerHTML = this.demo()
		// demo listeners
		this.domRoot.querySelectorAll('[demo]') // activate demo - links
			.forEach(node => node.addEventListener('click', () => this.loadDemoDist(node.getAttribute('demo'))))
	}


	initLoading() {
		this.data = { typingList: {}, locationList: {} }
		this.done = new Set()
		this.find('#app-mode').innerHTML = ''
		// console.log('app-mode', this.find('#app-mode'))
		this.init()
		this.showProgress(true)
		this.startTimer()
	}


	async loadCustomList(event) {
		event?.preventDefault?.()
		// this.title = this.find('.title input').value
		let { title, typings, locations } = this.formData
		this.title = title
		this.initLoading()
		await this.thread.loadFile(typings, 'typing', 'list')
		await this.thread.loadFile(locations, 'location', 'list')
		await this.exit()
	}


	async loadDemoList(mro) {
		this.title = this.mroNames[mro]
		this.initLoading()
		await this.thread.loadURL(window.location.href + `demo/listOrig/${mro}/cgmlst.tsv`, 'typing', 'list')
		await this.thread.loadURL(window.location.href + `demo/listOrig/${mro}/locations.tsv`, 'location', 'list')
		await this.exit()
	}


	async loadDemoDist(mro) {
		this.title = this.mroNames[mro]
		typeDist.data = {}
		locationDistance.data = {}
		this.initLoading()
		await this.thread.loadURL(window.location.href + `demo/dist/${mro}/typings.tsv`, 'typing', 'dist')
		await this.thread.loadURL(window.location.href + `demo/dist/${mro}/locations.tsv`, 'location', 'dist')
		await this.exit()
	}



	total(count) {
		// console.log('mod total', count)
		this.totalBytes = count
		// this.data_ = {}
	}
	row(key, type, table, id, dict, done) {
		// let percent = ((done / this.total_) * 100).toFixed(1)
		// console.log(done, this.totalBytes)
		this.progress(done, this.totalBytes, `parse ${key}...`)
		// console.log('mod row', table, id, done, percent, dict)
		if (type == 'list') {
			// console.log(key, type, table, id, '--', done, this.totalBytes)
			// this.data[key + 'List'] ??= {}
			this.data[key + 'List'][id] = dict
		}
		if (type == 'dist') {
			if (key == 'typing') {
				typeDist.data[table] ??= {}
				typeDist.data[table][id] = dict
			}
			if (key == 'location') {
				locationDistance.data[table] ??= {}
				locationDistance.data[table][id] = dict
			}
		}
		// this.data_[table] ??= {}
		// this.data_[table][id] = dict
	}

	done2(key, type) {
		console.log("DONE:", key, type)
		// console.trace()
		if (type == 'list') {
			// let count = countBothIDs(this.data[key + 'List'])
			// this.addDone(`${this.title} ${key} data: ${count.ids} ids, ${count.pids} patients`)
			this.addDone(`${this.title} ${key} data loaded`)
			this.done.add(key)
			console.log('done', this.done)
			if (this.done.size == 2) {
				let x = { typings: countBothIDs(this.data.typingList), locations: countBothIDs(this.data.locationList) }
				this.addCount(`${x.typings.ids} sequences (${x.typings.pids} patients) and ${x.locations.ids} locations (${x.locations.pids} patients)`)
				// this.infoTable()
				sourceFilter.initAndRun()
			}
		}
		if (type == 'dist') {
			this.addDone(`${this.title} ${key} data loaded`)
			this.done.add(key)
			if (this.done.size == 2) {
				// console.log('typeDist data', typeDist.data)
				this.addCount(`${Object.keys(typeDist.data.typingMatrix).length} typing patients and ${Object.keys(locationDistance.data.clinic).length} typing patients and `)
				typeFilter.initAndRun()
			}
		}
	}

	infoTable() {
		// let count = this.countBothIDs(this.data.locationList)
		// console.log('info count', count)
		let table = infoTable(this.data.typingList, this.data.locationList)
		this.find('div.table').innerHTML = TALI.grid.stringify({ '': table }, { flip: true, format: 'html', caption: true })
		this.addDownload('infoTable', 'source stats', {
			tsv: () => download(`${sourceInput.title}_source_raw_distribution.tsv`, TALI.grid.stringify({ '': table }, { flip: true, pretty: 4 }))
		}, ``)
	}

	// countBothIDs(list) {
	// 	let ids = new Set(), pids = new Set()
	// 	for (let id in list) {
	// 		ids.add(id)
	// 		pids.add(list[id].patientID)
	// 	}
	// 	return { ids: ids.size, pids: pids.size }
	// }




	// get title() {
	// 	return this.find('form .title input').value
	// }
	get title_() {
		return this.title.replaceAll(/[^a-z0-9]/gi, '')
	}
	// set title(v) {
	// 	this.find('form .title input').value = v
	// }

	get formData() {
		return {
			title: this.find('form .title input').value,
			typings: this.find('form .typings input').files[0],
			locations: this.find('form .locations input').files[0],
		}
	}




}





