"use strict";
exports.__esModule = true;
exports.Javascript = void 0;
var translatorUtils_1 = require("../translatorUtils");
var Javascript = /** @class */ (function () {
    function Javascript() {
    }
    // ----- files ----- //
    Javascript.prototype.lexerSrc = function (consts, body, functions) {
        var _this = this;
        var constLines = consts.map(function (c) { return _this["var"](c[0], c[1]); });
        var lexFunction = new translatorUtils_1.Func(translatorUtils_1.TOKEN, 'lex', [new translatorUtils_1.Var('str', translatorUtils_1.STRING)], body);
        var functionLines = functions.map(function (f) { return _this.func(f); });
        return translatorUtils_1.Lines.of(
        // top level variable declarations
        new translatorUtils_1.Lines(constLines), translatorUtils_1.BREAK_LINE, 
        // lex function
        this.func(lexFunction), 
        // helper functions
        new translatorUtils_1.Lines(functionLines));
    };
    Javascript.prototype.parserSrc = function (consts, body, functions) {
        var _this = this;
        var constLines = consts.map(function (c) { return _this["var"](c[0], c[1]); });
        var parseFunction = new translatorUtils_1.Func(translatorUtils_1.AST, 'parse', [new translatorUtils_1.Var('tokens', translatorUtils_1.TOKEN)], body);
        var functionLines = functions.map(function (f) { return _this.func(f); });
        return translatorUtils_1.Lines.of(
        // top level variable declarations
        new translatorUtils_1.Lines(constLines), translatorUtils_1.BREAK_LINE, 
        // lex function
        this.func(parseFunction), 
        // helper functions
        new translatorUtils_1.Lines(functionLines));
    };
    // ----- language specifics ----- //
    Javascript.prototype["var"] = function (variable, value) {
        if (value instanceof translatorUtils_1.Var) {
            var v = value;
            return new translatorUtils_1.Line("let " + variable.name + " = " + v.name);
        }
        else {
            return new translatorUtils_1.Line("let " + variable.name + " = " + this.value(value).name);
        }
    };
    Javascript.prototype.func = function (f) {
        var argNames = f.args.map(function (arg) { return arg.name; });
        return translatorUtils_1.Lines.of(new translatorUtils_1.Line("function " + f.name + "(" + argNames.join(', ') + ") {"), translatorUtils_1.TabbedLines.of(f.body), new translatorUtils_1.Line('}'), translatorUtils_1.BREAK_LINE);
    };
    Javascript.prototype.call = function (f, args) {
        var _this = this;
        var argVals = args.map(function (arg) {
            if (arg instanceof translatorUtils_1.Var) {
                return arg.name;
            }
            else {
                return _this.value(arg).name;
            }
        });
        return new translatorUtils_1.Var(f.name + "(" + argVals.join(', ') + ")", f.returnType);
    };
    Javascript.prototype.ret = function (v) {
        return new translatorUtils_1.Line("return " + v.name);
    };
    Javascript.prototype["if"] = function (c, body, other) {
        var open = [
            new translatorUtils_1.Line("if " + this._condition(c) + " {"),
            new translatorUtils_1.TabbedLines([body]),
        ];
        if (other) {
            open.push(new translatorUtils_1.Line('} else {'));
            open.push(new translatorUtils_1.TabbedLines([other]));
        }
        open.push(new translatorUtils_1.Line('}'));
        return new translatorUtils_1.Lines(open);
    };
    Javascript.prototype.forEach = function (v, arr, body) {
        var open = [
            new translatorUtils_1.Line("for (const " + v.name + " of " + arr.name + ") {"),
            new translatorUtils_1.TabbedLines([body]),
            new translatorUtils_1.Line("}")
        ];
        return new translatorUtils_1.Lines(open);
    };
    Javascript.prototype.none = function () { return new translatorUtils_1.Var('null', null); };
    Javascript.prototype.get = function (v, prop) {
        return new translatorUtils_1.Var(v.name + "." + prop.name, prop.type);
    };
    Javascript.prototype.add = function (a, b) {
        var aConv;
        if (a instanceof translatorUtils_1.Var) {
            aConv = a.name;
        }
        else {
            aConv = a.value.toString();
        }
        var bConv;
        if (b instanceof translatorUtils_1.Var) {
            bConv = b.name;
        }
        else {
            bConv = b.value.toString();
        }
        return new translatorUtils_1.Var("(" + aConv + " + " + bConv + ")", translatorUtils_1.INT);
    };
    Javascript.prototype.access = function (v, index) {
        var newType;
        switch (v.type) {
            case translatorUtils_1.STRING:
                newType = translatorUtils_1.CHAR;
                break;
            default:
                throw 'unimplemented';
        }
        if (index instanceof translatorUtils_1.Var) {
            return new translatorUtils_1.Var(v.name + "[" + index.name + "]", newType);
        }
        else {
            return new translatorUtils_1.Var(v.name + "[" + index.value + "]", newType);
        }
    };
    Javascript.prototype.exit = function (m) {
        if (m instanceof translatorUtils_1.Var) {
            return new translatorUtils_1.Line("throw " + m.name);
        }
        else {
            return new translatorUtils_1.Line("throw " + this.value(m).name);
        }
    };
    // ----- more complex functions ----- //
    Javascript.prototype.length = function (v) {
        return this.get(v, new translatorUtils_1.Var('length', translatorUtils_1.INT));
    };
    Javascript.prototype.substring = function (str, start, end_exclude) {
        var substr = new translatorUtils_1.Func(translatorUtils_1.STRING, 'substring', [start, end_exclude], translatorUtils_1.Lines.of());
        var call = this.call(substr, [start, end_exclude]);
        return this.get(str, call);
    };
    Javascript.prototype.strEquals = function (a, b) {
        return new translatorUtils_1.Condition(a, translatorUtils_1.ConditionalOperator.EQUALS, b);
    };
    // ----- internal ----- //
    Javascript.prototype._condition = function (c) {
        var left = c.left;
        var right = c.right;
        var leftConv;
        var rightConv;
        if (left instanceof translatorUtils_1.Condition) {
            leftConv = this._condition(left);
        }
        else if (left instanceof translatorUtils_1.Var) {
            leftConv = left.name;
        }
        else {
            leftConv = this.value(left).name;
        }
        if (right instanceof translatorUtils_1.Condition) {
            rightConv = this._condition(right);
        }
        else if (right instanceof translatorUtils_1.Var) {
            rightConv = right.name;
        }
        else {
            rightConv = this.value(right).name;
        }
        var operator;
        switch (c.operator) {
            case translatorUtils_1.ConditionalOperator.EQUALS:
                operator = '===';
                break;
            case translatorUtils_1.ConditionalOperator.GREATER:
                operator = '>';
                break;
            case translatorUtils_1.ConditionalOperator.GREATER_OR_EQUALS:
                operator = '>=';
                break;
            case translatorUtils_1.ConditionalOperator.LESS:
                operator = '<';
                break;
            case translatorUtils_1.ConditionalOperator.LESS_OR_EQUAL:
                operator = '<=';
                break;
            case translatorUtils_1.ConditionalOperator.NOT_EQUALS:
                operator = '!==';
                break;
            case translatorUtils_1.ConditionalOperator.OR:
                operator = '||';
                break;
            case translatorUtils_1.ConditionalOperator.AND:
                operator = '&&';
                break;
        }
        return "(" + leftConv + " " + operator + " " + rightConv + ")";
    };
    Javascript.prototype.value = function (v) {
        var _this = this;
        if (!v) {
            return this.none();
        }
        switch (v.type) {
            case translatorUtils_1.STRING_LIST:
                var convSL = v;
                var stringValues = convSL.value.map(function (strValue) { return _this.value(strValue).name; });
                return new translatorUtils_1.Var("[" + stringValues.join(', ') + "]", translatorUtils_1.STRING_LIST);
            case translatorUtils_1.STRING:
                var convS = v;
                return new translatorUtils_1.Var("'" + convS.value + "'", translatorUtils_1.STRING);
            case translatorUtils_1.AST:
                var convA = v;
                var rule = void 0;
                if (convA.rule instanceof translatorUtils_1.Var) {
                    rule = convA.rule.name;
                }
                else {
                    rule = this.value(convA.rule).name;
                }
                var data = void 0;
                if (convA.data instanceof translatorUtils_1.Var) {
                    data = convA.data.name;
                }
                else {
                    data = this.value(convA.data).name;
                }
                var token = void 0;
                if (convA.token instanceof translatorUtils_1.Var) {
                    token = convA.token.name;
                }
                else {
                    token = this.value(convA.token).name;
                }
                return new translatorUtils_1.Var("{ 'rule': " + rule + ", 'data': " + data + ", 'token': " + token + ", 'children: [] }", translatorUtils_1.AST);
            case translatorUtils_1.TOKEN:
                var convT = v;
                var curr = void 0;
                if (convT.curr instanceof translatorUtils_1.Var) {
                    curr = convT.curr.name;
                }
                else {
                    curr = this.value(convT.curr).name;
                }
                var next = void 0;
                if (convT.next instanceof translatorUtils_1.Var) {
                    next = convT.next.name;
                }
                else {
                    next = this.value(convT.next).name;
                }
                return new translatorUtils_1.Var("{ 'curr': " + curr + ", 'next': " + next + " }", translatorUtils_1.TOKEN);
            case translatorUtils_1.INT:
                var convI = v;
                return new translatorUtils_1.Var("" + convI.value, translatorUtils_1.INT);
            case translatorUtils_1.BOOLEAN:
                var convB = v;
                return new translatorUtils_1.Var("" + convB.value.toString(), translatorUtils_1.BOOLEAN);
            default:
                throw 'unimplemented';
        }
    };
    return Javascript;
}());
exports.Javascript = Javascript;
/*
class Javascript implements GrandLanguageTranslator {
    // THE FILE FUNCTIONS

    lexerHeader(): Line {
        return new Line('')
    }

    preLexer(): Line {
        return new Line('')
    }

    postLexer(): Line {
        return this.makeExport([ new TypedVariable(null, 'lex') ])
    }

    parserHeader(cfg: Cfg): Line {
        return new Line('')
    }

    preParser(): Line {
        return new Line('')
    }

    postParser(): Line {
        return this.makeExport([ new TypedVariable(null, 'parse') ])
    }

    fileExtention(isHeader: boolean): string {
        return 'js'
    }

    // THE STATEMENT FUNCTIONS

    makeExport(variables: TypedVariable[]): Line {
        const head = new Line('')
        for(let i = 0; i < variables.length; i++) {
            let variable: TypedVariable = variables[i]
            head.add(new Line(`exports.${variable.name} = ${variable.name}`))
        }
        
        return head.next
    }

    makeImport(variables: TypedVariable[], file: string) {
        const head = new Line('')
        for(let i = 0; i < variables.length; i++) {
            let variable: TypedVariable = variables[i]
            head.add(new Line(`const ${variable.name} = require(\'./${file}\')`))
        }

        return head.next
    }

    makeStruct(name: string, variables: TypedVariable[]): Line {
        const head: Line = new Line(`class ${name} {`)
        head.next = this._makeStruct(variables).tabUp()
        head.getLast().next = new Line('}')
        return head
    }

    private _makeStruct(variables: TypedVariable[]): Line {
        if(variables.length === 0) {
            return null
        }

        return new Line(variables[0].name, this._makeStruct(variables.slice(1)))
    }

    makeStaticArray(values: string[]): string {
        return `[${values.join(', ')}]`
    }

    makeVariableDeclaration(variable: TypedVariable, value: string): Line {
        return new Line(`let ${variable.name} = ${value}`)
    }

    makeBoolean(bool: boolean): string {
        return bool.toString()
    }

    makeFunctionDeclaration(func: TypedVariable, params: TypedVariable[], body: Line): Line {
        return new Line(`function ${func.name}(${params.map((value) => value.name).join(', ')}) {`).add(
            body.tabUp()
        ).add(new Line('}'))
    }

    makeClassicFor(variable: TypedVariable, start: string, end: string, body: Line): Line {
        return new Line(`for(${this.makeVariableDeclaration(variable, start.toString()).line}; ${variable.name} < ${end}; ${variable.name}++) {`).add(
            body.tabUp()
        ).add(new Line('}'))
    }

    makeFunctionCall(name: string, args: string[]): string {
        return `${name}(${args.join(', ')})`
    }

    makeConditionalOperator(operator: ConditionalOperator): string {
        switch(operator) {
            case ConditionalOperator.EQUALS:
            return '==='
            case ConditionalOperator.NOT_EQUALS:
            return '!=='
            case ConditionalOperator.LESS:
            return '<'
            case ConditionalOperator.GREATER:
            return '>'
            case ConditionalOperator.GREATER_OR_EQUALS:
            return '>='
            case ConditionalOperator.LESS_OR_EQUAL:
            return '<='
            default:
            throw 'Internal Error: Unimplemented.'
        }
    }

    makeCondition(condition: Condition): string {
        return `${condition.left} ${this.makeConditionalOperator(condition.operator)} ${condition.right}`
    }

    makeJoin(join: Join): string {
        switch(join) {
            case Join.AND:
            return '&&'
            case Join.OR:
            return '||'
            default:
            throw 'Internal Error: Unimplemented.'
        }
    }

    makeIf(conditions: Condition[], join: Join, body: Line, alternative: Line): Line {
        let gates: string[] = []
        for(let i = 0; i < conditions.length; i++) {
            gates.push(this.makeCondition(conditions[i]))
        }

        const line: Line = new Line('')
        if(gates.length === 1) {
            line.add(new Line(`if(${gates[0]}) {`))
        } else {
            let enclosed: string[] = gates.map((value: string) => `(${value})`)
            let spacedJoin: string = ` ${this.makeJoin(join)} `
            line.add(new Line(`if(${enclosed.join(spacedJoin)}) {`))
        }

        line.add(body.tabUp())

        if(alternative !== null) {
            line.add(new Line('} else {')).add(alternative.tabUp())
        }

        return line.add(new Line('}')).next
    }

    makeGetProperty(variable: string, property: string): string {
        return `${variable}.${property}`
    }

    makeGetArrayAccess(variable: string, index: string): string {
        return `${variable}[${index}]`
    }

    makeReturn(value: string): Line {
        return new Line(`return ${value}`)
    }

    makeObject(def: Type): string {
        return '{}'
    }

    makeSetVariable(variable: string, set: string): Line {
        return new Line(`${variable} = ${set}`)
    }

    makeNothing(): string {
        return 'null'
    }

    makeStringLength(variable: string): string {
        return `${variable}.length`
    }

    makeWhile(condition: Condition, body: Line): Line {
        return new Line(`while(${this.makeCondition(condition)}) {`).add(
            body.tabUp()
        ).add(new Line('}'))
    }

    makeAddition(left: string, right: string): string {
        return `${left} + ${right}`
    }

    makeSubtraction(left: string, right: string): string {
        return `${left} - ${right}`
    }

    makeBreak(): Line {
        return new Line('break')
    }

    makeContinue(): Line {
        return new Line('continue')
    }

    makeStringStartingAt(str: string, index: string): string {
        return `${str}.slice(${index})`
    }

    makeStringFromChar(variable: string): string {
        return variable
    }

    makeStringTemplate(template: string, variables: TypedVariable[]): string {
        let variableIndex = 0
        let newTemplate = '`'

        for(let i = 0; i < template.length; i++) {
            if(template[i] === '#') {
                newTemplate += '${' + variables[variableIndex++].name + '}'
            } else {
                newTemplate += template[i]
            }
        }

        return newTemplate + '`'
    }

    makeExit(message: string): Line {
        return new Line(`throw ${message}`)
    }

    makeEmptyList(type: DecoratedType): string {
        return '[]'
    }

    makeEmptyString(): string {
        return '""'
    }

    makeGetCharValue(char: string): string {
        return `${char}.charCodeAt(0)`
    }

    makeAddToArray(arr: string, index: string): Line {
        return new Line(`${arr}.push(${index})`)
    }
}

export { Javascript }
*/ 
