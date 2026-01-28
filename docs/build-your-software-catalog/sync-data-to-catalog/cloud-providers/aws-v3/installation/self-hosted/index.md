---
sidebar_position: 1
sidebar_label: Self-hosted
---

import IntegrationVersion from "/src/components/IntegrationVersion/IntegrationVersion"

# Self-hosted installation

<IntegrationVersion integration="aws-v3" />

Port's self-hosted AWS integration syncs your AWS resources into your software catalog. You maintain full control over where the integration runs and how it accesses your data.

## Prerequisites

To install the self-hosted AWS integration, you need:

- [Port API credentials](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials).
- AWS permissions to create IAM resources.
- Infrastructure to deploy the integration (ECS, Kubernetes, or Docker).

## Installation options

Choose the installation path that matches your AWS setup:

**Authentication methods:**
- **IAM User**: Uses access keys.
- **IAM Role**: Uses role-based access for AWS ECS services (recommended).
- **IRSA**: Uses IAM roles for Kubernetes service accounts (ideal for EKS).

### Single account
For a [single account setup](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/single-account.md), deploy the integration directly to connect to your AWS environment.

This approach works well when you need resources from just one account and want straightforward setup.

### Multiple accounts
For [multiple accounts in an AWS Organization](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts.md), use CloudFormation StackSets to automatically deploy IAM roles across your organization.

You can let the integration discover all accounts automatically using AWS Organizations, or specify exactly which accounts to include.

For detailed information about authentication methods and IAM permissions, see the [IAM Architecture](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/iam-role-architecture.md) documentation.
