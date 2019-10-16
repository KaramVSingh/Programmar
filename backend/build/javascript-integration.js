const app = require('./app/app')

const result = app.entrypoint({
    "input": {
        "rules": [
            {
                "name": "sampleRule",
                "type": "RULE",
                "is": [
                    [ { "type": "RULE", "ref": "number" }, { "type": "LITERAL", "ref": "+" }, { "type": "RULE", "ref": "number" } ],
                    [ { "type": "RULE", "ref": "number" }, { "type": "LITERAL", "ref": "-" }, { "type": "RULE", "ref": "number" } ],
                    [ { "type": "RULE", "ref": "number" }, { "type": "LITERAL", "ref": "==" }, { "type": "RULE", "ref": "number" } ],
                    [ { "type": "RULE", "ref": "number" }, { "type": "LITERAL", "ref": "<=>" }, { "type": "RULE", "ref": "number" } ],
                    [ { "type": "RULE", "ref": "number" }, { "type": "LITERAL", "ref": "=" }, { "type": "RULE", "ref": "number" } ]
                ]
            },
            {
                "name": "number",
                "type": "REGEX",
                "is": "[0-9]+"
            }
        ]
    },
    "metadata": {
        "ignoreWhitespace": false,
        "language": 'JAVASCRIPT',
        "name": "testlang",
        "first": "sampleRule"
    }
}).then((value) => {
    console.log(value)
})