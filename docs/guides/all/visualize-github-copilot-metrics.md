---
displayed_sidebar: null
description: Learn how to create dashboards to monitor GitHub Copilot usage, track acceptance rates, and measure team productivity.
---

# Visualize GitHub Copilot metrics

This guide demonstrates how to set up a monitoring dashboard to gain insights into your GitHub Copilot usage using Port. You'll learn how to visualize key metrics like acceptance rates, active users, chat productivity, and track team adoption over time.

<img src="/img/ai-agents/copilotDashboard.png" border="1px" width="100%" />

## Common use cases

- Monitor Copilot usage trends and adoption across teams.
- Track code suggestion acceptance rates to measure productivity gains.
- Analyze chat productivity and user engagement with Copilot.
- Report on ROI of GitHub Copilot investment to leadership.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [GitHub Copilot integration](/build-your-software-catalog/sync-data-to-catalog/ai-agents/github-copilot/) is installed and syncing data.

## Create the dashboard

1. Navigate to your [software catalog](https://app.getport.io/organization/catalog).

2. Click on the **`+ New`** button in the left sidebar.

3. Select **New dashboard**.

4. Name the dashboard **Copilot Insights**.

5. Input `Monitor Copilot usage and performance metrics across teams` under **Description**.

6. Select the `Github` icon.

7. Click **Create**.

You now have a blank dashboard where you can add widgets to visualize your GitHub Copilot metrics.

## Add widgets

Create the following widgets to gain insights into your GitHub Copilot usage:

### Total active users widget

<details>
<summary><b>Total active users (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Number Chart**.

2. Fill in the following details:
   - **Title**: `Total Active Users (Avg)`.
   - **Description**: `Average number of active users using Copilot per day`.
   - **Icon**: `Users`.
   - **Blueprint**: `github_copilot_usage`.
   - **Chart type**: Select `Aggregate by property`.
   - **Property**: `total_active_users`.
   - **Function**: `Average`.
   - **Average of**: `day`.
   - **Measure time by**: `createdAt`.
   - **Custom unit**: `users`.

3. Click **Save**.

</details>

### Overall acceptance rate widget

<details>
<summary><b>Overall acceptance rate (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Number Chart**.

2. Fill in the following details:
   - **Title**: `Overall Acceptance Rate (%)`.
   - **Description**: `How often Copilot suggestions are accepted`.
   - **Icon**: `metric`.
   - **Blueprint**: `github_copilot_usage`.
   - **Chart type**: Select `Aggregate by property`.
   - **Property**: `acceptance_rate`.
   - **Function**: `Average`.
   - **Average of**: `total`.
   - **Unit**: `%`.

3. Click **Save**.

</details>

### Total suggestions generated widget

<details>
<summary><b>Total suggestions generated (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Number Chart**.

2. Fill in the following details:
   - **Title**: `Total Suggestions Generated`.
   - **Description**: `Average suggested lines of code per day`.
   - **Blueprint**: `github_copilot_usage`.
   - **Chart type**: Select `Aggregate by property`.
   - **Property**: `total_lines_suggested`.
   - **Function**: `Average`.
   - **Average of**: `day`.
   - **Measure time by**: `createdAt`.
   - **Custom unit**: `suggested lines of code`.

3. Click **Save**.

</details>

### Chat productivity widget

<details>
<summary><b>Chat productivity (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Number Chart**.

2. Fill in the following details:
   - **Title**: `Chat Productivity`.
   - **Description**: `Average chat turns per day`.
   - **Icon**: `Chat`.
   - **Blueprint**: `github_copilot_usage`.
   - **Chart type**: Select `Aggregate by property`.
   - **Property**: `total_chat_turns`.
   - **Function**: `Average`.
   - **Average of**: `day`.
   - **Measure time by**: `createdAt`.
   - **Custom unit**: `chats`.

3. Click **Save**.

</details>

### Usage by team widget

<details>
<summary><b>Usage by team (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Pie Chart**.

2. Fill in the following details:
   - **Title**: `Usage by Team`.
   - **Description**: `Contribution of each team to copilot usage`.
   - **Icon**: `Pie`.
   - **Blueprint**: `github_copilot_usage`.
   - **Breakdown by Property**: `github_team`.

3. Click **Save**.

</details>

### Acceptance rate over time widget

<details>
<summary><b>Acceptance rate over time (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Line Chart**.

2. Fill in the following details:
   - **Title**: `Acceptance Rate Over Time`.
   - **Description**: `See quality improvements (or declines) over time`.
   - **Icon**: `LineChart`.
   - **Blueprint**: `github_copilot_usage`.
   - **Chart type**: Select `Aggregate properties(All Entities)`.
   - **Properties**: `total_acceptances_count`.
   - **Function**: `average`.
   - **Time interval**: `Week`.
   - **Time range**: `In the past 30 days`.
   - **Measure time by**: `createdAt`.

3. Click **Save**.

</details>

### Active users over time widget

<details>
<summary><b>Active users over time (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Line Chart**.

2. Fill in the following details:
   - **Title**: `Active Users Over Time`.
   - **Description**: `Shows if team usage is growing`.
   - **Icon**: `LineChart`.
   - **Blueprint**: `github_copilot_usage`.
   - **Chart type**: Select `Aggregate properties(All Entities)`.
   - **Properties**: `total_active_users`, `total_active_chat_users`.
   - **Function**: `average`.
   - **Time interval**: `Week`.
   - **Time range**: `In the past 30 days`.
   - **Measure time by**: `createdAt`.

3. Click **Save**.

</details>

### Chat productivity over time widget

<details>
<summary><b>Chat productivity over time (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Line Chart**.

2. Fill in the following details:
   - **Title**: `Chat Productivity Over Time`.
   - **Description**: `Reveals growing reliance on Copilot Chat`.
   - **Icon**: `LineChart`.
   - **Blueprint**: `github_copilot_usage`.
   - **Chart type**: Select `Aggregate properties(All Entities)`.
   - **Properties**: `total_chat_turns`, `total_chat_acceptances`.
   - **Function**: `average`.
   - **Time interval**: `Week`.
   - **Time range**: `In the past 30 days`.
   - **Measure time by**: `createdAt`.

3. Click **Save**.

</details>

### Total suggestions vs. acceptances over time widget

<details>
<summary><b>Total suggestions vs. acceptances over time (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Line Chart**.

2. Fill in the following details:
   - **Title**: `Total Suggestions vs. Acceptances Over Time`.
   - **Description**: `How Copilot suggestions and acceptances change over time to track usage and engagement`.
   - **Icon**: `LineChart`.
   - **Blueprint**: `github_copilot_usage`.
   - **Chart type**: Select `Aggregate properties(All Entities)`.
   - **Properties**: `total_suggestions_count`, `total_acceptances_count`.
   - **Function**: `average`.
   - **Time interval**: `Week`.
   - **Time range**: `In the past 30 days`.
   - **Measure time by**: `createdAt`.

3. Click **Save**.

</details>

