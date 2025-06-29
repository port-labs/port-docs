# CircleCI pipline

This example helps internal developer teams to trigger [CircleCI](https://circleci.com/docs/pipelines/) pipelines using Port's self service actions. In particular, you will create a blueprint for `circleCI Project` that will be connected to a backend action. You will then add some configuration files (`invocations.json`) to control the payload and trigger your CircleCI pipeline directly from Port using the sync execution method.

## Prerequisites

- This guide assumes you have Kafka credentials available and ready to use within your Port account.
- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/).
- [Helm](https://helm.sh/docs/intro/install/) - required to install the Port Agent with CircleCI setup.


## Steps

1. Create a CircleCI project blueprint in Port.

    <details>
    <summary>CircleCI Project blueprint (Click to expand)</summary>

    ```json
    {
        "identifier": "circle_ci_project",
        "title": "CircleCI Project",
        "icon": "CircleCI",
        "schema": {
            "properties": {
            "project_slug": {
                "title": "Slug",
                "type": "string"
            }
            },
            "required": [
            "project_slug"
            ]
        },
        "mirrorProperties": {},
        "calculationProperties": {},
        "relations": {}
    }
    ```
    </details>

2. Create a Port action using the following JSON definition:

    <details>
    <summary>Port Action (Click to expand)</summary>

    ```json
    [
        {
            "identifier": "trigger_circle_ci_pipeline",
            "title": "Trigger CircleCI pipeline",
            "icon": "CircleCI",
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
            "url": "https://circleci.com"
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
    [{
        "enabled": ".action == \"trigger_circle_ci_pipeline\"",
        "url": "(env.CIRCLE_CI_URL // \"https://circleci.com\") as $baseUrl | .payload.entity.properties.project_slug | @uri as $path | $baseUrl + \"/api/v2/project/\" + $path + \"/pipeline\"",
        "headers": {
        "Circle-Token": "env.CIRCLE_CI_TOKEN"
        },
        "body": {
        "branch": ".payload.properties.branch // \"main\"",
        "parameters": ".payload.action.invocationMethod as $invocationMethod | .payload.properties | to_entries | map({(.key): (.value | tostring)}) | add | if $invocationMethod.omitUserInputs then {} else . end"
        }
    }]
    ```
    </details>

4. Run the helm command below to install a port agent for CircleCI pipeline.

    <details>
    <summary>Port agent installation for CircleCI pipeline (Click to expand)</summary>

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
        --set env.secret.CIRCLE_CI_TOKEN=YOUR_CIRCLE_CI_PERSONAL_TOKEN \
        --set-file controlThePayloadConfig=./invocations.json
    ```
    </details>