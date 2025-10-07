---
sidebar_position: 8
title: Port AI closed-beta migration guide
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Port AI Platform Migration Guide

:::warning Migration Required
This guide covers the migration from the legacy AI system to the new Port AI platform. All users must complete this migration by **October 15, 2025** to continue using AI features.
:::

## What's Changing

We're excited to announce a major upgrade to Port's AI capabilities that will transform how you interact with your developer portal. This migration introduces our new **[Port AI assistant](/ai-interfaces/port-ai/overview)** - an intelligent, context-aware agent that understands your entire engineering ecosystem.

### Key Improvements

**🤖 Enhanced Port AI Assistant**  
An out-of-the-box intelligent agent with [MCP (Model Context Protocol)](/ai-interfaces/port-mcp-server/overview-and-installation) support, providing instant insights about your services, ownership, incidents, and engineering operations with improved accuracy and performance.

**🎨 Enhanced UI Experience**  
A completely redesigned interface optimized for AI-powered workflows, making it easier to get answers and take actions through natural language.

**🔄 Upgraded Architecture**  
Streaming responses, improved performance, and better extensibility for AI-powered operations across your engineering platform. Your existing [AI agents](/ai-interfaces/ai-agents/overview) will continue to work with updated schemas.

**✨ Using Anthropic Sonnet 4 model**  
Using the advanced Sonnet 4 model for better results using the [Port MCP server](/ai-interfaces/port-mcp-server/overview-and-installation), increased accuracy is achieved. If you wish to continue using OpenAI GPT models, contact the AI team for further instructions. 

:::info Model Performance
We observed lower accuracy with OpenAI GPT models and recommend keeping the Sonnet models (provided by our cloud infrastructure in similar measures like OpenAI models).
:::

## Migration Timeline & Phases

### Phase 1: Transition Period (October 1-15, 2025)

:::tip Testing Period
During this phase, you can test the new system while your existing integrations continue to work.
:::

- New Port AI is available with backward compatibility  
- Existing AI agents continue working  
- Time to test and migrate at your pace

### Phase 2: Full Migration (October 15, 2025+)

:::warning End of Compatibility
After October 15, backward compatibility will be removed and all integrations must use the new system.
:::

- Backward compatibility removed  
- All integrations must use new endpoints and schemas

## Migration Guide by Interface

### 🔌 API Integrations

**Who's affected:** Customers using custom AI API integrations  
**What changes:** Endpoint updates and required parameters

:::warning Endpoint Deprecation
The `/agent/invoke` endpoint (agent router) will be deprecated. You have two migration paths to choose from.
:::

You have two migration paths:

<Tabs groupId="migration-path" queryString>
<TabItem value="ai-agents" label="Option 1: Use AI Agents">

**Best for:** Integrations where YOU build the logic to select which agent to route to based on context, OR if you use one general agent.

<h4>Phase 1 - Now</h4>

Update your API calls to include new parameters:

```javascript showLineNumbers
// Current
POST /agent/invoke
{
  "query": "your question",
  "agent_id": "agent_identifier"
}

// Update to (specific agent - you choose which one)
POST /agent/{agent_identifier}/invoke?stream=true&use_mcp=true
{
  "query": "your question",
}
```

<h4>Phase 2 - By October 15</h4>

Continue using the same `/agent/{agent_identifier}/invoke` endpoint with updated blueprint schemas. The updated schemas will be sent prior to this date.

</TabItem>
<TabItem value="ai-assistant" label="Option 2: Use New AI Assistant">

**Best for:** Generic "ask Port AI anything" integrations

<h4>Phase 1 - Now</h4>

Migrate directly to the new AI assistant:

```javascript showLineNumbers
// Migrate to
POST /v1/ai/invoke
{
  "userPrompt": "what services do we have?",
  "labels": {
    "source": "test"
  },
  "systemPrompt": "you are a devops guru at the company, your task is to help developers with software infrastructure stuff",
  "executionMode": "Manual Approval",
  "tools": ["^(list|get|search|track|describe)_.*"]
}
```

### Request Parameters

