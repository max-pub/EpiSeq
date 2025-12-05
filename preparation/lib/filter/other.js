
import { Matrix } from "../../../lib/Matrix.js"
import { postProgress } from "../../../lib/Progress.js"

export function patientIntersectionFilter(typingMatrix, locationMatrix) { // in-place edit... for now
    let typingPatientIDs = typingMatrix.columnValuesUnique('patientID')
    let locationPatientIDs = locationMatrix.columnValuesUnique('patientID')

    let IS = new Set(typingPatientIDs).intersection(new Set(locationPatientIDs))

    for (let matrix of [typingMatrix, locationMatrix]) {
        for(let [rowKey, data] of matrix.iterateRows({ onProgress: postProgress('patient intersection filter') })) {
            // if (!IS.has(data.patientID)) continue
            // matrix.setRow(rowKey, data)
            if (!IS.has(data.patientID)) matrix.delRow(rowKey)
        }
    }

}
