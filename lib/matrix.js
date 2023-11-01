export function rowsAndCols(dd, name) {
	// console.log('r&c', name ?? '', dd)
	let rows = Object.keys(dd)
	// console.log('rows', name ?? '', rows.length, rows.sort().join(' - '))
	let cols = [...new Set(Object.values(dd).flatMap(row => Object.keys(row)))]
	// console.log('cols', name ?? '', cols.length, cols.sort().join(' - '))
}


export function matrixToList(dd) {
	let out = []
	for (let row in dd)
		for (let col in dd[row])
			if (![null, undefined, 'xxx'].includes(dd[row][col]))
				out.push(dd[row][col])
	return out
}


export function diagonalX(dd) {
	for (let row in dd) {
		dd[row][row] = 'xxx'
		for (let col in dd[row]) {
			dd[col] ??= {}
			dd[col][col] = 'xxx'
		}
	}
}

