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
POST /agent/{agent_identifier}/invoke?stream=true&useMCP=true
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
POST /ai/invoke
{
  "query": "your question",
  "userSystemPrompt": "optional custom instructions",
  "tools": ["optional", "tool", "list"]
}
```

This endpoint doesn't require pre-configured agents, automatically uses streaming and MCP, and provides out-of-the-box intelligence.

</TabItem>
</Tabs>

:::info API Reference
The new API uses streaming responses for real-time results. Full [API reference](/ai-interfaces/port-ai/api-interaction) and implementation details will be shared by Oct 1st.
:::

### ⚙️ Workflow Automations

**Who's affected:** Teams using AI agents in automations  
**What changes:** Parameter updates and endpoint migration

#### Phase 1 - Now

- Automations are assumed to use specific agents using the `/agent/{agent_identifier}/invoke` endpoint  
- Add `useMCP=true` and `stream=true` to all automation configurations  
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

Edit your AI agent widgets to toggle on the `useMCP` flag. Test to ensure it works as expected.

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

1. Review the new schema requirements in your Port environment (schemas will be shared by Oct 1st)  
2. Update your AI agent entities during Phase 1  
3. Test functionality before automatic migration

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
- [ ] Update API calls with `stream=true` and `useMCP=true`  
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