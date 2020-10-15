import { Input } from '../input/input'
import { Cfg } from '../cfg/cfg'
import { SupportedLanguages, getTranslator } from './../langs/translatorUtils'
import { lexerHeader, lexerSrc, parserHeader, parserSrc } from './../langs/files'
import { GrandLanguageTranslator } from '../langs/translator'

class Metadata {
    language: SupportedLanguages
    name: string
    ignoreWhitespace: boolean
    first: string

    static isMetadata(input: any): input is Metadata {
        return (typeof input.language === 'string' && Object.values(SupportedLanguages).includes(input.language))
            && (typeof input.name === 'string')
            && (typeof input.ignoreWhitespace === 'boolean')
            && (typeof input.first === 'string')
    }
}

class Request {
    metadata: Metadata
    input: Input

    static isRequest(input: any): input is Request {
        return (input.metadata && Metadata.isMetadata(input.metadata))
            && (input.input && Input.isInput(input.input))
    }
}

class Files {
    header: string
    source: string

    constructor(header: string, source: string) {
        this.header = header
        this.source = source
    }
}

class Result {
    lexer: Files
    parser: Files

    constructor(lexer: Files, parser: Files) {
        this.lexer = lexer
        this.parser = parser
    }
}

/**
 * This function is the entrypoint to the backend
 * @param event This is the lambda event
 */
const entrypoint = async (event: any) => {
    if(Request.isRequest(event)) {
        try {
            return {
                statusCode: 200,
                isBase64Encoded: false,
                headers: {
                    "Access-Control-Allow-Headers" : "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST"
                },
                body: JSON.stringify(handleRequest(event.input, event.metadata))
            }
        } catch(e) {
            return {
                statusCode: 400,
                isBase64Encoded: false,
                headers: {
                    "Access-Control-Allow-Headers" : "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "OPTIONS,POST"
                },
                body: JSON.stringify({ error: e })
            }
        }
    } else {
        return {
            statusCode: 400,
            body: { error: 'Illegal Argument: Request must contain input and metadata.' }
        }
    }
}

/**
 * This function is the typescript entrypoint to the backend's create parser functionality
 * @param input This is the input passed in from the front-end
 * @param metadata This contains some metadata about the requests
 */
function handleRequest(input: Input, metadata: Metadata): Result {
    Input.validate(input)
    const cfg = Cfg.fromInput(input)
    validateRequest(input, metadata)

    return createFiles(cfg, metadata)
}

function createFiles(cfg: Cfg, metadata: Metadata): Result {
    const translator: GrandLanguageTranslator = getTranslator(metadata.language)

    const lexerHeaderBody: string = lexerHeader(translator).toString()
    const lexerSrcBody: string = lexerSrc(metadata, cfg, translator).toString()
    const lexer = new Files(lexerHeaderBody, lexerSrcBody)

    const parserHeaderBody: string = parserHeader(translator, cfg).toString()
    const parserSrcBody: string = parserSrc(metadata, cfg, translator).toString()
    const parser = new Files(parserHeaderBody, parserSrcBody)

    return new Result(lexer, parser)
}

function validateRequest(input: Input, metadata: Metadata) {
    if(metadata.name.includes('.') || metadata.name.includes('/')) {
        throw 'Illegal Argument: Parser name cannot contain . or /.'
    }

    if(!input.rules.some((rule) => rule.name === metadata.first)) {
        throw `Illegal Argument: ${metadata.first} is not present in the context free grammar.`
    }
}

export { entrypoint, handleRequest, Metadata }