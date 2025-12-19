import { Matrix } from "../../lib/Matrix.js"
export function statsByYear(typingMatrix, locationMatrix, name) {
    var out = new Matrix(name)
    for (let [id, row] of typingMatrix.iterateRows()) {
        let year = row.sampleDate?.split('-')?.[0]
        if (year)
            out.inc(year, 'typings')
    }
    for (let [id, row] of locationMatrix.iterateRows()) {
        let year
        if (year = row.from?.split('-')?.[0])
            out.inc(year, 'locations', 0.5)
        if (year = row.till?.split('-')?.[0])
            out.inc(year, 'locations', 0.5)
    }

    return out
}

export function pacBio(typingMatrix) { // only for testing
    let a = 0, b = 0
    for (let [id, row] of typingMatrix.iterateRows()) {
        let date = row.sampleDate
        if (date < '2020-08-01') a++
        else b++
    }
    return [a, b]
}


function incVal(dict, k1, k2) {
    dict[k1] ??= {}
    dict[k1][k2] ??= 0
    dict[k1][k2]++
}
export function locationNames(locationMatrix) {
    let out = { clinic: {}, ward: {}, room: {} }
    for (let [id, row] of locationMatrix.iterateRows()) {
        let from = row.from?.split('-')?.[0]
        let till = row.till?.split('-')?.[0]
        incVal(out.clinic, row.clinic, from)
        incVal(out.clinic, row.clinic, till)
        incVal(out.ward, row.ward, from)
        incVal(out.ward, row.ward, till)
        incVal(out.room, row.room, from)
        incVal(out.room, row.room, till)
    }
    return out
}