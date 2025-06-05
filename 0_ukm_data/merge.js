import { TALI } from "./deps.x.js"



if (import.meta.main) {
	console.log('yeah', Deno.args)
	let data1 = TALI.grid.parse(Deno.readTextFileSync(Deno.args[0])).sequenceID
	let data2 = TALI.grid.parse(Deno.readTextFileSync(Deno.args[1])).sequenceID
	// Deno.writeTextFileSync('test1.tsv', TALI.grid.stringify({ sequenceID: data1 }))
	// Deno.writeTextFileSync('test2.tsv', TALI.grid.stringify({ sequenceID: data2 }))

	for (let key in data2) {
		data1[key] = data2[key]
		// console.log(data1[key].sampleDate)
	}
	Deno.writeTextFileSync(Deno.args[2] + '.tsv', TALI.grid.stringify({ sequenceID: data1 }, { sortCol: 'sampleDate' }))
}