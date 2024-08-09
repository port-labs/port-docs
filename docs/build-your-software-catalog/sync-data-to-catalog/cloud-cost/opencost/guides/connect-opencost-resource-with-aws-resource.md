---
sidebar_position: 1
title: Connect Opencost Cloud Cost with AWS Resource in Port
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Connect Opencost Clou- d Cost with AWS Resource in Port

This guide will show you how to connect an Opencost cloudcost resource with an AWS resource in Port to analyze your cloud cost allocation.

## Use Case Examples:

- Cost Attribution: Determine which AWS resources (EC2 instances, RDS databases, etc.) contribute the most to your overall cloud costs.
- Budget Management: Track the costs of individual resources or groups of resources against your budget allocations.
- Anomaly Detection: Identify unusual spikes in resource costs and investigate potential causes.
- Optimization Opportunities: Pinpoint resources that are underutilized or overprovisioned, potentially leading to cost savings.

:::

## Prerequisites
- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart).
- Ensure you have [Port's Opencost integration installed and configured in your environment](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/cloud-cost/opencost).
- Ensure you have [Port's AWS integration installed and configured in your environment](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/installations/installation). This guide does not support the [deprecated AWS Exporter integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-exporter/)


## Create the Opencost Cloudcost relation

With Opencost and AWS integrations installed, you should see some blueprints created by both integrations

Now that Port is synced with our AWS and Opencost resources, let's map the Opencost Cloudcost to the AWS Cloud Resources.

First, we will need to create a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/relate-blueprints.md) between our `openCostCloudcost` and the corresponding `cloudResource`.

1. Head back to the [Builder](https://app.getport.io/settings/data-model), choose the `Opencost Cloudcost` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation`:

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

<img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-cost/opencost/guides/awsToCloudcostRelation.png' border='1px' />

More relevant guides and examples:
- [Port's Opencost integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/cloud-cost/opencost)
- [Port's AWS integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/installations/installation)
