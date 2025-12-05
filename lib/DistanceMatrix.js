import { Matrix } from "./Matrix.js"

export class DistanceMatrix extends Matrix {
    static integer = /^-?\d+$/
    static float = /^-?(\d+\.?\d*|\d*\.?\d+)$/

    data = {}
    type = 'integer'
    autoConvert = true

    constructor(name, type = 'integer') {
        // console.log('NEW DISTANCE MATRIX',name)
        super(name)
        this.type = type
        // this.data = {}
        // for (let k1 in data ?? {}) {
        //     for (let k2 in data[k1] ?? {}) {
        //         this.set(k1, k2, data[k1][k2])
        //     }
        // }
    }
    rowKeys(p) { return super.rowKeys().sort() }
    colKeys(p) { return this.rowKeys(p) }

    // ord(k1, k2) { return [k1, k2].sort().reverse() }
    ord(k1, k2) { return k1 > k2 ? [k1, k2] : [k2, k1] }
    cmp(k1, k2) { return k1 > k2 }
    setRaw(k1, k2, v) {
        [k1, k2] = this.ord(k1, k2)
        this.data[k1] ??= {}
        this.data[k1][k2] = v
        this.data[k2] ??= {} // makes sure all keys exist in the row-headers
    }
    set(k1, k2, v) {
        // let [k11, k22] = [k1, k2].sort()
        [k1, k2] = this.ord(k1, k2)
        if (DistanceMatrix[this.type]?.test?.(v) === false)
            return console.error(`${v} is not ${this.type}, ${k1}.${k2} value not set`)
        if (this.autoConvert)
            v = Number(v)
        if (Number.isFinite(v) === false)
            return console.error(`${v} is not a JS-'Number', ${k1}.${k2} value not set`)
        this.data[k1] ??= {}
        this.data[k1][k2] = v
        this.data[k2] ??= {} // makes sure all keys exist in the row-headers
        // this.data[k22][k11] = undefined
        // this.data[k11][k11] = null
        // this.data[k22][k22] = null
    }

    get(k1, k2) {
        // let [k11, k22] = [k1, k2].sort()
        [k1, k2] = this.ord(k1, k2)
        return this.data?.[k1]?.[k2]
    }
    del(k1, k2) {
        // let [k11, k22] = [k1, k2].sort()
        [k1, k2] = this.ord(k1, k2)
        delete this.data?.[k1]?.[k2]
    }

    size() {
        let keyCount = Object.keys(this.data).length
        return (keyCount ** 2 - keyCount) / 2
    }
    count({ onProgress } = {}) {
        return [...this.iterate({ onProgress })].length
    }

    // async *[Symbol.asyncIterator]() {}
    *[Symbol.iterator]() {
        let index = 0
        let size = this.size()
        let keys = this.rowKeys()//Object.keys(this.data).sort()
        for (const k1 of keys) {
            for (const k2 of keys) {
                if (this.cmp(k1, k2)) {
                    let val = this.data[k1][k2]
                    yield [k1, k2, val, index++, size]
                }
            }
        }
    }
    *iterate({ skipEmpty = true, onProgress } = {}) {
        for (let [k1, k2, val, index, size] of this) {
            if (skipEmpty && !Number.isFinite(val)) continue
            if (onProgress) onProgress(index, size)
            yield [k1, k2, val, index, size]
        }
    }



    histogram({ maxDistance, onProgress } = {}) {
        let out = []
        // let out = Object.fromEntries(new Array(maxDistance + 1).fill(0).map((x, i) => [i, x]))
        for (let [k1, k2, val] of this.iterate({ onProgress })) {
            // if (Number.isFinite(dist) === false) continue
            out[val] ??= 0
            out[val] += 1
        }
        if (!maxDistance) maxDistance = Math.max(...out)
        for (let i = 0; i <= maxDistance; i++)
            out[i] ??= 0
        return out
    }


    // clipBelow(minValue, { onProgress } = {}) { // like highpass-filter, removes all entries below minValue
    //     for (let [k1, k2, val] of this.iterate({ onProgress })) {
    //         // if (Number.isFinite(dist) === false) continue
    //         // console.log(k1, k2, val, minValue,'-', val < minValue)
    //         if (val < minValue) {
    //             this.del(k1, k2)
    //         }
    //     }
    // }

}