---
sidebar_position: 6
---

import FindCredentials from "/docs/build-your-software-catalog/custom-integration/api/\_template_docs/\_find_credentials.mdx"
import GithubAppCreator from '@site/src/components/GithubAppCreator';

# Custom GitHub App

:::note Prerequisites

- A registered organization in Port
- Your Port user role is set to `Admin`
- Access to Port's API credentials
- Admin permissions in your GitHub organization

:::

## Overview

Port's Custom GitHub App feature allows you to create and manage your own GitHub applications. This provides more granular control over integrations, especially useful for organizations with complex GitHub setups.

There are three primary ways to connect Port to your GitHub repositories:

1. **Port's official GitHub app** - The simplest option for most users
2. **Custom GitHub App** - For advanced use cases or self-hosted GitHub installations

This guide covers the Custom GitHub App approach.

## Benefits of Custom GitHub Apps

- **Workspace Isolation**: Each team can have their own GitHub App with specific repository access
- **Enhanced Security**: Better permission boundaries between different teams and projects
- **Multi-Organization Support**: Same GitHub organizations can be integrated with multiple Port organization
- **Self-Hosted Support**: Works with both cloud and self-hosted GitHub Enterprise instances
- **Custom Configuration**: Create tailored integration setups for specific use cases

## Required Permissions

Custom GitHub Apps must be configured with the following minimum permissions:

### Repository Permissions
- **Actions**: Read and Write (for executing self-service action using GitHub workflow)
- **Checks**: Read and Write (for validating `Port.yml`)
- **Contents**: Readonly (for reading port configuration files and repository files)
- **Metadata**: Readonly
- **Issues**: Readonly
- **Pull Request**: Read and Write
- **Dependabot alerts**: Readonly
- **Administration**: Readonly (for syncing github teams)

### Organization Permissions
- **Members**: Readonly (for syncing github teams)

### Repository Events
- Issues
- Pull Request
- Push
- Workflow Run
- Team
- Dependabot alerts

## Creating a Custom GitHub App

There are two approaches to create a custom GitHub App:

### Using Port's API

:::tip
You'll need your Port API credentials for this process:

<FindCredentials/>
:::

#### API Workflow

1. Make a GET request to the GitHub App creation URL endpoint:
   ```
   https://api.getport.io/v1/integration/github-app-creation-url
   ```

2. Include the following query parameters:
   - `isEnterprise=false` (set to `true` for GitHub Enterprise)
   - `githubOrgName=YOUR_ORG_NAME` (replace with your GitHub organization name)

3. Add your Port authentication token in the Authorization header:
   ```
   Authorization: Bearer YOUR_TOKEN
   ```

4. The response will contain a `url` and a `manifest` object that defines your app's permissions and configuration
5. Submit the manifest to the URL to create your GitHub App

For your convenience, you can use the form below to generate a GitHub App:

<GithubAppCreator />

## Technical Details

### GitHub App Manifest

The GitHub App manifest is a JSON configuration file that defines:

- App name and description
- Webhook URL and events
- Required permissions
- Callback URLs
- Other configuration parameters

Port generates this manifest automatically based on best practices, ensuring the app has the correct permissions for integration with Port.

### Credential Storage

After creating a GitHub App, Port securely stores:

- App ID
- Github org name
- Private key
- Webhook secret

## Installing Your Custom GitHub App

After creating the GitHub App, you need to install it in your GitHub organization:

1. You'll be redirected to the GitHub App installation page
2. Select the repositories you want the app to have access to
3. Confirm the installation
4. You'll be redirected back to Port with a success indication

## Limitations

- Custom GitHub Apps must have all the required permissions to function properly
- You cannot modify the permissions after creation (you would need to create a new app)
- For secure credential management, Port does not expose the raw credential values after initial creation
- Self-hosted GitHub Enterprise instances require additional network configuration

## Troubleshooting

If you encounter issues with your Custom GitHub App:

1. **Webhook Connection Issues**
   - Verify the webhook URL is correctly configured in the GitHub App settings
   - Check that your GitHub instance can reach Port's webhook endpoints
   - Review webhook delivery logs in GitHub for any failed delivery attempts

2. **Permission Problems**
   - Ensure the app has been granted all the necessary permissions
   - Check that the app is installed on the repositories you want to monitor
   - Verify that the correct repository events are selected

3. **Authentication Errors**
   - Ensure your Port token is valid and has not expired
   - Verify that the app has not been uninstalled or modified in GitHub

For additional assistance, contact Port support at support@getport.io.

## API Endpoints

Port provides the following API endpoints for Custom GitHub App creation:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/integration/github-app-creation-url` | GET | Gets the GitHub App creation URL and manifest |

Query parameters:
- `isEnterprise` (boolean): Whether the GitHub instance is Enterprise
- `githubOrgName` (string, optional): Name of the GitHub organization