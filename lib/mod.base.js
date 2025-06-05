import { space } from './apex.bridge.js';
import { Thread, template, $, prettyNumber } from './deps.js'

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export class Base {
	// &darr; &bull; &check;
	data = {}

	_downloads = []


	async addThreads(threads = {}, baseURL) {
		for (let name in threads)
			this[name] = await new Thread(threads[name], baseURL).init({ responder: this })
		this._threadsLoaded = true
		// console.log(this.domID, 'workers loaded')
	}
	async addTemplates(templates = {}, baseURL) {
		for (let name in templates)
			this[name] = template(await fetch(new URL(templates[name], baseURL)).then(x => x.text()))
		this._templatesLoaded = true
		// console.log(this.domID, 'templates loaded')
	}



	async isReady() {
		while (!this._templatesLoaded || !this._threadsLoaded) {
			await sleep(10)
		}
		return true
	}
	startTimer() {
		// console.log('start timer for', this.domID)//, Object.keys(MOD))
		this.t0 = Date.now()
	}


	// async isDefined(...p) {
	// 	console.log('isDefined',p)
	// 	while (p.filter(p => p).length != p.length) {
	// 		console.log(p.map(x => x ? true : false))
	// 		await sleep(10)
	// 	}
	// 	return true
	// }

	async isDefined(base, ...p) {
		// console.log('isDefined', p)
		while (p.filter(x => base[x]).length != p.length) {
			// console.log(p.map(x => base[x] ? true : false))
			// console.log(p.map(x => base[x]))
			await sleep(10)
		}
		return true
	}

	async isDefined(base, p) {
		while (!base[p])
			await sleep(10)
		return base[p]
	}

	async initAndRun(event) {
		await this.init(event)
		await this.run(event)
	}
	async init(event) {
		event?.preventDefault?.()
		await this.isReady()
		if (this.domRoot.innerHTML.trim() == '') {
			this.domRoot = this.template()
			this.find('form')?.addEventListener?.('submit', event => this.run(event))
		}
		this.clear()
		this.clearBelow()
		return this
	}
	start(event) {
		event?.preventDefault?.()
		this.clear()
		this.clearBelow()
		this.startTimer()
		this.showProgress(true)
		return this
	}
	async exit() {
		this.showProgress(false)
		this.activateDownloads()
		// await sleep(10) // because of stupid firefox bug... 
	}







	get domRoot() {
		return document.querySelector('#' + this.domID)
	}
	set domRoot(value) {
		this.domRoot.innerHTML = value
	}
	get form() {
		return this.find('form')
	}
	get formData() { return {} }
	get formString() {
		return Object.entries(this.formData).filter(x => !['TD', 'CD'].includes(x[0])).map(x => `${x[0]}=${x[1]}`).join(space(5)) //—
	}
	get formString_() {
		return Object.entries(this.formData).filter(x => !['xx'].includes(x[0])).map(x => `${x[0]}_${x[1]}`).join('___')
	}
	get chartBox() {
		return this.find('.chart-box')
	}




	clear() {
		for (let x of ['.done', '.downloads', '.chart-box', '.table'])
			try { this.find(x).innerHTML = '' } catch { }
		// this.find('.done').innerHTML = ''
		// this.find('.downloads').innerHTML = ''
		// try { this.find('.chart-box').innerHTML = '' } catch { }
	}
	clearBelow() {
		let order = ['source', 'source_filter', 'typing_distance', 'location_distance', 'typing_filter', 'location_filter', 'correlation']
		let index = order.indexOf(this.domID)
		let below = order.slice(index + 1)
		// console.log('clear all', this.domID, index, below)
		for (let key of below)
			$(`#${key}`).innerHTML = ''
	}



	find(path) {
		return this.domRoot.querySelector(path)
	}

	enabled(bool) {
		// console.log('enable', Boolean(bool), this.base)
		this.find('[type=submit]').disabled = !bool
	}
	// reset() {
	// 	this.form.reset()
	// }





	showProgress(x) {
		this._progress = {}
		try {
			this._progress.progress = this.find('progress')
			this._progress.label = this.find('progress').parentElement.querySelector('label')
			this._progress.wrapper = this.find('progress').parentElement
			this._progress.wrapper.hidden = !x
			// console.log('progress', this._progress)
		} catch { }
	}
	progress(current, max, info) {
		// console.log('progress', current, max)
		// if (current % 10 == 0)
		// console.log('progress::', current, max, this.domID, caller)
		// console.log('progress', current, max, caller)
		try {
			// let p = this.find('progress')
			this._progress.progress.value = current * 1
			this._progress.progress.max = max * 1
			if (info != this._progress.info) {
				this._progress.info = info
				this._progress.label.innerHTML = info
			}
			// this.find('#progress-value').innerHTML = prettyNumber(current) + ' bytes'
			// this.find('#progress-max').innerHTML = prettyNumber(max) + ' bytes'
			// this.find('#progress-max').innerHTML = prettyNumber(current) + 'kb / ' + prettyNumber(max) + ' kb'
		} catch { }
	}






	addDone(text, time) {
		// console.log('add done time', time)
		let ms = time ?? this.milliseconds()
		this.find('.done').innerHTML += `<div>&check; <span>${text}</span> <span class='milliseconds'>${isNaN(ms) ? '' : `(${prettyNumber(ms)} ms)`}</span></div>`
	}
	addCount(text, br = true) {
		this.find('.done').innerHTML += `<div>&rarr; <span>${text}</span> </div>` + (br ? '<br/>' : '')
	}
	addResult(title, text) {
		this.find('.downloads').innerHTML += `<div class=''>&rarr; <b>${title}</b> ${text} </div>`

	}
	addDownload(key, text, a = { tsv: '', json: '' }, info = '') {
		// return
		this.find('.downloads').innerHTML += `<div class='${key}'>&darr; download <b>${text}</b> as ${Object.keys(a).map(x => `<a class='passive ${x}'>${x}</a>`).join(' or ')} <info>${info}</info> </div>`
		for (let x in a)
			this._downloads.push([`.downloads .${key} a.${x}`, a[x]])
		// this._downloads.push([this.find(`.downloads .${key} a.${x}`), a[x]])
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

}