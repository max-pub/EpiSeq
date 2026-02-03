export function histogramVariants(absolute) {
    let compoundedAbsolute = compoundAbsolute(absolute)
    let compoundedRelative = compoundRelative(compoundedAbsolute)
    return { absolute, compoundedAbsolute, compoundedRelative }
}

export function compoundAbsolute(histogram) {
    let out = {}
    for (let i in histogram) {
        out[i] = histogram[i] * 1
        if (i > 0) out[i] += out[i - 1] * 1
    }
    return out
}


export function compoundRelative(compounded) {
    // let maxX = Math.max(...Object.keys(compounded).map(x=>x*1))
    let maxY = Math.max(...Object.values(compounded).map(x => x * 1))
    console.log('maxY', maxY)
    let out = {}
    for (let i in compounded) {
        out[i] = (compounded[i] * 100 / maxY).toFixed(1) + '%'
        // for (let s of ['10.', '20.0', '25.0', 50, 75, 80, 90, 99])
        //     if (out[i].startsWith(s))
        //         console.log(i, out[i])
        // if (['70.0%', '75.0%'].includes(out[i])) console.log(i, out[i])
    }
    return out
}