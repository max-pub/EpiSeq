// import { TALI } from "./deps.x.js"
import { parseURL, parse } from './tali/parse.js'
import { stringify } from './tali/stringify.js'

function createPidMap(pids) {
	return Object.fromEntries(pids.map(x => [x.OLD_PID, x.NEW_PID]))
}

function replace0(data, pidMap) {
	for (let i = 1; i < 30; i++) {
		console.log('iteration', i)
		let x = false
		for (let key in data) {
			let pid = data[key].patientID
			if (pid in pidMap) {
				if (pid == pidMap[pid]) {
					// console.log('                                 same    ', pid, '==', pidMap[pid])
					continue
				}
				if (pid == pidMap[pidMap[pid]]) {
					if (pidMap[pid] > pid) {
						// console.log('                                 circular', pid, '<>', pidMap[pid])
						continue
					}
				}
				if (pid == pidMap[pidMap[pidMap[pid]]]) {
					console.log('                                 circular-3', pid, '<>', pidMap[pid], '<>', pidMap[pidMap[pid]])
					continue
				}
				console.log('replace', pid, pidMap[pid])
				data[key].patientID = pidMap[pid]
				x = true
			}
			// console.log(data1[key].sampleDate)
		}
		if (x == false) break
	}
	return data
}

function replace(data, pidMap) {
	for (let key in data) {
		let pid = data[key].patientID
		if (pid in pidMap) {
			let map = [pid]
			for (let i = 0; i < 30; i++) {
				let last = map.slice(-1)[0]
				let next = pidMap[last]
				// console.log('test', i, ':  ', pid, '--', last, '--', next)
				if (map.includes(next)) {
					// console.log('circle')
					map = [... new Set(map)].sort().reverse()
					break
				}
				if (next != undefined) {
					map.push(next)
					// console.log('map', map)
				} else {
					break
				}

			}
			map = map.filter(x => x.length == 8)
			let newPID = map.slice(-1)[0]
			// console.log('map', pid, newPID, map)

			console.log('replace: ', pid, ' - with - ', newPID, '--', map)
			data[key].patientID = newPID
			// x = true
		}
		// console.log(data1[key].sampleDate)
	}
	return data
}


if (import.meta.main) {
	let [pidFile, dataFile, outFile] = Bun.argv.slice(2)
	console.log('arguments:', pidFile, dataFile, outFile)
	let pids = JSON.parse(await Bun.file(pidFile).text())
	// let pids = JSON.parse(Deno.readTextFileSync(Deno.args[0]))
	let pidMap = createPidMap(pids)
	// console.log(pidMap)

	let data = await parse(await Bun.file(dataFile).text())
	// let data = TALI.grid.parse(Deno.readTextFileSync(Deno.args[1]))
	// console.log(data)
	let key = Object.keys(data)[0]
	let sortCol = key == 'locationID' ? 'from' : 'sampleDate'
	console.log('KEY', key, 'sort', sortCol)
	// Bun.exit()
	data = Object.values(data)[0]
	data = replace(data, pidMap)

	await Bun.write(outFile, stringify({ [key]: data }, { sortCol }))
	// Deno.writeTextFileSync(Deno.args[2] + '.tsv', TALI.grid.stringify({ [key]: data }, { sortCol }))
}