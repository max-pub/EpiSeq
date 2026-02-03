
// import { sourceInput, sourceFilter, typeFilter, locationFilter, correlation } from '../lib/mod.js'
// import { median, average, standardDeviation, MAD } from '../../lib/ext/bundle.js	'
import { showChart, space } from '../../lib/apex.bridge.js'
// import { } from '../lib/mod.js'

// function buildRollingAverage(sourceData, rolling) {
// 	let rollingData = {}
// 	// console.log('buidl rolling', Object.keys(sourceData).length - rolling)
// 	for (let i = 0; i < Object.keys(sourceData).length - rolling * 1; i++) {
// 		// console.log('build rolling', i)
// 		rollingData[i] ??= {}
// 		for (let key in sourceData[i]) {
// 			rollingData[i][key] = 0
// 			for (let j = i; j <= i + rolling * 1; j++) {
// 				// console.log('build', i, j, key)
// 				rollingData[i][key] += sourceData[j][key]
// 			}
// 		}
// 	}
// 	return rollingData
// }

function template() {
	return `
<div class="chart"></div>

<div class="flex-between">
	<div class="width">
		<a mode='20'>20</a>
		<a mode='100'>100</a>
		<a mode='500'>500</a>
		<a mode='full'>full</a>
	</div>


	<div class="height">
		<a mode='60'>60</a>
		<a mode='80'>80</a>
		<a mode='100'>100</a>
	</div>



	<div class="export">
		<a>tsv</a>
		<a>svg</a>
		<a>png</a>
	<!--	<a>print</a> -->
	</div>
</div>
`
}
// <div class="type">
// 	<a mode='xMED'>10&times;MED</a>
// 	<a mode='MEDxMAD'>MED+5&times;MAD</a>
// 	<a mode='AMxSD'>AM+2&times;SD</a>
// </div> 


function applyTemplate(container, sourceData, stats, settings) {
	container.innerHTML = template()
	container.$$(`.height a`).map(x => x.addEventListener('click', event => showCorrelationChart(container, sourceData, stats, { ...settings, height: event.target.getAttribute('mode').trim() })))
	container.$$(`.width a`).map(x => x.addEventListener('click', event => showCorrelationChart(container, sourceData, stats, { ...settings, width: event.target.getAttribute('mode').trim() })))
	container.$$(`.type a`).map(x => x.addEventListener('click', event => showCorrelationChart(container, sourceData, stats, { ...settings, type: event.target.getAttribute('mode').trim() })))
	container.$(`[mode='${settings.height}']`).classList.add('selected')
	// container.$(`[mode='${settings.type}']`).classList.add('selected')
}

// function compound(data, CD) {
// 	// console.log('compound', data, CD)
// 	let out = []
// 	for (let i = 0; i <= CD; i++) {
// 		// console.log('i', i)
// 		for (let j = 0; j < data[i].length; j++) {
// 			// console.log('j', j)
// 			out[j] ??= 0
// 			out[j] += data[i][j]
// 		}
// 	}
// 	// console.log('compound out', out)
// 	return out
// }

// function findThreshold(list, threshold) {
// 	for (let i in list)
// 		if (list[i] < threshold)
// 			return i * 1
// }

// function space(x) {
// 	return new Array(x).fill(`\u200e`).join(' ')
// }


