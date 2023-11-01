// import { unique } from '../lib/deps.js'
import { TALI } from '../lib/deps.js'
import { getPatientAndEntryCounts } from '../lib/stats.js'

// import * as clear from './clear.js'


onmessage = event => {
	console.log('INPUT WORKER', event.data)
	let [action, key, P] = event.data
	postMessage(['start'])
	if (action == 'file')
		loadFile(key, P)
	if (action == 'url')
		loadURL(key, P)
}


let KEYS = new Set()

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
	KEYS.add(key)
	postMessage(['keys', KEYS.size])
	postMessage(['size', key, name, text.length])
	// let data = parseTSV(text)
	let data = Object.values(TALI.grid.parse(text))[0]
	postMessage(['data', key, name, data])
	let stats = getPatientAndEntryCounts(data)
	postMessage(['stat', key, name, stats])
	postMessage(['time', key, name, Date.now() - t0])

}












// export function parseTSV(text) {
// 	return Object.values(TALI.grid.parse(text))[0]
// }



// postMessage(['size', key, file.name, text.length])
// let data = parseTSV(text)
// postMessage(['data', key, file.name, data])
// let stats = getPatientAndEntryCounts(data)
// postMessage(['stat', key, file.name, stats])
// postMessage(['time', key, file.name, Date.now() - t0])


// export async function loadFile(event) {
// 	// $('#loadResult').innerHTML = 'loading...'
// 	let file = event.target.files[0]
// 	return await loadTextFile(file)
// }


// export async function loadDemo(mro) {
// 	// $('#loadResult').innerHTML = 'loading...'
// 	// console.log("FUCK", await fetch('demo/cgmlst.tsv').then(x => x.text()))
// 	// $('#source .paths .typings').innerHTML = new URL(document.location.href + `demo/${mro}/cgmlst.tsv`).toString()
// 	let output = {
// 		typings: { url: new URL(document.location.href + `demo/${mro}/cgmlst.tsv`) },
// 		locations: { url: new URL(document.location.href + `demo/${mro}/locations.tsv`) }
// 	}
// 	for (let key in output)
// 		output[key].text = await fetch(output[key].url).then(x => x.text())

// 	console.log('demo', mro, output)
// 	return output
// 	// {
// 	// 	typings: await fetch(`demo/${mro}/cgmlst.tsv`).then(x => x.text()),
// 	// 	locations: await fetch(`demo/${mro}/locations.tsv`).then(x => x.text())
// 	// }
// 	// console.log('li', LIST.cgmlst)
// }