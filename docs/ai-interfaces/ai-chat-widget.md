---
sidebar_position: 3
title: AI Chat Widget
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# AI Chat Widget

The AI Chat Widget provides a customizable interface for interacting with [Port AI](/ai-interfaces/port-ai/overview) directly within your dashboards. Platform engineers can configure the widget's prompts, conversation starters, and available tools to create tailored AI chat experiences for developers.

## What is the AI Chat Widget?

The AI Chat Widget is a dashboard component that:

- **Provides chat interface**: Renders an interactive chat experience for Port AI
- **Displays conversation starters**: Shows predefined prompts to help users get started
- **Uses configured tools**: Operates with the specific Port AI tools you select
- **Customizable placement**: Can be embedded in any dashboard layout
- **Respects permissions**: Only accesses data based on user permissions

## Widget Configuration

When setting up an AI Chat Widget, you can customize three key aspects:

### Custom Prompts
Configure the system prompt that guides how Port AI responds within the widget. This allows you to:
- Set the tone and style of responses
- Focus on specific domain knowledge 
- Provide context about your organization or use case
- Guide the AI's behavior for your specific audience

### Conversation Starters
Define predefined prompts that appear as clickable options when users first interact with the widget. Examples include:
- "Show me services failing security checks"
- "What's the status of my team's deployments?"
- "Help me understand our incident response process"
- "Find microservices with high bug counts"

### Tool Selection
Choose which Port AI tools the widget can access, allowing you to:
- Limit functionality to specific use cases
- Control what data the widget can query
- Ensure appropriate permissions and access levels
- Focus the AI's capabilities on relevant areas

## Setting Up the Widget

Follow these steps to add an AI Chat Widget to your dashboard:

1. Navigate to the dashboard where you want to add the widget
2. Click on `+ Widget`
3. Select `AI Chat` from the widget options
4. Configure your widget settings:
   - **Custom Prompt**: Set the system prompt for AI behavior
   - **Conversation Starters**: Add predefined prompts for users
   - **Tools**: Select which Port AI tools to enable
   - **Title**: Set a descriptive name for the widget
5. Position the widget in your dashboard grid
6. Save your dashboard configuration
7. Start asking questions through the chat interface

<img src='/img/ai-agents/AIAgentWidgetMenu.png' width='80%' border='1px' />

## Using the Widget

Once configured, the AI Chat Widget provides an intuitive interface:

### Conversation Starters
When users first interact with the widget, they'll see the conversation starters you configured. These appear as clickable buttons that immediately send the predefined prompt to Port AI.

### Chat Interface  
Users can type their own questions and requests directly into the chat interface. The widget will:
- Process requests using the configured prompt and tools
- Display responses in a conversational format
- Show visual indicators when tools are being used
- Provide links to relevant Port pages and actions

### Tool Transparency
The widget interface provides enhanced capabilities and visual indicators showing which tools are being used:

<img src='/img/ai-agents/AIAgentsMCPWidgetUI.png' width='80%' border='1px' />

This transparency helps users understand how Port AI is processing their requests and which data sources are being accessed.

## Tool Execution Modes

