---
displayed_sidebar: null
description: Learn how to create a PagerDuty incident in Port with this guide, ensuring prompt and effective incident management.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'
import PagerDutyServiceBlueprint from '/docs/guides/templates/pagerduty/_pagerduty_incident_blueprint.mdx'
import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create a PagerDuty Incident

## Overview
This guide will help you implement a self-service action in Port that allows you to create PagerDuty incidents directly from Port.
This functionality streamlines incident management by enabling users to create incidents without leaving Port.

You can implement this action in two ways:
1. **GitHub workflow**: A more flexible approach that allows for complex workflows and custom logic, suitable for teams that want to maintain their automation in Git.
2. **Synced webhooks**: A simpler approach that directly interacts with PagerDuty's API through Port, ideal for quick implementation and minimal setup.

## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to your PagerDuty organization with permissions to manage incidents.
- Optional - Install Port's PagerDuty integration [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty)

	:::tip PagerDuty Integration
	This step is not required for this example, but it will create all the blueprint boilerplate for you, and also ingest and update the catalog in real time with your PagerDuty Incidents.
	:::

## Set up data model

If you haven't installed the PagerDuty integration, you'll need to create blueprints for PagerDuty incidents and PagerDuty services.
However, we highly recommend you install the PagerDuty integration to have these automatically set up for you.

