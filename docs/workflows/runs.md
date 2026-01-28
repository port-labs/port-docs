---
sidebar_position: 3
title: Interact with runs
---

import ClosedBetaFeatureNotice from '/docs/generalTemplates/_closed_beta_feature_notice.md';

# Interact with workflow runs

<ClosedBetaFeatureNotice id="workflows" />

When a workflow is executed, it creates a **workflow run** that tracks the execution progress. Each node in the workflow creates a **node run** that captures its status, logs, and output.

## Viewing workflow runs

### From the Workflows page

1. Navigate to the [Workflows page](https://app.getport.io/settings/workflows)
2. Click on a workflow to view its details
3. The **Runs** tab shows all executions of that workflow

### From entity pages

Workflow runs associated with an entity appear in the entity's activity feed and can be accessed from the entity page.

## Run structure

A workflow run contains:

| Field | Description |
| ----- | ----------- |
| `identifier` | Unique run identifier (format: `wfr_xxxx`) |
| `status` | Current status: `IN_PROGRESS` or `COMPLETED` |
| `result` | Final result: `SUCCESS`, `FAILED`, or `CANCELLED` |
| `nodeRuns` | Array of node run objects |
| `variables` | Runtime variables including outputs |
| `createdAt` | When the run started |
| `completedAt` | When the run finished |
| `createdBy` | User or system that triggered the run |

### Node run structure

Each node run contains:

| Field | Description |
| ----- | ----------- |
| `identifier` | Unique node run identifier (format: `wfnr_xxxx`) |
| `nodeTitle` | Title of the node |
| `nodeIcon` | Icon of the node |
| `nodeConfigType` | Type of node (e.g., `WEBHOOK`, `UPSERT_ENTITY`) |
| `status` | Current status: `IN_PROGRESS` or `COMPLETED` |
| `result` | Final result: `SUCCESS`, `FAILED`, or `CANCELLED` |
| `output` | Output data from the node |
| `nodeRunLogs` | Array of log entries |
| `createdAt` | When the node started |
| `completedAt` | When the node finished |

## Updating node runs

External systems can update node run status and add logs using Port's API. This is useful when:

- Using asynchronous webhooks
- Processing Kafka messages
- Running long-running operations

### Update node run status

```bash
curl -X PATCH "https://api.getport.io/v1/workflows/runs/{workflow_run_id}/nodes/{node_run_id}" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "result": "SUCCESS",
    "output": {
      "resourceId": "abc123",
      "deploymentUrl": "https://my-app.example.com"
    }
  }'
```

### Request body

| Field | Type | Description |
| ----- | ---- | ----------- |
| `status` | `string` | `IN_PROGRESS` or `COMPLETED` |
| `result` | `string` | Required if status is `COMPLETED`: `SUCCESS`, `FAILED`, or `CANCELLED` |
| `output` | `object` | Output data to make available to subsequent nodes |
| `logs` | `array` | Log entries to add to the node run |

### Adding logs

Include log entries when updating a node run:

```json
{
  "status": "IN_PROGRESS",
  "logs": [
    {
      "logLevel": "INFO",
      "log": "Starting deployment to production",
      "tags": {
        "environment": "production",
        "version": "1.2.3"
      }
    },
    {
      "logLevel": "INFO",
      "log": "Deployment completed successfully"
    }
  ]
}
```

Log levels: `DEBUG`, `INFO`, `WARN`, `ERROR`

## Run outputs

Node outputs are stored in the workflow run's `variables.outputs` and can be referenced by subsequent nodes:

```json
{
  "variables": {
    "outputs": {
      "create_resource": {
        "resourceId": "abc123",
        "resourceUrl": "https://..."
      },
      "notify": {
        "messageId": "msg_456"
      }
    }
  }
}
```

Reference in subsequent nodes:

```json
{
  "body": {
    "resourceId": "{{ .outputs.create_resource.resourceId }}"
  }
}
```

## Run permissions

By default, anyone in the organization can view workflow runs. You can restrict this using the `allowAnyoneToViewRuns` workflow setting:

```json
{
  "identifier": "my-workflow",
  "allowAnyoneToViewRuns": false,
  ...
}
```

When set to `false`, only users with appropriate permissions can view the run details.

## Example: External processing

Here's an example of how an external system might process a webhook action:

```python
import requests

def process_webhook(webhook_data):
    """Process a webhook and report back to Port"""
    
    workflow_run_id = webhook_data['context']['workflowRunId']
    node_run_id = webhook_data['context']['nodeRunId']
    
    # Log the start
    update_node_run(workflow_run_id, node_run_id, {
        "status": "IN_PROGRESS",
        "logs": [{
            "logLevel": "INFO",
            "log": "Processing started"
        }]
    })
    
    try:
        # Do the actual work
        result = perform_operation(webhook_data['payload'])
        
        # Report success
        update_node_run(workflow_run_id, node_run_id, {
            "status": "COMPLETED",
            "result": "SUCCESS",
            "output": result,
            "logs": [{
                "logLevel": "INFO",
                "log": f"Operation completed: {result}"
            }]
        })
    except Exception as e:
        # Report failure
        update_node_run(workflow_run_id, node_run_id, {
            "status": "COMPLETED",
            "result": "FAILED",
            "logs": [{
                "logLevel": "ERROR",
                "log": f"Operation failed: {str(e)}"
            }]
        })

def update_node_run(workflow_run_id, node_run_id, data):
    """Update a node run via Port API"""
    response = requests.patch(
        f"https://api.getport.io/v1/workflows/runs/{workflow_run_id}/nodes/{node_run_id}",
        headers={
            "Authorization": f"Bearer {get_port_token()}",
            "Content-Type": "application/json"
        },
        json=data
    )
    response.raise_for_status()
```

## Limitations

:::caution Not yet supported
The following run features are not yet available in Workflows (Beta):
- **Re-run workflow**: Ability to re-run a workflow from the UI
- **Partial re-run**: Re-run from a specific node
- **Cancel in-progress run**: Cancel a running workflow
:::
