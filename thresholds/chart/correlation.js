
import { showChart, space } from '../../lib/apex.bridge.js'


function template() {
	return `
<div class="chart"></div>

<div class="flex-between">
	<div class="width">
		<a width='20'>20</a>
		<a width='100'>100</a>
		<a width='500'>500</a>
		<a width='full'>full</a>
	</div>


	<div class="height">
		<a height='60'>60</a>
		<a height='80'>80</a>
		<a height='100'>100</a>
	</div>



	<div class="export">
		<a>tsv</a>
		<a>svg</a>
		<a>png</a>
	<!--	<a>print</a> -->
	</div>
</div>
`
}


function applyTemplate(container, sourceData, info, settings) {
	container.innerHTML = template()
	container.$$(`.height a`).map(x => x.addEventListener('click', event => correlationChart(container, sourceData, info, { ...settings, height: event.target.getAttribute('height').trim() })))
	container.$$(`.width a`).map(x => x.addEventListener('click', event => correlationChart(container, sourceData, info, { ...settings, width: event.target.getAttribute('width').trim() })))
	// container.$$(`.type a`).map(x => x.addEventListener('click', event => correlationChart(container, sourceData, info, { ...settings, type: event.target.getAttribute('mode').trim() })))
	container.$(`[height='${settings.height}']`).classList.add('selected')
	container.$(`[width='${settings.width}']`).classList.add('selected')
	// container.$(`[mode='${settings.type}']`).classList.add('selected')
}


function settingsString(settings) {
	// console.log('settings string',settings)
	//  ${space(10)} S<<min>> = ${settings.TC}
	//  ${space(10)} T<<tol>> = ${settings.MR}
	// return `T<<gap>>=${settings.TT} ${space(5)} T<<tol>>=${settings.MR} ${space(5)} T<<min>>=${settings.TC} ${space(10)} C<<lvl>>=${settings.CS.map(x => x[0].toUpperCase()).join('')} ${space(5)} C<<gap>>=${settings.CT} ${space(5)} C<<hop>>=${settings.CD}`
	return `S{gap} = ${settings.S_gap} ${space(10)} C{gap} = ${settings.C_gap} ${space(10)} C{loc} = ${settings.C_loc}`
}
function settingsStringFilename(settings) {
	return `TT${settings.TT}_TV${settings.MR}_TM${settings.TC}_CS${settings.CS.map(x => x[0].toUpperCase()).join('')}_CT${settings.CT}_CD${settings.CD}`
}


function legendString(mode, settings) {
	let chopN = mode.slice(6) * 1
	// console.log('legend string',mode,settings, chopN)
	let chop = `C{hop} = ${chopN} ${space(5)}`
	let ttol = `T{tol} = ${settings.correlationParameters.T_tol} ${space(5)}`
	return chop + (chopN > 0 ? ttol : '') + space(5)
}


export function correlationChart(container, sourceData, info, settings = { height: '100', width: '100' }) {
	// console.log('showCorrelationChart', sourceData, stats, settings)
	// console.log('corr chart', sourceData, info)

	let xMax = settings.width == 'full' ? info.T_len.value * 1 : settings.width * 1
	// console.log('xMax', xMax, settings.schemaLength)
	let yMax = settings.height * 1

	if (xMax > 1000) xMax = Math.ceil(xMax / 100) * 100 // greater 1000 ? round to next 100
	let xTicks = xMax < 1000 ? 20 : (xMax / 100)

	let firstRow = Object.values(sourceData)[0]
	// console.log('first row', firstRow)
	let series = Object.keys(firstRow).map(mode => ({
		// let series = ['c0', 'c1', 'c2'].map(mode => ({
		// name: mode.toUpperCase(),//+ statsString(stat[mode]),
		name: legendString(mode, info),
		//.replace('cd0', 'primary contacts').replace('cd1', 'secondary contacts').replace('cd2', 'tertiary contacts'),
		// data: Object.entries(sourceData).map(([x, y]) => ({ x: x * 1, y: y[mode] })).filter(x => x.x <= xMax)
		data: Array(xMax + 1).fill(1).map((x, i) => ({ x: i, y: sourceData[i]?.[mode] ?? 0 }))
	}))
	// console.log('series',series)

	// let yLines = { [`${stat.cd0.median}`]: `median` }
	// let yLines = {}
	// for (let cd in stat)
	// 	yLines[stat[cd].cutOff] = cd

	// console.log('yLines', yLines)

	applyTemplate(container, sourceData, info, settings)

	// console.log('median', med)
	// console.log('corrrel', correlation.formData, correlation.formString)
	// let filename = 'correlation___' + settingsStringFilename(settings)
	let filename = `correlation.${xMax}x${yMax}`  
	container.setAttribute('title', filename)

	let options = {
		// filename: sourceInput.title_ + '___' + typeFilter.formString_ + '___' + locationFilter.formString_ + '___' + correlation.formString_ + '___h_' + height,
		filename,
		mainTitle: info.preparationParameters.MDRO ?? 'germX',  // .replace('E. coli','i[E. coli]i')
		subTitle: settingsString(info.correlationParameters),//`germX`,
		// filename: 'correlation_' + sourceInput.title_,
		// mainTitle: (sourceInput.title) ?? '',
		// subTitle: `${typeFilter.formString}  ${space(5)}  ${locationFilter.formString}  ${space(5)}  ${correlation.formString}`,
		// mainTitle: `${sourceInput.title ?? ''}: ${space(3)} typing location correlation`,//  ${space(8)}  `,
		xTitle: `cgMLST distance`,
		yTitle: `pair connectivity`,
		yMin: 0,
		yMax,
		xMax,
		xTicks,

		// xTicks: xMax <= 50 ? 'dataPoints' : Math.floor(xMax / 2),
		yTicks: yMax / 5,
		yFormat: v => v.toFixed(0) + '%',
		height: '500px',
		// yLines: { [med]: `median = ${med.toFixed(1)}%`, [med * TH]: `median * ${TH} = ${(med * TH).toFixed(1)}%` },
		// yLines,
		// threshold: med * TH,
		// threshold: sd * 2,
		// colors: ['#FF4D16', '#FC9C1C', '#FFD81C']
		colors: ['#6495ED', '#90EE90', '#F0E68C'], // == cornflowerblue.6495ED, lightgreen.90EE90, khaki.F0E68C, coral.FF7F50
		// 
		// colors: ['#6495EDff', '#6495EDaa', '#6495ED55']
		// yLines: { [med]: 'median', [med * 3]: '3x', [med * 5]: '5x', [med * 10]: '10x' },
		// yLines: { [med]: 'median' },
	}

	showChart(container, series, options)
}




