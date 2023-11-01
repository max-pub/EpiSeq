
import { $, $$, download } from './dom.js'
import { DATA, startCorrelation, startFilter, WORKER } from './main.js'
// import { showTypeChart } from './chart.js'
// import { download } from './io.js'
import { TALI } from '../lib/deps.js'
// import { typeStats } from '../lib/type.stats.js'
// import { cleanNumbers } from '../workers/matrix_locations.js'

// const WORKER = Object.fromEntries(['io'].map(worker => [worker, new Worker(`./workers/${worker}.js`, { type: "module" })]))

// function loadFile(key, event) { WORKER.input.postMessage(['file', event.target.files[0]]) }
import * as clear from './clear.js'

function loadDemo(mro) {
	console.log('loadDemo', mro)
	// clear.input()
	// console.log('next',WORKER.input)
	WORKER.input.postMessage(['url', 'typings', window.location.href + `demo/${mro}/cgmlst.tsv`])
	WORKER.input.postMessage(['url', 'locations', window.location.href + `demo/${mro}/locations.tsv`])
}
loadDemo('coli')


$$('[demo]').forEach(node => node.addEventListener('click', () => loadDemo(node.getAttribute('demo'))))
$('#source .typings input').addEventListener('change', event => WORKER.input.postMessage(['file', 'typings', event.target.files[0]]))
$('#source .locations input').addEventListener('change', event => WORKER.input.postMessage(['file', 'locations', event.target.files[0]]))



$('#filter #from input').addEventListener('blur', () => startFilter())
$('#filter #till input').addEventListener('blur', () => startFilter())
$('#filter #rows input').addEventListener('change', () => startFilter())
$('#filter #cols input').addEventListener('change', () => startFilter())
$('#filter #pseudonymize input').addEventListener('change', () => startFilter())


// $$('#filterResults #cgmlst a').map(x => x.addEventListener('click', () => download(`cgmlst.list.tsv`, TALI.grid.stringify({sequenceID: LIST.typings }, {sortCol: 'typingDate' }))))

// $('#filterResults #cgmlst a').addEventListener('click', () => download(`cgmlst.list.tsv`, TALI.grid.stringify({ sequenceID: DATA.filtered.typings }, { sortCol: 'typingDate' })))
// $('#filterResults #locations a').addEventListener('click', () => download(`locations.list.tsv`, TALI.grid.stringify({ sequenceID: DATA.filtered.locations }, { sortCol: 'from' })))

// $('#distance #typings .download').addEventListener('click', () => download(`cgmlst.dist.tsv`, TALI.grid.stringify({ sequenceID: DATA.distanceMatrix.typings }, { sortRows: true, sortCols: true, pretty: 1 })))
// $('#distance #locations .download').addEventListener('click', () => download(`locations.dist.tsv`, TALI.grid.stringify(cleanNumbers(DATA.distanceMatrix.locations), { sortRows: true, sortCols: true, pretty: 1 })))

// $('#distance #cgmlst .stat').addEventListener('click', () => download(`cgmlst.dist.stat.tsv`, TALI.grid.stringify(typeStats(DATA.filtered, DATA.distanceMatrix), { flip: false, pretty: 1 })))
// $('#typingDistributionChart .graph').addEventListener('click', () => showTypeChart())


$('#correlation #td input').addEventListener('change', () => startCorrelation())
$('#correlation #ti input').addEventListener('change', () => startCorrelation())
$('#correlation #cl select').addEventListener('change', () => startCorrelation())
$('#correlation #ci input').addEventListener('change', () => startCorrelation())

// $('#correlationDownload').addEventListener('click', () => download('correlation.tsv', TALI.grid.stringify(DATA.CORR, { flip: true, pretty: 1 })))



// DOWNLOADS
$('#correlationResult #typings a').addEventListener('click', () => download(`cgmlst.corr.tsv`, TALI.grid.stringify({ cgmlst: DATA.CORR.typings }, { sortRows: true, sortCols: true, pretty: 1 })))
$('#correlationResult #locations a').addEventListener('click', () => download(`locations.corr.tsv`, TALI.grid.stringify({ location: DATA.CORR.locations }, { sortRows: true, sortCols: true, pretty: 1 })))



