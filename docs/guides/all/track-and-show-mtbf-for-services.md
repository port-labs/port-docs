---
displayed_sidebar: null
description: Track Mean Time Between Failures (MTBF) for your Pagerduty services to measure reliability and identify improvement opportunities
---

import PagerDutyServiceBlueprint from '/docs/guides/templates/pagerduty/_pagerduty_service_blueprint.mdx'
import PagerDutyIncidentBlueprint from '/docs/guides/templates/pagerduty/_pagerduty_incident_blueprint.mdx'
import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'

# Track and show MTBF for services

This guide demonstrates how to implement **Mean Time Between Failures (MTBF)** tracking for your PagerDuty services using Port's. 
You will learn how to calculate, visualize, and monitor MTBF metrics to improve service reliability.


**MTBF (Mean Time Between Failures)** measures the average operational time between successive failures of a service.   
Unlike MTTR which shows how fast you recover from incidents, MTBF shows how often failures occur - making it a critical reliability metric.


**Mean Time Between Failures** = **Total Operational Time** / **Number of Failures**. That is, if a service runs for **720** hours and experiences **3** incidents, the **MTBF** is **240** hours. Higher **MTBF** values indicate better reliability and fewer incidents and vice versa.

<img src="/img/guides/mtbfDashboard.png" border="1px" width="100%" />


:::info Other incident management tools
While this guide focuses on PagerDuty, the same MTBF tracking principles and Port capabilities work with other incident management tools like **Opsgenie**, **StatusPage**, **Datadog**, and **custom incident tracking systems**.
:::

## Common use cases

- **Reliability monitoring**: Track how often your services fail and identify patterns over time.
- **SLA compliance**: Monitor service reliability against defined targets and SLAs.  
- **Incident reduction**: Identify the most unreliable services that need improvement focus.
- **Team accountability**: Track reliability metrics by team and service ownership.
- **Capacity planning**: Use historical failure patterns to inform infrastructure decisions.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](/getting-started/overview).
- Port's [PagerDuty integration](/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty) is installed in your account.
- Access to your PagerDuty organization with incident data for your services.


## Set up data model

If you haven't installed the [PagerDuty integration](/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty), you'll need to create blueprints for PagerDuty services and incidents.  
However, we highly recommend installing the [PagerDuty integration](/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty) to have these automatically set up for you.

### Create PagerDuty service blueprint


1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.

2. Click on `+ Blueprint`.

3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.

4. Add this JSON schema:

    <PagerDutyServiceBlueprint />

5. Click `Save`.



### Create PagerDuty incident blueprint  


1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.

2. Click on `+ Blueprint`.

3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.

4. Add this JSON schema:

    <PagerDutyIncidentBlueprint />

5. Click `Save`.



### Add aggregation properties

First, we need to add aggregation properties to count incidents over different time periods. 
These properties will count the number of PagerDuty incidents related to each service within specific time windows.

Follow the steps below to add aggregation properties to the PagerDuty Service blueprint:

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.

2. Click on the **PagerDuty Service** blueprint.

3. Click on the `...` button in the top right corner, and choose `Edit JSON`.

4. Add these aggregation properties to the blueprint JSON:

    <details>
    <summary><b>Incident count aggregation properties (click to expand)</b></summary>

    ```json showLineNumbers
      "incidents30Days": {
        "title": "Incidents (30 days)",
        "icon": "Alert",
        "description": "Number of incidents in the last 30 days",
        "target": "pagerdutyIncident",
        "calculationSpec": {
          "func": "count",
          "calculationBy": "entities",
          "filter": {
            "combinator": "and",
            "rules": [
              {
                "operator": ">=",
                "property": "created_at",
                "value": "{{(now - 2592000) | strftime(\"%Y-%m-%dT%H:%M:%SZ\")}}"
              }
            ]
          }
        },
        "type": "number"
      },
      "incidents90Days": {
        "title": "Incidents (90 days)",
        "icon": "Alert",
        "description": "Number of incidents in the last 90 days",
        "target": "pagerdutyIncident",
        "calculationSpec": {
          "func": "count",
          "calculationBy": "entities",
          "filter": {
            "combinator": "and",
            "rules": [
              {
                "operator": ">=",
                "property": "created_at",
                "value": "{{(now - 7776000) | strftime(\"%Y-%m-%dT%H:%M:%SZ\")}}"
              }
            ]
          }
        },
        "type": "number"
      }
    ```
    </details>

5. Click `Save` to update the blueprint.

:::info Understanding aggregation properties
Aggregation properties automatically count or aggregate data from related entities. In this case, they count PagerDuty incidents that are related to each service and filter them by creation date to get incident counts for the last 30 and 90 days.
:::

### Add MTBF calculation properties

Now we'll add calculation properties that use the aggregation properties to automatically compute MTBF metrics for each service:

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.

2. Click on the **PagerDuty Service** blueprint.

3. Click on the `...` button in the top right corner, and choose `Edit JSON`.

