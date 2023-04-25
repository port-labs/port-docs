---
sidebar_position: 2
---

# Map Your Complete K8s Ecosystem

Kubernetes has become one of the most popular ways to deploy microservice based applications. As the number of your microservices grow, and more clusters are deployed across several regions, it becomes complicated and tedious to keep track of all of your deployments, services, and jobs.

Using Port's Kubernetes Exporter, you can keep track of your K8s resources and export all of the data to Port. We will use K8s' built in metadata to create Entities in Port and keep track of their state.

:::tip
Get to know the basics of our Kubernetes exporter [here!](./kubernetes.md)
:::

## Prerequisites

- [Helm](https://helm.sh) must be installed to use the chart. Please refer to
  Helm's [documentation](https://helm.sh/docs) to get started;
- The `jq` command must installed on your system

The script will install the helm chart to the Kubernetes cluster which is currently in kubectl context.
To view the context name of the cluster the exporter will be installed on, run:

```bash showLineNumbers
kubectl config current-context
```

In this use-case, you will use a custom bash script which will assist you in the process of installing Port's K8s exporter. This will be done by fetching relevant files, setting up your Port [blueprints](../../define-your-data-model/setup-blueprint/) and passing the necessary flags to the exporter's helm chart using the [installation](./kubernetes.md#installation) commands.

## K8s exporter installation script

:::tip
You can view the bash script [here](https://github.com/port-labs/template-assets/blob/main/kubernetes/install.sh).
:::

### Script configuration

The script supports configuration via environment variables

#### General installation configuration

| Environment Variable | Description                                                                                                                                                                                                                                                                                                                                                                                                                                           | Default             |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `TARGET_NAMESPACE`   | The Kubernetes namespace in which the exporter will be installed                                                                                                                                                                                                                                                                                                                                                                                      | `port-k8s-exporter` |
| `DEPLOYMENT_NAME`    | The Kubernetes deployment name the exporter will be installed as                                                                                                                                                                                                                                                                                                                                                                                      | `port-k8s-exporter` |
| `CLUSTER_NAME`       | The cluster's name as it will be exported to Port                                                                                                                                                                                                                                                                                                                                                                                                     | `my-cluster`        |
| `CUSTOM_BP_PATH`     | The URL/path to a json file with an array of blueprint objects to create. Can be either a `https://domain.com/path/to/blueprint.json` format URL, or a local path to a file `envs/production/blueprint.json`. It is important to order the blueprints while taking in to account the necessary relations for each blueprint. Once a blueprint was created, attempting to recreate it using the script will fail. To do so, first delete the blueprint |                     |

:::note
The script replaces all occurrences of the string `{CLUSTER_NAME}` from the config yaml set in the `CONFIG_YAML_URL`([defined here](./full-kubernetes-exporter.md#helm-chart-installation-configuration)) with the value of the environment variable `CLUSTER_NAME`. This is useful for when creating a generic `config.yaml` which has no static cluster name.
:::

#### Helm Chart Installation configuration

Required configuration as defined in the exporter's [advanced configuration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/kubernetes/advanced#required-configuration) section.

| Environment Variable | Description                                                                                                                                                                                                                                                                                                                                     | Default                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `PORT_CLIENT_ID`     | **Required** - Your Port organization's Client ID used to authenticate the exporter to Port                                                                                                                                                                                                                                                     |                                                                                            |
| `PORT_CLIENT_SECRET` | **Required** - Your Port organization's Client Secret used to authenticate the exporter to Port                                                                                                                                                                                                                                                 |                                                                                            |
| `CONFIG_YAML_URL`    | The URL/path to the `config.yaml` file. Can be either an https format URL`https://domain.com/path/to/config.yaml`, or a local path to a file `envs/production/config.yaml`                                                                                                                                                                      | `https://github.com/port-labs/template-assets/blob/main/kubernetes/kubernetes_config.yaml` |
| `TEMPLATE_NAME`      | A list of pre-made templates to install on top of the base `kubernetes_config.yaml` defined in the default `CONFIG_YAML_URL`. This parameter is only relevant if a custom `CONFIG_YAML_URL` was not configured. It adds the associated `.tmpl` files the can be found [here](https://github.com/port-labs/template-assets/tree/main/kubernetes) |                                                                                            |

## Setting up your Blueprints

### Creating Blueprints using the installation script

The [installation script](./full-kubernetes-exporter.md#k8s-exporter-installation-script) provides a convenient way to create your blueprints. Using the `CUSTOM_BP_PATH` environment variable, you can fetch a pre-defined `blueprints.json` to create your blueprints. For this use-case, you will use [this](https://github.com/port-labs/template-assets/blob/main/kubernetes/blueprints/kubernetes_bps.json) for defining your blueprints. Do this by running:

```
export CUSTOM_BP_PATH="https://github.com/port-labs/template-assets/blob/main/kubernetes/blueprints/kubernetes_bps.json"
```

This `blueprints.json` file defines the following blueprints:

- Cluster
- Namespace
- Node
- Pod
- Workload \*
- Service \*
- ClusterRole
- Role

:::note

- `Workload` is an abstraction of Kubernetes objects which create and manage pods. By creating this Blueprint, we can avoid creating a dedicated Blueprint per Workload type, all of which will likely look pretty similar.
  Here is the list of kubernetes objects `Workload` will represent:

* Deployment
* ReplicaSet
* StatefulSet
* DaemonSet
* Job

- `Service` uses selectors to route traffic to pods. Since this is not a direct mapping, relating a service to a workload is usually done using a strict naming convention. This use-case assumes a naming convention where the `Workload`'s name is equal to its associated `service`.

:::

![Blueprints outcome](../../../../static/img/complete-use-cases/full-kubernetes-exporter/blueprints.png)

## Exporting your Kubernetes cluster

### Installing the Kubernetes exporter using the script

Now it is time to run the installation script and deploy Port's Kubernetes Exporter.
By default (unless a custom `CONFIG_YAML_URL` is set), the installation script fetches a `config.yaml` which as support for core k8s resources - Cluster, Namespace, Workload, Pod, Node. If the default `config.yaml` is used, you can use custom pre-built templates to add on to the `config.yaml` using the `TEMPLATE_NAME` environment variable. In this use-case you will be using the `basic_expansion` template. To achieve this, run:

```
export TEMPLATE_NAME="basic_expansion"
```

Now you are ready to run the installation script:

```
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
