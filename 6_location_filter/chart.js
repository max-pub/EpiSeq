
import { $, $$, sum } from '../lib/deps.js'
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


export function showContactChart1(container, template, data, xLimit = '21') {
	// console.log('contact chart', data)
	console.log('showContactChart1 data', data)
	container.innerHTML = template(xLimit)
	container.$$(`.options a`).map(x => x.addEventListener('click', event => showContactChart1(container, template, data, event.target.id)))

	// let chartData = Object.entries(data.clinic).filter(x => Math.abs(x[0] * 1) <= xLimit * 1).map(([x, y]) => ({ x: x * 1, y: y * 1 }))
	// console.log('showContactChart data2', chartData)
	// let wardData = Object.entries(data.ward).filter(x => Math.abs(x[0] * 1) <= xLimit * 1).map(([x, y]) => ({ x: x * 1, y: y * 1 }))

	// let xMin = Math.min(...chartData.map(x => x.x))
	// let xMax = Math.max(...chartData.map(x => x.x))
	// let 
	// let xMax = chartData.length - 1
	// if (xMax > 1000) xMax = Math.ceil(xMax / 100) * 100 // greater 1000 ? round to next 100
	// let tickAmount = xMax < 1000 ? 20 : (xMax / 100)
	// let yMax = Math.max(...data.map(x => x.y))
	let lim = xLimit == 'full' ? 5000 : xLimit * 1

	let chartData = Object.entries(data).filter(x => x[0] <= lim).map(([x, y]) => ({ x: x * 1, y: y * 1 }))

	let series = [{
		name: 'contact pairs',
		data: chartData
	}]

	// let series = Object.entries(data).map(([type, values]) => ({
	// 	name: type,
	// 	data: Object.entries(data[type]).filter(x => Math.abs(x[0] * 1) <= lim * 1).map(([x, y]) => ({ x: x * 1, y: y * 1 }))
	// }))
	let xMin = Math.min(...series[0].data.map(x => x.x))
	let xMax = Math.max(...series[0].data.map(x => x.x))
	// console.log('min-max', xMin, xMax)

	// let series = [
	// 	{
	// 		name: 'clinic-level pairs at distance',
	// 		data: chartData
	// 	},
	// 	{
	// 		name: 'ward-level pairs at distance',
	// 		data: wardData
	// 	},
	// ]

	let options = {
		filename: sourceInput.title_ + '_location_distance_histogram_' + xLimit,
		mainTitle: `${sourceInput.title ?? ''}: ${space(3)} contact distance histogram`,
		xTitle: `contact distance in days`,
		yTitle: 'number of patient-pairs',
		xType: 'numeric',
		xMin,
		xMax,
		xTicks: 'dataPoints',
		// xTicks: 10,
		// xSteps: 5,
		yTicks: 10,
		// logarithmic: scaleType == 'logarithmic',
		height: '400px',
		// colors: ['#FF4D16', '#FC9C1C', '#FFD81C']
		// colors: ['crimson', 'goldenrod', 'lime']
	}
	// console.log('showContactChart', series, options)
	showChart(container, series, options)

}




// function contactCountHistogram(contacts) {
// 	let stats = []
// 	for (let pid in contacts) {
// 		let len = contacts[pid]?.length ?? 0
// 		if (len == 0) console.log("NULL", pid, contacts[pid])
// 		// if (len > 100) console.log('HUGE', pid, contacts[pid])
// 		stats[len] ??= 0
// 		stats[len]++
// 	}
// 	console.log('con-stat.len', stats.length)
// 	for (let i = 0; i < stats.length; i++)
// 		stats[i] ??= 0
// 	console.log('con-stat SUM', sum(stats))
// 	return stats

// }



export function showContactChart2(container, template, data, xLimit = '100') {
	console.log('showContactChart2 data', data)
	let stats = data
	// let stats = contactCountHistogram(data)
	// console.log('cont stat', stats)

	container.innerHTML = template(xLimit)
	container.$$(`.options a`).map(x => x.addEventListener('click', event => showContactChart2(container, template, data, event.target.id)))

	// let chartData = Object.entries(data.clinic).filter(x => Math.abs(x[0] * 1) <= xLimit * 1).map(([x, y]) => ({ x: x * 1, y: y * 1 }))
	// console.log('showContactChart data2', chartData)
	// let wardData = Object.entries(data.ward).filter(x => Math.abs(x[0] * 1) <= xLimit * 1).map(([x, y]) => ({ x: x * 1, y: y * 1 }))

	// let xMin = Math.min(...chartData.map(x => x.x))
	// let xMax = Math.max(...chartData.map(x => x.x))
	// let 
	// let xMax = chartData.length - 1
	// if (xMax > 1000) xMax = Math.ceil(xMax / 100) * 100 // greater 1000 ? round to next 100
	// let tickAmount = xMax < 1000 ? 20 : (xMax / 100)
	// let yMax = Math.max(...data.map(x => x.y))
	let lim = xLimit == 'full' ? 5000 : xLimit * 1

	let chartData = stats.slice(0, lim + 1).map((v, i) => ({ x: i * 1, y: v * 1 }))

	let series = [{
		name: 'number of patients',
		data: chartData
	}]

	// let series = Object.entries(data).map(([type, values]) => ({
	// 	name: type,
	// 	data: Object.entries(data[type]).filter(x => Math.abs(x[0] * 1) <= lim * 1).map(([x, y]) => ({ x: x * 1, y: y * 1 }))
	// }))
	let xMin = Math.min(...series[0].data.map(x => x.x))
	let xMax = Math.max(...series[0].data.map(x => x.x))
	// console.log('min-max', xMin, xMax)

	// let series = [
	// 	{
	// 		name: 'clinic-level pairs at distance',
	// 		data: chartData
	// 	},
	// 	{
	// 		name: 'ward-level pairs at distance',
	// 		data: wardData
	// 	},
	// ]

	let options = {
		filename: sourceInput.title_ + '_contact_count_histogram_' + xLimit,
		mainTitle: `${sourceInput.title ?? ''}: ${space(3)} contact count histogram`,
		xTitle: `number of contacts`,
		yTitle: 'number of patients',
		xType: 'numeric',
		xMin,
		xMax,
		xTicks: lim <= 50 ? 'dataPoints' : Math.floor(stats.slice(0, lim).length / 5),
		// xTicks: 10,
		// xSteps: lim <= 50 ? undefined : 5,
		yTicks: 10,
		// logarithmic: scaleType == 'logarithmic',
		height: '400px',
		// colors: ['#FF4D16', '#FC9C1C', '#FFD81C']
		// colors: ['crimson', 'goldenrod', 'lime']
	}
	// console.log('showContactChart', series, options)
	showChart(container, series, options)

}

