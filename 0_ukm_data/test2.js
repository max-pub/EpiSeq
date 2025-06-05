// console.log(import.meta)

let args = Object.fromEntries(new URL(import.meta.url).searchParams)
console.log(args)
console.log(import.meta.url)
