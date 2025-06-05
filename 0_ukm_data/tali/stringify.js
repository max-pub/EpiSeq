import { mergeSettingsAndOptions } from './settings.js'

export function stringify(ddd, options = {}) {
	mergeSettingsAndOptions(options)
	// console.log('ddd',ddd)
	let aaa = ddd2aaa(ddd, options)
	// console.log('aaa',aaa)
	// let f = options.format?.toLowerCase() ?? 'tali'
	// let str = EXT[f].aaa2str(aaa, options)
	let str = aaa2str(aaa, options)
	// let str = aaa2str(aaa, options.target, options)
	return str
}



export function ddd2aaa(ddd, options = {}) { // {{}} -> [[]]
	let aaa = []
	for (let tableName in ddd) {
		let aa = dd2aa(ddd[tableName], options)
		aa[0][0] = tableName
		aaa.push(aa)
	}
	return aaa
}
// function allColumnKeys(dd){


// }
export function dd2aa(dd, options = {}) { // {{}} -> [[]]
	// let t0 = Date.now()
	// console.log(dd, options)
	let aa = []
	// let t0 = Date.now()
	// let cols = [...new Set(Object.keys(dd).flatMap(row => Object.keys(dd[row])))] // iterate all rows to find all different column-keys
	let cols = [...new Set(Object.values(dd).flatMap(row => Object.keys(row)))] // iterate all rows to find all different column-keys
	// console.log(Date.now() - t0, 'cols', cols)
	if (options.sortCols) cols = cols.sort()
	if (Array.isArray(options.sortCols)) cols = options.sortCols
	for (let row in dd) {
		aa.push([row, ...cols.map(col => dd[row][col])])
	}
	let sortCol = -1
	if (options.sortRows) sortCol = 0
	if (options.sortCol && cols.indexOf(options.sortCol) != -1) sortCol = cols.indexOf(options.sortCol) + 1
	// console.log('SORT---', options.sortCol, ' x ', sortCol, ' x ', sortCol != -1)
	if (sortCol != -1) {
		// console.log('SORT BY', options.sortCol, ' x ', sortCol)
		// console.log('first row', aa[0])
		aa = aa.sort((a, b) => a[sortCol] > b[sortCol] ? 1 : (a[sortCol] < b[sortCol] ? -1 : 0))
	}
	aa.unshift(['', ...cols]) // list of cols is first row
	// log.debug('converted', aa.length, 'lines', t0)
	if (options.flip) aa = flipAA(aa)
	return aa
}


export function aaa2str(aaa, options = {}) { // [[]] -> tali
	// aaa[0][0][0] = options.title || ''
	// console.log('aaa2str')
	aaa = encodeAAA(aaa, options)

	if (options.pretty)
		aaa = aaa.map(aa => prettifyAA(aa))
	// Deno.writeTextFileSync('test.json', JSON.stringify(aaa, 0, 4))

	return aaa
		.map(table => table
			.map(row => row
				.join(options.cell)
			).join(options.row)
		).join(options.table)
}



export function encodeAAA(aaa, options = {}) {
	// let none = options.none ?? settings.none
	// let remove = [...(options.remove ?? []), ...(settings.remove ?? [])]
	return aaa
		.map(table => table
			.map(row => row
				// .map(cell => remove?.includes(cell) ? undefined : cell)
				// .map(cell => cell === undefined ? none : cell)
				.map(cell => cell in options.stringify ? options.stringify[cell] : cell)
				.map(cell =>
					String(cell).replaceAll('\t', options.tab).replaceAll('\n', options.line).trim()
				)
			)
		)
}



export function prettifyAA(aa, options = {}) {
	// console.log('prettify',aa)
	let maxColumnLengths = flipAA(aa.map(row => row.map(col => String(col ?? '').length))).map(col => Math.max(...col))
	// console.log('max col', maxColumnLengths)
	if (options.pretty > 1) maxColumnLengths = maxColumnLengths.map(x => Math.ceil(x / options.pretty) * options.pretty)
	return aa.map(row => row.map((col, j) => pad(col, maxColumnLengths[j])))
}

export function pad(str, len) {
	// console.log('pad', str, len, '|' + (String(str ?? '')?.padEnd?.(len, ' ') ?? '') + '|')
	if (str * 1 == str)
		return String(str ?? '')?.padStart(len, ' ') ?? ''
	// else
	return String(str ?? '')?.padEnd?.(len, ' ') ?? ''
}


export function flipAA(aa) {
	let out = []
	for (let i in aa) {
		for (let j in aa[i]) {
			out[j] ??= []
			out[j][i] = aa[i][j]
		}
	}
	return out
}
