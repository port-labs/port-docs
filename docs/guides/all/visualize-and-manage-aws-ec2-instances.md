---
displayed_sidebar: null
description: Learn how to monitor and manage your AWS EC2 instances using dashboards and self-service actions in Port.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Visualize and manage your EC2 instances

This guide demonstrates how to bring your AWS EC2 management experience into Port. You will learn how to:

- Ingest EC2 data into Port's software catalog using **Port's AWS** integration.
- Set up **self-service actions** to manage EC2 instances (start, reboot, and terminate).
- Build **dashboards** in Port to monitor and take action on your EC2 resources.

<img src="/img/guides/ec2Dashboard1.png" border="1px" width="100%" />
<img src="/img/guides/ec2Dashboard2.png" border="1px" width="100%" />


## Common use cases

- Monitor the status and health of all EC2 instances across accounts from a single dashboard.
- Empower platform teams to automate day-2 operations via GitHub workflows.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [AWS integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/) is installed in your account.


## Set up data model

When installing the AWS integration in Port, the `AWS Account` blueprint is created by default.  
However, the `EC2 Instance` blueprint is not created automatically so we will need to create it manually.

### Create the EC2 instance blueprint

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:
    <details>
    <summary><b>AWS EC2 Instance blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "ec2Instance",
      "description": "This blueprint represents an AWS EC2 instance in our software catalog",
      "title": "EC2 Instance",
      "icon": "EC2",
      "schema": {
        "properties": {
          "monitoring": {
            "type": "boolean",
            "title": "Monitoring",
            "description": "Indicates if detailed monitoring is enabled for the EC2 instance."
          },
          "instance_state": {
            "type": "string",
            "title": "Instance State",
            "description": "The state of the EC2 instance (e.g., running, stopped).",
            "enum": [
              "pending",
              "running",
              "shutting-down",
              "terminated",
              "stopping",
              "stopped"
            ],
            "enumColors": {
              "pending": "yellow",
              "running": "green",
              "shutting-down": "pink",
              "stopped": "purple",
              "stopping": "orange",
              "terminated": "red"
            }
          },
          "instance_type": {
            "type": "string",
            "title": "Instance Type",
            "description": "The type of EC2 instance (e.g., t2.micro, m5.large)."
          },
          "availability_zone": {
            "type": "string",
            "title": "Availability Zone",
            "description": "The Availability Zone where the EC2 instance is deployed."
          },
          "public_dns": {
            "type": "string",
            "title": "Public DNS",
            "description": "The public DNS name assigned to the EC2 instance."
          },
          "private_dns": {
            "type": "string",
            "title": "Private DNS",
            "description": "The private DNS name assigned to the EC2 instance within its VPC."
          },
          "security_group_ids": {
            "type": "array",
            "title": "Security Group IDs",
            "description": "The list of security group IDs assigned to the EC2 instance."
          },
          "key_name": {
            "type": "string",
            "title": "Key Name",
            "description": "The name of the key pair associated with the EC2 instance."
          },
          "image": {
            "type": "string",
            "title": "Image ID",
            "description": "The image ID of the EC2 instance."
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
          "required": false,
          "many": false
        }
      }
    }
    ```
    </details>

5. Click `Save` to create the blueprint.


## Update the integration mapping

1. Go to the [Data Sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Select the AWS integration.
3. Add the following YAML block into the editor to ingest ec2 instances from your AWS account:

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
      - kind: AWS::EC2::Instance
        selector:
          query: 'true'
          useGetResourceAPI: true
        port:
          entity:
            mappings:
              identifier: .Identifier
              title: (.Properties.Tags[]? | select(.Key == "Name") | .Value | tostring) // .Identifier
              blueprint: '"ec2Instance"'
              properties:
                instance_state: .Properties.State.Name
                image: .Properties.ImageId
                availability_zone: .Properties.AvailabilityZone
                tags: .Properties.Tags
                instance_type: .Properties.InstanceType
                public_dns: .Properties.PublicDnsName
                private_dns: .Properties.PrivateDnsName
                security_group_ids: .Properties.SecurityGroupIds
                monitoring: .Properties.Monitoring
                key_name: .Properties.KeyName
              relations:
                account: .__AccountId
    ```
    </details>
    
4. Click `Save & Resync` to apply the mapping.


## Set up self-service actions

Now let us create self-service actions to manage your EC2 instances directly from Port using GitHub Actions. You will implement workflows to:

1. Start an EC2 instance.

2. Reboot an EC2 instance.

3. Terminate an EC2 instance.

To implement these use-cases, follow the steps below:

