import React, { useState, useEffect } from 'react';
import { mcpTools } from '../../data/mcpTools';
import styles from './styles.module.css';

export default function ToolMatcher({ initialPatterns = [] }) {
  const [patternsInput, setPatternsInput] = useState(
    initialPatterns.length > 0 ? JSON.stringify(initialPatterns, null, 2) : '["(list|get|search)_.*"]'
  );
  const [matchedToolNames, setMatchedToolNames] = useState(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    matchTools();
  }, [patternsInput]);

  const matchTools = () => {
    try {
      setError('');
      
      // Parse the JSON input
      let patternArray;
      try {
        patternArray = JSON.parse(patternsInput);
      } catch (e) {
        setError('Invalid JSON format. Please use array format like ["pattern1", "pattern2"]');
        setMatchedToolNames(new Set());
        return;
      }

      if (!Array.isArray(patternArray)) {
        setError('Input must be an array of regex patterns');
        setMatchedToolNames(new Set());
        return;
      }

      if (patternArray.length === 0) {
        setMatchedToolNames(new Set());
        return;
      }

      const matchedNames = new Set();
      mcpTools.forEach(tool => {
        const isMatched = patternArray.some(pattern => {
          try {
            // Always match from the beginning of the tool name
            const regex = new RegExp(`^${pattern}`);
            return regex.test(tool.name);
          } catch (e) {
            return false;
          }
        });

        if (isMatched) {
          matchedNames.add(tool.name);
        }
      });

      setMatchedToolNames(matchedNames);
    } catch (e) {
      setError('Error processing patterns');
      setMatchedToolNames(new Set());
    }
  };

  const handleInputChange = (e) => {
    setPatternsInput(e.target.value);
  };

  const availableTools = mcpTools;

  return (
    <div className={styles.toolMatcher}>
      <div className={styles.formContainer}>
        <div>
          <label htmlFor="patterns">Regex Patterns Array:</label>
          <textarea
            id="patterns"
            value={patternsInput}
            onChange={handleInputChange}
            placeholder='["(list|get|search)_.*", "run_.*github.*"]'
            rows="4"
          />
          <div className={styles.inputHint}>
            Enter an array of regex patterns in JSON format. Patterns automatically match from the beginning of tool names (^ is added automatically).
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      <div className={styles.resultsContainer}>
        <div className={styles.resultsHeader}>
          <h4>Tools ({matchedToolNames.size} of {availableTools.length} matched)</h4>
        </div>

        <div className={styles.toolsList}>
          {availableTools.map(tool => (
            <code 
              key={tool.name} 
              className={matchedToolNames.has(tool.name) ? styles.toolNameMatched : styles.toolNameUnmatched}
            >
              {tool.name}
            </code>
          ))}
        </div>
      </div>
    </div>
  );
}
