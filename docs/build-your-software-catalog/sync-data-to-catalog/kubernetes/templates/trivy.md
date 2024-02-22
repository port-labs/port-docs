---
sidebar_position: 5
description: Trivy quickstart
---

import TemplateInstallation from "./_template_installation.mdx";
import TemplatePrerequisites from "./_template_prerequisites.mdx";

# Trivy Operator

[Trivy Operator](https://github.com/aquasecurity/trivy-operator) is an open-source security scanner that leverages [Trivy](https://github.com/aquasecurity/trivy) to continuously scan your Kubernetes cluster for security issues.

Using Port's Kubernetes Exporter, you can keep track of all Trivy resources across your different clusters and export
all the security issues to Port. You will use built in metadata from your kubernetes resources and CRDs to create entities in
Port and keep track of their state.

:::tip
Get to know the basics of our Kubernetes exporter [here!](/build-your-software-catalog/sync-data-to-catalog/kubernetes/kubernetes.md)
:::

## Prerequisites

<TemplatePrerequisites />

## Setting up blueprints & resource mapping

The following section will guide you through the process of setting up your blueprints and resource mapping using the
installation script. You can read more about the installation script [here](#how-does-the-installation-script-work).

### Creating blueprints

The installation script provides a convenient way to create your blueprints. Using the `CUSTOM_BP_PATH` environment
variable, you can fetch a pre-defined `blueprints.json` to create your blueprints. For this use-case, you will
use [this file](https://github.com/port-labs/template-assets/blob/main/kubernetes/blueprints/trivy-blueprints.json) to
define your blueprints. Do this by running:

```bash showLineNumbers
export CUSTOM_BP_PATH="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/blueprints/trivy-blueprints.json"
```

This `blueprints.json` file defines the following blueprints:

- Cluster;
- Namespace;
- Node;
- Pod;
- ReplicaSet;
- Workload \*;
- Trivy Vulnerabilities.

:::note

- `Workload` is an abstraction of Kubernetes objects which create and manage pods.
  By creating this blueprint, you can avoid creating a dedicated blueprint per Workload type, all of which will likely
  look pretty similar.
  Here is the list of kubernetes objects `Workload` will represent:

    - Deployment;
    - StatefulSet;
    - DaemonSet.

- `Trivy Vulnerabilities` is one of the most important Trivy resources, giving developers the capability to find and view the risks that relate to different resources in their Kubernetes cluster.
:::

### Exporting custom resource mapping

Using the `CONFIG_YAML_URL` parameter, you can define a custom resource mapping to use when installing the exporter.

In this use-case you will be using the **[this configuration file](https://github.com/port-labs/template-assets/blob/main/kubernetes/templates/trivy-kubernetes_v1_config.yaml)**. To achieve this, run:

```bash showLineNumbers
export CONFIG_YAML_URL="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/templates/trivy-kubernetes_v1_config.yaml"
```

You can now run the installation script using the following code snippet:

```bash showLineNumbers
export CLUSTER_NAME="my-cluster"
export PORT_CLIENT_ID="my-port-client-id"
export PORT_CLIENT_SECRET="my-port-client-secret"
curl -s https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/install.sh | bash
```

You can now browse to your Port environment to see that your blueprints have been created, and your k8s and Trivy
resources are being reported to Port using the freshly installed k8s exporter.

## How does the installation script work?

<TemplateInstallation />

## Alternative integration using script
While the Trivy Kubernetes exporter described above is the recommended installation method, you may prefer to use a webhook and a script to [ingest your Trivy scan results to Port](/build-your-software-catalog/sync-data-to-catalog/webhook/examples/packages/trivy). 