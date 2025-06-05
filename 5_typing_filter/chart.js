
import { $, $$ } from '../lib/deps.js'
// import { sourceInput, sourceFilter, typeFilter, locationFilter } from '../lib/mod.js'
// import { TALI, mapValues, sum, template } from '../lib/deps.js'
import { italicGermName, showChart, space } from '../lib/apex.bridge.js'
import { sourceInput, typeFilter } from '../lib/mod.js'
// import { } from '../lib/mod.js'
// function title() {
// 	return 'E. coli'
// 	// return this.find('form .title input').value
// }
// function title_() {
// 	return title().replaceAll(/[^a-z0-9]/gi, '')
// }


export function showTypeChart(container, template, data, xLimit = '500', scaleType = 'linear') {
	// console.log('showTypeChart', data)
	container.innerHTML = template(xLimit, scaleType)
	// console.log('container options rr',container, container.$$)
	// console.log('container options',container.$$(`.options`))
	container.$$(`.options a`).map(x => x.addEventListener('click', event => showTypeChart(container, template, data, event.target.id, scaleType)))
	container.$$(`.scale-type a`).map(x => x.addEventListener('click', event => showTypeChart(container, template, data, xLimit, event.target.textContent)))

	// console.log('chart histogram', data)
	let lim = xLimit == 'full' ? 5000 : xLimit * 1
	let chartData = Object.entries(data).filter(x => x[0] <= lim).map(([x, y]) => ({ x: x * 1, y: y * 1 }))

	let xMax = chartData.length - 1
	if (xMax > 1000) xMax = Math.ceil(xMax / 100) * 100 // greater 1000 ? round to next 100
	let tickAmount = xMax < 1000 ? 20 : (xMax / 100)
	// let yMax = Math.max(...data.map(x => x.y))

	let series = [{
		name: 'typing pairs',
		data: chartData
	}]

	let options = {
		filename: sourceInput.title_ + '_typing_distance_histogram_' + xLimit + '_' + scaleType,
		mainTitle: (sourceInput.title) ?? '',
		// mainTitle: `${sourceInput.title ?? ''}: ${space(3)} typing distance histogram`,
		subTitle: `${typeFilter.formString}`,
		xTitle: `cgMLST distance`,
		yTitle: 'number of patient-pairs',
		xType: 'numeric',
		xMin: 0,
		xMax,
		xTicks: tickAmount,
		yTicks: 10,
		logarithmic: scaleType == 'logarithmic',
		height: '400px',
	}
	// console.log('showTypeChart', series, options)
	showChart(container, series, options)

	// setTimeout(() => { // Use a timeout to ensure SVG is fully rendered
	// 	const titleElement = container.querySelector('.apexcharts-title-text');
	// 	console.log("TITLE", titleElement)
	// 	if (titleElement) {
	// 		console.log('replace title now with', italicGermName(sourceInput.title) ?? '')
	// 		titleElement.innerHTML = italicGermName(sourceInput.title) ?? ''
	// 	}
	// }, 900);
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