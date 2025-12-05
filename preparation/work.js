import { Thread } from '../lib/ext/bundle.js'
import { DistanceMatrix } from '../lib/DistanceMatrix.js'
import { Matrix } from '../lib/Matrix.js'
// import { taliStream } from '../../lib/tali.parse.js'
// import { Stream } from '../lib/stream.js'
import { TaliStream } from '../lib/tali.stream.js'
import { postProgress } from '../lib/Progress.js'

import * as dateFilter from './lib/filter/date.js'
import * as typeFilter from './lib/filter/typing.js'
import * as locationFilter from './lib/filter/location.js'
import * as otherFilter from './lib/filter/other.js'
import { unique } from '../lib/ext/bundle.js'
import { pseudonymizeTypings, pseudonymizeLocations } from './lib/pseudonymize.js'

let input = {}
let filtered = {}
let output = {}
let settings = {}

let time = 0

// let TEST = false
let TEST = true

export async function start(config) {
    settings = config
    console.log('thread start', config)

    time = Date.now()
    let isDataLoaded = await loadAll()
    if (!isDataLoaded) {
        console.log('data loading failed, aborting further steps')
        Thread.post.print('Data loading failed, please check your input files.')
        return
    }
    filter()
    pseudonymize()
    calculateDistances()
    Thread.post.done()
}

async function fileStream(file) { return await TaliStream.fromFile(file) }
async function urlStream(url) { return await TaliStream.fromURL(new URL(url, import.meta.url)) }

async function loadAll() {
    if (TEST) await loadOne(await urlStream(`../demo/temp/cgmlst.tsv`))
    else await loadOne(await fileStream(settings.typingFile))
    if (!input.sequenceID) return false
    Thread.post.typingStatRow('loadRawData', getStat(input.sequenceID))
    if (TEST) await loadOne(await urlStream(`../demo/temp/locations.tsv`))
    else await loadOne(await fileStream(settings.locationFile))
    if (!input.locationID) return false
    Thread.post.locationStatRow('loadRawData', getStat(input.locationID))

    console.log('input data', input)
    filtered.typingMatrix = input.sequenceID
    filtered.locationMatrix = input.locationID
    return true
}

async function loadOne(stream) {
    // input = {}
    let progressReporter = postProgress('loading data')
    for await (let [table, rowKey, data, done, total] of stream.tabLine()) {
        progressReporter(done, total)
        input[table] ??= new Matrix()
        input[table].setRow(rowKey, data)
    }
    // console.log('tali load done', input)
}


function getStat(matrix) {
    let timeDiff = Date.now() - time
    time = Date.now()
    return { rows: matrix.rowKeys().length, patients: unique(matrix.columnValues('patientID')).length, columns: matrix.colKeys().length, duration: timeDiff }
}

function filter() {
    // console.log('input data', input)
    // filtered.typingMatrix = input.sequenceID
    // filtered.locationMatrix = input.locationID
    // Thread.post.typingStatRow('loadRawData', getStat(filtered.typingMatrix))
    // Thread.post.locationStatRow('loadRawData', getStat(filtered.locationMatrix))

    filtered.typingMatrix = dateFilter.typeDateFilter(filtered.typingMatrix, settings.from, settings.till)
    Thread.post.typingStatRow('dateFilter', getStat(filtered.typingMatrix))
    filtered.locationMatrix = dateFilter.locationDateFilter(filtered.locationMatrix, settings.from, settings.till)
    Thread.post.locationStatRow('dateFilter', getStat(filtered.locationMatrix))

    if (settings.dateRequired) {
        filtered.typingMatrix = dateFilter.validateTypingMatrix(filtered.typingMatrix)
        Thread.post.typingStatRow('dateValidator', getStat(filtered.typingMatrix))
        filtered.locationMatrix = dateFilter.validateLocationMatrix(filtered.locationMatrix)
        Thread.post.locationStatRow('dateValidator', getStat(filtered.locationMatrix))
    }

    if (settings.rowFilter) {
        filtered.typingMatrix = typeFilter.rowFilter(filtered.typingMatrix, settings.rowFilter)
        Thread.post.typingStatRow('rowFilter', getStat(filtered.typingMatrix))
    }
    if (settings.columnFilter) {
        filtered.typingMatrix = typeFilter.columnFilter(filtered.typingMatrix, settings.columnFilter)
        Thread.post.typingStatRow('columnFilter', getStat(filtered.typingMatrix))
    }

    if (settings.clinicRequired) {
        filtered.locationMatrix = locationFilter.removeEntriesWithout(filtered.locationMatrix, 'clinic')
        Thread.post.locationStatRow('clinicRequired', getStat(filtered.locationMatrix))
    }
    if (settings.wardRequired) {
        filtered.locationMatrix = locationFilter.removeEntriesWithout(filtered.locationMatrix, 'ward')
        Thread.post.locationStatRow('wardRequired', getStat(filtered.locationMatrix))
    }
    if (settings.roomRequired) {
        filtered.locationMatrix = locationFilter.removeEntriesWithout(filtered.locationMatrix, 'room')
        Thread.post.locationStatRow('roomRequired', getStat(filtered.locationMatrix))
    }
    otherFilter.patientIntersectionFilter(filtered.typingMatrix, filtered.locationMatrix)
    Thread.post.typingStatRow('patientIntersection', getStat(filtered.typingMatrix))
    Thread.post.locationStatRow('patientIntersection', getStat(filtered.locationMatrix))

    console.log('filtered', filtered)
}


function pseudonymize() {
    // pseudonymize typings
    if (settings.pseudonymize) {
        filtered.typingMatrix = pseudonymizeTypings(filtered.typingMatrix)
        filtered.locationMatrix = pseudonymizeLocations(filtered.locationMatrix)
    }
}


import * as typingDistance from './lib/distance/typing.js'
import * as locationDistance from './lib/distance/location.js'


function calculateDistances() {
    output.dateMatrix = typingDistance.dateDistance(filtered.typingMatrix)
    // console.log('date distance matrix', output.dateMatrix)
    output.typingMatrix = typingDistance.typingDistance(filtered.typingMatrix, settings.countNull)
    // console.log('typing distance matrix', output.typingMatrix)
    output.sequencePatientMap = typingDistance.sequencePatientMap(filtered.typingMatrix)
    output.info = typingDistance.typingInfo(filtered.typingMatrix)
    output.info.set('germName', 'value', settings.germName)
    console.log('typing done', output)


    let locationTree = locationDistance.groupByPatientID(filtered.locationMatrix)
    // console.log('location tree', locationTree)  
    let contactTree = locationDistance.calculateDistanceTree(locationTree)
    // console.log('contact tree', contactTree)
    let contactMatrices = locationDistance.calculateContactMatrix(contactTree)
    console.log('contacts done', contactMatrices)

    output = { ...output, ...contactMatrices }
    // console.log('contact matrix', contactMatrix)
    console.log('calculation done', output)
}

export function tabline() {
    console.log('create download', output)
    // console.log('tl1',output.typingHistogram.tabline())
    let string = Object.values(output).map(x => x.tabline()).join('\n\n')
    // let string = new Matrix(output.correlation).tabLine()
    // console.log('dl ', string)
    return string
}
