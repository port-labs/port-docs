---
sidebar_position: 3
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Multi-account setup

This guide will help you configure the AWS integration to sync resources from multiple AWS accounts.

:::tip Multiple account support
To enable multiple accounts for the integration, complete the setup in this guide, then configure your deployment using the instructions in the [self-hosted installation guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted.md).
:::

## Prerequisites

Before proceeding with multi-account setup, ensure you have:

- Completed the authentication setup in your chosen deployment method (see the [self-hosted installation guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted.md)).
- Permissions to create IAM roles in member accounts.
- AWS Organizations enabled (if using Organizations mode for account discovery).

## Understanding multi-account setup

Multi-account setup allows the integration to sync resources from multiple AWS accounts using cross-account role assumption.

**How it works:**
1. The integration authenticates to your base account using IRSA or IAM user.
2. You create IAM roles with `ReadOnlyAccess` in each member account.
3. Each member account's role trusts your base identity to assume it.
4. The integration calls `AssumeRole` (or `AssumeRoleWithWebIdentity` for IRSA) to get temporary credentials for each member account.
5. With those credentials, it reads resources and syncs them to Port.

**External ID** is a security feature required for cross-account access when using IAM user authentication. It's a secret value that both parties must know when assuming roles, preventing the "confused deputy problem."

**Permissions needed in your base account:**

| Permission | Required For | Purpose |
|------------|-------------|---------|
| `ReadOnlyAccess` | All setups | Read AWS resources (includes Organizations API access) |
| `sts:AssumeRole` | IAM user multi-account | Assume roles in member accounts |
| `sts:AssumeRoleWithWebIdentity` | IRSA multi-account | Assume roles in member accounts using OIDC |

**Account discovery strategies:**

- **Organizations mode**: Automatically discovers all accounts via AWS Organizations API. Best for large setups (10+ accounts).
- **Explicit list mode**: You manually provide a list of role ARNs to assume. No Organizations permissions needed. Best for smaller setups (2-10 accounts).

## Setting up cross-account IAM roles

Create IAM roles with `ReadOnlyAccess` in each member account you want to sync. Choose the method that fits your organization:

<h3>Option 1: Deploy using CloudFormation StackSet</h3>

:::tip Automate with CloudFormation StackSets
Use CloudFormation StackSets to deploy IAM roles across all your AWS Organization member accounts automatically.
:::

**CloudFormation StackSet templates:**

- **IRSA (EKS)**: [S3 template URL - coming soon]
- **IAM user**: [S3 template URL - coming soon]

**Deploy via AWS console:**

1. Go to [AWS CloudFormation StackSets](https://console.aws.amazon.com/cloudformation/home#/stacksets).
2. Click **Create StackSet**.
3. Choose **Template is ready** and provide the S3 URL for your authentication method.
4. Configure the stack parameters as shown in the template.
5. **Specify deployment targets**:
   - Choose **Deploy to organization** or **Deploy to specific accounts**.
   - Select the organizational units (OUs) or account IDs where you want to deploy.
6. Review and click **Submit**.
7. **Monitor deployment**:
   - Wait for StackSet instances to show `SUCCEEDED` status across all target accounts.
   - Verify roles were created successfully in each account.
8. **Note the role ARNs**:
   - Format: `arn:aws:iam::ACCOUNT_ID:role/ROLE_NAME`
   - You'll need these when configuring your deployment.

<h3>Option 2: Manual IAM role setup</h3>

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

<TabItem value="keys-manual" label="For IAM user">

IAM user credentials use standard IAM role assumption with an external ID for security.

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

## Configuration parameters

After setting up IAM roles in your member accounts, configure your deployment with the appropriate parameters. The configuration depends on your account discovery strategy:

<h3>AWS Organizations mode (Automatic)</h3>

If you have AWS Organizations enabled, the integration can automatically discover all member accounts.

**Configuration parameters:**

- **`accountRoleArn`**: The ARN of the role in your **organization/management account** (not a member account role). This role is used to discover accounts via the Organizations API and then assume roles in member accounts.
- **`externalId`**: Required only for IAM user authentication. Generate a secure external ID using `openssl rand -hex 16` and use the same value across all member accounts.

:::info Organization account role and how it works
The `accountRoleArn` in Organizations mode should reference the role in your **organization/management account**, not a member account role. This role is used to discover accounts and then assume roles in member accounts.

The integration calls the AWS Organizations API to discover all member accounts. For each account, it assumes the role using `AssumeRoleWithWebIdentity` (for IRSA) or `AssumeRole` (for IAM user). IRSA requires the OIDC provider to be configured in each member account.
:::

<h3>Explicit list mode (Manual)</h3>

If you don't use AWS Organizations or want to specify exact accounts, you can provide a list of role ARNs.

**Configuration parameters:**

- **`accountRoleArns`**: A JSON array of role ARNs to assume, one for each member account. Example: `["arn:aws:iam::111111111111:role/AWSIntegrationRole","arn:aws:iam::222222222222:role/AWSIntegrationRole"]`
- **`externalId`**: Required only for IAM user authentication. Generate a secure external ID using `openssl rand -hex 16` and use the same value across all member accounts.

:::info How explicit list mode works
The integration receives a specific list of role ARNs to assume. It uses `AssumeRole` (for IAM user) or `AssumeRoleWithWebIdentity` (for IRSA) to get temporary credentials for each role in the list, then syncs resources from those accounts.
:::

For complete deployment instructions with these parameters, see the [self-hosted installation guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted.md).

## Troubleshooting

### Common multi-account issues

**Error**: `Unable to assume role`

**Solutions**:
- Verify the IAM role ARN is correct.
- Ensure the trust policy allows your base credentials to assume the role.
- For IAM user authentication, check that the `externalId` matches on both sides (if configured).
- Verify the base credentials have `sts:AssumeRole` (for IAM user) or `sts:AssumeRoleWithWebIdentity` (for IRSA) permission.

**Error**: `Access denied to Organizations API`

**Solutions**:
- Verify the base credentials have `ReadOnlyAccess` policy attached (which includes Organizations API access).
- Verify AWS Organizations is enabled in your management account.
- Check that you're using the correct account (management or delegated administrator).

