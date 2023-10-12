
import { $, $$ } from './dom.js'
import { start, DATA, startCorrelation, startFilter } from './flow.js'
import { showTypeChart } from './chart.js'
import { loadDemo, loadFile, download } from './io.js'
import { TALI } from '../lib/deps.js'
import { typeStats } from '../lib/type.stats.js'
// import { cleanNumbers } from '../workers/matrix_locations.js'



$('#loadDemo1').addEventListener('click', async x => { DATA.SOURCE = await loadDemo('coli'); start() })
$('#loadDemo2').addEventListener('click', async x => { DATA.SOURCE = await loadDemo('mrsa'); start() })

$('#source #typings input').addEventListener('change', async x => { DATA.SOURCE.typings = await loadFile(x); start() })
$('#source #locations input').addEventListener('change', async x => { DATA.SOURCE.locations = await loadFile(x); start() })

$('#filter #from input').addEventListener('blur', () => startFilter())
$('#filter #till input').addEventListener('blur', () => startFilter())
$('#filter #rows input').addEventListener('change', () => startFilter())
$('#filter #cols input').addEventListener('change', () => startFilter())
// $$('#filterResults #cgmlst a').map(x => x.addEventListener('click', () => download(`cgmlst.list.tsv`, TALI.grid.stringify({sequenceID: LIST.typings }, {sortCol: 'typingDate' }))))

// $('#filterResults #cgmlst a').addEventListener('click', () => download(`cgmlst.list.tsv`, TALI.grid.stringify({ sequenceID: DATA.LIST.typings }, { sortCol: 'typingDate' })))
// $('#filterResults #locations a').addEventListener('click', () => download(`locations.list.tsv`, TALI.grid.stringify({ sequenceID: DATA.LIST.locations }, { sortCol: 'from' })))

$('#distance #typings .download').addEventListener('click', () => download(`cgmlst.dist.tsv`, TALI.grid.stringify({ sequenceID: DATA.DIST.typings }, { sortRows: true, sortCols: true, pretty: 1 })))
$('#distance #locations .download').addEventListener('click', () => download(`locations.dist.tsv`, TALI.grid.stringify(cleanNumbers(DATA.DIST.locations), { sortRows: true, sortCols: true, pretty: 1 })))

// $('#distance #cgmlst .stat').addEventListener('click', () => download(`cgmlst.dist.stat.tsv`, TALI.grid.stringify(typeStats(DATA.LIST, DATA.DIST), { flip: false, pretty: 1 })))
// $('#typingDistributionChart .graph').addEventListener('click', () => showTypeChart())

$('#correlationResult #typings a').addEventListener('click', () => download(`cgmlst.corr.tsv`, TALI.grid.stringify({ cgmlst: DATA.CORR.typings }, { sortRows: true, sortCols: true, pretty: 1 })))
$('#correlationResult #locations a').addEventListener('click', () => download(`locations.corr.tsv`, TALI.grid.stringify({ location: DATA.CORR.locations }, { sortRows: true, sortCols: true, pretty: 1 })))

$('#correlation #td input').addEventListener('change', () => startCorrelation())
$('#correlation #ti input').addEventListener('change', () => startCorrelation())
$('#correlation #cl select').addEventListener('change', () => startCorrelation())
$('#correlation #ci input').addEventListener('change', () => startCorrelation())

$('#correlationDownload').addEventListener('click', () => download('correlation.tsv', TALI.grid.stringify(DATA.CORR, { flip: true, pretty: 1 })))

DATA.SOURCE = await loadDemo('coli'); start()


export function cleanNumbers(data) {
	let out = {}
	for (let table in data) {
		out[table] ??= {}
		for (let row in data[table]) {
			out[table][row] ??= {}
			for (let col in data[table][row]) {
				out[table][row][col] = null
				if (![undefined, null, 'xxx'].includes(data[table][row][col]))
					out[table][row][col] = data[table][row][col].toFixed(2)
			}
		}
	}
	for (let cl in out)
		diagonalX(out[cl])
	return out
}