# Port AI Platform Migration Guide

## What's Changing

We're excited to announce a major upgrade to Port's AI capabilities that will transform how you interact with your developer portal. This migration introduces our new **Port AI assistant** \- an intelligent, context-aware agent that understands your entire engineering ecosystem.

### Key Improvements

**🤖 Enhanced Port AI Assistant**  
An out-of-the-box intelligent agent with MCP (Model Context Protocol) support, providing instant insights about your services, ownership, incidents, and engineering operations with improved accuracy and performance.

**🎨 Enhanced UI Experience**  
A completely redesigned interface optimized for AI-powered workflows, making it easier to get answers and take actions through natural language.

**🔄 Upgraded Architecture**  
Streaming responses, improved performance, and better extensibility for AI-powered operations across your engineering platform. Your existing AI agents will continue to work with updated schemas.

**✨ Using Anthropic Sonnet 4 model**  
Using the advanced Sonnet 4 model for better results using the Port MCP server, increased accuracy is achieved. If you wish to continue using OpenAI GPT models, contact the AI team for further instructions. Please note that we observed lower accuracy and recommend keeping the Sonnet models (provided by our cloud infrastructure in similar measures like OpenAI models).

## Migration Timeline & Phases

### Phase 1: Transition Period (October 1-15, 2025\)

- New Port AI is available with backward compatibility  
- Existing AI agents continue working  
- Time to test and migrate at your pace

### Phase 2: Full Migration (October 15, 2025+)

- Backward compatibility removed  
- All integrations must use new endpoints and schemas

## Migration Guide by Interface

### 🔌 API Integrations

**Who's affected:** Customers using custom AI API integrations  
**What changes:** Endpoint updates and required parameters

**Important:** The `/agent/invoke` endpoint (agent router) will be deprecated. You have two migration paths:

#### Option 1: Use AI Agents (build your own routing logic)

Best for: Integrations where YOU build the logic to select which agent to route to based on context, OR if you use one general agent.

##### Phase 1 \- Now

Update your API calls to include new parameters:

```javascript
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

##### Phase 2 \- By October 15

Continue using the same `/agent/{agent_identifier}/invoke` endpoint with updated blueprint schemas.  
The updated schemas will be sent prior to this date.

#### Option 2: Use New AI Assistant (no agent configuration)

Best for: Generic "ask Port AI anything" integrations

##### Phase 1 \- Now

Migrate directly to the new AI assistant:

```javascript
// Migrate to
POST /ai/invoke
{
  "query": "your question",
  "userSystemPrompt": "optional custom instructions",
  "tools": ["optional", "tool", "list"]
}
```

This endpoint doesn't require pre-configured agents, automatically uses streaming and MCP, and provides out-of-the-box intelligence.

**Note:** The new API uses streaming responses for real-time results. Full API reference and implementation details will be shared by Oct 1st.

### 

### ⚙️ Workflow Automations

**Who's affected:** Teams using AI agents in automations  
**What changes:** Parameter updates and endpoint migration

#### Phase 1 \- Now

- Automations are assumed to use specific agents using the `/agent/{agent_identifier}/invoke` endpoint  
- Add `useMCP=true` and `stream=true` to all automation configurations  
- Test automations with new parameters

#### Phase 2 \- By October 15

- Once updated by Port’s team, you can remove the query parameters as they will be used by default.  
- Update your blueprints schemas. The updated schemas will be sent prior to this date.

### 

### 💬 Slack Integration

**Who's affected:** Teams using Port AI through Slack  
**What changes:** ⚠️ **Service interruption starting October 1**

**Important:** Slack integration will stop working completely during the migration. No backward compatibility will be provided.

**Timeline:**

- **October 1:** Slack integration stops working  
- **Q1 2025:** New integration planned (subject to change)

**Immediate Action Required:**

- Stop using Slack integration  
- Switch to Port web UI or API integration


### 🖥️ AI Agent Widget (UI)

**Who's affected:** Teams using AI widgets in the Port UI  
**What changes:** None \- seamless automatic migration

Edit your AI agent widgets to toggle on the `useMCP` flag. Test to ensure it works as expected.    
By October 15th, the remaining widgets will be automatically migrated to this flag, so the behavior will change to use the new MCP behind the scenes, including the usage of the Anthropic Sonnet 4 model.

## Blueprint Schema Updates

### Affected Blueprints

Two system blueprints require schema updates:

- `ai_invocation` blueprint  
- `ai_agent` blueprint

### Phase 1 \- By October 15

- Manually update your AI agent entities to match the new schema  
- Verify everything works correctly with the new schema  
- Both old and new schemas will be supported during this period  
- This must come AFTER you have completed the integrations migration

### Phase 2 \- October 15 \+

- Schemas will be automatically migrated  
- Existing agents might break if not updated in Phase 1  
- Only new schemas are supported

### Action Required

1. Review the new schema requirements in your Port environment (schemas will be shared by Oct 1st)  
2. Update your AI agent entities during Phase 1  
3. Test functionality before automatic migration  
   

## Updated Quotas & Rate Limits

With the open beta launch, new monthly quotas and rate limits apply immediately:

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

### 📋 By October 15 (Phase 1\) 

- [ ] Complete schema migration  
- [ ] Update to final API endpoints  
- [ ] Remove legacy configurations  
- [ ] Verify all integrations work

## 

## Support & Resources

### 📚 Documentation

* [API Migration Guide](http://link-placeholder)  
* [Blueprint Schema Changes](http://link-placeholder)  
* [Streaming Response Handling](http://link-placeholder)

### 💬 Get Help

* Contact Port's AI team through your shared Slack channel  
* Reach out to your Technical Success Manager

## FAQs

**Q: What do I need to do now?**  
A: Check if you're using API integrations, workflow automations, or Slack with AI agents. API and automations need updates by October 31, Slack users should switch to alternatives immediately.

**Q: Will my existing AI agents break?**  
A: They'll continue working during October with backward compatibility. You must migrate to new schemas by November 1 or they might break during automatic migration.

**Q: Why are you making this change?**  
A: Based on your feedback, we've upgraded our infrastructure to provide better performance, streaming responses, and MCP support while maintaining your existing AI agents with improved capabilities.

**Q: When will Slack integration be available again?**  
A: We're targeting Q1 2025 for the new Slack integration, but this timeline may change.

**Q: Is this production-ready?**  
A: This is an open beta release. While fully functional, it's not recommended for production-critical workflows initially.

---

*We're committed to making this migration as smooth as possible. The new Port AI represents a significant leap forward in how platform teams can leverage AI to accelerate their engineering operations.*  