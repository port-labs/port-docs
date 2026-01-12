---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import IntegrationVersion from "/src/components/IntegrationVersion/IntegrationVersion"

# Automatic account discovery

<IntegrationVersion integration="aws-v3" />

We'll walk you through deploying the AWS integration with IAM user authentication to sync resources from multiple AWS accounts using CloudFormation StackSets with automatic account discovery via AWS Organizations.

## Prerequisites

Before installing the integration, ensure you have:

- [Port API credentials](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials) (`PORT_CLIENT_ID` and `PORT_CLIENT_SECRET`).
- Permissions to create IAM users and IAM roles in member accounts.
- For Helm: [Helm](https://helm.sh/docs/intro/install/) >= 3.0.0 and a Kubernetes cluster.
- For Docker: [Docker](https://www.docker.com/get-started) installed.
- AWS Organizations enabled.
- Access to your AWS Organizations management account.

## Understanding automatic account discovery

Automatic account discovery uses the Organizations API to discover all member accounts in your organization. The integration automatically finds and syncs all accounts without requiring you to list them manually.

:::info Alternative option
To manually specify which accounts to sync, see [Specify accounts](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts/iam-user/cloudformation-stackset/specify-accounts.md).
:::

### Account terminology

- **Base account**: The AWS account where your IAM user is created. This is where the integration authenticates from.
- **Management account**: Your AWS Organizations management account. This is where you deploy CloudFormation StackSets and where the Organizations API is accessible. For automatic account discovery, you need a role ARN from this account.
- **Member accounts**: All other accounts in your organization that you want to sync resources from.

The base account and management account can be the same account, or they can be different. For automatic account discovery, the role ARN must come from the management account (the account with Organizations API access).

**How it works:**
1. The integration authenticates to your base account using IAM user credentials.
2. We'll create IAM roles with `ReadOnlyAccess` in each member account using CloudFormation StackSets.
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
   - Never commit access keys to version control. Use environment variables or secret management tools to store them securely.

## Set up IAM roles

Use CloudFormation StackSets to deploy IAM roles across your AWS Organization member accounts automatically. You can target specific accounts, organizational units, or all accounts.

:::caution Management account required
Run the StackSet deployment from your AWS Organizations **management account**, as only the management account can deploy StackSets across member accounts.
:::

### Prepare your organization

We'll gather the information needed to deploy the StackSet. This includes identifying which accounts to target and preparing authentication details.

1. **Find your OU ID** (if deploying to an organizational unit):
   - Log into your AWS Organizations management account.
   - Navigate to [AWS Organizations](https://us-east-1.console.aws.amazon.com/organizations/v2/home/accounts) service.
   - Under **Organizational structure**, copy the OU ID from the details page (format `ou-xxxx-xxxxxxxx` or `r-xxxx`).
   - You can also target specific account IDs if needed.
   - **Expected outcome**: You have the OU ID or account IDs you want to target.

2. **Get your base account IAM user ARN**:
   - Go to **IAM** → **Users** in your base account (where the IAM user is created).
   - Find the IAM user we created for authentication.
   - Copy the user ARN (format: `arn:aws:iam::BASE_ACCOUNT_ID:user/USER_NAME`).
   - **Expected outcome**: You have the IAM user ARN to use in the StackSet parameters.

3. **Generate an external ID**:
   - Generate a secure external ID using: `openssl rand -hex 16`
   - Save this value - use the same external ID across all member accounts.
   - **Expected outcome**: You have a secure external ID string to use for cross-account role assumption.

### Access the CloudFormation StackSet template

We'll access the CloudFormation StackSet console to begin deployment. The StackSet template automates IAM role creation across all target accounts.

1. Go to [AWS CloudFormation StackSets](https://console.aws.amazon.com/cloudformation/home#/stacksets).
2. Note the CloudFormation StackSet template URL: [S3 template URL - coming soon].
   - **Expected outcome**: You're in the CloudFormation StackSets console and have the template URL ready.

### Deploy via AWS console

We'll create and deploy the StackSet to automatically create IAM roles in all target accounts. This eliminates the need to manually create roles in each account.

1. **Create StackSet**:
   - Click **Create StackSet**.
   - Choose **Template is ready** and provide the S3 URL for the IAM user template.
   - Click **Next**.
   - **Expected outcome**: You're on the Specify template page.

2. **Configure stack parameters**:
   - **RoleName**: Enter a consistent role name (e.g., `PortOceanReadRole`). This name must be the same across all accounts.
   - **TrustedPrincipalARN**: Enter your IAM user ARN from step 1 (e.g., `arn:aws:iam::BASE_ACCOUNT_ID:user/port-ocean-aws-v3-user`).
   - **ExternalId**: Enter the external ID you generated in step 1.
   - Click **Next**.
   - **Expected outcome**: Stack parameters are configured with your authentication details.

3. **Specify deployment targets**:
   - Choose one of the following:
     - **Deploy to organization**: Select this option, then choose the scope: **All accounts**, **All accounts except selected**, or **Selected accounts only**.
     - **Deploy to specific accounts**: Enter the OU ID you copied in step 1 (format: `ou-xxxx-xxxxxxxx` or `r-xxxx`), or enter specific account IDs.
   - Click **Next**.
   - **Expected outcome**: Target accounts are specified for deployment.

4. **Set deployment options**:
   - Configure failure tolerance and region preferences as needed.
   - Click **Next**.
   - **Expected outcome**: Deployment options are configured.

5. **Review and create**:
   - Review all settings.
   - Scroll down to the bottom of the page.
   - Check the box **"I acknowledge that AWS CloudFormation might create IAM resources with custom names"**.
   - Click **Submit**.
   - **Expected outcome**: StackSet creation is initiated and you see a confirmation message.

### Monitor deployment

We'll verify that the StackSet successfully deployed IAM roles to all target accounts. This ensures the integration can assume roles in member accounts.

1. **Check StackSet status**:
   - Go to **CloudFormation** → **StackSets** in your management account.
   - Select your StackSet.
   - Go to the **StackSet instances** tab.
   - Wait for all instances to show `SUCCEEDED` status across all target accounts.
   - **Expected outcome**: All StackSet instances show `SUCCEEDED` status.

2. **Verify IAM roles**:
   - Go to **IAM** → **Roles** in a member account and verify the role exists.
   - Verify the role has the `ReadOnlyAccess` policy attached.
   - Verify the trust policy includes your IAM user ARN and external ID.
   - **Expected outcome**: IAM roles exist in target accounts with correct permissions and trust relationships.

### Note the role ARN

Get the role ARN from your management account. For automatic account discovery, you only need this one role ARN. The integration uses it to discover member accounts and assume roles automatically.

1. **Get the management account role ARN**:
   - Format: `arn:aws:iam::ORG_ACCOUNT_ID:role/ROLE_NAME`
   - Replace `ORG_ACCOUNT_ID` with your management account ID and `ROLE_NAME` with the role name you specified (e.g., `PortOceanReadRole`).
   - Example: `arn:aws:iam::123456789012:role/PortOceanReadRole`
   - **Expected outcome**: You have the management account role ARN ready to use in the integration configuration.

## Deploy the integration

Choose your deployment method:

<Tabs groupId="deployment-method" queryString="deployment-method" defaultValue="helm">

<TabItem value="helm" label="Helm (Scheduled)">

Deploy the AWS integration using Helm on your Kubernetes cluster. This deployment supports scheduled resyncs of resources from AWS to Port.

:::info Organization account role
The `accountRoleArn` in automatic account discovery mode should reference the role in your **organization/management account** (the account with Organizations API access), not a member account role. This role is used to discover accounts and then assume roles in member accounts.
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
