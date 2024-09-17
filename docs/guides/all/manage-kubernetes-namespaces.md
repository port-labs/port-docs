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

## Scenario overview

This guide will demonstrate how to create the following workflow:

1. A user requests to delete a Kubernetes namespace via a **self-service action** in Port.

2. The action creates a `workflow_delete_namespace` entity in Port representing the deletion request.

3. An **automation** is triggered when the `workflow_delete_namespace` entity is created, checking the namespace's details and waiting for approval.

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

- Action definition:  
  <details>
  <summary><b>Request deletion of a namespace</b></summary>

  ```json showLineNumbers
  {
    "identifier": "request_for_deleting_namespace",
    "title": "Request deletion of a namespace",
    "icon": "Infinity",
    "description": "Request the deletetion of a k8s namespace",
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

- Action definition:
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
      "url": "https://gitlab.com/api/v4/projects/59636748/ref/main/trigger/pipeline?token=glptt-84ad70275d319428cecdca7687ea9af4746cdd36",
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
      "url": "https://gitlab.com/api/v4/projects/59636748/ref/main/trigger/pipeline?token=glptt-84ad70275d319428cecdca7687ea9af4746cdd36",
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

### Automations

To create an automation, go to the [automations page](https://app.getport.io/settings/automations) of your portal, then click on the `+ Automation` button.

Create the following automations using the JSON definitions below:

#### Check namespace details

- Automation definition:
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
      "url": "https://gitlab.com/api/v4/projects/59634184/ref/main/trigger/pipeline?token=glptt-432b3bc15fe91f9fc9b3511bafef103b18d04bd5",
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
      "url": "https://gitlab.com/api/v4/projects/59634184/ref/main/trigger/pipeline?token=glptt-432b3bc15fe91f9fc9b3511bafef103b18d04bd5",
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

#### Request approval

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

You can use this chaining mechanism to create complex workflows for many use-cases, that involve multiple actions and automations, enabling you to automate and streamline your DevOps processes. 