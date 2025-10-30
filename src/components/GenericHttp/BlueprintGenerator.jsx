import React, { useState } from 'react';
import styles from './styles.module.css';

export function BlueprintGenerator() {
  const [sampleData, setSampleData] = useState('');
  const [blueprintId, setBlueprintId] = useState('');
  const [blueprintTitle, setBlueprintTitle] = useState('');
  const [selectedFields, setSelectedFields] = useState({});

  const parseFields = (jsonString) => {
    try {
      const json = JSON.parse(jsonString);
      // Get first object if array
      const sample = Array.isArray(json) ? json[0] : json;
      
      if (!sample || typeof sample !== 'object') {
        return [];
      }

      return Object.entries(sample).map(([key, value]) => {
        let type = 'string';
        let format = null;

        if (typeof value === 'number') {
          type = 'number';
        } else if (typeof value === 'boolean') {
          type = 'boolean';
        } else if (typeof value === 'string') {
          // Try to detect special formats
          if (value.includes('@')) {
            format = 'email';
          } else if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
            format = 'date-time';
          } else if (value.match(/^https?:\/\//)) {
            format = 'url';
          }
        }

        return { key, type, format, value };
      });
    } catch {
      return [];
    }
  };

  const fields = parseFields(sampleData);

  const toggleField = (key) => {
    setSelectedFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const generateBlueprint = () => {
    const properties = {};
    
    fields.forEach(field => {
      if (selectedFields[field.key]) {
        properties[field.key] = {
          type: field.type,
          title: field.key.charAt(0).toUpperCase() + field.key.slice(1).replace(/_/g, ' ')
        };
        
        if (field.format) {
          properties[field.key].format = field.format;
        }
      }
    });

    return JSON.stringify({
      identifier: blueprintId || 'my_blueprint',
      title: blueprintTitle || 'My Blueprint',
      icon: 'BlankPage',
      schema: {
        properties,
        required: []
      }
    }, null, 2);
  };

  const copyBlueprint = () => {
    navigator.clipboard.writeText(generateBlueprint());
  };

  return (
    <div className={styles.blueprintGenerator}>
      <div className={styles.inputSection}>
        <h3>📋 Sample Data</h3>
        <p>Paste a sample object from your API response:</p>
        <textarea
          placeholder={`{\n  "id": 1,\n  "name": "John Doe",\n  "email": "john@example.com",\n  "role": "admin"\n}`}
          value={sampleData}
          onChange={(e) => setSampleData(e.target.value)}
          className={styles.textarea}
          rows={8}
        />

        {fields.length > 0 && (
          <>
            <h3>🎨 Blueprint Details</h3>
            <input
              type="text"
              placeholder="Blueprint identifier (e.g., api_user)"
              value={blueprintId}
              onChange={(e) => setBlueprintId(e.target.value)}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Blueprint title (e.g., User)"
              value={blueprintTitle}
              onChange={(e) => setBlueprintTitle(e.target.value)}
              className={styles.input}
            />

            <h3>✅ Select Fields to Include</h3>
            <div className={styles.fieldsList}>
              {fields.map(field => (
                <label key={field.key} className={styles.fieldItem}>
                  <input
                    type="checkbox"
                    checked={selectedFields[field.key] || false}
                    onChange={() => toggleField(field.key)}
                  />
                  <span className={styles.fieldName}>{field.key}</span>
                  <span className={styles.fieldType}>
                    {field.type}{field.format ? ` (${field.format})` : ''}
                  </span>
                  <span className={styles.fieldValue}>{JSON.stringify(field.value)}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      {fields.length > 0 && Object.values(selectedFields).some(v => v) && (
        <div className={styles.outputSection}>
          <div className={styles.outputHeader}>
            <h3>✨ Generated Blueprint</h3>
            <button onClick={copyBlueprint} className={styles.copyButton}>
              📋 Copy
            </button>
          </div>
          <pre className={styles.codeBlock}>
            <code>{generateBlueprint()}</code>
          </pre>
          <div className={styles.hint}>
            Create this blueprint in <a href="https://app.getport.io/settings/data-model" target="_blank">Port Builder</a>
          </div>
        </div>
      )}
    </div>
  );
}

