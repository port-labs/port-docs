import React, { useState } from 'react';
import CodeBlock from '@theme-original/CodeBlock';
import ReactDOM from 'react-dom';
import styles from './styles.module.css';

// Function to validate token structure
function isValidTokenStructure(token) {
  try {
    // Check if token exists and is a string
    if (!token || typeof token !== 'string') return false;

    // Remove 'Bearer ' prefix if it exists
    const jwtToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    // Split token into parts
    const parts = jwtToken.split('.');
    
    // Check if token has exactly 3 parts (header, payload, signature)
    if (parts.length !== 3) return false;

    // Check if header and payload are valid base64
    const [header, payload] = parts;
    if (!header || !payload) return false;

    // Add padding if necessary
    const paddedHeader = header.padEnd(header.length + ((4 - (header.length % 4)) % 4), '=');
    const paddedPayload = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');

    // Try to decode and parse header and payload
    JSON.parse(atob(paddedHeader));
    JSON.parse(atob(paddedPayload));

    return true;
  } catch (e) {
    console.error('Token structure validation failed:', e);
    return false;
  }
}

// Function to check if a token is expired
function isTokenExpired(token) {
  try {
    // Remove 'Bearer ' prefix if it exists
    const jwtToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    // Get the payload part of the JWT (second part)
    const payload = jwtToken.split('.')[1];
    
    // Add padding if necessary
    const paddedPayload = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
    
    // Base64 decode and parse as JSON
    const decoded = JSON.parse(atob(paddedPayload));
    
    // Check if token is expired
    return decoded.exp * 1000 < Date.now();
  } catch (e) {
    console.error('Error decoding token:', e);
    return true; // If we can't decode the token, consider it expired
  }
}

// Authentication modal component
function AuthModal({ onClose, onAuthenticated }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleSaveToken = () => {
    if (!token) {
      setError('Please enter a token');
      return;
    }

    if (!isValidTokenStructure(token)) {
      setError('The token is invalid. Please enter a valid Port bearer token.');
      return;
    }

    if (isTokenExpired(token)) {
      setError('This token has expired. Please generate a new token.');
      return;
    }

    sessionStorage.setItem('portToken', token);
    if (onAuthenticated) {
      onAuthenticated();
    }
    onClose();
  };

  return ReactDOM.createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.authModal} onClick={e => e.stopPropagation()}>
        <h2>Authenticate with your Port account</h2>
        <p>To identify your Port account, please enter a <i>bearer token</i>.</p>
        <p>The token will be saved in your browser and used when you create resources from the documentation.</p>
        <p>To obtain a token, click on the <code>...</code> button in the top-right corner of your portal, and select <code>Credentials</code> → <code>Generate API token</code>.</p>
        <input
          type="password"
          value={token}
          onChange={(e) => {
            setToken(e.target.value);
            setError('');
          }}
          placeholder="Paste your bearer token"
          className={styles.tokenInput}
        />
        {error && <div className={styles.errorMessage}>{error}</div>}
        <div className={styles.modalButtons}>
          <button onClick={onClose} className={styles.cancelButton}>Cancel</button>
          <button onClick={handleSaveToken} className={styles.saveButton}>Save Token</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Feedback modal component