<h3>Add GitHub secrets</h3>

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
- `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `AWS_ACCESS_KEY_ID` - AWS IAM user's access key.
- `AWS_SECRET_ACCESS_KEY` - AWS IAM user's secret access key.
- `AWS_REGION` - AWS region (e.g., `us-east-1`).


### Start an EC2 instance

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/start-instance.yaml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>
<summary><b>Start EC2 GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Start EC2 Instance

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string

jobs:
  start-instance:
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
          logMessage: Configuring AWS credentials to start EC2 instance with ID ${{ fromJson(inputs.port_context).entity.identifier }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Start EC2 instance
        run: aws ec2 start-instances --instance-ids ${{ fromJson(inputs.port_context).entity.identifier }}

      - name: Inform Port about EC2 start success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ EC2 instance with ID ${{ fromJson(inputs.port_context).entity.identifier }} started successfully
          summary: EC2 instance start completed successfully

      - name: Inform Port about EC2 start failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to start EC2 instance with ID ${{ fromJson(inputs.port_context).entity.identifier }}
          summary: EC2 instance start failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Start EC2 instance action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "start_ec2_instance",
      "title": "Start EC2 Instance",
      "icon": "EC2",
      "description": "Start an EC2 Instance",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {},
          "required": []
        },
        "blueprintIdentifier": "ec2Instance"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "start-instance.yaml",
        "workflowInputs": {
          "port_context": {
            "entity": "{{ .entity }}",
            "blueprint": "{{ .action.blueprint }}",
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

Now you should see the `Start EC2 Instance` action in the self-service page. 🎉


### Reboot an EC2 instance

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/reboot-instance.yaml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>
<summary><b>Reboot EC2 GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Reboot EC2 Instance

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string

jobs:
  reboot-instance:
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
          logMessage: Configuring AWS credentials to reboot EC2 instance with ID ${{ fromJson(inputs.port_context).entity.identifier }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Reboot EC2 instance
        run: aws ec2 reboot-instances --instance-ids ${{ fromJson(inputs.port_context).entity.identifier }}

      - name: Inform Port about EC2 reboot success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ EC2 instance with ID ${{ fromJson(inputs.port_context).entity.identifier }} rebooted successfully
          summary: EC2 instance reboot completed successfully

      - name: Inform Port about EC2 reboot failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to reboot EC2 instance with ID ${{ fromJson(inputs.port_context).entity.identifier }}
          summary: EC2 instance reboot failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Reboot EC2 instance action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "reboot_ec2_instance",
      "title": "Reboot EC2 Instance",
      "icon": "EC2",
      "description": "Reboot an EC2 Instance",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {},
          "required": []
        },
        "blueprintIdentifier": "ec2Instance"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "reboot-instance.yaml",
        "workflowInputs": {
          "port_context": {
            "entity": "{{ .entity }}",
            "blueprint": "{{ .action.blueprint }}",
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

Now you should see the `Reboot EC2 Instance` action in the self-service page. 🎉


### Terminate an EC2 instance

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/terminate-instance.yaml` in the `.github/workflows` folder of your repository.

<GithubDedicatedRepoHint/>

<details>
<summary><b>Terminate EC2 GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Terminate EC2 Instance

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string

jobs:
  terminate-instance:
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
          logMessage: Configuring AWS credentials to terminate EC2 instance with ID ${{ fromJson(inputs.port_context).entity.identifier }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Terminate EC2 instance
        run: aws ec2 terminate-instances --instance-ids ${{ fromJson(inputs.port_context).entity.identifier }}

      - name: Inform Port about EC2 terminate success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ EC2 instance with ID ${{ fromJson(inputs.port_context).entity.identifier }} terminated successfully
          summary: EC2 instance terminate completed successfully

      - name: Inform Port about EC2 terminate failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to terminate EC2 instance with ID ${{ fromJson(inputs.port_context).entity.identifier }}
          summary: EC2 instance terminate failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Start EC2 instance action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "terminate_ec2_instance",
      "title": "Terminate EC2 Instance",
      "icon": "EC2",
      "description": "Terminate an EC2 Instance",
      "trigger": {
        "type": "self-service",
        "operation": "DELETE",
        "userInputs": {
          "properties": {},
          "required": []
        },
        "blueprintIdentifier": "ec2Instance"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "terminate-instance.yaml",
        "workflowInputs": {
          "port_context": {
            "entity": "{{ .entity }}",
            "blueprint": "{{ .action.blueprint }}",
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

Now you should see the `Terminate EC2 Instance` action in the self-service page. 🎉


## Visualize metrics

With your data and actions in place, we can create a dedicated dashboard in Port to visualize all EC2 instances by state, type, or account using customizable widgets. In addition, we can trigger actions (start, reboot, terminate) directly from the dashboard.

### Create a dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **EC2 Management**.
5. Input `Start, stop or reboot your AWS EC2 instances` under **Description**.
6. Select the `EC2` icon.
7. Click `Create`.

We now have a blank dashboard where we can start adding widgets to visualize insights from our AWS EC2.

### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Instance by state (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Instance by state` (add the `EC2` icon).
3. Choose the **EC2 Instance** blueprint.
4. Under `Breakdown by property`, select the **Instance State** property
    <img src="/img/guides/ec2State.png" width="50%" />

5. Click **Save**.

</details>

<details>
<summary><b>Instance by type  (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Instance by type` (add the `EC2` icon).
3. Choose the **EC2 Instance** blueprint.
4. Under `Breakdown by property`, select the **Instance Type** property
   <img src="/img/guides/ec2ByType.png" width="50%" />

5. Click **Save**.

</details>

<details>
<summary><b>Total instances (click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Total instances` (add the `EC2` icon).
3. Select `Count entities` **Chart type** and choose **EC2 Instance** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Select `custom` as the **Unit** and input `instances` as the **Custom unit**
   <img src="/img/guides/totalEC2Instances.png" width="50%"/>

6. Click `Save`.

</details>

<details>
<summary><b>EC2 instances view (click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **All Instances**.
3. Choose the **EC2 Instance** blueprint

   <img src="/img/guides/allEC2Instances.png" width="50%" />

4. Click **Save** to add the widget to the dashboard.
5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
6. In the top right corner of the table, click on `Manage Properties` and add the following properties:
    - **Instance State**: The current state of the instance.
    - **Instance Type**: The instance type.
    - **Account**: The name of each related AWS account.
7. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>