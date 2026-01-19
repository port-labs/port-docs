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
- You have a working n8n instance (Cloud or self-hosted) with [Port's n8n custom node installed](https://docs.port.io/ai-interfaces/port-n8n-node).
- Your GitHub organization has GitHub Copilot enabled, so Copilot can be automatically assigned to any issues created through this guide.


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
      "name": "Auto-resolve Jira tickets with GitHub Copilot using Port Context",
      "nodes": [
        {
          "parameters": {
            "conditions": {
              "options": {
                "version": 2,
                "leftValue": "",
                "caseSensitive": true,
                "typeValidation": "strict"
              },
              "combinator": "and",
              "conditions": [
                {
                  "id": "ded3f45f-fd63-493a-a5fc-225004d5d292",
                  "operator": {
                    "type": "number",
                    "operation": "notEmpty",
                    "singleValue": true
                  },
                  "leftValue": "={{ $json.number }}",
                  "rightValue": ""
                }
              ]
            },
            "options": {}
          },
          "id": "dc5b0535-793f-4ba7-b748-2798a3c4e22e",
          "name": "Is issue creation successful?",
          "type": "n8n-nodes-base.if",
          "position": [
            2080,
            544
          ],
          "typeVersion": 2.2
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
              "combinator": "and",
              "conditions": [
                {
                  "id": "8800068e-ddaa-4979-a589-6442f424bb09",
                  "operator": {
                    "type": "boolean",
                    "operation": "true",
                    "singleValue": true
                  },
                  "leftValue": "={{ $json.webhookEvent == \"jira:issue_updated\" && $json.issue.fields.status.name == \"In Progress\" && $json.issue.fields.labels.includes(\"product_approved\") && !$json.issue.fields.labels.includes(\"copilot_assigned\") }}",
                  "rightValue": ""
                }
              ]
            },
            "options": {}
          },
          "id": "222058f6-cc6c-450a-8fbb-be3ed01c1f4a",
          "name": "Is ready for assignment?",
          "type": "n8n-nodes-base.if",
          "position": [
            1184,
            560
          ],
          "typeVersion": 2.2
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
              "value": "aws-codeploy-demo",
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
          "id": "03c29fb9-c747-4602-941e-a8f279cda515",
          "name": "Create a GitHub issue",
          "type": "n8n-nodes-base.github",
          "position": [
            1872,
            544
          ],
          "webhookId": "d7f1c627-82f6-4f61-a220-bbe24c943a51",
          "typeVersion": 1.1,
          "credentials": {
            "githubApi": {
              "id": "3LaRYp1opDmuB6HX",
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
              "value": "aws-codeploy-demo",
              "mode": "list"
            },
            "issueNumber": "={{ $('Create a GitHub issue').item.json.number }}",
            "body": "@copilot please take ownership of this issue and begin working on a solution.\n\nUse the information in the issue body and title to propose and implement the necessary code changes.\n"
          },
          "id": "bd136228-82c3-4342-9a39-1461bf59b170",
          "name": "Assign issue to Copilot",
          "type": "n8n-nodes-base.github",
          "position": [
            2288,
            544
          ],
          "webhookId": "e4ba9b66-a68a-40d4-9c69-2dabb05d337b",
          "typeVersion": 1.1,
          "credentials": {
            "githubApi": {
              "id": "3LaRYp1opDmuB6HX",
              "name": "GitHub account"
            }
          }
        },
        {
          "parameters": {
            "resource": "issueComment",
            "issueKey": "={{ $('On Jira ticket updated').item.json.issue.key }}",
            "comment": "=We've created an issue at {{ $('Create a GitHub issue').item.json.html_url }} and assigned it to Copilot.",
            "options": {}
          },
          "id": "ee576573-0a96-4713-b71e-cf6b48d1aabe",
          "name": "Add issue link to Jira ticket",
          "type": "n8n-nodes-base.jira",
          "position": [
            2592,
            416
          ],
          "typeVersion": 1,
          "credentials": {
            "jiraSoftwareCloudApi": {
              "id": "kFxflLsLkRHNY8gr",
              "name": "Jira SW Cloud account"
            }
          }
        },
        {
          "parameters": {
            "operation": "update",
            "issueKey": "={{ $('On Jira ticket updated').item.json.issue.key }}",
            "updateFields": {
              "labels": "={{ $('On Jira ticket updated').item.json.issue.fields.labels.concat('copilot_assigned') }}"
            }
          },
          "id": "46c0c5c2-4670-4a68-8338-5ded401e7242",
          "name": "Mark ticket as assigned",
          "type": "n8n-nodes-base.jira",
          "position": [
            2592,
            656
          ],
          "typeVersion": 1,
          "credentials": {
            "jiraSoftwareCloudApi": {
              "id": "kFxflLsLkRHNY8gr",
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
          "id": "155cb785-4a98-4d57-a8ed-fb45cd8a800e",
          "name": "On Jira ticket updated",
          "type": "n8n-nodes-base.jiraTrigger",
          "position": [
            960,
            560
          ],
          "webhookId": "559a3f87-cf37-4a25-b04a-13fc2dd72cf5",
          "typeVersion": 1.1,
          "credentials": {
            "jiraSoftwareCloudApi": {
              "id": "kFxflLsLkRHNY8gr",
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
          "id": "4193fee9-a6b8-4fa3-a0cd-17397c54d64e",
          "name": "Sticky Note",
          "type": "n8n-nodes-base.stickyNote",
          "position": [
            368,
            240
          ],
          "typeVersion": 1
        },
        {
          "parameters": {
            "content": "## Port Context Lake\n\nTo extract contextual information relevant to the Jira issue (services, repos, docs, resources, dependencies).",
            "height": 560,
            "width": 400,
            "color": 6
          },
          "id": "ff5792b7-5bcf-4837-9cc8-232f7dc69f7b",
          "name": "Sticky Note1",
          "type": "n8n-nodes-base.stickyNote",
          "position": [
            1408,
            256
          ],
          "typeVersion": 1
        },
        {
          "parameters": {
            "content": "## Github Copilot Assignment\n\nTo assign a ticket to Copilot, we first create a GitHub issue and then add a @copilot comment to the GitHub issue instructing Copilot to take ownership.",
            "height": 560,
            "width": 592,
            "color": 4
          },
          "id": "c4d094bd-342f-4625-a881-484ea9b2ad45",
          "name": "Sticky Note2",
          "type": "n8n-nodes-base.stickyNote",
          "position": [
            1840,
            256
          ],
          "typeVersion": 1
        },
        {
          "parameters": {
            "content": "## Jira Ticket Linkage\n\nTo ensure that any new Github issue related to a Jira ticket is promptly linked back to the ticket in a comment, providing clear traceability and context for development progress.",
            "height": 560,
            "width": 464,
            "color": 5
          },
          "id": "c0593d1b-48f9-4bfe-88db-6b2e2a0dbbf4",
          "name": "Sticky Note3",
          "type": "n8n-nodes-base.stickyNote",
          "position": [
            2464,
            256
          ],
          "typeVersion": 1
        },
        {
          "parameters": {
            "operation": "getInvocation",
            "invocation_identifier": "={{ $json.invocationIdentifier }}"
          },
          "type": "@port-labs/n8n-nodes-portio-experimental.portApiAi",
          "typeVersion": 1,
          "position": [
            1664,
            544
          ],
          "id": "da319617-4f73-4988-8558-370cea868d60",
          "name": "Parse Port AI response",
          "credentials": {
            "portApi": {
              "id": "tRAwIiwSncqQh00a",
              "name": "Port account"
            }
          }
        },
        {
          "parameters": {
            "operation": "generalInvoke",
            "userPrompt": "=A Jira issue has moved to In Progress.\n\nIssue Details:\n- Key: {{ $('On Jira ticket updated').item.json.issue.key }}\n- Title: {{ $('On Jira ticket updated').item.json.issue.fields.summary }}\n- Type: {{ $('On Jira ticket updated').item.json.issue.fields.issuetype.name }}\n- Description: {{ $('On Jira ticket updated').item.json.issue.fields.description }}\n\nRelated Jira Project:\n- Key: {{ $('On Jira ticket updated').item.json.issue.fields.project.key }}\n- Name: {{ $('On Jira ticket updated').item.json.issue.fields.project.name }}\n\nRelated Service or Github Repo entity ID:\n{{ $('On Jira ticket updated').item.json.issue.fields.customfield_10308.value }}\n\nYour task:\nUse the Related Service/Repo ID and Issue ID to query the Port catalog.\n\nWhen querying Port entities via MCP (e.g. list_entities):\n- Always fetch ALL available properties for each entity\n- Do not limit properties unless explicitly required\n\nExtract ONLY context that actually exists and is directly related via Port relationships.\n\n### Core service context (if available)\n- Service description and tier based on the README\n- Owning team(s)\n- Deployment environments (e.g. prod, staging, dev)\n- Key dependencies (upstream/downstream services)\n\n### Relationship-heavy context (AGGREGATE, DO NOT LIST)\nFor the related service/repository, summarize:\n- PagerDuty incidents:\n  - Total number of open incidents\n- Deployments:\n  - Total number of deployments\n  - Environments deployed to\n  - Most recent deployment timestamp (if available)\n- Security vulnerabilities:\n  - Total number of open vulnerabilities\n  - Breakdown by severity (e.g. critical / high / medium)\n\nDo NOT include:\n- Raw logs\n- “None found” bullet lists\n\nOnly mention a category if at least one related entity exists.\n\nThen prepare:\n1. A GitHub issue title that starts with the Jira key.\n2. A GitHub issue body that:\n- Clearly summarizes the Jira issue in developer-friendly language\n- Adds concise business-relevant Port context (ownership, risk, stability, deploy state)\n- Uses aggregated facts, not exhaustive lists\n- Avoids assumptions or inferred data\n- Is fully self-contained\n- Ends exactly with: @github-copilot please begin working on this issue.\n\nIMPORTANT OUTPUT CONSTRAINT (HIGHEST PRIORITY)\n- If no relevant Port context exists, use empty strings (\"\") for fields where applicable.\n- You must return ONLY a valid JSON object and nothing else.\n\nOutput format:\nThe response must be parseable by JSON.parse() with no cleanup.\nReturn EXACTLY:\n{\"github_issue_title\":\"\",\"github_issue_body\":\"\"}\n",
            "generalProvider": "port",
            "generalModel": "gpt-5",
            "systemPrompt": "You are a helpful assistant that extracts contextual information from the Port catalogue. You must return ONLY a valid JSON object and nothing else. If you violate this output format, downstream systems will fail.",
            "executionMode": "Automatic"
          },
          "type": "@port-labs/n8n-nodes-portio-experimental.portApiAi",
          "typeVersion": 1,
          "position": [
            1472,
            544
          ],
          "id": "9f3068e9-cbbe-47a6-a617-35914ba2c366",
          "name": "Extract context from Port",
          "credentials": {
            "portApi": {
              "id": "tRAwIiwSncqQh00a",
              "name": "Port account"
            }
          }
        }
      ],
      "pinData": {},
      "connections": {
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
        }
      },
      "active": false,
      "settings": {
        "executionOrder": "v1",
        "availableInMCP": false
      },
      "versionId": "de493068-851e-422d-96f5-9891b3e6868e",
      "meta": {
        "templateId": "11728",
        "templateCredsSetupCompleted": true,
        "instanceId": "ece285d5f6d021267c1bf415cc6f43f61f89e93c51704a3846513e293fe52759"
      },
      "id": "DhwPhvyAJzzDoAiq",
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

- [Set up Port's n8n custom node](https://docs.port.io/ai-interfaces/port-n8n-node) — Learn how to install and configure Port's n8n node.
- [Remediate vulnerability with n8n and Port](https://docs.port.io/guides/all/remediate-vulnerability-with-n8n-and-port) — Another example of using Port as a context lake in n8n workflows.
- [Automatically resolve tickets with coding agents](https://docs.port.io/guides/all/automatically-resolve-tickets-with-coding-agents) — The Port-native version of this workflow using Port automations and AI agents.

