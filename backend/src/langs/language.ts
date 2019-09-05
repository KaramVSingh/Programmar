import { Javascript } from "./javascript";

interface Language {
    createLexer: (id: string, literals: string[], ignoreWhitespace: boolean) => void
}

enum SupportedLanguages {
    JAVASCRIPT
}

function getLang(input: SupportedLanguages): Language {
    switch(input) {
        case SupportedLanguages.JAVASCRIPT:
        return new Javascript()

        default:
        throw 'Illegal Argument: Language specified does not exist.'
    }
}

export { Language, SupportedLanguages, getLang }