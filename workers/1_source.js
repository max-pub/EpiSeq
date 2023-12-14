// import { unique } from '../lib/deps.js'
import { TALI } from '../lib/deps.js'
import { getPatientAndEntryCounts } from '../lib/stats.js'



onmessage = event => {
	// console.log('INPUT WORKER', event.data)
	let [action, key, P] = event.data
	postMessage(['start'])
	if (action == 'file')
		loadFile(key, P)
	if (action == 'url')
		loadURL(key, P)
}


// let KEYS = new Set()

export async function loadFile(key, file) {
	let t0 = Date.now()
	postMessage(['name', key, file.name])
	let text = await file.text()
	parse(key, file.name, text, t0)
}


export async function loadURL(key, url) {
	let t0 = Date.now()
	let name = url.split('/').slice(-1)[0]
	postMessage(['name', key, name])
	let text = await fetch(url).then(x => x.text())
	parse(key, name, text, t0)
}


export async function parse(key, name, text, t0) {
	// KEYS.add(key)
	// postMessage(['keys', KEYS.size])
	postMessage(['size', key, name, text.length])
	// let data = parseTSV(text)
	let data = Object.values(TALI.grid.parse(text))[0]
	postMessage(['data', key, name, data])
	let stats = getPatientAndEntryCounts(data)
	postMessage(['stat', key, name, stats])
	postMessage(['time', key, name, Date.now() - t0])

}











