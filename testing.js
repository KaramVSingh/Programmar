let literals = []
let whitespace = [" ", "\t", "\r", "\n"]
let ignoreWhitespace = true

function matchPrefix(prefix, str) {
	if(prefix.length <= str.length) {
		for(let i = 0; i < prefix.length; i++) {
			if(prefix[i] !== str[i]) {
				return false
			}
		}
		
		return true
	} else {
		return false
	}
}

function equals(a, b) {
	if(a.length === b.length) {
		return matchPrefix(a, b)
	} else {
		return false
	}
}

function contains(tst, arr) {
	for(let i = 0; i < arr.length; i++) {
		if(equals(tst, arr[i]) === true) {
			return true
		}
	}
	
	return false
}

function lex(str) {
	let firstToken = {}
	firstToken.val = ""
	firstToken.next = null
	
	let index = 0
	let lastToken = firstToken
	
	while(index < str.length) {
		let newToken = null
		for(let i = 0; i < literals.length; i++) {
			let literal = literals[i]
			
			if(matchPrefix(literal, str.slice(index)) === true) {
				newToken = {}
				newToken.val = literal
				newToken.next = null
				
				index = index + literal.length
				break
			}
		}
		
		if(newToken === null) {
			if((ignoreWhitespace === true) && (contains(str[index], whitespace) === true)) {
				index = index + 1
				continue
			} else {
				newToken = {}
				newToken.val = str[index]
				newToken.next = null
				index = index + 1
			}
		}
		
		lastToken.next = newToken
		lastToken = lastToken.next
	}
	
	return firstToken.next
}



let ERROR = {}
ERROR.type = "_ERROR_"

function inRange(curr, start, end) {
	if(curr === null) {
		return false
	}
	if((curr[0].charCodeAt(0) - start[0].charCodeAt(0) >= 0) && (end[0].charCodeAt(0) - curr[0].charCodeAt(0) >= 0)) {
		return true
	} else {
		return false
	}
}

function lookahead(token) {
	if(token === null) {
		return token
	} else {
		return token.val
	}
}

function matchToken(token, expected) {
	if(lookahead(token) === expected) {
		return token.next
	} else {
		ERROR.data = `Parse Error: Expected ${expected} -- got ${token.val}`
		return ERROR
	}
}

function parse(token) {
	if(token === null) {
		throw "Parse Error: Unable to parse empty file."
	} else {
		let parsed = parse_string(token)
		if(parsed.ast === ERROR) {
			throw parsed.ast.data
		} else {
			if(parsed.token !== null) {
				throw "Parse Error: Unexpected tokens at end of file."
			} else {
				return parsed.ast
			}
		}
	}
}

function parse_string(token) {
    console.log("string: 130")
	let result = {}
	result.ast = ERROR
	
	if(result.ast === ERROR) {
		let curr = token
		let children = []
		let data = ""
		let helper = null
		
		if(curr !== null) {
			if(lookahead(curr) === "|") {
				curr = matchToken(curr, lookahead(curr))
				data = `${data}${lookahead(curr)}`
				
				helper = parse_data(curr)
				if(helper.ast !== ERROR) {
					children.push(helper.ast)
					curr = helper.token
					
					if(curr !== null) {
						if(lookahead(curr) === "|") {
							curr = matchToken(curr, lookahead(curr))
							data = `${data}${lookahead(curr)}`
							
							let ast = {}
							ast.children = children
							ast.data = data
							ast.type = "string"
							result.ast = ast
							result.token = curr
						} else {
							ERROR.data = `Parse Error: Unexpected token -- \"${lookahead(curr)}\"`
						}
					} else {
						ERROR.data = `Parse Error: Unexpected end of file.`
					}
				}
			} else {
				ERROR.data = `Parse Error: Unexpected token -- \"${lookahead(curr)}\"`
			}
		} else {
			ERROR.data = `Parse Error: Unexpected end of file.`
		}
	}
	
	return result
}

function parse_data(token) {
    console.log("data: 180")
	let result = {}
	result.ast = ERROR
	
	if(result.ast === ERROR) {
		let curr = token
		let children = []
		let data = ""
		let helper = null
		
		helper = parse_part(curr)
		if(helper.ast !== ERROR) {
			children.push(helper.ast)
			curr = helper.token
			
			helper = parse_data(curr)
			if(helper.ast !== ERROR) {
				children.push(helper.ast)
				curr = helper.token
				
				let ast = {}
				ast.children = children
				ast.data = data
				ast.type = "data"
				result.ast = ast
				result.token = curr
			}
		}
	}
	
	if(result.ast === ERROR) {
		let curr = token
		let children = []
		let data = ""
		let helper = null
		
		helper = parse_part(curr)
		if(helper.ast !== ERROR) {
			children.push(helper.ast)
			curr = helper.token
			
			let ast = {}
			ast.children = children
			ast.data = data
			ast.type = "data"
			result.ast = ast
			result.token = curr
		}
	}
	
	return result
}

function parse__part_0(token) {
    console.log(token)
    console.log("part_0: 234")
	let result = {}
	result.ast = ERROR
	
	if(result.ast === ERROR) {
		let curr = token
		let children = []
		let data = ""
		let helper = null
		
		if(curr !== null) {
			if(lookahead(curr) !== "|") {
				curr = matchToken(curr, lookahead(curr))
				data = `${data}${lookahead(curr)}`
				
				let ast = {}
				ast.children = children
				ast.data = data
				ast.type = "_part_0"
				result.ast = ast
				result.token = curr
			} else {
				ERROR.data = `Parse Error: Unexpected token -- \"${lookahead(curr)}\"`
			}
		} else {
			ERROR.data = `Parse Error: Unexpected end of file.`
		}
	}
	
	return result
}

function parse__part_1(token) {
    console.log("part_1: 267")
	let result = {}
	result.ast = ERROR
	
	if(result.ast === ERROR) {
		let curr = token
		let children = []
		let data = ""
		let helper = null
		
		helper = parse__part_0(curr)
		if(helper.ast !== ERROR) {
			children.push(helper.ast)
			curr = helper.token
			
			helper = parse__part_1(curr)
			if(helper.ast !== ERROR) {
				children.push(helper.ast)
				curr = helper.token
				
				let ast = {}
				ast.children = children
				ast.data = data
				ast.type = "_part_1"
				result.ast = ast
				result.token = curr
			}
		}
	}
	
	if(result.ast === ERROR) {
		let curr = token
		let children = []
		let data = ""
		let helper = null
		
		let ast = {}
		ast.children = children
		ast.data = data
		ast.type = "_part_1"
		result.ast = ast
		result.token = curr
	}
	
	return result
}

function parse_part(token) {
    console.log("part: 315")
	let result = {}
	result.ast = ERROR
	
	if(result.ast === ERROR) {
		let curr = token
		let children = []
		let data = ""
		let helper = null
		
		helper = parse__part_1(curr)
		if(helper.ast !== ERROR) {
			children.push(helper.ast)
			curr = helper.token
			
			let ast = {}
			ast.children = children
			ast.data = data
			ast.type = "part"
			result.ast = ast
			result.token = curr
		}
	}
	
	return result
}

parse(lex('|a|'))