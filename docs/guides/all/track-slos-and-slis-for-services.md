---
displayed_sidebar: null
description: Learn how to track SLOs and SLIs for your services using Port
---

# Track SLOs and SLIs for your services

This guide helps you set up a monitoring solution to track **Service Level Indicators (SLIs)** and compare them against **Service Level Objectives (SLOs)** using Port's integration with **New Relic**. 


## Common use cases

- Model and visualize service **SLIs** and compare them against **SLOs**.
- Create dashboards and reports to monitor SLOs over time.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- You have [installed and set up Port's New Relic integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/apm-alerting/newrelic).



## Set up data model

In this setup, we will create or update the `New Relic Service Level` blueprint.      
**Skip** to [update blueprint](#update-the-blueprint) if you already have the blueprint.


### Create the blueprint
Follow the steps below to **create** the `New Relic Service Level` blueprint:

1. Go to the [Builder](https://app.getport.io/settings/data-model) in your Port portal.
2. Click on "+ Blueprint".
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

   <details>
   <summary><b>New Relic Service Level blueprint (Click to expand)</b></summary>

   ```json showLineNumbers
   {
     "identifier": "newRelicServiceLevel",
     "description": "This blueprint represents a New Relic Service Level",
     "title": "New Relic Service Level",
     "icon": "NewRelic",
     "schema": {
       "properties": {
         "description": {
           "title": "Description",
           "type": "string"
         },
         "targetThreshold": {
           "icon": "DefaultProperty",
           "title": "Target Threshold",
           "type": "number"
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
         },
         "createdBy": {
           "title": "Creator",
           "type": "string",
           "format": "user"
         },
         "sli": {
           "type": "number",
           "title": "SLI"
         },
         "tags": {
           "type": "object",
           "title": "Tags"
         }
       },
       "required": []
     },
     "mirrorProperties": {
       "running_service_identifier": {
         "title": "runningServiceIdentifier",
         "path": "newRelicService.$identifier"
       },
       "domain": {
         "title": "Domain",
         "path": "newRelicService.domain"
       }
     },
     "calculationProperties": {
       "sloStatus": {
         "title": "SLO Status",
         "calculation": "if .properties.sli >= .properties.targetThreshold then \"Passed\" else \"Failed\" end",
         "type": "string",
         "colorized": true,
         "colors": {
           "Passed": "green",
           "Failed": "red"
         }
       }
     },
     "aggregationProperties": {},
     "relations": {
       "newRelicService": {
         "title": "New Relic service",
         "target": "newRelicService",
         "required": false,
         "many": false
       }
     }
   }
   ```

   </details>

5. Click "Save" to create the blueprint.

### Update the blueprint
Follow the steps below to **update** the `New Relic Service Level` blueprint:

1. Navigate to the `New Relic Service Level` blueprint in your Port [Builder](https://app.getport.io/settings/data-model).
2. Hover over it, click on the `...` button on the right, and select "Edit JSON".
3. Add the calculation property:

   <details>
   <summary><b>Calculation property (Click to expand)</b></summary>

   ```json showLineNumbers
   "sloStatus": {
     "title": "SLO Status",
     "calculation": "if .properties.sli >= .properties.targetThreshold then \"Passed\" else \"Failed\" end",
     "type": "string",
     "colorized": true,
     "colors": {
       "Passed": "green",
       "Failed": "red"
     }
   }
   ```

   </details>

4. Add these mirror properties:

   <details>
   <summary><b>Mirror properties (Click to expand)</b></summary>

   ```json showLineNumbers
   "running_service_identifier": {
     "title": "runningServiceIdentifier",
     "path": "newRelicService.$identifier"
   },
   "domain": {
     "title": "Domain",
     "path": "newRelicService.domain"
   }
   ```

   </details>




## Visualize metrics

In this section, you'll learn how to create dashboards that visualize key service metrics using SLIs and SLOs for production and engineering teams.

### Create a dashboard

1. Navigate to your [software catalog](https://app.getport.io/organization/catalog).
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **Production Deployment Overview** and click `Create`.
5. Repeat the same process to create an **Engineering Overview** dashboard.

You now have a blank dashboard where you can start adding widgets to visualize your SLIs and SLOs.

### Add widgets

<details>
<summary><b>Production Deployment Overview - SLI vs SLO Table</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **Service Level Performance Overview**.
3. Choose the **New Relic Service Level** blueprint.
   <img src="/img/guides/sliVsSloTable.png" width="50%" />

4. Click **Save**.
5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
6. In the top right corner of the table, click on `Manage Properties` button and add the following properties:
   - **Running service identifier**
   - **Target threshold**
   - **SLI**
   - **SLO Status**
7. Click on the **save icon** on the far right top conner of the widget to save the state of the table.

</details>

This table gives you a high-level overview of how your services are performing against their SLOs.

<details>
<summary><b>Engineering Overview - Failed SLOs Table</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **Domain Performance & SLO Failures**.
3. Choose the **New Relic Service Level** blueprint.
   <img src="/img/guides/failedSloTable.png" width="50%" />

4. Click **Save**.
5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
6. Group the table by **Domain**.
7. Apply a filter to display only the **Failed** SLOs.

</details>



### Visualize SLI trends

Tracking weekly performance trends for key services is crucial to identifying patterns and making data-driven decisions.


<details>
<summary><b>Weekly Latency Trend for API Gateway</b></summary>

1. Click **`+ Widget`** and select **Line Chart**.
2. Title the chart **API Gateway Weekly Latency Trend**.
3. Choose the **New Relic Service Level** blueprint.
4. Select the **Target Threshold** and **SLI** properties to compare actual latency with the target.
5. Set the time interval to **Week**.
6. Click **Save**.

</details>

<details>
<summary><b>Weekly Write Failure Trend for Main Database</b></summary>

1. Click **`+ Widget`** and select **Line Chart**.
2. Title the chart **Main Database Weekly Write Failure Trend**.
3. Choose the **New Relic Service Level** blueprint.
4. Select the **Target Threshold** and **SLI** properties to track write failures.
5. Set the time interval to **Week**.
6. Click **Save**.

</details>

<details>
<summary><b>Weekly Transaction Volume for Payment Processing</b></summary>

1. Click **`+ Widget`** and select **Line Chart**.
2. Title the chart **Payment Processing Weekly Transaction Volume Trend**.
3. Choose the **New Relic Service Level** blueprint.
4. Select the **Target Threshold** and **SLI** properties to track transaction volumes.
5. Set the time interval to **Week**.
6. Click **Save**.

</details>



#### Team-Level and Organization-Level dashboards

You can also create dashboards specific to teams or organization-wide, depending on the scope of monitoring.

1. First, add the following properties to the New Relic Service blueprint:
<details>
  <summary><b>Calculation and aggregation properties</b></summary>

```json showLineNumbers
"calculationProperties": {
    "has_slo": {
      "title": "Has SLO",
      "icon": "DefaultProperty",
      "description": "Boolean for if SLO exists",
      "calculation": ".properties.number_of_slos != null",
      "type": "boolean"
    }
  },
  "aggregationProperties": {
    "number_of_slos": {
      "title": "Number of SLOs",
      "icon": "DefaultProperty",
      "type": "number",
      "target": "newRelicServiceLevel",
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    }
```
 
</details>

2. Add the dashboards

<details>
<summary><b>Create My Team’s SLOs Dashboard (Team Lead View)</b></summary>

1. Click **`+ New`** in the sidebar to create a new dashboard.
2. Name the dashboard **My Team’s SLOs**.

</details>

<details>
<summary><b>Create Organization SLOs Dashboard (SRE View)</b></summary>

1. Click **`+ New`** in the sidebar to create a new dashboard.
2. Name the dashboard **Organization SLOs**.
</details>



#### SLO tables and charts

<details>
<summary><b>All SLOs Table</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **All SLOs**.
3. Select the **New Relic Service Level** blueprint.
4. 
   <img src="/img/guides/allSloTable.png" width="50%" border="1px" />

4.Click **Save**.

</details>

<details>
<summary><b>SLO Status Pie Chart</b></summary>

1. Click **`+ Widget`** and select **Pie Chart**.
2. Title the chart **SLO Status**.
3. Choose the **New Relic Service Level** blueprint.
4. Select the **SLO Status** property as `Breakdown by Property` value

   <img src="/img/guides/sloStatusPieChart.png" width="50%" border="1px" />

5. Click **Save**.

</details>

<details>
<summary><b>Services with a Defined SLO Pie Chart</b></summary>

1. Click **`+ Widget`** and select **Pie Chart**.
2. Title the chart **Services with a Defined SLO**.
3. Choose the **New Relic Service** blueprint.
4. Select the **Has SLO** property as `Breakdown by Property` for ser

   <img src="/img/guides/hasSloPieChart.png" width="50%" border="1px" />

5. Click **Save**.

</details>

<details>
<summary><b>Latency SLI Chart</b></summary>

1. Click **`+ Widget`** and select **Line Chart**.
2. Title the chart **Latency SLI**.
3. Choose the **New Relic Service Level** blueprint.
4. Choose an `Entity`
5. Select the **SLI** and **Target Threshold** as `Properties`.
6. Set the time interval to **Day** and the time range to **in the past 90 days**.

   <img src="/img/guides/latencySliChart.png" width="50%" border="1px" />

7. Click **Save**.

</details>

<details>
<summary><b>Success SLI Chart</b></summary>

1. Click **`+ Widget`** and select **Line Chart**.
2. Title the chart **Success SLI**.
3. Choose the **New Relic Service Level** blueprint.
4. Choose an `Entity`
5. Select the **SLI** and **Target Threshold** as `Properties`.
6. Set the time interval to **Day** and the time range to **in the past 90 days**.

   <img src="/img/guides/successSliChart.png" width="50%" border="1px" />
   
7. Click **Save**.

</details>

:::tip Team and organization level
You can use the above steps for both team and an organization level dashboard.
:::

<img src="/img/guides/sloDBVisualization.png" border="1px"/>

<br/><br/>


By following this guide, you have successfully set up dashboards to track your services' SLIs and SLOs. These visualizations provide real-time insights into service performance and compliance, allowing your teams to quickly identify and address underperforming services.

