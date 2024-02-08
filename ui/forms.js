import { DATA, dataOrder } from './main.js'





class Base {
	find(path) {
		return document.querySelector(this.base).querySelector(path)
	}
	enabled(bool) {
		// console.log('enable', Boolean(bool), this.base)
		this.find('[type=submit]').disabled = !bool
	}
	reset() {
		this.find('form').reset()
	}
	done(){
		return this.find('.done')
	}
	downloads(){
		return this.find('.downloads')
	}
	updateState() {
		this.updateContent()
		this.updateActivation()
	}
	updateContent() {
		let data = DATA[this.base.slice(1)]
		let keys = Object.keys(data)
		if (keys.length == 0) this.clear()
	}
	updateActivation() {
		let index = dataOrder.indexOf(this.base.slice(1))
		let data = DATA[dataOrder[index - 1]]
		let keys = Object.keys(data)
		this.enabled(keys.length)
	}

}

export function title_(){
	let input = source.find('form .title input')
	return input.value.replaceAll(/[^a-z0-9]/gi, '')
}

export function title(v) {
	let input = source.find('form .title input')
	if (v) input.value = v
	return input.value ?? ''
}

export const source = new class extends Base {
	base = '#source'
	data() {
		return {
			title: this.find('form .title input').value,
			typings: this.find('form .typings input').files[0],
			locations: this.find('form .locations input').files[0],
		}
	}
	clear() {
		this.done().innerHTML = ''
		this.downloads().innerHTML = ''
		// this.find('ul.info').innerHTML = ''
		// this.find('table.info').innerHTML = `<tr class='typings'></tr> <tr class='locations'></tr>`
		// this.find('table.info .typings').innerHTML = ''
		// this.find('table.info .locations').innerHTML = ''
	}

	updateActivation() {
		// console.log('source activation?', this.data(), this.data().typings ? 'ja' : 'nein', (this.data().typings && this.data().locations))
		this.enabled(this.data().typings && this.data().locations)
	}
}




export const source_filter = new class extends Base {
	base = '#source_filter'
	data() {
		return {
			from: this.find('#from input').value,
			till: this.find('#till input').value,
			requiredRowCompleteness: this.find('#rows input').value * 1,
			requiredColumnCompleteness: this.find('#cols input').value * 1,
			hasRoom: this.find('#hasRoom input').checked,
			pseudonymize: this.find('#pseudonymize input').checked,
		}
	}
	string_() {
		return `row${this.data().requiredRowCompleteness}_col${this.data().requiredColumnCompleteness}`
	}
	clear() {
		this.done().innerHTML = ''
		this.downloads().innerHTML = ''
		// this.find('ul.info').innerHTML = ''
		// this.find('table.info').innerHTML = ''
		// this.find('table.info .typings').innerHTML = ''
		// this.find('table.info .locations').innerHTML = ''
		this.find('.chart-box').innerHTML = ''
	}
}





export const typing_distance = new class extends Base {
	base = '#typing_distance'
	data() {
		return {
			countNull: this.find('#countNull input').checked,
		}
	}
	clear() {
		this.done().innerHTML = ''
		this.downloads().innerHTML = ''

		// this.find('ul.info').innerHTML = ''
		// this.find('table.info').innerHTML = ''
		// this.find('table.info').innerHTML = ''
		// this.find('table.info.locations').innerHTML = ''
		this.find('.chart-box').innerHTML = ''
	}
}






export const typing_filter = new class extends Base {
	base = '#typing_filter'

	data() {
		return {
			TD: this.find('#td input').value * 1,
			TI: this.find('#ti input').value * 1,
		}
	}

	string() {
		return Object.entries(this.data()).filter(x => x[0] != 'TD').map(x => `${x[0]} = ${x[1]}`).join('     ')
	}
	string_() {
		return Object.entries(this.data()).map(x => `${x[0]}${x[1]}`).join('_')
	}

	clear() {
		this.done().innerHTML = ''
		this.downloads().innerHTML = ''
		// this.find('ul.info').innerHTML = ''
		// this.find('table.info').innerHTML = ''
		// this.find('.chart-box').innerHTML = ''
	}
}



export const location_contacts = new class extends Base {
	base = '#location_contacts'

	enabled(bool) {}
	reset() {}
	clear() {
		this.done().innerHTML = ''
		this.downloads().innerHTML = ''
		// this.find('ul.info').innerHTML = ''
		// this.find('table.info').innerHTML = ''
		// this.find('.chart-box').innerHTML = ''
	}
}



export const location_filter = new class extends Base {
	base = '#location_filter'

	data() {
		return {
			CL: this.find('#cl select').value,
			CI: this.find('#ci input').value * 1,
			CD: this.find('#cd input').value * 1,
		}
	}

	string() {
		return Object.entries(this.data()).filter(x => x[0] != 'TD').map(x => `${x[0]} = ${x[1]}`).join('   ')
	}
	string_() {
		return Object.entries(this.data()).map(x => `${x[0]}${x[1]}`).join('_')
	}

	clear() {
		this.done().innerHTML = ''
		this.downloads().innerHTML = ''
		// this.find('ul.info').innerHTML = ''
		// this.find('table.info').innerHTML = ''
		this.find('.chart-box').innerHTML = ''
	}
}


export const correlation = new class extends Base {
	base = '#correlation'

	enabled(bool) {}
	reset() {}
	clear() {
		this.done().innerHTML = ''
		this.downloads().innerHTML = ''
		// this.find('ul.info').innerHTML = ''
		// this.find('div.table').innerHTML = ''
		this.find('.chart-box').innerHTML = ''
	}
}







export function correlationParameters() {
	return typing_filter.string() + '   ' + location_filter.string()
}