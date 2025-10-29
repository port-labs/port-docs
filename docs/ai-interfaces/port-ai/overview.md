---
sidebar_position: 1
title: Port AI Overview
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Port AI

import BetaFeatureNotice from '/docs/generalTemplates/_beta_feature_notice.md'

<BetaFeatureNotice id="ai-form" />

Port AI is the foundational AI system that enables intelligent interaction with your Port data through natural language. As an MCP (Model Context Protocol) client, Port AI accepts prompts and tools, runs autonomous processes to query your software catalog, and returns comprehensive responses.

## What is Port AI?

Port AI serves as the base interface that:

- **Accepts prompts**: Receives natural language queries and requests.
- **Uses developer MCP tools**: Uses developer MCP tools from the [Port MCP server](/ai-interfaces/port-mcp-server/overview-and-installation) to access your catalog data. Port AI currently supports developer tools (for querying and running actions) but not administrative tools (such as creating blueprints or managing scorecards).
- **Runs autonomous processes**: Intelligently determines which tools to use and how to combine them.
- **Returns responses**: Provides comprehensive answers and can execute actions based on your requirements.

Port AI acts as an [MCP client](https://modelcontextprotocol.io/docs/learn/client-concepts) that connects to Port's remote MCP server, giving it access to your entire software catalog, blueprints, entities, and configured actions.

## How Port AI Works

When you interact with Port AI:

1. **You provide a prompt** - Ask questions or request actions in natural language
2. **Port AI analyzes your request** - Determines what information or actions are needed
3. **Tools are executed** - Port AI uses MCP server tools to query your catalog, analyze data, or prepare actions
4. **You receive a response** - Get comprehensive answers, insights, or action execution results

## Port AI Tools

Port AI leverages tools from the [Port MCP server](/ai-interfaces/port-mcp-server/overview-and-installation) to interact with your software catalog and execute actions. These tools enable Port AI to access your data, analyze information, and perform tasks across different AI interfaces.

### Available Tools

Port AI uses **developer tools** from the MCP server, which includes the ability to query data from your software catalog, analyze scorecards, and execute self-service actions.

**Examples of Port AI tool usage:**
- *"Show me all microservices owned by the Backend team"* → Uses data query tools to search entities.
- *"Create a new incident report for the payment service"* → Uses action execution tools to run incident creation action.
- *"What's the security score for our production services?"* → Uses data query tools to access scorecard information.

:::info Developer vs Administrative Tools
Port AI currently supports **developer tools** only, which focus on querying data and running actions. Administrative tools (such as creating blueprints or managing scorecards) are not available through Port AI interfaces.
:::

### Tool Execution Modes

For **action execution tools** specifically, Port AI supports two execution modes:

<Tabs groupId="execution-modes" queryString>
<TabItem value="automatic" label="Automatic Execution">

When configured for automatic execution, Port AI will:
1. Determine the appropriate parameters based on your request
2. Execute actions immediately  
3. Provide a link to the action run or results

This mode streamlines workflows but should be used carefully, especially for actions with significant impact.

</TabItem>
<TabItem value="manual" label="Manual Approval">

When configured for manual approval, Port AI will:
1. Create a draft action based on your request
2. Provide a link to the draft
3. Allow you to review and modify parameters before execution

This approach provides an additional safety layer, ensuring you can verify all parameters before execution.

</TabItem>
</Tabs>

:::info Execution modes scope
Execution modes apply only to self-service actions. Data query tools execute immediately as they only retrieve information without making changes.
:::

### Tool Selection

Port AI allows you to control which specific tools from the [Port MCP server](/ai-interfaces/port-mcp-server/overview-and-installation) are available for each interaction.

This provides fine-grained control over what actions Port AI can perform - for example, you can restrict it to read-only operations for simple Q&A, or allow only specific actions for automated workflows.

For detailed information about tool selection patterns, API usage examples, and best practices, see [Tool Selection in API Interaction](/ai-interfaces/port-ai/api-interaction#tool-selection).

## Available Interfaces

Port AI can be accessed through several interfaces, each designed for different use cases:

### Port AI Assistant
The **[Port AI Assistant](/ai-interfaces/port-ai-assistant)** provides a dedicated, out-of-the-box user experience that requires no configuration. Available through a floating button, it offers instant access to AI-powered insights about your catalog, actions, and Port documentation - with zero setup required.

### AI Chat Widget  
The [AI Chat Widget](/ai-interfaces/ai-chat-widget) is a customizable interface that platform engineers can embed in dashboards. It allows configuration of:
- Custom prompts.
- Conversation starters.
- Available [Port AI tools](#port-ai-tools).
- Dashboard placement and styling.

### API Access
Port AI can be accessed programmatically through Port's API, enabling integration into custom applications and workflows. This provides the most flexible way to incorporate Port AI capabilities into your existing tools and processes. 

You can also connect Port AI to external agents and workflows you build, allowing you to:
- Integrate Port AI into your custom applications.
- Build external automation workflows that leverage Port data.
- Connect third-party systems to your Port catalog through AI.
- Create specialized interfaces tailored to your organization's needs.

## Common Use Cases

Port AI excels at helping platform engineers and developers with:

**Information Discovery:**
- "Who is the owner of service X?"
- "How many services do we have in production?"
- "Show me all microservices owned by the Backend team".
- "What are the dependencies of the OrderProcessing service?"

**Quality and Compliance Analysis:**
- "Which services are failing our security requirements scorecard?"
- "What's preventing the InventoryService from reaching Gold level?"
- "Show me the bug count vs. test coverage for all Java microservices".

**Running Actions:**
- "Can you help me deploy service X to production?"
- "Create a new incident report for the payment service outage".
- "Set up a new microservice using our standard template".
- "Notify the reviewers of pull request #1234".

## LLM Models and Providers

Port AI uses state-of-the-art Large Language Models to power all AI interactions. We offer two approaches:

### Port's Managed AI Infrastructure
By default, Port AI uses our managed AI infrastructure with enterprise-grade security and automatic updates.

### Bring Your Own LLM
For organizations requiring additional control, Port supports configuring your own LLM providers. This allows for data privacy control, cost optimization, and compliance with specific organizational requirements.

For comprehensive information about LLM provider management, see [LLM Provider Management](/ai-interfaces/port-ai/llm-providers-management/overview).

## Limits and Usage

Port AI operates with specific limits to ensure optimal performance for all users:

:::info LLM Provider Limits
These limits apply when using Port's managed AI infrastructure. When you [configure your own LLM provider](/ai-interfaces/port-ai/llm-providers-management/overview), these Port-specific limits no longer apply, and usage will be governed by your provider's own limits and pricing.

Port acts as a bridge to leading LLM providers and doesn't host LLM models internally.
:::

### Rate Limits (Hourly)
- **Request limit**: 1,000 requests per hour.
- **Token usage limit**: 800,000 tokens per hour.
- These limits reset hourly.

### Monthly Quota
- **Default quota**: 20 AI invocations per month.
- Each interaction with Port AI counts as one request against your quota.
- Quota resets monthly.

Both types of limits are on the **organization level**, and count on the each org separately. There is currently no way to limit the usage on a user-basis.

:::tip Managing Usage
Monitor your usage through API response headers and the [quota endpoint](/api-reference/get-monthly-ai-invocations-quota-usage). When approaching limits, consider implementing rate limiting in your applications or optimizing your AI interactions for efficiency.
:::

## Security and Permissions

Port AI respects your organization's security controls:

- **RBAC compliance**: Port AI only accesses data you have permissions to view.
- **Data governance**: All interactions respect your configured data access policies.
- **Audit trail**: AI interactions are logged and trackable.
- **Secure processing**: All data processing happens within Port's secure infrastructure.

For detailed security information, see [AI Security and Data Controls](/ai-interfaces/port-ai/security-and-data-controls).

### Controlling Access to Port AI

Access to Port AI is controlled through the `_ai_invocation` blueprint's permissions. Users who have permission to **register** new AI invocation entities will be able to access and use Port AI interfaces, including the Port AI Assistant.

To configure who can access Port AI:

1. Navigate to your **Data Model** in Port
2. Search for the `_ai_invocation` blueprint
3. Go to the **Permissions** tab
4. Under the **Entities** section, configure the **Register** permission
5. Only users with the "register" permission will have access to Port AI

<img src='/img/ai-agents/AIInvocationPermissions.png' width='85%' border='1px' />

:::tip User access control
By controlling who can register AI invocations, you can manage which users in your organization have access to Port AI features. This includes access to the Port AI Assistant, AI Chat Widgets, and API-based interactions.
:::

## Technical Limitations

:::tip MCP Tools Limitations
Port AI uses the Port MCP Tools, which have their own limitations. For detailed information about MCP tool constraints, refer to the [Port MCP Server documentation](/ai-interfaces/port-mcp-server/overview-and-installation).
:::

Port AI operates within several technical constraints to ensure optimal performance and security:

- **Tool calls per interaction**: One AI interaction can include up to 15 tool calls.
- **LLM final response**: Limited to 2000 tokens per response.
- **Tool scope**: Currently supports only developer tools (querying data and running actions), not administrative tools (creating blueprints, managing scorecards).
- **User-based permissions**: All interactions respect your individual user permissions - Port AI cannot access data you don't have permission to view.
- **Sequential automation permissions**: Sequential automations run with Admin privileges, which may differ from your user permissions.


## AI Invocations

Every interaction with Port AI creates a detailed AI invocation record in Port, providing comprehensive tracking and analysis capabilities. AI invocations act as execution logs that capture the complete lifecycle of each interaction.

### What AI Invocations Track

Each AI invocation record includes:

- **Who asked**: User identity and context for the interaction.
- **What they asked**: The original prompt or question submitted.
- **AI response**: The complete response provided by Port AI.
- **Tools used**: Detailed log of which tools were executed and their results.
- **Execution logs**: Detailed log of which tools were executed and their results.

### Accessing AI Invocations

AI invocations are stored as entities in your Port catalog using the `_ai_invocation` blueprint. You can view them in the AI Invocations catalog page, or query it programmatically via the API.

### Benefits of AI Invocation Tracking

AI invocation records help you:

- **Monitor usage patterns**: Understand how Port AI is being used across your organization.
- **Debug interactions**: Analyze what tools were used and why certain responses were generated.
- **Audit compliance**: Maintain detailed logs of all AI interactions for governance.
- **Optimize performance**: Identify inefficient queries or improve prompt strategies.
- **Track usage**: Monitor usage and interaction frequency.
- **Improve accuracy**: Provide feedback and identify areas for improvement.

### AI Invocation Details

Each AI invocation provides detailed information about how Port AI processed your request:

#### Plan

The plan shows how Port AI decided to tackle your request and the steps it intended to take. This provides insight into the AI's reasoning process and helps you understand the approach taken for your specific query.

<img src='/img/ai-agents/AIAgentsPlan.png' width='80%' border='1px' />

#### Tools Used

This section displays the actual steps Port AI took and the tools it used to complete your request. This information shows which MCP tools were executed, what data was accessed, and how the information was processed to generate the response.

This information can be particularly helpful for debugging when answers don't meet expectations, such as when Port AI:

- Used an incorrect field name.
- Chose an inappropriate property.
- Made other logical errors.

<img src='/img/ai-agents/AIAgentsTools.png' width='80%' border='1px' />

#### Execution Details

Each invocation record also includes:
- **Request timestamp**: When the interaction was initiated.
- **User context**: Who made the request and from what interface.

## Frequently Asked Questions

<details>
<summary><b>What are the main use cases Port AI supports? (Click to expand)</b></summary>

Port AI supports two primary interaction types:

1. **Ask Me Anything (Information Queries)**
   - Natural language queries about your development ecosystem
   - Examples: "Who owns service X?", "What's the deployment frequency of team Y?"
   - Focused on surfacing information from connected data sources

2. **Run an Action (Task Assistance)**
   - Assist with running or pre-filling self-service actions
   - Examples: "Create a bug report", "Set up a new service"
   - Important: you can decide whether Port AI can run the action automatically or requires approval
</details>

<details>
<summary><b>How can I interact with Port AI? (Click to expand)</b></summary>

You can interact with Port AI through multiple interfaces:
- **[Port AI Assistant](/ai-interfaces/port-ai-assistant)** - Out-of-the-box chat interface via floating button (no configuration required).
- [AI Chat Widget](/ai-interfaces/ai-chat-widget) - Customizable dashboard widgets
- API integration - For custom applications and external workflows
- [AI Agents](/ai-interfaces/ai-agents/overview) - Specialized implementations built on Port AI
</details>

<details>
<summary><b>What happens if Port AI can't answer my question? (Click to expand)</b></summary>

If Port AI doesn't have access to the data needed to answer your question, you'll receive a response indicating that it can't assist with your query. This typically happens when:
- The requested data isn't available in your Port catalog
- You don't have permissions to access the relevant data
- The question is outside the scope of Port AI's capabilities

Consider rephrasing your question or checking your data permissions.
</details>

<details>
<summary><b>Can I customize how Port AI responds? (Click to expand)</b></summary>

Yes, you can customize Port AI in several ways:
- Use the [AI Chat Widget](/ai-interfaces/ai-chat-widget) with custom prompts and conversation starters
- Build [AI Agents](/ai-interfaces/ai-agents/overview) for specialized use cases

All customizations operate within Port's secure framework and governance controls.
</details>

<details>
<summary><b>Are there usage limits for Port AI? (Click to expand)</b></summary>

Yes, Port AI has usage limits to ensure fair usage across all customers:

*Note: These limits apply when using Port's managed AI infrastructure. [Bring your own LLM provider](/ai-interfaces/port-ai/llm-providers-management/overview) to use your provider's limits instead.*

**Rate Limits (Hourly):**
- Request limit: 1,000 requests per hour
- Token usage limit: 800,000 tokens per hour
- These limits reset hourly

**Monthly Quota:**
- Default quota: 20 AI invocations per month
- Each interaction with Port AI counts as one request
- Quota resets monthly

You can monitor your usage through API response headers and the [quota endpoint](/api-reference/get-monthly-ai-invocations-quota-usage). When you reach a limit, access resumes automatically when the limit resets.
</details>

<details>
<summary><b>Which LLM models does Port AI use? (Click to expand)</b></summary>

Port AI uses advanced language models depending on the interface and configuration:

**Port's Managed Infrastructure (Default):**
- **GPT models**: For reliable performance and broad compatibility
- **Claude Sonnet**: For enhanced reasoning and analysis capabilities

**Bring Your Own LLM:**
- Configure your own providers: OpenAI, Anthropic, Azure OpenAI, AWS Bedrock
- Control data privacy, costs, and compliance requirements
- Select specific providers and models for different use cases

The specific model used depends on your organization's configuration and the interface used. Learn more about [LLM Provider Management](/ai-interfaces/port-ai/llm-providers-management/overview).
</details>

<details>
<summary><b>How is my data handled with Port AI? (Click to expand)</b></summary>

Port AI is designed with security and privacy as priorities:

- All data processing occurs within Port's secure cloud infrastructure
- Your data is not used for model training
- We store interaction data for up to 30 days to ensure proper function and prevent inappropriate behavior
- Data storage is limited strictly to these purposes
- You can contact us to opt-out of this data storage
- Complete logical separation between different customers' data is maintained

**AI Invocation Tracking:**
Every Port AI interaction creates a detailed invocation record that includes who asked what, the AI's response, which tools were used, and complete execution logs. These records are stored as entities in your Port catalog for monitoring, debugging, and audit purposes.

For comprehensive security and data governance information, see [AI Security and Data Controls](/ai-interfaces/port-ai/security-and-data-controls).

**Detailed Information:**
- [Data Privacy & Retention](/ai-interfaces/port-ai/security-and-data-controls#data-privacy--retention) - What data we store and why.
- [LLM Provider Data Processing](/ai-interfaces/port-ai/security-and-data-controls#how-is-my-data-processed-by-llm-providers) - How your data is processed by AI models.
- [Opt-out Options](/ai-interfaces/port-ai/security-and-data-controls#can-i-opt-out-of-data-storage) - How to opt out of data storage.
</details>

<details>
<summary><b>Can I audit and control Port AI usage? (Click to expand)</b></summary>

Yes, Port AI provides comprehensive audit and control capabilities:

- Each interaction is saved and can be viewed in audit logs
- Granular permission controls determine who can access Port AI
- Admin dashboard for monitoring usage across your organization
- Export capabilities for audit logs
- Rate limiting and usage controls available
- All interactions respect your configured RBAC and data access policies

For detailed security and governance information, see [AI Security and Data Controls](/ai-interfaces/port-ai/security-and-data-controls).

**Detailed Information:**
- [Admin Controls & Organization Policies](/ai-interfaces/port-ai/security-and-data-controls#admin-controls--organization-policies) - What controls administrators have.
- [AI Usage Visibility](/ai-interfaces/port-ai/security-and-data-controls#what-visibility-do-customers-have-into-ai-usage) - Comprehensive visibility into AI usage.
- [User Access Controls](/ai-interfaces/port-ai/security-and-data-controls#can-we-control-which-users-have-access-to-ai-features) - How to control user access.
</details>

<details>
<summary><b>What happens when I reach usage limits? (Click to expand)</b></summary>

When you reach a usage limit:

- You are temporarily blocked from making new Port AI requests
- You receive an error message indicating which limit was exceeded
- Access resumes automatically when the limit resets

**For rate limits (hourly):**
- Wait for limits to reset (they reset every hour)
- Monitor the `remainingTimeMs` field to know when you can make requests again

**For monthly quota:**
- Wait for the monthly quota to reset at the beginning of the next month
- Contact support to learn about quota upgrades for your organization

**Recommendations:**
- Implement rate limiting in your applications
- Monitor usage proactively using available monitoring methods
- Optimize AI interactions for efficiency
</details>

<details>
<summary><b>What if Port AI gives incorrect answers? (Click to expand)</b></summary>

Port AI can make mistakes. If you're receiving incorrect answers:

1. Check what tools and data sources were used (visible in interaction details)
2. Verify that the relevant data is correctly configured in your Port catalog
3. Try rephrasing your question or breaking it into smaller, more specific queries
4. Contact support if problems persist

Remember that AI systems are constantly improving but aren't infallible.
</details>

<details>
<summary><b>Are there any technical limitations to Port AI capabilities? (Click to expand)</b></summary>

Yes, Port AI operates within several technical constraints related to search capabilities, data processing, tool usage, and permissions. These limitations are designed to ensure optimal performance and security.

For comprehensive information about all technical limitations, including search limits, processing constraints, tool restrictions, and permission boundaries, see the [Technical Limitations section](#technical-limitations) above.

Key areas where limitations apply:
- **Search and data retrieval**: Entity count limits and indexing constraints
- **Processing capabilities**: Interaction limits and token restrictions  
- **Tool and action usage**: Scope limitations and blueprint requirements
- **Permissions and context**: User-based access controls and relation constraints

Understanding these limitations helps you design more effective queries and interactions with Port AI.

</details>
