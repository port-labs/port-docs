---
sidebar_position: 5
title: Skills
---

# Skills

Skills are domain-specific guidance packages that help Port AI handle specialized tasks more effectively. When the AI encounters a task that matches a skill's description, it loads the skill's step-by-step instructions to ensure consistent, thorough handling.

## What are skills

Skills provide structured workflows for common but complex tasks. Instead of relying on general AI capabilities, skills encode expert knowledge into reusable instruction sets that guide the AI through specific processes.

Each skill contains:
- **Name**: A unique identifier for the skill.
- **Description**: When the AI should use this skill.
- **Instructions**: Step-by-step guidance in markdown format.
- **References** (optional): Additional documentation or context.
- **Assets** (optional): Templates, configuration files, or other resources.

Skills follow the open [Agent Skills specification](https://agentskills.io/specification).

## How skills work

Skills are loaded via the `load_skill` tool available in the [Port MCP Server](/ai-interfaces/port-mcp-server/overview-and-installation). When Port AI detects a task that matches a skill's description, it automatically loads the relevant skill before proceeding.

**Loading a skill:**

```javascript
load_skill({ name: "troubleshoot-integration" })
```

**Loading a specific resource from a skill:**

```javascript
load_skill({ name: "troubleshoot-integration", resource: "references/common-errors.md" })
```

## Built-in skills

Port includes built-in skills for common workflows. These skills are available to all users without any configuration.

### troubleshoot-integration

Diagnose and resolve integration sync issues, mapping errors, and data problems. Use this skill when users report:
- Data not syncing or appearing in Port.
- Entities missing or incorrect.
- Sync errors or failures.
- Mapping configuration problems.

**What it does:**

1. Identifies the problematic integration.
2. Retrieves integration details and configuration.
3. Analyzes sync metrics for errors.
4. Reviews event logs for specific error messages.
5. Examines raw data examples.
6. Diagnoses the root cause.
7. Tests proposed fixes before recommending them.
8. Provides solutions in the correct format (YAML for Port UI).

## Creating custom skills

You can create custom skills tailored to your organization's specific workflows. Custom skills are stored as entities in Port and can override built-in skills with the same name.

### Step 1: Create the skill blueprint

First, create the `skill` blueprint in your Port organization. Go to your [data model](https://app.getport.io/settings/data-model) and create a new blueprint with the following configuration:

<details>
<summary><b>Skill blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "skill",
  "title": "Skill",
  "icon": "Learn",
  "schema": {
    "properties": {
      "description": {
        "title": "Description",
        "type": "string",
        "description": "What the skill does and when the model should use it"
      },
      "instructions": {
        "title": "Instructions",
        "type": "string",
        "format": "markdown",
        "description": "Step-by-step instructions for the AI to follow"
      },
      "references": {
        "title": "References",
        "type": "array",
        "description": "Reference documents for the skill",
        "items": {
          "type": "object",
          "properties": {
            "path": {
              "type": "string",
              "description": "Resource path (e.g., references/common-errors.md)"
            },
            "content": {
              "type": "string",
              "description": "The file content"
            }
          },
          "required": ["path", "content"],
          "additionalProperties": false
        }
      },
      "assets": {
        "title": "Assets",
        "type": "array",
        "description": "Asset files (templates, configs) for the skill",
        "items": {
          "type": "object",
          "properties": {
            "path": {
              "type": "string",
              "description": "Asset path (e.g., assets/mapping-template.yaml)"
            },
            "content": {
              "type": "string",
              "description": "The file content"
            }
          },
          "required": ["path", "content"],
          "additionalProperties": false
        }
      }
    },
    "required": ["description", "instructions"]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```

</details>

### Step 2: Create skill entities

Once the blueprint exists, create entities for each custom skill. Each entity represents one skill.

**Required properties:**

| Property | Description |
|----------|-------------|
| `identifier` | Unique skill name using lowercase letters and hyphens (e.g., `deploy-service`). |
| `description` | A clear description of what the skill does and when Port AI should use it. This helps the AI decide when to load the skill. |
| `instructions` | Step-by-step instructions in markdown format. |

**Optional properties:**

| Property | Description |
|----------|-------------|
| `references` | Array of reference documents. Each item needs a `path` (e.g., `references/runbook.md`) and `content` (the document text). |
| `assets` | Array of asset files like templates or configs. Same structure as references: `path` and `content`. |

### Example: Custom deployment skill

Here's an example of a custom skill for deploying services in your organization:

```json showLineNumbers
{
  "identifier": "deploy-to-production",
  "title": "Deploy to Production",
  "properties": {
    "description": "Guide for deploying services to production. Use when users ask to deploy, release, or promote a service to production.",
    "instructions": "# Deploy to Production\n\nFollow these steps to deploy a service to production:\n\n## Step 1: Verify prerequisites\n\n- Check that all tests pass.\n- Verify the service has a production-readiness scorecard score above 80%.\n- Confirm the service owner has approved the deployment.\n\n## Step 2: Run the deployment\n\nExecute the deployment action for the target service and environment.\n\n**Example input:**\n- Service: `payment-service`\n- Environment: `production`\n\n**Expected output:**\n- Deployment initiated successfully.\n- Action run ID returned for tracking.\n\n## Step 3: Verify deployment\n\n- Check the action run status.\n- Verify the service is healthy in production.\n- Monitor for any alerts in the first 15 minutes.\n\n## Common edge cases\n\n- If tests are failing, do not proceed with deployment.\n- If scorecard score is below threshold, recommend remediation steps first.\n- If deployment fails, check logs and suggest rollback if needed.",
    "references": [],
    "assets": []
  }
}
```

## Priority and overriding

Custom skills take priority over built-in skills. If you create a custom skill with the same identifier as a built-in skill (e.g., `troubleshoot-integration`), your custom skill will be used instead.

This allows you to:
- Customize built-in workflows for your organization's specific needs.
- Add organization-specific context to existing skills.
- Replace generic instructions with your team's best practices.

## Best practices

When creating custom skills, follow these guidelines for best results:

### Keep instructions concise

Skills are loaded into the AI's context, so keep instructions under 5000 tokens (approximately 500 lines). Move detailed reference content to the `references` array instead of putting everything in the main instructions.

### Write clear trigger descriptions

The `description` field determines when Port AI loads the skill. Write descriptions that clearly indicate:
- What task the skill handles.
- Keywords or phrases users might use.
- When NOT to use the skill (if relevant).

**Good example:**
> "Diagnose and resolve integration sync issues, mapping errors, and data problems. Use when users report missing data, sync failures, or integration errors."

**Poor example:**
> "Helps with integrations."

### Structure instructions effectively

Organize instructions with clear structure. Include:
- Step-by-step instructions for completing the task.
- Examples of inputs and outputs.
- Common edge cases and how to handle them.

### Use resources for detailed content

Put detailed documentation, error catalogs, or templates in the `references` and `assets` arrays. The AI can load these on demand when needed, keeping the main instructions focused.
