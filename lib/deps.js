// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const __default = {
    separator: {
        table: '\n\n\n',
        row: '\n',
        cell: '\t',
        list: '|'
    },
    tab: ':T:',
    line: ':L:',
    none: '',
    remove: [
        '',
        'null',
        'undefined',
        'NaN'
    ]
};
function trim(string = '', characters = ' ') {
    let c = '\\' + characters.split('').join('\\');
    return (string + '').replace(new RegExp(`^[${c}]+|[${c}]+$`, 'g'), '');
}
function blocks(string = "") {
    return string?.split('\r\n\r\n')?.flatMap((x)=>x.split('\r\r'))?.flatMap((x)=>x.split('\n\n')) ?? [];
}
function lines(string = "") {
    return string?.split('\r\n')?.flatMap((x)=>x.split('\r'))?.flatMap((x)=>x.split('\n')) ?? [];
}
function flipAA(aa) {
    let out = [];
    for(let i in aa){
        for(let j in aa[i]){
            out[j] ??= [];
            out[j][i] = aa[i][j];
        }
    }
    return out;
}
function prettifyAA(aa, options = {}) {
    let maxColumnLengths = flipAA(aa.map((row)=>row.map((col)=>String(col ?? '').length))).map((col)=>Math.max(...col));
    if (options.pretty > 1) maxColumnLengths = maxColumnLengths.map((x)=>Math.ceil(x / options.pretty) * options.pretty);
    return aa.map((row)=>row.map((col, j)=>pad(col, maxColumnLengths[j])));
}
function pad(str, len) {
    if (str * 1 == str) return String(str ?? '')?.padStart(len, ' ') ?? '';
    return String(str ?? '')?.padEnd?.(len, ' ') ?? '';
}
function str2aaa(string, options = {}) {
    let aaa = blocks(string).map((table)=>lines(table).filter((row)=>row.trim()).map((row)=>row.split('\t')));
    return decodeAAA(aaa, options);
}
function aaa2str(aaa, options = {}) {
    if (options.pretty) aaa = aaa.map((aa)=>prettifyAA(aa));
    aaa = encodeAAA(aaa, options);
    return aaa.map((table)=>table.map((row)=>row.join(__default.separator.cell)).join(__default.separator.row)).join(__default.separator.table);
}
function encodeAAA(aaa, options = {}) {
    let none = options.none ?? __default.none;
    let remove = [
        ...options.remove ?? [],
        ...__default.remove ?? []
    ];
    return aaa.map((table)=>table.map((row)=>row.map((cell)=>remove?.includes(cell) ? undefined : cell).map((cell)=>cell === undefined ? none : cell).map((cell)=>String(cell).replaceAll('\t', options.tab ?? __default.tab).replaceAll('\n', options.line ?? __default.line))));
}
function decodeAAA(aaa, options = {}) {
    let none = options.none ?? __default.none;
    let remove = [
        ...options.remove ?? [],
        ...__default.remove ?? []
    ];
    return aaa.map((table)=>table.map((row)=>row.map((cell)=>cell == none ? undefined : cell).map((cell)=>remove.includes(cell) ? undefined : cell)));
}
function str2aaa1(string, options = {}) {
    return [
        lines(string).map((row)=>row.split(options.delimiter ?? ';').map((cell)=>trim(cell, options.quotes ?? '"')))
    ];
}
function str2aaa2(text, options) {
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return html2aaa(doc, options);
}
function html2aaa(node, options) {
    let tables = [];
    for (let table of node.querySelectorAll('table')){
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
    for (let tr of table.querySelectorAll('tr')){
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
    for (let td of tr.querySelectorAll('th,td')){
        i++;
        if (rowspans[i]) {
            row.push('||');
            rowspans[i]--;
        }
        const val = parseColumn(td, options);
        row.push(val);
        const colspan = td.getAttribute('colspan') * 1;
        for(let i = 0; i < colspan - 1; i++)row.push('==');
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
    ].filter((x)=>x.nodeType == 3).map((x)=>x.textContent).join('').trim();
    if (!val) val = td.innerText;
    let nsVal = val.replaceAll(/\s/g, '');
    if (options.region?.toLowerCase() == 'de') nsVal = nsVal.replaceAll('.', '').replace(',', '.');
    let intVal = nsVal * 1;
    if (!isNaN(intVal)) return intVal;
    return val;
}
const addColumnNames = (aa, offset = 1)=>aa.unshift(Array(aa[0].length).fill(1).map((x, i)=>'c' + (i * 1 + offset)));
const addRowNames = (aa, offset = 1)=>aa.map((row, i)=>row.unshift('r' + (i * 1 + offset)));
function aaa2ddd(aaa, options = {}) {
    let tables = {};
    for(let i in aaa){
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
    for (let row of aa.slice(1)){
        dd[row[0]] = Object.fromEntries(row.map((x, i)=>[
                cols[i],
                x
            ]).slice(1));
    }
    return dd;
}
function ddd2aaa(ddd, options = {}) {
    let aaa = [];
    for(let tableName in ddd){
        let aa = dd2aa(ddd[tableName], options);
        aa[0][0] = tableName;
        aaa.push(aa);
    }
    return aaa;
}
function dd2aa(dd, options = {}) {
    let aa = [];
    let cols = [
        ...new Set(Object.keys(dd).flatMap((row)=>Object.keys(dd[row])))
    ];
    if (options.sortCols) cols = cols.sort();
    if (Array.isArray(options.sortCols)) cols = options.sortCols;
    for(let row in dd){
        aa.push([
            row,
            ...cols.map((col)=>dd[row][col])
        ]);
    }
    let sortCol = -1;
    if (options.sortRows) sortCol = 0;
    if (options.sortCol && cols.indexOf(options.sortCol) != -1) sortCol = cols.indexOf(options.sortCol) + 1;
    if (sortCol != -1) {
        aa = aa.sort((a, b)=>a[sortCol] > b[sortCol] ? 1 : a[sortCol] < b[sortCol] ? -1 : 0);
    }
    aa.unshift([
        '',
        ...cols
    ]);
    if (options.flip) aa = flipAA(aa);
    return aa;
}
function str2aaa3(str, src, opt) {
    switch(src?.toLowerCase?.()){
        case 'csv':
            return str2aaa1(str, opt);
        case 'html':
            return str2aaa2(str, opt);
        default:
            return str2aaa(str, opt);
    }
}
function parse(str, options = {}) {
    let aaa = str2aaa3(str, options.source, options);
    if (options.target?.toLowerCase?.() == 'aaa') return aaa;
    let ddd = aaa2ddd(aaa, options);
    return ddd;
}
function aaa2str1(aaa, tgt, opt) {
    switch(tgt?.toLowerCase?.()){
        default:
            return aaa2str(aaa, opt);
    }
}
function stringify(ddd, options = {}) {
    let aaa = ddd2aaa(ddd, options);
    let str = aaa2str1(aaa, options.target, options);
    return str;
}
const mod = {
    parse: parse,
    stringify: stringify
};
function parse1(s) {
    let tsv = lines(s).map((line)=>line.split('\t'));
    return Object.fromEntries(tsv.map((line)=>[
            line[0],
            line[1]
        ]));
}
function stringify1(o) {
    return Object.entries(o).map((x)=>x.join('\t')).join('\n');
}
const mod1 = {
    parse: parse1,
    stringify: stringify1
};
const TALI = {
    grid: mod,
    tree: mod1,
    settings: __default
};
function unique(array, property) {
    if (property) return Object.values(Object.fromEntries(array.map((x)=>[
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
    while(lists.length > 0){
        let [first, ...rest] = lists;
        first = new Set(first);
        let lf = -1;
        while(first.size > lf){
            lf = first.size;
            let rest2 = [];
            for (let r of rest){
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
    let sets = arrays.filter((x)=>x).map((x)=>new Set(x));
    let output = sets[0];
    for (let item of output){
        for (let s of sets?.slice(1))if (!s.has(item)) output.delete(item);
    }
    return [
        ...output
    ];
}
function difference(a, b) {
    a = new Set(a);
    b = new Set(b);
    let difference = new Set([
        ...a
    ].filter((x)=>!b.has(x)));
    return [
        ...difference
    ];
}
const compare = (a, b)=>a > b ? 1 : a < b ? -1 : 0;
const sortBy = (a, prop)=>a.sort((a, b)=>compare(prop(a), prop(b)));
function select(object, ...keys) {
    return Object.fromEntries(Object.entries(object).filter(([key])=>keys.includes(key)));
}
const map = (o, f)=>Object.fromEntries(Object.entries(o).map(([k, v])=>f(k, v)));
const mapValues = (o, f)=>map(o, (k, v)=>[
            k,
            f(v)
        ]);
const sum = (x)=>x.reduce((a, b)=>a + b, 0);
export { TALI as TALI };
export { intersection as intersection, difference as difference, sortBy as sortBy, cluster as cluster, unique as unique };
export { select as select, mapValues as mapValues };
export { sum as sum };

