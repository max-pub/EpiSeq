import { formExtractor } from '../lib/formdata.js'
import { Thread, KV } from '../lib/ext/bundle.js'
// import { showTypeChart } from './chart/histogram.js'
// import { showCorrelationChart } from './chart/correlation.js'
import { Matrix } from '../lib/Matrix.js'
import { start } from './work.js'
import { download } from '../lib/download.js'
import { prettyNumber } from '../lib/ext/bundle.js'
import { $, $$ } from '../lib/base.js'
import { loadHTML } from '../lib/loadHTML.js'

import * as main from './main.js'
// import { exportVectorPdf } from '../lib/pdf.js'


// console.log('main imported', main)
let thread = await new Thread('work.js', import.meta.url).init({ responder: main })
// console.log('thread ready', thread)

await loadHTML('#data','data.html');
await loadHTML('#form','form.html');

if (await KV.corr) {
    // console.log('loading data from KV store', await KV.corr)
    $('#data hr').insertAdjacentHTML('afterend',`
        <label>
        <input type="radio" name="data" value="prep" checked>
            cached data from [correlation]
        </label>
        `)
}

// $('#pdf').addEventListener('click', async (e) => {
//     exportVectorPdf('#correlation', 'correlation-chart.pdf')
//     // exportVectorPdf($('#correlation .chart'), 'correlation-chart.pdf')
// })

$('#download').addEventListener('click', async (e) => {
    // console.log('download now')
    let data = await thread.tabline()
    download('thresholds.tsv', data)
})

$('[type=file]').addEventListener('change', (e) => {
    let input = e.target
    let file = input.files[0]
    // console.log('file selected', file, file.name)
    if (file) {
        // $('#filename').textContent = file.name
        $('[name=data][value=file]').checked = true
    }
})

// let settings = {}
$('form').addEventListener('submit', async (e) => {
    e.preventDefault()
    let form = e.target
    let settings = formExtractor(form)
    // main.setSettings(settings)
    await thread.start(settings)
    // await start(settings)
    // console.log('extracted', formExtractor(form))
    return false
})













