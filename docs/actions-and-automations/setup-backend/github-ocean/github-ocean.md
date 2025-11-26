import GitHubWorkflowCommon from '/docs/actions-and-automations/templates/_github-workflow-common.md'
import GitHubWorkflowLimitations from '/docs/actions-and-automations/templates/_github-workflow-limitations.md'

# GitHub Ocean workflow

The GitHub Ocean backend allows you to trigger GitHub workflows for your self-service actions and automations, using the [GitHub Ocean integration](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/github-ocean.md).

:::tip Integration-based backend
The GitHub Ocean backend uses the `INTEGRATION_ACTION` type and requires you to specify which GitHub Ocean integration installation to use via the `installationId` field. This allows you to use the same integration instance that syncs your GitHub data to Port for triggering workflows.
:::

## Prerequisites

Before using the GitHub Ocean backend, you need to:

1. Install the [GitHub Ocean integration](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/installation/installation.mdx) in your Port organization.
2. Ensure the integration uses Port machine tokens (organization-level tokens). Personal tokens or service account tokens are not supported.

## Configuration

When using this backend, you need to provide:

- The **integration installation ID** (`installationId`) - specifies which GitHub Ocean integration instance to use.
- The GitHub **organization** and **repository** where the workflow is located.
- The workflow **name**.

<GitHubWorkflowCommon />

### Organization auto-fill

If the organization was specified when installing the GitHub Ocean integration, the `org` field will be prefilled automatically. Otherwise, you need to specify the organization where the workflow resides.

<GitHubWorkflowLimitations />
