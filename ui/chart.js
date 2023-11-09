import { $, $$, download } from './dom.js'
import { typeStats } from '../lib/type.stats.js'
import { DATA } from './main.js'
import { locationListStats } from '../lib/stats.js'
// import { download } from './io.js'
import { TALI, template } from '../lib/deps.js'



const TEMPLATE = Object.fromEntries(await Promise.all(['chart_typings', 'chart_locations', 'chart_correlation'].map(async x => [x, template(await fetch(`./templates/${x}.html`).then(x => x.text()))])))

// console.log("TEMPLATE", TEMPLATE)


export function showLocationChart(type = 'clinic') {
	$('#location-chart').innerHTML = TEMPLATE.chart_locations(type)
	$$('#location-chart .options a').map(node => node.addEventListener('click', event => showLocationChart(event.target.textContent.trim())))
	// console.log('links', $$('#location-chart a.chart'))

	// $("#location-chart div.chart").innerHTML = ''
	let stats = locationListStats(DATA.filtered.locations)
	// console.log('location stats', stats)
	let data = Object.entries(stats[type]).map(([x, y]) => ({ x, y: y.count })).sort((a, b) => b.y - a.y).slice(0, 30)
	// console.log('typestat', data)
	var options = {
		title: {
			text: `Distribution of ${type}s`,
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
				text: `${type} names, sorted by frequency`,
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

	var chart = new ApexCharts($("#location-chart div.chart"), options);
	// const ctx = chart.ctx;
	// ctx.exports.exportToSVG(ctx);
	// console.log('svg',chart.w.globals.dom.Paper.svg())

	chart.render();
	chartDownload('#location-chart', {
		tsv: () => download(`locations.stats.tsv`, TALI.grid.stringify(stats, { sortCol: 'count', pretty: 4 })),
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
	$('#distance-chart').innerHTML = TEMPLATE.chart_typings(max)
	$$('#distance-chart .options a').map(x => x.addEventListener('click', event => showTypeChart(event.target.id)))

	max = max * 1
	let steps = max / 50
	if (steps < 1) steps = 1
	// console.log('show type chart max', max, 'steps', steps)
	// $("#distance-chart div.chart").innerHTML = ''
	console.log('type-chart', DATA.distanceMatrix)
	let stats = typeStats(DATA.filtered, DATA.distanceMatrix)
	console.log('type chart stats', stats)
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

	var chart = new ApexCharts($("#distance-chart div.chart"), options);

	chart.render();

	chartDownload('#distance-chart', {
		tsv: () => download(`distance.stats.tsv`, TALI.grid.stringify(stats, { pretty: 4 })),
		svg: () => chart?.exports?.exportToSVG(),
		png: () => chart?.exports?.exportToPng(),
	})
}








export function showCorrelationChart() {
	$('#correlation-chart').innerHTML = TEMPLATE.chart_correlation()
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
			type: 'line',
			// background: '#fff',
			width: '100%',
			height: '500px',
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
			forceNiceScale: true,
			min: 0,
			// tickAmount: 5,
			// max: 100,
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
			// enabled: false,
		},
		tooltip: {
			// enabled: false,
		},
		series: data,
	}

	var chart = new ApexCharts($("#correlation-chart div.chart"), options);

	chart.render();
	setTimeout(() => {
		chart.render();
	}, 100)

	chartDownload('#correlation-chart', {
		tsv: () => download(`correlation.stats.tsv`, TALI.grid.stringify(DATA.correlation, { flip: true, pretty: 4 })),
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
