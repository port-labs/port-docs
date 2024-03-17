---
sidebar_position: 5
description: Trivy quickstart
---

import TemplateInstallation from "./_template_installation.mdx";
import TemplatePrerequisites from "./_template_prerequisites.mdx";

# Trivy Operator

[Trivy Operator](https://github.com/aquasecurity/trivy-operator) is an open-source security scanner that leverages [Trivy](https://github.com/aquasecurity/trivy) to continuously scan your Kubernetes cluster for security issues.

Using Port's Kubernetes Exporter, you can keep track of all Trivy resources across your different clusters and export
all the security issues to Port. You will use built in metadata from your kubernetes resources and CRDs to create entities in
Port and keep track of their state.

:::tip
Get to know the basics of our Kubernetes exporter [here!](/build-your-software-catalog/sync-data-to-catalog/kubernetes/kubernetes.md)
:::

<img src="/img/build-your-software-catalog/sync-data-to-catalog/kubernetes/k8sTrivyOperatorView.png" border="1px"/>

## Prerequisites

<TemplatePrerequisites />

## Setting up blueprints & resource mapping

The following section will guide you through the process of setting up your blueprints and resource mapping using the
installation script. You can read more about the installation script [here](#how-does-the-installation-script-work).

### Creating blueprints

The installation script provides a convenient way to create your blueprints. Using the `CUSTOM_BP_PATH` environment
variable, you can fetch a pre-defined `blueprints.json` to create your blueprints. For this use-case, you will
use [this file](https://github.com/port-labs/template-assets/blob/main/kubernetes/blueprints/trivy-blueprints.json) to
define your blueprints. Do this by running:

```bash showLineNumbers
export CUSTOM_BP_PATH="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/blueprints/trivy-blueprints.json"
```

This `blueprints.json` file defines the following blueprints:

- Cluster
- Namespace
- Workload
- Trivy Vulnerabilities

:::note

- `Workload` is an abstraction of Kubernetes objects which create and manage pods.
  By creating this blueprint, you can avoid creating a dedicated blueprint per Workload type, all of which will likely
  look pretty similar.
  Here is the list of kubernetes objects `Workload` will represent:

    - Deployment
    - StatefulSet
    - DaemonSet

- `Trivy Vulnerabilities` is one of the most important Trivy resources, giving developers the capability to find and view the risks that relate to different resources in their Kubernetes cluster.
:::

Below is the Trivy blueprint schema used in the exporter:

<details>
<summary> <b>Trivy vulnerability blueprint (click to expand)</b> </summary>

```json showLineNumbers
{
   "identifier":"trivyVulnerabilities",
   "title":"Trivy Vulnerabilities",
   "icon":"Trivy",
   "schema":{
      "properties":{
         "scanner":{
            "title":"Scanner",
            "type":"string"
         },
         "criticalCount":{
            "title":"Critical Count",
            "type":"number"
         },
         "highCount":{
            "title":"High Count",
            "type":"number"
         },
         "lowCount":{
            "title":"Low Count",
            "type":"number"
         },
         "mediumCount":{
            "title":"Medium Count",
            "type":"number"
         },
         "category":{
            "title":"Category",
            "type":"string"
         },
         "message":{
            "title":"Message",
            "type":"array"
         },
         "severity":{
            "title":"Severity",
            "type":"string",
            "enum":[
               "LOW",
               "MEDIUM",
               "HIGH",
               "CRITICAL",
               "UNKNOWN"
            ],
            "enumColors":{
               "LOW":"green",
               "MEDIUM":"yellow",
               "HIGH":"red",
               "CRITICAL":"red",
               "UNKNOWN":"lightGray"
            }
         },
         "scannerVersion":{
            "title":"Scanner Version",
            "type":"string"
         },
         "createdAt":{
            "title":"Created At",
            "type":"string",
            "format":"date-time"
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

In this use-case you will be using the **[this configuration file](https://github.com/port-labs/template-assets/blob/main/kubernetes/templates/trivy-kubernetes_v1_config.yaml)**. To achieve this, run:

```bash showLineNumbers
export CONFIG_YAML_URL="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/templates/trivy-kubernetes_v1_config.yaml"
```
Below is the mapping for the Trivy resource:
<details>
<summary> <b>Trivy vulnerability mapping (click to expand)</b> </summary>

```yaml showLineNumbers
- kind: aquasecurity.github.io/v1alpha1/configauditreports
  port:
    entity:
      mappings:
        - identifier: .metadata.name + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
          title: .metadata.name
          icon: '"Trivy"'
          blueprint: '"trivyVulnerabilities"'
          properties:
            scanner: .report.scanner.name
            criticalCount: .report.summary.criticalCount
            highCount: .report.summary.highCount
            lowCount: .report.summary.lowCount
            mediumCount: .report.summary.mediumCount
            category: .report.checks[0].category
            message: .report.checks[0].messages
            severity: .report.checks[0].severity
            scannerVersion: .report.scanner.version
            createdAt: .metadata.creationTimestamp
          relations:
            namespace: .metadata.namespace + "-" + env.CLUSTER_NAME
```
</details>

## Alternative integration using script
While the Trivy Kubernetes exporter described above is the recommended installation method, you may prefer to use a webhook and a script to [ingest your Trivy scan results to Port](/build-your-software-catalog/custom-integration/webhook/examples/packages/trivy). 