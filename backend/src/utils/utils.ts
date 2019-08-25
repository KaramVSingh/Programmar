function assertDefined(input: Object) {
    if(input === null || input === undefined) {
        throw 'Illegal Argument: Object is not defined.'
    }
}

export { assertDefined }