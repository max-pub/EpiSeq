import { Thread } from '../lib/ext/bundle.js'
import { Matrix } from '../lib/Matrix.js'
import { TaliStream } from '../lib/tali.stream.js'

// import { filter, pseudonymize } from '../preparation/work/filter.js'
// import { calculateTypingDistance, calculateLocationDistance } from '../preparation/work/distance.js'

// import { doCorrelation, locationFilter, typingFilter } from '../correlation/work.js'



import * as preparation from '../preparation/work.lib.js'   

import * as correlation from '../correlation/work.lib.js'


export async function start(config) {
    console.log('worker started with config:', config)


    let s0 = await loadAll()
    Thread.post.two('0: Raw Input Data',
        s0.typingMatrix.html(),
        s0.locationMatrix.html()
    )
    // console.log('raw location data', s0.locationMatrix.data)
    let s1 = preparation.filter(s0, config)
    Thread.post.two('1: Filtered Data',
        s1.typingMatrix.html(),
        s1.locationMatrix.html()
    )

    if (config.pseudonymize) {
        let pseudonymizationLengths = { patientID: 2, sequenceID: 2, locationID: 2, clinic: 2, ward: 2, room: 2 }
        s1 = preparation.pseudonymize(s1, config, pseudonymizationLengths)
        Thread.post.two('2: Pseudonymized Data',
            s1.typingMatrix.html(),
            s1.locationMatrix.html()
        )
    }
    let s3a = preparation.calculateTypingDistance(s1, config)
    let s3b = preparation.calculateLocationDistance(s1)
    Thread.post.two(['3: Distance Calculation','shared data'],
        [
            s3a.dateMatrix.html(),
            s3a.typingMatrix.html(),
            s3a.sequencePatientMap.html()
        ].join(' '),
        [
            s3b.clinic.html(),
            s3b.ward.html(),
            s3b.room.html()
        ].join(' '),
    )
    console.log('typing distances', s3a.typingMatrix.tabline())
    console.log('clinic distances', s3b.clinic.tabline())

    let s4a = correlation.typingFilter(s3a, config)
    let s4b = correlation.locationFilter(s3b, config)
    Thread.post.two('4: Distance Filter',
        s4a.typingMatrix.html(),
        s4b.contactMatrix.html(),
    )

    let s5 = correlation.doCorrelation({...s4a, ...s4b}, config)
    // console.log('final correlation result', s5)
    Thread.post.one('5: Correlation Result', s5.correlationAbsolute.flip().html())
}








// async function fileStream(file) { return await TaliStream.fromFile(file) }
async function urlStream(url) { return await TaliStream.fromURL(new URL(url, import.meta.url)) }
async function loadOne(stream) {
    let output = {}
    for await (let [table, rowKey, data, done, total] of stream.tabLine()) {
        output[table] ??= new Matrix(table)
        output[table].setRow(rowKey, data)
    }
    return output
}
async function loadAll() {
    let typing = await loadOne(await urlStream(`data/cgmlst.tsv`))
    // Thread.post.table('Typing Data', input.sequenceID.html())
    let location = await loadOne(await urlStream(`data/locations.tsv`))
    // Thread.post.table('Location Data', input.locationID.html())
    return { typingMatrix: typing.sequenceID, locationMatrix: location.locationID }
}

