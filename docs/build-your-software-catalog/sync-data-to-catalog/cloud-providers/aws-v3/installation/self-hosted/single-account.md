---
sidebar_position: 1
sidebar_label: Single account
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import IntegrationVersion from "/src/components/IntegrationVersion/IntegrationVersion"

# Single account installation

<IntegrationVersion integration="aws-v3" />

We'll walk you through deploying the AWS integration to sync resources from a single AWS account.

## Prerequisites

Before installing the integration, ensure you have:

- [Port API credentials](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials) (`PORT_CLIENT_ID` and `PORT_CLIENT_SECRET`).

<Tabs groupId="single-account-auth" queryString="single-account-auth" defaultValue="iam-user">

<TabItem value="iam-user" label="IAM User">

**Prerequisites:**

- Permissions to create IAM users.

**Set up IAM user:**

Set up an IAM user for authentication:

1. [Create an IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) with the following permissions:
   - Attach the `arn:aws:iam::aws:policy/ReadOnlyAccess` policy.

2. [Generate access keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) for the user:
   - Go to **IAM → Users → Security credentials → Create access key**.
   - Save the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

:::caution Secure your credentials
Never commit access keys to version control. Use environment variables or secret management tools to store them securely.
:::

**Deploy the integration:**

Choose your deployment method:

<Tabs groupId="deployment-method-iam" queryString="deployment-method-iam" defaultValue="helm">

<TabItem value="helm" label="Helm">

Deploy the AWS integration using Helm on your Kubernetes cluster. This deployment supports scheduled resyncs of resources from AWS to Port.

**Prerequisites:**
- [Helm](https://helm.sh/docs/intro/install/) >= 3.0.0.
- Kubernetes cluster to deploy the integration.

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

</TabItem>

<TabItem value="docker" label="Docker">

For one-time data synchronization or testing, you can run the integration using Docker.

**Prerequisites:**
- [Docker](https://www.docker.com/get-started) installed.

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

</TabItem>

</Tabs>

</TabItem>

<TabItem value="irsa" label="IRSA">

**Prerequisites:**

- [Helm](https://helm.sh/docs/intro/install/) >= 3.0.0.
- Amazon EKS cluster with OIDC provider configured.
- Permissions to create IAM roles and deploy Kubernetes resources.

**Set up IRSA:**

Set up [IRSA](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) for authentication:

1. **Create an IAM role** with the following configuration:
   - Go to **AWS Console → IAM → Roles → Create role**.
   - Select **Web identity** as the trust entity type.
   - Choose your EKS cluster's OIDC provider as the identity provider.
   - Set the audience to `sts.amazonaws.com`.
   - Name the role `PortOceanReadRole`.

2. **Attach permissions**:
   - Attach the `arn:aws:iam::aws:policy/ReadOnlyAccess` policy.

3. **Note the role ARN** - you'll need it later: `arn:aws:iam::ACCOUNT_ID:role/PortOceanReadRole`

4. **Create a Kubernetes service account** and link it to the IAM role. Refer to the [AWS guide for associating an IAM role to a service account](https://docs.aws.amazon.com/eks/latest/userguide/associate-service-account-role.html).

**Deploy the integration:**

Choose your deployment method:

<Tabs groupId="deployment-method-irsa" queryString="deployment-method-irsa" defaultValue="helm">

<TabItem value="helm" label="Helm">

Deploy the integration with the following configuration:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs/github.io/helm-charts
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
  --set integration.config.accountRoleArns='["arn:aws:iam::ACCOUNT_ID:role/PortOceanReadRole"]'
```

</TabItem>

</Tabs>

<PortApiRegionTip/>

</TabItem>

</Tabs>

## Troubleshooting

### Common installation issues

**Error**: `No resources discovered`

**Solutions**:
- Verify the IAM user has `ReadOnlyAccess` policy attached.
- Check that the regions you want to query are not blocked by `regionPolicy`.
- Ensure the integration has network access to AWS APIs.

**Error**: `Invalid credentials`

**Solutions**:
- Verify the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are correct.
- Ensure the access keys haven't expired or been deleted.
- Check that the IAM user has the `ReadOnlyAccess` policy attached.

**Error**: `Docker container exits immediately` (Docker only)

**Solutions**:
- Check Docker logs for error messages.
- Verify all required environment variables are set.
- Ensure the Port API credentials are valid.

**Error**: `Unable to assume role` (IRSA only)

**Solutions**:
- Verify the service account annotation matches the IAM role ARN.
- Ensure the OIDC provider is correctly configured for your EKS cluster.
- Check that the IAM role trust policy allows the service account to assume it.

**Error**: `Service account not found` (IRSA only)

**Solutions**:
- Verify the service account exists in the `port-ocean` namespace.
- Ensure the service account name matches the `podServiceAccount.name` value in your Helm configuration.