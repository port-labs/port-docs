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

## Understanding single vs multi-account setup

Before configuring authentication, you need to decide whether you're syncing a single AWS account or multiple accounts. This determines which permissions your authentication needs.

<h3>Single account</h3>

Syncs resources from one AWS account only.

**Use this if:**
- You have one AWS account.
- You want to test the integration before expanding.

**Permissions needed:**
- `ReadOnlyAccess` policy only.

<h3>Multi-account</h3>

Syncs resources from multiple AWS accounts using cross-account role assumption.

**Use this if:**
- You have multiple AWS accounts (2+).
- You use AWS Organizations or manually manage multiple accounts.

**How it works:**
1. The integration authenticates to your base account using IRSA, ECS Task Role, or Access Keys.
2. You create IAM roles with `ReadOnlyAccess` in each member account.
3. Each member account's role trusts your base identity to assume it.
4. The integration calls `AssumeRole` (or `AssumeRoleWithWebIdentity` for IRSA) to get temporary credentials for each member account.
5. With those credentials, it reads resources and syncs them to Port.

**External ID** is a security feature required for cross-account access. It's a secret value that both parties must know when assuming roles, preventing the "confused deputy problem."

**Permissions needed in your base account:**

| Permission | Required For | Purpose |
|------------|-------------|---------|
| `ReadOnlyAccess` | All setups | Read AWS resources |
| `sts:AssumeRole` | ECS Task Role, Access Keys multi-account | Assume roles in member accounts |
| `sts:AssumeRoleWithWebIdentity` | IRSA multi-account | Assume roles in member accounts using OIDC |
| `organizations:ListAccounts` | Organizations automatic discovery | List all accounts in your organization |
| `organizations:DescribeOrganization` | Organizations automatic discovery | Get organization details |

**Account discovery strategies for multi-account:**

- **Organizations mode**: Automatically discovers all accounts via AWS Organizations API. Requires Organizations permissions. Best for large setups (10+ accounts).
- **Explicit list mode**: You manually provide a list of role ARNs to assume. No Organizations permissions needed. Best for smaller setups (2-10 accounts).

## Authentication to aws

Now that you understand your setup type (single or multi-account), we'll configure authentication with the correct permissions.

The integration needs to authenticate to AWS to read your resources. Choose the authentication method that matches your deployment infrastructure.

<Tabs groupId="auth-methods" queryString="auth-methods" defaultValue="irsa">

<TabItem value="irsa" label="IRSA (For EKS)">

**Use this if:** You're deploying with Helm on Amazon EKS.

IRSA (IAM Roles for Service Accounts) provides secure, keyless authentication by linking Kubernetes service accounts to IAM roles using OpenID Connect (OIDC). This eliminates the need for long-term access keys.

<h3>Setup steps</h3>

1. **Create an IAM role** with the following configuration:
   - Go to **AWS Console → IAM → Roles → Create role**.
   - Select **Web identity** as the trust entity type.
   - Choose your EKS cluster's OIDC provider as the identity provider.
   - Set the audience to `sts.amazonaws.com`.
   - Name the role `port-ocean-aws-v3-role`.

2. **Attach permissions based on your setup**:

**For single account:**
- Attach the `arn:aws:iam::aws:policy/ReadOnlyAccess` policy.

