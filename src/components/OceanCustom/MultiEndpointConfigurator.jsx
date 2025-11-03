import React, { useState } from 'react';
import PortTooltip from "/src/components/tooltip/tooltip.jsx";
import styles from './styles.module.css';

export function MultiEndpointConfigurator() {
  const [endpoints, setEndpoints] = useState([]);
  const [currentEndpoint, setCurrentEndpoint] = useState({
    endpoint: '/api/v1/users',
    responseJson: `{
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
}`,
    dataPath: null,
    blueprintId: '',
    blueprintTitle: '',
    selectedFields: {},
    identifierField: '',
    titleField: ''
  });

  const [editingIndex, setEditingIndex] = useState(null);

  const parseFields = () => {
    if (currentEndpoint.dataPath === null || !currentEndpoint.responseJson) {
      return [];
    }

    try {
      const json = JSON.parse(currentEndpoint.responseJson);
      let data = json;

      if (currentEndpoint.dataPath && currentEndpoint.dataPath !== '') {
        const path = currentEndpoint.dataPath.replace(/^\./, '').split('.');
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

  const fields = parseFields();

  const saveEndpoint = () => {
    const endpointConfig = {
      ...currentEndpoint,
      blueprint: generateBlueprint(),
      mapping: generateMapping()
    };

    if (editingIndex !== null) {
      const updated = [...endpoints];
      updated[editingIndex] = endpointConfig;
      setEndpoints(updated);
      setEditingIndex(null);
    } else {
      setEndpoints([...endpoints, endpointConfig]);
    }

    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setCurrentEndpoint({
      endpoint: '',
      responseJson: '',
      dataPath: null,
      blueprintId: '',
      blueprintTitle: '',
      selectedFields: {},
      identifierField: '',
      titleField: ''
    });
  };

  const editEndpoint = (index) => {
    setCurrentEndpoint(endpoints[index]);
    setEditingIndex(index);
  };

  const deleteEndpoint = (index) => {
    setEndpoints(endpoints.filter((_, i) => i !== index));
  };

  const generateBlueprint = () => {
    const properties = {};
    
    fields.forEach(field => {
      if (currentEndpoint.selectedFields[field.key]) {
        properties[field.key] = {
          type: field.type,
          title: field.key.charAt(0).toUpperCase() + field.key.slice(1).replace(/_/g, ' ')
        };
        
        if (field.format) {
          properties[field.key].format = field.format;
        }
      }
    });

    return {
      identifier: currentEndpoint.blueprintId || 'my_blueprint',
      title: currentEndpoint.blueprintTitle || 'My Blueprint',
      icon: 'BlankPage',
      schema: {
        properties,
        required: []
      }
    };
  };

  const generateMapping = () => {
    const propertiesObj = {};
    fields.forEach(field => {
      if (currentEndpoint.selectedFields[field.key] && 
          field.key !== currentEndpoint.identifierField && 
          field.key !== currentEndpoint.titleField) {
        propertiesObj[field.key] = `.${field.key}`;
      }
    });

    return {
      kind: currentEndpoint.endpoint || '/api/v1/resource',
      selector: {
        query: 'true',
        ...(currentEndpoint.dataPath && currentEndpoint.dataPath !== '' && { data_path: currentEndpoint.dataPath })
      },
      port: {
        entity: {
          mappings: {
            identifier: `.${currentEndpoint.identifierField || 'id'} | tostring`,
            title: `.${currentEndpoint.titleField || 'name'}`,
            blueprint: `"${currentEndpoint.blueprintId || 'my_blueprint'}"`,
            ...(Object.keys(propertiesObj).length > 0 && { properties: propertiesObj })
          }
        }
      }
    };
  };

  const generateAllMappingsYaml = () => {
    return `resources:\n${endpoints.map(ep => `  - kind: ${ep.mapping.kind}
    selector:
      query: 'true'${ep.mapping.selector.data_path ? `
      data_path: '${ep.mapping.selector.data_path}'` : ''}
    port:
      entity:
        mappings:
          identifier: ${ep.mapping.port.entity.mappings.identifier}
          title: ${ep.mapping.port.entity.mappings.title}
          blueprint: ${ep.mapping.port.entity.mappings.blueprint}${ep.mapping.port.entity.mappings.properties ? `
          properties:` : ''}${
      ep.mapping.port.entity.mappings.properties 
        ? Object.entries(ep.mapping.port.entity.mappings.properties)
            .map(([key, value]) => `\n            ${key}: ${value}`).join('')
        : ''
    }`).join('\n')}`;
  };

  const createInPort = async () => {
    // This would make API calls to create blueprints
    // For now, we'll show the user what needs to be done
    alert('This feature would create the blueprints in Port via API. For now, copy the JSON and create manually.');
  };

  const renderJsonTree = (obj, path = '', level = 0) => {
    if (level > 2) return null;

    if (Array.isArray(obj)) {
      return (
        <div 
          className={`${styles.jsonTreeNode} ${styles.arrayNode} ${currentEndpoint.dataPath === '' ? styles.selectedNode : ''}`}
          onClick={() => setCurrentEndpoint({...currentEndpoint, dataPath: ''})}
        >
          <span className={styles.jsonKey}>Array (root level)</span>
          <span className={styles.arrayBadge}>{obj.length} items</span>
          {currentEndpoint.dataPath === '' && <span className={styles.selectedBadge}>✓</span>}
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
            className={`${styles.jsonTreeNode} ${isArray ? styles.arrayNode : ''} ${currentEndpoint.dataPath === currentPath ? styles.selectedNode : ''}`}
            onClick={() => isArray && setCurrentEndpoint({...currentEndpoint, dataPath: currentPath})}
          >
            <span className={styles.jsonKey}>{key}</span>
            {isArray && <span className={styles.arrayBadge}>{value.length} items</span>}
            {currentEndpoint.dataPath === currentPath && <span className={styles.selectedBadge}>✓</span>}
          </div>
          {isObject && !isArray && renderJsonTree(value, currentPath, level + 1)}
        </div>
      );
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={styles.multiEndpointConfig}>
      {endpoints.length > 0 && (
        <div className={styles.savedEndpoints}>
          <h3>Configured Endpoints</h3>
          <div className={styles.endpointsList}>
            {endpoints.map((ep, index) => (
              <div key={index} className={styles.endpointCard}>
                <div className={styles.endpointCardHeader}>
                  <div className={styles.endpointInfo}>
                    <div className={styles.endpointTitle}>
                      <code className={styles.endpointPath}>{ep.endpoint}</code>
                      <span className={styles.arrow}>→</span>
                      <span className={styles.blueprintName}>{ep.blueprintTitle || ep.blueprintId}</span>
                    </div>
                  </div>
                  <div className={styles.endpointActions}>
                    <PortTooltip id="blueprint">
                      <a 
                        href={`https://app.getport.io/settings/data-model?create=${encodeURIComponent(JSON.stringify(ep.blueprint))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.createInPortButton}
                      >
                        Create in Port
                      </a>
                    </PortTooltip>
                    <button onClick={() => editEndpoint(index)} className={styles.editButton}>Edit</button>
                    <button onClick={() => deleteEndpoint(index)} className={styles.deleteButton}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <details className={styles.mappingDetails} open>
            <summary className={styles.mappingSummary}>
              <strong>Integration Mapping</strong>
            </summary>
            <p className={styles.mappingHint}>Add this configuration to your integration via Port UI or mount as <code>port-app-config.yml</code>:</p>
            <div className={styles.codeWrapper}>
              <button onClick={() => copyToClipboard(generateAllMappingsYaml())} className={styles.copyBtn}>
                Copy to clipboard
              </button>
              <pre>
                <code className="language-yaml">{generateAllMappingsYaml()}</code>
              </pre>
            </div>
          </details>
        </div>
      )}

      <div className={styles.endpointConfig}>
        <div className={styles.formHeader}>
          <h3>{editingIndex !== null ? 'Edit Endpoint' : 'Add Endpoint'}</h3>
        </div>

        <div className={styles.step}>
          <h4>1. Endpoint Path</h4>
          <input
            type="text"
            placeholder="/api/v1/users"
            value={currentEndpoint.endpoint}
            onChange={(e) => setCurrentEndpoint({...currentEndpoint, endpoint: e.target.value})}
            className={styles.input}
          />
        </div>

        <div className={styles.step}>
          <h4>2. API Response</h4>
          <p className={styles.hint}>Paste the JSON response from your API:</p>
          <textarea
            placeholder={`{\n  "data": [...]\n}`}
            value={currentEndpoint.responseJson}
            onChange={(e) => setCurrentEndpoint({...currentEndpoint, responseJson: e.target.value, dataPath: null})}
            className={styles.textarea}
            rows={10}
          />
        </div>

        {currentEndpoint.responseJson && (
          <>
            <div className={styles.step}>
              <h4>3. Data Path</h4>
              <p className={styles.hint}>Select the array containing your data:</p>
              <div className={styles.jsonTreeContainer}>
                {(() => {
                  try {
                    const json = JSON.parse(currentEndpoint.responseJson);
                    return renderJsonTree(json);
                  } catch {
                    return <div className={styles.error}>Invalid JSON</div>;
                  }
                })()}
              </div>
              {currentEndpoint.dataPath !== null && (
                <div className={styles.selectedPath}>
                  <strong>data_path:</strong> <code>{currentEndpoint.dataPath || '.'}</code>
                </div>
              )}
            </div>

            {currentEndpoint.dataPath !== null && fields.length > 0 && (
              <>
                <div className={styles.step}>
                  <h4>4. Blueprint Configuration</h4>
                  <input
                    type="text"
                    placeholder="Blueprint identifier (e.g., user)"
                    value={currentEndpoint.blueprintId}
                    onChange={(e) => setCurrentEndpoint({...currentEndpoint, blueprintId: e.target.value})}
                    className={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="Blueprint title (e.g., User)"
                    value={currentEndpoint.blueprintTitle}
                    onChange={(e) => setCurrentEndpoint({...currentEndpoint, blueprintTitle: e.target.value})}
                    className={styles.input}
                  />
                </div>

                <div className={styles.step}>
                  <h4>5. Field Mapping</h4>
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
                            checked={currentEndpoint.selectedFields[field.key] || false}
                            onChange={() => setCurrentEndpoint({
                              ...currentEndpoint,
                              selectedFields: {
                                ...currentEndpoint.selectedFields,
                                [field.key]: !currentEndpoint.selectedFields[field.key]
                              }
                            })}
                          />
                          <span className={styles.fieldName}>{field.key}</span>
                        </label>
                        <span className={styles.fieldType}>
                          {field.type}{field.format ? ` (${field.format})` : ''}
                        </span>
                        <div className={styles.fieldActions}>
                          <button
                            className={`${styles.roleButton} ${currentEndpoint.identifierField === field.key ? styles.active : ''}`}
                            onClick={() => setCurrentEndpoint({
                              ...currentEndpoint,
                              identifierField: field.key,
                              selectedFields: {...currentEndpoint.selectedFields, [field.key]: true}
                            })}
                          >
                            ID
                          </button>
                          <button
                            className={`${styles.roleButton} ${currentEndpoint.titleField === field.key ? styles.active : ''}`}
                            onClick={() => setCurrentEndpoint({
                              ...currentEndpoint,
                              titleField: field.key,
                              selectedFields: {...currentEndpoint.selectedFields, [field.key]: true}
                            })}
                          >
                            Title
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.saveButtonContainer}>
                  <button onClick={saveEndpoint} className={styles.saveEndpointButton}>
                    {editingIndex !== null ? 'Update Endpoint' : 'Save Endpoint'}
                  </button>
                  {editingIndex !== null && (
                    <button onClick={() => { resetForm(); setEditingIndex(null); }} className={styles.cancelButton}>
                      Cancel
                    </button>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

