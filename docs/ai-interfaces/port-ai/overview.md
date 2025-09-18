---
sidebar_position: 1
title: Port AI Overview
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Port AI

Port AI is the foundational AI system that enables intelligent interaction with your Port data through natural language. As an MCP (Model Context Protocol) client, Port AI accepts prompts and tools, runs autonomous processes to query your software catalog, and returns comprehensive responses.

## What is Port AI?

Port AI serves as the base interface that:

- **Accepts prompts**: Receives natural language queries and requests
- **Uses MCP tools**: Leverages tools from the [Port MCP server](/ai-interfaces/port-mcp-server/overview-and-installation) to access your catalog data  
- **Runs autonomous processes**: Intelligently determines which tools to use and how to combine them
- **Returns responses**: Provides comprehensive answers and can execute actions based on your requirements

Port AI acts as an [MCP client](https://modelcontextprotocol.io/docs/learn/client-concepts) that connects to Port's remote MCP server, giving it access to your entire software catalog, blueprints, entities, and configured actions.

## How Port AI Works

When you interact with Port AI:

1. **You provide a prompt** - Ask questions or request actions in natural language
2. **Port AI analyzes your request** - Determines what information or actions are needed
3. **Tools are executed** - Port AI uses MCP server tools to query your catalog, analyze data, or prepare actions
4. **You receive a response** - Get comprehensive answers, insights, or action execution results

## Tool Execution Modes

Port AI supports two execution modes for tools and actions:

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

## Available Interfaces

Port AI can be accessed through several interfaces, each designed for different use cases:

### Port AI Assistant
The **Port AI Assistant** provides a dedicated, out-of-the-box user experience that requires no configuration. It offers a complete chat interface optimized for interacting with your Port data. *(Coming soon - comprehensive documentation)*

### AI Chat Widget  
The [AI Chat Widget](/ai-interfaces/ai-chat-widget) is a customizable interface that platform engineers can embed in dashboards. It allows configuration of:
- Custom prompts
- Conversation starters  
- Available tools
- Dashboard placement and styling

### API Access
Port AI can be accessed programmatically through Port's API, enabling integration into custom applications and workflows. This provides the most flexible way to incorporate Port AI capabilities into your existing tools and processes. 

You can also connect Port AI to external agents and workflows you build, allowing you to:
- Integrate Port AI into your custom applications
- Build external automation workflows that leverage Port data
- Connect third-party systems to your Port catalog through AI
- Create specialized interfaces tailored to your organization's needs

## Common Use Cases

Port AI excels at helping platform engineers and developers with:

**Information Discovery:**
- "Who is the owner of service X?"
- "How many services do we have in production?"
- "Show me all microservices owned by the Backend team"
- "What are the dependencies of the OrderProcessing service?"

**Quality and Compliance Analysis:**
- "Which services are failing our security requirements scorecard?"
- "What's preventing the InventoryService from reaching Gold level?"
- "Show me the bug count vs. test coverage for all Java microservices"

**Running Actions:**
- "Can you help me deploy service X to production?"
- "Create a new incident report for the payment service outage"
- "Set up a new microservice using our standard template"
- "Notify the reviewers of pull request #1234"

## LLM Models and Providers

Port AI uses state-of-the-art Large Language Models to power all AI interactions. We offer two approaches:

### Port's Managed AI Infrastructure
By default, Port AI uses our managed AI infrastructure with enterprise-grade security and automatic updates.

### Bring Your Own LLM
For organizations requiring additional control, Port supports configuring your own LLM providers. This allows for data privacy control, cost optimization, and compliance with specific organizational requirements.

For comprehensive information about LLM provider management, see [LLM Provider Management](/ai-interfaces/port-ai/llm-providers-management/overview).

## Limits and Usage

Port AI operates with specific limits to ensure optimal performance for all users:

### Rate Limits (Hourly)
- **Request limit**: 1,000 requests per hour
- **Token usage limit**: 800,000 tokens per hour
- These limits reset hourly

### Monthly Quota
- **Default quota**: 20 AI invocations per month
- Each interaction with Port AI counts as one request against your quota
- Quota resets monthly

:::tip Managing Usage
Monitor your usage through API response headers and the quota endpoint (`/v1/quota/ai-invocations`). When approaching limits, consider implementing rate limiting in your applications or optimizing your AI interactions for efficiency.
:::

## Security and Permissions

Port AI respects your organization's security controls:

- **RBAC compliance**: Port AI only accesses data you have permissions to view
- **Data governance**: All interactions respect your configured data access policies  
- **Audit trail**: AI interactions are logged and trackable
- **Secure processing**: All data processing happens within Port's secure infrastructure

For detailed security information, see [AI Security and Data Controls](/ai-interfaces/port-ai/security-and-data-controls).

## AI Invocations

Every interaction with Port AI creates a detailed AI invocation record in Port, providing comprehensive tracking and analysis capabilities. AI invocations act as execution logs that capture the complete lifecycle of each interaction.

### What AI Invocations Track

Each AI invocation record includes:

- **Who asked**: User identity and context for the interaction
- **What they asked**: The original prompt or question submitted
- **AI response**: The complete response provided by Port AI
- **Tools used**: Detailed log of which tools were executed and their results
- **Execution plan**: How Port AI decided to tackle the request and intended steps
- **Timing information**: Request timestamps and response duration
- **Token usage**: Input and output token consumption for the interaction

### Accessing AI Invocations

AI invocations are stored as entities in your Port catalog using the `_ai_invocation` blueprint. You can view them in the AI Invocations catalog page, or query it programmatically via the API.

### Benefits of AI Invocation Tracking

AI invocation records help you:

- **Monitor usage patterns**: Understand how Port AI is being used across your organization
- **Debug interactions**: Analyze what tools were used and why certain responses were generated
- **Audit compliance**: Maintain detailed logs of all AI interactions for governance
- **Optimize performance**: Identify inefficient queries or improve prompt strategies
- **Track usage**: Monitor usage and interaction frequency
- **Improve accuracy**: Provide feedback and identify areas for improvement

### AI Invocation Details

Each AI invocation provides detailed information about how Port AI processed your request:

#### Plan

The plan shows how Port AI decided to tackle your request and the steps it intended to take. This provides insight into the AI's reasoning process and helps you understand the approach taken for your specific query.

<img src='/img/ai-agents/AIAgentsPlan.png' width='80%' border='1px' />

#### Tools Used

This section displays the actual steps Port AI took and the tools it used to complete your request. This information shows which MCP tools were executed, what data was accessed, and how the information was processed to generate the response.

This information can be particularly helpful for debugging when answers don't meet expectations, such as when Port AI:

- Used an incorrect field name
- Chose an inappropriate property  
- Made other logical errors

<img src='/img/ai-agents/AIAgentsTools.png' width='80%' border='1px' />

#### Execution Details

Each invocation record also includes:
- **Request timestamp**: When the interaction was initiated
- **User context**: Who made the request and from what interface

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
- **Port AI Assistant** - Dedicated chat interface *(documentation coming soon)*
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

**Rate Limits (Hourly):**
- Request limit: 1,000 requests per hour
- Token usage limit: 800,000 tokens per hour
- These limits reset hourly

**Monthly Quota:**
- Default quota: 20 AI invocations per month
- Each interaction with Port AI counts as one request
- Quota resets monthly

You can monitor your usage through API response headers and the quota endpoint (`/v1/quota/ai-invocations`). When you reach a limit, access resumes automatically when the limit resets.
</details>

<details>
<summary><b>Which LLM models does Port AI use? (Click to expand)</b></summary>

Port AI uses advanced language models depending on the interface and configuration:

**Port's Managed Infrastructure (Default):**
- **GPT models**: For reliable performance and broad 
compatibility
- **Claude Sonnet**: For enhanced reasoning and 
analysis capabilities

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

Port AI can search, group, and index entities in your Port instance. However, there are some technical limitations to be aware of:

- **Search capabilities**: 
  - Search API returns up to 25 entities.
  - Similarity search returns up to 10 entities.
  - Similarity search indexes the first 8K tokens of identifier, title, and string properties above 50 characters (ignoring content beyond 8K tokens).

- **Data processing limits**:
  - 1 interaction for the plan, and up to 5 interactions for the execution (tools/final answer).
  - LLM output is limited to 2000 tokens per interaction.
  - Entities grouping tool can return count by property, scorecard, or relation (with additional filters supported like in the search tool).
  - Entities grouping can return up to 50 groups.
  - Entities search returns up to 10 related entities for each entity.
  - Entities search returns only the scorecard level (e.g., you can't ask about specific rules).

- **Context requirements**:
  - To select an action, all the blueprints of the entity selection fields must be included in the accessible blueprints.
  - The response can only be based on relations that can be achieved from the allowed blueprints.

- **Permission model**:
  - Interaction with Port AI is based on your user permissions.
  - Sequential automations run as Admin.

</details>
