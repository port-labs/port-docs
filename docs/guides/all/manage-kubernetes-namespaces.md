---
tags:
  - Kubernetes
  - Actions
  - Automations
  - GitLab
displayed_sidebar: null
description: Understand IAM permissions in Port with this comprehensive guide, ensuring secure and effective access management.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Manage Kubernetes namespaces

In the world of DevOps, efficiency and automation are key. In many cases, you want to be able to chain actions - where one action will only be triggered once its preceding action is completed, sometimes involving manual approval as part of the workflow.

This guides aims to:
- Demonstrate the power and flexibility of chaining self-service actions and automations in Port.
- Provide a real-world example of how to use action chaining to manage Kubernetes namespaces using Port.

<center>
<iframe width="568" height="320" src="https://www.youtube.com/embed/gj6NnfOihSU" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>
</center>

## Scenario overview

This guide will demonstrate how to create the following workflow:

1. A user requests to delete a Kubernetes namespace via a **self-service action** in Port.

2. The action creates a `workflow_delete_namespace` entity in Port representing the deletion request.

3. An **automation** is triggered when the `workflow_delete_namespace` entity is created, checking the namespace's details and updating the entity's status in Port.

4. Another **automation** is triggered when the `workflow_delete_namespace` entity's status is updated to *"Namespace found, waiting for approval"*, sending a Slack message requesting approval from an admin.

5. The deletion request is approved by an admin using another **self-service action**, which finally deletes the namespace.

## Prerequisites

- **Port account**: If you don't have a Port account, you will need to [create one](https://app.getport.io/signup).
- This guide includes the creation of actions and automations that use a GitLab pipeline as their backend. While the logic of the backend can be implemented using other Git providers or CI/CD tools, the examples in this guide are specific to GitLab.

## Data Model

This guide uses a <PortTooltip id="blueprint">blueprint</PortTooltip>-driven approach to manage the deletion of Kubernetes namespaces, which includes two blueprints that you will need to create in your portal.

To create a blueprint, go to the [data model](https://app.getport.io/data_model) page, click on the `+ Blueprint` button, then click on the `Edit JSON` button to define the blueprint using JSON instead of the UI.

Create two blueprints using the following JSON definitions:

<details>
<summary><b>k8s namespace</b></summary>
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

<details>
<summary><b>workflow_delete_namespace</b></summary>

Note that this blueprint has a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/) to the k8s_namespace blueprint.

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
          "Namespace cannot be deleted "
        ],
        "enumColors": {
          "Checking namespace details": "orange",
          "Namespace found, waiting for approval": "turquoise",
          "Approved/Deleted": "green",
          "Namespace cannot be deleted ": "red"
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

## Actions & automations

This workflow uses two self-service actions and two automations to manage the deletion of Kubernetes namespaces.  
Just like blueprints, actions and automations can also be defined using JSON.

### Self-service actions

To create a self-service action, go to the [self-service page](https://app.getport.io/self-serve) of your portal, click on the `+ Action` button, then click on the `Edit JSON` button to define the action using JSON instead of the UI.

Create the following actions using the JSON definitions below:

#### Request deletion of a namespace

This action can be executed by a developer to request the deletion of a Kubernetes namespace. It creates a `workflow_delete_namespace` entity in Port representing the deletion request.
- Action definition:  
  <details>
  <summary><b>Request deletion of a namespace</b></summary>

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

- Action backend:  
  This action uses the `UPSERT_ENTITY` backend type, which directly creates/updates a new entity in Port. No additional backend logic is required.

#### Approve deletion of a namespace

This action can be executed by an admin to approve the deletion of a Kubernetes namespace. It deletes the namespace and updates the status of the `workflow_delete_namespace` entity in Port to *"Approved/Deleted"*.
- Action definition:  
  Remember to replace the `GITLAB_PROJECT_ID` and `GITLAB_TRIGGER_TOKEN` placeholders with your values.  
  To learn how to obtain these values, see the [GitLab backend documentation](/actions-and-automations/setup-backend/gitlab-pipeline/saas#create-the-webhook-url).
  <details>
  <summary><b>Approve deletion of a namespace</b></summary>

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

- Action backend:  
  This action uses the `WEBHOOK` backend type, which triggers a webhook to a specified URL. In this case, the webhook triggers a GitLab pipeline to check the namespace:

  <details>
  <summary><b>GitLab pipeline</b></summary>

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

### Automations

To create an automation, go to the [automations page](https://app.getport.io/settings/automations) of your portal, then click on the `+ Automation` button.

Create the following automations using the JSON definitions below:

#### Check namespace details

This automation is triggered when an entity of type `workflow_delete_namespace` is created. It checks the details of the namespace and updates the entity's status in Port.
- Automation definition:  
  Remember to replace the `GITLAB_PROJECT_ID` and `GITLAB_TRIGGER_TOKEN` placeholders with your values.  
  To learn how to obtain these values, see the [GitLab backend documentation](/actions-and-automations/setup-backend/gitlab-pipeline/saas#create-the-webhook-url).
  <details>
  <summary><b>Check namespace details</b></summary>

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

- Automation backend:  
  This automation triggers a webhook to a specified URL. In this case, the webhook triggers a GitLab pipeline to check the namespace:

  <details>
  <summary><b>GitLab pipeline</b></summary>

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

#### Request approval

This automation is triggered when the status of an entity of type `workflow_delete_namespace` is updated to *"Namespace found, waiting for approval"*. It sends a Slack message requesting approval from an admin.

- Automation definition:
  <details>
  <summary><b>Request approval via Slack notification</b></summary>

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
      "url": "https://hooks.slack.com/services/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",
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

- Automation backend:  
  This automation triggers a webhook to a specified URL. In this case, the webhook sends a Slack message to a specified channel. The message body is defined in the `invocationMethod.body` field of the automation definition.


## Conclusion

Once all of the above components are created, you will have a the necessary setup to run the workflow described in the [scenario overview](#scenario-overview).

You can use this chaining mechanism to create complex workflows for many use-cases, that involve multiple actions and automations, enabling you to streamline your DevOps processes. 