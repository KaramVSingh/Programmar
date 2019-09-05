const fs = require('fs')

// These need to be set on creation of the lexer
const literals = ['REPLACEME']
const ignoreWhitespace = true

class Token {
    constructor(curr, next) {
        this.curr = curr
        this.next = next
    }
}

/**
 * This function will take a file and convert it into a linked list of tokens.
 * Implemented without recursion for stack considerations and performance issues.
 * @param {string} filename the filename to be lexed
 * @returns {Token} a linked list of tokens which correspond to the file
 */
function lex(filename) {
    const data = fs.readFileSync(filename, 'UTF-8')
    const firstToken = new Token('', null)
    let index = 0
    let lastToken = firstToken

    while(index < data.length) {
        let newToken = null
        for(let literal of literals) {
            if(index + literal.length <= data.length && data.slice(index, index + literal.length) === literal) {
                newToken = new Token(literal, null)
                index += literal.length
                break
            }
        }

        if(newToken === null) {
            if(ignoreWhitespace && [' ', '\t', '\n', '\r'].includes(data[index])) {
                index++
                continue
            } else {
                newToken = new Token(data[index])
                index++
            }
        }

        lastToken.next = newToken
        lastToken = lastToken.next
    }

    return firstToken.next
}

export { lex, Token }