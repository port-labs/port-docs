import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Terraform Cloud Actions

## Overview

Port's Terraform Cloud Action can trigger
a [Terraform Cloud run](https://developer.hashicorp.com/terraform/cloud-docs/api-docs/run#create-a-run) using a customer
provided input
and [`port_payload`](/actions-and-automations/reflect-action-progress/#action-run-json-structure).

![Port Kafka Architecture](/img/self-service-actions/setup-backend/terraform-cloud/terraform-cloud-agent-architecture.png)

The steps shown in the image above are as follows:

1. Port publishes an invoked `Action` message containing the pipeline details to a topic;
2. A secure topic (`ORG_ID.runs`) holds all the action invocations;
3. Port's execution agent pulls the new trigger event from your Kafka topic, and triggers your Terraform Cloud run.

## Prerequisites

- [Helm](https://helm.sh) must be installed to use the chart. Please refer to
  Helm's [documentation](https://helm.sh/docs) for further details on the installation;
- The connection credentials to Kafka are provided to you by Port;
- If you want to trigger a Terraform Cloud run, you need to have a Terraform Cloud
  [User token](https://developer.hashicorp.com/terraform/cloud-docs/users-teams-organizations/users#api-tokens) or
  [Team token](https://developer.hashicorp.com/terraform/cloud-docs/users-teams-organizations/api-tokens#team-api-tokens).

:::warning Terraform Cloud run endpoint
**Note**: Terraform Cloud run endpoint cannot be accessed with organization tokens. You must access it with a **user
token** or **team token**.
:::

## Implementation


<Tabs>
  <TabItem value="port-secrets" label="Using Port Secrets" default>

This approach uses Port's built-in secret management to securely store your Terraform Cloud credentials.

<h3> Add Port secrets </h3>

1. In your portal, click on the `...` button next to the profile icon in the top right corner.
2. Click on **Credentials**.
3. Click on the `Secrets` tab.
4. Click on `+ Secret` and add the following secrets:
   - `TF_TOKEN`: Your Terraform Cloud user or team token
   - `TF_URL` (optional): The URL of your Terraform Cloud/Enterprise instance (defaults to "https://app.terraform.io" if not provided)

<h3> Blueprint and Action Configuration </h3>

<details>
<summary>Blueprint</summary>

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

<details>
<summary>Action with Port Secrets</summary>

```json showLineNumbers
{
  "identifier": "terraform_cloud_workspace_trigger_run_with_secrets",
  "title": "Trigger TF Cloud run (Port Secrets)",
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
        "secretReferences": {
          "tfToken": "{{.secrets.TF_TOKEN}}",
          "tfUrl": "{{.secrets.TF_URL}}"
        },
        "censoredProperties": "{{.action.encryptedProperties}}"
      }
    }
  },
  "requiredApproval": false
}
```

</details>

<details>
<summary>Mapping with Port Secrets - (Save as `invocations.json`)</summary>

:::info Control the payload
To read more about the `controlThePayload` configuration, please refer to
the [Control the payload](/actions-and-automations/setup-backend/webhook/port-execution-agent/control-the-payload.md) documentation.
:::

```json
[
  {
    "enabled": ".action == \"trigger_run_with_secrets\"",
    "url": "(.payload.secretReferences.tfUrl // \"https://app.terraform.io\") + \"/api/v2/runs/\"",
    "headers": {
      "Authorization": "\"Bearer \" + .payload.secretReferences.tfToken",
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

<h3> Installation </h3>

1. Add Port's Helm repo by using the following command:

    ```sh showLineNumbers
    helm repo add port-labs https://port-labs.github.io/helm-charts
    ```

    :::tip Already existing repo 
    If you already added this repo earlier, run `helm repo update` to retrieve
    the latest versions of the charts. You can then run `helm search repo port-labs` to see the charts.
    :::

2. Create a JSON file named `invocations.json` with the mapping above.

3. Install the `port-agent` chart by using the following command after filling in the required values:

    ```sh showLineNumbers
    helm install my-port-agent port-labs/port-agent \
        --create-namespace --namespace port-agent \
        --set-file controlThePayloadConfig=./invocations.json \
        --set env.normal.PORT_ORG_ID=YOUR_ORG_ID \
        --set env.normal.KAFKA_CONSUMER_GROUP_ID=YOUR_KAFKA_CONSUMER_GROUP \
        --set env.secret.PORT_CLIENT_ID=YOUR_PORT_CLIENT_ID \
        --set env.secret.PORT_CLIENT_SECRET=YOUR_PORT_CLIENT_SECRET
    ```
  </TabItem>
  <TabItem value="env-vars" label="Using Environment Variables">

This approach provides the Terraform Cloud credentials as environment variables during the agent installation.

<h3> Blueprint and Action Configuration </h3>

<details>
<summary>Blueprint</summary>

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

<details>
<summary>Action with Environment Variables</summary>

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

<details>
<summary>Mapping with Environment Variables - (Save as `invocations.json`)</summary>

:::info Control the payload
To read more about the `controlThePayload` configuration, please refer to
the [Control the payload](/actions-and-automations/setup-backend/webhook/port-execution-agent/control-the-payload.md) documentation.
:::

```json
[
  {
    "enabled": ".action == \"trigger_tf_run\"",
    "url": "(env.TF_URL // \"https://app.terraform.io\") + \"/api/v2/runs/\"",
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

<h3> Installation </h3>

1. Add Port's Helm repo by using the following command:

    ```sh showLineNumbers
    helm repo add port-labs https://port-labs.github.io/helm-charts
    ```

    :::tip Already existing repo 
    If you already added this repo earlier, run `helm repo update` to retrieve
    the latest versions of the charts. You can then run `helm search repo port-labs` to see the charts.
    :::

2. Create a JSON file named `invocations.json` with the mapping above.

3. Install the `port-agent` chart by using the following command after filling in the required values:

    ```sh showLineNumbers
    helm install my-port-agent port-labs/port-agent \
        --create-namespace --namespace port-agent \
        --set-file controlThePayloadConfig=./invocations.json \
        --set env.normal.PORT_ORG_ID=YOUR_ORG_ID \
        --set env.normal.KAFKA_CONSUMER_GROUP_ID=YOUR_KAFKA_CONSUMER_GROUP \
        --set env.secret.PORT_CLIENT_ID=YOUR_PORT_CLIENT_ID \
        --set env.secret.PORT_CLIENT_SECRET=YOUR_PORT_CLIENT_SECRET \
        --set env.secret.TF_TOKEN=YOUR_TERRAFORM_CLOUD_TOKEN \
        --set env.secret.TF_URL=YOUR_TERRAFORM_CLOUD_URL
    ```
  </TabItem>
</Tabs>
