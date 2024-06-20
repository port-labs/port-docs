---
sidebar_position: 1
tags:
  - OpenCost
  - AWS
  - Pricing
  - FinOps
  - Ocean
---

# AWS

## Overview

By default, OpenCost pulls on-demand asset prices from the public AWS pricing API. The AWS Pricing API is limited in it's resolution capabilities, not allowing per-resource costs analysis and other interesting data resolutions. 

To allow for a more granular resolution of your AWS cost data, Opencost supports ingesting pricing data from [CUR reports](https://docs.aws.amazon.com/cur/latest/userguide/what-is-cur.html).

In this guide, we will using the OpenCost price capabilities using AWS CUR, and Port's [Ocean OpenCost integration](/build-your-software-catalog/sync-data-to-catalog/cloud-cost/opencost/opencost.md), to ingest per-resourse cost entities in to our Port organization.

## Prerequisites

- Set up OpenCost with AWS CUR - You will need to set up OpenCost AWS Costs and Usage reports ingestion using [this guide](https://docs.kubecost.com/install-and-configure/install/cloud-integration/aws-cloud-integrations). This guide uses KubeCost documentation, but the steps are the same for setting up Opencost.

- Install Port's [OpenCost integration](/build-your-software-catalog/sync-data-to-catalog/cloud-cost/opencost/opencost.md#installation).

# Data model setup
When setting up Port's OpenCost integration for the first time, the integration should initialize a [blueprint](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/) called `OpenCost CloudCost`.

If the blueprint **does not** exist:
1. Navigate to your Port organization's [data model](https://app.getport.io/settings/data-model) page.
2. Click the `+ Blueprint` button.
3. Click the `Edit JSON` button.
4. Copy-paste the following blueprint JSON:

<details>
    <summary>`OpenCost CloudCost` blueprint</summary>

    This blueprint represents an OpenCost CloudCost entity.

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

# Mapping configuration
After setting up our data model, we need to update the OpenCost integration's mapping configuration.

OpenCost cloudcost data supports all sorts of time windows, aggregations and filters. In this guide, the data that will be ingested is the cost of all `AmazonEC2` resources in the past week.

Navigate to your [datasources page](https://app.getport.io/settings/data-sources), and click on the `Opencost` datasource. 

Add the following configuration to your datasource mapping:


<details>
    <summary>`OpenCost CloudCost` mapping configuration</summary>

   If the OpenCost integration was freshly installed, there will already be an existing `cloudcost` config block. Replace the pre-existing config with the following YAML snippet.

```yaml showLineNumbers
  - kind: cloudcost
    selector:
      query: .properties.providerID
      aggregate: providerID
      accumulate: week
      window: week
      filter:
        service: AmazonEC2
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
```

:::note

The `.selector.filter.service` field is **required**, and represents the AWS service type (AWS Namespace) we want to ingest. 

We use the `.properties.providerID` field to get the ARN of the AWS resource. Some AWS resources do not have a full ARN as their ID and are ingested as regular IDs.
For example, an entity which represents an EC2 instance will be ingested to Port with a `i-abc123abc123ab` as it's identifier.

:::

</details>

Click `Save`.

Now, navigate to your [OpenCost CloudCost](https://app.getport.io/openCostCloudcosts) entities page, and you should see your `AmazonEC2` resources, and their different price types.

# Summary
Using Port Ocean's OpenCost integration, we have successfully ingested AWS resources' cost data in to our Port organization!

<p align="center">
<img src='/img/integrations/opencost/opencostCloudcostResources.png' width='75%' border='1px' />
</p>

