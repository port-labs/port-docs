---
displayed_sidebar: null
description: Learn how to create Jira issues from Dependabot alerts in Port, ensuring timely vulnerability tracking and resolution.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Create Jira Issue from Dependabot Alert

## Overview
This guide will help you implement a self-service action in Port that allows you to create Jira issues from Dependabot alerts.
This functionality streamlines vulnerability management by enabling users to quickly create and track issues for security alerts.

You can implement this action in two ways:
1. **GitHub Actions**: A more flexible approach that allows for complex workflows and custom logic, suitable for teams that want to maintain their automation in Git.
2. **Synced Webhooks**: A simpler approach that directly interacts with Jira's API through Port, ideal for quick implementation and minimal setup.

## Use cases
* Automatically create Jira issues from Dependabot alerts.
* Add detailed metadata to Jira issues from Dependabot alerts.
* Link Dependabot alerts to services in your Port catalog.

## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to your Jira organization with permissions to create issues.
- [Port's GitHub app](https://github.com/apps/getport-io) needs to be installed.
- [Jira API token](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/) with permissions to create new issues.

## Set up data model

If you haven't installed the [Jira integration](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/), you'll need to create blueprints for Jira projects and issues.    
However we highly recommend you install the Jira integration to have these automatically set up for you.

:::tip Jira integration
This step is not required for this example, but it will create all the blueprint boilerplate for you, and also update the catalog in real time with the new issue created.
:::

### Create the Jira Project blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

   <details>
   <summary><b>Jira Project Blueprint (Click to expand)</b></summary>

   ```json
   {
      "identifier": "jiraProject",
      "description": "A Jira project",
      "title": "Jira Project",
      "icon": "Jira",
      "schema": {
         "properties": {
            "url": {
               "title": "Project URL",
               "type": "string",
               "format": "url",
               "description": "URL to the project in Jira"
            },
            "totalIssues": {
               "title": "Total Issues",
               "type": "number",
               "description": "The total number of issues in the project"
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

### Create the Repository blueprint

You should have installed the [Port's GitHub app](https://github.com/apps/getport-io) and created a `Repository` blueprint shuld be created for you, If you have not installed the app, you can alternatively create the `Repository` blueprint in Port using the schema below:

      <details>
      <summary><b>Repository Blueprint (Click to expand)</b></summary>

      ```json
      {
      "identifier": "repository",
      "title": "Repository",
      "icon": "Github",
      "schema": {
         "properties": {
            "readme": {
            "title": "README",
            "type": "string",
            "format": "markdown",
            "icon": "Book"
            },
            "url": {
            "title": "URL",
            "format": "url",
            "type": "string",
            "icon": "Link"
            },
            "language": {
            "icon": "Git",
            "type": "string",
            "title": "Language",
            "enum": [
               "GO",
               "Python",
               "Node",
               "React"
            ],
            "enumColors": {
               "GO": "red",
               "Python": "green",
               "Node": "blue",
               "React": "yellow"
            }
            },
            "slack": {
            "icon": "Slack",
            "type": "string",
            "title": "Slack",
            "format": "url"
            },
            "code_owners": {
            "title": "Code owners",
            "description": "This service's code owners",
            "type": "string",
            "icon": "TwoUsers"
            },
            "type": {
            "title": "Type",
            "description": "This repository's type",
            "type": "string",
            "enum": [
               "Backend",
               "Frontend",
               "Library"
            ],
            "enumColors": {
               "Backend": "purple",
               "Frontend": "pink",
               "Library": "green"
            },
            "icon": "DefaultProperty"
            },
            "lifecycle": {
            "title": "Lifecycle",
            "type": "string",
            "enum": [
               "Production",
               "Experimental",
               "Deprecated"
            ],
            "enumColors": {
               "Production": "green",
               "Experimental": "yellow",
               "Deprecated": "red"
            },
            "icon": "DefaultProperty"
            },
            "locked_in_prod": {
            "icon": "DefaultProperty",
            "title": "Locked in Prod",
            "type": "boolean",
            "default": false
            },
            "locked_reason_prod": {
            "icon": "DefaultProperty",
            "title": "Locked Reason Prod",
            "type": "string"
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

### Create the Dependabot Alert blueprint

Create the Dependabot Alert blueprint using this schema:

<details>
<summary><b>Dependabot Alert Blueprint (Click to expand)</b></summary>

```json
{
   "identifier": "githubDependabotAlert",
   "title": "Dependabot Alert",
   "icon": "Github",
   "schema": {
      "properties": {
         "severity": {
            "icon": "DefaultProperty",
            "title": "Severity",
            "type": "string",
            "enum": [
               "low",
               "medium",
               "high",
               "critical"
            ],
            "enumColors": {
               "low": "green",
               "medium": "orange",
               "high": "red",
               "critical": "red"
            }
         },
         "state": {
            "title": "State",
            "type": "string",
            "enum": [
               "auto_dismissed",
               "dismissed",
               "fixed",
               "open"
            ],
            "enumColors": {
               "auto_dismissed": "green",
               "dismissed": "green",
               "fixed": "green",
               "open": "red"
            },
            "icon": "DefaultProperty"
         },
         "packageName": {
            "icon": "DefaultProperty",
            "title": "Package Name",
            "type": "string"
         },
         "packageEcosystem": {
            "title": "Package Ecosystem",
            "type": "string"
         },
         "manifestPath": {
            "title": "Manifest Path",
            "type": "string"
         },
         "scope": {
            "title": "Scope",
            "type": "string"
         },
         "ghsaID": {
            "title": "GHSA ID",
            "type": "string"
         },
         "cveID": {
            "title": "CVE ID",
            "type": "string"
         },
         "url": {
            "title": "URL",
            "type": "string",
            "format": "url"
         },
         "references": {
            "icon": "Vulnerability",
            "title": "References",
            "type": "array",
            "items": {
               "type": "string",
               "format": "url"
            }
         }
      },
      "required": []
   },
   "mirrorProperties": {},
   "calculationProperties": {},
   "aggregationProperties": {},
   "relations": {
      "jira_issue": {
         "title": "JIRA Issue",
         "target": "jiraIssue",
         "required": false,
         "many": false
      },
      "service": {
         "title": "Service",
         "target": "service",
         "required": false,
         "many": false
      }
   }
}
```
</details>

:::tip Mapping Dependabot Alerts to Repository Blueprint
To effectively manage your Dependabot alerts, map them to your `Repository` blueprint in Port. This allows you to categorize and link alerts to the appropriate repositories within your catalog, enhancing visibility and traceability. 
Follow this [resource mapping guide](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/examples/resource-mapping-examples#map-repositories-dependabot-alerts-and-code-scan-alerts) for detailed steps on how to map Dependabot alerts.
:::

## GitHub actions implementation
To implement this self-service action using GitHub Actions, follow these steps to set up the required configuration:

### Add GitHub secrets

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
- `JIRA_API_TOKEN` - [Jira API token](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account) generated by the user.
- `JIRA_BASE_URL` - The URL of your Jira organization. For example, https://your-organization.atlassian.net.
- `JIRA_USER_EMAIL` - The email of the Jira user that owns the Jira API token.
- `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
- `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).

### Add GitHub workflow

Create the file `.github/workflows/create-jira-issue-from-dependabot.yml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>
<summary><b>GitHub Workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Create Jira Issue from Dependabot Alert

on:
   workflow_dispatch:
      inputs:
         project:
            required: true
            type: string
         type:
            required: true
            type: string
         port_context:
            required: true
            type: string

jobs:
   create-jira-issue:
      runs-on: ubuntu-latest
      steps:
         - name: Checkout code
           uses: actions/checkout@v3

         - name: Login to Jira
           uses: atlassian/gajira-login@v3
           env:
              JIRA_BASE_URL: ${{ secrets.JIRA_BASE_URL }}
              JIRA_USER_EMAIL: ${{ secrets.JIRA_USER_EMAIL }}
              JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}

         - name: Inform starting of Jira issue creation
           uses: port-labs/port-github-action@v1
           with:
              clientId: ${{ secrets.PORT_CLIENT_ID }}
              clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
              operation: PATCH_RUN
              runId: ${{ fromJson(inputs.port_context).run_id }}
              logMessage: "Creating a new Jira issue from Dependabot alert... ⛴️"

         - name: Create Jira issue
           id: create_jira
           uses: atlassian/gajira-create@v3
           with:
              project: ${{ inputs.project }}
              issuetype: ${{ inputs.type }}
              summary: "Dependabot Alert: ${{ fromJson(inputs.port_context).entity.title }}"
              description: |
                 **Severity**: ${{ fromJson(inputs.port_context).entity.properties.severity }}
                 **State**: ${{ fromJson(inputs.port_context).entity.properties.state }}
                 **Package Name**: ${{ fromJson(inputs.port_context).entity.properties.packageName }}
                 **Package Ecosystem**: ${{ fromJson(inputs.port_context).entity.properties.packageEcosystem }}
                 **Manifest Path**: ${{ fromJson(inputs.port_context).entity.properties.manifestPath }}
                 **Scope**: ${{ fromJson(inputs.port_context).entity.properties.scope }}
                 **GHSA ID**: ${{ fromJson(inputs.port_context).entity.properties.ghsaID }}
                 **CVE ID**: ${{ fromJson(inputs.port_context).entity.properties.cveID }}
                 **URL**: ${{ fromJson(inputs.port_context).entity.properties.url }}
              fields: |
                 {
                   "labels": ["port-${{ fromJson(inputs.port_context).entity.identifier }}"]
                 }

         - name: Inform creation of Jira issue
           uses: port-labs/port-github-action@v1
           with:
              clientId: ${{ secrets.PORT_CLIENT_ID }}
              clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
              operation: PATCH_RUN
              link: ${{ secrets.JIRA_BASE_URL }}/browse/${{ steps.create_jira.outputs.issue }}
              runId: ${{ fromJson(inputs.port_context).run_id }}
              logMessage: |
                 Jira issue created! ✅
                 The issue ID is: ${{ steps.create_jira.outputs.issue }}
```
</details>

### Set up self-service action

We will create a self-service action to handle creating Jira issues from Dependabot alerts.
To create a self-service action follow these steps:

1. Head to the [self-service](https://app.getport.io/self-serve) page.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

      <details>
      <summary><b>Create Jira Issue from Dependabot Alert (Click to expand)</b></summary>

      <GithubActionModificationHint/>

      ```json showLineNumbers
      {
         "identifier": "create_jira_issue_from_dependabot",
         "title": "Create Jira Issue from Dependabot",
         "icon": "Jira",
         "description": "Creates a Jira issue from dependabot.",
         "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
               "properties": {
                  "project": {
                     "title": "Project",
                     "description": "The issue will be created on this project",
                     "icon": "Jira",
                     "type": "string",
                     "blueprint": "jiraProject",
                     "format": "entity"
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
                  }
               },
               "required": [
                  "type",
                  "project"
               ]
            },
            "blueprintIdentifier": "githubDependabotAlert"
         },
         "invocationMethod": {
            "type": "GITHUB",
            "org": "<Enter GitHub organization>",
            "repo": "<Enter GitHub repository>",
            "workflow": "create-jira-issue-from-dependabot.yml",
            "workflowInputs": {
               "type": "{{.inputs.\"type\"}}",
               "project": "{{.inputs.\"project\" | if type == \"array\" then map(.identifier) else .identifier end}}",
               "port_context": {
                  "entity": "{{.entity}}",
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

Now you should see the `Create Jira Issue from Dependabot` action in the self-service page. 🎉

## Synced webhook implementation

You can create Jira issues from Dependabot alerts by leveraging Port's **synced webhooks** and **secrets** to directly interact with the Jira's API.   
This method simplifies the setup by handling everything within Port.

### Add Port secrets

Add the following secrets to your Port account:

1. Click on the `...` button next to the profile icon in the top right corner.
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

### Set up self-service action

Follow these steps to create the self-service action:

1. Head to the [self-service](https://app.getport.io/self-serve) page.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

      <details>
      <summary><b>Create Jira Issue from Dependabot Alert (Webhook) (Click to expand)</b></summary>

      ```json showLineNumbers
      {
         "identifier": "create_jira_issue_from_dependabot_webhook",
         "title": "Create Jira Issue from Dependabot (Webhook)",
         "icon": "Jira",
         "description": "Creates a Jira issue from dependabot alert using a webhook",
         "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
               "properties": {
                  "project": {
                     "title": "Project Key",
                     "description": "The Jira project key where the issue will be created",
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
                  }
               },
               "required": [
                  "type",
                  "project"
               ]
            },
            "blueprintIdentifier": "githubDependabotAlert"
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
                     "key": "{{.inputs.project}}"
                  },
                  "summary": "Dependabot Alert: {{.entity.title}}",
                  "description": {
                     "version": 1,
                     "type": "doc",
                     "content": [
                        {
                           "type": "paragraph",
                           "content": [
                              {
                                 "type": "text",
                                 "text": "Severity",
                                 "marks": [
                                    {
                                       "type": "strong"
                                    }
                                 ]
                              },
                              {
                                 "type": "text",
                                 "text": ": {{.entity.properties.severity}}"
                              }
                           ]
                        },
                        {
                           "type": "paragraph",
                           "content": [
                              {
                                 "type": "text",
                                 "text": "State",
                                 "marks": [
                                    {
                                       "type": "strong"
                                    }
                                 ]
                              },
                              {
                                 "type": "text",
                                 "text": ": {{.entity.properties.state}}"
                              }
                           ]
                        },
                        {
                           "type": "paragraph",
                           "content": [
                              {
                                 "type": "text",
                                 "text": "Package Name",
                                 "marks": [
                                    {
                                       "type": "strong"
                                    }
                                 ]
                              },
                              {
                                 "type": "text",
                                 "text": ": {{.entity.properties.packageName}}"
                              }
                           ]
                        },
                        {
                           "type": "paragraph",
                           "content": [
                              {
                                 "type": "text",
                                 "text": "Package Ecosystem",
                                 "marks": [
                                    {
                                       "type": "strong"
                                    }
                                 ]
                              },
                              {
                                 "type": "text",
                                 "text": ": {{.entity.properties.packageEcosystem}}"
                              }
                           ]
                        },
                        {
                           "type": "paragraph",
                           "content": [
                              {
                                 "type": "text",
                                 "text": "Manifest Path",
                                 "marks": [
                                    {
                                       "type": "strong"
                                    }
                                 ]
                              },
                              {
                                 "type": "text",
                                 "text": ": {{.entity.properties.manifestPath}}"
                              }
                           ]
                        },
                        {
                           "type": "paragraph",
                           "content": [
                              {
                                 "type": "text",
                                 "text": "Scope",
                                 "marks": [
                                    {
                                       "type": "strong"
                                    }
                                 ]
                              },
                              {
                                 "type": "text",
                                 "text": ": {{.entity.properties.scope}}"
                              }
                           ]
                        },
                        {
                           "type": "paragraph",
                           "content": [
                              {
                                 "type": "text",
                                 "text": "GHSA ID",
                                 "marks": [
                                    {
                                       "type": "strong"
                                    }
                                 ]
                              },
                              {
                                 "type": "text",
                                 "text": ": {{.entity.properties.ghsaID}}"
                              }
                           ]
                        },
                        {
                           "type": "paragraph",
                           "content": [
                              {
                                 "type": "text",
                                 "text": "CVE ID",
                                 "marks": [
                                    {
                                       "type": "strong"
                                    }
                                 ]
                              },
                              {
                                 "type": "text",
                                 "text": ": {{.entity.properties.cveID}}"
                              }
                           ]
                        },
                        {
                           "type": "paragraph",
                           "content": [
                              {
                                 "type": "text",
                                 "text": "URL",
                                 "marks": [
                                    {
                                       "type": "strong"
                                    }
                                 ]
                              },
                              {
                                 "type": "text",
                                 "text": ": "
                              },
                              {
                                 "type": "text",
                                 "text": "{{.entity.properties.url}}",
                                 "marks": [
                                    {
                                       "type": "link",
                                       "attrs": {
                                          "href": "{{.entity.properties.url}}"
                                       }
                                    }
                                 ]
                              }
                           ]
                        }
                     ]
                  },
                  "issuetype": {
                     "name": "{{.inputs.type}}"
                  },
                  "labels": ["port-{{.entity.identifier}}"]
               }
            }
         },
         "requiredApproval": false
      }
      ```
      </details>

6. Click `Save`.

Now you should see the `Create Jira Issue from Dependabot (Webhook)` action in the self-service page. 🎉

:::tip Configure your Jira url
Replace `<JIRA_ORGANIZATION_URL>` in the webhook URL with your Jira organization URL (e.g., `your-org.atlassian.net`).

:::

## Let's test it!

1. Head to the [Self Service hub](https://app.getport.io/self-serve)
2. Click on the `Create Jira Issue from Dependabot` action (or the webhook version)
3. Select the Dependabot alert you want to create an issue for
4. Select the project where the issue will be created
5. Select the issue type
6. Click on `Execute`
7. Done! wait for the issue to be created in Jira

Congrats 🎉 You've created your first Jira issue from a Dependabot alert! 🔥

## More Self Service Jira Actions Examples
- [Report a bug in Jira](https://docs.port.io/guides/all/report-a-bug/) using Port's self-service actions
- [Open Jira issues with automatic labels](https://docs.port.io/guides/all/open-jira-issue-with-automatic-label)
- [Open/close JIRA issues for entities with violated scorecard rules](https://docs.port.io/promote-scorecards/manage-using-3rd-party-apps/jira)
- [Change status and assignee of Jira tickets](https://docs.port.io/guides/all/change-status-and-assignee-of-jira-ticket)