**For multi-account:**
- Attach the `arn:aws:iam::aws:policy/ReadOnlyAccess` policy.
- Create and attach an inline policy with these additional permissions:

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
    },
    {
      "Effect": "Allow",
      "Action": [
        "organizations:ListAccounts",
        "organizations:DescribeOrganization"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "aws:RequestedRegion": "us-east-1"
        }
      }
    }
  ]
}
```

:::info Organizations permissions
The `organizations:*` permissions are only needed if you're using Organizations automatic discovery. For explicit list mode, you can omit them.
:::

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

</TabItem>

<TabItem value="task-role" label="ECS Task Role (For ECS)">

**Use this if:** You're deploying with Terraform on AWS ECS Fargate.

ECS Task Roles allow your containerized application to assume an IAM role automatically. The Terraform module creates and manages this role for you, granting it the necessary permissions.

<h3>Setup steps</h3>

The Terraform Ocean Integration Factory module automatically creates an ECS Task Role when you deploy.

**For single account:**
- The module automatically attaches `ReadOnlyAccess` policy.
- No additional configuration needed.

**For multi-account:**
- Use the `additional_task_policy_statements` parameter to grant additional permissions:

```hcl showLineNumbers
additional_task_policy_statements = [
  {
    actions   = ["sts:AssumeRole"]
    resources = ["*"]
  },
  {
    actions   = ["organizations:ListAccounts", "organizations:DescribeOrganization"]
    resources = ["*"]
  }
]
```

:::info Organizations permissions
The `organizations:*` permissions are only needed if you're using Organizations automatic discovery. For explicit list mode, you can omit them.
:::

See the deployment examples below for complete Terraform configuration.

</TabItem>

<TabItem value="access-keys" label="AWS access keys (Universal)">

**Use this if:** 
- You're deploying with Helm on non-EKS Kubernetes.
- You're running Docker locally or on EC2 without instance roles.
- You need a quick setup for testing.

AWS access keys provide programmatic access using a static access key ID and secret access key pair. Store these securely as they're long-term credentials.

<h3>Setup steps</h3>

1. [Create an IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html) in your AWS account.

2. **Attach permissions based on your setup**:

**For single account:**
- Attach the `arn:aws:iam::aws:policy/ReadOnlyAccess` policy.

**For multi-account:**
- Attach the `arn:aws:iam::aws:policy/ReadOnlyAccess` policy.
- Create and attach an inline policy with these additional permissions:

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
    },
    {
      "Effect": "Allow",
      "Action": [
        "organizations:ListAccounts",
        "organizations:DescribeOrganization"
      ],
      "Resource": "*"
    }
  ]
}
```

:::info Organizations permissions
The `organizations:*` permissions are only needed if you're using Organizations automatic discovery. For explicit list mode, you can omit them.
:::

3. [Generate access keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html) for the user:
   - Go to **IAM → Users → Security credentials → Create access key**.
   - Save the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.

:::caution Secure your credentials
Never commit access keys to version control. Use environment variables or secret management tools to store them securely.
:::

</TabItem>

</Tabs>

## Multi-account setup (optional)

If you're syncing multiple AWS accounts, complete this section to create IAM roles in your member accounts. If you're only syncing a single account, skip to [choose your deployment method](#choose-your-deployment-method).

<h3>Setting up cross-account IAM roles</h3>

You need to create IAM roles with `ReadOnlyAccess` in each member account you want to sync. Choose the method that fits your organization:

<h4>Option 1: Deploy using CloudFormation StackSet</h4>

:::tip Automate with CloudFormation StackSets
Use CloudFormation StackSets to deploy IAM roles across all your AWS Organization member accounts automatically.
:::

:::info IRSA users need different StackSet template
If you're using IRSA authentication, you'll need a StackSet template that creates both OIDC providers and IAM roles in member accounts. Contact Port support for the IRSA-specific CloudFormation StackSet template, or use the manual setup below.
:::

**For ECS Task Role and Access Keys:**

**Prerequisites:**
- AWS Organizations enabled.
- StackSet permissions in your management account.
- Know your trusted principal:
  - **ECS Task Role**: Your ECS task role ARN (from Terraform output after first apply)
  - **Access Keys**: Your IAM user ARN (e.g., `arn:aws:iam::BASE_ACCOUNT:user/port-ocean`)

**Steps:**

1. **Access the CloudFormation template**:
   - CloudFormation StackSet template will be available soon. Check back or contact Port support for the latest template.

2. **Deploy via AWS Console**:
   - Go to [AWS CloudFormation StackSets](https://console.aws.amazon.com/cloudformation/home#/stacksets).
   - Click **Create StackSet**.
   - Upload the template or provide the S3 URL.
   - Configure the following parameters:
     - **RoleName**: `PortOceanReadRole` (must be consistent across accounts).
     - **ExternalId**: Generate a secure external ID (e.g., using `openssl rand -hex 16`).
     - **TrustedPrincipal**: Your trusted principal ARN from prerequisites above.

3. **Specify deployment targets**:
   - Choose **Deploy to organization** or **Deploy to specific accounts**.
   - Select the organizational units (OUs) or account IDs.

4. **Monitor deployment**:
   - Wait for StackSet instances to complete across all accounts.
   - Verify roles were created successfully in the CloudFormation console.

5. **Note the role name and external ID**:
   - Role ARN format: `arn:aws:iam::MEMBER_ACCOUNT_ID:role/PortOceanReadRole`
   - You'll need the role name and external ID when configuring your deployment below.

<h4>Option 2: Manual IAM role setup</h4>

We'll create IAM roles in each member account you want to sync. The setup steps differ based on your authentication method.

<Tabs groupId="manual-iam-auth" queryString="manual-iam-auth" defaultValue="irsa-manual">

<TabItem value="irsa-manual" label="For IRSA (EKS)">

IRSA authentication requires OIDC provider setup in each member account, as the trust relationship uses OpenID Connect rather than standard IAM role assumption.

<h4>Step 1: Get your EKS cluster's OIDC issuer URL</h4>

Run this command in your base account (where the integration runs):

```bash showLineNumbers
aws eks describe-cluster --name CLUSTER_NAME --region REGION --query "cluster.identity.oidc.issuer" --output text
```

This returns a URL like: `https://oidc.eks.REGION.amazonaws.com/id/OIDC_ID`

<h4>Step 2: Create OIDC provider in each member account</h4>

For each member account, create an OIDC identity provider:

```bash showLineNumbers
aws iam create-open-id-connect-provider \
  --url https://oidc.eks.REGION.amazonaws.com/id/OIDC_ID \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 9e99a48a9960b14926bb7f3b02e22da2b0ab7280
```

Replace `REGION` and `OIDC_ID` with values from step 1.

<h4>Step 3: Create IAM role in each member account</h4>

Create an IAM role with this trust policy:

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
          "oidc.eks.REGION.amazonaws.com/id/OIDC_ID:aud": "sts.amazonaws.com",
          "oidc.eks.REGION.amazonaws.com/id/OIDC_ID:sub": "system:serviceaccount:port-ocean:port-ocean-aws-v3"
        }
      }
    }
  ]
}
```

Replace:
- `MEMBER_ACCOUNT_ID`: The member account ID where you're creating this role.
- `REGION`: Your EKS cluster region.
- `OIDC_ID`: Your EKS cluster's OIDC ID from step 1.

<h4>Step 4: Attach permissions</h4>

Attach the AWS managed `ReadOnlyAccess` policy to the role:

```bash showLineNumbers
aws iam attach-role-policy \
  --role-name AWSIntegrationRole \
  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
