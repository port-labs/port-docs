---
sidebar_position: 3
---

# IAM role architecture

AWS Hosted by Port uses a strategically designed IAM role that provides comprehensive read-only access to all AWS services. The role is created automatically by the CloudFormation template and uses the AWS managed `ReadOnlyAccess` policy for future-proofing and operational simplicity.

:::warning Role modifications
We recommend keeping the IAM role and its permissions unchanged after deployment.  
The integration is designed to work with the full `ReadOnlyAccess` policy, which ensures:

- **Complete resource discovery** across all AWS services.
- **Future compatibility** when Port adds support for new AWS services.
- **Reliable operation** without permission-related issues.
:::

If you prefer to create the IAM role manually rather than using the CloudFormation template, the following sections describe the setup we implement. This will help you understand the reasoning behind our design choices and adapt them if you decide to configure the role differently.

## Role structure

For multi-account setups, the role structure is replicated across all target accounts.

### OIDC identity provider

The CloudFormation template creates an OIDC identity provider that connects to Port's EKS cluster:

```yaml showLineNumbers
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
- **EKS OIDC URL**: Points to Port's production EKS cluster in EU-West-1.
- **Client ID**: Uses `sts.amazonaws.com` for IRSA authentication.
- **Reusable**: Can be shared across multiple integrations in the same account.
- **Optional**: Can be disabled if you already have a Port OIDC provider.

### Trust policy

The IAM role uses an **OIDC (OpenID Connect) trust policy** with **IRSA (IAM Roles for Service Accounts)** that allows Port's EKS cluster to assume the role:

```json showLineNumbers
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
- **IRSA Authentication**: Uses EKS service account-based authentication.
- **Audience Validation**: Only AWS STS service can assume the role.
- **Subject Validation**: Role is tied to Port's specific EKS service account.
- **Temporary Credentials**: All access uses short-lived tokens (typically 1 hour).

### Permissions policy

The role uses the **AWS managed `ReadOnlyAccess` policy**, which provides comprehensive read-only access to all AWS services:

```yaml showLineNumbers
ManagedPolicyArns:
  - arn:aws:iam::aws:policy/ReadOnlyAccess
```

**Strategic Benefits**:
- **Future-Proof**: Automatically includes new AWS services without CloudFormation updates.
- **Operational Simplicity**: No need to redeploy when adding support for new services.
- **Comprehensive Coverage**: Access to all AWS services with read-only permissions.
- **AWS Maintained**: AWS manages and updates the policy as needed.
- **Read-Only Security**: Only read permissions, no write/delete/create access.

## Security considerations

From a security view point the integration uses a **read-only** role. It can list/describe and read metadata/tags, but cannot create, modify, delete, or change any resource. 