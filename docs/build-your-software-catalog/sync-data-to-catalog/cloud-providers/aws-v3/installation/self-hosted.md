---
sidebar_position: 2
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import IntegrationVersion from "/src/components/IntegrationVersion/IntegrationVersion"

# Self-hosted installation

<IntegrationVersion integration="aws-v3" />

This guide will walk you through deploying the AWS integration in your own infrastructure. For a fully managed experience with zero maintenance, see the [hosted by Port installation](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/hosted-by-port.md).

## Prerequisites

Before installing the integration, ensure you have:

- [Port API credentials](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials) (`PORT_CLIENT_ID` and `PORT_CLIENT_SECRET`).
- AWS account(s) that you want to sync resources from.
- Permissions to create IAM roles/users and deploy infrastructure.

## Permissions

To get Port API credentials, see the [Port API documentation](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials).

In order to successfully deploy the AWS integration, ensure that the user who deploys the integration has the appropriate access permissions to create all of the relevant resources (IAM roles/users, Kubernetes resources, or Docker containers).

:::tip Multiple account support
To enable multiple accounts for the integration:

1. Complete the authentication setup in your chosen deployment method below.
2. Follow the [multi-account setup guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/multi-account-setup.md) to configure cross-account IAM roles.
3. Configure your deployment with the multi-account settings from the guide.
:::

## Choose your deployment method

Select the deployment method that best fits your infrastructure:

<Tabs groupId="installation-methods" queryString="installation-methods" defaultValue="helm">

<TabItem value="helm" label="Helm (Scheduled)">

Deploy the AWS integration using Helm on your Kubernetes cluster. This deployment supports scheduled resyncs of resources from AWS to Port.

<h2>Prerequisites</h2>

