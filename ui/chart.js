import { $, $$ } from './dom.js'
// import { typeStats } from '../lib/type.stats.js'
import { DATA, STATS } from './main.js'
// import { locationListStats } from '../lib/stats.js'
import { TALI, template } from '../lib/deps.js'
import * as FORM from './forms.js'

const TEMPLATE = Object.fromEntries(await Promise.all(['chart_typings', 'chart_locations', 'chart_locations_2', 'chart_correlation'].map(async x => [x, template(await fetch(`./templates/${x}.html`).then(x => x.text()))])))



import { showChart } from '../lib/charts.js'


export function showLocationChart(sourceData, type = 'clinic', count = '30') {
	// console.log("LOC CHART", type, count)
	let base = '#location_filter .chart-box'
	$(`${base}`).innerHTML = TEMPLATE.chart_locations(type, count)
	// $$(`${base} .options a`).map(node => node.addEventListener('click', event => showLocationChart2(sourceData, event.target.textContent.trim())))
	$$(`${base} .options a`).map(node => node.addEventListener('click', event => showLocationChart(sourceData, event.target.textContent.trim(), count)))
	$$(`${base} .count a`).map(node => node.addEventListener('click', event => showLocationChart(sourceData, type, event.target.textContent.trim())))
	// console.log('links', $$('#location-chart a.chart'))

	// $("#location-chart div.chart").innerHTML = ''
	// let stats = locationListStats(DATA.source_filter.locations)
	// console.log('location stats', stats)
	let data = Object.entries(sourceData[type]).map(([x, y]) => ({ x, y: y.count })).sort((a, b) => b.y - a.y)
	if (count * 1 == count) data = data.slice(0, count * 1)
	// console.log('typestat', data)

	let options = {
		filename: FORM.title_() + '_contacts_' + type + '_' + count,
		mainTitle: `${FORM.title()} - distribution of contacts by ${type}`,
		xTitle: `contact points, sorted by frequency`,
		yTitle: 'number of occurences',
		xRotate: -30,
		data: [{
			name: 'number of occurences of location entries',
			data
		}]
	}


	var chart = new ApexCharts($(`${base} div.chart`), chartOptions(options));
	// const ctx = chart.ctx;
	// ctx.exports.exportToSVG(ctx);
	// console.log('svg',chart.w.globals.dom.Paper.svg())

	chart.render();
	chartDownload(`${base}`, {
		// tsv: () => download(`locations.stats.tsv`, TALI.grid.stringify({ locaton: sourceData }, { sortCol: 'count', pretty: 4 })),
		svg: () => chart?.exports?.exportToSVG(),
		png: () => chart?.exports?.exportToPng(),
	})
	// console.log('chart 4',chart?.exports?.exportToSVG)
}










export function showTypeChart(xLimit = '500', scaleType = 'linear') {
	let base = '#typing_distance'
	$(`${base} .chart-box`).innerHTML = TEMPLATE.chart_typings(xLimit, scaleType)
	$$(`${base} .chart-box .options a`).map(x => x.addEventListener('click', event => showTypeChart(event.target.id, scaleType)))
	$$(`${base} .chart-box .scale-type a`).map(x => x.addEventListener('click', event => showTypeChart(xLimit, event.target.textContent)))

	let stats = STATS.typing_distance
	let data = Object.entries(stats.ABS.cgmlstByPatient)
	data = data.filter(x => x[0] <= xLimit * 1).map(([x, y]) => ({ x: x * 1, y }))

	let xMax = data.length - 1
	if (xMax > 1000) xMax = Math.ceil(xMax / 100) * 100 // greater 1000 ? round to next 100
	let tickAmount = xMax < 1000 ? 20 : (xMax / 100)
	// let yMax = Math.max(...data.map(x => x.y))

	let series = [{
		name: 'typing pairs at distance',
		data
	}]

	let options = {
		filename: FORM.title_() + '_' + xLimit + '_' + scaleType + '_' + FORM.source_filter.string_(),
		mainTitle: `${FORM.title()} - distribution of typing distances`,
		xTitle: `typing - distance`,
		yTitle: 'number of pairs',
		xType: 'numeric',
		xMin: 0,
		xMax,
		xTicks: tickAmount,
		yTicks: 10,
		logarithmic: scaleType == 'logarithmic',
		// yFormat: v => v.toFixed(0) + '%',
		height: '500px',
		// series,
	}
	showChart(base, series, options)

}










export function showCorrelationChart(sourceData, CD, height = '100') {
	let base = '#correlation'
	$(`${base} .chart-box`).innerHTML = TEMPLATE.chart_correlation(height)
	$$(`${base} .chart-box .options a`).map(x => x.addEventListener('click', event => showCorrelationChart(sourceData, CD, event.target.textContent.trim())))
	let yMax = height == 'auto' ? undefined : height * 1


	let series = []
	for (let i = 0; i <= CD; i++)
		series.push({ name: 'CD = ' + i, data: Object.entries(sourceData).map(([x, y]) => ({ x, y: y['CD' + i] / y.total * 100 })) })



	let options = {
		filename: FORM.title_() + '_' + FORM.source_filter.string_() + '_' + FORM.typing_filter.string_() + '_' + FORM.location_filter.string_() + '_h' + height,
		mainTitle: `${FORM.source.data().title ?? ''} correlation   ${FORM.typing_filter.string()}   ${FORM.location_filter.string()}`,
		xTitle: `typing - distance`,
		yTitle: `percentage of pairs with epidemiological contact`,
		yMin: 0,
		yMax,
		yTicks: yMax / 5,
		yFormat: v => v.toFixed(0) + '%',
		height: '500px',
	}

	showChart(base, series, options)
}



