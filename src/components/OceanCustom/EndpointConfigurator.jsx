import React, { useState } from 'react';
import styles from './styles.module.css';

export function EndpointConfigurator() {
  const [endpoint, setEndpoint] = useState('/api/v1/users');
  const [responseJson, setResponseJson] = useState(`{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "user"
    }
  ],
  "meta": {
    "total": 2,
    "page": 1
  }
}`);
  const [dataPath, setDataPath] = useState(null); // null = not selected, '' = direct array, '.path' = nested
  const [blueprintId, setBlueprintId] = useState('');
  const [blueprintTitle, setBlueprintTitle] = useState('');
  const [selectedFields, setSelectedFields] = useState({});
  const [identifierField, setIdentifierField] = useState('');
  const [titleField, setTitleField] = useState('');

  const parseFields = () => {
    if (dataPath === null || !responseJson) {
      return []; // Not selected yet
    }

    try {
      const json = JSON.parse(responseJson);
      let data = json;

      // Extract data using data_path if provided (skip if empty string = direct array)
      if (dataPath && dataPath !== '') {
        const path = dataPath.replace(/^\./, '').split('.');
        for (const key of path) {
          data = data[key];
        }
      }

      // Get first item if array
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

  const fields = parseFields();

  const toggleField = (key) => {
    setSelectedFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderJsonTree = (obj, path = '', level = 0) => {
    if (level > 2) return null; // Limit depth

    // Handle direct array at root
    if (Array.isArray(obj)) {
      return (
        <div 
          className={`${styles.jsonTreeNode} ${styles.arrayNode} ${dataPath === '' ? styles.selectedNode : ''}`}
          onClick={() => setDataPath('')}
        >
          <span className={styles.jsonKey}>Array (root level)</span>
          <span className={styles.arrayBadge}>{obj.length} items</span>
          {dataPath === '' && <span className={styles.selectedBadge}>✓</span>}
        </div>
      );
    }

    return Object.entries(obj).map(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : `.${key}`;
      const isArray = Array.isArray(value);
      const isObject = typeof value === 'object' && value !== null && !isArray;

      return (
        <div key={currentPath} style={{ marginLeft: `${level * 20}px` }}>
          <div 
            className={`${styles.jsonTreeNode} ${isArray ? styles.arrayNode : ''} ${dataPath === currentPath ? styles.selectedNode : ''}`}
            onClick={() => isArray && setDataPath(currentPath)}
          >
            <span className={styles.jsonKey}>{key}</span>
            {isArray && <span className={styles.arrayBadge}>{value.length} items</span>}
            {dataPath === currentPath && <span className={styles.selectedBadge}>✓</span>}
          </div>
          {isObject && !isArray && renderJsonTree(value, currentPath, level + 1)}
        </div>
      );
    });
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

  const generateMapping = () => {
    const propertiesObj = {};
    fields.forEach(field => {
      if (selectedFields[field.key] && field.key !== identifierField && field.key !== titleField) {
        propertiesObj[field.key] = `.${field.key}`;
      }
    });

    return `resources:
  - kind: ${endpoint || '/api/v1/resource'}
    selector:
      query: 'true'${dataPath && dataPath !== '' ? `
      data_path: '${dataPath}'` : ''}
    port:
      entity:
        mappings:
          identifier: .${identifierField || 'id'} | tostring
          title: .${titleField || 'name'}
          blueprint: '"${blueprintId || 'my_blueprint'}"'${Object.keys(propertiesObj).length > 0 ? `
          properties:` : ''}${
      Object.entries(propertiesObj).map(([key, value]) => `
            ${key}: ${value}`).join('')
    }`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={styles.endpointConfig}>
      <div className={styles.step}>
        <h3>Enter Your Endpoint</h3>
        <input
          type="text"
          placeholder="/api/v1/users"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.step}>
        <h3>Paste API Response</h3>
        <p className={styles.hint}>Test your endpoint with curl and paste the response here:</p>
        <textarea
          placeholder={`{\n  "data": [\n    {"id": 1, "name": "Alice", "email": "alice@example.com"},\n    {"id": 2, "name": "Bob", "email": "bob@example.com"}\n  ]\n}`}
          value={responseJson}
          onChange={(e) => {
            setResponseJson(e.target.value);
            setDataPath(null); // Reset selection when JSON changes
          }}
          className={styles.textarea}
          rows={10}
        />
      </div>

      {responseJson && (
        <>
          <div className={styles.step}>
            <h3>Select Data Path</h3>
            <p className={styles.hint}>Click the array containing your data:</p>
            <div className={styles.jsonTreeContainer}>
              {(() => {
                try {
                  const json = JSON.parse(responseJson);
                  return renderJsonTree(json);
                } catch {
                  return <div className={styles.error}>Invalid JSON</div>;
                }
              })()}
            </div>
            {dataPath !== null && (
              <div className={styles.selectedPath}>
                <strong>data_path:</strong> <code>{dataPath || '.'}</code>
              </div>
            )}
          </div>

          {dataPath !== null && fields.length > 0 && (
            <>
              <div className={styles.step}>
                <h3>Configure Blueprint</h3>
                <input
                  type="text"
                  placeholder="Blueprint identifier (e.g., user)"
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
              </div>

              <div className={styles.step}>
                <h3>Select Fields & Mapping</h3>
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
                        >
                          ID
                        </button>
                        <button
                          className={`${styles.roleButton} ${titleField === field.key ? styles.active : ''}`}
                          onClick={() => {
                            setTitleField(field.key);
                            setSelectedFields(prev => ({ ...prev, [field.key]: true }));
                          }}
                        >
                          Title
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.step}>
                <h3>Generated Configuration</h3>
                
                <div className={styles.outputBox}>
                  <div className={styles.outputHeader}>
                    <h4>Blueprint JSON</h4>
                    <button onClick={() => copyToClipboard(generateBlueprint())} className={styles.copyButton}>
                      Copy
                    </button>
                  </div>
                  <p className={styles.hint}>Create this blueprint in <a href="https://app.getport.io/settings/data-model" target="_blank">Port Builder</a></p>
                  <pre className={styles.codeBlock}>
                    <code>{generateBlueprint()}</code>
                  </pre>
                </div>

                <div className={styles.outputBox}>
                  <div className={styles.outputHeader}>
                    <h4>Mapping Configuration</h4>
                    <button onClick={() => copyToClipboard(generateMapping())} className={styles.copyButton}>
                      Copy
                    </button>
                  </div>
                  <p className={styles.hint}>Add this to your integration via Port UI or mount as <code>port-app-config.yml</code></p>
                  <pre className={styles.codeBlock}>
                    <code>{generateMapping()}</code>
                  </pre>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

