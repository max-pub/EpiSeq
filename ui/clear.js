import { $, $$ } from "./dom.js";

function all(path) {
	$$(path).map(node => node.innerHTML = '')
}
function one(path) {
	$(path).innerHTML = ''
}




export function input() {
	all('#source .progress>*')
	one('#source .output')
}