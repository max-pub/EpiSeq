import { $, $$, download } from './helper.js'
import { typeStats } from './lib/type.stats.js'
import { DATA } from './flow.js'

export function showTypeChart() {
	$("#chart").innerHTML = ''
	let data = typeStats(DATA.LIST, DATA.DIST)
	console.log('typestat', data.ABS.cgmlstByPatient)
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
			data: Object.entries(data.ABS.cgmlstByPatient).map(([x, y]) => ({ x: x % 100 == 0 ? x : '', y }))
		}],
	}

	var chart = new ApexCharts($("#chart"), options);

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
