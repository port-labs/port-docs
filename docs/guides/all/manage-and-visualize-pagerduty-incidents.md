---
displayed_sidebar: null
description: Learn how to manage your PagerDuty incidents with self-service actions and monitor them using dashboards in Port.
---

import PagerDutyIncidentBlueprint from '/docs/guides/templates/pagerduty/_pagerduty_incident_blueprint.mdx'

# Manage and visualize your PagerDuty incidents

This guide demonstrates how to bring your incident management experience into Port using PagerDuty. You will learn how to:

- Set up **self-service actions** to manage incidents (trigger, acknowledge, and resolve).
- Ingest incident data into Port's software catalog using **Port's PagerDuty** integration.
- Build **dashboards** in Port to monitor and take action on your incident response.

<img src="/img/guides/pagerDutyDashboard1.png" border="1px" width="100%" />

## Common use cases

- Empower on-call teams to quickly respond to incidents with self-service actions.
- Monitor the status and health of all incidents across services from a single dashboard.
- Track incident metrics and response times to improve incident management processes.
- Get visibility into incident trends and patterns across your organization.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [PagerDuty integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty) is installed in your account.
- Access to your PagerDuty organization with permissions to manage incidents.

## Set up data model

When installing the PagerDuty integration in Port, the `PagerDuty Incident` blueprint is created automatically along with other PagerDuty resources like services and escalation policies.

If you haven't installed the PagerDuty integration, you'll need to create the blueprint manually:

### Create the PagerDuty incident blueprint

<PagerDutyIncidentBlueprint />

## Set up self-service actions

Now let's set up self-service actions to manage your PagerDuty incidents directly from Port. We'll implement three key incident management workflows:

### Trigger incidents

Create incidents directly from Port when issues are detected.

:::info Complete guide available
For detailed implementation instructions, see our comprehensive guide:
**[Trigger a PagerDuty Incident](/guides/all/trigger-pagerduty-incident)**

This guide covers both webhook and GitHub workflow implementations with step-by-step setup instructions.
:::

### Acknowledge incidents

Quickly acknowledge incidents to signal that someone is working on the issue.

:::info Complete guide available
For detailed implementation instructions, see our comprehensive guide:
**[Acknowledge Incident In PagerDuty](/guides/all/acknowledge-incident)**

This guide covers both webhook and GitHub workflow implementations with automatic entity updates.
:::

### Resolve incidents

Mark incidents as resolved once the underlying issue has been fixed.

:::info Complete guide available
For detailed implementation instructions, see our comprehensive guide:
**[Resolve an Incident in PagerDuty](/guides/all/resolve-incident)**

This guide covers both webhook and GitHub workflow implementations with status synchronization.
:::

## Test your incident management

