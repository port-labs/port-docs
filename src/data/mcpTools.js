// MCP Tools available in Port MCP Server
// Based on developer tools (Port AI only supports developer tools, not builder/admin tools)

export const mcpTools = [
  // Query and analysis tools
  {
    name: 'get_blueprints',
    description: 'Retrieve a list of all blueprints from Port',
    category: 'Query'
  },
  {
    name: 'get_blueprint',
    description: 'Retrieve information about a specific blueprint by its identifier',
    category: 'Query'
  },
  {
    name: 'get_entities',
    description: 'Retrieve all entities for a given blueprint',
    category: 'Query'
  },
  {
    name: 'get_entity',
    description: 'Retrieve information about a specific entity',
    category: 'Query'
  },
  {
    name: 'get_scorecards',
    description: 'Retrieve all scorecards from Port',
    category: 'Query'
  },
  {
    name: 'get_scorecard',
    description: 'Retrieve information about a specific scorecard by its identifier',
    category: 'Query'
  },
  {
    name: 'describe_user_details',
    description: 'Get information about your Port account, organization, and user profile details',
    category: 'Query'
  },
  {
    name: 'search_port_docs_sources',
    description: 'Search through Port documentation sources for relevant information',
    category: 'Query'
  },
  {
    name: 'ask_port_docs',
    description: 'Ask questions about Port documentation and get contextual answers',
    category: 'Query'
  },
  
  // Action execution tools (dynamic based on your actions)
  {
    name: 'run_create_service',
    description: 'Example: Create a new service (actual actions depend on your Port configuration)',
    category: 'Action'
  },
  {
    name: 'run_deploy_to_production',
    description: 'Example: Deploy service to production (actual actions depend on your Port configuration)',
    category: 'Action'
  },
  {
    name: 'run_create_incident',
    description: 'Example: Create an incident report (actual actions depend on your Port configuration)',
    category: 'Action'
  },
  {
    name: 'run_github_create_issue',
    description: 'Example: Create GitHub issue (actual actions depend on your Port configuration)',
    category: 'Action'
  },
  {
    name: 'run_jira_create_ticket',
    description: 'Example: Create Jira ticket (actual actions depend on your Port configuration)',
    category: 'Action'
  },
  {
    name: 'run_zendesk_create_ticket',
    description: 'Example: Create Zendesk ticket (actual actions depend on your Port configuration)',
    category: 'Action'
  },
  {
    name: 'run_slack_notify_team',
    description: 'Example: Send Slack notification (actual actions depend on your Port configuration)',
    category: 'Action'
  },
  {
    name: 'run_update_service_docs',
    description: 'Example: Update service documentation (actual actions depend on your Port configuration)',
    category: 'Action'
  },
  
  // AI agent tools
  {
    name: 'invoke_ai_agent',
    description: 'Invoke a Port AI agent with a specific prompt',
    category: 'AI'
  },
  
  // Additional common patterns for entity operations (these would be available if builder tools were enabled)
  {
    name: 'list_entities',
    description: 'List entities (alternative naming pattern)',
    category: 'Query'
  },
  {
    name: 'search_entities',
    description: 'Search entities with filters',
    category: 'Query'
  },
  {
    name: 'track_entity_changes',
    description: 'Track changes to entities',
    category: 'Query'
  },
  {
    name: 'create_entity',
    description: 'Create a new entity (builder tool - not available in Port AI)',
    category: 'Management',
    disabled: true
  },
  {
    name: 'update_entity',
    description: 'Update an existing entity (builder tool - not available in Port AI)',
    category: 'Management',
    disabled: true
  },
  {
    name: 'delete_entity',
    description: 'Delete an entity (builder tool - not available in Port AI)',
    category: 'Management',
    disabled: true
  }
];
