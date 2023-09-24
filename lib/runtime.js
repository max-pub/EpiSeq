export function EXIT(code, message) {
	if (message) console.log(message)
	Deno.exit(code)
}
export function ARGS() { return Deno.args }

// function load(folder) {
// 	let output = {}
// 	for (let file of folder.list.filter(x => x.extension == 'tsv')) {
// 		console.log('load', file.name, Math.round(file.size / 1024), 'kb')
// 		output = { ...output, ...TALI.grid.parse(file.text) }
// 	}
// 	return output
// }
