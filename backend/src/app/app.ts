import { Input } from '../input/input'
import { Cfg, gatherLiterals } from '../cfg/cfg'
import { Language, SupportedLanguages, getLang } from '../langs/language'
import fs = require('fs')

interface metadata {
    language: SupportedLanguages,
    name: string
    ignoreWhitespace: boolean
}

/**
 * This function is the entrypoint to the backend's create parser functionality
 * @param input This is the input passed in from the front-end
 * @param metadata This contains some metadata about the requests
 */
function handleRequest(input: Input, metadata: metadata) {
    Input.validate(input)
    const cfg = Cfg.fromInput(input)
    validateRequest(metadata)

    const langHandle: Language = getLang(metadata.language)
    const id: string = generateId()

    fs.mkdirSync(`environments/${id}`)
    const literals: string[] = gatherLiterals(cfg)
    langHandle.createLexer(id, literals, metadata.ignoreWhitespace)
}

function validateRequest(metadata: metadata) {
    if(metadata.name.includes('.') || metadata.name.includes('/')) {
        throw 'Illegal Argument: Parser name cannot contain . or /.'
    }
}

function generateId(): string {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for(let i = 0; i < 18; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    
    return result;
}

export { handleRequest }