---
sidebar_position: 6
---

import FindCredentials from "/docs/build-your-software-catalog/custom-integration/api/\_template_docs/\_find_credentials.mdx"

# Custom GitHub App

:::warning Deprecated
This page documents the legacy custom GitHub App creation method, which is **deprecated**.

**Use [GitHub Ocean](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/installation) instead**, which offers:

- Better performance and reliability.
- OAuth-based setup for custom GitHub Apps.
- Enhanced features and capabilities.
- Active support and updates.

GitHub Ocean uses custom GitHub Apps under the hood, providing all the benefits of custom apps through a modern, supported integration.
:::

## Overview

Port's Custom GitHub App feature allowed you to create and manage your own GitHub applications using the legacy API. This approach is now deprecated in favor of [GitHub Ocean](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/installation).

**For new integrations, use GitHub Ocean:**

- [Install GitHub Ocean](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/installation) - The recommended approach for all new GitHub integrations.
- GitHub Ocean supports custom GitHub Apps via OAuth or manual setup, providing the same functionality with better performance and support.

## Prerequisites

- A registered organization in Port.
- Your Port user role is set to `Admin`.
- Access to Port's API credentials.
- Admin permissions in your GitHub organization.

## Benefits of custom GitHub apps

- **Workspace Isolation**: Each team can have their own GitHub App with specific repository access.
- **Enhanced Security**: Better permission boundaries between different teams and projects.
- **Multi-Organization Support**: Same GitHub organizations can be integrated with multiple Port organizations.
- **Self-Hosted Support**: Works with both cloud and self-hosted GitHub Enterprise instances.
- **Custom Configuration**: Create tailored integration setups for specific use cases.

## Create a custom app

:::warning Deprecated method
The form and API endpoint documented below are **deprecated** and should not be used for new integrations.

**Use [GitHub Ocean](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/installation) instead**, which provides OAuth-based setup for custom GitHub Apps.
:::

<details>
<summary>Legacy API method (deprecated)</summary>

**This API endpoint is deprecated. Use [GitHub Ocean](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/installation) instead.**

The legacy method involved:

1. Making a GET request to the GitHub App creation URL endpoint:

   ```
   https://api.getport.io/v1/integration/github-app-creation-url
   ```

2. Including the following query parameters:
   - `isSelfHostedEnterprise=false` (set to `true` for GitHub Enterprise).
   - `githubOrgName=YOUR_ORG_NAME` (replace with your GitHub organization name).
   - `selfHostedEnterpriseUrl=YOUR_GH_ENTERPRISE_URL` (replace with your self hosted github enterprise url).
3. Adding your Port authentication token in the Authorization header:

   ```
   Authorization: Bearer YOUR_TOKEN
   ```

4. The response would contain a `url` and a `manifest` object.
5. Creating an HTML form with a button that triggers a POST request to the `url` provided by Port's API. The request should include the GitHub App `manifest` as the payload.

:::tip
You'll need your Port API credentials for this process:

<FindCredentials/>
:::

</details>

<details>
<summary>Technical Details</summary>

<h3> GitHub App Manifest </h3>

The GitHub App manifest is a JSON configuration file that defines:

- App name and description.
- Webhook URL and events.
- Required permissions.
- Callback URLs.
- Other configuration parameters.

Port generates this manifest automatically based on best practices, ensuring the app has the correct permissions for integration with Port.

<h3> Required Permissions </h3>

Custom GitHub Apps must be configured with the following minimum permissions:

<h4> Repository Permissions </h4>
- **Actions**: Read and Write (for executing self-service action using GitHub workflow).
- **Checks**: Read and Write (for validating `Port.yml`).
- **Contents**: Readonly (for reading port configuration files and repository files).
- **Metadata**: Readonly.
- **Issues**: Readonly.
- **Pull Request**: Read and Write.
- **Dependabot alerts**: Readonly.
- **Administration**: Readonly (for syncing github teams).

<h4> Organization Permissions </h4>
- **Members**: Readonly (for syncing github teams).

<h4> Repository Events </h4>
- Issues.
- Pull Request.
- Push.
- Workflow Run.
- Team.
- Dependabot alerts.

<h3> Credential Storage </h3>

After creating a GitHub App, Port securely stores:

- App ID.
- Github org name.
- Private key.
- Webhook secret.

These credentials are stored in Port's secure credential store and are never exposed in plaintext.

