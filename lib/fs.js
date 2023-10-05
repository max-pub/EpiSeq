

function loadTextFile(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.addEventListener('load', event => resolve(event.target.result));
		reader.addEventListener('error', event => reject());
		reader.readAsText(file);
	})
}

export async function loadFile(event) {
	// $('#loadResult').innerHTML = 'loading...'
	let file = event.target.files[0]
	return await loadTextFile(file)
}

export async function loadDemo(mro) {
	// $('#loadResult').innerHTML = 'loading...'
	// console.log("FUCK", await fetch('demo/cgmlst.tsv').then(x => x.text()))
	return {
		cgmlst: await fetch(`demo/${mro}/cgmlst.tsv`).then(x => x.text()),
		locations: await fetch(`demo/${mro}/locations.tsv`).then(x => x.text())
	}
	// console.log('li', LIST.cgmlst)
}


import { TALI } from './deps.js'
export function parseTSV(text) {
	// $('#loadResult').innerHTML = 'parsing...'
	return Object.values(TALI.grid.parse(text))[0]
}