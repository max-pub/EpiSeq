// import { $, $$ } from './deps.js'
Apex.colors = ['#022ABF', '#3B80EC', '#89C5FD']
// Apex.colors = ['cornflowerblue']
// Apex.colors = ['#6495EDff', '#6495EDaa', '#6495ED55']


export function italicGermName(name) {
	return name.replace('E. coli', '<i>E. coli</i>')
}


export function showChart(container, series, options) {
	// console.log('showChart', container)
	// console.log('options', { ...options, series })
	// console.log('chart node', $(`${base} .chart-box div.chart`))
	// console.log('bridge', container, container.$)
	// console.log(container, series, options)
	// console.log ('inner',container.innerHTML)
	var chart = new ApexCharts(container.$(`div.chart`), chartOptions({ ...options, series }));

	// console.log('chart', chart)
	chart.render();

	chartDownload(container, {
		// tsv: () => download(`distance.stats.tsv`, TALI.grid.stringify(stats, { pretty: 4 })),
		tsv: () => chart?.exports?.exportToCSV({ series, columnDelimiter: '\t' }),
		svg: () => chart?.exports?.exportToSVG(),
		png: () => chart?.exports?.exportToPng(),
	})
}

export function space(x) {
	return new Array(x).fill(`\u200e`).join(' ')
}


function chartDownload(container, actions) {
	// $$(`${container} a.download`).map(a => console.log('button', a))
	container.$$(`.export a`).map(a => a.addEventListener('click', event => actions[a.textContent]()))
	// $$(`${container} a.download`).map(a => a.addEventListener('click', actions[a.textContent]()))
}





function chartOptions(o = {}) {
	// console.log("COLORS",o.colors)
	return {
		title: {
			text: o.mainTitle,
			// text: `Correlation of Typing Distance and Movement Data`,
			align: 'center',
			style: { fontSize: '20px', fontWeight: 100 }
		},
		subtitle: {
			text: o.subTitle,
			align: 'center',
			style: { fontSize: '15px', fontWeight: 100 }
		},
		colors: o.colors,
		// colors: o.colors ?? [function ({ value, seriesIndex, w }) {
		// 	if (value > o.threshold ?? 0) {
		// 		return '#6495ED'
		// 	} else {
		// 		return '#999999'
		// 	}
		// }],
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
		// fill: { opacity: 0.5 },
		// fill: {
		// 	type: 'pattern',
		// opacity: 0.5,
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
			stepSize: o.xSteps,
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
				style: { fontSize: '14px', fontWeight: 100 }
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
				style: { fontSize: '14px', fontWeight: 100 }
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

		annotations: {
			yaxis: o.yLines ? Object.entries(o.yLines).map(([y, text]) =>
			({
				y,
				strokeDashArray: 0,
				borderColor: '#777',//'#00E396',
				label: {
					borderWidth: 0,
					// borderColor: '#00E396',
					style: {
						color: '#777',//'#00E396'
						fontSize: '11px',
						fontWeight: 100

						// 	color: '#fff',
						// 	background: '#00E396'
					},
					text
				}
			})
			) : [],
			xaxis: o.xLines ? Object.entries(o.xLines).map(([x, text]) =>
			({
				x,
				strokeDashArray: 0,
				borderColor: '#777',//'#00E396',
				label: {
					borderWidth: 0,
					// borderColor: '#00E396',
					style: {
						color: '#777',//'#00E396'
						fontSize: '14px',
						fontWeight: 100

						// 	color: '#fff',
						// 	background: '#00E396'
					},
					text
				}
			})
			) : []
		},
	}
}
