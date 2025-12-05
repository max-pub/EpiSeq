import { Matrix } from "../../../lib/Matrix.js"
import { postProgress } from "../../../lib/Progress.js"

export function typeDateFilter(matrix, from, till) {
    let out = new Matrix('typings')
    for (let [key,data] of matrix.iterateRows({ onProgress: postProgress('typing date filter') })) {
        if (data.sampleDate?.slice(0, 10) < from) continue
        if (data.sampleDate?.slice(0, 10) >= till) continue
        out.setRow(key, data)
    }
    return out
}
export function locationDateFilter(matrix, from, till) {
    let out = new Matrix('locations')
    for (let [key,data] of matrix.iterateRows({ onProgress: postProgress('location date filter') })) {
        if (data.from?.slice(0, 10) < from) continue
        if (data.till?.slice(0, 10) >= till) continue
        out.setRow(key, data)
    }
    return out
}




export function validateTypingMatrix(matrix) {
    let out = new Matrix('typings')
    for (let [key, data] of matrix.iterateRows({ onProgress: postProgress(`remove typing-entries without sample-date`) })) {
        if (!data.sampleDate || data.sampleDate.startsWith('4000-')) continue
        out.setRow(key, data)
    }
    return out
}

export function validateLocationMatrix(matrix) {
    let out = new Matrix('locations')
    for (let [key, data] of matrix.iterateRows({ onProgress: postProgress(`remove location-entries without from- or till-date`) })) {
        if (!data.from || !data.till || data.till.startsWith('4000-')) continue
        // console.log('row',key)
        out.setRow(key, data)
    }
    return out
}