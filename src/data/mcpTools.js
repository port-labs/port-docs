// MCP Tools available in Port MCP Server
// Complete list of all available tools with role-based access

export const mcpTools = [
  // Blueprint tools
  {
    name: 'list_blueprints',
    description: 'List blueprints in your organization. Without identifiers, returns a summary list. With identifiers, returns full blueprint details including property definitions, schemas, and enum values.',
    apiReference: '/api-reference/get-all-blueprints',
    roles: ['developer', 'builder']
  },
  {
    name: 'upsert_blueprint',
    description: 'Create or update a blueprint. Updates if the blueprint exists, creates if it does not.',
    apiReference: '/api-reference/create-a-blueprint',
    roles: ['builder']
  },
  {
    name: 'delete_blueprint',
    description: 'Delete blueprint and all its entities.',
    apiReference: '/api-reference/delete-a-blueprint',
    roles: ['builder']
  },

  // Entity tools
  {
    name: 'list_entities',
    description: 'Query entities from a blueprint with filtering, sorting, and pagination. Supports identifiers for specific entities, groupBy for value distribution, and countOnly for counting without retrieving data.',
    apiReference: '/api-reference/get-all-entities-of-a-blueprint',
    roles: ['developer', 'builder']
  },
  {
    name: 'upsert_entity',
    description: 'Create or update an entity. Updates if the entity exists, creates if it does not. Uses merge by default to preserve existing fields.',
    apiReference: '/api-reference/create-an-entity',
    roles: ['builder']
  },
  {
    name: 'delete_entity',
    description: 'Delete entity with optional dependents.',
    apiReference: '/api-reference/delete-an-entity',
    roles: ['builder']
  },

  // Scorecard tools
  {
    name: 'list_scorecards',
    description: 'List scorecards in your organization. Without identifiers, returns a summary list. With identifiers, returns full scorecard details including complete rule configurations.',
    apiReference: '/api-reference/get-all-scorecards',
    roles: ['developer', 'builder']
  },
  {
    name: 'upsert_scorecard',
    description: 'Create or update a scorecard. Updates if the scorecard exists, creates if it does not.',
    apiReference: '/api-reference/create-a-scorecard',
    roles: ['builder']
  },
  {
    name: 'delete_scorecard',
    description: 'Delete scorecard by identifiers.',
    apiReference: '/api-reference/delete-a-scorecard',
    roles: ['builder']
  },

  // Action tools
  {
    name: 'list_actions',
    description: 'List actions in your organization. Without identifiers, returns a summary list. With identifiers, returns full action details including complete input schemas.',
    roles: ['developer', 'builder']
  },
  {
    name: 'upsert_action',
    description: 'Create or update an action. Updates if the action exists, creates if it does not.',
    roles: ['builder']
  },
  {
    name: 'delete_action',
    description: 'Delete action by identifier.',
    roles: ['builder']
  },
  {
    name: 'track_action_run',
    description: 'Track action execution status.',
    roles: ['developer', 'builder']
  },
  {
    name: 'run_action',
    description: 'Execute any action you have permission to run in Port. Provide the action identifier and inputs to run the action. This unified tool handles all actions in your organization, reducing the total number of tools available.',
    apiReference: '/api-reference/execute-a-self-service-action',
    roles: ['developer', 'builder'],
    isDynamic: true
  },
  {
    name: 'get_action_permissions',
    description: 'Get permissions/approval config for actions.',
    roles: ['developer', 'builder']
  },
  {
    name: 'update_action_permissions',
    description: 'Update action permissions configuration.',
    roles: ['builder']
  },

  // Integration tools
  {
    name: 'list_integrations',
    description: 'List integrations in your organization. Without identifiers, returns a summary list. With identifiers, returns full integration details including complete config with mapping configuration.',
    apiReference: '/api-reference/get-all-integrations',
    roles: ['builder']
  },
  {
    name: 'test_integration_mapping',
    description: 'Test an integration mapping against raw data examples. Validates the mapping, checks for errors, and returns the mapped results or error messages.',
    roles: ['builder']
  },
  {
    name: 'get_integration_sync_metrics',
    description: 'Fetch sync metrics for an integration. Returns detailed metrics including status, number of items handled in each phase of the integration pipeline (extract, transform, load, delete), and per-kind statistics.',
    apiReference: '/api-reference/get-an-integrations-metrics-and-sync-status',
    roles: ['builder']
  },
  {
    name: 'get_integration_event_logs',
    description: 'Fetch event logs for an integration. Supports pagination to read logs page by page. You can paginate by using the timestamp and log_id from the previous response.',
    apiReference: '/api-reference/get-an-integrations-audit-logs',
    roles: ['builder']
  },
  {
    name: 'get_integration_kinds_with_examples',
    description: 'Fetch all kinds (data types) that an integration ingests, along with raw data examples for each kind. For example, a GitHub integration might have kinds like "pull_request", "issue", and "repo".',
    roles: ['builder']
  },

  // Documentation and user tools
  {
    name: 'search_port_knowledge_sources',
    description: 'Search the official Port documentation and return the most relevant sections from it for a user query. Each returned section includes the url and its actual content in markdown. Use this tool for all queries that require Port knowledge.',
    roles: ['developer', 'builder']
  },
  {
    name: 'describe_user_details',
    description: 'Describe the user, which organization he is connected to and what teams he is a member of and more information regarding the user. Can be useful for questions that relate to the user or when looking up for related entities to the user',
    apiReference: '/api-reference/get-organization-details',
    roles: ['developer', 'builder']
  },

  // Skill tools
  {
    name: 'load_skill',
    description: 'Load specialized guidance for a domain-specific task. Skills provide step-by-step instructions for common workflows like troubleshooting integrations. Load a skill before starting a specialized task to ensure consistent, thorough handling.',
    docsReference: '/ai-interfaces/port-mcp-server/skills',
    roles: ['developer', 'builder']
  }
];
