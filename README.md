# Programmar

The application allows you to define a context free grammar (CFG) and produces a lexer, parser, and evaluator. The front end allows you to define the grammar as a set of rules which define how the grammar should look. Once the grammar is defined, it will produce the nessesary code to parse the grammar in the language of your choice. The parser is created in the model of a recursive descent parser.

## CFG Json Representation

Below is the sample JSON for the context free grammar. The Language option is included for the front-end to make a specific language request to the back-end. The token option is included to make the publish feature idempotent.

```
{
    "RequestData": {
        "Language": "Python",   // python, java, javascript, c
        "Token": "askdf09qsnf1934t1odsf"
    },
    "FactorWhiteSpace": "False",
    "Name": "MyGrammar",
    "FirstRule": "STATEMENT",
    "Rules": [
        {
            "Name": "STATEMENT",
            "Type": "RULE"
            "Representation": [
                [
                    {
                        "Type": "RULE",
                        "Data": "STATEMENT_OPTIONS"
                    },
                    {
                        "Type": "RULE",
                        "Data": "STATEMENT"
                    }
                ],
                [
                    {
                        "Type": "RULE",
                        "Data": "STATEMENT_OPTIONS"
                    }
                ]
            ]
        },
        {
            "Name": "STATEMENT_OPTIONS",
            "Representation": [
                [
                    {
                        "Type": "RULE",
                        "Data": "IF"
                    }
                ],
                [
                    {
                        "Type" :"RULE",
                        "Data": "WHILE"
                    }
                ]
            ]
        },
        {
            "Name": "IF",
            "Representation": [
                [
                    {
                        "Type": "REGEX",
                        "Data": "if"
                    },
                    {
                        "Type": "REGEX",
                        "Data": "("
                    },
                    {
                        "Type": "RULE",
                        "Data": "EXPRESSION"
                    },
                    {
                        "Type": "REGEX",
                        "Data": ")"
                    },
                    {
                        "Type": "REGEX",
                        "Data": "{"
                    },
                    {
                        "Type": "RULE",
                        "Data": "STATEMENT"
                    },
                    {
                        "Type": "REGEX",
                        "Data": "}"
                    }
                ]
            ]
        },
        {
            "Name": "WHILE",
            "Representation": [
                [
                    {
                        "Type": "REGEX",
                        "Data": "while"
                    },
                    {
                        "Type": "REGEX",
                        "Data": "("
                    },
                    {
                        "Type": "RULE",
                        "Data": "EXPRESSION"
                    },
                    {
                        "Type": "REGEX",
                        "Data": ")"
                    },
                    {
                        "Type": "REGEX",
                        "Data": "{"
                    },
                    {
                        "Type": "RULE",
                        "Data": "STATEMENT"
                    },
                    {
                        "Type": "REGEX",
                        "Data": "}"
                    }
                ]
            ]
        },
        {
            "Name": "EXPRESSION",
            "Representation": [
                [
                    {
                        "Type": "RULE",
                        "Data": "INTEGER"
                    }
                ],
                [
                    {
                        "Type": "RULE",
                        "Data": "FLOAT"
                    }
                ],
                [
                    {
                        "Type": "RULE",
                        "Data": "STRING"
                    }
                ]
            ]
        }
    ]
}
```

## Json Validation
In addition to validating the CFG, the Json is also only valid if every RULE referenced exists. Also, all tokens listed must be valid regular expressions. This means that if a user wants to match an open bracket ([), the regular expression must be /[. This can be handled in the front end. 

## CFG special case rules
1. Identical First Sets: This occurs if the first() of multiple options in the rule are identical. Normally this would cause ambiguity as to which option to choose. In this case, the best solution is to parse all identical steps until we get to a differentiating step.
2. Overlapping First Sets: This occurs when the first() of multiple rules are not identical but do have overlapping options. This has no solutions and therefore the user must design a grammar that does not result in this. We will notify the user if they have this issue.
3. Left Recursion: This occurs when a rule references itself as the first step for any number of options. This can be solved by introducing a new step to the grammar, however we will not do that automatically to preserve the code structure. We will notify the user if they have this issue.
4. Loops: This occurs when a tule at some point references itself. This is allowed as long as there is at least one option that does not reference itself.

## Vocabulary
- Grammar: Each grammar is a set of rules which define its structure
- Rule: Rules are a set of options which which define a syntax (A => hello | world) where A is the rule and hello, world are the options
- Options: Options are each variant of syntax for a rule. They are defined by a list of tokens
- Token: Tokens are the most fine grained aspect of a grammar.

Vocab in context: (A => hello world | foo bar) (B => Context Free | Grammar)
In this example the whole example is a grammar, A and B are rules, "hello world", "foo bar", "Context Free", and "Grammar" are all options, and "hello", "world", "foo", "bar", "Context", "Free", and "Grammar" are tokens. 

## Lexer
We will create a lexer which is able to be either white-space indiferent or take into account white-space. It will return a linked list of tokens which contain information about their match.

### Supported regular expression syntax
1. \d = [0-9]
2. \w = [a-zA-Z0-9_]
3. \s = [\t\n\r ]
4. \D = [^\d]
5. \W = [^\w]
6. \S = [^\s]
7. + = one or more
8. * = zero or more
9. ? = one or zero times
10. {n} = n repetitions
11. {i,j} = i to j times
12. {i,} = i or more times
12. {,j} = less than or equal to j times
13. . = any character
14. \ = escapes any character
15. | = logical OR
16. () = group 
18. [] = any characters in bracket
19. - = range indicator if not last in bracket
20. [^..] = any character not in brackets


# for me
we now parse regex into a cfg which is baked into the reported cfg. This provides a few things that need to be taken into account with the lexer/parser. (1) We have types [RULE, LITERAL, + RANGE, - RANGE]. This means that the lexer needs to do a few things differently. We need to lex each character. Under normal circumstances, when a un-identifiable character apears, we would stop lexing, however because the parser can contain a range, we want to lex all un-matchable characters. This will allow us to handle the matching/identify weird tokens in the parse step. (2) the OR operator in regex can lead to first set overlap. As a result, we will modify our parser to (1) identify all POSSIBLE next rules, and then try each one until one does not throw an exception. If all throw exceptions, then we will report the last one as the error exception. 