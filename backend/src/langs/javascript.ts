import { Language } from './language'
import fs = require('fs')

class Javascript implements Language {
    createLexer(id: string, literals: string[], ignoreWhitespace: boolean) {
        const lexer: string = fs.readFileSync('scraps/javascript/lexer.js', 'UTF-8')
        const lines: string[] = lexer.split(/\r\n|\n/)
        let newFile: string = ''

        for(let i = 0; i < lines.length; i++) {
            if(i === 3) {
                newFile += `const literals = ${JSON.stringify(literals)}`
            } else if(i === 4) {
                newFile += `const ignoreWhitespace = ${ignoreWhitespace}`
            } else {
                newFile += lines[i]
            }

            newFile += '\n'
        }

        fs.writeFileSync(`environments/${id}/lexer.js`, newFile)
    }
}

export { Javascript }