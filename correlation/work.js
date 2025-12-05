import { Thread, KV } from '../lib/ext/bundle.js'
import { DistanceMatrix } from '../lib/DistanceMatrix.js'
import { Matrix } from '../lib/Matrix.js'
// import { taliStream } from '../../lib/tali.parse.js'
// import { Stream } from '../lib/stream.js'
import { TaliStream } from '../lib/tali.stream.js'
import { postProgress } from '../lib/Progress.js'

// import { TypeFilter } from './lib/typing.js'
import * as typing from './lib/typing.js'
import * as contact from './lib/contact.js'
import * as correlation from './lib/correlation.js'
// import { selectLevel } from './lib/contact.js'
// import { extractContactsPerPatient } from './lib/contact.js'


// let stream = null
let input = {}
let output = {}
let settings = {}



export async function start(config) {
    settings = config
    console.log('worker started with settings:', settings)
    // await startStream()
    await load()
    await validateInput()
    // return
    // await convertToDistanceMatrices()
    await filterAndConvert()
}


// async function startStream() {
//     if (settings.data == 'file') {
//         // Thread.post.print('Loading data from file:' + settings.file.name)
//         stream = await TaliStream.fromFile(settings.file)
//     } else {
//         // Thread.post.print('Loading data from URL: ' + settings.data)
//         let url = new URL(`../demo/${settings.data}.tsv`, import.meta.url)
//         // Thread.post.print('Resolved URL: ' + url.href)
//         stream = await TaliStream.fromURL(url)
//     }

// }

async function getStream() {
    switch (settings.data) {
        case 'file':
            return await TaliStream.fromFile(settings.file)
        case 'prep':
            return await TaliStream.fromString(await KV.prep)
        default:
            let url = new URL(`../demo/${settings.data}.tsv`, import.meta.url)
            return await TaliStream.fromURL(url)
    }
}

async function load() {
    // for await (let line of stream.lines()) {
    //     Thread.post.feedback(`Loaded line:${stream.progress.done}`)// + line.slice(0,10))
    // }
    // console.log('start tali', stream, stream.tali)
    input = {}
    // for await (let [table, id, dict] of stream.tali()) {
    //     Thread.post.progress(stream.progress.done, stream.progress.total)
    //     // Thread.post.feedback(`Loaded line:${stream.progress.done}/${stream.progress.total}  ${(stream.progress.done / stream.progress.total * 100).toFixed(1)}%`)// + line.slice(0,10))
    //     input[table] ??= {}
    //     input[table][id] = dict
    //     // Thread.post.feedback(`Loaded line:${table} ${id}`)// + line.slice(0,10))
    // }
    let stream = await getStream()
    let progressReporter = postProgress('loading data')
    // for await (let [table, rowKey, colKey, val, done, total] of stream.tali2()) {
    //     progressReporter(done, total)
    //     input[table] ??= new Matrix()
    //     input[table].set(rowKey, colKey, val)
    // }
    for await (let [table, rowKey, data, done, total] of stream.tabLine()) {
        progressReporter(done, total)
        if (!input[table]) {
            if (["clinic", "ward", "room", "dateMatrix", "typingMatrix"].includes(table)) {
                input[table] = new DistanceMatrix()
            } else {
                input[table] = new Matrix()
            }
        }
        // input[table] ??= new Matrix()
        input[table].setRow(rowKey, data)
    }
    console.log('tali load done', input)
}



function validateInput() {
    let current = Object.keys(input).sort().join(',')
    let target = "clinic,dateMatrix,info,room,sequencePatientMap,typingMatrix,ward"

    // console.log('tali done', input, current, target == current)
    if (target == current) {
        // console.log(`input data validated ${current}`)
        // Thread.post.success("input data validated")
    } else {
        console.error(`input data INVALID: found [${current}], expected [${target}]`)
        // Thread.post.error(`input data invalid: found [${current}], expected [${target}]`)
    }
}



// function convertToDistanceMatrices() {
//     let dms = ["clinic", "ward", "room", "dateMatrix", "typingMatrix"]
//     for (let i in dms) {
//         Thread.post.progress(i, dms.length)
//         input[dms[i]] = new DistanceMatrix(input[dms[i]], 'integer')
//     }
// }
function getStat(matrix) {
    return { keys: matrix.rowKeys().length, count: matrix.count(), size: matrix.size() }
}

function filterAndConvert() {
    // process TYPING
    Thread.post.stat({ type: 'typing', mode: 'start', data: getStat(input.typingMatrix) })
    output.typingMatrix = typing.filterByDate(input.typingMatrix, input.dateMatrix, settings.TT)
    Thread.post.stat({ type: 'typing', mode: 'dateFilter', data: getStat(output.typingMatrix) })
    output.typingMatrix = typing.rebaseOnPatientID(output.typingMatrix, input.sequencePatientMap)
    Thread.post.stat({ type: 'typing', mode: 'patientID', data: getStat(output.typingMatrix) })
    let typingHistogram = output.typingMatrix.histogram({ onProgress: postProgress('compute typing distance histogram') })
    console.log('input info', input.info)
    Thread.post.setGermName(input.info.get('germName','value'))
    Thread.post.histogram(typingHistogram)
    output.typingMatrix = output.typingMatrix.filter(value => value < settings.TD, { onProgress: postProgress(`clip typing distance above ${settings.TD}`) })
    Thread.post.stat({ type: 'typing', mode: 'distanceFilter', data: getStat(output.typingMatrix) })

    // process CONTACTS
    Thread.post.stat({ type: 'location', mode: 'clinic', data: getStat(input.clinic) })
    Thread.post.stat({ type: 'location', mode: 'ward', data: getStat(input.ward) })
    Thread.post.stat({ type: 'location', mode: 'room', data: getStat(input.room) })
    output.contactMatrix = contact.selectLevel(input, settings.CS)
    Thread.post.stat({ type: 'location', mode: 'joined', data: getStat(output.contactMatrix) })
    output.contactMatrix = output.contactMatrix.filter(value => value > settings.CT, { onProgress: postProgress(`clip contact distance matrix below ${settings.CT}`) })
    Thread.post.stat({ type: 'location', mode: 'dateFilter', data: getStat(output.contactMatrix) })
    let contacts = contact.extractContactsPerPatient(output.contactMatrix)
    // console.log('output1', output)

    // process CORRELATION
    output.correlationAbsolute = correlation.correlate(output.typingMatrix, contacts, settings)
    output.correlationRelative = correlation.relative(output.correlationAbsolute)
    output.correlationRelativeCompounded = correlation.compound(output.correlationRelative)
    output.correlationStats_am2sd = correlation.stats_AM2SD(output.correlationRelativeCompounded)
    output.correlationStats_med2mad = correlation.stats_MED20MAD(output.correlationRelativeCompounded)
    console.log('output', output)
    Thread.post.correlation(output.correlationRelative.data, { am2sd: output.correlationStats_am2sd.flip().data, med2mad: output.correlationStats_med2mad.flip().data }, output.correlationAbsolute.data)

    Thread.post.showProgress(false)
}



export function tabline() {
    console.log('create download', output)
    // console.log('tl1',output.typingHistogram.tabline())
    let string = Object.values(output).map(x => x.tabline()).join('\n\n')
    // let string = new Matrix(output.correlation).tabLine()
    // console.log('dl ', string)
    return string
}