function settingsString(settings) {
	//  ${space(10)} S<<min>> = ${settings.TC}
	//  ${space(10)} T<<tol>> = ${settings.MR}
	// return `T<<gap>>=${settings.TT} ${space(5)} T<<tol>>=${settings.MR} ${space(5)} T<<min>>=${settings.TC} ${space(10)} C<<lvl>>=${settings.CS.map(x => x[0].toUpperCase()).join('')} ${space(5)} C<<gap>>=${settings.CT} ${space(5)} C<<hop>>=${settings.CD}`
	return `S{gap} = ${settings.TT} ${space(10)} C{gap} = ${settings.CT} ${space(10)} C{loc} = ${settings.CS.map(x => x[0].toUpperCase()).join('')}`
}
// function settingsString(settings) {
// 	return `TT=${settings.TT} ${space(5)} TV=${settings.MR} ${space(5)} TM=${settings.TC} ${space(7)} CS=${settings.CS.map(x => x[0].toUpperCase()).join('')} ${space(5)} CT=${settings.CT} ${space(5)} CD=${settings.CD}`
// }
function settingsStringFilename(settings) {
	return `TT${settings.TT}_TV${settings.MR}_TM${settings.TC}_CS${settings.CS.map(x => x[0].toUpperCase()).join('')}_CT${settings.CT}_CD${settings.CD}`
}

// function dictToString(){

// }
// const statsMap = {
// 	arithmeticMean: 'μ',
// 	standardDeviation: 'σ',
// 	cutOff: 'χ',
// 	threshold: 'τ',
// }

function legendString(mode, settings) {
	let chopN = mode.slice(2) * 1
	let chop = `C{hop} = ${chopN} ${space(5)}`
	let ttol = `T{tol} = ${settings.MR} ${space(5)}`
	return chop + (chopN > 0 ? ttol : '') + space(5)
}
function statsString(stat) {
	// console.log('stats string', stat)
	// let mappedStats = Object.fromEntries(Object.entries(stats).map(([x, y]) => ([statsMap[x], y])))
	// return ` (μ=${stat?.arithmeticMean?.toFixed(1) ?? '?'}% &nbsp; σ=${stat?.standardDeviation?.toFixed(1) ?? '?'}%) → (χ ≤ ${stat?.cutOff?.toFixed(1) ?? '?'}% &nbsp; τ ≤ ${stat?.threshold?.toFixed(0) ?? '?'})` // ≡
	return ` -> τ ≤ ${stat?.threshold?.toFixed(0) ?? '?'}  (μ=${stat?.arithmeticMean?.toFixed(1) ?? '?'}% &nbsp; σ=${stat?.standardDeviation?.toFixed(1) ?? '?'}% &nbsp; χ ≤ ${stat?.cutOff?.toFixed(1) ?? '?'}%)` // ≡
	// return ` (μ=${stat?.arithmeticMean?.toFixed(1) ?? '?'}% &nbsp; σ=${stat?.standardDeviation?.toFixed(1) ?? '?'}% &nbsp; χ ≤ ${stat?.cutOff?.toFixed(1) ?? '?'}% &nbsp; τ ≤ ${stat?.threshold?.toFixed(0) ?? '?'})` // ≡
	// return `  (χ ≤ ${stat?.cutOff?.toFixed(1) ?? '?'}% &nbsp; τ ≤ ${stat?.threshold?.toFixed(0) ?? '?'})` // ≡
}

