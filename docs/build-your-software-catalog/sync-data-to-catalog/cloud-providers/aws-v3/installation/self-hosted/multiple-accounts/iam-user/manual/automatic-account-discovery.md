---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import IntegrationVersion from "/src/components/IntegrationVersion/IntegrationVersion"

# Automatic account discovery

<IntegrationVersion integration="aws-v3" />

We'll walk you through deploying the AWS integration with IAM user authentication to sync resources from multiple AWS accounts by manually creating IAM roles in each member account and using automatic account discovery via AWS Organizations.

## Prerequisites

Before installing the integration, ensure you have:

- [Port API credentials](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials) (`PORT_CLIENT_ID` and `PORT_CLIENT_SECRET`).
- Permissions to create IAM users and IAM roles in member accounts.
- For Helm: [Helm](https://helm.sh/docs/intro/install/) >= 3.0.0 and a Kubernetes cluster.
- For Docker: [Docker](https://www.docker.com/get-started) installed.
- AWS Organizations enabled.

## Understanding automatic account discovery

Automatic account discovery uses the Organizations API to discover all member accounts in your organization. The integration automatically finds and syncs all accounts without requiring you to list them manually.

:::info Alternative option
To manually specify which accounts to sync, see [Specify accounts](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts/iam-user/manual/specify-accounts.md).
:::

### Account terminology

- **Base account**: The AWS account where your IAM user is created. This is where the integration authenticates from.
- **Management account**: Your AWS Organizations management account. This is where the Organizations API is accessible. For automatic account discovery, you need a role ARN from this account.
- **Member accounts**: All other accounts in your organization that you want to sync resources from.

The base account and management account can be the same account, or they can be different. For automatic account discovery, the role ARN must come from the management account (the account with Organizations API access).

**How it works:**
1. The integration authenticates to your base account using IAM user credentials.
2. We'll create IAM roles with `ReadOnlyAccess` in each member account manually.
3. Each member account's role trusts your base IAM user to assume it.
4. The integration uses the Organizations API to discover all member accounts.
5. For each discovered account, it calls `AssumeRole` to get temporary credentials.
6. With those credentials, it reads resources and syncs them to Port.

:::tip External ID
External ID is a security feature required for cross-account access when using IAM user authentication. It's a secret value that both parties must know when assuming roles, preventing the [confused deputy problem](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-user_externalid.html).
:::

## Set up IAM user

1. [Create an IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) with the following permissions:
   - Attach the `arn:aws:iam::aws:policy/ReadOnlyAccess` policy.
   - Create and attach an inline policy with `sts:AssumeRole` permission:

```json showLineNumbers
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sts:AssumeRole"
      ],
      "Resource": "*"
    }
  ]
}
```

2. [Generate access keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) for the user:
   - Go to **IAM → Users → Security credentials → Create access key**.
   - Save the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

:::caution Secure your credentials
Never commit access keys to version control. Use environment variables or secret management tools to store them securely.
:::

## Set up cross-account IAM roles manually

Create IAM roles manually in each member account you want to sync.

### Generate an external ID

Generate a secure external ID using:

```bash showLineNumbers
openssl rand -hex 16
```

Save this value - use the same external ID across all member accounts.

### Create IAM role in each member account

Create an IAM role with this trust policy:

```json showLineNumbers
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::BASE_ACCOUNT_ID:user/port-ocean-aws-v3-user"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "YOUR_EXTERNAL_ID"
        }
      }
    }
  ]
}
```

Replace:
- `BASE_ACCOUNT_ID`: The account where your integration runs (where you created the IAM user).
- `YOUR_EXTERNAL_ID`: The external ID you generated in step 1.

### Attach permissions

Attach the AWS managed `ReadOnlyAccess` policy:

```bash showLineNumbers
aws iam attach-role-policy \
  --role-name PortOceanReadRole \
  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
```

### Note the role ARN

For Organizations mode, you only need the role ARN from your **management account** (not member accounts). The integration will discover member accounts and assume roles automatically.

Copy the role ARN from your management account:

```
arn:aws:iam::ORG_ACCOUNT_ID:role/PortOceanReadRole
```

## Deploy the integration

Choose your deployment method:

<Tabs groupId="deployment-method" queryString="deployment-method" defaultValue="helm">

<TabItem value="helm" label="Helm (Scheduled)">

Deploy the AWS integration using Helm on your Kubernetes cluster. This deployment supports scheduled resyncs of resources from AWS to Port.

:::info Organization account role
The `accountRoleArn` in Organizations mode should reference the role in your **organization/management account** (the account with Organizations API access), not a member account role. This role is used to discover accounts and then assume roles in member accounts.
:::

Deploy the integration:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install aws-v3 port-labs/port-ocean \
  --create-namespace --namespace port-ocean \
  --set port.clientId="$PORT_CLIENT_ID" \
  --set port.clientSecret="$PORT_CLIENT_SECRET" \
  --set port.baseUrl="https://api.getport.io" \
  --set initializePortResources=true \
  --set scheduledResyncInterval=1440 \
  --set integration.identifier="my-aws-v3-org" \
  --set integration.type="aws-v3" \
  --set integration.eventListener.type="POLLING" \
  --set integration.secrets.awsAccessKeyId="$AWS_ACCESS_KEY_ID" \
  --set integration.secrets.awsSecretAccessKey="$AWS_SECRET_ACCESS_KEY" \
  --set integration.config.accountRoleArn="arn:aws:iam::ORG_ACCOUNT_ID:role/port-ocean-aws-v3-role" \
  --set integration.config.externalId="YOUR_EXTERNAL_ID"
```

</TabItem>

<TabItem value="docker" label="Docker (One-time)">

For one-time data synchronization or testing, you can run the integration using Docker.

Run the Docker container:

```bash showLineNumbers
docker run -i --rm --platform=linux/amd64 \
  -e OCEAN__PORT__CLIENT_ID="$PORT_CLIENT_ID" \
  -e OCEAN__PORT__CLIENT_SECRET="$PORT_CLIENT_SECRET" \
  -e OCEAN__PORT__BASE_URL="https://api.getport.io" \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
  -e OCEAN__INTEGRATION__IDENTIFIER="my-aws-v3-org" \
  -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
  -e OCEAN__INTEGRATION__SECRETS__AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
  -e OCEAN__INTEGRATION__SECRETS__AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
  -e OCEAN__INTEGRATION__CONFIG__ACCOUNT_ROLE_ARN="arn:aws:iam::ORG_ACCOUNT_ID:role/port-ocean-aws-v3-role" \
  -e OCEAN__INTEGRATION__CONFIG__EXTERNAL_ID="YOUR_EXTERNAL_ID" \
  ghcr.io/port-labs/port-ocean-aws-v3:latest
```

</TabItem>

</Tabs>

<PortApiRegionTip/>

## Troubleshooting

### Common installation issues

**Error**: `Unable to assume role`

**Solutions**:
- Verify the IAM role ARN is correct.
- Ensure the trust policy allows your IAM user to assume the role.
- Check that the `externalId` matches on both sides (if configured).
- Verify the IAM user has `sts:AssumeRole` permission.

**Error**: `No resources discovered`

**Solutions**:
- Verify the IAM roles in member accounts have `ReadOnlyAccess` policy attached.
- Check that the regions you want to query are not blocked by `regionPolicy`.
- Ensure the integration has network access to AWS APIs.

**Error**: `Access denied to Organizations API`

**Solutions**:
- Verify the IAM user has `ReadOnlyAccess` policy attached (which includes Organizations API access).
- Verify AWS Organizations is enabled in your management account.
- Check that you're using the correct account (management or delegated administrator).

**Error**: `Docker container exits immediately` (Docker only)

**Solutions**:
- Check Docker logs for error messages.
- Verify all required environment variables are set.
- Ensure the Port API credentials are valid.
