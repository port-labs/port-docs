import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import styles from './scorecard-builder.module.css';

interface Blueprint {
  identifier: string;
  title: string;
}

interface Rule {
  identifier: string;
  title: string;
  description: string;
  level: string;
  query: {
    combinator: 'and' | 'or';
    conditions: any[];
  };
}

interface Level {
  title: string;
  color: string;
}

interface Scorecard {
  identifier: string;
  title: string;
  rules: Rule[];
  levels: Level[];
}

const AVAILABLE_COLORS = [
  'blue', 'turquoise', 'orange', 'purple', 'pink', 'yellow',
  'green', 'red', 'gold', 'silver', 'paleBlue', 'darkGray',
  'lightGray', 'bronze'
];

export default function ScorecardBuilder() {
  const [bearerToken, setBearerToken] = useState('');
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selectedBlueprint, setSelectedBlueprint] = useState('');
  const [prompt, setPrompt] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', isError: false });
  const [scorecard, setScorecard] = useState<Scorecard>({
    identifier: '',
    title: '',
    rules: [],
    levels: []
  });

  useEffect(() => {
    if (bearerToken) {
      fetchBlueprints();
    }
  }, [bearerToken]);

  const fetchBlueprints = async () => {
    try {
      const response = await fetch('https://api.stg-01.getport.io/v1/blueprints', {
        headers: {
          'Authorization': `${bearerToken}`
        }
      });
      const data = await response.json();
      if (data.ok) {
        setBlueprints(data.blueprints);
      } else {
        throw new Error('Failed to fetch blueprints');
      }
    } catch (error) {
      showNotification('Failed to fetch blueprints. Please check your bearer token.', true);
    }
  };

  const handleAddRule = () => {
    setScorecard(prev => ({
      ...prev,
      rules: [
        ...prev.rules,
        {
          identifier: '',
          title: '',
          description: '',
          level: '',
          query: {
            combinator: 'and',
            conditions: []
          }
        }
      ]
    }));
  };

  const handleAddLevel = () => {
    setScorecard(prev => ({
      ...prev,
      levels: [
        ...prev.levels,
        {
          title: '',
          color: 'blue'
        }
      ]
    }));
  };

  const handleDryRun = async () => {
    try {
      const response = await fetch(`https://api.stg-01.getport.io/v1/blueprints/${selectedBlueprint}/entities/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rules: scorecard.rules
        })
      });
      const data = await response.json();
      if (data.ok) {
        showNotification('Dry run successful!', false);
      } else {
        throw new Error('Dry run failed');
      }
    } catch (error) {
      showNotification('Dry run failed. Please check your scorecard configuration.', true);
    }
  };

  const handleInstall = async () => {
    try {
      const response = await fetch('https://api.stg-01.getport.io/v1/scorecards', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scorecard)
      });
      const data = await response.json();
      if (data.ok) {
        showNotification('Scorecard installed successfully!', false);
      } else {
        throw new Error('Failed to install scorecard');
      }
    } catch (error) {
      showNotification('Failed to install scorecard. Please check your configuration.', true);
    }
  };

  const showNotification = (message: string, isError: boolean) => {
    setNotification({ show: true, message, isError });
    setTimeout(() => setNotification({ show: false, message: '', isError: false }), 5000);
  };

  return (
    <Layout title="Scorecard Builder">
      <div className={styles.container}>
        <h1 className={styles.title}>Scorecard Builder</h1>

        {/* Bearer Token Input */}
        <div className={styles.section}>
          <input
            type="password"
            placeholder="Port Bearer Token"
            value={bearerToken}
            onChange={(e) => setBearerToken(e.target.value)}
            className={styles.input}
          />

          <select
            value={selectedBlueprint}
            onChange={(e) => setSelectedBlueprint(e.target.value)}
            disabled={!bearerToken}
            className={styles.select}
          >
            <option value="">Select Blueprint</option>
            {blueprints.map((blueprint) => (
              <option key={blueprint.identifier} value={blueprint.identifier}>
                {blueprint.title}
              </option>
            ))}
          </select>
        </div>

        {/* Prompt Input */}
        <div className={styles.section}>
          <textarea
            placeholder="Prompt for Kapa"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className={styles.textarea}
            rows={3}
          />
        </div>

        {/* Scorecard Form */}
        <div className={styles.section}>
          <h2>Scorecard Configuration</h2>

          <div className={styles.formGrid}>
            <input
              type="text"
              placeholder="Identifier"
              value={scorecard.identifier}
              onChange={(e) => setScorecard(prev => ({ ...prev, identifier: e.target.value }))}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Title"
              value={scorecard.title}
              onChange={(e) => setScorecard(prev => ({ ...prev, title: e.target.value }))}
              className={styles.input}
            />
          </div>

          {/* Rules Section */}
          <h3>Rules</h3>
          {scorecard.rules.map((rule, index) => (
            <div key={index} className={styles.ruleCard}>
              <input
                type="text"
                placeholder="Rule Identifier"
                value={rule.identifier}
                onChange={(e) => {
                  const newRules = [...scorecard.rules];
                  newRules[index].identifier = e.target.value;
                  setScorecard(prev => ({ ...prev, rules: newRules }));
                }}
                className={styles.input}
              />
              <input
                type="text"
                placeholder="Rule Title"
                value={rule.title}
                onChange={(e) => {
                  const newRules = [...scorecard.rules];
                  newRules[index].title = e.target.value;
                  setScorecard(prev => ({ ...prev, rules: newRules }));
                }}
                className={styles.input}
              />
              <textarea
                placeholder="Rule Description"
                value={rule.description}
                onChange={(e) => {
                  const newRules = [...scorecard.rules];
                  newRules[index].description = e.target.value;
                  setScorecard(prev => ({ ...prev, rules: newRules }));
                }}
                className={styles.textarea}
                rows={2}
              />
              <button
                onClick={() => {
                  const newRules = scorecard.rules.filter((_, i) => i !== index);
                  setScorecard(prev => ({ ...prev, rules: newRules }));
                }}
                className={styles.deleteButton}
              >
                ×
              </button>
            </div>
          ))}
          <button onClick={handleAddRule} className={styles.addButton}>
            Add Rule
          </button>

          {/* Levels Section */}
          <h3>Levels</h3>
          {scorecard.levels.map((level, index) => (
            <div key={index} className={styles.levelCard}>
              <input
                type="text"
                placeholder="Level Title"
                value={level.title}
                onChange={(e) => {
                  const newLevels = [...scorecard.levels];
                  newLevels[index].title = e.target.value;
                  setScorecard(prev => ({ ...prev, levels: newLevels }));
                }}
                className={styles.input}
              />
              <select
                value={level.color}
                onChange={(e) => {
                  const newLevels = [...scorecard.levels];
                  newLevels[index].color = e.target.value;
                  setScorecard(prev => ({ ...prev, levels: newLevels }));
                }}
                className={styles.select}
              >
                {AVAILABLE_COLORS.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  const newLevels = scorecard.levels.filter((_, i) => i !== index);
                  setScorecard(prev => ({ ...prev, levels: newLevels }));
                }}
                className={styles.deleteButton}
              >
                ×
              </button>
            </div>
          ))}
          <button onClick={handleAddLevel} className={styles.addButton}>
            Add Level
          </button>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button
            onClick={handleDryRun}
            disabled={!bearerToken || !selectedBlueprint}
            className={styles.button}
          >
            Dry Run
          </button>
          <button
            onClick={handleInstall}
            disabled={!bearerToken || !selectedBlueprint}
            className={styles.button}
          >
            Install
          </button>
        </div>

        {/* JSON Preview */}
        <div className={styles.section}>
          <h2>Scorecard JSON</h2>
          <pre className={styles.jsonPreview}>
            {JSON.stringify(scorecard, null, 2)}
          </pre>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className={`${styles.notification} ${notification.isError ? styles.error : styles.success}`}>
            {notification.message}
          </div>
        )}
      </div>
    </Layout>
  );
} 