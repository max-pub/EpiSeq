// import { Thread } from '../../thread.js/mod.js'
import { Thread } from '../lib/deps.js'

export function splitLines(string = "") {
	return string?.split('\r\n')?.flatMap(x => x.split('\r'))?.flatMap(x => x.split('\n')) ?? []
}

function byteOutput(bytes) { // kb for now
	return Math.round(bytes / 1024)
}

async function* byteStream(url) {
	const response = await fetch(url)
	const total = Number(response.headers.get('content-length'))
	// console.log('bytes', url, total)
	// Thread.post.total(total)
	Thread.post.total(byteOutput(total))
	// console.log('total',total)
	let loaded = 0
	for await (const bytes of response.body) {
		loaded += bytes.length
		yield bytes
	}
}
async function* charStream(byteStream) {
	let decoder = new TextDecoder()
	for await (const bytes of byteStream)
		yield decoder.decode(bytes)
}

async function* lineStream(charStream) {
	let line = ''
	for await (const chars of charStream) {
		let parts = splitLines(chars)
		line += parts[0]
		if (parts.length > 1) {
			yield* [line, ...parts.slice(1, -1)]
			// yield line
			// for (let part of parts.slice(1, -1))
			// 	yield part
			line = parts.slice(-1)[0]
		}
	}
	yield line
}

async function* lineStreamFromText(text) {
	Thread.post.total(byteOutput(text.length))
	for (let line of splitLines(text))
		yield line
}

export async function* taliStream(lineStream, options = {}) {
	options = { replacements: {}, ...options }
	options.replacements = { '': undefined, 'x': undefined, ...options.replacements }
	options.skipValues = ['', 'x', 'null', 'undefined', 'NaN', 'Invalid Date', null, undefined, NaN]
	// let lines = []
	let table = ''
	let header = []
	let total = 0
	let out = {}
	// let t0 = Date.now()
	// return
	// let replacements = { '': undefined, 'x': undefined }
	// for (const line of lines(await fetch(url).then(x => x.text()))) {
	for await (const line of lineStream) {
		// for await (const line of loadLines(url)) {
		// console.log('.',line)
		// let tabs = line[0].split('\t')
		// console.log('line',line)
		total += line.length
		let tabs = line.split('\t')
		// lines.push(tabs)
		// console.log(tabs.length)
		if (tabs.length < 2) {
			// console.log('next', tabs.length, line[1])
			table = ''
			header = []
			continue
		}
		if (!table && tabs.length > 1) {
			table = tabs[0]
			header = tabs.slice(1)
			header.unshift('')
			// console.log("HEADER", header, tabs)
			out[table] = {}
			// Thread.post.table(table)
			// console.log(table, '--', tabs)
			continue
		}
		let id = tabs[0]
		// let values = tabs
		// continue
		// let values = tabs.slice(1).map(cell => cell in options.replacements ? options.replacements[cell] : cell)
		// continue
		// let values = tabs.slice(1)
		// continue
		let dict = {}
		for (let i = 1; i < tabs.length; i++) {
			let cell = tabs[i]//.replaceAll(':T:','\t').replaceAll(':L:','\n')
			if (options.skipValues.includes(cell)) continue
			cell = cell in options.replacements ? options.replacements[cell] : cell
			if (options.parseFloat) {
				let n = parseFloat(cell)
				if (!isNaN(n)) cell = n
			}
			dict[header[i]] = cell in options.replacements ? options.replacements[cell] : cell
		}
		// continue
		// let dict = Object.fromEntries(values.map((v, i) => [header[i], v])) // super slow
		// yield [table, id, dict, total]
		yield [table, id, dict, total]
		// Thread.post.total((total / 1024 / 1024).toFixed(1) * 1)

		// Thread.post.row(table, id, dict, total)
		// Thread.post.row(table, id, total)
		// out[table][id] = dict
		// continue
		// if (table == 'locationID')
		// console.log(table, id, dict)

		// console.log('--', line[1], line[2])
	}
	// console.log('TOTAL:', Date.now() - t0)
	// return out
	// console.log(lines)
}

function supportsStreaming() {
	return navigator.userAgent.toLowerCase().includes('firefox')
}

export async function loadURL(url, key, type) {
	if (supportsStreaming())
		await loadURL_stream(url, key, type)
	else
		await loadURL_text(url, key, type)
}

async function loadURL_stream(url, key, type) {
	console.log('stream (firefox only)', url)
	let stream = lineStream(charStream(byteStream(url)))
	await outputStream(stream, key, type)
}
async function loadURL_text(url, key, type) {
	let text = await fetch(url).then(x => x.text())
	let stream = lineStreamFromText(text)
	await outputStream(stream, key, type)
}

export async function loadFile(file, key, type) {
	let text = await file.text()
	let stream = lineStreamFromText(text)
	await outputStream(stream, key, type)
}


async function outputStream(lineStream, key, type) {
	for await (let [table, id, dict, total] of taliStream(lineStream, { parseFloat: type == 'dist' })) {
		Thread.post.row(key, type, table, id, dict, byteOutput(total))
	}
	// console.log('worker done')
	Thread.post.done2(key, type)
}
