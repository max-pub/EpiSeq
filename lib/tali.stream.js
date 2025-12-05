
import { Stream } from './Stream.js'

export class TaliStream extends Stream {

    async * tabLine(options = {}) { // line/row based yields
        let done = 0
        let tableName = ''
        let colKeys = []
        for await (const line of this.lines()) {
            done += line.length + 1
            let tabs = line.split('\t')
            if (tabs.length < 2) {
                tableName = ''
                colKeys = []
                continue
            }
            if (!tableName && tabs.length > 1) {
                tableName = tabs[0]
                colKeys = tabs.slice(1)
                colKeys.unshift('')
                continue
            }
            let rowKey = tabs[0]
            let data = {}
            for (let i = 1; i < tabs.length; i++) {
                let cellVal = tabs[i]//.replaceAll(':T:','\t').replaceAll(':L:','\n')
                // if (cellVal === '' || cellVal === 'x' || cellVal === 'null' || cellVal === 'undefined' || cellVal === 'NaN' || cellVal === 'Invalid Date') continue
                if (cellVal === '') continue
                data[colKeys[i]] = cellVal
            }
            yield [tableName, rowKey, data, done, this.progress.total]
        }
    }

}








    // async * tabLineCol(options = {}) { // column based yielding
    //     let done = 0
    //     let tableName = ''
    //     let colKeys = []
    //     for await (const line of this.lines()) {
    //         done += line.length + 1
    //         let tabs = line.split('\t')
    //         if (tabs.length < 2) {
    //             tableName = ''
    //             colKeys = []
    //             continue
    //         }
    //         if (!tableName && tabs.length > 1) {
    //             tableName = tabs[0]
    //             colKeys = tabs.slice(1)
    //             colKeys.unshift('')
    //             continue
    //         }
    //         let rowKey = tabs[0]
    //         for (let i = 1; i < tabs.length; i++) {
    //             let cellVal = tabs[i]//.replaceAll(':T:','\t').replaceAll(':L:','\n')
    //             // if (cellVal === '' || cellVal === 'x' || cellVal === 'null' || cellVal === 'undefined' || cellVal === 'NaN' || cellVal === 'Invalid Date') continue
    //             if (cellVal === '') continue
    //             yield [tableName, rowKey, colKeys[i], cellVal, done, this.progress.total]
    //         }
    //     }
    // }




    // async * taliOLD(options = {}) { // first version
    //     options = { replacements: {}, ...options }
    //     options.replacements = { '': undefined, 'x': undefined, ...options.replacements }
    //     options.skipValues = ['', 'x', 'null', 'undefined', 'NaN', 'Invalid Date', null, undefined, NaN]
    //     // let lines = []
    //     let table = ''
    //     let header = []
    //     // let total = 0
    //     let out = {}
    //     // let t0 = Date.now()
    //     // return
    //     // let replacements = { '': undefined, 'x': undefined }
    //     // for (const line of lines(await fetch(url).then(x => x.text()))) {
    //     for await (const line of this.lines()) {
    //         // for await (const line of loadLines(url)) {
    //         // console.log('.',line)
    //         // let tabs = line[0].split('\t')
    //         // console.log('line',line)
    //         // total += line.length
    //         let tabs = line.split('\t')
    //         // lines.push(tabs)
    //         // console.log(tabs.length)
    //         if (tabs.length < 2) {
    //             // console.log('next', tabs.length, line[1])
    //             table = ''
    //             header = []
    //             continue
    //         }
    //         if (!table && tabs.length > 1) {
    //             table = tabs[0]
    //             header = tabs.slice(1)
    //             header.unshift('')
    //             // console.log("HEADER", header, tabs)
    //             out[table] = {}
    //             // Thread.post.table(table)
    //             // console.log(table, '--', tabs)
    //             continue
    //         }
    //         let id = tabs[0]
    //         // let values = tabs
    //         // continue
    //         // let values = tabs.slice(1).map(cell => cell in options.replacements ? options.replacements[cell] : cell)
    //         // continue
    //         // let values = tabs.slice(1)
    //         // continue
    //         let dict = {}
    //         for (let i = 1; i < tabs.length; i++) {
    //             let cell = tabs[i]//.replaceAll(':T:','\t').replaceAll(':L:','\n')
    //             if (options.skipValues.includes(cell)) continue
    //             cell = cell in options.replacements ? options.replacements[cell] : cell
    //             if (options.parseFloat) {
    //                 let n = parseFloat(cell)
    //                 if (!isNaN(n)) cell = n
    //             }
    //             dict[header[i]] = cell in options.replacements ? options.replacements[cell] : cell
    //         }
    //         yield [table, id, dict]
    //         // out[table][id] = dict
    //     }
    //     // return out
    // }
