---
sidebar_position: 4
title: Prompts
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Prompts

Port allows you to centrally manage reusable prompts and expose them to your users via the MCP Server. Once defined, prompts become available in supported MCP clients (for example, Cursor or Claude) where developers and AI agents can discover and run them with the required inputs.

#### Common use cases

- Automate on-call runbooks and incident-triage guidance
- Standardize code review or deployment checklists
- Generate structured updates and communications (e.g., incident status, release notes)

#### Set up the data model

1. Go to the [Builder page](https://app.getport.io/settings/data-model) in your portal.
2. Click **+ Blueprint**.
3. Click the `{...}` button in the top-right corner and choose **Edit JSON**.
4. Paste the following JSON schema into the editor:

    <details>
    <summary>Prompt blueprint JSON (click to expand)</summary>

    ```json showLineNumbers
    {
        "identifier": "prompt",
        "title": "Prompt",
        "icon": "Microservice",
        "ownership": {
            "type": "Direct",
            "title": "Owning Teams"
        },
        "schema": {
            "properties": {
                "description": {
                    "type": "string",
                    "title": "Description"
                },
                "arguments": {
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "The name of the argument parameter"
                            },
                            "description": {
                                "type": "string",
                                "description": "A description of what this argument is for"
                            },
                            "required": {
                                "type": "boolean",
                                "description": "Whether this argument is required or optional",
                                "default": false
                            }
                        },
                        "required": [
                            "name",
                            "description"
                        ]
                    },
                    "type": "array",
                    "title": "Arguments"
                },
                "template": {
                    "icon": "DefaultProperty",
                    "type": "string",
                    "title": "Prompt Template",
                    "format": "markdown"
                }
            },
            "required": [
                "description",
                "template"
            ]
        },
        "mirrorProperties": {},
        "calculationProperties": {},
        "aggregationProperties": {},
        "relations": {}
    }
    ```
    </details>

:::info Where prompts appear
After this blueprint exists and you create entities for it, prompts will show up in supported MCP clients connected to your Port organization. In clients that surface MCP prompts, you’ll see them listed and ready to run with arguments.
:::

#### Create prompts

Create entities of the `prompt` blueprint for each prompt you want to expose. At minimum, provide `description` and `template`. Optionally add `arguments` to parameterize the prompt.

1. Go to the [Prompts page](https://app.getport.io/prompts) in your portal.
2. Click **Create prompt**.
3. Fill out the form:
   - Provide a title and description.
   - Write the prompt template (supports markdown).
   - Define any `arguments` (optional) with `name`, `description`, and whether they are `required`.

![Create prompt form in Port](/img/ai-agents/PortPromptForm.png)

:::info Template and placeholders
The `template` supports markdown and variable placeholders. Each argument defined in `arguments` is exposed by its `name` and can be referenced as `{{name}}` inside the template. When you run the prompt, the MCP Server collects values for required arguments and substitutes them into the matching placeholders before execution.
:::

#### Examples

<Tabs groupId="prompt-examples" queryString>
<TabItem value="incident-triage" label="Incident triage">

A prompt to assists on-call engineers by summarizing recent alerts and deploys related to an incident, then suggesting next steps and linking relevant runbooks.

<details>
<summary>Incident triage prompt entity JSON (Click to expand)</summary>

```json showLineNumbers
{
  "identifier": "incident_response_assistant",
  "title": "Incident Response Assistant",
  "team": [],
  "properties": {
    "description": "Assists with incident response by summarizing critical alerts, recent deploys, and suggesting next steps with relevant dashboards and runbooks",
    "arguments": [
      {
        "name": "service_name",
        "required": true,
        "description": "The name of the service experiencing the incident"
      },
      {
        "name": "environment",
        "required": false,
        "description": "The environment where the incident is occurring (e.g., production, staging)"
      },
      {
        "name": "incident_id",
        "required": true,
        "description": "The unique identifier for the incident"
      },
      {
        "name": "timeframe",
        "required": false,
        "description": "The time period to analyze (e.g., '24 hours', '1 week')"
      }
    ],
    "template": "You are assisting with an incident in the {{service_name}} service ({{environment}}).\nIncident ID: {{incident_id}}\n\nFor the last {{timeframe}}:\n- Summarize critical alerts and recent deploys\n- Suggest next steps and owners\n- Link relevant dashboards/runbooks"
  },
  "relations": {},
  "icon": "Microservice"
}
```
</details>


</TabItem>
<TabItem value="scorecard-remediation" label="Scorecard remediation">

A prompt that guides engineers to remediate failing scorecard rules by explaining each failure, its impact, and providing step-by-step fixes along with ownership suggestions.

<details>
<summary>Scorecard remediation prompt entity JSON (Click to expand)</summary>

```json showLineNumbers
{
  "identifier": "scorecard_remediation_guide",
  "title": "Scorecard Remediation Guide",
  "team": [],
  "properties": {
    "description": "Generate detailed remediation steps for failing scorecard rules, including what's failing, why it matters, step-by-step fixes, and ownership assignments",
    "arguments": [
      {
        "name": "service_name",
        "required": true,
        "description": "The name of the service that needs scorecard remediation"
      },
      {
        "name": "scorecard_name",
        "required": true,
        "description": "The name of the scorecard with failing rules"
      }
    ],
    "template": "For {{service_name}}, generate remediation steps for failing rules in the \"{{scorecard_name}}\" scorecard.\n\nFor each failing rule:\n- What is failing\n- Why it matters\n- Step-by-step remediation\n- Owners and suggested timeline"
  },
  "relations": {},
  "icon": "Microservice"
}
```
</details>


</TabItem>
<TabItem value="on-call-handoff" label="On-call handoff summary">

A prompt to generates a thorough on-call handoff report, highlighting active incidents, key risks, pending actions, and upcoming maintenance for the specified team.

<details>
<summary>On-Call handoff report prompt entity JSON (Click to expand)</summary>

```json showLineNumbers
{
  "identifier": "oncall_handoff_report",
  "title": "On-Call Handoff Report",
  "team": [],
  "properties": {
    "description": "Generate comprehensive on-call handoff documentation including active incidents, risks, pending actions, and upcoming maintenance windows",
    "arguments": [
      {
        "name": "team",
        "required": true,
        "description": "The team name for which to create the on-call handoff"
      },
      {
        "name": "timeframe",
        "required": true,
        "description": "The time period to cover in the handoff (e.g., 'last 24 hours', 'past week')"
      }
    ],
    "template": "Create an on-call handoff for {{team}} for the last {{timeframe}}.\n\nInclude:\n- Active incidents and current status\n- Top risks and mitigations\n- Pending actions and owners\n- Upcoming maintenance windows"
  },
  "relations": {},
  "icon": "Microservice"
}
```
</details>



</TabItem>
</Tabs>

After creating entities, reconnect or refresh your MCP client; your prompts will be available and will prompt for any defined arguments.

#### See prompts in your client

<Tabs groupId="prompt-ui" queryString>
<TabItem value="cursor" label="Cursor">

In Cursor, type **/** to open the prompts list. Selecting a prompt opens an input form for its arguments.

![Prompt list in Cursor](/img/ai-agents/MCPCursorPromptList.png)

When you select a prompt, Cursor renders fields for the defined `arguments`. Required ones are marked and must be provided.

![Prompt argument input in Cursor](/img/ai-agents/MCPCursorPromptInput.png)

</TabItem>
<TabItem value="claude" label="Claude">

In Claude, click the **+** button and choose the prompts option to view the list from your Port organization. Selecting a prompt opens a parameter collection flow.

![Prompt list in Claude](/img/ai-agents/MCPClaudePromptList.png)

Claude will ask for any required arguments before running the prompt and will substitute them into the template.

![Prompt argument input in Claude](/img/ai-agents/MCPClaudePromptInput.png)

</TabItem>
</Tabs>


### Allow users to create prompts with self service action
You can create a Self Service Action in Port to allow you users to create prompts themselves.

<details>
<summary>Self Service Action JSON (Click to expand)</summary>

```json showLineNumbers
{
  "identifier": "create_new_prompt",
  "title": "Create New Prompt",
  "icon": "Microservice",
  "description": "Create prompt templates that appear in MCP clients (Claude, Cursor, VS Code, etc.) connected to your Port organization. Users can select prompts, provide required arguments, and get contextual AI assistance with dynamic data from Port.",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "arguments": {
          "type": "array",
          "title": "Template Arguments",
          "description": "Define arguments that users will provide when running this prompt. Each argument becomes available as {{argument_name}} placeholder in the template. Required arguments must be provided before prompt execution.",
          "items": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "title": "Argument Name",
                "pattern": "^[a-zA-Z_][a-zA-Z0-9_]*$",
                "description": "The parameter name that will be substituted in the template using {{name}} syntax (e.g., 'service_name', 'environment', 'incident_id')"
              },
              "description": {
                "type": "string",
                "title": "Argument Description",
                "description": "Clear description explaining what this argument represents and how it's used in the prompt context"
              },
              "is_required": {
                "type": "boolean",
                "title": "Is Required",
                "default": false,
                "description": "When true, the MCP client (Claude, Cursor, VS Code) will require this argument before executing the prompt"
              }
            }
          }
        },
        "owning_team": {
          "type": "string",
          "title": "Owning Team (Optional)",
          "description": "The team that will own and maintain this prompt template",
          "format": "entity",
          "blueprint": "_team"
        },
        "prompt_title": {
          "type": "string",
          "title": "Prompt Title",
          "description": "Human-readable name for this prompt (displayed in MCP clients like Claude, Cursor, and VS Code)",
          "minLength": 3,
          "maxLength": 50
        },
        "prompt_template": {
          "type": "string",
          "title": "Prompt Template",
          "description": "The prompt content with placeholders for dynamic values. Use {{argument_name}} to reference arguments (e.g., 'Analyze service {{service_name}} in {{environment}}'). Supports markdown formatting. The MCP Server substitutes values into {{}} placeholders when the prompt runs.",
          "minLength": 20,
          "format": "multi-line"
        },
        "prompt_description": {
          "type": "string",
          "title": "Description",
          "description": "Explain what this prompt does and when to use it. This description helps users select the right prompt from the MCP client interface.",
          "minLength": 10,
          "maxLength": 500,
          "format": "multi-line"
        }
      },
      "required": [
        "prompt_title",
        "prompt_description",
        "prompt_template"
      ],
      "order": [
        "prompt_title",
        "prompt_description",
        "prompt_template",
        "arguments",
        "owning_team"
      ],
      "titles": {}
    },
    "blueprintIdentifier": "prompt"
  },
  "invocationMethod": {
    "type": "UPSERT_ENTITY",
    "blueprintIdentifier": "prompt",
    "mapping": {
      "identifier": "{{ .inputs.prompt_title | ascii_downcase | gsub(\" \"; \"_\") | gsub(\"[^a-z0-9_]\"; \"\") }}",
      "title": "{{ .inputs.prompt_title }}",
      "team": "{{ if (.inputs.owning_team | type) == \"object\" then [.inputs.owning_team.identifier] else [] end }}",
      "properties": {
        "template": "{{ .inputs.prompt_template }}",
        "arguments": "{{ (.inputs.arguments // []) | map({name: .name, description: .description, required: .is_required}) }}",
        "description": "{{ .inputs.prompt_description }}"
      }
    }
  },
  "requiredApproval": false
}
```

</details>