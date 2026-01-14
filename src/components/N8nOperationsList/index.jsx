import React from 'react';
import { n8nOperations } from '../../data/n8nOperations';
import styles from '../ToolsList/styles.module.css';

export default function N8nOperationsList({ showApiLinks = true }) {
  return (
    <div className={styles.toolsList}>
      {n8nOperations.map(operation => (
        <div key={operation.name} className={styles.toolItem}>
          <div className={styles.toolHeader}>
            <code className={styles.toolName}>{operation.name}</code>
          </div>
          <div className={styles.toolDescription}>
            {operation.description}
            {showApiLinks && operation.apiReference && (
              <>
                {' '}
                <a href={operation.apiReference} className={styles.apiLink}>
                  API Reference
                </a>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

