// ../../../../GitHub/js-max-pub/std/number.js
function pretty(number, options = {}) {
  options = { separator: "_", decimals: 0, padding: 0, ...options };
  let [a, b] = Number(number).toFixed(options.decimals).split(".");
  let x = String(a).split("").reverse().join("").match(/.{1,3}/g).join("_").split("").reverse().join("").replaceAll("_", options.separator);
  return (x + (b ? "." + b : "")).padStart(options.padding);
}
function prettyNumber(number, options) {
  options = { separator: "&thinsp;", ...options };
  return pretty(number, options);
}
var sum = (x) => x.reduce((a, b) => a + b, 0);
var arithmeticMean = (x) => sum(x) / x.length || 0;
function median(valueList) {
  let values = [...valueList].sort((a, b) => a - b);
  const half = Math.floor(values.length / 2);
  return values.length % 2 ? values[half] : (values[half - 1] + values[half]) / 2;
}
function variance(listOfNumbers) {
  let mean = arithmeticMean(listOfNumbers);
  let distanceFromMean = listOfNumbers.map((x) => x - mean);
  let squaredDistanceFromMean = distanceFromMean.map((x) => x ** 2);
  let summedSquares = sum(squaredDistanceFromMean);
  return summedSquares / listOfNumbers.length;
}
function standardDeviation(listOfNumbers) {
  return Math.sqrt(variance(listOfNumbers));
}
function medianAbsoluteDeviation(listOfNumbers) {
  let med = median(listOfNumbers);
  let distanceFromMedian = listOfNumbers.map((x) => Math.abs(x - med));
  return median(distanceFromMedian);
}

// ../../../../GitHub/js-max-pub/std/dom.js
var $ = (x) => document.querySelector(x);
var $$ = (x) => [...document.querySelectorAll(x)];
function download(filename, data, type = "text/tab-separated-values") {
  let blob2 = new Blob([data], { type });
  const url = URL.createObjectURL(blob2);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "download";
  a.click();
  a.remove();
  return a;
}

// ../../../../GitHub/js-max-pub/std/object.js
function keep(object, ...keys) {
  return Object.fromEntries(
    Object.entries(object).filter(([key]) => keys.includes(key))
  );
}

// ../../../../GitHub/js-max-pub/std/array.js
function unique(array, property) {
  if (property)
    return Object.values(Object.fromEntries(array.map((x) => [x[property], x])));
  else
    return [...new Set(array)];
}

// ../../../../GitHub/js-max-pub/thread.js/mod.js
var Thread = class {
  static post = new Proxy({}, {
    get(x, method) {
      return (...p) => {
        postMessage([method, ...p]);
      };
    }
  });
  constructor(url, base) {
    this.worker = createInlineWorker();
    this.url = new URL(url, base).toString();
    this.worker.onmessage = (event) => {
      let x = this?._responder?.[event.data?.[0]]?.bind?.(this?._responder);
      if (x) x(...event.data.slice(1));
      else this?.onMessage?.(event.data, event);
    };
  }
  async init(x = {}) {
    let MOD = await import(this.url);
    for (let method in MOD)
      this[method] = async (...p) => await this.post(method, ...p);
    this._responder = x.responder;
    return this;
  }
  // responder(x) {
  // 	this._responder = x
  // 	return this
  // }
  post(...p) {
    const channel = new MessageChannel();
    this.worker.postMessage([this.url, ...p], [channel.port1]);
    return new Promise((resolve) => channel.port2.onmessage = (event) => resolve(event.data[1]));
  }
  terminate() {
    this.worker.terminate();
  }
};
var blob = new Blob(["self.onmessage = ", onMessage.toString()], { type: "text/javascript" });
var blobURL = URL.createObjectURL(blob);
function createInlineWorker() {
  return new Worker(blobURL, { type: "module" });
}
async function onMessage(event) {
  let MOD = await import(event.data[0]);
  let result = await MOD[event.data[1]](...event.data.slice(2));
  event.ports[0].postMessage([event.data[0], result]);
}

// ../../../../GitHub/js-max-pub/idbkv/mod.js
var DB = null;
var S = "default";
var IDB = () => new Promise((resolve, reject) => {
  if (DB) return resolve(DB);
  let REQ = self.indexedDB.open("IDBKV", 1);
  REQ.onsuccess = (event) => {
    DB = event.target.result;
    resolve(DB);
  };
  REQ.onupgradeneeded = (event) => {
    DB = event.target.result;
    DB.createObjectStore(S);
    event.target.transaction.oncomplete = (e) => resolve(DB);
  };
});
var DO = (DB2, method, parameter = []) => new Promise((resolve, reject) => {
  DB2.transaction([S], "readwrite").objectStore(S)[method](...parameter).onsuccess = async (event) => {
    resolve(event.target.result);
  };
});
var X = new Proxy({}, {
  deleteProperty(target, key) {
    return IDB().then((DB2) => DO(DB2, "delete", [key]));
  },
  set: (target, key, value) => {
    return IDB().then((DB2) => DO(DB2, "put", [value, key]));
  },
  get: (target, key) => {
    switch (key) {
      // case 'keys': return IDB().then(DB => DO(DB, 'getAllKeys'))
      case Symbol.asyncIterator:
        return async function* () {
          let keys = await IDB().then((DB2) => DO(DB2, "getAllKeys"));
          for (let key2 of keys)
            yield key2;
        };
      default:
        return IDB().then((DB2) => DO(DB2, "get", [key]));
    }
  }
});
var mod_default = X;

// ../../../../GitHub/js-max-pub/random/mod.js
var IDs = {};
var MAP = {};
function randomIntBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
var BASE = {
  num: "0123456789",
  lc: "abcdefghijklmnopqrstuvwxyz",
  uc: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  // num: Array(10).fill(0).map((x, i) => i+'').join(''),
  // lc: Array(26).fill(0).map((x, i) => String.fromCharCode(65 + i)).join(''),
  // uc: Array(26).fill(0).map((x, i) => String.fromCharCode(97 + i)).join(''),
};
function generateID(base, length) {
  return Array(length).fill(0).map((x) => base[randomIntBetween(0, base.length - 1)]).join("");
}
function generateUniqueID(options = {}) {
  options = { length: 5, num: true, lowerCase: false, upperCase: false, prefix: "", bucket: "default", ...options };
  let base = "";
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
  if (!value) return "";
  MAP[options.bucket] ??= {};
  if (!MAP[options.bucket][value])
    MAP[options.bucket][value] = { replacement: generateUniqueID(options), count: 0 };
  MAP[options.bucket][value].count++;
  return MAP[options.bucket][value].replacement;
}
export {
  $,
  $$,
  mod_default as KV,
  Thread,
  arithmeticMean,
  download,
  keep,
  median,
  medianAbsoluteDeviation,
  pretty,
  prettyNumber,
  MAP as pseudoMAP,
  pseudonymize,
  standardDeviation,
  sum,
  unique
};
