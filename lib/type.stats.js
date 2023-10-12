import { sum } from './deps.js'
import { groupDistanceMatrixByPatientID, groupDistanceMatrixByDistance } from './stats.js'

export function typeStats(LIST, DIST) {
	let cgmlstByPatient = groupDistanceMatrixByPatientID(DIST.typings, LIST.typings, false)

	let PAIRS = {
		cgmlst: groupDistanceMatrixByDistance(DIST.typings, LIST.typings),
		cgmlstByPatient: groupDistanceMatrixByDistance(cgmlstByPatient, LIST.typings)
	}
	let schema = Object.keys(Object.values(LIST.typings)[0])
	let out = { ABS: {}, REL: {} }
	for (let key in PAIRS) {
		out.ABS[key] = {}
		// for (let i in PAIRS[key])
		for (let i = 0; i < schema.length; i++)
			out.ABS[key][i] = PAIRS[key]?.[i]?.length ?? 0
	}
	for (let key in PAIRS) {
		out.REL[key] = {}
		let total = sum(Object.values(out.ABS[key]))
		for (let dist in out.ABS[key])
			out.REL[key][dist] = (out.ABS[key][dist] / total * 1000).toFixed(2)
	}
	return out
}