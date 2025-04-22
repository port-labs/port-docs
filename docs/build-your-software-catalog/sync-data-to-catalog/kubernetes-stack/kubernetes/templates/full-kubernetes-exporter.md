---
sidebar_position: 8
description: Advanced Kubernetes installation
---

import TemplateInstallation from "./_template_installation.mdx";
import TemplatePrerequisites from "./_template_prerequisites.mdx";

# Kubernetes (advanced)

:::info
This use-case is an extension of the [basic Kubernetes use-case](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/kubernetes.md). If you haven't already, we recommend you to read it first.
:::

Kubernetes has become one of the most popular ways to deploy microservice based applications. As the number of your microservices grow, and more clusters are deployed across several regions, it becomes complicated and tedious to keep track of all of your deployments, services, and jobs.

Using Port's Kubernetes Exporter, you can keep track of your K8s resources and export all the data to Port. You will use K8s' built in metadata to create Entities in Port and keep track of their state.

:::tip
Get to know the basics of our Kubernetes exporter [here!](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/kubernetes.md)
:::

<img src="/img/build-your-software-catalog/sync-data-to-catalog/kubernetes/k8sAdvancedView.png" border="1px" />

## Prerequisites

<TemplatePrerequisites />

## Setting up blueprints & resource mapping

The following section will guide you through the process of setting up your blueprints and resource mapping using the
installation script. You can read more about the installation script [here](#how-does-the-installation-script-work).

### Creating blueprints

The installation script provides a convenient way to create your blueprints. Using the `CUSTOM_BP_PATH` environment variable, you can fetch a pre-defined `blueprints.json` to create your blueprints. For this use-case, you will use [this file](https://github.com/port-labs/template-assets/blob/main/kubernetes/blueprints/kubernetes_complete_usecase_bps.json) to define your blueprints. Do this by running:

```bash
export CUSTOM_BP_PATH="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/blueprints/kubernetes_complete_usecase_bps.json"
```

This `blueprints.json` file defines the following blueprints:

- Cluster;
- Namespace;
- Node;
- Pod;
- ReplicaSet
- Workload \*;

:::note

- `Workload` is an abstraction of Kubernetes objects which create and manage pods. By creating this blueprint, you can avoid creating a dedicated blueprint per Workload type, all of which will likely look pretty similar.
  Here is the list of kubernetes objects `Workload` will represent:

  - Deployment;
  - StatefulSet;
  - DaemonSet.

:::

### Exporting custom resource mapping

Using the `CONFIG_YAML_URL` parameter, you can define a custom resource mapping to use when installing the exporter.

In this use-case you will be using **[this configuration file](https://github.com/port-labs/template-assets/blob/main/kubernetes/kubernetes_v1_config.yaml)**. To achieve this, run:

```bash
export CONFIG_YAML_URL="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/kubernetes_v1_config.yaml"
```

You can now run the installation script using the following code snippet:

```bash showLineNumbers
export CLUSTER_NAME="my-cluster"
export PORT_CLIENT_ID="my-port-client-id"
export PORT_CLIENT_SECRET="my-port-client-secret"
curl -s https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/install.sh | bash
```

That's it! You can now browse to your Port environment to see that your blueprints have been created, and entities are being reported to Port using the freshly installed k8s exporter.

## Summary

In this use-case, using the installation script, you:

- set up your Port environment by creating blueprints defining different k8s resources;
- installed Port's k8s exporter with a configuration allowing you to export important data from your cluster;
- fetched k8s resources from you cluster as entities to your Port environment

## How does the installation script work?

<TemplateInstallation />