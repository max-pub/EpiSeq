
import { $, $$, download } from './helper.js'
import { start, DATA, startCorrelation } from './flow.js'
import { showTypeChart } from './chart.js'
import { loadDemo } from './lib/fs.js'
import { TALI } from './lib/deps.js'



$('#loadDemo1').addEventListener('click', async x => { DATA.LIST = await loadDemo('coli'); start() })
$('#loadDemo2').addEventListener('click', async x => { DATA.LIST = await loadDemo('mrsa'); start() })
$('#source #cgmlst input').addEventListener('change', async x => { DATA.LIST.cgmlst = await fs.loadFile(event); start() })
$('#source #locations input').addEventListener('change', async x => { DATA.LIST.locations = await fs.loadFile(event); start() })

// $$('#filterResults #cgmlst a').map(x => x.addEventListener('click', () => download(`cgmlst.list.tsv`, TALI.grid.stringify({sequenceID: LIST.cgmlst }, {sortCol: 'typingDate' }))))
$('#filterResults #cgmlst a').addEventListener('click', () => download(`cgmlst.list.tsv`, TALI.grid.stringify({ sequenceID: DATA.LIST.cgmlst }, { sortCol: 'typingDate' })))
$('#filterResults #locations a').addEventListener('click', () => download(`locations.list.tsv`, TALI.grid.stringify({ sequenceID: DATA.LIST.locations }, { sortCol: 'from' })))

$('#distance #cgmlst .matrix').addEventListener('click', () => download(`cgmlst.dist.tsv`, TALI.grid.stringify({ sequenceID: DATA.DIST.cgmlst }, { sortRows: true, sortCols: true, pretty: 1 })))
$('#distance #locations .matrix').addEventListener('click', () => download(`locations.dist.tsv`, TALI.grid.stringify(DATA.DIST.locations, { sortRows: true, sortCols: true, pretty: 1 })))

$('#distance #cgmlst .stat').addEventListener('click', () => download(`cgmlst.dist.stat.tsv`, TALI.grid.stringify(typeStats(DATA.LIST, DATA.DIST), { flip: false })))
$('#distance #cgmlst .graph').addEventListener('click', () => showTypeChart())

$('#correlationResult #cgmlst a').addEventListener('click', () => download(`cgmlst.corr.tsv`, TALI.grid.stringify({ cgmlst: DATA.CORR.cgmlst }, { sortRows: true, sortCols: true, pretty: 1 })))
$('#correlationResult #locations a').addEventListener('click', () => download(`locations.corr.tsv`, TALI.grid.stringify({ location: DATA.CORR.location }, { sortRows: true, sortCols: true, pretty: 1 })))

$('#correlation #td input').addEventListener('change', () => startCorrelation())
$('#correlation #ti input').addEventListener('change', () => startCorrelation())
$('#correlation #cl select').addEventListener('change', () => startCorrelation())
$('#correlation #ci input').addEventListener('change', () => startCorrelation())


// DATA.LIST = await loadDemo('coli'); start()