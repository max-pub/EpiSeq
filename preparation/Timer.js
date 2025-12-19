
export class Timer {
    list = []
    constructor() {
        this.time = Date.now()
    }
    step() {
        let timeDiff = Date.now() - this.time
        this.time = Date.now()
        return timeDiff
    }
    measure(name, func) {
        let t0 = Date.now()
        let result = func()
        let timeDiff = Date.now() - t0
        this.list.push({ name, time: timeDiff })
        return result
    }
    async measureAsync(name, func) {
        let t0 = Date.now()
        let result = await func()
        let timeDiff = Date.now() - t0
        this.list.push({ name, time: timeDiff })
        return result
    }
    report() {
        this.list = this.list.filter(x => x.name != 'total')
        let total = this.list.reduce((sum, x) => sum + x.time, 0)
        this.list.push({ name: 'total', time: total })
        return this.list
    }
}

