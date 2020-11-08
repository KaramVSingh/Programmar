"use strict";
exports.__esModule = true;
var regex_1 = require("./regex");
var cfg_1 = require("./../cfg");
var assert_1 = require("./../../testutils/assert");
testPrelex();
function testPrelex() {
    var test = regex_1.prelex('test string');
    var i = 0;
    while (test !== null) {
        assert_1.assert(test.curr === 'test string'[i]);
        i++;
        test = test.next;
    }
    test = regex_1.prelex('my ne\\w string');
    i = 5;
    while (i > 0) {
        i--;
        test = test.next;
    }
    assert_1.assert(test.curr === '\\w');
    assert_1.assertThrows(function () {
        regex_1.prelex('can you do this?\\');
    });
}
testLex();
function testLex() {
    // Check a standard lex
    var test = regex_1.lex(regex_1.prelex('this is a basic lex'));
    var i = 0;
    while (test !== null) {
        assert_1.assert(test.curr === 'this is a basic lex'[i]);
        i++;
        test = test.next;
    }
    // Check that brackets are lexed properly
    test = regex_1.lex(regex_1.prelex('everything [inside brackets] is one token'));
    i = 11;
    while (i > 0) {
        i--;
        test = test.next;
    }
    assert_1.assert(test.curr === '[inside brackets]');
    test = test.next;
    i = 0;
    while (test !== null) {
        assert_1.assert(test.curr === ' is one token'[i]);
        i++;
        test = test.next;
    }
    // Check that will fail on open bracket
    assert_1.assertThrows(function () {
        regex_1.lex(regex_1.prelex('this will [fail'));
    });
    assert_1.assertThrows(function () {
        regex_1.lex(regex_1.prelex('this [] will fail'));
    });
    // Check that braces will parse properly
    test = regex_1.lex(regex_1.prelex('this {0,100} works'));
    i = 5;
    while (i > 0) {
        i--;
        test = test.next;
    }
    assert_1.assert(test.curr === '{0,100}');
    test = test.next;
    i = 0;
    while (test !== null) {
        assert_1.assert(test.curr === ' works'[i]);
        i++;
        test = test.next;
    }
    test = regex_1.lex(regex_1.prelex('this {0,} works'));
    i = 5;
    while (i > 0) {
        i--;
        test = test.next;
    }
    assert_1.assert(test.curr === '{0,}');
    test = test.next;
    i = 0;
    while (test !== null) {
        assert_1.assert(test.curr === ' works'[i]);
        i++;
        test = test.next;
    }
    test = regex_1.lex(regex_1.prelex('this {,0} works'));
    i = 5;
    while (i > 0) {
        i--;
        test = test.next;
    }
    assert_1.assert(test.curr === '{,0}');
    test = test.next;
    i = 0;
    while (test !== null) {
        assert_1.assert(test.curr === ' works'[i]);
        i++;
        test = test.next;
    }
    test = regex_1.lex(regex_1.prelex('this {100} works'));
    i = 5;
    while (i > 0) {
        i--;
        test = test.next;
    }
    assert_1.assert(test.curr === '{100}');
    test = test.next;
    i = 0;
    while (test !== null) {
        assert_1.assert(test.curr === ' works'[i]);
        i++;
        test = test.next;
    }
    assert_1.assertThrows(function () {
        regex_1.lex(regex_1.prelex('this should {} fail'));
    });
    assert_1.assertThrows(function () {
        regex_1.lex(regex_1.prelex('this should {,} fail'));
    });
    assert_1.assertThrows(function () {
        regex_1.lex(regex_1.prelex('this should fail {100,'));
    });
}
testParse();
function testParse() {
    regex_1.parseRegex(regex_1.lex(regex_1.prelex('this|is a regex')));
    assert_1.assertThrows(function () {
        regex_1.parseRegex(regex_1.lex(regex_1.prelex('this isnt|')));
    });
    assert_1.assertThrows(function () {
        regex_1.parseRegex(regex_1.lex(regex_1.prelex('|this isnt')));
    });
    regex_1.parseRegex(regex_1.lex(regex_1.prelex('this is+ a regex')));
    regex_1.parseRegex(regex_1.lex(regex_1.prelex('this is? a regex')));
    regex_1.parseRegex(regex_1.lex(regex_1.prelex('this is* a regex')));
    regex_1.parseRegex(regex_1.lex(regex_1.prelex('this is{3} a regex')));
    regex_1.parseRegex(regex_1.lex(regex_1.prelex('this is{3,5} a regex')));
    assert_1.assertThrows(function () {
        regex_1.parseRegex(regex_1.lex(regex_1.prelex('This isnt {3}+')));
    });
    regex_1.parseRegex(regex_1.lex(regex_1.prelex('this (is) a regex')));
    regex_1.parseRegex(regex_1.lex(regex_1.prelex('this (is)+ a regex')));
    regex_1.parseRegex(regex_1.lex(regex_1.prelex('this (is){3} a regex')));
    assert_1.assertThrows(function () {
        regex_1.parseRegex(regex_1.lex(regex_1.prelex('this (isnt a regex')));
    });
    regex_1.parseRegex(regex_1.lex(regex_1.prelex('this [is] a regex')));
    regex_1.parseRegex(regex_1.lex(regex_1.prelex('this [is]+ a regex')));
    assert_1.assertThrows(function () {
        regex_1.parseRegex(regex_1.lex(regex_1.prelex('this [isnt a regex')));
    });
    regex_1.parseRegex(regex_1.lex(regex_1.prelex('this ]is a regex')));
    regex_1.parseRegex(regex_1.lex(regex_1.prelex('thi|s is(technica+lly)* a | ergex [but it]+ de083y93213finitely? su{3,7}c|ks')));
}
testParseBracket();
function testParseBracket() {
    var test = regex_1.parseBracket(regex_1.prelex('a-b'), true);
    assert_1.assert(JSON.stringify(test.ranges) === JSON.stringify([['a', 'b']]));
    test = regex_1.parseBracket(regex_1.prelex('a-bc'), true);
    assert_1.assert(JSON.stringify(test.ranges) === JSON.stringify([['a', 'b'], ['c', 'c']]));
    test = regex_1.parseBracket(regex_1.prelex('ab'), true);
    assert_1.assert(JSON.stringify(test.ranges) === JSON.stringify([['a', 'a'], ['b', 'b']]));
    test = regex_1.parseBracket(regex_1.prelex('a-bc-de'), true);
    assert_1.assert(JSON.stringify(test.ranges) === JSON.stringify([['a', 'b'], ['c', 'd'], ['e', 'e']]));
    assert_1.assertThrows(function () {
        regex_1.parseBracket(regex_1.prelex('a-b-d'), true);
    });
    assert_1.assertThrows(function () {
        regex_1.parseBracket(regex_1.prelex('a-be-d'), true);
    });
    assert_1.assertThrows(function () {
        regex_1.parseBracket(regex_1.prelex('-b-d'), true);
    });
    assert_1.assertThrows(function () {
        regex_1.parseBracket(regex_1.prelex('a--b-d'), true);
    });
    assert_1.assertThrows(function () {
        regex_1.parseBracket(regex_1.prelex('-'), true);
    });
    assert_1.assertThrows(function () {
        regex_1.parseBracket(regex_1.prelex('d-'), true);
    });
    assert_1.assertThrows(function () {
        regex_1.parseBracket(regex_1.prelex('\\sa-b-d'), true);
    });
}
testToRules();
function testToRules() {
    regex_1.regexToRules('[a-zA-Z]+', 'myRule');
}
manualTesting();
function manualTesting() {
    var rules = regex_1.regexToRules("[a-zA-Z]+[1]{2}", "Hello");
    printCfg(rules);
}
function printCfg(rules) {
    console.log("[\n");
    rules.forEach(function (rule) { printRule(rule); });
    console.log("\n]");
}
function printRule(rule) {
    console.log(rule.name);
    rule.is.forEach(function (isList) {
        var is = isList.map(function (isVal) {
            if (isVal.type == cfg_1.StatementType.RULE) {
                return isVal.data;
            }
            else {
                var ranges = isVal.data.ranges.map(function (range) { return "[" + range[0] + "-" + range[1] + "]"; }).join('');
                return isVal.data.isAffirmative + ":" + ranges;
            }
        }).join();
        console.log("    " + is);
    });
}
