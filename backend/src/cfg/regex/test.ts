import { regexToRules, prelex, Token, lex, parseRegex, parseBracket } from './regex'
import { Rule, StatementType, Range } from './../cfg'
import { assert, assertThrows } from './../../testutils/assert'

testPrelex()
function testPrelex() {
    let test: Token = prelex('test string')
    let i = 0
    while(test !== null) {
        assert(test.curr === 'test string'[i])
        i++
        test = test.next
    }

    test = prelex('my ne\\w string')
    i = 5
    while(i > 0) {
        i--
        test = test.next
    }

    assert(test.curr === '\\w')

    assertThrows(() => {
        prelex('can you do this?\\')
    })
}

testLex()
function testLex() {
    // Check a standard lex
    let test: Token = lex(prelex('this is a basic lex'))
    let i = 0
    while(test !== null) {
        assert(test.curr === 'this is a basic lex'[i])
        i++
        test = test.next
    }

    // Check that brackets are lexed properly
    test = lex(prelex('everything [inside brackets] is one token'))
    i = 11
    while(i > 0) {
        i--
        test = test.next
    }
    
    assert(test.curr === '[inside brackets]')
    test = test.next

    i = 0
    while(test !== null) {
        assert(test.curr === ' is one token'[i])
        i++
        test = test.next
    }

    // Check that will fail on open bracket
    assertThrows(() => {
        lex(prelex('this will [fail'))
    })

    assertThrows(() => {
        lex(prelex('this [] will fail'))
    })

    // Check that braces will parse properly
    test = lex(prelex('this {0,100} works'))
    i = 5
    while(i > 0) {
        i--
        test = test.next
    }

    assert(test.curr === '{0,100}')
    test = test.next

    i = 0
    while(test !== null) {
        assert(test.curr === ' works'[i])
        i++
        test = test.next
    }

    test = lex(prelex('this {0,} works'))
    i = 5
    while(i > 0) {
        i--
        test = test.next
    }

    assert(test.curr === '{0,}')
    test = test.next

    i = 0
    while(test !== null) {
        assert(test.curr === ' works'[i])
        i++
        test = test.next
    }

    test = lex(prelex('this {,0} works'))
    i = 5
    while(i > 0) {
        i--
        test = test.next
    }

    assert(test.curr === '{,0}')
    test = test.next

    i = 0
    while(test !== null) {
        assert(test.curr === ' works'[i])
        i++
        test = test.next
    }

    test = lex(prelex('this {100} works'))
    i = 5
    while(i > 0) {
        i--
        test = test.next
    }

    assert(test.curr === '{100}')
    test = test.next

    i = 0
    while(test !== null) {
        assert(test.curr === ' works'[i])
        i++
        test = test.next
    }

    assertThrows(() => {
        lex(prelex('this should {} fail'))
    })

    assertThrows(() => {
        lex(prelex('this should {,} fail'))
    })

    assertThrows(() => {
        lex(prelex('this should fail {100,'))
    })
}

testParse()
function testParse() {
    parseRegex(lex(prelex('this|is a regex')))
    assertThrows(() => {
        parseRegex(lex(prelex('this isnt|')))
    })
    assertThrows(() => {
        parseRegex(lex(prelex('|this isnt')))
    })
    parseRegex(lex(prelex('this is+ a regex')))
    parseRegex(lex(prelex('this is? a regex')))
    parseRegex(lex(prelex('this is* a regex')))
    parseRegex(lex(prelex('this is{3} a regex')))
    parseRegex(lex(prelex('this is{3,5} a regex')))
    assertThrows(() => {
        parseRegex(lex(prelex('This isnt {3}+')))
    })
    parseRegex(lex(prelex('this (is) a regex')))
    parseRegex(lex(prelex('this (is)+ a regex')))
    parseRegex(lex(prelex('this (is){3} a regex')))
    assertThrows(() => {
        parseRegex(lex(prelex('this (isnt a regex')))
    })
    parseRegex(lex(prelex('this [is] a regex')))
    parseRegex(lex(prelex('this [is]+ a regex')))
    assertThrows(() => {
        parseRegex(lex(prelex('this [isnt a regex')))
    })
    parseRegex(lex(prelex('this ]is a regex')))
    parseRegex(lex(prelex('thi|s is(technica+lly)* a | ergex [but it]+ de083y93213finitely? su{3,7}c|ks')))
}

testParseBracket()
function testParseBracket() {
    let test = parseBracket(prelex('a-b'), true)
    assert(JSON.stringify(test.ranges) === JSON.stringify([['a', 'b']]))
    test = parseBracket(prelex('a-bc'), true)
    assert(JSON.stringify(test.ranges) === JSON.stringify([['a', 'b'], ['c', 'c']]))
    test = parseBracket(prelex('ab'), true)
    assert(JSON.stringify(test.ranges) === JSON.stringify([['a', 'a'], ['b', 'b']]))
    test = parseBracket(prelex('a-bc-de'), true)
    assert(JSON.stringify(test.ranges) === JSON.stringify([['a', 'b'], ['c', 'd'], ['e', 'e']]))
    assertThrows(() => {
        parseBracket(prelex('a-b-d'), true)
    })
    assertThrows(() => {
        parseBracket(prelex('a-be-d'), true)
    })
    assertThrows(() => {
        parseBracket(prelex('-b-d'), true)
    })
    assertThrows(() => {
        parseBracket(prelex('a--b-d'), true)
    })
    assertThrows(() => {
        parseBracket(prelex('-'), true)
    })
    assertThrows(() => {
        parseBracket(prelex('d-'), true)
    })
    assertThrows(() => {
        parseBracket(prelex('\\sa-b-d'), true)
    })
}

testToRules()
function testToRules() {
    regexToRules('[a-zA-Z]{3}', 'myRule')
}

manualTesting()
function manualTesting() {
    const rules = regexToRules("\\.", "Hello")
    console.log(JSON.stringify(rules, null, 2))
}