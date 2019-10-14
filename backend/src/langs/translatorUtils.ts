import { Line, GrandLanguageTranslator } from './translator'
import { Javascript } from './languages/javascript'

enum SupportedLanguages {
    JAVASCRIPT = 'JAVASCRIPT'
}

function getTranslator(lang: SupportedLanguages): GrandLanguageTranslator {
    switch(lang) {
        case SupportedLanguages.JAVASCRIPT:
        return new Javascript()

        default:
        throw 'Internal Error: Unsupported language.'
    }
}

export { SupportedLanguages, getTranslator }