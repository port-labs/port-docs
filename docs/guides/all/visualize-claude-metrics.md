---
displayed_sidebar: null
description: Learn how to create dashboards to monitor Claude API usage, track costs, analyze model performance, and measure workspace-level metrics.
---

# Visualize Claude metrics

This guide demonstrates how to set up a monitoring dashboard to gain insights into your Claude API usage using Port. You'll learn how to visualize key metrics like API requests, costs, token consumption, model distribution, and track Claude Code activity over time.

<img src="/img/ai-agents/claudeMetrics.png" border="1px" width="100%" />

## Common use cases

- Monitor Claude API usage trends and request volumes.
- Track API costs and optimize spending across models.
- Analyze model distribution to understand which Claude models are used most.
- Monitor API reliability with success vs failure rate tracking.
- Track Claude Code sessions, commits, and pull requests.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [Claude AI integration](/build-your-software-catalog/sync-data-to-catalog/ai-agents/claude/) is installed and syncing data.

## Create the dashboard

1. Navigate to your [software catalog](https://app.getport.io/organization/catalog).

2. Click on the **`+ New`** button in the left sidebar.

3. Select **New dashboard**.

4. Name the dashboard **Claude AI Insights**.

5. Input `Monitor Claude API usage, costs, and performance metrics` under **Description**.

6. Select the `Anthropic` icon.

7. Click **Create**.

You now have a blank dashboard where you can add widgets to visualize your Claude metrics.

## Add widgets

Create the following widgets to gain insights into your Claude API usage:

### Total API requests widget

<details>
<summary><b>Total API requests (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Number Chart**.

2. Fill in the following details:
   - **Title**: `Total API Requests`.
   - **Description**: `Total number of Claude API requests`.
   - **Icon**: `Api`.
   - **Blueprint**: `claude_usage_record`.
   - **Chart type**: Select `Aggregate by property`.
   - **Property**: `total_requests`.
   - **Function**: `Sum`.

3. Click **Save**.

</details>

### Total cost widget

<details>
<summary><b>Total cost (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Number Chart**.

2. Fill in the following details:
   - **Title**: `Total Cost (USD)`.
   - **Description**: `Total cost of Claude API usage`.
   - **Icon**: `DollarSign`.
   - **Blueprint**: `claude_usage_record`.
   - **Chart type**: Select `Aggregate by property`.
   - **Property**: `total_cost_usd`.
   - **Function**: `Sum`.

3. Click **Save**.

</details>

### API success rate widget

<details>
<summary><b>API success rate (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Number Chart**.

2. Fill in the following details:
   - **Title**: `API Success Rate`.
   - **Description**: `Overall success rate of API requests`.
   - **Blueprint**: `claude_usage_record`.
   - **Chart type**: Select `Aggregate by property`.
   - **Property**: `success_rate`.
   - **Function**: `Average`.

3. Click **Save**.

</details>

### Token usage over time widget

<details>
<summary><b>Token usage over time (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Line Chart**.

2. Fill in the following details:
   - **Title**: `Token Usage Over Time`.
   - **Description**: `Track input and output token consumption`.
   - **Icon**: `LineChart`.
   - **Blueprint**: `claude_usage_record`.
   - **Chart type**: Select `Aggregate by property`.
   - **Property**: `total_input_tokens`, `total_output_tokens`.
   - **Function**: `Sum`.
   - **Time interval**: `Week`.
   - **Time range**: `In the past 30 days`.
   - **Measure time by**: `record_date`.

3. Click **Save**.

</details>

### Daily cost trends widget

<details>
<summary><b>Daily cost trends (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Line Chart**.

2. Fill in the following details:
   - **Title**: `Daily Cost Trends`.
   - **Description**: `Track API costs over time`.
   - **Icon**: `LineChart`.
   - **Blueprint**: `claude_usage_record`.
   - **Chart type**: Select `Aggregate by property`.
   - **Property**: `total_cost_usd`.
   - **Function**: `Sum`.
   - **Time interval**: `Week`.
   - **Time range**: `In the past 30 days`.
   - **Measure time by**: `record_date`.

3. Click **Save**.

</details>

### Model usage distribution widget

<details>
<summary><b>Model usage distribution (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Pie Chart**.

2. Fill in the following details:
   - **Title**: `Model Usage Distribution`.
   - **Description**: `Which Claude models are being used most frequently`.
   - **Icon**: `Pie`.
   - **Blueprint**: `claude_model_usage`.
   - **Property**: `model_name`.

3. Click **Save**.

</details>

### Request success vs failure rate widget

<details>
<summary><b>Request success vs failure rate (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Line Chart**.

2. Fill in the following details:
   - **Title**: `Request Success vs Failure Rate`.
   - **Description**: `Monitor API reliability over time`.
   - **Icon**: `LineChart`.
   - **Blueprint**: `claude_usage_record`.
   - **Chart type**: Select `Aggregate by property`.
   - **Property**: `successful_requests`, `failed_requests`.
   - **Function**: `Sum`.
   - **Time interval**: `Week`.
   - **Time range**: `In the past 30 days`.
   - **Measure time by**: `record_date`.

3. Click **Save**.

</details>

### Claude Code activity widget

<details>
<summary><b>Claude Code activity (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Line Chart**.

2. Fill in the following details:
   - **Title**: `Claude Code Activity`.
   - **Description**: `Track Claude Code sessions, commits, and PRs over time`.
   - **Icon**: `LineChart`.
   - **Blueprint**: `claude_code_analytics`.
   - **Chart type**: Select `Aggregate by property`.
   - **Property**: `total_sessions`, `total_commits`, `total_pull_requests`.
   - **Function**: `Sum`.
   - **Time interval**: `Week`.
   - **Time range**: `In the past 30 days`.
   - **Measure time by**: `record_date`.

3. Click **Save**.

</details>

### Cache efficiency widget

<details>
<summary><b>Cache efficiency (click to expand)</b></summary>

1. Click on **`+ Widget`** and select **Line Chart**.

2. Fill in the following details:
   - **Title**: `Cache Efficiency`.
   - **Description**: `Track cache read vs write tokens for cost optimization`.
   - **Icon**: `LineChart`.
   - **Blueprint**: `claude_usage_record`.
   - **Chart type**: Select `Aggregate by property`.
   - **Property**: `total_cache_read_tokens`, `total_cache_write_tokens`.
   - **Function**: `Sum`.
   - **Time interval**: `Week`.
   - **Time range**: `In the past 30 days`.
   - **Measure time by**: `record_date`.

3. Click **Save**.

</details>

