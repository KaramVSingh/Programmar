function validate(input: object, key: string) {
    if(!input[key]) { throw `Illegal Argument: ${key} not found in input.` }
}

export { validate }