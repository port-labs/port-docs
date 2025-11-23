import React, { useState } from 'react';
import styles from './styles.module.css';

export function ApiConfigBuilder() {
  const [baseUrl, setBaseUrl] = useState('');
  const [authType, setAuthType] = useState('bearer_token');
  const [apiToken, setApiToken] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiKeyHeader, setApiKeyHeader] = useState('X-API-Key');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [paginationType, setPaginationType] = useState('none');
  const [pageSize, setPageSize] = useState('100');

  const generateEnvVars = () => {
    const vars = [`OCEAN__INTEGRATION__CONFIG__BASE_URL=${baseUrl}`];
    
    // Auth config
    vars.push(`OCEAN__INTEGRATION__CONFIG__AUTH_TYPE=${authType}`);
    
    if (authType === 'bearer_token' && apiToken) {
      vars.push(`OCEAN__INTEGRATION__CONFIG__API_TOKEN=${apiToken}`);
    } else if (authType === 'api_key' && apiKey) {
      vars.push(`OCEAN__INTEGRATION__CONFIG__API_KEY=${apiKey}`);
      vars.push(`OCEAN__INTEGRATION__CONFIG__API_KEY_HEADER=${apiKeyHeader}`);
    } else if (authType === 'basic' && username && password) {
      vars.push(`OCEAN__INTEGRATION__CONFIG__USERNAME=${username}`);
      vars.push(`OCEAN__INTEGRATION__CONFIG__PASSWORD=${password}`);
    }
    
    // Pagination config
    if (paginationType !== 'none') {
      vars.push(`OCEAN__INTEGRATION__CONFIG__PAGINATION_TYPE=${paginationType}`);
      vars.push(`OCEAN__INTEGRATION__CONFIG__PAGE_SIZE=${pageSize}`);
    }
    
    return vars.join('\n');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateEnvVars());
  };

  return (
    <div className={styles.configBuilder}>
      <div className={styles.formSection}>
        <h3>🌐 API Base URL</h3>
        <input
          type="text"
          placeholder="https://api.example.com"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          className={styles.input}
        />
        
        <h3>🔐 Authentication</h3>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="bearer_token"
              checked={authType === 'bearer_token'}
              onChange={(e) => setAuthType(e.target.value)}
            />
            Bearer Token
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="api_key"
              checked={authType === 'api_key'}
              onChange={(e) => setAuthType(e.target.value)}
            />
            API Key
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="basic"
              checked={authType === 'basic'}
              onChange={(e) => setAuthType(e.target.value)}
            />
            Basic Auth
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="none"
              checked={authType === 'none'}
              onChange={(e) => setAuthType(e.target.value)}
            />
            None
          </label>
        </div>

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
            <input
              type="password"
              placeholder="Your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className={styles.input}
            />
            <input
              type="text"
              placeholder="Header name (e.g., X-API-Key)"
              value={apiKeyHeader}
              onChange={(e) => setApiKeyHeader(e.target.value)}
              className={styles.input}
            />
          </>
        )}

        {authType === 'basic' && (
          <>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
            />
          </>
        )}

        <h3>📄 Pagination</h3>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="none"
              checked={paginationType === 'none'}
              onChange={(e) => setPaginationType(e.target.value)}
            />
            None
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="offset"
              checked={paginationType === 'offset'}
              onChange={(e) => setPaginationType(e.target.value)}
            />
            Offset/Limit
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="page"
              checked={paginationType === 'page'}
              onChange={(e) => setPaginationType(e.target.value)}
            />
            Page/Size
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="cursor"
              checked={paginationType === 'cursor'}
              onChange={(e) => setPaginationType(e.target.value)}
            />
            Cursor
          </label>
        </div>

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

      <div className={styles.outputSection}>
        <div className={styles.outputHeader}>
          <h3>✨ Generated Configuration</h3>
          <button onClick={copyToClipboard} className={styles.copyButton}>
            📋 Copy
          </button>
        </div>
        <pre className={styles.codeBlock}>
          <code>{generateEnvVars() || '# Fill in the form to generate configuration'}</code>
        </pre>
      </div>
    </div>
  );
}


