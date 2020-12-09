# Programmar
Programmar is an application made to allow users to easily generate simple lexers/parsers for their context free grammars. Available at: http://programmar-frontend.s3-website-us-west-2.amazonaws.com/. 

### Supported regular expression syntax
Programmar generated parsers must be language agnostic to ensure it can support multiple language targets. As a result, it has its own rolled regular expression system which parses input regexes, converts them into context free grammars, and appends the generated regular expression grammar to the input grammar. Additionally, because programmar outputs parsers which ignore whitespace, the regex engine has built in validation + subtle changes to existing regex features like `.` and `\D`.

#### Supported regex features
1. `\d`: [0-9]
2. `\w`: [a-zA-Z0-9_]
4. `\D`: [^\d] - whitespace
5. `\W`: [^\w] - whitespace
7. `+`: one or more
8. `*`: zero or more
9. `?`: one or zero times
10. `{n}`: n repetitions
11. `{i,j}`: i to j times
12. `{,j}`: less than or equal to j times
13. `.`: any non-whitespace character
14. `\`: escapes any character
15. `|`: logical OR
16. `()`: group
18. `[]`: any characters in bracket
19. `-`: range indicator if not last in bracket
20. `[^..]`: any character not in brackets - whitespace