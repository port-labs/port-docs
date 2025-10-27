---
displayed_sidebar: null
description: Learn how to query DORA metrics using Port's MCP server with natural language commands in your IDE, enabling data-driven engineering insights without leaving your development environment.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Query DORA metrics using Port MCP

This guide demonstrates how to use Port's Model Context Protocol (MCP) server to query DORA metrics using natural language commands directly from your IDE or AI-powered tools. By leveraging the MCP server, you can access deployment frequency, lead time, change failure rate, and mean time to recovery data without leaving your development environment.

<img src="/img/guides/query-dora-mcp-demo.png" width="100%" border="1px" />


## Common use cases

- **Team performance analysis**: Compare DORA metrics across different teams to identify top performers and areas for improvement.
- **Sprint retrospectives**: Get quick insights into deployment frequency and lead times during team retrospectives.
- **Engineering leadership reporting**: Generate on-demand reports for stakeholders about team velocity and reliability.
- **Incident response**: Quickly assess team MTTR during post-incident reviews and identify patterns.
- **Continuous improvement**: Monitor trends in change failure rates and deployment frequencies over time.


## Prerequisites

This guide assumes you have:
- A Port account with DORA metrics configured and data available.
- [DORA metrics set up](/guides/all/create-and-track-dora-metrics-in-your-portal) in your Port instance with deployment and incident data.
- Cursor IDE installed (we'll focus on Cursor, but you can also use VSCode, Claude, or other MCP-compatible tools).
- Basic understanding of DORA metrics concepts.

:::info About DORA metrics in Port
If you haven't set up DORA metrics in Port yet, complete the [Create & track DORA metrics in your portal](/guides/all/create-and-track-dora-metrics-in-your-portal) guide first. This will ensure you have the necessary deployment and incident data to query.
:::


## Set up Port MCP server

The Port MCP server enables you to interact with your Port data using natural language queries directly from your IDE or AI tools.

### Install MCP server in Cursor

1. **Open Cursor settings**
   
   Go to Cursor settings, click on **Tools & Integrations**, and add a new MCP server.

   <img src="/img/ai-agents/MCPInstallCursorStep1.png" width="80%" border="1px" />

2. **Configure the MCP server**
   
   Add the appropriate configuration for your Port region:

   <Tabs>
   <TabItem value="eu" label="EU Region">
   ```json showLineNumbers
   {
     "mcpServers": {
       "port-eu": {
         "url": "https://mcp.port.io/v1"
       }
     }
   }
   ```
   </TabItem>
   <TabItem value="us" label="US Region">
   ```json showLineNumbers
   {
     "mcpServers": {
       "port-us": {
         "url": "https://mcp.us.port.io/v1"
       }
     }
   }
   ```
   </TabItem>
   </Tabs>

   <img src="/img/ai-agents/MCPInstallCursorStep2.png" width="80%" border="1px" />

3. **Authenticate with Port**
   
   Click on **"Needs login"** and complete the authentication flow in the window that opens.

   <img src="/img/ai-agents/MCPInstallCursorStep3.png" width="80%" border="1px" />

4. **Verify connection**
   
   After successful authentication, you'll see the list of available tools from the MCP server.

   <img src="/img/ai-agents/MCPInstallCursorStep4.png" width="80%" border="1px" />

:::tip Alternative setup options
While this guide focuses on Cursor, you can also set up the MCP server with:
- **VSCode**: Using the GitHub Copilot extension with MCP support
- **Claude**: Through custom connectors
- **Local installation**: Using Docker or Python package managers

For detailed instructions on other setup methods, see the [Port MCP server installation guide](/ai-interfaces/port-mcp-server/overview-and-installation).
:::


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

<img src="/img/guides/dora-mcp-alpha-mttr.png" width="100%" border="1px" />

**Query:** "Which team has the lowest change lead time?"

*Identify the most efficient team in terms of getting code from commit to production, which can help share best practices across teams.*

<img src="/img/guides/dora-mcp-lowest-lead-time.png" width="100%" border="1px" />

#### Deployment analysis

**Query:** "How many deployments did we have last week, broken down by team?"

*Get a comprehensive view of deployment activity across all teams to understand deployment frequency patterns.*

<img src="/img/guides/dora-mcp-deployments-by-team.png" width="100%" border="1px" />

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

When you query DORA metrics through the MCP server, you'll receive structured responses that may include:

### Metrics data
- Numerical values with appropriate units (hours, percentages, counts)
- Time-based breakdowns (daily, weekly, monthly)
- Team or service-specific data

### Visualizations
- The MCP server can help generate insights from Port's dashboard data
- Links to relevant Port dashboard pages for deeper analysis
- Comparative data across teams or time periods

### Context and recommendations
- Interpretation of what the metrics indicate about team performance
- Suggestions for improvement based on the data
- References to relevant Port documentation or best practices

:::tip Getting better results
To get the most accurate and useful responses:
- Be specific about time ranges (e.g., "last 30 days" instead of "recently")
- Specify teams, services, or environments when relevant
- Ask follow-up questions to drill down into interesting data points
- Use the MCP server's ability to cross-reference with other Port data like scorecards and service health
:::


## Next steps

Now that you can query DORA metrics using Port MCP, consider these additional use cases:

- **Automate reporting**: Create scripts or automations that regularly query DORA metrics for executive reports
- **Integrate with workflows**: Use DORA insights in your CI/CD pipeline decisions
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