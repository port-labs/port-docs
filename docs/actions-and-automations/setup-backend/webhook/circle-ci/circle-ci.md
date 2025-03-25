import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Circle CI Actions

## Overview

Port's Circle CI Action can trigger
a [new pipeline](https://circleci.com/docs/api/v2/index.html?utm_source=google&utm_medium=sem&utm_campaign=sem-google-dg--emea-en-dsa-tCPA-auth-nb&utm_term=g_-_c__dsa_&utm_content=&gclid=Cj0KCQiAmNeqBhD4ARIsADsYfTeWb6EyzetX9OD0cFdfR--Tt8oOEf8CXnhyoRT46HMCGgbbVytPWG0aAloJEALw_wcB#operation/triggerPipeline)
using a customer provided input
and [`port_payload`](/actions-and-automations/reflect-action-progress/#action-run-json-structure).

![Port Kafka Architecture](/img/self-service-actions/setup-backend/circleci/circle-ci-agent-architecture.png)

The steps shown in the image above are as follows:

1. Port publishes an invoked `Action` message containing the pipeline details to a topic;
2. A secure topic (`ORG_ID.runs`) holds all the action invocations;
3. Port's execution agent pulls the new trigger event from your Kafka topic, and triggers your Circle CI pipeline.

## Prerequisites

- [Helm](https://helm.sh) must be installed to use the chart. Please refer to
  Helm's [documentation](https://helm.sh/docs) for further details on the installation;
- The connection credentials to Kafka are provided to you by Port;
- If you want to trigger a Circle CI pipeline, you need to have a Circle
  CI [personal API token](https://app.circleci.com/settings/user/tokens).

## Getting Started

Before implementing, follow these steps:
- Contact us using chat/Slack/mail to [support@getport.io](mailto:support@getport.io) to set up a Kafka topic for your organization.
- Install the Port execution agent to trigger the Circle CI pipeline (detailed in the Implementation section).

## Implementation 

<Tabs>
  <TabItem value="port-secrets" label="Using Port Secrets" default>

This approach uses Port's built-in secret management to securely store your Circle CI credentials.

<h3> Add Port secrets </h3>

1. In your portal, click on the `...` button next to the profile icon in the top right corner.
2. Click on **Credentials**.
3. Click on the `Secrets` tab.
4. Click on `+ Secret` and add the following secrets:
   - `CIRCLE_CI_TOKEN`: Your Circle CI personal API token
   - `CIRCLE_CI_URL` (optional): The URL of your Circle CI instance (defaults to "https://circleci.com" if not provided)

<h3> Blueprint and Action Configuration </h3>

<details>
<summary>Blueprint</summary>

```json showLineNumbers
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
    "required": ["project_slug"]
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
  "identifier": "circle_ci_project_trigger_pipeline_with_secrets",
  "title": "Trigger CircleCI pipeline (Port Secrets)",
  "icon": "CircleCI",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {},
      "required": [],
      "order": []
    },
    "blueprintIdentifier": "circle_ci_project"
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://circleci.com",
    "agent": true,
    "synchronized": false,
    "method": "POST",
    "body": {
      "action": "{{ .action.identifier[(\"circle_ci_project_\" | length):] }}",
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
            "url": "https://circleci.com"
          },
          "trigger": "{{.trigger.operation}}"
        },
        "properties": {},
        "secretReferences": {
          "circleToken": "{{.secrets.CIRCLE_CI_TOKEN}}",
          "circleUrl": "{{.secrets.CIRCLE_CI_URL}}"
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
    "enabled": ".action == \"trigger_pipeline_with_secrets\"",
    "url": "(.payload.secretReferences.circleUrl // \"https://circleci.com\") as $baseUrl | .payload.entity.properties.project_slug | @uri as $path | $baseUrl + \"/api/v2/project/\" + $path + \"/pipeline\"",
    "headers": {
      "Circle-Token": ".payload.secretReferences.circleToken"
    },
    "body": {
      "branch": ".payload.properties.branch // \"main\"",
      "parameters": ".payload.action.invocationMethod as $invocationMethod | .payload.properties | to_entries | map({(.key): (.value | tostring)}) | add | if $invocationMethod.omitUserInputs then {} else . end"
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

This approach provides the Circle CI credentials as environment variables during the agent installation.

<h3> Blueprint and Action Configuration </h3>

<details>
<summary>Blueprint</summary>

```json showLineNumbers
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
    "required": ["project_slug"]
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
  "identifier": "circle_ci_project_trigger_circle_ci_pipeline",
  "title": "Trigger CircleCI pipeline",
  "icon": "CircleCI",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {},
      "required": [],
      "order": []
    },
    "blueprintIdentifier": "circle_ci_project"
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://circleci.com",
    "agent": true,
    "synchronized": false,
    "method": "POST",
    "body": {
      "action": "{{ .action.identifier[(\"circle_ci_project_\" | length):] }}",
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
            "url": "https://circleci.com"
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
    "enabled": ".action == \"trigger_circle_ci_pipeline\"",
    "url": "(env.CIRCLE_CI_URL // \"https://circleci.com\") as $baseUrl | .payload.entity.properties.project_slug | @uri as $path | $baseUrl + \"/api/v2/project/\" + $path + \"/pipeline\"",
    "headers": {
      "Circle-Token": "env.CIRCLE_CI_TOKEN"
    },
    "body": {
      "branch": ".payload.properties.branch // \"main\"",
      "parameters": ".payload.action.invocationMethod as $invocationMethod | .payload.properties | to_entries | map({(.key): (.value | tostring)}) | add | if $invocationMethod.omitUserInputs then {} else . end"
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
        --set env.secret.CIRCLE_CI_TOKEN=YOUR_CIRCLE_CI_PERSONAL_TOKEN \
        --set env.secret.CIRCLE_CI_URL=YOUR_CIRCLE_CI_URL
    ```
  </TabItem>
</Tabs>
