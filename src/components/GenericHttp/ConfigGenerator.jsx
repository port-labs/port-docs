import React, { useState } from 'react';
import styles from './styles.module.css';

export function ConfigGenerator() {
  const [endpoint, setEndpoint] = useState('');
  const [dataPath, setDataPath] = useState('');
  const [blueprintId, setBlueprintId] = useState('');
  const [identifierField, setIdentifierField] = useState('.id');
  const [titleField, setTitleField] = useState('.name');
  const [properties, setProperties] = useState([{ portField: '', apiField: '' }]);

  const addProperty = () => {
    setProperties([...properties, { portField: '', apiField: '' }]);
  };

  const updateProperty = (index, field, value) => {
    const newProperties = [...properties];
    newProperties[index][field] = value;
    setProperties(newProperties);
  };

  const removeProperty = (index) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const generateConfig = () => {
    const propertiesObj = {};
    properties.forEach(prop => {
      if (prop.portField && prop.apiField) {
        propertiesObj[prop.portField] = prop.apiField;
      }
    });

    const config = {
      resources: [
        {
          kind: endpoint || '/api/v1/resource',
          selector: {
            query: 'true',
            ...(dataPath && { data_path: dataPath })
          },
          port: {
            entity: {
              mappings: {
                identifier: `${identifierField} | tostring`,
                title: titleField,
                blueprint: `"${blueprintId || 'my_blueprint'}"`,
                ...(Object.keys(propertiesObj).length > 0 && { properties: propertiesObj })
              }
            }
          }
        }
      ]
    };

    // Convert to YAML-like format (simplified)
    const yaml = `resources:
  - kind: ${config.resources[0].kind}
    selector:
      query: 'true'${dataPath ? `\n      data_path: '${dataPath}'` : ''}
    port:
      entity:
        mappings:
          identifier: ${config.resources[0].port.entity.mappings.identifier}
          title: ${config.resources[0].port.entity.mappings.title}
          blueprint: ${config.resources[0].port.entity.mappings.blueprint}${Object.keys(propertiesObj).length > 0 ? `\n          properties:` : ''}${
      Object.entries(propertiesObj).map(([key, value]) => `\n            ${key}: ${value}`).join('')
    }`;

    return yaml;
  };

  const copyConfig = () => {
    navigator.clipboard.writeText(generateConfig());
  };

  return (
    <div className={styles.configGenerator}>
      <div className={styles.formSection}>
        <h3>🔗 Endpoint Configuration</h3>
        
        <label className={styles.label}>
          Endpoint path:
          <input
            type="text"
            placeholder="/api/v1/users"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          Data path (optional):
          <input
            type="text"
            placeholder=".data or .users (leave empty if response is direct array)"
            value={dataPath}
            onChange={(e) => setDataPath(e.target.value)}
            className={styles.input}
          />
        </label>

        <h3>🎯 Entity Mapping</h3>

        <label className={styles.label}>
          Blueprint identifier:
          <input
            type="text"
            placeholder="api_user"
            value={blueprintId}
            onChange={(e) => setBlueprintId(e.target.value)}
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          Identifier field (JQ expression):
          <input
            type="text"
            placeholder=".id"
            value={identifierField}
            onChange={(e) => setIdentifierField(e.target.value)}
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          Title field (JQ expression):
          <input
            type="text"
            placeholder=".name"
            value={titleField}
            onChange={(e) => setTitleField(e.target.value)}
            className={styles.input}
          />
        </label>

        <h3>📝 Properties</h3>
        {properties.map((prop, index) => (
          <div key={index} className={styles.propertyRow}>
            <input
              type="text"
              placeholder="Port property name"
              value={prop.portField}
              onChange={(e) => updateProperty(index, 'portField', e.target.value)}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="API field (JQ: .field)"
              value={prop.apiField}
              onChange={(e) => updateProperty(index, 'apiField', e.target.value)}
              className={styles.input}
            />
            <button
              onClick={() => removeProperty(index)}
              className={styles.removeButton}
              disabled={properties.length === 1}
            >
              ✕
            </button>
          </div>
        ))}
        
        <button onClick={addProperty} className={styles.addButton}>
          ➕ Add Property
        </button>
      </div>

      <div className={styles.outputSection}>
        <div className={styles.outputHeader}>
          <h3>✨ Generated Configuration</h3>
          <button onClick={copyConfig} className={styles.copyButton}>
            📋 Copy
          </button>
        </div>
        <pre className={styles.codeBlock}>
          <code>{generateConfig()}</code>
        </pre>
        <div className={styles.hint}>
          Add this configuration to Port via the Data Sources page or mount as a file
        </div>
      </div>
    </div>
  );
}

