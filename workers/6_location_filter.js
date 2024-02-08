import { select, unique } from '../lib/deps.js'

onmessage = event => {
	run(...event.data)
}

function run(contacts, options) {
	postMessage(['started'])
	// console.log('loc filter', contacts, options)
	contacts = filter(contacts, options)

	postMessage(['summary', locationSummary(contacts)])
	postMessage(['finished'])
}

function filter(contacts, options) {
	let out = {}
	let CL = options.CL == 'any' ? ['clinic', 'ward', 'room'] : [options.CL]
	let CI = options.CI * 24 * 60 * 60
	// console.log("FILTERS", CL, CI, contacts)
	let total = 0
	let pids = Object.keys(contacts)
	for (let pid1 in contacts) {
		postMessage(['progress', pids.indexOf(pid1)+1, pids.length])
		for (let pid2 in contacts[pid1]) {
			// let items = options.CL == 'any' ? Object.values(contacts[pid1][pid2]) : contacts[pid1][pid2][options.CL]
			// console.log('items', items)
			let contactPoints = checkOne(contacts[pid1][pid2], { CL, CI })
			// if (contactPoints.length == 0) continue
			if (Object.keys(contactPoints).length == 0) continue
			total++
			out[pid1] ??= {}
			out[pid1][pid2] = contactPoints
			out[pid2] ??= {}
			out[pid2][pid1] = contactPoints
		}
	}
	postMessage(['contacts', out, total])
	return out
}

function checkOne(contact, options) {
	// console.log('checkOne', contact, options)
	let out = {}
	for (let contactLevel of options.CL) {
		// console.log('test',contactLevel,contact[contactLevel])
		for (let location in contact[contactLevel] ?? {}) {
			// console.log('test', contact[contactLevel][location], CI)
			if (contact[contactLevel][location] > options.CI) {
				out[contactLevel] ??= {}
				out[contactLevel][location] = contact[contactLevel][location]

				// out.push(location)
			}
		}
	}
	return out
}
// function checkOne(contact, options) {
// 	// console.log('checkOne', contact, options)
// 	let out = []
// 	for (let contactLevel of options.CL) {
// 		// console.log('test',contactLevel,contact[contactLevel])
// 		for (let location in contact[contactLevel] ?? {}) {
// 			// console.log('test', contact[contactLevel][location], CI)
// 			if (contact[contactLevel][location] > options.CI) {
// 				out.push(location)
// 			}
// 		}
// 	}
// 	return out
// }

// function locationSummary(contacts) {
// 	let out = {}
// 	for (let pid1 in contacts) {
// 		for (let pid2 in contacts[pid1]) {
// 			for (let loc of contacts[pid1][pid2]) {
// 				out[loc] ??= { count: 0 }
// 				out[loc].count++
// 			}
// 		}
// 	}
// 	return out
// }

function locationSummary(contacts) {
	let out = {}
	for (let pid1 in contacts) {
		for (let pid2 in contacts[pid1]) {
			for (let type in contacts[pid1][pid2]) {
				for (let loc in contacts[pid1][pid2][type]) {
					out[type] ??= {}
					out[type][loc] ??= { count: 0 }
					out[type][loc].count++
				}
			}
		}
	}
	return out
}