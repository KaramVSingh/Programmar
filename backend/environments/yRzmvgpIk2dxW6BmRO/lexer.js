// These need to be set on creation of the lexer
const literals = ["lexing","<=", "is"]
const ignoreWhitespace = false

const Token = require('./lexer_h')

/**
 * This function will take a file and convert it into a linked list of tokens.
 * Implemented without recursion for stack considerations and performance issues.
 * @param {string} filename the filename to be lexed
 * @returns {Token} a linked list of tokens which correspond to the file
 */
function lex(data) {
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

exports.lex = lex

let token = lex('this is what im lexing <= << = This is what im lexxing')

while(token !== null) {
    console.log(token.curr)
    token = token.next
}