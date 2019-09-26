"use strict";
exports.__esModule = true;
var input_1 = require("../input/input");
var cfg_1 = require("../cfg/cfg");
var translatorUtils_1 = require("./../langs/translatorUtils");
var files_1 = require("./../langs/files");
var fs = require("fs");
/**
 * This function is the entrypoint to the backend's create parser functionality
 * @param input This is the input passed in from the front-end
 * @param metadata This contains some metadata about the requests
 */
function handleRequest(input, metadata) {
    input_1.Input.validate(input);
    var cfg = cfg_1.Cfg.fromInput(input);
    validateRequest(input, metadata);
    var id = generateId();
    createFiles(id, cfg, metadata);
}
exports.handleRequest = handleRequest;
function createFiles(id, cfg, metadata) {
    var translator = translatorUtils_1.getTranslator(metadata.language);
    fs.mkdirSync("environments/" + id);
    files_1.createLexer(id, metadata, cfg, translator);
    files_1.createParser(id, metadata, cfg, translator);
}
function validateRequest(input, metadata) {
    if (metadata.name.includes('.') || metadata.name.includes('/')) {
        throw 'Illegal Argument: Parser name cannot contain . or /.';
    }
    if (!input.rules.some(function (rule) { return rule.name === metadata.first; })) {
        throw "Illegal Argument: " + metadata.first + " is not present in the context free grammar.";
    }
}
function generateId() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 18; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
