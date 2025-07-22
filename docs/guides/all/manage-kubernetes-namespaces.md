---
tags:
  - Kubernetes
  - Actions
  - Automations
  - GitLab
displayed_sidebar: null
description: Learn how to manage Kubernetes namespaces through Port with automated workflows, approval processes, and chained self-service actions.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Manage Kubernetes namespaces

## Overview
This guide demonstrates how to implement a comprehensive workflow for managing Kubernetes namespace through Port using chained self-service actions and automations.

In the world of DevOps, efficiency and automation are key. In many cases, you want to be able to chain actions - where one action will 
only be triggered once its preceding action is completed, sometimes involving manual approval as part of the workflow.

Once implemented, you'll have:
- **Automated workflow orchestration**: Chain multiple actions and automations for complex namespace management
- **Approval-based deletion**: Implement safety controls with manual approval steps before namespace deletion
- **Real-time status tracking**: Monitor deletion requests through their entire lifecycle in Port
- **Slack integration**: Automatic notifications to administrators for approval requests

<center>
<iframe width="568" height="320" src="https://www.youtube.com/embed/gj6NnfOihSU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>
</center>

## Prerequisites

- Complete the [onboarding process](/getting-started/overview)
- A GitLab account with a project where you can create pipelines
- Basic understanding of Kubernetes namespaces
- Slack workspace for approval notifications (optional)

:::info GitLab-specific implementation
This guide uses GitLab pipelines as the backend. While the logic can be implemented using other Git providers or CI/CD tools, the examples are specific to GitLab.
:::

## Set up data model

This workflow uses a blueprint-driven approach with two interconnected blueprints to manage namespace deletion requests.

<h3> Create the Kubernetes namespace blueprint</h3>

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.

2. Click on `+ Blueprint`.

3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.

