onmessage = event => {
	run(...event.data)
}

function run(pairs, contacts) {
	postMessage(['started'])
	let correlation = correlate(pairs, contacts)
	postMessage(['result', correlation])
	postMessage(['finished'])
}

function correlate(pairs, contacts) {
	// console.log("WORKER correlate", pairs, contacts)
	let out = {}
	for (let distance in pairs) {
		let count = { total: pairs[distance].length, c0: 0, c1: 0, c2: 0 }
		for (let [pid1, pid2] of pairs[distance]) {
			// console.log('pid1',contacts[pid1])
			let c1 = Object.keys(contacts[pid1] ?? {})
			if (!c1.length) continue // pid 1 has no contacts, continue with next pair
			let c2 = Object.keys(contacts[pid2] ?? {})
			if (!c2.length) continue // pid 2 has no contacts, continue with next pair

			if (c1.includes(pid2)) { // direct contact found, continue with next pair
				// console.log('level 0',c1)
				count.c0++
				continue
			}
			let c1b = expand(c1, contacts)
			if (c1b.includes(pid2)) {
				// console.log('level 1', c1b)
				count.c1++
				continue
			}

			let c1c = expand(c1b, contacts)
			if (c1c.includes(pid2)) {
				// console.log('level 2', c1c)
				count.c2++
				continue
			}

		}
		out[distance] = count
		postMessage(['progress', distance * 1, Object.keys(pairs).length])
	}
	// console.log('out', out)
	return out
}


function expand(pids, contacts) {
	return pids.map(pid=>Object.keys(contacts[pid] ?? {})).flat()
	// let out = []
	// for (let pid of pids)
		// out.push(...Object.keys(contacts[pid] ?? {}))
	// return out
}

// console.log('c1',c1,'c2',c2)
// if (!Object.keys(contacts[pid1] ?? {}).length) continue
// if (!Object.keys(contacts[pid2] ?? {}).length) continue
