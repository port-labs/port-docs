---
displayed_sidebar: null
description: Learn how to monitor Wiz issues and gain security insights using dashboards.
---

# Visualize your Wiz security issues

This guide demonstrates how to set up a monitoring solution to gain visibility into security issues from your Wiz account.  
We will see how to visualize vulnerabilities across your projects and track them over time using Port's **Wiz** integration.

<img src="/img/guides/wizVulnDashboard.png" border="1px" width="100%" />
<img src="/img/guides/wizVulnDashboard2.png" border="1px" width="100%" />


## Common use cases

- Monitor open and resolved Wiz issues across projects.
- Understand the distribution of issues by severity and status.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [Wiz integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/code-quality-security/wiz) is installed in your account.


## Visualize metrics

Once the Wiz data is synced to the catalog, we can create a dedicated dashboard in Port to monitor and analyze vulnerabilities using customizable widgets.

### Create a dashboard

1. Navigate to your [software catalog](https://app.getport.io/organization/catalog).
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **Wiz Security Insight**.
5. Select the `Wiz` icon.
6. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize insights from the Wiz issues.

### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Issue by severity (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Issue by severity`.
3. Choose the **Wiz Issue** blueprint.
4. Under `Breakdown by property`, select the **Severity** property 
   <img src="/img/guides/wizIssueSeverityPieChart.png" width="50%" />

5. Click **Save**.

</details>

<details>
<summary><b>Issue by status (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Issue by status`.
3. Choose the **Wiz Issue** blueprint.
4. Under `Breakdown by property`, select the **Status** property 
   <img src="/img/guides/wizIssueStatusPieChart.png" width="50%" />

5. Click **Save**.

</details>

<details>
<summary><b> Total number of issues (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Total issues`.
3. Select `Count entities` **Chart type** and choose **Wiz Issue** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Select `custom` as the **Unit** and input `issues` as the **Custom unit**.

   <img src="/img/guides/totalWizIssues.png" width="50%"/>

6. Click `Save`.

</details>


<details>
<summary><b>Open issue created in the last 6 months (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Open issues` (add the `Alert` icon).
3. Select `Count entities` **Chart type** and choose **Wiz Issue** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter `OPEN` issues created in the last 6 months:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"status",
                    "operator":"=",
                    "value":"OPEN"
                },
                {
                    "property":"createdAt",
                    "operator":"between",
                    "value":{
                    "preset":"last6Months"
                    }
                }
            ]
        }
    ]
    ```
   <img src="/img/guides/openWizIssues.png" width="50%"/>

6. Click `Save`.

</details>

<details>
<summary><b>Resolved issues (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Resolved issues`.
3. Select `Count entities` **Chart type** and choose **Wiz Issue** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter `RESOLVED` issues:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"status",
                    "operator":"=",
                    "value":"RESOLVED"
                }
            ]
        }
    ]
    ```
   <img src="/img/guides/resolvedWizIssues.png" width="50%"/>

6. Click `Save`.

</details>

<details>
<summary><b>Open critical issues (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Open critical issues`.
3. Select `Count entities` **Chart type** and choose **Wiz Issue** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter `OPEN` and `CRITICAL` issues:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"status",
                    "operator":"=",
                    "value":"OPEN"
                },
                {
                    "property":"severity",
                    "operator":"=",
                    "value":"CRITICAL"
                }
            ]
        }
    ]
    ```
   <img src="/img/guides/openCriticalIssues.png" width="50%"/>

6. Click `Save`.

</details>