onmessage = event => {
	let list = event.data
	// console.log('hello from type matrix::', message)
	anonymize(list)
}



let IDs = []
function generateUniqueID() {
	while (1) {
		let newID = Math.random().toString(36).slice(2, 8)
		if (!IDs.includes(newID)) {
			IDs.push(newID)
			return newID
		}
	}
}
function anonymizeValue(MAP, key, value) {
	if (!value) return ''
	if (!MAP[key][value])
		MAP[key][value] = { replacement: generateUniqueID(), count: 0 }
	MAP[key][value].count++
	return MAP[key][value].replacement
}

function anonymizeLocations(DATA, MAP) {
	let t0 = Date.now()
	// console.log('anonymize location data...')
	let NEW = {}
	let ids = Object.keys(DATA).sort()
	for (let id of ids) {
		let val = DATA[id]
		NEW[anonymizeValue(MAP, 'locationID', id)] = {
			patientID: anonymizeValue(MAP, 'patientID', val.patientID),
			from: val.from,
			till: val.till,
			clinic: anonymizeValue(MAP, 'clinic', val.clinic),
			ward: anonymizeValue(MAP, 'ward', val.ward),
			room: anonymizeValue(MAP, 'room', val.room),
		}
		postMessage(['progress', [ids.indexOf(id) + 1, ids.length]])
	}
	// console.log('...done', Date.now() - t0, 'ms')
	return NEW
}

function anonymizeTypings(DATA, MAP) {
	let t0 = Date.now()
	console.log('anonymize typing data...')
	let NEW = {}
	let ids = Object.keys(DATA).sort()
	for (let id of ids) {
		let val = DATA[id]
		val.patientID = anonymizeValue(MAP, 'patientID', val.patientID)
		NEW[anonymizeValue(MAP, 'sequenceID', id)] = val
		postMessage(['progress', [ids.indexOf(id) + 1, ids.length]])
	}
	// console.log('...done', Date.now() - t0, 'ms')
	return NEW
}


export function anonymize(DATA) {
	let MAP = { clinic: {}, ward: {}, room: {}, patientID: {}, locationID: {}, sequenceID: {}, alleleID: {}, }
	DATA.typings = anonymizeTypings(DATA.typings, MAP)
	DATA.locations = anonymizeLocations(DATA.locations, MAP)
	postMessage(['result', [DATA, MAP]])
	return MAP
}