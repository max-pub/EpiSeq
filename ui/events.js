
import { $, $$, download } from './dom.js'
import { DATA, WORKER, updateState } from './main.js'
import { TALI } from '../lib/deps.js'
import * as FORM from './forms.js'
import * as FLOW from './flow.js'
// import { updateState} from './forms.js'
updateState()


$$('#source [demo]').forEach(node => node.addEventListener('click', () => FLOW.source.runDemo(node.getAttribute('demo'))))
$('#source .typings input').addEventListener('change', event => FORM.source.updateActivation())
$('#source .locations input').addEventListener('change', event => FORM.source.updateActivation())

$('#source form').addEventListener('submit', event => FLOW.source.run(event))
$('#source_filter form').addEventListener('submit', event => FLOW.source_filter.run(event))
$('#typing_distance form').addEventListener('submit', event => FLOW.typing_distance.run(event))
$('#typing_filter form').addEventListener('submit', event => FLOW.typing_filter.run(event))
// $('#location_distance form').addEventListener('submit', event => FLOW.location_distance.run(event))
$('#location_filter form').addEventListener('submit', event => FLOW.location_filter.run(event))


// FLOW.source.runDemo('coli')