// MCP Tools available in Port MCP Server
// Complete list of all available tools with role-based access

export const mcpTools = [
  // Blueprint tools
  {
    name: 'create_blueprint',
    description: 'Create blueprints (basic building blocks in Port)',
    apiReference: '/api-reference/create-a-blueprint',
    roles: ['builder']
  },
  {
    name: 'list_blueprints',
    description: 'Retrieve all blueprints in organization',
    apiReference: '/api-reference/get-all-blueprints',
    roles: ['developer', 'builder']
  },
  {
    name: 'get_blueprint',
    description: 'Get specific blueprint by identifier',
    apiReference: '/api-reference/get-a-blueprint',
    roles: ['developer', 'builder']
  },
  {
    name: 'update_blueprint',
    description: 'Update existing blueprint configuration',
    apiReference: '/api-reference/update-a-blueprint',
    roles: ['builder']
  },
  {
    name: 'delete_blueprint',
    description: 'Delete blueprint and all its entities',
    apiReference: '/api-reference/delete-a-blueprint',
    roles: ['builder']
  },

  // Entity tools
  {
    name: 'create_entity',
    description: 'Create new entity for blueprint',
    apiReference: '/api-reference/create-an-entity',
    roles: ['builder']
  },
  {
    name: 'get_entities',
    description: 'Search and retrieve entities with filtering/sorting',
    apiReference: '/api-reference/get-all-entities-of-a-blueprint',
    roles: ['developer', 'builder']
  },
  {
    name: 'get_entity',
    description: 'Get specific entity by identifiers',
    apiReference: '/api-reference/get-an-entity',
    roles: ['developer', 'builder']
  },
  {
    name: 'update_entity',
    description: 'Update existing entity fields',
    apiReference: '/api-reference/update-an-entity',
    roles: ['builder']
  },
  {
    name: 'delete_entity',
    description: 'Delete entity with optional dependents',
    apiReference: '/api-reference/delete-an-entity',
    roles: ['builder']
  },

  // Scorecard tools
  {
    name: 'create_scorecard',
    description: 'Create new scorecard for blueprint',
    apiReference: '/api-reference/create-a-scorecard',
    roles: ['builder']
  },
  {
    name: 'get_scorecards',
    description: 'Retrieve all scorecards (compacted)',
    apiReference: '/api-reference/get-all-scorecards',
    roles: ['developer', 'builder']
  },
  {
    name: 'get_scorecard',
    description: 'Get specific scorecard by ID',
    apiReference: '/api-reference/get-a-scorecard',
    roles: ['developer', 'builder']
  },
  {
    name: 'update_scorecard',
    description: 'Update existing scorecard',
    apiReference: '/api-reference/change-scorecards',
    roles: ['builder']
  },
  {
    name: 'delete_scorecard',
    description: 'Delete scorecard by identifiers',
    apiReference: '/api-reference/delete-a-scorecard',
    roles: ['builder']
  },

  // Action tools
  {
    name: 'create_action',
    description: 'Create new action',
    roles: ['builder']
  },
  {
    name: 'list_actions',
    description: 'Get all actions (compacted)',
    roles: ['developer', 'builder']
  },
  {
    name: 'get_action',
    description: 'Get specific action details and input schema',
    roles: ['developer', 'builder']
  },
  {
    name: 'update_action',
    description: 'Update existing action',
    roles: ['builder']
  },
  {
    name: 'delete_action',
    description: 'Delete action by identifier',
    roles: ['builder']
  },
  {
    name: 'track_action_run',
    description: 'Track action execution status',
    roles: ['developer', 'builder']
  },
  {
    name: 'run_*',
    description: 'Execute any action you have permission to run in Port',
    apiReference: '/api-reference/execute-a-self-service-action',
    roles: ['developer', 'builder'],
    isDynamic: true
  },
  {
    name: 'get_action_permissions',
    description: 'Get permissions/approval config for actions',
    roles: ['developer', 'builder']
  },
  {
    name: 'update_action_permissions',
    description: 'Update action permissions configuration',
    roles: ['builder']
  },

  // Documentation and user tools
  {
    name: 'ask_port_docs',
    description: 'Ask questions about Port documentation and get contextual answers',
    roles: ['developer', 'builder']
  },
  {
    name: 'search_port_docs_sources',
    description: 'Search Port documentation sources for relevant information',
    roles: ['developer', 'builder']
  },
  {
    name: 'describe_user_details',
    description: 'Get user info, organization, teams, etc.',
    apiReference: '/api-reference/get-organization-details',
    roles: ['developer', 'builder']
  }
];
