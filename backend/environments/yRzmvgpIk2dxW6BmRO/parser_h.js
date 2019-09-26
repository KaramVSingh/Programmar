class Ast {
    type = null
    data = null
    children = []

    constructor() {
        this.type = null
        this.data = null
        this.children = []
    }

    constructor(type, data, children) {
        this.type = type
        this.data = data
        this.children = children
    }
}

export { Ast }