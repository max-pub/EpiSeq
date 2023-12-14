import { $, $$, download } from './dom.js'
import { typeStats } from '../lib/type.stats.js'
import { DATA, STATS } from './main.js'
import { locationListStats } from '../lib/stats.js'
// import { download } from './io.js'
import { TALI, template } from '../lib/deps.js'
import * as FORM from './forms.js'

// Apex.colors = ['#022ABF77', '#3B80EC', '#89C5FD']
// Apex.colors = ['cornflowerblue']
Apex.colors = ['#6495EDff', '#6495EDaa', '#6495ED55']
const TEMPLATE = Object.fromEntries(await Promise.all(['chart_typings', 'chart_locations', 'chart_locations_2', 'chart_correlation'].map(async x => [x, template(await fetch(`./templates/${x}.html`).then(x => x.text()))])))

// console.log("TEMPLATE", TEMPLATE)

export function showLocationChart(type = 'clinic') {
	let base = '#source_filter .chart-box'
	$(`${base}`).innerHTML = TEMPLATE.chart_locations(type)
	$$(`${base} .options a`).map(node => node.addEventListener('click', event => showLocationChart(event.target.textContent.trim())))
	// console.log('links', $$('#location-chart a.chart'))

	// $("#location-chart div.chart").innerHTML = ''
	let stats = locationListStats(DATA.source_filter.locations)
	// console.log('location stats', stats)
	let data = Object.entries(stats[type]).map(([x, y]) => ({ x, y: y.count })).sort((a, b) => b.y - a.y).slice(0, 50)
	// console.log('typestat', data)
	var options = {
		title: {
			text: `${FORM.source.data().title ?? ''} Distribution of ${type}s`,
			// floating: true,
			// margin: 0,
			align: 'center',
			style: { fontSize: '20px' }
		},
		// subtitle: {
		// 	text: `subtitle`,
		// },
		chart: {
			toolbar: {
				show: false
			},
			animations: {
				enabled: false,
			},
			type: 'bar',
			background: '#fff',
			width: '100%',
			height: '300px',
		},
		xaxis: {
			// show: false,
			labels: {
				rotate: -30,
				//   show: false
			},
			axisBorder: {
				show: false
			},
			axisTicks: {
				show: false
			},
			title: {
				text: `${type} names, sorted by number of occurence`,
				// offsetY: -30,
			}
		},
		yaxis: {
			title: {
				text: 'number of occurences',
			}
		},
		plotOptions: {
			bar: {
				// barHeight: '90%',
			}
		},
		dataLabels: {
			enabled: false,
		},
		tooltip: {
			// enabled: false,
		},
		series: [{
			name: 'number of occurences of location entries',
			data
		}],
	}

	var chart = new ApexCharts($(`${base} div.chart`), options);
	// const ctx = chart.ctx;
	// ctx.exports.exportToSVG(ctx);
	// console.log('svg',chart.w.globals.dom.Paper.svg())

	chart.render();
	chartDownload(`${base}`, {
		tsv: () => download(`locations.stats.tsv`, TALI.grid.stringify(stats, { sortCol: 'count', pretty: 4 })),
		svg: () => chart?.exports?.exportToSVG(),
		png: () => chart?.exports?.exportToPng(),
	})
	// console.log('chart 4',chart?.exports?.exportToSVG)
}





export function showLocationChart2(sourceData, type = 'absolute') {
	let base = '#location_filter .chart-box'
	$(`${base}`).innerHTML = TEMPLATE.chart_locations_2(type)
	$$(`${base} .options a`).map(node => node.addEventListener('click', event => showLocationChart2(sourceData, event.target.textContent.trim())))
	// console.log('links', $$('#location-chart a.chart'))

	// $("#location-chart div.chart").innerHTML = ''
	// let stats = locationListStats(DATA.source_filter.locations)
	// console.log('location stats', stats)
	let data = Object.entries(sourceData).map(([x, y]) => ({ x, y: y.count })).sort((a, b) => b.y - a.y).slice(0, 50)
	// console.log('typestat', data)
	var options = {
		title: {
			text: `${FORM.title()} Distribution of contact locations (${type})`,
			// floating: true,
			// margin: 0,
			align: 'center',
			style: { fontSize: '20px' }
		},
		// subtitle: {
		// 	text: `subtitle`,
		// },
		chart: {
			toolbar: {
				show: false
			},
			animations: {
				enabled: false,
			},
			type: 'bar',
			background: '#fff',
			width: '100%',
			height: '300px',
		},
		xaxis: {
			// show: false,
			labels: {
				rotate: -30,
				//   show: false
			},
			axisBorder: {
				show: false
			},
			axisTicks: {
				show: false
			},
			title: {
				text: `contact points, sorted by frequency`,
				// offsetY: -30,
			}
		},
		yaxis: {
			title: {
				text: 'number of occurences',
			}
		},
		plotOptions: {
			bar: {
				// barHeight: '90%',
			}
		},
		dataLabels: {
			enabled: false,
		},
		tooltip: {
			// enabled: false,
		},
		series: [{
			name: 'number of occurences of location entries',
			data
		}],
	}

	var chart = new ApexCharts($(`${base} div.chart`), options);
	// const ctx = chart.ctx;
	// ctx.exports.exportToSVG(ctx);
	// console.log('svg',chart.w.globals.dom.Paper.svg())

	chart.render();
	chartDownload(`${base}`, {
		tsv: () => download(`locations.stats.tsv`, TALI.grid.stringify({ locaton: sourceData }, { sortCol: 'count', pretty: 4 })),
		svg: () => chart?.exports?.exportToSVG(),
		png: () => chart?.exports?.exportToPng(),
	})
	// console.log('chart 4',chart?.exports?.exportToSVG)
}







