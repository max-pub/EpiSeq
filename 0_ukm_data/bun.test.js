console.log('yeah', Bun.argv)

let text = await Bun.file(Bun.argv[3]).text()

console.log(text.slice(0,3000))

// 68897099
// 71087519