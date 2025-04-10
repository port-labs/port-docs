import React, { useState } from 'react';
import styles from './styles.module.css';

export default function AIAgentRegistration() {
  const [apiToken, setApiToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const registerAIAgent = async () => {
    if (!apiToken) return;
    
    setIsLoading(true);
    setResponse(null);
    setError(null);
    
    try {
      // Format token correctly, handling if user already included "Bearer "
      const tokenWithPrefix = apiToken.trim().startsWith('Bearer ') 
        ? apiToken.trim() 
        : `Bearer ${apiToken.trim()}`;
      
      const result = await fetch('https://api.getport.io/v1/organization/ai/register', {
        method: 'PATCH',
        headers: {
          'Authorization': tokenWithPrefix
        }
      });
      
      const data = await result.json();
      
      if (data.error === 'ai_feature_flag_already_enabled') {
        setResponse({
          success: true,
          alreadyEnabled: true,
          message: 'AI agents are already enabled for your organization.'
        });
      } else if (!result.ok) {
        throw new Error(data.error || data.message || 'Failed to register AI agent');
      } else {
        setResponse({
          success: true,
          alreadyEnabled: false,
          message: 'AI agents are not enabled on your organization'
        });
      }
    } catch (err) {
      setError(err.message || 'An error occurred while registering AI agent');
    } finally {
      setIsLoading(false);
    }
  };

  const getCurlCommand = () => {
    // Handle token formatting for the curl command
    const formattedToken = apiToken.trim().startsWith('Bearer ') 
      ? apiToken.trim() 
      : `Bearer ${apiToken || '<YOUR_PORT_API_TOKEN>'}`;
    
    return `curl --location --request PATCH 'https://api.getport.io/v1/organization/ai/register' \\
--header 'Authorization: ${formattedToken}'`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getCurlCommand());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.aiAgentRegistration}>
      <div className={styles.formContainer}>
        <div>
          <label htmlFor="apiToken">Your Port API Token:</label>
          <input
            type="password"
            id="apiToken"
            value={apiToken}
            onChange={(e) => setApiToken(e.target.value)}
            placeholder="Enter your Port API token"
          />
          <div className={styles.tokenHint}>Enter your full token (with or without "Bearer " prefix)</div>
        </div>
        <button 
          onClick={registerAIAgent} 
          className={styles.actionButton} 
          disabled={!apiToken || isLoading}
        >
          {isLoading ? 'Activating...' : 'Activate AI agents'}
        </button>
      </div>

      {error && (
        <div className={styles.errorContainer}>
          <p className={styles.errorText}>Registration failed with error: {error}</p>
        </div>
      )}

      {response && (
        <div className={styles.successContainer}>
          <h4>Registration Successful!</h4>
          <p>{response.message}</p>
        </div>
      )}

      <details className={styles.curlDetails}>
        <summary>View cURL command</summary>
        <div className={styles.detailsContent}>
          <p>If you prefer to use cURL directly, you can run this command in your terminal:</p>
          <div className={styles.commandBox}>
            <pre>{getCurlCommand()}</pre>
            <button 
              onClick={copyToClipboard} 
              className={styles.copyButton}
              title="Copy to clipboard"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </details>
    </div>
  );
} 