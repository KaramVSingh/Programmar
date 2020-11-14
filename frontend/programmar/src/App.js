import EditText from './components/EditText/EditText';
import PressButton from './components/PressButton/PressButton';
import RuleList from './components/RuleList/RuleList';
import styles from './App.module.css';
import React, { useState } from 'react';

const emptyGrammarRule = {
  type: 'rule',
  name: '',
  data: [
    []
  ]
}

const emptyRegexRule = {
  type: 'regex',
  name: '',
  data: ''
}

const uniqueId = () => Math.random().toString(36).substr(2, 9);

function App() {

  const [rules, setRules] = useState({});
  const [firstRule, setFirstRule] = useState(null);
  const deleteRule = (id) => { const newRules = { ...rules }; delete newRules[id]; setRules(newRules); };
  const setRule = (id, newRule) => { const newRules = { ...rules, [id]: newRule }; setRules(newRules); };

  const [, setName] = useState('');

  console.log(rules)
  return (
    <div className={styles.root}>
      <div>
        <EditText size='large' placeholder='Project Name' onChange={(value) => { setName(value) }} regex={/^[A-Za-z_]*$/} />
      </div>
      <div>
        <RuleList rules={rules} deleteRule={deleteRule} setRule={setRule} firstRule={firstRule} setFirstRule={setFirstRule} />
        <div className={styles.controls}>
          <PressButton text='Add Grammar Rule' size='large' onClick={() => { setRules({ ...rules, [uniqueId()]: { ...emptyGrammarRule } }); }} />
          <PressButton text='Add Regex Rule' size='large' onClick={() => { setRules({ ...rules, [uniqueId()]: { ...emptyRegexRule } }); }} />
        </div>
      </div>
    </div>
  );
}

export default App;
