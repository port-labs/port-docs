---
displayed_sidebar: null
description: Learn how to open Jira issues with automatic labels in Port, streamlining issue categorization and tracking.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'

# Open Jira issue with automatic label

## Overview
This guide will help you implement a self-service action in Port that allows you to create Jira issues with automatic labels that link issues to services in your catalog using GitHub Actions.

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

## GitHub workflow implementation
To implement this self-service action using GitHub Actions, follow these steps to set up the required configuration:

### Add GitHub secrets

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
- `JIRA_API_TOKEN` - [Jira API token](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account) generated by the user.
- `JIRA_BASE_URL` - The URL of your Jira organization. For example, https://your-organization.atlassian.net.
- `JIRA_USER_EMAIL` - The email of the Jira user that owns the Jira API token.
- `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
- `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).

### Add GitHub workflow

Create the file `.github/workflows/open-jira-issue-with-automatic-label.yml` in the `.github/workflows` folder of your repository.


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

### Set up self-service action

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
       "org": "<Enter GitHub organization>",
       "repo": "<Enter GitHub repository>",
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

6. Click `Save`.

Now you should see the `Open Jira Issue with automatic label` action in the self-service page. 🎉

## Let's test it!

1. Head to the [Self Service hub](https://app.getport.io/self-serve)
2. Click on the `Open Jira Issue with automatic label` action
3. Select the repository you want to create an issue for
4. Fill in the issue details:
   - Title of the issue
   - Type of issue
   - Project where the issue will be created
5. Click on `Execute`
6. Done! wait for the issue to be created in Jira with the automatic label

Congrats 🎉 You've created your first Jira issue with an automatic label that links to the service in Port! 🔥

## More Self Service Jira Actions Examples
- [Report a bug in Jira](https://docs.port.io/guides/all/report-a-bug/) using Port's self-service actions
- [Create Jira issues from Dependabot alerts](https://docs.port.io/guides/all/create-jira-issue-from-dependabot)
- [Open/close JIRA issues for entities with violated scorecard rules](https://docs.port.io/promote-scorecards/manage-using-3rd-party-apps/jira)
- [Change status and assignee of Jira tickets](https://docs.port.io/guides/all/change-status-and-assignee-of-jira-ticket)
