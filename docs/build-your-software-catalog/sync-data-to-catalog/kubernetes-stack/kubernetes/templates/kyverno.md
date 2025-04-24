---
sidebar_position: 6
description: Kyverno quickstart
---

import TemplateInstallation from "./_template_installation.mdx";
import TemplatePrerequisites from "./_template_prerequisites.mdx";

# Kyverno

[Kyverno](https://kyverno.io/) is a policy engine designed for Kubernetes. Kyverno policies can validate, mutate, generate, and cleanup Kubernetes resources, allowing cluster administrators to enforce configuration best practices for their clusters.

Using Port's Kubernetes Exporter, you can keep track of all Kyverno resources across your different clusters and export
all the policies and reports to Port. You will use built in metadata from your kubernetes resources and CRDs to create entities in
Port and keep track of their state.

:::tip Our Kubernetes exporter basics
Get to know the basics of our Kubernetes exporter [here!](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/kubernetes.md)
:::

<img src="/img/build-your-software-catalog/sync-data-to-catalog/kubernetes/k8sKyvernoView.png" border="1px"/>

## Prerequisites

<TemplatePrerequisites />

## Setting up blueprints & resource mapping

The following section will guide you through the process of setting up your blueprints and resource mapping using the
installation script. You can read more about the installation script [here](#how-does-the-installation-script-work).

### Creating blueprints

The installation script provides a convenient way to create your blueprints. Using the `CUSTOM_BP_PATH` environment
variable, you can fetch a pre-defined `blueprints.json` to create your blueprints. For this use-case, you will
use [this file](https://github.com/port-labs/template-assets/blob/main/kubernetes/blueprints/kyverno-blueprints.json) to
define your blueprints. Do this by running:

```bash
export CUSTOM_BP_PATH="https://github.com/port-labs/template-assets/blob/main/kubernetes/blueprints/kyverno-blueprints.json"
```

This `blueprints.json` file defines the following blueprints:

- Cluster
- Namespace
- Workload
- Kyverno Policy
- Kyverno Policy Report

:::note Blueprint information

- `Workload` is an abstraction of Kubernetes objects which create and manage pods.
  By creating this blueprint, you can avoid creating a dedicated blueprint per Workload type, all of which will likely
  look pretty similar.
  Here is the list of kubernetes objects `Workload` will represent:

    - Deployment
    - StatefulSet
    - DaemonSet

- `Kyverno Policy` is one of the most important Kyverno resources, giving developers the capability to set and enforce policy rules in their Kubernetes cluster.

- `Kyverno Policy Report` is another important Kyverno resource that contains the results of applying the policies to the Kubernetes cluster.
:::

Below are the Kyverno blueprint schemas used in the exporter:

<details>
<summary> <b>Kyverno policy blueprint (click to expand)</b> </summary>
```json showLineNumbers
  {
    "identifier":"kyvernoPolicy",
    "title":"Kyverno Policy",
    "icon":"Cluster",
    "schema":{
        "properties":{
          "admission":{
              "title":"Admission",
              "type":"boolean",
              "icon":"DefaultProperty"
          },
          "background":{
              "title":"Background",
              "type":"boolean",
              "icon":"DefaultProperty"
          },
          "createdAt":{
              "title":"Created At",
              "type":"string",
              "format":"date-time",
              "icon":"DefaultProperty"
          },
          "validationFailureAction":{
              "icon":"DefaultProperty",
              "title":"Validation Failure Action",
              "type":"string",
              "enum":[
                "Audit",
                "Enforce"
              ],
              "enumColors":{
                "Audit":"lightGray",
                "Enforce":"lightGray"
              }
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
<summary> <b>Kyverno policy report blueprint (click to expand)</b> </summary>
```json showLineNumbers
  {
    "identifier":"kyvernoPolicyReport",
    "title":"Kyverno Policy Report",
    "icon":"Cluster",
    "schema":{
        "properties":{
          "createdAt":{
              "title":"Created At",
              "type":"string",
              "format":"date-time"
          },
          "pass":{
              "title":"Pass",
              "type":"number"
          },
          "fail":{
              "title":"Fail",
              "type":"number"
          },
          "warn":{
              "title":"Warn",
              "type":"number"
          },
          "error":{
              "title":"Error",
              "type":"number"
          },
          "skip":{
              "title":"Skip",
              "type":"number"
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

### Exporting custom resource mapping

Using the `CONFIG_YAML_URL` parameter, you can define a custom resource mapping to use when installing the exporter.

In this use-case you will be using the **[this configuration file](https://github.com/port-labs/template-assets/blob/main/kubernetes/templates/kyverno-kubernetes_v1_config.yaml)**. To achieve this, run:

```bash
export CONFIG_YAML_URL="https://github.com/port-labs/template-assets/blob/main/kubernetes/templates/kyverno-kubernetes_v1_config.yaml"
```

Below is the mapping for the Kyverno resources:

<details>
<summary> <b>Kyverno policy mapping (click to expand)</b> </summary>

```yaml showLineNumbers
- kind: kyverno.io/v1/policies
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        - identifier: .metadata.name + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
          title: .metadata.name
          icon: '"Cluster"'
          blueprint: '"kyvernoPolicy"'
          properties:
            admission: .spec.admission
            background: .spec.background
            validationFailureAction: .spec.validationFailureAction
            createdAt: .metadata.creationTimestamp
          relations:
            namespace: .metadata.namespace + "-" + env.CLUSTER_NAME

- kind: kyverno.io/v1/clusterpolicies
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        - identifier: .metadata.name + "-" + env.CLUSTER_NAME
          title: .metadata.name
          icon: '"Cluster"'
          blueprint: '"kyvernoPolicy"'
          properties:
            admission: .spec.admission
            background: .spec.background
            validationFailureAction: .spec.validationFailureAction
            createdAt: .metadata.creationTimestamp
```
</details>

<details>
<summary> <b>Kyverno policy report mapping (click to expand)</b> </summary>

```yaml showLineNumbers
- kind: wgpolicyk8s.io/v1alpha2/policyreports
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        - identifier: .metadata.name + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
          title: .scope.name
          icon: '"Cluster"'
          blueprint: '"kyvernoPolicyReport"'
          properties:
            pass: .summary.pass
            fail: .summary.fail
            warn: .summary.warn
            error: .summary.error
            skip: .summary.skip
            createdAt: .metadata.creationTimestamp
          relations:
            namespace: .metadata.namespace + "-" + env.CLUSTER_NAME

- kind: wgpolicyk8s.io/v1alpha2/clusterpolicyreports
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        - identifier: .metadata.name + "-" + env.CLUSTER_NAME
          title: .scope.name
          icon: '"Cluster"'
          blueprint: '"kyvernoPolicyReport"'
          properties:
            pass: .summary.pass
            fail: .summary.fail
            warn: .summary.warn
            error: .summary.error
            skip: .summary.skip
            createdAt: .metadata.creationTimestamp
```
</details>

You can now browse to your Port environment to see that your blueprints have been created, and your k8s and Kyverno
resources are being reported to Port using the freshly installed k8s exporter.
