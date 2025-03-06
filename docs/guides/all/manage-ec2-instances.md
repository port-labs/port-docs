---
sidebar_position: 3
displayed_sidebar: null
description: Learn how to manage EC2 instances in Port, ensuring optimal performance and efficient cloud resource management.
---

# Manage An AWS EC2 Instance

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

In the following guide, you are going to create self-service actions in Port that execute a [GitHub workflow](/actions-and-automations/setup-backend/github-workflow/github-workflow.md) to manage an EC2 instance in the following ways:
1. Terminate an Instance
2. Reboot an instance
3. Resize an Autoscaling Group

## Prerequisites

1. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).
2. Use the Port AWS exporter to ingest [AWS EC2 instances](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-exporter/examples/#ec2-instances) and [autoscaling groups](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-exporter/examples/#auto-scaling-group) into Port to create the blueprints and entities.

:::tip
Using the Port AWS exporter
The Port AWS exporter supports ingesting different AWS resource types. For the sake of this guide, you may run the following command in the [installation](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-exporter/installation#terraform-installation-recommended) step to only ingest relevant resources:

```bash
terraform apply -var 'resources=["ec2_instance", "autoscaling_group"]'
```

:::

3.  Create the following GitHub Action secrets:
    _ Port credentials:
    _ `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token) \* `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)

        * AWS Cloud credentials:
            - `AWS_ACCESS_KEY_ID`: Your AWS access key.
            - `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key.
            - `AWS_REGION` - the aws region which contains your ec2 instances.

## Terminating an Instance

1. Create the Port action on the `ec2Instance` blueprint: - Head to the [self-service](https://app.getport.io/self-serve) page. - Click on the `+ New Action` button. - Click on the `{...} Edit JSON` button. - Copy and paste the following JSON configuration into the editor:
<details>
  <summary>Port Action: Terminate EC2 Instance</summary>
   :::tip

- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
  :::

```json showLineNumbers
{
  "identifier": "terminate_ec2_instance",
  "title": "Terminate Instance",
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
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "terminate-instance.yml",
    "workflowInputs": {
      "port_context": {
        "entity": "{{ .entity }}",
        "blueprint": "{{ .action.blueprint }}",
        "runId": "{{ .run.id }}",
        "trigger": "{{ .trigger }}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```

</details>

2. Create a workflow file under `.github/workflows/terminate-instance.yaml` with the following content:

<details>
<summary>GitHub workflow script</summary>

```yml showLineNumbers title="terminate-instance.yaml"
name: Terminate EC2 Instance

on:
  workflow_dispatch: # Trigger this workflow manually
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, run id, etc...)'
        type: string

jobs:
  terminate-instance:
    runs-on: ubuntu-latest
    steps:
      - name: Create a log message
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Configuring AWS credentials and terminating EC2 instance with ID ${{ fromJson(inputs.port_context).entity.identifier }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Terminate EC2 instance
        run: aws ec2 terminate-instances --instance-ids ${{ fromJson(inputs.port_context).entity.identifier }}

      - name: Create a log message
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          status: 'SUCCESS'
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: EC2 instance with ID ${{ fromJson(inputs.port_context).entity.identifier }} terminated successfully
```

</details>

3. Trigger the action from Port's [self-service](https://app.getport.io/self-serve) page or from the context menu of an EC2 entity.

## Rebooting an Instance

1. Create the Port action on the `ec2Instance` blueprint: - Head to the [self-service](https://app.getport.io/self-serve) page. - Click on the `+ New Action` button. - Click on the `{...} Edit JSON` button. - Copy and paste the following JSON configuration into the editor:
<details>
  <summary>Port Action: Reboot EC2 Instance</summary>
   :::tip

- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
  :::

```json showLineNumbers
{
  "identifier": "reboot_ec2_instance",
  "title": "Reboot Instance",
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
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "reboot-instance.yml",
    "workflowInputs": {
      "port_context": {
        "entity": "{{ .entity }}",
        "blueprint": "{{ .action.blueprint }}",
        "runId": "{{ .run.id }}",
        "trigger": "{{ .trigger }}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false 
}
```

</details>

2. Create a workflow file under `.github/workflows/reboot-instance.yaml` with the following content:

<details>
<summary>GitHub workflow script</summary>

```yml showLineNumbers title="reboot-instance.yaml"
name: Reboot EC2 Instance

on:
  workflow_dispatch: # Trigger this workflow manually
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, run id, etc...)'
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
          logMessage: Configuring AWS credentials and reboot EC2 instance with ID ${{ fromJson(inputs.port_context).entity.identifier }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Reboot EC2 instance
        run: aws ec2 reboot-instances --instance-ids ${{ fromJson(inputs.port_context).entity.identifier }}

      - name: Inform Port about status of rebooting EC2 instance
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          status: 'SUCCESS'
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: EC2 instance with ID ${{ fromJson(inputs.port_context).entity.identifier }} rebooted successfully
```

</details>

3. Trigger the action from Port's [self-service](https://app.getport.io/self-serve) page or from the context menu of an EC2 entity.

## Resize Autoscaling Group

1. Create the Port action on the `Autoscaling Group` blueprint:
   - Head to the [self-service](https://app.getport.io/self-serve) page.
   - Click on the `+ New Action` button.
   - Click on the `{...} Edit JSON` button.
   - Copy and paste the following JSON configuration into the editor:

<details>
  <summary>Port Action: Resize Autoscaling Group</summary>
   :::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::

```json showLineNumbers
{
  "identifier": "awsAutoScalingGroup_resize_autoscaling_group",
  "title": "Resize Autoscaling Group",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "minimum_capacity": {
          "icon": "DefaultProperty",
          "title": "Minimum Capacity",
          "description": "Minimum number of instances",
          "type": "number",
          "default": 1,
          "minimum": 0
        },
        "maximum_capacity": {
          "icon": "DefaultProperty",
          "title": "Maximum Capacity",
          "type": "number",
          "default": 1,
          "minimum": 1
        },
        "desired_capacity": {
          "title": "Desired Capacity",
          "type": "number",
          "default": 1
        }
      },
      "required": ["desired_capacity", "maximum_capacity", "minimum_capacity"],
      "order": ["minimum_capacity", "maximum_capacity", "desired_capacity"]
    },
    "blueprintIdentifier": "awsAutoScalingGroup"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB-ORG>",
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "resize-asg.yml",
    "workflowInputs": {
      "minimum_capacity": "{{.inputs.\"minimum_capacity\"}}",
      "maximum_capacity": "{{.inputs.\"maximum_capacity\"}}",
      "desired_capacity": "{{.inputs.\"desired_capacity\"}}",
      "port_context": {
        "entity": "{{ .entity }}",
        "blueprint": "{{ .action.blueprint }}",
        "runId": "{{ .run.id }}",
        "trigger": "{{ .trigger }}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```

</details>

<center>
<img src='/img/self-service-actions/setup-backend/github-workflow/examples/manageAutoGroupForming.png' width='45%' border='1px' />
</center>

<img src='/img/self-service-actions/setup-backend/github-workflow/examples/manageAutoGroupEdit.png' width='100%' border='1px' />
<br />
<br />

2. Create a workflow file under `.github/workflows/resize-asg.yaml` with the following content:

<details>
<summary>GitHub workflow script</summary>

```yml showLineNumbers title="resize-asg.yaml"
name: Resize Autoscaling Group

on:
  workflow_dispatch:
    inputs:
      desired_capacity:
        description: 'New desired capacity'
        required: true
      minimum_capacity:
        description: 'Minimum size of the Auto Scaling Group'
        required: true
      maximum_capacity:
        description: 'Maximum size of the Auto Scaling Group'
        required: true
      port_context:
        required: true
        description: 'Action and general context (blueprint, run id, etc...)'
        type: string

jobs:
  resize-asg:
    runs-on: ubuntu-latest
    steps:
      - name: Inform Port about workflow start
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Configuring AWS credentials

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Resize Auto Scaling Group
        run: |
          aws autoscaling update-auto-scaling-group \
              --auto-scaling-group-name ${{ fromJson(inputs.port_context).entity.title }} \
              --desired-capacity ${{ github.event.inputs.desired_capacity }} \
              --min-size ${{ github.event.inputs.minimum_capacity }} \
              --max-size ${{ github.event.inputs.maximum_capacity }}

      - name: Inform Port about status of autoscaling group
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          status: 'SUCCESS'
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Resized EC2 Auto Scaling Group ${{ fromJson(inputs.port_context).entity.title }} to ${{ github.event.inputs.desired_capacity }} instances
```

</details>

3. Trigger the action from Port's [self-service](https://app.getport.io/self-serve) page or from the context menu of an Auto Scaling Group entity.

<img src='/img/self-service-actions/setup-backend/github-workflow/examples/manageAutoGroupTest.png' width='100%' border='1px' />
