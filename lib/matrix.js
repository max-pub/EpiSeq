export class Matrix {
    name = ''
    data = {}
    // rowKeys = new Set()
    #colKeys = new Set()


    // constructor(data = {}) {
    //     this.data = {}
    //     for (let k1 in data ?? {}) {
    //         for (let k2 in data[k1] ?? {}) {
    //             this.set(k1, k2, data[k1][k2])
    //         }
    //     }
    // }
    constructor(name = '') {
        // console.log('NEW MATRIX', name)
        this.name = name
    }
    setData(data = {}) {
        this.data = {}
        this.#colKeys = new Set()
        for (let k1 in data ?? {})
            this.setRow(k1, data[k1])
        return this
    }

    colKeys({ sorted } = {}) {
        return [...this.#colKeys]
    }
    rowKeys({ sorted } = {}) {
        return [...Object.keys(this.data)]
    }
    set(k1, k2, v) {
        this.data[k1] ??= {}
        this.data[k1][k2] = v
        // this.rowKeys.add(k1)
        this.#colKeys.add(k2)
        return this
    }

    get(k1, k2) {
        return this.data?.[k1]?.[k2]
    }
    del(k1, k2) {
        delete this.data?.[k1]?.[k2]
        return this
    }
    inc(k1, k2, amount = 1) {
        let x = this.get(k1, k2)
        if (Number.isFinite(x)) this.set(k1, k2, x + amount)
        else this.set(k1, k2, 0)
        return this
    }

    push(k1, k2, v) {
        let arr = this.get(k1, k2)
        if (!Array.isArray(arr))
            arr = []
        arr.push(v)
        this.set(k1, k2, arr)
        return this
    }

    setRow(rowKey, rowData) {
        for (let colKey in rowData)
            this.set(rowKey, colKey, rowData[colKey])
        return this
    }
    setCol(colKey, colData) {
        for (let rowKey in colData)
            this.set(rowKey, colKey, colData[rowKey])
        return this
    }
    delRow(rowKey) {
        delete this.data[rowKey]
        return this
    }
    delCol(colKey) {
        for (let rowKey in this.data)
            delete this.data[rowKey][colKey]
        this.#colKeys.delete(colKey)
        return this
    }

    row(rowKey) {
        return this.data[rowKey]
    }
    * iterateRow(rowKey) {
        for (let colKey in this.data[rowKey])
            yield [colKey, this.data[rowKey][colKey]]
    }
    * iterateRows({ onProgress } = {}) {
        let index = 0
        let total = this.rowKeys().length
        // let keys = this.rowKeys()//Object.keys(this.data).sort()
        for (let rowKey in this.data) {
            if (onProgress) onProgress(++index, total)
            yield [rowKey, this.data[rowKey], index, total]
        }
    }
    * iterateColumns({ onProgress } = {}) {
        let index = 0
        let total = this.colKeys().length
        for (let colKey of this.colKeys()) {
            if (onProgress) onProgress(++index, total)
            yield [colKey, this.column(colKey), index, total]
        }

    }
    * iterateColumn(colKey) {
        for (let rowKey in this.data)
            yield [rowKey, this.data?.[rowKey]?.[colKey]]
    }
    * iterateCells({ skipEmpty = true, onProgress } = {}) {
        for (let rowKey in this.data) {
            for (let colKey in this.data[rowKey]) {
                let val = this.data?.[rowKey]?.[colKey]
                if (skipEmpty && val === undefined) continue
                if (onProgress) onProgress(index, size)
                yield [rowKey, colKey, val]
            }
        }
    }

    columnValues(colKey) {
        // console.log('col val', colKey, '--', Object.values(this.data))
        return Object.values(this.data).map(row => row[colKey])
    }
    columnValuesUnique(colKey) {
        return [...new Set(this.columnValues(colKey))]
    }
    column(colKey) {
        // console.log('col obj', colKey, '--', [...this.iterateColumn(colKey)])

        return Object.fromEntries([...this.iterateColumn(colKey)])
        // return Object.fromEntries(Object.entries(this.data).map(([rowKey, row]) => row[colKey]))
    }

    filter(filterFunction, { onProgress } = {}) {
        let out = new this.constructor(this.name)
        // console.log("FILTER OUT",out)
        for (let [rowKey, colKey, value, index, size] of this.iterate({ onProgress }))
            if (filterFunction(value, colKey, rowKey, index, size))
                out.set(rowKey, colKey, value)
        return out
    }

    flip() {
        let out = new Matrix(this.name)
        for (let r of this.rowKeys()) {
            for (let c of this.colKeys()) {
                let v = this.get(r, c)
                if (v !== undefined)
                    out.set(c, r, v)
            }
        }
        return out
    }

    size() {
        return this.rowKeys().length * this.colKeys().length
    }
    count({ onProgress } = {}) {
        return [...this.iterateCells({ onProgress })].length
    }

    html() {
        let rows = this.rowKeys()
        let cols = this.colKeys()
        let out = '<table><tr><th></th>'
        for (let c of cols)
            out += `<th>${c}</th>`
        out += '</tr>'
        for (let r of rows) {
            out += `<tr><th>${r}</th>`
            for (let c of cols) {
                // out += `<td>${this.get(r, c) ?? ''}</td>`
                if (r == c) out += `<td class="idem">×</td>`
                else out += `<td class='col_${c}'>${this.data[r]?.[c] ?? ''}</td>`
            }
            out += '</tr>'
        }
        out += `<caption>${this.name ?? ''}</caption>`
        out += '</table>'
        return out
    }

    tabline() {
        let rows = [...this.rowKeys()]//.sort()
        let cols = [...this.colKeys()]//.sort()
        return [[this.name ?? '', ...cols].join('\t'), ...rows.map(row => [row, ...cols.map(col => this.data[row][col])].join('\t'))].join('\n')
    }
}