The `/v1/ai/invoke` endpoint accepts the following parameters:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userPrompt` | string | ✅ | The user's question or request in natural language |
| `systemPrompt` | string | ❌ | Custom instructions that provide context about your organization, terminology, or specific requirements for the AI to consider in each request |
| `executionMode` | string | ❌ | Controls how action execution tools behave. Options: `"Automatic"` or `"Manual Approval"` (default: `"Manual Approval"`) |
| `tools` | array | ❌ | Array of regex patterns to control which [Port MCP tools](/ai-interfaces/port-ai/api-interaction#tool-selection) are available. Default: `["^(list|get|search|track|describe)_.*"]` |
| `labels` | object | ❌ | Free-form labels for tracking and filtering AI invocations (e.g., `{"source": "monitoring", "environment": "production"}`) |

### Execution Modes

The `executionMode` parameter controls how Port AI handles action execution tools:

- **`"Manual Approval"`** (default): Port AI creates draft actions that require your review before execution
- **`"Automatic"`**: Port AI executes actions immediately based on your request

:::info Tool Selection
The `tools` parameter uses regex patterns to control which MCP tools are available. For example:
- `["^(list|get|search|track|describe)_.*"]` - Read-only operations only
- `["^run_.*"]` - Action execution only  
- `["run_.*github.*", "run_.*jira.*"]` - Specific integration actions

Learn more about [tool selection patterns](/ai-interfaces/port-ai/api-interaction#tool-selection).
:::

This endpoint doesn't require pre-configured agents, automatically uses streaming and MCP, and provides out-of-the-box intelligence.

<details>
<summary><b>Migration Examples (Click to expand)</b></summary>

Here are practical examples of migrating from the old `/agent/invoke` endpoint to the new `/v1/ai/invoke` endpoint:

**Example 1: Basic Query Migration**
```javascript showLineNumbers
// Old endpoint
POST /agent/invoke
{
  "query": "What services are failing health checks?",
  "agent_id": "monitoring_agent"
}

// New endpoint
POST /v1/ai/invoke
{
  "userPrompt": "What services are failing health checks?",
  "systemPrompt": "You are a monitoring specialist. Focus on health metrics and provide actionable insights.",
  "executionMode": "Manual Approval",
  "tools": ["^(list|get|search)_.*"],
  "labels": {
    "source": "monitoring_dashboard",
    "environment": "production"
  }
}
```

**Example 2: Action Execution Migration**
```javascript showLineNumbers
// Old endpoint
POST /agent/invoke
{
  "query": "Create an incident for the payment service",
  "agent_id": "incident_agent"
}

