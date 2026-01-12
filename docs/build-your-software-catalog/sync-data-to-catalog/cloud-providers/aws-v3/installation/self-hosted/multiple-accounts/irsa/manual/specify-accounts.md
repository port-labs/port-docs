---
sidebar_position: 2
---

import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import IntegrationVersion from "/src/components/IntegrationVersion/IntegrationVersion"

# Specify accounts

<IntegrationVersion integration="aws-v3" />

We'll walk you through deploying the AWS integration using Helm with IRSA (IAM Roles for Service Accounts) on EKS to sync resources from multiple AWS accounts by manually creating IAM roles in each member account and providing a manual list of role ARNs.

## Prerequisites

Before installing the integration, ensure you have:

- [Helm](https://helm.sh/docs/intro/install/) >= 3.0.0.
- Amazon EKS cluster with OIDC provider configured.
- [Port API credentials](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials) (`PORT_CLIENT_ID` and `PORT_CLIENT_SECRET`).
- Permissions to create IAM roles and deploy Kubernetes resources.

## Understanding specify accounts mode

Specify accounts lets you choose which AWS accounts to sync by providing a list of role ARNs. You control exactly which accounts are synced by listing their role ARNs in the integration configuration.

:::info Alternative option
To use automatic account discovery with AWS Organizations, see [Automatic account discovery](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts/irsa/manual/automatic-account-discovery.md).
:::

### Account terminology

- **Base account**: The AWS account where your EKS cluster is located. This is where the integration authenticates from using IRSA.
- **Member accounts**: The AWS accounts that you want to sync resources from. You provide role ARNs for each of these accounts.

**How it works:**
1. The integration authenticates to your base account using IRSA (IAM Roles for Service Accounts).
2. We'll create IAM roles with `ReadOnlyAccess` in each member account manually.
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

## Set up cross-account IAM roles manually

Create IAM roles manually in each member account you want to sync. IRSA authentication requires OIDC provider setup in each member account, as the trust relationship uses OpenID Connect rather than standard IAM role assumption.

### Get your EKS cluster's OIDC issuer URL

Run this command in your base account (where your EKS cluster is):

```bash showLineNumbers
aws eks describe-cluster --name CLUSTER_NAME --region REGION --query "cluster.identity.oidc.issuer" --output text
```

This returns a URL like: `https://oidc.eks.REGION.amazonaws.com/id/OIDC_ID`

### Create OIDC provider in each member account

For each member account, create an OIDC identity provider:

```bash showLineNumbers
aws iam create-open-id-connect-provider \
  --url https://oidc.eks.REGION.amazonaws.com/id/OIDC_ID \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 9e99a48a9960b14926bb7f3b02e22da2b0ab7280
```

Replace `REGION` and `OIDC_ID` with values from step 1.

### Create IAM role in each member account

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

### Attach permissions

Attach the AWS managed `ReadOnlyAccess` policy to the role:

```bash showLineNumbers
aws iam attach-role-policy \
  --role-name AWSIntegrationRole \
  --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess
```

### Note the role ARN

Copy the role ARN from each member account. These are needed when configuring your deployment:

```
arn:aws:iam::MEMBER_ACCOUNT_ID:role/AWSIntegrationRole
```

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
