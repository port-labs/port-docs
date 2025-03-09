import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from './styles.module.css';

function PortLoginModal({ onClose }) {
  const [token, setToken] = useState('');

  const handleSaveToken = () => {
    if (token) {
      sessionStorage.setItem('portToken', token);
      document.querySelector('.header-port-login')?.classList.add('has-token');
      onClose();
    }
  };

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h2>Authenticate with your Port account</h2>
        <p>Port's documentation contains definitions and examples for many resources, such as <a href="https://docs.port.io/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/" target="_blank">blueprints</a>, <a href="https://docs.port.io/actions-and-automations/create-self-service-experiences/" target="_blank">actions</a>, <a href="https://docs.port.io/actions-and-automations/define-automations/" target="_blank">automations</a>, and more.</p>
        <p>For your convenience, some of these resources can be created in your Port account with a single click, directly from the documentation.<br/>Simply click on the <code>Create in Port</code> button in the top-right corner of the snippet.<br/> For example:</p>
        <p>This uses Port's API to create the relevant resource, and therefore requires a bearer token to identify your account.<br/>To obtain a token, click on the <code>...</code> button in the top-right corner of your portal, and select <code>Credentials</code> → <code>Generate API token</code>.</p>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Paste your Port bearer token"
          className={styles.tokenInput}
        />
        <p><b>Note:</b><br/>1. The token will be saved, and will be automatically used when you create resources from the documentation.<br/>2. Bearer tokens are valid for 2 hours after generation.</p>
        <div className={styles.modalButtons}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleSaveToken} className={styles.saveButton}>
            Save Token
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function PortLogin() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check for existing token
    const hasToken = sessionStorage.getItem('portToken');
    if (hasToken) {
      document.querySelector('.header-port-login')?.classList.add('has-token');
    }
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <button className="header-port-login" onClick={handleClick}>
        <span>Port Login</span>
      </button>
      {isModalOpen && <PortLoginModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
} 