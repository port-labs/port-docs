import React, { useState, useEffect } from 'react';
import styles from './styles.module.css';

export default function ActionUrlGenerator() {
  const [actionId, setActionId] = useState('');
  const [inputsJson, setInputsJson] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [error, setError] = useState('');
  const [jsurl, setJsurl] = useState(null);

  useEffect(() => {
    // Load JSURL library
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsurl2';
    script.async = true;
    script.onload = () => {
      setJsurl(window.JSURL);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const generateActionUrl = () => {
    if (!jsurl) return;
    setError('');

    try {
      const inputs = JSON.parse(inputsJson);
      const encodedInputs = jsurl.stringify(inputs);
      const url = `https://app.getport.io/self-serve?action=${actionId}&actionInputs=${encodedInputs}`;
      setGeneratedUrl(url);
    } catch (e) {
      setError('Invalid JSON format. Make sure all property names are in double quotes. Example: {"property": "value"}');
    }
  };

  const setExampleJson = () => {
    const example = {
      "short_title": "Gitlab_integration_version_mismatch_in_UI/API",
      "urgency": "High",
      "description": "The Gitlab integrations are not displaying the correct version",
      "core_functionality": false,
      "causes_data_loss": false,
      "is_constant": false,
      "customer": "org_ukrSy0JXDGngBGUH"
    };
    setInputsJson(JSON.stringify(example, null, 2));
    setError('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedUrl);
  };

  return (
    <div className={styles.actionUrlGenerator}>
      <div>
        <label htmlFor="actionId">Action Identifier:</label>
        <input
          type="text"
          id="actionId"
          value={actionId}
          onChange={(e) => setActionId(e.target.value)}
          placeholder="Enter action identifier (e.g. report_bug)"
        />
      </div>
      <div>
        <label htmlFor="actionInputs">
          Action Inputs (JSON):
          <button onClick={setExampleJson} className={styles.exampleButton}>
            Load Example
          </button>
        </label>
        <textarea
          id="actionInputs"
          value={inputsJson}
          onChange={(e) => setInputsJson(e.target.value)}
          placeholder='{"property": "value"}'
        />
        {error && <div className={styles.error}>{error}</div>}
      </div>
      <button onClick={generateActionUrl} className={styles.generateButton}>Generate URL</button>
      {generatedUrl && (
        <div>
          <label>Generated URL:</label>
          <div className={styles.urlContainer}>
            <input type="text" value={generatedUrl} readOnly />
            <button onClick={copyToClipboard} className={styles.copyButton}>
              Copy URL
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 