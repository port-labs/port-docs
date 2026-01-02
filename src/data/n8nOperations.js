// n8n Operations available in Port n8n node
// Complete list of all available operations

export const n8nOperations = [
  {
    name: 'generalInvoke',
    description: 'Direct Port AI query. Use this operation to interact with Port\'s Context Lake through natural language. You can query your software catalog, get insights about your services, or leverage Port\'s AI to analyze your data.',
    parameters: ['userPrompt', 'systemPrompt', 'generalProvider'],
    apiReference: '/api-reference/general-purpose-ai-interactions'
  },
  {
    name: 'invokeAgent',
    description: 'Call a specific AI agent. Use this operation when you want to run predefined agent workflows configured in Port. Agents are reusable AI configurations that can be invoked with a simple prompt.',
    parameters: ['agentIdentifier', 'prompt'],
    apiReference: '/api-reference/invoke-a-specific-agent'
  },
  {
    name: 'getInvocation',
    description: 'Retrieve results by invocation ID. Use this operation to fetch the results of a previous AI invocation. This is useful for asynchronous workflows where you need to poll for results.',
    parameters: ['invocation_identifier'],
    apiReference: '/api-reference/get-an-invocations-result'
  }
];

