import React, { useState, useEffect } from 'react';
import styles from './IntegrationVersion.module.css';

const IntegrationVersion = ({ integration }) => {
  const [version, setVersion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch(
          `https://raw.githubusercontent.com/port-labs/ocean/main/integrations/${integration}/pyproject.toml`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch');
        }
        
        const text = await response.text();
        
        // Parse the first "version" key from the TOML file
        const versionMatch = text.match(/version\s*=\s*["']([^"']+)["']/);
        if (versionMatch) {
          setVersion(versionMatch[1]);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error('Failed to fetch version:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchVersion();
  }, [integration]);

  if (loading) {
    return <span className={styles.loading}>Loading version...</span>;
  }
  
  if (error || !version) {
    return <span className={styles.error}>Version unavailable</span>;
  }

  const changelogUrl = `https://github.com/port-labs/ocean/blob/main/integrations/${integration}/CHANGELOG.md`;

  return (
    <div className={styles.container}>
      <span className={styles.label}>Latest version of this integration:</span>
      <span className={`badge badge--secondary ${styles.versionBadge}`}>
        v{version}
      </span>
      <a 
        href={changelogUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={styles.changelogLink}
      >
        <svg className={styles.changelogIcon} viewBox="0 0 16 16" fill="currentColor">
          <path d="M3 2.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-11zm1 .5v10h8V3H4zm1.5 1a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z"/>
        </svg>
        Changelog
      </a>
    </div>
  );
};

export default IntegrationVersion; 