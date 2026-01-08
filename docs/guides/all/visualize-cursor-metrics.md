---
displayed_sidebar: null
description: Learn how to create dashboards to monitor Cursor AI usage, track adoption, analyze costs, and measure developer productivity.
---

# Visualize Cursor metrics

This guide demonstrates how to set up a monitoring dashboard to gain insights into your Cursor AI usage using Port. You'll learn how to visualize key metrics like acceptance rates, active users, cost trends, and track AI-assisted code generation over time.

<img src="/img/ai-agents/cursorMetrics.png" border="1px" width="100%" />

## Common use cases

- Monitor Cursor AI adoption trends across your engineering teams.
- Track AI suggestion acceptance rates to measure productivity gains.
- Analyze usage costs and optimize AI spend.
- Compare TAB vs Composer usage patterns for code generation.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [Cursor integration](/build-your-software-catalog/sync-data-to-catalog/ai-agents/cursor/) is installed and syncing data.

## Create the dashboard

1. Navigate to your [software catalog](https://app.getport.io/organization/catalog).

2. Click on the **`+ New`** button in the left sidebar.

3. Select **New dashboard**.

4. Name the dashboard **Cursor AI Insights**.

5. Input `Monitor Cursor AI usage, adoption, and productivity metrics` under **Description**.

6. Select the `Cursor` icon.

7. Click **Create**.

You now have a blank dashboard where you can add widgets to visualize your Cursor metrics.

## Add widgets

Create the following widgets to gain insights into your Cursor usage:

### Total active users widget

<details>
<summary><b>Total active users (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Number Chart**.

2. Fill in the following details:
   - **Title**: `Total Active Users`.
   - **Description**: `Number of active users using Cursor AI`.
   - **Icon**: `Users`.
   - **Blueprint**: `cursor_usage_record`.
   - **Chart type**: Select `Count entities`.

3. Click **Save**.

</details>

### Total AI accepts widget

<details>
<summary><b>Total AI accepts (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Number Chart**.

2. Fill in the following details:
   - **Title**: `Total AI Accepts`.
   - **Description**: `Total number of AI suggestions accepted`.
   - **Icon**: `Checklistc`.
   - **Blueprint**: `cursor_usage_record`.
   - **Chart type**: Select `Aggregate by property`.
   - **Property**: `total_accepts`.
   - **Function**: `Sum`.

3. Click **Save**.

</details>

### Total cost widget

<details>
<summary><b>Total cost (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Number Chart**.

2. Fill in the following details:
   - **Title**: `Total Cost`.
   - **Description**: `Total cost of Cursor AI usage`.
   - **Blueprint**: `cursor_usage_record`.
   - **Chart type**: Select `Aggregate by property`.
   - **Property**: `total_cents`.
   - **Function**: `Sum`.

3. Click **Save**.

</details>

### AI suggestion acceptance rate over time widget

<details>
<summary><b>AI suggestion acceptance rate over time (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Line Chart**.

2. Fill in the following details:
   - **Title**: `AI Suggestion Acceptance Rate Over Time`.
   - **Description**: `Track how well users are accepting AI suggestions`.
   - **Icon**: `LineChart`.
   - **Blueprint**: `cursor_usage_record`.
   - **Chart type**: Select `Aggregate by property`.
   - **Property**: `Total Accepts`, `Total Rejects`, `Total Lines Added`, `Total Lines Deleted`.
   - **Function**: `Average`.
   - **Time interval**: `Week`.
   - **Time range**: `In the past 30 days`.
   - **Measure time by**: `$record_date`.

3. Click **Save**.

</details>

### Daily cost trends widget

<details>
<summary><b>Daily cost trends (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Line Chart**.

2. Fill in the following details:
   - **Title**: `Daily Cost Trends`.
   - **Description**: `Track AI usage costs over time`.
   - **Icon**: `LineChart`.
   - **Blueprint**: `cursor_usage_record`.
   - **Chart type**: Select `Aggregate by property`.
   - **Property**: `total_cents`.
   - **Function**: `Sum`.
   - **Time interval**: `Week`.
   - **Time range**: `In the past 30 days`.
   - **Measure time by**: `$record_date`.

3. Click **Save**.

</details>

### AI code generation trends widget

<details>
<summary><b>AI code generation trends (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Line Chart**.

2. Fill in the following details:
   - **Title**: `AI Code Generation Trends`.
   - **Description**: `Track TAB vs Composer usage for code changes`.
   - **Icon**: `LineChart`.
   - **Blueprint**: `cursor_ai_code_change_record`.
   - **Chart type**: Select `Aggregate by property`.
   - **Property**: `tab_changes`, `composer_changes`.
   - **Function**: `Average`.
   - **Time interval**: `Week`.
   - **Time range**: `In the past 30 days`.
   - **Measure time by**: `$record_date`.

3. Click **Save**.

</details>

### AI model usage distribution widget

<details>
<summary><b>AI model usage distribution (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Pie Chart**.

2. Fill in the following details:
   - **Title**: `AI Model Usage Distribution`.
   - **Description**: `Which AI models are being used most frequently`.
   - **Icon**: `Pie`.
   - **Blueprint**: `cursor_usage_record`.
   - **Property**: `most_used_model`.

3. Click **Save**.

</details>

### User activity breakdown widget

<details>
<summary><b>User activity breakdown (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Table**.

2. Fill in the following details:
   - **Title**: `User Activity Breakdown`.
   - **Description**: `Detailed view of individual user productivity and AI usage patterns`.
   - **Icon**: `Table`.
   - **Blueprint**: `cursor_user_usage_record`.

3. In the **Displayed properties** section, select the following columns:
   - `$identifier`.
   - `$title`.
   - `email`.
   - `total_accepts`.
   - `total_rejects`.
   - `acceptance_rate`.
   - `total_cents`.
   - `record_date`.

4. Click **Save**.

</details>

### Daily commit activity widget

<details>
<summary><b>Daily commit activity (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Line Chart**.

2. Fill in the following details:
   - **Title**: `Daily Commit Activity`.
   - **Description**: `Track code commits with AI assistance breakdown`.
   - **Icon**: `LineChart`.
   - **Blueprint**: `cursor_daily_commit_record`.
   - **Chart type**: Select `Count entities`.
   - **Function**: `count`.
   - **Property**: `Total Commits`.
   - **Time interval**: `Week`.
   - **Time range**: `In the past 30 days`.
   - **Measure time by**: `$record_date`.

3. Click **Save**.

</details>

