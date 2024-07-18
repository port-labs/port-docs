---
sidebar_position: 1
title: Connect Opencost Cloud Cost with ArgoCD/K8 resource in Port
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Connect Opencost Cloud Cost with ArgoCD/K8 resource in Port

This guide demonstrates how to link OpenCost cloud cost data with your ArgoCD K8 resources within Port, enabling you to gain insights into the cost breakdown of your infrastructure and applications.

:::tip Use Case Examples:

Cost Attribution: Determine which Kubernetes resource contribute the most to your overall cloud costs.
Budget Management: Track the costs of individual pods or clusters against your budget allocations.
Anomaly Detection: Identify unusual spikes in resource costs and investigate potential causes.
Optimization Opportunities: Pinpoint resources that are underutilized or overprovisioned, potentially leading to cost savings.

:::


## Prerequisites
- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart).
- Ensure you have [Port's Opencost integration installed and configured in your environment](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/cloud-cost/opencost).
- Ensure you have [Port's Opencost integration installed and configured in your environment](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/cloud-cost/opencost).


## Create the ArgoCD K8 relation

With Opencost and ArgoCD installed, you should see:
- Two (2) new blueprints created by the Opencost integration, "Opencost Resource Allocations" and `Opencost Cloudcost`
- Six (6) new blueprints created by the ArgoCD integration, `ArgoCD Cluster`, `ArgoCD Project`, `Running Service`, `ArgoCD Deployment History`, `Kubernetes Resource` and `ArgoCD Namespace`.

If the blueprints aren't created:
- Navigate to [your Port organization's data model page](https://app.getport.io/settings/data-model) on the builder.
- Click the `+ Blueprint` button at the top right corner.
- Click the `Edit JSON` button.
- Copy-paste the blueprint JSON:

:::info Important Blueprints
The `Opencost Resource Allocations` and `Kubernetes Resource` are the only blueprints of interest here.

:::


<details>
<summary><b>Opencost Resource Allocations (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "openCostResourceAllocation",
  "description": "This blueprint represents an OpenCost resource allocation in our software catalog",
  "title": "OpenCost Resource Allocation",
  "icon": "Cluster",
  "schema": {
    "properties": {
      "cluster": {
        "type": "string",
        "title": "Cluster"
      },
      "namespace": {
        "type": "string",
        "title": "Namespace"
      },
      "startDate": {
        "title": "Start Date",
        "type": "string",
        "format": "date-time"
      },
      "endDate": {
        "title": "End Date",
        "type": "string",
        "format": "date-time"
      },
      "cpuCoreHours": {
        "title": "CPU Core Hours",
        "type": "number"
      },
      "cpuCost": {
        "title": "CPU Cost",
        "type": "number"
      },
      "cpuEfficiency": {
        "title": "CPU Efficiency",
        "type": "number"
      },
      "gpuHours": {
        "title": "GPU Hours",
        "type": "number"
      },
      "gpuCost": {
        "title": "GPU Cost",
        "type": "number"
      },
      "networkCost": {
        "title": "Network Cost",
        "type": "number"
      },
      "loadBalancerCost": {
        "title": "Load Balancer Cost",
        "type": "number"
      },
      "pvCost": {
        "title": "PV Cost",
        "type": "number"
      },
      "ramBytes": {
        "title": "RAM Bytes",
        "type": "number"
      },
      "ramCost": {
        "title": "RAM Cost",
        "type": "number"
      },
      "ramEfficiency": {
        "title": "RAM Efficiency",
        "type": "number"
      },
      "sharedCost": {
        "title": "Shared Cost",
        "type": "number"
      },
      "externalCost": {
        "title": "External Cost",
        "type": "number"
      },
      "totalCost": {
        "title": "Total Cost",
        "type": "number"
      },
      "totalEfficiency": {
        "title": "Total Efficiency",
        "type": "number"
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
<summary><b>Kubernetes Resource (Click to expand)</b></summary>

```json showLineNumbers
  {
    "identifier": "argocdKubernetesResource",
    "description": "This blueprint represents an ArgoCD kubernetes resource",
    "title": "Kubernetes Resource",
    "icon": "Argo",
    "schema": {
      "properties": {
        "kind": {
          "title": "Kind",
          "type": "string"
        },
        "version": {
          "title": "Version",
          "type": "string"
        },
        "namespace": {
          "title": "Namespace",
          "type": "string"
        },
        "labels": {
          "type": "object",
          "title": "Labels"
        },
        "annotations": {
          "type": "object",
          "title": "Annotations"
        }
      },
      "required": []
    },
    "mirrorProperties": {
      "healthStatus": {
        "title": "Health Status",
        "path": "application.healthStatus"
      },
      "syncStatus": {
        "title": "Sync Status",
        "path": "application.syncStatus"
      }
    },
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {}
  }
```

</details>


Now that Port is synced with our ArgoCD and Opencost resources, let's map the Opencost Resource Allocations to the ArgoCD K8 resource.

First, we will need to create a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/relate-blueprints.md) between our `argocdKubernetesResource` and the corresponding `openCostResourceAllocation`.

1. Head back to the [Builder](https://app.getport.io/settings/data-model), choose the `Pull Request` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation`:

<img src='/img/build-your-software-catalog/sync-data-to-catalog/argocd/newRelationMapping.png' width='60%' border='1px' />

<br/><br/>

2. Fill out the form like this, then click `Create`:

<img src='/img/build-your-software-catalog/sync-data-to-catalog/argocd/createRelation.png' width='60%' border='1px' />

<br/><br/>


Now that the <PortTooltip id="blueprint">blueprints</PortTooltip> are related, we need to assign the relevant ArgoCD K8 resource to each of our Opencost Resource Allocation. This can be done by adding some mapping logic. Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on your ArgoCD integration

Under the `resources` key, locate the Kubernetes block and replace it with the following YAML block to map ArgoCD Kubernetes Resource to the respective Opencost Allocation Resource. Then click `Save & Resync`:

<details>
<summary><b>Relation mapping (click to expand)</b></summary>

```yaml showLineNumbers
  - kind: managed-resource
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .__application.metadata.uid + "-" + .kind + "-" + .name
          title: .__application.metadata.name + "-" + .kind + "-" + .name
          blueprint: '"argocdKubernetesResource"'
          properties:
            kind: .kind
            namespace: .namespace
            version: .resourceVersion
            annotations: .liveState | fromjson | .metadata.annotations
            labels: .liveState | fromjson | .metadata.labels
          relations:
            application: .__application.metadata.uid
            image: 'if .kind == "Deployment" then .liveState | fromjson | .spec.template.spec.containers[0].image else null end'
            openCostResourceAllocation: .name
```

</details>

:::tip Mapping explanation
The configuration mapping above maps `openCostResourceAllocation` using the `name` property of the Kubernetes resource since Opencost Resource Allocation have their identifiers as the name of the Kubernetes resource

:::

More relevant guides and examples:
- [Port's Opencost integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/cloud-cost/opencost)
- [Port's ArgoCD integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/argocd/)


