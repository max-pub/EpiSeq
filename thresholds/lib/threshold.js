import { Matrix } from "../../lib/Matrix.js"
import { arithmeticMean, standardDeviation, median, medianAbsoluteDeviation, sum } from "../../lib/ext/bundle.js"

export function calculateThresholds(correlationRelativeCompounded, parameters){
    return {
        xMED: stats_xMED(correlationRelativeCompounded, parameters.F_med),
        MEDxMAD: stats_MEDxMAD(correlationRelativeCompounded, parameters.F_mad)
    }
}


export function stats_AMxSD(correlationRelativeCompounded, factor = 2) {
	let out = new Matrix('AMxSD')
	for (let cd of correlationRelativeCompounded.colKeys().sort()) {
		let cmp = correlationRelativeCompounded.columnValues(cd)
		let avg = arithmeticMean(cmp)
		let sd = standardDeviation(cmp)
		let cutoff = avg + (sd * factor)
		let threshold = findThreshold(cmp, cutoff)
		out.setRow(cd, {
			arithmeticMean: avg.toFixed(2) * 1,
			standardDeviation: sd.toFixed(2) * 1,
			cutOff: cutoff.toFixed(2) * 1,
			threshold
		})
	}
	return out.flip()
}
export function stats_MEDxMAD(correlationRelativeCompounded, factor = 6) {
	let out = new Matrix('MEDxMAD')
	for (let cd of correlationRelativeCompounded.colKeys().sort()) {
		let cmp = correlationRelativeCompounded.columnValues(cd)
		let med = median(cmp)
		let mad = medianAbsoluteDeviation(cmp)
		let cutoff = med + (mad * factor)
		let threshold = findThreshold(cmp, cutoff)
		out.setRow(cd, {
			median: med.toFixed(2) * 1 + '%',
			medianAbsoluteDeviation: mad.toFixed(2) * 1 + '%',
			cutOff: cutoff.toFixed(2) * 1 + '%',
			threshold
		})
	}
	return out.flip()
}
export function stats_xMED(correlationRelativeCompounded, factor = 3) {
	let out = new Matrix('xMED')
	for (let cd of correlationRelativeCompounded.colKeys().sort()) {
		let cmp = correlationRelativeCompounded.columnValues(cd)
		let med = median(cmp)
		let cutoff = med * factor
		let threshold = findThreshold(cmp, cutoff)
		out.setRow(cd, {
			median: med.toFixed(2) * 1 + '%',
			cutOff: cutoff.toFixed(2) * 1 + '%',
			threshold
		})
	}
	return out.flip()
}







function findThreshold(list, cutoff) {
	for (let i in list)
		if (list[i] < cutoff)
			return (i * 1) - 1 // last item above threshold
}
