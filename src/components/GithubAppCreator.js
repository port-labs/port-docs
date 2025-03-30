import React, { useState } from 'react';
import styles from './GithubAppCreator.module.css';

// API URL can be configured from an environment variable if needed
// const PORT_API_BASE_URL = 'https://api.getport.io';
// const PORT_API_BASE_URL = 'http://localhost:3000';
const PORT_API_BASE_URL = 'https://api.stg-01.getport.io';

export default function GithubAppCreator() {
  const [orgName, setOrgName] = useState('');
  const [token, setToken] = useState('');
  const [isEnterprise, setIsEnterprise] = useState(false);
  const [enterpriseUrl, setEnterpriseUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Construct API URL with parameters
      let apiUrl = `${PORT_API_BASE_URL}/v1/integration/github-app-creation-url`;
      apiUrl += `?isEnterprise=${isEnterprise}`;
      
      if (orgName) {
        apiUrl += `&githubOrgName=${encodeURIComponent(orgName)}`;
      }
      
      if (isEnterprise && enterpriseUrl) {
        apiUrl += `&enterpriseUrl=${encodeURIComponent(enterpriseUrl)}`;
      }
      
      // Make API request
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': token.startsWith('Bearer ') ? token : `Bearer ${token}`,
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Create a form and submit it programmatically
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.url;
        form.target = '_blank';
        
        const manifestInput = document.createElement('input');
        manifestInput.type = 'hidden';
        manifestInput.name = 'manifest';
        manifestInput.value = JSON.stringify(data.manifest);
        
        form.appendChild(manifestInput);
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        // Reset form after successful submission
        setIsLoading(false);
      } else {
        setError(data.message || 'Failed to get manifest');
        setIsLoading(false);
      }
    } catch (error) {
      setError('Error: ' + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="orgName" className={styles.label}>GitHub Organization Name:</label>
          <input 
            type="text" 
            id="orgName" 
            value={orgName} 
            onChange={(e) => setOrgName(e.target.value)}
            className={styles.input}
            placeholder="e.g., my-org"
            required
          />
        </div>
        
        <div className={styles.formGroup}>
          <div className={styles.checkboxContainer}>
            <input 
              type="checkbox" 
              id="isEnterprise" 
              checked={isEnterprise} 
              onChange={(e) => setIsEnterprise(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="isEnterprise" className={styles.checkboxLabel}>Enterprise GitHub</label>
          </div>
        </div>
        
        {isEnterprise && (
          <div className={styles.formGroup}>
            <label htmlFor="enterpriseUrl" className={styles.label}>Enterprise GitHub URL:</label>
            <input 
              type="text" 
              id="enterpriseUrl" 
              value={enterpriseUrl} 
              onChange={(e) => setEnterpriseUrl(e.target.value)}
              className={styles.input}
              placeholder="e.g., github.company.com"
              required={isEnterprise}
            />
          </div>
        )}
        
        <div className={styles.formGroup}>
          <label htmlFor="token" className={styles.label}>Port Authentication Token:</label>
          <input 
            type="text" 
            id="token" 
            value={token} 
            onChange={(e) => setToken(e.target.value)}
            className={styles.input}
            placeholder="Bearer ey..."
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading} 
          className={styles.button}
        >
          {isLoading ? 'Processing...' : 'Go to GitHub App!'}
        </button>
        
        {error && <div className={styles.error}>{error}</div>}
      </form>
    </div>
  );
} 