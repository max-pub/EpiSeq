// import { $, $$ } from './deps.js'
// Apex.colors = ['cornflowerblue']
// Apex.colors = ['#6495EDff', '#6495EDaa', '#6495ED55']
import ApexCharts from './ext/apexcharts.esm.js'
// Apex.colors = ['#022ABF', '#3B80EC', '#89C5FD']
// console.log("apex version", ApexCharts.version, 'apex ns', Apex)
import { $, $$ } from './base.js';
import { updateProgress } from '../correlation/main.js';

// export function italicGermName(name) {
// 	return name.replace('E. coli', '<i>E. coli</i>')
// }


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
		print: () => printChart(container),
		// png: () => exportChartToPngWithSpecificScale(chart),
	})
}

function printChart(container) {
	console.log('print chart', container)
	$$('.print').forEach(el => el.classList.remove('print'))
	container.classList.add('print')
	document.title = container.getAttribute('title') || 'chart';
	// setTimeout(() => {
	// 	window.print()
	// 	// $$('.print').forEach(el => el.classList.add('print'))
	// }, 500);
	//
	window.print()
}

export function space(x) {
	return new Array(x).fill(`\u200e`).join(' ')
}


function chartDownload(container, actions) {
	// $$(`${container} a.download`).map(a => console.log('button', a))
	container.$$(`.export a`).map(a => a.addEventListener('click', event => actions[a.textContent]()))
	// $$(`${container} a.download`).map(a => a.addEventListener('click', actions[a.textContent]()))
}

// function applySubscript(chartId) {
function applySubscript(context, config) {
	// console.log('applySubscript', context, config);
	let chartID = config.globals.chartID;
	let chart = $(`#apexcharts${chartID}`)
	// console.log('chart element', chart)
	let title = chart.querySelector(`.apexcharts-title-text`);
	if (title) {
		title.innerHTML = title.textContent
			// .replaceAll('i[', `<tspan font-style="italic">`)
			// .replaceAll(']i', `</tspan>`)
		.replaceAll('E. coli', '<tspan font-style="italic">E. coli</tspan>')
	}

	let subtitle = chart.querySelector(`.apexcharts-subtitle-text`);
	// console.log('subtitle', subtitle);
	if (subtitle) {
		// T followed by 'day' shifted down (dy) and reduced in size
		subtitle.innerHTML = subtitle.textContent
			.replaceAll('{', '<tspan dy="4" font-size="0.75em">')
			.replaceAll('}', '</tspan><tspan dy="-4">\u200B</tspan>');
		// subtitle.innerHTML = subtitle.textContent.replace(/T(.+?)=/g, 'T<tspan dy="4" font-size="0.75em">$1</tspan>=');
	}

	let legends = chart.$$(`.apexcharts-legend-text`)
	for (let legend of legends) {
		legend.innerHTML = legend.textContent
			.replaceAll('{', '<sub>')
			.replaceAll('}', '</sub>')
		// .replace('CD', 'C<span style="font-size:0.75em; vertical-align:sub">hop</span> = ')
		// .replace('->', `<span style="color:gray; padding: 0 0.2rem;">&rarr;</span>`)
		// .replace('(', '<span style="color: gray; font-size:0.9em; padding-left:0.5rem; padding-right:2rem;">(')
		// + '</span>';
	}

	// const titleEl = document.querySelector(`#${chartId} .apexcharts-title-text`);
	// console.log('applySubscript', chartId, titleEl);
	//   if (titleEl) {
	//     // T followed by 'day' shifted down (dy) and reduced in size
	//     titleEl.innerHTML = 'T<tspan dy="4" font-size="0.75em">day</tspan>';
	//   }
}
// tfretk2t

// Function to trigger PNG export with specific scale using dataURI()
async function exportChartToPngWithSpecificScale(chart) {
	console.log('custom png export')
	if (chart) {
		const { imgURI, blob } = await chart.dataURI({
			scale: 5, // <--- Pass the scale directly here
			filename: 'my_chart_datauri_scaled.png'
		});

		// Create a temporary link to trigger download
		const a = document.createElement('a');
		a.href = imgURI;
		a.download = 'my_chart_datauri_scaled.png';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	} else {
		console.error("ApexCharts instance not found.");
	}
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
		legend: {
			position: 'bottom',
			// This is the crucial part
			formatter: function (seriesName, opts) {
				// console.log('seris format', seriesName)
				// return ['a', 'b']
				return seriesName
			},
			itemMargin: {
				vertical: 10 // Add vertical margin between legend items
			}
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
			zoom: {
				enabled: false // This line disables the zoom
			},
			events: {
				mounted: applySubscript,
				updated: applySubscript,
				// function (chartContext, config) {
				// 	applySubscript(chartContext, config);
				// },
				// updated: function (chartContext, config) {
				// 	applySubscript(chartContext, config);
				// }
			},
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
						scale: 5,
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
			// width: o.width ?? '1000px',
			// width: '800px',
			// height: '400px',
			width: '100%',
			height: '100%',
			// width: '100%',
			// height: o.height ?? '400px',
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
		stroke: {
			lineCap: 'round' // Applies to series lines, but can sometimes influence annotations indirectly depending on rendering.
		},
		annotations: {
			yaxis: o.yLines ? Object.entries(o.yLines).map(([y, text], i) =>
			({
				y,
				strokeDashArray: 0, // 1 for dotted
				borderColor: ['#6495ED', '#90EE90', '#F0E68C'][i],//'#00E396',
				// borderColor: ['#777'],
				borderWidth: 1,
				label: {
					borderWidth: 2,
					// borderColor: '#00E396',
					style: {
						color: 'green',//'#00E396'
						fontSize: '11px',
						fontWeight: 100

						// 	color: '#fff',
						// 	background: '#00E396'
					},
					// text
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
