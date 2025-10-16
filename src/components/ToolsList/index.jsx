import React from 'react';
import { mcpTools } from '../../data/mcpTools';
import styles from './styles.module.css';

export default function ToolsList({ role = 'developer', showApiLinks = true }) {
  // Filter tools based on role
  const filteredTools = mcpTools.filter(tool => 
    tool.roles && tool.roles.includes(role)
  );

  return (
    <div className={styles.toolsList}>
      {filteredTools.map(tool => (
        <div key={tool.name} className={styles.toolItem}>
          <div className={styles.toolHeader}>
            <code className={styles.toolName}>{tool.name}</code>
            {tool.isDynamic && (
              <span className={styles.dynamicBadge}>Dynamic</span>
            )}
          </div>
          <div className={styles.toolDescription}>
            {tool.description}
            {showApiLinks && tool.apiReference && (
              <>
                {' '}
                <a href={tool.apiReference} className={styles.apiLink}>
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
