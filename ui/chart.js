import { $, $$ } from './dom.js'
import { typeStats } from '../lib/type.stats.js'
import { DATA } from './flow.js'
import { locationListStats } from '../lib/stats.js'
import { download } from './io.js'


export function showLocationChart(type = 'clinic') {
	$("#location-chart div.chart").innerHTML = ''
	let data = locationListStats(DATA.LIST.locations)
	console.log('location stats', data)
	data = Object.entries(data[type]).map(([x, y]) => ({ x, y })).sort((a, b) => b.y - a.y).slice(0, 30)
	// console.log('typestat', data)
	var options = {
		chart: {
			animations: {
				enabled: false,
			},
			type: 'bar',
			background: '#fff',
			width: '100%',
			height: '200px',
		},
		xaxis: {
			// show: false,
			labels: {
				// rotate: -30,
				//   show: false
			},
			axisBorder: {
				show: false
			},
			axisTicks: {
				show: false
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
			enabled: false,
		},
		series: [{
			name: 'cgMLST distribution',
			data
		}],
	}

	var chart = new ApexCharts($("#location-chart div.chart"), options);
	// const ctx = chart.ctx;
	// ctx.exports.exportToSVG(ctx);
	// console.log('svg',chart.w.globals.dom.Paper.svg())

	chart.render();
	// console.log('chart',chart)
	// console.log('chart ids',window.Apex._chartInstances.map(x=>x.id))
	// downloadSVG('#location-charts .chart','svg')
}

async function downloadSVG(chartId, datatype) {
	const chartInstance = window.Apex._chartInstances.find(
		(chart) => chart.id === chartId
	);

	if (datatype === "png") {
		chartInstance.chart.exports.exportToPng();
	}
	else if (datatype === "svg") {
		return chartInstance.chart.exports.exportToSVG();
	}
}

export function showTypeChart(max) {
	max = max * 1
	let steps = max / 50
	console.log('show type chart max', max, 'steps', steps)
	$("#distance-chart div.chart").innerHTML = ''
	let data = typeStats(DATA.LIST, DATA.DIST)
	data = Object.entries(data.ABS.cgmlstByPatient)
	data = data.filter(x => x[0] < max).map(([x, y]) => ({ x: x % steps == 0 ? x : '', y }))
	// if (max) data = data.filter(x => x[0] < max).map(([x, y]) => ({ x: x % 5 == 0 ? x : '', y }))
	// else data = data.map(([x, y]) => ({ x: x % 100 == 0 ? x : '', y }))
	// console.log('typestat', data)
	var options = {
		chart: {
			animations: {
				enabled: false,
			},
			type: 'bar',
			background: '#fff',
			width: '100%',
			height: '200px',
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
			enabled: false,
		},
		series: [{
			name: 'cgMLST distribution',
			data
		}],
	}

	var chart = new ApexCharts($("#distance-chart div.chart"), options);

	chart.render();
}



export function showCorrelationChart() {
	// data = Object.entries(data).map(x => ({ name: x[0], data: x[1] }))
	// console.log('dataaa', data)
	// return
	let data = Object.entries(DATA.CORR).map(x => ({ name: x[0], data: Object.entries(x[1]).map(y => ({ x: y[0], y: y[1].percentage.slice(0, -1) * 1 })) }))
	// console.log('dataaa', data)
	$("#correlationChart").innerHTML = ''
	var options = {
		chart: {
			animations: {
				enabled: false,
			},
			type: 'line',
			// background: '#fff',
			width: '100%',
			height: '300px',
		},
		stroke: {
			curve: 'smooth',
			width: 4,
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
			}
		},

		yaxis: {
			// forceNiceScale: false,
			max: 100,
			labels: {
				formatter: (value) => value.toFixed(0) + '%',
			},
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

	var chart = new ApexCharts($("#correlationChart"), options);

	chart.render();
	setTimeout(() => {
		chart.render();
	}, 100)
}


export function showCorrelationChartBar(data) {
	// data = Object.entries(data).map(x => ({ name: x[0], data: x[1] }))
	// console.log('dataaa', data)
	// return
	data = Object.entries(data).map(x => ({ name: x[0], data: Object.entries(x[1]).map(y => ({ x: y[0], y: y[1].percentage.slice(0, -1) * 1 })) }))
	$("#correlationChart").innerHTML = ''
	var options = {
		chart: {
			animations: {
				enabled: false,
			},
			type: 'bar',
			background: '#fff',
			width: '100%',
			height: '300px',
		},
		plotOptions: {
			bar: {
				barHeight: '90%',
			}
		},
		dataLabels: {
			enabled: false,
		},
		tooltip: {
			enabled: false,
		},
		series: data,
	}

	var chart = new ApexCharts($("#correlationChart"), options);

	chart.render();

}
