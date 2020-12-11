import { Cfg } from '../cfg/cfg'
import { Lines, Var, Func, Line, Value, Condition, INT_VALUE } from './translatorUtils';

interface GrandLanguageTranslator {

    /**
     * This function is intended to abstract all language specific details before and after the lexer.
     * I.e. Java has imports, main class, public static main. C has int main {}. The lines passed in are the body of the lexer
     * 
     * @param consts variables that can be accessed in lexer + helpers
     * @param lexer body of the lexer as generated in files.ts
     * @param functions helper functions as generated in files.ts
     * @returns Lines representing the entire lexer, lang specific details included
     */
    lexerSrc: (consts: [Var, Value][], lexer: Lines, functions: Func[]) => Lines

    // ----- Language specifics ----- //
    var: (v: Var, preset: Value | Var) => Line

    func: (f: Func) => Lines

    call: (f: Func, args: (Var|Value)[]) => Var

    ret: (v: Var) => Line

    if: (c: Condition, body: Lines, other: Lines) => Lines

    forEach: (v: Var, arr: Var, body: Lines) => Lines

    none: () => Var

    get: (v: Var, prop: Var) => Var

    access: (v: Var, index: INT_VALUE|Var) => Var

    add: (a: INT_VALUE|Var, b: INT_VALUE|Var) => Var

    // ----- more complex functions ----- //
    length: (v: Var) => Var

    substring: (str: Var, start: Var, end_exclude: Var) => Var

    strEquals: (a: Var, b: Var) => Condition

    // to be used internally, keeping it here to avoid forgetting
    value: (v: Value) => Var
}

/*
interface GrandLanguageTranslator {
    // THE FILE FUNCTIONS

    /**
     * This function will return the appropriate header file for the lexer.
     * It is responsible for creating a Token type and for some languages, defining a language prototype.
     * @returns a string representation of the header
     /
    lexerHeader: () => Line

    /**
     * This function will return the parser header.
     * It is responsible for creating an Ast type and for some languages, 
     * defining a prototype for all of the parse functions.
     * @param cfg is the context free grammar to be parsed.
     * @returns a string representation of the header
     /
    parserHeader: (cfg: Cfg) => Line

    /**
     * This is for language specific things to be included at the begining of a file
     /
    preLexer: () => Line
    preParser: () => Line

    /**
     * This is for language specific things to be included at the end of a file
     /
    postLexer: () => Line
    postParser: () => Line

    /**
     * This is for file creation: no .js, just js
     /
    fileExtention: (isHeader: boolean) => string

    // THE STATEMENT FUNCTION

    /**
     * This function defines an export
     * @param variables a list of things to export
     /
    makeExport: (variables: TypedVariable[]) => Line

    /**
     * This function defines an import/include.
     * @param variables are the things to import from the file
     * @param file is the name of the file with no path
     /
    makeImport: (variables: TypedVariable[], file: string) => Line

    /**
     * This function defines a struct
     * @param name the name of the struce
     * @param data the instance variables of the struct
     /
    makeStruct: (name: String, variables: TypedVariable[]) => Line

    /**
     * This function defines a static array. Used for things like all tokens
     * @param values all of the values in the array
     /
    makeStaticArray: (values: string[]) => string

    /**
     * This function defines a variable declaration
     * @param variable this includes the type and name of the variable
     * @param value this is the init of the variable
     /
    makeVariableDeclaration: (variable: TypedVariable, value: string) => Line

    /**
     * This function is responsible for defining what a boolean looks like
     * @param bool
     /
    makeBoolean: (bool: boolean) => string

    /**
     * This function is responsible for defining the creation of a function declaration
     * @param func is the name and type of the function
     * @param params are the parameters of the function
     * @param body is the body of the function
     /
    makeFunctionDeclaration: (func: TypedVariable, params: TypedVariable[], body: Line) => Line

    /**
     * This function is responsible for defining a standard issue for loop
     * @param variable is the itterating var
     * @param start is the start point
     * @param end is the end point
     * @param body is the inside of the for loop
     /
    makeClassicFor: (variable: TypedVariable, start: string, end: string, body: Line) => Line

    /**
     * This function is responsible for defining a function call
     * @param name is the function name
     * @param args are the arguments to the function call
     /
    makeFunctionCall: (name: string, args: string[]) => string

    /**
     * This function will be responsible for defining how an operator looks in the language
     * @param operator this is the operator
     /
    makeConditionalOperator: (operator: ConditionalOperator) => string

    /**
     * This function is responsible for defining a conditional
     * You will have to factor information about the type of the arguments
     * @param condition this is the conditional
     /
    makeCondition: (condition: Condition) => string

    /**
     * This function will be responsible defining and / or joins
     * @param join this will indicate what type of join
     /
    makeJoin: (join: Join) => string

    /**
     * This function is responsible for defining what an if statement looks like
     * @param conditions the conditionals
     * @param join what will join the conditions
     * @param body this is the body of the if
     * @param alternative this is the ele case of the if
     /
    makeIf: (conditions: Condition[], join: Join, body: Line, alternative: Line) => Line

    /**
     * This function is responsible for defining how you get a property from a struct
     * @param variable this is the var
     * @param property this is the property
     /
    makeGetProperty: (variable: string, property: string) => string

    /**
     * This function is responsible for defining how array access will look
     * @param variable this is the var
     * @param index this is the index to access
     /
    makeGetArrayAccess: (variable: string, index: string) => string

    /**
     * this function is responsible for defining a return for a function
     * @param return string
     /
    makeReturn: (value: string) => Line

    /**
     * This function is responsible for instatiating an object
     * @param def this is the type of the object
     /
    makeObject: (def: Type) => string

    /**
     * This function defines setting a variable
     * @param variable variable to set
     * @param set the set value
     /
    makeSetVariable: (variable: string, set: string) => Line

    /**
     * Returns null
     /
    makeNothing: () => string

    /**
     * This function will return the length of the string variable passed in
     * @param variable
     /
    makeStringLength: (variable: string) => string

    /**
     * This function defines a while (see if)
     * @param condition
     * @param body
     /
    makeWhile: (condition: Condition, body: Line) => Line

    /**
     * This function defines addition
     * @param left
     * @param right
     /
    makeAddition: (left: string, right: string) => string

    /**
     * this function defines subtraction
     * @param left
     * @param right
     /
    makeSubtraction: (left: string, right: string) => string

    /**
     * This function just makes break
     /
    makeBreak: () => Line

    /**
     * This function just makes continue
     /
    makeContinue: () => Line

    /**
     * This function will be used to get the string starting at a specific index
     * @param str
     * @param index
     /
    makeStringStartingAt: (str: string, index: string) => string

    /**
     * Make string from char variable
     * @param variable
     /
    makeStringFromChar: (variable: string) => string

    /**
     * Make string template. string will have #'s where variables will be
     * @param template
     * @param variables
     /
    makeStringTemplate: (template: string, variables: TypedVariable[]) => string

    /**
     * Make exit from program
     * @param failureMessage
     /
    makeExit: (message: string) => Line

    /**
     * Make an empty mutable list
     * @param type -- The type in the list
     /
    makeEmptyList: (type: DecoratedType) => string

    /**
     * Make an empty and mutable string
     /
    makeEmptyString: () => string

    /**
     * Make get char numerical value
     /
    makeGetCharValue: (char: string) => string

    /**
     * Make add to array
     * @param arr
     * @param index
     /
    makeAddToArray: (arr: string, index: string) => Line
}

*/

export { GrandLanguageTranslator }
