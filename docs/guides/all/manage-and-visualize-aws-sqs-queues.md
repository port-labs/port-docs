---
displayed_sidebar: null
description: Learn how to monitor and manage your AWS SQS queues using dashboards and self-service actions in Port.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Manage and visualize your AWS SQS queues

This guide demonstrates how to bring your AWS SQS management experience into Port. You will learn how to:

- Ingest SQS queue data into Port's software catalog using **Port's AWS** integration.
- Set up **self-service actions** to manage SQS queues (purge, redrive, and delete).
- Build **dashboards** in Port to monitor and take action on your SQS resources.

<img src="/img/guides/sqsQueueDashboard1.png" border="1px" width="100%" />
<img src="/img/guides/sqsQueueDashboard2.png" border="1px" width="100%" />


## Common use cases

- Monitor the status and health of all SQS queues across accounts from a single dashboard.
- Track important metrics like total queues, DLQ usage, and encryption status.
- Empower platform teams to automate queue management operations via GitHub workflows.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [AWS integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/) is installed in your account.


## Set up data model

When installing the AWS integration in Port, the `AWS Account` blueprint is created by default.  
However, the `SQS Queue` blueprint is not created automatically so we will need to create it manually.

### Create the SQS queue blueprint

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:
    <details>
    <summary><b>AWS SQS Queue blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "sqs",
      "description": "This blueprint represents an AWS SQS service in our software catalog",
      "title": "SQS Queue",
      "icon": "AWS",
      "schema": {
        "properties": {
          "link": {
            "type": "string",
            "format": "url",
            "title": "Link"
          },
          "visibilityTimeout": {
            "type": "number",
            "title": "Visibility Timeout"
          },
          "messageRetentionPeriod": {
            "type": "number",
            "title": "Message Retention Period"
          },
          "maximumMessageSize": {
            "type": "number",
            "title": "Maximum Message Size"
          },
          "receiveMessageWaitTimeSeconds": {
            "type": "number",
            "title": "Receive Message Wait Time"
          },
          "delaySeconds": {
            "type": "number",
            "title": "Delay Seconds"
          },
          "tags": {
            "type": "array",
            "title": "Tags"
          },
          "arn": {
            "type": "string",
            "title": "ARN"
          },
          "sseEnabled": {
            "type": "boolean",
            "title": "SSE Enabled"
          },
          "dlqRedrivePolicy": {
            "icon": "DefaultProperty",
            "type": "object",
            "title": "Dead Letter Queue Policy"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "account": {
          "title": "Account",
          "target": "awsAccount",
          "required": true,
          "many": false
        }
      }
    }
    ```
    </details>

5. Click `Save` to create the blueprint.


### Update the integration mapping

1. Go to the [Data Sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Select the AWS integration.
3. Add the following YAML block into the editor to ingest SQS queues from your AWS account:

    <details>
    <summary><b>AWS integration configuration (Click to expand)</b></summary>

    ```yaml showLineNumbers
    deleteDependentEntities: true
    createMissingRelatedEntities: true
    enableMergeEntity: true
    resources:
      - kind: AWS::Organizations::Account
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .Id
              title: .Name
              blueprint: '"awsAccount"'
              properties:
                arn: .Arn
                email: .Email
                status: .Status
                joined_method: .JoinedMethod
                joined_timestamp: .JoinedTimestamp | sub(" "; "T")
      - kind: AWS::SQS::Queue
        selector:
          query: 'true'
        port:
          entity:
            mappings:
              identifier: .__Region + "-" + .__AccountId + "-" + .Properties.QueueName
              title: .Properties.QueueName
              blueprint: '"sqs"'
              properties:
                link: .Properties.QueueUrl
                visibilityTimeout: .Properties.VisibilityTimeout
                messageRetentionPeriod: .Properties.MessageRetentionPeriod
                maximumMessageSize: .Properties.MaximumMessageSize
                receiveMessageWaitTimeSeconds: .Properties.ReceiveMessageWaitTimeSeconds
                delaySeconds: .Properties.DelaySeconds
                tags: .Properties.Tags
                arn: .Properties.Arn
                sseEnabled: .Properties.SqsManagedSseEnabled
                dlqRedrivePolicy: .Properties.RedrivePolicy
              relations:
                account: .__AccountId
    ```
    </details>
    
4. Click `Save & Resync` to apply the mapping.


## Set up self-service actions

Now let us create self-service actions to manage your SQS queues directly from Port using GitHub Actions. You will implement workflows to:

1. Purge an SQS queue.
2. Redrive messages from a Dead Letter Queue (DLQ).
3. Delete an SQS queue.

To implement these use-cases, follow the steps below:

### Add GitHub secrets

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
- `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `AWS_ACCESS_KEY_ID` - AWS IAM user's access key.
- `AWS_SECRET_ACCESS_KEY` - AWS IAM user's secret access key.
- `AWS_REGION` - AWS region (e.g., `us-east-1`).


### Purge an SQS queue

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/purge-queue.yaml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>
<summary><b>Purge SQS Queue GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Purge SQS Queue

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string

jobs:
  purge-queue:
    runs-on: ubuntu-latest
    steps:
      - name: Inform Port of workflow start
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Configuring AWS credentials to purge SQS queue with URL ${{ fromJson(inputs.port_context).entity.properties.link }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Purge SQS queue
        run: aws sqs purge-queue --queue-url ${{ fromJson(inputs.port_context).entity.properties.link }}

      - name: Inform Port about SQS queue purge success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ SQS queue with URL ${{ fromJson(inputs.port_context).entity.properties.link }} purged successfully
          summary: SQS queue purge completed successfully

      - name: Inform Port about SQS queue purge failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to purge SQS queue with URL ${{ fromJson(inputs.port_context).entity.properties.link }}
          summary: SQS queue purge failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Purge SQS queue action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "purge_sqs_queue",
      "title": "Purge Queue",
      "icon": "SNS",
      "description": "Delete available messages in an SQS queue",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {},
          "required": []
        },
        "blueprintIdentifier": "sqs"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "purge-queue.yaml",
        "workflowInputs": {
          "port_context": {
            "entity": "{{ .entity }}",
            "runId": "{{ .run.id }}"
          }
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Purge SQS Queue` action in the self-service page. 🎉


### Redrive messages from DLQ

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/redrive-queue.yaml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>
<summary><b>Redrive DLQ GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Redrive DLQ Messages

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string
      source_queue:
        description: 'The source queue'
        required: true
        type: string
      destination_queue:
        description: 'The destination queque'
        required: true
        type: string
      max_messages_per_second:
        description: 'Max number of messages per second'
        required: true
        type: string

jobs:
  redrive-queue:
    runs-on: ubuntu-latest
    steps:
      - name: Inform Port of workflow start
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Configuring AWS credentials to redrive SQS queue from ${{ inputs.source_queue }} to ${{ inputs.destination_queue }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Redrive DLQ messages
        run: aws sqs start-message-move-task --source-arn ${{ inputs.source_queue }} --destination-arn ${{ inputs.destination_queue }} --max-number-of-messages-per-second ${{ inputs.max_messages_per_second }} 

      - name: Inform Port about SQS redrive success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ SQS queue with ARN ${{ inputs.source_queue }} redrived successfully
          summary: SQS queue redrive completed successfully

      - name: Inform Port about SQS queue redrive failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to redrive SQS queue with ARN ${{ inputs.source_queue }}
          summary: SQS queue redrive failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Redrive DLQ messages action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "redrive_queue",
      "title": "Redrive Queue",
      "icon": "SNS",
      "description": "Start an asynchronous task to move messages from a source queue to a destination queue",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "destination_queue": {
              "type": "string",
              "title": "Destination Queue",
              "blueprint": "sqs",
              "format": "entity"
            },
            "max_messages_per_second": {
              "type": "number",
              "title": "Max Messages Per Second",
              "default": 100,
              "maximum": 500
            }
          },
          "required": [],
          "order": [
            "destination_queue",
            "max_messages_per_second"
          ]
        },
        "blueprintIdentifier": "sqs"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "redrive-queue.yaml",
        "workflowInputs": {
          "port_context": {
            "runId": "{{ .run.id }}"
          },
          "source_queue": "{{ .entity.properties.arn }}",
          "destination_queue": "{{ .inputs.destination_queue.properties.arn }}",
          "max_messages_per_second": "{{ .inputs.max_messages_per_second }}"
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Redrive DLQ Messages` action in the self-service page. 🎉


### Delete an SQS queue

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/delete-queue.yaml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>
<summary><b>Delete SQS Queue GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Delete SQS Queue

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string

jobs:
  delete-queue:
    runs-on: ubuntu-latest
    steps:
      - name: Inform Port of workflow start
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Configuring AWS credentials to delete SQS queue with Name ${{ fromJson(inputs.port_context).entity.title }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: delete SQS queue
        run: aws sqs delete-queue --queue-url ${{ fromJson(inputs.port_context).entity.properties.link }}

      - name: Inform Port about SQS queue delete success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ SQS queue with URL ${{ fromJson(inputs.port_context).entity.properties.link }} deleted successfully
          summary: SQS queue delete completed successfully

      - name: Inform Port about SQS queue delete failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to delete SQS queue with URL ${{ fromJson(inputs.port_context).entity.properties.link }}
          summary: SQS queue delete failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Delete SQS queue action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "delete_queue",
      "title": "Delete Queue",
      "icon": "SNS",
      "description": "Delete an SQS queue",
      "trigger": {
        "type": "self-service",
        "operation": "DELETE",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "blueprintIdentifier": "sqs"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "delete-queue.yaml",
        "workflowInputs": {
          "{{ spreadValue() }}": "{{ .inputs }}",
          "port_context": {
            "runId": "{{ .run.id }}",
            "entity": "{{ .entity }}"
          }
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Delete SQS Queue` action in the self-service page. 🎉


## Visualize metrics

With your data and actions in place, we can create a dedicated dashboard in Port to visualize all SQS queues by type, encryption, or DLQ status using customizable widgets. In addition, we can trigger actions (purge, redrive, delete) directly from the dashboard.

### Create a dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **SQS Management**.
5. Input `Purge, redrive or delete SQS queues` under **Description**.
6. Select the `AWS` icon.
7. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize insights from our AWS SQS queues.

### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Total queues (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Total queues` (add the `AWS` icon).
3. Select `Count entities` **Chart type** and choose **SQS Queue** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Select `custom` as the **Unit** and input `queues` as the **Custom unit**
   <img src="/img/guides/totalSQSQueues.png" width="50%"/>

6. Click `Save`.

</details>

<details>
<summary><b>Queues with DLQ (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Queues with DLQ`.
3. Select `Count entities` **Chart type** and choose **SQS Queue** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Add this JSON to the **Additional filters** editor to filter queues with DLQ configuration:
    ```json showLineNumbers
    [
        {
            "combinator":"and",
            "rules":[
                {
                    "property":"dlqRedrivePolicy",
                    "operator":"isNotEmpty"
                }
            ]
        }
    ]
    ```
6. Select `custom` as the **Unit** and input `queues` as the **Custom unit**
   <img src="/img/guides/SQSQueueWithDLQ.png" width="50%"/>

7. Click `Save`.

</details>

<details>
<summary><b>Queues by encryption (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Queues by encryption` (add the `Pie` icon).
3. Choose the **SQS Queue** blueprint.
4. Under `Breakdown by property`, select the **SSE Enabled** property
   <img src="/img/guides/sqsByEncryption.png" width="50%" />

5. Click **Save**.

</details>

<details>
<summary><b>SQS queues view (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **All Queues**.
3. Choose the **SQS Queue** blueprint

   <img src="/img/guides/allSQSQueues.png" width="50%" />

4. Click **Save** to add the widget to the dashboard.
5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
6. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Link**: The link to the queue.
    - **SSE Enabled**: Whether or not the queue has server side encryption (SSE) enabled.
    - **Message Rention Period**: The message rention period of the queue.
    - **Account**: The name of each related AWS account.
7. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>