export function chartDownload(container, actions) {
	// $$(`${container} a.download`).map(a => console.log('button', a))
	$$(`${container} .export a`).map(a => a.addEventListener('click', event => actions[a.textContent]()))
	// $$(`${container} a.download`).map(a => a.addEventListener('click', actions[a.textContent]()))
}








export function showTypeChart(max) {
	let base = '#typing_distance'
	$(`${base} .chart-box`).innerHTML = TEMPLATE.chart_typings(max)
	$$(`${base} .chart-box .options a`).map(x => x.addEventListener('click', event => showTypeChart(event.target.id)))

	max = max * 1
	let steps = max / 50
	if (steps < 1) steps = 1
	// console.log('show type chart max', max, 'steps', steps)
	// $("#distance-chart div.chart").innerHTML = ''
	// console.log('type-chart', DATA.source_filter.typings, DATA.typing_distance.sequences)
	// let stats = typeStats(DATA.source_filter.typings, DATA.typing_distance.sequences)
	let stats = STATS.typing_distance
	// console.log('type chart stats', stats)
	let data = Object.entries(stats.ABS.cgmlstByPatient)
	data = data.filter(x => x[0] <= max).map(([x, y]) => ({ x: x % steps == 0 ? x : '', y }))
	// if (max) data = data.filter(x => x[0] < max).map(([x, y]) => ({ x: x % 5 == 0 ? x : '', y }))
	// else data = data.map(([x, y]) => ({ x: x % 100 == 0 ? x : '', y }))
	// console.log('typestat', data)
	var options = {
		title: {
			text: `Distribution of Typing Distances`,
			align: 'center',
			style: { fontSize: '20px' }
		},
		// subtitle: {
		// 	text: `subtitle`,
		// },
		chart: {
			toolbar: {
				show: false
			},
			animations: {
				enabled: false,
			},
			type: 'bar',
			background: '#fff',
			width: '100%',
			height: '300px',
		},
		xaxis: {
			// show: false,
			labels: {
				rotate: 0,
				//   show: false
			},
			axisBorder: {
				show: false
			},
			axisTicks: {
				show: false
			},
			title: {
				text: `typing - distance`,
			}
		},
		yaxis: {
			title: {
				text: 'number of pairs',
			}
		},
		plotOptions: {
			bar: {
				// barHeight: '90%',
			}
		},
		dataLabels: {
			enabled: false,
		},
		tooltip: {
			// enabled: false,
		},
		series: [{
			name: 'typing pairs at distance',
			data
		}],
	}

	var chart = new ApexCharts($(`${base} .chart-box div.chart`), options);

	chart.render();

	chartDownload(`${base} .chart-box`, {
		tsv: () => download(`distance.stats.tsv`, TALI.grid.stringify(stats, { pretty: 4 })),
		svg: () => chart?.exports?.exportToSVG(),
		png: () => chart?.exports?.exportToPng(),
	})
}








