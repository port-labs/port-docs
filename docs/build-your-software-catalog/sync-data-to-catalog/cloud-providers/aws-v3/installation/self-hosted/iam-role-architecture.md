---
sidebar_position: 4
sidebar_label: IAM role architecture
---

# IAM role architecture

This guide describes the IAM setup for **self-hosted AWS integration** deployments. Unlike the hosted version, self-hosted deployments require you to manage IAM resources directly.

Self-hosted integrations support two authentication methods that allow your infrastructure to securely access AWS resources:

- **IAM Role authentication** (Recommended): Uses role-based access for AWS services with automatic credential management.
- **IRSA (IAM Roles for Service Accounts)**: Uses OIDC federation where Kubernetes service accounts assume AWS IAM roles.

All methods create IAM roles with the AWS managed `ReadOnlyAccess` policy, ensuring comprehensive read-only access to all AWS services.

## Role structure

For multi-account setups, the role structure is replicated across all target accounts using CloudFormation StackSets.

### IAM Role authentication (ECS service access)

For IAM Role authentication, ECS services use their attached IAM roles to access resources directly. The integration runs as an ECS task with automatic credential management:

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
        "arn:aws:iam::*:role/PortIntegrationRole"
      ]
    }
  ]
}
```

**Key security features**:
- **No credentials to manage**: AWS automatically provides temporary credentials to ECS tasks.
- **Service-specific roles**: IAM roles are attached to ECS task definitions.
- **Automatic rotation**: Credentials are automatically rotated by AWS STS.
- **Cross-account access**: ECS tasks can assume roles in other AWS accounts.

### IRSA authentication (OIDC federation)

For IRSA authentication, roles trust your EKS cluster's OIDC identity provider:

```json showLineNumbers
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": {
      "Federated": "arn:aws:iam::MEMBER_ACCOUNT_ID:oidc-provider/oidc.eks.YOUR_REGION.amazonaws.com/id/YOUR_OIDC_ID"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "oidc.eks.YOUR_REGION.amazonaws.com/id/YOUR_OIDC_ID:aud": "sts.amazonaws.com",
        "oidc.eks.YOUR_REGION.amazonaws.com/id/YOUR_OIDC_ID:sub": "system:serviceaccount:YOUR_NAMESPACE:YOUR_SERVICE_ACCOUNT"
      }
    }
  }]
}
```

**Key security features**:
- **OIDC federation**: Secure identity federation without shared secrets.
- **Service account binding**: Roles tied to specific Kubernetes service accounts.
- **Temporary credentials**: Short-lived tokens for enhanced security.

## Permissions setup

The roles use the **AWS managed `ReadOnlyAccess` policy**, which provides comprehensive read-only access to all AWS services:

```yaml showLineNumbers
ManagedPolicyArns:
  - arn:aws:iam::aws:policy/ReadOnlyAccess
```

**Strategic benefits**:
- **Future-proof**: Automatically includes new AWS services without StackSet updates.
- **Operational simplicity**: No need to redeploy when adding support for new services.
- **Comprehensive coverage**: Access to all AWS services with read-only permissions.
- **AWS maintained**: AWS manages and updates the policy as needed.
- **Read-Only security**: Only read permissions, no write/delete/create access.

## Security considerations

From a security viewpoint, self-hosted integrations use **read-only** access with carefully configured trust relationships. You can list/describe and read metadata/tags, but cannot create, modify, delete, or change any resource.

## Troubleshooting

Common IAM issues include access denied errors, cross-account failures, and authentication problems. Verify permissions, trust relationships, and configurations.

For detailed setup instructions, see the [single account](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/single-account.md) and [multiple accounts](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts.md) installation guides.