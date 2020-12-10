# Programmar
Programmar is an application made to allow users to easily generate simple lexers/parsers for their context free grammars. Available at: http://programmar-frontend.s3-website-us-west-2.amazonaws.com/. 

### Supported regular expression syntax
Programmar generated parsers must be language agnostic to ensure it can support multiple language targets. As a result, it has its own rolled regular expression system which parses input regexes, converts them into context free grammars, and appends the generated regular expression grammar to the input grammar. Additionally, because programmar outputs parsers which ignore whitespace, the regex engine has built in validation + subtle changes to existing regex features like `.` and `\D`.

#### Supported regex features
- `\d`: [0-9]
- `\w`: [a-zA-Z0-9_]
- `\D`: [^\d] - whitespace
- `\W`: [^\w] - whitespace
- `+`: one or more
- `*`: zero or more
- `?`: one or zero times
- `{n}`: n repetitions
- `{i,j}`: i to j times
- `{,j}`: less than or equal to j times
- `.`: any non-whitespace character
- `\`: escapes any character
- `|`: logical OR
- `()`: group
- `[]`: any characters in bracket
- `-`: range indicator if not last in bracket
- `[^..]`: any character not in brackets - whitespace