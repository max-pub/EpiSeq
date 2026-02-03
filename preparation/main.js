import { $, $$, show, hide } from '../lib/base.js'
import { Matrix } from '../lib/Matrix.js'

// export function feedback(text) {
//     console.log('feedback:', text)
// }
// export function print(text) {
//     $('output').textContent += text + '\n'
// }
export function start() {
    $('#output').innerHTML = ''
    $('output').innerHTML = ''
    hide($('#download'))
    $('button[type=submit]').disabled = true
}
export function done() {
    show($('#download'))
    $('button[type=submit]').disabled = false
    progress.show(false)
}



export function output(html) {
    $('output').innerHTML += html
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



let stats = {
    // typing: new Matrix('TypingFilter'),
    // location: new Matrix('LocationFilter'),
    parameters: new Matrix('preparationParameters'),
    durations: new Matrix('Durations'),
    pacBio: new Matrix('PacBio'),
    // before: new Matrix('DataBeforeFilters'),
    // after: new Matrix('DataAfterFilters'),
}


function addFilterRow(reference, title) {
    if (!$(`#output .${reference}`)) $('#output').insertAdjacentHTML('beforeend', `<tr class='${reference}'><td colspan="2" class='title'>${title}</td></tr> <tr class='${reference} data'><td class='typing'></td><td class='location'></td></tr>`)
}
export function addStat(primary, secondary, tertiary, data) { // filter, location , {}
    addFilterRow(primary, primary)
    let id = secondary + "_" + primary
    stats[id] ??= new Matrix(id)
    stats[id].setRow(tertiary, data)
    $(`#output .${primary} .${secondary}`).innerHTML = stats[id].html()
}


// export function typingStatRow(mode, data) {
//     addFilterRow('filter', 'Filter')
//     stats.typing.setRow(mode, data)
//     $('#output .filter .typing').innerHTML = stats.typing.html()
// }

// export function locationStatRow(mode, data) {
//     addFilterRow('filter', 'Filter')
//     stats.location.setRow(mode, data)
//     $('#output .filter .location').innerHTML = stats.location.html()
// }



// export function typingStatRow(mode, data) {
//     // console.log('typingStatRow', mode, data, $('table'),$(`table#typing tbody`))
//     show($('#stats'))
//     stats.typing.setRow(mode, data)
//     $(`table#typing tbody`).insertAdjacentHTML('beforeend', `<tr><th>${mode}</th><td>${data.rows}</td><td>${data.patients}</td><td>${data.columns - 2}</td><td class='duration'>${data.duration}ms</td></tr>`)
// }

// export function locationStatRow(mode, data) {
//     show($('#stats'))
//     stats.location.setRow(mode, data)
//     $(`table#location tbody`).insertAdjacentHTML('beforeend', `<tr><th>${mode}</th><td>${data.rows}</td><td>${data.patients}</td><td class='duration'>${data.duration}ms</td></tr>`)
// }

export function parameterExport(p) {
    // console.log('parameter export', p)
    for (let k in p) {
        stats.parameters.set(k, 'value', p[k])
    }
}

export function pacBio(filter, a, b) {
    stats.pacBio.set(filter + 'Filter', 'beforeDate', a)
    stats.pacBio.set(filter + 'Filter', 'afterDate', b)
}

export function durationTable(list) {
    // let x = new Matrix('durations')
    for (let item of list)
        stats.durations.setRow(item.name, { duration: item.time + ' ms' })

    // $('#durationTable').innerHTML = `<h1>Processing Duration</h2>`+x.html()
    // $('output').insertAdjacentHTML('beforeend', `<div class="statsByYear">${html}</div>`)
}
// export function durationTable(html) {
//     $('#durationTable').innerHTML = `<h1>Processing Duration</h2>`+html
//     // $('output').insertAdjacentHTML('beforeend', `<div class="statsByYear">${html}</div>`)
// }
export function statsByYear(data, n) {
    // console.log('statsByYear html', html)
    // $(`#statsByYear${n}`).innerHTML = html

    // reactivate lien below to have stats in download
    // stats[n].setData(data)

    // $(`#statsByYear .${n}`).innerHTML = `<h1>${n} filter</h2>`+html
    // $('output').insertAdjacentHTML('beforeend', `<div class="statsByYear">${html}</div>`)
}


export function statExport() {
    // return stats.typing.tabline() + '\n\n' + stats.location.tabline()
    return Object.values(stats).map(x => x.tabline()).join('\n\n')
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



export function two(title, table1, table2) {
    let subtitle = ''
    if (Array.isArray(title)) [title, subtitle] = title
    let id = title.toLowerCase().replace(/[^a-z]/gi, '_');
    $('#output').insertAdjacentHTML('beforeend', `<tr id='${id}'> <td colspan="2" class='title'>${title}</td> </tr>`)
    if (subtitle)
        $('#output').insertAdjacentHTML('beforeend', `<tr id='${id}'> <td colspan="2" class='subtitle'>${subtitle}</td> </tr>`)
    $('#output').insertAdjacentHTML('beforeend', `<tr id='${id}'> <td class='left'>${table1}</td> <td class='right'>${table2}</td> </tr>`)
}