import { Matrix } from "../../../lib/Matrix.js"
import { postProgress } from "../../../lib/Progress.js"

export function rowFilter(matrix, cutoffPercentage) {
    let out = new Matrix('typings')
    // let maxEntries = Object.values(Object.values(matrix.data)[0]).length - 2 // exclude 'sampleDate' and 'patientID'
    let maxEntries = matrix.colKeys().length - 2 // exclude 'sampleDate' and 'patientID'
    let cutoffFactor = (cutoffPercentage / 100)
    let cutoffValue = Math.round(maxEntries * cutoffFactor)
    // console.log('typing rowFilter', { maxEntries, cutoffPercentage, cutoffValue })

    for (let [rowKey, data] of matrix.iterateRows({ onProgress: postProgress('typing row filter') })) {
        let rowCount = Object.values(data).filter(v => v !== undefined).length - 2 // exclude 'sampleDate' and 'patientID'
        // console.log('rowfilter test', rowCount, cutoffValue)
        if (rowCount < cutoffValue) continue
        out.setRow(rowKey, data)
    }
    return out
}


export function columnFilter(matrix, cutoffPercentage) {
    let out = new Matrix('typings')
    let maxEntries = matrix.rowKeys().length
    let cutoffFactor = (cutoffPercentage / 100)
    let cutoffValue = Math.round(maxEntries * cutoffFactor)
    // console.log('typing columnFilter', { maxEntries, cutoffPercentage, cutoffValue })
    out.setCol('patientID', matrix.column('patientID'))
    out.setCol('sampleDate', matrix.column('sampleDate'))
    for (let [colKey, data] of matrix.iterateColumns({ onProgress: postProgress('typing column filter') })) {
        if (colKey === 'sampleDate' || colKey === 'patientID') continue
        let colCount = Object.values(data).filter(v => v !== undefined).length
        if (colCount < cutoffValue) continue
        out.setCol(colKey, data)
    }
    // console.log('column filter done', matrix.colKeys().length - 2, 'vs', out.colKeys().length - 2)
    return out
}

