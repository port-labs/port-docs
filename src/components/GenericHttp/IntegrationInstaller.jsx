import React, { useState } from 'react';
import styles from './styles.module.css';

export function IntegrationInstaller() {
  const [baseUrl, setBaseUrl] = useState('');
  const [authType, setAuthType] = useState('bearer_token');
  const [apiToken, setApiToken] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiKeyHeader, setApiKeyHeader] = useState('X-API-Key');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [paginationType, setPaginationType] = useState('none');
  const [pageSize, setPageSize] = useState('100');

  const getConfigSummary = () => {
    const config = [];
    if (baseUrl) config.push(`Base URL: ${baseUrl}`);
    config.push(`Authentication: ${authType === 'bearer_token' ? 'Bearer Token' : authType === 'api_key' ? 'API Key' : authType === 'basic' ? 'Basic Auth' : 'None'}`);
    if (paginationType !== 'none') config.push(`Pagination: ${paginationType} (${pageSize} items/page)`);
    return config.length > 0 ? config : ['No configuration set'];
  };

  return (
    <div className={styles.installer}>
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

        <div className={styles.configSummary}>
          <p><strong>Your Configuration:</strong></p>
          <ul>
            {getConfigSummary().map((item, i) => <li key={i}>{item}</li>)}
          </ul>
          <p className={styles.hint}>You'll use these values in Step 3 when installing.</p>
        </div>
      </div>
    </div>
  );
}

