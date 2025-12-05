import { $, $$ } from '../lib/base.js'
import { prettyNumber } from '../lib/ext/bundle.js'
import { showTypeChart } from './chart/histogram.js'
import { showCorrelationChart } from './chart/correlation.js'
import { Matrix } from '../lib/Matrix.js'
// let stream = null
// let input = {}
// let output = {}
let settings = {}

export function setSettings(s = {}) {
    settings = s
    console.log('settings set in main:', settings)
}
export function feedback(text) {
    console.log('feedback:', text)
}
export function print(text) {
    $('output').textContent += text + '\n'
}
// prog = $('progress')
export function showProgress(visible, text) {
    // console.log('showProgress', visible, text)
    $('[type=submit]').disabled = visible
    progress.show(visible, text)
}
export function updateProgress(done, total) {
    progress.update(done, total)
    // let p = $('progress')
    // this.prog.max = total
    // this.prog.value = done
}
export function success(text) {
    $('output').insertAdjacentHTML('beforeend', `<div class="success">&check; ${text}</div>`);
}
export function error(text) {
    $('output').insertAdjacentHTML('beforeend', `<div class="error">&times; ${text}</div>`);
}
export function stat({ type, mode, data } = {}) {
    let html = ''
    if (type == 'typing') {
        if (mode == 'start')
            html = `${data.keys} sequences, ${prettyNumber(data.count)} pairs (${percent(data.count, data.size)} matrix density) before processing`
        if (mode == 'dateFilter')
            html = `${data.keys} sequences, ${prettyNumber(data.count)} pairs (${percent(data.count, data.size)} matrix density) after applying TT=${settings.TT}`
        if (mode == 'patientID')
            html = `${data.keys} patients, ${prettyNumber(data.count)} pairs (${percent(data.count, data.size)} matrix density) after rebasing on patient-ID`
        if (mode == 'distanceFilter')
            html = `${data.keys} patients, ${prettyNumber(data.count)} pairs (${percent(data.count, data.size)} matrix density) after applying TD=${settings.TD}`
    }
    if (type == 'location') {
        if (mode == 'clinic') $('output').insertAdjacentHTML('beforeend', '<br/><br/>')
        if (mode == 'clinic')
            html = `${data.keys} patients  ${prettyNumber(data.count)} <b>clinic</b>-contacts (${percent(data.count, data.size)} matrix density)`
        if (mode == 'ward')
            html = `${data.keys} patients, ${prettyNumber(data.count)} <b>ward</b>-contacts (${percent(data.count, data.size)} matrix density)`
        if (mode == 'room')
            html = `${data.keys} patients, ${prettyNumber(data.count)} <b>room</b>-contacts (${percent(data.count, data.size)} matrix density)`
        if (mode == 'joined')
            html = `${data.keys} patients, ${prettyNumber(data.count)} contacts (${percent(data.count, data.size)} matrix density) after selecting CS=${settings.CS.map(x => x[0].toUpperCase()).join('')}`
        if (mode == 'dateFilter')
            html = `${data.keys} patients, ${prettyNumber(data.count)} contacts (${percent(data.count, data.size)} matrix density) after applying CT=${settings.CT}`
    }
    $('output').insertAdjacentHTML('beforeend', `<div class="stat">&rarr; ${html}</div>`);
}
let germName = '???'
export function setGermName(name) {
    germName = name
    console.log('germ name set to:', germName)
}
export function histogram(data) {
    // console.log('histogram data received:', data)
    // showTypeChart($('#histogram'), data, '500', 'linear')
    showTypeChart($('#histogram'), data, { xLimit: '500', scaleType: 'linear', germName, TT: settings.TT })
}
export function correlation(relative, stats, absolute) {
    // console.log('correlation data received:', relative,stats,absolute)
    showCorrelationChart($('#correlation'), relative, stats, { ...settings, type: 'am2sd', height: '100', germName })
    $('#correlation-table').innerHTML = new Matrix('absolute').setData(absolute).flip().html()
    // $('#correlation-table2').innerHTML = new Matrix(rel).flip().html()
    $('#download').classList.remove('hidden')
}

function percent(a, b, p = 1) {
    return (a / b * 100).toFixed(1) + '%'
}



let progress = new class {
    base = $('#progress')
    prog = $('#progress progress')
    percent = $('#progress .percent')
    // done = $('#progress .done')
    // total = $('#progress .total')
    text = $('#progress .text')
    show(visible, text = '') {
        // console.log('progress-show', visible, text)
        this.text.textContent = text
        // this.base.hidden = !visible
        if (visible) this.base.classList.remove('hidden')
        else this.base.classList.add('hidden')
    }
    update(done, total, text = '') {
        this.prog.max = total
        this.prog.value = done
        this.percent.textContent = done + '%'
        // this.text.textContent = text
        // this.done.textContent = done
        // this.total.textContent = total
    }
}
