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

1. **Identify the model name and providers**: Determine the exact model identifier (e.g., `haiku-4.5`) and which providers support it (e.g., Anthropic, AWS Bedrock).

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

## Other Tasks

For other tasks not listed above, ask for clarification from the user. Once understood, add a new section to the "Common Tasks" section of this file.