export function showCorrelationChart(container, sourceData, stats, settings = { germName, type: 'xMED', height: '100', width: '100' }) {
	// console.log('showCorrelationChart', sourceData, stats, settings)

	// let xMax = series[0].length
	// let xMax = settings.TD
	let xMax = settings.width == 'full' ? settings.schemaLength * 1 : settings.width * 1
	// console.log('xMax', xMax, settings.schemaLength)
	let yMax = settings.height * 1
	let stat = stats[settings.type]
	// console.log('corr stats', settings, stats, stat)
	// console.log('yMax', yMax, '-', height)

	if (xMax > 1000) xMax = Math.ceil(xMax / 100) * 100 // greater 1000 ? round to next 100
	let xTicks = xMax < 1000 ? 20 : (xMax / 100)

	console.log('source data', sourceData)
	let firstRow = Object.values(sourceData)[0]
	console.log('first row', firstRow)
	let series = Object.keys(firstRow).map(mode => ({
		// let series = ['c0', 'c1', 'c2'].map(mode => ({
		// name: mode.toUpperCase(),//+ statsString(stat[mode]),
		name: legendString(mode, settings),
		//.replace('cd0', 'primary contacts').replace('cd1', 'secondary contacts').replace('cd2', 'tertiary contacts'),
		// data: Object.entries(sourceData).map(([x, y]) => ({ x: x * 1, y: y[mode] })).filter(x => x.x <= xMax)
		data: Array(xMax + 1).fill(1).map((x, i) => ({ x: i, y: sourceData[i]?.[mode] ?? 0 }))
	}))

	// let yLines = { [`${stat.cd0.median}`]: `median` }
	// let yLines = {}
	// for (let cd in stat)
	// 	yLines[stat[cd].cutOff] = cd

	// console.log('yLines', yLines)

	applyTemplate(container, sourceData, stats, settings)

	// console.log('median', med)
	// console.log('corrrel', correlation.formData, correlation.formString)
	// let filename = 'correlation___' + settingsStringFilename(settings)
	let filename = 'correlation.' + xMax
	container.setAttribute('title', filename)

	let options = {
		// filename: sourceInput.title_ + '___' + typeFilter.formString_ + '___' + locationFilter.formString_ + '___' + correlation.formString_ + '___h_' + height,
		filename,
		mainTitle: settings.germName ?? 'germX',  // .replace('E. coli','i[E. coli]i')
		subTitle: settingsString(settings),//`germX`,
		// filename: 'correlation_' + sourceInput.title_,
		// mainTitle: (sourceInput.title) ?? '',
		// subTitle: `${typeFilter.formString}  ${space(5)}  ${locationFilter.formString}  ${space(5)}  ${correlation.formString}`,
		// mainTitle: `${sourceInput.title ?? ''}: ${space(3)} typing location correlation`,//  ${space(8)}  `,
		xTitle: `cgMLST distance`,
		yTitle: `pair connectivity`,
		yMin: 0,
		yMax,
		xMax,
		xTicks,

		// xTicks: xMax <= 50 ? 'dataPoints' : Math.floor(xMax / 2),
		yTicks: yMax / 5,
		yFormat: v => v.toFixed(0) + '%',
		height: '500px',
		// yLines: { [med]: `median = ${med.toFixed(1)}%`, [med * TH]: `median * ${TH} = ${(med * TH).toFixed(1)}%` },
		// yLines,
		// threshold: med * TH,
		// threshold: sd * 2,
		// colors: ['#FF4D16', '#FC9C1C', '#FFD81C']
		colors: ['#6495ED', '#90EE90', '#F0E68C'], // == cornflowerblue.6495ED, lightgreen.90EE90, khaki.F0E68C, coral.FF7F50
		// 
		// colors: ['#6495EDff', '#6495EDaa', '#6495ED55']
		// yLines: { [med]: 'median', [med * 3]: '3x', [med * 5]: '5x', [med * 10]: '10x' },
		// yLines: { [med]: 'median' },
	}

	showChart(container, series, options)
}






// export function showCorrelationChart(container, sourceData, settings, type, height = '100') {
// 	console.log('corr chart', sourceData, settings, type, height)

// 	let yMax = height * 1
// 	// console.log('yMax', yMax, '-', height)

// 	let series = Object.keys(sourceData[0]).filter(x => x != 'typings').map(mode => ({
// 		// let series = ['c0', 'c1', 'c2'].map(mode => ({
// 		name: mode.replace('c0', 'primary contacts').replace('c1', 'secondary contacts').replace('c2', 'tertiary contacts'),
// 		data: Object.entries(sourceData).map(([x, y]) => ({ x: x * 1, y: (y[mode] / y.typings * 100).toFixed(2) * 1 }))
// 	}))

// 	let dat = series.map(x => x.data.map(y => y.y))
// 	let xMax = dat[0].length
// 	// console.log('xMax', xMax)
// 	// let cmp = compound(dat, cd * 1)
// 	// console.log('dat,cmp', dat, cmp)

