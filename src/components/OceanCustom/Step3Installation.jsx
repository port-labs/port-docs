import React from 'react';
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import CodeBlock from '@theme/CodeBlock';
import { useIntegrationBuilder } from './IntegrationBuilderContext';
import styles from './styles.module.css';

export function Step3Installation() {
  const {
    baseUrl, authType, apiToken, apiKey, apiKeyHeader, username, password, 
    paginationType, pageSize, paginationParam, sizeParam, startPage, cursorPath, hasMorePath,
    timeout, verifySsl, maxConcurrentRequests,
    endpoint, responseJson, dataPath, blueprintId, blueprintTitle, selectedFields, identifierField, titleField
  } = useIntegrationBuilder();

  // Show placeholder if not ready
  if (!blueprintId || !identifierField) {
    return (
      <div className={styles.builderSection}>
        <div style={{ 
          padding: '3rem 2rem', 
          textAlign: 'center', 
          backgroundColor: 'var(--ifm-color-emphasis-100)', 
          borderRadius: '8px',
          border: '2px dashed var(--ifm-color-emphasis-300)'
        }}>
          <h4>📋 Complete Step 2 to generate your configuration</h4>
          <p style={{ color: 'var(--ifm-color-emphasis-700)', marginTop: '1rem' }}>
            You need to:
          </p>
          <ul style={{ textAlign: 'left', display: 'inline-block', color: 'var(--ifm-color-emphasis-700)' }}>
            <li><strong>Enter a Blueprint Identifier</strong> (e.g., "user", "project")</li>
            <li><strong>Select an Identifier field</strong> (click "ID" button next to a field)</li>
          </ul>
          <p style={{ color: 'var(--ifm-color-emphasis-600)', marginTop: '1rem', fontSize: '0.9rem' }}>
            Once complete, this section will show your installation commands, blueprint JSON, and mapping configuration.
          </p>
        </div>
      </div>
    );
  }

  const generateDockerCommand = () => {
    const envVars = [
      `  -e OCEAN__PORT__CLIENT_ID="<PORT_CLIENT_ID>"`,
      `  -e OCEAN__PORT__CLIENT_SECRET="<PORT_CLIENT_SECRET>"`,
      `  -e OCEAN__PORT__BASE_URL="https://api.getport.io"`,
      `  -e OCEAN__EVENT_LISTENER__TYPE="POLLING"`,
      `  -e OCEAN__INTEGRATION__IDENTIFIER="ocean-custom"`,
      `  -e OCEAN__INTEGRATION__TYPE="custom"`,
      `  -e OCEAN__INTEGRATION__CONFIG__BASE_URL="${baseUrl || 'https://api.example.com'}"`,
    ];

    if (authType === 'bearer_token') {
      envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="bearer_token"`);
      envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__AUTH_VALUE="${apiToken || '<YOUR_API_TOKEN>'}"`);
    } else if (authType === 'api_key') {
      envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="api_key"`);
      envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__AUTH_VALUE="${apiKey || '<YOUR_API_KEY>'}"`);
      if (apiKeyHeader !== 'X-API-Key') {
        envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__API_KEY_HEADER="${apiKeyHeader}"`);
      }
    } else if (authType === 'basic') {
      envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="basic"`);
      envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__AUTH_VALUE="${username || '<USERNAME>'}:${password || '<PASSWORD>'}"`);
    } else {
      envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="none"`);
    }

    if (paginationType !== 'none') {
      envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__PAGINATION_TYPE="${paginationType}"`);
      envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__PAGE_SIZE="${pageSize}"`);
      
      if (paginationParam) envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__PAGINATION_PARAM="${paginationParam}"`);
      if (sizeParam) envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__SIZE_PARAM="${sizeParam}"`);
      if (paginationType === 'page' && startPage !== '1') envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__START_PAGE="${startPage}"`);
      if (paginationType === 'cursor' && cursorPath) envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__CURSOR_PATH="${cursorPath}"`);
      if (hasMorePath) envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__HAS_MORE_PATH="${hasMorePath}"`);
    }

    if (timeout !== '30') envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__TIMEOUT="${timeout}"`);
    if (!verifySsl) envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__VERIFY_SSL="false"`);
    if (maxConcurrentRequests !== '10') envVars.push(`  -e OCEAN__INTEGRATION__CONFIG__MAX_CONCURRENT_REQUESTS="${maxConcurrentRequests}"`);

    return `docker run -d --name ocean-http-integration \\
