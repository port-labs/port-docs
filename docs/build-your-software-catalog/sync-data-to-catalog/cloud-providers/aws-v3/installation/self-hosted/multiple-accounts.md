---
sidebar_position: 2
sidebar_label: Multi account
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import IntegrationVersion from "/src/components/IntegrationVersion/IntegrationVersion"

# Multiple accounts installation

<IntegrationVersion integration="aws-v3" />

We'll walk you through syncing resources from multiple AWS accounts.

## Prerequisites

Before installing the integration, ensure you have:

- [Port API credentials](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials) (`PORT_CLIENT_ID` and `PORT_CLIENT_SECRET`).
- Permissions to create IAM roles and deploy Kubernetes resources.

## Choose authentication method

Select the authentication method that best fits your infrastructure and security requirements:

- **IAM Role** : Use when deploying on AWS ECS services. Provides automatic credential management through IAM roles attached to your AWS resources.

- **IAM Role for service accounts(IRSA)**: Use when deploying on Amazon EKS with IRSA. Provides secure authentication through IAM Roles for Service Accounts.

<Tabs groupId="multiple-account-auth" queryString="multiple-account-auth" defaultValue="iam-role">

<TabItem value="iam-role" label="IAM Role">

**Prerequisites:**
- AWS compute service (ECS or EC2) with an attached IAM role that has permissions to assume roles in target accounts.
- Permissions to create IAM roles in target accounts.

**Trusted entity:**

The trusted entity for IAM Role authentication is the AWS service principal:
- For ECS: `ecs-tasks.amazonaws.com`
- For EC2: `ec2.amazonaws.com`

This allows your compute service to assume the IAM role automatically.

**Account terminology:**

- **Target accounts**: The AWS accounts that you want to sync resources from. These accounts contain IAM roles with trust policies that allow your compute service's IAM role to assume them. In AWS Organizations setups, target accounts are also referred to as member accounts.
- **Management account** (Organizations only): Your AWS Organizations management account. This is where you deploy CloudFormation StackSets and where the Organizations API is accessible. For automatic account discovery, you need a role ARN from this account.

**Choose account discovery method:**

<Tabs groupId="iam-role-discovery" queryString="iam-role-discovery" defaultValue="automatic">

<TabItem value="automatic" label="Organizations">

**Understanding automatic account discovery:**

Automatic account discovery uses the Organizations API to discover all member accounts in your organization. The integration automatically finds and syncs all accounts without requiring you to list them manually.

:::info Alternative option
To manually specify which accounts to sync, see the [Non organizations tab](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts.md?multiple-account-auth=iam-role&iam-role-discovery=specify).
:::

**Prerequisites:**
- AWS Organizations enabled.
- Access to your AWS Organizations management account.

**How it works:**

1. Your compute service (ECS or EC2) gets credentials from its **attached IAM role** authenticated via the trusted entity.
2. The integration assumes the **configured organization role** (specified in `account_role_arn`) to access AWS Organizations API and discover all member accounts
3. It uses AWS Organizations `list_accounts` API to discover all active accounts in the organization
4. For each discovered account, it assumes a role in that account to get temporary credentials and sync resources to Port

**Configure IAM role for cross-account access:**

Your compute service needs an IAM role with permissions to assume roles in target accounts. Create the IAM role (for ECS, this will be used as `taskRoleArn` in your task definition; for EC2, this will be attached via instance profile) with the following permissions:

1. **Create the IAM role**: Create the role and select the appropriate service as the trusted entity.

2. **Add the following inline policy** to the role to allow role assumption:

```json showLineNumbers
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sts:AssumeRole"
      ],
      "Resource": [
        "arn:aws:iam::*:role/PortOceanReadRole"
      ]
    }
  ]
}
```

**Deploy read-only IAM roles to target accounts:**

Use CloudFormation StackSets to deploy IAM roles across your AWS Organization member accounts automatically. You can target specific accounts, organizational units, or all accounts.

:::caution Management account required
Run the StackSet deployment from your AWS Organizations **management account**, as only the management account can deploy StackSets across member accounts.
:::

