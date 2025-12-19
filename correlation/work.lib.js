import { Thread } from '../lib/ext/bundle.js'
// import { DistanceMatrix } from '../lib/DistanceMatrix.js'
// import { Matrix } from '../lib/Matrix.js'

import * as typing from './lib/typing.js'
import * as contact from './lib/contact.js'
import * as correlation from './lib/correlation.js'
import { postProgress } from '../lib/Progress.js'

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
    if (options.histogram) histogram({ typingMatrix: output.typingMatrix, info: input.info })
    output.typingMatrix = output.typingMatrix.filter(value => value <= settings.TD, { onProgress: postProgress(`clip typing distance above ${settings.TD}`) })
    Thread.post.stat({ type: 'typing', mode: 'distanceFilter', data: getStat(output.typingMatrix) })
    return output
}

export function histogram(data) {
    let schemaLength = parseInt(data.info.get('schemaLength', 'value'))
    let typingHistogram = data.typingMatrix.histogram({ maxDistance: schemaLength, onProgress: postProgress('compute typing distance histogram') })
    // console.log('input info', input.info)
    Thread.post.setGermName(data.info.get('germName', 'value'))
    let germName = data.info.get('germName', 'value')
    Thread.post.showHistogram(typingHistogram, germName)

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
    output.correlationRelative = correlation.relative(output.correlationAbsolute)
    output.correlationRelativeCompounded = correlation.compound(output.correlationRelative)
    output.correlationStats_am2sd = correlation.stats_AM2SD(output.correlationRelativeCompounded)
    output.correlationStats_med2mad = correlation.stats_MED20MAD(output.correlationRelativeCompounded)
    console.log('doCorrelation output', output)
    Thread.post.correlation(output.correlationRelative.data, { am2sd: output.correlationStats_am2sd.flip().data, med2mad: output.correlationStats_med2mad.flip().data }, output.correlationAbsolute.data)

    Thread.post.showProgress(false)
    return output
}