4. Add these calculation properties to the blueprint JSON:
    <details>
    <summary><b>MTBF calculation properties (click to expand)</b></summary>

      ```json showLineNumbers
      "mtbf30Days": {
        "title": "MTBF (30 days)",
        "icon": "ClockLoader",
        "description": "Mean Time Between Failures over the past 30 days (in hours)",
        "calculation": "if .properties.incidents30Days > 0 then (30 * 24) / .properties.incidents30Days else null end",
        "type": "number"
      },
      "mtbf90Days": {
        "title": "MTBF (90 days)",
        "icon": "ClockLoader", 
        "description": "Mean Time Between Failures over the past 90 days (in hours)",
        "calculation": "if .properties.incidents90Days > 0 then (90 * 24) / .properties.incidents90Days else null end",
        "type": "number"
      }
      ```
   </details>

2. Click `Save` to update the blueprint.


### Add MTBF target and threshold properties

Before creating self-service actions, we need to add properties for storing MTBF targets and alert thresholds:

1. Still in the **PagerDuty Service** blueprint JSON, add these properties to the `properties` section:

    <details>
    <summary><b>MTBF target and threshold properties (click to expand)</b></summary>

    ```json showLineNumbers
    "mtbfTarget": {
      "title": "MTBF Target (hours)",
      "type": "number",
      "description": "Target mean time between failures in hours"
    },
    "mtbfCriticalThreshold": {
      "title": "Critical Threshold (%)",
      "type": "number",
      "description": "Percentage below target that triggers critical alert",
      "default": 50
    },
    "mtbfWarningThreshold": {
      "title": "Warning Threshold (%)", 
      "type": "number",
      "description": "Percentage below target that triggers warning",
      "default": 75
    }
    ```
    </details>

2. Click `Save` to update the blueprint.



## Set up self-service actions

Now let's create self-service actions to help teams monitor and improve MTBF for their services.

<h3> Add Port secrets </h3>

<ExistingSecretsCallout integration="PagerDuty" />

First, add the required secrets to your portal:

1. Click on the `...` button in the top right corner of your Port application.

2. Click on **Credentials**.

3. Click on the `Secrets` tab.

4. Click on `+ Secret` and add the following secret:
   - `PAGERDUTY_API_KEY`: Your PagerDuty API token



### Set reliability target action

Create an action to set MTBF targets for services:


1. Click on the `+ New Action` button.

2. Click on the `{...} Edit JSON` button.

3. Copy and paste the following JSON configuration:

    <details>
    <summary><b>Set reliability target action (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "set_mtbf_target",
      "title": "Set MTBF Target", 
      "icon": "Pagerduty",
      "description": "Set reliability targets and thresholds for the service",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "mtbfTarget": {
              "title": "MTBF Target (hours)",
              "type": "number",
              "description": "Target mean time between failures in hours"
            },
            "criticalThreshold": {
              "title": "Critical Threshold (%)",
              "type": "number", 
              "description": "Percentage below target that triggers critical alert",
              "default": 50
            },
            "warningThreshold": {
              "title": "Warning Threshold (%)",
              "type": "number",
              "description": "Percentage below target that triggers warning",
              "default": 75
            }
          },
          "required": ["mtbfTarget"],
          "order": ["mtbfTarget", "criticalThreshold", "warningThreshold"]
        },
        "blueprintIdentifier": "pagerdutyService"
      },
      "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "pagerdutyService",
        "mapping": {
          "identifier": "{{.entity.identifier}}",
          "properties": {
            "mtbfTarget": "{{.inputs.mtbfTarget}}",
            "mtbfCriticalThreshold": "{{.inputs.criticalThreshold}}",
            "mtbfWarningThreshold": "{{.inputs.warningThreshold}}"
          }
        }
      },
      "requiredApproval": false
    }
    ```
    </details>

4. Click `Save`.

## Create MTBF monitoring automation

Set up an automation to monitor MTBF thresholds and trigger alerts:

1. Head to the [automation](https://app.getport.io/settings/automations) page.

2. Click on the `+ Automation` button.

3. Copy and paste the following JSON configuration:

    <details>
    <summary><b>MTBF threshold monitoring automation (click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "mtbf_threshold_monitor",
      "title": "MTBF Threshold Monitor",
      "description": "Monitor MTBF values against set thresholds and trigger alerts",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "pagerdutyService"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.after.properties.mtbf30Days",
            ".diff.after.properties.mtbfTarget",
            "(.diff.after.properties.mtbf30Days / .diff.after.properties.mtbfTarget * 100) < .diff.after.properties.mtbfCriticalThreshold"
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://events.pagerduty.com/v2/enqueue",
        "method": "POST",
        "headers": {
          "Content-Type": "application/json"
        },
        "body": {
          "routing_key": "{{.secrets.PAGERDUTY_ROUTING_KEY}}",
          "event_action": "trigger",
          "payload": {
            "summary": "MTBF Critical Threshold Breached: {{.event.diff.after.title}}",
            "source": "Port MTBF Monitor",
            "severity": "critical",
            "custom_details": {
              "service": "{{.event.diff.after.title}}",
              "current_mtbf": "{{.event.diff.after.properties.mtbf30Days}}",
              "target_mtbf": "{{.event.diff.after.properties.mtbfTarget}}",
              "threshold_breached": "Critical"
            }
          }
        }
      },
      "publish": true
    }
    ```
    </details>

