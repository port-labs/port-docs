---
sidebar_position: 2
---

import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import IntegrationVersion from "/src/components/IntegrationVersion/IntegrationVersion"

# Specify accounts

<IntegrationVersion integration="aws-v3" />

We'll walk you through deploying the AWS integration using Helm with IRSA (IAM Roles for Service Accounts) on EKS to sync resources from multiple AWS accounts using CloudFormation StackSets with a manual list of role ARNs.

## Prerequisites

Before installing the integration, ensure you have:

- [Helm](https://helm.sh/docs/intro/install/) >= 3.0.0.
- Amazon EKS cluster with OIDC provider configured.
- [Port API credentials](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials) (`PORT_CLIENT_ID` and `PORT_CLIENT_SECRET`).
- Permissions to create IAM roles and deploy Kubernetes resources.

## Understanding specify accounts mode

Specify accounts lets you choose which AWS accounts to sync by providing a list of role ARNs. You control exactly which accounts are synced by listing their role ARNs in the integration configuration.

:::info Alternative option
To use automatic account discovery with AWS Organizations, see [Automatic account discovery](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts/irsa/cloudformation-stackset/automatic-account-discovery.md).
:::

### Account terminology

- **Base account**: The AWS account where your EKS cluster is located. This is where the integration authenticates from using IRSA.
- **Management account**: Your AWS Organizations management account (if using Organizations). This is where you deploy CloudFormation StackSets. You don't need a role ARN from this account for specify accounts mode.
- **Member accounts**: The AWS accounts that you want to sync resources from. You provide role ARNs for each of these accounts.

**How it works:**
1. The integration authenticates to your base account using IRSA (IAM Roles for Service Accounts).
2. We'll create IAM roles with `ReadOnlyAccess` in each member account using CloudFormation StackSets.
3. Each member account's role trusts your base IRSA role to assume it via OIDC.
4. You provide a list of role ARNs to the integration.
5. The integration calls `AssumeRoleWithWebIdentity` for each role ARN to get temporary credentials.
6. With those credentials, it reads resources and syncs them to Port.

## Set up IRSA

Set up [IRSA](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) for authentication:

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

## Set up IAM roles

Use CloudFormation StackSets to deploy IAM roles across your AWS Organization member accounts automatically. You can target specific accounts, organizational units, or all accounts. IRSA authentication requires OIDC provider setup in each member account, as the trust relationship uses OpenID Connect rather than standard IAM role assumption.

:::caution Management account required
Run the StackSet deployment from your AWS Organizations **management account**, as only the management account can deploy StackSets across member accounts.
:::

### Prepare your organization

- **Find your OU ID**:
  - Log into your AWS Organizations management account.
  - Navigate to [AWS Organizations](https://us-east-1.console.aws.amazon.com/organizations/v2/home/accounts) service.
  - Under **Organizational structure**, copy the OU ID from the details page (format `ou-xxxx-xxxxxxxx` or `r-xxxx`).
  - You can also target specific account IDs if needed.

- **Get your EKS cluster's OIDC issuer URL**:
  - Run this command in your base account (where your EKS cluster is):

```bash showLineNumbers
aws eks describe-cluster --name CLUSTER_NAME --region REGION --query "cluster.identity.oidc.issuer" --output text
```

  - This returns a URL like: `https://oidc.eks.REGION.amazonaws.com/id/OIDC_ID`
  - Note the `REGION` and `OIDC_ID` values - these are needed for the StackSet parameters.

### Access the CloudFormation StackSet template

- **CloudFormation StackSet template**: [S3 template URL - coming soon].
- Go to [AWS CloudFormation StackSets](https://console.aws.amazon.com/cloudformation/home#/stacksets).

### Deploy via AWS console

- **Create StackSet**:
  - Click **Create StackSet**.
  - Choose **Template is ready** and provide the S3 URL for the IRSA template.
  - Click **Next**.

- **Configure stack parameters**:
  - **RoleName**: Enter a consistent role name (e.g., `PortOceanReadRole`). This name must be the same across all accounts.
  - **OIDCIssuerURL**: Enter your EKS cluster's OIDC issuer URL from step 1.
  - **OIDCProviderThumbprint**: Enter `9e99a48a9960b14926bb7f3b02e22da2b0ab7280` (standard EKS thumbprint).
  - **ServiceAccountNamespace**: Enter `port-ocean`.
  - **ServiceAccountName**: Enter `port-ocean-aws-v3`.
  - Click **Next**.

- **Specify deployment targets**:
  - Choose one of the following:
    - **Deploy to organization**: Select this option, then choose the scope: **All accounts**, **All accounts except selected**, or **Selected accounts only**.
    - **Deploy to specific accounts**: Enter the OU ID you copied in step 1 (format: `ou-xxxx-xxxxxxxx` or `r-xxxx`), or enter specific account IDs.
  - Click **Next**.

- **Set deployment options**:
  - Configure failure tolerance and region preferences as needed.
  - Click **Next**.

- **Review and create**:
  - Review all settings.
  - Scroll down to the bottom of the page.
  - Check the box **"I acknowledge that AWS CloudFormation might create IAM resources with custom names"**.
  - Click **Submit**.

### Monitor deployment

- **Check StackSet status**:
  - Go to **CloudFormation** → **StackSets** in your management account.
  - Select your StackSet.
  - Go to the **StackSet instances** tab.
  - Wait for all instances to show `SUCCEEDED` status across all target accounts.

- **Verify IAM roles**:
  - Check that the IAM roles were created in each target account.
  - Go to **IAM** → **Roles** in a member account and verify the role exists.
  - Verify the role has the `ReadOnlyAccess` policy attached.

### Collect role ARNs

For specify accounts mode, collect role ARNs from all member accounts you want to sync.

- **Get role ARNs from each account**:
  - For each member account, the role ARN format is: `arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME`
  - Replace `ACCOUNT_ID` with each member account ID and `ROLE_NAME` with the role name you specified (e.g., `PortOceanReadRole`).
  - Example: `arn:aws:iam::234567890123:role/PortOceanReadRole`

## Deploy the integration

Deploy the AWS integration using Helm on your Kubernetes cluster. This deployment supports scheduled resyncs of resources from AWS to Port.

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
  --set integration.identifier="my-aws-v3-multi" \
  --set integration.type="aws-v3" \
  --set integration.eventListener.type="POLLING" \
  --set podServiceAccount.name="port-ocean-aws-v3" \
  --set integration.config.accountRoleArns='["arn:aws:iam::111111111111:role/AWSIntegrationRole","arn:aws:iam::222222222222:role/AWSIntegrationRole","arn:aws:iam::333333333333:role/AWSIntegrationRole"]'
```

<PortApiRegionTip/>

## Troubleshooting

### Common installation issues

**Error**: `Unable to assume role`

**Solutions**:
- Verify the IAM role ARN is correct.
- Ensure the trust policy allows your base IRSA role to assume the member account roles.
- Verify the OIDC provider is configured in each member account (for IRSA multi-account).
- Check that the service account annotation matches the IAM role ARN.

**Error**: `No resources discovered`

**Solutions**:
- Verify the IAM roles in member accounts have `ReadOnlyAccess` policy attached.
- Check that the regions you want to query are not blocked by `regionPolicy`.
- Ensure the integration has network access to AWS APIs.
