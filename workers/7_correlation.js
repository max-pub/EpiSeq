onmessage = event => {
	run(...event.data)
}

function run(pairs, contacts, CD) {
	postMessage(['started'])
	let correlation = correlate(pairs, contacts, CD)
	postMessage(['result', correlation])
	let rel = absolute2relative(correlation)
	postMessage(['relative', rel])

	postMessage(['finished'])
}

function correlate(pairs, contacts, CD) {
	// console.log()
	// console.log("WORKER correlate", pairs, contacts, 'CD', CD)
	let out = {}
	for (let distance in pairs) {
		let count = { total: pairs[distance].length, CD0: 0 }
		if(CD >= 1) count.CD1 = 0
		if(CD >= 2) count.CD2 = 0
		for (let [pid1, pid2] of pairs[distance]) {
			// console.log('pid1',contacts[pid1])
			let c1 = Object.keys(contacts[pid1] ?? {})
			if (!c1.length) continue // pid 1 has no contacts, continue with next pair
			let c2 = Object.keys(contacts[pid2] ?? {})
			if (!c2.length) continue // pid 2 has no contacts, continue with next pair

			if (c1.includes(pid2)) { // direct contact found, continue with next pair
				// console.log('level 0',c1)
				count.CD0++
				continue
			}
			if (CD >= 1) {
				let c1b = expand(c1, contacts)
				if (c1b.includes(pid2)) {
					// console.log('level 1', c1b)
					// count.CD1 ??= 0
					count.CD1++
					continue
				}
				if (CD >= 2) {
					let c1c = expand(c1b, contacts)
					if (c1c.includes(pid2)) {
						// console.log('level 2', c1c)
						// count.CD2 ??= 0
						count.CD2++
						continue
					}
				}
			}

		}
		out[distance] = count
		postMessage(['progress', distance * 1, Object.keys(pairs).length])
	}
	// console.log('out', out)
	return out
}


function expand(pids, contacts) {
	return pids.map(pid => Object.keys(contacts[pid] ?? {})).flat()
	// let out = []
	// for (let pid of pids)
	// out.push(...Object.keys(contacts[pid] ?? {}))
	// return out
}

// console.log('c1',c1,'c2',c2)
// if (!Object.keys(contacts[pid1] ?? {}).length) continue
// if (!Object.keys(contacts[pid2] ?? {}).length) continue


function absolute2relative(data) {
	// console.log("abs2rel",data)
	let out = {}
	for (let dist in data) {
		out[dist] = {}
		for (let depth in data[dist]) {
			if (depth == 'total') continue
			out[dist][depth] = (data[dist][depth] / data[dist].total * 100).toFixed() + '%'
		}
	}
	return out
}