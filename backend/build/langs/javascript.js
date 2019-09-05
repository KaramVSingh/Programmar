"use strict";
exports.__esModule = true;
var fs = require("fs");
var Javascript = /** @class */ (function () {
    function Javascript() {
    }
    Javascript.prototype.createLexer = function (id, literals, ignoreWhitespace) {
        var lexer = fs.readFileSync('scraps/javascript/lexer.js', 'UTF-8');
        var lines = lexer.split(/\r\n|\n/);
        var newFile = '';
        for (var i = 0; i < lines.length; i++) {
            if (i === 3) {
                newFile += "const literals = " + JSON.stringify(literals);
            }
            else if (i === 4) {
                newFile += "const ignoreWhitespace = " + ignoreWhitespace;
            }
            else {
                newFile += lines[i];
            }
            newFile += '\n';
        }
        fs.writeFileSync("environments/" + id + "/lexer.js", newFile);
    };
    return Javascript;
}());
exports.Javascript = Javascript;
