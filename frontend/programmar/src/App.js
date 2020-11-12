import EditText from './components/EditText/EditText';
import PressButton from './components/PressButton/PressButton';
import RuleList from './components/RuleList/RuleList';
import styles from './App.module.css';
import React, { useState } from 'react';

const emptyGrammarRule = {
  type: 'rule',
}

const emptyRegexRule = {
  type: 'regex',
}

function App() {

  const [rules, setRules] = useState([]);
  const [name, setName] = useState('');

  return (
    <div className={styles.root}>
      <div>
        <EditText size='large' placeholder='Project Name' onChange={(event) => { setName(event.target.value) }} />
      </div>
      <div>
        <RuleList rules={rules} />
        <div>
          <PressButton text='Add Grammar Rule' size='large' onClick={() => { setRules([...rules, { ...emptyGrammarRule }]); }} />
          <PressButton text='Add Regex Rule' size='large' onClick={() => { setRules([...rules, { ...emptyRegexRule }]); }} />
        </div>
      </div>
    </div>
  );
}

export default App;
