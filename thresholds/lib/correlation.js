// import { postProgress } from "../../lib/Progress.js"
import { Matrix } from "../../lib/Matrix.js"


export function correlationVariants(correlationAbsolute, parameters) {
	let absoluteFiltered = absoluteTC(correlationAbsolute, parameters)
	let relativeFiltered = relative(absoluteFiltered)
	let relativeFilteredCompounded = compound(relativeFiltered)
	return { absoluteFiltered, relativeFiltered, relativeFilteredCompounded }
}


/// STATS
export function absoluteTC(correlationAbsolute, parameters) {
	// console.log('stt',parameters.S_min)
	var out = new Matrix('absoluteTC')
	for (let [distance, row] of correlationAbsolute.iterateRows()) {
		// console.log(distance, row, settings)
		// let total = correlationAbsolute.get(distance, 'total')
		if (row.total * 1 >= parameters.S_min)
			out.setRow(distance, row)
		// else
		// out.setRow(distance, { total: 0, cd0: 0 })
	}
	// console.log('correlationAbsoluteTC', out.data)
	return out
}


export function relative(correlationAbsolute) {
	var correlationRelative = new Matrix('relative')
	for (let distance of correlationAbsolute.rowKeys()) {
		// console.log('dist', distance)
		let total = correlationAbsolute.get(distance, 'total')
		// correlationRelative[distance] = {}
		for (let cd of correlationAbsolute.colKeys()) {
			// console.log('xx', distance, cd)
			if (cd != 'total') {
				let relativeValue = (correlationAbsolute.get(distance, cd) / total * 100).toFixed(2) * 1
				if (isNaN(relativeValue)) relativeValue = 0
				correlationRelative.set(distance, cd, relativeValue)
			}
			// correlationRelative[distance][cd] = (correlationAbsolute[distance][cd] / total * 100).toFixed(2) //* 1
			// if (cd != 'typings') console.log('rel', distance, cd, correlationAbsolute[distance][cd], total, (correlationAbsolute[distance][cd] / total * 100).toFixed(2) * 1)
		}
	}
	// console.log('correlationRelative', correlationRelative.data)
	return correlationRelative
}


export function compound(correlationRelative) {
	// console.log('compound', data, CD)
	let out = new Matrix('compounded')
	let rowKeys = correlationRelative.rowKeys().sort()
	let colKeys = correlationRelative.colKeys().sort()
	for (let distance of rowKeys) {
		for (let cd of colKeys) {
			let lastValue = 0
			// let i = cd.slice(2) * 1
			let i = cd.slice(6) * 1
			if (i > 0) lastValue = out.get(distance, 'C_hop_' + (i - 1)) * 1
			// if (i > 0) lastValue = out.get(distance, 'cd' + (i - 1)) * 1
			let compoundValue = (lastValue + correlationRelative.get(distance, cd) * 1).toFixed(2) * 1
			out.set(distance, cd, compoundValue)
		}
	}
	return out
}

