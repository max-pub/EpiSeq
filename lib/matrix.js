import { Thread } from "./deps.js"


export function diagonalNull(dd) {
	for (let row in dd) {
		dd[row][row] = null
		for (let col in dd[row]) {
			dd[col] ??= {}
			dd[col][col] = null
		}
	}
	return dd
}
// export function ddSelect(){}
export function* ddIterator(dd, name = '') {
	// console.log('ddIterator', dd)
	let keys = Object.keys(dd).sort()
	// for (const k1 in dd) {
	for (const k1 of keys) {
		Thread.post.progress(keys.indexOf(k1), keys.length, name)
		for (const k2 in dd[k1]) {
			if (k1 > k2) { //continue
				let v = dd[k1][k2] //?? null
				// console.log(k1, k2, v)
				yield [k1, k2, v]
			}
		}
	}
}
// for (const x of ddIterator({ zz: { a: 1, b: 2 }, yy: { a: 33, b: 44 } })) console.log('x', x)

// export function* ddIteratorWithCheck(dd) {
// 	for (const [k1, k2, val] of ddIterator(dd)) {
// 		if (val !== null && !Number.isInteger(val)) {
// 			// console.error("ALARM", k1, k2, val)
// 			continue
// 		}
// 		yield [k1, k2, val]
// 	}
// }

export function ddSet(dd, k1, k2, v) {
	let [k22, k11] = [k1, k2].sort()//.reverse()
	dd[k11] ??= {}
	dd[k11][k22] = v
}
export function ddSetInt(dd, k1, k2, val) {
	if (val !== null && !Number.isInteger(val))
		return console.error("set not int", k1, k2, val)
	ddSet(dd, k1, k2, val)
}

export function ddGet(dd = {}, k1, k2) {
	let [k22, k11] = [k1, k2].sort()//.reverse()
	return dd?.[k11]?.[k22]
}
export function ddGetInt(dd = {}, k1, k2, debugName = '') {
	// let [k22, k11] = [k1, k2].sort()//.reverse()
	let val = ddGet(dd, k1, k2)
	if (val !== null && val !== undefined && !Number.isInteger(val))
		console.error("get not int2", k11, k22, val, debugName)
	// console.error("get not int", k1, k2, val, debugName)
	return val
}

export function ddLog(dd = {}, text, count = 1) {
	// let i = 0
	let len = Object.keys(dd).length
	let x = Object.entries(dd).slice(0, count).map(x => console.log(text, len, x[0], x[1]))
	// console.log(text, ...x)
	// for (let k in dd) {
	// 	console.log(text, dd[k])
	// 	if (i++ > 5) break
	// }
}

export function ddCount(dd = {}) {
	let count = 0
	for (let k1 in dd)
		for (let k2 in dd[k1])
			if (dd[k1][k2] != null)
				count += 1
	return count
}
export function ddCountAndValidate(dd, debugName = '') {
	let count = 0
	let errors = []
	for (const [k1, k2, val] of ddIterator(dd)) {
		if (val !== null && !Number.isInteger(val)) {
			// console.error("NOT INT", k1, k2, val)
			errors.push([k1, k2, val])
			continue
		}
		count += 1
	}
	if (errors.length) console.error("ERRORS", debugName, errors)
	return count
}






// export function rowsAndCols(dd, name) {
// 	// console.log('r&c', name ?? '', dd)
// 	let rows = Object.keys(dd)
// 	// console.log('rows', name ?? '', rows.length, rows.sort().join(' - '))
// 	let cols = [...new Set(Object.values(dd).flatMap(row => Object.keys(row)))]
// 	// console.log('cols', name ?? '', cols.length, cols.sort().join(' - '))
// }


// export function matrixToList(dd) {
// 	let out = []
// 	for (let row in dd)
// 		for (let col in dd[row])
// 			if (![null, undefined, 'x'].includes(dd[row][col]))
// 				out.push(dd[row][col])
// 	return out
// }


// export function diagonalX(dd) {
// 	for (let row in dd) {
// 		dd[row][row] = 'x'
// 		for (let col in dd[row]) {
// 			dd[col] ??= {}
// 			dd[col][col] = 'x'
// 		}
// 	}
// }