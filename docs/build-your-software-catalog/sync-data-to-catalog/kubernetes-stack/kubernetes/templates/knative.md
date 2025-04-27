---
sidebar_position: 3
description: Knative quickstart
---
import TemplateInstallation from "./_template_installation.mdx";
import TemplatePrerequisites from "./_template_prerequisites.mdx";

# Knative

[Knative](https://knative.dev/docs/concepts/) is an open-source community project, which enhances Kubernetes by introducing components that facilitate the deployment, execution, and administration of serverless, cloud-native applications.

Using Port's Kubernetes Exporter, you can keep track of the Knative resources across your different clusters and export all of the data to Port. You will use built in metadata from your kubernetes resources and CRDs to create Entities in Port and keep track of their state.

:::tip
Get to know the basics of our Kubernetes exporter [here!](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/kubernetes.md)
:::

<img src="/img/build-your-software-catalog/sync-data-to-catalog/kubernetes/k8sKnativeView.png" border="1px"/>

## Prerequisites

<TemplatePrerequisites />

## Setting up blueprints & resource mapping

The following section will guide you through the process of setting up your blueprints and resource mapping using the
installation script. You can read more about the installation script [here](#how-does-the-installation-script-work).

### Creating blueprints

The installation script provides a convenient way to create your blueprints. Using the `CUSTOM_BP_PATH` environment variable, you can fetch a pre-defined `blueprints.json` to create your blueprints. For this use-case, you will use [this file](https://github.com/port-labs/template-assets/blob/main/kubernetes/blueprints/kubernetes_knative_usecase.json) to define your blueprints. Do this by running:

```bash
export CUSTOM_BP_PATH="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/blueprints/kubernetes_knative_usecase.json"
```

This `blueprints.json` file defines the following blueprints:

- Cluster
- Namespace
- Workload
- Knative Service
- Knative Configuration
- Knative Revision
- Knative Route

:::note

- `Workload` is an abstraction of Kubernetes objects which create and manage pods. By creating this blueprint, you can avoid creating a dedicated blueprint per Workload type, all of which will likely look pretty similar.
  Here is the list of kubernetes objects `Workload` will represent:

  - Deployment
  - ReplicaSet
  - StatefulSet
  - DaemonSet

:::

Below are the Knative blueprint schemas used in the exporter:

<details>
<summary> <b>Knative service blueprint (click to expand)</b> </summary>

```json showLineNumbers
{
  "identifier": "knativeService",
  "description": "This blueprint represents a Knative service",
  "title": "Knative Service",
  "icon": "Service",
  "schema": {
    "properties": {
      "creationTimestamp": {
        "icon": "Clock",
        "type": "string",
        "title": "Created",
        "description": "When the Knative service was created",
        "format": "date-time"
      },
      "labels": {
        "icon": "BlankPage",
        "type": "object",
        "title": "Labels",
        "description": "Labels of the Knative service"
      },
      "containerConcurrency": {
        "type": "number",
        "title": "Container Concurrency"
      },
      "containers": {
        "icon": "Docker",
        "title": "Containers",
        "type": "array",
        "description": "The array of containers configured for this service"
      },
      "trafficConfiguration": {
        "icon": "Cloud",
        "title": "Traffic Configuration",
        "type": "array",
        "description": "The traffic configuration of this service"
      },
      "url": {
        "title": "URL",
        "type": "string",
        "description": "The knative service's URL",
        "icon": "RestApi",
        "format": "url"
      },
      "generation": {
        "title": "Generation",
        "description": "The Knative service's generation",
        "type": "number"
      },
      "ready": {
        "title": "Ready",
        "type": "string",
        "enum": [
          "True",
          "False"
        ],
        "enumColors": {
          "True": "green",
          "False": "red"
        }
      },
      "serviceTimeout": {
        "icon": "DefaultProperty",
        "title": "Service Timeout(s)",
        "description": "The timeout configured for this service in seconds",
        "type": "number"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "namespace": {
      "title": "Namespace",
      "target": "namespace",
      "required": false,
      "many": false
    }
  }
}
```
</details>

<details>
<summary> <b>Knative configuration blueprint (click to expand)</b> </summary>

```json showLineNumbers
{
  "identifier": "knativeConfiguration",
  "description": "This blueprint represents a Knative Configuration",
  "title": "Knative Configuration",
  "icon": "CICD",
  "schema": {
    "properties": {
      "creationTimestamp": {
        "icon": "Clock",
        "type": "string",
        "title": "Created",
        "description": "When the Knative service was created",
        "format": "date-time"
      },
      "labels": {
        "icon": "BlankPage",
        "type": "object",
        "title": "Labels",
        "description": "Labels of the Knative service"
      },
      "ready": {
        "title": "Ready",
        "type": "string",
        "enum": [
          "True",
          "False"
        ],
        "enumColors": {
          "True": "green",
          "False": "red"
        }
      },
      "containers": {
        "icon": "Docker",
        "title": "Containers",
        "type": "array",
        "description": "Container specs for this configuration"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "knativeService": {
      "title": "Kative Service",
      "description": "The service managing this configuration",
      "target": "knativeService",
      "required": false,
      "many": false
    }
  }
}
```
</details>

<details>
<summary> <b>Knative revision blueprint (click to expand)</b> </summary>

```json showLineNumbers
{
  "identifier": "knativeRevision",
  "description": "This blueprint represents a Knative revision",
  "title": "Knative Revision",
  "icon": "Docker",
  "schema": {
    "properties": {
      "creationTimestamp": {
        "icon": "Clock",
        "type": "string",
        "title": "Created",
        "description": "When the Knative service was created",
        "format": "date-time"
      },
      "labels": {
        "icon": "BlankPage",
        "type": "object",
        "title": "Labels",
        "description": "Labels of the Knative service"
      },
      "isActive": {
        "type": "string",
        "title": "Is Active",
        "description": "Is the revision active currently",
        "enum": [
          "True",
          "False"
        ],
        "enumColors": {
          "True": "green",
          "False": "red"
        }
      },
      "containers": {
        "icon": "Docker",
        "title": "Containers",
        "type": "array",
        "description": "This revisions container configuration"
      },
      "replicaCount": {
        "title": "Replica Count",
        "description": "This revision's current replica count",
        "type": "number"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "knativeConfiguration": {
      "title": "Knative Configuration",
      "description": "The revisions configuration",
      "target": "knativeConfiguration",
      "required": false,
      "many": false
    }
  }
}
```
</details>

<details>
<summary> <b>Knative route blueprint (click to expand)</b> </summary>

```json showLineNumbers
{
  "identifier": "knativeRoute",
  "description": "This blueprint represents a Knative Route in our k8s cluster",
  "title": "Knative Route",
  "icon": "Cloud",
  "schema": {
    "properties": {
      "creationTimestamp": {
        "icon": "Clock",
        "type": "string",
        "title": "Created",
        "description": "When the Knative service was created",
        "format": "date-time"
      },
      "labels": {
        "icon": "DefaultProperty",
        "type": "object",
        "title": "Labels",
        "description": "Labels of the Knative service"
      },
      "trafficConfiguration": {
        "icon": "DefaultProperty",
        "title": "Traffic Configuration",
        "type": "array",
        "description": "The routes traffic configuration"
      },
      "url": {
        "icon": "RestApi",
        "title": "URL",
        "type": "string",
        "description": "The URL of this route",
        "format": "url"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "knativeRevision": {
      "title": "knativeRevision",
      "target": "knativeRevision",
      "required": false,
      "many": true
    },
    "knativeService": {
      "title": "Knative Service",
      "target": "knativeService",
      "required": false,
      "many": false
    }
  }
}
```
</details>

### Exporting custom resource mapping

Using the `CONFIG_YAML_URL` parameter, you can define a custom resource mapping to use when installing the exporter.

In this use-case you will be using **[this configuration file](https://github.com/port-labs/template-assets/blob/main/kubernetes/full-configs/kubernetes_kantive_usecase.yaml)**. To achieve this, run:

```bash
export CONFIG_YAML_URL="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/full-configs/kubernetes_kantive_usecase.yaml"
```

Below is the mapping for the Knative resources:

<details>
<summary> <b>Knative service mapping (click to expand)</b> </summary>

```yaml showLineNumbers
- kind: serving.knative.dev/v1/service
  selector:
    query: .metadata.name | startswith("kube") | not
  port:
    entity:
      mappings:
        - identifier: .metadata.name + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
          title: .metadata.name
          blueprint: '"knativeService"'
          properties:
            creationTimestamp: .metadata.creationTimestamp
            labels: .metadata.labels
            containerConcurrency: .spec.template.spec.containerConcurrency
            containers: .spec.template.spec.containers
            trafficConfiguration: .status.traffic
            serviceTimeout: .spec.template.spec.timeoutSeconds
            url: .status.url
            ready: .status.conditions[] | select(.type == "Ready") | .status
            generation: .metadata.generation
          relations:
            namespace: .metadata.namespace + "-" + env.CLUSTER_NAME
```
</details>

<details>
<summary> <b>Knative configuration mapping (click to expand)</b> </summary>

```yaml showLineNumbers
- kind: serving.knative.dev/v1/configuration
  selector:
    query: .metadata.name | startswith("kube") | not
  port:
    entity:
      mappings:
        - identifier: .metadata.name + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
          title: .metadata.name
          blueprint: '"knativeConfiguration"'
          properties:
            creationTimestamp: .metadata.creationTimestamp
            labels: .metadata.labels
            ready: .status.conditions[] | select(.type == "Ready") | .status
            containers: .spec.template.spec.containers
          relations:
            knativeService: .metadata.ownerReferences[0].name + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
```
</details>

<details>
<summary> <b>Knative revision mapping (click to expand)</b> </summary>

```yaml showLineNumbers
- kind: serving.knative.dev/v1/revision
  selector:
    query: .metadata.name | startswith("kube") | not
  port:
    entity:
      mappings:
        - identifier: .metadata.name + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
          title: .metadata.name
          blueprint: '"knativeRevision"'
          properties:
            creationTimestamp: .metadata.creationTimestamp
            labels: .metadata.labels
            isActive: .status.conditions[] | select(.type == "Active") | .status
            containers: .spec.containers
            replicaCount: .status.actualReplicas
          relations:
            knativeConfiguration: .metadata.ownerReferences[0].name + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
```
</details>

<details>
<summary> <b>Knative route mapping (click to expand)</b> </summary>

```yaml showLineNumbers
- kind: serving.knative.dev/v1/route
  selector:
    query: .metadata.name | startswith("kube") | not
  port:
    entity:
      mappings:
        - identifier: .metadata.name + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
          title: .metadata.name
          blueprint: '"knativeRoute"'
          properties:
            creationTimestamp: .metadata.creationTimestamp
            labels: .metadata.labels
            trafficConfiguration: .status.traffic
            url: .status.url
          relations:
            knativeRevision: '[.status.traffic[].revisionName + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME]'
            knativeService: .metadata.ownerReferences[0].name + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
```
</details>

You can now browse to your Port environment to see that your blueprints have been created, and your k8s and Knative resources are being reported to Port using the freshly installed k8s exporter.