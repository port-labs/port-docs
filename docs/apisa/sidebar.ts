import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "apisa/port-api",
    },
    {
      type: "category",
      label: "Blueprints",
      items: [
        {
          type: "doc",
          id: "apisa/get-blueprints-permissions",
          label: "Get blueprint's permissions",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/patch-blueprints-permissions",
          label: "Patch blueprint's permissions",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "apisa/get-all-blueprints",
          label: "Get all blueprints",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/create-a-blueprint",
          label: "Create a blueprint",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "apisa/get-a-blueprint",
          label: "Get a blueprint",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/change-a-blueprint",
          label: "Change a blueprint",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "apisa/patch-a-blueprint",
          label: "Patch a blueprint",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "apisa/delete-a-blueprint",
          label: "Delete a blueprint",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "apisa/rename-a-property-in-a-blueprint",
          label: "Rename a property in a blueprint",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "apisa/rename-a-blueprints-mirror",
          label: "Rename a blueprint's mirror",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "apisa/rename-a-blueprints-relation",
          label: "Rename a blueprint's relation",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "Pages",
      items: [
        {
          type: "doc",
          id: "apisa/get-pages-permissions",
          label: "Get page's permissions",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/patch-pages-permissions",
          label: "Patch pages permissions",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "apisa/get-all-pages",
          label: "Get all pages",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/create-pages",
          label: "Create pages",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "apisa/get-a-page",
          label: "Get a page",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/patch-a-page",
          label: "Patch a page",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "apisa/delete-a-page",
          label: "Delete a page",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "apisa/create-a-widget-in-a-page",
          label: "Create a widget in a page",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "apisa/change-a-pages-widget",
          label: "Change a page's widget",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "apisa/delete-a-pages-widget",
          label: "Delete a page's widget",
          className: "api-method delete",
        },
      ],
    },
    {
      type: "category",
      label: "Authentication / Authorization",
      items: [
        {
          type: "doc",
          id: "apisa/create-an-access-token",
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
          id: "apisa/create-entities",
          label: "Create entities",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "apisa/get-all-blueprints-entities",
          label: "Get all blueprint's entities",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/patch-an-entity",
          label: "Patch an entity",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "apisa/change-an-entities",
          label: "Change an entities",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "apisa/get-an-entity",
          label: "Get an entity",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/delte-a-blueprints-entity",
          label: "Delte a blueprint's entity",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "apisa/get-blueprints-entity-count",
          label: "Get blueprint's entity count",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/delete-all-entities-of-blueprint",
          label: "Delete all entities of blueprint",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "apisa/search-entities",
          label: "Search entities",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "apisa/aggregate-entities",
          label: "Aggregate entities",
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
          id: "apisa/create-a-blueprint-action",
          label: "Create a blueprint action",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "apisa/change-blueprints-actions",
          label: "Change blueprint's actions",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "apisa/get-all-blueprints-actions",
          label: "Get all blueprint's actions",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/update-a-blueprints-action",
          label: "Update a blueprint's action",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "apisa/get-a-blueprint-action",
          label: "Get a blueprint action",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/delete-blueprints-action",
          label: "Delete blueprint's action",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "apisa/get-all-actions",
          label: "Get all actions",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/get-an-action",
          label: "Get an Action",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/patch-blueprints-action-permissions",
          label: "Patch blueprint's action permissions",
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
          id: "apisa/run-a-blueprints-entity-action",
          label: "Run a blueprint's entity action",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "apisa/run-a-blueprints-action",
          label: "Run a blueprint's action",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "apisa/patch-an-action-run",
          label: "Patch an action run",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "apisa/get-an-action-runs-details",
          label: "Get an action run's details",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/approve-an-actions-run",
          label: "Approve an action's run",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "apisa/get-all-action-runs",
          label: "Get all action runs",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/add-a-log-to-an-action-run",
          label: "Add a log to an action run",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "apisa/get-an-actions-run-logs",
          label: "Get an action's run logs",
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
          id: "apisa/get-organization",
          label: "Get organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/change-an-integration",
          label: "Change an integration",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "apisa/patch-an-organization",
          label: "Patch an organization",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "apisa/create-an-organization",
          label: "Create an organization",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "apisa/create-a-documentation-to-the-organization",
          label: "Create a documentation to the organization",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Integrations",
      items: [
        {
          type: "doc",
          id: "apisa/get-all-integrations",
          label: "Get all integrations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/create-an-integration",
          label: "Create an integration",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "apisa/get-an-integration",
          label: "Get an integration",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/patch-an-integration",
          label: "Patch an integration",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "apisa/delete-an-integration",
          label: "Delete an integration",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "apisa/get-audit-logs",
          label: "Get audit logs",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/patch-an-integrations-config",
          label: "Patch an integration's config",
          className: "api-method patch",
        },
      ],
    },
    {
      type: "category",
      label: "Data Sources",
      items: [
        {
          type: "doc",
          id: "apisa/get-all-data-sources",
          label: "Get all data sources",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Webhook",
      items: [
        {
          type: "doc",
          id: "apisa/create-a-webhook",
          label: "Create a webhook",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "apisa/get-all-webhooks",
          label: "Get all webhooks",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/patch-a-webhook",
          label: "Patch a webhook",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "apisa/change-a-webhook",
          label: "Change a webhook",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "apisa/get-a-webhook",
          label: "Get a webhook",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/delete-a-webhook",
          label: "delete a webhook",
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
          id: "apisa/get-audit-logs",
          label: "Get audit logs",
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
          id: "apisa/get-all-teams-in-organization",
          label: "Get all teams in organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/create-a-team",
          label: "Create a team",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "apisa/get-a-team",
          label: "Get a team",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/patch-a-team",
          label: "Patch a team",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "apisa/change-a-team",
          label: "Change a team",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "apisa/delete-a-team",
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
          id: "apisa/get-all-users-of-organization",
          label: "Get all users of organization",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/invite-a-user-to-the-organization",
          label: "Invite a user to the organization",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "apisa/get-a-user",
          label: "Get a user",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/patch-a-user",
          label: "Patch a user",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "apisa/delete-a-user",
          label: "Delete a user",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "apisa/patch-a-users-profile",
          label: "Patch a user's profile",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "apisa/get-user-profile",
          label: "Get user profile",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Apps",
      items: [
        {
          type: "doc",
          id: "apisa/get-an-application",
          label: "Get an application",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Roles",
      items: [
        {
          type: "doc",
          id: "apisa/get-all-roles-of-organization",
          label: "Get all roles of organization",
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
          id: "apisa/post-scorecards",
          label: "Run a blueprints' scoreboards",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "apisa/change-a-blueprints-scoreboards",
          label: "Change a blueprints' scoreboards",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "apisa/get-a-blueprints-scoreboards",
          label: "Get a blueprints' scoreboards",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/change-a-blueprints-scoreboard",
          label: "Change a blueprint's scoreboard",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "apisa/get-a-blueprints-scoreboard",
          label: "Get a blueprint's scoreboard",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/delete-a-blueprints-scoreboard",
          label: "Delete a blueprint's scoreboard",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "apisa/get-all-scoreboards",
          label: "Get all scoreboards",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Migrations",
      items: [
        {
          type: "doc",
          id: "apisa/get-all-migrations",
          label: "Get all migrations",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/create-a-migration",
          label: "Create a migration",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "apisa/get-a-migration",
          label: "Get a migration",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/cancel-a-migration",
          label: "Cancel a migration",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Search",
      items: [
        {
          type: "doc",
          id: "apisa/search-entities",
          label: "Search entities",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Sidebars",
      items: [
        {
          type: "doc",
          id: "apisa/get-a-sidebar",
          label: "Get a sidebar",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "apisa/create-a-folder",
          label: "Create a folder",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "apisa/update-a-folder",
          label: "Update a folder",
          className: "api-method patch",
        },
        {
          type: "doc",
          id: "apisa/delete-a-folder",
          label: "Delete a folder",
          className: "api-method delete",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
