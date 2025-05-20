import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Circle CI Actions

Port's Circle CI integration allows you to trigger [new pipelines](https://circleci.com/docs/api/v2/) in Circle CI directly from Port.

## Overview

You can implement this action in two ways:
1. **Synced webhook and secrets**: A simpler approach that uses Port's secret management to store your Circle CI credentials.
2. **Execution agent**: A slightly more complex approach that runs within your infrastructure, keeping credentials in your environment.

## Prerequisites

- A Circle CI [personal API token](https://app.circleci.com/settings/user/tokens).
- If you choose to implement using the Execution Agent, you will need to:
  - Install [Helm](https://helm.sh) on your infrastructure
  - Contact Port [support](mailto:support@getport.io) to set up a Kafka topic for your organization.

## Set up data model

Before implementing either approach, you will need to create a blueprint for Circle CI projects:

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".
4. Add this JSON schema:

    <details>
    <summary>Circle CI project blueprint</summary>

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

5. Click `Save` to create the blueprint.

## Implementation


<Tabs>
  <TabItem value="synced-webhook" label="Synced webhook" default>

You can trigger Circle CI pipelines by leveraging Port's **synced webhooks** to directly interact with the Circle CI API and **secrets** to store your Circle CI credentials. This method simplifies the setup by handling everything within Port.

<h3> Add Port secrets</h3>

To add Circle CI credentials to your portal:

1. Click on the `...` button in the top right corner of your Port application.

2. Click on **Credentials**.

3. Click on the `Secrets` tab.

4. Click on `+ Secret` and add:
   - `CIRCLE_CI_TOKEN`: Your Circle CI personal API token
   - `CIRCLE_CI_URL`: The URL of your Circle CI instance (e.g., `https://circleci.com`)


<h3> Create Circle CI self-service action</h3>

To create a self-service action that triggers a Circle CI pipeline, follow these steps:

1. Head to the [self-service](https://app.getport.io/self-serve) page.

2. Click on the `+ New Action` button.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary>Trigger Circle CI pipeline action</summary>

      ```json showLineNumbers
      {
        "identifier": "circle_ci_project_trigger_pipeline",
        "title": "Trigger CircleCI pipeline",
        "icon": "CircleCI",
        "trigger": {
          "type": "self-service",
          "operation": "DAY-2",
          "userInputs": {
            "properties": {
              "branch": {
                "title": "Branch",
                "type": "string",
                "default": "main"
              },
              "parameters": {
                "title": "Parameters",
                "type": "object",
                "default": {}
              }
            },
            "required": ["branch"],
            "order": ["branch", "parameters"]
          },
          "blueprintIdentifier": "circle_ci_project"
        },
        "invocationMethod": {
          "type": "WEBHOOK",
          "url": "{{.secrets.CIRCLE_CI_URL}}/api/v2/project/{{.entity.properties.project_slug}}/pipeline",
          "agent": false,
          "synchronized": true,
          "method": "POST",
          "headers": {
            "Circle-Token": "{{.secrets.CIRCLE_CI_TOKEN}}",
            "Content-Type": "application/json"
          },
          "body": {
            "branch": "{{.inputs.branch}}",
            "parameters": "{{.inputs.parameters}}"
          }
        },
        "requiredApproval": false
      }
      ```
     </details>

  5. Click `Save`.

  Now you should see the `Trigger Circle CI Pipeline` action in the self-service page. 🎉

  </TabItem>
  <TabItem value="agent" label="Execution agent">

The Execution Agent approach runs an agent within your infrastructure that connects to Port via Kafka, keeping your credentials secure within your environment.

The steps are as follows:
1. Port publishes an invoked `Action` message containing the pipeline details to a topic.
2. A secure topic (`ORG_ID.runs`) holds all the action invocations.
3. Port's execution agent pulls the new trigger event from your Kafka topic and triggers your Circle CI pipeline.

![Port Kafka Architecture](/img/self-service-actions/setup-backend/circleci/circle-ci-agent-architecture.png)

<h3> Create Circle CI self-service action</h3>

To create a self-service action that triggers a Circle CI pipeline, follow these steps:

1. Head to the [self-service](https://app.getport.io/self-serve) page.

2. Click on the `+ New Action` button.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary>Trigger Circle CI pipeline Action</summary>

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

  5. Click `Save`.

  Now you should see the `Trigger Circle CI Pipeline` action in the self-service page. 🎉

<h3> Create the invocations.json mapping</h3>

Create a JSON file named `invocations.json` with the following content:

<details>
<summary>Mapping (invocations.json)</summary>

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
        --set env.secret.CIRCLE_CI_TOKEN=YOUR_CIRCLE_CI_PERSONAL_TOKEN
    ```

  </TabItem>
</Tabs>

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. Click on `Trigger Circle CI Pipeline`

3. Fill in the pipeline details:
   - Branch to run the pipeline on (defaults to main)
   - Any additional parameters configured in the action

4. Click on `Execute`

5. Wait for the pipeline to be triggered in Circle CI

6. Check your Circle CI project page to see the new pipeline running