4. Add this JSON schema:

    <details>
    <summary><b>Kubernetes namespace blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "k8s_namespace",
      "description": "This blueprint represents a k8s Namespace",
      "title": "K8S Namespace",
      "icon": "Cluster",
      "schema": {
        "properties": {
          "creationTimestamp": {
            "type": "string",
            "title": "Created",
            "format": "date-time",
            "description": "When the Namespace was created"
          },
          "labels": {
            "type": "object",
            "title": "Labels",
            "description": "Labels of the Namespace"
          },
          "_data_source": {
            "type": "string",
            "title": "Origin data source",
            "description": "The ingestion source of the data (used for debug)"
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

5. Click `Save` to create the blueprint.

<h3> Create the workflow deletion request blueprint</h3>

1. Click on `+ Blueprint` again.

2. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.

3. Add this JSON schema:

    :::info Blueprint relations
    Note that this blueprint has a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/) to the k8s_namespace blueprint to track which namespace the deletion request is for.
    :::

    <details>
    <summary><b>Workflow delete namespace blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "workflow_delete_namespace",
      "description": "Represent all delete namespaces workflows",
      "title": "Workflow Delete Namespace",
      "icon": "Cluster",
      "schema": {
        "properties": {
          "approved_by": {
            "icon": "LeftArrow",
            "type": "string",
            "title": "Approved by",
            "format": "user"
          },
          "current_status": {
            "icon": "DefaultProperty",
            "title": "Current status",
            "type": "string",
            "default": "Checking namespace details",
            "enum": [
              "Checking namespace details",
              "Namespace found, waiting for approval",
              "Approved/Deleted",
              "Namespace cannot be deleted"
            ],
            "enumColors": {
              "Checking namespace details": "orange",
              "Namespace found, waiting for approval": "turquoise",
              "Approved/Deleted": "green",
              "Namespace cannot be deleted": "red"
            }
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "namespace": {
          "title": "Namespace",
          "target": "k8s_namespace",
          "required": false,
          "many": false
        }
      }
    }
    ```

    </details>

4. Click `Save` to create the blueprint.

## Implementation

This workflow consists of two self-service actions and two automations that work together to create a comprehensive namespace deletion process.

### Set up GitLab secrets and pipelines

<h4> Add GitLab secrets</h4>

In your GitLab project, go to **Settings > CI/CD > Variables** and add the following variables:

- `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token)
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token)

<h4> Set up GitLab pipelines</h4>

Create the following GitLab pipeline files in your repository.

<h4> Pipeline for checking namespace details</h4>

Create `.gitlab-ci-check-namespace.yml`:

<details>
<summary><b>Namespace checking pipeline (Click to expand)</b></summary>

```yaml showLineNumbers
stages:
  - prerequisites
  - check-namespace
  - port-update

image:
  name: hashicorp/terraform:light
  entrypoint:
    - '/usr/bin/env'
    - 'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'

variables:
  PORT_CLIENT_ID: ${PORT_CLIENT_ID}
  PORT_CLIENT_SECRET: ${PORT_CLIENT_SECRET}
  PORT_API_URL: "https://api.getport.io/v1/blueprints/workflow_delete_namespace/entities"
  PORT_ACTIONS_URL: "https://api.getport.io/v1/actions/runs"
  PORT_API_URL_NAMESPACE: "https://api.getport.io/v1/blueprints/k8s_namespace/entities/"

before_script:
  - apk update
  - apk add --upgrade curl jq -q

fetch-port-access-token:
  stage: prerequisites
  except:
    - pushes
  script:
    - |
      echo "Getting access token from Port API"
      accessToken=$(curl -X POST \
        -H 'Content-Type: application/json' \
        -d '{"clientId": "'"$PORT_CLIENT_ID"'", "clientSecret": "'"$PORT_CLIENT_SECRET"'"}' \
        -s 'https://api.getport.io/v1/auth/access_token' | jq -r '.accessToken')
  
      echo "ACCESS_TOKEN=$accessToken" >> data.env
      cat $TRIGGER_PAYLOAD 
      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.RUN_ID')
      workflow=$(cat $TRIGGER_PAYLOAD | jq -r '.workflow')
      echo "RUN_ID=$runId" >> data.env
      echo "workflow=$workflow" >> data.env
      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $accessToken" \
        -d '{"message":"🏃‍♂️ Checking namespace data"}' \
        "https://api.getport.io/v1/actions/runs/$runId/logs"
      curl -X PATCH \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $accessToken" \
        -d '{"link":"'"$CI_PIPELINE_URL"'"}' \
        "https://api.getport.io/v1/actions/runs/$runId"
  artifacts:
    reports:
      dotenv: data.env

check-namespace:
  stage: check-namespace
  needs:
    - job: fetch-port-access-token
      artifacts: true
  script:
    - echo "Checking Namespace"
    - sleep 1

send-data-to-port:
  stage: port-update
  dependencies:
    - fetch-port-access-token
  script:
    - |      
      curl -X PATCH \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d "{\"identifier\": \"${workflow}\", \"properties\": {\"current_status\": \"Namespace found, waiting for approval\"}}" \
        "${PORT_API_URL}/${workflow}"

      # For demonstration purposes, simulate success status
      curl -X PATCH \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"status": "SUCCESS", "message": {"run_status": "Run completed successfully!"}}' \
        "${PORT_ACTIONS_URL}/$RUN_ID"
```

</details>

<h4> Pipeline for deleting namespace</h4>

Create `.gitlab-ci-delete-namespace.yml`:

<details>
<summary><b>Namespace deletion pipeline (Click to expand)</b></summary>

```yaml showLineNumbers
stages:
- prerequisites
- delete-namespace
- port-update

image:
  name: hashicorp/terraform:light
  entrypoint:
    - '/usr/bin/env'
    - 'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'

variables:
  PORT_CLIENT_ID: ${PORT_CLIENT_ID}
  PORT_CLIENT_SECRET: ${PORT_CLIENT_SECRET}
  PORT_API_URL: "https://api.getport.io/v1/blueprints/k8s_namespace/entities"
  PORT_API_WORKFLOW_URL: "https://api.getport.io/v1/blueprints/workflow_delete_namespace/entities"
  PORT_ACTIONS_URL: "https://api.getport.io/v1/actions/runs"

before_script:
  - apk update
  - apk add --upgrade curl jq -q

fetch-port-access-token:
  stage: prerequisites
  except:
    - pushes
  script:
    - |
      echo "Getting access token from Port API"
      accessToken=$(curl -X POST \
        -H 'Content-Type: application/json' \
        -d '{"clientId": "'"$PORT_CLIENT_ID"'", "clientSecret": "'"$PORT_CLIENT_SECRET"'"}' \
        -s 'https://api.getport.io/v1/auth/access_token' | jq -r '.accessToken')
  
      echo "ACCESS_TOKEN=$accessToken" >> data.env
      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.runId')
      namespace=$(cat $TRIGGER_PAYLOAD | jq -r '.namespace')
      workflow=$(cat $TRIGGER_PAYLOAD | jq -r '.workflow')
      approved_by=$(cat $TRIGGER_PAYLOAD | jq -r '.approved_by')
      echo "runId=$runId" >> data.env
      echo "namespace=$namespace" >> data.env
      echo "workflow=$workflow" >> data.env
      echo "approved_by=$approved_by" >> data.env
      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $accessToken" \
        -d '{"message":"🏃‍♂️ Deleting namespace"}' \
        "https://api.getport.io/v1/actions/runs/$runId/logs"
      curl -X PATCH \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $accessToken" \
        -d '{"link":"'"$CI_PIPELINE_URL"'"}' \
        "https://api.getport.io/v1/actions/runs/$runId"
  artifacts:
    reports:
      dotenv: data.env
  
delete-namespace:
  stage: delete-namespace
  dependencies:
    - fetch-port-access-token
  script:
    - |
      curl -X 'DELETE' \
        -H 'accept: application/json' \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        "${PORT_API_URL}/${namespace}?delete_dependents=false"

      curl -X PATCH \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d "{\"identifier\": \"${workflow}\", \"properties\": {\"current_status\": \"Approved/Deleted\"},{\"approved_by\": {\"${approved_by}\""}"}}" \
        "${PORT_API_WORKFLOW_URL}/${workflow}"

      # For demonstration purposes, simulate success status
      curl -X PATCH \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d "{\"identifier\": \"${workflow}\", \"properties\": {\"current_status\": \"Approved/Deleted\", \"approved_by\": \"${approved_by}\"}}" \
        "${PORT_API_WORKFLOW_URL}/${workflow}"

send-data-to-port:
  stage: port-update
  dependencies:
    - fetch-port-access-token
  script:
    - |     
      # For demonstration purposes, simulate success status
      curl -X PATCH \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"status": "SUCCESS", "message": {"run_status": "Run completed successfully!"}}' \
        "${PORT_ACTIONS_URL}/$runId"
```

</details>

### Set up self-service actions

Now we'll create the two self-service actions that drive the workflow.

#### Request namespace deletion action

1. Head to the [self-service](https://app.getport.io/self-serve) page.

2. Click on the `+ New Action` button.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Request deletion of a namespace action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "request_for_deleting_namespace",
      "title": "Request deletion of a namespace",
      "icon": "Infinity",
      "description": "Request the deletion of a k8s namespace",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "blueprintIdentifier": "k8s_namespace"
      },
      "invocationMethod": {
        "type": "UPSERT_ENTITY",
        "blueprintIdentifier": "workflow_delete_namespace",
        "mapping": {
          "identifier": "{{ .entity.identifier + \"_deletion_request_workflow_\" + .trigger.at}}",
          "title": "{{ .entity.identifier + \"_deletion_request_workflow\"}}",
          "icon": "Cluster",
          "properties": {},
          "relations": {
            "namespace": "{{ .entity.identifier}}"
          }
        }
      },
      "requiredApproval": false,
      "approvalNotification": {
        "type": "email"
      }
    }
    ```

    </details>

5. Click `Save`.

#### Approve namespace deletion action

1. Click on the `+ New Action` button again.

2. Click on the `{...} Edit JSON` button.

3. Copy and paste the following JSON configuration into the editor.

    :::tip GitLab configuration required
    Make sure to replace the `{GITLAB_PROJECT_ID}` and `{GITLAB_TRIGGER_TOKEN}` placeholders with your values. To learn how to obtain these values, see the [GitLab backend documentation](/actions-and-automations/setup-backend/gitlab-pipeline/saas#create-the-webhook-url).
    :::

    <details>
    <summary><b>Approve deletion of a namespace action (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "delete_namespace",
      "title": "Approve the deletion of a k8s namespace",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "condition": {
          "type": "SEARCH",
          "rules": [
            {
              "operator": "=",
              "property": "current_status",
              "value": "Namespace found, waiting for approval"
            }
          ],
          "combinator": "and"
        },
        "blueprintIdentifier": "workflow_delete_namespace"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://gitlab.com/api/v4/projects/{GITLAB_PROJECT_ID}/ref/main/trigger/pipeline?token={GITLAB_TRIGGER_TOKEN}",
        "agent": false,
        "synchronized": false,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}"
        },
        "body": {
          "runId": "{{ .run.id }}",
          "blueprint": "{{ .action.blueprint }}",
          "entity": "{{ .entity }}",
          "namespace": "{{ .entity.relations.namespace }}",
          "workflow": "{{ .entity.identifier }}",
          "approved_by": "{{.trigger.by.user.email}}"
        }
      },
      "requiredApproval": false
    }
    ```

    </details>

