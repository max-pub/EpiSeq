// import { TALI } from "./deps.x.js"

// function createPidMap(pids) {
// 	return Object.fromEntries(pids.map(x => [x.OLD_PID, x.NEW_PID]))
// }

// function replace(data, pidMap) {
// 	for (let i = 1; i < 30; i++) {
// 		console.log('iteration', i)
// 		let x = false
// 		for (let key in data) {
// 			let pid = data[key].patientID
// 			if (pid in pidMap) {
// 				if (pid == pidMap[pid]) {
// 					console.log('                                 same    ', pid, '==', pidMap[pid])
// 					continue
// 				}
// 				if (pid == pidMap[pidMap[pid]]) {
// 					if (pidMap[pid] > pid) {
// 						console.log('                                 circular', pid, '<>', pidMap[pid])
// 						continue
// 					}
// 				}
// 				console.log('replace', pid, pidMap[pid])
// 				data[key].patientID = pidMap[pid]
// 				x = true
// 			}
// 			// console.log(data1[key].sampleDate)
// 		}
// 		if (x == false) break
// 	}
// 	return data
// }
import { stringify } from './tali/stringify.js'

// function parseDate(d) {
// 	return new Date(Date.parse(d)).toISOString().slice(0, 19)//.replace('T',' ')
// }

function transform(data) {
	let output = {}
	for (let line of data) {
		let locationID = line['LOCATION_ID']
		let temp = {
			patientID: line['PATIENT_ID'],
			from: line['FROM_DATE'],
			till: line['TILL_DATE'],
			// from: parseDate(line['FROM_DATE']),
			// till: parseDate(line['TILL_DATE']),
			clinic: line['CLINIC_ID'],
			ward: line['WARD_ID'],
			room: line['ROOM_ID'],
		}
		if (!temp.patientID) continue
		output[locationID] = temp
	}
	return output
}

// async function readLargeTextFile(path) {
// 	const file = await Deno.open(path);
// 	const reader = file.readable.getReader();
// 	const decoder = new TextDecoder()
// 	let output = ''
// 	for await (const buffer of Deno.iter(file)) {
// 		let text = decoder.decode(buffer)
// 		output += text
// 		// console.log(text)
// 	}
// 	return output
// 	// while(true) {
// 	//   // Process each chunk
// 	//   const { value, done } = reader.read();
// 	//   console.log(value)
// 	//   /// ...
// 	//   if (done) break;
// 	// }
// }
if (import.meta.main) {
	// console.log('yeah', Deno.args)
	console.log('yeah', Bun.argv)
	let text = await Bun.file(Bun.argv[2]).text()
	console.log(text.split('\n').slice(-2)[0].slice(0, 100))
	let data = JSON.parse(text.split('\n').slice(-2)[0])
	data = transform(data)

	// console.log(stringify({ locationID: data }, { sortCol: 'patientID' }))
	await Bun.write(Bun.argv[3] + '.tsv', stringify({ locationID: data }, { sortCol: 'from' }))
}