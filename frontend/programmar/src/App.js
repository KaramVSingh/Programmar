import EditText from './components/EditText/EditText';
import PressButton from './components/PressButton/PressButton';
import RuleList from './components/RuleList/RuleList';
import styles from './App.module.css';
import React, { useState } from 'react';
import { ReactComponent as CheckIcon } from './assets/check.svg';
import TestingModal from './components/TestingModal/TestingModal';

// backend
import { entrypoint } from 'programmar-backend/build/app/app.js';

const emptyGrammarRule = {
  type: 'rule',
  name: '',
  visible: true,
  data: [
    {
      endingSpace: false,
      parts: []
    }
  ]
}

const emptyRegexRule = {
  type: 'regex',
  name: '',
  visible: true,
  data: ''
}

const uniqueId = () => Math.random().toString(36).substr(2, 12);

function App() {

  const [rules, setRules] = useState({});
  const [testModalOpen, setTestModal] = useState(false);
  const [firstRule, setFirstRule] = useState(null);

  const deleteRule = (id) => { const newRules = { ...rules }; delete newRules[id]; setRules(newRules); };
  const setRule = (id, newRule) => { const newRules = { ...rules, [id]: newRule }; setRules(newRules); };

  const [name, setName] = useState('');
  const [parser, setParser] = useState(undefined);
  const [cfgError, setCfgError] = useState(undefined);

  return (
    <div className={styles.root}>
      <TestingModal parser={parser} error={cfgError} isVisible={testModalOpen} closeModal={() => { setTestModal(false); }} />
      <div>
        <EditText size='large' placeholder='Grammar Name' onChange={(value) => { setName(value) }} regex={/^[A-Za-z_]*$/} />
      </div>
      <div>
        <RuleList rules={rules} deleteRule={deleteRule} setRule={setRule} firstRule={firstRule} setFirstRule={setFirstRule} />
        <div className={styles.controls}>
          <span>
            <PressButton text='Add Grammar Rule' size='large' onClick={() => { setRules({ ...rules, [uniqueId()]: { ...emptyGrammarRule } }); }} />
            <PressButton text='Add Regex Rule' size='large' onClick={() => { setRules({ ...rules, [uniqueId()]: { ...emptyRegexRule } }); }} />
          </span>
          <span className={styles.right}>
            <PressButton 
              text='Test Grammar' 
              size='large' 
              color='green' 
              onClick={() => { 
                generateParser(generateCFG(rules, firstRule, "JAVASCRIPT", name)).then(res => {
                  const [parser, error] = res;
                  setCfgError(error);
                  setParser(() => parser);
                  setTestModal(true);
                });
              }} 
              svg={CheckIcon} />
          </span>
        </div>
      </div>
    </div>
  );
}

async function generateParser(cfg) {
  // How is this not standard in JS String?
  const substrAfter = (string, subStr) => {
    const split = string.split(subStr);
    return split[split.length - 1];
  }

  const res = await entrypoint(cfg);
  const error = res.statusCode === 400 ? substrAfter(res.body.error, "Illegal Argument: ") : undefined;
  const code = res.statusCode === 400 ? undefined : res.body;

  let parser = undefined;
  if (code) {
    const lexerSrc = code.lexer.source;
    const parserSrc = code.parser.source;
    const aggregated = (lexerSrc + parserSrc).replace(/^export.*$/gm, '');

    parser = (input) => { 
      const lex = `lex('${input.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/\n/g, "\\n")}')`
      const trigger = `parse(${lex})`;
      console.log(aggregated);
      console.log(trigger);
      eval(aggregated + '\n' + trigger);
    }
  }

  let refinedError = undefined
  if (error === "Request must contain input and metadata.") {
    refinedError = "First Rule must not be null.";
  } else {
    refinedError = error
  }

  return [parser, refinedError];
}

function generateCFG(rules, first, language, grammarName) {
  const parsedRules = Object.values(rules).map((rule) => {
    const is = (rule.type === "regex")
      ? () => rule.data
      : () => {
        // convert options to 2d list
        return rule.data.map(option => {
          return option
            .parts
            .map(part => {
              const ref = part.type === "string"
                ? part.data
                : rules[part.data] ? rules[part.data].name : undefined

              // filter out rules which have been deleted
              if (!ref) { return undefined }

              return {
                type: part.type === "string" ? "LITERAL" : "RULE",
                ref: ref
              }
            })
            .filter(element => element)
        })
      }

    return {
      type: rule.type.toUpperCase(),
      name: rule.name,
      is: is()
    }
  });

  return {
    metadata: {
      ignoreWhitespace: true,
      first: rules[first] && rules[first].name !== "" ? rules[first].name : null,
      language: language,
      name: grammarName
    },
    input: {
      rules: parsedRules
    }
  }
}

export default App;
