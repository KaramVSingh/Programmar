from enum import Enum

class Regex:
    def __init__(self, expression):
        self.expression = expression

    class _Token:
        def __init__(self, value, next_token):
            self.value = value
            self.next = next_token

    # groups escaped characters
    def _pre_lex(self, expression):
        # get current token value
        if len(expression) == 0:
            return None

        # escape characters
        value_size = 1
        if len(expression) == 1:
            if expression[0] == '\\':
                raise Exception('Lex Error: expression escapes a null character.')
        else:
            if expression[0] == '\\':
                value_size = 2
        
        return self._Token(expression[0:value_size], self._pre_lex(expression[value_size:]))
    
    # groups tokens of length > 1
    def _lex(self, expression):
        def add_to(tail, arg):
            if arg == '':
                return tail
            elif tail.value == '':
                tail.value = arg
                return tail
            else:
                tail.next = self._Token(arg, None)
                return tail.next

        pre = self._pre_lex(expression)
        head = self._Token('', None)
        tail = head
        
        # group [] and {} (will only ever be doing one of those at a time)
        case = None
        curr_value = ''
        stage = 0
        while pre != None:
            curr_token = pre.value
            pre = pre.next

            if case == 'BRACKETS':
                curr_value += curr_token
                if curr_token == ']':
                    case = None
                    tail = add_to(tail, curr_value)
                    curr_value = ''
            elif case == 'BRACES':
                curr_value += curr_token
                if stage == 0:
                    if curr_token.isdigit():
                        stage = 1
                    elif curr_token == ',':
                        stage = 2
                    else:
                        raise Exception('Lex Error: unexpected character in braces.')
                elif stage == 1:
                    if curr_token.isdigit():
                        pass
                    elif curr_token == ',':
                        stage = 2
                    elif curr_token == '}':
                        case = None
                        tail = add_to(tail, curr_value)
                        curr_value = ''
                    else:
                        raise Exception('Lex Error: unexpected character in braces.')
                elif stage == 2:
                    if curr_token.isdigit():
                        pass
                    elif curr_token == '}':
                        case = None
                        tail = add_to(tail, curr_value)
                        curr_value = ''
                    else:
                        raise Exception('Lex Error: unexpected character in braces.')
            else:
                if curr_token == '[':
                    case = 'BRACKETS'
                    tail = add_to(tail, curr_value)
                    curr_value = curr_token
                elif curr_token == '{':
                    case = 'BRACES'
                    tail = add_to(tail, curr_value)
                    curr_value = curr_token
                    stage = 0
                else:
                    tail = add_to(tail, curr_token)
        
        if case != None:
            expected = ']' if case == 'BRACKETS' else '}'
            raise Exception(f'Lex Error: unexpected end of regular expression, expected a {expected}.')
        
        if curr_value != '':
            curr_value = add_to(tail, curr_value)

        return head

    class _Ast:
        def __init__(self, type, data, children):
            self.type = type
            self.data = data
            self.children = children

    @staticmethod
    def _lookahead(token_list):
        if token_list == None:
            return None
        return token_list.value

    def _consume_token(self, token_list, expected):
        if token_list == None:
            raise Exception(f'Parse Error: unexpected end of regular expression, expected a {expected}.')
        if self._lookahead(token_list) != expected:
            raise Exception(f'Parse Error: expected token: {expected}, got token: {self._lookahead(token_list)}.')
        return token_list.value, token_list.next

    # parses the regular expression
    def _parse_regex(self, token_list):
        if token_list == None or token_list.value == '':
            raise Exception('Parse Error: cannot parse an empty regular expression.')
        else:
            return self._parse_or(token_list)[0]

    class _Types(Enum):
        OR = 0
        CONCAT = 1
        CHAR_DUPLICATION = 2
        PAREN = 3
        GROUP = 4
        UNIT = 5
    
    _NOT_FIRST_UNIT = ['[', '(', '{', '*', '?', '+', '|', ']', ')', '}']
    _NOT_FIRST_GROUP = _NOT_FIRST_UNIT[1:]
    _NOT_FIRST_PAREN = _NOT_FIRST_GROUP[1:]
    _NOT_FIRST_CHAR_DUPLICATION = _NOT_FIRST_PAREN[4:]
    _NOT_FIRST_CONCAT = _NOT_FIRST_CHAR_DUPLICATION
    _NOT_FIRST_OR = _NOT_FIRST_CONCAT[1:]

    # Parses the OR operation (|)
    def _parse_or(self, token_list):
        # breakpoint()
        if self._lookahead(token_list) not in self._NOT_FIRST_CONCAT:
            left, token_list = self._parse_concat(token_list)
        else:
            raise Exception(f'Parse Error: cannot parse token: {self._lookahead(token_list)}.')

        if token_list == None:
            return left, token_list
        elif self._lookahead(token_list) == '|':
            value, token_list = self._consume_token(token_list, '|')
            right, token_list = self._parse_or(token_list)
            return self._Ast(self._Types.OR, value, [left, right]), token_list
        else:
            return left, token_list
        
    # Parses the CONCAT operation (ab)
    def _parse_concat(self, token_list):
        # breakpoint()
        if self._lookahead(token_list) not in self._NOT_FIRST_CHAR_DUPLICATION:
            left, token_list = self._parse_char_duplication(token_list)
        else:
            raise Exception(f'Parse Error: cannot parse token: {self._lookahead(token_list)}.')
        
        if token_list == None:
            return left, token_list
        elif self._lookahead(token_list) != None and self._lookahead(token_list) not in self._NOT_FIRST_CONCAT:
            right, token_list = self._parse_concat(token_list)
            return self._Ast(self._Types.CONCAT, None, [left, right]), token_list
        else:
            return left, token_list

    # Parses the CHAR_DUPLICATION operation (+*?{})
    def _parse_char_duplication(self, token_list):
        # breakpoint()
        if self._lookahead(token_list) not in self._NOT_FIRST_PAREN:
            left, token_list = self._parse_paren(token_list)
        else:
            raise Exception(f'Parse Error: cannot parse token: {self._lookahead(token_list)}.')
        
        if token_list == None:
            return left, token_list
        elif self._lookahead(token_list)[0] in ['+', '*', '?', '{']:
            value, token_list = self._consume_token(token_list, self._lookahead(token_list))
            return self._Ast(self._Types.CHAR_DUPLICATION, value, [left]), token_list
        else:
            return left, token_list
    
    # Parses the PAREN operation (())
    def _parse_paren(self, token_list):
        # breakpoint()
        if self._lookahead(token_list) == '(':
            value, token_list = self._consume_token(token_list, '(')
            middle, token_list = self._parse_or(token_list)
            value, token_list = self._consume_token(token_list, ')')
            return self._Ast(self._Types.PAREN, None, [middle]), token_list
        elif self._lookahead(token_list)[0] not in self._NOT_FIRST_GROUP:
            left, token_list = self._parse_group(token_list)
            return left, token_list
        else:
            raise Exception(f'Parse Error: cannot parse token: {self._lookahead(token_list)}.')

    # Parses the GROUP operation ([])
    def _parse_group(self, token_list):
        # breakpoint()
        if self._lookahead(token_list)[0] == '[':
            value, token_list = self._consume_token(token_list, self._lookahead(token_list))
            return self._Ast(self._Types.GROUP, value, []), token_list
        elif self._lookahead(token_list) not in self._NOT_FIRST_UNIT:
            value, token_list = self._consume_token(token_list, self._lookahead(token_list))
            return self._Ast(self._Types.UNIT, value, []), token_list

    class _NfaNode:
        class _Range:
            @staticmethod
            def _to_range(value):
                if value == '\\d':
                    return Regex._NfaNode._Range(frozenset([('0', '9')]), True)
                elif value == '\\D':
                    return Regex._NfaNode._Range(frozenset([('0', '9')]), False)
                elif value == '\\w':
                    return Regex._NfaNode._Range(frozenset([('a', 'z'), ('A', 'Z'), ('0', '9'), ('_', '_')]), True)
                elif value == '\\W':
                    return Regex._NfaNode._Range(frozenset([('a', 'z'), ('A', 'Z'), ('0', '9'), ('_', '_')]), False)
                elif value == '\\s':
                    return Regex._NfaNode._Range(frozenset([('\t', '\t'), ('\n', '\n'), ('\r', '\r'), (' ', ' ')]), True)
                elif value == '\\S':
                    return Regex._NfaNode._Range(frozenset([('\t', '\t'), ('\n', '\n'), ('\r', '\r'), (' ', ' ')]), False)
                elif value == '\\.':
                    return Regex._NfaNode._Range(frozenset([(chr(0), chr(127))]), True)
                else:
                    return Regex._NfaNode._Range(frozenset([(value[1], value[1])]), True)

            def __init__(self, ranges, is_affirmative):
                for range in ranges:
                    if ord(range[0]) > ord(range[1]):
                        raise Exception(f'Parse Error: Ascii code for {range[0]} > {range[1]}.')

                self.ranges = ranges
                self.is_affirmative = is_affirmative
            
            def __eq__(self, value):
                if len(self.ranges) != len(value.ranges):
                    return False
                    
                for r_1, r_2 in zip(self.ranges, value.ranges):
                    if r_1[0] != r_2[0] or r_1[1] != r_2[1]:
                        return False

                return self.is_affirmative == value.is_affirmative

            def __hash__(self):
                return hash(str(hash(self.ranges)) + str(self.is_affirmative))
            
            def _is_valid(self, v):
                for range in self.ranges:
                    if ord(v) >= ord(range[0]) and ord(v) <= ord(range[1]):
                        return self.is_affirmative
                
                return not self.is_affirmative

            def _add_range(self, n_ranges):
                if self.is_affirmative == n_ranges.is_affirmative:
                    self.ranges = self.ranges.union(n_ranges.ranges)
                else:
                    raise Exception('Internal Error: Cannot add conflicting type ranges.')

        def __init__(self):
            self.transitions = {}
            self.start = False
            self.end = False

        def _set_start(self):
            self.start = True

        def _set_end(self):
            self.end = True

        # transition is (delta, _NfaNode)
        def _add_transition(self, delta, node):
            if delta in self.transitions:
                self.transitions[delta].append(node)
            else:
                self.transitions[delta] = [node]

    # returns start, end
    def _ast_to_nfa(self, ast):
        start = self._NfaNode()
        end = self._NfaNode()

        # if we run into an or:
        #          o
        #   - o -<   >- o -
        #          o
        if ast.type == self._Types.OR:
            left_start, left_end = self._ast_to_nfa(ast.children[0])
            right_start, right_end = self._ast_to_nfa(ast.children[1])
            start._add_transition(None, left_start)
            start._add_transition(None, right_start)
            left_end._add_transition(None, end)
            right_end._add_transition(None, end)

        # if we run into a concat:
        #
        #   - o - d_t - o -
        #
        elif ast.type == self._Types.CONCAT:
            left_start, left_end = self._ast_to_nfa(ast.children[0])
            right_start, right_end = self._ast_to_nfa(ast.children[1])
            start._add_transition(None, left_start)
            left_end._add_transition(None, right_start)
            right_end._add_transition(None, end)

        # if we run into a char duplication:
        #         <--
        #   - o - a_t - o -
        #
        elif ast.type == self._Types.CHAR_DUPLICATION:
            if ast.data == '*':
                middle_start, middle_end = self._ast_to_nfa(ast.children[0])
                start._add_transition(None, middle_start)
                start._add_transition(None, middle_end)
                middle_end._add_transition(None, end)
                end._add_transition(None, middle_start)
            elif ast.data == '?':
                middle_start, middle_end = self._ast_to_nfa(ast.children[0])
                start._add_transition(None, middle_start)
                start._add_transition(None, end)
                middle_end._add_transition(None, end)
            elif ast.data == '+':
                middle_start, middle_end = self._ast_to_nfa(ast.children[0])
                start._add_transition(None, middle_start)
                middle_end._add_transition(None, end)
                end._add_transition(None, middle_start)
            else:
                # specified duration token
                parameters = ast.data[1:-1].split(',')
                for i in range(0, len(parameters)):
                    if parameters[i] == '':
                        parameters[i] = None
                    elif int(parameters[i]) < 1:
                        raise Exception(f'Parse Error: Unable to use non-positive number: {parameters[i]}')
                    else: 
                        parameters[i] = int(parameters[i])

                if len(parameters) == 1:
                    last_end = start
                    middle_start = None
                    middle_end = None
                    for i in range(0, parameters[0]):
                        middle_start, middle_end = self._ast_to_nfa(ast.children[0])
                        last_end._add_transition(None, middle_start)
                        last_end = middle_end

                    last_end._add_transition(None, end)
                else:
                    if parameters[1] == None:
                        # i or more times
                        last_end = start
                        middle_start = None
                        middle_end = None
                        for i in range(0, parameters[0]):
                            middle_start, middle_end = self._ast_to_nfa(ast.children[0])
                            last_end._add_transition(None, middle_start)
                            last_end = middle_end

                        last_end._add_transition(None, end)
                        end._add_transition(None, middle_start)
                    elif parameters[0] == None:
                        # less than or equal to j times
                        last_end = start
                        middle_start = None
                        middle_end = None
                        for i in range(0, parameters[1]):
                            middle_start, middle_end = self._ast_to_nfa(ast.children[0])
                            last_end._add_transition(None, middle_start)
                            last_end._add_transition(None, end)
                            last_end = middle_end

                        last_end._add_transition(None, end)
                    else:
                        # between i and j times
                        if parameters[1] <= parameters[0]:
                            raise Exception('Parse Error: {i,j} such that j > i.')

                        last_end = start
                        middle_start = None
                        middle_end = None
                        for i in range(0, parameters[0]):
                            middle_start, middle_end = self._ast_to_nfa(ast.children[0])
                            last_end._add_transition(None, middle_start)
                            last_end = middle_end
                        
                        for i in range(parameters[0], parameters[1]):
                            middle_start, middle_end = self._ast_to_nfa(ast.children[0])
                            last_end._add_transition(None, middle_start)
                            last_end._add_transition(None, end)
                            last_end = middle_end

                        last_end._add_transition(None, end)

        # if we run into a paren:
        #
        #   - o - (o - o - o) - o
        #
        elif ast.type == self._Types.PAREN:
            middle_start, middle_end = self._ast_to_nfa(ast.children[0])
            start._add_transition(None, middle_start)
            middle_end._add_transition(None, end)

        # if we run into a group:
        #          o
        #   - o -<   >- o -
        #          o
        elif ast.type == self._Types.GROUP:
            parameters = ast.data[1:-1]
            is_affirmative = True

            if parameters[0] == '^':
                is_affirmative = False
                parameters = parameters[1:]
            
            our_range = self._NfaNode._Range(frozenset([]), is_affirmative)
            tokens = self._pre_lex(parameters)
            last_value = ''
            pair_first = None
            curr = tokens

            while curr != None:
                value = curr.value
                if value == '-' and last_value == '-':
                    raise Exception('Parse Error: _Token "--" cannot exist in grouping.')
                elif last_value == '-' and curr.next != None and curr.next.value == '-':
                    raise Exception('Parse Error: Two ranges ("-") cannot share a character.')
                elif value == '-' and (last_value == '' or curr.next == None):
                    raise Exception('Parse Error: _Range must have two endpoints ("a-b").')
                elif curr.next != None and curr.next.value == '-':
                    if len(value) == 2:
                        if value[1] in ['w', 'W', 'd', 'D', 's', 'S']:
                            raise Exception(f'Parse Error: Cannot determine range with special character "{value}".')
                        else:
                            pair_first = value[1]
                    else:
                        pair_first = value
                elif last_value == '-':
                    if len(value) == 2:
                        if value[1] in ['w', 'W', 'd', 'D', 's', 'S']:
                            raise Exception(f'Parse Error: Cannot determine range with special character "{value}".')
                        else:
                            our_range._add_range(self._NfaNode._Range(frozenset([(pair_first, value[1])]), is_affirmative))
                    else:
                        our_range._add_range(self._NfaNode._Range(frozenset([(pair_first, value)]), is_affirmative))
                elif value != '-':
                    if len(value) == 2:
                        if value[1] in ['w', 'W', 'd', 'D', 's', 'S']:
                            raise Exception('Parse Error: Use special characters outside of grouping.')
                        else:
                            our_range._add_range(self._NfaNode._Range(frozenset([(value[1], value[1])]), is_affirmative))
                    else:
                        our_range._add_range(self._NfaNode._Range(frozenset([(value, value)]), is_affirmative))

                last_value = value
                curr = curr.next

            start._add_transition(our_range, end)

        # if we run into a unit:
        #          
        #          o
        #
        else:
            if ast.data[0] == '\\':
                start._add_transition(self._NfaNode._Range._to_range(ast.data), end)
            else:
                start._add_transition(self._NfaNode._Range(frozenset([(ast.data, ast.data)]), True), end)
        
        return start, end

    def _to_nfa(self):
        # start by breaking the regex into a linked list of tokens
        token_list = self._lex(self.expression)
        # now we need to recursively parse the list of tokens (meta)
        ast = self._parse_regex(token_list)
        # now we can convert the ast to an nfa
        nfa_start, nfa_end = self._ast_to_nfa(ast)
        nfa_start._set_start()
        nfa_end._set_end()
        return nfa_start

    def compile(self):
        nfa = self.to_nfa()

a = Regex('[^\\{a-z](hello)*me|(wow)')._to_nfa()