<h4>Step 1: Prepare Your Organization</h4>

- **Find your OU ID** (if deploying to an organizational unit):
  - Log into your AWS Organizations management account.
  - Navigate to [AWS Organizations](https://us-east-1.console.aws.amazon.com/organizations/v2/home/accounts) service.
  - Under **Organizational structure**, copy the OU ID from the details page (format `ou-xxxx-xxxxxxxx` or `r-xxxx`).
  - You can also target specific account IDs if needed.

- **Identify your base account**:
  - The base account is where your compute service (ECS or EC2) runs with the attached IAM role.
  - Note the account ID where your service is deployed.

- **Generate an external ID**:
  - Generate a secure external ID using: `openssl rand -hex 16`
  - Save this value - use the same external ID across all member accounts.

<h4>Step 2: Deploy CloudFormation StackSet</h4>

- **Access AWS console**:
  - Go to [AWS CloudFormation StackSets](https://console.aws.amazon.com/cloudformation/home#/stacksets).
  - Click **Create StackSet**.

- **Configure StackSet**:
  - Choose **Template is ready** and provide the S3 URL for the IAM role template.
  - Configure stack parameters:
    - **RoleName**: Enter a consistent role name (e.g., `PortOceanReadRole`).
    - **TrustedPrincipalARN**: Enter your IAM role ARN from the base account (for ECS, this is the role specified in `taskRoleArn`; for EC2, this is the role attached via instance profile).
    - **ExternalId**: Enter the external ID you generated.
  - Specify deployment targets (organization, OU, or specific accounts).
  - Review and create the StackSet.

<h4>Step 2: Monitor Deployment</h4>

- **Check StackSet status**:
  - Check StackSet status in your management account.
  - Verify IAM roles exist in target accounts with correct permissions.

<h4>Step 3: Note the Role ARN</h4>

- **Get the role ARN**:
  - Get the role ARN from your management account. For automatic account discovery, you only need this one role ARN.
  - Format: `arn:aws:iam::ORG_ACCOUNT_ID:role/ROLE_NAME`

**Deploy the integration:**

The `accountRoleArn` in automatic account discovery mode should reference the role in your **organization/management account**.

Choose your deployment method:

<Tabs groupId="deployment-method-iam-auto" queryString="deployment-method-iam-auto" defaultValue="ecs">

<TabItem value="ecs" label="ECS">

Deploy the AWS integration as an ECS service. Follow the [AWS ECS documentation](https://docs.aws.amazon.com/ecs/) to create your ECS cluster and service.

<h4>Integration Configuration</h4>

When creating your ECS task definition, use the following task definition:

```json showLineNumbers
{
  "family": "port-ocean-aws-v3",
  "taskRoleArn": "arn:aws:iam::BASE_ACCOUNT_ID:role/PortOceanTaskRole",
  "executionRoleArn": "arn:aws:iam::BASE_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "port-ocean-aws",
      "image": "ghcr.io/port-labs/port-ocean-aws-v3:latest",
      "essential": true,
      "environment": [
        {"name": "OCEAN__PORT__CLIENT_ID", "value": "YOUR_PORT_CLIENT_ID"},
        {"name": "OCEAN__PORT__CLIENT_SECRET", "value": "YOUR_PORT_CLIENT_SECRET"},
        {"name": "OCEAN__PORT__BASE_URL", "value": "https://api.getport.io"},
        {"name": "OCEAN__INTEGRATION__IDENTIFIER", "value": "my-aws-v3-org"},
        {"name": "OCEAN__INTEGRATION__TYPE", "value": "aws-v3"},
        {"name": "OCEAN__EVENT_LISTENER", "value": "{\"type\":\"POLLING\"}"},
        {"name": "OCEAN__SCHEDULED_RESYNC_INTERVAL", "value": "1440"},
        {"name": "OCEAN__INTEGRATION__CONFIG__ACCOUNT_ROLE_ARN", "value": "arn:aws:iam::ORG_ACCOUNT_ID:role/PortOceanReadRole"},
        {"name": "OCEAN__INTEGRATION__CONFIG__EXTERNAL_ID", "value": "YOUR_EXTERNAL_ID"}
      ]
    }
  ]
}
```

</TabItem>

<TabItem value="ec2" label="EC2 (Docker)">

Deploy the AWS integration on an EC2 instance. The integration runs as a Docker container with the IAM role attached via instance profile.

**Prerequisites:**
- EC2 instance with Docker installed.
- IAM instance profile created and attached to the EC2 instance.
- The IAM role created above attached to the instance profile.

```bash showLineNumbers
docker run -d --restart unless-stopped --platform=linux/amd64 \
  -e OCEAN__PORT__CLIENT_ID="YOUR_PORT_CLIENT_ID" \
  -e OCEAN__PORT__CLIENT_SECRET="YOUR_PORT_CLIENT_SECRET" \
  -e OCEAN__PORT__BASE_URL="https://api.getport.io" \
  -e OCEAN__INITIALIZE_PORT_RESOURCES="true" \
  -e OCEAN__SEND_RAW_DATA_EXAMPLES="true" \
  -e OCEAN__EVENT_LISTENER='{"type": "POLLING", "resyncInterval": 1440}' \
  -e OCEAN__INTEGRATION__IDENTIFIER="my-aws-v3-org" \
  -e OCEAN__INTEGRATION__TYPE="aws-v3" \
  -e OCEAN__INTEGRATION__CONFIG__ACCOUNT_ROLE_ARN="arn:aws:iam::ORG_ACCOUNT_ID:role/PortOceanReadRole" \
  -e OCEAN__INTEGRATION__CONFIG__EXTERNAL_ID="YOUR_EXTERNAL_ID" \
  ghcr.io/port-labs/port-ocean-aws-v3:latest
```

</TabItem>

</Tabs>


</TabItem>

<TabItem value="specify" label="Non Organization">

**Explicit account configuration:**

Choose which AWS accounts to sync by providing a list of role ARNs. You control exactly which accounts are synced by listing their role ARNs in the integration configuration.

:::info Alternative option
To use automatic account discovery with AWS Organizations, see the [Automatic account discovery tab](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts.md?multiple-account-auth=iam-role&iam-role-discovery=automatic).
:::

**How it works:**

1. Your compute service (ECS or EC2) gets credentials from its **attached IAM role** (authenticated via the trusted entity - `ecs-tasks.amazonaws.com` for ECS or `ec2.amazonaws.com` for EC2)
2. You manually provide a **list of account role ARNs** (specified in `account_role_arns`) for the accounts you want to sync
3. For each account in the list, it assumes the **specified role** in that account to get temporary credentials
4. With those credentials, it reads resources from each specified account and syncs them to Port

**Configure IAM role for cross-account access:**

Your compute service needs an IAM role with permissions to assume roles in target accounts. Create the IAM role (for ECS, this will be used as `taskRoleArn` in your task definition; for EC2, this will be attached via instance profile) with the following permissions:

1. **Create the IAM role**: Create the role and select the appropriate service as the trusted entity.

2. **Add the following inline policy** to the role to allow role assumption:

```json showLineNumbers
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "sts:AssumeRole"
      ],
      "Resource": [
        "arn:aws:iam::*:role/PortOceanReadRole"
      ]
    }
  ]
}
```

**Deploy read-only IAM roles to target accounts:**

Use CloudFormation StackSets to deploy IAM roles across your AWS Organization member accounts automatically. You can target specific accounts, organizational units, or all accounts.

:::caution Management account required
Run the StackSet deployment from your AWS Organizations **management account**, as only the management account can deploy StackSets across member accounts.
:::

<h4>Step 1: Prepare Your Organization</h4>

- **Find your OU ID** (if deploying to an organizational unit):
  - Log into your AWS Organizations management account.
  - Navigate to [AWS Organizations](https://us-east-1.console.aws.amazon.com/organizations/v2/home/accounts) service.
  - Under **Organizational structure**, copy the OU ID from the details page (format `ou-xxxx-xxxxxxxx` or `r-xxxx`).
  - You can also target specific account IDs if needed.

- **Identify your base account**:
  - The base account is where your compute service (ECS or EC2) runs with the attached IAM role.
  - Note the account ID where your service is deployed.

- **Generate an external ID**:
  - Generate a secure external ID using: `openssl rand -hex 16`
  - Save this value - use the same external ID across all member accounts.

<h4>Step 2: Deploy CloudFormation StackSet</h4>

- **Access AWS console**:
  - Go to [AWS CloudFormation StackSets](https://console.aws.amazon.com/cloudformation/home#/stacksets).
  - Click **Create StackSet**.

- **Configure StackSet**:
  - Choose **Template is ready** and provide the S3 URL for the IAM role template.
  - Configure stack parameters:
    - **RoleName**: Enter a consistent role name (e.g., `PortOceanReadRole`).
    - **TrustedPrincipalARN**: Enter your IAM role ARN from the base account (for ECS, this is the role specified in `taskRoleArn`; for EC2, this is the role attached via instance profile).
    - **ExternalId**: Enter the external ID you generated.
  - Specify deployment targets (organization, OU, or specific accounts).
  - Review and create the StackSet.

<h4>Step 3: Monitor Deployment</h4>

- **Check StackSet status**:
  - Check StackSet status in your management account.
  - Verify IAM roles exist in target accounts with correct permissions.

<h4>Step 4: Collect Role ARNs</h4>

- **Get role ARNs from each account**:
  - Format: `arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME`
  - Example: `arn:aws:iam::234567890123:role/PortOceanReadRole`

**Deploy the integration:**

Choose your deployment method:

<Tabs groupId="deployment-method-iam-specify" queryString="deployment-method-iam-specify" defaultValue="ecs">

<TabItem value="ecs" label="ECS">

Deploy the AWS integration as an ECS service. Follow the [AWS ECS documentation](https://docs.aws.amazon.com/ecs/) to create your ECS cluster and service.

<h4>Integration Configuration</h4>

When creating your ECS task definition, use the following task definition with your specified account role ARNs:

```json showLineNumbers
{
  "family": "port-ocean-aws-v3",
  "taskRoleArn": "arn:aws:iam::BASE_ACCOUNT_ID:role/PortOceanTaskRole",
  "executionRoleArn": "arn:aws:iam::BASE_ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "port-ocean-aws",
      "image": "ghcr.io/port-labs/port-ocean-aws-v3:latest",
      "essential": true,
      "environment": [
        {"name": "OCEAN__PORT__CLIENT_ID", "value": "YOUR_PORT_CLIENT_ID"},
        {"name": "OCEAN__PORT__CLIENT_SECRET", "value": "YOUR_PORT_CLIENT_SECRET"},
        {"name": "OCEAN__PORT__BASE_URL", "value": "https://api.getport.io"},
        {"name": "OCEAN__INTEGRATION__IDENTIFIER", "value": "my-aws-v3-multi"},
        {"name": "OCEAN__INTEGRATION__TYPE", "value": "aws-v3"},
        {"name": "OCEAN__EVENT_LISTENER", "value": "{\"type\":\"POLLING\"}"},
        {"name": "OCEAN__SCHEDULED_RESYNC_INTERVAL", "value": "1440"},
        {"name": "OCEAN__INTEGRATION__CONFIG__ACCOUNT_ROLE_ARNS", "value": "[\"arn:aws:iam::111111111111:role/PortOceanReadRole\",\"arn:aws:iam::222222222222:role/PortOceanReadRole\",\"arn:aws:iam::333333333333:role/PortOceanReadRole\"]"},
        {"name": "OCEAN__INTEGRATION__CONFIG__EXTERNAL_ID", "value": "YOUR_EXTERNAL_ID"}
      ]
    }
  ]
}
```

:::info IAM Role Authentication
The `ACCOUNT_ROLE_ARNS` parameter must be a valid JSON array string containing your specified account role ARNs. No AWS access keys are needed - the integration automatically uses credentials from the attached IAM role (ECS task role or EC2 instance profile).
:::

</TabItem>

<TabItem value="ec2" label="EC2 (Docker)">

Deploy the AWS integration on an EC2 instance. The integration runs as a Docker container with the IAM role attached via instance profile.

**Prerequisites:**
- EC2 instance with Docker installed.
- IAM instance profile created and attached to the EC2 instance.
- The IAM role created above attached to the instance profile.

```bash showLineNumbers
docker run -d --restart unless-stopped --platform=linux/amd64 \
  -e OCEAN__PORT__CLIENT_ID="YOUR_PORT_CLIENT_ID" \
  -e OCEAN__PORT__CLIENT_SECRET="YOUR_PORT_CLIENT_SECRET" \
  -e OCEAN__PORT__BASE_URL="https://api.getport.io" \
  -e OCEAN__INITIALIZE_PORT_RESOURCES="true" \
  -e OCEAN__SEND_RAW_DATA_EXAMPLES="true" \
  -e OCEAN__EVENT_LISTENER='{"type": "POLLING", "resyncInterval": 1440}' \
  -e OCEAN__INTEGRATION__IDENTIFIER="my-aws-v3-multi" \
  -e OCEAN__INTEGRATION__TYPE="aws-v3" \
  -e OCEAN__INTEGRATION__CONFIG__ACCOUNT_ROLE_ARNS='["arn:aws:iam::111111111111:role/PortOceanReadRole","arn:aws:iam::222222222222:role/PortOceanReadRole","arn:aws:iam::333333333333:role/PortOceanReadRole"]' \
  -e OCEAN__INTEGRATION__CONFIG__EXTERNAL_ID="YOUR_EXTERNAL_ID" \
  ghcr.io/port-labs/port-ocean-aws-v3:latest
```

</TabItem>

</Tabs>


</TabItem>

</Tabs>

</TabItem>

<TabItem value="irsa" label="IAM Role for Service Account(IRSA)">

**Prerequisites:**
- Amazon EKS cluster with OIDC provider configured for IRSA.
- Permissions to create IAM roles and deploy Kubernetes resources.

**Choose your deployment method:**

**Trusted entity:**

The trusted entity for IRSA is your EKS cluster's OIDC identity provider. This allows Kubernetes service accounts in your cluster to assume the IAM role via `sts:AssumeRoleWithWebIdentity`.

**Account terminology:**

- **Target accounts**: The AWS accounts that you want to sync resources from. These accounts contain IAM roles with trust policies that allow your EKS cluster's IAM role to assume them. In AWS Organizations setups, target accounts are also referred to as member accounts.
- **Management account** (Organizations only): Your AWS Organizations management account. This is where you deploy CloudFormation StackSets and where the Organizations API is accessible. For automatic account discovery, you need a role ARN from this account.

**Choose account discovery method:**

<Tabs groupId="kubernetes-discovery" queryString="kubernetes-discovery" defaultValue="automatic">

<TabItem value="automatic" label="Organizations">

**Understanding automatic account discovery:**

Automatic account discovery uses the Organizations API to discover all member accounts in your organization. The integration automatically finds and syncs all accounts without requiring you to list them manually.

:::info Alternative option
To manually specify which accounts to sync, see the [Specify accounts tab](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts.md?multiple-account-auth=kubernetes&kubernetes-discovery=specify).
:::

**Prerequisites:**
- AWS Organizations enabled.
- Access to your AWS Organizations management account.

**How it works:**

1. The integration authenticates to your **trusted entity** (EKS cluster's OIDC provider) using **IRSA** (IAM Roles for Service Accounts) via web identity
2. The integration assumes the **configured organization role** (specified in `account_role_arn`) to access AWS Organizations API and discover all member accounts
3. It uses AWS Organizations `list_accounts` API to discover all active accounts in the organization
4. For each discovered account, it assumes a role in that account to get temporary credentials using `AssumeRoleWithWebIdentity`
5. With those credentials, it reads resources from each account and syncs them to Port

**Set up IRSA:**

1. **Create an IAM role** with the following configuration:
   - Go to **AWS Console → IAM → Roles → Create role**.
   - Select **Web identity** as the trust entity type.
   - Choose your EKS cluster's OIDC provider as the identity provider.
   - Set the audience to `sts.amazonaws.com`.
   - Name the role `PortOceanReadRole`.

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

3. **Note the role ARN** - you'll need it later: `arn:aws:iam::ACCOUNT_ID:role/PortOceanReadRole`

4. **Create a Kubernetes service account** and assign it to the IAM role. Refer to the [AWS guide for associating an IAM role to a service account](https://docs.aws.amazon.com/eks/latest/userguide/associate-service-account-role.html).

**Deploy read-only IAM roles to target accounts:**

Use CloudFormation StackSets to deploy IAM roles across your AWS Organization member accounts automatically. You can target specific accounts, organizational units, or all accounts. IRSA authentication requires OIDC provider setup in each member account, as the trust relationship uses OpenID Connect rather than standard IAM role assumption.

:::caution Management account required
Run the StackSet deployment from your AWS Organizations **management account**, as only the management account can deploy StackSets across member accounts.
:::

<h4>Step 1: Deploy CloudFormation StackSet</h4>

- **Access AWS console**:
  - Go to [AWS CloudFormation StackSets](https://console.aws.amazon.com/cloudformation/home#/stacksets).
  - Click **Create StackSet**.

- **Configure StackSet**:
  - Choose **Template is ready** and provide the S3 URL for the IRSA template.
  - Configure stack parameters:
    - **RoleName**: Enter a consistent role name (e.g., `PortOceanReadRole`).
    - **OIDCIssuerURL**: Enter your EKS cluster's OIDC issuer URL.
    - **OIDCProviderThumbprint**: Enter `9e99a48a9960b14926bb7f3b02e22da2b0ab7280` (standard EKS thumbprint).
    - **ServiceAccountNamespace**: Enter `port-ocean`.
    - **ServiceAccountName**: Enter `port-ocean-aws-v3`.
  - Specify deployment targets (organization, OU, or specific accounts).
  - Review and create the StackSet.

<h4>Step 2: Monitor Deployment</h4>

- **Check StackSet status**:
  - Check StackSet status in your management account.
  - Verify IAM roles exist in target accounts with correct permissions.

<h4>Step 3: Note the Role ARN</h4>

- **Get the role ARN**:
  - For automatic account discovery, you only need the role ARN from your **management account** (not member accounts). The integration will discover member accounts and assume roles automatically.
  - Format: `arn:aws:iam::ORG_ACCOUNT_ID:role/ROLE_NAME`

**Deploy the integration:**

The `accountRoleArn` in automatic account discovery mode should reference the role in your **organization/management account**.

Choose your deployment method:

<Tabs groupId="deployment-method-kubernetes-auto" queryString="deployment-method-kubernetes-auto" defaultValue="helm">

<TabItem value="helm" label="Helm">

Deploy the AWS integration using Helm on your EKS cluster. Follow the [AWS EKS documentation](https://docs.aws.amazon.com/eks/) to set up your cluster and IRSA.

<h4>Install the Integration</h4>

Run the following Helm command to deploy the AWS integration:

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
  --set integration.config.accountRoleArn="arn:aws:iam::ORG_ACCOUNT_ID:role/PortOceanReadRole"
```

</TabItem>

<TabItem value="argocd" label="ArgoCD">

Deploy the AWS integration using ArgoCD on your EKS cluster. Follow the [AWS EKS documentation](https://docs.aws.amazon.com/eks/) to set up your cluster and IRSA.

<h4>Integration Configuration</h4>

1. Create a `values.yaml` file in `argocd/my-ocean-aws-integration` in your git repository with the content:


```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 1440
integration:
  identifier: my-aws-v3-org
  type: aws-v3
  eventListener:
    type: POLLING
  config:
    accountRoleArn: arn:aws:iam::ORG_ACCOUNT_ID:role/PortOceanReadRole
```

2. Install the `my-ocean-aws-integration` ArgoCD Application by creating the following `my-ocean-aws-integration.yaml` manifest:

:::note Variable Replacement
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.

Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).
:::

<details>
<summary>ArgoCD Application</summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-ocean-aws-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-aws-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.18
    helm:
      valueFiles:
      - $values/argocd/my-ocean-aws-integration/values.yaml
      parameters:
        - name: port.clientId
          value: YOUR_PORT_CLIENT_ID
        - name: port.clientSecret
          value: YOUR_PORT_CLIENT_SECRET
        - name: port.baseUrl
          value: https://api.getport.io
        - name: podServiceAccount.name
          value: port-ocean-aws-v3
  - repoURL: YOUR_GIT_REPO_URL
    targetRevision: main
    ref: values
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

</details>

3. Apply your application manifest with `kubectl`:

```bash
kubectl apply -f my-ocean-aws-integration.yaml
```

</TabItem>

</Tabs>


</TabItem>

<TabItem value="specify" label="Non Organization">

**Explicit account configuration:**

Specify accounts lets you choose which AWS accounts to sync by providing a list of role ARNs. You control exactly which accounts are synced by listing their role ARNs in the integration configuration.

:::info Alternative option
To use automatic account discovery with AWS Organizations, see the [Automatic account discovery tab](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts.md?multiple-account-auth=irsa&irsa-discovery=automatic).
:::

**How it works:**

1. The integration authenticates to your **trusted entity** (EKS cluster's OIDC provider) using **IRSA** (IAM Roles for Service Accounts) via web identity
2. You manually provide a **list of account role ARNs** (specified in `account_role_arns`) for the accounts you want to sync
3. For each account in the list, it assumes the **specified role** in that account to get temporary credentials using `AssumeRoleWithWebIdentity`
4. With those credentials, it reads resources from each specified account and syncs them to Port

**Set up IRSA:**

1. **Create an IAM role** with the following configuration:
   - Go to **AWS Console → IAM → Roles → Create role**.
   - Select **Web identity** as the trust entity type.
   - Choose your EKS cluster's OIDC provider as the identity provider.
   - Set the audience to `sts.amazonaws.com`.
   - Name the role `PortOceanReadRole`.

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

3. **Note the role ARN** - you'll need it later: `arn:aws:iam::ACCOUNT_ID:role/PortOceanReadRole`

4. **Create a Kubernetes service account** and link it to the IAM role:

<details>
<summary><b>Create service account (Click to expand)</b></summary>

```bash showLineNumbers
kubectl create namespace port-ocean
kubectl create serviceaccount port-ocean-aws-v3 -n port-ocean
kubectl annotate serviceaccount port-ocean-aws-v3 \
  eks.amazonaws.com/role-arn=arn:aws:iam::ACCOUNT_ID:role/PortOceanReadRole \
  -n port-ocean
```

</details>

Refer to the [AWS guide for associating an IAM role to a service account](https://docs.aws.amazon.com/eks/latest/userguide/associate-service-account-role.html).

**Deploy read-only IAM roles to target accounts:**

Use CloudFormation StackSets to deploy IAM roles across your AWS Organization member accounts automatically. You can target specific accounts, organizational units, or all accounts. IRSA authentication requires OIDC provider setup in each member account, as the trust relationship uses OpenID Connect rather than standard IAM role assumption.

:::caution Management account required
Run the StackSet deployment from your AWS Organizations **management account**, as only the management account can deploy StackSets across member accounts.
:::

<h4>Step 1: Deploy CloudFormation StackSet</h4>

- **Access AWS console**:
  - Go to [AWS CloudFormation StackSets](https://console.aws.amazon.com/cloudformation/home#/stacksets).
  - Click **Create StackSet**.

- **Configure StackSet**:
  - Choose **Template is ready** and provide the S3 URL for the IRSA template.
  - Configure stack parameters:
    - **RoleName**: Enter a consistent role name (e.g., `PortOceanReadRole`).
    - **OIDCIssuerURL**: Enter your EKS cluster's OIDC issuer URL.
    - **OIDCProviderThumbprint**: Enter `9e99a48a9960b14926bb7f3b02e22da2b0ab7280` (standard EKS thumbprint).
    - **ServiceAccountNamespace**: Enter `port-ocean`.
    - **ServiceAccountName**: Enter `port-ocean-aws-v3`.
  - Specify deployment targets (organization, OU, or specific accounts).
  - Review and create the StackSet.

<h4>Step 3: Monitor Deployment</h4>

- **Check StackSet status**:
  - Check StackSet status in your management account.
  - Verify IAM roles exist in target accounts with correct permissions.

<h4>Step 4: Collect Role ARNs</h4>

- **Get role ARNs from each account**:
  - Format: `arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME`
  - Example: `arn:aws:iam::234567890123:role/PortOceanReadRole`

**Deploy the integration:**

Choose your deployment method:

<Tabs groupId="deployment-method-kubernetes-specify" queryString="deployment-method-kubernetes-specify" defaultValue="helm">

<TabItem value="helm" label="Helm">

Deploy the AWS integration using Helm on your EKS cluster. Follow the [AWS EKS documentation](https://docs.aws.amazon.com/eks/) to set up your cluster and IRSA.

<h4>Install the Integration</h4>

Run the following Helm command to deploy the AWS integration:

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
  --set integration.config.accountRoleArns='["arn:aws:iam::111111111111:role/PortOceanReadRole","arn:aws:iam::222222222222:role/PortOceanReadRole","arn:aws:iam::333333333333:role/PortOceanReadRole"]'
```

</TabItem>

<TabItem value="argocd" label="ArgoCD">

Deploy the AWS integration using ArgoCD on your EKS cluster. Follow the [AWS EKS documentation](https://docs.aws.amazon.com/eks/) to set up your cluster and IRSA.

<h4>Integration Configuration</h4>

1. Create a `values.yaml` file in `argocd/my-ocean-aws-integration` in your git repository with the content:


```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 1440
integration:
  identifier: "my-aws-v3-multi"
  type: "aws-v3"
  eventListener:
    type: "POLLING"
  config:
    accountRoleArns: ["arn:aws:iam::111111111111:role/PortOceanReadRole","arn:aws:iam::222222222222:role/PortOceanReadRole","arn:aws:iam::333333333333:role/PortOceanReadRole"]
```

2. Install the `my-ocean-aws-integration` ArgoCD Application by creating the following `my-ocean-aws-integration.yaml` manifest:

:::note Variable Replacement
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.

Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).
:::

<details>
<summary>ArgoCD Application</summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-ocean-aws-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-aws-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.18
    helm:
      valueFiles:
      - $values/argocd/my-ocean-aws-integration/values.yaml
      parameters:
        - name: port.clientId
          value: YOUR_PORT_CLIENT_ID
        - name: port.clientSecret
          value: YOUR_PORT_CLIENT_SECRET
        - name: port.baseUrl
          value: https://api.getport.io
        - name: podServiceAccount.name
          value: port-ocean-aws-v3
  - repoURL: YOUR_GIT_REPO_URL
    targetRevision: main
    ref: values
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

</details>

3. Apply your application manifest with `kubectl`:

```bash
kubectl apply -f my-ocean-aws-integration.yaml
```

</TabItem>

</Tabs>


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
- For IAM User authentication: Ensure the trust policy allows your IAM user to assume the role and check that the `externalId` matches on both sides.
- For IAM Role authentication: Ensure the trust policy allows your service IAM role to assume the member account roles and check that the `externalId` matches on both sides.
- For IRSA authentication: Ensure the trust policy allows your base IRSA role to assume the member account roles and verify the OIDC provider is configured in each member account.

**Error**: `No resources discovered`

**Solutions**:
- Verify the IAM roles in member accounts have `ReadOnlyAccess` policy attached.
- Check that the regions you want to query are not blocked by `regionPolicy`.
- Ensure the integration has network access to AWS APIs.

**Error**: `Access denied to Organizations API`

**Solutions**:
- For IAM User authentication: Verify the IAM user has `ReadOnlyAccess` policy attached.
- For IAM Role authentication: Verify the service IAM role has `ReadOnlyAccess` policy attached.
- For IRSA authentication: Verify the base IAM role has `ReadOnlyAccess` policy attached.
- Verify AWS Organizations is enabled in your management account.