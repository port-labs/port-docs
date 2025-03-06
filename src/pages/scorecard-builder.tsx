import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import styles from './scorecard-builder.module.css';

interface Blueprint {
  identifier: string;
  title: string;
  schema: {
    properties: {
      [key: string]: {
        type: string;
        title: string;
      };
    };
  };
}

interface Condition {
  property: string;
  operator: string;
  value: any;
}

interface Rule {
  identifier: string;
  title: string;
  description: string;
  query: {
    combinator: 'and' | 'or';
    conditions: Condition[];
  };
}

interface Level {
  title: string;
  color: string;
  rules: Rule[];
}

interface Scorecard {
  identifier: string;
  title: string;
  levels: Level[];
}

const AVAILABLE_COLORS = [
  'blue', 'turquoise', 'orange', 'purple', 'pink', 'yellow',
  'green', 'red', 'gold', 'silver', 'paleBlue', 'darkGray',
  'lightGray', 'bronze'
];

const OPERATORS = [
  { value: '=', label: 'Equals' },
  { value: '!=', label: 'Not Equals' },
  { value: '>', label: 'Greater Than' },
  { value: '<', label: 'Less Than' },
  { value: '>=', label: 'Greater Than or Equal' },
  { value: '<=', label: 'Less Than or Equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'doesNotContain', label: 'Does Not Contain' },
  { value: 'startsWith', label: 'Starts With' },
  { value: 'endsWith', label: 'Ends With' },
  { value: 'isEmpty', label: 'Is Empty' },
  { value: 'isNotEmpty', label: 'Is Not Empty' }
];

export default function ScorecardBuilder() {
  const [bearerToken, setBearerToken] = useState('');
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [selectedBlueprint, setSelectedBlueprint] = useState('');
  const [selectedBlueprintData, setSelectedBlueprintData] = useState<Blueprint | null>(null);
  const [prompt, setPrompt] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', isError: false });
  const [draggedRule, setDraggedRule] = useState<{ levelIndex: number; ruleIndex: number } | null>(null);
  const [dragOverLevel, setDragOverLevel] = useState<number | null>(null);
  const [scorecard, setScorecard] = useState<Scorecard>({
    identifier: '',
    title: '',
    levels: []
  });
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [manualJson, setManualJson] = useState<string>('');

  useEffect(() => {
    if (bearerToken) {
      fetchBlueprints();
    }
  }, [bearerToken]);

  useEffect(() => {
    if (selectedBlueprint) {
      fetchBlueprintDetails();
    }
  }, [selectedBlueprint]);

  useEffect(() => {
    setManualJson(JSON.stringify(scorecard, null, 2));
  }, [scorecard]);

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

  const fetchBlueprintDetails = async () => {
    try {
      const response = await fetch(`https://api.stg-01.getport.io/v1/blueprints/${selectedBlueprint}`, {
        headers: {
          'Authorization': `${bearerToken}`
        }
      });
      const data = await response.json();
      if (data.ok) {
        setSelectedBlueprintData(data.blueprint);
      } else {
        throw new Error('Failed to fetch blueprint details');
      }
    } catch (error) {
      showNotification('Failed to fetch blueprint details.', true);
    }
  };

  const handleAddLevel = () => {
    setScorecard(prev => ({
      ...prev,
      levels: [
        ...prev.levels,
        {
          title: '',
          color: 'blue',
          rules: []
        }
      ]
    }));
  };

  const handleAddRule = (levelIndex: number) => {
    const newLevels = [...scorecard.levels];
    newLevels[levelIndex].rules.push({
      identifier: '',
      title: '',
      description: '',
      query: {
        combinator: 'and',
        conditions: [{
          property: '',
          operator: '=',
          value: ''
        }]
      }
    });
    setScorecard(prev => ({ ...prev, levels: newLevels }));
  };

  const handleAddCondition = (levelIndex: number, ruleIndex: number) => {
    const newLevels = [...scorecard.levels];
    newLevels[levelIndex].rules[ruleIndex].query.conditions.push({
      property: '',
      operator: '=',
      value: ''
    });
    setScorecard(prev => ({ ...prev, levels: newLevels }));
  };

  const handleDragStart = (levelIndex: number, ruleIndex: number) => {
    setDraggedRule({ levelIndex, ruleIndex });
  };

  const handleDragOver = (e: React.DragEvent, levelIndex: number) => {
    e.preventDefault();
    setDragOverLevel(levelIndex);
  };

  const handleDrop = (e: React.DragEvent, targetLevelIndex: number) => {
    e.preventDefault();
    setDragOverLevel(null);

    if (!draggedRule) return;

    const { levelIndex: sourceLevelIndex, ruleIndex: sourceRuleIndex } = draggedRule;
    if (sourceLevelIndex === targetLevelIndex) return;

    const newLevels = [...scorecard.levels];
    const rule = newLevels[sourceLevelIndex].rules[sourceRuleIndex];
    
    // Remove from source
    newLevels[sourceLevelIndex].rules.splice(sourceRuleIndex, 1);
    
    // Add to target
    newLevels[targetLevelIndex].rules.push(rule);
    
    setScorecard(prev => ({ ...prev, levels: newLevels }));
    setDraggedRule(null);
  };

  const handleDragEnd = () => {
    setDragOverLevel(null);
    setDraggedRule(null);
  };

  const handleDryRun = async () => {
    try {
      // Flatten rules from all levels for the dry run
      const allRules = scorecard.levels.flatMap(level => level.rules);
      
      const response = await fetch(`https://api.stg-01.getport.io/v1/blueprints/${selectedBlueprint}/entities/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rules: allRules
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

  const handleJsonChange = (value: string) => {
    setManualJson(value);
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (error) {
      setJsonError('Invalid JSON format');
    }
  };

  const handleInstall = async () => {
    if (jsonError) {
      showNotification('Please fix the JSON errors before installing.', true);
      return;
    }

    try {
      let scorecardData;
      try {
        scorecardData = JSON.parse(manualJson);
      } catch (error) {
        throw new Error('Invalid JSON format');
      }

      const response = await fetch(`https://api.stg-01.getport.io/v1/blueprints/${selectedBlueprint}/scorecards`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
          'Content-Type': 'application/json'
        },
        body: manualJson
      });
      const data = await response.json();
      if (data.ok) {
        showNotification('Scorecard installed successfully!', false);
      } else {
        throw new Error('Failed to install scorecard');
      }
    } catch (error) {
      showNotification(`Failed to install scorecard: ${error instanceof Error ? error.message : 'Unknown error'}`, true);
    }
  };

  const showNotification = (message: string, isError: boolean) => {
    setNotification({ show: true, message, isError });
    setTimeout(() => setNotification({ show: false, message: '', isError: false }), 5000);
  };

  return (
    <Layout>
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

          {/* Levels and Rules Section */}
          {scorecard.levels.map((level, levelIndex) => (
            <div
              key={levelIndex}
              className={`${styles.levelCard} ${dragOverLevel === levelIndex ? styles.dragOver : ''}`}
              onDragOver={(e) => handleDragOver(e, levelIndex)}
              onDrop={(e) => handleDrop(e, levelIndex)}
            >
              <div className={styles.levelHeader}>
                <input
                  type="text"
                  placeholder="Level Title"
                  value={level.title}
                  onChange={(e) => {
                    const newLevels = [...scorecard.levels];
                    newLevels[levelIndex].title = e.target.value;
                    setScorecard(prev => ({ ...prev, levels: newLevels }));
                  }}
                  className={styles.input}
                />
                <select
                  value={level.color}
                  onChange={(e) => {
                    const newLevels = [...scorecard.levels];
                    newLevels[levelIndex].color = e.target.value;
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
                    const newLevels = scorecard.levels.filter((_, i) => i !== levelIndex);
                    setScorecard(prev => ({ ...prev, levels: newLevels }));
                  }}
                  className={styles.deleteButton}
                >
                  ×
                </button>
              </div>

              <div className={styles.rulesContainer}>
                {level.rules.map((rule, ruleIndex) => (
                  <div
                    key={ruleIndex}
                    className={`${styles.ruleCard} ${draggedRule?.levelIndex === levelIndex && draggedRule?.ruleIndex === ruleIndex ? styles.dragging : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(levelIndex, ruleIndex)}
                    onDragEnd={handleDragEnd}
                  >
                    <input
                      type="text"
                      placeholder="Rule Identifier"
                      value={rule.identifier}
                      onChange={(e) => {
                        const newLevels = [...scorecard.levels];
                        newLevels[levelIndex].rules[ruleIndex].identifier = e.target.value;
                        setScorecard(prev => ({ ...prev, levels: newLevels }));
                      }}
                      className={styles.input}
                    />
                    <input
                      type="text"
                      placeholder="Rule Title"
                      value={rule.title}
                      onChange={(e) => {
                        const newLevels = [...scorecard.levels];
                        newLevels[levelIndex].rules[ruleIndex].title = e.target.value;
                        setScorecard(prev => ({ ...prev, levels: newLevels }));
                      }}
                      className={styles.input}
                    />
                    <textarea
                      placeholder="Rule Description"
                      value={rule.description}
                      onChange={(e) => {
                        const newLevels = [...scorecard.levels];
                        newLevels[levelIndex].rules[ruleIndex].description = e.target.value;
                        setScorecard(prev => ({ ...prev, levels: newLevels }));
                      }}
                      className={styles.textarea}
                      rows={2}
                    />

                    {/* Conditions */}
                    <div className={styles.conditions}>
                      <select
                        value={rule.query.combinator}
                        onChange={(e) => {
                          const newLevels = [...scorecard.levels];
                          newLevels[levelIndex].rules[ruleIndex].query.combinator = e.target.value as 'and' | 'or';
                          setScorecard(prev => ({ ...prev, levels: newLevels }));
                        }}
                        className={styles.select}
                      >
                        <option value="and">AND</option>
                        <option value="or">OR</option>
                      </select>

                      {rule.query.conditions.map((condition, conditionIndex) => (
                        <div key={conditionIndex} className={styles.condition}>
                          <select
                            value={condition.property}
                            onChange={(e) => {
                              const newLevels = [...scorecard.levels];
                              newLevels[levelIndex].rules[ruleIndex].query.conditions[conditionIndex].property = e.target.value;
                              setScorecard(prev => ({ ...prev, levels: newLevels }));
                            }}
                            className={styles.select}
                          >
                            <option value="">Select Property</option>
                            {selectedBlueprintData?.schema.properties && 
                              Object.entries(selectedBlueprintData.schema.properties).map(([key, prop]) => (
                                <option key={key} value={key}>
                                  {prop.title || key}
                                </option>
                              ))
                            }
                          </select>

                          <select
                            value={condition.operator}
                            onChange={(e) => {
                              const newLevels = [...scorecard.levels];
                              newLevels[levelIndex].rules[ruleIndex].query.conditions[conditionIndex].operator = e.target.value;
                              setScorecard(prev => ({ ...prev, levels: newLevels }));
                            }}
                            className={styles.select}
                          >
                            {OPERATORS.map(op => (
                              <option key={op.value} value={op.value}>
                                {op.label}
                              </option>
                            ))}
                          </select>

                          <input
                            type="text"
                            placeholder="Value"
                            value={condition.value}
                            onChange={(e) => {
                              const newLevels = [...scorecard.levels];
                              newLevels[levelIndex].rules[ruleIndex].query.conditions[conditionIndex].value = e.target.value;
                              setScorecard(prev => ({ ...prev, levels: newLevels }));
                            }}
                            className={styles.input}
                          />

                          <button
                            onClick={() => {
                              const newLevels = [...scorecard.levels];
                              newLevels[levelIndex].rules[ruleIndex].query.conditions.splice(conditionIndex, 1);
                              setScorecard(prev => ({ ...prev, levels: newLevels }));
                            }}
                            className={styles.deleteButton}
                          >
                            ×
                          </button>
                        </div>
                      ))}

                      <button
                        onClick={() => handleAddCondition(levelIndex, ruleIndex)}
                        className={styles.addButton}
                      >
                        Add Condition
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        const newLevels = [...scorecard.levels];
                        newLevels[levelIndex].rules.splice(ruleIndex, 1);
                        setScorecard(prev => ({ ...prev, levels: newLevels }));
                      }}
                      className={styles.deleteButton}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleAddRule(levelIndex)}
                className={styles.addButton}
              >
                Add Rule
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
          <div className={styles.jsonEditorContainer}>
            <textarea
              value={manualJson}
              onChange={(e) => handleJsonChange(e.target.value)}
              className={`${styles.jsonEditor} ${jsonError ? styles.jsonError : ''}`}
              rows={20}
              spellCheck={false}
            />
            {jsonError && (
              <div className={styles.jsonErrorMessage}>
                {jsonError}
              </div>
            )}
          </div>
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