// New endpoint
POST /v1/ai/invoke
{
  "userPrompt": "Create an incident for the payment service",
  "systemPrompt": "You are an incident response specialist. Always include severity levels and impact assessment.",
  "executionMode": "Automatic",
  "tools": ["^(list|get|search)_.*", "run_.*incident.*"],
  "labels": {
    "source": "automation",
    "service": "payment",
    "trigger": "health_check_failure"
  }
}
```

</details>

</TabItem>
</Tabs>

:::info API Reference
The new API uses streaming responses for real-time results. See the [API interaction documentation](/ai-interfaces/port-ai/api-interaction) for complete details on request/response formats, streaming events, and error handling.
:::

### ⚙️ Workflow Automations

**Who's affected:** Teams using AI agents in automations  
**What changes:** Parameter updates and endpoint migration

#### Phase 1 - Now

- Automations are assumed to use specific agents using the `/agent/{agent_identifier}/invoke` endpoint  
- Add `use_mcp=true` and `stream=true` to all automation configurations  
- Test automations with new parameters

#### Phase 2 - By October 15

- Once updated by Port's team, you can remove the query parameters as they will be used by default  
- Update your blueprints schemas. The updated schemas will be sent prior to this date

### 💬 Slack Integration

**Who's affected:** Teams using Port AI through Slack  
**What changes:** Service interruption starting October 1

:::caution Service Interruption
Slack integration will stop working completely during the migration. No backward compatibility will be provided.
:::

**Timeline:**

- **October 1:** Slack integration stops working  
- **Q1 2026:** New integration planned (subject to change)

**Immediate Action Required:**

- Stop using Slack integration  
- Switch to Port web UI or API integration


### 🖥️ AI Agent Widget (UI)

**Who's affected:** Teams using AI widgets in the Port UI  
**What changes:** None - seamless automatic migration

:::tip Easy Migration
This is the simplest migration path with minimal manual work required.
:::

Edit your AI agent widgets to toggle on the `use_mcp` flag. Test to ensure it works as expected.

By October 15th, the remaining widgets will be automatically migrated to this flag, so the behavior will change to use the new MCP behind the scenes, including the usage of the Anthropic Sonnet 4 model.

## Blueprint Schema Updates

### Affected Blueprints

Two system blueprints require schema updates:

- `ai_invocation` blueprint  
- `ai_agent` blueprint

### Phase 1 - By October 15

:::info Schema Compatibility
Both old and new schemas will be supported during this period to ensure smooth transition.
:::

- Manually update your AI agent entities to match the new schema  
- Verify everything works correctly with the new schema  
- This must come AFTER you have completed the integrations migration

### Phase 2 - October 15+

:::warning Schema Migration
Schemas will be automatically migrated. Existing agents might break if not updated in Phase 1.
:::

- Schemas will be automatically migrated  
- Existing agents might break if not updated in Phase 1  
- Only new schemas are supported

### Action Required

1. **By October 8th:** Manually update your AI agent entities to the new schema format for testing and adjustment
2. **October 8-15:** Test functionality with the new schema to ensure everything works correctly
3. **October 15th+:** Automatic migration will occur - agents not manually updated may break

### New AI Agent Schema

:::warning Manual Schema Update Required
Starting **October 8th**, you must manually update your AI blueprints schemas to the new format for testing and adjustment.

Starting **October 15th**, schemas will be automatically migrated, but existing agents might break if not manually updated during the testing period.
:::

<details>
<summary><b>View the new AI agent schema (Click to expand)</b></summary>

```json
{
  "identifier": "_ai_agent",
  "title": "AI Agent",
  "icon": "Details",
  "ownership": {
    "type": "Direct",
    "title": "Owning Teams"
  },
  "schema": {
    "properties": {
      "description": {
        "icon": "DefaultProperty",
        "type": "string",
        "title": "Description",
        "description": "Brief explanation of what this agent does"
      },
      "status": {
        "icon": "DefaultProperty",
        "title": "Status",
        "description": "Is the agent active (available to be run manually, or allowed to operate autonomously)",
        "type": "string",
        "enum": [
          "active",
          "inactive"
        ],
        "enumColors": {
          "active": "green",
          "inactive": "red"
        },
        "default": "active"
      },
      "tools": {
        "items": {
          "type": "string"
        },
        "icon": "DefaultProperty",
        "type": "array",
        "title": "Tools",
        "description": "An array of tools that the agent is allowed to execute. Docs: https://docs.port.io/ai-interfaces/port-ai/api-interaction#tool-selection",
        "default": [
          "^(list|get|search|track|describe)_.*"
        ]
      },
      "prompt": {
        "icon": "DefaultProperty",
        "type": "string",
        "maxLength": 2500,
        "title": "Prompt",
        "format": "markdown",
        "description": "The system prompt for the agent. Where the agent is manually invoked, a user prompt will be provided in the invocation"
      },
      "execution_mode": {
        "title": "Execution Mode",
        "type": "string",
        "enum": [
          "Automatic",
          "Approval Required"
        ],
        "default": "Approval Required",
        "description": "The execution mode for actions - Automatic or requiring approval"
      },
      "conversation_starters": {
        "items": {
          "type": "string"
        },
        "icon": "Chat",
        "type": "array",
        "title": "Conversation Starters",
        "description": "Predefined conversation starter messages to help users interact with this agent"
      },
      "provider": {
        "type": "string",
        "title": "Provider",
        "description": "The provider of the agent"
      },
      "model": {
        "type": "string",
        "title": "Model",
        "description": "The model of the agent"
      },
      "labels": {
        "type": "object",
        "title": "Labels",
        "description": "Free labels to identify specific attributes on the agent"
      }
    },
    "required": [
      "tools",
      "status",
      "prompt"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {
    "total_invocations": {
      "title": "Total Invocations",
      "type": "number",
      "description": "The number of invocations for this agent",
      "target": "_ai_invocations",
      "calculationSpec": {
        "func": "count",
        "calculationBy": "entities"
      }
    },
    "average_input_tokens": {
      "title": "Average input tokens",
      "type": "number",
      "description": "The average input tokens for this agent invocations",
      "target": "_ai_invocations",
      "calculationSpec": {
        "func": "median",
        "property": "prompt_tokens",
        "calculationBy": "property"
      }
    },
    "average_output_tokens": {
      "title": "Average output tokens",
      "type": "number",
      "description": "The average output tokens for this agent invocations",
      "target": "_ai_invocations",
      "calculationSpec": {
        "func": "median",
        "property": "completion_tokens",
        "calculationBy": "property"
      }
    }
  },
  "relations": {}
}
```

</details>

<details>

<summary><b>View the new AI Invocation schema (Click to expand)</b></summary>

```json
{
	"identifier": "_ai_invocations",
	"description": "For each agent request a match feedback entity will be created",
	"title": "AI Invocation",
	"icon": "Star",
	"schema": {
		"properties": {
			"status": {
				"icon": "DefaultProperty",
				"title": "Status",
				"type": "string",
				"description": "The agent invocation status",
				"enum": ["In Progress", "Completed", "Failed"],
				"enumColors": {
					"In Progress": "blue",
					"Completed": "green",
					"Failed": "red"
				}
			},
			"asked_at": {
				"type": "string",
				"title": "Asked At",
				"icon": "Calendar",
				"description": "When the agent was invoked",
				"format": "date-time"
			},
			"replied_at": {
				"type": "string",
				"title": "Replied At",
				"icon": "Calendar",
				"description": "When the agent replied",
				"format": "date-time"
			},
			"prompt": {
				"type": "string",
				"title": "Prompt",
				"description": "The prompt sent to the agent, including both the user and the agent prompt",
				"format": "markdown"
			},
			"error": {
				"type": "string",
				"description": "Detailed description of an error in case of failed execution",
				"title": "Error"
			},
			"response": {
				"type": "string",
				"description": "The final agent response",
				"title": "Response",
				"format": "markdown"
			},
			"execution_logs": {
				"type": "string",
				"description": "The reasoning and tools execution logs",
				"format": "markdown",
				"title": "Execution Logs"
			},
			"labels": {
				"type": "object",
				"description": "Free labels to identify specific attributes on the invocation",
				"title": "Labels"
			},
			"quota": {
				"type": "object",
				"description": "The quota usage",
				"title": "Quota"
			},
			"provider": {
				"type": "string",
				"title": "Provider",
				"description": "The LLM provider used for the invocation"
			},
			"model": {
				"type": "string",
				"title": "Model",
				"description": "The LLM model used for the invocation"
			}
		},
		"required": ["asked_at", "status"]
	},
	"mirrorProperties": {
		"agent_title": {
			"title": "agent title",
			"path": "agent.$title"
		}
	},
	"calculationProperties": {},
	"aggregationProperties": {},
	"relations": {
		"agent": {
			"title": "Agent",
			"description": "The agent that was invoked",
			"target": "_ai_agent",
			"required": false,
			"many": false
		}
	},
	"ownership": {
		"type": "Inherited",
		"title": "Owning Teams",
		"path": "agent"
	}
}
```
</details>

## Updated Quotas & Rate Limits

With the open beta launch, new monthly quotas and rate limits apply immediately:

:::info Quota Changes
These limits apply immediately upon migration to ensure system stability and fair usage.
:::

- Monthly quotas adjusted based on your plan type  
- Hourly rate limits for system protection

If you reach these limits, reach out to us to make sure you have the right limit. 

## Migration Checklist

### ✅ Immediate Actions

- [ ] Identify all AI agent usage points (API, Automations, Slack, UI)  
- [ ] Stop using Slack integration  
- [ ] Plan your migration plan  
- [ ] Update API calls with `stream=true` and `use_mcp=true`  
- [ ] Update automation & AI widgets parameters  
- [ ] Test integrations with new parameters  
- [ ] Migrate to the new schema

### 📋 By October 15 (Phase 1) 

- [ ] Complete schema migration  
- [ ] Update to final API endpoints  
- [ ] Remove legacy configurations  
- [ ] Verify all integrations work

## Support & Resources

### 📚 Documentation

For more details on specific migration topics, see:

- [Port AI Overview](/ai-interfaces/port-ai/overview) - Understanding the new AI system
- [AI API Interaction](/ai-interfaces/port-ai/api-interaction) - API reference and examples  
- [AI Agents Overview](/ai-interfaces/ai-agents/overview) - Working with AI agents
- [Port MCP Server](/ai-interfaces/port-mcp-server/overview-and-installation) - Model Context Protocol integration

### 💬 Get Help

- Contact Port's AI team through your shared Slack channel  
- Reach out to your Technical Success Manager

## Frequently Asked Questions

<details>
<summary><b>What do I need to do now? (Click to expand)</b></summary>

Check if you're using API integrations, workflow automations, or Slack with AI agents. API and automations need updates by October 15, Slack users should switch to alternatives immediately.

</details>

<details>
<summary><b>Will my existing AI agents break? (Click to expand)</b></summary>

They'll continue working during October with backward compatibility. You must migrate to new schemas by October 15 or they might break during automatic migration.

</details>

<details>
<summary><b>Why are you making this change? (Click to expand)</b></summary>

Based on your feedback, we've upgraded our infrastructure to provide better performance, streaming responses, and [MCP support](/ai-interfaces/port-mcp-server/overview-and-installation) while maintaining your existing AI agents with improved capabilities.

</details>

<details>
<summary><b>When will Slack integration be available again? (Click to expand)</b></summary>

We're targeting Q1 2025 for the new Slack integration, but this timeline may change.

</details>

<details>
<summary><b>Is this production-ready? (Click to expand)</b></summary>

This is an open beta release. While fully functional, it's not recommended for production-critical workflows initially.

</details>

---

*We're committed to making this migration as smooth as possible. The new Port AI represents a significant leap forward in how platform teams can leverage AI to accelerate their engineering operations.*