---
sidebar_position: 2
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import IntegrationVersion from "/src/components/IntegrationVersion/IntegrationVersion"

# Multiple accounts installation

<IntegrationVersion integration="aws-v3" />

We'll walk you through deploying the AWS integration to sync resources from multiple AWS accounts using CloudFormation StackSets for automated role deployment.

## Prerequisites

Before installing the integration, ensure you have:

- [Port API credentials](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials) (`PORT_CLIENT_ID` and `PORT_CLIENT_SECRET`).
- Permissions to create IAM roles and deploy Kubernetes resources.

<Tabs groupId="multiple-account-auth" queryString="multiple-account-auth" defaultValue="iam-user">

<TabItem value="iam-user" label="IAM User">

## Prerequisites

- Permissions to create IAM users and IAM roles in member accounts.
- For Helm: [Helm](https://helm.sh/docs/intro/install/) >= 3.0.0 and a Kubernetes cluster.
- For Docker: [Docker](https://www.docker.com/get-started) installed.

## Account terminology

- **Base account**: The AWS account where your IAM user is created. This is where the integration authenticates from.
- **Management account**: Your AWS Organizations management account. This is where you deploy CloudFormation StackSets and where the Organizations API is accessible. For automatic account discovery, you need a role ARN from this account.
- **Member accounts**: All other accounts in your organization that you want to sync resources from.

The base account and management account can be the same account, or they can be different. For automatic account discovery, the role ARN must come from the management account (the account with Organizations API access).

## Choose account discovery method

<Tabs groupId="iam-user-discovery" queryString="iam-user-discovery" defaultValue="automatic">

<TabItem value="automatic" label="Automatic account discovery">

### Understanding automatic account discovery

Automatic account discovery uses the Organizations API to discover all member accounts in your organization. The integration automatically finds and syncs all accounts without requiring you to list them manually.

:::info Alternative option
To manually specify which accounts to sync, see the [Specify accounts tab](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts.md?multiple-account-auth=iam-user&iam-user-discovery=specify).
:::

**Prerequisites:**
- AWS Organizations enabled.
- Access to your AWS Organizations management account.

### How it works

1. The integration authenticates to your base account using IAM user credentials.
2. We'll create IAM roles with `ReadOnlyAccess` in each member account using CloudFormation StackSets.
3. Each member account's role trusts your base IAM user to assume it.
4. The integration uses the Organizations API to discover all member accounts.
5. For each discovered account, it calls `AssumeRole` to get temporary credentials.
6. With those credentials, it reads resources and syncs them to Port.

:::tip External ID
External ID is a security feature required for cross-account access when using IAM user authentication. It's a secret value that both parties must know when assuming roles, preventing the [confused deputy problem](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-user_externalid.html).
:::

### Set up IAM user

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

### Set up IAM roles

Use CloudFormation StackSets to deploy IAM roles across your AWS Organization member accounts automatically. You can target specific accounts, organizational units, or all accounts.

:::caution Management account required
Run the StackSet deployment from your AWS Organizations **management account**, as only the management account can deploy StackSets across member accounts.
:::

#### Prepare your organization

1. **Find your OU ID** (if deploying to an organizational unit):
   - Log into your AWS Organizations management account.
   - Navigate to [AWS Organizations](https://us-east-1.console.aws.amazon.com/organizations/v2/home/accounts) service.
   - Under **Organizational structure**, copy the OU ID from the details page (format `ou-xxxx-xxxxxxxx` or `r-xxxx`).
   - You can also target specific account IDs if needed.

2. **Get your base account IAM user ARN**:
   - Go to **IAM** → **Users** in your base account (where the IAM user is created).
   - Find the IAM user we created for authentication.
   - Copy the user ARN (format: `arn:aws:iam::BASE_ACCOUNT_ID:user/USER_NAME`).

3. **Generate an external ID**:
   - Generate a secure external ID using: `openssl rand -hex 16`
   - Save this value - use the same external ID across all member accounts.

#### Deploy via AWS console

1. Go to [AWS CloudFormation StackSets](https://console.aws.amazon.com/cloudformation/home#/stacksets).
2. Click **Create StackSet**.
3. Choose **Template is ready** and provide the S3 URL for the IAM user template.
4. Configure stack parameters:
   - **RoleName**: Enter a consistent role name (e.g., `PortOceanReadRole`).
   - **TrustedPrincipalARN**: Enter your IAM user ARN.
   - **ExternalId**: Enter the external ID you generated.
5. Specify deployment targets (organization, OU, or specific accounts).
6. Review and create the StackSet.

#### Monitor deployment

1. Check StackSet status in your management account.
2. Verify IAM roles exist in target accounts with correct permissions.

#### Note the role ARN

Get the role ARN from your management account. For automatic account discovery, you only need this one role ARN.

Format: `arn:aws:iam::ORG_ACCOUNT_ID:role/ROLE_NAME`

### Deploy the integration

<Tabs groupId="deployment-method-iam-auto" queryString="deployment-method-iam-auto" defaultValue="helm">

<TabItem value="helm" label="Helm">

:::info Organization account role
The `accountRoleArn` in automatic account discovery mode should reference the role in your **organization/management account**.
:::

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

<TabItem value="docker" label="Docker">

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

### Troubleshooting

**Error**: `Unable to assume role`
- Verify the IAM role ARN is correct.
- Ensure the trust policy allows your IAM user to assume the role.
- Check that the `externalId` matches on both sides.

**Error**: `No resources discovered`
- Verify the IAM roles in member accounts have `ReadOnlyAccess` policy attached.
- Check that the regions you want to query are not blocked by `regionPolicy`.
- Ensure the integration has network access to AWS APIs.

**Error**: `Access denied to Organizations API`
- Verify the IAM user has `ReadOnlyAccess` policy attached.
- Verify AWS Organizations is enabled in your management account.

</TabItem>

<TabItem value="specify" label="Specify accounts">

### Understanding specify accounts mode

Specify accounts lets you choose which AWS accounts to sync by providing a list of role ARNs. You control exactly which accounts are synced by listing their role ARNs in the integration configuration.

:::info Alternative option
To use automatic account discovery with AWS Organizations, see the [Automatic account discovery tab](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts.md?multiple-account-auth=iam-user&iam-user-discovery=automatic).
:::

### How it works

1. The integration authenticates to your base account using IAM user credentials.
2. We'll create IAM roles with `ReadOnlyAccess` in each member account using CloudFormation StackSets.
3. Each member account's role trusts your base IAM user to assume it.
4. You provide a list of role ARNs to the integration.
5. The integration calls `AssumeRole` for each role ARN to get temporary credentials.
6. With those credentials, it reads resources and syncs them to Port.

:::tip External ID
External ID is a security feature required for cross-account access when using IAM user authentication. It's a secret value that both parties must know when assuming roles, preventing the [confused deputy problem](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-user_externalid.html).
:::

### Set up IAM user

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

### Set up IAM roles

Use CloudFormation StackSets to deploy IAM roles across your AWS Organization member accounts automatically. You can target specific accounts, organizational units, or all accounts.

:::caution Management account required
Run the StackSet deployment from your AWS Organizations **management account**, as only the management account can deploy StackSets across member accounts.
:::

#### Prepare your organization

1. **Find your OU ID** (if deploying to an organizational unit):
   - Log into your AWS Organizations management account.
   - Navigate to [AWS Organizations](https://us-east-1.console.aws.amazon.com/organizations/v2/home/accounts) service.
   - Under **Organizational structure**, copy the OU ID from the details page (format `ou-xxxx-xxxxxxxx` or `r-xxxx`).
   - You can also target specific account IDs if needed.

2. **Get your base account IAM user ARN**:
   - Go to **IAM** → **Users** in your base account (where the IAM user is created).
   - Find the IAM user we created for authentication.
   - Copy the user ARN (format: `arn:aws:iam::BASE_ACCOUNT_ID:user/USER_NAME`).

3. **Generate an external ID**:
   - Generate a secure external ID using: `openssl rand -hex 16`
   - Save this value - use the same external ID across all member accounts.

#### Deploy via AWS console

1. Go to [AWS CloudFormation StackSets](https://console.aws.amazon.com/cloudformation/home#/stacksets).
2. Click **Create StackSet**.
3. Choose **Template is ready** and provide the S3 URL for the IAM user template.
4. Configure stack parameters:
   - **RoleName**: Enter a consistent role name (e.g., `PortOceanReadRole`).
   - **TrustedPrincipalARN**: Enter your IAM user ARN.
   - **ExternalId**: Enter the external ID you generated.
5. Specify deployment targets (organization, OU, or specific accounts).
6. Review and create the StackSet.

#### Monitor deployment

1. Check StackSet status in your management account.
2. Verify IAM roles exist in target accounts with correct permissions.

#### Collect role ARNs

For specify accounts mode, collect role ARNs from all member accounts you want to sync.

**Get role ARNs from each account**:
- Format: `arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME`
- Example: `arn:aws:iam::234567890123:role/PortOceanReadRole`

### Deploy the integration

<Tabs groupId="deployment-method-iam-specify" queryString="deployment-method-iam-specify" defaultValue="helm">

<TabItem value="helm" label="Helm">

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
  --set integration.secrets.awsAccessKeyId="$AWS_ACCESS_KEY_ID" \
  --set integration.secrets.awsSecretAccessKey="$AWS_SECRET_ACCESS_KEY" \
  --set integration.config.accountRoleArns='["arn:aws:iam::111111111111:role/AWSIntegrationRole","arn:aws:iam::222222222222:role/AWSIntegrationRole","arn:aws:iam::333333333333:role/AWSIntegrationRole"]' \
  --set integration.config.externalId="YOUR_EXTERNAL_ID"
```

</TabItem>

<TabItem value="docker" label="Docker">

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

<PortApiRegionTip/>

### Troubleshooting

**Error**: `Unable to assume role`
- Verify the IAM role ARN is correct.
- Ensure the trust policy allows your IAM user to assume the role.
- Check that the `externalId` matches on both sides.

**Error**: `No resources discovered`
- Verify the IAM roles in member accounts have `ReadOnlyAccess` policy attached.
- Check that the regions you want to query are not blocked by `regionPolicy`.
- Ensure the integration has network access to AWS APIs.

</TabItem>

</Tabs>

</TabItem>

<TabItem value="irsa" label="IRSA">

## Prerequisites

- [Helm](https://helm.sh/docs/intro/install/) >= 3.0.0.
- Amazon EKS cluster with OIDC provider configured.
- Permissions to create IAM roles and deploy Kubernetes resources.

## Account terminology

- **Base account**: The AWS account where your EKS cluster is located. This is where the integration authenticates from using IRSA.
- **Management account**: Your AWS Organizations management account. This is where you deploy CloudFormation StackSets and where the Organizations API is accessible. For automatic account discovery, you need a role ARN from this account.
- **Member accounts**: The AWS accounts that you want to sync resources from.

The base account and management account can be the same account, or they can be different. For automatic account discovery, the role ARN must come from the management account (the account with Organizations API access).

## Choose account discovery method

<Tabs groupId="irsa-discovery" queryString="irsa-discovery" defaultValue="automatic">

<TabItem value="automatic" label="Automatic account discovery">

### Understanding automatic account discovery

Automatic account discovery uses the Organizations API to discover all member accounts in your organization. The integration automatically finds and syncs all accounts without requiring you to list them manually.

:::info Alternative option
To manually specify which accounts to sync, see the [Specify accounts tab](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts.md?multiple-account-auth=irsa&irsa-discovery=specify).
:::

**Prerequisites:**
- AWS Organizations enabled.
- Access to your AWS Organizations management account.

### How it works

1. The integration authenticates to your base account using IRSA (IAM Roles for Service Accounts).
2. We'll create IAM roles with `ReadOnlyAccess` in each member account using CloudFormation StackSets.
3. Each member account's role trusts your base IRSA role to assume it via OIDC.
4. The integration uses the Organizations API to discover all member accounts.
5. For each discovered account, it calls `AssumeRoleWithWebIdentity` to get temporary credentials.
6. With those credentials, it reads resources and syncs them to Port.

### Set up IRSA

1. **Create an IAM role** with the following configuration:
   - Go to **AWS Console → IAM → Roles → Create role**.
   - Select **Web identity** as the trust entity type.
   - Choose your EKS cluster's OIDC provider as the identity provider.
   - Set the audience to `sts.amazonaws.com`.
   - Name the role `port-ocean-aws-v3-role`.

2. **Attach permissions**:
   - Attach the `arn:aws:iam::aws:policy/ReadOnlyAccess` policy.
   - Create and attach an inline policy with `sts:AssumeRoleWithWebIdentity` permission:

```json showLineNumbers
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sts:AssumeRoleWithWebIdentity"
      ],
      "Resource": "*"
    }
  ]
}
```

3. **Note the role ARN** - you'll need it later: `arn:aws:iam::ACCOUNT_ID:role/port-ocean-aws-v3-role`

4. **Create a Kubernetes service account** and link it to the IAM role:

<details>
<summary><b>Create service account (Click to expand)</b></summary>

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

</details>

Refer to the [AWS guide for associating an IAM role to a service account](https://docs.aws.amazon.com/eks/latest/userguide/associate-service-account-role.html).

### Set up IAM roles

Use CloudFormation StackSets to deploy IAM roles across your AWS Organization member accounts automatically. You can target specific accounts, organizational units, or all accounts. IRSA authentication requires OIDC provider setup in each member account, as the trust relationship uses OpenID Connect rather than standard IAM role assumption.

:::caution Management account required
Run the StackSet deployment from your AWS Organizations **management account**, as only the management account can deploy StackSets across member accounts.
:::

#### Prepare your organization

1. **Get your EKS cluster's OIDC issuer URL**:
   - Run this command in your base account (where your EKS cluster is):

```bash showLineNumbers
aws eks describe-cluster --name CLUSTER_NAME --region REGION --query "cluster.identity.oidc.issuer" --output text
```

   - This returns a URL like: `https://oidc.eks.REGION.amazonaws.com/id/OIDC_ID`
   - Note the `REGION` and `OIDC_ID` values - these are needed for the StackSet parameters.

#### Deploy via AWS console

1. Go to [AWS CloudFormation StackSets](https://console.aws.amazon.com/cloudformation/home#/stacksets).
2. Click **Create StackSet**.
3. Choose **Template is ready** and provide the S3 URL for the IRSA template.
4. Configure stack parameters:
   - **RoleName**: Enter a consistent role name (e.g., `PortOceanReadRole`).
   - **OIDCIssuerURL**: Enter your EKS cluster's OIDC issuer URL.
   - **OIDCProviderThumbprint**: Enter `9e99a48a9960b14926bb7f3b02e22da2b0ab7280` (standard EKS thumbprint).
   - **ServiceAccountNamespace**: Enter `port-ocean`.
   - **ServiceAccountName**: Enter `port-ocean-aws-v3`.
5. Specify deployment targets (organization, OU, or specific accounts).
6. Review and create the StackSet.

#### Monitor deployment

1. Check StackSet status in your management account.
2. Verify IAM roles exist in target accounts with correct permissions.

#### Note the role ARN

For automatic account discovery, you only need the role ARN from your **management account** (not member accounts). The integration will discover member accounts and assume roles automatically.

Format: `arn:aws:iam::ORG_ACCOUNT_ID:role/ROLE_NAME`

### Deploy the integration

<Tabs groupId="deployment-method-irsa-auto" queryString="deployment-method-irsa-auto" defaultValue="helm">

<TabItem value="helm" label="Helm">

:::info Organization account role
The `accountRoleArn` in automatic account discovery mode should reference the role in your **organization/management account**.
:::

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs/github.io/helm-charts
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

</Tabs>

<PortApiRegionTip/>

### Troubleshooting

**Error**: `Unable to assume role`
- Verify the IAM role ARN is correct.
- Ensure the trust policy allows your base IRSA role to assume the member account roles.
- Verify the OIDC provider is configured in each member account.

**Error**: `No resources discovered`
- Verify the IAM roles in member accounts have `ReadOnlyAccess` policy attached.
- Check that the regions you want to query are not blocked by `regionPolicy`.
- Ensure the integration has network access to AWS APIs.

**Error**: `Access denied to Organizations API`
- Verify the base IAM role has `ReadOnlyAccess` policy attached.
- Verify AWS Organizations is enabled in your management account.

</TabItem>

<TabItem value="specify" label="Specify accounts">

### Understanding specify accounts mode

Specify accounts lets you choose which AWS accounts to sync by providing a list of role ARNs. You control exactly which accounts are synced by listing their role ARNs in the integration configuration.

:::info Alternative option
To use automatic account discovery with AWS Organizations, see the [Automatic account discovery tab](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts.md?multiple-account-auth=irsa&irsa-discovery=automatic).
:::

### How it works

1. The integration authenticates to your base account using IRSA (IAM Roles for Service Accounts).
2. We'll create IAM roles with `ReadOnlyAccess` in each member account using CloudFormation StackSets.
3. Each member account's role trusts your base IRSA role to assume it via OIDC.
4. You provide a list of role ARNs to the integration.
5. The integration calls `AssumeRoleWithWebIdentity` for each role ARN to get temporary credentials.
6. With those credentials, it reads resources and syncs them to Port.

### Set up IRSA

1. **Create an IAM role** with the following configuration:
   - Go to **AWS Console → IAM → Roles → Create role**.
   - Select **Web identity** as the trust entity type.
   - Choose your EKS cluster's OIDC provider as the identity provider.
   - Set the audience to `sts.amazonaws.com`.
   - Name the role `port-ocean-aws-v3-role`.

2. **Attach permissions**:
   - Attach the `arn:aws:iam::aws:policy/ReadOnlyAccess` policy.
   - Create and attach an inline policy with `sts:AssumeRoleWithWebIdentity` permission:

```json showLineNumbers
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sts:AssumeRoleWithWebIdentity"
      ],
      "Resource": "*"
    }
  ]
}
```

3. **Note the role ARN** - you'll need it later: `arn:aws:iam::ACCOUNT_ID:role/port-ocean-aws-v3-role`

4. **Create a Kubernetes service account** and link it to the IAM role:

<details>
<summary><b>Create service account (Click to expand)</b></summary>

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

</details>

Refer to the [AWS guide for associating an IAM role to a service account](https://docs.aws.amazon.com/eks/latest/userguide/associate-service-account-role.html).

### Set up IAM roles

Use CloudFormation StackSets to deploy IAM roles across your AWS Organization member accounts automatically. You can target specific accounts, organizational units, or all accounts. IRSA authentication requires OIDC provider setup in each member account, as the trust relationship uses OpenID Connect rather than standard IAM role assumption.

:::caution Management account required
Run the StackSet deployment from your AWS Organizations **management account**, as only the management account can deploy StackSets across member accounts.
:::

#### Prepare your organization

1. **Get your EKS cluster's OIDC issuer URL**:
   - Run this command in your base account (where your EKS cluster is):

```bash showLineNumbers
aws eks describe-cluster --name CLUSTER_NAME --region REGION --query "cluster.identity.oidc.issuer" --query "cluster.identity.oidc.issuer" --output text
```

   - This returns a URL like: `https://oidc.eks.REGION.amazonaws.com/id/OIDC_ID`
   - Note the `REGION` and `OIDC_ID` values - these are needed for the StackSet parameters.

#### Deploy via AWS console

1. Go to [AWS CloudFormation StackSets](https://console.aws.amazon.com/cloudformation/home#/stacksets).
2. Click **Create StackSet**.
3. Choose **Template is ready** and provide the S3 URL for the IRSA template.
4. Configure stack parameters:
   - **RoleName**: Enter a consistent role name (e.g., `PortOceanReadRole`).
   - **OIDCIssuerURL**: Enter your EKS cluster's OIDC issuer URL.
   - **OIDCProviderThumbprint**: Enter `9e99a48a9960b14926bb7f3b02e22da2b0ab7280` (standard EKS thumbprint).
   - **ServiceAccountNamespace**: Enter `port-ocean`.
   - **ServiceAccountName**: Enter `port-ocean-aws-v3`.
5. Specify deployment targets (organization, OU, or specific accounts).
6. Review and create the StackSet.

#### Monitor deployment

1. Check StackSet status in your management account.
2. Verify IAM roles exist in target accounts with correct permissions.

#### Collect role ARNs

For specify accounts mode, collect role ARNs from all member accounts you want to sync.

**Get role ARNs from each account**:
- Format: `arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME`
- Example: `arn:aws:iam::234567890123:role/PortOceanReadRole`

### Deploy the integration

<Tabs groupId="deployment-method-irsa-specify" queryString="deployment-method-irsa-specify" defaultValue="helm">

<TabItem value="helm" label="Helm">

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs/github.io/helm-charts
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

</Tabs>

<PortApiRegionTip/>

### Troubleshooting

**Error**: `Unable to assume role`
- Verify the IAM role ARN is correct.
- Ensure the trust policy allows your base IRSA role to assume the member account roles.
- Verify the OIDC provider is configured in each member account.

**Error**: `No resources discovered`
- Verify the IAM roles in member accounts have `ReadOnlyAccess` policy attached.
- Check that the regions you want to query are not blocked by `regionPolicy`.
- Ensure the integration has network access to AWS APIs.

</TabItem>

</Tabs>

</TabItem>

</Tabs>