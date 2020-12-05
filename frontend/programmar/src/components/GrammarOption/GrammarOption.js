import styles from './GrammarOption.module.css';
import ContentEditable from 'react-contenteditable';
import ReactDOMServer from 'react-dom/server';
import RuleRef from './RuleRef/RuleRef';
import IconButton from '../IconButton/IconButton';
import { ReactComponent as DeleteIcon } from './../../assets/close-line.svg';

function GrammarOption({ ruleIdMapping, option, setOption, deleteOption }) {
    const idRuleMapping = {}
    Object.keys(ruleIdMapping).forEach(id => {
        idRuleMapping[ruleIdMapping[id]] = id;
    });

    const onChange = (event) => {
        const nodes = Array.from(event.nativeEvent.target.childNodes).filter(node => node.data !== "");
        if (nodes.length === 0) { return };

        const newPartsList = nodes.map(node => {
            if (node.data) {
                // text
                const text = node.data;
                const asList = text.trim().split(/\s+/g);
                return asList.map(word => {
                    if (word.startsWith("{") && word.endsWith("}")) {
                        // A rule reference attempt
                        const trimmed = word.substring(1, word.length - 1);
                        if (idRuleMapping[trimmed]) {
                            return { type: 'rule', data: idRuleMapping[trimmed] };
                        } else {
                            return { type: 'string', data: word };
                        }
                    } else {
                        // a string
                        return { type: 'string', data: word };
                    }
                });
            } else {
                // span
                const id = node.getAttribute('rule_id')
                return { type: 'rule', data: id };
            }
        });

        const endingSpace = nodes[nodes.length - 1].data ? (nodes[nodes.length - 1].data.match(/\s$/) ? true : false) : true;
        setOption({ endingSpace: endingSpace, parts: newPartsList.flat() });
    }

    const toDraw = [];
    option.parts.forEach(part => {
        if (part.type === 'string') {
            const n = part.data
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

            toDraw.push(n);
        } else {
            if (ruleIdMapping[part.data]) {
                toDraw.push(ReactDOMServer.renderToStaticMarkup(<RuleRef ruleId={part.data} ruleName={ruleIdMapping[part.data]} />));
            }
        }
    });

    const joined = toDraw.join(" ") + (option.endingSpace ? " " : "");
    return (
        <div className={styles.root}>
            <span className={styles.deleteButton}>
                <IconButton Svg={DeleteIcon} color="white" size="almostMedium" onClick={deleteOption} />
            </span>
            <ContentEditable className={styles.input} html={joined} onChange={onChange} tagName="div" />
        </div>
    );
}

export default GrammarOption;