export function showCorrelationChart(height = '100') {
	$('#correlation-chart').innerHTML = TEMPLATE.chart_correlation(height)
	$$('#correlation-chart .options a').map(x => x.addEventListener('click', event => showCorrelationChart(event.target.textContent.trim())))
	let yMax = height == 'auto' ? undefined : height * 1
	console.log("CORR height", yMax)
	// $$('#correlation-chart a.chart').map(x => x.addEventListener('click', event => showTypeChart(event.target.id)))
	// data = Object.entries(data).map(x => ({ name: x[0], data: x[1] }))
	// console.log('dataaa', data)
	// return
	let data = Object.entries(DATA.correlation).map(x => ({ name: x[0], data: Object.entries(x[1]).map(y => ({ x: y[0], y: y[1].percentage.slice(0, -1) * 1 })) }))
	// console.log('dataaa', data)
	// $("#correlationChart").innerHTML = ''
	var options = {
		title: {
			text: `Correlation of Typing Distance and Movement Data`,
			align: 'center',
			style: { fontSize: '20px' }
		},
		// subtitle:{
		// text: ``
		// },
		chart: {
			toolbar: {
				show: false
			},
			animations: {
				enabled: false,
			},
			type: 'bar',
			// type: 'line',
			// background: '#fff',
			width: '100%',
			height: '300px',
		},
		stroke: {
			curve: 'smooth',
			width: 2,
		},
		markers: {
			size: 5,
		},
		xaxis: {
			// show: false,
			labels: {
				rotate: 0,
				//   show: false
			},
			axisBorder: {
				show: false
			},
			axisTicks: {
				show: false
			},
			title: {
				text: `typing - distance`,
			}
		},

		yaxis: {
			// forceNiceScale: true,
			min: 0,
			// tickAmount: 5,
			max: yMax,
			labels: {
				formatter: (value) => value.toFixed(0) + '%',
			},
			title: {
				text: `percentage of pairs with epidemiological contact`,
			}
		},
		plotOptions: {
			// bar: {
			// barHeight: '90%',
			// }

			line: {
				markers: {
					size: 3,
				},
			}
		},
		dataLabels: {
			enabled: false,
		},
		tooltip: {
			// enabled: false,
		},
		series: data,
	}

	var chart = new ApexCharts($("#correlation-chart div.chart"), options);

	chart.render();
	// setTimeout(() => {
	// 	chart.render();
	// }, 100)

	chartDownload('#correlation-chart', {
		tsv: () => download(`correlation.stats.tsv`, TALI.grid.stringify(DATA.correlation, { flip: true, pretty: 4 })),
		svg: () => chart?.exports?.exportToSVG(),
		png: () => chart?.exports?.exportToPng(),
	})

}





export function showCorrelationChart2(key, height = '100') {
	let id = key.replace(/\W/gmi, '')
	// console.log('find::',`#correlation-results #${id} .chart-box`)
	$(`#correlationResults #${id} .chart-box`).innerHTML = TEMPLATE.chart_correlation(height)
	$$(`#correlationResults #${id} .chart-box .options a`).map(x => x.addEventListener('click', event => showCorrelationChart2(key, event.target.textContent.trim())))
	let yMax = height == 'auto' ? undefined : height * 1
	// console.log("CORR height", yMax)
	// $$('#correlation-chart a.chart').map(x => x.addEventListener('click', event => showTypeChart(event.target.id)))
	// data = Object.entries(data).map(x => ({ name: x[0], data: x[1] }))
	// console.log('dataaa', data)
	// return

	let data = [{ data: Object.entries(DATA.correlation[key]).map(y => ({ x: y[0], y: y[1].percentage.slice(0, -1) * 1 })) }]
	// console.log('corr data',data)
	// let data = Object.entries(DATA.correlation).map(x => ({ name: x[0], data: Object.entries(x[1]).map(y => ({ x: y[0], y: y[1].percentage.slice(0, -1) * 1 })) }))
	// console.log('dataaa', data)
	// $("#correlationChart").innerHTML = ''
	var options = {
		title: {
			text: key,
			// text: `Correlation of Typing Distance and Movement Data`,
			align: 'center',
			style: { fontSize: '20px' }
		},
		// subtitle:{
		// text: ``
		// },
		chart: {
			toolbar: {
				show: false
			},
			animations: {
				enabled: false,
			},
			type: 'bar',
			// type: 'line',
			// background: '#fff',
			width: '100%',
			height: '300px',
		},
		// stroke: {
		// 	curve: 'smooth',
		// 	width: 2,
		// },
		// markers: {
		// 	size: 5,
		// },
		xaxis: {
			// show: false,
			labels: {
				rotate: 0,
				//   show: false
			},
			axisBorder: {
				show: false
			},
			axisTicks: {
				show: false
			},
			title: {
				text: `typing - distance`,
			}
		},

		yaxis: {
			// forceNiceScale: true,
			min: 0,
			// tickAmount: 5,
			max: yMax,
			labels: {
				formatter: (value) => value.toFixed(0) + '%',
			},
			title: {
				text: `percentage of pairs with epidemiological contact`,
			}
		},
		plotOptions: {
			// bar: {
			// barHeight: '90%',
			// }

			// line: {
			// 	markers: {
			// 		size: 3,
			// 	},
			// }
		},
		dataLabels: {
			enabled: false,
		},
		tooltip: {
			// enabled: false,
		},
		series: data,
	}

	var chart = new ApexCharts($(`#correlationResults #${id} .chart-box .chart`), options);

	chart.render();
	// setTimeout(() => {
	// 	chart.render();
	// }, 100)

	chartDownload(`#correlationResults #${id}`, {
		tsv: () => download(`correlation.stats.tsv`, TALI.grid.stringify(DATA.correlation, { flip: true, pretty: 4 })),
		svg: () => chart?.exports?.exportToSVG(),
		png: () => chart?.exports?.exportToPng(),
	})

}








