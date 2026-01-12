---
---

# Multiple accounts installation

Sync resources from multiple AWS accounts. The integration authenticates to a base account and assumes IAM roles in each member account to access their resources.

## Choose your installation path

Make three decisions to configure your installation:

### Authentication method

Choose how the integration authenticates to your base account:

- **IAM user**: Use access keys. Works with Helm or Docker deployments.
- **IRSA**: Use IAM roles for service accounts. Works only on EKS, but more secure with no long-lived credentials.

### Role creation method

Choose how to create IAM roles in member accounts:

- **CloudFormation StackSet**: Automatically deploy IAM roles across accounts. Requires AWS Organizations management account access.
- **Manual**: Create IAM roles manually in each account. More control, but requires access to each account.

### Account discovery method

Choose how to identify which accounts to sync:

- **Automatic account discovery**: Uses the Organizations API to discover all member accounts. Requires AWS Organizations.
- **Specify accounts**: Provide a list of role ARNs for the accounts you want to sync. Works with or without AWS Organizations.

## Quick reference

Find your installation guide based on your choices:

| Auth | Role creation | Account discovery | Installation guide |
|------|--------------|-------------------|-------------------|
| **IAM user** | CloudFormation StackSet | Automatic account discovery | [Install guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts/iam-user/cloudformation-stackset/automatic-account-discovery.md) |
| **IAM user** | CloudFormation StackSet | Specify accounts | [Install guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts/iam-user/cloudformation-stackset/specify-accounts.md) |
| **IAM user** | Manual | Automatic account discovery | [Install guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts/iam-user/manual/automatic-account-discovery.md) |
| **IAM user** | Manual | Specify accounts | [Install guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts/iam-user/manual/specify-accounts.md) |
| **IRSA** | CloudFormation StackSet | Automatic account discovery | [Install guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts/irsa/cloudformation-stackset/automatic-account-discovery.md) |
| **IRSA** | CloudFormation StackSet | Specify accounts | [Install guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts/irsa/cloudformation-stackset/specify-accounts.md) |
| **IRSA** | Manual | Automatic account discovery | [Install guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts/irsa/manual/automatic-account-discovery.md) |
| **IRSA** | Manual | Specify accounts | [Install guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts/irsa/manual/specify-accounts.md) |
