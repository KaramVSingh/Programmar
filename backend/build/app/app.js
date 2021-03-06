"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.Metadata = exports.handleRequest = exports.Result = exports.entrypoint = void 0;
var input_1 = require("../input/input");
var cfg_1 = require("../cfg/cfg");
var translatorUtils_1 = require("./../langs/translatorUtils");
var files_1 = require("./../langs/files");
var Metadata = /** @class */ (function () {
    function Metadata() {
    }
    Metadata.isMetadata = function (input) {
        return (typeof input.language === 'string' && Object.values(translatorUtils_1.SupportedLanguages).includes(input.language))
            && (typeof input.name === 'string')
            && (typeof input.ignoreWhitespace === 'boolean')
            && (typeof input.first === 'string');
    };
    return Metadata;
}());
exports.Metadata = Metadata;
var Request = /** @class */ (function () {
    function Request() {
    }
    Request.isRequest = function (input) {
        return (input.metadata && Metadata.isMetadata(input.metadata))
            && (input.input && input_1.Input.isInput(input.input));
    };
    return Request;
}());
var Files = /** @class */ (function () {
    function Files(header, source) {
        this.header = header;
        this.source = source;
    }
    return Files;
}());
var Result = /** @class */ (function () {
    function Result(lexer, parser) {
        this.lexer = lexer;
        this.parser = parser;
    }
    return Result;
}());
exports.Result = Result;
/**
 * This function is the entrypoint to the backend
 * @param event This is the lambda event
 */
var entrypoint = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        if (Request.isRequest(event)) {
            try {
                return [2 /*return*/, {
                        statusCode: 200,
                        isBase64Encoded: false,
                        headers: {
                            "Access-Control-Allow-Headers": "application/json",
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "OPTIONS,POST"
                        },
                        body: handleRequest(event.input, event.metadata)
                    }];
            }
            catch (e) {
                return [2 /*return*/, {
                        statusCode: 400,
                        isBase64Encoded: false,
                        headers: {
                            "Access-Control-Allow-Headers": "application/json",
                            "Access-Control-Allow-Origin": "*",
                            "Access-Control-Allow-Methods": "OPTIONS,POST"
                        },
                        body: { error: e }
                    }];
            }
        }
        else {
            return [2 /*return*/, {
                    statusCode: 400,
                    body: { error: 'Illegal Argument: Request must contain input and metadata.' }
                }];
        }
        return [2 /*return*/];
    });
}); };
exports.entrypoint = entrypoint;
/**
 * This function is the typescript entrypoint to the backend's create parser functionality
 * @param input This is the input passed in from the front-end
 * @param metadata This contains some metadata about the requests
 */
function handleRequest(input, metadata) {
    input_1.Input.validate(input);
    var cfg = cfg_1.Cfg.fromInput(input);
    validateRequest(input, metadata);
    return createFiles(cfg, metadata);
}
exports.handleRequest = handleRequest;
function createFiles(cfg, metadata) {
    var translator = translatorUtils_1.getTranslator(metadata.language);
    var lexerHeaderBody = files_1.lexerHeader(translator).render(0);
    var lexerSrcBody = files_1.lexerSrc(cfg, translator).render(0);
    var lexer = new Files(lexerHeaderBody, lexerSrcBody);
    var parserHeaderBody = files_1.parserHeader(translator, cfg).render(0);
    var parserSrcBody = files_1.parserSrc(metadata, cfg, translator).render(0);
    var parser = new Files(parserHeaderBody, parserSrcBody);
    return new Result(lexer, parser);
}
function validateRequest(input, metadata) {
    if (metadata.name.includes('.') || metadata.name.includes('/')) {
        throw 'Illegal Argument: Parser name cannot contain . or /.';
    }
    if (!input.rules.some(function (rule) { return rule.name === metadata.first; })) {
        throw "Illegal Argument: " + metadata.first + " is not present in the context free grammar.";
    }
}
