---
displayed_sidebar: null
description: Learn how to open Jira issues with automatic labels in Port, streamlining issue categorization and tracking.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'
import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Open Jira issue with automatic label

## Overview
This guide will help you implement a self-service action in Port that allows you to create Jira issues with automatic labels that link issues to services in your catalog using GitHub Actions.

You can implement this action in two ways:
1. **GitHub workflow**: A more flexible approach that allows for complex workflows and custom logic, suitable for teams that want to maintain their automation in Git.
2. **Synced webhooks**: A simpler approach that directly interacts with Jira's API through Port, ideal for quick implementation and minimal setup.

## Use cases
- Categorize tasks, issues and bugs by services directly from Port
- Add service metadata to issues from Port

## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to your Jira organization with permissions to create issues.
- [Port's GitHub app](https://github.com/apps/getport-io) installed.
- [Jira API token](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/) with permissions to create new issues.

## Set up data model

If you haven't installed the [Jira integration](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/), you'll need to create blueprints for Jira issues and services.  
However we highly recommend you install the Jira integration to have these automatically set up for you.

### Create the jira issue blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

   <details>
   <summary><b>Jira Issue Blueprint (Click to expand)</b></summary>

   ```json
   {
     "identifier": "jiraIssue",
     "title": "Jira Issue",
     "icon": "Jira",
     "schema": {
       "properties": {
         "url": {
           "title": "Issue URL",
           "type": "string",
           "format": "url",
           "description": "URL to the issue in Jira"
         },
         "status": {
           "title": "Status",
           "type": "string",
           "description": "The status of the issue"
         },
         "issueType": {
           "title": "Type",
           "type": "string",
           "description": "The type of the issue"
         },
         "components": {
           "title": "Components",
           "type": "array",
           "description": "The components related to this issue"
         },
         "assignee": {
           "title": "Assignee",
           "type": "string",
           "format": "user",
           "description": "The user assigned to the issue"
         },
         "reporter": {
           "title": "Reporter",
           "type": "string",
           "description": "The user that reported to the issue",
           "format": "user"
         },
         "creator": {
           "title": "Creator",
           "type": "string",
           "description": "The user that created to the issue",
           "format": "user"
         },
         "priority": {
           "title": "Priority",
           "type": "string",
           "description": "The priority of the issue"
         },
         "labels": {
           "items": {
             "type": "string"
           },
           "title": "Labels",
           "type": "array"
         },
         "created": {
           "title": "Created At",
           "type": "string",
           "description": "The created datetime of the issue",
           "format": "date-time"
         },
         "updated": {
           "title": "Updated At",
           "type": "string",
           "description": "The updated datetime of the issue",
           "format": "date-time"
         }
       }
     },
     "calculationProperties": {},
     "relations": {
       "parentIssue": {
         "target": "jiraIssue",
         "title": "Parent Issue",
         "required": false,
         "many": false
       },
       "subtasks": {
         "target": "jiraIssue",
         "title": "Subtasks",
         "required": false,
         "many": true
       }
     }
   }
   ```

   </details>

5. Click "Save" to create the blueprint.

### Create the repository blueprint

You should have installed the [Port's GitHub app](https://github.com/apps/getport-io) and created a `Repository` blueprint should be created for you. If you have not installed the app, you can alternatively create the `Repository` blueprint in Port using the schema below:

   <details>
   <summary><b>Repository Blueprint (Click to expand)</b></summary>

   ```json showLineNumbers
      {
        "identifier": "githubRepository",
        "title": "Repository",
        "icon": "Github",
        "ownership": {
          "type": "Direct"
        },
        "schema": {
          "properties": {
            "readme": {
              "title": "README",
              "type": "string",
              "format": "markdown"
            },
            "url": {
              "icon": "DefaultProperty",
              "title": "Repository URL",
              "type": "string",
              "format": "url"
            },
            "defaultBranch": {
              "title": "Default branch",
              "type": "string"
            },
            "last_contributor": {
              "title": "Last contributor",
              "icon": "TwoUsers",
              "type": "string",
              "format": "user"
            },
            "last_push": {
              "icon": "GitPullRequest",
              "title": "Last push",
              "description": "Last commit to the main branch",
              "type": "string",
              "format": "date-time"
            },
            "require_code_owner_review": {
              "title": "Require code owner review",
              "type": "boolean",
              "icon": "DefaultProperty",
              "description": "Requires review from code owners before a pull request can be merged"
            },
            "require_approval_count": {
              "title": "Require approvals",
              "type": "number",
              "icon": "DefaultProperty",
              "description": "The number of approvals required before merging a pull request"
            }
          },
          "required": []
        },
        "mirrorProperties": {},
        "calculationProperties": {},
        "aggregationProperties": {},
        "relations": {}
    }
   ```

   </details>

## Implementation

<Tabs>
  <TabItem value="webhook" label="Synced webhook" default>

    You can create Jira issues by leveraging Port's **synced webhooks** and **secrets** to directly interact with the Jira's API. This method simplifies the setup by handling everything within Port.

    <h3>Add Port secrets</h3>

    <ExistingSecretsCallout integration="Jira" />


    To add these secrets to your portal:

    1. Click on the `...` button in the top right corner of your Port application.

    2. Click on **Credentials**.

    3. Click on the `Secrets` tab.

    4. Click on `+ Secret` and add the following secrets:
       - `JIRA_API_TOKEN` - Your Jira API token
       - `JIRA_USER_EMAIL` - The email of the Jira user that owns the API token
       - `JIRA_AUTH` - Base64 encoded string of your Jira credentials. Generate this by running:
         ```bash
         echo -n "your-email@domain.com:your-api-token" | base64
         ```
         Replace `your-email@domain.com` with your Jira email and `your-api-token` with your Jira API token.
         
         :::info One time generation
         The base64 encoded string only needs to be generated once and will work for all webhook calls until you change your API token.
         :::

    <h3>Set up self-service action</h3>

    Follow these steps to create the self-service action:

    1. Head to the [self-service](https://app.getport.io/self-serve) page.

    2. Click on the `+ New Action` button.

    3. Click on the `{...} Edit JSON` button.

    4. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Create Jira Issue (Webhook) (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "service_create_jira_issue_webhook",
          "title": "Open Jira Issue with automatic label (Webhook)",
          "icon": "Jira",
          "description": "Creates a Jira issue with a label to the concerned service using webhook",
          "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
              "properties": {
                "title": {
                  "title": "Title",
                  "description": "Title of the Jira issue",
                  "icon": "Jira",
                  "type": "string"
                },
                "type": {
                  "title": "Type",
                  "description": "Issue type",
                  "icon": "Jira",
                  "type": "string",
                  "default": "Task",
                  "enum": [
                    "Task",
                    "Story",
                    "Bug",
                    "Epic"
                  ],
                  "enumColors": {
                    "Task": "blue",
                    "Story": "green",
                    "Bug": "red",
                    "Epic": "pink"
                  }
                },
                "project": {
                  "title": "Project",
                  "description": "The issue will be created on this project",
                  "icon": "Jira",
                  "type": "string",
                  "blueprint": "jiraProject",
                  "format": "entity"
                }
              },
              "required": [
                "title",
                "type",
                "project"
              ],
              "order": [
                "title",
                "type",
                "project"
              ]
            },
            "blueprintIdentifier": "githubRepository"
          },
          "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://<JIRA_ORGANIZATION_URL>/rest/api/3/issue",
            "agent": false,
            "synchronized": true,
            "method": "POST",
            "headers": {
              "Authorization": "Basic {{.secrets.JIRA_AUTH}}",
              "Content-Type": "application/json"
            },
            "body": {
              "fields": {
                "project": {
                  "key": "{{.inputs.project.identifier}}"
                },
                "summary": "{{.inputs.title}}",
                "issuetype": {
                  "name": "{{.inputs.type}}"
                }
              }
            }
          },
          "requiredApproval": false
        }
        ```

        </details>

    5. Click `Save`.

    <h3>Create an automation to update issue labels</h3>

    This automation will ensure that the created Jira issue is properly labeled with the service identifier.

    Follow these steps to add the automation:

    1. Head to the [automation](https://app.getport.io/settings/automations) page.

    2. Click on the `+ Automation` button.

    3. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Update Jira issue labels automation (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "jiraIssue_add_service_label",
          "title": "Add Service Label to Jira Issue",
          "description": "Add a service-specific label to the newly created Jira issue",
          "trigger": {
            "type": "automation",
            "event": {
              "type": "RUN_UPDATED",
              "actionIdentifier": "service_create_jira_issue_webhook"
            },
            "condition": {
              "type": "JQ",
              "expressions": [
                ".diff.after.status == \"SUCCESS\""
              ],
              "combinator": "and"
            }
          },
          "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://<JIRA_ORGANIZATION_URL>/rest/api/3/issue/{{.event.diff.after.response.id}}/",
            "agent": false,
            "synchronized": true,
            "method": "PUT",
            "headers": {
              "Authorization": "Basic {{.secrets.JIRA_AUTH}}",
              "Content-Type": "application/json"
            },
            "body": {
              "fields": {
                "labels": ["port-{{.event.diff.after.entity.identifier}}"]
              }
            }
          },
          "publish": true
        }
        ```

        </details>

    4. Click `Save`.

    :::tip Configure your Jira URL
    Replace `<JIRA_ORGANIZATION_URL>` in both webhook URLs with your Jira organization URL (e.g., `example.atlassian.net`).
    :::

  </TabItem>

  <TabItem value="github" label="GitHub workflow">

      To implement this use-case using a GitHub workflow, follow these steps:

      <h3>Add GitHub secrets</h3>

      In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
      - `JIRA_API_TOKEN` - [Jira API token](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account) generated by the user.
      - `JIRA_BASE_URL` - The URL of your Jira organization. For example, https://your-organization.atlassian.net.
      - `JIRA_USER_EMAIL` - The email of the Jira user that owns the Jira API token.
      - `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
      - `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).

      <h3>Add GitHub workflow</h3>

      Create the file `.github/workflows/open-jira-issue-with-automatic-label.yml` in the `.github/workflows` folder of your repository.

      <GithubDedicatedRepoHint/>

      <details>
      <summary><b>GitHub Workflow (Click to expand)</b></summary>

      ```yaml showLineNumbers
      name: Open Jira issue with automatic label
      on:
        workflow_dispatch:
          inputs:
            title:
              required: true
              type: string
            type:
              required: true
              type: string
            project:
              required: true
              type: string
            port_context:
              required: true
              type: string

      jobs:
        create-entity-in-port-and-update-run:
          runs-on: ubuntu-latest
          steps:
            - name: Login
              uses: atlassian/gajira-login@v3
              env:
                JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
                JIRA_USER_EMAIL: ${{ secrets.JIRA_USER_EMAIL }}
                JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}

            - name: Inform starting of jira issue creation
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                operation: PATCH_RUN
                runId: ${{ fromJson(inputs.port_context).run_id }}
                logMessage: |
                  Creating a new Jira issue with automatic label.. ⛴️

            - name: Create Jira issue
              id: create
              uses: atlassian/gajira-create@v3
              with:
                project: ${{ inputs.project }}
                issuetype: ${{ inputs.type }}
                summary: ${{ inputs.title }}
                fields: |
                  ${{ fromJson(inputs.port_context).entity != null
                    && format('{{ "labels": ["port-{0}"] }}', fromJson(inputs.port_context).entity)
                    || '{}'
                  }}

            - name: Inform creation of Jira issue
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                operation: PATCH_RUN
                link: ${{ secrets.JIRA_BASE_URL }}/browse/${{ steps.create.outputs.issue }}
                runId: ${{ fromJson(inputs.port_context).run_id }}
                logMessage: |
                  Jira issue created! ✅
                  The issue id is: ${{ steps.create.outputs.issue }}
      ```

      </details>

      <h3>Set up self-service action</h3>

      We will create a self-service action to handle creating Jira issues with automatic labels.
      To create a self-service action follow these steps:

      1. Head to the [self-service](https://app.getport.io/self-serve) page.
      2. Click on the `+ New Action` button.
      3. Click on the `{...} Edit JSON` button.
      4. Copy and paste the following JSON configuration into the editor.

          <details>
          <summary><b>Open Jira Issue with automatic label action (Click to expand)</b></summary>

          <GithubActionModificationHint/>

          ```json showLineNumbers
          {
            "identifier": "service_open_jira_issue_with_automatic_label",
            "title": "Open Jira Issue with automatic label",
            "icon": "Jira",
            "description": "Creates a Jira issue with a label to the concerned service.",
            "trigger": {
              "type": "self-service",
              "operation": "DAY-2",
              "userInputs": {
                "properties": {
                  "title": {
                    "title": "Title",
                    "description": "Title of the Jira issue",
                    "icon": "Jira",
                    "type": "string"
                  },
                  "type": {
                    "title": "Type",
                    "description": "Issue type",
                    "icon": "Jira",
                    "type": "string",
                    "default": "Task",
                    "enum": [
                      "Task",
                      "Story",
                      "Bug",
                      "Epic"
                    ],
                    "enumColors": {
                      "Task": "blue",
                      "Story": "green",
                      "Bug": "red",
                      "Epic": "pink"
                    }
                  },
                  "project": {
                    "title": "Project",
                    "description": "The issue will be created on this project",
                    "icon": "Jira",
                    "type": "string",
                    "blueprint": "jiraProject",
                    "format": "entity"
                  }
                },
                "required": [
                  "title",
                  "type",
                  "project"
                ],
                "order": [
                  "title",
                  "type"
                ]
              },
              "blueprintIdentifier": "githubRepository"
            },
            "invocationMethod": {
              "type": "GITHUB",
              "org": "<GITHUB_ORG>",
              "repo": "<GITHUB_REPO>",
              "workflow": "open-jira-issue-with-automatic-label.yml",
              "workflowInputs": {
                "title": "{{.inputs.\"title\"}}",
                "type": "{{.inputs.\"type\"}}",
                "project": "{{.inputs.\"project\" | if type == \"array\" then map(.identifier) else .identifier end}}",
                "port_context": {
                  "entity": "{{.entity.identifier}}",
                  "run_id": "{{.run.id}}"
                }
              },
              "reportWorkflowStatus": true
            },
            "requiredApproval": false
          }
          ```

          </details>

      5. Click `Save`.

      Now you should see the `Open Jira Issue with automatic label` action in the self-service page. 🎉

  </TabItem>
</Tabs>

## Let's test it! 

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. Choose either the GitHub workflow or webhook implementation:
   - For GitHub workflow: Click on `Open Jira Issue with automatic label`
   - For webhook: Click on `Open Jira Issue with automatic label (Webhook)`

3. Select the repository you want to create an issue for

4. Fill in the issue details:
   - Title of the issue
   - Type of issue (Task, Story, Bug, or Epic)
   - Project where the issue will be created

5. Click on `Execute`

6. Wait for:
   - GitHub workflow: The workflow to complete and create the issue with the label
   - Webhook: The issue to be created and the automation to add the label

7. Check your Jira project to see the new issue with the service-specific label (format: `port-{repository-identifier}`)

## More Self Service Jira Actions Examples
- [Report a bug in Jira](https://docs.port.io/guides/all/report-a-bug/) using Port's self-service actions
- [Create Jira issues from Dependabot alerts](https://docs.port.io/guides/all/create-jira-issue-from-dependabot)
- [Open/close JIRA issues for entities with violated scorecard rules](https://docs.port.io/promote-scorecards/manage-using-3rd-party-apps/jira)
- [Change status and assignee of Jira tickets](https://docs.port.io/guides/all/change-status-and-assignee-of-jira-ticket)
