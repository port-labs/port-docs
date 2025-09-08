---
sidebar_position: 2
---

# IAM Role Architecture

This page explains how the AWS Hosted by Port IAM role is constructed and what permissions it grants to the integration.

## Overview

AWS Hosted by Port uses a strategically designed IAM role that provides comprehensive read-only access to all AWS services. The role is created automatically by the CloudFormation template and uses the AWS managed `ReadOnlyAccess` policy for future-proofing and operational simplicity.

## Role Structure

### OIDC Identity Provider

The CloudFormation template creates an OIDC identity provider that connects to Port's EKS cluster:

```yaml
PortIntegrationOIDCProvider:
  Type: AWS::IAM::OIDCProvider
  Properties:
    Url: 'https://oidc.eks.eu-west-1.amazonaws.com/id/56E5F51C07138118A9183ECEAA68FAF4'
    ClientIdList:
      - sts.amazonaws.com
    Tags:
      - Key: port:integration
        Value: !Ref IntegrationIdentifier
```

**Key Details**:
- **EKS OIDC URL**: Points to Port's production EKS cluster in EU-West-1
- **Client ID**: Uses `sts.amazonaws.com` for IRSA authentication
- **Reusable**: Can be shared across multiple integrations in the same account
- **Optional**: Can be disabled if you already have a Port OIDC provider

### Trust Policy

The IAM role uses an **OIDC (OpenID Connect) trust policy** with **IRSA (IAM Roles for Service Accounts)** that allows Port's EKS cluster to assume the role:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { 
      "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/oidc.eks.eu-west-1.amazonaws.com/id/56E5F51C07138118A9183ECEAA68FAF4"
    },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "oidc.eks.eu-west-1.amazonaws.com/id/56E5F51C07138118A9183ECEAA68FAF4:aud": "sts.amazonaws.com",
        "oidc.eks.eu-west-1.amazonaws.com/id/56E5F51C07138118A9183ECEAA68FAF4:sub": "system:serviceaccount:org-YOUR_ORG_ID-port-oidc-sa"
      }
    }
  }]
}
```

**Key Security Features**:
- **IRSA Authentication**: Uses EKS service account-based authentication
- **Audience Validation**: Only AWS STS service can assume the role
- **Subject Validation**: Role is tied to Port's specific EKS service account
- **Temporary Credentials**: All access uses short-lived tokens (typically 1 hour)

### Permissions Policy

The role uses the **AWS managed `ReadOnlyAccess` policy**, which provides comprehensive read-only access to all AWS services:

```yaml
ManagedPolicyArns:
  - arn:aws:iam::aws:policy/ReadOnlyAccess
```

**Strategic Benefits**:
- **Future-Proof**: Automatically includes new AWS services without CloudFormation updates
- **Operational Simplicity**: No need to redeploy when adding support for new services
- **Comprehensive Coverage**: Access to all AWS services with read-only permissions
- **AWS Maintained**: AWS manages and updates the policy as needed
- **Read-Only Security**: Only read permissions, no write/delete/create access

## Permission Categories

Since the role uses the AWS managed `ReadOnlyAccess` policy, it has comprehensive read-only access to **all AWS services**. Here are the key categories relevant to AWS Hosted by Port:

### What This Enables
- **Comprehensive Discovery**: Access to all AWS resource types
- **Future-Proof**: New services are automatically supported without redeployment
- **Operational Efficiency**: No CloudFormation updates needed when adding new services
- **Consistent Access**: Same permission model across all services
- **No Maintenance**: AWS manages policy updates

## Security Considerations

### What the Integration CAN Do
- ✅ **Read resource metadata** and configuration
- ✅ **List resources** across supported services
- ✅ **Access resource tags** for categorization
- ✅ **Read security settings** (ACLs, policies, etc.)
- ✅ **Discover account structure** (for multi-account setups)

### What the Integration CANNOT Do
- ❌ **Modify any resources** (no write permissions)
- ❌ **Delete resources** (no delete permissions)
- ❌ **Change security settings** (no policy modification)
- ❌ **Create new resources** (no create permissions)
- ❌ **Access other AWS accounts** (unless explicitly configured)

## Multi-Account Role Structure

For multi-account setups, the role structure is replicated across all target accounts

## Role Modifications

:::info Keeping the Role Unchanged
We recommend keeping the IAM role and its permissions unchanged after deployment. The integration is designed to work with the full `ReadOnlyAccess` policy, which ensures:

- **Complete resource discovery** across all AWS services
- **Future compatibility** when Port adds support for new AWS services
- **Reliable operation** without permission-related issues

If you need to restrict access to specific resources, consider using AWS resource-level permissions or contact your Port representative for guidance on alternative approaches.
:::

## Support and Resources

- **CloudFormation Template**: [Single Account Template](https://port-cloudformation-templates.s3.eu-west-1.amazonaws.com/stable/ocean/aws-v3/single-account-integration.yaml)
- **CloudFormation Template**: [Multi-Account Template](https://port-cloudformation-templates.s3.eu-west-1.amazonaws.com/stable/ocean/aws-v3/multi-account-integration.yaml)
- **AWS IAM Documentation**: [IAM Roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html)
- **IRSA Documentation**: [IAM Roles for Service Accounts](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html)
- **OIDC Documentation**: [AWS OIDC Identity Providers](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
