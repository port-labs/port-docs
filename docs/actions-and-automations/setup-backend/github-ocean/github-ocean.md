import GitHubWorkflowLimitations from '/docs/actions-and-automations/templates/_github-workflow-limitations.md'

# GitHub workflow via Ocean

The GitHub Ocean backend allows you to trigger GitHub workflows for your self-service actions and automations, using the [GitHub Ocean integration](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/github-ocean.md).

:::tip Integration-based backend
The GitHub Ocean backend uses the `INTEGRATION_ACTION` type and requires you to specify which GitHub Ocean integration installation to use via the `installationId` field.
:::

## Prerequisites

Before using the GitHub Ocean backend, you need to:

1. Install the [GitHub Ocean integration](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/installation/installation.mdx) in your Port organization.
2. Ensure that actions processing is enabled. This is automatically enabled via the UI and OAuth installations.
3. Ensure the integration uses Port machine tokens (organization-level tokens). Personal tokens or service account tokens are not supported.

## Configuration

When using this backend, you need to provide:

- The **integration installation ID** (`installationId`) - specifies which GitHub Ocean integration instance to use.
- The GitHub **organization** and **repository** where the workflow is located.
- The workflow **name**.
- The **integration action type** (`integrationActionType`) - must be set to `dispatch_workflow`.

Important notes:

- The workflow must reside in the repository's `.github/workflows/` directory.
- The workflow must use the [workflow_dispatch](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/manually-running-a-workflow) trigger.  
  For example, see the workflow implementation in [this guide](/guides/all/manage-pull-requests#guide).

### Automatic workflow status update

You can define whether Port should automatically use the workflow's end status (`SUCCESS`/`FAILURE`) to update the action/automation status in Port.

By default, this is set to `true`. To disable this option, set the `reportWorkflowStatus` field to `false` in the `invocationMethod` object, or set the `Report workflow status` option to `No` if using the UI.

:::info Live events requirement
To enable automatic workflow status updates, the integration must have live events enabled. Workflow status is updated via webhook events from GitHub. Live events are automatically enabled for integrations hosted by Port, but must be manually configured for self-hosted installations.
:::

### Organization auto-fill

The `org` field behavior depends on the installation type:

- If the integration is **hosted by Port**, the `org` input field will be hidden and prefilled in the UI. Port automatically knows which organization you selected during installation.
- If the integration is **self-hosted**, you must always fill in the organization input, even if it is configured for a specific organization.
- When creating an action **through the API**, you must specify the organization even if the integration is hosted by Port.

<GitHubWorkflowLimitations />
