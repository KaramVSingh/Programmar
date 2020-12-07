# Programmar
Programmar is an application made to allow users to easily generate simple lexers/parsers for their context free grammars. Available at: http://programmar-frontend.s3-website-us-west-2.amazonaws.com/. 

### Supported regular expression syntax
1. `\d`: [0-9]
2. `\w`: [a-zA-Z0-9_]
4. `\D`: [^\d]
5. `\W`: [^\w]
7. `+`: one or more
8. `*`: zero or more
9. `?`: one or zero times
10. `{n}`: n repetitions
11. `{i,j}`: i to j times
12. `{,j}`: less than or equal to j times
13. `.`: any character
14. `\`: escapes any character
15. `|`: logical OR
16. `()`: group
18. `[]`: any characters in bracket
19. `-`: range indicator if not last in bracket
20. `[^..]`: any character not in brackets