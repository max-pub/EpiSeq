import { prettyNumber, Thread, unique } from '../lib/ext/bundle.js'
import * as dateFilter from './lib/filter/date.js'
import * as typeFilter from './lib/filter/typing.js'
import * as locationFilter from './lib/filter/location.js'
import * as otherFilter from './lib/filter/other.js'

import { pseudonymizeTypings, pseudonymizeLocations } from './lib/pseudonymize.js'

import * as typingDistance from './lib/distance/typing.js'
import * as locationDistance from './lib/distance/location.js'
import { Timer } from './Timer.js'
// import { postStat } from './main.js'


let timer = new Timer()



export function postTypingStat(name, matrix) {
    let stat = {
        typings: prettyNumber(matrix.rowKeys().length, {separator: ' '}),
        patients: prettyNumber(unique(matrix.columnValues('patientID')).length, {separator: ' '}),
        alleles: prettyNumber(matrix.colKeys().length, {separator: ' '}),
        duration: timer.step() + ' ms'
    }
    Thread.post.addStat('filter', 'typing', name, stat)
    // Thread.post.typingStatRow(name, stat)
}
export function postLocationStat(name, matrix) {
    let stat = {
        locations: prettyNumber(matrix.rowKeys().length, {separator: ' '}),
        patients: prettyNumber(unique(matrix.columnValues('patientID')).length, {separator: ' '}),
        duration: timer.step() + ' ms'
    }
    Thread.post.addStat('filter', 'location', name, stat)
    // Thread.post.locationStatRow(name, stat)
}


function getStat(matrix) {
    return {
        keys: matrix.rowKeys().length,
        count: prettyNumber(matrix.count(), {separator: ' '}),
        size: prettyNumber(matrix.size(), {separator: ' '}),
        duration: timer.step(),
    }
}



// needs typingMatrix and locationMatrix
export function filter(data, settings) {
    data.typingMatrix = dateFilter.typeDateFilter(data.typingMatrix, settings.from, settings.till)
    postTypingStat('dateFilter', data.typingMatrix)
    data.locationMatrix = dateFilter.locationDateFilter(data.locationMatrix, settings.from, settings.till)
    postLocationStat('dateFilter', data.locationMatrix)

    if (settings.dateRequired) {
        data.typingMatrix = dateFilter.validateTypingMatrix(data.typingMatrix)
        postTypingStat('dateValidator', data.typingMatrix)
        // Thread.post.typingStatRow('dateValidator', getStat(data.typingMatrix))
        data.locationMatrix = dateFilter.validateLocationMatrix(data.locationMatrix)
        postLocationStat('dateValidator', data.locationMatrix)
        // Thread.post.locationStatRow('dateValidator', getStat(data.locationMatrix))
    }

    if (settings.rowFilter) {
        data.typingMatrix = typeFilter.rowFilter(data.typingMatrix, settings.rowFilter)
        postTypingStat('rowFilter', data.typingMatrix)
        // Thread.post.typingStatRow('rowFilter', getStat(data.typingMatrix))
    }
    if (settings.columnFilter) {
        data.typingMatrix = typeFilter.columnFilter(data.typingMatrix, settings.columnFilter)
        postTypingStat('columnFilter', data.typingMatrix)
        // Thread.post.typingStatRow('columnFilter', getStat(data.typingMatrix))
    }

    if (settings.clinicRequired) {
        data.locationMatrix = locationFilter.removeEntriesWithout(data.locationMatrix, 'clinic')
        postLocationStat('clinicRequired', data.locationMatrix)
        // Thread.post.locationStatRow('clinicRequired', getStat(data.locationMatrix))
    }
    if (settings.wardRequired) {
        data.locationMatrix = locationFilter.removeEntriesWithout(data.locationMatrix, 'ward')
        postLocationStat('wardRequired', data.locationMatrix)
        // Thread.post.locationStatRow('wardRequired', getStat(data.locationMatrix))
    }
    if (settings.roomRequired) {
        data.locationMatrix = locationFilter.removeEntriesWithout(data.locationMatrix, 'room')
        postLocationStat('roomRequired', data.locationMatrix)
        // Thread.post.locationStatRow('roomRequired', getStat(data.locationMatrix))
    }
    otherFilter.patientIntersectionFilter(data.typingMatrix, data.locationMatrix)
    postTypingStat('patientIntersection', data.typingMatrix)
    // Thread.post.typingStatRow('patientIntersection', getStat(data.typingMatrix))
    // Thread.post.locationStatRow('patientIntersection', getStat(data.locationMatrix))
    postLocationStat('patientIntersection', data.locationMatrix)

    // console.log('preparation filter output', data)
    return data
}


// import { pseudoMAP } from '../lib/ext/bundle.js'
// needs typingMatrix and locationMatrix
export function pseudonymize(data, settings, lengths) {
    // pseudonymize typings
    if (settings.pseudonymize) {
        data.typingMatrix = pseudonymizeTypings(data.typingMatrix, lengths)
        postTypingStat('pseudonymization', data.typingMatrix)
        data.locationMatrix = pseudonymizeLocations(data.locationMatrix, lengths)
        postLocationStat('pseudonymization', data.locationMatrix)
    }
    // console.log('pseudo map', pseudoMAP)
    return data
}




// needs typingMatrix
export function calculateTypingDistance(input, settings) {
    let output = {}
    timer.step()
    output.dateMatrix = typingDistance.dateDistance(input.typingMatrix)
    Thread.post.addStat('distance', 'typing', 'dateMatrix', getStat(output.dateMatrix))
    // console.log('date distance matrix', output.dateMatrix)
    output.typingMatrix = typingDistance.typingDistance(input.typingMatrix, settings.countNull)
    Thread.post.addStat('distance', 'typing', 'typingMatrix', getStat(output.typingMatrix))
    // console.log('typing distance matrix', output.typingMatrix)
    output.sequencePatientMap = typingDistance.sequencePatientMap(input.typingMatrix)
    output.info = typingDistance.typingInfo(input.typingMatrix)
    output.info.set('germName', 'value', settings.germName)
    // console.log('calculateTypingDistance output', output)
    return output
}



// needs locationMatrix
export function calculateLocationDistance(input) {
    let locationTree = locationDistance.groupByPatientID(input.locationMatrix)
    // console.log('location tree', locationTree)  
    let contactTree = locationDistance.calculateDistanceTree(locationTree)
    // console.log('contact tree', contactTree)
    let contactMatrices = locationDistance.calculateContactMatrix(contactTree)
    Thread.post.addStat('distance', 'location', 'clinic', getStat(contactMatrices.clinic))
    Thread.post.addStat('distance', 'location', 'ward', getStat(contactMatrices.ward))
    Thread.post.addStat('distance', 'location', 'room', getStat(contactMatrices.room))
    // console.log('calculateLocationDistance output', contactMatrices)
    return contactMatrices
}




// export function getStat(matrix) {
//     // let timeDiff = Date.now() - time
//     // time = Date.now()
//     return {
//         rows: matrix.rowKeys().length,
//         patients: unique(matrix.columnValues('patientID')).length,
//         columns: matrix.colKeys().length,
//         duration: timer.step()
//     }
// }