4. Click `Save`.

## Visualize MTBF metrics

Create a comprehensive dashboard to monitor MTBF across all your services.

### Create MTBF dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page.

2. Click on the **`+ New`** button in the left sidebar.

3. Select **New dashboard**.

4. Name the dashboard **Service Reliability (MTBF) Monitoring**.

5. Input `Track and monitor Mean Time Between Failures for all services` under **Description**.

6. Select the `pagerduty` icon.

7. Click `Create`.

### Add MTBF widgets

Create the following widgets in your new dashboard:

<details>
<summary><b>MTBF overview widget (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Number Chart**.

2. Title: `Average MTBF (30 days)` (add the `pagerduty` icon)

3. Select `Aggregate Property (All Entities)` chart type and choose **PagerDuty Service** blueprint.

4. Choose `MTBF (30 days)` property and `average` function.

5. Set custom unit to `hours`.

6. Click `Save`.

</details>

<details>
<summary><b>Services by MTBF trend widget (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.

2. Title: `Services by MTBF Trend` (add the `TrendingUp` icon)

3. Choose the **PagerDuty Service** blueprint.

4. Under `Breakdown by property`, select **MTBF Trend**.

5. Click `Save`.

</details>

<details>
<summary><b>Low MTBF services widget (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.

2. Title: `Services Requiring Attention` (add the `Alert` icon)

3. Choose the **PagerDuty Service** blueprint.

4. Add this filter to show services with declining MTBF:
   ```json showLineNumbers
   [
     {
       "combinator": "or",
       "rules": [
         {
           "property": "mtbfTrend", 
           "operator": "=",
           "value": "degrading"
         },
         {
           "property": "mtbf30Days",
           "operator": "<",
           "value": 72
         }
       ]
     }
   ]
   ```

5. Customize the table to show: Service Name, MTBF (30 days), MTBF (90 days), MTBF Trend.

6. Click `Save`.

</details>

<details>
<summary><b>MTBF vs target compliance widget (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Bar Chart**.

2. Title: `MTBF Target Compliance` (add the `Target` icon)

3. Select `Aggregate Property (All Entities)` and choose **PagerDuty Service** blueprint.

4. Set Y-axis to `MTBF (30 days)` property with `average` function.

5. Set X-axis to group by service name.

6. Click `Save`.

</details>

<details>
<summary><b>Historical MTBF trends widget (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Line Chart**.

2. Title: `MTBF Trends Over Time` (add the `LineChart` icon)

3. Select `Aggregate Property (All Entities)` and choose **PagerDuty Service** blueprint.

4. Y-axis: `MTBF (30 days)` property with `average` function.

5. X-axis: Group by `updated_at` with `Month` interval.

6. Set time range to `In the past 365 days`.

7. Click `Save`.

</details>

## Let's test it!

1. **Verify MTBF calculations:**
   - Navigate to your [PagerDuty Service catalog](https://app.getport.io/organization/catalog) 
   - Open any service and check that MTBF values are populated
   - Verify the MTBF trend shows the correct status

2. **Test the Generate MTBF Report action:**
   - Go to a service with incident history
   - Click `Generate MTBF Report`
   - Select a time range and execute the action
   - Review the detailed service information returned

3. **Set reliability targets:**
   - Click `Set MTBF Target` on a critical service
   - Set an appropriate target (e.g., 168 hours for weekly failures)
   - Configure warning (75%) and critical (50%) thresholds

4. **Monitor the dashboard:**
   - Open your **Service Reliability (MTBF) Monitoring** dashboard
   - Review services requiring attention
   - Check MTBF trends and target compliance

## Best practices

- **Set realistic targets**: Base MTBF targets on historical performance and business requirements
- **Monitor trends**: Focus on trend direction rather than absolute values - improving trends indicate better reliability
- **Investigate degrading services**: Services with declining MTBF need immediate attention and investigation
- **Regular review**: Schedule weekly reviews of MTBF metrics with engineering teams
- **Combine with MTTR**: Use MTBF alongside MTTR metrics for comprehensive reliability monitoring

## Related guides

- **[Manage and visualize your PagerDuty incidents](/guides/all/manage-and-visualize-pagerduty-incidents)**: Complete incident management with PagerDuty
- **[Track SLOs and SLIs for services](/guides/all/track-slos-and-slis-for-services)**: Implement comprehensive service level monitoring  
- **[Acknowledge Incident In PagerDuty](/guides/all/acknowledge-incident)**: Handle incident acknowledgment workflows
- **[Resolve an Incident in PagerDuty](/guides/all/resolve-incident)**: Manage incident resolution processes 