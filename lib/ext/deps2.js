export { TALI } from '/Volumes/code/GitHub/js-max-pub/tali.js/mod.js'
export { parseDate, isoDate, isoDateTime, format as dateFormat, humanDuration, date } from '/Volumes/code/GitHub/js-max-pub/std/date.js'
export { intersection, difference, sortBy, cluster, unique } from '/Volumes/code/GitHub/js-max-pub/std/array.js'
export { sum, average, median, pretty, prettyNumber, standardDeviation, MAD } from '/Volumes/code/GitHub/js-max-pub/std/number.js'
export { keep, mapValues, filter as dictFilter, sortByKey } from '/Volumes/code/GitHub/js-max-pub/std/object.js'
export { $, $$, download } from '/Volumes/code/GitHub/js-max-pub/std/dom.js'
export { template, importable } from '/Volumes/code/GitHub/js-max-pub/template/mod.js'
export * from '/Volumes/code/GitHub/js-max-pub/pager/mod.js'
export { pseudonymize, MAP as pseudoMAP } from '/Volumes/code/GitHub/js-max-pub/random/mod.js'
export { Thread } from '/Volumes/code/GitHub/js-max-pub/thread.js/mod.js'





// import { pretty } from '/Volumes/code/GitHub/js-max-pub/std/number.js'

// export function prettyNumber(number, options) {
// 	options = { separator: '&thinsp;', ...options }
// 	return pretty(number, options)
// }




// export * as CSV from '/Volumes/code/GitHub/js-max-pub/tali.js/csv.js'
// export { difference } from '/Volumes/code/GitHub/js-max-pub/array/set.js'
// export { intersection } from '/Volumes/code/GitHub/js-max-pub/array/set.js'
// export * as pseudo from '/Volumes/code/GitHub/js-max-pub/random/mod.js'



// export * as svg from '/Volumes/code/GitHub/js-max-pub/svg/more.js'
// export * from './lib/lib.js'
// export * as CSV from '/Volumes/code/GitHub/js-max-pub/tali.js/grid/csv.js'
// export { pseudonymize } from '/Volumes/code/GitHub/js-max-pub/random/mod.js'

// export { Log } from '/Volumes/code/GitHub/js-max-pub/log/mod.js'
// export * as FS from '/Volumes/code/GitHub/js-max-pub/fs/deno/sync.js'

// export { intersection } from 'https://jsv.max.pub/array/2021/mod.js'
// export * as tali from '/Users/max/GitHub/TabLine/js/mod.js'
// export * from '/Users/max/GitHub/TabLine/js/mod.js'
// export * as TALI from '/Users/max/GitHub/TabLine/js/lib/tali.js'
// export * as CSV from '/Users/max/GitHub/TabLine/js/lib/csv.js'
// export * as UTF8 from '/Users/max/GitHub/TabLine/js/lib/utf8.js'
// export * as id from '/Users/max/GitHub/TabLine/js/lib/id.js'

// export { aa2ad, aa2dd } from '/Users/max/GitHub/TabLine/js/lib/grid.js'
// export { lines, trim } from '/Volumes/code/GitHub/js-max-pub/string/mod.js'
// import { log } from 'https://jsv.max.pub/log/2021/ansi.js'
// import { log } from '/Volumes/code/GitHub/js-max-pub/log/ansi.js'
// export const preLOG = (prefix, ...text) => log.line.reset.gray.time.tib.silver.counter.tib.silver.text('[' + prefix + ']').move(25).gray.bar.tib.reset.text(...text)
// const LOG = log.line.reset.gray.time.tib.silver.counter.tib.gray.bar.tib.reset
// LOG.text('max').line
// LOG.green.text('joo')


// export function measure(name, func) {
// 	let t0 = Date.now()
// 	let res = func()
// 	console.log(new Date().toISOString().slice(11, 19), name, Date.now() - t0, 'ms')
// 	return res
// }
// export function since(name, t) {
// 	console.log(new Date().toISOString().slice(11, 19), name, Date.now() - t, 'ms')
// 	return Date.now()
// }