
import { sourceInput, sourceFilter, typeFilter, locationFilter, correlation } from '../lib/mod.js'
import { TALI, mapValues, sum, template, $, $$, median, average, standardDeviation, MAD } from '../lib/deps.js'
import { italicGermName, showChart, space } from '../lib/apex.bridge.js'
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
function compound(data, CD) {
	// console.log('compound', data, CD)
	let out = []
	for (let i = 0; i <= CD; i++) {
		// console.log('i', i)
		for (let j = 0; j < data[i].length; j++) {
			// console.log('j', j)
			out[j] ??= 0
			out[j] += data[i][j]
		}
	}
	return out
}
function findCutoff(list, threshold) {
	for (let i in list)
		if (list[i] < threshold)
			return i*1
}

export function showCorrelationChart(container, template, sourceData, CD, type, height = '60') {
	// console.log('corr chart', sourceData, CD, type, height)

	let yMax = height * 1
	// console.log('yMax', yMax, '-', height)

	let series = Object.keys(sourceData[0]).filter(x => x != 'typings').map(mode => ({
		// let series = ['c0', 'c1', 'c2'].map(mode => ({
		name: mode.replace('c0', 'primary contacts').replace('c1', 'secondary contacts').replace('c2', 'tertiary contacts'),
		data: Object.entries(sourceData).map(([x, y]) => ({ x: x * 1, y: (y[mode] / y.typings * 100).toFixed(2) * 1 }))
	}))

	let dat = series.map(x => x.data.map(y => y.y))
	let xMax = dat[0].length
	// console.log('xMax', xMax)
	// let cmp = compound(dat, cd * 1)
	// console.log('dat,cmp', dat, cmp)

	let info = {}, yLines = {}
	for (let cd = 0; cd <= CD; cd++) {
		let cmp = compound(dat, cd)
		if (type == 'SD') {
			let avg = average(cmp)
			let sd = standardDeviation(cmp)
			let threshold = avg + (sd * 2)
			let cutoff = findCutoff(cmp, threshold)
			yLines[threshold] = cd
			info[cd] = { 'arithmetic mean': avg, 'standard deviation': sd, threshold, cutoff }
		}
		if (type == 'MAD') {
			let med = median(cmp)
			let mad = MAD(cmp)
			let threshold = med + (mad * 20)
			let cutoff = findCutoff(cmp, threshold)
			yLines[threshold] = cd
			info[cd] = { median: med, MAD: mad, threshold, cutoff }
		}
		if (type == 'med') {
			let med = median(cmp)
			let threshold = med * 10
			let cutoff = findCutoff(cmp, threshold)
			yLines[threshold] = cd
			info[cd] = { median: med, threshold, cutoff }
		}
		// console.log('yLines', yLines)
		// console.log('info', info)
	}



	container.innerHTML = template(height, CD, type, info)
	container.$$(`.height a`).map(x => x.addEventListener('click', event => showCorrelationChart(container, template, sourceData, CD, type, event.target.textContent.trim())))
	container.$$(`.type a`).map(x => x.addEventListener('click', event => showCorrelationChart(container, template, sourceData, CD, event.target.textContent.trim(), height)))


	// console.log('median', med)
	// console.log('corrrel', correlation.formData, correlation.formString)
	let options = {
		filename: sourceInput.title_ + '___' + typeFilter.formString_ + '___' + locationFilter.formString_ + '___' + correlation.formString_ + '___h_' + height,
		mainTitle: (sourceInput.title) ?? '',
		// mainTitle: `${sourceInput.title ?? ''}: ${space(3)} typing location correlation`,//  ${space(8)}  `,
		subTitle: `${typeFilter.formString}  ${space(5)}  ${locationFilter.formString}  ${space(5)}  ${correlation.formString}`,
		xTitle: `cgMLST distance`,
		yTitle: `pair connectivity`,
		yMin: 0,
		yMax,
		xTicks: xMax <= 50 ? 'dataPoints' : Math.floor(xMax / 2),
		yTicks: yMax / 5,
		yFormat: v => v.toFixed(0) + '%',
		height: '400px',
		// yLines: { [med]: `median = ${med.toFixed(1)}%`, [med * TH]: `median * ${TH} = ${(med * TH).toFixed(1)}%` },
		yLines,
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
