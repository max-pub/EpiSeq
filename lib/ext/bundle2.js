// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

function trim(string = '', characters = ' ') {
    let c = '\\' + characters.split('').join('\\');
    return (string + '').replace(new RegExp(`^[${c}]+|[${c}]+$`, 'g'), '');
}
function blocks(string = "") {
    return string?.split('\r\n\r\n')?.flatMap((x) => x.split('\r\r'))?.flatMap((x) => x.split('\n\n')) ?? [];
}
function lines(string = "") {
    return string?.split('\r\n')?.flatMap((x) => x.split('\r'))?.flatMap((x) => x.split('\n')) ?? [];
}
function flipAA(aa) {
    let out = [];
    for (let i in aa) {
        for (let j in aa[i]) {
            out[j] ??= [];
            out[j][i] = aa[i][j];
        }
    }
    return out;
}
function prettifyAA(aa, options = {}) {
    let maxColumnLengths = flipAA(aa.map((row) => row.map((col) => String(col ?? '').length))).map((col) => Math.max(...col));
    if (options.pretty > 1) maxColumnLengths = maxColumnLengths.map((x) => Math.ceil(x / options.pretty) * options.pretty);
    return aa.map((row) => row.map((col, j) => pad(col, maxColumnLengths[j])));
}
function pad(str, len) {
    if (str * 1 == str) return String(str ?? '')?.padStart(len, ' ') ?? '';
    return String(str ?? '')?.padEnd?.(len, ' ') ?? '';
}
function encodeAAA(aaa, options = {}) {
    return aaa.map((table) => table.map((row) => row.map((cell) => cell in options.stringify ? options.stringify[cell] : cell).map((cell) => String(cell).replaceAll('\t', options.tab).replaceAll('\n', options.line).trim())));
}
function decodeAAA(aaa, options = {}) {
    return aaa.map((table) => table.map((row) => row.map((cell) => cell in options.parse ? options.parse[cell] : cell)));
}
function str2aaa(string, options = {}) {
    let aaa = blocks(string).map((table) => lines(table).filter((row) => row.trim()).map((row) => row.split('\t').map((cell) => cell.trim())));
    return decodeAAA(aaa, options);
}
function aaa2str(aaa, options = {}) {
    aaa = encodeAAA(aaa, options);
    if (options.pretty) aaa = aaa.map((aa) => prettifyAA(aa));
    return aaa.map((table) => table.map((row) => row.join(options.cell)).join(options.row)).join(options.table);
}
const mod = {
    str2aaa: str2aaa,
    aaa2str: aaa2str
};
function str2aaa1(string, options = {}) {
    return [
        lines(string).map((row) => row.split(options.delimiter ?? ';').map((cell) => trim(cell, options.quotes ?? '"')))
    ];
}
function aa2ad(aa) {
    let cols = aa[0];
    let ad = aa.slice(1).map((line) => Object.fromEntries(line.map((x, i) => [
        cols[i],
        x
    ])));
    return ad;
}
function parse(string, options = {}) {
    let aa = str2aaa1(string, options)[0];
    let ad = aa2ad(aa);
    return ad;
}
const mod1 = {
    str2aaa: str2aaa1,
    aa2ad: aa2ad,
    parse: parse
};
function str2aaa2(text, options) {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return html2aaa(doc, options);
}
function html2aaa(node, options) {
    let tables = [];
    for (let table of node.querySelectorAll('table')) {
        let aa = parseTable(table, options);
        tables.push(aa);
    }
    return tables;
}
function closest(node, search) {
    if (!node.parentNode) return null;
    if (search.split(',').includes(node.nodeName.toLowerCase())) return node;
    return closest(node.parentNode, search);
}
function parseTable(table, options) {
    let head = [];
    let body = [];
    let foot = [];
    let rowspans = {};
    let row;
    for (let tr of table.querySelectorAll('tr')) {
        [row, rowspans] = parseRow(tr, rowspans, options);
        if (closest(tr, 'thead')) head.push(row);
        else if (closest(tr, 'tfoot')) foot.push(row);
        else body.push(row);
    }
    return [
        ...head,
        ...body,
        ...foot
    ];
}
function parseRow(tr, rowspans = {}, options) {
    let row = [];
    let i = -1;
    for (let td of tr.querySelectorAll('th,td')) {
        i++;
        if (rowspans[i]) {
            row.push('||');
            rowspans[i]--;
        }
        const val = parseColumn(td, options);
        row.push(val);
        const colspan = td.getAttribute('colspan') * 1;
        for (let i = 0; i < colspan - 1; i++)row.push('==');
        const rowspan = td.getAttribute('rowspan') * 1;
        if (rowspan) rowspans[i] = rowspan - 1;
    }
    return [
        row,
        rowspans
    ];
}
function parseColumn(td, options) {
    let val = [
        ...td.childNodes
    ].filter((x) => x.nodeType == 3).map((x) => x.textContent).join('').trim();
    if (!val) val = td.innerText;
    let nsVal = val.replaceAll(/\s/g, '');
    if (options.region?.toLowerCase() == 'de') nsVal = nsVal.replaceAll('.', '').replace(',', '.');
    let intVal = nsVal * 1;
    if (!isNaN(intVal)) return intVal;
    return val;
}
function aaa2str1(aaa, options = {}) {
    aaa = encodeAAA(aaa, options);
    let out = '';
    for (let i in aaa) {
        let table = aaa[i];
        out += `<table>\n`;
        for (let j in table) {
            let row = table[j];
            out += `    <tr> `;
            for (let k in row) {
                let cell = row[k];
                let cellType = j == 0 || k == 0 ? 'th' : 'td';
                out += `<${cellType}> `;
                if (!(options.caption && j == 0 && k == 0)) out += cell;
                out += ` </${cellType}> `;
            }
            out += `<tr>\n`;
        }
        if (options.caption) out += `<caption>${table[0][0]}</caption>`;
        out += `</table>\n\n\n`;
    }
    return out;
}
const mod2 = {
    str2aaa: str2aaa2,
    html2aaa: html2aaa,
    aaa2str: aaa2str1
};
const addColumnNames = (aa, offset = 1) => aa.unshift(Array(aa[0].length).fill(1).map((x, i) => 'c' + (i * 1 + offset)));
const addRowNames = (aa, offset = 1) => aa.map((row, i) => row.unshift('r' + (i * 1 + offset)));
function aaa2ddd(aaa, options = {}) {
    let tables = {};
    for (let i in aaa) {
        let tableName = aaa[i][0][0];
        if (!tableName || options.addTableNames) tableName = 't' + (i * 1 + 1);
        tables[tableName] = aa2dd(aaa[i], options);
    }
    return tables;
}
function aa2dd(aa, options = {}) {
    if (options.addRowNames) addRowNames(aa);
    if (options.addColumnNames) addColumnNames(aa, options.addRowNames ? 0 : 1);
    let cols = aa[0];
    let dd = {};
    for (let row of aa.slice(1)) {
        dd[row[0]] = Object.fromEntries(row.map((x, i) => [
            cols[i],
            x
        ]).slice(1));
    }
    return dd;
}
function ddd2aaa(ddd, options = {}) {
    let aaa = [];
    for (let tableName in ddd) {
        let aa = dd2aa(ddd[tableName], options);
        aa[0][0] = tableName;
        aaa.push(aa);
    }
    return aaa;
}
function dd2aa(dd, options = {}) {
    let aa = [];
    let cols = [
        ...new Set(Object.values(dd).flatMap((row) => Object.keys(row)))
    ];
    if (options.sortCols) {
        if (options.sortStyle == 'numeric') {
            cols = cols.sort((a1, b) => a1 * 1 > b * 1 ? 1 : a1 * 1 < b * 1 ? -1 : 0);
        } else {
            cols = cols.sort();
        }
    }
    if (Array.isArray(options.sortCols)) cols = options.sortCols;
    for (let row in dd) {
        aa.push([
            row,
            ...cols.map((col) => dd[row][col])
        ]);
    }
    let sortCol = -1;
    if (options.sortRows) sortCol = 0;
    if (options.sortCol && cols.indexOf(options.sortCol) != -1) sortCol = cols.indexOf(options.sortCol) + 1;
    if (sortCol != -1) {
        if (options.sortStyle == 'numeric') {
            aa = aa.sort((a1, b) => a1[sortCol] * 1 > b[sortCol] * 1 ? 1 : a1[sortCol] * 1 < b[sortCol] * 1 ? -1 : 0);
        } else aa = aa.sort((a1, b) => a1[sortCol] > b[sortCol] ? 1 : a1[sortCol] < b[sortCol] ? -1 : 0);
    }
    aa.unshift([
        '',
        ...cols
    ]);
    if (options.flip) aa = flipAA(aa);
    return aa;
}
const __default = {
    table: '\n\n\n',
    row: '\n',
    cell: '\t',
    tab: ':T:',
    line: ':L:',
    parse: {
        '': null,
        'null': null,
        'undefined': null,
        'NaN': null,
        'Invalid Date': null
    },
    stringify: {
        null: '',
        undefined: '',
        NaN: '',
        'Invalid Date': ''
    }
};
const EXT = {
    tali: mod,
    csv: mod1,
    html: mod2
};
function parse1(str, options = {}) {
    mergeSettingsAndOptions(options);
    let f = options.format?.toLowerCase() ?? 'tali';
    let aaa = EXT[f].str2aaa(str, options);
    let ddd = aaa2ddd(aaa, options);
    return ddd;
}
function stringify(ddd, options = {}) {
    mergeSettingsAndOptions(options);
    let aaa = ddd2aaa(ddd, options);
    let f = options.format?.toLowerCase() ?? 'tali';
    let str = EXT[f].aaa2str(aaa, options);
    return str;
}
function mergeSettingsAndOptions(options) {
    options.parse = {
        ...__default.parse,
        ...options.parse
    };
    options.stringify = {
        ...__default.stringify,
        ...options.stringify
    };
    for (let key in __default) if (!(key in options)) options[key] = __default[key];
    return options;
}
const mod3 = {
    parse: parse1,
    stringify: stringify,
    mergeSettingsAndOptions: mergeSettingsAndOptions
};
function parse2(s) {
    let tsv = lines(s).map((line) => line.split('\t'));
    return Object.fromEntries(tsv.map((line) => [
        line[0],
        line[1]
    ]));
}
function stringify1(o) {
    return Object.entries(o).map((x) => x.join('\t')).join('\n');
}
const mod4 = {
    parse: parse2,
    stringify: stringify1
};
const TALI = {
    grid: mod3,
    tree: mod4,
    settings: __default
};
function date(string) {
    return new Date(Date.parse(string ?? new Date()));
}
function p0(s) {
    return String(s).padStart(2, '0');
}
function Y(d) {
    return date(d).getFullYear();
}
function M(d) {
    return p0(date(d).getMonth() + 1);
}
function D(d) {
    return p0(date(d).getDate());
}
function isoDate(date) {
    return Y(date) + '-' + M(date) + '-' + D(date);
}
function h(d) {
    return p0(date(d).getHours());
}
function m(d) {
    return p0(date(d).getMinutes());
}
function s(d) {
    return p0(date(d).getSeconds());
}
function isoTime(date) {
    return h(date) + ':' + m(date) + ':' + s(date);
}
function isoDateTime(date) {
    return isoDate(date) + 'T' + isoTime(date);
}
function format(d, format1, locale = 'lookup') {
    d = date(d);
    var str = (c) => d.toLocaleString(locale, c);
    var n = 'numeric';
    var _2 = '2-digit';
    var f = {
        DDDD: str({
            weekday: 'long'
        }),
        DDD: str({
            weekday: 'short'
        }),
        DD: str({
            day: _2
        }),
        '!D': str({
            day: n
        }),
        MMMM: str({
            month: 'long'
        }),
        MMM: str({
            month: 'short'
        }),
        MM: str({
            month: _2
        }),
        '!M': str({
            month: n
        }),
        YYYY: str({
            year: n
        }),
        YY: str({
            year: _2
        }),
        hh: str({
            hour: _2,
            hour12: false
        }),
        '!h': str({
            hour: n,
            hour12: false
        }),
        mm: str({
            minute: _2
        }),
        '!m': str({
            minute: n
        }),
        ss: str({
            second: _2
        }),
        '!s': str({
            second: n
        })
    };
    if (f.mm < 10) f.mm = '0' + f.mm;
    if (f.ss < 10) f.ss = '0' + f.ss;
    for (var typ in f) {
        var format1 = format1.replace(typ, f[typ]);
    }
    return format1;
}
function humanDuration(d) {
    if (Math.abs(d) > 86400) return Math.round(d / 86400) + ' d';
    if (Math.abs(d) > 3600) return Math.round(d / 3600) + ' h';
    if (Math.abs(d) > 60) return Math.round(d / 60) + ' m';
    return d + ' s';
}
function parseGermanDate(s) {
    if (s?.length != 10) return null;
    let parts = s?.split('.');
    if (parts.length != 3) return null;
    let [dd, mm, yy] = parts;
    return `${yy}-${mm}-${dd}`;
}
function parseDate(s) {
    if (!s) return null;
    return parseGermanDate(s) ?? isoDate(s);
}
function unique(array, property) {
    if (property) return Object.values(Object.fromEntries(array.map((x) => [
        x[property],
        x
    ])));
    else return [
        ...new Set(array)
    ];
}
function cluster(lists) {
    Date.now();
    lists.length;
    let out = [];
    while (lists.length > 0) {
        let [first, ...rest] = lists;
        first = new Set(first);
        let lf = -1;
        while (first.size > lf) {
            lf = first.size;
            let rest2 = [];
            for (let r of rest) {
                if (intersection([
                    ...first
                ], r).length > 0) first = new Set([
                    ...first,
                    ...r
                ]);
                else rest2 = [
                    ...rest2,
                    r
                ];
            }
            rest = rest2;
        }
        out.push([
            ...first
        ]);
        lists = rest;
    }
    return out;
}
function intersection(...arrays) {
    if (arrays.length == 0) return [];
    let sets = arrays.filter((x) => x).map((x) => new Set(x));
    let output = sets[0];
    for (let item of output) {
        for (let s of sets?.slice(1)) if (!s.has(item)) output.delete(item);
    }
    return [
        ...output
    ];
}
function difference(a1, b) {
    a1 = new Set(a1);
    b = new Set(b);
    let difference = new Set([
        ...a1
    ].filter((x) => !b.has(x)));
    return [
        ...difference
    ];
}
const compare = (a1, b) => a1 > b ? 1 : a1 < b ? -1 : 0;
const sortBy = (a1, prop) => a1.sort((a1, b) => compare(prop(a1), prop(b)));
function pretty(number, options = {}) {
    options = {
        separator: '_',
        decimals: 0,
        padding: 0,
        ...options
    };
    let [a1, b] = Number(number).toFixed(options.decimals).split('.');
    let x = String(a1).split('').reverse().join('').match(/.{1,3}/g).join('_').split('').reverse().join('').replaceAll('_', options.separator);
    return (x + (b ? '.' + b : '')).padStart(options.padding);
}
function prettyNumber(number, options) {
    options = {
        separator: '&thinsp;',
        ...options
    };
    return pretty(number, options);
}
const sum = (x) => x.reduce((a1, b) => a1 + b, 0);
const average = (x) => sum(x) / x.length || 0;
function median(valueList) {
    let values = [
        ...valueList
    ].sort((a1, b) => a1 - b);
    const half = Math.floor(values.length / 2);
    return values.length % 2 ? values[half] : (values[half - 1] + values[half]) / 2;
}
function variance(listOfNumbers) {
    let mean = average(listOfNumbers);
    let distanceFromMean = listOfNumbers.map((x) => x - mean);
    let squaredDistanceFromMean = distanceFromMean.map((x) => x ** 2);
    let summedSquares = sum(squaredDistanceFromMean);
    return summedSquares / listOfNumbers.length;
}
function standardDeviation(listOfNumbers) {
    return Math.sqrt(variance(listOfNumbers));
}
function MAD(listOfNumbers) {
    let med = median(listOfNumbers);
    let distanceFromMedian = listOfNumbers.map((x) => Math.abs(x - med));
    return median(distanceFromMedian);
}
function keep(object, ...keys) {
    return Object.fromEntries(Object.entries(object).filter(([key]) => keys.includes(key)));
}
const filter = (o, f) => Object.fromEntries(Object.entries(o).filter(([k, v]) => f(k, v)));
const map = (o, f) => Object.fromEntries(Object.entries(o).map(([k, v]) => f(k, v)));
const mapValues = (o, f) => map(o, (k, v) => [
    k,
    f(v)
]);
const compare1 = (a1, b) => a1 > b ? 1 : a1 < b ? -1 : 0;
const sortByKey = (o) => Object.fromEntries(Object.entries(o).sort((a1, b) => compare1(a1[0], b[0])));
let $ = (x) => document.querySelector(x);
let $$ = (x) => [
    ...document.querySelectorAll(x)
];
function download(filename, data, type = 'text/tab-separated-values') {
    let blob = new Blob([
        data
    ], {
        type
    });
    const url = URL.createObjectURL(blob);
    const a1 = document.createElement('a');
    a1.href = url;
    a1.download = filename || 'download';
    a1.click();
    a1.remove();
    return a1;
}
const SYMBOL = {
    script: '!',
    parameters: '!!',
    injection: /\!(css|js|json|)\>(.*)/
};
const TYPES = {
    json: 'script',
    js: 'script',
    mjs: 'script',
    css: 'style'
};
function template(template1, x = {}) {
    let l = lines(template1);
    let p = parameters(l);
    let b = body(l, x.injections).join('\n');
    try {
        return new Function(p, b);
    } catch {
        console.error("ERROR:", b);
    }
    return Function();
}
function parameters(lines) {
    return lines.map((x) => x.trim()).filter((x) => x.startsWith(SYMBOL.parameters))[0]?.slice(SYMBOL.parameters.length)?.trim();
}
function body(lines, injections) {
    let tpl = [];
    tpl.push('let html = []');
    for (let line of lines) {
        if (line.trim().startsWith(SYMBOL.parameters)) continue;
        let injection = line.trim().match(SYMBOL.injection);
        if (injection) {
            let [x, type, key] = injection;
            let inj = injections[key.trim()] ?? '';
            console.log('xxx', type, ':' + key.trim() + ':', inj);
            if (inj && type == 'json') inj = 'const ' + an(key) + ' = ' + inj;
            let text = type ? `<${TYPES[type]} ${type == 'mjs' ? `type='module'` : ''}>\n${inj}\n</${TYPES[type]}>` : inj;
            tpl.push('html.push(`' + text + '`)');
        } else if (line.trim().startsWith(SYMBOL.script)) {
            tpl.push(line.replace(SYMBOL.script, '').trim());
        } else {
            tpl.push('html.push(`' + line + '`)');
        }
    }
    tpl.push(`return html.join('\\n')`);
    return tpl;
}
const an = (s) => s.replaceAll(/[^a-z0-9]/gi, '_');
function importable(func, fname) {
    let fdec = 'export default function';
    if (fname) fdec = 'export function ' + an(fname);
    return func.toString().replace('function anonymous', fdec);
}
function deferred() {
    let methods;
    let state = "pending";
    const promise = new Promise((resolve, reject) => {
        methods = {
            async resolve(value) {
                await value;
                state = "fulfilled";
                resolve(value);
            },
            reject(reason) {
                state = "rejected";
                reject(reason);
            }
        };
    });
    Object.defineProperty(promise, "state", {
        get: () => state
    });
    return Object.assign(promise, methods);
}
function delay(ms, options = {}) {
    const { signal } = options;
    if (signal?.aborted) {
        return Promise.reject(new DOMException("Delay was aborted.", "AbortError"));
    }
    return new Promise((resolve, reject) => {
        const abort = () => {
            clearTimeout(i);
            reject(new DOMException("Delay was aborted.", "AbortError"));
        };
        const done = () => {
            signal?.removeEventListener("abort", abort);
            resolve();
        };
        const i = setTimeout(done, ms);
        signal?.addEventListener("abort", abort, {
            once: true
        });
    });
}
class MuxAsyncIterator {
    iteratorCount = 0;
    yields = [];
    throws = [];
    signal = deferred();
    add(iterable) {
        ++this.iteratorCount;
        this.callIteratorNext(iterable[Symbol.asyncIterator]());
    }
    async callIteratorNext(iterator) {
        try {
            const { value, done } = await iterator.next();
            if (done) {
                --this.iteratorCount;
            } else {
                this.yields.push({
                    iterator,
                    value
                });
            }
        } catch (e) {
            this.throws.push(e);
        }
        this.signal.resolve();
    }
    async *iterate() {
        while (this.iteratorCount > 0) {
            await this.signal;
            for (let i = 0; i < this.yields.length; i++) {
                const { iterator, value } = this.yields[i];
                yield value;
                this.callIteratorNext(iterator);
            }
            if (this.throws.length) {
                for (const e of this.throws) {
                    throw e;
                }
                this.throws.length = 0;
            }
            this.yields.length = 0;
            this.signal = deferred();
        }
    }
    [Symbol.asyncIterator]() {
        return this.iterate();
    }
}
const ERROR_SERVER_CLOSED = "Server closed";
const INITIAL_ACCEPT_BACKOFF_DELAY = 5;
const MAX_ACCEPT_BACKOFF_DELAY = 1000;
class Server {
    #port;
    #host;
    #handler;
    #closed = false;
    #listeners = new Set();
    #httpConnections = new Set();
    #onError;
    constructor(serverInit) {
        this.#port = serverInit.port;
        this.#host = serverInit.hostname;
        this.#handler = serverInit.handler;
        this.#onError = serverInit.onError ?? function (error) {
            console.error(error);
            return new Response("Internal Server Error", {
                status: 500
            });
        };
    }
    async serve(listener) {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        this.#trackListener(listener);
        try {
            return await this.#accept(listener);
        } finally {
            this.#untrackListener(listener);
            try {
                listener.close();
            } catch { }
        }
    }
    async listenAndServe() {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        const listener = Deno.listen({
            port: this.#port ?? 80,
            hostname: this.#host ?? "0.0.0.0",
            transport: "tcp"
        });
        return await this.serve(listener);
    }
    async listenAndServeTls(certFile, keyFile) {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        const listener = Deno.listenTls({
            port: this.#port ?? 443,
            hostname: this.#host ?? "0.0.0.0",
            certFile,
            keyFile,
            transport: "tcp"
        });
        return await this.serve(listener);
    }
    close() {
        if (this.#closed) {
            throw new Deno.errors.Http(ERROR_SERVER_CLOSED);
        }
        this.#closed = true;
        for (const listener of this.#listeners) {
            try {
                listener.close();
            } catch { }
        }
        this.#listeners.clear();
        for (const httpConn of this.#httpConnections) {
            this.#closeHttpConn(httpConn);
        }
        this.#httpConnections.clear();
    }
    get closed() {
        return this.#closed;
    }
    get addrs() {
        return Array.from(this.#listeners).map((listener) => listener.addr);
    }
    async #respond(requestEvent, httpConn, connInfo) {
        let response;
        try {
            response = await this.#handler(requestEvent.request, connInfo);
        } catch (error) {
            response = await this.#onError(error);
        }
        try {
            await requestEvent.respondWith(response);
        } catch {
            return this.#closeHttpConn(httpConn);
        }
    }
    async #serveHttp(httpConn, connInfo) {
        while (!this.#closed) {
            let requestEvent;
            try {
                requestEvent = await httpConn.nextRequest();
            } catch {
                break;
            }
            if (requestEvent === null) {
                break;
            }
            this.#respond(requestEvent, httpConn, connInfo);
        }
        this.#closeHttpConn(httpConn);
    }
    async #accept(listener) {
        let acceptBackoffDelay;
        while (!this.#closed) {
            let conn;
            try {
                conn = await listener.accept();
            } catch (error) {
                if (error instanceof Deno.errors.BadResource || error instanceof Deno.errors.InvalidData || error instanceof Deno.errors.UnexpectedEof || error instanceof Deno.errors.ConnectionReset || error instanceof Deno.errors.NotConnected) {
                    if (!acceptBackoffDelay) {
                        acceptBackoffDelay = INITIAL_ACCEPT_BACKOFF_DELAY;
                    } else {
                        acceptBackoffDelay *= 2;
                    }
                    if (acceptBackoffDelay >= 1000) {
                        acceptBackoffDelay = MAX_ACCEPT_BACKOFF_DELAY;
                    }
                    await delay(acceptBackoffDelay);
                    continue;
                }
                throw error;
            }
            acceptBackoffDelay = undefined;
            let httpConn;
            try {
                httpConn = Deno.serveHttp(conn);
            } catch {
                continue;
            }
            this.#trackHttpConnection(httpConn);
            const connInfo = {
                localAddr: conn.localAddr,
                remoteAddr: conn.remoteAddr
            };
            this.#serveHttp(httpConn, connInfo);
        }
    }
    #closeHttpConn(httpConn) {
        this.#untrackHttpConnection(httpConn);
        try {
            httpConn.close();
        } catch { }
    }
    #trackListener(listener) {
        this.#listeners.add(listener);
    }
    #untrackListener(listener) {
        this.#listeners.delete(listener);
    }
    #trackHttpConnection(httpConn) {
        this.#httpConnections.add(httpConn);
    }
    #untrackHttpConnection(httpConn) {
        this.#httpConnections.delete(httpConn);
    }
}
async function serve(handler, options = {}) {
    const server = new Server({
        port: options.port ?? 8000,
        hostname: options.hostname ?? "0.0.0.0",
        handler,
        onError: options.onError
    });
    if (options?.signal) {
        options.signal.onabort = () => server.close();
    }
    return await server.listenAndServe();
}
class Routes {
    ROUTES = {};
    add(p = {}) {
        this.ROUTES = {
            ...this.ROUTES,
            ...p
        };
    }
    find(request) {
        let url = request.url;
        for (let route in this.ROUTES) {
            let pattern = new URLPattern({
                pathname: route
            });
            if (pattern.test(url)) return {
                function: this.ROUTES[route],
                path: pattern.exec(url).pathname.groups,
                route
            };
        }
    }
}
const importMeta = {
    url: "file:///Volumes/code/GitHub/js-max-pub/pager/src/crypto.js",
    main: false
};
const bytesToBase64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const lineLimit = (string, limit = 80) => string.match(new RegExp(`.{1,${limit}}`, 'g')).join('\n');
async function SHA(string, n = 512) {
    let input = new TextEncoder().encode(string);
    let hash = await crypto.subtle.digest(`SHA-${n}`, input);
    let hex = bytesToBase64(hash);
    return hex;
}
const cryptoKeyToBase64 = async (key, encoding) => bytesToBase64(await window.crypto.subtle.exportKey(encoding, key));
async function getCryptoKeys() {
    const keys = await window.crypto.subtle.generateKey({
        name: 'RSASSA-PKCS1-v1_5',
        modulusLength: 2048,
        publicExponent: new Uint8Array([
            0x01,
            0x00,
            0x01
        ]),
        hash: {
            name: 'SHA-256'
        }
    }, true, [
        'sign',
        'verify'
    ]);
    let publicKey = await cryptoKeyToBase64(keys.publicKey, 'spki');
    let privateKey = await cryptoKeyToBase64(keys.privateKey, 'pkcs8');
    return {
        public: `-----BEGIN CERTIFICATE-----\n${lineLimit(publicKey, 64)}\n-----END CERTIFICATE-----`,
        private: `-----BEGIN PRIVATE KEY-----\n${lineLimit(privateKey, 64)}\n-----END PRIVATE KEY-----`
    };
}
if (importMeta.main) {
    let keys = await getCryptoKeys();
    console.log(keys);
    Deno.writeTextFileSync('public.pem', keys.public);
    Deno.writeTextFileSync('private.pem', keys.private);
}
const mod5 = await async function () {
    return {
        SHA: SHA
    };
}();
class Users {
    USERS = {};
    add(p = {}) {
        this.USERS = {
            ...this.USERS,
            ...p
        };
    }
    async find(request) {
        let auth = request.headers.get('Authorization');
        if (!auth?.toLowerCase()?.startsWith('basic ')) return;
        auth = auth.slice(6);
        let [user, pass] = atob(auth).split(':');
        if (this.USERS[user] == pass) return user;
        if (this.USERS[user] == await SHA(pass)) return user;
    }
}
const std = (content, status, headers = {}) => new Response(content, {
    status,
    headers
});
const ct = (type) => ({
    "content-type": `${type}; charset=utf-8`
});
const redirect = (url) => std('', 307, {
    Location: url
});
const logout = (html) => std(html, 401, ct('text/html'));
const unauthorized = (html) => std(html, 401, {
    ...ct('text/html'),
    "WWW-Authenticate": "Basic"
});
const notFound = (html) => std(html, 404, ct('text/html'));
const OK = (content, type) => std(content, 200, {
    ...ct(type)
});
const html = (p) => OK(p, 'text/html');
const json = (p) => OK(p, 'application/json');
const text = (p) => OK(p, 'text/plain');
const user = ({ USER }) => OK(USER, 'text/plain');
const mod6 = {
    std: std,
    ct: ct,
    redirect: redirect,
    logout: logout,
    unauthorized: unauthorized,
    notFound: notFound,
    OK: OK,
    html: html,
    json: json,
    text: text,
    user: user
};
class Log {
    static ERROR = 1;
    static WARNING = 2;
    static INFO = 3;
    static DEBUG = 4;
    static level = Log.DEBUG;
    static callback = null;
    constructor(p = '') {
        this.prefix = p;
    }
    text(type, ...p) {
        if (Log.level < Log[type]) return;
        let dur = Date.now() - p.slice(-1)[0];
        if (dur < 1_000_000) p = p.slice(0, -1);
        let func = getStackTrace().filter((x) => !x.startsWith('file:'))[0]?.replace('Module.', '')?.replace('Object.', '')?.replace('[as function]', '')?.trim();
        let v = standardLog(this.prefix, func, dur, ...p);
        Log.callback?.(v.filter((x) => !x?.startsWith?.('#')).join(' '));
    }
    debug(...p) {
        this.text('DEBUG', '#999', ...p);
    }
    info(...p) {
        this.text('INFO', '#fff', ...p);
    }
    warning(...p) {
        this.text('WARNING', '#fa0', '⚠', ...p);
    }
    error(...p) {
        this.text('ERROR', '#f00', '✖', ...p);
    }
}
const wrap = (a1, x, b) => x ? a1 + x + b : '';
function standardLog(prefix, caller, duration, ...p) {
    let time = new Date().toISOString().slice(11, 19);
    return colorLog('#999', time, '#bbb', wrap('[', prefix, ']'), '#999', wrap('{', caller, '}'), ...p, '#999', wrap('(in ', duration, 'ms)'));
}
function colorLog(...p) {
    let text = p.map((x) => x?.startsWith?.('#') ? '%c' : x).join(' ').replaceAll('%c ', '%c');
    let color = p.filter((x) => x?.startsWith?.('#')).map((x) => `color:${x}`);
    console.log(text, ...color);
    return p;
}
function getStackTrace() {
    try {
        a.b = 1;
    } catch (e) {
        var st = e.stack;
    }
    st = st.split('\n').map((x) => x.slice(7).split('(')[0].trim()).slice(4);
    return st;
}
let log = new Log('pager');
class Pager {
    routes = new Routes();
    users = new Users();
    constructor({ port = 8000 } = {}) {
        log.info(`starting pager on port ${port}`);
        serve((x) => this.request(x), {
            port
        });
    }
    async request(request) {
        let route = this.routes.find(request);
        if (!route) return notFound();
        let USER = await this.users.find(request);
        let queryString = Object.fromEntries(new URLSearchParams(new URL(request.url).search));
        let HEAD = Object.fromEntries(request.headers);
        let FORM;
        if (HEAD['content-type'] == 'application/x-www-form-urlencoded') {
            FORM = await request.formData();
            FORM = Object.fromEntries(FORM);
        }
        log.info(request.url, '->', route.route, '->', `${route.function.name}(@${USER}, ${JSON.stringify(route.path)}, ${JSON.stringify(queryString)})`);
        return await route.function({
            ...route.path,
            ...queryString,
            USER,
            HEAD,
            FORM,
            request
        });
    }
}
export { Pager as Pager };
const redirect1 = (url, time = 0) => `<meta http-equiv="refresh" content="${time}; URL=${url}">`;
const charset = (x = 'utf-8') => `<meta charset="${x}"/>`;
const viewport = (x) => `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">`;
const message = (x) => `<h1 style="text-align: center; margin-top:7em; font-family: sans-serif; font-size:50px;">${x}</h1>`;
const mod7 = {
    redirect: redirect1,
    charset: charset,
    viewport: viewport,
    message: message
};
export { mod5 as crypto };
export { mod6 as response };
export { mod7 as html };
let IDs = {};
let MAP = {};
function randomIntBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
let BASE = {
    num: "0123456789",
    lc: "abcdefghijklmnopqrstuvwxyz",
    uc: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
};
function generateID(base, length) {
    return Array(length).fill(0).map((x) => base[randomIntBetween(0, base.length - 1)]).join('');
}
function generateUniqueID(options = {}) {
    options = {
        length: 5,
        num: true,
        lowerCase: false,
        upperCase: false,
        prefix: '',
        bucket: 'default',
        ...options
    };
    let base = '';
    if (options.num) base += BASE.num;
    if (options.lowerCase) base += BASE.lc;
    if (options.upperCase) base += BASE.uc;
    IDs[options.bucket] ??= [];
    while (1) {
        let newID = options.prefix + generateID(base, options.length);
        if (!IDs[options.bucket].includes(newID)) {
            IDs[options.bucket].push(newID);
            return newID;
        }
    }
}
function pseudonymize(value, options = {}) {
    if (!value) return '';
    MAP[options.bucket] ??= {};
    if (!MAP[options.bucket][value]) MAP[options.bucket][value] = {
        replacement: generateUniqueID(options),
        count: 0
    };
    MAP[options.bucket][value].count++;
    return MAP[options.bucket][value].replacement;
}
class Thread {
    static post = new Proxy({}, {
        get(x, method) {
            // console.log('create thread post for method:', method);
            return (...p) => {
                // if(method!='updateProgress') console.log('thread post message:', method, p);
                postMessage([
                    method,
                    ...p
                ]);
            };
        }
    });
    constructor(url, base) {
        this.worker = createInlineWorker();
        this.url = new URL(url, base).toString();
        this.worker.onmessage = (event) => {
            let x = this?._responder?.[event.data?.[0]]?.bind?.(this?._responder);
            // console.log('onmessage',event,x)
            if (x) x(...event.data.slice(1));
            else this?.onMessage?.(event.data, event);
        };
    }
    async init(x = {}) {
        let MOD = await import(this.url);
        // console.log("MOD", MOD);
        for (let method in MOD) this[method] = async (...p) => await this.post(method, ...p);
        // for (let method in MOD) console.log(method, this[method])
        this._responder = x.responder;
        return this;
    }
    post(...p) {
        const channel = new MessageChannel();
        this.worker.postMessage([
            this.url,
            ...p
        ], [
            channel.port1
        ]);
        return new Promise((resolve) => channel.port2.onmessage = (event) => resolve(event.data[1]));
    }
    terminate() {
        this.worker.terminate();
    }
}
const blob = new Blob([
    'self.onmessage = ',
    onMessage.toString()
], {
    type: 'text/javascript'
});
const blobURL = URL.createObjectURL(blob);
function createInlineWorker() {
    return new Worker(blobURL, {
        type: 'module'
    });
}
async function onMessage(event) {
    let MOD = await import(event.data[0]);
    let result = await MOD[event.data[1]](...event.data.slice(2));
    event.ports[0].postMessage([
        event.data[0],
        result
    ]);
}
export { TALI as TALI };
export { parseDate as parseDate, isoDate as isoDate, isoDateTime as isoDateTime, format as dateFormat, humanDuration as humanDuration, date as date };
export { intersection as intersection, difference as difference, sortBy as sortBy, cluster as cluster, unique as unique };
export { sum as sum, average as average, median as median, pretty as pretty, prettyNumber as prettyNumber, standardDeviation as standardDeviation, MAD as MAD };
export { keep as keep, mapValues as mapValues, filter as dictFilter, sortByKey as sortByKey };
export { $ as $, $$ as $$, download as download };
export { template as template, importable as importable };
export { pseudonymize as pseudonymize, MAP as pseudoMAP };
export { Thread as Thread };

