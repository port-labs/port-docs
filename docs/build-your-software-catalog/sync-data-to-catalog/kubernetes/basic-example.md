---
sidebar_position: 3
description: Basic Example
---

import Image from "@theme/IdealImage";
import SpecificEntityPage from "/static/img/integrations/k8s-exporter/DeploymentConfigAndPods.png"
import AuditLogPage from "/static/img/integrations/k8s-exporter/AuditLog.png"

# Basic example

## Basic Pod and ReplicaSet solution

In the following example you will export your Kubernetes `Replica Sets` and `Pods` to Port, you may use the following Port blueprint definitions, and exporter configuration:

- **Deployment config** - will represent replica sets from the K8s cluster;
- **Deployed service pod** - will represent pods from the K8s cluster.

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
<summary> Port K8s Exporter configuration </summary>

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
            relations:
              deploymentConfig: .metadata.ownerReferences[0].name
```

</details>

After creating the blueprints, open your integration in the [data sources](https://app.getport.io/settings/data-sources) page, apply the provided configuration and click on the `Save & Resync` button.

Done! The exporter will begin creating and updating objects from your Kubernetes cluster as Port entities shortly.

For instance, you can see a `Deployment Config` and its `Pods` in a single Port entity page:

<center>

<Image img={SpecificEntityPage} style={{ width: 1000 }} />

</center>

:::note Note
The Kubernetes exporter was instructed to fill in only some properties in a `Deployment Config` Entity. By its nature, it will keep the values of other properties untouched.
:::

And you can look for the respective audit logs with an indication of the Kubernetes exporter as the source:

<center>

<Image img={AuditLogPage} style={{ width: 1000 }} />

</center>

## Map your complete K8s ecosystem

To learn how you can visualize a complete K8s cluster, including **nodes**, **namespaces**, **cluster roles**, **deployments**, **pods**, and more - check out our Kubernetes mapping [complete use case](./templates/full-kubernetes-exporter.md)
