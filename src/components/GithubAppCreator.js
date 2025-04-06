import React, { useState } from 'react';
import styles from './GithubAppCreator.module.css';

// API URLs for different regions
const API_URLS = {
  eu: 'https://api.getport.io',
  us: 'https://api.us.getport.io'
};

// Default to staging for development
const STAGING_API_URL = 'https://api.stg-01.getport.io';

export default function GithubAppCreator() {
  const [orgName, setOrgName] = useState('');
  const [token, setToken] = useState('');
  const [isSelfHostedEnterprise, setIsSelfHostedEnterprise] = useState(false);
  const [selfHostedEnterpriseUrl, setSelfHostedEnterpriseUrl] = useState('');
  const [region, setRegion] = useState('eu');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Get the appropriate base URL based on region
  const getBaseUrl = () => {
    // Use staging URL for development if needed
    if (process.env.NODE_ENV === 'development') {
      return STAGING_API_URL;
    }
    
    return API_URLS[region];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Get the appropriate base URL
      const baseUrl = getBaseUrl();
      
      // Construct API URL with parameters
      let apiUrl = `${baseUrl}/v1/integration/github-app-creation-url`;
      apiUrl += `?isSelfHostedEnterprise=${isSelfHostedEnterprise}`;
      
      if (orgName) {
        apiUrl += `&githubOrgName=${encodeURIComponent(orgName)}`;
      }
      
      if (isSelfHostedEnterprise && selfHostedEnterpriseUrl) {
        apiUrl += `&selfHostedEnterpriseUrl=${encodeURIComponent(selfHostedEnterpriseUrl)}`;
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
              id="isSelfHostedEnterprise" 
              checked={isSelfHostedEnterprise} 
              onChange={(e) => setIsSelfHostedEnterprise(e.target.checked)}
              className={styles.checkbox}
            />
            <label htmlFor="isSelfHostedEnterprise" className={styles.checkboxLabel}>Self Hosted Enterprise GitHub</label>
          </div>
        </div>
        
        {isSelfHostedEnterprise && (
          <div className={styles.formGroup}>
            <label htmlFor="selfHostedEnterpriseUrl" className={styles.label}>Self Hosted Enterprise GitHub URL:</label>
            <input 
              type="text" 
              id="selfHostedEnterpriseUrl" 
              value={selfHostedEnterpriseUrl} 
              onChange={(e) => setSelfHostedEnterpriseUrl(e.target.value)}
              className={styles.input}
              placeholder="e.g., github.company.com"
              required={isSelfHostedEnterprise}
            />
          </div>
        )}
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Port Region:</label>
          <div className={styles.regionToggle}>
            <button 
              type="button"
              className={`${styles.regionButton} ${region === 'eu' ? styles.regionButtonActive : ''}`}
              onClick={() => setRegion('eu')}
            >
              EU
            </button>
            <button 
              type="button"
              className={`${styles.regionButton} ${region === 'us' ? styles.regionButtonActive : ''}`}
              onClick={() => setRegion('us')}
            >
              US
            </button>
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="token" className={styles.label}>Port Authentication Token:</label>
          <input 
            type="text" 
            id="token" 
            value={token} 
            onChange={(e) => setToken(e.target.value)}
            className={styles.input}
            placeholder="Paste your bearer token"
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