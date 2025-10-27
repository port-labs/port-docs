---
displayed_sidebar: null
description: Learn how to query DORA metrics using Port's MCP server with natural language commands in your IDE, enabling data-driven engineering insights without leaving your development environment.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import MCPInstallation from "/src/components/MCPInstallation/MCPInstallation.jsx"

# Query DORA metrics using Port MCP

This guide demonstrates how to use Port's Model Context Protocol (MCP) server to query DORA metrics using natural language commands directly from your IDE or AI-powered tools. By leveraging the MCP server, you can access deployment frequency, lead time, change failure rate, and mean time to recovery data without leaving your development environment.

<img src="/img/guides/MCPDoraDemo.png" width="100%" border="1px" />


## Common use cases

- **Team performance analysis**: Compare DORA metrics across different teams to identify top performers and areas for improvement.
- **Sprint retrospectives**: Get quick insights into deployment frequency and lead times during team retrospectives.
- **Engineering leadership reporting**: Generate on-demand reports for stakeholders about team velocity and reliability.
- **Incident response**: Quickly assess team MTTR during post-incident reviews and identify patterns.
- **Continuous improvement**: Monitor trends in change failure rates and deployment frequencies over time.


## Prerequisites

This guide assumes you have:
- A Port account with deployment and incident data available.
- Cursor IDE installed (we'll focus on Cursor, but you can also use VSCode, Claude, or other MCP-compatible tools).
- Basic understanding of DORA metrics concepts.

:::info Two approaches to DORA metrics with MCP
Port's MCP server enables DORA insights in two complementary ways:

1. **With DORA Metrics Experience**: If you have [DORA metrics set up](/guides/all/create-and-track-dora-metrics-in-your-portal), the MCP provides deterministic results over time, customized dashboards, and team-specific views. This gives you consistent, aggregated metrics that align with your organization's definitions.

2. **Dynamic DORA Calculations**: Even without the formal DORA metrics setup, the MCP server can analyze your deployment and incident data on-the-fly to calculate DORA metrics. This approach provides quick insights for data you might not have aggregated yet in a proper way, letting you explore different definitions and time periods flexibly.

Both approaches work together - you can start with dynamic calculations to explore your data, then implement the DORA experience for consistent tracking and dashboards.
:::


## Set up Port MCP server

The Port MCP server enables you to interact with your Port data using natural language queries directly from your IDE or AI tools.

<MCPInstallation />


## Open the chat and start querying

Once you have the MCP server configured, you can start using natural language to query your DORA metrics.

### Start a new chat session

1. Open a new chat session in Cursor (Cmd/Ctrl + L)
2. You should see the Port tools available in the tools panel
3. Start your conversation with DORA metrics queries

### Example DORA metrics queries

Here are practical examples of questions you can ask to get insights from your DORA metrics:

#### Team performance analysis

**Query:** "What is the Alpha team's MTTR?"

*This query helps you understand how quickly the Alpha team recovers from incidents, which is crucial for assessing team reliability and incident response capabilities.*

<img src="/img/guides/MCPDoraAlphaMTTR.png" width="100%" border="1px" />

**Query:** "Which team has the lowest change lead time?"

*Identify the most efficient team in terms of getting code from commit to production, which can help share best practices across teams.*

<img src="/img/guides/MCPDoraLowestLeadTime.png" width="100%" border="1px" />

#### Deployment analysis

**Query:** "How many deployments did we have last week, broken down by team?"

*Get a comprehensive view of deployment activity across all teams to understand deployment frequency patterns.*

<img src="/img/guides/MCPDoraDeploymentsByTeam.png" width="100%" border="1px" />

**Query:** "Show me the deployment frequency for the Platform team over the last month"

*Analyze deployment patterns for a specific team to understand their release cadence.*

#### Change failure rate analysis

**Query:** "What's our change failure rate for production deployments this quarter?"

*Monitor the percentage of deployments that result in failures, helping assess deployment quality and process effectiveness.*

**Query:** "Compare change failure rates between the Frontend and Backend teams"

*Identify teams that might need additional support or process improvements in their deployment practices.*

#### Lead time insights

**Query:** "What's the average lead time for changes across all teams this month?"

*Get organization-wide visibility into how long it takes to deliver code changes to production.*

**Query:** "Show me lead time trends for the Mobile team over the last 3 months"

*Track improvement or degradation in a team's delivery speed over time.*

#### Cross-metric analysis

**Query:** "Which services have both high deployment frequency and low change failure rate?"

*Identify well-performing services that maintain high velocity with good quality.*

**Query:** "Show me teams with MTTR above 4 hours in the last month"

*Identify teams that might need help with incident response processes.*

### Advanced querying techniques

#### Filtering and time ranges

- **"Show me DORA metrics for services tagged as 'critical' in the last 30 days"**
- **"What's the deployment frequency for microservices owned by the API team since January?"**
- **"Compare MTTR between production and staging environments"**

#### Trend analysis

- **"How has our overall change failure rate changed over the last 6 months?"**
- **"Show me the deployment frequency trend for the E-commerce team quarter over quarter"**
- **"Has the Platform team's lead time improved since implementing the new CI/CD pipeline?"**

#### Benchmarking

- **"How do our DORA metrics compare to industry benchmarks?"**
- **"Which teams are performing above/below the organization average for each DORA metric?"**
- **"Show me services that meet the 'Elite' DORA performance criteria"**


## Understanding the responses

The MCP server responses rely on Port's data model, using the [available MCP tools](/ai-interfaces/port-mcp-server/available-tools) to access and analyze your data. You can:

### Get detailed insights and take action
- Ask your LLM to explain the results and provide context
- Request actionable recommendations like "how can we improve the lead time?"
- Take follow-up actions directly through the MCP server

### Dive deeper into results
- Drill down into specific metrics with follow-up questions
- Cross-reference DORA metrics with other Port data like service health or scorecards
- Explore different time periods or team comparisons

### Request custom visualizations
- Ask to show results in a graph or chart format
- Request to create a custom web application to visualize the data (Claude Artifacts is excellent for this)
- Generate executive-ready dashboards and reports

:::tip Getting better results
To get the most accurate and useful responses:
- Be specific about time ranges (e.g., "last 30 days" instead of "recently")
- Specify teams, services, or environments when relevant
- Ask follow-up questions to drill down into interesting data points
- Use the MCP server's ability to cross-reference with other Port data like scorecards and service health
:::


## Next steps

Now that you can query DORA metrics using Port MCP, consider these recommendations:

- **Enrich and deepen your DORA data model**: Enhance your Port data model with additional deployment and incident sources for faster results and comprehensive dashboards implementation
- **Find areas for improvement**: Use the insights gained to identify specific teams, services, or processes that need attention
- **Automate reporting**: Use the MCP server in an automated way to produce executive reports or weekly team performance summaries
- **Set up alerts**: Configure Port automations to notify teams when DORA metrics cross certain thresholds
- **Expand analysis**: Combine DORA metrics with other Port data like service health, scorecards, and dependencies

### Related guides

- [Create & track DORA metrics in your portal](/guides/all/create-and-track-dora-metrics-in-your-portal)
- [Set up DORA metrics using GitLab](/guides/all/set-up-deployments-dora-gitlab)
- [Set up DORA metrics using Jira](/guides/all/setup-dora-metrics-jira)
- [Port MCP server overview & installation](/ai-interfaces/port-mcp-server/overview-and-installation)
- [Available MCP tools](/ai-interfaces/port-mcp-server/available-tools)

### Learn more about DORA metrics

- [DORA metrics overview in Port solutions](/solutions/engineering-360/measure-dora-metrics)
- [Improve lead time strategies](/solutions/engineering-360/improve-lead-time)
- [Reduce MTTR best practices](/solutions/engineering-360/reduce-mttr)