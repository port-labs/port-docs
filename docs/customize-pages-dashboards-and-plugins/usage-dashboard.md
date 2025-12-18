---
sidebar_position: 5
title: Usage Dashboard
sidebar_label: Usage dashboard
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Usage dashboard

The usage dashboard provides visibility into how your Port environment is being used across your organization. Use these insights to optimize adoption, identify engagement opportunities, and maximize the value your teams get from Port.

The dashboard tracks key metrics across five areas:

- **User activity** - monitor user activation and engagement patterns.
- **Entities** - track catalog growth and entity distribution.
- **Actions & automations** - measure self-service adoption.
- **Data sources** - understand integration usage.
- **AI usage** - analyze AI agent and MCP interactions.

:::info Multi-organization support
All data in the usage dashboard is displayed at the company level across all organizations under your company. The dashboard is only available for customers who have completed the migration to [multi-organization](/sso-rbac/multi-organization).

Each table provides total aggregated data, with detailed breakdowns by organization available in the raw data tables. This allows you to view organization-specific metrics when needed.
:::

## Access the dashboard

To access the usage dashboard:

1. Go to the [Builder page](https://app.getport.io/settings/data-model) of your portal.
2. In the left sidebar, select **Usage dashboard**.

## Users activity

The users activity tab provides insights into user adoption and engagement patterns. It is divided into two main sections: **activated users** and **user activity**.

### Activated users

This section tracks user activation based on Port's activation criteria and provides historical trends.

:::tip Activated user definition
An activated user is defined as someone who has logged into Port **3 or more times across 3 different calendar weeks**. This metric helps measure meaningful user engagement beyond one-time logins.
:::

The activated users section includes:

**Total monthly activated users graph:**

A time-series graph showing the total number of activated users for each month:

- Total count of activated users per month.
- Trend visualization to track growth or decline.
- Month-over-month changes to identify patterns.

**Activated user log:**

The entire user base that is defined as activated.

:::tip Export reports
All reports can be exported by clicking the **...** button in the top right corner of each table or chart. Data will be exported locally in CSV format for further analysis.
:::

### User activity

This section provides detailed engagement metrics divided into team engagement, specific user activity, and page visits.

**Team engagement:**

View the most and least engaged teams in each month.

**Most engaged teams:**

- Team name.
- Month.
- Daily login in each team.
- Difference from the previous month.

**Least engaged teams:**

- Team name.
- Month.
- Daily login in each team.
- Difference from the previous month.

**User activity tables:**

Two key tables show user login patterns:

- **Inactive users** - users who haven't logged in for 3 or more months.
- **Latest logins** - users who have logged in within the last 7 days.

**Popular pages:**

Shows the most frequently accessed pages, separated by:

- Popular pages used by members.
- Popular pages used by admins.

## Entities

The entities tab provides visibility into your software catalog growth and composition.

:::info Historical data availability
Entity count historical data is only available from **November 2025 onwards**.
:::

### Total monthly entities

**Total monthly entities graph:**

- Total entities in each month.
- Current total entities count.

### Entities by blueprint

Entities by blueprint in a pie chart form.

### Entities by data source and blueprint

Each blueprint, data source entities, and the difference from the previous month.

## Actions and automations

The actions and automations tab tracks self-service action and automation usage.

### Overview metric

The current number of actions triggered via API + all automation triggers.

### Automations

**Total monthly automations:**

Total monthly automations and the details broken down by the different organizations.

### Actions

**Total monthly actions:**

Total monthly actions broken down by the different organizations.

**Top actions:**

The top 6 most frequently used actions.

**Actions log:**

Provides data about total actions, actions by user, and also by role and team.

## Data sources

### Total monthly data sources

Total monthly graph and the current total.

### Data sources log

The type and name per organization, as well as the created date for each data source.

## AI and MCP

### Total monthly AI interactions

Total monthly AI interactions (any type of source or AI feature) for each month.

### AI agent invocation by source

AI agent invocation by source (AI assistant, agent widget, etc.).

### AI invocation by agent type

AI invocation by agent type.

### Total monthly MCP calls

Total monthly MCP calls.

### AI agent invocation details

**AI agent invocation by source and organization:**

Raw data about the AI agent invocation number by source by organization.

**AI agent invocation by user and type:**

AI agent invocation by user and type.

## Export and reporting

All tables and visualizations in the usage dashboard can be exported:

1. Click the **...** button in the top right corner of any table or chart.
2. Select **Export to CSV**.
3. The file will be downloaded locally.

## Related resources

- [Manage users and teams](/sso-rbac/users-and-teams/manage-users-teams).
- [Multi-organization](/sso-rbac/multi-organization).
- [Ownership](/sso-rbac/ownership).
