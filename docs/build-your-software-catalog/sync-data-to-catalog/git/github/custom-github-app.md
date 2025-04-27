---
sidebar_position: 6
---

import FindCredentials from "/docs/build-your-software-catalog/custom-integration/api/\_template_docs/\_find_credentials.mdx"
import GithubAppCreator from '@site/src/components/GithubAppCreator';

# Custom GitHub App

## Overview

Port's Custom GitHub App feature allows you to create and manage your own GitHub applications.  
This provides more granular control over integrations, and is especially useful for organizations with complex GitHub setups.

There are two primary ways to connect Port to your GitHub repositories:

1. **Port's official GitHub app** - The simplest option for most users.
2. **Custom GitHub app** - For advanced use cases, self-hosted GitHub installations, or to connect a GitHub organization when the GitHub app is already installed in another Port organization.
This guide covers the second approach.

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

Use the form below to create your own GitHub App and connect it to Port:

<GithubAppCreator />

Creating an app involves the following steps:

1. **Enter information**: Provide your GitHub organization name and Port authentication token.
2. **Select region**: Choose the appropriate region for your Port organization.
3. **Create the app**: Port generates a GitHub App manifest with all the required permissions.
4. **Authorize on GitHub**: You'll be redirected to GitHub to review and create the app.
5. **Install the app**: Select which repositories to give the app access to.
6. **Complete installation**: Confirm the installation in GitHub.
7. **Return to Port**: You'll be redirected back to Port's data sources page.

That's it! Your Custom GitHub App is now created and connected to your Port organization.

<details>
<summary>Use Port's API instead</summary>

If you prefer to use Port's API directly:

1. Make a GET request to the GitHub App creation URL endpoint:
   ```
   https://api.getport.io/v1/integration/github-app-creation-url
   ```

2. Include the following query parameters:
   - `isSelfHostedEnterprise=false` (set to `true` for GitHub Enterprise).
   - `githubOrgName=YOUR_ORG_NAME` (replace with your GitHub organization name).
   - `selfHostedEnterpriseUrl=YOUR_GH_ENTERPRISE_URL` (replace with your self hosted github enterprise url).
3. Add your Port authentication token in the Authorization header:
   ```
   Authorization: Bearer YOUR_TOKEN
   ```

4. The response will contain a `url` and a `manifest` object.
5. Submit the manifest to the URL to create your GitHub App.

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

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/integration/github-app-creation-url` | GET | Gets the GitHub App creation URL and manifest |

Query parameters:
- `isSelfHostedEnterprise` (boolean): Whether the GitHub instance is Self-Hosted Enterprise.
- `githubOrgName` (string, optional): Name of the GitHub organization.
- `selfHostedEnterpriseUrl` (string, optional): GitHub Enterprise host URL.

</details>

## Using with Self-Hosted GitHub Enterprise

For self-hosted GitHub Enterprise instances, additional configuration is required:

1. Select the "Enterprise" option in the form above.
2. Provide your GitHub Enterprise host URL (e.g., `github.company.com`).
3. Your GitHub Enterprise instance must be able to reach Port's self hosted github app webhook endpoints.

## Limitations

- Custom GitHub Apps must have all the required permissions to function properly.
- You cannot modify the permissions after creation (you would need to create a new app).
- For secure credential management, Port does not expose the raw credential values after initial creation.
- You can't identify the Github app is custom from the UI
- You can't delete the Github app from the UI, you need to delete it directly from your Github organization (https://github.com/organizations/{{GITHUB_ORG_NAME}}/settings/installations)

## Frequently Asked Questions

### What is a custom GitHub App in Port?

A custom GitHub App is a GitHub integration that you own and manage, instead of using Port's official app. Port provides a manifest and handles the setup, but the app is registered under your GitHub account/organization. This gives you more control, flexibility, and scalability—especially when working with multiple Port environments or large-scale setups.

### What can I use a custom GitHub App for?

Use cases include:
- **Multi-environment support**: Connect the same GitHub organization to multiple Port organizations (e.g., development/staging/production).
- **Integration scaling**: Split data ingestion by concern (e.g., one app for services, another for workflows) to reduce load and improve performance.
- **Self-hosted GitHub**: Use with GitHub Enterprise Server setups.

### Why do I need multiple custom apps for the same GitHub organization?

GitHub only allows installing a given GitHub App once per GitHub organization. To connect multiple Port organizations to the same GitHub organization, after installing the Port Github App in the first Port organization, each additional Port organization must have its own custom GitHub App. These apps can target the same repositories but function independently, this is ideal for multi-environment rollouts or segmented pipelines.

### How can I connect the same Github organization to my Production and Staging instance?

- In your Production instance install the [Port Github app](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/#setup).
- In your other (Staging or Dev) instance install the custom Github app as described on this page.
- Once completed you should see the same Github organization listed in the Github Exporter for each Port organization.

## Troubleshooting

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

For additional assistance, contact Port support.
