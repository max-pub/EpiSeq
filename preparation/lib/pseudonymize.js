
import { pseudonymize, pseudoMAP } from "../../lib/ext/bundle.js"
// import { pseudo } from "../../lib/ext/bundle.js"
import { Matrix } from "../../lib/Matrix.js"
import { postProgress } from "../../lib/Progress.js"

export function pseudonymizeLocations(matrix, len = { patientID: 4, locationID: 5, clinic: 3, ward: 3, room: 4 }) {
	let out = new Matrix('pseudonymized locations')
	for (let [rowKey, rowData] of matrix.iterateRows({ onProgress: postProgress('pseudonymize locations') })) {
		out.setRow(pseudonymize(rowKey, { bucket: 'locations', prefix: 'loc', length: len.locationID }), {
			patientID: pseudonymize(rowData.patientID, { bucket: 'patients', prefix: 'pat', length: len.patientID }),
			from: rowData.from,
			till: rowData.till,
			clinic: pseudonymize(rowData.clinic, { bucket: 'clinics', prefix: 'c', length: len.clinic }),
			ward: pseudonymize(rowData.ward, { bucket: 'wards', prefix: 'w', length: len.ward }),
			room: pseudonymize(rowData.room, { bucket: 'rooms', prefix: 'r', length: len.room }),
		})
	}
	return out
}

export function pseudonymizeTypings(matrix, len = { patientID: 4, sequenceID: 5 }) {
	let out = new Matrix('pseudonymized typings')
	for (let [rowKey, rowData] of matrix.iterateRows({ onProgress: postProgress('pseudonymize typings') })) {
		rowData.patientID = pseudonymize(rowData.patientID, { bucket: 'patients', prefix: 'pat', length: len.patientID })
		rowKey = pseudonymize(rowKey, { bucket: 'sequences', prefix: 'seq', length: len.sequenceID })
		out.setRow(rowKey, rowData)
	}
	return out
}


// export function pseudonymizeLocations(list) {
// 	let NEW = {}
// 	let ids = Object.keys(list).sort()
// 	for (let id of ids) {
// 		let val = list[id]
// 		NEW[pseudonymize(id, { bucket: 'locations', prefix: 'loc' })] = {
// 			patientID: pseudonymize(val.patientID, { bucket: 'patients', prefix: 'pat', length: 4 }),
// 			from: val.from,
// 			till: val.till,
// 			clinic: pseudonymize(val.clinic, { bucket: 'clinics', prefix: 'c', length: 3 }),
// 			ward: pseudonymize(val.ward, { bucket: 'wards', prefix: 'w', length: 3 }),
// 			room: pseudonymize(val.room, { bucket: 'rooms', prefix: 'r', length: 4 }),
// 		}
// 		Thread.post.progress(ids.indexOf(id) + 1, ids.length, 'pseudonymize locations')
// 		// postMessage(['progress', ids.indexOf(id) + 1, ids.length])
// 	}
// 	return NEW
// }

// export function pseudonymizeTypings(list) {
// 	let NEW = {}
// 	let ids = Object.keys(list).sort()
// 	for (let id of ids) {
// 		let val = list[id]
// 		val.patientID = pseudonymize(val.patientID, { bucket: 'patients', prefix: 'pat', length: 4 })
// 		NEW[pseudonymize(id, { bucket: 'sequences', prefix: 'seq', length: 5 })] = val
// 		Thread.post.progress(ids.indexOf(id) + 1, ids.length, 'pseudonymize typings')
// 		// postMessage(['progress', ids.indexOf(id) + 1, ids.length])
// 	}
// 	return NEW
// }


