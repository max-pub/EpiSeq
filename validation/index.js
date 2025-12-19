import { Thread } from '../lib/ext/bundle.js'
import { $ } from '../lib/base.js';
import { formExtractor } from '../lib/formdata.js'

import { loadHTML } from '../lib/loadHTML.js'

await loadHTML('#prep', '../preparation/form.html');
await loadHTML('#corr', '../correlation/form.html');

$('[name="rowFilter"]').setAttribute('value', 60)
$('[name="TD"]').setAttribute('value', 10)

import * as main from './main.js'
// import * as work from './work.js'
let thread = await new Thread('work.js', import.meta.url).init({ responder: main })


let settings = {}
$('form').addEventListener('submit', (e) => {
    e.preventDefault()
    $('#output').innerHTML = ''
    $('output').innerHTML = ''
    let form = e.target
    settings = formExtractor(form)
    thread.start(settings)
    return false
})