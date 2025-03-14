---
displayed_sidebar: null
description: Learn how to resolve incidents in Port, ensuring quick and effective issue management for seamless operations.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'
import PagerDutyIncidentBlueprint from '/docs/guides/templates/pagerduty/_pagerduty_incident_blueprint.mdx'
import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Resolve an Incident in PagerDuty

## Overview
This guide will help you implement a self-service action in Port that allows you to resolve PagerDuty incidents directly from Port.
This functionality streamlines incident management by enabling users to resolve incidents without leaving Port.

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
  <TabItem value="webhook" label="Synced webhooks" default>

    You can resolve PagerDuty incidents by leveraging Port's **synced webhooks** and **secrets** to directly interact with the PagerDuty's API. This method simplifies the setup by handling everything within Port.

    <h3>Add Port secrets</h3>

    <ExistingSecretsCallout integration="PagerDuty" />


    To add these secrets to your portal:

    1. Click on the `...` button in the top right corner of your Port application.

    2. Click on **Credentials**.

    3. Click on the `Secrets` tab.

    4. Click on `+ Secret` and add the following secrets:
       - `PAGERDUTY_API_TOKEN`: Your PagerDuty API token
       - `PAGERDUTY_USER_EMAIL`: The email of the PagerDuty user that owns the API token


    <h3>Set up self-service action</h3>

    Follow these steps to create the self-service action:

    1. Head to the [self-service](https://app.getport.io/self-serve) page.
    2. Click on the `+ New Action` button.
    3. Click on the `{...} Edit JSON` button.
    4. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Resolve PagerDuty Incident (Webhook) (Click to expand)</b></summary>

        ```json showLineNumbers
        {
          "identifier": "resolve_incident_webhook",
          "title": "Resolve Incident (Webhook)",
          "icon": "pagerduty",
          "description": "Resolve a PagerDuty incident",
          "trigger": {
            "type": "self-service",
            "operation": "DAY-2",
            "userInputs": {
              "properties": {
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
                "from"
              ],
              "order": [
                "from"
              ]
            },
            "blueprintIdentifier": "pagerdutyIncident"
          },
          "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://api.pagerduty.com/incidents",
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
              "incidents": [
                {
                  "id": "{{.entity.identifier}}",
                  "type": "incident_reference",
                  "status": "resolved"
                }
              ]
            }
          },
          "requiredApproval": false
        }
        ```
        </details>

    5. Click `Save`.

    Now you should see the `Resolve Incident (Webhook)` action in the self-service page. 🎉

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
              "identifier": "pagerdutyIncident_sync_status",
              "title": "Sync PagerDuty Incident Status",
              "description": "Update PagerDuty incident data in Port after resolution",
              "trigger": {
                "type": "automation",
                "event": {
                  "type": "RUN_UPDATED",
                  "actionIdentifier": "resolve_incident_webhook"
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
                  "identifier": "{{.event.diff.after.entity.identifier}}",
                  "title": "{{.event.diff.after.entity.title}}",
                  "properties": {
                    "status": "resolved",
                    "updated_at": "{{.event.diff.after.endedAt}}"
                  }
                }
              },
              "publish": true
           }
        ```
        </details>

    4. Click `Save`.

    Now when you execute the webhook action, the incident data in Port will be automatically updated to show it as resolved.

  </TabItem>

  <TabItem value="github" label="GitHub workflow">

      To implement this use-case using a GitHub workflow, follow these steps:

      <h3>Add GitHub secrets</h3>

      In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
      - `PAGERDUTY_API_KEY` - [PagerDuty API token](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account) generated by the user.
      - `PORT_CLIENT_ID` - Your port `client id` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).
      - `PORT_CLIENT_SECRET` - Your port `client secret` [How to get the credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials).

      <h3>Add GitHub workflow</h3>

      Create the file `.github/workflows/resolve-incident.yaml` in the `.github/workflows` folder of your repository.

      <GithubDedicatedRepoHint/>

      <details>
      <summary><b>GitHub Workflow (Click to expand)</b></summary>

      ```yaml showLineNumbers 
      name: Resolve Incident In PagerDuty
      on:
        workflow_dispatch:
          inputs:
            from:
              description: The email address of a valid user associated with the account making the request.
              required: true
              type: string
            port_context:
              required: true
              description: includes blueprint, run ID, and entity identifier from Port.

      jobs:
        resolve_incident:
          runs-on: ubuntu-latest
          steps:
            
            - name: Log Executing Request to Resolve Incident
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_context).run_id}}
                logMessage: "About to make a request to pagerduty..."

            - name: Request to Resolve Incident
              id: resolve_incident
              uses: fjogeleit/http-request-action@v1
              with:
                url: 'https://api.pagerduty.com/incidents'
                method: 'PUT'
                customHeaders: '{"Content-Type": "application/json", "Accept": "application/vnd.pagerduty+json;version=2", "Authorization": "Token token=${{ secrets.PAGERDUTY_API_KEY }}", "From": "${{ github.event.inputs.from }}"}'
                data: >-
                    {
                      "incidents": [
                        {
                          "id": "${{fromJson(inputs.port_context).entity}}",
                          "type": "incident_reference",
                          "status": "resolved"
                        }
                      ]
                    }

            - name: Log Before Processing Incident Response
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_context).run_id}}
                logMessage: "Getting incident object from response received ..."

            - name: Log Before Upserting Entity
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_context).run_id}}
                logMessage: "Reporting the updated incident back to port ..."

            - name: UPSERT Entity
              uses: port-labs/port-github-action@v1
              with:
                identifier: "${{ fromJson(steps.resolve_incident.outputs.response).incidents[0].id }}"
                title: "${{ fromJson(steps.resolve_incident.outputs.response).incidents[0].title }}"
                blueprint: ${{fromJson(inputs.port_context).blueprint}}
                properties: |-
                  {
                    "status": "${{ fromJson(steps.resolve_incident.outputs.response).incidents[0].status }}",
                    "url": "${{ fromJson(steps.resolve_incident.outputs.response).incidents[0].self }}",
                    "urgency": "${{ fromJson(steps.resolve_incident.outputs.response).incidents[0].urgency }}",
                    "responder": "${{ fromJson(steps.resolve_incident.outputs.response).incidents[0].assignments[0].assignee.summary}}",
                    "escalation_policy": "${{ fromJson(steps.resolve_incident.outputs.response).incidents[0].escalation_policy.summary }}",
                    "created_at": "${{ fromJson(steps.resolve_incident.outputs.response).incidents[0].created_at }}",
                    "updated_at": "${{ fromJson(steps.resolve_incident.outputs.response).incidents[0].updated_at }}"
                  }
                relations: "${{ toJson(fromJson(inputs.port_context).relations) }}"
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: UPSERT
                runId: ${{fromJson(inputs.port_context).run_id}}

            - name: Log After Upserting Entity
              uses: port-labs/port-github-action@v1
              with:
                clientId: ${{ secrets.PORT_CLIENT_ID }}
                clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
                baseUrl: https://api.getport.io
                operation: PATCH_RUN
                runId: ${{fromJson(inputs.port_context).run_id}}
                logMessage: "Entity upserting was successful ✅"
      ```
      </details>

      <h3>Set up self-service action</h3>

      We will create a self-service action to handle resolving PagerDuty incidents.
      To create a self-service action follow these steps:

      1. Head to the [self-service](https://app.getport.io/self-serve) page.
      2. Click on the `+ New Action` button.
      3. Click on the `{...} Edit JSON` button.
      4. Copy and paste the following JSON configuration into the editor.

          <details>
          <summary><b>Resolve PagerDuty Incident (Click to expand)</b></summary>

          <GithubActionModificationHint/>

          ```json showLineNumbers
          {
            "identifier": "pagerdutyIncident_resolve_incident",
            "title": "Resolve Incident",
            "icon": "pagerduty",
            "description": "Resolve incident in pagerduty",
            "trigger": {
              "type": "self-service",
              "operation": "DAY-2",
              "userInputs": {
                "properties": {
                  "from": {
                    "icon": "User",
                    "title": "From",
                    "description": "User Email",
                    "type": "string",
                    "format": "user"
                  }
                },
                "required": [
                  "from"
                ],
                "order": [
                  "from"
                ]
              },
              "blueprintIdentifier": "pagerdutyIncident"
            },
            "invocationMethod": {
              "type": "GITHUB",
              "org": "<GITHUB_ORG>",
              "repo": "<GITHUB_REPO>",
              "workflow": "resolve-incident.yaml",
              "workflowInputs": {
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

      Now you should see the `Resolve Incident` action in the self-service page. 🎉

  </TabItem>
</Tabs>

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. Choose either the GitHub workflow or webhook implementation:
   - For GitHub workflow: Click on `Resolve Incident`
   - For webhook: Click on `Resolve Incident (Webhook)`

3. Select the PagerDuty incident you want to resolve

4. Enter the required information:
   - From (email address of a valid PagerDuty user)

5. Click on `Execute`

6. Done! Wait for the incident to be resolved in PagerDuty

## More Self Service PagerDuty Actions Examples
- [Acknowledge Incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/acknowledge-incident)
- [Change On-Call User](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/change-on-call-user)
- [Change PagerDuty incident owner](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/change-pagerduty-incident-owner)
- [Create PagerDuty incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/create-pagerduty-incident)
- [Create PagerDuty service](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/create-pagerduty-service)
- [Escalate an incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/escalate-an-incident)
- [Trigger PagerDuty incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/trigger-pagerduty-incident)
