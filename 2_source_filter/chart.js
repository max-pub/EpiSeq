
import { $, $$, median } from '../lib/deps.js'
// import { sourceInput, sourceFilter, typeFilter, locationFilter } from '../lib/mod.js'
// import { TALI, mapValues, sum, template } from '../lib/deps.js'
import { showChart, space } from '../lib/apex.bridge.js'
import { sourceInput } from '../lib/mod.js'
// import { } from '../lib/mod.js'

// function title() {
// 	return 'E. coli'
// 	// return this.find('form .title input').value
// }
// function title_() {
// 	return title().replaceAll(/[^a-z0-9]/gi, '')
// }


export function showT1Chart(container, template, data, xLimit = '100', scaleType = 'linear') {
	// console.log('showTypeChart', data)
	container.innerHTML = template(xLimit, scaleType)
	// console.log('container options rr',container, container.$$)
	// console.log('container options',container.$$(`.options`))
	container.$$(`.options a`).map(x => x.addEventListener('click', event => showT1Chart(container, template, data, event.target.id, scaleType)))
	container.$$(`.scale-type a`).map(x => x.addEventListener('click', event => showT1Chart(container, template, data, xLimit, event.target.textContent)))

	let lim = xLimit == 'full' ? 5000 : xLimit * 1
	let list = Object.values(data).sort((a, b) => b - a)
	let med = median(list)
	let max = Math.max(...list)
	console.log('chart t1', list)
	let chartData = list.slice(0, lim)
	// let chartData = Object.entries(data).filter(x => x[0] <= lim).map(([x, y]) => ({ x: x * 1, y: y * 1 }))
	console.log('t1 median', med)
	// let xMax = chartData.length - 1
	// if (xMax > 1000) xMax = Math.ceil(xMax / 100) * 100 // greater 1000 ? round to next 100
	// let tickAmount = xMax < 1000 ? 20 : (xMax / 100)
	// let yMax = Math.max(...data.map(x => x.y))

	let series = [{
		name: 'xxx',
		data: chartData
	}]

	let options = {
		filename: sourceInput.title_ + '_typing_info_histogram_' + xLimit + '_' + scaleType,
		mainTitle: `${sourceInput.title ?? ''}: ${space(3)} typing discrimination histogram`,
		xTitle: `allele position`,
		yTitle: 'number of distinct values',
		xType: 'numeric',
		xSteps: 1,
		// xMin: 0,
		// xMax,
		// xTicks: tickAmount,
		colors: ['#6495EC'],
		yTicks: 10,
		yLines: { [med]: `median = ${med}`, [max]: `max = ${max}` },
		logarithmic: scaleType == 'logarithmic',
		height: '400px',
	}
	// console.log('showTypeChart', series, options)
	showChart(container, series, options)

}



export function showL1Chart(container, template, data, xLimit = '100', scaleType = 'linear') {
	// console.log('showTypeChart', data)
	container.innerHTML = template(xLimit, scaleType)
	// console.log('container options rr',container, container.$$)
	// console.log('container options',container.$$(`.options`))
	container.$$(`.options a`).map(x => x.addEventListener('click', event => showL1Chart(container, template, data, event.target.id, scaleType)))
	container.$$(`.scale-type a`).map(x => x.addEventListener('click', event => showL1Chart(container, template, data, xLimit, event.target.textContent)))

	// let lim = xLimit == 'full' ? 5000 : xLimit * 1
	let chartData = Object.entries(data).map(([x, y]) => ({ x: x * 1, y: y * 1 }))
	console.log('l1 data', chartData)

	// let med = median(chartData.map(x => x.y))
	// let chartData = Object.entries(data).filter(x => x[0] <= lim).map(([x, y]) => ({ x: x * 1, y: y * 1 }))
	// console.log('l1 median', med)
	// let xMax = chartData.length - 1
	// if (xMax > 1000) xMax = Math.ceil(xMax / 100) * 100 // greater 1000 ? round to next 100
	// let tickAmount = xMax < 1000 ? 20 : (xMax / 100)
	// let yMax = Math.max(...data.map(x => x.y))

	let series = [{
		name: 'xxx',
		data: chartData
	}]
	let xMax = Math.max(...chartData.map(x => x.x)) + 1
	console.log('l1 max', xMax)

	let options = {
		filename: sourceInput.title_ + '_l1_histogram_' + xLimit + '_' + scaleType,
		mainTitle: `${sourceInput.title ?? ''}: ${space(3)} histogram of distinct rooms`,
		xTitle: `number of distinct rooms`,
		yTitle: 'number of patients',
		xType: 'numeric',
		xTicks: 'dataPoints',
		xMin: 1,
		xMax,
		// xTicks: tickAmount,
		colors: ['#6495EC'],
		yTicks: 10,
		// yLines: { [med]: `median = ${med}` },
		logarithmic: scaleType == 'logarithmic',
		height: '400px',
	}
	// console.log('showTypeChart', series, options)
	showChart(container, series, options)

}


