
export function $(o) { return document.querySelector(o) }
export function $$(o) { return [...document.querySelectorAll(o)] }
Node.prototype.$ = function (o) { return this.querySelector(o) }
Node.prototype.$$ = function (o) { return [...this.querySelectorAll(o)] }

export function show(node){node.classList.remove('hidden');}
export function hide(node){node.classList.add('hidden');}