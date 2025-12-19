import { DistanceMatrix } from "../../../lib/DistanceMatrix.js"
import { Matrix } from "../../../lib/Matrix.js"
// import { mapValues } from "../../../lib/ext/bundle.js"
import { postProgress } from "../../../lib/Progress.js"

export function dateDistance(matrix) {
    let output = new DistanceMatrix('dateMatrix')
    // let ids = Object.keys(typingList).sort()
    let dates = matrix.column('sampleDate')
    // console.log('date-list', JSON.parse(JSON.stringify(dates)))
    // dates = mapValues(dates, val => Date.parse(val.replace(' ', 'T')) / 1000)
    for (let id in dates)
        dates[id] = Date.parse(dates[id].replace(' ', 'T')) / 1000
    // console.log('date-list', dates)
    let ids = Object.keys(dates).sort()
    // let progressReporter = postProgress('calculate date distance matrix')
    for (let [id1, id2] of iteratePairs(ids, { onProgress: postProgress('calculate date distance matrix') })) {
        let dist = Math.abs(dates[id1] - dates[id2]) / 24 / 60 / 60
        output.set(id1, id2, dist)
    }
    // for (let id1 of ids) {
    //     progressReporter(ids.indexOf(id1) + 1, ids.length)
    //     for (let id2 of ids) {
    //         if (id1 <= id2) continue
    //         let dist = Math.abs(dates[id1] - dates[id2]) / 24 / 60 / 60
    //         output.set(id1, id2, dist)
    //     }
    // }
    return output
}






function* iteratePairs(ids, { onProgress } = {}) {
    let total = (ids.length ** 2 - ids.length) / 2
    let index = 0
    // console.log('total pairs', total, ids, onProgress)
    for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
            // if (i <= j) continue
            if (onProgress) onProgress(index++, total)
            // if (i % 1000 === 0) console.log('pair', index, 'of', total,':', ids[i], ids[j])
            yield [ids[i], ids[j]]
        }
    }
}



export function typingDistance(matrix, countNull = false) {
    let output = new DistanceMatrix('typingMatrix')
    let calculateDistanceBetweenTwoSequences = countNull ? calculateDistanceBetweenTwoSequences2 : calculateDistanceBetweenTwoSequences1
    let typingList_int16 = convertToTypedArrays(matrix)
    let ids = Object.keys(typingList_int16).sort()
    // let progressReporter = postProgress('calculate typing distance matrix')
    // let index = 0, size = ids.length ** 2
    for (let [id1, id2] of iteratePairs(ids, { onProgress: postProgress('calculate typing distance matrix') })) {
        let dist = calculateDistanceBetweenTwoSequences(typingList_int16[id1], typingList_int16[id2])
        output.set(id1, id2, dist)
        // output.setRaw(id1, id2, dist)
    }
    // for (let id1 of ids) {
    //     progressReporter(ids.indexOf(id1) + 1, ids.length)
    //     for (let id2 of ids) {
    //         // progressReporter(index++, size)
    //         if (id1 <= id2) continue
    //         let dist = calculateDistanceBetweenTwoSequences(typingList_int16[id1], typingList_int16[id2])
    //         output.set(id1, id2, dist)
    //     }
    // }
    // for (let id1 of ids) {
    //     progressReporter(ids.indexOf(id1) + 1, ids.length)
    //     for (let id2 of ids) {
    //         if (id1 <= id2) continue
    //         let dist = calculateDistanceBetweenTwoSequences(typingList_int16[id1], typingList_int16[id2])
    //     }
    // }
    return output
}


function getSchema(matrix) {
    let filter = ['patientID', 'sampleDate']
    return matrix.colKeys().filter(col => !filter.includes(col)).sort()
}

function convertToTypedArrays(matrix) {
    let out = {}
    // let schema = matrix.colKeys().filter(col => !['patientID', 'sampleDate'].includes(col)).sort()
    let schema = getSchema(matrix)
    // console.log('schema', schema, schema.length)
    for (let [rowKey, rowData] of matrix.iterateRows()) {
        let int = schema.map(x => rowData[x])
        out[rowKey] = new Uint16Array(int)
    }
    // console.log('converted to typed arrays', out)
    return out
}



function calculateDistanceBetweenTwoSequences1(s1, s2) {
    let diff = 0
    for (let pos = 0, len = s1.length; pos < len; pos++) {
        if (s1[pos] != s2[pos] && s1[pos] && s2[pos])
            diff += 1
    }
    return diff
}


function calculateDistanceBetweenTwoSequences2(s1, s2) {
    let diff = 0
    for (let pos = 0, len = s1.length; pos < len; pos++)
        if (s1[pos] != s2[pos] || !s1[pos] || !s2[pos])
            diff += 1
    return diff
}




export function sequencePatientMap(matrix) {
    let out = new Matrix('sequencePatientMap')
    for (let [rowKey, rowData] of matrix.iterateRows()) {
        out.set(rowKey, 'patientID', rowData['patientID'])
    }
    return out
}

export function typingInfo(matrix) {
    let out = new Matrix('info')
    out.set('schemaLength', 'value', getSchema(matrix).length)
    // out.set('germName', 'value', settings.germName)
    return out
}







// export function calculateDateDistanceMatrix2(typingList = {}, options = {}) {
//     // console.log('date dist start',typingList)
//     let output = {}
//     let ids = Object.keys(typingList).sort()
//     let list = mapValues(typingList, val => Date.parse(val.sampleDate.replaceAll(' ', 'T')) / 1000)
//     // console.log('date-dist-list', list)

//     for (let id1 of ids) {
//         output[id1] ??= {}
//         for (let id2 of ids) {
//             // if (id1 == id2) output[id1][id2] = null
//             if (id1 <= id2) continue
//             // let dist = 
//             let dist = Math.abs(list[id1] - list[id2]) / 24 / 60 / 60
//             ddSetInt(output, id1, id2, dist)
//             // output[id1][id2] = dist
//         }
//         Thread.post.progress(ids.indexOf(id1) + 1, ids.length, 'date distance')
//         // postMessage(['progress', ids.indexOf(id1) + 1, ids.length, 'date matrix'])
//     }
//     diagonalNull(output)
//     // console.log('dat-dist', output)
//     return output
// }
