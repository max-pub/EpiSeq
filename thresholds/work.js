import { Thread, KV, keep } from '../lib/ext/bundle.js'
import { DistanceMatrix } from '../lib/DistanceMatrix.js'
import { Matrix } from '../lib/Matrix.js'
// import { taliStream } from '../../lib/tali.parse.js'
// import { Stream } from '../lib/stream.js'
import { TaliStream } from '../lib/tali.stream.js'
import { postProgress } from '../lib/Progress.js'
import { correlationVariants } from './lib/correlation.js'
import { calculateThresholds } from './lib/threshold.js'
import { histogramVariants } from './lib/histogram.js'

let output = {}
let config = {}

export async function start(settings) {
    // console.log(settings)

    let input = await loadData(settings)
    console.log('input', input)
    config.preparationParameters = input.preparationParameters.flip().data.value
    config.correlationParameters = input.correlationParameters.flip().data.value
    config.thresholdParameters = keep(settings, 'S_min', 'F_med', 'F_mad')
    console.log('config', config)

    let histoVariants = histogramVariants(input.correlation.data.total)
    console.log(histoVariants)
    // Thread.post.showTypingHistogram(input.histogram.data.count, config)
    Thread.post.showTypingHistogram(histoVariants.absolute, config)
    Thread.post.showHistogramCompoundTable(histoVariants, config)

    Thread.post.showCorrelationTable(input.correlation.data, config)

    let corr = correlationVariants(input.correlation.flip(), config.thresholdParameters)
    // console.log(corr)
    // console.log(corr.relativeFilteredCompounded)
    Thread.post.showCorrelationChart(corr.relativeFiltered.data, config)

    output.thresholds = calculateThresholds(corr.relativeFilteredCompounded, config.thresholdParameters)
    output.correlation = input.correlation
    Thread.post.showThresholdTables(mapValues(output.thresholds, v => v.data), config)

    Thread.post.showDownload()
}



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
            return await TaliStream.fromString(await KV.corr)
        default:
            let url = new URL(`../demo/threshold/${settings.data}.tsv`, import.meta.url)
            return await TaliStream.fromURL(url)
    }
}

async function loadStream(stream) {
    // input = {}
    let output = {}
    // let stream = await getStream(settings)
    // let progressReporter = postProgress('loading data')
    for await (let [table, rowKey, data, done, total] of stream.tabLine()) {
        // progressReporter(done, total)
        if (!output[table]) {
            output[table] = new Matrix(table)
        }
        // input[table] ??= new Matrix()
        output[table].setRow(rowKey, data)
    }
    return output
}



function validateInput(data) {
    let current = Object.keys(data).sort().join(',')
    let target = "correlation,correlationParameters,preparationParameters"

    if (target == current) {
        return true
    } else {
        console.error(`input data INVALID: found [${current}], expected [${target}]`)
        return false
    }
}




export function map(o, f) {
    return Object.fromEntries(Object.entries(o).map(([k, v]) => f(k, v)));
}

export function mapValues(o, f) {
    return map(o, (k, v) => [k, f(v)]);
}




export function tabline(name = 'correlation') {
    console.log('create download', output)


    let arr = [
        ...Object.entries(config).map(([k, v]) => tablineFromDict(v, k)),
        // tablineFromDict(output.parameters, 'ThresholdParameters'),
        // output.parameters.tabline(),
        ...Object.values(output.thresholds).map(v => v.tabline()),
        output.correlation.tabline()
    ]
    let string = arr.join('\n\n')
    // let string = Object.values(output[name]).map(x => x.tabline()).join('\n\n')
    // let string = new Matrix(output.correlation).tabLine()
    // console.log('dl ', string)
    return string
}


function tablineFromDict(dict, name = '') {
    return [
        [name, 'value'].join('\t'),
        ...Object.entries(dict).map(([k, v]) => [k, v].join('\t'))
    ].join('\n')
}