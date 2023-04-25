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
| `PORT_CLIENT_ID`     | Your Port organization's Client ID used to authenticate the exporter to Port                                                                                                                                                                                                                                                                    |                                                                                            |
| `PORT_CLIENT_SECRET` | Your Port organization's Client Secret used to authenticate the exporter to Port                                                                                                                                                                                                                                                                |                                                                                            |
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

Create a `config.yaml` with your relevant queries and Blueprints.
In the Git repository under `exporter-config/config.yaml`, you can find a pre-made `config.yaml` which is configured to match the Blueprints we created earlier using Terraform. This `config.yaml` maps resources from all of the namespaces which dont start with "kube", and some cluster-scope resources.

### Updating the exporter using Github Workflows

To keep the mapping of cluster resources to Port up-to-date, you can use a GitHub Workflow to update the `config.yml` file applied to your K8s cluster whenever you make an update. On change to the `config.yml` file, the GitHub workflow will update the K8s exporter config deployed to your cluster.
This can be achieved by using the following workflow:

```yaml showLineNumbers
name: Update K8s Exporter

on:
  push:
    paths:
      - "exporter-config/config.yaml"
  workflow_dispatch:

jobs:
  update-k8s-exporter:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          persist-credentials: true
      - uses: azure/setup-helm@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }} # only needed if version is 'latest'
      - uses: azure/setup-kubectl@v3
        with:
          version: "v1.24.0" # default is latest stable
      - name: Configure AWS Credentials 🔒
        id: aws-credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}
      - name: Update Exporter
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          AWS_DEFAULT_REGION: ${{ secrets.AWS_REGION }}
          AWS_DEFAULT_OUTPUT: json
        run: |
          // highlight-next-line
          # Replace this command with your method of fetching the kubeconfig file for your cluster
          aws eks update-kubeconfig --name ${{ secrets.EKS_CLUSTER_NAME }}

          helm repo add port-labs https://port-labs.github.io/helm-charts
          helm repo update

          helm upgrade my-port-k8s-exporter port-labs/port-k8s-exporter \
          --create-namespace --namespace port-k8s-exporter \
          --set secret.secrets.portClientId=${{ secrets.PORT_CLIENT_ID }} --set secret.secrets.portClientSecret=${{ secrets.PORT_CLIENT_SECRET }} \
          --set-file configMap.config=./exporter-config/config.yaml --install
```

:::note
The example above is for K8s clusters managed using AWS EKS, if you’re using a different K8s provider, you will need to change the method used to fetch your kubeconfig file inside the workfow
:::

This workflow will check for changes in the `exporter-config/config.yaml` file, whenever a change occurs the updated Kubernetes exporter config will be deployed to your cluster.

## Summary

In this use-case, you implemented a complete GitOps based flow for exporting data from a Kubernetes cluster to Port, using Port's K8s Exporter and Terraform provider. You now have a comprehensive mapping of your Kubernetes cluster in Port, that updates in real-time according to the state of your Kubernetes cluster and allowes you to view information directly from Port such as replica counts for your deployments, node readiness and job run statuses.
