import { Thread } from '../lib/ext/bundle.js'
// import { DistanceMatrix } from '../lib/DistanceMatrix.js'
// import { Matrix } from '../lib/Matrix.js'

import * as typing from './lib/typing.js'
import * as contact from './lib/contact.js'
import * as correlation from './lib/correlation.js'
import { postProgress } from '../lib/Progress.js'
import { Matrix } from '../lib/Matrix.js'

function getStat(matrix) {
    return { keys: matrix.rowKeys().length, count: matrix.count(), size: matrix.size() }
}


function patientID_multiples(input) {
    let patientCheck = typing.checkSamePatientID(input.typingMatrix, input.dateMatrix, input.sequencePatientMap)
    console.log('patientCheck', patientCheck)

}



export function typingFilter(input, settings, options = { patientID: false, histogram: false }) {
    let output = {}
    Thread.post.stat({ type: 'typing', mode: 'start', data: getStat(input.typingMatrix) })
    if (options.patientID) patientID_multiples(input)
    output.typingMatrix = typing.filterByDate(input.typingMatrix, input.dateMatrix, settings.TT)
    Thread.post.stat({ type: 'typing', mode: 'dateFilter', data: getStat(output.typingMatrix) })
    output.typingMatrix = typing.rebaseOnPatientID(output.typingMatrix, input.sequencePatientMap)
    // console.log('typing after rebase', JSON.stringify(output.typingMatrix.data))
    output.typingMatrix = typing.mergeToSingleValue(output.typingMatrix, settings.TM)
    // console.log('typing after merge', JSON.stringify(output.typingMatrix.data))
    Thread.post.stat({ type: 'typing', mode: 'patientID', data: getStat(output.typingMatrix) })
    // console.log('SCHMEA LENGTH', input.info.get('schemaLength', 'value'))
    if (options.histogram)
        output.histogram = histogram({ typingMatrix: output.typingMatrix, info: input.info })
    // output.typingMatrix = output.typingMatrix.filter(value => value <= settings.TD, { onProgress: postProgress(`clip typing distance above ${settings.TD}`) })
    // Thread.post.stat({ type: 'typing', mode: 'distanceFilter', data: getStat(output.typingMatrix) })
    return output
}

export function histogram(data) {
    let schemaLength = parseInt(data.info.get('schemaLength', 'value'))
    let typingHistogram = data.typingMatrix.histogram({ maxDistance: schemaLength, onProgress: postProgress('compute typing distance histogram') })
    // console.log('input info', input.info)
    Thread.post.setGermName(data.info.get('germName', 'value'))
    let germName = data.info.get('germName', 'value')
    // Thread.post.showHistogram(typingHistogram, germName)
    // console.log("HISTOGRAM", typingHistogram)
    let out = new Matrix("histogram")
    for (let i in typingHistogram)
        out.set(i, 'count', typingHistogram[i])
    // console.log("HISTO 2",out)
    return out
}



export function locationFilter(input, settings) {
    let output = {}
    Thread.post.stat({ type: 'location', mode: 'clinic', data: getStat(input.clinic) })
    Thread.post.stat({ type: 'location', mode: 'ward', data: getStat(input.ward) })
    Thread.post.stat({ type: 'location', mode: 'room', data: getStat(input.room) })
    output.contactMatrix = contact.selectLevel(input, settings.CS)
    Thread.post.stat({ type: 'location', mode: 'joined', data: getStat(output.contactMatrix) })
    output.contactMatrix = output.contactMatrix.filter(value => value > settings.CT, { onProgress: postProgress(`clip contact distance matrix below ${settings.CT}`) })
    Thread.post.stat({ type: 'location', mode: 'dateFilter', data: getStat(output.contactMatrix) })
    return output
}



// needs contactMatrix and typingMatrix
export function doCorrelation(input, settings) {
    let output = {}
    let contacts = contact.extractContactsPerPatient(input.contactMatrix)
    output.correlationAbsolute = correlation.correlate(input.typingMatrix, contacts, settings)
    output.correlationAbsoluteTC = correlation.absoluteTC(output.correlationAbsolute, settings)
    output.correlationRelative = correlation.relative(output.correlationAbsoluteTC)
    output.correlationRelativeCompounded = correlation.compound(output.correlationRelative)
    output.correlationStats_xMED = correlation.stats_xMED(output.correlationRelativeCompounded)
    output.correlationStats_MEDxMAD = correlation.stats_MEDxMAD(output.correlationRelativeCompounded)
    // output.correlationStats_AMxSD = correlation.stats_AMxSD(output.correlationRelativeCompounded)
    output.correlationDebug = correlation.debug
    // console.log('doCorrelation output', output)
    let stats = {
        xMED: output.correlationStats_xMED.flip().data,
        MEDxMAD: output.correlationStats_MEDxMAD.flip().data,
        // AMxSD: output.correlationStats_AMxSD.flip().data, 
    }
    Thread.post.showCorrelationTable(output.correlationAbsolute.data)//, data.info.data)

    // Thread.post.correlation(output.correlationRelative.data, stats, output.correlationAbsolute.data, settings)
    // Thread.post.showThreshold(stats)
    Thread.post.showDownload()
    Thread.post.showProgress(false)
    return output
}

