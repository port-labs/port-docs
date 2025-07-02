---
sidebar_position: 6
---

import FindCredentials from "/docs/build-your-software-catalog/custom-integration/api/\_template_docs/\_find_credentials.mdx"

# Self Hosted Installation

:::note Prerequisites

- A registered organization in Port;
- Your Port user role is set to `Admin`.

:::

In organizations that have a self-hosted GitHub installation there is no access to our official public app, therefore there are some extra steps you need to take to install the GitHub integration:

1. [Register](#register-ports-github-integration) Port's GitHub integration in your GitHub organization;
2. [Deploy](#deployment) Port's GitHub integration Docker image inside your VPC;
3. [Install](#installing-ports-github-integration) Port's GitHub integration in your GitHub organization and on select repositories.

## Register Port's GitHub integration

1. Navigate to your organization inside your self-hosted GitHub and click on Settings:

![Org view](../../../../../static/img/integrations/github-app/SelfHostedOrganizaionView.png)

2. Inside the settings view, click on **Developer Settings** -> and then select **GitHub Apps**:

![Settings view](../../../../../static/img/integrations/github-app/SelfHostedOrganizationSettings.png)

3. Click on "New GitHub App":

![New GitHub App](../../../../../static/img/integrations/github-app/SelfHostedNewGitHubApp.png)

4. Insert the following properties:

- **GitHub App name:** port.io
- **Homepage URL:** https://getport.io
- **Setup URL:** https://app.getport.io
- **Repository Permissions:**
  - Actions: Read and Write (for executing self-service action using GitHub workflow)
  - Checks: Read and Write (for validating `Port.yml`)
  - Contents: Readonly (for reading port configuration files and repository files)
  - Metadata: Readonly
  - Issues: Readonly
  - Pull Request: Read and Write
  - Dependabot alerts: Readonly
  - code scanning alerts: Readonly
  - Administration: Readonly (for syncing github teams)
- **Organization Permissions:**
  - Members: Readonly (for syncing github teams)
  - Webhooks: Read and Write (to allow the integration create webhooks)
- **Repository Events** (required to receive webhook changes from GitHub):
  - Issues
  - Pull Request
  - Push
  - Workflow Run
  - Team
  - Dependabot alerts

Then select "Create GitHub App"

5. Go to the settings of the created GitHub app and generate a private key. Save the downloaded file:

![Generate Private key](../../../../../static/img/integrations/github-app/SelfHosetdGeneratePrivayKey.png)

Keep the file, you will need it for the deployment step.

## Deployment

:::note Prerequisites

You will need your Port `CLIENT_ID` and `CLIENT_SECRET`.

<FindCredentials/>

:::

In order to make use of [Self-Service Actions using GitHub Workflow](../../../../actions-and-automations/setup-backend/github-workflow/github-workflow.md), please contact us at support@getport.io.

## Docker

To use our GitHub integration, you will need to deploy our official integration Docker image, replacing the GitHub personal access token with an App ID and App private key.

It can be deployed on any platform that allows deploying images as containers such as: K8S, ECS, AWS App Runner, etc.

You can pull the Docker image by running:

```bash showLineNumbers
docker pull ghcr.io/port-labs/port-ocean-github-ocean:0.5.0-dev
```

Run the following command to start the app:

```bash showLineNumbers
docker run \
  -e OCEAN__INTEGRATION__CONFIG__GITHUB_APP_ID=<Github APP ID> \
  -e OCEAN__INTEGRATION__CONFIG__WEBHOOK_SECRET="test" \
  -e OCEAN__INTEGRATION__CONFIG__GITHUB_HOST=<GH BASE URL ie github.compay.com> \
  -e OCEAN__BASE_URL=https://test.com \
  -e OCEAN__PORT__BASE_URL=https://api.getport.io \
  -e OCEAN__PORT__CLIENT_ID=<PORT CLIENT ID> \
  -e OCEAN__PORT__CLIENT_SECRET=<PORT CLIENT SECRET> \
  -e OCEAN__INTEGRATION__IDENTIFIER=github-ocean \
  -e OCEAN__EVENT_LISTENER__TYPE=POLLING \
  -e OCEAN__INTEGRATION__CONFIG__GITHUB_ORGANIZATION=<Github Organization> \
  -e OCEAN__INTEGRATION__CONFIG__GITHUB_APP_PRIVATE_KEY=<BASE 64 PRIVATEKEY> \
  -p 8000:8000 \
  ghcr.io/port-labs/port-ocean-github-ocean:0.5.0-dev
```

| Env variable                                         | Description                                                                         |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `OCEAN__INTEGRATION__CONFIG__GITHUB_APP_ID`          | Application ID. You can find it in the edit GitHub Integration page.                |
| `OCEAN__INTEGRATION__CONFIG__WEBHOOK_SECRET`         | Will be used to create webhook                                                      |
| `OCEAN__INTEGRATION__IDENTIFIER`                     | Your organization's self-hosted GitHub hostname                                     |
| `OCEAN__BASE_URL`                                    | Integration base url, will be used to register webhook.                             |
| `OCEAN__PORT__BASE_URL`                              | Port's API Base URL                                                                 |
| `OCEAN__PORT__CLIENT_ID`                             | Port client id for interacting with the API                                         |
| `OCEAN__PORT__CLIENT_SECRET`                         | Port client secret for interacting with the API                                     |
| `OCEAN__INTEGRATION__IDENTIFIER`                     | Identifier for the integration                                                      |
| `OCEAN__EVENT_LISTENER__TYPE`                        | How Ocean will retrieve config changes from Port.                                   |
| `OCEAN__INTEGRATION__CONFIG__GITHUB_ORGANIZATION`    | The GitHub organization the integration was installed in.                           |
| `OCEAN__INTEGRATION__CONFIG__GITHUB_APP_PRIVATE_KEY` | A base64 encoded private key. You can use a tool like https://www.base64encode.org/ |

## Health check route

A health check is a route that is used to check the health of a repository. It is a means to ensure that the service is running properly and can perform its intended function.

Our GitHub integration image exposes a health check route at `https://host:port/health` to monitor its status.

## Installing Port's GitHub integration

After you have the integration registered in your organization and the Docker is up and running, you can install the integration and select the repositories to integrate it with:

1. First, navigate to your organization inside your self-hosted GitHub and click on Settings:

![Org view](../../../../../static/img/integrations/github-app/SelfHostedOrganizaionView.png)

2. Inside the settings view, click on Developer Settings -> and then select GitHub Integrations:

![Settings view](../../../../../static/img/integrations/github-app/SelfHostedOrganizationSettings.png)

3. Click `edit` on the GitHub integration created at the step before:

![GitHub integration installation page](../../../../../static/img/integrations/github-app/SelfHostedEditGitHubApp.png)

4. Go to Install App -> and select the installation button on your wanted organization;

5. Choose the repositories you want the integration to be installed for:

![GitHub integration installation chooses repositories](../../../../../static/img/integrations/github-app/SelfHostedInstallationRepoSelection.png)

## Limitations

As this is a self-hosted version, there are some limitations due to security considerations and the fact that we don't have access to your GitHub instance

- The configuration must be included as part of the repository, and cannot be configured via Port's UI/API. Refer to the [GitHub Configuration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/?method=github#configuration) for more details.

- To use self-service actions, you will need [Kafka Credentials](/actions-and-automations/setup-backend/webhook/kafka/kafka.md) configured for your organization;
