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
    // console.log("schema", s3.info.data, s3.info.get('schemaLength', 'value'))
    config = { ...config, schemaLength: s3.info.get('schemaLength', 'value'), germName: s3.info.get('germName', 'value') }

    let s4a = correlation.typingFilter(s3, config, { histogram: true })
    // console.log("S4A",s4a)
    let s4b = correlation.locationFilter(s3, config)
    config.schemaLength = parseInt(s3.info.get('schemaLength', 'value'))
    let s5 = correlation.doCorrelation({ ...s4a, ...s4b }, config)
    // console.log('correlation results', s5.correlationAbsolute)

    output.correlation = { ...s5, ...s4a, ...s4b, config }
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
    // console.log('data loaded', data)
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
            let url = new URL(`../demo/correlation/${settings.data}.tsv`, import.meta.url)
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
    // output.correlation.c12 = correlation.debug
    let c = output.correlation.config
    // console.log("CONF", c)
    let preparationParameters = new Matrix('preparationParameters')
    preparationParameters.set('MDRO', 'value', c.germName)
    preparationParameters.set('T_len', 'value', c.schemaLength)

    let correlationParameters = new Matrix('correlationParameters')
    correlationParameters.set('S_gap', 'value', c.TT)
    correlationParameters.set('C_gap', 'value', c.CT)
    correlationParameters.set('C_loc', 'value', c.CS.map(x => x[0].toUpperCase()).join(''))
    correlationParameters.set('C_hop', 'value', c.CD)
    correlationParameters.set('T_tol', 'value', c.MR)

    let arr = [
        preparationParameters.tabline(),
        correlationParameters.tabline(),
        // output.correlation.histogram.flip().tabline(),
        output.correlation.correlationAbsolute.flip().tabline(),
        // output.correlation.correlationAbsoluteTC.flip().tabline(),
        // output.correlation.correlationRelative.flip().tabline(),
        // output.correlation.correlationRelativeCompounded.flip().tabline(),
        // output.correlation.correlationStats_xMED.flip().tabline(),
        // output.correlation.correlationStats_MEDxMAD.flip().tabline(),
        // output.correlation.correlationStats_AMxSD.flip().tabline(),
    ]
    let string = arr.join('\n\n')
    // let string = Object.values(output[name]).map(x => x.tabline()).join('\n\n')
    // let string = new Matrix(output.correlation).tabLine()
    // console.log('dl ', string)
    return string
}