4. Click `Save`.

### Set up automations

Now we'll create two automations that automatically respond to changes in the workflow.

#### Namespace details checker automation

1. Head to the [automations](https://app.getport.io/settings/automations) page.

2. Click on the `+ Automation` button.

3. Copy and paste the following JSON configuration into the editor.

    :::tip GitLab configuration required
    Remember to replace the `{GITLAB_PROJECT_ID}` and `{GITLAB_TRIGGER_TOKEN}` placeholders with your values.
    :::

    <details>
    <summary><b>Check namespace details automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "triggerNamspaceCheckerAfterRequest",
      "title": "Check namespace details",
      "description": "When a request is made to delete a k8s namespace, check its details.",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_CREATED",
          "blueprintIdentifier": "workflow_delete_namespace"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://gitlab.com/api/v4/projects/{GITLAB_PROJECT_ID}/ref/main/trigger/pipeline?token={GITLAB_TRIGGER_TOKEN}",
        "agent": false,
        "synchronized": false,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}"
        },
        "body": {
          "RUN_ID": "{{ .run.id }}",
          "workflow": "{{ .event.context.entityIdentifier }}"
        }
      },
      "publish": true
    }
    ```

    </details>

4. Click `Save`.

#### Slack approval notification automation

1. Click on the `+ Automation` button again.

2. Copy and paste the following JSON configuration into the editor.

    :::tip Slack webhook setup
    You'll need to replace the Slack webhook URL with your own. Learn how to create Slack webhook URLs in the [Slack documentation](https://api.slack.com/messaging/webhooks).
    :::

    <details>
    <summary><b>Request approval via Slack notification automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "triggerSlackNotificationAfterChecker",
      "title": "Request approval via Slack notification",
      "trigger": {
        "type": "automation",
        "event": {
          "type": "ENTITY_UPDATED",
          "blueprintIdentifier": "workflow_delete_namespace"
        },
        "condition": {
          "type": "JQ",
          "expressions": [
            ".diff.before.properties.current_status == \"Checking namespace details\"",
            ".diff.after.properties.current_status == \"Namespace found, waiting for approval\""
          ],
          "combinator": "and"
        }
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "RUN_ID": "{{ .run.id }}"
        },
        "body": {
          "text": "The namespace {{.event.diff.before.relations.namespace}} had been requested for deletion, here is the url for the entity https://app.getport.io/workflow_delete_namespaceEntity?identifier={{.event.context.entityIdentifier}}"
        }
      },
      "publish": true
    }
    ```

    </details>

