from regex import Regex

Regex('Name', '[0-9]+')

# returns (status_code, artifact)
def handle(input_json):

    # First we bake all regexes into the cfg
    rules = input_json['Rules']
    escaped_rules = []
    for rule in rules:
        if rule['Type'] == 'REGEX':
            escaped_rules += Regex(rule['Name'], rule['Is']).to_cfg()
        else:
            rule['Squash'] = False
            escaped_rules.append(rule)

    # now we begin creating the lexer
    print(escaped_rules)