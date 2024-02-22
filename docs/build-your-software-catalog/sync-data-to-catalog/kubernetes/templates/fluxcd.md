---
sidebar_position: 7
description: FluxCD quickstart
---

import TemplateInstallation from "./_template_installation.mdx";
import TemplatePrerequisites from "./_template_prerequisites.mdx";

# FluxCD

[FluxCD](https://fluxcd.io/) is a set of continuous and progressive delivery solutions for Kubernetes that are open and extensible.

Using Port's Kubernetes Exporter, you can keep track of all Flux resources in your cluster and export
monitored repositories and applications to Port. You will use built in metadata from your kubernetes resources and CRDs to create entities in
Port and keep track of their state.

:::tip Our Kubernetes exporter basics
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
use [this file](https://github.com/port-labs/template-assets/blob/main/kubernetes/blueprints/fluxcd-blueprints.json) to
define your blueprints. Do this by running:

```bash showLineNumbers
export CUSTOM_BP_PATH="https://github.com/port-labs/template-assets/blob/main/kubernetes/blueprints/fluxcd-blueprints.json"
```

This `blueprints.json` file defines the following blueprints:

- Cluster
- Namespace
- Node
- Pod
- ReplicaSet
- Workload
- Flux Source
- Flux Application

:::note Blueprint information

- `Workload` is an abstraction of Kubernetes objects which create and manage pods.
  By creating this blueprint, you can avoid creating a dedicated blueprint per Workload type, all of which will likely
  look pretty similar.
  Here is the list of kubernetes objects `Workload` will represent:

    - Deployment
    - StatefulSet
    - DaemonSet

- `Flux Source` is one of the most important Flux resource that defines the origin of a repository containing the desired state of the system and the requirements to obtain it. This blueprint tracks **GitRepository** and **HelmRepository** CRDs in the Flux system.

- `Flux Application` is another important Flux resource that represents a local set of Kubernetes resources that Flux is supposed to reconcile in the cluster. This blueprint tracks **Kustomization** and **HelmRelease** CRDs in the Flux system.
:::

### Exporting custom resource mapping

Using the `CONFIG_YAML_URL` parameter, you can define a custom resource mapping to use when installing the exporter.

In this use-case you will be using the **[this configuration file](https://github.com/port-labs/template-assets/blob/main/kubernetes/templates/fluxcd-kubernetes_v1_config.yaml)**. To achieve this, run:

```bash showLineNumbers
export CONFIG_YAML_URL="https://github.com/port-labs/template-assets/blob/main/kubernetes/templates/fluxcd-kubernetes_v1_config.yaml"
```

You can now run the installation script using the following code snippet:

```bash showLineNumbers
export CLUSTER_NAME="my-cluster"
export PORT_CLIENT_ID="my-port-client-id"
export PORT_CLIENT_SECRET="my-port-client-secret"
curl -s https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/install.sh | bash
```

You can now browse to your Port environment to see that your blueprints have been created, and your k8s and Flux
resources are being reported to Port using the freshly installed k8s exporter.

## How does the installation script work?

<TemplateInstallation />