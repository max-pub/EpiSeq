import { parseURL, parse } from './tali/parse.js'
import { stringify } from './tali/stringify.js'

if (import.meta.main) {
	let [locationFile, typingFile, outFile] = Bun.argv.slice(2)
	console.log('arguments:', locationFile, typingFile, outFile)

	// let typings = await fs.readStream(file,'utf8').pipeTo(TALI_grid)
	// typings.grid(0).column('patientID').unique.list

	let locations = await parse(await Bun.file(locationFile).text())
	locations = Object.values(locations)[0]
	let typings = await parse(await Bun.file(typingFile).text())
	typings = Object.values(typings)[0]
	let PIDs = Object.values(typings).map(x => x.patientID)
	PIDs = [...new Set(PIDs)]
	console.log(PIDs, PIDs.length, 'PIDs')

	let data = {}
	for (let id in locations){
		if (PIDs.includes(locations[id].patientID)){
			// console.log(locations[id].patientID)
			data[id] = locations[id]
		}
	}

	await Bun.write(outFile, stringify({ locationID: data }, { sortCol: 'from' }))
}