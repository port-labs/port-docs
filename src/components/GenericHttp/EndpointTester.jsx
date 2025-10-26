import React, { useState } from 'react';
import styles from './styles.module.css';

export function EndpointTester() {
  const [endpoint, setEndpoint] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataPath, setDataPath] = useState('');

  const testEndpoint = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    // Note: This is a placeholder. In a real implementation, you would:
    // 1. Make a request through a backend proxy to avoid CORS
    // 2. Use the authentication config from the previous step
    // 3. Handle pagination parameters

    try {
      // Simulated response for demo purposes
      setTimeout(() => {
        const mockResponse = {
          data: [
            { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
          ],
          pagination: {
            total: 100,
            page: 1,
            per_page: 2
          }
        };
        
        setResponse(JSON.stringify(mockResponse, null, 2));
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const detectDataPath = (jsonString) => {
    try {
      const json = JSON.parse(jsonString);
      
      // If already an array, no path needed
      if (Array.isArray(json)) {
        return 'No data_path needed - response is already an array';
      }
      
      // Common paths
      const commonPaths = ['data', 'items', 'results', 'users', 'tickets'];
      for (const path of commonPaths) {
        if (json[path] && Array.isArray(json[path])) {
          return `.${path}`;
        }
      }
      
      return 'Could not auto-detect - inspect the response structure';
    } catch {
      return '';
    }
  };

  return (
    <div className={styles.tester}>
      <div className={styles.testerInput}>
        <h3>🧪 Test Your Endpoint</h3>
        <p>Enter an API endpoint to test the response structure</p>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="/api/v1/users"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className={styles.input}
          />
          <button 
            onClick={testEndpoint} 
            disabled={loading || !endpoint}
            className={styles.testButton}
          >
            {loading ? '⏳ Testing...' : '🚀 Test Endpoint'}
          </button>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className={styles.testerOutput}>
          <div className={styles.outputHeader}>
            <h3>📄 API Response</h3>
          </div>
          <pre className={styles.codeBlock}>
            <code>{response}</code>
          </pre>

          <div className={styles.dataPathDetector}>
            <h4>🎯 Detected data_path:</h4>
            <div className={styles.detectedPath}>
              <code>{detectDataPath(response)}</code>
            </div>
            <p className={styles.hint}>
              Use this in your <code>selector.data_path</code> field to extract the array
            </p>
          </div>
        </div>
      )}

      {!response && !loading && (
        <div className={styles.placeholder}>
          <p>💡 Enter an endpoint above and click "Test Endpoint" to see the API response structure</p>
        </div>
      )}
    </div>
  );
}

