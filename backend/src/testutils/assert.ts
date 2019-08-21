function assert(expression: boolean) {
    if(!expression) {
        throw Error('Expression does not evaluate to true.')
    }
}

function assertThrows(code: () => void) {
    try {
        code()
    } catch(e) {
        return
    }

    throw Error('Expected exception not thrown.')
}

assertThrows(() => {
    throw Error('TEST ERROR')
})

assert(true === true)

export { assert, assertThrows }