${envVars.join(' \\\n')} \\
  ghcr.io/port-labs/port-ocean-custom:latest`;
  };

  const generateHelmCommand = () => {
    const setFlags = [
      `--set port.clientId="<PORT_CLIENT_ID>"`,
      `--set port.clientSecret="<PORT_CLIENT_SECRET>"`,
      `--set port.baseUrl="https://api.getport.io"`,
      `--set initializePortResources=true`,
      `--set scheduledResyncInterval=60`,
      `--set integration.identifier="ocean-custom"`,
      `--set integration.type="custom"`,
      `--set integration.eventListener.type="POLLING"`,
      `--set integration.config.baseUrl="${baseUrl || 'https://api.example.com'}"`,
      `--set integration.config.authType="${authType}"`,
    ];

    if (authType === 'bearer_token') {
      setFlags.push(`--set integration.config.apiToken="${apiToken || '<YOUR_API_TOKEN>'}"`);
    } else if (authType === 'api_key') {
      setFlags.push(`--set integration.config.apiKey="${apiKey || '<YOUR_API_KEY>'}"`);
      if (apiKeyHeader !== 'X-API-Key') {
        setFlags.push(`--set integration.config.apiKeyHeader="${apiKeyHeader}"`);
      }
    } else if (authType === 'basic') {
      setFlags.push(`--set integration.config.username="${username || '<USERNAME>'}"`);
      setFlags.push(`--set integration.config.password="${password || '<PASSWORD>'}"`);
    }

    if (paginationType !== 'none') {
      setFlags.push(`--set integration.config.paginationType="${paginationType}"`);
      setFlags.push(`--set integration.config.pageSize=${pageSize}`);
      
      if (paginationParam) setFlags.push(`--set integration.config.paginationParam="${paginationParam}"`);
      if (sizeParam) setFlags.push(`--set integration.config.sizeParam="${sizeParam}"`);
      if (paginationType === 'page' && startPage !== '1') setFlags.push(`--set integration.config.startPage="${startPage}"`);
      if (paginationType === 'cursor' && cursorPath) setFlags.push(`--set integration.config.cursorPath="${cursorPath}"`);
      if (hasMorePath) setFlags.push(`--set integration.config.hasMorePath="${hasMorePath}"`);
    }

    if (timeout !== '30') setFlags.push(`--set integration.config.timeout="${timeout}"`);
    if (!verifySsl) setFlags.push(`--set integration.config.verifySsl=false`);
    if (maxConcurrentRequests !== '10') setFlags.push(`--set integration.config.maxConcurrentRequests="${maxConcurrentRequests}"`);

    return `helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm install ocean-custom port-labs/port-ocean \\
