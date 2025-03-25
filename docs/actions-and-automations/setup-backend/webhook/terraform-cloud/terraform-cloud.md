import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Terraform Cloud Actions

Port's Terraform Cloud integration allows you to trigger [Terraform Cloud runs](https://developer.hashicorp.com/terraform/cloud-docs/api-docs/run#create-a-run) directly from Port.

## Overview

You can implement this action in two ways:
1. **Synced webhook and secrets**: A simpler approach that uses Port's secret management to store your Terraform Cloud credentials.
2. **Execution agent**: A slightly more complex approach that runs within your infrastructure, keeping credentials in your environment.

## Prerequisites

- A Terraform Cloud [User token](https://developer.hashicorp.com/terraform/cloud-docs/users-teams-organizations/users#api-tokens) or [Team token](https://developer.hashicorp.com/terraform/cloud-docs/users-teams-organizations/api-tokens#team-api-tokens).

  :::warning Terraform Cloud run endpoint
  **Note**: Terraform Cloud run endpoint cannot be accessed with organization tokens. You must access it with a **user token** or **team token**.
  :::

- If you choose to implement using the Execution Agent, you will need to:
  - Install [Helm](https://helm.sh) on your infrastructure
  - Contact Port [support](mailto:support@getport.io) to set up a Kafka topic for your organization.

## Set up data model

Before implementing either approach, you'll need to create a blueprint for Terraform Cloud workspaces:  

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

    <details>
    <summary>Terraform Cloud workspace blueprint</summary>

    ```json showLineNumbers
    {
      "identifier": "terraform_cloud_workspace",
      "title": "Terraform Cloud Workspace",
      "icon": "Terraform",
      "schema": {
        "properties": {
          "workspace_id": {
            "title": "Workspace Id",
            "type": "string"
          },
          "organization_name": {
            "title": "Organization Name",
            "type": "string"
          },
          "workspace_name": {
            "title": "Workspace Name",
            "type": "string"
          }
        },
        "required": ["workspace_id", "organization_name", "workspace_name"]
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "relations": {}
    }
    ```

    </details>

5. Click `Save` to create the blueprint.

## Implementation

<Tabs>
  <TabItem value="synced-webhook" label="Synced webhook" default>

You can trigger Terraform Cloud runs by leveraging Port's **synced webhooks** to directly interact with the Terraform Cloud API and **secrets** to store your Terraform Cloud credentials. This method simplifies the setup by handling everything within Port.

<h3> Add Port secrets</h3>

To add Terraform Cloud credentials to your portal:

1. Click on the `...` button in the top right corner of your Port application.

2. Click on **Credentials**.

3. Click on the `Secrets` tab.

4. Click on `+ Secret` and add:
   - `TF_TOKEN`: Your Terraform Cloud user or team token

<h3> Create Terraform Cloud self-service action</h3>

To create a self-service action that triggers a Terraform Cloud run, follow these steps:

1. Head to the [self-service](https://app.getport.io/self-serve) page.

2. Click on the `+ New Action` button.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary>Trigger TF Cloud Run action</summary>

    ```json showLineNumbers
    {
      "identifier": "terraform_cloud_workspace_trigger_run",
      "title": "Trigger TF Cloud Run",
      "icon": "Terraform",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "is_destroy": {
              "title": "Is Destroy",
              "type": "boolean",
              "default": false
            },
            "message": {
              "title": "Message",
              "type": "string",
              "default": "Triggered via Port"
            },
            "variables": {
              "title": "Variables",
              "type": "object",
              "default": {}
            }
          },
          "required": ["message"],
          "order": ["message", "is_destroy", "variables"]
        },
        "blueprintIdentifier": "terraform_cloud_workspace"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://app.terraform.io/api/v2/runs",
        "agent": false,
        "synchronized": true,
        "method": "POST",
        "headers": {
          "Authorization": "Bearer {{.secrets.TF_TOKEN}}",
          "Content-Type": "application/vnd.api+json"
        },
        "body": {
          "data": {
            "attributes": {
              "is-destroy": "{{.inputs.is_destroy}}",
              "message": "{{.inputs.message}}",
              "variables": "{{.inputs.variables | toTFVariables}}"
            },
            "type": "runs",
            "relationships": {
              "workspace": {
                "data": {
                  "type": "workspaces",
                  "id": "{{.entity.properties.workspace_id}}"
                }
              }
            }
          }
        }
      },
      "requiredApproval": false
    }
    ```

    </details>

5. Click `Save`.

Now you should see the `Trigger TF Cloud Run` action in the self-service page. 🎉

  </TabItem>
  <TabItem value="agent" label="Execution agent">

The Execution Agent approach runs an agent within your infrastructure that connects to Port via Kafka, keeping your credentials secure within your environment.

The steps are as follows:
1. Port publishes an invoked `Action` message containing the run details to a topic.
2. A secure topic (`ORG_ID.runs`) holds all the action invocations.
3. Port's execution agent pulls the new trigger event from your Kafka topic and triggers your Terraform Cloud run.

![Port Kafka Architecture](/img/self-service-actions/setup-backend/terraform-cloud/terraform-cloud-agent-architecture.png)

<h3> Create Terraform Cloud self-service action</h3>

To create a self-service action that triggers a Terraform Cloud run, follow these steps:

1. Head to the [self-service](https://app.getport.io/self-serve) page.

2. Click on the `+ New Action` button.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary>Trigger TF Cloud run Action</summary>

    ```json showLineNumbers
    {
      "identifier": "terraform_cloud_workspace_trigger_tf_run",
      "title": "Trigger TF Cloud run",
      "icon": "Terraform",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "blueprintIdentifier": "terraform_cloud_workspace"
      },
      "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://app.terraform.io/api/v2/runs/",
        "agent": true,
        "synchronized": false,
        "method": "POST",
        "body": {
          "action": "{{ .action.identifier[(\"terraform_cloud_workspace_\" | length):] }}",
          "resourceType": "run",
          "status": "TRIGGERED",
          "trigger": "{{ .trigger | {by, origin, at} }}",
          "context": {
            "entity": "{{.entity.identifier}}",
            "blueprint": "{{.action.blueprint}}",
            "runId": "{{.run.id}}"
          },
          "payload": {
            "entity": "{{ (if .entity == {} then null else .entity end) }}",
            "action": {
              "invocationMethod": {
                "type": "WEBHOOK",
                "agent": true,
                "synchronized": false,
                "method": "POST",
                "url": "https://app.terraform.io/api/v2/runs/"
              },
              "trigger": "{{.trigger.operation}}"
            },
            "properties": {},
            "censoredProperties": "{{.action.encryptedProperties}}"
          }
        }
      },
      "requiredApproval": false
    }
    ```

    </details>

5. Click `Save`.

Now you should see the `Trigger TF Cloud run` action in the self-service page. 🎉

<h3> Create the invocations.json mapping</h3>

Create a JSON file named `invocations.json` with the following content:

<details>
<summary>Mapping (invocations.json)</summary>

```json
[
  {
    "enabled": ".action == \"trigger_tf_run\"",
    "headers": {
      "Authorization": "\"Bearer \" + env.TF_TOKEN",
      "Content-Type": "\"application/vnd.api+json\""
    },
    "body": {
      "data": {
        "attributes": {
          "is-destroy": false,
          "message": "\"Triggered via Port\"",
          "variables": ".payload.properties | to_entries | map({key: .key, value: .value})"
        },
        "type": "\"runs\"",
        "relationships": {
          "workspace": {
            "data": {
              "type": "\"workspaces\"",
              "id": ".payload.entity.properties.workspace_id"
            }
          }
        }
      }
    },
    "report": {
      "status": "if .response.statusCode == 201 then \"SUCCESS\" else \"FAILURE\" end",
      "link": "\"https://app.terraform.io/app/\" + .body.payload.entity.properties.organization_name + \"/workspaces/\" + .body.payload.entity.properties.workspace_name + \"/runs/\" + .response.json.data.id",
      "externalRunId": ".response.json.data.id"
    }
  }
]
```

</details>

<h3> Install execution agent</h3>

1. Add Port's Helm repo:

    ```sh showLineNumbers
    helm repo add port-labs https://port-labs.github.io/helm-charts
    ```

    :::tip Already existing repo 
    If you already added this repo earlier, run `helm repo update` to retrieve
    the latest versions of the charts. You can then run `helm search repo port-labs` to see the charts.
    :::

2. Install the `port-agent` chart:

    ```sh showLineNumbers
    helm install my-port-agent port-labs/port-agent \
        --create-namespace --namespace port-agent \
        --set-file controlThePayloadConfig=./invocations.json \
        --set env.normal.PORT_ORG_ID=YOUR_ORG_ID \
        --set env.normal.KAFKA_CONSUMER_GROUP_ID=YOUR_KAFKA_CONSUMER_GROUP \
        --set env.secret.PORT_CLIENT_ID=YOUR_PORT_CLIENT_ID \
        --set env.secret.PORT_CLIENT_SECRET=YOUR_PORT_CLIENT_SECRET \
        --set env.secret.TF_TOKEN=YOUR_TERRAFORM_CLOUD_TOKEN
    ```

  </TabItem>
</Tabs>

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. Click on the Terraform Cloud run action you created

3. Fill in the run details:
   - Message describing the purpose of the run
   - Whether this is a destroy operation
   - Any variables needed for the Terraform run

4. Click on `Execute`

5. Wait for the run to be triggered in Terraform Cloud

6. Check your Terraform Cloud workspace page to see the new run
