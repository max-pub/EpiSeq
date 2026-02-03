import { $, $$ } from '../lib/base.js'
import { prettyNumber } from '../lib/ext/bundle.js'
import { typingHistogram } from './chart/histogram.js'
import { correlationChart } from './chart/correlation.js'
import { Matrix } from '../lib/Matrix.js'

let settings = {}


// let germName = '???'
// export function setGermName(name) {
//     germName = name
//     document.title = name
//     // console.log('germ name set to:', germName)
// }

export function showTypingHistogram(data, info) {
    // console.log('histogram',data,info)
    typingHistogram($('#histogram'), data, info, { xLimit: '100', scaleType: 'linear' }) // , germName, TT: settings.TT, TM: settings.TM
}

export function showHistogramCompoundTable(histoVariants) {
    let matrix = new Matrix('Histogram Compounded Relative')
    for (let i in histoVariants.compoundedRelative)
        matrix.set(i, 'value', histoVariants.compoundedRelative[i])
    $('#histogram-table').innerHTML = matrix.flip().html().replace('value','')
}


export function showCorrelationChart(data, info) {
    // console.log('show corr chart', data, info)
    correlationChart($('#correlation'), data, info, { height: '100', width: '100' })
}

export function showCorrelationTable(absolute, info) {
    $('#correlation-table').innerHTML = new Matrix(info.preparationParameters.MDRO + ' Correlation Results').setData(absolute).html().replaceAll('C_hop', `C<sub>hop</sub>`).replaceAll("_", ' = ')
}


export function showThresholdTables(stats, info) {
    let tp = info.thresholdParameters
    let names = { xMED: 'Baseline Relative', MEDxMAD: 'Hampel Filter' }
    $('#stat_tables').innerHTML = ''
    for (let stat in stats) {
        $('#stat_tables').innerHTML += '<h2>' + names[stat] + ` Threshold for ${info.preparationParameters.MDRO}</h2>`
        if (stat == 'xMED') $('#stat_tables').innerHTML += `<h4>pair-connectivity-cutoff = ${tp.F_med} &times; median</h4>`
        if (stat == 'MEDxMAD') $('#stat_tables').innerHTML += `<h4>pair-connectivity-cutoff = median + ${tp.F_mad} &times; MAD</h4>`
        $('#stat_tables').innerHTML += `<h3>S<sub>min</sub> = ${tp.S_min}</h3>`
        $('#stat_tables').innerHTML += new Matrix(stat).setData(stats[stat]).html().replaceAll('C_hop', `C<sub>hop</sub>`).replaceAll("_", ' = ').replaceAll('cutOff', 'pair-connectivity-cutOff (y-axis)').replaceAll('threshold', 'cgMLST-threshold (x-axis)')
    }
}


export function showDownload() {
    $('#download').classList.remove('hidden')

}

function percent(a, b, p = 1) {
    return (a / b * 100).toFixed(1) + '%'
}



