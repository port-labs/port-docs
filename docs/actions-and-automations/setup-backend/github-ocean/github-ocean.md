import GitHubWorkflowCommon from '/docs/actions-and-automations/templates/_github-workflow-common.md'
import GitHubWorkflowLimitations from '/docs/actions-and-automations/templates/_github-workflow-limitations.md'

# GitHub workflow via Ocean

The GitHub Ocean backend allows you to trigger GitHub workflows for your self-service actions and automations, using the [GitHub Ocean integration](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/github-ocean.md).

:::tip Integration-based backend
The GitHub Ocean backend uses the `INTEGRATION_ACTION` type and requires you to specify which GitHub Ocean integration installation to use via the `installationId` field. This allows you to use the same integration instance that syncs your GitHub data to Port for triggering workflows.
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

<GitHubWorkflowCommon />

### Automatic workflow status update

You can define whether Port should automatically use the workflow's end status (`SUCCESS`/`FAILURE`) to update the action/automation status in Port.

By default, this is set to `true`. To disable this option, set the `reportWorkflowStatus` field to `false` in the `invocationMethod` object, or set the `Report workflow status` option to `No` if using the UI.

:::info Live events requirement
Enabling this toggle requires the integration to run with live events enabled. The workflow status is updated via webhook events from GitHub. Live events are automatically activated via hosted by Port integration but are not automatically activated for self-hosted installations.
:::

### Organization auto-fill

The `org` field behavior depends on the installation type:

- **Hosted by Port**: If GitHub Ocean is installed via SaaS, the `org` input field will be hidden and prefilled in the UI only. Port automatically knows which organization the user selected during installation.
- **Self-hosted**: If the integration is self-hosted, you must always fill in the organization input, even if it is configured for a specific organization.
- **API configuration**: When creating an action through the API, you must specify the organization even if the integration is hosted by Port.

<GitHubWorkflowLimitations />
