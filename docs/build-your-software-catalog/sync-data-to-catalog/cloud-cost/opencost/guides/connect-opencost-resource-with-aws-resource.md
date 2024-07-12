---
sidebar_position: 1
title: Connect Opencost cloudcost with AWS Resource
---

# Connect Kubecost `cloudcost` with AWS Resource

This guide aims to cover how to connect an Opencost Cloudcost resource with an AWS resource to draw cost analysis.

:::tip Prerequisites
- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart).
- Ensure you have [Port's Opencost integration installed and configured in your environment](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/cloud-cost/opencost).
- Ensure you have [Port's AWS integration installed and configured in your environment](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/installations/installation). This guide does not support the [deprecated AWS Exporter integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-exporter/)
:::

## Create the Opencost Cloudcost relation

With Opencost and AWS integrations installed, you should see:
- Two (2) new blueprints created by the Opencost integration, "Opencost Resource Allocations" and `Opencost Cloudcost`
- Two (2) new blueprints created by the AWS integration, `AWS Cloud Resources` and `AWS Accounts`.

If the blueprints aren't created:
- Navigate to your Port organization's data model page on the builder.
- Click the + Blueprint button at the top right corner.
- Click the Edit JSON button.
- Copy-paste the blueprint JSON:

:::info Important Blueprints
The `Opencost Cloudcost`, `AWS Cloud Resources` and `AWS Accounts` are the only blueprints of interest here.

:::


<details>
<summary><b>Opencost Cloudcost (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "openCostCloudcost",
  "description": "This blueprint represents cloud cost allocations from your OpenCost instance",
  "title": "OpenCost CloudCost",
  "icon": "Opencost",
  "schema": {
    "properties": {
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
      "listCost": {
        "title": "List Cost",
        "type": "number"
      },
      "netCost": {
        "title": "Net Cost",
        "type": "number"
      },
      "amortizedNetCost": {
        "title": "Amortized Net Cost",
        "type": "number"
      },
      "invoicedCost": {
        "title": "Invoiced Cost",
        "type": "number"
      },
      "amortizedCost": {
        "title": "Amortized Cost",
        "type": "number"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```

</details>

<details>
<summary><b>AWS Account (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "awsAccount",
  "title": "AWS account",
  "icon": "AWS",
  "schema": {
    "properties": {
      "arn": {
        "type": "string",
        "title": "Arn"
      },
      "email": {
        "type": "string",
        "title": "Email"
      },
      "status": {
        "type": "array",
        "title": "Status",
        "default": [
          "ACTIVE"
        ],
        "items": {
          "enum": [
            "ACTIVE",
            "SUSPENDED",
            "PENDING_CLOSURE"
          ],
          "enumColors": {
            "ACTIVE": "green",
            "SUSPENDED": "red",
            "PENDING_CLOSURE": "yellow"
          },
          "type": "string"
        }
      },
      "joined_method": {
        "type": "string",
        "title": "Joined Method",
        "enum": [
          "INVITED",
          "CREATED"
        ],
        "enumColors": {
          "INVITED": "lightGray",
          "CREATED": "lightGray"
        }
      },
      "joined_timestamp": {
        "type": "string",
        "title": "Joined Timestamp",
        "format": "date-time"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```

</details>

<details>
<summary><b>AWS Cloud Resource (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "cloudResource",
  "title": "AWS Cloud Resource",
  "icon": "AWS",
  "schema": {
    "properties": {
      "kind": {
        "title": "Kind",
        "type": "string"
      },
      "tags": {
        "items": {
          "type": "object"
        },
        "type": "array",
        "title": "Tags"
      },
      "arn": {
        "type": "string",
        "title": "ARN"
      },
      "link": {
        "type": "string",
        "title": "Link",
        "icon": "AWS",
        "format": "url"
      },
      "region": {
        "type": "string",
        "title": "Region"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "account": {
      "title": "Account",
      "target": "awsAccount",
      "required": true,
      "many": false
    }
  }
}
```

</details>

Now that Port is synced with our AWS and Opencost resources, let's map the Opencost Cloudcost to the AWS Cloud Resources.

First, we will need to create a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/relate-blueprints.md) between our `openCostCloudcost` and the corresponding `cloudResource`.

1. Head back to the [Builder](https://app.getport.io/settings/data-model), choose the `Pull Request` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation`:

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-cost/opencost/guides/newRelationOpenCost.png' width='60%' border='1px' />

<br/><br/>

2. Fill out the form like this, then click `Create`:

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-cost/opencost/guides/createNewRelationOpencost.png' width='60%' border='1px' />

<br/><br/>


Now that the <PortTooltip id="blueprint">blueprints</PortTooltip> are related, we need to assign the relevant Opencost Cloudcost to each of our AWS Cloud Resource. This can be done by adding some mapping logic. Go to your [data sources page](https://app.getport.io/settings/data-sources), and click on your Opencost integration:

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-cost/opencost/guides/datasourcesOpencost.png' border='1px' />

<br/><br/>

Under the `resources` key, locate the Cloudcost block and replace it with the following YAML block to map Opencost Cloudcost to the respective AWS Cloud Resource. Then click `Save & Resync`:

<details>
<summary><b>Relation mapping (click to expand)</b></summary>

```yaml showLineNumbers
  - kind: cloudcost
    selector:
      query: .properties.providerID
      aggregate: providerID
      accumulate: week
      window: week
    port:
      entity:
        mappings:
          identifier: .properties.providerID
          title: .properties.providerID
          blueprint: '"openCostCloudcost"'
          properties:
            startDate: .window.start
            endDate: .window.end
            listCost: .listCost.cost
            netCost: .netCost.cost
            amortizedNetCost: .amortizedNetCost.cost
            invoicedCost: .invoicedCost.cost
            amortizedCost: .amortizedCost.cost
        relations:
            awsCloudResource: .properties.providerID
```

</details>

:::tip Mapping explanation
The configuration mapping above ingests cloud cost data with selector properties designed to retrieve the AWS resource's ID

- `query: .properties.providerID` ensures that only entities with a providerID are ingested
- `aggregate: providerID` aggregates data by provider ID (AWS ARN) which ensures that entities are mapped to their respective AWS resource
- `accumulate: week` defines the step size which accumulates data week by week
- `window: week` grabs data for the past one week

For the `awsCloudCost` relation, we extract the resource ID from the Provider ID of the cloudcost information. Therefore, each Cloudcost entity will be mapped to their respective AWS resource.
By following these steps, you can seamlessly connect Opencost Cloudcost data with its respective AWS resources.

:::

More relevant guides and examples:
- [Port's Opencost integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/cloud-cost/opencost)
- [Port's AWS integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/installations/installation)