export function showL2Chart(container, template, data, xLimit = '90', scaleType = 'linear') {
	// console.log('showTypeChart', data)
	container.innerHTML = template(xLimit, scaleType)
	// console.log('container options rr',container, container.$$)
	// console.log('container options',container.$$(`.options`))
	container.$$(`.options a`).map(x => x.addEventListener('click', event => showL2Chart(container, template, data, event.target.id, scaleType)))
	container.$$(`.scale-type a`).map(x => x.addEventListener('click', event => showL2Chart(container, template, data, xLimit, event.target.textContent)))

	// let lim = xLimit == 'full' ? 5000 : xLimit * 1
	let lim = xLimit == 'full' ? 5000 : xLimit * 1
	let chartData = Object.entries(data).map(([x, y]) => ({ x: x * 1, y: y * 1 })).filter(x => x.x < lim)
	console.log('l2 data', chartData)

	// let med = median(chartData.map(x => x.y))
	// let chartData = Object.entries(data).filter(x => x[0] <= lim).map(([x, y]) => ({ x: x * 1, y: y * 1 }))
	// console.log('l1 median', med)
	// let xMax = chartData.length - 1
	// if (xMax > 1000) xMax = Math.ceil(xMax / 100) * 100 // greater 1000 ? round to next 100
	// let tickAmount = xMax < 1000 ? 20 : (xMax / 100)
	// let yMax = Math.max(...data.map(x => x.y))

	let series = [{
		name: 'xxx',
		data: chartData
	}]

	let options = {
		filename: sourceInput.title_ + '_l2_histogram_' + xLimit + '_' + scaleType,
		mainTitle: `${sourceInput.title ?? ''}: ${space(3)} histogram of duration of stay`,
		xTitle: `duration of stay in days`,
		yTitle: 'number of patients',
		xType: 'numeric',
		xTicks: 'dataPoints',
		// xMin: 0,
		// xMax,
		// xTicks: tickAmount,
		// xSteps: 50,
		colors: ['#6495EC'],
		yTicks: 10,
		// yLines: { [med]: `median = ${med}` },
		// xLines: { [10]: `median = 10` },
		logarithmic: scaleType == 'logarithmic',
		height: '400px',
	}
	// console.log('showTypeChart', series, options)
	showChart(container, series, options)

}


// export function showChart(base, template, data, xLimit = '500', scaleType = 'linear') {
// 	// console.log('showTypeChart', data)
// 	let base = '#typing_chart'
// 	$(`${base} .chart-box`).innerHTML = template(xLimit, scaleType)
// 	$$(`${base} .chart-box .options a`).map(x => x.addEventListener('click', event => showChart(template, data, event.target.id, scaleType)))
// 	$$(`${base} .chart-box .scale-type a`).map(x => x.addEventListener('click', event => showChart(template, data, xLimit, event.target.textContent)))

// 	let chartData = Object.entries(data).filter(x => x[0] <= xLimit * 1).map(([x, y]) => ({ x: x * 1, y: y * 1 }))

// 	let xMax = chartData.length - 1
// 	if (xMax > 1000) xMax = Math.ceil(xMax / 100) * 100 // greater 1000 ? round to next 100
// 	let tickAmount = xMax < 1000 ? 20 : (xMax / 100)
// 	// let yMax = Math.max(...data.map(x => x.y))

// 	let series = [{
// 		name: 'typing pairs at distance',
// 		data: chartData
// 	}]

// 	let options = {
// 		filename: sourceInput.title_ + '_typing_distribution_' + xLimit + '_' + scaleType,
// 		mainTitle: `${sourceInput.title ?? ''} - distribution of typing distances`,
// 		xTitle: `typing - distance`,
// 		yTitle: 'number of pairs',
// 		xType: 'numeric',
// 		xMin: 0,
// 		xMax,
// 		xTicks: tickAmount,
// 		yTicks: 10,
// 		logarithmic: scaleType == 'logarithmic',
// 		height: '500px',
// 	}
// 	console.log('showTypeChart', series, options)
// 	showChart(base, series, options)

// }