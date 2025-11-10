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
    description: 'Retrieve all blueprints in your organization. Blueprints are the building blocks that define your data model. The response is compacted, use get_blueprint with specific blueprint for full details, if needed.',
    apiReference: '/api-reference/get-all-blueprints',
    roles: ['developer', 'builder']
  },
  {
    name: 'get_blueprint',
    description: 'Get a specific blueprint by its identifier. Returns the complete blueprint configuration.',
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
    name: 'list_entities',
    description: 'Search and retrieve entities for a blueprint with advanced filtering, sorting, and pagination options',
    apiReference: '/api-reference/get-all-entities-of-a-blueprint',
    roles: ['developer', 'builder']
  },
  {
    name: 'get_entities_by_identifiers',
    description: 'Get specific entities by their identifiers within a blueprint',
    apiReference: '/api-reference/get-an-entity',
    roles: ['developer', 'builder']
  },
  {
    name: 'count_entities',
    description: 'Count entities matching specified filters without retrieving entity data. Returns only the count number for efficient queries like "how many services are in production?"',
    apiReference: '/api-reference/get-all-entities-of-a-blueprint',
    roles: ['developer', 'builder']
  },
  {
    name: 'update_entity',
    description: 'Update an existing entity. Only the fields provided will be updated.',
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
    description: 'Retrieve all scorecards. The response is compacted, use get_scorecard with specific scorecard for full details, if needed.',
    apiReference: '/api-reference/get-all-scorecards',
    roles: ['developer', 'builder']
  },
  {
    name: 'get_scorecard',
    description: 'Get specific scorecard by identifier',
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
    description: 'Get all actions. The response is compacted, use get_action with specific action for full details, if needed.',
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
    description: 'Execute any action you have permission to run in Port. Dynamically generated for each action available in your organization.',
    apiReference: '/api-reference/execute-a-self-service-action',
    roles: ['developer', 'builder'],
    isDynamic: true
  },
  {
    name: 'run_action',
    description: 'Run any action dynamically by providing the action identifier and inputs. Used internally by the MCP server and not directly exposed to clients.',
    apiReference: '/api-reference/execute-a-self-service-action',
    roles: ['developer','builder'],
    isDynamic: true,
    isInternal: true
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
    name: 'search_port_sources',
    description: 'Search the official Port documentation and return the most relevant sections from it for a user query. Each returned section includes the url and its actual content in markdown. Use this tool for all queries that require Port knowledge.',
    roles: ['developer', 'builder']
  },
  {
    name: 'describe_user_details',
    description: 'Describe the user, which organization he is connected to and what teams he is a member of and more information regarding the user. Can be useful for questions that relate to the user or when looking up for related entities to the user',
    apiReference: '/api-reference/get-organization-details',
    roles: ['developer', 'builder']
  }
];