- [Helm](https://helm.sh/docs/intro/install/) >= 3.0.0.
- Kubernetes cluster to deploy the integration.

<h2>IAM user</h2>

Set up an IAM user for authentication:

1. [Create an IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) with the following permissions:
   - `arn:aws:iam::aws:policy/ReadOnlyAccess`
   - For multi-account setups, create and attach an inline policy with `sts:AssumeRole` permission. See the [multi-account setup guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/multi-account-setup.md) for details.

2. [Generate access keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) for the user:
   - Go to **IAM → Users → Security credentials → Create access key**.
   - Save the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

:::caution Secure your credentials
Never commit access keys to version control. Use environment variables or secret management tools to store them securely.
:::

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install aws-v3 port-labs/port-ocean \
  --create-namespace --namespace port-ocean \
  --set port.clientId="$PORT_CLIENT_ID" \
  --set port.clientSecret="$PORT_CLIENT_SECRET" \
  --set port.baseUrl="https://api.getport.io" \
  --set initializePortResources=true \
  --set sendRawDataExamples=true \
  --set scheduledResyncInterval=1440 \
  --set integration.identifier="my-aws-v3" \
  --set integration.type="aws-v3" \
  --set integration.eventListener.type="POLLING" \
  --set integration.config.awsAccessKeyId="$AWS_ACCESS_KEY_ID" \
  --set integration.config.awsSecretAccessKey="$AWS_SECRET_ACCESS_KEY"
```

<h2>IRSA</h2>

Set up [IRSA](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) for authentication:

1. **Create an IAM role** with the following configuration:
   - Go to **AWS Console → IAM → Roles → Create role**.
   - Select **Web identity** as the trust entity type.
   - Choose your EKS cluster's OIDC provider as the identity provider.
   - Set the audience to `sts.amazonaws.com`.
   - Name the role `port-ocean-aws-v3-role`.

2. **Attach permissions**:
   - Attach the `arn:aws:iam::aws:policy/ReadOnlyAccess` policy.
   - For multi-account setups, create and attach an inline policy with `sts:AssumeRoleWithWebIdentity` permission. See the [multi-account setup guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/multi-account-setup.md) for details.

3. **Note the role ARN** - you'll need it later: `arn:aws:iam::ACCOUNT_ID:role/port-ocean-aws-v3-role`

4. **Create a Kubernetes service account** and link it to the IAM role:

```bash showLineNumbers
# Create the namespace (if it doesn't exist)
kubectl create namespace port-ocean

# Create the service account
kubectl create serviceaccount port-ocean-aws-v3 -n port-ocean

# Annotate it with your IAM role ARN
kubectl annotate serviceaccount port-ocean-aws-v3 \
  eks.amazonaws.com/role-arn=arn:aws:iam::ACCOUNT_ID:role/port-ocean-aws-v3-role \
  -n port-ocean
```

Refer to the [AWS guide for associating an IAM role to a service account](https://docs.aws.amazon.com/eks/latest/userguide/associate-service-account-role.html).

Deploy the integration with the following configuration:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install aws-v3 port-labs/port-ocean \
  --create-namespace --namespace port-ocean \
  --set port.clientId="$PORT_CLIENT_ID" \
  --set port.clientSecret="$PORT_CLIENT_SECRET" \
  --set port.baseUrl="https://api.getport.io" \
  --set initializePortResources=true \
  --set sendRawDataExamples=true \
  --set scheduledResyncInterval=1440 \
  --set integration.identifier="my-aws-v3" \
  --set integration.type="aws-v3" \
  --set integration.eventListener.type="POLLING" \
  --set podServiceAccount.name="port-ocean-aws-v3" \
  --set integration.config.accountRoleArns='["arn:aws:iam::ACCOUNT_ID:role/port-ocean-aws-v3-role"]'
```

<h2>Multiple account support</h2>

To run the AWS integration using helm with multiple accounts, ensure you have the following. See the [multi-account setup guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/multi-account-setup.md) for detailed setup instructions:

1. An organization role ARN (for Organizations mode) or a list of role ARNs (for explicit list mode).
2. A role with Read permissions set-up across your AWS accounts.
3. IRSA or a user with the previous read-permissions role bound to them.

Run the integration with one of the following configurations:

<Tabs groupId="multi-account-strategy-helm" queryString="multi-account-strategy-helm" defaultValue="organizations-helm">

<TabItem value="organizations-helm" label="AWS Organizations (Automatic)">

<Tabs groupId="org-auth-helm" queryString="org-auth-helm" defaultValue="org-irsa-helm">

<TabItem value="org-irsa-helm" label="With IRSA">

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
  --set podServiceAccount.name="port-ocean-aws-v3" \
  --set integration.config.accountRoleArn="arn:aws:iam::ORG_ACCOUNT_ID:role/port-ocean-aws-v3-role"
```

</TabItem>

<TabItem value="org-keys-helm" label="With IAM user">

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
  --set podServiceAccount.name="port-ocean-aws-v3" \
  --set integration.secrets.awsAccessKeyId="$AWS_ACCESS_KEY_ID" \
  --set integration.secrets.awsSecretAccessKey="$AWS_SECRET_ACCESS_KEY" \
  --set integration.config.accountRoleArn="arn:aws:iam::ORG_ACCOUNT_ID:role/port-ocean-aws-v3-role" \
  --set integration.config.externalId="YOUR_EXTERNAL_ID"
```

</TabItem>

</Tabs>

</TabItem>

<TabItem value="explicit-helm" label="Explicit account list (Manual)">

<Tabs groupId="explicit-auth-helm" queryString="explicit-auth-helm" defaultValue="explicit-irsa-helm">

<TabItem value="explicit-irsa-helm" label="With IRSA">

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install aws-v3 port-labs/port-ocean \
  --create-namespace --namespace port-ocean \
  --set port.clientId="$PORT_CLIENT_ID" \
  --set port.clientSecret="$PORT_CLIENT_SECRET" \
  --set port.baseUrl="https://api.getport.io" \
  --set initializePortResources=true \
  --set scheduledResyncInterval=1440 \
  --set integration.identifier="my-aws-v3-multi" \
  --set integration.type="aws-v3" \
  --set integration.eventListener.type="POLLING" \
  --set podServiceAccount.name="port-ocean-aws-v3" \
  --set integration.config.accountRoleArns='["arn:aws:iam::111111111111:role/AWSIntegrationRole","arn:aws:iam::222222222222:role/AWSIntegrationRole","arn:aws:iam::333333333333:role/AWSIntegrationRole"]'
```

</TabItem>

<TabItem value="explicit-keys-helm" label="With IAM user">

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install aws-v3 port-labs/port-ocean \
  --create-namespace --namespace port-ocean \
  --set port.clientId="$PORT_CLIENT_ID" \
  --set port.clientSecret="$PORT_CLIENT_SECRET" \
  --set port.baseUrl="https://api.getport.io" \
  --set initializePortResources=true \
  --set scheduledResyncInterval=1440 \
  --set integration.identifier="my-aws-v3-multi" \
  --set integration.type="aws-v3" \
  --set integration.eventListener.type="POLLING" \
  --set podServiceAccount.name="port-ocean-aws-v3" \
  --set integration.secrets.awsAccessKeyId="$AWS_ACCESS_KEY_ID" \
  --set integration.secrets.awsSecretAccessKey="$AWS_SECRET_ACCESS_KEY" \
  --set integration.config.accountRoleArns='["arn:aws:iam::111111111111:role/AWSIntegrationRole","arn:aws:iam::222222222222:role/AWSIntegrationRole","arn:aws:iam::333333333333:role/AWSIntegrationRole"]' \
  --set integration.config.externalId="YOUR_EXTERNAL_ID"
```

</TabItem>

</Tabs>

</TabItem>

</Tabs>

</TabItem>

<TabItem value="docker" label="Docker (Once)">

For one-time data synchronization or testing, you can run the integration using Docker.

<h2>Prerequisites</h2>

- [Docker](https://www.docker.com/get-started) installed.

<h2>IAM user</h2>

Set up an IAM user for authentication:

1. [Create an IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) with the following permissions:
   - `arn:aws:iam::aws:policy/ReadOnlyAccess`
   - For multi-account setups, create and attach an inline policy with `sts:AssumeRole` permission. See the [multi-account setup guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/multi-account-setup.md) for details.

2. [Generate access keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) for the user:
   - Go to **IAM → Users → Security credentials → Create access key**.
   - Save the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

:::caution Secure your credentials
Never commit access keys to version control. Use environment variables or secret management tools to store them securely.
:::

Run the Docker container with the following environment variables:

<details>
<summary><b>Environment variables (click to expand)</b></summary>

| Variable | Description |
|----------|-------------|
| `OCEAN__PORT__CLIENT_ID` | Your Port client ID. |
| `OCEAN__PORT__CLIENT_SECRET` | Your Port client secret. |
| `OCEAN__PORT__BASE_URL` | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US |
| `OCEAN__INTEGRATION__CONFIG__AWS_ACCESS_KEY_ID` | [The AWS Access Key ID of the IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html). |
| `OCEAN__INTEGRATION__CONFIG__AWS_SECRET_ACCESS_KEY` | [The AWS Secret Access Key of the IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html). |
| `OCEAN__INTEGRATION__IDENTIFIER` | The identifier of the integration. |
| `OCEAN__INTEGRATION__TYPE` | Should be set to `aws-v3`. |
| `OCEAN__EVENT_LISTENER` | [The event listener object](https://ocean.getport.io/framework/features/event-listener/). |
| `OCEAN__INITIALIZE_PORT_RESOURCES` | Whether to create default blueprints (`true` or `false`) |

</details>

```bash showLineNumbers
docker run -i --rm --platform=linux/amd64 \
  -e OCEAN__PORT__CLIENT_ID="$PORT_CLIENT_ID" \
  -e OCEAN__PORT__CLIENT_SECRET="$PORT_CLIENT_SECRET" \
  -e OCEAN__PORT__BASE_URL="https://api.getport.io" \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
  -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
  -e OCEAN__EVENT_LISTENER='{"type": "ONCE"}' \
  -e OCEAN__INTEGRATION__CONFIG__AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
  -e OCEAN__INTEGRATION__CONFIG__AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
  -e OCEAN__INTEGRATION__IDENTIFIER="my-aws-v3" \
  -e OCEAN__INTEGRATION__TYPE="aws-v3" \
  ghcr.io/port-labs/port-ocean-aws-v3:latest
```

<h2>Multiple account support</h2>

To run the AWS integration using Docker with multiple accounts, ensure you have the following: (Check out our [multiple accounts guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/multi-account-setup.md) for how to get them)

1. An organization role ARN (for Organizations mode) or a list of role ARNs (for explicit list mode).
2. A role with Read permissions set-up across your AWS accounts.
3. IAM user with the previous read-permissions role bound to them.

<Tabs groupId="multi-account-strategy-docker" queryString="multi-account-strategy-docker" defaultValue="organizations-docker">

<TabItem value="organizations-docker" label="AWS Organizations (Automatic)">

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

<TabItem value="explicit-docker" label="Explicit account list (Manual)">

:::caution JSON encoding required
The `ACCOUNT_ROLE_ARNS` parameter must be a valid JSON array string.
:::

```bash showLineNumbers
docker run -i --rm --platform=linux/amd64 \
  -e OCEAN__PORT__CLIENT_ID="$PORT_CLIENT_ID" \
  -e OCEAN__PORT__CLIENT_SECRET="$PORT_CLIENT_SECRET" \
  -e OCEAN__PORT__BASE_URL="https://api.getport.io" \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
  -e OCEAN__INTEGRATION__IDENTIFIER="my-aws-v3-multi" \
  -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
  -e OCEAN__INTEGRATION__SECRETS__AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
  -e OCEAN__INTEGRATION__SECRETS__AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
  -e OCEAN__INTEGRATION__CONFIG__ACCOUNT_ROLE_ARNS='["arn:aws:iam::111111111111:role/PortOceanReadRole","arn:aws:iam::222222222222:role/PortOceanReadRole","arn:aws:iam::333333333333:role/PortOceanReadRole"]' \
  -e OCEAN__INTEGRATION__CONFIG__EXTERNAL_ID="YOUR_EXTERNAL_ID" \
  ghcr.io/port-labs/port-ocean-aws-v3:latest
```

</TabItem>

</Tabs>

</TabItem>

</Tabs>

<PortApiRegionTip/>

## Troubleshooting

### Common installation issues

**Error**: `Unable to assume role`

**Solutions**:
- Verify the IAM role ARN is correct.
- Ensure the trust policy allows your base credentials to assume the role.
- For IAM user authentication, check that the `externalId` matches on both sides (if configured).
- Verify the base credentials have `sts:AssumeRole` (for IAM user) or `sts:AssumeRoleWithWebIdentity` (for IRSA) permission.

**Error**: `No resources discovered`

**Solutions**:
- Verify the IAM role has `ReadOnlyAccess` or equivalent permissions.
- Check that the regions you want to query are not blocked by `regionPolicy`.
- Ensure the integration has network access to AWS APIs.

**Error**: `Access denied to Organizations API`

**Solutions**:
- Verify the base credentials have `ReadOnlyAccess` policy attached (which includes Organizations API access).
- Verify AWS Organizations is enabled in your management account.
- Check that you're using the correct account (management or delegated administrator).
