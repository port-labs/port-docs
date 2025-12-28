# OpsGenie incident

This example helps internal developer teams to trigger [Opsgenie](https://www.atlassian.com/software/opsgenie) incidents using Port's self service actions. In particular, you will create a blueprint for `opsgenieIncident` that will be connected to a backend action. You will then add some configuration files (`invocations.json`) to control the payload and trigger your Opsgenie incident directly from Port using the sync execution method.

## Prerequisites

- This guide assumes you have Kafka credentials available and ready to use within your Port account.
- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/).
- [Helm](https://helm.sh/docs/intro/install/) - required to install the Port Agent with OpsGenie setup.

## Steps

1. Create an OpsGenie incident blueprint in Port.

    <details>
    <summary>OpsGenie incident blueprint (Click to expand)</summary>

    ```json
    {
        "identifier": "opsgenieIncident",
        "description": "This blueprint represent an incident in opsgenie",
        "title": "OpsGenie Incident",
        "icon": "OpsGenie",
        "schema": {
            "properties": {
            "message": {
                "title": "Message",
                "type": "string"
            },
            "description": {
                "title": "Description",
                "type": "string"
            },
            "details":{
                "title": "Details",
                "type": "object"
            },
            "priority":{
                "title": "Priority",
                "type" : "string"
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

2. Create a Port action using the following JSON definition:

    <details>
    <summary>Port action (Click to expand)</summary>

    ```json
    {
    "identifier": "create_opsgenie_incident",
    "title": "Create Opsgenie Incident",
    "icon": "OpsGenie",
    "userInputs": {
        "properties": {
        "message": {
            "title": "message",
            "description": "Message of the incident",
            "icon": "OpsGenie",
            "type": "string",
            "maxLength": 130
        },
        "description": {
            "icon": "OpsGenie",
            "title": "description",
            "type": "string",
            "maxLength": 15000,
            "description": "Description field of the incident that is generally used to provide a detailed information about the incident"
        },
        "details": {
            "title": "details",
            "description": "Map of key-value pairs to use as custom properties of the incident",
            "icon": "OpsGenie",
            "type": "object"
        },
        "priority": {
            "title": "Priority",
            "description": "Priority level of the incident. Possible values are P1, P2, P3, P4 and P5. Default value is P3.",
            "icon": "OpsGenie",
            "type": "string",
            "default": "P3",
            "enum": [
            "P1",
            "P2",
            "P3",
            "P4",
            "P5"
            ],
            "enumColors": {
            "P1": "red",
            "P2": "orange",
            "P3": "yellow",
            "P4": "green",
            "P5": "green"
            }
        }
        },
        "required": [
        "message",
        "description"
        ],
        "order": [
        "message",
        "description",
        "details",
        "priority"
        ]
    },
    "invocationMethod": {
        "type": "WEBHOOK",
        "url": "https://api.opsgenie.com/v1/incidents/create",
        "agent": true,
        "synchronized": true,
        "method": "POST"
    },
    "trigger": "CREATE",
    "description": "Create Opsgenie incident",
    "requiredApproval": false
    }
    ```

    </details>

3. Create a JSON file (`invocations.json`) in your working directory.

    <details>
    <summary>Invocation Mapping (Click to expand)</summary>

    ```json showLineNumbers title="invocations.json"
        [
            {
            "enabled": ".action == \"create_opsgenie_incident\"",
            "url": ".payload.action.url",
            "headers": {
                "Authorization": "\"GenieKey \" + env.OPSGENIE_API_KEY",
                "Content-Type": "\"application/json\""
            },
            "body": {
                "message": ".payload.properties.message",
                "description": ".payload.properties.description",
                "details": ".payload.properties.details",
                "priority": ".payload.properties.priority"
            },
            "report": {
                "status": "if .response.statusCode == 202 then \"SUCCESS\" else \"FAILURE\" end"
            }
            }
        ]
    ```
    </details>

4. Run the helm command below to install a port agent for OpsGenie incidents.

    <details>
    <summary>Port agent installation for OpsGenie incidents (Click to expand)</summary>

    **Remember to replace the boilerplate credentials in the helm command with your actual credentials.**

    ```sh
    helm repo add port-labs https://port-labs.github.io/helm-charts

    helm repo update

    helm install my-port-agent port-labs/port-agent \
        --create-namespace --namespace port-agent \
        --set env.normal.PORT_ORG_ID=YOUR_ORG_ID \
        --set env.normal.PORT_CLIENT_ID=YOUR_CLIENT \
        --set env.secret.PORT_CLIENT_SECRET=YOUR_PORT_CLIENT_SECRET \
        --set env.normal.KAFKA_CONSUMER_GROUP_ID=YOUR_KAFKA_CONSUMER_GROUP \
        --set env.secret.KAFKA_CONSUMER_USERNAME=YOUR_KAFKA_USERNAME \
        --set env.secret.KAFKA_CONSUMER_PASSWORD=YOUR_KAFKA_PASSWORD
        --set env.normal.KAFKA_CONSUMER_BROKERS=PORT_KAFKA_BROKERS \
        --set env.normal.STREAMER_NAME=KAFKA \
        --set env.normal.KAFKA_CONSUMER_AUTHENTICATION_MECHANISM=SCRAM-SHA-512 \
        --set env.normal.KAFKA_CONSUMER_AUTO_OFFSET_RESET=earliest \
        --set env.normal.KAFKA_CONSUMER_SECURITY_PROTOCOL=SASL_SSL \
        --set en.secret.OPSGENIE_API_KEY=YOUR_OPSGENIE_API_KEY \
        --set-file controlThePayloadConfig=./invocations.json
    ```
    </details>