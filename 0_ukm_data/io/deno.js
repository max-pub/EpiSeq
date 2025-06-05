
export function readableByteStream(url) {
	return new ReadableStream({
		start(controller) { return Deno.open(url) },
		pull(controller) { return },
	})
}
export function readableByteStream2(url) {
	return Deno.openSync(url).readable
}

// Bun.write(Bun.stdout,'jo')


export const stdout = new WritableStream(new class {
	// start(controller) { }
	write(chunk, controller) { Deno.writeAll(Deno.stdout, chunk) }
})

readableByteStream('./bun.js').pipeTo(stdout)

// let file = await Deno.open('./bun.js')
// console.log(file.readable)
// for await (let chunk of file.readable){
// 	console.log(chunk)
// }