${setFlags.map(flag => `  ${flag}`).join(' \\\n')}`;
  };

  const parseFields = () => {
    if (dataPath === null || !responseJson) {
      return [];
    }

    try {
      const json = JSON.parse(responseJson);
      let data = json;

      if (dataPath && dataPath !== '') {
        const path = dataPath.replace(/^\./, '').split('.');
        for (const key of path) {
          data = data[key];
        }
      }

      const sample = Array.isArray(data) ? data[0] : data;
      
      if (!sample || typeof sample !== 'object') {
        return [];
      }

      return Object.entries(sample).map(([key, value]) => {
        let type = 'string';
        let format = null;

        if (typeof value === 'number') {
          type = 'number';
        } else if (typeof value === 'boolean') {
          type = 'boolean';
        } else if (typeof value === 'string') {
          if (value.includes('@')) {
            format = 'email';
          } else if (value.match(/^\d{4}-\d{2}-\d{2}/)) {
            format = 'date-time';
          } else if (value.match(/^https?:\/\//)) {
            format = 'url';
          }
        }

        return { key, type, format, value };
      });
    } catch {
      return [];
    }
  };

  const generateBlueprint = () => {
    const fields = parseFields();
    const properties = {};
    
    fields.forEach(field => {
      if (selectedFields[field.key] && field.key !== identifierField && field.key !== titleField) {
        properties[field.key] = {
          type: field.type,
          title: field.key.charAt(0).toUpperCase() + field.key.slice(1)
        };
        
        if (field.format) {
          properties[field.key].format = field.format;
        }
      }
    });

    return JSON.stringify({
      identifier: blueprintId || 'myBlueprint',
      title: blueprintTitle || 'My Blueprint',
      icon: 'DefaultBlueprint',
      schema: {
        properties: properties,
        required: []
      },
      mirrorProperties: {},
      calculationProperties: {},
      aggregationProperties: {},
      relations: {}
    }, null, 2);
  };

  const generateMapping = () => {
    const fields = parseFields();
    const properties = {};
    
    fields.forEach(field => {
      if (selectedFields[field.key] && field.key !== identifierField && field.key !== titleField) {
        properties[field.key] = `.${field.key}`;
      }
    });

    const mapping = {
      resources: [
        {
          kind: endpoint || '/api/v1/resource',
          selector: {
            query: 'true',
            ...(dataPath && dataPath !== '' ? { data_path: dataPath } : {})
          },
          port: {
            entity: {
              mappings: {
                identifier: identifierField ? `.${identifierField} | tostring` : '.id | tostring',
                title: titleField ? `.${titleField}` : '.name',
                blueprint: `'"${blueprintId || 'myBlueprint'}"'`,
                properties: properties
              }
            }
          }
        }
      ]
    };

    return `# Add this to your integration mapping
${mapping.resources.map(resource => 
`resources:
  - kind: ${resource.kind}
    selector:
      query: '${resource.selector.query}'${resource.selector.data_path ? `
      data_path: ${resource.selector.data_path}` : ''}
    port:
      entity:
        mappings:
          identifier: ${resource.port.entity.mappings.identifier}
          title: ${resource.port.entity.mappings.title}
          blueprint: ${resource.port.entity.mappings.blueprint}${Object.keys(resource.port.entity.mappings.properties).length > 0 ? `
          properties:
${Object.entries(resource.port.entity.mappings.properties).map(([k, v]) => `            ${k}: ${v}`).join('\n')}` : ''}`
).join('\n')}`;
  };

  return (
    <div className={styles.builderSection}>
      <div className={styles.installationSection}>
        <h3>Install the Integration</h3>
        <Tabs groupId="deploy" queryString="deploy">
          <TabItem value="helm" label="Helm" default>
            <CodeBlock language="bash" showLineNumbers>
              {generateHelmCommand()}
            </CodeBlock>
          </TabItem>
          
          <TabItem value="docker" label="Docker">
            <CodeBlock language="bash" showLineNumbers>
              {generateDockerCommand()}
            </CodeBlock>
          </TabItem>
        </Tabs>

        <h3 style={{ marginTop: '2rem' }}>Blueprint JSON</h3>
        <p style={{ color: 'var(--ifm-color-emphasis-700)', marginBottom: '1rem' }}>
          Copy this blueprint JSON and create it in <a href="https://app.getport.io/settings/data-model" target="_blank" rel="noopener noreferrer">Port's Data Model</a>:
        </p>
        <CodeBlock language="json" showLineNumbers>
          {generateBlueprint()}
        </CodeBlock>

        <h3 style={{ marginTop: '2rem' }}>Add the Mapping</h3>
        <CodeBlock language="yaml" showLineNumbers>
          {generateMapping()}
        </CodeBlock>
      </div>
    </div>
  );
}

