export function mergeSettingsAndOptions(options) {
	options.parse = { ...settings.parse, ...options.parse }
	options.stringify = { ...settings.stringify, ...options.stringify }
	for (let key in settings)
		if (!(key in options))
			options[key] = settings[key]
	return options
}


export let settings = {
	table: '\n\n\n',
	row: '\n',
	cell: '\t',
	// list: ':|:',
	tab: ':T:',
	line: ':L:',
	parse: {
		'': null,
		'null': null,
		'undefined': null,
		'NaN': null,
		'Invalid Date': null,
	},
	stringify: {
		null: '',
		undefined: '',
		NaN: '',
		'Invalid Date': '',
	},


}







// ::T::  ::L::
//  |T|    |L|
//  _T_    _L_
//   ⇥      ↵
// export var TAB = '::T::' // 90 degree-rotation makes it look like ⇥ \t   forward till stop
// export var LINE = '::L::' // 90 degree-rotation makes it look like ↵  \r \n  return than down
// export var ARRAY = '|' // array separator
// export var NONE = '' // or ? or -
// export const taliT = '⇥'
// export const taliN = '↵'
// tab: '::T::',
// line: '::L::',
// array: '|',
//   <L>   [L]  {L}   /L\   \L/ \T/   /T\  \I/
// \n \t
// \T/T\T/
// <T>   escaping:   <:T:>

// escaping _|_  _ | _
// list: ':|:',
///   :T:T:T:    -> ⇥T⇥  but difficult to read?!
// tab: '[T]', /// [T]T[T]
// tab: '{T}', /// [T]T[T]
// tab: '<T>', /// [T]T[T]    <T>item two<T>item three<T>
// tab: '>T<', /// [T]T[T]
// tab: '\\T/', /// \T/T\T/   \T/item two\T/item three\T/
// line: '\\L/',
// some great text:L:next lien shows this:L:then that    escaping:  :_L_:
// array: ':I:',  /// <A>item one<A>item two<A>
// array: '|',  /// item one|item two|item three|   escaping _|_


// none: '',
// remove: ['', 'null', 'undefined', 'NaN'],
