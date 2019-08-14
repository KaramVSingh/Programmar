from backend.regex import Regex

# returns (status_code, artifact)
def handle(input_json):

    # First we bake all regexes into the cfg
    rules = input_json['Rules']
    escaped_rules = []
    for rule in rules:
        if rule['Type'] == 'REGEX':
            escaped_rules += Regex(rule['Name'], rule['Is'])
        else:
            rule['Squash'] = False
            escaped_rules += [rule]

    # now we begin creating the lexer