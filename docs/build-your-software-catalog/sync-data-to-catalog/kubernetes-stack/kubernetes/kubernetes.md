---
sidebar_position: 1
---

import Image from "@theme/IdealImage";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem"
import KubernetesEtl from "/static/img/build-your-software-catalog/sync-data-to-catalog/kubernetes/k8s-etl.png";
import FindCredentials from "/docs/build-your-software-catalog/custom-integration/api/_template_docs/_find_credentials_collapsed.mdx";
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"

# Kubernetes

Port's Kubernetes integration allows you to model Kubernetes resources in your software catalog and ingest data into them.

<center>

<img src="/img/build-your-software-catalog/sync-data-to-catalog/kubernetes/k8s-exporter-illustration.png" width="70%"/>

</center>

<br/><br/>

:::tip Kubernetes Exporter
Port's Kubernetes exporter is open source, view the source code [**here**](https://github.com/port-labs/port-k8s-exporter)
:::

## Overview

This integration allows you to:

- Map and organize your desired Kubernetes resources and their metadata in Port (see supported resources below).
- Watch for Kubernetes object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.
- Use relations to create a complete, easily digestible map of your K8s cluster inside Port;
- Map your Kubernetes resources from common CRDs such as ArgoCD, Istio and more;

### Supported Resources