function FeedbackModal({ isLoading, isSuccess, message, onClose }) {
  return ReactDOM.createPortal(
    <div className={styles.modalOverlay} onClick={isLoading ? undefined : onClose}>
      <div className={styles.feedbackModal} onClick={e => e.stopPropagation()}>
        {isLoading ? (
          <>
            <div className={styles.feedbackHeader}>
              Creating {message}...
            </div>
            <div className={styles.feedbackContent}>
              <div className={styles.spinner}></div>
              <p>Please wait while we create your resource in Port</p>
            </div>
          </>
        ) : (
          <>
            <div className={`${styles.feedbackHeader} ${isSuccess ? styles.success : styles.error}`}>
              {isSuccess ? 'Success' : 'Error'}
            </div>
            <div className={styles.feedbackContent}>
              {message}
            </div>
            <button className={styles.closeButton} onClick={onClose}>
              Close
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

// Function to remove comments from JSON string
function stripJsonComments(jsonString) {
  // State to track if we're inside a string
  let inString = false;
  let escaped = false;
  let result = '';
  let i = 0;

  while (i < jsonString.length) {
    const char = jsonString[i];

    // Handle string content
    if (char === '"' && !escaped) {
      inString = !inString;
      result += char;
      i++;
      continue;
    }

    // Handle escape characters
    if (char === '\\' && !escaped) {
      escaped = true;
      result += char;
      i++;
      continue;
    }

    // Handle single-line comments - only if preceded by whitespace or at start of line
    if (!inString && char === '/' && jsonString[i + 1] === '/') {
      // Look backwards to check if this is a real comment
      let isComment = true;
      let j = i - 1;
      
      // Skip whitespace
      while (j >= 0 && /\s/.test(jsonString[j])) {
        j--;
      }
      
      // If we found a non-whitespace character that's not a comma, brace, bracket, or colon,
      // then this is probably not a comment (e.g., it's part of a URL)
      if (j >= 0 && !/[,{}\[\]:]/.test(jsonString[j])) {
        isComment = false;
      }

      if (isComment) {
        // Skip until end of line
        while (i < jsonString.length && jsonString[i] !== '\n') {
          i++;
        }
        continue;
      }
    }

    // Handle multi-line comments - only if preceded by whitespace or at start of line
    if (!inString && char === '/' && jsonString[i + 1] === '*') {
      // Look backwards to check if this is a real comment
      let isComment = true;
      let j = i - 1;
      
      // Skip whitespace
      while (j >= 0 && /\s/.test(jsonString[j])) {
        j--;
      }
      
      // If we found a non-whitespace character that's not a comma, brace, bracket, or colon,
      // then this is probably not a comment
      if (j >= 0 && !/[,{}\[\]:]/.test(jsonString[j])) {
        isComment = false;
      }

      if (isComment) {
        i += 2; // Skip /*
        while (i < jsonString.length && !(jsonString[i] === '*' && jsonString[i + 1] === '/')) {
          i++;
        }
        i += 2; // Skip */
        continue;
      }
    }

    escaped = false;
    result += char;
    i++;
  }

  return result;
}

// Regex patterns for Port resources
const PATTERNS = {
  blueprint: /{\s*"(?:(?!"schema"|"trigger").)*"schema":\s*{\s*"properties":\s*{/s,
  action: /{\s*"identifier":\s*"[^"]+",.*"trigger":\s*{\s*"type":\s*"self-service"/s,
  automation: /{\s*"identifier":\s*"[^"]+",.*"trigger":\s*{\s*"type":\s*"automation"/s
};

function isPortResource(code) {
  // Skip if not a JSON-like string
  if (!code.trim().startsWith('{')) return false;

  // Check each pattern
  if (PATTERNS.blueprint.test(code)) return 'blueprint';
  if (PATTERNS.action.test(code)) return 'action';
  if (PATTERNS.automation.test(code)) return 'automation';

  return false;
}

// Confirmation modal component
function ConfirmationModal({ resourceType, onConfirm, onCancel, onReplaceToken }) {
  return ReactDOM.createPortal(
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.confirmationModal} onClick={e => e.stopPropagation()}>
        <div className={styles.confirmationHeader}>
          Create this {resourceType} in your Port application
        </div>
        <div className={styles.confirmationContent}>
          <p>The {resourceType} defined in this code block will be created in your Port application.</p>
          <div className={styles.confirmationDetails}>
            <p>To view the new {resourceType} after it's created:</p>
            <ul>
              {resourceType === 'blueprint' && (
                <li>Go to the <a href="https://app.getport.io/settings/data-model" target="_blank" rel="noopener noreferrer">data model</a> page of your Port application.</li>
              )}
              {resourceType === 'action' && (
                <li>Go to the <a href="https://app.getport.io/self-serve" target="_blank" rel="noopener noreferrer">self-service</a> page of your Port application.</li>
              )}
              {resourceType === 'automation' && (
                <li>Go to the <a href="https://app.getport.io/settings/automations" target="_blank" rel="noopener noreferrer">automations</a> page of your Port application.</li>
              )}
            </ul>
          </div>
          <div className={styles.confirmationFooter}>
            <button onClick={onReplaceToken} className={styles.replaceTokenButton}>
              Replace token
            </button>
            <div className={styles.confirmationButtons}>
              <button onClick={onCancel} className={styles.cancelButton}>Cancel</button>
              <button onClick={onConfirm} className={styles.confirmButton}>Create {resourceType}</button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function CodeBlockWrapper(props) {
  const [feedbackState, setFeedbackState] = useState({ 
    show: false, 
    loading: false,
    success: false, 
    message: '' 
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const resourceType = (props.className?.includes('language-json') || props.className?.includes('language-jsonc')) ? 
    isPortResource(props.children) : false;

  const handleCreateInPort = async () => {
    const token = sessionStorage.getItem('portToken');
    
    if (!token || isTokenExpired(token)) {
      if (token) {
        sessionStorage.removeItem('portToken');
      }
      setShowAuthModal(true);
      return;
    }

    // Show confirmation modal instead of proceeding directly
    setShowConfirmation(true);
  };

  const handleReplaceToken = () => {
    setShowConfirmation(false);
    setShowAuthModal(true);
  };

  const handleConfirmedCreate = async () => {
    setShowConfirmation(false);
    
    setFeedbackState({
      show: true,
      loading: true,
      success: false,
      message: resourceType
    });

    try {
      const endpoint = resourceType === 'blueprint' ? 
        `https://api.stg-01.getport.io/v1/${resourceType}s` : 
        'https://api.stg-01.getport.io/v1/actions';

      // Clean the JSON string by removing comments
      const cleanedJson = stripJsonComments(props.children);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `${sessionStorage.getItem('portToken')}`,
          'Content-Type': 'application/json'
        },
        body: cleanedJson
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to create resource');
      }

      setFeedbackState({
        show: true,
        loading: false,
        success: true,
        message: `Successfully created ${resourceType} in Port!`
      });
    } catch (error) {
      console.error('Error creating resource:', error);
      
      if (error.message.toLowerCase().includes('expired') || 
          error.message.toLowerCase().includes('invalid token') ||
          error.message.toLowerCase().includes('unauthorized')) {
        sessionStorage.removeItem('portToken');
        setFeedbackState({
          show: true,
          loading: false,
          success: false,
          message: error.message
        });
      } else {
        setFeedbackState({
          show: true,
          loading: false,
          success: false,
          message: error.message
        });
      }
    }
  };

  return (
    <div className={styles.codeBlockWrapper}>
      {resourceType && (
        <button 
          className={styles.createInPortButton}
          onClick={handleCreateInPort}
        >
          Create in Port
        </button>
      )}
      <CodeBlock {...props} />
      {showConfirmation && (
        <ConfirmationModal
          resourceType={resourceType}
          onConfirm={handleConfirmedCreate}
          onCancel={() => setShowConfirmation(false)}
          onReplaceToken={handleReplaceToken}
        />
      )}
      {feedbackState.show && (
        <FeedbackModal
          isLoading={feedbackState.loading}
          isSuccess={feedbackState.success}
          message={feedbackState.message}
          onClose={() => setFeedbackState({ show: false, loading: false, success: false, message: '' })}
        />
      )}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuthenticated={handleCreateInPort}
        />
      )}
    </div>
  );
} 