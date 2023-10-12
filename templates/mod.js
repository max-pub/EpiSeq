import { template } from '../lib/deps.js'

export let templates = {}

for (let tpl of ['chart_typings', 'chart_locations', 'stat_list'])
	templates[tpl] = template(await fetch(`templates/${tpl}.html`).then(x => x.text()))






	// const templates = Object.fromEntries(['chart_typings','chart_locations','stat_list'].map(async x => [x, template(await fetch(`templates/${x}.html`).then(x => x.text()))]))
// const templates = {
// 	listStats: template(await fetch('ui/list.stat.html').then(x => x.text())),
// 	typingsChart: template(await fetch('ui/chart.typings.html').then(x => x.text())),
// 	locationsChart: template(await fetch('ui/chart.locations.html').then(x => x.text())),
// }
// console.log('template', templates.listStats.toString())
