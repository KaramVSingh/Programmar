import { Ast } from './parser_h'

let ERROR = new Ast()

function lookahead(token) {
	if(token === null) {
		return null
	} else {
		return token.curr
	}
}

function matchToken(token, expected) {
	if(lookahead(token) === expected) {
		return token.next
	} else {
		ERROR.data = `Parse Error: Expected ${expected} -- got ${token.curr}.`
		return ERROR
	}
}

function parse(token) {
	if(token === null) {
		throw "Parse Error: Unable to parse empty file."
	} else {
		let parsed = parse_sampleRule(token)
		if(parsed === ERROR) {
			throw ERROR.data
		} else {
			return parsed
		}
	}
}

export { parse }