export function showCorrelationChart3(height = '100') {
	// let id = key.replace(/\W/gmi,'')
	// console.log('find::',`#correlation-results #${id} .chart-box`)
	$(`#correlation  .chart-box`).innerHTML = TEMPLATE.chart_correlation(height)
	$$(`#correlation  .chart-box .options a`).map(x => x.addEventListener('click', event => showCorrelationChart3(event.target.textContent.trim())))
	let yMax = height == 'auto' ? undefined : height * 1
	console.log("CORR height", yMax)
	// $$('#correlation-chart a.chart').map(x => x.addEventListener('click', event => showTypeChart(event.target.id)))
	// data = Object.entries(data).map(x => ({ name: x[0], data: x[1] }))
	// console.log('dataaa', data)
	// return

	let data = [{ data: Object.entries(DATA.correlation).map(y => ({ x: y[0], y: y[1].percentage.slice(0, -1) * 1 })) }]
	// console.log('corr data',data)
	// let data = Object.entries(DATA.correlation).map(x => ({ name: x[0], data: Object.entries(x[1]).map(y => ({ x: y[0], y: y[1].percentage.slice(0, -1) * 1 })) }))
	// console.log('dataaa', data)
	// $("#correlationChart").innerHTML = ''
	var options = {
		title: {
			text: FORM.correlation.string(),
			// text: `Correlation of Typing Distance and Movement Data`,
			align: 'center',
			style: { fontSize: '20px' }
		},
		// subtitle:{
		// text: ``
		// },
		chart: {
			toolbar: {
				show: false
			},
			animations: {
				enabled: false,
			},
			type: 'bar',
			// type: 'line',
			// background: '#fff',
			width: '100%',
			height: '300px',
		},
		// stroke: {
		// 	curve: 'smooth',
		// 	width: 2,
		// },
		// markers: {
		// 	size: 5,
		// },
		xaxis: {
			// show: false,
			labels: {
				rotate: 0,
				//   show: false
			},
			axisBorder: {
				show: false
			},
			axisTicks: {
				show: false
			},
			title: {
				text: `typing - distance`,
			}
		},

		yaxis: {
			// forceNiceScale: true,
			min: 0,
			// tickAmount: 5,
			max: yMax,
			labels: {
				formatter: (value) => value.toFixed(0) + '%',
			},
			title: {
				text: `percentage of pairs with epidemiological contact`,
			}
		},
		plotOptions: {
			// bar: {
			// barHeight: '90%',
			// }

			// line: {
			// 	markers: {
			// 		size: 3,
			// 	},
			// }
		},
		dataLabels: {
			enabled: false,
		},
		tooltip: {
			// enabled: false,
		},
		series: data,
	}

	var chart = new ApexCharts($(`#correlation .chart-box .chart`), options);

	chart.render();
	// setTimeout(() => {
	// 	chart.render();
	// }, 100)

	chartDownload(`#correlation`, {
		tsv: () => download(`correlation.stats.tsv`, TALI.grid.stringify(DATA.correlation, { flip: true, pretty: 4 })),
		svg: () => chart?.exports?.exportToSVG(),
		png: () => chart?.exports?.exportToPng(),
	})

}












