---
sidebar_position: 11
title: Integrating Kubernetes CRDs with Port
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Integrating Kubernetes CRDs with Port

This guide takes 7 minutes to complete, and aims to demonstrate the power of integrating Kubernetes Custom Resource Definitions (CRDs) with Port and exposing them in the Port UI for developers to use.

Port provides a strong integration with Kubernetes Custom Resource Definitions (CRDs) to help you manage your Kubernetes resources. This guide will walk you through the process of importing your Kubernetes CRDs into Port and allowing developers to create, update or delete resources based on them.

:::tip Prerequisites

- Kubernetes cluster with CRDS
- 

:::

### The goal of this guide

In this guide we will deploy Port's [Kubernetes Exporter](../build-your-software-catalog/sync-data-to-catalog/kubernetes/kubernetes.md) with a specific configuration to export Kubernetes CRDs to Port as <PortTooltip id="blueprint">blueprints</PortTooltip> and the relevant <PortTooltip id="action">actions</PortTooltip> to create, update and deleting those resources.

After completing it, you will get a sense of how it can benefit different personas in your organization:

- Developers will be able to use any CRDs directly in a convinet UI.
- Platform engineers will be able to query the data and get insights about the usage of the CRDs and kubernetes resources.

<br/>

## Run the script

1. Clone the project repository repository:

```bash showLineNumbers
git clone https://github.com/port-labs/backstage-import.git
```

2. In the cloned repository, create a `.env` file with the following values:

```bash showLineNumbers
BACKSTAGE_URL=<YOUR BACKSTAGE URL i.e https://demo.backstage.io>
PORT_CLIENT_ID=<YOUR PORT CLIENT ID>
PORT_CLIENT_SECRET=<YOUR PORT CLIENT SECRET>
```

3. Run the import script:

```bash showLineNumbers
./import.sh
```

Done! After the script completes, you will see new <PortTooltip id="blueprint">blueprints</PortTooltip> in Port, along with <PortTooltip id="entity">entities</PortTooltip> matching the data you have in your Backstage instance.

## Next steps

### Use Gitops to manage your resources

Once all of the data has been imported to Port, you will likely want to start managing it through specification files in Git.

1. Go to your [Port account](https://app.getport.io/).
2. Click on the `...` icon in the top right corner, then select "Export Data".
3. Choose the blueprints you would like to export, select the `GitOps` format, and click `Export`.

This will download all the specification files to your local machine. You can then push them to your GitOps repository and begin managing them from there.

To learn more about managing your Port entities using GitOps, refer to the [GitHub](/build-your-software-catalog/sync-data-to-catalog/git/github/gitops/gitops.md) and [Bitbucket](/build-your-software-catalog/sync-data-to-catalog/git/bitbucket/gitops/gitops.md) GitOps pages.
