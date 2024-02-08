// import { unique } from '../lib/deps.js'
import { TALI } from '../lib/deps.js'
import { getPatientAndEntryCounts } from '../lib/stats.js'



onmessage = event => {
	// console.log('INPUT WORKER', event.data)
	let [action, key, P] = event.data
	// postMessage(['started'])

	if (action == 'file')
		loadFile(key, P)
	if (action == 'url')
		loadURL(key, P)
}


// let KEYS = new Set()

export async function loadFile(key, file) {
	let t0 = Date.now()
	postMessage(['started', key, file.name])
	let text = await file.text()
	postMessage(['loaded', key, file.name, Date.now() - t0])
	parse(key, file.name, text, t0)
}


export async function loadURL(key, url) {
	let t0 = Date.now()
	let name = url.split('/').slice(-1)[0]
	postMessage(['started', key, name])
	let text = await fetch(url).then(x => x.text())
	postMessage(['loaded', key, name, Date.now() - t0])
	parse(key, name, text)
}


export async function parse(key, name, text) {
	// KEYS.add(key)
	// postMessage(['keys', KEYS.size])
	let t0 = Date.now()
	postMessage(['size', key, name, text.length])
	// let data = parseTSV(text)
	let data = Object.values(TALI.grid.parse(text))[0]
	postMessage(['data', key, name, data])
	let stats = getPatientAndEntryCounts(data)
	postMessage(['stat', key, name, stats])
	// postMessage(['time', key, name, Date.now() - t0])
	postMessage(['parsed', key, name, Date.now() - t0])

}











