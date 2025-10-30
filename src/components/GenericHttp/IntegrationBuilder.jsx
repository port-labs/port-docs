import React, { useState } from 'react';
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import CodeBlock from '@theme/CodeBlock';
import styles from './styles.module.css';

export function IntegrationBuilder() {
  // Step 1: API Configuration
  const [baseUrl, setBaseUrl] = useState('');
  const [authType, setAuthType] = useState('bearer_token');
  const [apiToken, setApiToken] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiKeyHeader, setApiKeyHeader] = useState('X-API-Key');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [paginationType, setPaginationType] = useState('none');
  const [pageSize, setPageSize] = useState('100');

  // Step 2: Endpoint Configuration
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
  const [dataPath, setDataPath] = useState(null);
  const [blueprintId, setBlueprintId] = useState('');
  const [blueprintTitle, setBlueprintTitle] = useState('');
  const [selectedFields, setSelectedFields] = useState({});
  const [identifierField, setIdentifierField] = useState('');
  const [titleField, setTitleField] = useState('');

  const generateDockerCommand = () => {
    const envVars = [
      `  -e OCEAN__PORT__CLIENT_ID="<PORT_CLIENT_ID>"`,
      `  -e OCEAN__PORT__CLIENT_SECRET="<PORT_CLIENT_SECRET>"`,
      `  -e OCEAN__PORT__BASE_URL="https://api.getport.io"`,
      `  -e OCEAN__EVENT_LISTENER__TYPE="ONCE"`,
      `  -e OCEAN__INTEGRATION__IDENTIFIER="generic-http"`,
      `  -e OCEAN__INTEGRATION__TYPE="generic-http"`,
      `  -e OCEAN__INTEGRATION__CONFIG__BASE_URL="${baseUrl || 'https://api.example.com'}"`,
    ];

    if (authType === 'bearer_token') {
      envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="bearer_token"`);
      envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__AUTH_VALUE="${apiToken || '<YOUR_API_TOKEN>'}"`);
    } else if (authType === 'api_key') {
      envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="api_key"`);
      envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__AUTH_VALUE="${apiKey || '<YOUR_API_KEY>'}"`);
      if (apiKeyHeader !== 'X-API-Key') {
        envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__API_KEY_HEADER="${apiKeyHeader}"`);
      }
    } else if (authType === 'basic') {
      envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="basic"`);
      envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__AUTH_VALUE="${username || '<USERNAME>'}:${password || '<PASSWORD>'}"`);
    } else {
      envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="none"`);
    }

    if (paginationType !== 'none') {
      envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__PAGINATION_TYPE="${paginationType}"`);
      envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__PAGE_SIZE="${pageSize}"`);
    }

    return `docker run -d --name ocean-http-integration \\
${envVars.join(' \\\n')} \\
  ghcr.io/port-labs/port-ocean-generic-http:latest`;
  };

  const generateHelmValues = () => {
    const config = {
      baseUrl: baseUrl || 'https://api.example.com',
      authType: authType,
    };

    if (paginationType !== 'none') {
      config.paginationType = paginationType;
      config.pageSize = parseInt(pageSize);
    }

    if (apiKeyHeader !== 'X-API-Key' && authType === 'api_key') {
      config.apiKeyHeader = apiKeyHeader;
    }

    let authValue = '';
    if (authType === 'bearer_token') {
      authValue = apiToken || '<YOUR_API_TOKEN>';
    } else if (authType === 'api_key') {
      authValue = apiKey || '<YOUR_API_KEY>';
    } else if (authType === 'basic') {
      authValue = `${username || '<USERNAME>'}:${password || '<PASSWORD>'}`;
    }

    return `initializePortResources: true
scheduledResyncInterval: 60
integration:
  identifier: generic-http
  type: generic-http
  eventListener:
    type: POLLING
  config:
    baseUrl: ${config.baseUrl}
    authType: ${config.authType}${config.paginationType ? `
    paginationType: ${config.paginationType}
    pageSize: ${config.pageSize}` : ''}${config.apiKeyHeader ? `
    apiKeyHeader: ${config.apiKeyHeader}` : ''}${authType !== 'none' ? `
  secrets:
    authValue: ${authValue}` : ''}
port:
  clientId: <PORT_CLIENT_ID>
  clientSecret: <PORT_CLIENT_SECRET>`;
  };

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

  const generateBlueprint = () => {
    const fields = parseFields();
    const properties = {};
    
    fields.forEach(field => {
      if (selectedFields[field.key] && field.key !== identifierField && field.key !== titleField) {
        properties[field.key] = {
          type: field.type,
          title: field.key.charAt(0).toUpperCase() + field.key.slice(1)
        };
        
        if (field.format) {
          properties[field.key].format = field.format;
        }
      }
    });

    return JSON.stringify({
      identifier: blueprintId || 'myBlueprint',
      title: blueprintTitle || 'My Blueprint',
      icon: 'DefaultBlueprint',
      schema: {
        properties: properties,
        required: []
      },
      mirrorProperties: {},
      calculationProperties: {},
      aggregationProperties: {},
      relations: {}
    }, null, 2);
  };

  const generateMapping = () => {
    const fields = parseFields();
    const properties = {};
    
    fields.forEach(field => {
      if (selectedFields[field.key] && field.key !== identifierField && field.key !== titleField) {
        properties[field.key] = `.${field.key}`;
      }
    });

    const mapping = {
      resources: [
        {
          kind: endpoint || '/api/v1/resource',
          selector: {
            query: 'true',
            ...(dataPath && dataPath !== '' ? { data_path: dataPath } : {})
          },
          port: {
            entity: {
              mappings: {
                identifier: identifierField ? `.${identifierField} | tostring` : '.id | tostring',
                title: titleField ? `.${titleField}` : '.name',
                blueprint: `"${blueprintId || 'myBlueprint'}"`,
                properties: properties
              }
            }
          }
        }
      ]
    };

    return `# Add this to your integration mapping
${mapping.resources.map(resource => 
`resources:
  - kind: ${resource.kind}
    selector:
      query: ${resource.selector.query}${resource.selector.data_path ? `
      data_path: ${resource.selector.data_path}` : ''}
    port:
      entity:
        mappings:
          identifier: ${resource.port.entity.mappings.identifier}
          title: ${resource.port.entity.mappings.title}
          blueprint: ${resource.port.entity.mappings.blueprint}${Object.keys(resource.port.entity.mappings.properties).length > 0 ? `
          properties:
${Object.entries(resource.port.entity.mappings.properties).map(([k, v]) => `            ${k}: ${v}`).join('\n')}` : ''}`
).join('\n')}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const renderJsonTree = (obj, path = '', level = 0) => {
    if (level > 3) return null;

    return Object.entries(obj).map(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : `.${key}`;
      const isArray = Array.isArray(value);
      const isObject = value && typeof value === 'object' && !isArray;
      const itemCount = isArray ? value.length : 0;

      return (
        <div key={currentPath} className={styles.jsonTreeNode} style={{ marginLeft: `${level * 20}px` }}>
          {isArray ? (
            <>
              <span 
                className={`${styles.jsonKey} ${dataPath === currentPath ? styles.selected : ''}`}
                onClick={() => setDataPath(currentPath)}
                style={{ cursor: 'pointer' }}
              >
                {key}
              </span>
              <span className={styles.arrayBadge}>{itemCount} items</span>
              {dataPath === currentPath && <span className={styles.selectedBadge}>✓ Selected</span>}
            </>
          ) : isObject ? (
            <>
              <span className={styles.jsonKey}>{key}</span>
              <span style={{ color: 'var(--ifm-color-emphasis-600)', marginLeft: '0.5rem' }}>(object)</span>
              {renderJsonTree(value, currentPath, level + 1)}
            </>
          ) : (
            <span className={styles.jsonKey}>{key}: {JSON.stringify(value)}</span>
          )}
        </div>
      );
    });
  };

  const fields = parseFields();
  const toggleField = (key) => {
    setSelectedFields(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={styles.integrationBuilder}>
      {/* Step 1: Configure API */}
      <div className={styles.builderSection}>
        <div className={styles.sectionHeader}>
          <h2>Step 1: Configure Your API</h2>
          <p>Set up the connection details for your API</p>
        </div>
        <div className={styles.configSection}>
        <label className={styles.label}>
          <strong>Base URL</strong>
          <input
            type="text"
            placeholder="https://api.example.com"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          <strong>Authentication</strong>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input type="radio" value="bearer_token" checked={authType === 'bearer_token'} onChange={(e) => setAuthType(e.target.value)} />
              Bearer Token
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" value="api_key" checked={authType === 'api_key'} onChange={(e) => setAuthType(e.target.value)} />
              API Key
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" value="basic" checked={authType === 'basic'} onChange={(e) => setAuthType(e.target.value)} />
              Basic Auth
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" value="none" checked={authType === 'none'} onChange={(e) => setAuthType(e.target.value)} />
              None
            </label>
          </div>
        </label>

        {authType === 'bearer_token' && (
          <input
            type="password"
            placeholder="Your bearer token"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            className={styles.input}
          />
        )}

        {authType === 'api_key' && (
          <>
            <input type="password" placeholder="Your API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className={styles.input} />
            <input type="text" placeholder="Header name (e.g., X-API-Key)" value={apiKeyHeader} onChange={(e) => setApiKeyHeader(e.target.value)} className={styles.input} />
          </>
        )}

        {authType === 'basic' && (
          <>
            <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className={styles.input} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={styles.input} />
          </>
        )}

        <label className={styles.label}>
          <strong>Pagination (optional)</strong>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input type="radio" value="none" checked={paginationType === 'none'} onChange={(e) => setPaginationType(e.target.value)} />
              None
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" value="offset" checked={paginationType === 'offset'} onChange={(e) => setPaginationType(e.target.value)} />
              Offset/Limit
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" value="page" checked={paginationType === 'page'} onChange={(e) => setPaginationType(e.target.value)} />
              Page/Size
            </label>
            <label className={styles.radioLabel}>
              <input type="radio" value="cursor" checked={paginationType === 'cursor'} onChange={(e) => setPaginationType(e.target.value)} />
              Cursor
            </label>
          </div>
        </label>

        {paginationType !== 'none' && (
          <input
            type="number"
            placeholder="Page size (default: 100)"
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value)}
            className={styles.input}
          />
        )}
        </div>
      </div>

      {/* Step 2: Choose Data to Sync */}
      <div className={styles.builderSection}>
        <div className={styles.sectionHeader}>
          <h2>Step 2: Choose What Data to Sync</h2>
          <p>Select an endpoint and configure which fields to ingest into Port</p>
        </div>
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
              setDataPath(null);
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
                    if (Array.isArray(json)) {
                      return (
                        <div 
                          className={`${styles.jsonTreeNode} ${dataPath === '' ? styles.selected : ''}`}
                          onClick={() => setDataPath('')}
                          style={{ cursor: 'pointer' }}
                        >
                          <span className={styles.jsonKey}>Array (root level)</span>
                          <span className={styles.arrayBadge}>{json.length} items</span>
                          {dataPath === '' && <span className={styles.selectedBadge}>✓ Selected</span>}
                        </div>
                      );
                    }
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
              </>
            )}
          </>
        )}
        </div>
      </div>

      {/* Step 3: Installation and Setup (shown dynamically) */}
      {blueprintId && identifierField && (
        <div className={styles.builderSection}>
          <div className={styles.sectionHeader}>
            <h2>Step 3: Install and Create in Port</h2>
            <p>Use the commands and configurations generated from your selections above</p>
          </div>
          <div className={styles.installationSection}>
          
          <h3>Install the Integration</h3>
          <Tabs groupId="deploy" queryString="deploy">
            <TabItem value="docker" label="Docker" default>
              <div className={styles.codeWrapper}>
                <button onClick={() => copyToClipboard(generateDockerCommand())} className={styles.copyBtn}>
                  Copy to clipboard
                </button>
                <CodeBlock language="bash" showLineNumbers>
                  {generateDockerCommand()}
                </CodeBlock>
              </div>
            </TabItem>
            
            <TabItem value="helm" label="Helm">
              <p>Create a <code>values.yaml</code> file:</p>
              <div className={styles.codeWrapper}>
                <button onClick={() => copyToClipboard(generateHelmValues())} className={styles.copyBtn}>
                  Copy to clipboard
                </button>
                <CodeBlock language="yaml" showLineNumbers title="values.yaml">
                  {generateHelmValues()}
                </CodeBlock>
              </div>
              <p style={{ marginTop: '1rem' }}>Then install:</p>
              <CodeBlock language="bash" showLineNumbers>
                {`helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm install generic-http port-labs/port-ocean -f values.yaml`}
              </CodeBlock>
            </TabItem>
          </Tabs>

          <h3 style={{ marginTop: '2rem' }}>Create the Blueprint</h3>
          <div className={styles.codeWrapper}>
            <a
              href={`https://app.getport.io/settings/data-model/blueprint/new?blueprint=${encodeURIComponent(generateBlueprint())}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.createInPortButton}
            >
              Create in Port
            </a>
            <button onClick={() => copyToClipboard(generateBlueprint())} className={styles.copyBtn} style={{ right: '140px' }}>
              Copy JSON
            </button>
            <CodeBlock language="json" showLineNumbers>
              {generateBlueprint()}
            </CodeBlock>
          </div>

          <h3 style={{ marginTop: '2rem' }}>Add the Mapping</h3>
          <div className={styles.codeWrapper}>
            <button onClick={() => copyToClipboard(generateMapping())} className={styles.copyBtn}>
              Copy to clipboard
            </button>
            <CodeBlock language="yaml" showLineNumbers>
              {generateMapping()}
            </CodeBlock>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

