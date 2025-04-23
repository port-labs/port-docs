---
sidebar_position: 5
description: Trivy quickstart
---

import TemplateInstallation from "./_template_installation.mdx";
import TemplatePrerequisites from "./_template_prerequisites.mdx";

# Trivy Operator

[Trivy Operator](https://github.com/aquasecurity/trivy-operator) is an open-source security scanner that leverages [Trivy](https://github.com/aquasecurity/trivy) to continuously scan your Kubernetes cluster for security issues.

Using Port's Kubernetes Exporter, you can keep track of all Trivy resources across your different clusters and export
all the security and configuration issues to Port. You will use built in metadata from your kubernetes resources and CRDs to create entities in
Port and keep track of their state.

:::tip
Get to know the basics of our Kubernetes exporter [here!](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/kubernetes.md)
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

```bash
export CUSTOM_BP_PATH="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/blueprints/trivy-blueprints.json"
```

This `blueprints.json` file defines the following blueprints:

- Cluster
- Namespace
- Workload
- Trivy Config Audit Report
- Trivy Vulnerability

:::note

- `Workload` is an abstraction of Kubernetes objects which create and manage pods.
  By creating this blueprint, you can avoid creating a dedicated blueprint per Workload type, all of which will likely
  look pretty similar.
  Here is the list of kubernetes objects `Workload` will represent:

    - Deployment
    - StatefulSet
    - DaemonSet

- `Trivy Config Audit Report` represents checks performed by Trivy against a Kubernetes object's configuration

- `Trivy Vulnerability` represents the latest vulnerabilities found in a container image of a given Kubernetes workload
:::

Below are the Trivy blueprint schemas used in the exporter:

<details>
<summary> <b>Trivy config audit report blueprint (click to expand)</b> </summary>

```json showLineNumbers
{
   "identifier": "trivyConfigAuditReport",
   "title": "Trivy Config Audit Report",
   "icon": "Trivy",
   "schema": {
      "properties": {
      "category": {
         "title": "Category",
         "type": "string"
      },
      "messages": {
         "title": "Messages",
         "type": "array"
      },
      "description": {
         "title": "Description",
         "type": "string"
      },
      "severity": {
         "title": "Severity",
         "type": "string",
         "enum": [
            "LOW",
            "MEDIUM",
            "HIGH",
            "CRITICAL",
            "UNKNOWN"
         ],
         "enumColors": {
            "LOW": "green",
            "MEDIUM": "yellow",
            "HIGH": "red",
            "CRITICAL": "red",
            "UNKNOWN": "lightGray"
         }
      },
      "remediation": {
         "title": "Remediation",
         "type": "string"
      },
      "success": {
         "title": "Success",
         "type": "boolean"
      },
      "scanner": {
         "title": "Scanner",
         "type": "string"
      },
      "scannerVersion": {
         "title": "Scanner Version",
         "type": "string"
      },
      "createdAt": {
         "title": "Created At",
         "type": "string",
         "format": "date-time"
      },
      "updatedAt": {
         "title": "Updated At",
         "type": "string",
         "format": "date-time"
      }
      },
      "required": []
   },
   "mirrorProperties": {},
   "calculationProperties": {},
   "aggregationProperties": {},
   "relations": {
      "kubernetes_resource": {
         "title": "Kubernetes Resource",
         "target": "workload",
         "required": false,
         "many": false
      }
   }
}
```
</details>

<details>
<summary> <b>Trivy vulnerability blueprint (click to expand)</b> </summary>

```json showLineNumbers
{
   "identifier": "trivyVulnerabilityReport",
   "title": "Trivy Vulnerability",
   "icon": "Trivy",
   "schema": {
      "properties": {
      "resource": {
         "title": "Resource",
         "type": "string"
      },
      "score": {
         "title": "Score",
         "type": "number"
      },
      "fixedVersion": {
         "title": "Fixed Version",
         "type": "string"
      },
      "installedVersion": {
         "title": "Installed Version",
         "type": "string"
      },
      "lastModifiedDate": {
         "title": "Last Modified Date",
         "type": "string",
         "format": "date-time"
      },
      "links": {
         "icon": "DefaultProperty",
         "title": "Links",
         "type": "array",
         "items": {
            "type": "string",
            "format": "url"
         }
      },
      "primaryLink": {
         "title": "Primary Link",
         "type": "string",
         "format": "url"
      },
      "publishedDate": {
         "title": "Published Date",
         "type": "string",
         "format": "date-time"
      },
      "severity": {
         "title": "Severity",
         "type": "string",
         "enum": [
            "LOW",
            "MEDIUM",
            "HIGH",
            "CRITICAL",
            "UNKNOWN"
         ],
         "enumColors": {
            "LOW": "green",
            "MEDIUM": "yellow",
            "HIGH": "red",
            "CRITICAL": "red",
            "UNKNOWN": "lightGray"
         }
      },
      "target": {
         "title": "Target",
         "type": "string"
      },
      "scanner": {
         "title": "Scanner Name",
         "type": "string"
      },
      "scannerVersion": {
         "title": "Scanner Version",
         "type": "string"
      },
      "createdAt": {
         "title": "Created At",
         "type": "string",
         "format": "date-time"
      }
      },
      "required": []
   },
   "mirrorProperties": {},
   "calculationProperties": {},
   "aggregationProperties": {},
   "relations": {
      "kubernetes_resource": {
         "title": "Kubernetes Resource",
         "target": "workload",
         "required": false,
         "many": false
      }
   }
}
```
</details>

### Exporting custom resource mapping

Using the `CONFIG_YAML_URL` parameter, you can define a custom resource mapping to use when installing the exporter.

In this use-case you will be using the **[this configuration file](https://github.com/port-labs/template-assets/blob/main/kubernetes/templates/trivy-kubernetes_v1_config.yaml)**. To achieve this, run:

```bash
export CONFIG_YAML_URL="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/templates/trivy-kubernetes_v1_config.yaml"
```
Below are the mappings for the Trivy resources:
<details>
<summary> <b>Trivy config audit report mapping (click to expand)</b> </summary>

```yaml showLineNumbers
  - kind: aquasecurity.github.io/v1alpha1/configauditreports
    selector:
      query: 'true'
    port:
      itemsToParse: .report.checks
      entity:
        mappings:
          - identifier: .metadata.name + "-" + .item.checkID + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
            title: .item.title
            icon: '"Trivy"'
            blueprint: '"trivyConfigAuditReport"'
            properties:
              category: .item.category
              messages: .item.messages
              description: .item.description
              severity: .item.severity
              remediation: .item.remediation
              success: .item.success
              scanner: .report.scanner.name
              scannerVersion: .report.scanner.version
              createdAt: .metadata.creationTimestamp
              updatedAt: .report.updateTimestamp
            relations:
              kubernetes_resource: (
                if (.metadata.ownerReferences | length > 0) then 
                     (.metadata.ownerReferences[] | select(.controller == true) |
                     .name + "-" + .kind + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
                     )
                  else
                     empty
                  end
                )
```
</details>

<details>
<summary> <b>Trivy vulnerability mapping (click to expand)</b> </summary>

```yaml showLineNumbers
  - kind: aquasecurity.github.io/v1alpha1/vulnerabilityreports
    selector:
      query: 'true'
    port:
      itemsToParse: .report.vulnerabilities
      entity:
        mappings:
          - identifier: .metadata.name + "-" + .item.vulnerabilityID + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
            title: .item.title
            icon: '"Trivy"'
            blueprint: '"trivyVulnerabilityReport"'
            properties:
              resource: .item.resource
              score: .item.score
              fixedVersion: .item.fixedVersion
              installedVersion: .item.installedVersion
              lastModifiedDate: .item.lastModifiedDate
              links: .item.links
              primaryLink: .item.primaryLink
              publishedDate: .item.publishedDate
              severity: .item.severity
              target: .item.target
              scanner: .report.scanner.name
              scannerVersion: .report.scanner.version
              createdAt: .metadata.creationTimestamp
            relations:
              kubernetes_resource: (
               if (.metadata.ownerReferences | length > 0) then 
                     (.metadata.ownerReferences[] | select(.controller == true) |
                     .name + "-" + .kind + "-" + .metadata.namespace + "-" + env.CLUSTER_NAME
                     )
                  else
                     empty
                  end
               )
```
</details>

## Alternative integration using GitHub file ingestion
While the Trivy Kubernetes exporter described above is the recommended installation method, you may prefer to use the GitHub file ingesting feature to [ingest your Trivy scan results to Port](/guides/all/ingest-trivy-vulnerabilities-into-your-catalog). 