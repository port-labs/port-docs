---
displayed_sidebar: null
description: Learn how to trigger a PagerDuty incident in Port with this guide, ensuring prompt and effective incident management.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'
import PagerDutyIncidentBlueprint from '/docs/guides/templates/pagerduty/_pagerduty_incident_blueprint.mdx'
import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Trigger a PagerDuty Incident

## Overview
This guide will help you implement a self-service action in Port that allows you to trigger PagerDuty incidents directly from Port.
This functionality streamlines incident management by enabling users to trigger incidents without leaving Port.

You can implement this action in two ways:
1. **GitHub workflow**: A more flexible approach that allows for complex workflows and custom logic, suitable for teams that want to maintain their automation in Git.
2. **Synced webhooks**: A simpler approach that directly interacts with PagerDuty's API through Port, ideal for quick implementation and minimal setup.

## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to your PagerDuty organization with permissions to manage incidents.
- A [PagerDuty routing key](https://support.pagerduty.com/docs/services-and-integrations#events-api-v2-integration-key) for the service you want to trigger incidents for.

  :::info Finding your PagerDuty routing key
  To find your PagerDuty routing key (also called integration key):
  - Log in to your PagerDuty account
  -  Navigate to **Services** in the main menu
  -  Select the service you want to trigger incidents for
  - Click on the **Integrations** tab
  - Look for an existing "Events API V2" integration, or click **Add integration** and select "Events API V2"
  - The **Integration Key** displayed is your routing key
  
  :::

- Optional - Install Port's PagerDuty integration [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty)

	:::tip PagerDuty Integration
	This step is not required for this example, but it will create all the blueprint boilerplate for you, and also ingest and update the catalog in real time with your PagerDuty Incidents.
	:::

## Set up data model

If you haven't installed the PagerDuty integration, you'll need to create blueprints for PagerDuty incidents.
However, we highly recommend you install the PagerDuty integration to have these automatically set up for you.

<h3>Create the PagerDuty incident blueprint</h3>

<PagerDutyIncidentBlueprint />

## Implementation

<Tabs>
  <TabItem value="webhook" label="Synced webhook" default>

    You can trigger PagerDuty incidents by leveraging Port's **synced webhooks** and **secrets** to directly interact with the PagerDuty's API. This method simplifies the setup by handling everything within Port.

    <h3>Add Port secrets</h3>

    <ExistingSecretsCallout integration="PagerDuty" />


    To add these secrets to your portal:

    1. Click on the `...` button in the top right corner of your Port application.

    2. Click on **Credentials**.

    3. Click on the `Secrets` tab.

    4. Click on `+ Secret` and add the following secrets:
       - `PAGERDUTY_ROUTING_KEY`: Your PagerDuty routing key for the service.
       

    <h3>Set up self-service action</h3>

    We will create a self-service action to handle triggering PagerDuty incidents using webhooks.
    To create a self-service action follow these steps:

    1. Head to the [self-service](https://app.getport.io/self-serve) page.
    2. Click on the `+ New Action` button.
    3. Click on the `{...} Edit JSON` button.
    4. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Trigger PagerDuty Incident (Webhook) (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "trigger_incident_webhook",
          "title": "Trigger Incident (Webhook)",
          "icon": "pagerduty",
          "description": "Trigger a new PagerDuty incident",
          "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
              "properties": {
                "summary": {
                  "icon": "DefaultProperty",
                  "title": "Summary",
                  "type": "string"
                },
                "source": {
                  "icon": "DefaultProperty",
                  "title": "Source",
                  "type": "string",
                  "default": "Port"
                },
                "severity": {
                  "icon": "DefaultProperty",
                  "title": "Severity",
                  "type": "string",
                  "default": "critical",
                  "enum": [
                    "critical",
                    "error",
                    "warning",
                    "info"
                  ],
                  "enumColors": {
                    "critical": "red",
                    "error": "red",
                    "warning": "yellow",
                    "info": "blue"
                  }
                },
                "event_action": {
                  "icon": "DefaultProperty",
                  "title": "Event Action",
                  "type": "string",
                  "default": "trigger",
                  "enum": [
                    "trigger",
                    "acknowledge",
                    "resolve"
                  ]
                }
              },
              "required": [
                "summary",
                "source",
                "severity",
                "event_action"
              ],
              "order": [
                "summary",
                "source",
                "severity",
                "event_action"
              ]
            },
            "blueprintIdentifier": "pagerdutyIncident"
          },
          "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://events.pagerduty.com/v2/enqueue",
            "agent": false,
            "synchronized": true,
            "method": "POST",
            "headers": {
              "Content-Type": "application/json"
            },
            "body": {
              "payload": {
                "summary": "{{.inputs.summary}}",
                "source": "{{.inputs.source}}",
                "severity": "{{.inputs.severity}}"
              },
              "routing_key": "{{.secrets.PAGERDUTY_ROUTING_KEY}}",
              "event_action": "{{.inputs.event_action}}"
            }
          },
          "requiredApproval": false
        }
        ```
        </details>

    5. Click `Save`.

    Now you should see the `Trigger Incident (Webhook)` action in the self-service page. 🎉

    <h3>Create an automation to upsert entity in port</h3>

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
          "identifier": "pagerdutyIncident_sync_after_trigger",
          "title": "Sync PagerDuty Incident After Trigger",
          "description": "Update PagerDuty incident data in Port after triggering",
          "trigger": {
            "type": "automation",
            "event": {
              "type": "RUN_UPDATED",
              "actionIdentifier": "trigger_incident_webhook"
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
              "identifier": "{{.event.diff.after.response.dedup_key}}",
              "title": "{{.event.diff.after.properties.summary}}",
              "properties": {
                "status": "triggered",
                "urgency": "high",
                "created_at": "{{.event.diff.after.createdAt}}"
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

      <h3>Add GitHub secrets</h3>

      In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
      - `PAGERDUTY_ROUTING_KEY` - Your PagerDuty routing key for the service.
      - `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
      - `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).

      <h3>Add GitHub workflow</h3>

      Create the file `.github/workflows/trigger-pagerduty-incident.yaml` in the `.github/workflows` folder of your repository.

      <GithubDedicatedRepoHint/>

      <details>
      <summary><b>GitHub Workflow (Click to expand)</b></summary>

      ```yaml showLineNumbers
      name: Trigger PagerDuty Incident

      on:
        workflow_dispatch:
          inputs:
            summary:
              description: The summary of the incident to trigger
              required: true
              type: string
            source:
              description: The source of the incident
              required: true
              type: string
            severity:
              description: The severity of the incident
              required: true
              type: string
              default: "critical"
            event_action:
              description: The event action
              required: true
              type: string
              default: "trigger"
            routing_key:
              description: The routing key of the service
              required: true
              type: string
            port_context:
              required: true
              description: includes blueprint, run ID, and entity identifier from Port.
      jobs: 
        trigger:
          runs-on: ubuntu-latest
          steps:
            - name: Trigger PagerDuty Incident
              id: trigger
              uses: fjogeleit/http-request-action@v1
              with:
                url: 'https://events.pagerduty.com/v2/enqueue'
                method: 'POST'
                customHeaders: '{"Content-Type": "application/json"}'
                data: >-
                  {
                    "payload": {
                      "summary": "${{ inputs.summary }}",
                      "source": "${{ inputs.source }}",
                      "severity": "${{ inputs.severity }}"
                    },
                    "routing_key": "${{ inputs.routing_key }}",
                    "event_action": "${{ inputs.event_action }}"
                  }
            
            - name: Log Response
              run: |
                echo "Response status: ${{ steps.trigger.outputs.status }}"
                echo "Response data: ${{ steps.trigger.outputs.response }}"
      ```
      </details>

      <h3>Set up self-service action</h3>

      We will create a self-service action to handle triggering PagerDuty incidents.
      To create a self-service action follow these steps:

      1. Head to the [self-service](https://app.getport.io/self-serve) page.
      2. Click on the `+ New Action` button.
      3. Click on the `{...} Edit JSON` button.
      4. Copy and paste the following JSON configuration into the editor.

          <details>
          <summary><b>Trigger PagerDuty Incident (Click to expand)</b></summary>

          <GithubActionModificationHint/>

          ```json showLineNumbers
          {
            "identifier": "trigger_pagerduty_incident",
            "title": "Trigger Incident",
            "icon": "pagerduty",
            "description": "Trigger a new PagerDuty incident",
            "trigger": {
              "type": "self-service",
              "operation": "DAY-2",
              "userInputs": {
                "properties": {
                  "summary": {
                    "icon": "DefaultProperty",
                    "title": "Summary",
                    "type": "string"
                  },
                  "source": {
                    "icon": "DefaultProperty",
                    "title": "Source",
                    "type": "string",
                    "default": "Port"
                  },
                  "severity": {
                    "icon": "DefaultProperty",
                    "title": "Severity",
                    "type": "string",
                    "default": "critical",
                    "enum": [
                      "critical",
                      "error",
                      "warning",
                      "info"
                    ],
                    "enumColors": {
                      "critical": "red",
                      "error": "red",
                      "warning": "yellow",
                      "info": "blue"
                    }
                  },
                  "event_action": {
                    "icon": "DefaultProperty",
                    "title": "Event Action",
                    "type": "string",
                    "default": "trigger",
                    "enum": [
                      "trigger",
                      "acknowledge",
                      "resolve"
                    ]
                  },
                  "routing_key": {
                    "icon": "DefaultProperty",
                    "title": "Routing Key",
                    "type": "string",
                    "description": "The routing key of the service"
                  }
                },
                "required": [
                  "summary",
                  "source",
                  "severity",
                  "event_action",
                  "routing_key"
                ],
                "order": [
                  "summary",
                  "source",
                  "severity",
                  "event_action",
                  "routing_key"
                ]
              },
              "blueprintIdentifier": "pagerdutyIncident"
            },
            "invocationMethod": {
              "type": "GITHUB",
              "org": "<GITHUB_ORG>",
              "repo": "<GITHUB_REPO>",
              "workflow": "trigger-pagerduty-incident.yaml",
              "workflowInputs": {
                "summary": "{{.inputs.\"summary\"}}",
                "source": "{{.inputs.\"source\"}}",
                "severity": "{{.inputs.\"severity\"}}",
                "event_action": "{{.inputs.\"event_action\"}}",
                "routing_key": "{{.inputs.\"routing_key\"}}",
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

      Now you should see the `Trigger Incidents` action in the self-service page. 🎉

  </TabItem>
</Tabs>

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. Choose either the GitHub workflow or webhook implementation:
   - For GitHub workflow: Click on `Trigger Incident`
   - For webhook: Click on `Trigger Incident (Webhook)`

3. Choose the pagerduty incident you want to trigger (In case you didn't install the [PagerDuty integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty), it means you don't have any PagerDuty incidents in Port yet, so you will need to create one manually in Port to test this action)

4. Enter the required information:
   - For GitHub workflow: Enter the summary, source, severity, event action, and routing key
   - For webhook: Enter the summary, source, severity, and event action

5. Click on `Execute`

6. Done! wait for the incident's status to be changed in PagerDuty

## More Self Service PagerDuty Actions Examples
- [Acknowledge Incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/acknowledge-incident)
- [Change On-Call User](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/change-on-call-user)
- [Change PagerDuty incident owner](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/change-pagerduty-incident-owner)
- [Create PagerDuty incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/create-pagerduty-incident)
- [Create PagerDuty service](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/create-pagerduty-service)
- [Escalate an incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/escalate-an-incident)
- [Resolve an incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/resolve-incident)