export function showCorrelationChart4(sourceData, height = '100') {
	let base = '#correlation  .chart-box'
	// let id = key.replace(/\W/gmi,'')
	// console.log('find::',`#correlation-results #${id} .chart-box`)
	$(`${base}`).innerHTML = TEMPLATE.chart_correlation(height)
	$$(`${base} .options a`).map(x => x.addEventListener('click', event => showCorrelationChart4(sourceData, event.target.textContent.trim())))
	let yMax = height == 'auto' ? undefined : height * 1
	console.log("CORR height", yMax)
	// $$('#correlation-chart a.chart').map(x => x.addEventListener('click', event => showTypeChart(event.target.id)))
	// data = Object.entries(data).map(x => ({ name: x[0], data: x[1] }))
	// console.log('dataaa', data)
	// return

	let data = [
		{ name: 'CD = 0', data: Object.entries(sourceData).map(([x, y]) => ({ x, y: y.c0 / y.total * 100 })) },
		{ name: 'CD = 1', data: Object.entries(sourceData).map(([x, y]) => ({ x, y: y.c1 / y.total * 100 })) },
		{ name: 'CD = 2', data: Object.entries(sourceData).map(([x, y]) => ({ x, y: y.c2 / y.total * 100 })) },
	]

	// console.log('corr data', data)
	// let data = Object.entries(DATA.correlation).map(x => ({ name: x[0], data: Object.entries(x[1]).map(y => ({ x: y[0], y: y[1].percentage.slice(0, -1) * 1 })) }))
	// console.log('dataaa', data)
	// $("#correlationChart").innerHTML = ''
	var options = {
		title: {
			text: `${FORM.source.data().title ?? ''} correlation   ${FORM.typing_filter.string()}   ${FORM.location_filter.string()}`,//FORM.correlation.string(),
			// text: `Correlation of Typing Distance and Movement Data`,
			align: 'center',
			style: { fontSize: '20px' }
		},
		// subtitle:{
		// text: ``
		// },
		chart: {
			toolbar: {
				show: false
			},
			animations: {
				enabled: false,
			},
			type: 'bar',
			stacked: true,
			// type: 'line',
			// background: '#fff',
			width: '100%',
			height: '300px',
		},
		// fill: {
		// 	type: 'pattern',
		// 	opacity: 1,
		// 	pattern: {
		// 		style: ['circles', 'slantedLines', 'squares'], // string or array of strings
		// 		//   verticalLines
		// 		//   horizontalLines
		// 		//   slantedLines
		// 		//   squares
		// 		//   circles
		// 	}
		// },
		// stroke: {
		// 	curve: 'smooth',
		// 	width: 2,
		// },
		// markers: {
		// 	size: 5,
		// },
		xaxis: {
			// show: false,
			labels: {
				rotate: 0,
				//   show: false
			},
			axisBorder: {
				show: false
			},
			axisTicks: {
				show: false
			},
			title: {
				text: `typing - distance`,
			}
		},

		yaxis: {
			// forceNiceScale: true,
			min: 0,
			// tickAmount: 5,
			max: yMax,
			labels: {
				formatter: (value) => value.toFixed(0) + '%',
			},
			title: {
				text: `percentage of pairs with epidemiological contact`,
			}
		},
		plotOptions: {
			// bar: {
			// barHeight: '90%',
			// }

			// line: {
			// 	markers: {
			// 		size: 3,
			// 	},
			// }
		},
		dataLabels: {
			enabled: false,
		},
		tooltip: {
			// enabled: false,
		},
		series: data,
	}

	var chart = new ApexCharts($(`${base} .chart`), options);

	chart.render();
	// setTimeout(() => {
	// chart.render();
	// }, 100)
	let name = FORM.correlationParameters().replaceAll('   ', ' ').replaceAll(' = ', '=')
	chartDownload(`${base}`, {
		tsv: () => download(`correlation.stats.tsv`, TALI.grid.stringify({ [name]: sourceData }, { flip: true, pretty: 4 })),
		svg: () => chart?.exports?.exportToSVG(),
		png: () => chart?.exports?.exportToPng(),
	})

}



// export function showCorrelationChartBar(data) {
// 	// data = Object.entries(data).map(x => ({ name: x[0], data: x[1] }))
// 	// console.log('dataaa', data)
// 	// return
// 	data = Object.entries(data).map(x => ({ name: x[0], data: Object.entries(x[1]).map(y => ({ x: y[0], y: y[1].percentage.slice(0, -1) * 1 })) }))
// 	$("#correlationChart").innerHTML = ''
// 	var options = {
// 		chart: {
// 			animations: {
// 				enabled: false,
// 			},
// 			type: 'bar',
// 			background: '#fff',
// 			width: '100%',
// 			height: '300px',
// 		},
// 		plotOptions: {
// 			bar: {
// 				barHeight: '90%',
// 			}
// 		},
// 		dataLabels: {
// 			enabled: false,
// 		},
// 		tooltip: {
// 			enabled: false,
// 		},
// 		series: data,
// 	}

// 	var chart = new ApexCharts($("#correlationChart"), options);

// 	chart.render();

// }
