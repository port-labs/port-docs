import React, { useState } from 'react';

function isRegionAllowed(region, allow, deny) {
  if (!allow.length && !deny.length) return true;
  if (deny.includes(region)) return false;
  if (allow.includes(region)) return true;
  if (deny.length && !allow.length) return true;
  if (allow.length && !deny.length) return false;
  return false;
}

export default function RegionPolicyEvaluator() {
  const [region, setRegion] = useState('');
  const [allow, setAllow] = useState([]);
  const [deny, setDeny] = useState([]);
  const [result, setResult] = useState(null);

  const handleEvaluate = () => {
    // If allow and deny contain only empty strings, reset to empty arrays
    const trimmedAllow = allow.filter((item) => item.trim() !== '');
    const trimmedDeny = deny.filter((item) => item.trim() !== '');

    const isAllowed = isRegionAllowed(region, trimmedAllow, trimmedDeny);
    setResult(isAllowed ? "Allowed" : "Denied");
  };

  const handleAllowChange = (e) => {
    const values = e.target.value ? e.target.value.split(',') : [];
    setAllow(values);
  };

  const handleDenyChange = (e) => {
    const values = e.target.value ? e.target.value.split(',') : [];
    setDeny(values);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Region Policy Evaluator</h3>
      <div style={styles.formGroup}>
        <label style={styles.label}>Region:</label>
        <input
          type="text"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          placeholder="Enter region (e.g., us-east-1)"
          style={styles.input}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Allowed Regions (comma-separated):</label>
        <input
          type="text"
          value={allow.join(',')}
          onChange={handleAllowChange}
          onBlur={() => !allow.length && setAllow([])}
          placeholder="e.g., us-east-1,eu-west-1"
          style={styles.input}
        />
      </div>
      <div style={styles.formGroup}>
        <label style={styles.label}>Denied Regions (comma-separated):</label>
        <input
          type="text"
          value={deny.join(',')}
          onChange={handleDenyChange}
          onBlur={() => !deny.length && setDeny([])}
          placeholder="e.g., us-west-2"
          style={styles.input}
        />
      </div>
      <button onClick={handleEvaluate} style={styles.button}>Evaluate</button>
      {result !== null && <p style={styles.result}>Result: <strong>{result}</strong></p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    textAlign: 'center',
    color: '#333',
    fontSize: '20px',
    marginBottom: '15px',
  },
  formGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#0073e6',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  result: {
    marginTop: '15px',
    textAlign: 'center',
    fontSize: '18px',
    color: '#333',
  },
};
