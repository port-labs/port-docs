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

## Choose your deployment method

Select the deployment method that best fits your infrastructure:

<Tabs groupId="installation-methods" queryString="installation-methods" defaultValue="helm">

<TabItem value="helm" label="Helm (Scheduled)">

The AWS integration is deployed using Helm on your Kubernetes cluster. This deployment supports scheduled resyncs of resources from AWS to Port.

<h2>Prerequisites</h2>

- [Helm](https://helm.sh/docs/intro/install/) >= 3.0.0.
- Kubernetes cluster to deploy the integration.

<h2>Single account installation</h2>

We'll start with the simplest setup: syncing resources from a single AWS account.

<h3>Step 1: Choose authentication method</h3>

Choose how the integration will authenticate to AWS:

<Tabs groupId="helm-auth" queryString="helm-auth" defaultValue="irsa">

<TabItem value="irsa" label="IRSA (Recommended for EKS)">

If you're running on Amazon EKS, we recommend using [IRSA (IAM Roles for Service Accounts)](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) for secure, keyless authentication.

<h4>Set up IRSA</h4>

1. **Create an IAM role** with the following configuration:
   - Go to **AWS Console → IAM → Roles → Create role**.
   - Select **Web identity** as the trust entity type.
   - Choose your EKS cluster's OIDC provider as the identity provider.
   - Set the audience to `sts.amazonaws.com`.
   - Attach the `arn:aws:iam::aws:policy/ReadOnlyAccess` policy.
   - Name the role `port-ocean-aws-v3-role`.
   - Note the role ARN (you'll need it for the next step).

2. **Create a Kubernetes service account** and link it to the IAM role:

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

</TabItem>

<TabItem value="access-keys" label="AWS access keys">

For non-EKS clusters, you can authenticate using AWS access keys.

<h4>Create IAM user</h4>

1. [Create an IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) with the following permissions:
   - `arn:aws:iam::aws:policy/ReadOnlyAccess`.

2. [Generate access keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) for the user. You'll need:
   - `AWS_ACCESS_KEY_ID`.
   - `AWS_SECRET_ACCESS_KEY`.

</TabItem>

</Tabs>

<h3>Step 2: Install using Helm</h3>

<Tabs groupId="helm-single-install" queryString="helm-single-install" defaultValue="irsa-install">

<TabItem value="irsa-install" label="With IRSA">

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install aws-v3 port-labs/port-ocean \
  --create-namespace --namespace port-ocean \
  --set port.clientId="vyRVvY3rn6MxhnhnEdQhc6WOa15X2naN" \
  --set port.clientSecret="fTpExApZbrxWwTAAliq8snRtGK5aT8poNlb26yWDkvWst7mmn0Totb1Z1WN0GY3a" \
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

</TabItem>

<TabItem value="keys-install" label="With access keys">

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
  --set extraEnv[0].name="AWS_ACCESS_KEY_ID" \
  --set extraEnv[0].value="$AWS_ACCESS_KEY_ID" \
  --set extraEnv[1].name="AWS_SECRET_ACCESS_KEY" \
  --set extraEnv[1].value="$AWS_SECRET_ACCESS_KEY"
```

</TabItem>

</Tabs>

<PortApiRegionTip/>

<h2>Multi-account installation</h2>

To sync resources from multiple AWS accounts, you'll need to set up IAM roles in each account and configure the integration to assume those roles.

<h3>Step 1: Set up IAM roles in your AWS accounts</h3>

You need to create IAM roles with `ReadOnlyAccess` in each account you want to sync.

<details>
<summary><b>Deploy using CloudFormation StackSet (click to expand)</b></summary>

:::tip Automated deployment
Use CloudFormation StackSets to deploy IAM roles across all your AWS Organization member accounts automatically.
:::

1. **Access the CloudFormation template**:
   - CloudFormation StackSet template will be available soon.

2. **Deploy via AWS Console**:
   - Go to [AWS CloudFormation StackSets](https://console.aws.amazon.com/cloudformation/home#/stacksets).
   - Click **Create StackSet**.
   - Upload the template or provide the S3 URL.
   - Configure the following parameters:
     - **RoleName**: `PortOceanReadRole` (must be consistent across accounts).
     - **ExternalId**: Generate a secure external ID (e.g., using `openssl rand -hex 16`).
     - **TrustedPrincipal**: The IAM role ARN or user ARN from step 1 above.

3. **Specify deployment targets**:
   - Choose **Deploy to organization** or **Deploy to specific accounts**.
   - Select the organizational units (OUs) or account IDs.

4. **Monitor deployment**:
   - Wait for StackSet instances to complete across all accounts.
   - Verify roles were created successfully in the CloudFormation console.

</details>

<details>
<summary><b>Manual IAM role setup (click to expand)</b></summary>

For each account you want to sync, create an IAM role with the following configuration.

<h4>Create the IAM role</h4>

Create an IAM role with this trust policy (replace placeholders):

```json showLineNumbers
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::BASE_ACCOUNT_ID:role/port-ocean-aws-v3-role"
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

- `BASE_ACCOUNT_ID`: The account where the integration runs.
- `YOUR_EXTERNAL_ID`: A secure external ID (same across all accounts).

<h4>Attach permissions</h4>

Attach the AWS managed `ReadOnlyAccess` policy:

```bash showLineNumbers
aws iam attach-role-policy \
  --role-name PortOceanReadRole \
  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
```

<h4>Note the role ARN</h4>

Copy the role ARN - you'll need it in the next step:
```
arn:aws:iam::ACCOUNT_ID:role/PortOceanReadRole
```

</details>

<h3>Step 2: Choose your account discovery strategy</h3>

<Tabs groupId="multi-account-strategy" queryString="multi-account-strategy" defaultValue="organizations">

<TabItem value="organizations" label="AWS Organizations (Automatic)">

If you have AWS Organizations enabled, the integration can automatically discover all member accounts.

<h4>Additional prerequisite</h4>

Your base IAM role (from step 1 of single account setup) needs these additional permissions:
- `organizations:ListAccounts`.
- `organizations:DescribeOrganization`.
- `sts:AssumeRole`.

<h4>Set up IRSA for multi-account (EKS only)</h4>

For EKS clusters using IRSA, each member account must have the OIDC provider and IAM roles configured. You can use CloudFormation StackSets for automated deployment or set them up manually.

<details>
<summary><b>Deploy using CloudFormation StackSet (click to expand)</b></summary>

:::tip Automated deployment
Use CloudFormation StackSets to deploy OIDC providers and IAM roles across all your AWS Organization member accounts automatically.
:::

1. **Access the CloudFormation template**:
   - CloudFormation StackSet template will be available soon.

2. **Deploy via AWS Console**:
   - Go to [AWS CloudFormation StackSets](https://console.aws.amazon.com/cloudformation/home#/stacksets).
   - Click **Create StackSet**.
   - Upload the template or provide the S3 URL.
   - Configure the following parameters:
     - **OIDCIssuerURL**: Your EKS cluster's OIDC issuer URL (e.g., `https://oidc.eks.REGION.amazonaws.com/id/OIDC_ID`).
     - **RoleName**: `AWSIntegrationRole` (must be consistent across accounts).
     - **TrustedPrincipal**: The base IAM role ARN from your EKS cluster account.

3. **Specify deployment targets**:
   - Choose **Deploy to organization** or **Deploy to specific accounts**.
   - Select the organizational units (OUs) or account IDs.

4. **Monitor deployment**:
   - Wait for StackSet instances to complete across all accounts.
   - Verify OIDC providers and roles were created successfully in the CloudFormation console.

</details>

<details>
<summary><b>Manual setup (click to expand)</b></summary>

For each member account you want to sync, complete the following steps.

<h4>Step 1: Create OIDC provider</h4>

Get your EKS cluster's OIDC issuer URL:

```bash showLineNumbers
aws eks describe-cluster --name CLUSTER_NAME --region REGION --query "cluster.identity.oidc.issuer" --output text
```

Create the OIDC provider in each member account:

```bash showLineNumbers
aws iam create-open-id-connect-provider \
  --url https://oidc.eks.REGION.amazonaws.com/id/OIDC_ID \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 9e99a48a9960b14926bb7f3b02e22da2b0ab7280
```

<h4>Step 2: Create or update IAM role</h4>

Create an IAM role (or update existing role) in each member account with this trust policy:

```json showLineNumbers
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::MEMBER_ACCOUNT_ID:oidc-provider/oidc.eks.REGION.amazonaws.com/id/OIDC_ID"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.REGION.amazonaws.com/id/OIDC_ID:aud": "sts.amazonaws.com"
        }
      }
    }
  ]
}
```

Replace:
- `MEMBER_ACCOUNT_ID`: The member account ID.
- `REGION`: Your EKS cluster region.
- `OIDC_ID`: Your EKS cluster's OIDC ID.

Attach the `arn:aws:iam::aws:policy/ReadOnlyAccess` policy to the role.

<h4>Step 3: Note role ARNs</h4>

Collect the role ARN from each member account. You'll need these for the Helm installation:

```
arn:aws:iam::MEMBER_ACCOUNT_ID:role/AWSIntegrationRole
```

</details>

<h4>Install</h4>

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
  --set integration.config.accountRoleArn="arn:aws:iam::MEMBER_ACCOUNT_ID:role/AWSIntegrationRole" \
  --set integration.config.externalId="YOUR_EXTERNAL_ID"
```

</TabItem>

<TabItem value="org-keys-helm" label="With access keys">

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
  --set extraEnv[0].name="AWS_ACCESS_KEY_ID" \
  --set extraEnv[0].value="$AWS_ACCESS_KEY_ID" \
  --set extraEnv[1].name="AWS_SECRET_ACCESS_KEY" \
  --set extraEnv[1].value="$AWS_SECRET_ACCESS_KEY" \
  --set integration.config.accountRoleArn="arn:aws:iam::MEMBER_ACCOUNT_ID:role/PortOceanReadRole" \
  --set integration.config.externalId="YOUR_EXTERNAL_ID"
```

</TabItem>

</Tabs>

:::info How it works
The integration uses the base IAM role (via IRSA) to call AWS Organizations API and discover all member accounts. For each discovered account, it uses `AssumeRoleWithWebIdentity` to assume the `AWSIntegrationRole` in that account. This requires the OIDC provider to be configured in each member account.
:::

</TabItem>

<TabItem value="explicit" label="Explicit account list (Manual)">

If you don't use AWS Organizations or want to specify exact accounts, you can provide a list of role ARNs.

<h4>Set up IRSA for multi-account (EKS only)</h4>

For EKS clusters using IRSA, each member account must have the OIDC provider and IAM roles configured. Complete the following for each account:

1. **Create OIDC provider** in each member account using your EKS cluster's OIDC issuer URL.
2. **Create or update IAM role** in each account with a trust policy allowing the OIDC provider to assume it via `AssumeRoleWithWebIdentity`.
3. **Attach `ReadOnlyAccess` policy** to each role.

See the detailed [manual setup instructions](#manual-setup-click-to-expand) in the AWS Organizations section above, or use CloudFormation StackSets for automated deployment.

<h4>Install</h4>

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
  --set integration.config.accountRoleArns='["arn:aws:iam::111111111111:role/AWSIntegrationRole","arn:aws:iam::222222222222:role/AWSIntegrationRole","arn:aws:iam::333333333333:role/AWSIntegrationRole"]' \
  --set integration.config.externalId="YOUR_EXTERNAL_ID"
```

</TabItem>

<TabItem value="explicit-keys-helm" label="With access keys">

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
  --set extraEnv[0].name="AWS_ACCESS_KEY_ID" \
  --set extraEnv[0].value="$AWS_ACCESS_KEY_ID" \
  --set extraEnv[1].name="AWS_SECRET_ACCESS_KEY" \
  --set extraEnv[1].value="$AWS_SECRET_ACCESS_KEY" \
  --set integration.config.accountRoleArns='["arn:aws:iam::111111111111:role/AWSIntegrationRole","arn:aws:iam::222222222222:role/AWSIntegrationRole","arn:aws:iam::333333333333:role/AWSIntegrationRole"]' \
  --set integration.config.externalId="YOUR_EXTERNAL_ID"
```

</TabItem>

</Tabs>

</TabItem>

</Tabs>

</TabItem>

<TabItem value="terraform" label="Terraform (Real time)">

The AWS v3 integration is deployed using Terraform on AWS ECS Fargate. It uses our Terraform [Ocean](https://ocean.getport.io) Integration Factory [module](https://registry.terraform.io/modules/port-labs/integration-factory/ocean/latest).

<h2>Prerequisites</h2>

- [Terraform](https://www.terraform.io/downloads.html) >= 1.9.1.
- AWS account with permissions to create ECS, IAM, and VPC resources.
- [AWS CLI 2](https://aws.amazon.com/cli/) configured with credentials.
- VPC with subnets for ECS deployment.

<h2>Single account installation</h2>

We'll start with the simplest setup: syncing resources from a single AWS account.

```bash showLineNumbers
# Log into your AWS account
aws sso login

# Create main.tf
cat > main.tf << 'EOF'
module "aws_v3" {
  source  = "port-labs/integration-factory/ocean//examples/aws_container_app"
  version = ">=0.0.44"

  port = {
    client_id     = "PORT_CLIENT_ID"
    client_secret = "PORT_CLIENT_SECRET"
    base_url      = "https://api.getport.io"
  }

  integration_version          = "latest"
  initialize_port_resources    = true
  scheduled_resync_interval    = 1440

  integration = {
    identifier = "my-aws-v3-integration"
    type       = "aws-v3"
    config     = {}
  }

  event_listener = {
    type = "POLLING"
  }

  # ECS Deployment Configuration
  cluster_name        = "port-ocean-aws-v3"
  vpc_id              = "vpc-xxxxx"
  subnets             = ["subnet-1", "subnet-2", "subnet-3"]
  create_default_sg   = true
  assign_public_ip    = true
  allow_incoming_requests = false
}
EOF

# Initialize and apply
terraform init
terraform apply
```

<h2>Multi-account installation</h2>

To sync resources from multiple AWS accounts, follow these steps:

<h3>Step 1: Set up IAM roles in your AWS accounts</h3>

You need to create IAM roles with `ReadOnlyAccess` in each account you want to sync.

<details>
<summary><b>Deploy using CloudFormation StackSet (click to expand)</b></summary>

:::tip Automated deployment
Use CloudFormation StackSets to deploy IAM roles across all your AWS Organization member accounts automatically.
:::

1. **Access the CloudFormation template**:
   - CloudFormation StackSet template will be available soon. Check back or contact Port support for the latest template.

2. **Deploy via AWS Console**:
   - Go to [AWS CloudFormation StackSets](https://console.aws.amazon.com/cloudformation/home#/stacksets).
   - Click **Create StackSet**.
   - Upload the template or provide the S3 URL.
   - Configure the following parameters:
     - **RoleName**: `PortOceanReadRole` (must be consistent across accounts).
     - **ExternalId**: Generate a secure external ID (e.g., using `openssl rand -hex 16`).
     - **TrustedPrincipal**: The ECS task role ARN (will be in Terraform outputs after first apply).

3. **Specify deployment targets**:
   - Choose **Deploy to organization** or **Deploy to specific accounts**.
   - Select the organizational units (OUs) or account IDs.

4. **Monitor deployment**:
   - Wait for StackSet instances to complete across all accounts.
   - Verify roles were created successfully in the CloudFormation console.

</details>

<details>
<summary><b>Manual IAM role setup (click to expand)</b></summary>

For each account you want to sync, create an IAM role with the following configuration.

<h4>Create the IAM role</h4>

Create an IAM role with this trust policy (replace placeholders):

```json showLineNumbers
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::BASE_ACCOUNT_ID:role/port-ocean-aws-v3-task-role"
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

- `BASE_ACCOUNT_ID`: The account where the integration runs.
- `YOUR_EXTERNAL_ID`: A secure external ID (same across all accounts).

<h4>Attach permissions</h4>

Attach the AWS managed `ReadOnlyAccess` policy:

```bash showLineNumbers
aws iam attach-role-policy \
  --role-name PortOceanReadRole \
  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
```

<h4>Note the role ARN</h4>

Copy the role ARN - you'll need it in the next step:
```
arn:aws:iam::ACCOUNT_ID:role/PortOceanReadRole
```

</details>

<h3>Step 2: Choose your account discovery strategy</h3>

<Tabs groupId="terraform-multi-strategy" queryString="terraform-multi-strategy" defaultValue="terraform-orgs">

<TabItem value="terraform-orgs" label="AWS Organizations (Automatic)">

```bash showLineNumbers
module "aws_v3_multi_account" {
  source  = "port-labs/integration-factory/ocean//examples/aws_container_app"
  version = ">=0.0.44"

  port = {
    client_id     = "PORT_CLIENT_ID"
    client_secret = "PORT_CLIENT_SECRET"
    base_url      = "https://api.getport.io"
  }

  integration_version          = "latest"
  initialize_port_resources    = true
  scheduled_resync_interval    = 1440

  integration = {
    identifier = "my-aws-v3-multi"
    type       = "aws-v3"
    config     = {
      account_role_arn = "arn:aws:iam::MEMBER_ACCOUNT_ID:role/PortOceanReadRole"
      external_id      = "YOUR_EXTERNAL_ID"
    }
  }

  event_listener = {
    type = "POLLING"
  }

  cluster_name        = "port-ocean-aws-v3"
  vpc_id              = "vpc-xxxxx"
  subnets             = ["subnet-1", "subnet-2"]
  create_default_sg   = true
  assign_public_ip    = true
  
  # Grant Organizations permissions to task role
  additional_task_policy_statements = [
    {
      actions   = ["organizations:ListAccounts", "organizations:DescribeOrganization", "sts:AssumeRole"]
      resources = ["*"]
    }
  ]
}
```

</TabItem>

<TabItem value="terraform-explicit" label="Explicit account list (Manual)">

```bash showLineNumbers
module "aws_v3_explicit_accounts" {
  source  = "port-labs/integration-factory/ocean//examples/aws_container_app"
  version = ">=0.0.44"

  port = {
    client_id     = "PORT_CLIENT_ID"
    client_secret = "PORT_CLIENT_SECRET"
    base_url      = "https://api.getport.io"
  }

  integration_version          = "latest"
  initialize_port_resources    = true
  scheduled_resync_interval    = 1440

  integration = {
    identifier = "my-aws-v3-explicit"
    type       = "aws-v3"
    config     = {
      account_role_arns = [
        "arn:aws:iam::111111111111:role/PortOceanReadRole",
        "arn:aws:iam::222222222222:role/PortOceanReadRole",
        "arn:aws:iam::333333333333:role/PortOceanReadRole"
      ]
      external_id = "YOUR_EXTERNAL_ID"
    }
  }

  event_listener = {
    type = "POLLING"
  }

  cluster_name        = "port-ocean-aws-v3"
  vpc_id              = "vpc-xxxxx"
  subnets             = ["subnet-1", "subnet-2"]
  create_default_sg   = true
  assign_public_ip    = true
}
```

</TabItem>

</Tabs>

<details>
<summary><b>Terraform variables reference (click to expand)</b></summary>

| Variable | Description | Required |
|----------|-------------|----------|
| `port.client_id` | Port API client ID | Yes |
| `port.client_secret` | Port API client secret | Yes |
| `port.base_url` | Port API URL (`https://api.getport.io` for EU, `https://api.us.getport.io` for US) | Yes |
| `integration_version` | AWS v3 integration image version | Yes |
| `integration.identifier` | Unique identifier for this integration instance | Yes |
| `integration.type` | Must be `aws-v3` | Yes |
| `integration.config.account_role_arn` | IAM role ARN for Organizations-based discovery | No |
| `integration.config.account_role_arns` | List of IAM role ARNs for explicit multi-account | No |
| `integration.config.external_id` | External ID for assume role trust policy | No |
| `vpc_id` | VPC ID for ECS deployment | Yes |
| `subnets` | List of subnet IDs for ECS tasks | Yes |
| `cluster_name` | ECS cluster name | No |
| `scheduled_resync_interval` | Resync interval in minutes | No |

</details>

<h2>Infrastructure created</h2>

The Terraform module creates:

- AWS ECS Fargate Service and Task Definition.
- IAM Task Role with `ReadOnlyAccess` policy.
- IAM Task Execution Role for ECS.
- AWS SSM Parameter Store secrets (Port credentials and integration config).
- CloudWatch Log Group.
- Security Groups (optional).
- Application Load Balancer (optional, for webhooks).

</TabItem>

<TabItem value="docker" label="Docker (Once)">

For one-time data synchronization or testing, you can run the integration using Docker.

<h2>Prerequisites</h2>

- [Docker](https://www.docker.com/get-started) installed.
- AWS credentials (access keys or IAM role if running on EC2).

<h2>Single account installation</h2>

We'll start with the simplest setup: syncing resources from a single AWS account.

<h3>Required environment variables</h3>

<details>
<summary><b>Environment variables (click to expand)</b></summary>

| Variable | Description |
|----------|-------------|
| `OCEAN__PORT__CLIENT_ID` | Your Port client ID |
| `OCEAN__PORT__CLIENT_SECRET` | Your Port client secret |
| `OCEAN__PORT__BASE_URL` | Port API URL (`https://api.getport.io` for EU, `https://api.us.getport.io` for US) |
| `OCEAN__INTEGRATION__IDENTIFIER` | Unique identifier for this integration instance |
| `OCEAN__EVENT_LISTENER` | Event listener configuration (JSON string) |
| `OCEAN__INITIALIZE_PORT_RESOURCES` | Whether to create default blueprints (`true` or `false`) |
| `OCEAN__INTEGRATION__SECRETS__AWS_ACCESS_KEY_ID` | AWS access key ID |
| `OCEAN__INTEGRATION__SECRETS__AWS_SECRET_ACCESS_KEY` | AWS secret access key |

</details>

<h3>Run</h3>

```bash showLineNumbers
docker run -i --rm --platform=linux/amd64 \
  -e OCEAN__PORT__CLIENT_ID="$PORT_CLIENT_ID" \
  -e OCEAN__PORT__CLIENT_SECRET="$PORT_CLIENT_SECRET" \
  -e OCEAN__PORT__BASE_URL="https://api.getport.io" \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
  -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
  -e OCEAN__INTEGRATION__IDENTIFIER="my-aws-v3" \
  -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
  -e OCEAN__INTEGRATION__SECRETS__AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
  -e OCEAN__INTEGRATION__SECRETS__AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
  ghcr.io/port-labs/port-ocean-aws-v3:latest
```

<h2>Multi-account installation</h2>

To sync resources from multiple AWS accounts, follow these steps:

<h3>Step 1: Set up IAM roles in your AWS accounts</h3>

You need to create IAM roles with `ReadOnlyAccess` in each account you want to sync.

<details>
<summary><b>Deploy using CloudFormation StackSet (click to expand)</b></summary>

:::tip Automated deployment
Use CloudFormation StackSets to deploy IAM roles across all your AWS Organization member accounts automatically.
:::

1. **Access the CloudFormation template**:
   - CloudFormation StackSet template will be available soon. Check back or contact Port support for the latest template.

2. **Deploy via AWS Console**:
   - Go to [AWS CloudFormation StackSets](https://console.aws.amazon.com/cloudformation/home#/stacksets).
   - Click **Create StackSet**.
   - Upload the template or provide the S3 URL.
   - Configure the following parameters:
     - **RoleName**: `PortOceanReadRole` (must be consistent across accounts).
     - **ExternalId**: Generate a secure external ID (e.g., using `openssl rand -hex 16`).
     - **TrustedPrincipal**: The IAM user ARN with your access keys (e.g., `arn:aws:iam::ACCOUNT_ID:user/port-ocean`).

3. **Specify deployment targets**:
   - Choose **Deploy to organization** or **Deploy to specific accounts**.
   - Select the organizational units (OUs) or account IDs.

4. **Monitor deployment**:
   - Wait for StackSet instances to complete across all accounts.
   - Verify roles were created successfully in the CloudFormation console.

</details>

<details>
<summary><b>Manual IAM role setup (click to expand)</b></summary>

For each account you want to sync, create an IAM role with the following configuration.

<h4>Create the IAM role</h4>

Create an IAM role with this trust policy (replace placeholders):

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

- `BASE_ACCOUNT_ID`: The account where the integration runs.
- `YOUR_EXTERNAL_ID`: A secure external ID (same across all accounts).

<h4>Attach permissions</h4>

Attach the AWS managed `ReadOnlyAccess` policy:

```bash showLineNumbers
aws iam attach-role-policy \
  --role-name PortOceanReadRole \
  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
```

<h4>Note the role ARN</h4>

Copy the role ARN - you'll need it in the next step:
```
arn:aws:iam::ACCOUNT_ID:role/PortOceanReadRole
```

</details>

<h3>Step 2: Choose your account discovery strategy</h3>

<Tabs groupId="docker-multi-strategy" queryString="docker-multi-strategy" defaultValue="docker-orgs">

<TabItem value="docker-orgs" label="AWS Organizations (Automatic)">

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
  -e OCEAN__INTEGRATION__CONFIG__ACCOUNT_ROLE_ARN="arn:aws:iam::MEMBER_ACCOUNT_ID:role/PortOceanReadRole" \
  -e OCEAN__INTEGRATION__CONFIG__EXTERNAL_ID="YOUR_EXTERNAL_ID" \
  ghcr.io/port-labs/port-ocean-aws-v3:latest
```

</TabItem>

<TabItem value="docker-explicit" label="Explicit account list (Manual)">

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

</TabItem>

</Tabs>

## Advanced configuration

### Region filtering

To control which AWS regions are queried, configure the `regionPolicy` selector in your resource configuration:

```yaml showLineNumbers
resources:
  - kind: AWS::S3::Bucket
    selector:
      query: 'true'
      regionPolicy:
        allow:
          - us-east-1
          - eu-west-1
        deny:
          - ap-south-1
```

For more details, see [querying resources from specific regions](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/resource-and-property-reference/resource-and-property-reference.md#querying-resources-from-specific-regions).

### Additional resource properties

To collect additional properties via extra AWS API calls, use the `includeActions` selector (maximum 3 actions per resource):

```yaml showLineNumbers
resources:
  - kind: AWS::S3::Bucket
    selector:
      query: 'true'
      includeActions:
        - GetBucketVersioning
        - GetBucketEncryption
```

For more details, see [including additional AWS API actions](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/resource-and-property-reference/resource-and-property-reference.md#including-additional-aws-api-actions).

### Concurrent account syncing

To control the maximum number of accounts synced concurrently, configure `maxConcurrentAccounts`:

```yaml showLineNumbers
resources:
  - kind: AWS::S3::Bucket
    selector:
      query: 'true'
      maxConcurrentAccounts: 10
```

The default value is 5.

## Troubleshooting

### Common installation issues

**Error**: `Unable to assume role`

**Solutions**:
- Verify the IAM role ARN is correct.
- Ensure the trust policy allows your base credentials to assume the role.
- Check that the `externalId` matches on both sides (if configured).
- Verify the base credentials have `sts:AssumeRole` permission.

**Error**: `No resources discovered`

**Solutions**:
- Verify the IAM role has `ReadOnlyAccess` or equivalent permissions.
- Check that the regions you want to query are not blocked by `regionPolicy`.
- Ensure the integration has network access to AWS APIs.

**Error**: `Access denied to Organizations API`

**Solutions**:
- Ensure the base credentials have `organizations:ListAccounts` permission.
- Verify AWS Organizations is enabled in your management account.
- Check that you're using the correct account (management or delegated administrator).
