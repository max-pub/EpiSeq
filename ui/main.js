// import { $, $$, download } from './dom.js'
// import { unique } from '../lib/deps.js'
import { TALI, template } from '../lib/deps.js'
// import { showCorrelationChart, showCorrelationChart2, showLocationChart, showTypeChart } from './chart.js'
import * as FORM from './forms.js'

import * as FLOW from './flow.js'
import { diagonalX } from '../lib/matrix.js'



export const TEMPLATE = Object.fromEntries(await Promise.all(['stat_list', 'stat_dist'].map(async x => [x, template(await fetch(`./templates/${x}.html`).then(x => x.text()))])))

// export const WORKER = Object.fromEntries(['source', 'matrix_typings', 'matrix_locations', 'filter', 'pseudonymize', 'correlation'].map(worker => [worker, new Worker(`./workers/${worker}.js`, { type: "module" })]))
export const WORKER = Object.fromEntries(['1_source', '2_source_filter', '2_pseudonymize', '3_typing_distance', '4_typing_filter', '5_location_contacts', '6_location_filter', '7_correlation'].map(worker => [worker.slice(2), new Worker(`./workers/${worker}.js`, { type: "module" })]))


for (let name in WORKER)
	WORKER[name].onmessage = event => {
		// console.log("RESPONSE", name, event.data[0])
		FLOW[name][event.data[0]]?.(...event.data.slice(1))
	}




export let DATA = {
	source: {},
	source_filter: {},
	typing_distance: {},
	typing_filter: {},
	location_contacts: {},
	// location_filter: {},
	// correlation: {},
}
export let STATS = {
	source_filter: {},
	pseudonymization: {},
}


export const dataOrder = ['source', 'source_filter', 'typing_distance', 'typing_filter', 'location_contacts', 'location_filter', 'correlation']

export function clear(index) {
	// console.log('clear',list)
	for (let key of dataOrder.slice(index))
		DATA[key] = {}
	updateState()
}

export function updateState() {
	// console.log('update state',DATA)
	for (let key in DATA) {
		// console.log('update', key)
		FORM[key].updateState()
	}
	// if (Object.keys(DATA[key]).length == 0)
	// 	FORM[key].clear()
}





export function cleanNumbers(data) {
	let out = {}
	for (let table in data) {
		out[table] ??= {}
		for (let row in data[table]) {
			out[table][row] ??= {}
			for (let col in data[table][row]) {
				out[table][row][col] = null
				if (![undefined, null, 'xxx'].includes(data[table][row][col]))
					out[table][row][col] = data[table][row][col].toFixed(2)
			}
		}
	}
	for (let cl in out)
		diagonalX(out[cl])
	return out
}







