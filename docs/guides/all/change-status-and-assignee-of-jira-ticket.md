---
displayed_sidebar: null
description: Quickly change the status and assignee of Jira tickets in Port, streamlining your project management process.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'
import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Change status and assignee of Jira ticket

## Overview
This guide will help you implement a self-service action in Port that allows you to change the status and assignee of Jira tickets directly from Port.
This functionality streamlines ticket management by enabling users to update tickets without leaving Port.

You can implement this action in two ways:
1. **GitHub workflow**: A more flexible approach that allows for complex workflows and custom logic, suitable for teams that want to maintain their automation in Git.
2. **Synced webhooks**: A simpler approach that directly interacts with Jira's API through Port, ideal for quick implementation and minimal setup.



## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to your Jira organization with permissions to manage tickets.

## Set up data model

If you haven't installed the [Jira integration](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/), you'll need to create a blueprint for Jira issues and Jira user.  
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
      "relations": {}
    }
    ```

    </details>

5. Click "Save" to create the blueprint.

### Create the jira user blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:
    <details>
    <summary><b>Jira User Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "jiraUser",
      "description": "A Jira user account",
      "title": "Jira User",
      "icon": "User",
      "schema": {
        "properties": {
          "emailAddress": {
            "title": "Email",
            "type": "string",
            "format": "email",
            "description": "User's email address"
          },
          "active": {
            "title": "Active Status",
            "type": "boolean",
            "description": "Whether the user account is active"
          },
          "accountType": {
            "title": "Account Type",
            "type": "string",
            "description": "Type of Jira account (e.g., atlassian, customer)"
          },
          "timeZone": {
            "title": "Time Zone",
            "type": "string",
            "description": "User's configured time zone"
          },
          "locale": {
            "title": "Locale",
            "type": "string",
            "description": "User's configured locale"
          },
          "avatarUrl": {
            "title": "Avatar URL",
            "type": "string",
            "format": "url",
            "description": "URL for user's 48x48 avatar image"
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
5. Click "Save" to create the blueprint.


## Implementation

<Tabs>
  <TabItem value="webhook" label="Synced webhook" default>

    You can update a Jira issue by leveraging Port's **synced webhooks** and **secrets** to directly interact with the Jira's API. This method simplifies the setup by handling everything within Port.

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

    <h3>Set up self-service actions</h3>

    Due to limitations of the Jira API, we will need to create two separate self-service actions:
    1. One action to change the status of a Jira issue
    2. Another action to change the assignee of a Jira issue

    Follow these steps to create the self-service actions:

    1. Head to the [self-service](https://app.getport.io/self-serve) page.
    2. Click on the `+ New Action` button.
    3. Click on the `{...} Edit JSON` button.
    4. Copy and paste the appropriate JSON configuration into the editor.

        <details>
        <summary><b>Change Jira Ticket Status Action (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "jiraIssue_change_status_webhook",
          "title": "Change Jira Ticket Status",
          "icon": "Jira",
          "description": "Update a Jira ticket's status using a synced webhook",
          "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
              "properties": {
                "status": {
                  "icon": "DefaultProperty",
                  "title": "Status",
                  "type": "string",
                  "description": "Select the status to transition the issue to",
                  "enum": [
                    "To Do",
                    "In Progress",
                    "Done",
                    "Code Review",
                    "Product Review",
                    "Waiting For Prod"
                  ],
                  "enumColors": {
                    "To Do": "lightGray",
                    "In Progress": "bronze",
                    "Done": "green",
                    "Code Review": "darkGray",
                    "Product Review": "purple",
                    "Waiting For Prod": "orange"
                  }
                }
              },
              "required": [
                "status"
              ],
              "order": [
                "status"
              ]
            },
            "blueprintIdentifier": "jiraIssue"
          },
          "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://<JIRA_ORGANIZATION_URL>/rest/api/3/issue/{{.entity.identifier}}/transitions",
            "agent": false,
            "synchronized": true,
            "method": "POST",
            "headers": {
              "Authorization": "Basic {{.secrets.JIRA_AUTH}}",
              "Content-Type": "application/json"
            },
            "body": {
              "transition": {
                "{{ if .inputs.status == 'To Do' then 'id' else 'none' end }}": 11,
                "{{ if .inputs.status == 'In Progress' then 'id' else 'none' end }}": 21,
                "{{ if .inputs.status == 'Done' then 'id' else 'none' end }}": 31,
                "{{ if .inputs.status == 'Code Review' then 'id' else 'none' end }}": 41,
                "{{ if .inputs.status == 'Product Review' then 'id' else 'none' end }}": 51,
                "{{ if .inputs.status == 'Waiting For Prod' then 'id' else 'none' end }}": 61
              }
            }
          },
          "requiredApproval": false
        }
        ```

        </details>

        <details>
        <summary><b>Change Jira Ticket Assignee Action (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "jiraIssue_change_assignee_webhook",
          "title": "Change Jira Ticket Assignee",
          "icon": "Jira",
          "description": "Update a Jira ticket's assignee using a synced webhook",
          "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
              "properties": {
                "jira_user": {
                  "type": "string",
                  "title": "Jira user",
                  "description": "Select the Jira user to assign the ticket to",
                  "blueprint": "jiraUser",
                  "format": "entity"
                }
              },
              "required": [
                "jira_user"
              ],
              "order": [
                "jira_user"
              ]
            },
            "blueprintIdentifier": "jiraIssue"
          },
          "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://<JIRA_ORGANIZATION_URL>/rest/api/3/issue/{{.entity.identifier}}/assignee",
            "agent": false,
            "synchronized": true,
            "method": "PUT",
            "headers": {
              "Authorization": "Basic {{.secrets.JIRA_AUTH}}",
              "Content-Type": "application/json"
            },
            "body": {
              "accountId": "{{.inputs.jira_user.identifier}}"
            }
          },
          "requiredApproval": false
        }
        ```

        </details>

    5. Click `Save` for each action.

    Now you should see both the `Change Jira ticket status` and `Change Jira ticket assignee` actions in the self-service page. 🎉

    :::tip Configure your Jira url and status values
    Replace `<JIRA_ORGANIZATION_URL>` in the webhook URL with your Jira organization URL (e.g., `example.atlassian.net`).

    Ensure the status names are mapped to Jira transition IDs as done in the action definitions above:
    - "To Do" → 11
    - "In Progress" → 21
    - "Done" → 31
    - "Code Review" → 41
    - "Product Review" → 51
    - "Waiting For Prod" → 61

    Make sure to update these mappings to match your Jira workflow's transition IDs. You can find your workflow's transition IDs by calling:
    ```bash
    curl -X GET "https://example.atlassian.net/rest/api/3/issue/{issueKey}/transitions" \
      -H "Authorization: Basic $JIRA_AUTH" \
      -H "Content-Type: application/json"
    ```

    The response will contain an array of transitions, each with an `id` and a `name` that you can use in your configuration.
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

      Create the file `.github/workflows/change-jira-ticket-status-and-assignee.yml` in the `.github/workflows` folder of your repository.

      <GithubDedicatedRepoHint/>

      <details>
      <summary><b>GitHub Workflow (Click to expand)</b></summary>

      ```yaml showLineNumbers
      name: Change Jira Ticket Status and Assignee
      on:
        workflow_dispatch:
          inputs:
            status:
              type: string
              required: false
            assignee:
              type: string
              required: false
            port_context:
              required: true
              type: string

      jobs:
        change-jira-ticket-status-and-assignee:
          runs-on: ubuntu-latest
          outputs:
            selected_user_id: ${{ steps.user_list_from_search.outputs.selected_user_id }}
            selected_user_name: ${{ steps.user_list_from_search.outputs.selected_user_name }}

          steps:
            - name: Login
              uses: atlassian/gajira-login@v3
              env:
                JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
                JIRA_USER_EMAIL: ${{ secrets.JIRA_USER_EMAIL }}
                JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}

            - name: Inform starting of changing Jira ticket status
              id: inform_ticket_start
              if: ${{ inputs.status }}
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                operation: PATCH_RUN
                runId: ${{ fromJson(inputs.port_context).run_id }}
                logMessage: |
                  Changing status of Jira issue... ⛴️

            - name: Inform skipping of changing Jira ticket status
              id: inform_skip_ticket_status
              if: steps.inform_ticket_start.outcome == 'skipped'
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                operation: PATCH_RUN
                runId: ${{ fromJson(inputs.port_context).run_id }}
                logMessage: |
                  Status field is blank, skipping status change... ⛴️

            - name: Transition issue
              id: transition_issue_status
              if: steps.inform_ticket_start.outcome == 'success'
              uses: atlassian/gajira-transition@v3
              with:
                issue: ${{ fromJson(inputs.port_context).entity }}
                transition: ${{ inputs.status }}

            - name: Inform that status has been changed
              if: steps.transition_issue_status.outcome == 'success'
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                operation: PATCH_RUN
                link: ${{ secrets.JIRA_BASE_URL }}/browse/${{ fromJson(inputs.port_context).entity }}
                runId: ${{ fromJson(inputs.port_context).run_id }}
                logMessage: |
                  Jira issue status changed to ${{ inputs.status }}! ✅

            - name: Inform starting of changing Jira ticket assignee
              id: inform_assignee_start
              if: ${{ inputs.assignee }}
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                operation: PATCH_RUN
                runId: ${{ fromJson(inputs.port_context).run_id }}
                logMessage: |
                  Assigning ticket to user... ⛴️

            - name: Inform skipping of changing Jira ticket assignee
              id: inform_skip_assignee
              if: steps.inform_assignee_start.outcome == 'skipped'
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                operation: PATCH_RUN
                runId: ${{ fromJson(inputs.port_context).run_id }}
                logMessage: |
                  Assignee field is blank, skipping assigning of ticket... ⛴️

            - name: Inform searching of user in user list
              if: steps.inform_skip_assignee.outcome == 'skipped'
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                operation: PATCH_RUN
                runId: ${{ fromJson(inputs.port_context).run_id }}
                logMessage: |
                  Searching for user in organization user list... ⛴️

            - name: Search for assignee among user list
              id: search_for_assignee
              if: steps.inform_skip_assignee.outcome == 'skipped'
              uses: fjogeleit/http-request-action@v1
              with:
                url: "${{ secrets.JIRA_BASE_URL }}/rest/api/3/user/search?query=${{ inputs.assignee }}"
                method: "GET"
                username: ${{ secrets.JIRA_USER_EMAIL }}
                password: ${{ secrets.JIRA_API_TOKEN }}
                customHeaders: '{"Content-Type": "application/json"}'

            - name: Install jq
              run: sudo apt-get install jq
              if: steps.search_for_assignee.outcome == 'success'

            - name: Retrieve user list from search
              id: user_list_from_search
              if: steps.search_for_assignee.outcome == 'success'
              run: |
                selected_user_id=$(echo '${{ steps.search_for_assignee.outputs.response }}' | jq -r 'if length > 0 then .[0].accountId else "empty" end')
                selected_user_name=$(echo '${{ steps.search_for_assignee.outputs.response }}' | jq -r 'if length > 0 then .[0].displayName else "empty" end')
                echo "selected_user_id=${selected_user_id}" >> $GITHUB_OUTPUT
                echo "selected_user_name=${selected_user_name}" >> $GITHUB_OUTPUT

            - name: Inform user existence
              if: steps.user_list_from_search.outputs.selected_user_id != 'empty'
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                operation: PATCH_RUN
                runId: ${{ fromJson(inputs.port_context).run_id }}
                logMessage: |
                  User found 🥹 Assigning ticket ${{ fromJson(inputs.port_context).entity }} to ${{ steps.user_list_from_search.outputs.selected_user_name }}... ⛴️

            - name: Inform user inexistence
              if: steps.user_list_from_search.outputs.selected_user_id == 'empty'
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                operation: PATCH_RUN
                runId: ${{ fromJson(inputs.port_context).run_id }}
                logMessage: |
                  User not found 😭 Skipping assignment... ⛴️

            - name: Assign ticket to selected user
              id: assign_ticket
              if: steps.user_list_from_search.outputs.selected_user_id != 'empty'
              uses: fjogeleit/http-request-action@v1
              with:
                url: "${{ secrets.JIRA_BASE_URL }}/rest/api/3/issue/${{ fromJson(inputs.port_context).entity }}/assignee"
                method: "PUT"
                username: ${{ secrets.JIRA_USER_EMAIL }}
                password: ${{ secrets.JIRA_API_TOKEN }}
                customHeaders: '{"Content-Type": "application/json"}'
                data: '{"accountId": "${{ steps.user_list_from_search.outputs.selected_user_id }}"}'

            - name: Inform ticket has been assigned
              if: steps.assign_ticket.outcome == 'success'
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                operation: PATCH_RUN
                link: ${{ secrets.JIRA_BASE_URL }}/browse/${{ fromJson(inputs.port_context).entity }}
                runId: ${{ fromJson(inputs.port_context).run_id }}
                logMessage: |
                  Jira issue has been assigned to ${{ steps.user_list_from_search.outputs.selected_user_name }}! ✅
      ```

      </details>

      <h3>Set up self-service action</h3>

      We will create a self-service action to handle changing the status and the assignee of an issue.
      To create a self-service action follow these steps:

      1. Head to the [self-service](https://app.getport.io/self-serve) page.
      2. Click on the `+ New Action` button.
      3. Click on the `{...} Edit JSON` button.
      4. Copy and paste the following JSON configuration into the editor.

          <details>
          <summary><b>Change Jira ticket status and assignee (Click to expand)</b></summary>

          <GithubActionModificationHint/>

          ```json showLineNumbers
          {
            "identifier": "jiraIssue_change_jira_ticket_status",
            "title": "Change Jira ticket status and assignee",
            "icon": "Jira",
            "description": "Transition a ticket to another status.",
            "trigger": {
              "type": "self-service",
              "operation": "DAY-2",
              "userInputs": {
                "properties": {
                  "status": {
                    "icon": "DefaultProperty",
                    "title": "Status",
                    "type": "string",
                    "description": "Select the status to transition the issue to",
                    "enum": [
                      "To Do",
                      "In Progress",
                      "Done",
                      "Code Review",
                      "Product Review",
                      "Waiting For Prod"
                    ],
                    "enumColors": {
                      "To Do": "lightGray",
                      "In Progress": "bronze",
                      "Done": "green",
                      "Code Review": "darkGray",
                      "Product Review": "purple",
                      "Waiting For Prod": "orange"
                    }
                  },
                  "assignee": {
                    "type": "string",
                    "title": "Assignee",
                    "icon": "User",
                    "format": "user"
                  }
                },
                "required": [
                  "status",
                  "assignee"
                ],
                "order": [
                  "status"
                ]
              },
              "blueprintIdentifier": "jiraIssue"
            },
            "invocationMethod": {
              "type": "GITHUB",
              "org": "<GITHUB_ORG>",
              "repo": "<GITHUB_REPO>",
              "workflow": "change_jira_ticket_status_and_assignee.yml",
              "workflowInputs": {
                "status": "{{.inputs.\"status\"}}",
                "assignee": "{{.inputs.\"assignee\"}}",
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

      Now you should see the `Change Jira ticket status and assignee` action in the self-service page. 🎉

  </TabItem>

</Tabs>

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. Choose either the GitHub workflow or webhook implementation:
   - For GitHub workflow: Click on `Change Jira ticket status and assignee`
   - For webhook: Click on either `Change Jira ticket status` or `Change Jira ticket assignee`

3. Select the Jira ticket you want to update (In case you didn't install the [Jira integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/project-management/jira/), it means you don't have any Jira tickets or users in Port yet, so you will need to create one manually in Port to test this action)

4. For status changes: Select the new status from the dropdown
   For assignee changes: Select a Jira user to assign the ticket to

5. Click on `Execute`

6. Done! wait for the ticket to be updated in Jira

## More Self Service Jira Actions Examples
- [Report a bug in Jira](https://docs.port.io/guides/all/report-a-bug/) using Port's self-service actions
- [Open Jira issues with automatic labels](https://docs.port.io/guides/all/open-jira-issue-with-automatic-label)
- [Open/close JIRA issues for entities with violated scorecard rules](https://docs.port.io/promote-scorecards/manage-using-3rd-party-apps/jira)
- Add a comment to a Jira ticket using Port's self-service actions