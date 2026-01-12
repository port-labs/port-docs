---
---

import IntegrationVersion from "/src/components/IntegrationVersion/IntegrationVersion"

# Self-hosted installation

<IntegrationVersion integration="aws-v3" />

Deploy the AWS integration in your own infrastructure for full control over the deployment environment, network configuration, and resource management. For a fully managed experience with zero maintenance, see the [hosted by Port installation](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/hosted-by-port.md).

The AWS integration can sync resources from one AWS account or from multiple AWS accounts across your organization. Your installation path depends on which scenario applies to you.

### Single account

The integration authenticates directly to your AWS account and syncs all resources from it.

Choose your authentication method:

- **IAM user**: Use access keys for authentication. Works with Helm or Docker deployments.
- **IRSA**: Use IAM roles for service accounts. Works only on EKS, but more secure with no long-lived credentials.

### Multiple accounts

Sync resources from multiple AWS accounts. The integration authenticates to a base account and assumes IAM roles in each member account to access their resources.

See the [multiple accounts installation guide](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws-v3/installation/self-hosted/multiple-accounts/) to choose your authentication method, role creation method, and account discovery method.
