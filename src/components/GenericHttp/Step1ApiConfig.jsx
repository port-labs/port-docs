import React from 'react';
import { useIntegrationBuilder } from './IntegrationBuilderContext';
import styles from './styles.module.css';

export function Step1ApiConfig() {
  const {
    baseUrl, setBaseUrl,
    authType, setAuthType,
    apiToken, setApiToken,
    apiKey, setApiKey,
    apiKeyHeader, setApiKeyHeader,
    username, setUsername,
    password, setPassword,
    paginationType, setPaginationType,
    pageSize, setPageSize,
    paginationParam, setPaginationParam,
    sizeParam, setSizeParam,
    startPage, setStartPage,
    cursorPath, setCursorPath,
    hasMorePath, setHasMorePath,
    timeout, setTimeout,
    verifySsl, setVerifySsl,
    maxConcurrentRequests, setMaxConcurrentRequests,
  } = useIntegrationBuilder();

  return (
    <div className={styles.builderSection}>
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

        <details className={styles.advancedSection}>
          <summary className={styles.advancedSummary}>
            <strong>Advanced Configuration</strong>
          </summary>
          
          <div className={styles.advancedContent}>
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
              <>
                <label className={styles.label}>
                  <strong>Page Size</strong>
                  <input
                    type="number"
                    placeholder="100"
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.hint}>Number of items per page (default: 100)</span>
                </label>

                <label className={styles.label}>
                  <strong>Pagination Parameter Name</strong>
                  <input
                    type="text"
                    placeholder={paginationType === 'cursor' ? 'cursor, after' : paginationType === 'page' ? 'page, pageNumber' : 'offset, skip'}
                    value={paginationParam}
                    onChange={(e) => setPaginationParam(e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.hint}>Query parameter name for pagination (e.g., "cursor", "page", "offset")</span>
                </label>

                <label className={styles.label}>
                  <strong>Size Parameter Name</strong>
                  <input
                    type="text"
                    placeholder="limit, size, per_page"
                    value={sizeParam}
                    onChange={(e) => setSizeParam(e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.hint}>Query parameter name for page size (e.g., "limit", "size", "per_page")</span>
                </label>

                {paginationType === 'page' && (
                  <label className={styles.label}>
                    <strong>Start Page</strong>
                    <input
                      type="number"
                      placeholder="1"
                      value={startPage}
                      onChange={(e) => setStartPage(e.target.value)}
                      className={styles.input}
                    />
                    <span className={styles.hint}>Starting page number (0 or 1, default: 1)</span>
                  </label>
                )}

                {paginationType === 'cursor' && (
                  <label className={styles.label}>
                    <strong>Cursor Path</strong>
                    <input
                      type="text"
                      placeholder="meta.after_cursor, links.next"
                      value={cursorPath}
                      onChange={(e) => setCursorPath(e.target.value)}
                      className={styles.input}
                    />
                    <span className={styles.hint}>Dot-notation path to extract cursor from response (e.g., "meta.after_cursor")</span>
                  </label>
                )}

                <label className={styles.label}>
                  <strong>Has More Path</strong>
                  <input
                    type="text"
                    placeholder="meta.has_more, pagination.hasMore"
                    value={hasMorePath}
                    onChange={(e) => setHasMorePath(e.target.value)}
                    className={styles.input}
                  />
                  <span className={styles.hint}>Dot-notation path to check if more pages exist (e.g., "meta.has_more")</span>
                </label>
              </>
            )}

            <label className={styles.label}>
              <strong>Request Timeout (seconds)</strong>
              <input
                type="number"
                placeholder="30"
                value={timeout}
                onChange={(e) => setTimeout(e.target.value)}
                className={styles.input}
              />
              <span className={styles.hint}>Maximum time to wait for API response (default: 30)</span>
            </label>

            <label className={styles.label}>
              <strong>Max Concurrent Requests</strong>
              <input
                type="number"
                placeholder="10"
                value={maxConcurrentRequests}
                onChange={(e) => setMaxConcurrentRequests(e.target.value)}
                className={styles.input}
              />
              <span className={styles.hint}>Maximum number of parallel API requests (default: 10)</span>
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={verifySsl}
                onChange={(e) => setVerifySsl(e.target.checked)}
              />
              <span>Verify SSL certificates</span>
            </label>
          </div>
        </details>
      </div>
    </div>
  );
}