<h3> API Endpoints </h3>

Port provides the following API endpoints for Custom GitHub App creation:

| Endpoint                                  | Method | Description                                   |
| ----------------------------------------- | ------ | --------------------------------------------- |
| `/v1/integration/github-app-creation-url` | GET    | Gets the GitHub App creation URL and manifest |

Query parameters:

- `isSelfHostedEnterprise` (boolean): Whether the GitHub instance is Self-Hosted Enterprise.
- `githubOrgName` (string, optional): Name of the GitHub organization.
- `selfHostedEnterpriseUrl` (string, optional): GitHub Enterprise host URL.

</details>

## Using with Self-Hosted GitHub Enterprise

:::warning Deprecated
For self-hosted GitHub Enterprise instances, use [GitHub Ocean](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/installation/github-app) instead, which provides proper support for self-hosted GitHub Enterprise.
:::

The legacy method required:

1. Selecting the "Enterprise" option in the deprecated form.
2. Providing your GitHub Enterprise host URL (e.g., `github.company.com`).
3. Ensuring your GitHub Enterprise instance could reach Port's self hosted github app webhook endpoints.

:::warning Configuration limitation
When using a custom GitHub App with self-hosted GitHub Enterprise, the mapping configuration must be included as part of the repository using the `port-app-config.yml` file, and cannot be configured via Port's UI/API.

For more details on configuration options, refer to the [GitHub Ocean documentation](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/github-ocean.md).
:::

## Limitations

- Custom GitHub Apps must have all the required permissions to function properly.
- You cannot modify the permissions after creation (you would need to create a new app).
- For secure credential management, Port does not expose the raw credential values after initial creation.
- You can't identify the Github app is custom from the UI
- You can't delete the Github app from the UI, you need to delete it directly from your Github organization (https://github.com/organizations/{{GITHUB_ORG_NAME}}/settings/installations)

## Frequently Asked Questions

### What is a custom GitHub App in Port?

A custom GitHub App is a GitHub integration that you own and manage, instead of using Port's official app. **For new integrations, use [GitHub Ocean](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/installation)**, which provides custom GitHub App support via OAuth or manual setup.

### What can I use a custom GitHub App for?

Use cases include:

- **Multi-environment support**: Connect the same GitHub organization to multiple Port organizations (e.g., development/staging/production).
- **Integration scaling**: Split data ingestion by concern (e.g., one app for services, another for workflows) to reduce load and improve performance.
- **Self-hosted GitHub**: Use with GitHub Enterprise Server setups.

**All of these use cases are now supported by [GitHub Ocean](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/installation).**

### Why do I need multiple custom apps for the same GitHub organization?

GitHub only allows installing a given GitHub App once per GitHub organization. To connect multiple Port organizations to the same GitHub organization, after installing the Port Github App in the first Port organization, each additional Port organization must have its own custom GitHub App. These apps can target the same repositories but function independently, this is ideal for multi-environment rollouts or segmented pipelines.

**GitHub Ocean supports this use case with its OAuth-based custom GitHub App creation.**

### How can I connect the same Github organization to my Production and Staging instance?

- In your Production instance install the [Port Github app](/build-your-software-catalog/sync-data-to-catalog/git/github/#setup) or [GitHub Ocean](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/installation).
- In your other (Staging or Dev) instance install [GitHub Ocean](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/installation) with a custom GitHub App.
- Once completed you should see the same Github organization listed in the GitHub integration for each Port organization.

## Troubleshooting

:::warning Deprecated
If you're using the legacy custom GitHub App method, consider migrating to [GitHub Ocean](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/installation) for better support and reliability.
:::

If you encounter issues with your custom GitHub app, try the following:

- **Webhook Connection Issues**
  - Verify the webhook URL is correctly configured in the GitHub App settings.
  - Check that your GitHub instance can reach Port's webhook endpoints.
  - Review webhook delivery logs in GitHub for any failed delivery attempts.

- **Permission Problems**
  - Ensure the app has been granted all the necessary permissions.
  - Check that the app is installed on the repositories you want to monitor.
  - Verify that the correct repository events are selected.

- **Authentication Errors**
  - Ensure your Port token is valid and has not expired.
  - Verify that the app has not been uninstalled or modified in GitHub.

For additional assistance, contact Port support. For new integrations, use [GitHub Ocean](/build-your-software-catalog/sync-data-to-catalog/git/github-ocean/installation) instead.
