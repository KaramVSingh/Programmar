"use strict";
exports.__esModule = true;
var Tuple = /** @class */ (function () {
    function Tuple(start, end) {
        this.validate(start, end);
        this.start = start;
        this.end = end;
    }
    Tuple.prototype.validate = function (start, end) {
        if (start.length === 0 || end.length === 0) {
            throw Error('Range cannot have empty string.');
        }
        if (start.length !== end.length) {
            throw Error('Range must have same length for start and end.');
        }
        if (start.length !== 1 && start !== end) {
            throw Error('Range length > 1 must have same value.');
        }
        if (start.length === 1 && start.charCodeAt(0) > end.charCodeAt(0)) {
            throw Error('Range must be x, y such that x <= y.');
        }
    };
    Tuple.prototype.toObject = function () {
        var object = [this.start, this.end];
        return object;
    };
    return Tuple;
}());
var Statement = /** @class */ (function () {
    function Statement(input) {
        this.validate(input);
        this.type = input['Type'];
        if (this.type === 'RULE') {
            this.reference = input['Reference'];
            this.ranges = null;
            this.metadata = null;
        }
        else if (this.type === 'RANGE') {
            this.reference = null;
            this.metadata = input['Metadata'];
            this.ranges = [];
            for (var i = 0; i < input['Ranges'].length; i++) {
                var rangeArray = input['Ranges'][i];
                if (rangeArray.length === 2) {
                    this.ranges.push(new Tuple(rangeArray[0], rangeArray[1]));
                }
                else {
                    throw Error('CFG ERROR: Range provided without start and end.');
                }
            }
        }
        else if (this.type === 'LITERAL') {
            // We should convert it to a range
            // Reference will contain the match value
            this.type = 'RANGE';
            this.reference = null;
            this.ranges = [new Tuple(input['Reference'], input['Reference'])];
            this.metadata = 'POSITIVE';
        }
    }
    Statement.prototype.validate = function (input) {
        if (input['Type'] === undefined) {
            throw Error('Type must be defined for statement.');
        }
        if (input['Type'] !== 'RULE' && input['Type'] !== 'RANGE' && input['Type'] !== 'LITERAL') {
            throw Error('Type must be RULE/RANGE/LITERAL.');
        }
        if (input['Type'] === 'RULE' && (input['Reference'] === undefined)) {
            throw Error('Reference cannot be undefined for type RULE.');
        }
        if (input['Type'] === 'RANGE' && (input['Metadata'] === undefined || input['Ranges'] === undefined)) {
            throw Error('Range and Metadata cannot be undefined for type RANGE.');
        }
        else if (input['Type'] === 'RANGE' && (input['Metadata'] !== 'POSITIVE' && input['Metadata'] !== 'NEGATIVE')) {
            throw Error('Metadata must be enum of values POSITIVE/NEGATIVE.');
        }
        if (input['Type'] === 'LITERAL' && (input['Reference'] === undefined)) {
            throw Error('Reference cannot be undefined for LITERAL.');
        }
    };
    Statement.prototype.toObject = function () {
        var hasRanges = this.ranges !== null;
        var object = {
            'Type': this.type,
            'Reference': this.reference,
            'Metadata': this.metadata,
            'Ranges': (hasRanges ? [] : null)
        };
        if (hasRanges) {
            for (var i = 0; i < this.ranges.length; i++) {
                object['Ranges'].push(this.ranges[i].toObject());
            }
        }
        return object;
    };
    return Statement;
}());
var Format = /** @class */ (function () {
    function Format(input) {
        this.statements = [];
        for (var i = 0; i < input.length; i++) {
            var statementInput = input[i];
            this.statements.push(new Statement(statementInput));
        }
    }
    Format.prototype.toObject = function () {
        var object = [];
        for (var i = 0; i < this.statements.length; i++) {
            object.push(this.statements[i].toObject());
        }
        return object;
    };
    return Format;
}());
var Rule = /** @class */ (function () {
    function Rule(input) {
        this.validate(input);
        this.internal = input['Internal'];
        this.name = input['Name'];
        this.is = [];
        for (var i = 0; i < input['Is'].length; i++) {
            var formatInput = input['Is'][i];
            this.is.push(new Format(formatInput));
        }
    }
    Rule.prototype.validate = function (input) {
        if (input['Internal'] === undefined || input['Name'] === undefined || input['Is'] === undefined) {
            throw Error('Internal, Name, and Is must be defined in a rule.');
        }
        if (input['Name'].length < 1 || input['Name'][0] == '_' && input['Internal'] !== true) {
            throw Error('Namespace Error for rule.');
        }
    };
    Rule.prototype.toObject = function () {
        var object = {
            'Internal': this.internal,
            'Name': this.name,
            'Is': []
        };
        for (var i = 0; i < this.is.length; i++) {
            object['Is'].push(this.is[i].toObject());
        }
        return object;
    };
    return Rule;
}());
var Cfg = /** @class */ (function () {
    function Cfg(input) {
        this.validate(input);
        this.rules = [];
        for (var i = 0; i < input['Rules'].length; i++) {
            this.rules.push(new Rule(input['Rules'][i]));
        }
    }
    Cfg.prototype.addRule = function (input) {
        var rule = new Rule(input);
        for (var i = 0; i < this.rules.length; i++) {
            if (this.rules[i].name === rule.name) {
                throw Error('Cannot have rules with same name.');
            }
        }
        this.rules.push(rule);
    };
    Cfg.prototype.removeRule = function (name) {
        this.rules = this.rules.filter(function (rule) { return rule.name !== name; });
    };
    Cfg.prototype.validate = function (input) {
        if (input['Rules'] === undefined) {
            throw Error('Rules must be declared in CFG.');
        }
        var memo = {};
        for (var i = 0; i < input['Rules'].length; i++) {
            if (input['Rules'][i]['Name'] in memo) {
                throw Error('Cannot have rules with same name.');
            }
            memo[input['Rules'][i]['Name']] = true;
        }
    };
    Cfg.prototype.toObject = function () {
        var object = {
            'Rules': []
        };
        for (var i = 0; i < this.rules.length; i++) {
            object['Rules'].push(this.rules[i].toObject());
        }
        return object;
    };
    return Cfg;
}());
exports.Cfg = Cfg;
