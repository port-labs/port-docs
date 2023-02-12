---
sidebar_position: 1
---

import Image from "@theme/IdealImage";
import KubernetesIllustration from "../../../../static/img/build-your-software-catalog/sync-data-to-catalog/kubernetes/k8s-exporter-illustration.png";
import FindCredentials from "../api/\_template_docs/\_find_credentials.mdx";

# Kubernetes

Our integration with Kubernetes queries your Kubernetes clusters directly according to your definition. By using our Kubernetes integration you can ingest live data, directly from your K8s clusters into Port in a transparent, efficient and precise manner, thus making sure only the information you need appears in the software catalog, and remains up to date.

<center>

<Image img={KubernetesIllustration} style={{ width: 700 }} />

</center>

:::tip
Port's Kubernetes exporter is open source, view the source code [**here**](https://github.com/port-labs/)
:::

## 💡 Kubernetes exporter common use cases

Our Kubernetes exporter makes it easy to fill the software catalog with live data directly from your clusters, for example:

- Map all of the **namespaces** in your clusters;
- List all of the **pods**, **replica sets**, **cluster nodes**, **deployments** and other cluster objects;
- Use relations to create a complete, easily digestible map of your K8s cluster inside Port;
- etc.

## How it works

## Prerequisites

- Port's Kubernetes exporter is installed using [Helm](https://helm.sh), so Helm must be installed to use the exporter's chart. Please refer to
  Helm's [documentation](https://helm.sh/docs) for installation instructions.
- You will need you [Port credentials](../api/api.md#find-your-port-credentials) to install the Kubernetes exporter

:::tip
<FindCredentials />
:::

:::info
The helm chart can be found [here](https://github.com/port-labs/helm-charts/tree/main/charts/port-k8s-exporter)
:::

## Installation

1. Add Port's Helm repo by using the following command:

   ```bash showLineNumbers
   helm repo add port-labs https://port-labs.github.io/helm-charts
   ```

   :::tip
   If you already added Port's Helm repo earlier, run `helm repo update` to retrieve the latest versions of the charts. You can then run `helm search repo port-labs` to see the charts.
   :::

2. Prepare a [`config.yml`](#configure-k8s-exporter) file that will define which Kubernetes objects to ingest to Port;

3. Install the exporter service on your Kubernetes cluster by running the following command:

   ```bash showLineNumbers
   helm install my-port-k8s-exporter port-labs/port-k8s-exporter \
    --create-namespace --namespace port-k8s-exporter \
    --set secret.secrets.portClientId=CLIENT_ID --set secret.secrets.portClientSecret=CLIENT_SECRET \
    --set-file configMap.config=config.yaml
   ```

For example, in order to export your Kubernetes `Replica Sets` and `Pods` to Port, you may use the following Port Blueprints definitions, and `config.yaml`:

<details>
<summary> Deployment Config Blueprint </summary>

```json showLineNumbers
{
  "identifier": "deploymentConfig",
  "title": "Deployment Config",
  "icon": "Cluster",
  "schema": {
    "properties": {
      "newRelicUrl": {
        "type": "string",
        "format": "url",
        "title": "New Relic",
        "description": "Link to the new relic dashboard of the service",
        "default": "https://newrelic.com"
      },
      "sentryUrl": {
        "type": "string",
        "format": "url",
        "title": "Sentry URL",
        "description": "Link to the new sentry dashboard of the service",
        "default": "https://sentry.io/"
      },
      "prometheusUrl": {
        "type": "string",
        "format": "url",
        "title": "Prometheus URL",
        "default": "https://prometheus.io"
      },
      "locked": {
        "type": "boolean",
        "title": "Locked",
        "default": false,
        "description": "Are deployments currently allowed for this configuration",
        "icon": "Lock"
      },
      "creationTimestamp": {
        "type": "string",
        "title": "Creation Timestamp",
        "format": "date-time"
      },
      "annotations": {
        "type": "object",
        "title": "Annotations"
      },
      "status": {
        "type": "object",
        "title": "Status"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</details>

<details>
<summary> Deployed Service Pod Blueprint </summary>

```json showLineNumbers
{
  "identifier": "deployedServicePod",
  "title": "Deployed Service Pod",
  "icon": "Cluster",
  "schema": {
    "properties": {
      "startTime": {
        "type": "string",
        "title": "Start Time",
        "format": "date-time"
      },
      "phase": {
        "type": "string",
        "title": "Phase",
        "enum": ["Pending", "Running", "Succeeded", "Failed", "Unknown"],
        "enumColors": {
          "Pending": "yellow",
          "Running": "blue",
          "Succeeded": "green",
          "Failed": "red",
          "Unknown": "darkGray"
        }
      },
      "labels": {
        "type": "object",
        "title": "Labels"
      },
      "containers": {
        "title": "Containers",
        "type": "array"
      },
      "conditions": {
        "type": "array",
        "title": "Conditions"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "deploymentConfig": {
      "target": "deploymentConfig",
      "required": false,
      "many": false
    }
  }
}
```

</details>

<details>
<summary> Port K8s Exporter config.yaml </summary>

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
  - kind: v1/pods
    selector:
      query: .metadata.namespace | startswith("kube") | not
    port:
      entity:
        mappings:
          - identifier: .metadata.name
            title: .metadata.name
            blueprint: '"deployedServicePod"'
            properties:
              startTime: .status.startTime
              phase: .status.phase
              labels: .metadata.labels
              containers: (.spec.containers | map({image, resources})) + .status.containerStatuses | group_by(.image) | map(add)
              conditions: .status.conditions
            relations:
              deploymentConfig: .metadata.ownerReferences[0].name
```

</details>

:::info

- A reference of available Kubernetes Resources to list, watch, and export can be found [here](https://kubernetes.io/docs/reference/kubernetes-api/)
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to give you the power to map and transform K8s objects to Port Entities.

:::

1. After configuring the `config.yml` file from the previous step. Install the `Kubernetes Exporter` chart by using the following command:

```bash showLineNumbers
helm install my-port-k8s-exporter port-labs/port-k8s-exporter \
    --create-namespace --namespace port-k8s-exporter \
    --set secret.secrets.portClientId=CLIENT_ID --set secret.secrets.portClientSecret=CLIENT_SECRET \
    --set-file configMap.config=config.yaml
```

Done! the exporter will begin creating and updating objects from your Kubernetes cluster as Port Entities shortly.

For instance, you can see a `Deployment Config` and its `Pods` in a single Port Entity page:

## Configure k8s exporter

## Next Steps

[Explore How to install and automatically import Entities from k8s](./quickstart)
