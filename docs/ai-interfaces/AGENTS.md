---
sidebar_class_name: hidden
title: AGENTS.md - AI Documentation Maintenance Guide
---

# AGENTS.md - AI Documentation Maintenance Guide

This is a hidden guide for AI agents to understand how to maintain and update the AI interfaces documentation in Port Docs.

## File Structure

The AI interfaces documentation files are located in:
- `/docs/ai-interfaces/` - Main documentation files
- `/src/data/mcpTools.js` - MCP tool definitions (JSON file)
- `/src/components/ToolsList/` - React component that displays tools from `mcpTools.js`

## Common Tasks

### Update MCP Tools

To add, update, or remove MCP tools:

1. **Update the file**: `src/data/mcpTools.js`
2. **Ask for clarification**: Determine if the tool is for `builder` only or for both `developer` and `builder` roles
3. The `ToolsList` component automatically reads from this file and displays tools in the documentation

### Set Feature Beta Status

When asked to mark a feature as **open beta** or **closed beta**, use the appropriate component:

#### For Open Beta Features

Use the `BetaFeatureNotice` component:

```markdown
import BetaFeatureNotice from '/docs/generalTemplates/_beta_feature_notice.md'

<BetaFeatureNotice id="ai-form" />
```

**Location**: Place this after the page title (H1) and before the main content.

#### For Closed Beta Features

Use the `ClosedBetaFeatureNotice` component:

```markdown
import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md'

<ClosedBetaFeatureNotice id="feature-id" />
```

**Location**: Place this after the page title (H1) and before the main content.

**ID**: Use a specific feature identifier (e.g., `"slack-app"`). Check `/docs/generalTemplates/_closed_beta_feature_notice_defs.js` for available IDs and their custom messages. You might need to create a new definition, ask the user for this.

### Add New LLM Model

To add a new LLM model to the documentation:

1. **Identify the model name and providers**: Determine the exact model identifier (e.g., `gpt-5`) and which providers support it (e.g., Anthropic, AWS Bedrock).

2. **Update the main documentation file**: Edit `docs/ai-interfaces/port-ai/llm-providers-management/overview.md`:

3. **Note about API reference files**: The API reference files in `docs/api-reference/` (like `general-purpose-ai-interactions.api.mdx`, `invoke-a-specific-agent.api.mdx`, etc.) are auto-generated from OpenAPI specifications. These will be updated automatically when the backend API is updated. You don't need to manually edit these files.

### Update MCP Installation Instructions

The MCP installation instructions are maintained in a reusable component that is imported into the main documentation page.

**Location**: `/docs/generalTemplates/_mcp-installation.md`

**Usage**: This component is imported in `docs/ai-interfaces/port-mcp-server/overview-and-installation.md`.

**What you could update**:
- Add new client support
- Update client instructions
- Update disclaimers/warnings/admonitions

### Update Feature Support Matrix

The Feature Support Matrix table shows which capabilities are supported across Port's AI interfaces.

**Location**: `docs/ai-interfaces/overview.md` - in the "Feature Support Matrix" section

**Structure**:
- **Rows**: Each Port AI interface (Port MCP Server, Port AI Invocation, Port AI Agents, Port AI Chat Widget, Port Slack App, Port AI Assistant)
- **Columns**: Capabilities/features (Context Lake Query, Run Actions, Manage Blueprints, etc.)
- **Indicators**: 
  - ✅ = Supported
  - ❌ = Not supported

**Column Ordering Rules**:
1. **First columns**: Features that have at least one ✅ (supported by at least one interface)
2. **Last columns**: Features that have all ❌ (not supported by any interface)
3. **Final column**: "Manage Data Mapping" should always be the last column (it has all ❌)

**Current column order** (from first to last):
1. Feature (row identifier)
2. Context Lake Query
3. Run Actions
4. Manage Blueprints
5. Manage Entities
6. Manage Scorecards
7. Manage Actions
8. Reuse Prompts
9. Invoke AI Agents
10. Manage Pages & Widgets (all ❌)
11. Manage Integrations (all ❌)
12. Manage Data Mapping (all ❌ - must be last)

**When updating**:
- If a new feature is added that has all ❌, add it before "Manage Data Mapping" (which must remain last)
- If a feature's support status changes from all ❌ to having at least one ✅, move it to the appropriate position in the first group
- If a new AI interface is added, add it as a new row
- If a new capability is added, determine its position based on whether it has any ✅ or all ❌

**Format**:
- Use markdown table format
- Wrap the table in `<div style={{overflowX: 'auto'}}>` for horizontal scrolling on smaller screens
- Use emojis ✅ and ❌ (not text symbols)

### Update Monthly Limits

When asked to update the monthly quota/limit for AI invocations:

1. **Identify all locations**: Search for mentions of monthly limits/quota in the AI interfaces documentation:
   - `docs/ai-interfaces/port-ai/api-interaction.md` - Contains rate limits section and example JSON responses
   - `docs/ai-interfaces/port-ai/overview.md` - Contains limits section and FAQ entries

2. **Update text descriptions**: Replace the quota number in all text descriptions (e.g., "20 AI invocations per month" → "50 AI invocations per month")

3. **Update example JSON**: Update the `monthlyLimit` value in example JSON responses to match the new limit. Also update `remainingQuota` to be one less than the limit (e.g., if limit is 50, remainingQuota should be 49)

4. **Files to check**:
   - `docs/ai-interfaces/port-ai/api-interaction.md` - Lines with "Monthly Quota" section and JSON examples
   - `docs/ai-interfaces/port-ai/overview.md` - Lines with "Monthly Quota" section and FAQ entries

5. **Search pattern**: Look for patterns like:
   - "20 AI invocations per month"
   - `"monthlyLimit": 20`
   - "Default quota: 20"

**Note**: The API reference files in `docs/api-reference/` are auto-generated from OpenAPI specifications and will be updated automatically when the backend API is updated. You don't need to manually edit these files.

## Other Tasks

For other tasks not listed above, ask for clarification from the user. Once understood, add a new section to the "Common Tasks" section of this file.
