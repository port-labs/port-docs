---
sidebar_position: 7
description: FluxCD quickstart
---

import TemplateInstallation from "./_template_installation.mdx";
import TemplatePrerequisites from "./_template_prerequisites.mdx";

# FluxCD

[FluxCD](https://fluxcd.io/) is a set of continuous and progressive delivery solutions for Kubernetes that are open and extensible.

Using Port's Kubernetes Exporter, you can keep track of all Flux resources in your cluster and export
monitored repositories and applications to Port. You will use built in metadata from your kubernetes resources and CRDs to create entities in
Port and keep track of their state.

:::tip Our Kubernetes exporter basics
Get to know the basics of our Kubernetes exporter [here!](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/kubernetes.md)
:::

<img src="/img/build-your-software-catalog/sync-data-to-catalog/kubernetes/k8sFluxView.png" border="1px"/>

## Prerequisites

<TemplatePrerequisites />

## Setting up blueprints & resource mapping

The following section will guide you through the process of setting up your blueprints and resource mapping using the
installation script. You can read more about the installation script [here](#how-does-the-installation-script-work).

### Creating blueprints

The installation script provides a convenient way to create your blueprints. Using the `CUSTOM_BP_PATH` environment
variable, you can fetch a pre-defined `blueprints.json` to create your blueprints. For this use-case, you will
use [this file](https://github.com/port-labs/template-assets/blob/main/kubernetes/blueprints/fluxcd-blueprints.json) to
define your blueprints. Do this by running:

```bash
export CUSTOM_BP_PATH="https://github.com/port-labs/template-assets/blob/main/kubernetes/blueprints/fluxcd-blueprints.json"
```

This `blueprints.json` file defines the following blueprints:

- Cluster
- Namespace
- Workload
- Flux Source
- Flux Application

:::note Blueprint information

- `Workload` is an abstraction of Kubernetes objects which create and manage pods.
  By creating this blueprint, you can avoid creating a dedicated blueprint per Workload type, all of which will likely
  look pretty similar.
  Here is the list of kubernetes objects `Workload` will represent:

    - Deployment
    - StatefulSet
    - DaemonSet

- `Flux Source` is one of the most important Flux resource that defines the origin of a repository containing the desired state of the system and the requirements to obtain it. This blueprint tracks **GitRepository** and **HelmRepository** CRDs in the Flux system.

- `Flux Application` is another important Flux resource that represents a local set of Kubernetes resources that Flux is supposed to reconcile in the cluster. This blueprint tracks **Kustomization** and **HelmRelease** CRDs in the Flux system.
:::

Below are the Flux blueprint schemas used in the exporter:

<details>
<summary> <b>Flux source blueprint (click to expand)</b> </summary>

```json showLineNumbers
{
   "identifier":"fluxSource",
   "description":"Flux Source",
   "title":"Flux Source",
   "icon":"Fluxcd",
   "schema":{
      "properties":{
         "repoURL":{
            "type":"string",
            "icon":"Git",
            "title":"Repository URL",
            "description":"The URL of the repository containing the application source code"
         },
         "sourceType":{
            "icon":"DefaultProperty",
            "title":"Source Type",
            "description":"The flux source type",
            "type":"string",
            "enum":[
               "HelmRepository",
               "GitRepository"
            ],
            "enumColors":{
               "HelmRepository":"turquoise",
               "GitRepository":"green"
            }
         },
         "interval":{
            "icon":"Clock",
            "type":"string",
            "title":"Interval",
            "description":"Interval at which the GitRepository URL is checked for updates"
         },
         "createdAt":{
            "title":"Created At",
            "type":"string",
            "format":"date-time",
            "icon":"DefaultProperty"
         },
         "branch":{
            "title":"Branch",
            "type":"string",
            "icon":"DefaultProperty"
         }
      },
      "required":[]
   },
   "mirrorProperties":{},
   "calculationProperties":{},
   "aggregationProperties":{},
   "relations":{
      "namespace":{
         "title":"Namespace",
         "target":"namespace",
         "required":false,
         "many":false
      }
   }
}
```

</details>

<details>
<summary> <b>Flux application blueprint (click to expand)</b> </summary>

```json showLineNumbers
{
   "identifier":"fluxApplication",
   "description":"This blueprint represents Flux Application which can be HelmRelease or Kustomization",
   "title":"Flux Application",
   "icon":"Fluxcd",
   "schema":{
      "properties":{
         "targetNamespace":{
            "icon":"DefaultProperty",
            "type":"string",
            "title":"Target Namespace"
         },
         "namespace":{
            "type":"string",
            "title":"Namespace",
            "icon":"DefaultProperty"
         },
         "ready":{
            "icon":"DefaultProperty",
            "title":"Health Status",
            "description":"The health status of the application",
            "type":"string",
            "enum":[
               "True",
               "False",
               "Unknown"
            ],
            "enumColors":{
               "True":"green",
               "False":"red",
               "Unknown":"yellow"
            }
         },
         "createdAt":{
            "title":"Created At",
            "type":"string",
            "format":"date-time",
            "icon":"DefaultProperty"
         },
         "applicationType":{
            "icon":"DefaultProperty",
            "title":"Application Type",
            "description":"Kustomization or HelmRelease",
            "type":"string",
            "enum":[
               "HelmRelease",
               "Kustomization"
            ],
            "enumColors":{
               "HelmRelease":"lightGray",
               "Kustomization":"lightGray"
            }
         },
         "interval":{
            "icon":"Clock",
            "type":"string",
            "title":"Interval",
            "description":"The interval at which the application will be reconciled"
         },
         "path":{
            "title":"Path",
            "type":"string",
            "icon":"DefaultProperty"
         },
         "prune":{
            "title":"Prune",
            "type":"boolean",
            "icon":"DefaultProperty"
         }
      },
      "required":[]
   },
   "mirrorProperties":{},
   "calculationProperties":{},
   "aggregationProperties":{},
   "relations":{
      "source":{
         "title":"Source",
         "target":"fluxSource",
         "required":false,
         "many":false
      }
   }
}
```

</details>

### Exporting custom resource mapping

Using the `CONFIG_YAML_URL` parameter, you can define a custom resource mapping to use when installing the exporter.

In this use-case you will be using the **[this configuration file](https://github.com/port-labs/template-assets/blob/main/kubernetes/templates/fluxcd-kubernetes_v1_config.yaml)**. To achieve this, run:

```bash
export CONFIG_YAML_URL="https://github.com/port-labs/template-assets/blob/main/kubernetes/templates/fluxcd-kubernetes_v1_config.yaml"
```

Below is the mapping for the Flux resources:

<details>
<summary> <b>Flux source mapping (click to expand)</b> </summary>

```yaml showLineNumbers
- kind: source.toolkit.fluxcd.io/v1/gitrepositories
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        - identifier: .metadata.name + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
          title: .metadata.name
          icon: '"Fluxcd"'
          blueprint: '"fluxSource"'
          properties:
            repoURL: .spec.url
            sourceType: .kind
            branch: .spec.ref.branch
            interval: .spec.interval
            createdAt: .metadata.creationTimestamp
          relations:
            namespace: .metadata.namespace + "-" + env.CLUSTER_NAME

- kind: source.toolkit.fluxcd.io/v1beta2/helmrepositories
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        - identifier: .metadata.name + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
          title: .metadata.name
          icon: '"Fluxcd"'
          blueprint: '"fluxSource"'
          properties:
            repoURL: .spec.url
            sourceType: .kind
            branch: .spec.ref.branch
            interval: .spec.interval
            createdAt: .metadata.creationTimestamp
          relations:
            namespace: .metadata.namespace + "-" + env.CLUSTER_NAME
```
</details>

<details>
<summary> <b>Flux application mapping (click to expand)</b> </summary>

```yaml showLineNumbers
- kind: kustomize.toolkit.fluxcd.io/v1/kustomizations
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        - identifier: .metadata.name + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
          title: .metadata.name
          icon: '"Fluxcd"'
          blueprint: '"fluxApplication"'
          properties:
            targetNamespace: .spec.targetNamespace
            namespace: .metadata.namespace
            ready: .status.conditions[] | select(.type == "Ready") | .status
            path: .spec.path
            prune: .spec.prune
            applicationType: .kind
            interval: .spec.interval
            createdAt: .metadata.creationTimestamp
          relations:
            source: .spec.sourceRef.name + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME

- kind: helm.toolkit.fluxcd.io/v2beta2/helmreleases
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        - identifier: .metadata.name + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
          title: .metadata.name
          icon: '"Fluxcd"'
          blueprint: '"fluxApplication"'
          properties:
            targetNamespace: .spec.targetNamespace
            namespace: .metadata.namespace
            ready: .status.conditions[] | select(.type == "Ready") | .status
            path: .spec.path
            prune: .spec.prune
            applicationType: .kind
            interval: .spec.chart.spec.interval
            createdAt: .metadata.creationTimestamp
          relations:
            source: .spec.chart.spec.sourceRef.name + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
```

</details>

You can now browse to your Port environment to see that your blueprints have been created, and your k8s and Flux
resources are being reported to Port using the freshly installed k8s exporter.
