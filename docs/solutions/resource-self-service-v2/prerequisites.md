---
title: "Prerequisites"
sidebar_position: 2
---

# Prerequisites

Before implementing the resource self-service solution, ensure you have the following integrations and ownership setup in place.

## Required integrations

### Cloud providers
Install at least one of the following cloud provider integrations:

- **[AWS integration](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws)** - For EC2, RDS, S3, and other AWS services
- **[Azure integration](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure)** - For Azure VMs, Storage, and databases
- **[GCP integration](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/gcp)** - For Compute Engine, Cloud Storage, and Cloud SQL

### Container orchestration
Choose your container platform:

- **[Kubernetes integration](/build-your-software-catalog/sync-data-to-catalog/kubernetes)** - For namespace and workload management
- **[ArgoCD integration](/build-your-software-catalog/sync-data-to-catalog/kubernetes/argocd)** - For GitOps-based deployments

### Infrastructure as Code
Connect your IaC tools:

- **[Terraform integration](/build-your-software-catalog/sync-data-to-catalog/iac/terraform)** - For Terraform-managed resources
- **[Pulumi integration](/build-your-software-catalog/sync-data-to-catalog/iac/pulumi)** - For Pulumi stack management

## Setup ownership

### Team structure
Ensure clear ownership hierarchy:

1. **Platform team** - Owns templates, policies, and governance
2. **Engineering managers** - Approve team resource requests
3. **Developers** - Request and manage their resources

### Port team configuration

Configure teams in Port to enable proper approvals:

1. Navigate to **Settings** → **Teams**
2. Create teams matching your organizational structure:
   - `platform-team` - Platform engineers and DevOps
   - `engineering-managers` - Team leads and engineering managers  
   - `developers` - All development teams

3. Assign users to appropriate teams based on their roles

:::info Team inheritance
Teams will automatically inherit permissions and visibility based on the hierarchical structure you define.
:::

## Verification checklist

Before proceeding, verify:

- [ ] At least one cloud provider integration is active
- [ ] Container platform integration is configured (if using containers)
- [ ] IaC integration is connected (if using Terraform/Pulumi)
- [ ] Port teams are created and users are assigned
- [ ] Team ownership hierarchy is defined

Once these prerequisites are met, you can proceed to configure the solution for each persona. 