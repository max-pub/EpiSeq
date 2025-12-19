
import { DistanceMatrix } from "../../lib/DistanceMatrix.js"
import { postProgress } from "../../lib/Progress.js"



export function filterByDate(typingMatrix, dateMatrix, TT) {
    let output = new DistanceMatrix('typingDistance')
    if (TT === 0) return typingMatrix
    for (const [k1, k2, value] of typingMatrix.iterate({ onProgress: postProgress('filter typing matrix by sample date distance') })) {
        let dayDiff = dateMatrix.get(k1, k2)
        if (dayDiff <= TT) {
            output.set(k1, k2, value)
        }
    }
    return output
}

export function rebaseOnPatientID(typingMatrix, sequencePatientMap) {
    let output = new DistanceMatrix('typingDistance')
    let idMap = sequencePatientMap
    for (let [sid1, sid2, dist] of typingMatrix.iterate({ onProgress: postProgress('rebase typing matrix on patient IDs') })) {
        let pid1 = idMap.get(sid1, 'patientID')
        let pid2 = idMap.get(sid2, 'patientID')
        if (!pid1) console.error('no pid found for', pid1)
        if (!pid2) console.error('no pid found for', pid2)
        if (!pid1 || !pid2) continue
        if (pid1 == pid2) continue
        output.push(pid1, pid2, dist)
        // console.log('pushing', pid1, pid2, output.get(pid1, pid2))
        // let current = output.get(pid1, pid2)
        // if (!Number.isFinite(current) || dist < current)
        // output.set(pid1, pid2, dist)
    }
    return output
}



const mergingFunctions = {
    'min': (arr) => Math.min(...arr),
    'mean': (arr) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length),
    'max': (arr) => Math.max(...arr),
}
export function mergeToSingleValue(typingMatrix, TM) {
    // console.log('merging to single value with TM=', TM, typingMatrix)
    let output = new DistanceMatrix('typingDistance')
    let mergeFunc = mergingFunctions[TM] || mergingFunctions['min']
    for (let [pid1, pid2, distanceArray] of typingMatrix.iterate({ onProgress: postProgress(`apply merging strategy TM=${TM}`) })) {
        // console.log('merging', pid1, pid2, distanceArray)
        if ((distanceArray ?? []).length == 0) continue
        let val = mergeFunc(distanceArray ?? [])
        // console.log('merging', pid1, pid2, distanceArray, 'into', val)
        output.set(pid1, pid2, val)
    }
    return output
}


export function checkSamePatientID(typingMatrix, dateMatrix, sequencePatientMap) {
    let output = {}
    let idMap = sequencePatientMap
    for (let [sid1, sid2, dist] of typingMatrix.iterate({ onProgress: postProgress('check for same patient IDs in typing matrix') })) {
        let pid1 = idMap.get(sid1, 'patientID')
        let pid2 = idMap.get(sid2, 'patientID')
        if (!pid1) console.error('no pid found for', pid1)
        if (!pid2) console.error('no pid found for', pid2)
        if (!pid1 || !pid2) continue
        if (pid1 == pid2) {
            output[pid1] ??= {}//{sids:new Set(), typingDistances:[], dateDistances:[] }
            output[pid1][sid1] ??= {}
            output[pid1][sid1][sid2] = {typing:dist, date: dateMatrix.get(sid1, sid2)} 
            output[pid1][sid2] ??= {}
            output[pid1][sid2][sid1] = {typing:dist, date: dateMatrix.get(sid1, sid2)}
            // output[pid1].push([sid1, sid2, dist, dateMatrix.get(sid1, sid2)])
            // console.warn('issue: same patient ID found in typing matrix', sid1, sid2, pid1)
            // issues++
        }
    }
    return output
}

// export function rebaseOnPatientID(typingMatrix, sequencePatientMap) {
//     let output = new DistanceMatrix('typingDistance')
//     let idMap = sequencePatientMap
//     for (let [sid1, sid2, dist] of typingMatrix.iterate({ onProgress: postProgress('rebase typing matrix on patient IDs') })) {
//         let pid1 = idMap.get(sid1, 'patientID')
//         let pid2 = idMap.get(sid2, 'patientID')
//         if (!pid1) console.error('no pid found for', pid1)
//         if (!pid2) console.error('no pid found for', pid2)
//         if (!pid1 || !pid2) continue
//         if (pid1 == pid2) continue
//         let current = output.get(pid1, pid2)
//         if (!Number.isFinite(current) || dist < current)
//             output.set(pid1, pid2, dist)
//     }
//     return output
// }






// export class TypeFilter {
//     constructor(input, settings) {
//         this.input = input
//         this.settings = settings
//     }
//     filterByDate() { // modifies in place
//         if (this.settings.TT === 0) return this.input.typingMatrix
//         // let total = this.input.typingMatrix.size()
//         // let progress = new Progress(this.input.typingMatrix.size(), 'filter typing matrix by sample date distance')
//         for (const [k1, k2, val, index] of this.input.typingMatrix.iterate({ onProgress: postProgress('filter typing matrix by sample date distance') })) {
//             // if (!Number.isFinite(val)) continue
//             // Thread.post.progress(index, total)
//             // progress.update(index)
//             let dayDiff = this.input.dateMatrix.get(k1, k2)
//             if (dayDiff > this.settings.TT) {
//                 this.input.typingMatrix.del(k1, k2)
//             }
//         }
//     }

//     rebaseOnPatientID() {
//         let output = new DistanceMatrix()
//         let idMap = this.input.sequencePatientMap
//         // let total = this.input.typingMatrix.size()
//         // let progress = new Progress(this.input.typingMatrix.size(), 'rebase typing matrix on patient IDs')
//         // let i = 0, j = 0
//         // let size
//         for (let [sid1, sid2, dist, index] of this.input.typingMatrix.iterate({ onProgress: postProgress('rebase typing matrix on patient IDs') })) {
//             // if (!Number.isFinite(dist)) continue
//             // Thread.post.progress(index, total)
//             // progress.update(index)
//             i++
//             let pid1 = idMap.get(sid1, 'patientID')
//             let pid2 = idMap.get(sid2, 'patientID')
//             if (!pid1) console.error('no pid found for', pid1)
//             if (!pid2) console.error('no pid found for', pid2)

//             // let pid1 = idMap[sid1].patientID
//             // let pid2 = idMap[sid2].patientID
//             if (!pid1 || !pid2) continue
//             if (pid1 == pid2) continue
//             j++
//             // if (dist == null) continue
//             // ddSetInt(output,pid1,pid2,dist)
//             let current = output.get(pid1, pid2)
//             if (!Number.isFinite(current) || dist < current)
//                 output.set(pid1, pid2, dist)
//         }
//         console.log('rebase', i, j, '==', this.input.typingMatrix.size(), '|', this.input.typingMatrix.rowKeys().length, '==', idMap.rowKeys().length)
//         return output
//     }
// }

