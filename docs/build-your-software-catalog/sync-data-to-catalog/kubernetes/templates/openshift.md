---
title: "Red Hat Openshift"
sidebar_position: 4
description: Openshift quickstart
---

import TemplateInstallation from "./_template_installation.mdx";
import TemplatePrerequisites from "./_template_prerequisites.mdx";

# Red Hat Openshift

[Red Hat Openshift](https://www.redhat.com/en/technologies/cloud-computing/openshift) is a versatile platform for scalable application development, modernization, and deployment over Kubernetes, offering a complete service set for app delivery on your preferred infrastructure.

Using Port's Kubernetes Exporter, you can keep track of important Openshift resources across your different clusters and export the data to Port. You will use built in metadata from your Openshift resources and CRDs to create entities in Port and keep track of their state.

:::tip
Get to know the basics of our Kubernetes exporter [here!](/build-your-software-catalog/sync-data-to-catalog/kubernetes/kubernetes.md)
:::

## Mapping Red Hat Openshift - Goals

While Red Hat Openshift provides great visibility when it comes to your Openshift (Kubernetes) environments, there are still some questions that remain about how your Openshift environment connects and interacts with the rest of your infrastructure, for example:

- Which cloud provider is the cluster running in?
- Which VPC is the cluster running in?
- Who is on-call for a given cluster?
- What are all the endpoints provided by all different Openshift clusters in a cloud region?

Importing your Openshift resources to Port makes it easy to create multiple tailored views for different use cases. For example, you can create a view that shows you how your Openshift cluster interacts with the rest of your infrastructure, or you can create a high-level view that allows management to understand the business value provided by your Openshift installations.

In this example you will map your Openshift clusters, their workloads and the Openshift routes which are exposed by your different clusters.

:::tip
Get to know the basics of our Kubernetes exporter [here!](/build-your-software-catalog/sync-data-to-catalog/kubernetes/kubernetes.md)
:::

## Prerequisites

<TemplatePrerequisites />

## Setting up blueprints & resource mapping

The following section will guide you through the process of setting up your blueprints and resource mapping using the
installation script. You can read more about the installation script [here](#how-does-the-installation-script-work).

### Creating blueprints

The installation script provides a convenient way to create your blueprints. Using the `CUSTOM_BP_PATH` environment variable, you can fetch a pre-defined `blueprints.json` to create your blueprints. For this use-case, you will use [this file](https://github.com/port-labs/template-assets/blob/main/kubernetes/blueprints/openshift-blueprints.json) to define your blueprints. Do this by running:

```bash showLineNumbers
export CUSTOM_BP_PATH="https://github.com/port-labs/template-assets/blob/main/kubernetes/blueprints/openshift-blueprints.json"
```

This `blueprints.json` file defines the following blueprints:

- Cluster;
- Namespace;
- Node;
- Pod;
- ReplicaSet;
- Workload \*;
- Service;
- Openshift Route \*.

:::note

- `Workload` is an abstraction of Kubernetes objects which create and manage pods. By creating this blueprint, you can avoid creating a dedicated blueprint per Workload type, all of which will likely look pretty similar.
  Here is the list of kubernetes objects `Workload` will represent:

  - Deployment;
  - StatefulSet;
  - DaemonSet.

- `Openshift Route` is one of the most important Openshift resources, giving developers the capability to connect to their services, while the entire network layer is managed by the Openshift API, and providing a simple DNS record for accessability.

:::

### Exporting custom resource mapping

Using the `CONFIG_YAML_URL` parameter, you can define a custom resource configuration to use when installing the exporter.

In this use-case you will be using **[this configuration file](https://github.com/port-labs/template-assets/blob/main/kubernetes/full-configs/openshift_usecase.yaml)**. To achieve this, run:

```bash showLineNumbers
export CONFIG_YAML_URL="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/full-configs/openshift_usecase.yaml"
```

You can now run the installation script using the following code snippet:

```bash showLineNumbers
export CLUSTER_NAME="my-cluster"
export PORT_CLIENT_ID="my-port-client-id"
export PORT_CLIENT_SECRET="my-port-client-secret"
curl -s https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/install.sh | bash
```

You can now browse to your Port environment to see that your blueprints have been created, and your Kubernetes resources, including Openshift routes are being reported to Port using the freshly installed k8s exporter.

## How does the installation script work?

<TemplateInstallation />