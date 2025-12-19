import { $ } from "../lib/base.js";

// export function table(title, html) {
//     $('output').innerHTML += `<h3 class='title'>${title}</h3>` + html//`<div class="tableContainer">${html}</div>`;
// }

// export function tables(title, ...tables) {
//     $('output').innerHTML += `<h1>${title}</h1><div class="flex-around">${tables.join(' ')}</div>`
// }

// export function HR() {
//     $('output').insertAdjacentHTML('beforeend', `<hr style="margin: 50px 0"/>`);
// }

export function one(title, table) {
    let id = title.toLowerCase().replace(/[^a-z]/gi, '_');
    $('#output').insertAdjacentHTML('beforeend', `<tr id='${id}'> <td colspan="2" class='title'>${title}</td> </tr>`)
    $('#output').insertAdjacentHTML('beforeend', `<tr id='${id}'> <td colspan="2" class='center'>${table}</td> </tr>`)
    // window.scrollTo(0, document.body.scrollHeight);
    // location.hash = id;
    // location.hash = '___raw_input_data';
    location.hash = 'submit'
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

// export function typingStatRow(mode, data) {
//     console.log('typingStatRow', mode, data)
// }
// export function locationStatRow(mode, data) {
//     console.log('locationStatRow', mode, data)
// }

