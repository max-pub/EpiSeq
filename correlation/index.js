import { formExtractor } from '../lib/formdata.js'
import { Thread, KV } from '../lib/ext/bundle.js'
// import { showTypeChart } from './chart/histogram.js'
// import { showCorrelationChart } from './chart/correlation.js'
import { Matrix } from '../lib/Matrix.js'
import { start } from './work.js'
import { download } from '../lib/download.js'
import { prettyNumber } from '../lib/ext/bundle.js'
import { $, $$ } from '../lib/base.js'

import * as main from './main.js'
console.log('main imported', main)
let thread = await new Thread('work.js', import.meta.url).init({ responder: main })
console.log('thread ready', thread)

if (await KV.prep) {
    console.log('loading data from KV store', await KV.prep)
    $('#data hr').insertAdjacentHTML('afterend',`
        <label>
        <input type="radio" name="data" value="prep" checked>
            cached data from step 1
        </label>
        `)
}


$('#download').addEventListener('click', async (e) => {
    // console.log('download now')
    let data = await thread.tabline()
    download('data.tsv', data)
})

$('[type=file]').addEventListener('change', (e) => {
    let input = e.target
    let file = input.files[0]
    // console.log('file selected', file, file.name)
    if (file) {
        $('#filename').textContent = file.name
        $('[name=data][value=file]').checked = true
    }
})

// let settings = {}
$('form').addEventListener('submit', async (e) => {
    e.preventDefault()
    let form = e.target
    let settings = formExtractor(form)
    main.setSettings(settings)
    await thread.start(settings)
    // await start(settings)
    // console.log('extracted', formExtractor(form))
    return false
})














// import { DistanceMatrix } from '../lib/DistanceMatrix.js'
// import { TypeFilter } from './lib/typing.js'

// let dm = new DistanceMatrix()
// dm.set('A', 'B', 5)
// dm.set('B', 'C', 10) 
// dm.set('E', 'D', 11) 
// dm.del('C', 'B')
// await dm.clipBelow(7)
// for await (let [k1,k2,v] of dm) {
//     console.log('dm entry', k1, k2, v, Number.isFinite(v))
// }
// dm.clipBelow(7)
// console.log('after clipBelow',dm)

// class T1 {
//     x = 1
//     // constructor() { }
//     m1(x) {
//         this.x = x
//         console.log('set x',x)
//         let t = new this.constructor()
//         t.x=x
//         return t
//     }
// }
// class T2 extends T1 {
//     // constructor() { super() }

// }
// console.log('new this', new T2().m1(7))


// function $(o) { return document.querySelector(o) }
// function $$(o) { return [...document.querySelectorAll(o)] }
// Node.prototype.$ = function (o) { return this.querySelector(o) }
// Node.prototype.$$ = function (o) { return [...this.querySelectorAll(o)] }


// let responder = new class {
//     feedback(text) {
//         console.log('feedback:', text)
//     }
//     print(text) {
//         $('output').textContent += text + '\n'
//     }
//     // prog = $('progress')
//     showProgress(visible, text) {
//         // console.log('showProgress', visible, text)
//         $('[type=submit]').disabled = visible
//         progress.show(visible, text)
//     }
//     updateProgress(done, total) {
//         progress.update(done, total)
//         // let p = $('progress')
//         // this.prog.max = total
//         // this.prog.value = done
//     }
//     success(text) {
//         $('output').insertAdjacentHTML('beforeend', `<div class="success">&check; ${text}</div>`);
//     }
//     error(text) {
//         $('output').insertAdjacentHTML('beforeend', `<div class="error">&times; ${text}</div>`);
//     }
//     stat({ type, mode, data } = {}) {
//         let html = ''
//         if (type == 'typing') {
//             if (mode == 'start')
//                 html = `${data.keys} sequences, ${prettyNumber(data.count)} pairs (${percent(data.count, data.size)} matrix density) before processing`
//             if (mode == 'dateFilter')
//                 html = `${data.keys} sequences, ${prettyNumber(data.count)} pairs (${percent(data.count, data.size)} matrix density) after applying TT=${settings.TT}`
//             if (mode == 'patientID')
//                 html = `${data.keys} patients, ${prettyNumber(data.count)} pairs (${percent(data.count, data.size)} matrix density) after rebasing on patient-ID`
//             if (mode == 'distanceFilter')
//                 html = `${data.keys} patients, ${prettyNumber(data.count)} pairs (${percent(data.count, data.size)} matrix density) after applying TD=${settings.TD}`
//         }
//         if (type == 'location') {
//             if (mode == 'clinic') $('output').insertAdjacentHTML('beforeend', '<br/><br/>')
//             if (mode == 'clinic')
//                 html = `${data.keys} patients  ${prettyNumber(data.count)} <b>clinic</b>-contacts (${percent(data.count, data.size)} matrix density)`
//             if (mode == 'ward')
//                 html = `${data.keys} patients, ${prettyNumber(data.count)} <b>ward</b>-contacts (${percent(data.count, data.size)} matrix density)`
//             if (mode == 'room')
//                 html = `${data.keys} patients, ${prettyNumber(data.count)} <b>room</b>-contacts (${percent(data.count, data.size)} matrix density)`
//             if (mode == 'joined')
//                 html = `${data.keys} patients, ${prettyNumber(data.count)} contacts (${percent(data.count, data.size)} matrix density) after joining CS=${settings.CS.map(x => x[0].toUpperCase()).join('')}`
//             if (mode == 'dateFilter')
//                 html = `${data.keys} patients, ${prettyNumber(data.count)} contacts (${percent(data.count, data.size)} matrix density) after applying CT=${settings.CT}`
//         }
//         $('output').insertAdjacentHTML('beforeend', `<div class="stat">&rarr; ${html}</div>`);
//     }

//     histogram(data) {
//         // console.log('histogram data received:', data)
//         showTypeChart($('#histogram'), data, '500', 'linear')
//     }
//     correlation(relative, stats, absolute) {
//         // console.log('correlation data received:', relative,stats,absolute)
//         showCorrelationChart($('#correlation'), relative, stats, settings, 'am2sd', 100)
//         $('#correlation-table').innerHTML = new Matrix('absolute').setData(absolute).flip().html()
//         // $('#correlation-table2').innerHTML = new Matrix(rel).flip().html()
//         $('#download').classList.remove('hidden')
//     }
// }

// let progress = new class {
//     base = $('#progress')
//     prog = $('#progress progress')
//     percent = $('#progress .percent')
//     // done = $('#progress .done')
//     // total = $('#progress .total')
//     text = $('#progress .text')
//     show(visible, text = '') {
//         // console.log('progress-show', visible, text)
//         this.text.textContent = text
//         // this.base.hidden = !visible
//         if (visible) this.base.classList.remove('hidden')
//         else this.base.classList.add('hidden')
//     }
//     update(done, total, text = '') {
//         this.prog.max = total
//         this.prog.value = done
//         this.percent.textContent = done + '%'
//         // this.text.textContent = text
//         // this.done.textContent = done
//         // this.total.textContent = total
//     }
// }




// let thread = await new Thread('worker.js', import.meta.url).init({ responder })

