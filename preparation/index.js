import { formExtractor } from '../lib/formdata.js'
import { Thread, KV, download, $ } from '../lib/ext/bundle.js'
// import { download } from '../lib/download.js'
// import { $, $$ } from '../lib/base.js'
// import * as lib from '../lib/ext/bundle.js'
// import * as typeFilter from './lib/filter/typing.js'
// import * as locationFilter from './lib/filter/location.js'
// import * as dateFilter from './lib/filter/date.js'
// import * as otherFilter from './lib/filter/other.js'                
// import { KV } from '../lib/ext/bundle.js'
import { loadHTML } from '../lib/loadHTML.js'

import * as main from './main.js'
// import * as work from './work.js'
let thread = await new Thread('work.js', import.meta.url).init({ responder: main })
// console.log('thread ready', thread)
// work.start({})

let settings = {}
// console.log("aaa")


await loadHTML('#form','form.html');



$('form').addEventListener('submit', (e) => {
    // console.log('form submit')
    e.preventDefault()
    let form = e.target
    settings = formExtractor(form)
    if (!settings.germName) settings.germName = $('[name="germName"]').getAttribute('placeholder')
    // console.log('extracted settings:', settings)
    // console.log('set', settings)
    thread.start(settings)
    // await start(settings)
    // console.log('extracted', formExtractor(form))
    return false
})


$('#downloadResult').addEventListener('click', async (e) => {
    // console.log('download now')
    let data = await thread.tabline()
    download('data.tsv', data)
})

$('#cacheAndProceed').addEventListener('click', async (e) => {
    // console.log('download now')
    let data = await thread.tabline()
    KV.prep = data
    await KV.prep // ensure it's saved
    console.log('data cached to KV store', await KV.prep)
    window.location.href = '../correlation/'
})

$('#downloadStats').addEventListener('click', async (e) => {
    // console.log('download now')
    let data = main.statExport()
    download('preparation.tsv', data)
})




















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
//     showProgress(visible, text) {
//         $('[type=submit]').disabled = visible
//         progress.show(visible, text)
//     }
//     updateProgress(done, total) {
//         progress.update(done, total)
//     }
//     success(text) {
//         $('output').insertAdjacentHTML('beforeend', `<div class="success">&check; ${text}</div>`);
//     }
//     error(text) {
//         $('output').insertAdjacentHTML('beforeend', `<div class="error">&times; ${text}</div>`);
//     }
//     // stat({ type, mode, data } = {}) {
//     //     let html = ''
//     //     if (type == 'typing') {
//     //         if (mode == 'dateValidator') $('output').insertAdjacentHTML('beforeend', `<br/>`);

//     //         if (mode == 'start')
//     //             html = `${data.keys} sequences, ${data.patients} patients before filtering`
//     //         if (mode == 'dateValidator')
//     //             html = `${data.keys} sequences, ${data.patients} patients after date-validation`
//     //         if (mode == 'rowFilter')
//     //             html = `${data.keys} sequences, ${data.patients} patients after row filtering`
//     //         if (mode == 'columnFilter')
//     //             html = `${data.keys} sequences, ${data.patients} patients after column filtering`
//     //     }
//     //     if (type == 'location') {
//     //         if (mode == 'start')
//     //             html = `${data.keys} locations, ${data.patients} patients before filtering`
//     //         if (mode == 'dateValidator')
//     //             html = `${data.keys} locations, ${data.patients} patients after date-validation`
//     //     }
//     //     $('output').insertAdjacentHTML('beforeend', `<div class="stat">&rarr; ${html}</div>`);
//     // }

//     // statTable(html) {
//     //     $('output').insertAdjacentHTML('beforeend', html);
//     // }

//     typingStatRow(mode, data) {
//         $(`table#typing tbody`).insertAdjacentHTML('beforeend', `<tr><th>${mode}</th><td>${data.rows}</td><td>${data.patients}</td><td>${data.columns - 2}</td></tr>`)
//     }

//     locationStatRow(mode, data) {
//         $(`table#location tbody`).insertAdjacentHTML('beforeend', `<tr><th>${mode}</th><td>${data.rows}</td><td>${data.patients}</td></tr>`)
//     }

// }
// // // const progress = {
// // //     base: $('#progress'),
// // //     progress: $('#progress progress'),
// // //     percent: $('#progress .percent'),
// // //     text: $('#progress .text'),
// // // }


// let progress = new class {
//     base = $('#progress')
//     prog = $('#progress progress')
//     percent = $('#progress .percent')
//     text = $('#progress .text')
//     show(visible, text = '') {
//         this.text.textContent = text
//         // this.base.hidden = !visible
//         if (visible) this.base.classList.remove('hidden')
//         else this.base.classList.add('hidden')
//     }
//     update(done, total, text = '') {
//         this.prog.max = total
//         this.prog.value = done
//         this.percent.textContent = done + '%'
//     }
// }


