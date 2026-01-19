---
sidebar_position: 1
---

import IntegrationVersion from "/src/components/IntegrationVersion/IntegrationVersion"

# Self-hosted installation

<IntegrationVersion integration="aws-v3" />

Deploy the AWS integration in your own infrastructure for full control over the deployment environment, network configuration, and resource management. For a fully managed experience with zero maintenance, see the [hosted by Port installation](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/hosted-by-port.md).

## Choose your account scope

### Single account

Sync resources from one AWS account. The integration authenticates directly to your AWS account and syncs all resources from it.

**[Install for single account →](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/single-account.md)**

### Multiple accounts

Sync resources from multiple AWS accounts. The integration authenticates to a base account and assumes IAM roles in each member account to access their resources.

**[Install for multiple accounts →](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts.md)**