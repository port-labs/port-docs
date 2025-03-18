---
displayed_sidebar: null
description: Learn how to escalate an incident in Port, ensuring timely resolution and effective incident management.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'
import PagerDutyIncidentBlueprint from '/docs/guides/templates/pagerduty/_pagerduty_incident_blueprint.mdx'
import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Escalate an Incident in PagerDuty

## Overview
This guide will help you implement a self-service action in Port that allows you to escalate PagerDuty incidents directly from Port.
This functionality streamlines incident management by enabling users to escalate incidents without leaving Port.

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

<h3>Create the PagerDuty incident blueprint</h3>

<PagerDutyIncidentBlueprint/>

## Implementation

<Tabs>
  <TabItem value="webhook" label="Synced webhook" default>
   
    You can escalate PagerDuty incidents by leveraging Port's **synced webhooks** and **secrets** to directly interact with the PagerDuty's API. This method simplifies the setup by handling everything within Port.

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

    We will create a self-service action to handle escalating PagerDuty incidents using webhooks.
    To create a self-service action follow these steps:

    1. Head to the [self-service](https://app.getport.io/self-serve) page.
    2. Click on the `+ New Action` button.
    3. Click on the `{...} Edit JSON` button.
    4. Copy and paste the following JSON configuration into the editor.

        :::info Escalation Policy ID
        The escalation policy ID is a unique identifier (e.g., P7LVMYP) that you can find in your PagerDuty dashboard:
        - Go to Configuration → Escalation Policies
        - Click on the policy you want to use
        - The ID is the last part of the URL (e.g., in https://example-subdomain.pagerduty.com/escalation_policies/P7LVMYP, the ID is P7LVMYP)
        :::

        <details>
        <summary><b>Escalate PagerDuty Incident (Webhook) (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "escalate_incident_webhook",
          "title": "Escalate Incident (Webhook)",
          "icon": "pagerduty",
          "description": "Escalate a PagerDuty incident",
          "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
              "properties": {
                "escalation_policy_id": {
                  "title": "Escalation Policy ID",
                  "description": "PagerDuty Escalation Policy ID (e.g., P7LVMYP)",
                  "icon": "pagerduty",
                  "type": "string"
                },
                "urgency": {
                  "icon": "pagerduty",
                  "title": "Urgency",
                  "description": "New urgency level for the incident",
                  "type": "string",
                  "default": "low",
                  "enum": [
                    "high",
                    "low"
                  ],
                  "enumColors": {
                    "high": "orange",
                    "low": "lightGray"
                  }
                },
                "from": {
                  "icon": "User",
                  "title": "From",
                  "description": "The email address of a valid PagerDuty user associated with the account making the request.",
                  "type": "string",
                  "format": "user",
                  "default": {
                    "jqQuery": ".user.email"
                  }
                }
              },
              "required": [
                "escalation_policy_id",
                "urgency",
                "from"
              ],
              "order": [
                "escalation_policy_id",
                "urgency",
                "from"
              ]
            },
            "blueprintIdentifier": "pagerdutyIncident"
          },
          "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://api.pagerduty.com/incidents/{{.entity.identifier}}",
            "agent": false,
            "synchronized": true,
            "method": "PUT",
            "headers": {
              "Authorization": "Token token={{.secrets.PAGERDUTY_API_TOKEN}}",
              "Accept": "application/vnd.pagerduty+json;version=2",
              "From": "{{.inputs.from}}",
              "Content-Type": "application/json"
            },
            "body": {
              "incident": {
                "type": "incident_reference",
                "escalation_policy": {
                  "id": "{{.inputs.escalation_policy_id}}",
                  "type": "escalation_policy_reference"
                },
                "urgency": "{{.inputs.urgency}}"
              }
            }
          },
          "requiredApproval": false
        }
        ```
        </details>

    5. Click `Save`.

    Now you should see the `Escalate Incident (Webhook)` action in the self-service page. 🎉

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
              "description": "Update PagerDuty incident data in Port after escalation",
              "trigger": {
                "type": "automation",
                "event": {
                  "type": "RUN_UPDATED",
                  "actionIdentifier": "escalate_incident_webhook"
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

      Create the file `.github/workflows/escalate-incident.yaml` in the `.github/workflows` folder of your repository.

      <GithubDedicatedRepoHint/>

      <details>
      <summary><b>GitHub Workflow (Click to expand)</b></summary>

      ```yaml showLineNumbers
      name: Escalate PagerDuty Incident

      on:
        workflow_dispatch:
          inputs:
            escalation_policy_id:
              description: PagerDuty Escalation Policy ID to apply
              required: true
              type: string
            urgency:
              description: New urgency level for the incident (e.g., "high")
              required: false
              type: string
            from:
              description: The email address of a valid user associated with the account making the request.
              required: true
              type: string
            port_context:
              required: true
              description: includes blueprint, run ID, and entity identifier from Port.

      jobs:
        escalate-incident:
          runs-on: ubuntu-latest
          steps:
            - name: Inform execution of request to escalate incident
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_context).run_id}}
                logMessage: "About to escalate incident in PagerDuty..."

            - name: Escalate Incident in PagerDuty
              id: escalate_incident
              uses: fjogeleit/http-request-action@v1
              with:
                url: 'https://api.pagerduty.com/incidents/${{fromJson(inputs.port_context).entity}}'
                method: 'PUT'
                customHeaders: '{"Content-Type": "application/json", "Accept": "application/vnd.pagerduty+json;version=2", "Authorization": "Token token=${{ secrets.PAGERDUTY_API_KEY }}", "From": "${{ github.event.inputs.from }}"}'
                data: >-
                  {
                    "incident": {
                      "type": "incident_reference",
                      "escalation_policy": {
                        "id": "${{ github.event.inputs.escalation_policy_id }}",
                        "type": "escalation_policy_reference"
                      },
                      "urgency": "${{ github.event.inputs.urgency }}"
                    }
                  }

            - name: Inform PagerDuty request failure
              if: failure()
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_context).run_id}}
                logMessage: "Request to escalate incident failed ..."

            - name: Inform ingestion of PagerDuty escalation to Port
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_context).run_id}}
                logMessage: "Reporting the escalated incident back to Port ..."

            - name: Upsert pagerduty entity to Port 
              id: upsert_entity
              uses: port-labs/port-github-action@v1
              with:
                identifier: ${{inputs.entity_identifier}}
                title: "${{ fromJson(steps.escalate_incident.outputs.response).incident.title }}"
                blueprint: "pagerdutyIncident"
                properties: |-
                  {
                    "status": "${{ fromJson(steps.escalate_incident.outputs.response).incident.status }}",
                    "url": "${{ fromJson(steps.escalate_incident.outputs.response).incident.self }}",
                    "urgency": "${{ fromJson(steps.escalate_incident.outputs.response).incident.urgency }}",
                    "responder": "${{ fromJson(steps.escalate_incident.outputs.response).incident.assignments[0].assignee.summary}}",
                    "escalation_policy": "${{ fromJson(steps.escalate_incident.outputs.response).incident.escalation_policy.summary }}",
                    "created_at": "${{ fromJson(steps.escalate_incident.outputs.response).incident.created_at }}",
                    "updated_at": "${{ fromJson(steps.escalate_incident.outputs.response).incident.updated_at }}"
                  }
                relations: "${{ toJson(fromJson(inputs.port_context).relations) }}"
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: UPSERT
                runId: ${{fromJson(inputs.port_context).run_id}}

            - name: Inform Entity upsert failure
              if: steps.upsert_entity.outcome == 'failure'
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_context).run_id}}
                logMessage: "Failed to report the escalated incident back to Port ..."

            - name: Inform completion of PagerDuty incident escalation
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_context).run_id}}
                logMessage: "Incident escalation process was successful ✅"
      ```
      </details>

      <h3> Set up self-service action </h3>

      We will create a self-service action to handle escalating PagerDuty incidents.
      To create a self-service action follow these steps:

      1. Head to the [self-service](https://app.getport.io/self-serve) page.
      2. Click on the `+ New Action` button.
      3. Click on the `{...} Edit JSON` button.
      4. Copy and paste the following JSON configuration into the editor.

          <details>
          <summary><b>Escalate PagerDuty Incident (Click to expand)</b></summary>

          <GithubActionModificationHint/>

          ```json showLineNumbers
          {
            "identifier": "pagerdutyIncident_escalate_incident",
            "title": "Escalate Incident",
            "icon": "pagerduty",
            "description": "Escalate a pagerduty incident",
            "trigger": {
              "type": "self-service",
              "operation": "DAY-2",
              "userInputs": {
                "properties": {
                  "escalation_policy_id": {
                    "title": "Escalation Policy ID",
                    "description": "PagerDuty Escalation Policy ID to apply",
                    "icon": "pagerduty",
                    "type": "string"
                  },
                  "urgency": {
                    "icon": "pagerduty",
                    "title": "Urgency",
                    "description": "New urgency level for the incident (e.g., \"high\")",
                    "type": "string",
                    "default": "low",
                    "enum": [
                      "high",
                      "low"
                    ],
                    "enumColors": {
                      "high": "orange",
                      "low": "lightGray"
                    }
                  },
                  "from": {
                    "icon": "User",
                    "title": "From",
                    "description": "The email address of a valid pagerduty user associated with the account making the request.",
                    "type": "string",
                    "format": "user"
                  }
                },
                "required": [
                  "escalation_policy_id",
                  "urgency",
                  "from"
                ],
                "order": [
                  "escalation_policy_id",
                  "urgency",
                  "from"
                ]
              },
              "blueprintIdentifier": "pagerdutyIncident"
            },
            "invocationMethod": {
              "type": "GITHUB",
              "org": "<GITHUB_ORG>",
              "repo": "<GITHUB_REPO>",
              "workflow": "escalate-incident.yaml",
              "workflowInputs": {
                "escalation_policy_id": "{{.inputs.\"escalation_policy_id\"}}",
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

      Now you should see the `Escalate Incident` action in the self-service page. 🎉

  </TabItem>
</Tabs>

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. Choose either the GitHub workflow or webhook implementation:
   - For GitHub workflow: Click on `Escalate Incident`
   - For webhook: Click on `Escalate Incident (Webhook)`

3. Select the PagerDuty incident you want to escalate

4. Enter the required information:
   - Escalation Policy ID
   - Urgency level (high/low)
   - From (email address of a valid PagerDuty user)

5. Click on `Execute`

6. Done! Wait for the incident to be escalated in PagerDuty

## More Self Service PagerDuty Actions Examples
- [Acknowledge Incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/acknowledge-incident)
- [Change On-Call User](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/change-on-call-user)
- [Change PagerDuty incident owner](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/change-pagerduty-incident-owner)
- [Create PagerDuty incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/create-pagerduty-incident)
- [Create PagerDuty service](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/create-pagerduty-service)
- [Resolve an incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/resolve-incident)
- [Trigger PagerDuty incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/trigger-pagerduty-incident)
