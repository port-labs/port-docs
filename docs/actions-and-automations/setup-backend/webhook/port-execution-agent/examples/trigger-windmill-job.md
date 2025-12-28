# Windmill job

This example helps internal developer teams to trigger [Windmill](https://www.windmill.dev) job using Port's self service actions. In particular, you will create a blueprint for `windmillJob` that will be connected to a backend action. You will then add some configuration files (`invocations.json`) to control the payload and trigger your Windmill job directly from Port using async/sync execution method.

## Prerequisites

- This guide assumes you have Kafka credentials available and ready to use within your Port account.
- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/).
- [Helm](https://helm.sh/docs/intro/install/) - required to install the Port Agent with Windmill job setup.

## Windmill - Async execution

1. Create a Windmill job blueprint in Port.

    <details>
    <summary>Windmill job blueprint (Click to expand)</summary>

    ```json
    {
    "identifier": "windmillJob",
    "description": "This blueprint represents a windmill job in our software catalog",
    "title": "Windmill",
    "icon": "DefaultProperty",
    "schema": {
        "properties": {
        "workspace": {
            "type": "string",
            "title": "Workspace"
        },
        "path": {
            "type": "string",
            "title": "File Path"
        },
        "trigerredBy": {
            "type": "string",
            "title": "Triggered By",
            "format": "user"
        },
        "createdAt": {
            "type": "string",
            "format": "date-time",
            "title": "Created At"
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

2. Create a Port action using the following JSON definition:

    <details>
    <summary>Port action (Click to expand)</summary>

    ```json
    [
    {
        "identifier":"trigger_windmill_pipeline",
        "title":"Trigger Windmill Pipeline",
        "icon":"DefaultProperty",
        "userInputs":{
            "properties":{
                "workspace":{
                "title":"Workspace",
                "description":"The Workspace identifier",
                "type":"string"
                },
                "file_path":{
                "title":"File Path",
                "description":"The path of the job script in the workspace, including the /u and /f prefix",
                "type":"string"
                },
                "job_data":{
                "title":"Job Data",
                "description":"The data to be passed to the job in order to execute successfully",
                "type":"object"
                }
            },
            "required":[
                "workspace",
                "file_path",
                "job_data"
            ],
            "order":[
                "workspace",
                "file_path",
                "job_data"
            ]
        },
        "invocationMethod":{
            "type":"WEBHOOK",
            "agent":true,
            "synchronized":false,
            "method":"POST",
            "url":"https://app.windmill.dev/api"
        },
        "trigger":"CREATE",
        "requiredApproval":false
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
        "enabled": ".action == \"trigger_windmill_pipeline\"",
        "url": "\"https://app.windmill.dev\" as $baseUrl | .payload.properties.workspace as $workspace | .payload.properties.file_path as $path | $baseUrl + \"/api/w/\" + $workspace + \"/jobs/run/f/\" + $path",
        "headers": {
        "Authorization": "\"Bearer \" + env.WINDMILL_TOKEN",
        "Content-Type": "\"application/json\""
        },
        "body": ".payload.properties.job_data",
        "report": {
        "status": "if .response.statusCode == 201 and (.response.text != null) then \"SUCCESS\" else \"FAILURE\" end",
        "link": "\"https://app.windmill.dev/api/w/\" + .body.payload.properties.workspace + \"/jobs/run/f/\" + .body.payload.properties.file_path",
        "externalRunId": ".response.text"
        }
    }
    ]
    ```
    </details>

4. Run the helm command below to install port agent for Windmill job.

    <details>
    <summary>Port agent installation for a Windmill job (Click to expand)</summary>

    **Remember to replace the boilerplate credentials in the helm command with your actual credentials.**

    ```sh
    helm repo add port-labs https://port-labs.github.io/helm-charts

    helm repo update

    helm install my-port-agent port-labs/port-agent \
        --create-namespace --namespace port-agent \
        --set env.normal.PORT_ORG_ID=YOUR_ORG_ID \
        --set env.normal.KAFKA_CONSUMER_GROUP_ID=YOUR_KAFKA_CONSUMER_GROUP \
        --set env.secret.KAFKA_CONSUMER_USERNAME=YOUR_KAFKA_USERNAME \
        --set env.secret.KAFKA_CONSUMER_PASSWORD=YOUR_KAFKA_PASSWORD
        --set env.normal.KAFKA_CONSUMER_BROKERS=PORT_KAFKA_BROKERS \
        --set env.normal.STREAMER_NAME=KAFKA \
        --set env.normal.KAFKA_CONSUMER_AUTHENTICATION_MECHANISM=SCRAM-SHA-512 \
        --set env.normal.KAFKA_CONSUMER_AUTO_OFFSET_RESET=earliest \
        --set env.normal.KAFKA_CONSUMER_SECURITY_PROTOCOL=SASL_SSL \
        --set env.secret.WINDMILL_TOKEN=YOUR_WINDMILL_TOKEN \
        --set-file controlThePayloadConfig=./invocations.json
    ```
    </details>

5. Run this action with some input:

    ```json showLineNumbers
    {
        "workspace": "demo",
        "file_path": "f/examples/ban_user_example",
        "job_data": {
            "value": "batman",
            "reason": "Gotham city in need of superhero",
            "database": "$res:f/examples/demo_windmillshowcases",
            "username": "Jack",
            "slack_channel": "bans"
        }
    }
    ```

## Windmill - Sync execution

1. Create a windmill job blueprint in Port.

    <details>
    <summary>Windmill job blueprint (Click to expand)</summary>

    ```json
    {
    "identifier": "windmillJob",
    "description": "This blueprint represents a windmill job in our software catalog",
    "title": "Windmill",
    "icon": "DefaultProperty",
    "schema": {
        "properties": {
        "workspace": {
            "type": "string",
            "title": "Workspace"
        },
        "path": {
            "type": "string",
            "title": "File Path"
        },
        "trigerredBy": {
            "type": "string",
            "title": "Triggered By",
            "format": "user"
        },
        "createdAt": {
            "type": "string",
            "format": "date-time",
            "title": "Created At"
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

2. Create a Port action using the following JSON definition:

    <details>
    <summary>Port action (Click to expand)</summary>

    ```json
    [
    {
        "identifier":"trigger_windmill_pipeline",
        "title":"Trigger Windmill Pipeline",
        "icon":"DefaultProperty",
        "userInputs":{
            "properties":{
                "workspace":{
                "title":"Workspace",
                "description":"The Workspace identifier",
                "type":"string"
                },
                "file_path":{
                "title":"File Path",
                "description":"The path of the job script in the workspace, including the /u and /f prefix",
                "type":"string"
                },
                "job_data":{
                "title":"Job Data",
                "description":"The data to be passed to the job in order to execute successfully",
                "type":"object"
                }
            },
            "required":[
                "workspace",
                "file_path",
                "job_data"
            ],
            "order":[
                "workspace",
                "file_path",
                "job_data"
            ]
        },
        "invocationMethod":{
            "type":"WEBHOOK",
            "agent":true,
            "synchronized":false,
            "method":"POST",
            "url":"https://app.windmill.dev/api"
        },
        "trigger":"CREATE",
        "requiredApproval":false
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
        "enabled": ".action == \"trigger_windmill_pipeline\"",
        "url": "\"https://app.windmill.dev\" as $baseUrl | .payload.properties.workspace as $workspace | .payload.properties.file_path as $path | $baseUrl + \"/api/w/\" + $workspace + \"/jobs/run_wait_result/f/\" + $path",
        "headers": {
        "Authorization": "\"Bearer \" + env.WINDMILL_TOKEN",
        "Content-Type": "\"application/json\""
        },
        "body": ".payload.properties.job_data",
        "report": {
        "status": "if .response.statusCode == 201 and (.response.json.error | not) then \"SUCCESS\" else \"FAILURE\" end",
        "link": "\"https://app.windmill.dev/api/w/\" + .body.payload.properties.workspace + \"/jobs/run_wait_result/f/\" + .body.payload.properties.file_path"
        }
    }
    ]
    ```
    </details>

4. Run the helm command below to install a port agent for Windmill job.

    <details>
    <summary>Port agent installation for a Windmill job (Click to expand)</summary>

    **Remember to replace the boilerplate credentials in the helm command with your actual credentials.**

    ```sh
    helm repo add port-labs https://port-labs.github.io/helm-charts

    helm repo update

    helm install my-port-agent port-labs/port-agent \
        --create-namespace --namespace port-agent \
        --set env.normal.PORT_ORG_ID=YOUR_ORG_ID \
        --set env.normal.KAFKA_CONSUMER_GROUP_ID=YOUR_KAFKA_CONSUMER_GROUP \
        --set env.secret.KAFKA_CONSUMER_USERNAME=YOUR_KAFKA_USERNAME \
        --set env.secret.KAFKA_CONSUMER_PASSWORD=YOUR_KAFKA_PASSWORD
        --set env.normal.KAFKA_CONSUMER_BROKERS=PORT_KAFKA_BROKERS \
        --set env.normal.STREAMER_NAME=KAFKA \
        --set env.normal.KAFKA_CONSUMER_AUTHENTICATION_MECHANISM=SCRAM-SHA-512 \
        --set env.normal.KAFKA_CONSUMER_AUTO_OFFSET_RESET=earliest \
        --set env.normal.KAFKA_CONSUMER_SECURITY_PROTOCOL=SASL_SSL \
        --set env.secret.WINDMILL_TOKEN=YOUR_WINDMILL_TOKEN \
        --set-file controlThePayloadConfig=./invocations.json
    ```
    </details>

5. Run this action with some input:

    ```json showLineNumbers
    {
        "workspace": "demo",
        "file_path": "f/examples/ban_user_example",
        "job_data": {
            "value": "batman",
            "reason": "Gotham city in need of superhero",
            "database": "$res:f/examples/demo_windmillshowcases",
            "username": "Jack",
            "slack_channel": "bans"
        }
    }
    ```