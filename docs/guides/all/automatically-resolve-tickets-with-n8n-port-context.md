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
      "name": "Auto Resolve Tickets to Coding Agents",
      "nodes": [
        {
          "parameters": {
            "owner": {
              "__rl": true,
              "value": "https://github.com/YOUR_ORG",
              "mode": "url"
            },
            "repository": {
              "__rl": true,
              "value": "YOUR_REPO",
              "mode": "list"
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
            1040,
            -272
          ],
          "id": "17bfcb73-15b9-4d9f-a26f-9aa48a0b6b6f",
          "name": "Create an issue",
          "webhookId": "7115b4e9-ca3d-4dbc-8b1b-8e00931a26f8",
          "credentials": {
            "githubApi": {
              "id": "YOUR_GITHUB_CREDENTIAL_ID",
              "name": "GitHub account"
            }
          }
        },
        {
          "parameters": {
            "operation": "createComment",
            "owner": {
              "__rl": true,
              "value": "https://github.com/YOUR_ORG",
              "mode": "url"
            },
            "repository": {
              "__rl": true,
              "value": "YOUR_REPO",
              "mode": "list"
            },
            "issueNumber": "={{ $('Create an issue').item.json.number }}",
            "body": "@copilot please take ownership of this issue and begin working on a solution.\n\nUse the information in the issue body and title to propose and implement the necessary code changes.\n"
          },
          "type": "n8n-nodes-base.github",
          "typeVersion": 1.1,
          "position": [
            1456,
            -272
          ],
          "id": "afc0fdd4-a24f-440b-b4e3-3887c3bf8d65",
          "name": "Create a comment on an issue",
          "webhookId": "87254a3f-ea48-432e-9fd2-897cf9b58143",
          "credentials": {
            "githubApi": {
              "id": "YOUR_GITHUB_CREDENTIAL_ID",
              "name": "GitHub account"
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
                  "leftValue": "={{ $json.webhookEvent == \"jira:issue_updated\" && $json.issue.fields.status.name == \"In Progress\" && $json.issue.fields.labels.includes(\"product_approved\") }}",
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
            416,
            -176
          ],
          "id": "099a6cc8-0721-4d11-aa29-76804012516e",
          "name": "Is Ready for Assignment?"
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
            208,
            -176
          ],
          "id": "bab68904-ab9f-4a13-b4dc-30edca725fc2",
          "name": "On Jira issue updated",
          "webhookId": "9cdd8662-169f-4aae-b30f-d02d9666fce7",
          "credentials": {
            "jiraSoftwareCloudApi": {
              "id": "YOUR_JIRA_CREDENTIAL_ID",
              "name": "Jira SW Cloud account"
            }
          }
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
            624,
            -272
          ],
          "id": "b56da201-87dc-4133-b9df-6cab656419b0",
          "name": "Extract issue context",
          "credentials": {
            "portIoApi": {
              "id": "YOUR_PORT_CREDENTIAL_ID",
              "name": "Port.io account"
            }
          }
        },
        {
          "parameters": {
            "operation": "getInvocation",
            "invocationId": "={{ $json.invocationIdentifier }}"
          },
          "type": "CUSTOM.portIo",
          "typeVersion": 1,
          "position": [
            832,
            -272
          ],
          "id": "d2128f6f-0982-4bc5-ab24-004e1c9cfbeb",
          "name": "Parse Port AI response",
          "credentials": {
            "portIoApi": {
              "id": "YOUR_PORT_CREDENTIAL_ID",
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
            1248,
            -272
          ],
          "id": "220c648b-9050-4f2c-9dc9-3e75e81df0b9",
          "name": "Is issue creation successful?"
        }
      ],
      "pinData": {},
      "connections": {
        "Create an issue": {
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
        "Is Ready for Assignment?": {
          "main": [
            [
              {
                "node": "Extract issue context",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "On Jira issue updated": {
          "main": [
            [
              {
                "node": "Is Ready for Assignment?",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Extract issue context": {
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
        "Parse Port AI response": {
          "main": [
            [
              {
                "node": "Create an issue",
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
                "node": "Create a comment on an issue",
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
      }
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
2. **Condition check** — Verifies that the issue status is "In Progress" and has the required label (e.g., "product_approved").
3. **Port context extraction** — Uses Port's n8n node to query your software catalog for relevant context about services, repositories, teams, dependencies, and documentation related to the Jira issue.
4. **Parse response** — Retrieves the AI-generated GitHub issue title and body from Port.
5. **Create GitHub issue** — Creates a new GitHub issue with the enriched context from Port.
6. **Assign to Copilot** — Adds a comment to the GitHub issue instructing Copilot to take ownership.


## Test the workflow

1. **Trigger a test Jira update:** Add the configured label (e.g., `product_approved`) to a test ticket and move it from **To Do** → **In Progress**.
2. **Verify workflow execution:** In n8n, check the workflow’s execution history. Ensure each node outputs as expected (webhook payload, condition pass, Port context, parsed JSON, GitHub issue creation).
3. **Verify GitHub issue:** Confirm a new issue was created with the Jira key in the title, context in the description, correct labels, and a comment for Copilot.

    <img src="/img/guides/auto-resolve-jira-ticket-test-n8n-workflow.png" alt="example github issue assignment" border="1px" width="60%" />


## Related guides

- [Set up Port's n8n custom node](https://docs.port.io/guides/all/setup-port-n8n-node) — Learn how to install and configure Port's n8n node.
- [Remediate vulnerability with n8n and Port](https://docs.port.io/guides/all/remediate-vulnerability-with-n8n-and-port) — Another example of using Port as a context lake in n8n workflows.
- [Automatically resolve tickets with coding agents](https://docs.port.io/guides/all/automatically-resolve-tickets-with-coding-agents) — The Port-native version of this workflow using Port automations and AI agents.

