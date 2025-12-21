---
sidebar_position: 5
title: Usage Dashboard
sidebar_label: Usage dashboard
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Usage dashboard

The usage dashboard provides visibility into how your Port environment is being used across your organization.  
Use these insights to optimize adoption, identify engagement opportunities, and maximize the value your teams get from Port.

The dashboard tracks key metrics across five areas:

- **User activity** - monitor user activation and engagement patterns.
- **Entities** - track catalog growth and entity distribution.
- **Actions & automations** - measure self-service adoption.
- **Data sources** - understand integration usage.
- **AI & MCP** - analyze AI agent and MCP interactions.

:::info Multi-organization support
The dashboard is only available for customers who have completed the migration to the [multi-organization](/sso-rbac/multi-organization) structure.
:::

## Access the dashboard

To access the usage dashboard:

1. Go to the [Builder page](https://app.getport.io/settings/data-model) of your portal.
2. In the left sidebar, select **Usage dashboard**.

## Users activity

The users activity tab provides insights into user adoption and engagement patterns. It is divided into two main sections: [active seats](#active-seats) and [user activity](#user-activity).

### Active seats

This section provides visibility into which users are considered active seats in your Port environment.

**Active seat definition:**  

An active seat is any end user who has logged into the Port platform **3 or more times in 3 different calendar weeks during the subscription term**.

Once someone becomes an active seat, they continue to count as such unless:

- They are removed from the customer's Port environment.
- They are marked as disabled using Port's "User Type" setting or another deactivation option.

The active seats section includes:

- **Total monthly active seats graph** - a time-series graph showing the total number of active users for each month, with trend visualization and month-over-month changes.
- **Activated seats log** - the entire user base that is defined as activated.

### User activity

This section includes metrics that will help you monitor and analyze the activity in Port across your organization.  
It includes:

**Team engagement** - see which teams use Port regularly and which teams require more attention:

- Most engaged teams.
- Least engaged teams.

**Specific user activity** - your most and least engaged users:

- Least engaged users.
- Latest logins (last 7 days).

**Page visits** - your most and least popular pages:

- Popular pages by member users (current month).
- Popular pages by admin users (current month).
- Member page visits during month.
- Admin page visits during month.


## Entities

The entities tab provides visibility into your software catalog growth and composition. It includes:

- **Total monthly entities graph** - shows total entities in each month.
- **Total amount of entities** - the current total number of entities in your catalog.
- **Entities by blueprint** - entities by blueprint displayed in a pie chart form.
- **Entities log by organization** - entities log broken down by organization.

## Actions & automations

The actions and automations tab tracks self-service action and automation usage. It includes:

- **Actions triggered via API + automation triggers (current year)** - the combined total for the current year.

### Automations

Track the usage of automations defined in Port.

- **Total monthly automation runs** - automation runs per month broken down by organization.
- **Automation runs log** - detailed log of automation executions.

### Actions

Track the usage of actions defined in Port.

- **Total monthly actions runs** - action runs per month broken down by organization.
- **Top actions (current month)** - the top 6 most frequently used actions in the current month.
- **Action logs** - provides data about:
  - Total actions by organization.
  - Actions by user breakdown.
  - Actions by role.
  - Actions by team.

## Data sources

The data sources tab provides visibility into your connected integrations. It includes:

- **Total monthly data sources** - total monthly graph showing data sources over time.
- **Data sources total amount** - the current total number of connected data sources.
- **Data sources log** - the type and name per organization, as well as the created date for each data source.

## AI & MCP

Port's AI interfaces provide intelligent assistance across your entire software development lifecycle. All AI features are currently in open beta.

To learn more about AI capabilities in Port, see the [AI interfaces documentation](/ai-interfaces/overview).

The AI and MCP tab provides analytics on AI agent usage and MCP interactions. It includes:

- **Monthly AI interactions** - total monthly AI interactions (any type of source or AI feature) for each month.
- **Monthly MCP calls** - total monthly MCP calls.
- **AI invocation by source** - AI agent invocation by source (AI assistant, agent widget, etc.).
- **AI & MCP usage per user** - detailed breakdown of AI and MCP usage by individual users.

    :::info "Other" category in AI invocations
    The "Other" category in the "AI invocations by source" report refers to AI invocations that didn't include the source key as part of the API call, such as invocations from custom automations or direct API calls.
    :::

## Export data

All tables and visualizations in the usage dashboard can be exported for further analysis.

**Export individual reports:**

To export a specific table or chart:

1. Click the `...` button in the top right corner of any table or chart.
2. Choose the format to download: **CSV**, **XLSX**, or **JSON**.
3. Click **Download**.
4. The file will be downloaded locally in the chosen format.

**Export entire dashboard:**

Additionally, the entire dashboard tab can be downloaded in **PDF format** for comprehensive reporting.

## Limitations

- The dashboard is available to organization admins with enterprise account only.
- The dashboard is static without the ability to change filters.
- Usage data is not currently available via the API.
- Entity count data is available from **November 2025** onwards.
- User activity data is available from **July 2025** onwards.

## FAQs

<details>
<summary><b>Why don't I see the complete history for total monthly entities or user activity? (click to expand)</b></summary>

Historical data availability varies by metric:
- **Entity count data** is available from November 2025 onwards.
- **User activity data** is available from July 2025 onwards.

Data from before these dates is not available in the system.

</details>

<details>
<summary><b>What is the "Other" category in the "AI invocations by source" report? (click to expand)</b></summary>

"Other" refers to AI invocations that didn't include the "source" key as part of the API call. This typically includes invocations from custom automations or direct API calls in your code.

</details>

<details>
<summary><b>Can I filter the dashboard by organization, timeframe, or team? (click to expand)</b></summary>

Currently, the dashboard is static and does not support filtering by organization, timeframe, or team.

As a workaround, you can export the data (CSV, XLSX, or JSON) and apply filters locally using your preferred tools.

</details>

<details>
<summary><b>Is usage data available via API or MCP? (click to expand)</b></summary>

Usage dashboard data is not currently available via API or MCP.

Some related data is available through Port's regular API, such as:
- Data sources list.
- Run history (via the audit log).

</details>
