---
sidebar_position: 1
---

import Image from "@theme/IdealImage";
import ExporterBaseInstallCommand from "./\_exporter_base_install_command.mdx"
import KubernetesIllustration from "../../../../static/img/build-your-software-catalog/sync-data-to-catalog/kubernetes/k8s-exporter-illustration.png";
import KubernetesEtl from "../../../../static/img/build-your-software-catalog/sync-data-to-catalog/kubernetes/k8s-etl.png";
import FindCredentials from "../api/\_template_docs/\_find_credentials_collapsed.mdx";

# Kubernetes

Our integration with Kubernetes queries your Kubernetes clusters directly according to your definition. By using our Kubernetes integration you can ingest live data, directly from your K8s clusters into Port in a transparent, efficient and precise manner, thus making sure only the information you need appears in the software catalog, and remains up to date.

Our integration with Kubernetes provides real-time event processing, this allows for an accurate **real-time** representation of your K8s cluster inside Port.

<center>

<Image img={KubernetesIllustration} style={{ width: 700 }} />

</center>

:::tip
Port's Kubernetes exporter is open source, view the source code [**here**](https://github.com/port-labs/port-k8s-exporter)
:::

## 💡 Kubernetes exporter common use cases

Our Kubernetes exporter makes it easy to fill the software catalog with live data directly from your clusters, for example:

- Map all of the resources in your clusters, including **namespaces**, **pods**, **replica sets**, **cluster nodes**, **deployments** and other cluster objects;
- Get real-time metadata from your cluster such as _replica counts_, _deployment health_, _node health_ and more;
- Use relations to create a complete, easily digestible map of your K8s cluster inside Port;
- Map your Kubernetes resources from common CRDs such as ArgoCD, Istio and more;
- etc.

## How it works

Port's Kubernetes exporter allows you to bring all the data supported by the K8s API to show running services, environments and more. The open source Kubernetes exporter allows you to perform extract, transform, load (ETL) on data from K8s into the desired software catalog data model.

The exporter is deployed using a Helm chart that is installed on the cluster. Once it is set up, it continues to sync changes, meaning that all changes, deletions or additions are accurately and automatically reflected in Port.

The helm chart uses a YAML configuration file to describe the ETL process to load data into the developer portal. The approach reflects a golden middle between an overly opinionated K8s visualization that might not work for everyone and a too-broad approach that could introduce unneeded complexity into the developer portal.

Here is an example snippet from the `config.yml` file which demonstrates the ETL process for getting `ReplicaSet` data from the cluster and into the software catalog:

<center>

<Image img={KubernetesEtl} style={{ width: 700 }} />

</center>

The exporter makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the Kubernetes objects.

### Exporter `config.yml` file

The `config.yml` file is how you specify the exact resources you want to query from your K8s cluster, and also how you specify which entities and which properties you want to fill with data from the cluster.

Here is an example `config.yml` block:

```yaml showLineNumbers
resources: # List of K8s resources to list, watch, and export to Port.
  - kind: apps/v1/replicasets # group/version/resource (G/V/R) format
    selector:
      query: .metadata.namespace | startswith("kube") | not # JQ boolean query. If evaluated to false - skip syncing the object.
    port:
      entity:
        mappings: # Mappings between one K8s object to one or many Port Entities. Each value is a JQ query.
          - identifier: .metadata.name
            title: .metadata.name
            blueprint: '"deploymentConfig"'
            properties:
              creationTimestamp: .metadata.creationTimestamp
              annotations: .metadata.annotations
              status: .status
```

### `config.yml` structure

- The root key of the `config.yml` file is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: apps/v1/replicasets
      selector:
      ...
  ```

- The `kind` key is a specifier for an object from the K8s API or CRD following the group/version/resource (G/V/R) format:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: apps/v1/replicasets
        selector:
        ...
  ```

  :::tip
  A reference of available Kubernetes Resources to list, watch, and export can be found [**here**](https://kubernetes.io/docs/reference/kubernetes-api/)
  :::

- The `selector` and the `query` keys let you filter exactly which objects from the specified `kind` will be ingested to the software catalog

  ```yaml showLineNumbers
  resources:
    - kind: apps/v1/replicasets
      # highlight-start
      selector:
        query: .metadata.namespace | startswith("kube") | not # JQ boolean query. If evaluated to false - skip syncing the object.
      # highlight-end
      port:
  ```

  Some example use cases:

  - To sync all objects from the specified `kind`: do not specify a `selector` and `query` key;
  - To sync all objects from the specified `kind` that are not related to the internal Kubernetes system, use:

    ```yaml showLineNumbers
    query: .metadata.namespace | startswith("kube") | not
    ```

  - To sync all objects from the specified `kind` that start with `production`, use:

    ```yaml showLineNumbers
    query: .metadata.namespace | startswith("production")
    ```

  - etc.

- The `port`, `entity` and the `mappings` keys open the section used to map the Kubernetes object fields to Port entities, the `mappings` key is an array where each object matches the structure of an [entity](../sync-data-to-catalog.md#entity-json-structure)

  ```yaml showLineNumbers
  resources:
    - kind: apps/v1/replicasets
      selector:
        query: .metadata.namespace | startswith("kube") | not
      # highlight-start
      port:
        entity:
          mappings: # Mappings between one K8s object to one or many Port Entities. Each value is a JQ query.
            - identifier: .metadata.name
              title: .metadata.name
              blueprint: '"myBlueprint"'
              properties:
                creationTimestamp: .metadata.creationTimestamp
                annotations: .metadata.annotations
                status: .status
              relations:
                myRelation: .metadata.namespace
      # highlight-end
  ```

## Prerequisites

- Port's Kubernetes exporter is installed using [Helm](https://helm.sh), so Helm must be installed to use the exporter's chart. Please refer to
  Helm's [documentation](https://helm.sh/docs) for installation instructions;
- You will need your [Port credentials](../api/api.md#find-your-port-credentials) to install the Kubernetes exporter.

:::tip
<FindCredentials />
:::

:::info
The exporter helm chart can be found [here](https://github.com/port-labs/helm-charts/tree/main/charts/port-k8s-exporter)
:::

## Installation

1. Add Port's Helm repo by using the following command:

   ```bash showLineNumbers
   helm repo add port-labs https://port-labs.github.io/helm-charts
   ```

   :::tip
   If you already added Port's Helm repo earlier, run `helm repo update` to retrieve the latest versions of the charts. You can then run `helm search repo port-labs` to see the charts.
   :::

2. Prepare a [`config.yml`](#exporter-configyml-file) file that will define which Kubernetes objects to ingest to Port;

3. Install the exporter service on your Kubernetes cluster by running the following command:

   <ExporterBaseInstallCommand />

Done! the exporter will begin creating and updating objects from your Kubernetes cluster as Port entities shortly.

:::tip Updating exporter configuration
In order to **update** the `config.yml` file deployed on your Kubernetes cluster, you can run the installation command again:

<ExporterBaseInstallCommand />

:::

## Examples

Refer to the [examples](./examples.md) page for practical configurations and their corresponding blueprint definitions.

## Advanced

Refer to the [advanced](./advanced.md) page for advanced use cases and outputs.
