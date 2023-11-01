export let $ = x => document.querySelector(x)
export let $$ = x => [...document.querySelectorAll(x)]


export function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/tsv;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}



export function getFilterSettings() {
	return {
		from: $('#filter #from input').value,
		till: $('#filter #till input').value,
		requiredRowCompleteness: $('#filter #rows input').value * 1,
		requiredColumnCompleteness: $('#filter #cols input').value * 1,
		hasRoom: $('#filter #hasRoom input').checked,
		pseudonymize: $('#filter #pseudonymize input').checked,
	}
}
export function getCorrelationSettings() {
	// $$('#correlation select, #correlation input')
	return {
		TD: $('#correlation #td input').value * 1,
		TI: $('#correlation #ti input').value * 1,
		CL: $('#correlation #cl select').value,
		CI: $('#correlation #ci input').value * 1,
		CD: $('#correlation #cd input').value * 1,
	}
}
export function getCorrelationString() {
	let x = getCorrelationSettings()
	return Object.entries(getCorrelationSettings()).filter(x => x[0] != 'TD').map(x => `${x[0]} = ${x[1]}`).join('     ')
}

export function show(path) {
	try {
		$(path).hidden = false
	} catch { }
}
