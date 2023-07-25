---
sidebar_position: 2
description: Knative quickstart
---

# ArgoCD

[Argo CD](https://argo-cd.readthedocs.io/en/stable/) is an open-source continuous delivery tool based on GitOps methodology. Argo automates the deployment of applications by monitoring your cluster and the infrastructure defined declaratively in a Git repository, and then reconciling any disparities.

Using Port's Kubernetes Exporter, you can keep track of all ArgoCD resources across your different clusters and export all of the data to Port. You will use built in metadata from your kubernetes resources and CRDs to create entities in Port and keep track of their state.

:::tip
Get to know the basics of our Kubernetes exporter [here!](../kubernetes.md)
:::

## Prerequisites

- [Helm](https://helm.sh) must be installed to use the chart. Please refer to
  Helm's [documentation](https://helm.sh/docs) to get started;
- The `jq` command must installed;
- The `yq` command must installed;
- The `kubectl` command must be installed;
- Have your [Port credentials](../../../sync-data-to-catalog/api/#find-your-port-credentials) ready.

In this use-case, you will use a custom bash script which will assist you in the process of installing Port's K8s exporter.

:::note
For more information about the k8s exporter installation script click [here](../installation-script.md)!
:::

The script will install the helm chart in the Kubernetes cluster which is currently in kubectl context.
To view the context name of the cluster the exporter will be installed on, run:

```bash showLineNumbers
kubectl config current-context
```

## Setting up your blueprints

### Creating blueprints using the installation script

The installation script provides a convenient way to create your blueprints. Using the `CUSTOM_BP_PATH` environment variable, you can fetch a pre-defined `blueprints.json` to create your blueprints.

- If you use **Argo Rollouts**, use [this file](https://github.com/port-labs/template-assets/blob/main/kubernetes/blueprints/argo-argo_rollouts-blueprints.json) to define your blueprints. Do this by running:

```bash showLineNumbers
export CUSTOM_BP_PATH="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/blueprints/argo-argo_rollouts-blueprints.json"
```

- If you don't use Argo Rollouts, use [this file](https://github.com/port-labs/template-assets/blob/main/kubernetes/blueprints/argo-blueprints.json) by running:

```bash showLineNumbers
export CUSTOM_BP_PATH="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/blueprints/argo-blueprints.json"
```

This `blueprints.json` file defines the following blueprints:

- Cluster;
- Namespace;
- Node;
- Pod;
- Workload \*;
- ArgoCD Application;
- ArgoCD Project;
- ArgoCD Repository.

:::note

- `Workload` is an abstraction of Kubernetes objects which create and manage pods. By creating this blueprint, you can avoid creating a dedicated blueprint per Workload type, all of which will likely look pretty similar.
  Here is the list of kubernetes objects `Workload` will represent:

  - Deployment;
  - ReplicaSet;
  - StatefulSet;
  - DaemonSet;
  - Argo Rollouts (Only for Rollouts `blueprints.json`).

:::

## Exporting your Kubernetes cluster

### Installing the Kubernetes exporter using the script

Using the `CONFIG_YAML_URL` parameter, you can define a custom `config.yaml` to use when installing the exporter.

- If you use **Argo rollouts**, use **[this configuration file](https://github.com/port-labs/template-assets/blob/main/kubernetes/templates/argo-argo_rollouts-kubernetes_v1_config.yaml)**. To achieve this, run:

```bash showLineNumbers
export CONFIG_YAML_URL="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/templates/argo-argo_rollouts-kubernetes_v1_config.yaml"
```

- If you don't use Argo Rollouts, use [this configuration file](https://github.com/port-labs/template-assets/blob/main/kubernetes/templates/argo-kubernetes_v1_config.yaml) by running:

```bash showLineNumbers
export CONFIG_YAML_URL="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/templates/argo-kubernetes_v1_config.yaml"
```

You can now run the installation script using the following code snippet:

```bash showLineNumbers
export CLUSTER_NAME="my-cluster"
export PORT_CLIENT_ID="my-port-client-id"
export PORT_CLIENT_SECRET="my-port-client-secret"
curl -s https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/install.sh | bash
```

You can now browse to your Port environment to see that your blueprints have been created, and your k8s and ArgoCD resources are being reported to Port using the freshly installed k8s exporter.
