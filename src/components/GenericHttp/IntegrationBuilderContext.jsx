import React, { createContext, useContext, useState } from 'react';

const IntegrationBuilderContext = createContext();

export function IntegrationBuilderProvider({ children }) {
  // Step 1: API Configuration
  const [baseUrl, setBaseUrl] = useState('');
  const [authType, setAuthType] = useState('bearer_token');
  const [apiToken, setApiToken] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiKeyHeader, setApiKeyHeader] = useState('X-API-Key');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [paginationType, setPaginationType] = useState('none');
  const [pageSize, setPageSize] = useState('100');
  
  // Advanced pagination settings
  const [paginationParam, setPaginationParam] = useState('');
  const [sizeParam, setSizeParam] = useState('');
  const [startPage, setStartPage] = useState('1');
  const [cursorPath, setCursorPath] = useState('');
  const [hasMorePath, setHasMorePath] = useState('');
  
  // Advanced request settings
  const [timeout, setTimeout] = useState('30');
  const [verifySsl, setVerifySsl] = useState(true);
  const [maxConcurrentRequests, setMaxConcurrentRequests] = useState('10');

  // Step 2: Endpoint Configuration
  const [endpoint, setEndpoint] = useState('/api/v1/users');
  const [responseJson, setResponseJson] = useState(`{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "user"
    }
  ],
  "meta": {
    "total": 2,
    "page": 1
  }
}`);
  const [dataPath, setDataPath] = useState(null);
  const [blueprintId, setBlueprintId] = useState('');
  const [blueprintTitle, setBlueprintTitle] = useState('');
  const [selectedFields, setSelectedFields] = useState({});
  const [identifierField, setIdentifierField] = useState('');
  const [titleField, setTitleField] = useState('');

  const value = {
    // Step 1 state
    baseUrl, setBaseUrl,
    authType, setAuthType,
    apiToken, setApiToken,
    apiKey, setApiKey,
    apiKeyHeader, setApiKeyHeader,
    username, setUsername,
    password, setPassword,
    paginationType, setPaginationType,
    pageSize, setPageSize,
    paginationParam, setPaginationParam,
    sizeParam, setSizeParam,
    startPage, setStartPage,
    cursorPath, setCursorPath,
    hasMorePath, setHasMorePath,
    timeout, setTimeout,
    verifySsl, setVerifySsl,
    maxConcurrentRequests, setMaxConcurrentRequests,
    
    // Step 2 state
    endpoint, setEndpoint,
    responseJson, setResponseJson,
    dataPath, setDataPath,
    blueprintId, setBlueprintId,
    blueprintTitle, setBlueprintTitle,
    selectedFields, setSelectedFields,
    identifierField, setIdentifierField,
    titleField, setTitleField,
  };

  return (
    <IntegrationBuilderContext.Provider value={value}>
      {children}
    </IntegrationBuilderContext.Provider>
  );
}

export function useIntegrationBuilder() {
  const context = useContext(IntegrationBuilderContext);
  if (!context) {
    throw new Error('useIntegrationBuilder must be used within IntegrationBuilderProvider');
  }
  return context;
}

