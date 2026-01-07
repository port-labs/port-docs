---
displayed_sidebar: null
description: Learn how to create and manage AWS Secrets Manager secrets from Port using a self-service action with a webhook backend.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Create an AWS secret

This guide demonstrates how to implement a self-service action in Port that allows you to create and manage [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) secrets directly from Port using a webhook backend.

## Common use cases

- **Secrets Management**: Securely store and manage database passwords, API keys, and other credentials.
- **Environment Configuration**: Manage environment-specific secrets across different AWS regions.
- **Developer Productivity**: Enable developers to create secrets without requiring direct AWS console access.
- **Security Compliance**: Centralize secret creation with proper approval workflows and audit trails.

## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to an AWS account with permissions to manage Secrets Manager.
- AWS credentials (Access Key ID and Secret Access Key) with appropriate permissions.
- A server or container environment to run the webhook service (Node.js, Docker, or AWS Lambda).
- Port Client ID and Client Secret ([learn more](/build-your-software-catalog/custom-integration/api/#get-api-token)).

## Set up the webhook backend

This guide uses a standalone webhook service that handles the secret creation in AWS. The service is available at [port-experimental/aws-secret-manager](https://github.com/port-experimental/aws-secret-manager).

### Clone the repository

```bash showLineNumbers
git clone https://github.com/port-experimental/aws-secret-manager.git
cd aws-secret-manager
```

### Install dependencies

```bash showLineNumbers
yarn install
```

### Configure environment variables

Create a `.env` file with the following configuration:

```bash showLineNumbers
# Port Configuration
PORT_CLIENT_ID=your-port-client-id
PORT_CLIENT_SECRET=your-port-client-secret

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key

# Webhook Server
WEBHOOK_PORT=3000
WEBHOOK_PATH=/webhook

# Webhook Security (Recommended for Production)
WEBHOOK_SECRET=your-port-client-secret
```

:::tip AWS credentials
For temporary credentials (from AWS SSO, STS, or IAM roles), you also need to provide `AWS_SESSION_TOKEN`. Temporary credentials are identified by an access key starting with `ASIA`.
:::

### Required IAM permissions

The service requires the following AWS IAM permissions:

```json showLineNumbers
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:CreateSecret",
        "secretsmanager:UpdateSecret",
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret"
      ],
      "Resource": "*"
    }
  ]
}
```

### Run the service

<Tabs groupId="deployment" queryString="deployment">

<TabItem value="nodejs" label="Node.js">

```bash showLineNumbers
yarn start
```

The server will start on port 3000 (or the port specified in `WEBHOOK_PORT`).

</TabItem>

<TabItem value="docker" label="Docker">

```bash showLineNumbers
# Build the image
docker build -t aws-secrets-ssa .

# Run the container
docker run -d \
  --name aws-secrets-ssa \
  -p 3000:3000 \
  --env-file .env \
  aws-secrets-ssa
```

</TabItem>

<TabItem value="docker-compose" label="Docker Compose">

```bash showLineNumbers
docker-compose up -d
```

</TabItem>

</Tabs>

### Expose the webhook (for local development)

If you are running the service locally, you can use [ngrok](https://ngrok.com/download) to expose it to the internet:

```bash showLineNumbers
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://c9ca081ce7d3.ngrok-free.app`). Your webhook URL will be `https://c9ca081ce7d3.ngrok-free.app/webhook`.

:::warning Production deployment
For production use, deploy the service to a server with a static URL or use a cloud service like AWS Lambda, ECS, or Kubernetes.
:::

## Set up data model

To represent AWS secrets in your Port catalog, we will create a dedicated blueprint.

### Create the AWS secret blueprint

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.

2. Click on **+ Blueprint**.

3. Click on the `{...}` button in the top right corner, and choose **Edit JSON**.

4. Add this JSON schema:

<details>
<summary><b>AWS Secret blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "awsSecret",
  "title": "AWS Secret",
  "icon": "AWS",
  "schema": {
    "properties": {
      "description": {
        "type": "string",
        "title": "Description",
        "description": "Description of the secret"
      },
      "region": {
        "type": "string",
        "title": "AWS Region",
        "description": "AWS region where the secret is stored"
      },
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Created At",
        "description": "When the secret was created"
      },
      "lastUpdatedAt": {
        "type": "string",
        "format": "date-time",
        "title": "Last Updated At",
        "description": "When the secret was last updated"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</details>

5. Click **Save** to create the blueprint.

## Create the self-service action

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.

2. Click on **+ New action**.

3. Click on the `{...}` button in the top right corner, and choose **Edit JSON**.

4. Add this JSON schema:

<details>
<summary><b>Create AWS secret action (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "create_aws_secret",
  "title": "Create AWS Secret",
  "icon": "AWS",
  "description": "Create or update a secret in AWS Secrets Manager",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "secretName": {
          "type": "string",
          "title": "Secret Name",
          "description": "Name of the AWS secret (e.g., myapp/database/password)"
        },
        "secretValue": {
          "type": "string",
          "title": "Secret Value",
          "description": "Secret value (can be JSON string for complex secrets)",
          "encryption": "aes256-gcm"
        },
        "operation": {
          "type": "string",
          "title": "Operation",
          "enum": ["create", "update", "upsert"],
          "default": "upsert",
          "description": "create: only create new secret, update: only update existing, upsert: create or update"
        },
        "description": {
          "type": "string",
          "title": "Description",
          "description": "Optional description for the secret"
        },
        "region": {
          "type": "string",
          "title": "AWS Region",
          "default": "us-east-1",
          "description": "AWS region where the secret will be stored"
        }
      },
      "required": ["secretName", "secretValue"],
      "order": ["secretName", "secretValue", "operation", "description", "region"]
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://your-webhook-url.com/webhook",
    "synchronized": true,
    "method": "POST"
  }
}
```

</details>

5. Replace `https://your-webhook-url.com/webhook` with your actual webhook URL.

6. Click **Save** to create the action.

:::tip Synchronized actions
The action is configured with `synchronized: true`, which ensures that the webhook processes the request and returns the result before marking the action as complete. This provides accurate success/failure reporting in Port.
:::

## Test the action

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.

2. Click on the **Create AWS Secret** action.

3. Fill in the form:
   - **Secret Name**: `myapp/database/password`
   - **Secret Value**: `my-secret-password-123`
   - **Operation**: `upsert`
   - **Description**: `Database password for myapp`
   - **AWS Region**: `us-east-1`

4. Click **Execute**.

5. The action will create the secret in AWS Secrets Manager and report the status back to Port.

## Usage examples

### Simple string secret

```json showLineNumbers
{
  "secretName": "myapp/database/password",
  "secretValue": "my-secret-password-123",
  "operation": "upsert"
}
```

### JSON secret

```json showLineNumbers
{
  "secretName": "myapp/config",
  "secretValue": "{\"database\": {\"host\": \"db.example.com\", \"port\": 5432}}",
  "operation": "upsert"
}
```

## Next steps

- **Enable entity creation**: Configure the webhook to automatically create entities in Port by setting `PORT_CREATE_ENTITY=true` in your environment variables.
- **Add approval workflows**: Configure the action to require [manual approval](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/#configure-manual-approval-for-actions) before execution.
- **Set up notifications**: Use [automations](/actions-and-automations/define-automations/) to notify stakeholders when secrets are created or updated.