```

<h4>Step 5: Note the role ARN</h4>

Copy the role ARN from each member account. You'll need these when configuring your deployment:

```
arn:aws:iam::MEMBER_ACCOUNT_ID:role/AWSIntegrationRole
```

Repeat steps 2-5 for each member account.

</TabItem>

<TabItem value="ecs-manual" label="For ECS Task Role (Terraform)">

ECS Task Roles use standard IAM role assumption with an external ID for security.

<h4>Step 1: Create IAM role in each member account</h4>

Create an IAM role with this trust policy:

```json showLineNumbers
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::BASE_ACCOUNT_ID:role/ECS_TASK_ROLE_NAME"
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
- `BASE_ACCOUNT_ID`: The account where your ECS integration runs.
- `ECS_TASK_ROLE_NAME`: Your ECS task role name (you'll get this from Terraform outputs after first deployment).
- `YOUR_EXTERNAL_ID`: Generate a secure external ID using `openssl rand -hex 16`. Use the same value across all member accounts.

<h4>Step 2: Attach permissions</h4>

Attach the AWS managed `ReadOnlyAccess` policy:

```bash showLineNumbers
aws iam attach-role-policy \
  --role-name PortOceanReadRole \
  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
```

<h4>Step 3: Note the role ARN</h4>

Copy the role ARN from each member account:

```
arn:aws:iam::MEMBER_ACCOUNT_ID:role/PortOceanReadRole
```

Repeat steps 1-3 for each member account.

</TabItem>

<TabItem value="keys-manual" label="For Access Keys">

Access keys use standard IAM role assumption with an external ID for security.

<h4>Step 1: Create IAM role in each member account</h4>

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
- `YOUR_EXTERNAL_ID`: Generate a secure external ID using `openssl rand -hex 16`. Use the same value across all member accounts.

<h4>Step 2: Attach permissions</h4>

Attach the AWS managed `ReadOnlyAccess` policy:

```bash showLineNumbers
aws iam attach-role-policy \
  --role-name PortOceanReadRole \
  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
```

<h4>Step 3: Note the role ARN</h4>

Copy the role ARN from each member account:

```
arn:aws:iam::MEMBER_ACCOUNT_ID:role/PortOceanReadRole
```

Repeat steps 1-3 for each member account.

</TabItem>

</Tabs>

## Choose your deployment method

Select the deployment method that best fits your infrastructure:

<Tabs groupId="installation-methods" queryString="installation-methods" defaultValue="helm">

<TabItem value="helm" label="Helm (Scheduled)">

The AWS integration is deployed using Helm on your Kubernetes cluster. This deployment supports scheduled resyncs of resources from AWS to Port.

<h2>Prerequisites</h2>

- [Helm](https://helm.sh/docs/intro/install/) >= 3.0.0.
- Kubernetes cluster to deploy the integration.
- AWS authentication configured (see [IRSA](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted.md?auth-methods=irsa) or [Access Keys](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted.md?auth-methods=access-keys) in authentication section above).

<h2>Single account installation</h2>

We'll start with the simplest setup: syncing resources from a single AWS account.

<Tabs groupId="helm-single-install" queryString="helm-single-install" defaultValue="irsa-install">

<TabItem value="irsa-install" label="With IRSA">

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
  --set integration.secrets.awsAccessKeyId="$AWS_ACCESS_KEY_ID" \
  --set integration.secrets.awsSecretAccessKey="$AWS_SECRET_ACCESS_KEY"
```

</TabItem>

</Tabs>

<PortApiRegionTip/>

<h2>Multi-account installation</h2>

:::info Complete multi-account setup first
If you haven't already, complete the [multi-account setup section](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted.md#multi-account-setup-optional) above to create IAM roles in your member accounts.
:::

Now configure the Helm deployment to use those roles.

<h3>Choose your account discovery strategy</h3>

<Tabs groupId="multi-account-strategy" queryString="multi-account-strategy" defaultValue="organizations">

<TabItem value="organizations" label="AWS Organizations (Automatic)">

If you have AWS Organizations enabled, the integration can automatically discover all member accounts.

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
  --set integration.secrets.awsAccessKeyId="$AWS_ACCESS_KEY_ID" \
  --set integration.secrets.awsSecretAccessKey="$AWS_SECRET_ACCESS_KEY" \
  --set integration.config.accountRoleArn="arn:aws:iam::MEMBER_ACCOUNT_ID:role/PortOceanReadRole" \
  --set integration.config.externalId="YOUR_EXTERNAL_ID"
```

</TabItem>

</Tabs>

:::info How Organizations mode works
The integration uses IRSA to call the AWS Organizations API and discover all member accounts. For each account, it assumes the `AWSIntegrationRole` using `AssumeRoleWithWebIdentity`. This requires the OIDC provider to be configured in each member account.
:::

</TabItem>

<TabItem value="explicit" label="Explicit account list (Manual)">

If you don't use AWS Organizations or want to specify exact accounts, you can provide a list of role ARNs.

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
  --set integration.secrets.awsAccessKeyId="$AWS_ACCESS_KEY_ID" \
  --set integration.secrets.awsSecretAccessKey="$AWS_SECRET_ACCESS_KEY" \
  --set integration.config.accountRoleArns='["arn:aws:iam::111111111111:role/AWSIntegrationRole","arn:aws:iam::222222222222:role/AWSIntegrationRole","arn:aws:iam::333333333333:role/AWSIntegrationRole"]' \
  --set integration.config.externalId="YOUR_EXTERNAL_ID"
```

</TabItem>

</Tabs>

:::info How explicit list mode works
The integration receives a specific list of role ARNs to assume. It uses `AssumeRole` (or `AssumeRoleWithWebIdentity` for IRSA) with the external ID to get temporary credentials for each role in the list, then syncs resources from those accounts.
:::

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
- AWS authentication configured (see [ECS Task Role](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted.md?auth-methods=task-role) in authentication section above).

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

:::info Complete multi-account setup first
If you haven't already, complete the [multi-account setup section](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted.md#multi-account-setup-optional) above to create IAM roles in your member accounts.
:::

Now configure your Terraform deployment to use those roles. The Terraform module will automatically grant your ECS task role the necessary `organizations:*` and `sts:AssumeRole` permissions via the `additional_task_policy_statements` parameter.

<h3>Choose your account discovery strategy</h3>

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
- AWS authentication configured (see [Access Keys](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted.md?auth-methods=access-keys) in authentication section above).

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

:::info Complete multi-account setup first
If you haven't already, complete the [multi-account setup section](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted.md#multi-account-setup-optional) above to create IAM roles in your member accounts.
:::

Now configure your Docker deployment to use those roles.

<h3>Choose your account discovery strategy</h3>

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
