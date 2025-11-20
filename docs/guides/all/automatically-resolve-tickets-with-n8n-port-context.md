---
displayed_sidebar: null
description: Learn how to use Port as a context lake in n8n workflows to automatically generate GitHub issues from Jira tickets with rich organizational context and assign them to coding agents.
---

# Automatically resolve tickets with n8n and Port context

Coding agents can significantly speed up development, but crucial engineering context often gets lost in the process. 
This guide demonstrates how to use Port as a context lake in n8n workflows to automatically generate GitHub issues from Jira tickets with rich organizational context, ensuring that important information is preserved when assigning them to GitHub Copilot and linking pull requests back to Jira. 
This setup helps establish a seamless ticket-to-PR workflow, bridging the gap between Jira and GitHub while leveraging Port's comprehensive software catalog as a source of truth.

<img src="/img/guides/automatic-ticket-resolution-n8n-architecture.png" border="1px" alt="workflow banner image" width="100%" />


## Common use cases

- **Auto-create PRs for bug fixes** to minimize manual work.
- **Integrate with Copilot** for teams not relying on GitHub Issues.
- **Generate GitHub issues from Jira** with contextual information from your software catalog.
- **Enrich issues with organizational context** from services, repositories, teams, and dependencies.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- [Port's GitHub app](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/) is installed in your account.
- [Port's Jira integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/project-management/jira/) is installed in your account.
- You have a working n8n instance (Cloud or self-hosted) with [Port's n8n custom node installed](https://docs.port.io/guides/all/setup-port-n8n-node).
- You have completed the setup in the [Trigger GitHub Copilot from Port guide](https://docs.port.io/guides/all/trigger-github-copilot-from-port), ensuring that Copilot will be automatically assigned to any GitHub issues created through this guide.


:::tip Alternative integrations and/or coding agents
While this guide uses GitHub and Jira, you can adapt it for other Git providers like GitLab or Azure DevOps, and other project management tools like Linear. Additionally, although this guide demonstrates using GitHub Copilot, you can also use other coding agents like Claude Code, or Gemini, etc., to achieve similar automation and integration.
:::


## Create n8n workflow

We will create an n8n workflow that uses Port as a context lake to enrich GitHub issues with organizational context from your software catalog. The workflow will trigger when a Jira issue moves to "In Progress" with a specific label, query Port for relevant context, and create a GitHub issue with that context.

### Import the workflow template

1. Go to your n8n instance.
2. Click on **Workflows** in the left sidebar.
3. Click on **Import from File** or **Import from URL**.
4. Copy and paste the following workflow JSON:

    <details>
    <summary><b>n8n workflow template (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "name": "Automatically resolve tickets with coding agents",
      "nodes": [
        {
          "parameters": {
            "operation": "getInvocation",
            "invocationId": "={{ $json.invocationIdentifier }}"
          },
          "type": "CUSTOM.portIo",
          "typeVersion": 1,
          "position": [
            -720,
            128
          ],
          "id": "b406b9a3-85af-4f5e-960a-8f105fba2406",
          "name": "Parse Port AI response",
          "credentials": {
            "portIoApi": {
              "id": "vphYNYaTZimXT7su",
              "name": "Port.io account"
            }
          }
        },
        {
          "parameters": {
            "conditions": {
              "options": {
                "caseSensitive": true,
                "leftValue": "",
                "typeValidation": "strict",
                "version": 2
              },
              "conditions": [
                {
                  "id": "ded3f45f-fd63-493a-a5fc-225004d5d292",
                  "leftValue": "={{ $json.number }}",
                  "rightValue": "",
                  "operator": {
                    "type": "number",
                    "operation": "notEmpty",
                    "singleValue": true
                  }
                }
              ],
              "combinator": "and"
            },
            "options": {}
          },
          "type": "n8n-nodes-base.if",
          "typeVersion": 2.2,
          "position": [
            -304,
            128
          ],
          "id": "595d2b11-2e6b-4e50-b871-64a5d8dfffcc",
          "name": "Is issue creation successful?"
        },
        {
          "parameters": {
            "operation": "generalInvoke",
            "userPrompt": "=A Jira issue has moved to In Progress.\n\nIssue Details:\n- Key: {{ $json.issue.key }}\n- Title: {{ $json.issue.fields.summary }}\n- Type: {{ $json.issue.fields.issuetype.name }}\n- Description: {{ $json.issue.fields.description }}\n\nJira Project:\n- Key/Name: {{ $json.issue.fields.project.key }} / {{ $json.issue.fields.project.name }}\n\nYour task:\nQuery the Port catalog across services, repositories, teams, architecture, documentation, cloud resources, workloads, internal docs, READMEs, and dependencies.  \nExtract ONLY the contextual information that actually exists in the catalog and that is directly relevant to this Jira issue.\n\nThen create:\n1. A GitHub issue title that starts with the Jira key.\n2. A GitHub issue body that:\n   - Summarizes the Jira description in clear developer-friendly language.\n   - Incorporates any relevant Port context found.\n   - Is fully self-contained.\n   - Ends with the directive:\n\n     @github-copilot please begin working on this issue.\n\nOutput format:\nReturn ONLY the following JSON object:\n\n{\n  \"github_issue_title\": \"\",\n  \"github_issue_body\": \"\"\n}\n\nRules:\n- If no relevant context exists, leave the string empty (\"\").\n- Do NOT include explanations, reasoning, commentary, assumptions, or URLs.\n- Do NOT mention things you did not find.\n- Do NOT return any text outside the JSON object.\n",
            "tools": "[\"^(list|get|search|track|describe)_.*\"]",
            "generalProvider": "port",
            "generalModel": "gpt-5",
            "systemPrompt": "You are a helpful assistant"
          },
          "type": "CUSTOM.portIo",
          "typeVersion": 1,
          "position": [
            -928,
            128
          ],
          "id": "a905b89a-606e-487f-80e3-c3f825550184",
          "name": "Extract context from Port",
          "credentials": {
            "portIoApi": {
              "id": "vphYNYaTZimXT7su",
              "name": "Port.io account"
            }
          }
        },
        {
          "parameters": {
            "conditions": {
              "options": {
                "caseSensitive": true,
                "leftValue": "",
                "typeValidation": "strict",
                "version": 2
              },
              "conditions": [
                {
                  "id": "8800068e-ddaa-4979-a589-6442f424bb09",
                  "leftValue": "={{ $json.webhookEvent == \"jira:issue_updated\" && $json.issue.fields.status.name == \"In Progress\" && $json.issue.fields.labels.includes(\"product_approved\") && !$json.issue.fields.labels.includes(\"copilot_assigned\") }}",
                  "rightValue": "",
                  "operator": {
                    "type": "boolean",
                    "operation": "true",
                    "singleValue": true
                  }
                }
              ],
              "combinator": "and"
            },
            "options": {}
          },
          "type": "n8n-nodes-base.if",
          "typeVersion": 2.2,
          "position": [
            -1200,
            144
          ],
          "id": "c3809188-d14d-4c33-89a3-086ca097f880",
          "name": "Is ready for assignment?"
        },
        {
          "parameters": {
            "owner": {
              "__rl": true,
              "value": "https://github.com/ORG",
              "mode": "url"
            },
            "repository": {
              "__rl": true,
              "value": "REPO",
              "mode": "list",
              "cachedResultName": "REPO",
              "cachedResultUrl": "https://github.com/ORG/REPO"
            },
            "title": "={{ $json.result.message.parseJson().github_issue_title }}",
            "body": "={{ $json.result.message.parseJson().github_issue_body }}",
            "labels": [
              {
                "label": "n8n"
              },
              {
                "label": "ai-workflow"
              }
            ],
            "assignees": []
          },
          "type": "n8n-nodes-base.github",
          "typeVersion": 1.1,
          "position": [
            -512,
            128
          ],
          "id": "2cbdb130-79fa-4885-a106-53234c467681",
          "name": "Create a GitHub issue",
          "webhookId": "7115b4e9-ca3d-4dbc-8b1b-8e00931a26f8",
          "credentials": {
            "githubApi": {
              "id": "zs106oTl3aX0eWI1",
              "name": "GitHub account"
            }
          }
        },
        {
          "parameters": {
            "operation": "createComment",
            "owner": {
              "__rl": true,
              "value": "https://github.com/ORG",
              "mode": "url"
            },
            "repository": {
              "__rl": true,
              "value": "REPO",
              "mode": "list",
              "cachedResultName": "REPO",
              "cachedResultUrl": "https://github.com/ORG/REPO"
            },
            "issueNumber": "={{ $('Create a GitHub issue').item.json.number }}",
            "body": "@copilot please take ownership of this issue and begin working on a solution.\n\nUse the information in the issue body and title to propose and implement the necessary code changes.\n"
          },
          "type": "n8n-nodes-base.github",
          "typeVersion": 1.1,
          "position": [
            -96,
            128
          ],
          "id": "0f0de120-9f27-4d06-958e-8b87b91a0487",
          "name": "Assign issue to Copilot",
          "webhookId": "87254a3f-ea48-432e-9fd2-897cf9b58143",
          "credentials": {
            "githubApi": {
              "id": "zs106oTl3aX0eWI1",
              "name": "GitHub account"
            }
          }
        },
        {
          "parameters": {
            "resource": "issueComment",
            "issueKey": "={{ $('Webhook').item.json.issue.key }}",
            "comment": "=We've created an issue at {{ $json.issue_url }} and assigned it to Copilot.",
            "options": {}
          },
          "type": "n8n-nodes-base.jira",
          "typeVersion": 1,
          "position": [
            208,
            0
          ],
          "id": "128e81aa-0607-4204-8f7a-1999f7690eed",
          "name": "Add issue link to Jira ticket",
          "credentials": {
            "jiraSoftwareCloudApi": {
              "id": "FcPOq6LRxRxgY0PY",
              "name": "Jira SW Cloud account"
            }
          }
        },
        {
          "parameters": {
            "operation": "update",
            "issueKey": "={{ $('Webhook').item.json.issue.key }}",
            "updateFields": {
              "labels": "={{ $('Webhook').item.json.issue.fields.labels.concat('copilot_assigned') }}"
            }
          },
          "type": "n8n-nodes-base.jira",
          "typeVersion": 1,
          "position": [
            208,
            240
          ],
          "id": "f424eb13-155c-411e-80b6-5abdc04b60c9",
          "name": "Mark ticket as assigned",
          "credentials": {
            "jiraSoftwareCloudApi": {
              "id": "FcPOq6LRxRxgY0PY",
              "name": "Jira SW Cloud account"
            }
          }
        },
        {
          "parameters": {
            "events": [
              "jira:issue_updated"
            ],
            "additionalFields": {}
          },
          "type": "n8n-nodes-base.jiraTrigger",
          "typeVersion": 1.1,
          "position": [
            -1424,
            144
          ],
          "id": "3e0414e9-faf5-45ba-bd1e-995d9506a39c",
          "name": "On Jira ticket updated",
          "webhookId": "9cdd8662-169f-4aae-b30f-d02d9666fce7",
          "credentials": {
            "jiraSoftwareCloudApi": {
              "id": "FcPOq6LRxRxgY0PY",
              "name": "Jira SW Cloud account"
            }
          }
        },
        {
          "parameters": {
            "content": "## Auto-resolve Jira tickets with coding agents\n\nImprove issue resolution by assigning Jira tickets to coding agents with full operational context from Port, ensuring faster, accurate, and context-aware development\n\n### How it works\n1. Listen for Jira ticket updates and detect when an issue moves to \\\"In Progress\\\" with the label product_approved and without copilot_assigned.\n2. Query the Port catalog to extract only contextual information relevant to the Jira issue (services, repos, docs, resources, dependencies).\n3. Generate a concise GitHub issue title and a self-contained issue body that summarizes the Jira description and includes any found Port context.\n4. Create the GitHub issue in the target repository and post a comment that requests Copilot to take ownership.\n5. Write the GitHub link back to the Jira ticket and add the copilot_assigned label so the ticket is marked as handled.\n\n### Setup\n- [ ] Connect your Jira Cloud account and enable issue_updated events\n- [ ] Register for free on [Port.io](https://www.port.io)\n- [ ]  Connect your Port.io account and add the API key\n- [ ] Connect your GitHub account and select the target repository\n- [ ] Ensure a Copilot bot or @copilot user has access to the repository\n- [ ] Confirm the workflow webhook or Jira trigger URL is active\n- [ ] Test by moving a product_approved ticket to In Progress",
            "height": 672,
            "width": 512
          },
          "type": "n8n-nodes-base.stickyNote",
          "typeVersion": 1,
          "position": [
            -2016,
            -176
          ],
          "id": "5badbf3d-1732-480f-bb83-26ec01fbdb33",
          "name": "Sticky Note"
        },
        {
          "parameters": {
            "content": "## Port Context Lake\n\nTo extract contextual information relevant to the Jira issue (services, repos, docs, resources, dependencies).",
            "height": 560,
            "width": 400,
            "color": 6
          },
          "type": "n8n-nodes-base.stickyNote",
          "typeVersion": 1,
          "position": [
            -976,
            -160
          ],
          "id": "840ffdbb-f4c2-4ed2-ab9e-f756efde12e9",
          "name": "Sticky Note1"
        },
        {
          "parameters": {
            "content": "## Github Copilot Assignment\n\nTo assign a ticket to Copilot, we first create a GitHub issue and then add a @copilot comment to the GitHub issue instructing Copilot to take ownership.",
            "height": 560,
            "width": 592,
            "color": 4
          },
          "type": "n8n-nodes-base.stickyNote",
          "typeVersion": 1,
          "position": [
            -544,
            -160
          ],
          "id": "4f389694-ed4b-448c-8a88-724c6cd66635",
          "name": "Sticky Note2"
        },
        {
          "parameters": {
            "content": "## Jira Ticket Linkage\n\nTo ensure that any new Github issue related to a Jira ticket is promptly linked back to the ticket in a comment, providing clear traceability and context for development progress.",
            "height": 560,
            "width": 464,
            "color": 5
          },
          "type": "n8n-nodes-base.stickyNote",
          "typeVersion": 1,
          "position": [
            80,
            -160
          ],
          "id": "e71ebc42-20b1-4095-aed7-9e7fbe731d8f",
          "name": "Sticky Note3"
        }
      ],
      "pinData": {},
      "connections": {
        "Parse Port AI response": {
          "main": [
            [
              {
                "node": "Create a GitHub issue",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Is issue creation successful?": {
          "main": [
            [
              {
                "node": "Assign issue to Copilot",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Extract context from Port": {
          "main": [
            [
              {
                "node": "Parse Port AI response",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Is ready for assignment?": {
          "main": [
            [
              {
                "node": "Extract context from Port",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Create a GitHub issue": {
          "main": [
            [
              {
                "node": "Is issue creation successful?",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Assign issue to Copilot": {
          "main": [
            [
              {
                "node": "Add issue link to Jira ticket",
                "type": "main",
                "index": 0
              },
              {
                "node": "Mark ticket as assigned",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "On Jira ticket updated": {
          "main": [
            [
              {
                "node": "Is ready for assignment?",
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
      "versionId": "7f20c404-39e1-42e4-a7dd-5b6e217d9f24",
      "meta": {
        "instanceId": "be7665cef51b13547e586e0f385e42416ebee48719c71d7dc7c03dbdf41fc246"
      },
      "id": "ioofAvQkygfyHxOd",
      "tags": []
    }
    ```
    </details>

5. Click **Import** to load the workflow into n8n.


### Configure workflow credentials

Before the workflow can run, you need to configure credentials for Jira, GitHub, and Port.

#### Configure Jira credentials

1. In the **On Jira issue updated** node, click on the credentials dropdown.
2. Select **Create New Credential** or use an existing Jira credential.
3. Enter your Jira credentials:
   - **Jira URL** — Your Jira instance URL (e.g., `https://your-domain.atlassian.net`)
   - **Email** — Your Jira account email
   - **API Token** — Your Jira API token ([Learn how to create one](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/))
4. Click **Save** to store the credential.

#### Configure GitHub credentials

1. In the **Create an issue** node, click on the credentials dropdown.
2. Select **Create New Credential** or use an existing GitHub credential.
3. Enter your GitHub credentials:
   - **GitHub Personal Access Token** — A token with `repo` scope ([Learn how to create one](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token))
4. Click **Save** to store the credential.


### Configure workflow parameters

After importing the workflow, you need to update several parameters to match your environment:

1. **Update GitHub repository settings**:
   - In the **Create an issue** node, update the `owner` field with your GitHub organization or username.
   - Update the `repository` field with your target repository name.

2. **Update Jira trigger conditions** (optional):
   - In the **Is Ready for Assignment?** node, you can modify the condition to match your workflow requirements. The default condition checks for:
     - Issue status is "In Progress"
     - Issue has the "product_approved" label
   - You can change the label name or add additional conditions as needed.

3. **Update Port AI prompt** (optional):
   - In the **Extract issue context** node, you can customize the `userPrompt` to adjust how Port queries your catalog and formats the GitHub issue.
   - The prompt uses Port's MCP tools (`^(list|get|search|track|describe)_.*`) to query your software catalog for relevant context.

:::tip Customizing the workflow
You can customize the workflow to match your specific needs:
- Change the Jira label trigger condition to use different labels or status transitions.
- Modify the Port query prompt to focus on specific blueprint types or properties.
- Add additional nodes to enrich the workflow with notifications, logging, or other integrations.
- Adjust the GitHub issue labels to match your repository's labeling conventions.
:::

### Set up Jira webhook trigger

The workflow uses a Jira webhook trigger to listen for issue updates. After importing the workflow, you need to configure the webhook in Jira.

1. Open the **On Jira issue updated** node in your n8n workflow and copy its webhook URL.

2. In Jira, go to **Settings → System → Webhooks** and click **Create a webhook**.

3. Enter a name, paste the URL, enable it, select **Issue updated**, and optionally add a JQL filter.

4. Click **Create** to save.


## How the workflow works

The n8n workflow orchestrates the following steps:

1. **Jira trigger** — The workflow listens for Jira issue updates via webhook.
2. **Condition check** — Verifies that the issue status is "In Progress" and has the required label (e.g., "product_approved") without the "copilot_assigned" label.
3. **Port context extraction** — Uses Port's n8n node to query your software catalog for relevant context about services, repositories, teams, dependencies, and documentation related to the Jira issue.
4. **Parse response** — Retrieves the AI-generated GitHub issue title and body from Port.
5. **Create GitHub issue** — Creates a new GitHub issue with the enriched context from Port.
6. **Assign to Copilot** — Adds a comment to the GitHub issue instructing Copilot to take ownership.
7. **Add issue link to Jira ticket** — Adds a comment to the Jira ticket with the GitHub issue URL, providing clear traceability.
8. **Mark ticket as assigned** — Updates the Jira ticket to add the "copilot_assigned" label, preventing duplicate processing.


## Test the workflow

1. **Trigger a test Jira update:** Add the configured label (e.g., `product_approved`) to a test ticket and move it from **To Do** → **In Progress**.
2. **Verify workflow execution:** In n8n, check the workflow’s execution history. Ensure each node outputs as expected (webhook payload, condition pass, Port context, parsed JSON, GitHub issue creation).
3. **Verify GitHub issue:** Confirm a new issue was created with the Jira key in the title, context in the description, correct labels, and a comment for Copilot.

    <img src="/img/guides/auto-resolve-jira-ticket-test-n8n-workflow.png" alt="example github issue assignment" border="1px" width="60%" />


## Related guides

- [Set up Port's n8n custom node](https://docs.port.io/guides/all/setup-port-n8n-node) — Learn how to install and configure Port's n8n node.
- [Remediate vulnerability with n8n and Port](https://docs.port.io/guides/all/remediate-vulnerability-with-n8n-and-port) — Another example of using Port as a context lake in n8n workflows.
- [Automatically resolve tickets with coding agents](https://docs.port.io/guides/all/automatically-resolve-tickets-with-coding-agents) — The Port-native version of this workflow using Port automations and AI agents.

