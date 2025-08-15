---
displayed_sidebar: null
description: Learn how to create or trigger PagerDuty incidents from Port using synced webhooks or GitHub workflows, and keep your catalog in sync.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'
import PagerDutyIncidentBlueprint from '/docs/guides/templates/pagerduty/_pagerduty_incident_blueprint.mdx'
import ExistingSecretsCallout from '/docs/guides/templates/secrets/_existing_secrets_callout.mdx'
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Interact with PagerDuty incidents

This guide demonstrates how to implement self-service actions that create new PagerDuty incidents or trigger incidents on services directly from Port using synced webhooks or GitHub workflows.

## Use cases
- Create PagerDuty incidents from Port with title, urgency, and description.
- Trigger incidents against PagerDuty services with a chosen severity and event action.
- Keep your Port catalog in sync by automatically upserting the created incident or updating related service data after execution.

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

If you haven't installed the PagerDuty integration, you'll need to create blueprints for PagerDuty incidents and PagerDuty services.
However, we highly recommend you install the PagerDuty integration to have these automatically set up for you.

<h3>Create the PagerDuty service blueprint</h3>

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

<h3>Create the PagerDuty incident blueprint</h3>

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.

2. Click on `+ Blueprint`.

3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".

4. Copy and paste the following JSON configuration into the editor.

    <PagerDutyIncidentBlueprint />

5. Click "Save" to create the blueprint.

## Implementation

<Tabs>
  <TabItem value="webhook" label="Synced webhook" default>

    Configure two self-service actions using Port's synced webhooks and secrets to interact directly with PagerDuty's API.   
    The self-service actions will be used to create and trigger incidents.

    <h3>Add Port secrets</h3>

    <ExistingSecretsCallout integration="PagerDuty" />

    To add these secrets to your portal:

    1. Click on the `...` button in the top right corner of your Port application.

    2. Click on **Credentials**.

    3. Click on the `Secrets` tab.

    4. Click on `+ Secret` and add the following secrets:

       - `PAGERDUTY_API_TOKEN`: Your PagerDuty API token
       - `PAGERDUTY_USER_EMAIL`: The email of the PagerDuty user that owns the API token
       - `PAGERDUTY_ROUTING_KEY`: Your PagerDuty routing key for the service.

    <h3>Set up self-service actions</h3>

    <h4>Create a PagerDuty incident</h4>

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

    <h4>Trigger a PagerDuty incident</h4>

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

    <h3>Set up automations</h3>

    <h4>Sync PagerDuty incident after creation</h4>

    1. Head to the [Automations](https://app.getport.io/automations) page.

    2. Click on the `+ New Automation` button.

    3. Click on the `{...} Edit JSON` button.

    4. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Sync PagerDuty incident after creation (Click to expand)</b></summary>

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

    5. Click `Save`.

    <h4>Sync PagerDuty incident after trigger</h4>

    1. Head to the [Automations](https://app.getport.io/automations) page.

    2. Click on the `+ New Automation` button.

    3. Click on the `{...} Edit JSON` button.

    4. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Sync PagerDuty incident after trigger (Click to expand)</b></summary>

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

    5. Click `Save`.

  </TabItem>

  <TabItem value="github" label="GitHub workflow">

    To implement this use-case using GitHub, configure two workflows and corresponding self-service actions.

    <h3>Add GitHub secrets</h3>

    In your GitHub repository, go to Settings → Secrets and add:
    - `PAGERDUTY_API_KEY` – Your PagerDuty API token. See [PagerDuty docs](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account) for generating an API token.
    - `PAGERDUTY_ROUTING_KEY` – Your PagerDuty routing key for the service.
    - `PORT_CLIENT_ID` – Your Port client id.
    - `PORT_CLIENT_SECRET` – Your Port client secret.

    <h3>Add GitHub workflows</h3>

    <GithubDedicatedRepoHint/>

    <details>
    <summary><b>Create PagerDuty Incident Workflow (Click to expand)</b></summary>

    Create the file `.github/workflows/create-pagerduty-incident.yaml`:

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


    <details>
    <summary><b>Trigger PagerDuty Incident Workflow (Click to expand)</b></summary>

    Create the file `.github/workflows/trigger-pagerduty-incident.yaml`:

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

    <h3>Add the self-service actions</h3>


    <h4>Create PagerDuty Incident Self-Service Action</h4>

    1. Go to the [Self-Service](https://app.getport.io/self-serve) page.

    2. Click on the `+ New Action` button.

    3. Click on the `{...} Edit JSON` button.

    4. Copy and paste the following JSON configuration into the editor.

            <details>
            <summary><b>Create PagerDuty Incident Self-Service Action(Click to expand)</b></summary>

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

    <h4>Trigger PagerDuty Incident Self-Service Action</h4>

    1. Go to the [Self-Service](https://app.getport.io/self-serve) page.

    2. Click on the `+ New Action` button.

    3. Click on the `{...} Edit JSON` button.

    4. Copy and paste the following JSON configuration into the editor.

        <details>
        <summary><b>Trigger PagerDuty Incident Self-Service Action (Click to expand)</b></summary>

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

  </TabItem>
</Tabs>

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal.
2. Choose either implementation method and action:
   - GitHub workflow: `Create Incident` or `Trigger Incident`.
   - Synced webhook: `Create Incident (Webhook)` or `Trigger Incident (Webhook)`.
3. For the trigger flow, select a service that has a `pagerduty_service` relation to a PagerDuty service.
4. Fill in the incident details as prompted.
5. Click `Execute` and wait for PagerDuty to create or trigger the incident.

## Related guides
- [Acknowledge Incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/acknowledge-incident)
- [Change On-Call User](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/change-on-call-user)
- [Change PagerDuty incident owner](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/change-pagerduty-incident-owner)
- [Create PagerDuty service](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/create-pagerduty-service)
- [Escalate an incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/escalate-an-incident)
- [Resolve an incident](https://docs.port.io/actions-and-automations/setup-backend/github-workflow/examples/PagerDuty/resolve-incident)
