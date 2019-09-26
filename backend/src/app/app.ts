import { Input } from '../input/input'
import { Cfg } from '../cfg/cfg'
import { SupportedLanguages, getTranslator } from './../langs/translatorUtils'
import { createParser, createLexer } from './../langs/files'
import { GrandLanguageTranslator } from '../langs/translator'
import fs = require('fs')

interface Metadata {
    language: SupportedLanguages,
    name: string
    ignoreWhitespace: boolean,
    first: string
}

/**
 * This function is the entrypoint to the backend's create parser functionality
 * @param input This is the input passed in from the front-end
 * @param metadata This contains some metadata about the requests
 */
function handleRequest(input: Input, metadata: Metadata) {
    Input.validate(input)
    const cfg = Cfg.fromInput(input)
    validateRequest(input, metadata)

    const id: string = generateId()
    createFiles(id, cfg, metadata)
}

function createFiles(id: string, cfg: Cfg, metadata: Metadata) {
    const translator: GrandLanguageTranslator = getTranslator(metadata.language)

    fs.mkdirSync(`environments/${id}`)
    createLexer(id, metadata, cfg, translator)
    createParser(id, metadata, cfg, translator)
}

function validateRequest(input: Input, metadata: Metadata) {
    if(metadata.name.includes('.') || metadata.name.includes('/')) {
        throw 'Illegal Argument: Parser name cannot contain . or /.'
    }

    if(!input.rules.some((rule) => rule.name === metadata.first)) {
        throw `Illegal Argument: ${metadata.first} is not present in the context free grammar.`
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

export { handleRequest, Metadata }