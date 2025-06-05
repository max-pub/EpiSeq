import { TALI, lines, trim, parseDate } from "./deps.x.js"
// import { parse, stringify } from "jsr:@std/csv";

function csvImport(csv) {
	let x = lines(csv).map(line => line.split(';').map(cell => trim(cell, '"')))
	let header = x[0]
	let output = []
	for (let line of x.slice(1)) {
		let temp = {}
		for (let i in line) {
			temp[header[i]] = line[i]
		}
		output.push(temp)
	}
	return output
}

function transform(data) {
	let output = {}
	for (let line of data) {
		let sampleID = line['Sample ID']
		let temp = {
			patientID: line['Patient ID'],
			sampleDate: parseDate(line['Collection Date']),
		}
		if (!temp.patientID) continue
		for (let key in line) {
			let digits = key.replace(/[^0-9]/g, "")
			// console.log(key, digits)
			if (digits.length > 0) {
				temp[key] = line[key].replace(/[^0-9]/g, "")
			}
		}
		// console.log(parseDate(line['Collection Date']))
		output[sampleID] = temp
	}
	return output
}

if (import.meta.main) {
	// console.log('yeah', Deno.args)
	let csv = Deno.readTextFileSync(Deno.args[0])
	let data = csvImport(csv)
	// Deno.writeTextFileSync('test.json', JSON.stringify(data, 0, 4))
	let data2 = transform(data)
	// console.log(data2)
	Deno.writeTextFileSync(Deno.args[1] + '.tsv', TALI.grid.stringify({ sequenceID: data2 }, { sortCol: 'sampleDate' }))
}