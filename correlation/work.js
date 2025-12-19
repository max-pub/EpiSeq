import { Thread, KV } from '../lib/ext/bundle.js'
import { DistanceMatrix } from '../lib/DistanceMatrix.js'
import { Matrix } from '../lib/Matrix.js'
// import { taliStream } from '../../lib/tali.parse.js'
// import { Stream } from '../lib/stream.js'
import { TaliStream } from '../lib/tali.stream.js'
import { postProgress } from '../lib/Progress.js'

// import { TypeFilter } from './lib/typing.js'

// import * as typing from './lib/typing.js'
// import * as contact from './lib/contact.js'
// import * as correlation from './lib/correlation.js'

// import { selectLevel } from './lib/contact.js'
// import { extractContactsPerPatient } from './lib/contact.js'

import * as correlation from './work.lib.js'
// let stream = null
// let input = {}
let output = {}
// let settings = {}



export async function start(config) {
    // settings = config
    console.log('worker started with settings:', config)
    // await startStream()
    let s3 = await loadData(config)

    let s4a = correlation.typingFilter(s3, config, { histogram: true })
    let s4b = correlation.locationFilter(s3, config)
    let s5 = correlation.doCorrelation({ ...s4a, ...s4b }, config)


    output.correlation = { ...s5, ...s4a, ...s4b }
    // output.intermediary = { ...s4a, ...s4b }
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

async function loadData(config) {
    let stream = await getStream(config)
    let data = await loadStream(stream)
    console.log('data loaded', data)
    let result = validateInput(data)
    return data
}
async function getStream(settings) {
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

async function loadStream(stream) {
    // input = {}
    let output = {}
    // let stream = await getStream(settings)
    let progressReporter = postProgress('loading data')
    for await (let [table, rowKey, data, done, total] of stream.tabLine()) {
        progressReporter(done, total)
        if (!output[table]) {
            if (["clinic", "ward", "room", "dateMatrix", "typingMatrix"].includes(table)) {
                output[table] = new DistanceMatrix()
            } else {
                output[table] = new Matrix()
            }
        }
        // input[table] ??= new Matrix()
        output[table].setRow(rowKey, data)
    }
    return output
}



function validateInput(data) {
    let current = Object.keys(data).sort().join(',')
    let target = "clinic,dateMatrix,info,room,sequencePatientMap,typingMatrix,ward"

    if (target == current) {
        return true
    } else {
        console.error(`input data INVALID: found [${current}], expected [${target}]`)
        return false
    }
}



// function convertToDistanceMatrices() {
//     let dms = ["clinic", "ward", "room", "dateMatrix", "typingMatrix"]
//     for (let i in dms) {
//         Thread.post.progress(i, dms.length)
//         input[dms[i]] = new DistanceMatrix(input[dms[i]], 'integer')
//     }
// }




export function tabline(name = 'correlation') {
    console.log('create download', output)
    // console.log('tl1',output.typingHistogram.tabline())
    let string = Object.values(output[name]).map(x => x.tabline()).join('\n\n')
    // let string = new Matrix(output.correlation).tabLine()
    // console.log('dl ', string)
    return string
}

