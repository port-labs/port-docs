import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "api-reference/port-api",
    },
    {
      type: "doc",
      id: "api-reference/rate-limits",
    },
    {
      type: "html",
      value: '<hr style="margin: 0.8rem">',
    },
    {
      type: "category",
      label: "Blueprints",
      items: [
        {
          type: "doc",
          id: "api-reference/get-a-blueprints-permissions",
          label: "Get a blueprint's permissions",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/patch-a-blueprints-permissions",
          label: "Patch a blueprint's permissions",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference/get-all-blueprints",
          label: "Get all blueprints",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/create-a-blueprint",
          label: "Create a blueprint",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference/get-a-blueprint",
          label: "Get a blueprint",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/change-a-blueprint",
          label: "Change a blueprint",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api-reference/patch-a-blueprint",
          label: "Patch a blueprint",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference/delete-a-blueprint",
          label: "Delete a blueprint",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api-reference/rename-a-property-in-a-blueprint",
          label: "Rename a property in a blueprint",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference/rename-a-blueprints-mirror-property",
          label: "Rename a blueprint's mirror property",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference/rename-a-blueprints-relation",
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
          id: "api-reference/create-an-access-token",
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
          id: "api-reference/create-an-entity",
          label: "Create an entity",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference/get-all-entities-of-a-blueprint",
          label: "Get all entities of a blueprint",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/patch-an-entity",
          label: "Patch an entity",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference/change-an-entity",
          label: "Change an entity",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api-reference/get-an-entity",
          label: "Get an entity",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/delete-an-entity",
          label: "Delete an entity",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api-reference/get-a-blueprints-entity-count",
          label: "Get a blueprint's entity count",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/delete-all-entities-of-a-blueprint",
          label: "Delete all entities of a blueprint",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api-reference/search-entities",
          label: "Search entities",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Actions & automations",
      items: [
        {
          type: "doc",
          id: "api-reference/create-an-action-automation",
          label: "Create an action/automation",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference/get-actions-automations",
          label: "Get actions/automations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/update-an-action-automation",
          label: "Update an action/automation",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api-reference/get-an-actions-permissions",
          label: "Get an action's permissions",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/update-an-actions-permissions",
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
          id: "api-reference/patch-an-action-run",
          label: "Patch an action run",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference/get-an-action-runs-details",
          label: "Get an action run's details",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/approve-an-actions-run",
          label: "Approve an action's run",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference/get-all-action-runs",
          label: "Get all action runs",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/add-a-log-to-an-action-run",
          label: "Add a log to an action run",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference/get-an-actions-run-logs",
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
          id: "api-reference/get-all-teams-in-your-organization",
          label: "Get all teams in your organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/create-a-team",
          label: "Create a team",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference/get-a-team",
          label: "Get a team",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/patch-a-team",
          label: "Patch a team",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference/change-a-team",
          label: "Change a team",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api-reference/delete-a-team",
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
          id: "api-reference/get-all-users-in-your-organization",
          label: "Get all users in your organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/invite-a-user-to-your-organization",
          label: "Invite a user to your organization",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference/get-a-user",
          label: "Get a user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/patch-a-user",
          label: "Patch a user",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference/delete-a-user",
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
          id: "api-reference/get-audit-logs",
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
          id: "api-reference/create-a-scorecard",
          label: "Create a scorecard for a blueprint",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference/change-scorecards",
          label: "Change a blueprints' scorecards",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api-reference/get-a-blueprints-scorecards",
          label: "Get a blueprints' scorecards",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/change-a-scorecard",
          label: "Change a blueprint's scorecard",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api-reference/get-a-scorecard",
          label: "Get a blueprint's scorecard",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/delete-a-scorecard",
          label: "Delete a blueprint's scorecard",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api-reference/get-all-scorecards",
          label: "Get all scoreboards",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Integrations",
      items: [
        {
          type: "doc",
          id: "api-reference/get-an-integrations-audit-logs",
          label: "Get an integration's audit logs",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/patch-an-integrations-config",
          label: "Patch an integration's config",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference/get-all-integrations",
          label: "Get all integrations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/create-an-integration",
          label: "Create an integration",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference/get-an-integration",
          label: "Get an integration",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/patch-an-integration",
          label: "Patch an integration",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference/delete-an-integration",
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
          id: "api-reference/create-a-webhook",
          label: "Create a webhook",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference/get-all-webhooks",
          label: "Get all webhooks",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/patch-a-webhook",
          label: "Patch a webhook",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference/change-a-webhook",
          label: "Change a webhook",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api-reference/get-a-webhook",
          label: "Get a webhook",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/delete-a-webhook",
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
          id: "api-reference/get-all-migrations",
          label: "Get all migrations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/create-a-migration",
          label: "Create a migration",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Organizations",
      items: [
        {
          type: "doc",
          id: "api-reference/get-organization-details",
          label: "Get an organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/patch-organization-details",
          label: "Patch an organization",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "api-reference/update-organization-details",
          label: "Change an organization",
          className: "api-method put",
        }
      ],
    }
  ],
};

export default sidebar.apisidebar;
