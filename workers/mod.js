export let workers = {}

for (let worker of ['matrix_typings', 'matrix_locations', 'filter', 'pseudonymize', 'correlation'])
	workers[worker] = new Worker(`./${worker}.js`, { type: "module" })


// const worker = {
// 	filter: new Worker("./lib/filter.js", { type: "module" }),
// 	pseudonymize: new Worker("./lib/pseudonymize.js", { type: "module" }),
// 	correlation: new Worker("./lib/correlation.js", { type: "module" })
// }
// const distanceWorker = {
// 	cgmlst: new Worker("./lib/typings.matrix.js", { type: "module" }),
// 	locations: new Worker("./lib/locations.matrix.js", { type: "module" })
// }


// const worker = {
// 	filter: new Worker("./lib/filter.js", { type: "module" }),
// 	pseudonymize: new Worker("./lib/pseudonymize.js", { type: "module" }),
// 	correlation: new Worker("./lib/correlation.js", { type: "module" })
// }
// const distanceWorker = {
// 	cgmlst: new Worker("./lib/typings.matrix.js", { type: "module" }),
// 	locations: new Worker("./lib/locations.matrix.js", { type: "module" })
// }
