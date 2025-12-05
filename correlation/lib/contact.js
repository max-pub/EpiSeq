import { DistanceMatrix } from "../../lib/DistanceMatrix.js"
import { postProgress } from "../../lib/Progress.js"


export function selectLevel(input, CS) {
	let out = new DistanceMatrix('locationTemporalDistance')
	for(let level of CS) {
		for(let [k1,k2,val] of input[level].iterate({onProgress: postProgress(`merge ${level}`)})){
			let current = out.get(k1,k2)
			if(!Number.isFinite(current) || val > current)
				out.set(k1,k2,val)	
		}
	}
	return out
}


export function extractContactsPerPatient(contactMatrix) {
	let out = {}
	for (let [k1, k2, v] of contactMatrix.iterate({ onProgress: postProgress('extract contacts per patient') })) {
		if (v === null) continue
		out[k1] ??= []
		out[k2] ??= []
		out[k1].push(k2)
		out[k2].push(k1)
	}
	return out
}