### Create the PagerDuty service blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

    <details>
    <summary><b>PagerDuty Service Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "pagerdutyService",
      "description": "This blueprint represents a PagerDuty service in our software catalog",
      "title": "PagerDuty Service",
      "icon": "pagerduty",
      "schema": {
        "properties": {
          "description": {
            "type": "string",
            "title": "Description"
          },
          "status": {
            "type": "string",
            "title": "Status",
            "enum": ["active", "warning", "critical", "maintenance", "disabled"]
          },
          "url": {
            "type": "string",
            "format": "url",
            "title": "Service URL"
          },
          "created_at": {
            "type": "string",
            "format": "date-time",
            "title": "Created At"
          },
          "updated_at": {
            "type": "string",
            "format": "date-time",
            "title": "Updated At"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "relations": {}
    }
    ```
    </details>

5. Click "Save" to create the blueprint.

### Create the PagerDuty incident blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

    <details>
    <summary><b>PagerDuty Incident Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "pagerdutyIncident",
      "description": "This blueprint represents a PagerDuty incident in our software catalog",
      "title": "PagerDuty Incident",
      "icon": "pagerduty",
      "schema": {
        "properties": {
          "status": {
            "type": "string",
            "title": "Incident Status",
            "enum": [
              "triggered",
              "annotated",
              "acknowledged",
              "reassigned",
              "escalated",
              "reopened",
              "resolved"
            ]
          },
          "url": {
            "type": "string",
            "format": "url",
            "title": "Incident URL"
          },
          "urgency": {
            "type": "string",
            "title": "Incident Urgency",
            "enum": ["high", "low"]
          },
          "responder": {
            "type": "string",
            "title": "Assignee"
          },
          "escalation_policy": {
            "type": "string",
            "title": "Escalation Policy"
          },
          "created_at": {
            "title": "Create At",
            "type": "string",
            "format": "date-time"
          },
          "updated_at": {
            "title": "Updated At",
            "type": "string",
            "format": "date-time"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "relations": {
        "pagerdutyService": {
          "title": "PagerDuty Service",
          "target": "pagerdutyService",
          "required": false,
          "many": true
        }
      }
    }
    ```
    </details>

5. Click "Save" to create the blueprint.

## Implementation

<Tabs>
  <TabItem value="webhook" label="Synced webhook" default>

    You can create PagerDuty incidents by leveraging Port's **synced webhooks** and **secrets** to directly interact with the PagerDuty's API. This method simplifies the setup by handling everything within Port.

    <h3>Add Port secrets</h3>

    <ExistingSecretsCallout integration="PagerDuty" />

    To add these secrets to your portal:

    1. Click on the `...` button in the top right corner of your Port application.

    2. Click on **Credentials**.

    3. Click on the `Secrets` tab.

    4. Click on `+ Secret` and add the following secrets:

        - `PAGERDUTY_API_TOKEN`: Your PagerDuty API token
        - `PAGERDUTY_USER_EMAIL`: The email of the PagerDuty user that owns the API token

    <h3> Set up self-service action </h3>

    We will create a self-service action to handle creating PagerDuty incidents using webhooks.
    To create a self-service action follow these steps:

    1. Head to the [self-service](https://app.getport.io/self-serve) page.
    2. Click on the `+ New Action` button.
    3. Click on the `{...} Edit JSON` button.
    4. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Create PagerDuty Incident (Webhook) (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "create_incident_webhook",
          "title": "Create Incident (Webhook)",
          "icon": "pagerduty",
          "description": "Create a new PagerDuty incident",
          "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
              "properties": {
                "title": {
                  "icon": "DefaultProperty",
                  "title": "Title",
                  "type": "string"
                },
                "extra_details": {
                  "title": "Extra Details",
                  "type": "string"
                },
                "urgency": {
                  "icon": "DefaultProperty",
                  "title": "Urgency",
                  "type": "string",
                  "default": "high",
                  "enum": [
                    "high",
                    "low"
                  ],
                  "enumColors": {
                    "high": "yellow",
                    "low": "green"
                  }
                }
              },
              "required": [
                "title",
                "urgency"
              ],
              "order": [
                "title",
                "urgency",
                "extra_details"
              ]
            },
            "blueprintIdentifier": "pagerdutyService"
          },
          "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://api.pagerduty.com/incidents",
            "agent": false,
            "synchronized": true,
            "method": "POST",
            "headers": {
              "Authorization": "Token token={{.secrets.PAGERDUTY_API_TOKEN}}",
              "Accept": "application/vnd.pagerduty+json;version=2",
              "From": "{{.secrets.PAGERDUTY_USER_EMAIL}}",
              "Content-Type": "application/json"
            },
            "body": {
              "incident": {
                "type": "incident",
                "title": "{{.inputs.title}}",
                "service": {
                  "id": "{{.entity.identifier}}",
                  "type": "service_reference"
                },
                "urgency": "{{.inputs.urgency}}",
                "body": {
                  "type": "incident_body",
                  "details": "{{.inputs.extra_details}}"
                }
              }
            }
          },
          "requiredApproval": false
        }
        ```
        </details>

    5. Click `Save`.

    Now you should see the `Create Incident (Webhook)` action in the self-service page. 🎉

    <h3> Create an automation to upsert entity in port </h3>

    After each execution of the action, we would like to update the relevant entity in Port with the latest status.  

    To achieve this, we can create an automation that will be triggered when the action completes successfully.

    To create the automation:

    1. Head to the [automation](https://app.getport.io/settings/automations) page.

    2. Click on the `+ Automation` button.

    3. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Update PagerDuty incident in Port automation (Click to expand)</b></summary>

        ```json showLineNumbers
            {
              "identifier": "pagerdutyIncident_sync_status",
              "title": "Sync PagerDuty Incident Status",
              "description": "Update PagerDuty incident data in Port after creation",
              "trigger": {
                "type": "automation",
                "event": {
                  "type": "RUN_UPDATED",
                  "actionIdentifier": "create_incident_webhook"
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
                "type": "UPSERT_ENTITY",
                "blueprintIdentifier": "pagerdutyIncident",
                "mapping": {
                  "identifier": "{{.event.diff.after.response.incident.id}}",
                  "title": "{{.event.diff.after.response.incident.title}}",
                  "properties": {
                    "status": "{{.event.diff.after.response.incident.status}}",
                    "url": "{{.event.diff.after.response.incident.self}}",
                    "urgency": "{{.event.diff.after.response.incident.urgency}}",
                    "responder": "{{.event.diff.after.response.incident.assignments.0.assignee.summary}}",
                    "escalation_policy": "{{.event.diff.after.response.incident.escalation_policy.summary}}",
                    "created_at": "{{.event.diff.after.response.incident.created_at}}",
                    "updated_at": "{{.event.diff.after.response.incident.updated_at}}"
                  },
                  "relations": {
                    "pagerdutyService": ["{{.event.diff.after.response.incident.service.id}}"]
                  }
                }
              },
              "publish": true
          }
        ```
        </details>

    4. Click `Save`.

    Now when you execute the webhook action, the incident data in Port will be automatically updated with the latest information from PagerDuty.

  </TabItem>
  <TabItem value="github" label="GitHub workflow">
    
    To implement this use-case using a GitHub workflow, follow these steps:

    <h3> Add GitHub secrets </h3>

    In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
    - `PAGERDUTY_API_KEY` - [PagerDuty API token](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account) generated by the user.
    - `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
    - `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).

    <h3> Add GitHub workflow </h3>

    Create the file `.github/workflows/create-pagerduty-incident.yaml` in the `.github/workflows` folder of your repository.

    <GithubDedicatedRepoHint/>

    <details>
    <summary><b>GitHub Workflow (Click to expand)</b></summary>

    ```yaml showLineNumbers
    name: Create PagerDuty Incident

    on:
      workflow_dispatch:
        inputs:
          title:
            description: The title of the incident to create
            required: true
            type: string
          extra_details:
            description: Extra details about the incident to create
            required: false
          urgency:
            description: The urgency of the incident
            required: false
          from:
            description: The email address of a valid user associated with the account making the request.
            required: true
          port_context:
            required: true
            description: includes blueprint, run ID, and entity identifier from Port.
    jobs: 
      trigger:
        runs-on: ubuntu-latest
        steps:
          - uses: port-labs/pagerduty-incident-gha@v1
            with:
              portClientId: ${{ secrets.PORT_CLIENT_ID }}
              portClientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
              token: ${{ secrets.PAGERDUTY_API_KEY }}
              portRunId: ${{fromJson(inputs.port_context).run_id}}
              incidentTitle: "${{ inputs.title }}"
              extraDetails: "${{ inputs.extra_details }}"
              urgency: "${{ inputs.urgency }}"
              actorEmail: "${{ inputs.from }}"
              service: "${{fromJson(inputs.port_context).entity}}"
              blueprintIdentifier: 'pagerdutyIncident'
    ```
    </details>

    <h3> Set up self-service action </h3>

    We will create a self-service action to handle creating PagerDuty incidents.
    To create a self-service action follow these steps:

    1. Head to the [self-service](https://app.getport.io/self-serve) page.
    2. Click on the `+ New Action` button.
    3. Click on the `{...} Edit JSON` button.
    4. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Create PagerDuty Incident (Click to expand)</b></summary>

        <GithubActionModificationHint/>

        ```json showLineNumbers
        {
          "identifier": "pagerdutyService_create_incident",
          "title": "Create Incident",
          "icon": "pagerduty",
          "description": "Create a new PagerDuty incident",
          "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
              "properties": {
                "title": {
                  "icon": "DefaultProperty",
                  "title": "Title",
                  "type": "string"
                },
                "extra_details": {
                  "title": "Extra Details",
                  "type": "string"
                },
                "urgency": {
                  "icon": "DefaultProperty",
                  "title": "Urgency",
                  "type": "string",
                  "default": "high",
                  "enum": [
                    "high",
                    "low"
                  ],
                  "enumColors": {
                    "high": "yellow",
                    "low": "green"
                  }
                },
                "from": {
                  "title": "From",
                  "icon": "User",
                  "type": "string",
                  "format": "user",
                  "default": {
                    "jqQuery": ".user.email"
                  }
                }
              },
              "required": [
                "title",
                "urgency",
                "from"
              ],
              "order": [
                "title",
                "urgency",
                "from",
                "extra_details"
              ]
            },
            "blueprintIdentifier": "pagerdutyService"
          },
          "invocationMethod": {
            "type": "GITHUB",
            "org": "<GITHUB_ORG>",
            "repo": "<GITHUB_REPO>",
            "workflow": "create-pagerduty-incident.yaml",
            "workflowInputs": {
              "title": "{{.inputs.\"title\"}}",
              "extra_details": "{{.inputs.\"extra_details\"}}",
              "urgency": "{{.inputs.\"urgency\"}}",
              "from": "{{.inputs.\"from\"}}",
              "port_context": {
                "blueprint": "{{.action.blueprint}}",
                "entity": "{{.entity.identifier}}",
                "run_id": "{{.run.id}}",
                "relations": "{{.entity.relations}}"
              }
            },
            "reportWorkflowStatus": true
          },
          "requiredApproval": false
        }
        ```
        </details>

    5. Click `Save`.

    Now you should see the `Create Incident` action in the self-service page. 🎉

  </TabItem>
</Tabs>

## Let's test it! 

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. Choose either the GitHub workflow or webhook implementation:
   - For GitHub workflow: Click on `Create Incident`
   - For webhook: Click on `Create Incident (Webhook)`

3. Select the PagerDuty service where you want to create the incident

4. Enter the required information:
   - For GitHub workflow: Enter the incident title, service, and optionally include extra details and urgency
   - For webhook: Enter the incident title and urgency, optionally include extra details

5. Click on `Execute`

6. Done! Wait for the incident to be created in PagerDuty

## More Self Service PagerDuty Actions Examples
- [Acknowledge Incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/acknowledge-incident)
- [Change On-Call User](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/change-on-call-user)
- [Change PagerDuty incident owner](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/change-pagerduty-incident-owner)
- [Create PagerDuty service](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/create-pagerduty-service)
- [Escalate an incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/escalate-an-incident)
- [Resolve an incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/resolve-incident)
- [Trigger PagerDuty incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/trigger-pagerduty-incident)