3. Click `Save`.

## How the workflow works

Once all components are set up, the workflow operates as follows:

1. **Developer initiates deletion**: A user executes the "Request deletion of a namespace" action on a Kubernetes namespace entity.

2. **Workflow tracking created**: The action creates a `workflow_delete_namespace` entity with status "Checking namespace details".

3. **Automatic validation**: An automation triggers when the workflow entity is created, starting a GitLab pipeline to validate the namespace.

4. **Status update**: The pipeline updates the workflow entity status to "Namespace found, waiting for approval".

5. **Approval notification**: Another automation detects the status change and sends a Slack message to administrators.

6. **Administrative approval**: An admin uses the "Approve the deletion of a k8s namespace" action to complete the deletion.

7. **Namespace deletion**: The approval action triggers another GitLab pipeline that deletes the namespace and updates the workflow status to "Approved/Deleted".

## Let's test it!

1. **Create a test namespace entity** in Port under the Kubernetes namespace blueprint.

2. **Request deletion**:
   - Go to the [catalog](https://app.getport.io/organization/catalog) page
   - Find your test namespace entity
   - Click on it and execute the "Request deletion of a namespace" action

3. **Monitor the workflow**:
   - Check that a new workflow entity was created with status "Checking namespace details"
   - Wait for the automation to run and update the status to "Namespace found, waiting for approval"
   - Verify that a Slack notification was sent (if configured)

4. **Approve the deletion**:
   - Go to the workflow entity in your catalog
   - Execute the "Approve the deletion of a k8s namespace" action
   - Monitor the GitLab pipeline execution
   - Verify the workflow status updates to "Approved/Deleted"

5. **Verify completion**:
   - Check that the original namespace entity has been deleted from Port
   - Review the GitLab pipeline logs for any issues

:::tip Workflow customization
This workflow can be extended to include additional validation steps, different approval mechanisms, or integration with actual Kubernetes clusters for real namespace management.
::: 