// 	let info = {}, yLines = {}
// 	for (let cd = 0; cd <= settings.CD; cd++) {
// 		let cmp = compound(dat, cd)
// 		if (type == 'SD') {
// 			let avg = average(cmp)
// 			let sd = standardDeviation(cmp)
// 			let cutoff = avg + (sd * 2)
// 			let threshold = findThreshold(cmp, cutoff)
// 			yLines[cutoff] = cd
// 			info[cd] = { 'arithmetic mean': avg, 'standard deviation': sd, cutoff, threshold, }
// 		}
// 		if (type == 'MAD') {
// 			let med = median(cmp)
// 			let mad = MAD(cmp)
// 			let cutoff = med + (mad * 20)
// 			let threshold = findThreshold(cmp, cutoff)
// 			yLines[cutoff] = cd
// 			info[cd] = { median: med, MAD: mad, cutoff, threshold, }
// 		}
// 		if (type == 'med') {
// 			let med = median(cmp)
// 			let cutoff = med * 10
// 			let threshold = findThreshold(cmp, cutoff)
// 			yLines[cutoff] = cd
// 			info[cd] = { median: med, cutoff, threshold, }
// 		}
// 		// console.log('yLines', yLines)
// 		// console.log('info', info)
// 	}
// 	// console.log('info', info)
// 	// console.log('series', series)

// 	for (let i in series)
// 		// series[i].name = [series[i].name,`\n<br/>(μ=${info[i]?.['arithmetic mean']?.toFixed(1) ?? '?'}%, σ=${info[i]?.['standard deviation']?.toFixed(1) ?? '?'}% → χ ≤ ${info[i]?.threshold?.toFixed(1) ?? '?'}% → τ ≤ ${info[i]?.cutoff?.toFixed(0) ?? '?'})`]
// 		series[i].name += ` (μ=${info[i]?.['arithmetic mean']?.toFixed(1) ?? '?'}% &nbsp; σ=${info[i]?.['standard deviation']?.toFixed(1) ?? '?'}%) → (χ ≤ ${info[i]?.cutoff?.toFixed(1) ?? '?'}% &nbsp; τ ≤ ${info[i]?.threshold?.toFixed(0) ?? '?'})` // ≡
// 	// series[i].name += ` (μ=${info[i]?.['arithmetic mean']?.toFixed(1) ?? '?'}% + 2 × σ=${info[i]?.['standard deviation']?.toFixed(1) ?? '?'}% = χ ≤ ${info[i]?.threshold?.toFixed(1) ?? '?'}% → τ ≤ ${info[i]?.cutoff?.toFixed(0) ?? '?'})`
// 	// series[i].name += ` (χ ≤ ${info[i]?.threshold?.toFixed(0) ?? '?'}%, τ ≤ ${info[i]?.cutoff?.toFixed(0) ?? '?'})`


// 	container.innerHTML = template(height, settings.CD, type, info)
// 	container.$$(`.height a`).map(x => x.addEventListener('click', event => showCorrelationChart(container, sourceData, settings, type, event.target.textContent.trim())))
// 	container.$$(`.type a`).map(x => x.addEventListener('click', event => showCorrelationChart(container, sourceData, settings, event.target.textContent.trim(), height)))