The AI Chat Widget supports only manual execution mode for actions and tools. Learn more about [tool execution modes in Port AI](/ai-interfaces/port-ai/overview#tool-execution-modes).

## Example Use Cases

Here are practical examples of AI Chat Widgets configured for specific use cases:

<Tabs groupId="widget-examples" queryString>
<TabItem value="day-planner" label="Day Planner">

**Use Case**: Help developers plan their day by focusing on Jira issues, pull requests, and task prioritization.

**Best Placement**: Personal developer dashboard or "Plan My Day" dashboard

TODO: Add screenshot of Day Planner widget in action

<details>
<summary>Widget Configuration</summary>

**Custom Prompt:**
```
Your goal is to help developers plan their day. Focus on Jira issues, Pull requests, and help prioritize the user's day. Make sure you have clear team and task assignments. Always prioritize by urgency and impact. When showing tasks, include due dates and assignees.
```

**Conversation Starters:**
- "What should I work on today?"
- "Show me my urgent Jira tickets"
- "Help me prioritize my pull requests"
- "What's blocking my team today?"

**Recommended Tools:**
- Jira integration tools
- Git/PR management tools
- Team and assignment queries

</details>

</TabItem>
<TabItem value="incident-response" label="Incident Response">

**Use Case**: Quick access to incident-related information and response tools during outages.

**Best Placement**: Operations dashboard or SRE incident response dashboard

TODO: Add screenshot of Incident Response widget during an active incident

<details>
<summary>Widget Configuration</summary>

**Custom Prompt:**
```
You are an incident response assistant. Help users quickly find information about ongoing incidents, affected services, and response procedures. Focus on actionable information and provide clear next steps. Always include severity levels and impact assessment.
```

**Conversation Starters:**
- "Show me active incidents"
- "Which services are currently down?"
- "Help me create an incident report"
- "Who should I contact for the payment service?"

**Recommended Tools:**
- Incident management tools
- Service status queries
- Notification and escalation tools

</details>

</TabItem>
<TabItem value="security-compliance" label="Security Compliance">

**Use Case**: Monitor security compliance across services and identify security issues.

**Best Placement**: Security dashboard or compliance monitoring dashboard

TODO: Add screenshot of Security Compliance widget showing security scorecard results

<details>
<summary>Widget Configuration</summary>

**Custom Prompt:**
```
You are a security compliance assistant. Help users understand security posture, identify vulnerabilities, and track compliance with security standards. Always provide actionable recommendations and highlight critical security issues.
```

**Conversation Starters:**
- "Which services are failing security checks?"
- "Show me critical vulnerabilities"
- "What's our overall security score?"
- "Help me understand compliance gaps"

**Recommended Tools:**
- Security scorecard tools
- Vulnerability scanning queries
- Compliance reporting tools

</details>

</TabItem>
<TabItem value="deployment-status" label="Deployment Status">

**Use Case**: Track deployment status across environments and help with deployment planning.

**Best Placement**: CI/CD dashboard or deployment monitoring dashboard

TODO: Add screenshot of Deployment Status widget showing environment status

<details>
<summary>Widget Configuration</summary>

**Custom Prompt:**
```
You are a deployment assistant. Help users track deployment status, understand environment health, and plan deployments. Focus on current status, recent changes, and potential blockers. Always include environment information and deployment timelines.
```

**Conversation Starters:**
- "What's deployed in production today?"
- "Show me failed deployments"
- "When was the last deployment to staging?"
- "Help me plan my service deployment"

**Recommended Tools:**
- Deployment pipeline queries
- Environment status tools
- Release management tools

</details>

</TabItem>
</Tabs>

## Security Considerations

Port is committed to developing AI responsibly, maintaining high standards of data privacy and security. **[Learn more about our security & data controls →](/ai-interfaces/port-ai/security-and-data-controls)**

## Frequently Asked Questions

<details>
<summary><b>How do I add an AI Chat Widget to my dashboard? (Click to expand)</b></summary>

Follow these steps:
1. Go to the dashboard where you want to add the widget
2. Click `+ Widget`
3. Select `AI Chat` from the widget options
4. Configure your settings (prompt, conversation starters, tools)
5. Position and save the widget
6. Start asking questions

For detailed instructions, see [Setting Up the Widget](#setting-up-the-widget).
</details>

<details>
<summary><b>How can I customize what the AI Chat Widget does? (Click to expand)</b></summary>

You can customize three key aspects:
- **Custom Prompts**: Guide AI behavior and set tone
- **Conversation Starters**: Provide predefined prompts for users
- **Tool Selection**: Control which Port AI tools the widget can access

Learn more about [Widget Configuration](#widget-configuration).
</details>

<details>
<summary><b>What are some practical use cases for AI Chat Widgets? (Click to expand)</b></summary>

Common use cases include:
- **Day Planner**: Help developers prioritize tasks and Jira issues
- **Incident Response**: Quick access to incident information during outages
- **Security Compliance**: Monitor security posture and vulnerabilities
- **Deployment Status**: Track deployments across environments

See detailed examples in [Example Use Cases](#example-use-cases).
</details>

<details>
<summary><b>Can the AI Chat Widget run actions automatically? (Click to expand)</b></summary>

No, the AI Chat Widget supports only manual execution mode for actions and tools. When the AI suggests an action, you'll receive a link to review and approve it before execution.

Learn more about [Tool Execution Modes](#tool-execution-modes).
</details>

<details>
<summary><b>How do conversation starters work in the widget? (Click to expand)</b></summary>

Conversation starters appear as clickable buttons when users first interact with the widget. They immediately send predefined prompts to Port AI, helping users get started quickly with relevant questions.

See how to use them in [Using the Widget](#using-the-widget).
</details>

<details>
<summary><b>Can I create multiple AI Chat Widgets for different teams? (Click to expand)</b></summary>

Yes! You can create multiple widgets with different configurations:
- Team-specific prompts and tools
- Use case-focused widgets (monitoring, security, deployment)
- Role-based widgets with appropriate permissions

Each widget can be customized independently and placed on different dashboards.
</details>

<details>
<summary><b>What tools can the AI Chat Widget access? (Click to expand)</b></summary>

You can select which Port AI tools the widget can use during configuration. This allows you to:
- Limit functionality to specific use cases
- Control what data the widget can query
- Ensure appropriate permissions and access levels

Learn more about tool selection in [Widget Configuration](#widget-configuration).
</details>

<details>
<summary><b>How secure is the AI Chat Widget? (Click to expand)</b></summary>

The AI Chat Widget inherits all security controls from Port AI, including user permissions, data governance, and audit trails. Port is committed to developing AI responsibly with high standards of data privacy and security.

For comprehensive information, see [Security Considerations](#security-considerations).
</details>

The AI Chat Widget provides a powerful way to bring [Port AI](/ai-interfaces/port-ai/overview) capabilities directly into your team's daily workflows through customized dashboard experiences.
