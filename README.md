# Programmar

Mock available at http://programmar-frontend.s3-website-us-west-2.amazonaws.com/. 

## Round 2:
The application allows you to define a context free grammar (CFG) and produces a lexer, parser, and evaluator. The front end allows you to define the grammar as a set of rules which define how the grammar should look. Once the grammar is defined, it will produce the nessesary code to parse the grammar in the language of your choice. The parser is created in the model of a recursive descent parser.

### Goals:
1. Support UTF-8 Encoding.
2. No Regular expresssions (REGEX will be baked into CFG).
3. Support multiple languages but make parsing language agnostic (this includes a UTF-8 parser for C).

### Vocabulary
- Grammar: Each grammar is a set of rules which define its structure
- Rule: Rules are a set of options which which define a syntax (A => hello | world) where A is the rule and hello, world are the options
- Options: Options are each variant of syntax for a rule. They are defined by a list of tokens
- Token: Tokens are the most fine grained aspect of a grammar.

### What makes an Input:
```
L Rule[]
 L Name
 L Type
  L Is[][]
   L Type
   L Reference
```

### CFG special case rules
1. Identical First Sets: This occurs if the first() of multiple options in the rule are identical. Normally this would cause ambiguity as to which option to choose. In this case, the best solution is to parse all identical steps until we get to a differentiating step.
2. Overlapping First Sets: This occurs when the first() of multiple rules are not identical but do have overlapping options. This has no solutions and therefore the user must design a grammar that does not result in this. We will notify the user if they have this issue.
3. Left Recursion: This occurs when a rule references itself as the first step for any number of options. This can be solved by introducing a new step to the grammar, however we will not do that automatically to preserve the code structure. We will notify the user if they have this issue.
4. Loops: This occurs when a rule at some point references itself. This is allowed as long as there is at least one option that does not reference itself.

### Lexer
We will create a lexer which is able to be either white-space indiferent or take into account white-space. It will return a linked list of tokens which contain information about their match.

### Parser
TODO.

### Regex Validation
In addition to validating the CFG, the Json is also only valid if every RULE referenced exists. Also, all tokens listed must be valid regular expressions. This means that if a user wants to match an open bracket ([), the regular expression must be /[. This can be handled in the front end.

### Supported regular expression syntax
1. `\d` = `[0-9]`
2. `\w` = `[a-zA-Z0-9_]`
3. `\s` = `[\t\n\r ]`
4. `\D` = `[^\d]`
5. `\W` = `[^\w]`
6. `\S` = `[^\s]`
7. `+` = `one or more`
8. `*` = `zero or more`
9. `?` = `one or zero times`
10. `{n}` = `n repetitions`
11. `{i,j}` = `i to j times`
12. `{,j}` = `less than or equal to j times`
13. `.` = `any character`
14. `\` = `escapes any character`
15. `|` = `logical OR`
16. `()` = `group` 
18. `[]` = `any characters in bracket`
19. `-` = `range indicator if not last in bracket`
20. `[^..]` = `any character not in brackets`
