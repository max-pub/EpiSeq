import * as x from './test2.js?a=1&b=2#do'

// console.log(import.meta)
console.log(Bun.argv)
console.log(import.meta.url)
