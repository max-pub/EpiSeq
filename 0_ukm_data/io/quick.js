import * as std from "std";

// export const stdout = new WritableStream(new class {
// 	// start(controller) { }
// 	write(chunk, controller) { std.out.puts(chunk) }
// })
// std.out.puts('jo')


// std.out.puts('jo')
// let td = new TextDecoder('utf8')
// const decoder = new TextDecoder()
let f = std.open('./bun.js', "r")
// // console.log(f)
// let ab = new ArrayBuffer(16)
// // read(buffer, position, length)
// f.read(ab,0,16)
std.out.puts('jo')
// console.log('jo')
// // f.puts(content);
// let line = f.getline()
// let line = f.readAsString()
// std.out.puts(line)
// std.out.puts(td.decode(ab))
f.close();