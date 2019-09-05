"use strict";
exports.__esModule = true;
var input_1 = require("../input/input");
var cfg_1 = require("../cfg/cfg");
var language_1 = require("../langs/language");
var fs = require("fs");
/**
 * This function is the entrypoint to the backend's create parser functionality
 * @param input This is the input passed in from the front-end
 * @param metadata This contains some metadata about the requests
 */
function handleRequest(input, metadata) {
    input_1.Input.validate(input);
    var cfg = cfg_1.Cfg.fromInput(input);
    validateRequest(metadata);
    var langHandle = language_1.getLang(metadata.language);
    var id = generateId();
    fs.mkdirSync("environments/" + id);
    var literals = cfg_1.gatherLiterals(cfg);
    langHandle.createLexer(id, literals, metadata.ignoreWhitespace);
}
exports.handleRequest = handleRequest;
function validateRequest(metadata) {
    if (metadata.name.includes('.') || metadata.name.includes('/')) {
        throw 'Illegal Argument: Parser name cannot contain . or /.';
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