// 	// console.log('median', med)
// 	// console.log('corrrel', correlation.formData, correlation.formString)
// 	let options = {
// 		// filename: sourceInput.title_ + '___' + typeFilter.formString_ + '___' + locationFilter.formString_ + '___' + correlation.formString_ + '___h_' + height,
// 		filename: 'typing_x',
// 		mainTitle: 'germX',
// 		subTitle: settingsString(settings),//`germX`,
// 		// filename: 'correlation_' + sourceInput.title_,
// 		// mainTitle: (sourceInput.title) ?? '',
// 		// subTitle: `${typeFilter.formString}  ${space(5)}  ${locationFilter.formString}  ${space(5)}  ${correlation.formString}`,
// 		// mainTitle: `${sourceInput.title ?? ''}: ${space(3)} typing location correlation`,//  ${space(8)}  `,
// 		xTitle: `cgMLST distance`,
// 		yTitle: `pair connectivity`,
// 		yMin: 0,
// 		yMax,
// 		xTicks: xMax <= 50 ? 'dataPoints' : Math.floor(xMax / 2),
// 		yTicks: yMax / 5,
// 		yFormat: v => v.toFixed(0) + '%',
// 		height: '500px',
// 		// yLines: { [med]: `median = ${med.toFixed(1)}%`, [med * TH]: `median * ${TH} = ${(med * TH).toFixed(1)}%` },
// 		yLines,
// 		// threshold: med * TH,
// 		// threshold: sd * 2,
// 		// colors: ['#FF4D16', '#FC9C1C', '#FFD81C']
// 		colors: ['#6495ED', '#90EE90', '#F0E68C'], // == cornflowerblue.6495ED, lightgreen.90EE90, khaki.F0E68C, coral.FF7F50
// 		// 
// 		// colors: ['#6495EDff', '#6495EDaa', '#6495ED55']
// 		// yLines: { [med]: 'median', [med * 3]: '3x', [med * 5]: '5x', [med * 10]: '10x' },
// 		// yLines: { [med]: 'median' },
// 	}

// 	showChart(container, series, options)
// }







// export function showCorrelationChart(template, sourceData, CD, rollingLength = 0, height = '100') {
// 	// console.log('chart', CD, rollingLength, height)
// 	// console.log('source', sourceData)
// 	let base = '#correlation'
// 	$(`${base} .chart-box`).innerHTML = template(height, rollingLength)
// 	$$(`${base} .chart-box .height a`).map(x => x.addEventListener('click', event => showCorrelationChart(template, sourceData, CD, rollingLength, event.target.textContent.trim())))
// 	$$(`${base} .chart-box .rollingAverage a`).map(x => x.addEventListener('click', event => showCorrelationChart(template, sourceData, CD, event.target.textContent.trim(), height)))
// 	let yMax = height == 'auto' ? undefined : height * 1

// 	let cd = Object.keys(sourceData[0]).length - 2
// 	// console.log('cd', cd)

// 	let rollingData = buildRollingAverage(sourceData, rollingLength)
// 	// console.log('rollingdata', rollingData)

// 	let data = {}
// 	for (let i = 0; i <= CD; i++)
// 		data['CD' + i] = mapValues(rollingData, y => y['CD' + i] / y.total * 100)
// 	// console.log('data', data)
// 	// let total = Object.values(data).map((v, i) =>)
// 	// for (let d of data)
// 	// total.push()

// 	let series = Object.entries(data).map(([key, val]) => ({
// 		name: key, data: Object.entries(val).map(([x, y]) => ({ x, y }))
// 	}))
// 	// console.log('series', series)
// 	// let series = []
// 	// for (let i = 0; i <= CD; i++)
// 	// 	series.push({ name: 'CD = ' + i, data: Object.entries(sourceData).map(([x, y]) => ({ x, y: y['CD' + i] / y.total * 100 })) })

// 	let dat = series[0].data.map(o => o.y)
// 	let med = median(dat)
// 	// console.log('median', med)

// 	let options = {
// 		filename: sourceInput.title_ + '_' + typeFilter.formString_ + '_' + locationFilter.formString_ + '_h' + height,
// 		mainTitle: `${sourceInput.title ?? ''} correlation   ${typeFilter.formString}   ${locationFilter.formString}`,
// 		xTitle: `typing - distance`,
// 		yTitle: `percentage of pairs with epidemiological contact`,
// 		yMin: 0,
// 		yMax,
// 		yTicks: yMax / 5,
// 		yFormat: v => v.toFixed(0) + '%',
// 		height: '500px',
// 		yLines: { [med]: 'median', [med * 3]: '3x', [med * 5]: '5x' },
// 	}

// 	showChart(base, series, options)
// }
