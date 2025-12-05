import { $, $$ } from '../lib/base.js'
import { Matrix } from '../lib/Matrix.js'

export function feedback(text) {
    console.log('feedback:', text)
}
export function print(text) {
    $('output').textContent += text + '\n'
}
export function showProgress(visible, text) {
    $('[type=submit]').disabled = visible
    progress.show(visible, text)
}
export function updateProgress(done, total) {
    // console.log('updateProgress', done, total)
    progress.update(done, total)
}
export function success(text) {
    $('output').insertAdjacentHTML('beforeend', `<div class="success">&check; ${text}</div>`);
}
export function error(text) {
    $('output').insertAdjacentHTML('beforeend', `<div class="error">&times; ${text}</div>`);
}


let stats = { typing: new Matrix('typingStats'), location: new Matrix('locationStats') }
export function typingStatRow(mode, data) {
    // console.log('typingStatRow', mode, data, $('table'),$(`table#typing tbody`))
    stats.typing.setRow(mode, data)
    $(`table#typing tbody`).insertAdjacentHTML('beforeend', `<tr><th>${mode}</th><td>${data.rows}</td><td>${data.patients}</td><td>${data.columns - 2}</td><td class='duration'>${data.duration}ms</td></tr>`)
}

export function locationStatRow(mode, data) {
    stats.location.setRow(mode, data)
    $(`table#location tbody`).insertAdjacentHTML('beforeend', `<tr><th>${mode}</th><td>${data.rows}</td><td>${data.patients}</td><td class='duration'>${data.duration}ms</td></tr>`)
}

export function statExport() {
    return stats.typing.tabline() + '\n\n' + stats.location.tabline()
}
export function done(){
    console.log('preparation done')
    $('#download').classList.remove('hidden')
}

let progress = new class {
    base = $('#progress')
    prog = $('#progress progress')
    percent = $('#progress .percent')
    text = $('#progress .text')
    show(visible, text = '') {
        this.text.textContent = text
        // this.base.hidden = !visible
        if (visible) this.base.classList.remove('hidden')
        else this.base.classList.add('hidden')
    }
    update(done, total, text = '') {
        this.prog.max = total
        this.prog.value = done
        this.percent.textContent = done + '%'
    }
}