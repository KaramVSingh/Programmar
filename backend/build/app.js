"use strict";
exports.__esModule = true;
var input_1 = require("./input/input");
var cfg_1 = require("./cfg/cfg");
function handleRequest(input) {
    input_1.Input.validate(input);
    var cfg = cfg_1.Cfg.fromInput(input);
}
