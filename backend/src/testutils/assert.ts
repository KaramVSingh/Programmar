function assert(expression: boolean) {
    if(!expression) {
        throw 'Expression does not evaluate to true.'
    }
}

function assertThrows(code: () => void) {
    try {
        code()
    } catch(e) {
        return
    }

    throw 'Expected exception not thrown.'
}

assertThrows(() => {
    throw Error('TEST ERROR')
})

assert(true === true)

export { assert, assertThrows }