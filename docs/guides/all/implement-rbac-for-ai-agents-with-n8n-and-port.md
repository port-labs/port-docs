---
displayed_sidebar: null
description: Learn how to implement role-based access control (RBAC) for multi-agent systems using Port and n8n, enabling dynamic tool access control for AI agents based on user roles and permissions.
---

# RBAC for AI agents with n8n and Port

Multi-agent systems and AI agent workflows need role-based access control (RBAC) to restrict which tools different users can access. Teams currently rely on external systems like Airtable to manage permissions, adding friction and complexity. Port can serve as the single source of truth for tool access control, eliminating the need for external permission databases.

This guide demonstrates how to build an n8n workflow that queries Port for RBAC rules, enabling dynamic tool access control for AI agents based on user roles and tool definitions.

<img src='/img/guides/n8n-rbac-for-ai-agents-workflow.png' border="1px" width="100%" />


## Common use cases

- **Control tool access for AI agents** based on user roles and permissions.
- **Centralize RBAC management** in Port instead of maintaining separate permission databases.
- **Integrate with communication channels** like Slack or Telegram for user-initiated tool requests.

## Prerequisites

This guide assumes the following:

- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- You have a working n8n instance (Cloud or self-hosted) with [Port's n8n custom node installed](https://docs.port.io/ai-interfaces/port-n8n-node) or you can use HTTP Request nodes to query Port's API.
- You have access to a communication channel like Slack workspace and [developer token](https://api.slack.com/) for sending notifications.
- You have an OpenAI API key or another LLM provider configured in n8n for the AI agent.

:::tip Alternative integrations
While this guide uses Slack as the communication channel, you can adapt it for other channels like Telegram, Microsoft Teams, or Discord. Additionally, you can use other LLM providers like Anthropic Claude, Google Gemini, or local models instead of OpenAI.
:::

## Set up the Port data model

First, we need to create the blueprints in Port that will store users, roles, tools, and their relationships. This data model enables Port to serve as the single source of truth for RBAC.

<h3> Create the tool blueprint </h3>

The `rbacTool` blueprint represents the tools that AI agents can use. Each tool has a `runtime_name` that matches the tool identifier used in your agent system.

1. Navigate to your [Port Builder](https://app.getport.io/settings/data-model) page.
2. Click the **+ Blueprint** button to create a new blueprint.
3. Click on the **Edit JSON** button.
4. Copy the definition below and paste it in the editor:

    <details>
    <summary><b>RBAC Tool blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "rbacTool",
      "title": "RBAC Tool",
      "icon": "Job",
      "schema": {
        "properties": {
          "category": {
            "type": "string",
            "title": "Category"
          },
          "description": {
            "type": "string",
            "title": "Description"
          },
          "runtime_name": {
            "type": "string",
            "title": "Tool Runtime Identifier",
            "description": "Matching the tool name used in the agent."
          }
        },
        "required": [
          "runtime_name"
        ]
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {}
    }
    ```

    </details>

5. Click **Save** to create the blueprint.

<h3> Create the role blueprint </h3>

The `rbacRole` blueprint represents user roles. Each role can have multiple allowed tools through a relation.

1. Click the **+ Blueprint** button again to create another blueprint.
2. Click on the **Edit JSON** button.
3. Copy the definition below and paste it in the editor:

    <details>
    <summary><b>RBAC Role blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "rbacRole",
      "title": "RBAC Role",
      "icon": "Shield",
      "schema": {
        "properties": {
          "description": {
            "type": "string",
            "title": "Description"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "allowed_tools": {
          "title": "Allowed Tools",
          "description": "A list of tools that is allowed for this role",
          "target": "rbacTool",
          "required": false,
          "many": true
        }
      }
    }
    ```

    </details>

4. Click **Save** to create the blueprint.

<h3> Create the user blueprint </h3>

The `rbacUser` blueprint represents users in your system. Each user can have multiple roles, and through mirror properties, we automatically compute which tools each user is allowed to access.

1. Click the **+ Blueprint** button again to create another blueprint.
2. Click on the **Edit JSON** button.
3. Copy the definition below and paste it in the editor:

    <details>
    <summary><b>RBAC User blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "rbacUser",
      "title": "RBAC User",
      "icon": "User",
      "schema": {
        "properties": {
          "email": {
            "type": "string",
            "title": "Email"
          },
          "full_name": {
            "type": "string",
            "title": "Full Name"
          },
          "is_active": {
            "type": "boolean",
            "title": "Is Active"
          }
        },
        "required": [
          "email"
        ]
      },
      "mirrorProperties": {
        "allowed_tools": {
          "title": "Allowed Tools",
          "path": "roles.allowed_tools.runtime_name"
        }
      },
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "roles": {
          "title": "Roles",
          "target": "rbacRole",
          "required": false,
          "many": true
        }
      }
    }
    ```

    </details>

4. Click **Save** to create the blueprint.

### Populate the data model

After creating the blueprints, you need to populate them with your users, roles, and tools. Here's an example of how to create entities:

1. **Create tools** — Navigate to each tool entity and create entries for the tools your AI agents can use (e.g., `calculator`, `wikipedia`, `Create_an_incident_in_PagerDuty`, `Create_a_bucket_in_AWS_S3`).
2. **Create roles** — Create roles like `admin`, `developer`, `viewer`, and link them to their allowed tools via the `allowed_tools` relation.
3. **Create users** — Create user entities with their email addresses and link them to their roles via the `roles` relation.


## Create n8n workflow

We will create an n8n workflow that uses Port as the RBAC source of truth. The workflow will trigger when a user sends a message to the AI agent via Slack, query Port for the user's permissions, and dynamically filter tools based on those permissions.

### Import the workflow template

1. Go to your n8n instance.
2. Click on **Workflows** in the left sidebar.
3. Click on **Import from File** or **Import from URL**.
4. Copy and paste the following workflow JSON:

    <details>
    <summary><b>n8n workflow template (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "name": "Access Control for AI Agents (RBAC) using Port and Slack",
      "nodes": [
        {
          "parameters": {
            "model": {
              "__rl": true,
              "mode": "list",
              "value": "gpt-4o",
              "cachedResultName": "gpt-4o"
            },
            "options": {}
          },
          "id": "f1ef483e-4f84-40c7-957d-191a54ffb80e",
          "name": "OpenAI Chat Model",
          "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
          "position": [
            1376,
            720
          ],
          "typeVersion": 1.2,
          "credentials": {
            "openAiApi": {
              "id": "gmbaMvIDGsggs5I9",
              "name": "OpenAi account"
            }
          }
        },
        {
          "parameters": {
            "code": {
              "supplyData": {
                "code": "const { DynamicTool } = require(\"@langchain/core/tools\");\nconst connectedTools = await this.getInputConnectionData('ai_tool', 0);\nconst allowedTools = $input.item.json.allowed_tools;\n\nconst noTool = (tool) => {\n  return new DynamicTool({\n    name: tool.getName(),\n    description: tool.description,\n    func: async () => {\n        return \"Tell the user 'You are not authorized to use this tool'.\";\n    },\n  });\n}\n\nreturn connectedTools.map(connectedTool => {\n  const permissionGranted = allowedTools.includes(connectedTool.getName());\n  return permissionGranted ? connectedTool : noTool(connectedTool);\n});"
              }
            },
            "inputs": {
              "input": [
                {
                  "type": "ai_tool",
                  "required": true
                }
              ]
            },
            "outputs": {
              "output": [
                {
                  "type": "ai_tool"
                }
              ]
            }
          },
          "id": "c6ba00c9-8ca2-4cf0-9e2c-24ead9eb7c1b",
          "name": "Check permissions",
          "type": "@n8n/n8n-nodes-langchain.code",
          "position": [
            1808,
            704
          ],
          "typeVersion": 1,
          "notes": "A tool to check user's allowed tools and permissions"
        },
        {
          "parameters": {
            "assignments": {
              "assignments": [
                {
                  "id": "9ea62c8f-984b-4c05-8e40-549d8035c4d3",
                  "name": "name",
                  "type": "string",
                  "value": "={{ $json.entity.identifier }}"
                },
                {
                  "id": "bf74b2c4-f0d1-458a-9044-5cb1b62722e6",
                  "name": "granted_roles",
                  "type": "array",
                  "value": "={{ $json.entity.relations.roles || [] }}"
                },
                {
                  "id": "e0f4d3d7-a916-43cb-a13d-e4453b0d1a3b",
                  "name": "allowed_tools",
                  "type": "array",
                  "value": "={{ $json.entity.properties.allowed_tools || [] }}"
                }
              ]
            },
            "options": {}
          },
          "id": "3df9b9f5-c0a2-4905-95aa-285b492f2ec0",
          "name": "Set input",
          "type": "n8n-nodes-base.set",
          "position": [
            1504,
            448
          ],
          "typeVersion": 3.4
        },
        {
          "parameters": {},
          "id": "76529936-80ea-4f94-9a06-bae3b6ea0ce3",
          "name": "calculator",
          "type": "@n8n/n8n-nodes-langchain.toolCalculator",
          "position": [
            1856,
            960
          ],
          "typeVersion": 1
        },
        {
          "parameters": {
            "conditions": {
              "options": {
                "version": 2,
                "leftValue": "",
                "caseSensitive": true,
                "typeValidation": "strict"
              },
              "conditions": [
                {
                  "id": "1d042f5b-ef39-4b9e-8d9c-900b39dbe3fb",
                  "operator": {
                    "type": "boolean",
                    "operation": "false",
                    "singleValue": true
                  },
                  "leftValue": "={{ $json.ok }}",
                  "rightValue": ""
                }
              ],
              "combinator": "and"
            },
            "options": {}
          },
          "id": "eae759d7-fa4a-4993-bbcf-cc430f2dfa60",
          "name": "Unknown user",
          "type": "n8n-nodes-base.if",
          "position": [
            1152,
            320
          ],
          "typeVersion": 2.2
        },
        {
          "parameters": {
            "content": "Uses list of allowed tools gathered from Port to check for permissions and replaces denied tools with a fixed instruction to return a message to the user.",
            "height": 220,
            "width": 380,
            "color": 7
          },
          "id": "7d24fc8e-36e7-4087-88cc-7f1c725ce814",
          "name": "Sticky Note2",
          "type": "n8n-nodes-base.stickyNote",
          "position": [
            1728,
            656
          ],
          "typeVersion": 1
        },
        {
          "parameters": {
            "content": "AI agent with the instruction to always use the connected tools to respond to the user's request",
            "height": 240,
            "width": 380,
            "color": 7
          },
          "id": "885b0117-bae1-4aac-a91f-e140259b32e2",
          "name": "Sticky Note4",
          "type": "n8n-nodes-base.stickyNote",
          "position": [
            1664,
            384
          ],
          "typeVersion": 1
        },
        {
          "parameters": {
            "content": "Collects input and formats it using required keys",
            "height": 240,
            "width": 220,
            "color": 7
          },
          "id": "25f17f39-a777-4386-b14d-1ed7db3c54f4",
          "name": "Sticky Note5",
          "type": "n8n-nodes-base.stickyNote",
          "position": [
            1440,
            384
          ],
          "typeVersion": 1
        },
        {
          "parameters": {
            "content": "Listens to messages directly sent to the Slack bot",
            "height": 240,
            "width": 220,
            "color": 7
          },
          "id": "b82c9149-e583-4c98-a6d8-c92080fd44ba",
          "name": "Sticky Note11",
          "type": "n8n-nodes-base.stickyNote",
          "position": [
            256,
            240
          ],
          "typeVersion": 1
        },
        {
          "parameters": {
            "content": "Checks if the user was found in Port",
            "height": 240,
            "width": 220,
            "color": 7
          },
          "id": "b74fcbc1-aa66-440a-9a75-340858bba6c5",
          "name": "Sticky Note12",
          "type": "n8n-nodes-base.stickyNote",
          "position": [
            1088,
            256
          ],
          "typeVersion": 1
        },
        {
          "parameters": {
            "trigger": [
              "app_mention"
            ],
            "channelId": {
              "__rl": true,
              "value": "C09QD4FU16C",
              "mode": "id"
            },
            "options": {}
          },
          "type": "n8n-nodes-base.slackTrigger",
          "typeVersion": 1,
          "position": [
            304,
            320
          ],
          "id": "2878f211-03fb-4d45-9f1e-00b3b56feded",
          "name": "Slack Trigger",
          "webhookId": "cfc69683-8076-4e60-9cf3-c0b5f3d8df8b",
          "credentials": {
            "slackApi": {
              "id": "RR34a44wNzvSSqhd",
              "name": "Slack account"
            }
          }
        },
        {
          "parameters": {
            "select": "channel",
            "channelId": {
              "__rl": true,
              "value": "C09QD4FU16C",
              "mode": "id"
            },
            "text": "hello test",
            "otherOptions": {}
          },
          "type": "n8n-nodes-base.slack",
          "typeVersion": 2.3,
          "position": [
            1504,
            208
          ],
          "id": "302b2338-f9b9-4f58-a012-4a4318ef95e9",
          "name": "Send a message",
          "webhookId": "95e8694f-4e9d-4e1a-a629-398749463b51",
          "credentials": {
            "slackApi": {
              "id": "RR34a44wNzvSSqhd",
              "name": "Slack account"
            }
          }
        },
        {
          "parameters": {
            "url": "=https://api.port.io/v1/blueprints/rbacUser/entities/{{ $('Get user\\'s slack profile').item.json.email }}",
            "authentication": "genericCredentialType",
            "genericAuthType": "httpBearerAuth",
            "options": {}
          },
          "type": "n8n-nodes-base.httpRequest",
          "typeVersion": 4.3,
          "position": [
            944,
            320
          ],
          "id": "0299184e-ccb8-4f76-8eab-46e37dc5e218",
          "name": "Get user permission from Port",
          "credentials": {
            "httpBearerAuth": {
              "id": "JJ4pn8WYRmSewFW8",
              "name": "Bearer Auth account"
            }
          }
        },
        {
          "parameters": {},
          "type": "@n8n/n8n-nodes-langchain.toolWikipedia",
          "typeVersion": 1,
          "position": [
            1984,
            976
          ],
          "id": "56caebec-0e6f-4eae-8361-012632e11022",
          "name": "Wikipedia"
        },
        {
          "parameters": {
            "descriptionType": "auto",
            "authentication": "apiToken",
            "resource": "incident",
            "operation": "create",
            "title": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Title', ``, 'string') }}",
            "serviceId": "P94D8C0",
            "email": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Email', ``, 'string') }}",
            "additionalFields": {},
            "conferenceBridgeUi": {}
          },
          "type": "n8n-nodes-base.pagerDutyTool",
          "typeVersion": 1,
          "position": [
            2176,
            960
          ],
          "id": "686117ca-1cd3-4c69-bb51-8b8b5afabf68",
          "name": "Create an incident in PagerDuty",
          "credentials": {
            "pagerDutyApi": {
              "id": "dnfKYneoVaktq8V6",
              "name": "PagerDuty account"
            }
          }
        },
        {
          "parameters": {
            "resource": "bucket",
            "name": "=test-isaac-n8n-buckets-v2",
            "additionalFields": {
              "region": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Region', ``, 'string') }}"
            }
          },
          "type": "n8n-nodes-base.awsS3Tool",
          "typeVersion": 2,
          "position": [
            1696,
            960
          ],
          "id": "c65a5d76-3a58-4c6e-bdfd-95129a64c8a2",
          "name": "Create a bucket in AWS S3",
          "credentials": {
            "aws": {
              "id": "ZK1qXiYwwiKipKkj",
              "name": "AWS (IAM) account"
            }
          }
        },
        {
          "parameters": {
            "resource": "user",
            "operation": "getProfile",
            "user": {
              "__rl": true,
              "value": "={{ $json.user }}",
              "mode": "id"
            }
          },
          "type": "n8n-nodes-base.slack",
          "typeVersion": 2.3,
          "position": [
            528,
            320
          ],
          "id": "8114fb43-7c55-4a6e-85b5-3d9f2d6e73e3",
          "name": "Get user's slack profile",
          "webhookId": "4c089606-a548-4756-948e-12b22f6b78cb",
          "credentials": {
            "slackApi": {
              "id": "RR34a44wNzvSSqhd",
              "name": "Slack account"
            }
          }
        },
        {
          "parameters": {
            "method": "POST",
            "url": "https://api.port.io/v1/auth/access_token",
            "sendBody": true,
            "specifyBody": "json",
            "jsonBody": "{\n  \"clientId\": \"REPLACE WITH CLIENT ID\",\n  \"clientSecret\": \"REPLACE WITH CLIENT SECRET\"\n}",
            "options": {}
          },
          "type": "n8n-nodes-base.httpRequest",
          "typeVersion": 4.3,
          "position": [
            736,
            320
          ],
          "id": "bd91d8a6-5ab8-4329-aa84-ffafc34e5688",
          "name": "Get Port access token"
        },
        {
          "parameters": {
            "sessionIdType": "customKey",
            "sessionKey": "={{ $json.name}}"
          },
          "id": "77771654-bfb9-4c34-b644-d4d6eeb15d37",
          "name": "Chat Memory",
          "type": "@n8n/n8n-nodes-langchain.memoryBufferWindow",
          "position": [
            1568,
            720
          ],
          "typeVersion": 1.3
        },
        {
          "parameters": {
            "select": "channel",
            "channelId": {
              "__rl": true,
              "value": "={{ $('Slack Trigger').item.json.channel }}",
              "mode": "id"
            },
            "text": "={{ $json.output }}",
            "otherOptions": {}
          },
          "type": "n8n-nodes-base.slack",
          "typeVersion": 2.3,
          "position": [
            2112,
            448
          ],
          "id": "b75f26a7-5b16-4bac-b3ef-0f54420af8c0",
          "name": "Send output message",
          "webhookId": "5df57b85-2869-4290-9a90-60575aa15186",
          "credentials": {
            "slackApi": {
              "id": "RR34a44wNzvSSqhd",
              "name": "Slack account"
            }
          }
        },
        {
          "parameters": {
            "content": "## AI Agent Access Control (Port + Slack)\n\nThis workflow enables dynamic tool access control for AI agents based on user roles and tool definitions.\n\n### How it works\n1. Listen for Slack mentions and fetch the user’s Slack profile to identify who sent the request.\n2. Request a Port access token and fetch the user entity to read roles and allowed_tools.\n3. Build the agent input and run a permission check that replaces any unauthorized tool with a fixed \\\"not authorized\\\" tool.\n4. Run the agent (with chat memory and the OpenAI model) so it can call only allowed tools (Wikipedia, PagerDuty, S3, calculator, etc.) and produce a validated response.\n5. Send the agent’s final output back to the Slack channel or perform allowed actions (create incidents, create buckets) only when permitted.\n\n### Setup\n- [ ] Connect your Slack account and set the bot to listen to mentions in the target channel.\n- [ ] Add OpenAI API key (or LangChain model credentials).\n- [ ] Register for a free account with Port.io\n- [ ] Connect your Port.io account and add the API key/credentials.\n- [ ] Configure RBAC entries in Port: set allowed_tools for each user or role.\n- [ ] Connect external tool accounts used by the agent (PagerDuty, AWS S3, etc.).\n- [ ] Verify the Slack channel ID and invite the bot to the channel.",
            "height": 576,
            "width": 688
          },
          "type": "n8n-nodes-base.stickyNote",
          "typeVersion": 1,
          "position": [
            -496,
            64
          ],
          "id": "97af7be9-a451-4f68-8f49-7cc327b41633",
          "name": "Sticky Note"
        },
        {
          "parameters": {
            "promptType": "define",
            "text": "={{ $('Slack Trigger').item.json.text }}",
            "options": {
              "systemMessage": "=You are a personal assistant. The name of the current user is \"{{ $json.name }}\"\nYou MUST only use the provided tools to process any user input. Never use general knowledge to answer questions. If you can't use a tool, tell the user why.\n\nBelow are the list of allowed tools for this user:\n{{ $json.allowed_tools }}",
              "returnIntermediateSteps": true
            }
          },
          "id": "623328d8-e9ad-431e-b3ca-df0cdbcb7430",
          "name": "AI Agent",
          "type": "@n8n/n8n-nodes-langchain.agent",
          "position": [
            1728,
            448
          ],
          "typeVersion": 1.8
        }
      ],
      "pinData": {},
      "connections": {
        "Set input": {
          "main": [
            [
              {
                "node": "AI Agent",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "calculator": {
          "ai_tool": [
            [
              {
                "node": "Check permissions",
                "type": "ai_tool",
                "index": 0
              }
            ]
          ]
        },
        "Unknown user": {
          "main": [
            [
              {
                "node": "Send a message",
                "type": "main",
                "index": 0
              }
            ],
            [
              {
                "node": "Set input",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Check permissions": {
          "ai_tool": [
            [
              {
                "node": "AI Agent",
                "type": "ai_tool",
                "index": 0
              }
            ]
          ]
        },
        "OpenAI Chat Model": {
          "ai_languageModel": [
            [
              {
                "node": "AI Agent",
                "type": "ai_languageModel",
                "index": 0
              }
            ]
          ]
        },
        "Slack Trigger": {
          "main": [
            [
              {
                "node": "Get user's slack profile",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Get user permission from Port": {
          "main": [
            [
              {
                "node": "Unknown user",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Wikipedia": {
          "ai_tool": [
            [
              {
                "node": "Check permissions",
                "type": "ai_tool",
                "index": 0
              }
            ]
          ]
        },
        "Create an incident in PagerDuty": {
          "ai_tool": [
            [
              {
                "node": "Check permissions",
                "type": "ai_tool",
                "index": 0
              }
            ]
          ]
        },
        "Create a bucket in AWS S3": {
          "ai_tool": [
            [
              {
                "node": "Check permissions",
                "type": "ai_tool",
                "index": 0
              }
            ]
          ]
        },
        "Get user's slack profile": {
          "main": [
            [
              {
                "node": "Get Port access token",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Get Port access token": {
          "main": [
            [
              {
                "node": "Get user permission from Port",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Chat Memory": {
          "ai_memory": [
            [
              {
                "node": "AI Agent",
                "type": "ai_memory",
                "index": 0
              }
            ]
          ]
        },
        "AI Agent": {
          "main": [
            [
              {
                "node": "Send output message",
                "type": "main",
                "index": 0
              }
            ]
          ]
        }
      },
      "active": false,
      "settings": {
        "executionOrder": "v1"
      },
      "versionId": "d43fce48-7be5-473d-a216-14cc4d2a4d37",
      "meta": {
        "templateId": "3988",
        "templateCredsSetupCompleted": true,
        "instanceId": "cf1d54a0176ed58dce866451207aa20b247a40741885568f562f6c544c560a67"
      },
      "id": "syjUyGUQ4jjp7UCh",
      "tags": []
    }
    ```

    </details>

5. Click **Import** to load the workflow into n8n.


### Configure workflow credentials

Before the workflow can run, you need to configure credentials for Slack, OpenAI, Port, and any external tools (PagerDuty, AWS S3, etc.).

<h4> Configure Port credentials </h4>

1. In the **Get Port access token** node, update the JSON body with your Port credentials:
   - Replace `REPLACE WITH CLIENT ID` with your Port Client ID.
   - Replace `REPLACE WITH CLIENT SECRET` with your Port Client Secret.

   :::tip Finding your Port credentials
   You can find your Port credentials in your [Port application](https://app.getport.io) under **Settings → Credentials**. [Learn more about Port API credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials).
   :::

2. In the **Get user permission from Port** node, configure the Bearer Auth credential:
   - Click on the credentials dropdown.
   - Select **Create New Credential** or use an existing Bearer Auth credential.
   - Set the **Token** to `={{ $('Get Port access token').item.json.accessToken }}` to use the token from the previous node.

<h4> Configure Slack credentials </h4>

1. In the **Slack Trigger** node, click on the credentials dropdown.
2. Select **Create New Credential** or use an existing Slack credential.
3. Enter your Slack credentials:
   - **Access Token** — Your [Slack Bot Token](https://docs.slack.dev/authentication/tokens/) (starts with `xoxb-`)
4. Click **Save** to store the credential.

<h4> Configure OpenAI credentials </h4>

1. In the **OpenAI Chat Model** node, click on the credentials dropdown.
2. Select **Create New Credential** or use an existing OpenAI credential.
3. Enter your OpenAI API key.
4. Click **Save** to store the credential.

<h4> Configure external tool credentials </h4>

Configure credentials for any external tools you're using (PagerDuty, AWS S3, etc.):

1. **PagerDuty** — In the **Create an incident in PagerDuty** node, add your PagerDuty API token.
2. **AWS S3** — In the **Create a bucket in AWS S3** node, add your AWS credentials.


### Configure workflow parameters

After importing the workflow, you need to update several parameters to match your environment:

1. **Update Slack channel ID**:
   - In the **Slack Trigger** node, update the `channelId` field with your target Slack channel ID.
   - Update the `channelId` in the **Send a message** and **Send output message** nodes to match.

2. **Update Port API endpoint** (if needed):
   - The workflow uses `https://api.getport.io/v1` by default. If you're using a different Port data center, update the URLs in the **Get Port access token** and **Get user permission from Port** nodes.

3. **Update user entity identifier**:
   - The workflow queries Port using the user's email address as the entity identifier. Ensure your `rbacUser` entities use email addresses as their identifiers, or adjust the query in the **Get user permission from Port** node.

4. **Update tool names**:
   - Ensure the `runtime_name` property in your `rbacTool` entities matches the tool names used in your n8n workflow (e.g., `calculator`, `wikipedia`, `Create_an_incident_in_PagerDuty`, `Create_a_bucket_in_AWS_S3`).

:::tip Customizing the workflow
You can customize the workflow to match your specific needs:
- Add more tools by connecting additional tool nodes to the **Check permissions** node.
- Modify the permission check logic in the **Check permissions** node to implement different access control rules.
- Add notification nodes to alert administrators when access is denied.
:::

### Permission check logic

The **Check permissions** node uses a Code node to dynamically filter tools:

- It receives all connected tools as input.
- It compares each tool's name against the user's `allowed_tools` array from Port.
- For allowed tools, it passes them through unchanged.
- For unauthorized tools, it replaces them with a `DynamicTool` that always returns "You are not authorized to use this tool."

This ensures that the AI agent can only call tools the user has permission to use, and unauthorized tool calls are gracefully handled with a clear error message.

## Test the workflow

1. **Set up test data in Port**:
   - Create a user entity in Port with your Slack email address.
   - Create roles and link them to specific tools.

2. **Trigger a test message**:
   - In your Slack channel, mention the bot with a message like: `@bot create a PagerDuty incident`.
   - Check the workflow execution in n8n to verify each step completes successfully.
   
      <img src='/img/guides/n8n-rbac-create-pagerduty-incident.png' border="1px" width="100%" />

3. **Verify permission enforcement**:
   - Try requesting a tool you don't have access to.
   - Verify that the agent responds with an authorization error.

      <img src='/img/guides/n8n-rbac-create-s3.png' border="1px" width="100%" />



## Related guides

- [Set up Port's n8n custom node](https://docs.port.io/ai-interfaces/port-n8n-node) — Learn how to install and configure Port's n8n node.
- [Remediate vulnerability with n8n and Port](https://docs.port.io/guides/all/remediate-vulnerability-with-n8n-and-port) — Another example of using Port as a context lake in n8n workflows.
- [Automatically resolve tickets with n8n and Port context](https://docs.port.io/guides/all/automatically-resolve-tickets-with-n8n-port-context) — Learn how to use Port as a context lake in n8n workflows.

