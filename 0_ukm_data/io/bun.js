
export function readableByteStream(url) {
	return Bun.file(url).stream()
}
// export function writableByteStream(url) {
// 	return Bun.file(url).writer()
// }

export function writableByteStream(url) {
	return new WritableStream({
		start(controller) { controller._writer = Bun.file(url).writer() },
		write(chunk, controller) { controller._writer.write(chunk) },
		close(controller) { controller?._writer?.end() },
	})
}
// Bun.write(Bun.stdout,'jo')


export const stdout = new WritableStream(new class {
	// start(controller) { }
	write(chunk, controller) { Bun.write(Bun.stdout, chunk) }
})

// readableByteStream('./bun.js').pipeTo(stdout)
readableByteStream('./bun.js')
	.pipeTo(writableByteStream('./bun.test.js'))

// console.log(new URL('../bun.js', import.meta.url))
// console.log(await fetch(new URL('../bun.js', import.meta.url)).then(x => x.text()))
console.log(await fetch(import.meta.resolve('../bun.js')).then(x => x.text()))
// let x = new GridList()
// x.from = 
// console.log(import.meta.resolve('../bun.js'))
// new File('file1.txt').pipeTo('file2.txt')
// new File('file1.txt').pipeTo('file2.txt')
// let data = await GridList.from(new File('grid.tali'))
// let data = await GridList.fromURL('grid.tali')
// new File('grid.tali').pipeTo(GridList.sink)
// source
// target