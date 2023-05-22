---
sidebar_position: 2
description: Knative quickstart
---

# Knative

[Knative](https://knative.dev/docs/concepts/) is an open-source community project, which enhances Kubernetes by introducing components that facilitate the deployment, execution, and administration of serverless, cloud-native applications.

Using Port's Kubernetes Exporter, you can keep track of all Knative resources across your different clusters and export all of the data to Port. You will use built in metadata from your kubernetes resources and CRDs to create Entities in Port and keep track of their state.

:::tip
Get to know the basics of our Kubernetes exporter [here!](../kubernetes.md)
:::

## Prerequisites

- [Helm](https://helm.sh) must be installed to use the chart. Please refer to
  Helm's [documentation](https://helm.sh/docs) to get started;
- The `jq` command must installed;
- The `yq` command must installed;
- The `kubectl` command must be installed;
- Have your [Port credentials](../../../sync-data-to-catalog/api/#find-your-port-credentials) ready

In this use-case, you will use a custom bash script which will assist you in the process of installing Port's K8s exporter.

:::note
For more information about the k8s exporter installation script click [here](../installation-script.md)!
:::

The script will install the helm chart to the Kubernetes cluster which is currently in kubectl context.
To view the context name of the cluster the exporter will be installed on, run:

```bash showLineNumbers
kubectl config current-context
```

## Setting up your Blueprints

### Creating Blueprints using the installation script

The installation script provides a convenient way to create your blueprints. Using the `CUSTOM_BP_PATH` environment variable, you can fetch a pre-defined `blueprints.json` to create your blueprints. For this use-case, you will use [this file](https://github.com/port-labs/template-assets/blob/main/kubernetes/blueprints/kubernetes_knative_usecase.json) to define your blueprints. Do this by running:

```bash showLineNumbers
export CUSTOM_BP_PATH="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/blueprints/kubernetes_knative_usecase.json"
```

<details>
<summary> Knative blueprints.json </summary>

```json showLineNumbers
[
  {
    "identifier": "cluster",
    "description": "This blueprint represents a Kubernetes Cluster",
    "title": "Cluster",
    "icon": "Cluster",
    "schema": {
      "properties": {},
      "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "relations": {}
  },
  {
    "identifier": "node",
    "description": "This blueprint represents a k8s Node",
    "title": "Node",
    "icon": "Node",
    "schema": {
      "properties": {
        "creationTimestamp": {
          "type": "string",
          "icon": "DeployedAt",
          "title": "Created",
          "format": "date-time",
          "description": "When the Node was created (added to the cluster)"
        },
        "labels": {
          "type": "object",
          "title": "Labels",
          "description": "Labels of the Node"
        },
        "ready": {
          "type": "string",
          "title": "Node Readiness",
          "description": "Node ready status",
          "enum": ["True", "False"],
          "enumColors": {
            "False": "red",
            "True": "green"
          }
        },
        "totalMemory": {
          "type": "string",
          "icon": "GPU",
          "title": "Total Memory (kibibytes)",
          "description": "Total memory capacity of the Node"
        },
        "kubeletVersion": {
          "type": "string",
          "title": "Kubelet Version",
          "description": "The node's kubelet version"
        },
        "totalCPU": {
          "type": "string",
          "icon": "CPU",
          "title": "Total CPU (milli-cores)",
          "description": "Total CPU capacity of the Node"
        }
      },
      "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "relations": {
      "Cluster": {
        "title": "Cluster",
        "target": "cluster",
        "required": false,
        "many": true
      }
    }
  },
  {
    "identifier": "namespace",
    "description": "This blueprint represents a k8s Namespace",
    "title": "Namespace",
    "icon": "Environment",
    "schema": {
      "properties": {
        "creationTimestamp": {
          "type": "string",
          "title": "Created",
          "format": "date-time",
          "description": "When the Namespace was created"
        },
        "labels": {
          "type": "object",
          "title": "Labels",
          "description": "Labels of the Namespace"
        }
      },
      "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "relations": {
      "Cluster": {
        "title": "Cluster",
        "description": "The namespace's Kubernetes cluster",
        "target": "cluster",
        "required": false,
        "many": false
      }
    }
  },
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
          "enum": ["True", "False"],
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
    "relations": {
      "namespace": {
        "title": "Namespace",
        "target": "namespace",
        "required": false,
        "many": false
      }
    }
  },
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
          "enum": ["True", "False"],
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
    "relations": {
      "knativeService": {
        "title": "Kative Service",
        "description": "The service managing this configuration",
        "target": "knativeService",
        "required": false,
        "many": false
      }
    }
  },
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
          "enum": ["True", "False"],
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
    "relations": {
      "knativeConfiguration": {
        "title": "Knative Configuration",
        "description": "The revisions configuration",
        "target": "knativeConfiguration",
        "required": false,
        "many": false
      }
    }
  },
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
    "relations": {
      "knativeService": {
        "title": "Knative Service",
        "target": "knativeService",
        "required": false,
        "many": false
      },
      "knativeRevision": {
        "title": "knativeRevision",
        "target": "knativeRevision",
        "required": false,
        "many": true
      }
    }
  },
  {
    "identifier": "workload",
    "description": "This blueprint represents a k8s Workload. This includes all k8s objects which can create pods (deployments[replicasets], daemonsets, statefulsets...)",
    "title": "Workload",
    "icon": "Deployment",
    "schema": {
      "properties": {
        "workloadJson": {
          "title": "Workload Json",
          "type": "object",
          "description": "The workloads json"
        },
        "availableReplicas": {
          "type": "number",
          "title": "Running Replicas",
          "description": "Current running replica count"
        },
        "containers": {
          "type": "array",
          "title": "Containers",
          "default": [],
          "description": "The containers for each pod instance of the Workload"
        },
        "creationTimestamp": {
          "type": "string",
          "title": "Created",
          "format": "date-time",
          "description": "When the Workload was created"
        },
        "labels": {
          "type": "object",
          "title": "Labels",
          "description": "Labels of the Workload"
        },
        "replicas": {
          "type": "number",
          "title": "Wanted Replicas",
          "description": "Wanted replica count"
        },
        "strategy": {
          "type": "string",
          "title": "Strategy",
          "description": "Rollout Strategy"
        },
        "hasPrivileged": {
          "type": "boolean",
          "title": "Has Privileged Container"
        },
        "hasLatest": {
          "type": "boolean",
          "title": "Has 'latest' tag",
          "description": "Has Container with 'latest' as image tag"
        },
        "hasLimits": {
          "type": "boolean",
          "title": "All containers have limits"
        },
        "isHealthy": {
          "type": "string",
          "enum": ["Healthy", "Unhealthy"],
          "enumColors": {
            "Healthy": "green",
            "Unhealthy": "red"
          },
          "title": "Workload Health"
        },
        "kind": {
          "title": "Workload Kind",
          "description": "The kind of Workload",
          "type": "string",
          "enum": [
            "StatefulSet",
            "DaemonSet",
            "Deployment",
            "ReplicaSet",
            "Rollout"
          ]
        },
        "strategyConfig": {
          "type": "object",
          "title": "Strategy Config",
          "description": "The workloads rollout strategy"
        }
      },
      "required": []
    },
    "mirrorProperties": {
      "Cluster": {
        "title": "Cluster",
        "path": "Namespace.Cluster.$title"
      },
      "namespace": {
        "title": "Namespace",
        "path": "Namespace.$title"
      }
    },
    "calculationProperties": {},
    "relations": {
      "workloadManager": {
        "title": "Manager",
        "description": "A replicaset's workload. For example, Workload abc-ReplicaSet is managed by Workload xyz-Depolyment",
        "target": "workload",
        "required": false,
        "many": false
      },
      "knativeRevision": {
        "title": "Knative Revision",
        "description": "The knative revision which manages this workload",
        "target": "knativeRevision",
        "required": false,
        "many": false
      },
      "Namespace": {
        "title": "Namespace",
        "target": "namespace",
        "required": false,
        "many": false
      }
    }
  },
  {
    "identifier": "pod",
    "description": "This blueprint represents a k8s Pod",
    "title": "Pod",
    "icon": "Service",
    "schema": {
      "properties": {
        "conditions": {
          "type": "array",
          "title": "Conditions",
          "default": [],
          "description": "Pod's conditions"
        },
        "labels": {
          "type": "object",
          "title": "Labels",
          "description": "Labels of the Pod"
        },
        "phase": {
          "type": "string",
          "title": "Pod phase",
          "description": "Pod's running phase"
        },
        "startTime": {
          "type": "string",
          "title": "Created",
          "format": "date-time",
          "description": "Pod's creation date"
        }
      },
      "required": []
    },
    "mirrorProperties": {
      "containers": {
        "title": "Containers",
        "path": "workload.containers"
      },
      "cluster": {
        "title": "Cluster",
        "path": "workload.Namespace.Cluster.$identifier"
      },
      "namespace": {
        "title": "Namespace",
        "path": "workload.Namespace.$title"
      }
    },
    "calculationProperties": {},
    "relations": {
      "Node": {
        "title": "Node",
        "description": "The node the pod is running on",
        "target": "node",
        "required": false,
        "many": false
      },
      "workload": {
        "title": "Workload",
        "description": "The workload responsible for the pod",
        "target": "workload",
        "required": false,
        "many": false
      }
    }
  }
]
```

</details>

This `blueprints.json` file defines the following blueprints:

- Cluster
- Namespace
- Node
- Pod
- Workload \*
- Knative Service
- Knative Configuration
- Knative Revision
- Knative Route

:::note

- `Workload` is an abstraction of Kubernetes objects which create and manage pods. By creating this Blueprint, you can avoid creating a dedicated Blueprint per Workload type, all of which will likely look pretty similar.
  Here is the list of kubernetes objects `Workload` will represent:

* Deployment
* ReplicaSet
* StatefulSet
* DaemonSet

:::

## Exporting your Kubernetes cluster

### Installing the Kubernetes exporter using the script

Using the `CONFIG_YAML_URL` parameter, you can define a custom `config.yaml` to use when installing the exporter.

In this use-case you will be using the [this configuration file](https://github.com/port-labs/template-assets/blob/main/kubernetes/full-configs/kubernetes_kantive_usecase.yaml). To achieve this, run:

```bash showLineNumbers
export CONFIG_YAML_URL="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/full-configs/kubernetes_kantive_usecase.yaml"
```

<details>
<summary> Knative config.yaml </summary>

```json showLineNumbers
resources: # List of K8s resources to list, watch, and export to Port.
  - kind: v1/namespaces # group/version/resource (G/V/R) format
    selector:
      query: .metadata.name | startswith("kube") | not # JQ boolean query. If evaluated to false - skip syncing the object.
    port:
      entity:
        mappings: # Mappings between one K8s object to one or many Port Entities. Each value is a JQ query.
          - identifier: .metadata.name + "-" + "{CLUSTER_NAME}"
            title: .metadata.name
            blueprint: '"namespace"'
            properties:
              creationTimestamp: .metadata.creationTimestamp
              labels: .metadata.labels
            relations:
              Cluster: '"{CLUSTER_NAME}"'


# Defines cluster using the uniq
  - kind: v1/namespaces
    selector:
      query: .metadata.name | contains("kube-system")
    port:
      entity:
        mappings:
          - identifier: '"{CLUSTER_NAME}"'
            title: '"{CLUSTER_NAME}"'
            blueprint: '"cluster"'

  - kind: apps/v1/deployments
    selector:
      query: .metadata.namespace | startswith("kube") | not
    port:
      entity:
        mappings:
          - identifier: .metadata.name + "-Deployment-" + .metadata.namespace + "-" + "{CLUSTER_NAME}"
            title: .metadata.name
            icon: '"Deployment"'
            blueprint: '"workload"'
            properties:
              kind: '"Deployment"'
              workloadJson: .
              creationTimestamp: .metadata.creationTimestamp
              replicas: .spec.replicas
              hasPrivileged: .spec.template.spec.containers | [.[].securityContext.privileged] | any
              hasLatest: .spec.template.spec.containers[].image | contains(":latest")
              hasLimits: .spec.template.spec.containers | all(has("resources") and (.resources.limits.memory and .resources.limits.cpu))
              strategyConfig: .spec.strategy // null
              strategy: .spec.strategy.type
              availableReplicas: .status.availableReplicas
              labels: .metadata.labels
              containers: (.spec.template.spec.containers | map({name, image, resources}))
              isHealthy: if .spec.replicas == .status.availableReplicas then "Healthy" else "Unhealthy" end
            relations:
              Namespace: .metadata.namespace + "-" + "{CLUSTER_NAME}"

  - kind: apps/v1/replicasets
    selector:
      query: .metadata.namespace | startswith("kube") | not
    port:
      entity:
        mappings:
          - identifier: .metadata.name + "-ReplicaSet-" + .metadata.namespace + "-" + "{CLUSTER_NAME}"
            title: .metadata.name
            icon: '"Deployment"'
            blueprint: '"workload"'
            properties:
              kind: '"ReplicaSet"'
              workloadJson: .
              creationTimestamp: .metadata.creationTimestamp
              replicas: .spec.replicas
              hasPrivileged: .spec.template.spec.containers | [.[].securityContext.privileged] | any
              hasLatest: .spec.template.spec.containers[].image | contains(":latest")
              hasLimits: .spec.template.spec.containers | all(has("resources") and (.resources.limits.memory and .resources.limits.cpu))
              strategy: .spec.strategy.type // null
              availableReplicas: .status.availableReplicas
              labels: .metadata.labels
              containers: (.spec.template.spec.containers | map({name, image, resources}))
              isHealthy: if .spec.replicas == .status.availableReplicas then "Healthy" else "Unhealthy" end
            relations:
              workloadManager: .metadata.ownerReferences[0].name + "-" + .metadata.ownerReferences[0].kind + "-" + .metadata.namespace + "-" + "{CLUSTER_NAME}" // null
              Namespace: .metadata.namespace + "-" + "{CLUSTER_NAME}"
              knativeRevision: 'if (.metadata.ownerReferences[0].kind == "Revision") then .metadata.ownerReferences[0].name + "-" + .metadata.namespace + "-" + "{CLUSTER_NAME}" else null end'

  - kind: apps/v1/daemonsets
    selector:
      query: .metadata.namespace | startswith("kube") | not
    port:
      entity:
        mappings:
          - identifier: .metadata.name + "-DaemonSet-" + .metadata.namespace + "-" + "{CLUSTER_NAME}"
            title: .metadata.name
            blueprint: '"workload"'
            properties:
              kind: '"DaemonSet"'
              workloadJson: .
              creationTimestamp: .metadata.creationTimestamp
              replicas: .spec.replicas
              strategyConfig: .spec.strategy // null
              availableReplicas: .status.availableReplicas
              hasPrivileged: .spec.template.spec.containers | [.[].securityContext.privileged] | any
              labels: .metadata.labels
              hasLatest: .spec.template.spec.containers[].image | contains(":latest")
              hasLimits: .spec.template.spec.containers | all(has("resources") and (.resources.limits.memory and .resources.limits.cpu))
              containers: (.spec.template.spec.containers | map({name, image, resources}))
              isHealthy: if .spec.replicas == .status.availableReplicas then "Healthy" else "Unhealthy" end
            relations:
              Namespace: .metadata.namespace + "-" + "{CLUSTER_NAME}"
              knativeRevision: 'if (.metadata.ownerReferences[0].kind == "Revision") then .metadata.ownerReferences[0].name + "-" + .metadata.namespace + "-" + "{CLUSTER_NAME}" else null end'

  - kind: apps/v1/statefulsets
    selector:
      query: .metadata.namespace | startswith("kube") | not
    port:
      entity:
        mappings:
          - identifier: .metadata.name + "-StatefulSet-" + .metadata.namespace + "-" + "{CLUSTER_NAME}"
            title: .metadata.name
            blueprint: '"workload"'
            properties:
              kind: '"StatefulSet"'
              workloadJson: .
              labels: .metadata.labels
              creationTimestamp: .metadata.creationTimestamp
              strategyConfig: .spec.strategy // null
              replicas: .spec.replicas
              availableReplicas: .status.availableReplicas
              hasLatest: .spec.template.spec.containers[].image | contains(":latest")
              hasPrivileged: .spec.template.spec.containers | [.[].securityContext.privileged] | any
              hasLimits: .spec.template.spec.containers | all(has("resources") and (.resources.limits.memory and .resources.limits.cpu))
              containers: (.spec.template.spec.containers | map({name, image, resources}))
              isHealthy: if .spec.replicas == .status.availableReplicas then "Healthy" else "Unhealthy" end
            relations:
              Namespace: .metadata.namespace + "-" + "{CLUSTER_NAME}"

  - kind: v1/pods
    selector:
      query: .metadata.namespace | startswith("kube") | not
    port:
      entity:
        mappings:
          - identifier: .metadata.name + "-" + .metadata.namespace + "-" + "{CLUSTER_NAME}"
            title: .metadata.name
            icon: '"Microservices"'
            blueprint: '"pod"'
            properties:
              startTime: .status.startTime
              phase: .status.phase
              labels: .metadata.labels
              containers: (.spec.containers | map({image, resources})) + .status.containerStatuses | group_by(.image) | map(add)
              conditions: .status.conditions
            relations:
              workload: .metadata.ownerReferences[0].name + "-" + .metadata.ownerReferences[0].kind + "-" + .metadata.namespace + "-" + "{CLUSTER_NAME}"
              Node: (.spec.nodeName) | (split(".")|join("_")) + "-" + "{CLUSTER_NAME}"

  - kind: v1/nodes
    port:
      entity:
        mappings:
          - identifier: (.metadata.name) | (split(".")|join("_")) + "-" + "{CLUSTER_NAME}"
            title: .metadata.name + "-" + "{CLUSTER_NAME}"
            icon: '"Node"'
            blueprint: '"node"'
            properties:
              creationTimestamp: .metadata.creationTimestamp
              totalCPU: .status.allocatable.cpu
              totalMemory: .status.allocatable.memory
              labels: .metadata.labels
              kubeletVersion: .status.nodeInfo.kubeletVersion | split("-") | .[0]
              ready: .status.conditions[] | select(.type == "Ready") | .status
            relations:
              Cluster: '"{CLUSTER_NAME}"'

  - kind: serving.knative.dev/v1/service
    selector:
      query: .metadata.name | startswith("kube") | not
    port:
      entity:
        mappings:
          - identifier: .metadata.name + "-" + .metadata.namespace + "-" + "{CLUSTER_NAME}"
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
              namespace: .metadata.namespace + "-" + "{CLUSTER_NAME}"

  - kind: serving.knative.dev/v1/configuration
    selector:
      query: .metadata.name | startswith("kube") | not
    port:
      entity:
        mappings:
          - identifier: .metadata.name + "-" + .metadata.namespace + "-" + "{CLUSTER_NAME}"
            title: .metadata.name
            blueprint: '"knativeConfiguration"'
            properties:
              creationTimestamp: .metadata.creationTimestamp
              labels: .metadata.labels
              ready: .status.conditions[] | select(.type == "Ready") | .status
              containers: .spec.template.spec.containers
            relations:
              knativeService: .metadata.ownerReferences[0].name + "-" + .metadata.namespace + "-" + "{CLUSTER_NAME}"

  - kind: serving.knative.dev/v1/revision
    selector:
      query: .metadata.name | startswith("kube") | not
    port:
      entity:
        mappings:
          - identifier: .metadata.name + "-" + .metadata.namespace + "-" + "{CLUSTER_NAME}"
            title: .metadata.name
            blueprint: '"knativeRevision"'
            properties:
              creationTimestamp: .metadata.creationTimestamp
              labels: .metadata.labels
              isActive: .status.conditions[] | select(.type == "Active") | .status
              containers: .spec.containers
              replicaCount: .status.actualReplicas
            relations:
              knativeConfiguration: .metadata.ownerReferences[0].name + "-" + .metadata.namespace + "-" + "{CLUSTER_NAME}"

  - kind: serving.knative.dev/v1/route
    selector:
      query: .metadata.name | startswith("kube") | not
    port:
      entity:
        mappings:
          - identifier: .metadata.name + "-" + .metadata.namespace + "-" + "{CLUSTER_NAME}"
            title: .metadata.name
            blueprint: '"knativeRoute"'
            properties:
              creationTimestamp: .metadata.creationTimestamp
              labels: .metadata.labels
              trafficConfiguration: .status.traffic
              url: .status.url
            relations:
              knativeRevision: '[.status.traffic[].revisionName + "-" + .metadata.namespace + "-" + "{CLUSTER_NAME}"]'
              knativeService: .metadata.ownerReferences[0].name + "-" + .metadata.namespace + "-" + "{CLUSTER_NAME}"
```

</details>

You can now run the installation script using the following code snippet:

```bash showLineNumbers
export CLUSTER_NAME="my-cluster"
export PORT_CLIENT_ID="my-port-client-id"
export PORT_CLIENT_SECRET="my-port-client-secret"
curl -s https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/install.sh | bash
```

You can now browse to your Port environment to see that your blueprints have been created, and your k8s and knative resources are being reported to Port using the freshly installed k8s exporter.
