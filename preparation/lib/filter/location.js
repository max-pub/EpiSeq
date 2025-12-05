import { Matrix } from "../../../lib/Matrix.js"
import { postProgress } from "../../../lib/Progress.js"

export function removeEntriesWithout(matrix, type) {
    let out = new Matrix('contacts')
    for(let [rowKey, data] of matrix.iterateRows({ onProgress: postProgress('remove location-entries without ' + type) })) {
        if (!data[type]) continue
        out.setRow(rowKey, data)
    }
    return out
}

// export function removeEntriesWithout2(matrix, type) {
// 	// let list = this.data.locationList
// 	// let a = Object.keys(DATA).length
// 	let dropped = 0
// 	let ids = Object.keys(DATA)
// 	for (let id of ids) {
// 		Thread.post.progress(ids.indexOf(id), ids.length, 'removeEntriesWithout ' + type)
// 		// for (let id in DATA) {
// 		if (!DATA[id][type]) {
// 			delete DATA[id]
// 			dropped += 1
// 		}
// 	}
// 	return dropped
// 	// let b = Object.keys(DATA).length
// 	// return a - b
// 	// this.addDone(`removed ${a - b} locations without ${type}`)
// }