1. **Trigger an incident**: Go to the [self-service page](https://app.getport.io/self-serve) and test the trigger incident action with sample data.

2. **Acknowledge the incident**: From the incident catalog page, click on an incident and use the acknowledge action.

3. **Resolve the incident**: Finally, use the resolve action to close the incident and complete the workflow.

4. **Monitor the process**: Watch how incidents flow through the different states and how actions update the incident status.

## Visualize metrics

With your incident management actions in place and data flowing, we can create a dedicated dashboard in Port to visualize all incidents by status, urgency, or service using customizable widgets. The dashboard will also allow you to trigger actions directly from the interface.

### Create a dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **PagerDuty Incident Management**.
5. Input `Monitor and manage your PagerDuty incidents` under **Description**.
6. Select the `PagerDuty` icon.
7. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize insights from our PagerDuty incidents.

### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Incidents by status (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Incidents by status` (add the `PagerDuty` icon).
3. Choose the **PagerDuty Incident** blueprint.
4. Under `Breakdown by property`, select the **Status** property
    <img src="/img/guides/pagerDutyByStatus.png" width="50%" />

5. Click **Save**.

</details>

<details>
<summary><b>Incidents by urgency (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Incidents by urgency` (add the `PagerDuty` icon).
3. Choose the **PagerDuty Incident** blueprint.
4. Under `Breakdown by property`, select the **Urgency** property
   <img src="/img/guides/pagerDutyByUrgency.png" width="50%" />

5. Click **Save**.

</details>

<details>
<summary><b>Open incidents (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Open incidents` (add the `Alert` icon).
3. Select `Count entities` **Chart type** and choose **PagerDuty Incident** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter open incidents:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"status",
                    "operator":"in",
                    "value":["triggered", "acknowledged"]
                }
            ]
        }
    ]
    ```
6. Select `custom` as the **Unit** and input `incidents` as the **Custom unit**
   <img src="/img/guides/openPagerDutyIncidents.png" width="50%"/>

7. Click `Save`.

</details>

<details>
<summary><b>Resolved incidents (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Resolved incidents` (add the `BadgeAlert` icon).
3. Select `Count entities` **Chart type** and choose **PagerDuty Incident** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter resolved incidents:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"status",
                    "operator":"=",
                    "value":"resolved"
                }
            ]
        }
    ]
    ```
   <img src="/img/guides/resolvedPagerDutyIncidents.png" width="50%"/>

6. Click `Save`.

</details>

<details>
<summary><b>Average resolution time over time (click to expand)</b></summary>

1. Click `+ Widget` and select **Line Chart**.
2. Title: `Average Resolution Time Over Time`, (add the `LineChart` icon).
3. Select `Aggregate Property (All Entities)` **Chart type** and choose **PagerDuty Incident** as the **Blueprint**.
4. Input `Resolution Time (hours)` as the **Y axis** **Title** and choose `Resolution Time` as the **Property**.
5. Set `average` as the **Function**.
6. Input `Months` as the **X axis** **Title** and choose `created_at` as the **Measure time by**.
7. Set **Time Interval** to `Month` and **Time Range** to `In the past 365 days`.
8. Add this JSON to the **Additional filters** editor to only include resolved incidents:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"status",
                    "operator":"=",
                    "value":"resolved"
                }
            ]
        }
    ]
    ```

   <img src="/img/guides/avgResolutionTimeChart.png"  width="50%"/>

9. Click `Save`.

</details>

<details>
<summary><b>Critical incidents this month (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Critical incidents this month` (add the `Alert` icon).
3. Select `Count entities` **Chart type** and choose **PagerDuty Incident** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter critical incidents from this month:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"urgency",
                    "operator":"=",
                    "value":"high"
                },
                {
                    "property":"created_at",
                    "operator":"between",
                    "value":{
                        "preset":"thisMonth"
                    }
                }
            ]
        }
    ]
    ```
6. You may optionally configure **conditional formatting** to contextualize the numbers on the widget.

   <img src="/img/guides/criticalIncidentsThisMonth.png" width="50%"/>

7. Click `Save`.

</details>

<details>
<summary><b>All incidents table (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **All Incidents**.
3. Choose the **PagerDuty Incident** blueprint

   <img src="/img/guides/allPagerDutyIncidents.png" width="50%" />

4. Click **Save** to add the widget to the dashboard.
5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
6. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Status**: The current status of the incident.
    - **Urgency**: The urgency level of the incident.
    - **Service**: The name of the related PagerDuty service.
    - **Responder**: The person assigned to the incident.
    - **Created At**: When the incident was created.
7. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

### Test your complete setup

1. **View the dashboard**: Navigate to your PagerDuty Incident Management dashboard to see incidents and metrics.

2. **Trigger actions from dashboard**: From the incident table widget, click on an incident and use the acknowledge or resolve actions directly.

3. **Monitor real-time updates**: Watch the dashboard widgets update as you perform actions on incidents.

4. **Track trends over time**: Over time, your dashboard will show incident trends, helping you identify patterns and improve your incident response.

## Related guides

- **[Trigger a PagerDuty Incident](/guides/all/trigger-pagerduty-incident)**: Complete guide for creating incidents
- **[Acknowledge Incident In PagerDuty](/guides/all/acknowledge-incident)**: Complete guide for acknowledging incidents  
- **[Resolve an Incident in PagerDuty](/guides/all/resolve-incident)**: Complete guide for resolving incidents
- **[Change On-Call User](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/change-on-call-user)**: Change who's on-call for a service
- **[Escalate an incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/escalate-an-incident)**: Escalate incidents when needed
- **[Create PagerDuty service](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/create-pagerduty-service)**: Create new PagerDuty services 