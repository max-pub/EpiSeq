import { $, $$ } from '../ui/dom.js'
// Apex.colors = ['#022ABF77', '#3B80EC', '#89C5FD']
// Apex.colors = ['cornflowerblue']
Apex.colors = ['#6495EDff', '#6495EDaa', '#6495ED55']

export function showChart(base, series, options) {
	// console.log('options', { ...options, series })
	// console.log('chart node', $(`${base} .chart-box div.chart`))
	var chart = new ApexCharts($(`${base} .chart-box div.chart`), chartOptions({ ...options, series }));

	// console.log('chart', chart)
	chart.render();

	chartDownload(`${base} .chart-box`, {
		// tsv: () => download(`distance.stats.tsv`, TALI.grid.stringify(stats, { pretty: 4 })),
		tsv: () => chart?.exports?.exportToCSV({ series, columnDelimiter: '\t' }),
		svg: () => chart?.exports?.exportToSVG(),
		png: () => chart?.exports?.exportToPng(),
	})
}

function chartDownload(container, actions) {
	// $$(`${container} a.download`).map(a => console.log('button', a))
	$$(`${container} .export a`).map(a => a.addEventListener('click', event => actions[a.textContent]()))
	// $$(`${container} a.download`).map(a => a.addEventListener('click', actions[a.textContent]()))
}


function chartOptions(o = {}) {
	return {
		title: {
			text: o.mainTitle,
			// text: `Correlation of Typing Distance and Movement Data`,
			align: 'center',
			style: { fontSize: '20px' }
		},
		// subtitle:{
		// text: ``
		// },
		chart: {
			toolbar: {
				show: false,
				export: {
					csv: {
						filename: o.filename,
						columnDelimiter: '\t',
						// 	headerCategory: 'category',
						// 	headerValue: 'value',
						// 	dateFormatter(timestamp) {
						// 		return new Date(timestamp).toDateString()
						// 	}
					},
					svg: {
						filename: o.filename,
					},
					png: {
						filename: o.filename,
					}

				},
			},
			animations: {
				enabled: false,
			},
			type: 'bar',
			stacked: true,
			// type: 'line',
			// background: '#fff',
			width: '100%',
			height: o.height ?? '300px',
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
			type: o.xType ?? 'category',
			tickPlacement: 'on',
			decimalsInFloat: 0,
			min: o.xMin,
			max: o.xMax,
			tickAmount: o.xTicks,
			labels: {
				rotate: o.xRotate ?? 0,
				hideOverlappingLabels: false,
				showDuplicates: false,
				trim: false,
				//   show: false
			},
			axisBorder: {
				show: true
			},
			axisTicks: {
				show: true
			},
			title: {
				text: o.xTitle,
			}
		},

		yaxis: {
			// forceNiceScale: true,
			min: o.yMin,
			max: o.yMax,
			tickAmount: o.yTicks,
			// stepSize: 5,
			logarithmic: o.logarithmic ?? false,
			logBase: 3, // 2 doesnt show ticks for some reason??!!
			labels: {
				formatter: o.yFormat,
				hideOverlappingLabels: false,
				showDuplicates: false,
				trim: false,
			},
			title: {
				text: o.yTitle,
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
		series: o.series,
	}
}
