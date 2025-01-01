import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "api-reference-temp/port-api",
    },
    {
      type: "category",
      label: "Blueprints",
      items: [
        {
          type: "doc",
          id: "api-reference-temp/get-a-blueprints-permissions",
          label: "Get a blueprint's permissions",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/patch-a-blueprints-permissions",
          label: "Patch a blueprint's permissions",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-all-blueprints",
          label: "Get all blueprints",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/create-a-blueprint",
          label: "Create a blueprint",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-a-blueprint",
          label: "Get a blueprint",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/change-a-blueprint",
          label: "Change a blueprint",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api-reference-temp/patch-a-blueprint",
          label: "Patch a blueprint",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference-temp/delete-a-blueprint",
          label: "Delete a blueprint",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api-reference-temp/rename-a-property-in-a-blueprint",
          label: "Rename a property in a blueprint",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference-temp/rename-a-blueprints-mirror-property",
          label: "Rename a blueprint's mirror property",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference-temp/rename-a-blueprints-relation",
          label: "Rename a blueprint's relation",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "Authentication / Authorization",
      items: [
        {
          type: "doc",
          id: "api-reference-temp/create-an-access-token",
          label: "Create an access token",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Entities",
      items: [
        {
          type: "doc",
          id: "api-reference-temp/create-an-entity",
          label: "Create an entity",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-all-entities-of-a-blueprint",
          label: "Get all entities of a blueprint",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/patch-an-entity",
          label: "Patch an entity",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference-temp/change-an-entity",
          label: "Change an entity",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-an-entity",
          label: "Get an entity",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/delete-an-entity",
          label: "Delete an entity",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-a-blueprints-entity-count",
          label: "Get a blueprint's entity count",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/delete-all-entities-of-a-blueprint",
          label: "Delete all entities of a blueprint",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api-reference-temp/search-entities",
          label: "Search entities",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Actions",
      items: [
        {
          type: "doc",
          id: "api-reference-temp/create-an-action-automation",
          label: "Create an action/automation",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-actions-automations",
          label: "Get actions/automations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/update-an-action-automation",
          label: "Update an action/automation",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-an-action-automation",
          label: "Get an action/automation",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/delete-an-action-automation",
          label: "Delete an action/automation",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-an-actions-permissions",
          label: "Get an action's permissions",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/update-an-actions-permissions",
          label: "Update an action's permissions",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "Action Runs",
      items: [
        {
          type: "doc",
          id: "api-reference-temp/execute-a-self-service-action",
          label: "Execute a self-service action",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference-temp/patch-an-action-run",
          label: "Patch an action run",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-an-action-runs-details",
          label: "Get an action run's details",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/approve-an-action-run",
          label: "Approve an action run",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-an-action-runs-approvers",
          label: "Get an action run's approvers",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-all-action-runs",
          label: "Get all action runs",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/add-a-log-to-an-action-run",
          label: "Add a log to an action run",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-an-actions-run-logs",
          label: "Get an action's run logs",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Teams",
      items: [
        {
          type: "doc",
          id: "api-reference-temp/get-all-teams-in-your-organization",
          label: "Get all teams in your organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/create-a-team",
          label: "Create a team",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-a-team",
          label: "Get a team",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/patch-a-team",
          label: "Patch a team",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference-temp/change-a-team",
          label: "Change a team",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api-reference-temp/delete-a-team",
          label: "Delete a team",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Users",
      items: [
        {
          type: "doc",
          id: "api-reference-temp/get-all-users-in-your-organization",
          label: "Get all users in your organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/invite-a-user-to-your-organization",
          label: "Invite a user to your organization",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-a-user",
          label: "Get a user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/patch-a-user",
          label: "Patch a user",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference-temp/delete-a-user",
          label: "Delete a user",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Audit",
      items: [
        {
          type: "doc",
          id: "api-reference-temp/get-audit-logs",
          label: "Get audit logs",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Scorecards",
      items: [
        {
          type: "doc",
          id: "api-reference-temp/create-a-scorecard",
          label: "Create a scorecard",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference-temp/change-scorecards",
          label: "Change scorecards",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-a-blueprints-scorecards",
          label: "Get a blueprint's scorecards",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/change-a-scorecard",
          label: "Change a scorecard",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-a-scorecard",
          label: "Get a scorecard",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/delete-a-scorecard",
          label: "Delete a scorecard",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-all-scorecards",
          label: "Get all scorecards",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Organization",
      items: [
        {
          type: "doc",
          id: "api-reference-temp/get-organization-details",
          label: "Get organization details",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/update-organization-details",
          label: "Update organization details",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api-reference-temp/patch-organization-details",
          label: "Patch organization details",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-all-organization-secrets",
          label: "Get all organization secrets",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/create-an-organization-secret",
          label: "Create an organization secret",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-an-organization-secret",
          label: "Get an organization secret",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/patch-an-organization-secret",
          label: "Patch an organization secret",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference-temp/delete-an-organization-secret",
          label: "Delete an organization secret",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Integrations",
      items: [
        {
          type: "doc",
          id: "api-reference-temp/get-an-integrations-audit-logs",
          label: "Get an integration's audit logs",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/patch-an-integrations-config",
          label: "Patch an integration's config",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-all-integrations",
          label: "Get all integrations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/create-an-integration",
          label: "Create an integration",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-an-integration",
          label: "Get an integration",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/patch-an-integration",
          label: "Patch an integration",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference-temp/delete-an-integration",
          label: "Delete an integration",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Webhook",
      items: [
        {
          type: "doc",
          id: "api-reference-temp/create-a-webhook",
          label: "Create a webhook",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-all-webhooks",
          label: "Get all webhooks",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/patch-a-webhook",
          label: "Patch a webhook",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference-temp/change-a-webhook",
          label: "Change a webhook",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-a-webhook",
          label: "Get a webhook",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/delete-a-webhook",
          label: "Delete a webhook",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Migrations",
      items: [
        {
          type: "doc",
          id: "api-reference-temp/get-all-migrations",
          label: "Get all migrations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/create-a-migration",
          label: "Create a migration",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference-temp/get-a-migration",
          label: "Get a migration",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/cancel-a-migration",
          label: "Cancel a migration",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Apps",
      items: [
        {
          type: "doc",
          id: "api-reference-temp/get-all-credentials",
          label: "Get all credentials",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference-temp/create-credentials",
          label: "Create credentials",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference-temp/rotate-secret",
          label: "Rotate secret",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference-temp/delete-credentials",
          label: "Delete credentials",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api-reference-temp/update-credentials",
          label: "Update credentials",
          className: "api-method put",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
