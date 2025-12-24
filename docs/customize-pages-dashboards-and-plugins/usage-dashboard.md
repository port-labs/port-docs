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

## Dashboard tabs

The usage dashboard is organized into five tabs, each providing specific insights into different aspects of your Port environment usage.

### Users activity

The users activity tab provides insights into user adoption and engagement patterns across your organization. This includes active seats tracking, team engagement metrics, individual user activity, and page visit analytics.

### Entities

The entities tab provides visibility into your software catalog growth and composition. View entity counts over time, distribution across blueprints, and detailed logs by organization.

### Actions & automations

The actions and automations tab tracks self-service action and automation usage across your organization. Monitor automation runs, action executions, and view detailed breakdowns by organization, user, role, team, etc.

### Data sources

The data sources tab provides visibility into your connected integrations. Track the number of data sources over time and view detailed logs including type, name, and creation date per organization.

### AI & MCP

Port's AI interfaces provide intelligent assistance across your entire software development lifecycle.  
Note that all AI features are currently in **open beta**, to learn more about AI capabilities in Port, see the [AI interfaces](/ai-interfaces/overview) documentation.

The AI and MCP tab provides analytics on AI agent usage and MCP interactions. View monthly interaction trends, invocation sources, and usage per user.

:::info "Other" category in AI invocations
The "Other" category in the "AI invocations by source" report refers to AI invocations that didn't include the source key as part of the API call, such as invocations from custom automations or direct API calls.
:::

## Export data

All tables and visualizations in the usage dashboard can be exported for further analysis.

**Export individual reports:**

To export a specific table or chart:

1. Click the `...` button in the top right corner of any table or chart.
2. Click **Download results**.
3. Choose the format to download: **csv**, **xlsx**, or **json**.
4. Click **Download**.
5. The file will be downloaded locally in the chosen format.

**Export entire dashboard:**

To export the entire dashboard tab:

1. Click on the download button in the top right corner of the usage dashboard window.
2. The dashboard will be downloaded in PDF format.

## Limitations

- The dashboard is only available for customers who have completed the migration to the [multi-organization](/sso-rbac/multi-organization) structure.
- The dashboard is available to organization admins with enterprise account only.
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