The resources that can be mapped from Kubernetes cluster into Port include:
- [`Namespaces`](https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/)
- [`Pods`](https://kubernetes.io/docs/concepts/workloads/pods/)
- [`ReplicaSets`](https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/)
- [`Deployments`](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [`Services`](https://kubernetes.io/docs/concepts/services-networking/service/)
- [`Nodes`](https://kubernetes.io/docs/concepts/architecture/nodes/)

:::tip Additional Resources
The resources listed above are just a subset of what the Kubernetes integration supports. You can ingest any resource available through the [Kubernetes API](https://kubernetes.io/docs/reference/kubernetes-api/).
:::

## Prerequisites

- [Helm](https://helm.sh) is required to install the exporter.
- Prepare your [Port credentials](/build-your-software-catalog/custom-integration/api/api.md#find-your-port-credentials).

  :::tip Find your port credentials
    <FindCredentials />
  :::

## Setup

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="helm" label="Helm" default>

<OceanRealtimeInstallation integration="Kubernetes" />

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

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Default mapping configuration

This is the default mapping configuration for this integration:

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
deleteDependentEntities: true
createMissingRelatedEntities: true
enableMergeEntity: true
resources:
- kind: v1/namespaces
  selector:
    query: .metadata.name | contains("kube-system")
  port:
    entity:
      mappings:
      - identifier: env.CLUSTER_NAME
        title: env.CLUSTER_NAME
        blueprint: '"k8s_cluster"'
- kind: v1/namespaces
  selector:
    query: .metadata.name | startswith("kube") | not
  port:
    entity:
      mappings:
      - identifier: .metadata.name + "-" + env.CLUSTER_NAME
        title: .metadata.name
        blueprint: '"k8s_namespace"'
        properties:
          creationTimestamp: .metadata.creationTimestamp
          labels: .metadata.labels
        relations:
          Cluster: env.CLUSTER_NAME
- kind: v1/nodes
  selector:
    query: 'true'
  port:
    entity:
      mappings:
      - identifier: (.metadata.name) | (split(".")|join("_")) + "-" + env.CLUSTER_NAME
        title: .metadata.name + "-" + env.CLUSTER_NAME
        blueprint: '"k8s_node"'
        properties:
          creationTimestamp: .metadata.creationTimestamp
          totalCPU: .status.allocatable.cpu
          totalMemory: .status.allocatable.memory
          labels: .metadata.labels
          kubeletVersion: .status.nodeInfo.kubeletVersion | split("-") | .[0]
          ready: .status.conditions[] | select(.type == "Ready") | .status
        relations:
          Cluster: env.CLUSTER_NAME
- kind: apps/v1/deployments
  selector:
    query: .metadata.namespace | startswith("kube") | not
  port:
    entity:
      mappings:
      - identifier: .metadata.name + "-Deployment-" + .metadata.namespace + "-" + env.CLUSTER_NAME
        title: .metadata.name
        blueprint: '"k8s_workload"'
        properties:
          kind: '"Deployment"'
          creationTimestamp: .metadata.creationTimestamp
          replicas: .spec.replicas
          hasPrivileged: .spec.template.spec.containers | [.[].securityContext.privileged] | any
          hasLatest: .spec.template.spec.containers[].image | contains(":latest")
          hasLimits: .spec.template.spec.containers | all(has("resources") and (.resources.limits.memory and .resources.limits.cpu))
          strategyConfig: .spec.strategy // {}
          strategy: .spec.strategy.type
          availableReplicas: .status.availableReplicas
          labels: .metadata.labels
          containers: (.spec.template.spec.containers | map({name, image, resources}))
          isHealthy: if .spec.replicas == .status.availableReplicas then "Healthy" else "Unhealthy" end
        relations:
          Namespace: .metadata.namespace + "-" + env.CLUSTER_NAME
- kind: apps/v1/daemonsets
  selector:
    query: .metadata.namespace | startswith("kube") | not
  port:
    entity:
      mappings:
      - identifier: .metadata.name + "-DaemonSet-" + .metadata.namespace + "-" + env.CLUSTER_NAME
        title: .metadata.name
        blueprint: '"k8s_workload"'
        properties:
          kind: '"DaemonSet"'
          creationTimestamp: .metadata.creationTimestamp
          replicas: .spec.replicas
          strategyConfig: .spec.strategy // {}
          availableReplicas: .status.availableReplicas
          hasPrivileged: .spec.template.spec.containers | [.[].securityContext.privileged] | any
          labels: .metadata.labels
          hasLatest: .spec.template.spec.containers[].image | contains(":latest")
          hasLimits: .spec.template.spec.containers | all(has("resources") and (.resources.limits.memory and .resources.limits.cpu))
          containers: (.spec.template.spec.containers | map({name, image, resources}))
          isHealthy: if .spec.replicas == .status.availableReplicas then "Healthy" else "Unhealthy" end
        relations:
          Namespace: .metadata.namespace + "-" + env.CLUSTER_NAME
- kind: apps/v1/statefulsets
  selector:
    query: .metadata.namespace | startswith("kube") | not
  port:
    entity:
      mappings:
      - identifier: .metadata.name + "-StatefulSet-" + .metadata.namespace + "-" + env.CLUSTER_NAME
        title: .metadata.name
        blueprint: '"k8s_workload"'
        properties:
          kind: '"StatefulSet"'
          labels: .metadata.labels
          creationTimestamp: .metadata.creationTimestamp
          strategyConfig: .spec.strategy // {}
          replicas: .spec.replicas
          availableReplicas: .status.availableReplicas
          hasLatest: .spec.template.spec.containers[].image | contains(":latest")
          hasPrivileged: .spec.template.spec.containers | [.[].securityContext.privileged] | any
          hasLimits: .spec.template.spec.containers | all(has("resources") and (.resources.limits.memory and .resources.limits.cpu))
          containers: (.spec.template.spec.containers | map({name, image, resources}))
          isHealthy: if .spec.replicas == .status.availableReplicas then "Healthy" else "Unhealthy" end
        relations:
          Namespace: .metadata.namespace + "-" + env.CLUSTER_NAME
- kind: apps/v1/replicasets
  selector:
    query: .metadata.namespace | startswith("kube") | not
  port:
    entity:
      mappings:
      - identifier: .metadata.name + "-ReplicaSet-" + .metadata.namespace + "-" + env.CLUSTER_NAME
        title: .metadata.name
        blueprint: '"k8s_replicaSet"'
        properties:
          creationTimestamp: .metadata.creationTimestamp
          replicas: .spec.replicas
          hasPrivileged: .spec.template.spec.containers | [.[].securityContext.privileged] | any
          hasLatest: .spec.template.spec.containers[].image | contains(":latest")
          hasLimits: .spec.template.spec.containers | all(has("resources") and (.resources.limits.memory and .resources.limits.cpu))
          strategy: .spec.strategy.type
          availableReplicas: .status.availableReplicas
          labels: .metadata.labels
          containers: (.spec.template.spec.containers | map({name, image, resources}))
          isHealthy: if .spec.replicas == .status.availableReplicas then "Healthy" else "Unhealthy" end
        relations:
          replicaSetManager: .metadata.ownerReferences[0].name + "-" + .metadata.ownerReferences[0].kind + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME // []
          workload:
            combinator: '"and"'
            rules:
            - operator: '"="'
              property: '"workload_identifier"'
              value: .metadata.ownerReferences[0].name + "-" + .metadata.ownerReferences[0].kind + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME // []
- kind: v1/pods
  selector:
    query: (.metadata.ownerReferences[0].kind == "ReplicaSet") and (.metadata.namespace | startswith("kube") | not)
  port:
    entity:
      mappings:
      - identifier: .metadata.name + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
        title: .metadata.name
        blueprint: '"k8s_pod"'
        properties:
          startTime: .status.startTime
          phase: .status.phase
          labels: .metadata.labels
        relations:
          replicaSet: .metadata.ownerReferences[0].name + "-" + "ReplicaSet" + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
          Node: (.spec.nodeName) | (split(".")|join("_")) + "-" + env.CLUSTER_NAME
- kind: v1/pods
  selector:
    query: (.metadata.ownerReferences[0].kind != "ReplicaSet") and (.metadata.namespace | startswith("kube") | not)
  port:
    entity:
      mappings:
      - identifier: .metadata.name + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
        title: .metadata.name
        blueprint: '"k8s_pod"'
        properties:
          startTime: .status.startTime
          phase: .status.phase
          labels: .metadata.labels
        relations:
          k8s_workload: .metadata.ownerReferences[0].name + "-" + .metadata.ownerReferences[0].kind + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
          Node: (.spec.nodeName) | (split(".")|join("_")) + "-" + env.CLUSTER_NAME
          workload:
            combinator: '"and"'
            rules:
            - operator: '"="'
              property: '"workload_identifier"'
              value: .metadata.ownerReferences[0].name + "-" + .metadata.ownerReferences[0].kind + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
```

</details>




## Capabilities

### Extract, Transform, Load (ETL)

Port's Kubernetes exporter performs ETL on data from K8s into your desired software catalog data model:

<h4>How it works</h4>

The exporter is deployed using a Helm chart installed on the cluster. Once it is set up, it continues to sync changes, meaning that all changes, deletions or additions are accurately and automatically reflected in Port.

The helm chart uses a YAML configuration stored in the integration within your Portal. This configuration describes the ETL process responsible for loading data into the developer portal. The approach reflects a golden middle between an overly opinionated K8s visualization that might not work for everyone and a too-broad approach that could introduce unneeded complexity into the developer portal.

Here is an example snippet from the integration configuration which demonstrates the ETL process for getting `ReplicaSet` data from the cluster and into the software catalog:

<center>
<Image img={KubernetesEtl} style={{ width: 700 }} />
</center>

## Examples

To view and test the integration's mapping against examples of the third-party API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

Examples of blueprints and the relevant integration configurations can be found on the Kubernetes basic [examples page](./basic-example.md)


This section includes sample response data from Kubernetes.
In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload
Here is an example of the payload structure from Kubernetes cluster:

<!-- namespace -->

<details>
<summary> Namespace response data</summary>

```json showLineNumbers
{
  "apiVersion": "v1",
  "kind": "Namespace",
  "metadata": {
    "creationTimestamp": "2024-11-06T13:03:59Z",
    "labels": {
      "kubernetes.io/metadata.name": "default"
    },
    "managedFields": [
      {
        "apiVersion": "v1",
        "fieldsType": "FieldsV1",
        "fieldsV1": {
          "f:metadata": {
            "f:labels": {
              ".": {},
              "f:kubernetes.io/metadata.name": {}
            }
          }
        },
        "manager": "kube-apiserver",
        "operation": "Update",
        "time": "2024-11-06T13:03:59Z"
      }
    ],
    "name": "default",
    "resourceVersion": "39",
    "uid": "0aba1ce2-255d-45d1-9db0-d2089b89ffea"
  },
  "spec": {
    "finalizers": [
      "kubernetes"
    ]
  },
  "status": {
    "phase": "Active"
  }
}
```
</details>

<!-- node -->

<details>
<summary> Node response data</summary>

```json showLineNumbers
{
  "apiVersion": "v1",
  "kind": "Node",
  "metadata": {
    "annotations": {
      "kubeadm.alpha.kubernetes.io/cri-socket": "unix:///var/run/cri-dockerd.sock",
      "node.alpha.kubernetes.io/ttl": "0",
      "volumes.kubernetes.io/controller-managed-attach-detach": "true"
    },
    "creationTimestamp": "2024-11-06T13:03:58Z",
    "labels": {
      "beta.kubernetes.io/arch": "arm64",
      "beta.kubernetes.io/os": "linux",
      "kubernetes.io/arch": "arm64",
      "kubernetes.io/hostname": "minikube",
      "kubernetes.io/os": "linux",
      "minikube.k8s.io/commit": "248d1ec5b3f9be5569977749a725f47b018078ff",
      "minikube.k8s.io/name": "minikube",
      "minikube.k8s.io/primary": "true",
      "minikube.k8s.io/updated_at": "2024_11_06T15_04_01_0700",
      "minikube.k8s.io/version": "v1.33.1",
      "node-role.kubernetes.io/control-plane": "",
      "node.kubernetes.io/exclude-from-external-load-balancers": ""
    },
    "managedFields": [
      {
        "apiVersion": "v1",
        "fieldsType": "FieldsV1",
        "fieldsV1": {
          "f:metadata": {
            "f:annotations": {
              ".": {},
              "f:volumes.kubernetes.io/controller-managed-attach-detach": {}
            },
            "f:labels": {
              ".": {},
              "f:beta.kubernetes.io/arch": {},
              "f:beta.kubernetes.io/os": {},
              "f:kubernetes.io/arch": {},
              "f:kubernetes.io/hostname": {},
              "f:kubernetes.io/os": {}
            }
          }
        },
        "manager": "kubelet",
        "operation": "Update",
        "time": "2024-11-06T13:03:58Z"
      },
      {
        "apiVersion": "v1",
        "fieldsType": "FieldsV1",
        "fieldsV1": {
          "f:metadata": {
            "f:annotations": {
              "f:kubeadm.alpha.kubernetes.io/cri-socket": {}
            },
            "f:labels": {
              "f:node-role.kubernetes.io/control-plane": {},
              "f:node.kubernetes.io/exclude-from-external-load-balancers": {}
            }
          }
        },
        "manager": "kubeadm",
        "operation": "Update",
        "time": "2024-11-06T13:04:00Z"
      },
      {
        "apiVersion": "v1",
        "fieldsType": "FieldsV1",
        "fieldsV1": {
          "f:metadata": {
            "f:labels": {
              "f:minikube.k8s.io/commit": {},
              "f:minikube.k8s.io/name": {},
              "f:minikube.k8s.io/primary": {},
              "f:minikube.k8s.io/updated_at": {},
              "f:minikube.k8s.io/version": {}
            }
          }
        },
        "manager": "kubectl-label",
        "operation": "Update",
        "time": "2024-11-06T13:04:02Z"
      },
      {
        "apiVersion": "v1",
        "fieldsType": "FieldsV1",
        "fieldsV1": {
          "f:metadata": {
            "f:annotations": {
              "f:node.alpha.kubernetes.io/ttl": {}
            }
          },
          "f:spec": {
            "f:podCIDR": {},
            "f:podCIDRs": {
              ".": {},
              "v:\"10.244.0.0/24\"": {}
            }
          }
        },
        "manager": "kube-controller-manager",
        "operation": "Update",
        "time": "2025-01-19T08:03:49Z"
      },
      {
        "apiVersion": "v1",
        "fieldsType": "FieldsV1",
        "fieldsV1": {
          "f:status": {
            "f:allocatable": {
              "f:memory": {}
            },
            "f:capacity": {
              "f:memory": {}
            },
            "f:conditions": {
              "k:{\"type\":\"DiskPressure\"}": {
                "f:lastHeartbeatTime": {},
                "f:lastTransitionTime": {},
                "f:message": {},
                "f:reason": {},
                "f:status": {}
              },
              "k:{\"type\":\"MemoryPressure\"}": {
                "f:lastHeartbeatTime": {},
                "f:lastTransitionTime": {},
                "f:message": {},
                "f:reason": {},
                "f:status": {}
              },
              "k:{\"type\":\"PIDPressure\"}": {
                "f:lastHeartbeatTime": {},
                "f:lastTransitionTime": {},
                "f:message": {},
                "f:reason": {},
                "f:status": {}
              },
              "k:{\"type\":\"Ready\"}": {
                "f:lastHeartbeatTime": {},
                "f:lastTransitionTime": {},
                "f:message": {},
                "f:reason": {},
                "f:status": {}
              }
            },
            "f:images": {},
            "f:nodeInfo": {
              "f:bootID": {},
              "f:machineID": {},
              "f:systemUUID": {}
            }
          }
        },
        "manager": "kubelet",
        "operation": "Update",
        "subresource": "status",
        "time": "2025-01-26T17:27:26Z"
      }
    ],
    "name": "minikube",
    "resourceVersion": "1327897",
    "uid": "e526ba59-74f2-44ec-9142-f1c27025ce07"
  },
  "spec": {
    "podCIDR": "10.244.0.0/24",
    "podCIDRs": [
      "10.244.0.0/24"
    ]
  },
  "status": {
    "addresses": [
      {
        "address": "192.168.49.2",
        "type": "InternalIP"
      },
      {
        "address": "minikube",
        "type": "Hostname"
      }
    ],
    "allocatable": {
      "cpu": "8",
      "ephemeral-storage": "61202244Ki",
      "hugepages-1Gi": "0",
      "hugepages-2Mi": "0",
      "hugepages-32Mi": "0",
      "hugepages-64Ki": "0",
      "memory": "8037848Ki",
      "pods": "110"
    },
    "capacity": {
      "cpu": "8",
      "ephemeral-storage": "61202244Ki",
      "hugepages-1Gi": "0",
      "hugepages-2Mi": "0",
      "hugepages-32Mi": "0",
      "hugepages-64Ki": "0",
      "memory": "8037848Ki",
      "pods": "110"
    },
    "conditions": [
      {
        "lastHeartbeatTime": "2025-01-26T17:27:26Z",
        "lastTransitionTime": "2025-01-19T08:03:59Z",
        "message": "kubelet has sufficient memory available",
        "reason": "KubeletHasSufficientMemory",
        "status": "False",
        "type": "MemoryPressure"
      },
      {
        "lastHeartbeatTime": "2025-01-26T17:27:26Z",
        "lastTransitionTime": "2025-01-19T08:03:59Z",
        "message": "kubelet has no disk pressure",
        "reason": "KubeletHasNoDiskPressure",
        "status": "False",
        "type": "DiskPressure"
      },
      {
        "lastHeartbeatTime": "2025-01-26T17:27:26Z",
        "lastTransitionTime": "2025-01-19T08:03:59Z",
        "message": "kubelet has sufficient PID available",
        "reason": "KubeletHasSufficientPID",
        "status": "False",
        "type": "PIDPressure"
      },
      {
        "lastHeartbeatTime": "2025-01-26T17:27:26Z",
        "lastTransitionTime": "2025-01-19T08:03:59Z",
        "message": "kubelet is posting ready status",
        "reason": "KubeletReady",
        "status": "True",
        "type": "Ready"
      }
    ],
    "daemonEndpoints": {
      "kubeletEndpoint": {
        "Port": 10250
      }
    },
    "images": [
      {
        "names": [
          "ghcr.io/port-labs/port-ocean-argocd@sha256:4b05da5a755528bd9a7cdb8d43984f8faa6cad0fd34f15d8431da45732868c7f"
        ],
        "sizeBytes": 353072229
      },
      {
        "names": [
          "ghcr.io/port-labs/port-ocean-argocd@sha256:332d49ecedc98aa897441df27d1e51d82577c559c96fbcd24085fb50a1c1ee2c",
          "ghcr.io/port-labs/port-ocean-argocd:latest"
        ],
        "sizeBytes": 337116047
      },
      {
        "names": [
          "registry.k8s.io/etcd@sha256:44a8e24dcbba3470ee1fee21d5e88d128c936e9b55d4bc51fbef8086f8ed123b",
          "registry.k8s.io/etcd:3.5.12-0"
        ],
        "sizeBytes": 138984067
      },
      {
        "names": [
          "registry.k8s.io/kube-apiserver@sha256:6b8e197b2d39c321189a475ac755a77896e34b56729425590fbc99f3a96468a3",
          "registry.k8s.io/kube-apiserver:v1.30.0"
        ],
        "sizeBytes": 112480900
      },
      {
        "names": [
          "ghcr.io/port-labs/port-agent@sha256:bbf54c3d8912b84c57f6b18801815219e589508c1252f104808fde5164c06c2e",
          "ghcr.io/port-labs/port-agent:v0.7.8"
        ],
        "sizeBytes": 108713245
      },
      {
        "names": [
          "registry.k8s.io/kube-controller-manager@sha256:5f52f00f17d5784b5ca004dffca59710fa1a9eec8d54cebdf9433a1d134150fe",
          "registry.k8s.io/kube-controller-manager:v1.30.0"
        ],
        "sizeBytes": 107172834
      },
      {
        "names": [
          "ghcr.io/port-labs/port-agent@sha256:8329ab05c97f3aa07e77a45f366e6d763e1907b0c46fe8e4f0c40e96a38ae252",
          "ghcr.io/port-labs/port-agent:v0.7.7"
        ],
        "sizeBytes": 101793282
      },
      {
        "names": [
          "registry.k8s.io/kube-proxy@sha256:ec532ff47eaf39822387e51ec73f1f2502eb74658c6303319db88d2c380d0210",
          "registry.k8s.io/kube-proxy:v1.30.0"
        ],
        "sizeBytes": 87874752
      },
      {
        "names": [
          "ghcr.io/port-labs/port-k8s-exporter@sha256:5d924eef3e1165b213a9cef652aace817ea459a81710dd9c558b15943887a549",
          "ghcr.io/port-labs/port-k8s-exporter:0.4.5"
        ],
        "sizeBytes": 74449043
      },
      {
        "names": [
          "registry.k8s.io/kube-scheduler@sha256:2353c3a1803229970fcb571cffc9b2f120372350e01c7381b4b650c4a02b9d67",
          "registry.k8s.io/kube-scheduler:v1.30.0"
        ],
        "sizeBytes": 60511189
      },
      {
        "names": [
          "registry.k8s.io/coredns/coredns@sha256:1eeb4c7316bacb1d4c8ead65571cd92dd21e27359f0d4917f1a5822a73b75db1",
          "registry.k8s.io/coredns/coredns:v1.11.1"
        ],
        "sizeBytes": 57387595
      },
      {
        "names": [
          "gcr.io/k8s-minikube/storage-provisioner@sha256:18eb69d1418e854ad5a19e399310e52808a8321e4c441c1dddad8977a0d7a944",
          "gcr.io/k8s-minikube/storage-provisioner:v5"
        ],
        "sizeBytes": 29032448
      },
      {
        "names": [
          "registry.k8s.io/pause@sha256:7031c1b283388d2c2e09b57badb803c05ebed362dc88d84b480cc47f72a21097",
          "registry.k8s.io/pause:3.9"
        ],
        "sizeBytes": 514000
      }
    ],
    "nodeInfo": {
      "architecture": "arm64",
      "bootID": "bed8f28a-c181-4d39-8ed5-3ae2e0c58194",
      "containerRuntimeVersion": "docker://26.1.1",
      "kernelVersion": "6.3.13-linuxkit",
      "kubeProxyVersion": "v1.30.0",
      "kubeletVersion": "v1.30.0",
      "machineID": "3016188b59244008a8369177d99ed73a",
      "operatingSystem": "linux",
      "osImage": "Ubuntu 22.04.4 LTS",
      "systemUUID": "3016188b59244008a8369177d99ed73a"
    }
  }
}
```

</details>

<!-- deployment -->

<details>
<summary> Deployment response data</summary>

```json showLineNumbers
{
  "apiVersion": "apps/v1",
  "kind": "Deployment",
  "metadata": {
    "annotations": {
      "deployment.kubernetes.io/revision": "1",
      "meta.helm.sh/release-name": "my-port-agent",
      "meta.helm.sh/release-namespace": "port-agent"
    },
    "creationTimestamp": "2025-01-08T16:22:14Z",
    "generation": 1,
    "labels": {
      "app.kubernetes.io/instance": "my-port-agent",
      "app.kubernetes.io/managed-by": "Helm",
      "app.kubernetes.io/name": "port-agent",
      "app.kubernetes.io/version": "v0.7.8",
      "helm.sh/chart": "port-agent-0.8.6"
    },
    "managedFields": [
      {
        "apiVersion": "apps/v1",
        "fieldsType": "FieldsV1",
        "fieldsV1": {
          "f:metadata": {
            "f:annotations": {
              ".": {},
              "f:meta.helm.sh/release-name": {},
              "f:meta.helm.sh/release-namespace": {}
            },
            "f:labels": {
              ".": {},
              "f:app.kubernetes.io/instance": {},
              "f:app.kubernetes.io/managed-by": {},
              "f:app.kubernetes.io/name": {},
              "f:app.kubernetes.io/version": {},
              "f:helm.sh/chart": {}
            }
          },
          "f:spec": {
            "f:progressDeadlineSeconds": {},
            "f:replicas": {},
            "f:revisionHistoryLimit": {},
            "f:selector": {},
            "f:strategy": {
              "f:type": {}
            },
            "f:template": {
              "f:metadata": {
                "f:labels": {
                  ".": {},
                  "f:app.kubernetes.io/instance": {},
                  "f:app.kubernetes.io/managed-by": {},
                  "f:app.kubernetes.io/name": {},
                  "f:app.kubernetes.io/version": {},
                  "f:helm.sh/chart": {}
                }
              },
              "f:spec": {
                "f:containers": {
                  "k:{\"name\":\"port-agent\"}": {
                    ".": {},
                    "f:env": {
                      ".": {},
                      "k:{\"name\":\"GITLAB_URL\"}": {
                        ".": {},
                        "f:name": {},
                        "f:value": {}
                      },
                      "k:{\"name\":\"KAFKA_CONSUMER_AUTHENTICATION_MECHANISM\"}": {
                        ".": {},
                        "f:name": {},
                        "f:value": {}
                      },
                      "k:{\"name\":\"KAFKA_CONSUMER_AUTO_OFFSET_RESET\"}": {
                        ".": {},
                        "f:name": {},
                        "f:value": {}
                      },
                      "k:{\"name\":\"KAFKA_CONSUMER_GROUP_ID\"}": {
                        ".": {},
                        "f:name": {},
                        "f:value": {}
                      },
                      "k:{\"name\":\"KAFKA_CONSUMER_SECURITY_PROTOCOL\"}": {
                        ".": {},
                        "f:name": {},
                        "f:value": {}
                      },
                      "k:{\"name\":\"PORT_API_BASE_URL\"}": {
                        ".": {},
                        "f:name": {},
                        "f:value": {}
                      },
                      "k:{\"name\":\"PORT_CLIENT_ID\"}": {
                        ".": {},
                        "f:name": {},
                        "f:valueFrom": {
                          ".": {},
                          "f:secretKeyRef": {}
                        }
                      },
                      "k:{\"name\":\"PORT_CLIENT_SECRET\"}": {
                        ".": {},
                        "f:name": {},
                        "f:valueFrom": {
                          ".": {},
                          "f:secretKeyRef": {}
                        }
                      },
                      "k:{\"name\":\"PORT_ORG_ID\"}": {
                        ".": {},
                        "f:name": {},
                        "f:value": {}
                      },
                      "k:{\"name\":\"STREAMER_NAME\"}": {
                        ".": {},
                        "f:name": {},
                        "f:value": {}
                      }
                    },
                    "f:image": {},
                    "f:imagePullPolicy": {},
                    "f:name": {},
                    "f:resources": {
                      ".": {},
                      "f:limits": {
                        ".": {},
                        "f:cpu": {},
                        "f:memory": {}
                      },
                      "f:requests": {
                        ".": {},
                        "f:cpu": {},
                        "f:memory": {}
                      }
                    },
                    "f:terminationMessagePath": {},
                    "f:terminationMessagePolicy": {}
                  }
                },
                "f:dnsPolicy": {},
                "f:restartPolicy": {},
                "f:schedulerName": {},
                "f:securityContext": {},
                "f:terminationGracePeriodSeconds": {}
              }
            }
          }
        },
        "manager": "helm",
        "operation": "Update",
        "time": "2025-01-08T16:22:14Z"
      },
      {
        "apiVersion": "apps/v1",
        "fieldsType": "FieldsV1",
        "fieldsV1": {
          "f:metadata": {
            "f:annotations": {
              "f:deployment.kubernetes.io/revision": {}
            }
          },
          "f:status": {
            "f:conditions": {
              ".": {},
              "k:{\"type\":\"Available\"}": {
                ".": {},
                "f:lastTransitionTime": {},
                "f:lastUpdateTime": {},
                "f:message": {},
                "f:reason": {},
                "f:status": {},
                "f:type": {}
              },
              "k:{\"type\":\"Progressing\"}": {
                ".": {},
                "f:lastTransitionTime": {},
                "f:lastUpdateTime": {},
                "f:message": {},
                "f:reason": {},
                "f:status": {},
                "f:type": {}
              }
            },
            "f:observedGeneration": {},
            "f:replicas": {},
            "f:unavailableReplicas": {},
            "f:updatedReplicas": {}
          }
        },
        "manager": "kube-controller-manager",
        "operation": "Update",
        "subresource": "status",
        "time": "2025-01-26T17:27:56Z"
      }
    ],
    "name": "my-port-agent",
    "namespace": "port-agent",
    "resourceVersion": "1328035",
    "uid": "e3abe1a3-cf9b-4ccb-96d0-6fe472779026"
  },
  "spec": {
    "progressDeadlineSeconds": 600,
    "replicas": 1,
    "revisionHistoryLimit": 10,
    "selector": {
      "matchLabels": {
        "app.kubernetes.io/instance": "my-port-agent",
        "app.kubernetes.io/name": "port-agent"
      }
    },
    "strategy": {
      "type": "Recreate"
    },
    "template": {
      "metadata": {
        "labels": {
          "app.kubernetes.io/instance": "my-port-agent",
          "app.kubernetes.io/managed-by": "Helm",
          "app.kubernetes.io/name": "port-agent",
          "app.kubernetes.io/version": "v0.7.8",
          "helm.sh/chart": "port-agent-0.8.6"
        }
      },
      "spec": {
        "containers": [
          {
            "env": [
              {
                "name": "PORT_CLIENT_ID",
                "valueFrom": {
                  "secretKeyRef": {
                    "key": "PORT_CLIENT_ID",
                    "name": "my-port-agent"
                  }
                }
              },
              {
                "name": "PORT_CLIENT_SECRET",
                "valueFrom": {
                  "secretKeyRef": {
                    "key": "PORT_CLIENT_SECRET",
                    "name": "my-port-agent"
                  }
                }
              },
              {
                "name": "GITLAB_URL",
                "value": "https://gitlab.com/"
              },
              {
                "name": "KAFKA_CONSUMER_AUTHENTICATION_MECHANISM",
                "value": "SCRAM-SHA-512"
              },
              {
                "name": "KAFKA_CONSUMER_AUTO_OFFSET_RESET",
                "value": "largest"
              },
              {
                "name": "KAFKA_CONSUMER_GROUP_ID",
                "value": "omri-ignore"
              },
              {
                "name": "KAFKA_CONSUMER_SECURITY_PROTOCOL",
                "value": "SASL_SSL"
              },
              {
                "name": "PORT_API_BASE_URL",
                "value": "https://api.getport.io"
              },
              {
                "name": "PORT_ORG_ID",
                "value": "org_Z2ykzTV308tzhfvo"
              },
              {
                "name": "STREAMER_NAME",
                "value": "KAFKA"
              }
            ],
            "image": "ghcr.io/port-labs/port-agent:v0.7.8",
            "imagePullPolicy": "IfNotPresent",
            "name": "port-agent",
            "resources": {
              "limits": {
                "cpu": "200m",
                "memory": "256Mi"
              },
              "requests": {
                "cpu": "100m",
                "memory": "128Mi"
              }
            },
            "terminationMessagePath": "/dev/termination-log",
            "terminationMessagePolicy": "File"
          }
        ],
        "dnsPolicy": "ClusterFirst",
        "restartPolicy": "Always",
        "schedulerName": "default-scheduler",
        "securityContext": {},
        "terminationGracePeriodSeconds": 30
      }
    }
  },
  "status": {
    "conditions": [
      {
        "lastTransitionTime": "2025-01-08T16:22:14Z",
        "lastUpdateTime": "2025-01-08T16:22:16Z",
        "message": "ReplicaSet \"my-port-agent-54d9d7db6b\" has successfully progressed.",
        "reason": "NewReplicaSetAvailable",
        "status": "True",
        "type": "Progressing"
      },
      {
        "lastTransitionTime": "2025-01-26T17:27:56Z",
        "lastUpdateTime": "2025-01-26T17:27:56Z",
        "message": "Deployment does not have minimum availability.",
        "reason": "MinimumReplicasUnavailable",
        "status": "False",
        "type": "Available"
      }
    ],
    "observedGeneration": 1,
    "replicas": 1,
    "unavailableReplicas": 1,
    "updatedReplicas": 1
  }
}
```
</details>

<!-- replicaset -->

<details>
<summary> ReplicaSet response data</summary>

```json showLineNumbers
{
  "apiVersion": "apps/v1",
  "kind": "ReplicaSet",
  "metadata": {
    "annotations": {
      "deployment.kubernetes.io/desired-replicas": "1",
      "deployment.kubernetes.io/max-replicas": "1",
      "deployment.kubernetes.io/revision": "1",
      "meta.helm.sh/release-name": "my-port-agent",
      "meta.helm.sh/release-namespace": "port-agent"
    },
    "creationTimestamp": "2025-01-08T16:22:14Z",
    "generation": 1,
    "labels": {
      "app.kubernetes.io/instance": "my-port-agent",
      "app.kubernetes.io/managed-by": "Helm",
      "app.kubernetes.io/name": "port-agent",
      "app.kubernetes.io/version": "v0.7.8",
      "helm.sh/chart": "port-agent-0.8.6",
      "pod-template-hash": "54d9d7db6b"
    },
    "managedFields": [
      {
        "apiVersion": "apps/v1",
        "fieldsType": "FieldsV1",
        "fieldsV1": {
          "f:metadata": {
            "f:annotations": {
              ".": {},
              "f:deployment.kubernetes.io/desired-replicas": {},
              "f:deployment.kubernetes.io/max-replicas": {},
              "f:deployment.kubernetes.io/revision": {},
              "f:meta.helm.sh/release-name": {},
              "f:meta.helm.sh/release-namespace": {}
            },
            "f:labels": {
              ".": {},
              "f:app.kubernetes.io/instance": {},
              "f:app.kubernetes.io/managed-by": {},
              "f:app.kubernetes.io/name": {},
              "f:app.kubernetes.io/version": {},
              "f:helm.sh/chart": {},
              "f:pod-template-hash": {}
            },
            "f:ownerReferences": {
              ".": {},
              "k:{\"uid\":\"e3abe1a3-cf9b-4ccb-96d0-6fe472779026\"}": {}
            }
          },
          "f:spec": {
            "f:replicas": {},
            "f:selector": {},
            "f:template": {
              "f:metadata": {
                "f:labels": {
                  ".": {},
                  "f:app.kubernetes.io/instance": {},
                  "f:app.kubernetes.io/managed-by": {},
                  "f:app.kubernetes.io/name": {},
                  "f:app.kubernetes.io/version": {},
                  "f:helm.sh/chart": {},
                  "f:pod-template-hash": {}
                }
              },
              "f:spec": {
                "f:containers": {
                  "k:{\"name\":\"port-agent\"}": {
                    ".": {},
                    "f:env": {
                      ".": {},
                      "k:{\"name\":\"GITLAB_URL\"}": {
                        ".": {},
                        "f:name": {},
                        "f:value": {}
                      },
                      "k:{\"name\":\"KAFKA_CONSUMER_AUTHENTICATION_MECHANISM\"}": {
                        ".": {},
                        "f:name": {},
                        "f:value": {}
                      },
                      "k:{\"name\":\"KAFKA_CONSUMER_AUTO_OFFSET_RESET\"}": {
                        ".": {},
                        "f:name": {},
                        "f:value": {}
                      },
                      "k:{\"name\":\"KAFKA_CONSUMER_GROUP_ID\"}": {
                        ".": {},
                        "f:name": {},
                        "f:value": {}
                      },
                      "k:{\"name\":\"KAFKA_CONSUMER_SECURITY_PROTOCOL\"}": {
                        ".": {},
                        "f:name": {},
                        "f:value": {}
                      },
                      "k:{\"name\":\"PORT_API_BASE_URL\"}": {
                        ".": {},
                        "f:name": {},
                        "f:value": {}
                      },
                      "k:{\"name\":\"PORT_CLIENT_ID\"}": {
                        ".": {},
                        "f:name": {},
                        "f:valueFrom": {
                          ".": {},
                          "f:secretKeyRef": {}
                        }
                      },
                      "k:{\"name\":\"PORT_CLIENT_SECRET\"}": {
                        ".": {},
                        "f:name": {},
                        "f:valueFrom": {
                          ".": {},
                          "f:secretKeyRef": {}
                        }
                      },
                      "k:{\"name\":\"PORT_ORG_ID\"}": {
                        ".": {},
                        "f:name": {},
                        "f:value": {}
                      },
                      "k:{\"name\":\"STREAMER_NAME\"}": {
                        ".": {},
                        "f:name": {},
                        "f:value": {}
                      }
                    },
                    "f:image": {},
                    "f:imagePullPolicy": {},
                    "f:name": {},
                    "f:resources": {
                      ".": {},
                      "f:limits": {
                        ".": {},
                        "f:cpu": {},
                        "f:memory": {}
                      },
                      "f:requests": {
                        ".": {},
                        "f:cpu": {},
                        "f:memory": {}
                      }
                    },
                    "f:terminationMessagePath": {},
                    "f:terminationMessagePolicy": {}
                  }
                },
                "f:dnsPolicy": {},
                "f:restartPolicy": {},
                "f:schedulerName": {},
                "f:securityContext": {},
                "f:terminationGracePeriodSeconds": {}
              }
            }
          }
        },
        "manager": "kube-controller-manager",
        "operation": "Update",
        "time": "2025-01-08T16:22:14Z"
      },
      {
        "apiVersion": "apps/v1",
        "fieldsType": "FieldsV1",
        "fieldsV1": {
          "f:status": {
            "f:fullyLabeledReplicas": {},
            "f:observedGeneration": {},
            "f:replicas": {}
          }
        },
        "manager": "kube-controller-manager",
        "operation": "Update",
        "subresource": "status",
        "time": "2025-01-26T17:27:48Z"
      }
    ],
    "name": "my-port-agent-54d9d7db6b",
    "namespace": "port-agent",
    "ownerReferences": [
      {
        "apiVersion": "apps/v1",
        "blockOwnerDeletion": true,
        "controller": true,
        "kind": "Deployment",
        "name": "my-port-agent",
        "uid": "e3abe1a3-cf9b-4ccb-96d0-6fe472779026"
      }
    ],
    "resourceVersion": "1328034",
    "uid": "2093b757-e7dd-445f-b2ed-af78063a4534"
  },
  "spec": {
    "replicas": 1,
    "selector": {
      "matchLabels": {
        "app.kubernetes.io/instance": "my-port-agent",
        "app.kubernetes.io/name": "port-agent",
        "pod-template-hash": "54d9d7db6b"
      }
    },
    "template": {
      "metadata": {
        "labels": {
          "app.kubernetes.io/instance": "my-port-agent",
          "app.kubernetes.io/managed-by": "Helm",
          "app.kubernetes.io/name": "port-agent",
          "app.kubernetes.io/version": "v0.7.8",
          "helm.sh/chart": "port-agent-0.8.6",
          "pod-template-hash": "54d9d7db6b"
        }
      },
      "spec": {
        "containers": [
          {
            "env": [
              {
                "name": "PORT_CLIENT_ID",
                "valueFrom": {
                  "secretKeyRef": {
                    "key": "PORT_CLIENT_ID",
                    "name": "my-port-agent"
                  }
                }
              },
              {
                "name": "PORT_CLIENT_SECRET",
                "valueFrom": {
                  "secretKeyRef": {
                    "key": "PORT_CLIENT_SECRET",
                    "name": "my-port-agent"
                  }
                }
              },
              {
                "name": "GITLAB_URL",
                "value": "https://gitlab.com/"
              },
              {
                "name": "KAFKA_CONSUMER_AUTHENTICATION_MECHANISM",
                "value": "SCRAM-SHA-512"
              },
              {
                "name": "KAFKA_CONSUMER_AUTO_OFFSET_RESET",
                "value": "largest"
              },
              {
                "name": "KAFKA_CONSUMER_GROUP_ID",
                "value": "omri-ignore"
              },
              {
                "name": "KAFKA_CONSUMER_SECURITY_PROTOCOL",
                "value": "SASL_SSL"
              },
              {
                "name": "PORT_API_BASE_URL",
                "value": "https://api.getport.io"
              },
              {
                "name": "PORT_ORG_ID",
                "value": "org_Z2ykzTV308tzhfvo"
              },
              {
                "name": "STREAMER_NAME",
                "value": "KAFKA"
              }
            ],
            "image": "ghcr.io/port-labs/port-agent:v0.7.8",
            "imagePullPolicy": "IfNotPresent",
            "name": "port-agent",
            "resources": {
              "limits": {
                "cpu": "200m",
                "memory": "256Mi"
              },
              "requests": {
                "cpu": "100m",
                "memory": "128Mi"
              }
            },
            "terminationMessagePath": "/dev/termination-log",
            "terminationMessagePolicy": "File"
          }
        ],
        "dnsPolicy": "ClusterFirst",
        "restartPolicy": "Always",
        "schedulerName": "default-scheduler",
        "securityContext": {},
        "terminationGracePeriodSeconds": 30
      }
    }
  },
  "status": {
    "fullyLabeledReplicas": 1,
    "observedGeneration": 1,
    "replicas": 1
  }
}
```
</details>

<!-- pod -->

<details>
<summary> Pod response data</summary>

```json showLineNumbers 
{
  "apiVersion": "v1",
  "kind": "Pod",
  "metadata": {
    "creationTimestamp": "2025-01-08T16:22:14Z",
    "generateName": "my-port-agent-54d9d7db6b-",
    "labels": {
      "app.kubernetes.io/instance": "my-port-agent",
      "app.kubernetes.io/managed-by": "Helm",
      "app.kubernetes.io/name": "port-agent",
      "app.kubernetes.io/version": "v0.7.8",
      "helm.sh/chart": "port-agent-0.8.6",
      "pod-template-hash": "54d9d7db6b"
    },
    "managedFields": [
      {
        "apiVersion": "v1",
        "fieldsType": "FieldsV1",
        "fieldsV1": {
          "f:metadata": {
            "f:generateName": {},
            "f:labels": {
              ".": {},
              "f:app.kubernetes.io/instance": {},
              "f:app.kubernetes.io/managed-by": {},
              "f:app.kubernetes.io/name": {},
              "f:app.kubernetes.io/version": {},
              "f:helm.sh/chart": {},
              "f:pod-template-hash": {}
            },
            "f:ownerReferences": {
              ".": {},
              "k:{\"uid\":\"2093b757-e7dd-445f-b2ed-af78063a4534\"}": {}
            }
          },
          "f:spec": {
            "f:containers": {
              "k:{\"name\":\"port-agent\"}": {
                ".": {},
                "f:env": {
                  ".": {},
                  "k:{\"name\":\"GITLAB_URL\"}": {
                    ".": {},
                    "f:name": {},
                    "f:value": {}
                  },
                  "k:{\"name\":\"KAFKA_CONSUMER_AUTHENTICATION_MECHANISM\"}": {
                    ".": {},
                    "f:name": {},
                    "f:value": {}
                  },
                  "k:{\"name\":\"KAFKA_CONSUMER_AUTO_OFFSET_RESET\"}": {
                    ".": {},
                    "f:name": {},
                    "f:value": {}
                  },
                  "k:{\"name\":\"KAFKA_CONSUMER_GROUP_ID\"}": {
                    ".": {},
                    "f:name": {},
                    "f:value": {}
                  },
                  "k:{\"name\":\"KAFKA_CONSUMER_SECURITY_PROTOCOL\"}": {
                    ".": {},
                    "f:name": {},
                    "f:value": {}
                  },
                  "k:{\"name\":\"PORT_API_BASE_URL\"}": {
                    ".": {},
                    "f:name": {},
                    "f:value": {}
                  },
                  "k:{\"name\":\"PORT_CLIENT_ID\"}": {
                    ".": {},
                    "f:name": {},
                    "f:valueFrom": {
                      ".": {},
                      "f:secretKeyRef": {}
                    }
                  },
                  "k:{\"name\":\"PORT_CLIENT_SECRET\"}": {
                    ".": {},
                    "f:name": {},
                    "f:valueFrom": {
                      ".": {},
                      "f:secretKeyRef": {}
                    }
                  },
                  "k:{\"name\":\"PORT_ORG_ID\"}": {
                    ".": {},
                    "f:name": {},
                    "f:value": {}
                  },
                  "k:{\"name\":\"STREAMER_NAME\"}": {
                    ".": {},
                    "f:name": {},
                    "f:value": {}
                  }
                },
                "f:image": {},
                "f:imagePullPolicy": {},
                "f:name": {},
                "f:resources": {
                  ".": {},
                  "f:limits": {
                    ".": {},
                    "f:cpu": {},
                    "f:memory": {}
                  },
                  "f:requests": {
                    ".": {},
                    "f:cpu": {},
                    "f:memory": {}
                  }
                },
                "f:terminationMessagePath": {},
                "f:terminationMessagePolicy": {}
              }
            },
            "f:dnsPolicy": {},
            "f:enableServiceLinks": {},
            "f:restartPolicy": {},
            "f:schedulerName": {},
            "f:securityContext": {},
            "f:terminationGracePeriodSeconds": {}
          }
        },
        "manager": "kube-controller-manager",
        "operation": "Update",
        "time": "2025-01-08T16:22:14Z"
      },
      {
        "apiVersion": "v1",
        "fieldsType": "FieldsV1",
        "fieldsV1": {
          "f:status": {
            "f:conditions": {
              "k:{\"type\":\"ContainersReady\"}": {
                ".": {},
                "f:lastProbeTime": {},
                "f:lastTransitionTime": {},
                "f:message": {},
                "f:reason": {},
                "f:status": {},
                "f:type": {}
              },
              "k:{\"type\":\"Initialized\"}": {
                ".": {},
                "f:lastProbeTime": {},
                "f:lastTransitionTime": {},
                "f:status": {},
                "f:type": {}
              },
              "k:{\"type\":\"PodReadyToStartContainers\"}": {
                ".": {},
                "f:lastProbeTime": {},
                "f:lastTransitionTime": {},
                "f:status": {},
                "f:type": {}
              },
              "k:{\"type\":\"Ready\"}": {
                ".": {},
                "f:lastProbeTime": {},
                "f:lastTransitionTime": {},
                "f:message": {},
                "f:reason": {},
                "f:status": {},
                "f:type": {}
              }
            },
            "f:containerStatuses": {},
            "f:hostIP": {},
            "f:hostIPs": {},
            "f:phase": {},
            "f:podIP": {},
            "f:podIPs": {
              ".": {},
              "k:{\"ip\":\"10.244.0.19\"}": {
                ".": {},
                "f:ip": {}
              }
            },
            "f:startTime": {}
          }
        },
        "manager": "kubelet",
        "operation": "Update",
        "subresource": "status",
        "time": "2025-01-26T17:28:09Z"
      }
    ],
    "name": "my-port-agent-54d9d7db6b-mkjr7",
    "namespace": "port-agent",
    "ownerReferences": [
      {
        "apiVersion": "apps/v1",
        "blockOwnerDeletion": true,
        "controller": true,
        "kind": "ReplicaSet",
        "name": "my-port-agent-54d9d7db6b",
        "uid": "2093b757-e7dd-445f-b2ed-af78063a4534"
      }
    ],
    "resourceVersion": "1328052",
    "uid": "0797508b-2f12-4402-8d97-d76c713b23dd"
  },
  "spec": {
    "containers": [
      {
        "env": [
          {
            "name": "PORT_CLIENT_ID",
            "valueFrom": {
              "secretKeyRef": {
                "key": "PORT_CLIENT_ID",
                "name": "my-port-agent"
              }
            }
          },
          {
            "name": "PORT_CLIENT_SECRET",
            "valueFrom": {
              "secretKeyRef": {
                "key": "PORT_CLIENT_SECRET",
                "name": "my-port-agent"
              }
            }
          },
          {
            "name": "GITLAB_URL",
            "value": "https://gitlab.com/"
          },
          {
            "name": "KAFKA_CONSUMER_AUTHENTICATION_MECHANISM",
            "value": "SCRAM-SHA-512"
          },
          {
            "name": "KAFKA_CONSUMER_AUTO_OFFSET_RESET",
            "value": "largest"
          },
          {
            "name": "KAFKA_CONSUMER_GROUP_ID",
            "value": "omri-ignore"
          },
          {
            "name": "KAFKA_CONSUMER_SECURITY_PROTOCOL",
            "value": "SASL_SSL"
          },
          {
            "name": "PORT_API_BASE_URL",
            "value": "https://api.getport.io"
          },
          {
            "name": "PORT_ORG_ID",
            "value": "org_Z2ykzTV308tzhfvo"
          },
          {
            "name": "STREAMER_NAME",
            "value": "KAFKA"
          }
        ],
        "image": "ghcr.io/port-labs/port-agent:v0.7.8",
        "imagePullPolicy": "IfNotPresent",
        "name": "port-agent",
        "resources": {
          "limits": {
            "cpu": "200m",
            "memory": "256Mi"
          },
          "requests": {
            "cpu": "100m",
            "memory": "128Mi"
          }
        },
        "terminationMessagePath": "/dev/termination-log",
        "terminationMessagePolicy": "File",
        "volumeMounts": [
          {
            "mountPath": "/var/run/secrets/kubernetes.io/serviceaccount",
            "name": "kube-api-access-5wglj",
            "readOnly": true
          }
        ]
      }
    ],
    "dnsPolicy": "ClusterFirst",
    "enableServiceLinks": true,
    "nodeName": "minikube",
    "preemptionPolicy": "PreemptLowerPriority",
    "priority": 0,
    "restartPolicy": "Always",
    "schedulerName": "default-scheduler",
    "securityContext": {},
    "serviceAccount": "default",
    "serviceAccountName": "default",
    "terminationGracePeriodSeconds": 30,
    "tolerations": [
      {
        "effect": "NoExecute",
        "key": "node.kubernetes.io/not-ready",
        "operator": "Exists",
        "tolerationSeconds": 300
      },
      {
        "effect": "NoExecute",
        "key": "node.kubernetes.io/unreachable",
        "operator": "Exists",
        "tolerationSeconds": 300
      }
    ],
    "volumes": [
      {
        "name": "kube-api-access-5wglj",
        "projected": {
          "defaultMode": 420,
          "sources": [
            {
              "serviceAccountToken": {
                "expirationSeconds": 3607,
                "path": "token"
              }
            },
            {
              "configMap": {
                "items": [
                  {
                    "key": "ca.crt",
                    "path": "ca.crt"
                  }
                ],
                "name": "kube-root-ca.crt"
              }
            },
            {
              "downwardAPI": {
                "items": [
                  {
                    "fieldRef": {
                      "apiVersion": "v1",
                      "fieldPath": "metadata.namespace"
                    },
                    "path": "namespace"
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  },
  "status": {
    "conditions": [
      {
        "lastTransitionTime": "2025-01-26T17:27:29Z",
        "status": "True",
        "type": "PodReadyToStartContainers"
      },
      {
        "lastTransitionTime": "2025-01-08T16:22:14Z",
        "status": "True",
        "type": "Initialized"
      },
      {
        "lastTransitionTime": "2025-01-26T17:27:56Z",
        "message": "containers with unready status: [port-agent]",
        "reason": "ContainersNotReady",
        "status": "False",
        "type": "Ready"
      },
      {
        "lastTransitionTime": "2025-01-26T17:27:56Z",
        "message": "containers with unready status: [port-agent]",
        "reason": "ContainersNotReady",
        "status": "False",
        "type": "ContainersReady"
      },
      {
        "lastTransitionTime": "2025-01-08T16:22:14Z",
        "status": "True",
        "type": "PodScheduled"
      }
    ],
    "containerStatuses": [
      {
        "containerID": "docker://b6009181cc2c5f84c15fe036f103fe8e662276a7e96d6225edfa28e292c807b0",
        "image": "ghcr.io/port-labs/port-agent:v0.7.8",
        "imageID": "docker-pullable://ghcr.io/port-labs/port-agent@sha256:bbf54c3d8912b84c57f6b18801815219e589508c1252f104808fde5164c06c2e",
        "lastState": {
          "terminated": {
            "containerID": "docker://b6009181cc2c5f84c15fe036f103fe8e662276a7e96d6225edfa28e292c807b0",
            "exitCode": 1,
            "finishedAt": "2025-01-26T17:27:55Z",
            "reason": "Error",
            "startedAt": "2025-01-26T17:27:48Z"
          }
        },
        "name": "port-agent",
        "ready": false,
        "restartCount": 2,
        "started": false,
        "state": {
          "waiting": {
            "message": "back-off 20s restarting failed container=port-agent pod=my-port-agent-54d9d7db6b-mkjr7_port-agent(0797508b-2f12-4402-8d97-d76c713b23dd)",
            "reason": "CrashLoopBackOff"
          }
        }
      }
    ],
    "hostIP": "192.168.49.2",
    "hostIPs": [
      {
        "ip": "192.168.49.2"
      }
    ],
    "phase": "Running",
    "podIP": "10.244.0.19",
    "podIPs": [
      {
        "ip": "10.244.0.19"
      }
    ],
    "qosClass": "Burstable",
    "startTime": "2025-01-08T16:22:14Z"
  }
}
```
</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<!-- namespace -->

<details>
<summary> Namespace entity in Port</summary>

```json showLineNumbers
{
      "identifier": "default-",
      "title": "default",
      "blueprint": "k8s_namespace",
      "properties": {
        "creationTimestamp": "2024-11-06T13:03:59Z",
        "labels": {
          "kubernetes.io/metadata.name": "default"
        }
      },
      "relations": {
        "Cluster": null
      }
}
```
</details>

<!-- node -->

<details>
<summary> Node entity in Port</summary> 

```json showLineNumbers 
{
      "identifier": "minikube-",
      "title": "minikube-",
      "blueprint": "k8s_node",
      "properties": {
        "creationTimestamp": "2024-11-06T13:03:58Z",
        "totalCPU": "8",
        "totalMemory": "8037848Ki",
        "labels": {
          "beta.kubernetes.io/arch": "arm64",
          "beta.kubernetes.io/os": "linux",
          "kubernetes.io/arch": "arm64",
          "kubernetes.io/hostname": "minikube",
          "kubernetes.io/os": "linux",
          "minikube.k8s.io/commit": "248d1ec5b3f9be5569977749a725f47b018078ff",
          "minikube.k8s.io/name": "minikube",
          "minikube.k8s.io/primary": "true",
          "minikube.k8s.io/updated_at": "2024_11_06T15_04_01_0700",
          "minikube.k8s.io/version": "v1.33.1",
          "node-role.kubernetes.io/control-plane": "",
          "node.kubernetes.io/exclude-from-external-load-balancers": ""
        },
        "kubeletVersion": "v1.30.0",
        "ready": "True"
      },
      "relations": {
        "Cluster": null
      }
}
```
</details>

<!-- deployment -->

<details>
<summary> Deployment entity in Port</summary> 

```json showLineNumbers
{
      "identifier": "my-port-agent-Deployment-port-agent-",
      "title": "my-port-agent",
      "blueprint": "k8s_workload",
      "properties": {
        "kind": "Deployment",
        "creationTimestamp": "2025-01-08T16:22:14Z",
        "replicas": 1,
        "hasPrivileged": false,
        "hasLatest": false,
        "hasLimits": true,
        "strategyConfig": {
          "type": "Recreate"
        },
        "strategy": "Recreate",
        "availableReplicas": null,
        "labels": {
          "app.kubernetes.io/instance": "my-port-agent",
          "app.kubernetes.io/managed-by": "Helm",
          "app.kubernetes.io/name": "port-agent",
          "app.kubernetes.io/version": "v0.7.8",
          "helm.sh/chart": "port-agent-0.8.6"
        },
        "containers": [
          {
            "name": "port-agent",
            "image": "ghcr.io/port-labs/port-agent:v0.7.8",
            "resources": {
              "limits": {
                "cpu": "200m",
                "memory": "256Mi"
              },
              "requests": {
                "cpu": "100m",
                "memory": "128Mi"
              }
            }
          }
        ],
        "isHealthy": "Unhealthy"
      },
      "relations": {
        "Namespace": "port-agent-"
      }
}
```
</details>

<!-- replicaset -->

<details>
<summary> ReplicaSet entity in Port</summary>

```json showLineNumbers
{
      "identifier": "my-port-agent-54d9d7db6b-ReplicaSet-port-agent-",
      "title": "my-port-agent-54d9d7db6b",
      "blueprint": "k8s_replicaSet",
      "properties": {
        "creationTimestamp": "2025-01-08T16:22:14Z",
        "replicas": 1,
        "hasPrivileged": false,
        "hasLatest": false,
        "hasLimits": true,
        "strategy": "",
        "availableReplicas": null,
        "labels": {
          "app.kubernetes.io/instance": "my-port-agent",
          "app.kubernetes.io/managed-by": "Helm",
          "app.kubernetes.io/name": "port-agent",
          "app.kubernetes.io/version": "v0.7.8",
          "helm.sh/chart": "port-agent-0.8.6",
          "pod-template-hash": "54d9d7db6b"
        },
        "containers": [
          {
            "name": "port-agent",
            "image": "ghcr.io/port-labs/port-agent:v0.7.8",
            "resources": {
              "limits": {
                "cpu": "200m",
                "memory": "256Mi"
              },
              "requests": {
                "cpu": "100m",
                "memory": "128Mi"
              }
            }
          }
        ],
        "isHealthy": "Unhealthy"
      },
      "relations": {
        "replicaSetManager": "my-port-agent-Deployment-port-agent-",
        "workload": []
      }
}
```
</details>

<!-- pod -->

<details>
<summary> Pod entity in Port</summary>

```json showLineNumbers
{
      "identifier": "my-port-agent-54d9d7db6b-mkjr7-port-agent-",
      "title": "my-port-agent-54d9d7db6b-mkjr7",
      "blueprint": "k8s_pod",
      "properties": {
        "startTime": "2025-01-08T16:22:14Z",
        "phase": "Running",
        "labels": {
          "app.kubernetes.io/instance": "my-port-agent",
          "app.kubernetes.io/managed-by": "Helm",
          "app.kubernetes.io/name": "port-agent",
          "app.kubernetes.io/version": "v0.7.8",
          "helm.sh/chart": "port-agent-0.8.6",
          "pod-template-hash": "54d9d7db6b"
        },
        "containers": [
          {
            "image": "ghcr.io/port-labs/port-agent:v0.7.8",
            "resources": {
              "limits": {
                "cpu": "200m",
                "memory": "256Mi"
              },
              "requests": {
                "cpu": "100m",
                "memory": "128Mi"
              }
            },
            "containerID": "docker://b6009181cc2c5f84c15fe036f103fe8e662276a7e96d6225edfa28e292c807b0",
            "imageID": "docker-pullable://ghcr.io/port-labs/port-agent@sha256:bbf54c3d8912b84c57f6b18801815219e589508c1252f104808fde5164c06c2e",
            "lastState": {
              "terminated": {
                "containerID": "docker://b6009181cc2c5f84c15fe036f103fe8e662276a7e96d6225edfa28e292c807b0",
                "exitCode": 1,
                "finishedAt": "2025-01-26T17:27:55Z",
                "reason": "Error",
                "startedAt": "2025-01-26T17:27:48Z"
              }
            },
            "name": "port-agent",
            "ready": false,
            "restartCount": 2,
            "started": false,
            "state": {
              "waiting": {
                "message": "back-off 20s restarting failed container=port-agent pod=my-port-agent-54d9d7db6b-mkjr7_port-agent(0797508b-2f12-4402-8d97-d76c713b23dd)",
                "reason": "CrashLoopBackOff"
              }
            }
          }
        ]
      },
      "relations": {
        "replicaSet": "my-port-agent-54d9d7db6b-ReplicaSet-port-agent-",
        "Node": "minikube-"
      }
}
```
</details>

## Templates

Port provides several pre-built templates to help you quickly get started with common Kubernetes use cases. These templates include pre-configured blueprints, mapping configurations, and setup instructions.

Check out the [templates page](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/templates/) to find the template that best fits your needs.

## Relevant Guides

For relevant guides and examples, see the [guides section](https://docs.port.io/guides?tags=Kubernetes).

## Advanced

Refer to the [advanced](./advanced.md) page for advanced use cases and outputs.
