---
sidebar_position: 1
---

import Image from "@theme/IdealImage";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem"
import KubernetesIllustration from "/static/img/build-your-software-catalog/sync-data-to-catalog/kubernetes/k8s-exporter-illustration.png";
import KubernetesEtl from "/static/img/build-your-software-catalog/sync-data-to-catalog/kubernetes/k8s-etl.png";
import FindCredentials from "/docs/build-your-software-catalog/custom-integration/api/\_template_docs/\_find_credentials_collapsed.mdx";
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Kubernetes

Port's Kubernetes exporter allows you to model Kubernetes resources in your software catalog and ingest data into them.

<center>

<Image img={KubernetesIllustration} style={{ width: 700 }} />

</center>

:::tip
Port's Kubernetes exporter is open source, view the source code [**here**](https://github.com/port-labs/port-k8s-exporter)
:::

## Overview

This integration allows you to:

- Map and organize your desired Kubernetes resources and their metadata in Port (see supported resources below).
- Watch for Kubernetes object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Use relations to create a complete, easily digestible map of your K8s cluster inside Port;
- Map your Kubernetes resources from common CRDs such as ArgoCD, Istio and more;


### Supported resources

The resources that can be mapped from Kubernetes cluster into Port are listed below.
- Namespaces
- Pods
- Replica sets
- Cluster nodes
- Deployments
- Other cluster objects;

## How it works

Port's Kubernetes exporter allows you to bring all the data supported by the K8s API to show running services, environments and more. The open source Kubernetes exporter allows you to perform extract, transform, load (ETL) on data from K8s into the desired software catalog data model.

The exporter is deployed using a Helm chart installed on the cluster. Once it is set up, it continues to sync changes, meaning that all changes, deletions or additions are accurately and automatically reflected in Port.

The helm chart uses a YAML configuration stored in the integration within your Portal. This configuration describes the ETL process responsible for loading data into the developer portal. The approach reflects a golden middle between an overly opinionated K8s visualization that might not work for everyone and a too-broad approach that could introduce unneeded complexity into the developer portal.

Here is an example snippet from the integration configuration which demonstrates the ETL process for getting `ReplicaSet` data from the cluster and into the software catalog:

<center>

<Image img={KubernetesEtl} style={{ width: 700 }} />

</center>

The exporter makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the Kubernetes objects.

### Exporter JQ configuration

The exporter configuration is how you specify the exact resources you want to query from your K8s cluster, and also how you specify which entities and which properties you want to fill with data from the cluster.

Here is an example configuration block:

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

### Exporter configuration structure

- The root key of the configuration YAML is the `resources` key:

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

- The `port`, `entity` and the `mappings` keys open the section used to map the Kubernetes object fields to Port entities, the `mappings` key is an array where each object matches the structure of an [entity](/build-your-software-catalog/sync-data-to-catalog/sync-data-to-catalog.md#entity-json-structure)

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
- You will need your [Port credentials](/build-your-software-catalog/custom-integration/api/api.md#find-your-port-credentials) to install the Kubernetes exporter.

:::tip
<FindCredentials />
:::

:::info
The exporter helm chart can be found [here](https://github.com/port-labs/helm-charts/tree/main/charts/port-k8s-exporter)
:::

## Installation

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="helm" label="Helm" default>

1. Add Port's Helm repo by using the following command:

   ```bash showLineNumbers
   helm repo add port-labs https://port-labs.github.io/helm-charts
   ```

   :::tip
   If you already added Port's Helm repo earlier, run `helm repo update` to retrieve the latest versions of the charts. You can then run `helm search repo port-labs` to see the charts.
   :::

2. Install the exporter service on your Kubernetes cluster by running the following command:

   ```bash showLineNumbers
    helm upgrade --install my-port-k8s-exporter port-labs/port-k8s-exporter \
        --create-namespace --namespace port-k8s-exporter \
        --set secret.secrets.portClientId=YOUR_PORT_CLIENT_ID \
        --set secret.secrets.portClientSecret=YOUR_PORT_CLIENT_SECRET \
        --set portBaseUrl='https://api.getport.io' \
        --set stateKey="k8s-exporter"  \
        --set eventListener.type="POLLING"  \
        --set "extraEnv[0].name"="CLUSTER_NAME" \
        --set "extraEnv[0].value"=YOUR_PORT_CLUSTER_NAME
    ```
<PortApiRegionTip/>

</TabItem>

<TabItem value="argo" label="ArgoCD">

1. Install the `my-port-k8s-exporter` ArgoCD Application by creating the following `my-port-k8s-exporter.yaml` manifest:
    :::note
    Remember to replace the placeholders for `LATEST_HELM_RELEASE` `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.
    
    You can find the latest version `port-k8s-exporter` chart in our [Releases](https://github.com/port-labs/helm-charts/releases?q=port-k8s-exporter&expanded=true) page.

    Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).
    :::

    <details>
      <summary>ArgoCD Application</summary>
    
    ```yaml showLineNumbers
    apiVersion: argoproj.io/v1alpha1
    kind: Application
    metadata:
      name: my-port-k8s-exporter
      namespace: argocd
    spec:
      destination:
        namespace: my-port-k8s-exporter
        server: https://kubernetes.default.svc
      project: default
      sources:
      - repoURL: 'https://port-labs.github.io/helm-charts/'
        chart: port-k8s-exporter
        // highlight-next-line
        targetRevision: LATEST_HELM_RELEASE
        helm:
          valueFiles:
            - $values/argocd/my-port-k8s-exporter/values.yaml
          parameters:
            - name: secret.secrets.portClientId
              // highlight-next-line
              value: YOUR_PORT_CLIENT_ID
            - name: secret.secrets.portClientSecret
              // highlight-next-line
              value: YOUR_PORT_CLIENT_SECRET
            - name: portBaseUrl
              value: https://api.getport.io
            - name: stateKey
              // highlight-next-line
              value: YOUR_CLUSTER_NAME
            - name: extraEnv[0].name
              value: CLUSTER_NAME
            - name: extraEnv[0].value
              // highlight-next-line
              value: YOUR_CLUSTER_NAME
      // highlight-next-line
      - repoURL: YOUR_GIT_REPO_URL
        targetRevision: main
        ref: values
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
        syncOptions:
        - CreateNamespace=true
    ```
    
    <PortApiRegionTip/>

    </details>
    <br/>

2. Apply your application manifest with `kubectl`:
```bash
kubectl apply -f my-port-k8s-exporter.yaml
```

</TabItem>
</Tabs>

:::info
By default, the exporter will try to initiate pre-defined blueprints and resource mapping.
:::

Done! The exporter will begin creating and updating objects from Kubernetes cluster as Port entities shortly.

### Updating exporter configuration

To **update** the exporter resource mapping, open the [data sources](https://app.getport.io/settings/data-sources) page in Port and click on your Kubernetes integration. Then edit the exporter configuration and click on the `Save & Resync` button.

## Examples

Refer to the [examples](./basic-example.md) page for practical configurations and their corresponding blueprint definitions.

## Advanced

Refer to the [advanced](./advanced.md) page for advanced use cases and outputs.
