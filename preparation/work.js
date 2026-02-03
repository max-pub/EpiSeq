import { keep, Thread } from '../lib/ext/bundle.js'
// import { DistanceMatrix } from '../lib/DistanceMatrix.js'
import { Matrix } from '../lib/Matrix.js'
import { TaliStream } from '../lib/tali.stream.js'
import { postProgress } from '../lib/Progress.js'

// import { unique } from '../lib/ext/bundle.js'
import { statsByYear, pacBio, locationNames } from './lib/statsByYear.js'
// import { sum } from '../lib/ext/bundle.js'

import * as preparation from './work.lib.js'
import { Timer } from './Timer.js'
// let input = {}
// let filtered = {}
// let settings = {}
// let duration = new Matrix('duration')
// let t0 = 0
// let time = 0


let DEBUG = true
let DEMO //= true


let timer1 = new Timer()
let output = {}




export async function start(config) {
    // settings = config
    console.log('thread start with settings', config)
    Thread.post.start()

    // console.log('keep', keep2(config, 'from', 'till', 'rowFilter', 'columnFilter'))
    // console.log("FROM", config['from'])
    let prepParam = { MDRO: config.germName, ...keep2(config, 'from', 'till', 'dateRequired', 'rowFilter', 'columnFilter', 'countNull', 'clinicRequired', 'wardRequired', 'roomRequired', 'pseudonymize') }
    Thread.post.parameterExport(prepParam)

    let s0, s1, s2, s3a, s3b

    try {
        await timer1.measureAsync('0. load data', async () => {
            s0 = await loadAll(config, DEMO)
        })
    } catch (err) {
        console.log('data loading failed, aborting further steps', err)
        Thread.post.error('Data loading failed, please check your input files.')
        return
    }

    // Thread.post.statsByYear(statsByYear(s0.typingMatrix, s0.locationMatrix, 'raw data by year').html(), 'before')

    Thread.post.statsByYear(statsByYear(s0.typingMatrix, s0.locationMatrix).data, 'before')

    Thread.post.pacBio('before', ...pacBio(s0.typingMatrix))
    // if (DEBUG) {
    //     // console.log('pac bio raw', pacBio(filtered.typingMatrix))
    //     Thread.post.output(`<p>${config.germName} pac-bio before filter: ` + pacBio(s0.typingMatrix).join(' / ') + `</p>`)
    //     // console.log('location names', locationNames(s0.locationMatrix))
    // }

    // t0 = Date.now()
    timer1.measure('1. filter', () => {
        s1 = preparation.filter(s0, config)
    })

    // Thread.post.statsByYear(statsByYear(s1.typingMatrix, s1.locationMatrix, 'filtered data by year').html(), 'after')
    Thread.post.statsByYear(statsByYear(s1.typingMatrix, s1.locationMatrix).data, 'after')

    Thread.post.pacBio('after', ...pacBio(s1.typingMatrix))
    // if (DEBUG) {
    //     Thread.post.output(`<p>${config.germName} pac-bio after filter:` + pacBio(s1.typingMatrix).join(' / ') + `</p>`)
    //     // console.log('pac bio filtered', pacBio(filtered.typingMatrix))
    // }

    timer1.measure('2. pseudonymization', () => {
        let pseudonymizationLengths = { patientID: 4, sequenceID: 5, locationID: 5, clinic: 3, ward: 3, room: 4 }
        s1 = preparation.pseudonymize(s1, config, pseudonymizationLengths)
        // pseudonymize(filtered, config, { patientID: 4, sequenceID: 5, locationID: 5, clinic: 3, ward: 3, room: 4 })
        // preparation.pseudonymize()
    })

    timer1.measure('3a. typing distance', () => {
        s3a = preparation.calculateTypingDistance(s1, config)
    })

    timer1.measure('3b. location distance', () => {
        s3b = preparation.calculateLocationDistance(s1, config)
    })
    output = { ...s3a, ...s3b }

    console.log('output', output)
    // console.log('duration', timer1.report())    
    Thread.post.durationTable(timer1.report())

    Thread.post.done()
}








async function fileStream(file) { return await TaliStream.fromFile(file) }
async function urlStream(url) { return await TaliStream.fromURL(new URL(url, import.meta.url)) }

async function loadOne(stream) {
    let output = {}
    let progressReporter = postProgress('loading data')
    for await (let [table, rowKey, data, done, total] of stream.tabLine()) {
        progressReporter(done, total)
        output[table] ??= new Matrix()
        output[table].setRow(rowKey, data)
    }
    return output
}
async function loadTypingData(settings, demo = false) {
    let x
    if (demo) x = await loadOne(await urlStream(`../demo/temp/cgmlst.tsv`))
    else x = await loadOne(await fileStream(settings.typingFile))
    if (!x.sequenceID) throw new Error('Typing data loading failed')// return false
    preparation.postTypingStat('loadRawData', x.sequenceID)
    // Thread.post.typingStatRow('loadRawData', preparation.getStat(x.sequenceID))
    return x.sequenceID
}
async function loadLocationData(settings, demo = false) {
    let x
    if (demo) x = await loadOne(await urlStream(`../demo/temp/locations.tsv`))
    else x = await loadOne(await fileStream(settings.locationFile))
    if (!x.locationID) throw new Error('Location data loading failed') //return false
    preparation.postLocationStat('loadRawData', x.locationID)
    // Thread.post.locationStatRow('loadRawData', preparation.getStat(x.locationID))
    return x.locationID
}

async function loadAll(settings, demo) {
    return {
        typingMatrix: await loadTypingData(settings, demo),
        locationMatrix: await loadLocationData(settings, demo)
    }
}







export function tabline() {
    console.log('create download', output)
    // console.log('tl1',output.typingHistogram.tabline())
    let string = Object.values(output).map(x => x.tabline()).join('\n\n')
    // let string = new Matrix(output.correlation).tabLine()
    // console.log('dl ', string)
    return string
}





function keep2(input, ...keys) {
    // console.log('keep2', input, keys)
    let output = {}
    for (let k of keys)
        if (input[k] !== undefined)
            output[k] = input[k]
        else output[k] = false
    // console.log('keep output',output)
    return output
}




// function logTime(name) {
//     let timeDiff = (Date.now() - t0) // 1000
//     t0 = Date.now()
//     duration.set(name, 'duration', timeDiff + ' ms')
// }