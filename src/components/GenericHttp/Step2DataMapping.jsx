import React from 'react';
import { useIntegrationBuilder } from './IntegrationBuilderContext';
import styles from './styles.module.css';

export function Step2DataMapping() {
  const {
    endpoint, setEndpoint,
    responseJson, setResponseJson,
    dataPath, setDataPath,
    blueprintId, setBlueprintId,
    blueprintTitle, setBlueprintTitle,
    selectedFields, setSelectedFields,
    identifierField, setIdentifierField,
    titleField, setTitleField,
  } = useIntegrationBuilder();

  const parseFields = () => {
    if (dataPath === null || !responseJson) {
      return [];
    }

    try {
      const json = JSON.parse(responseJson);
      let data = json;

      if (dataPath && dataPath !== '') {
        const path = dataPath.replace(/^\./, '').split('.');
        for (const key of path) {
          data = data[key];
        }
      }

      const sample = Array.isArray(data) ? data[0] : data;
      
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

  const renderJsonTree = (obj, path = '', level = 0) => {
    if (level > 3) return null;

    const results = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : `.${key}`;
      const isArray = Array.isArray(value);
      const isObject = value && typeof value === 'object' && !isArray;
      const itemCount = isArray ? value.length : 0;

      if (isArray) {
        // Show the array as a selectable option
        results.push(
          <div key={currentPath} className={styles.jsonTreeNode} style={{ marginLeft: `${level * 20}px` }}>
            <label className={styles.radioLabel} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="radio" 
                name="dataPath"
                checked={dataPath === currentPath}
                onChange={() => setDataPath(currentPath)}
                style={{ marginRight: '0.5rem' }}
              />
              <span className={styles.jsonKey}>{currentPath.replace(/^\./, '')}</span>
              <span className={styles.arrayBadge}>{itemCount} items</span>
            </label>
          </div>
        );
      } else if (isObject) {
        // Recursively search for arrays inside this object
        const nestedArrays = renderJsonTree(value, currentPath, level + 1);
        if (nestedArrays && nestedArrays.length > 0) {
          results.push(...nestedArrays);
        }
      }
    });

    return results;
  };

  const fields = parseFields();
  const toggleField = (key) => {
    setSelectedFields(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={styles.builderSection}>
      <div className={styles.endpointConfig}>
        <div className={styles.step}>
          <h3>1️⃣ Enter Your Endpoint</h3>
          <input
            type="text"
            placeholder="/api/v1/users"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.step}>
          <h3>2️⃣ Paste API Response</h3>
          <p className={styles.hint}>
            Test your endpoint (e.g., with <code>curl</code>) and paste a sample response here:
          </p>
          <textarea
            placeholder={`{\n  "data": [\n    {"id": 1, "name": "Alice", "email": "alice@example.com"},\n    {"id": 2, "name": "Bob", "email": "bob@example.com"}\n  ]\n}`}
            value={responseJson}
            onChange={(e) => {
              setResponseJson(e.target.value);
              setDataPath(null);
            }}
            className={styles.textarea}
            rows={10}
          />
        </div>

        {responseJson && (
          <>
            <div className={styles.step}>
              <h3>3️⃣ Select Data Path</h3>
              <p className={styles.hint}>
                <strong>Select the array</strong> that contains the items you want to sync to Port:
              </p>
              <div className={styles.jsonTreeContainer}>
                {(() => {
                  try {
                    const json = JSON.parse(responseJson);
                    if (Array.isArray(json)) {
                      return (
                        <label className={styles.radioLabel} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.5rem 0' }}>
                          <input 
                            type="radio" 
                            name="dataPath"
                            checked={dataPath === ''}
                            onChange={() => setDataPath('')}
                            style={{ marginRight: '0.5rem' }}
                          />
                          <span className={styles.jsonKey}>(root array)</span>
                          <span className={styles.arrayBadge}>{json.length} items</span>
                        </label>
                      );
                    }
                    
                    const arrays = renderJsonTree(json);
                    
                    if (arrays.length === 0) {
                      return (
                        <div style={{ padding: '1rem', color: 'var(--ifm-color-emphasis-600)' }}>
                          No arrays found in the JSON response. Make sure your API response contains an array of items.
                        </div>
                      );
                    }
                    
                    return arrays;
                  } catch {
                    return <div className={styles.error}>Invalid JSON</div>;
                  }
                })()}
              </div>
              {dataPath !== null && (
                <div className={styles.selectedPath}>
                  <strong>Selected data_path:</strong> <code>{dataPath || '.'}</code>
                </div>
              )}
            </div>

            {dataPath !== null && fields.length > 0 && (
              <>
                <div className={styles.step}>
                  <h3>4️⃣ Configure Blueprint</h3>
                  <label className={styles.label}>
                    <strong>Blueprint Identifier <span style={{color: 'red'}}>*</span></strong>
                    <input
                      type="text"
                      placeholder="user"
                      value={blueprintId}
                      onChange={(e) => setBlueprintId(e.target.value)}
                      className={styles.input}
                      required
                    />
                    <span className={styles.hint}>Lowercase, no spaces (e.g., "user", "project", "ticket")</span>
                  </label>
                  <label className={styles.label}>
                    <strong>Blueprint Title</strong>
                    <input
                      type="text"
                      placeholder="User"
                      value={blueprintTitle}
                      onChange={(e) => setBlueprintTitle(e.target.value)}
                      className={styles.input}
                    />
                    <span className={styles.hint}>Display name (e.g., "User", "Project", "Support Ticket")</span>
                  </label>
                </div>

                <div className={styles.step}>
                  <h3>5️⃣ Select Fields & Mapping</h3>
                  <p className={styles.hint}>
                    Choose which fields to sync and set a unique <strong>identifier</strong> <span style={{color: 'red'}}>*</span> (required) and optional <strong>title</strong> field:
                  </p>
                  <div className={styles.fieldMapping}>
                    <div className={styles.mappingHeader}>
                      <span>Field</span>
                      <span>Type</span>
                      <span>Use as</span>
                    </div>
                    {fields.map(field => (
                      <div key={field.key} className={styles.fieldRow}>
                        <label className={styles.fieldCheckbox}>
                          <input
                            type="checkbox"
                            checked={selectedFields[field.key] || false}
                            onChange={() => toggleField(field.key)}
                          />
                          <span className={styles.fieldName}>{field.key}</span>
                        </label>
                        <span className={styles.fieldType}>
                          {field.type}{field.format ? ` (${field.format})` : ''}
                        </span>
                        <div className={styles.fieldActions}>
                          <button
                            className={`${styles.roleButton} ${identifierField === field.key ? styles.active : ''}`}
                            onClick={() => {
                              setIdentifierField(field.key);
                              setSelectedFields(prev => ({ ...prev, [field.key]: true }));
                            }}
                            title="Use as unique identifier (required)"
                          >
                            ID {identifierField === field.key && '✓'}
                          </button>
                          <button
                            className={`${styles.roleButton} ${titleField === field.key ? styles.active : ''}`}
                            onClick={() => {
                              setTitleField(field.key);
                              setSelectedFields(prev => ({ ...prev, [field.key]: true }));
                            }}
                            title="Use as display title (optional)"
                          >
                            Title {titleField === field.key && '✓'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

