# Terraform Cloud run

This example helps internal developer teams to trigger an [Terraform Cloud run](https://developer.hashicorp.com/terraform/cloud-docs/api-docs/run#create-a-run) using Port's self service actions. We will create a blueprint for `Terraform Cloud Workspace` that will be connected to a backend action. We will then add some configuration files (`invocations.json`) to control the payload and trigger your Terraform Cloud run directly from Port using the sync execution method.

## Prerequisites

- This guide assumes you have Kafka credentials available and ready to use within your Port account.
- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/).
- [Helm](https://helm.sh/docs/intro/install/) - required to install the Port Agent with Terraform Cloud setup.


## Steps

1. Create a Terraform Cloud Workspace blueprint in Port.

    <details>
    <summary>Terraform Cloud Workspace blueprint (Click to expand)</summary>

    ```json
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
        "required": [
        "workspace_id",
        "organization_name",
        "workspace_name"
        ]
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "relations": {}
    }
    ```
    </details>

2. Create a Port action using the following JSON definition:1

    <details>
    <summary>Port Action (Click to expand)</summary>

    ```json
    [
    {
        "identifier": "trigger_tf_run",
        "title": "Trigger TF Cloud run",
        "icon": "Terraform",
        "userInputs": {
        "properties": {},
        "required": [],
        "order": []
        },
        "invocationMethod": {
        "type": "WEBHOOK",
        "agent": true,
        "synchronized": false,
        "method": "POST",
        "url": "https://app.terraform.io/api/v2/runs/"
        },
        "trigger": "DAY-2",
        "requiredApproval": false
    }
    ]
    ```
    </details>

3. Create a JSON file (`invocations.json`) in your working directory.

    <details>
    <summary>Invocation Mapping (Click to expand)</summary>

    ```json showLineNumbers title="invocations.json"
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

4. Run the helm command below to install a port agent for Terraform Cloud run.

    <details>
    <summary>Port agent installation for Terraform Cloud run (Click to expand)</summary>

    **Remember to replace the boilerplate credentials in the helm command with your actual credentials.**

    ```sh
    helm repo add port-labs https://port-labs.github.io/helm-charts

    helm repo update

    helm install my-port-agent port-labs/port-agent \
        --create-namespace --namespace port-agent \
        --set env.secret.PORT_CLIENT_ID=YOUR_PORT_CLIENT_ID \
        --set env.secret.PORT_CLIENT_SECRET=YOUR_PORT_CLIENT_SECRET \
        --set env.normal.PORT_ORG_ID=YOUR_ORG_ID \
        --set env.normal.KAFKA_CONSUMER_GROUP_ID=YOUR_KAFKA_CONSUMER_GROUP \
        --set env.normal.KAFKA_CONSUMER_BROKERS=PORT_KAFKA_BROKERS \
        --set env.normal.STREAMER_NAME=KAFKA \
        --set env.normal.KAFKA_CONSUMER_AUTHENTICATION_MECHANISM=SCRAM-SHA-512 \
        --set env.normal.KAFKA_CONSUMER_AUTO_OFFSET_RESET=earliest \
        --set env.normal.KAFKA_CONSUMER_SECURITY_PROTOCOL=SASL_SSL \
        --set env.secret.TF_TOKEN=YOU_TERRAFORM_CLOUD_TOKEN \
        --set-file controlThePayloadConfig=./invocations.json
    ```
    </details>