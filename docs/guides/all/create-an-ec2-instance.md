---
sidebar_position: 2
displayed_sidebar: null
description: Learn how to create an EC2 instance in Port with this step-by-step guide, enabling scalable cloud infrastructure setup.
---

import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'
import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'

# Create An AWS EC2 Instance

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

## Overview

In the following guide, you are going to create a self-service action in Port that executes a [GitHub workflow](/actions-and-automations/setup-backend/github-workflow/github-workflow.md) to create an EC2 Instance in AWS using Terraform templates.

## Prerequisites
1. A GitHub repository to contain your action resources i.e. the github workflow file.

2. An AWS Account or IAM user with permission to create access keys. [Learn more](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)

3. An SSH Key Pair to connect with the provisioned instance. [Learn more](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/create-key-pairs.html#having-ec2-create-your-key-pair)

4. Install the Ports GitHub app from [here](https://github.com/apps/getport-io/installations/new).

5. In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
    * `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
    * `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
    * `TF_USER_AWS_KEY` - An aws access key with the right iam permission to create an ec2 instance [learn more](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)
    * `TF_USER_AWS_SECRET` - An aws access key secret with permission to create an ec2 instance [learn more](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)
    * `TF_USER_AWS_REGION` - The aws region where you would like to provision your ec2 instance.

6. Create a <PortTooltip id="blueprint">blueprint</PortTooltip> in Port for the EC2 Instance.

<details>
   <summary><b>EC2 Instance Blueprint</b></summary>

```json showLineNumbers
{
  "identifier": "ec2Instance",
  "description": "This blueprint represents an AWS EC2 instance in our software catalog.",
  "title": "EC2 Instance",
  "icon": "EC2",
  "schema": {
    "properties": {
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
      "public_ip": {
        "type": "string",
        "title": "Public IP Address",
        "description": "The public IP address assigned to the EC2 instance."
      },
      "private_dns": {
        "type": "string",
        "title": "Private DNS",
        "description": "The private DNS name assigned to the EC2 instance within its VPC."
      },
      "private_ip": {
        "type": "string",
        "title": "Private IP Address",
        "description": "The private IP address assigned to the EC2 instance within its VPC."
      },
      "monitoring": {
        "type": "boolean",
        "title": "Monitoring",
        "description": "Indicates if detailed monitoring is enabled for the EC2 instance."
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

## GitHub Workflow

1. Create a folder in a directory of your choice within your github repository to host the terraform template files.

2. Create the following terraform templates ( `main.tf`, `variables.tf` and `outputs.tf` ) within the created folder.

<GithubDedicatedRepoHint/>

<details>
  <summary><b>main.tf</b></summary>

```hcl showLineNumbers title="main.tf"
data "aws_ami" "ubuntu" {
    most_recent = true

    filter {
        name   = "name"
        values = ["ubuntu/images/hvm-ssd/*20.04-amd64-server-*"]
    }

    filter {
        name   = "virtualization-type"
        values = ["hvm"]
    }
    
    owners = ["099720109477"] # Canonical
}

provider "aws" {
  region  = var.aws_region
}

resource "aws_instance" "app_server" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.ec2_instance_type
  key_name      = var.pem_key_name

  tags = {
    Name = var.ec2_name
  }
}

```
</details>

<details>
  <summary><b>variables.tf</b></summary>

```hcl showLineNumbers title = "variables.tf"
variable "ec2_name" {
  type = string
}

variable "pem_key_name" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "ec2_instance_type" {
  type = string
}
```
</details>

<details>
  <summary><b>outputs.tf</b></summary>

```hcl showLineNumbers title="outputs.tf"

output "instance_id" {
  description = "The unique identifier for the provisioned EC2 instance."
  value       = aws_instance.app_server.id
}

output "instance_state" {
  description = "The state of the EC2 instance (e.g., running, stopped)."
  value       = aws_instance.app_server.instance_state
}

output "instance_type" {
  description = "The type of EC2 instance (e.g., t2.micro, m5.large)."
  value       = aws_instance.app_server.instance_type
}

output "availability_zone" {
  description = "The Availability Zone where the EC2 instance is deployed."
  value       = aws_instance.app_server.availability_zone
}

output "public_dns" {
  description = "The public DNS name assigned to the EC2 instance."
  value       = aws_instance.app_server.public_dns
}

output "public_ip" {
  description = "The public IP address assigned to the EC2 instance."
  value       = aws_instance.app_server.public_ip
}

output "private_dns" {
  description = "The private DNS name assigned to the EC2 instance within its VPC."
  value       = aws_instance.app_server.private_dns
}

output "private_ip" {
  description = "The private IP address assigned to the EC2 instance within its VPC."
  value       = aws_instance.app_server.private_ip
}

output "monitoring" {
  description = "Indicates if detailed monitoring is enabled for the EC2 instance."
  value       = aws_instance.app_server.monitoring
}

output "security_group_ids" {
  description = "The list of security group IDs assigned to the EC2 instance."
  value       = aws_instance.app_server.vpc_security_group_ids
}

output "key_name" {
  description = "The name of the key pair associated with the EC2 instance."
  value       = aws_instance.app_server.key_name
}

output "subnet_id" {
  description = "The ID of the subnet to which the instance is attached."
  value       = aws_instance.app_server.subnet_id
}

output "tags" {
  description = "A map of tags assigned to the resource."
  value       = aws_instance.app_server.tags
}
```
</details>


3. Create a `Github Workflow` file under `.github/workflows/create-an-ec2-instance.yaml` with the following content:

<details>
<summary><b>GitHub workflow</b></summary>

:::tip 
  Replace `<TERRAFORM-TEMPLATE-DIR>` with the directory created to host your terraform templates.
:::

```yml showLineNumbers title="create-an-ec2-instance.yaml"
name: Provision AN EC2 Instance

on:
  workflow_dispatch:
    inputs:
      ec2_name:
        description: EC2 name
        required: true
        default: 'App Server'
        type: string
      ec2_instance_type:
        description: EC2 instance type
        required: false
        default: "t3.micro"
        type: string
      pem_key_name:
        description: EC2 pem key
        required: true
        type: string
      port_context:
        required: true
        description: includes blueprint, run ID, and entity identifier from Port.
jobs:
  provision-ec2:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v3
        with:
          node-version: '14'

      - name: Log starting of EC2 Instance creation 
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).rund_id }}
          logMessage: |
              About to create ec2 instance ${{ github.event.inputs.ec2_name }} .. ⛴️

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: '${{ secrets.TF_USER_AWS_KEY }}'
          aws-secret-access-key: '${{ secrets.TF_USER_AWS_SECRET }}'
          aws-region: '${{ secrets.TF_USER_AWS_REGION }}'

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_wrapper: false
          
      - name: Terraform Apply
        id:   apply
        env:
          TF_VAR_ec2_name:  "${{ github.event.inputs.ec2_name }}"
          TF_VAR_pem_key_name: "${{ github.event.inputs.pem_key_name}}"
          TF_VAR_aws_region: "${{ secrets.TF_USER_AWS_REGION }}"
          TF_VAR_ec2_instance_type: "${{ github.event.inputs.ec2_instance_type}}"
        run: |
          cd <TERRAFORM-TEMPLATE-DIR>
          terraform init
          terraform validate
          terraform plan 
          terraform apply -auto-approve

      - name: Set Outputs
        id: set_outputs
        run: |
          cd <TERRAFORM-TEMPLATE-DIR>
          echo "instance_id=$(terraform output -raw instance_id)" >> $GITHUB_ENV
          echo "instance_state=$(terraform output -raw instance_state)" >> $GITHUB_ENV
          echo "instance_type=$(terraform output -raw instance_type)" >> $GITHUB_ENV
          echo "availability_zone=$(terraform output -raw availability_zone)" >> $GITHUB_ENV
          echo "public_dns=$(terraform output -raw public_dns)" >> $GITHUB_ENV
          echo "public_ip=$(terraform output -raw public_ip)" >> $GITHUB_ENV
          echo "private_dns=$(terraform output -raw private_dns)" >> $GITHUB_ENV
          echo "private_ip=$(terraform output -raw private_ip)" >> $GITHUB_ENV
          echo "monitoring=$(terraform output -raw monitoring)" >> $GITHUB_ENV
          security_group_ids_json=$(terraform output -json security_group_ids | jq -c .)
          echo "security_group_ids=$security_group_ids_json" >> $GITHUB_ENV
          echo "key_name=$(terraform output -raw key_name)" >> $GITHUB_ENV
          echo "subnet_id=$(terraform output -raw subnet_id)" >> $GITHUB_ENV
          tags=$(terraform output -json tags | jq -c .)
          echo "tags=$tags" >> $GITHUB_ENV

      - name: Create a log message
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).rund_id }}
          logMessage: |
              EC2 Instance created successfully ✅

     - name: Report Created Instance to Port
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).rund_id }}
          logMessage: "Upserting created EC2 Instance to Port ... "
          
      - name: UPSERT EC2 Instance Entity
        uses: port-labs/port-github-action@v1
        with:
          identifier: "${{ steps.display_outputs.outputs.instance_id }}"
          title: "${{ inputs.ec2_name }}"
          blueprint: ${{ fromJson(inputs.port_context).blueprint }}
          properties: |-
            {
              "instance_state": "${{ env.instance_state }}",
              "instance_type": "${{ env.instance_type }}",
              "availability_zone": "${{ env.availability_zone }}",
              "public_dns": "${{ env.public_dns }}",
              "public_ip": "${{ env.public_ip }}",
              "private_dns": "${{ env.private_dns }}",
              "private_ip": "${{ env.private_ip }}",
              "monitoring": ${{ env.monitoring }},
              "security_group_ids": ${{ env.security_group_ids }},
              "key_name": "${{ env.key_name }}",
              "subnet_id": "${{ env.subnet_id }}",
              "tags": ${{ env.tags }}
            }
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: UPSERT
          runId: ${{ fromJson(inputs.port_context).rund_id }}

      - name: Log After Upserting Entity
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).rund_id }}
          logMessage: "Entity upserting was successful ✅"
```
</details>

## Port Configuration

1. Create the Port action on the `ec2Instance` blueprint:
    - Head to the [self-service](https://app.getport.io/self-serve) page.
    - Click on the `+ New Action` button.
    - Click on the `{...} Edit JSON` button.
    - Copy and paste the following JSON configuration into the editor:


<details>
  <summary> <b> Port Action: Create An EC2 Instance </b> </summary>

<GithubActionModificationHint/>

```json showLineNumbers
{
  "identifier": "create_ec2_instance",
  "title": "Create Instance",
  "icon": "EC2",
  "description": "Create An EC2 Instance from Port",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "pem_key_name": {
          "title": "Pem Key Name",
          "description": "EC2 .pem key pair name",
          "icon": "EC2",
          "type": "string"
        },
        "ec2_name": {
          "icon": "EC2",
          "title": "EC2_Name",
          "description": "Name of the instance",
          "type": "string"
        },
        "ec2_instance_type": {
          "title": "EC2 Instance Type",
          "description": "EC2 instance type",
          "icon": "EC2",
          "type": "string",
          "default": "t2.micro",
          "enum": [
            "t2.micro",
            "t2.medium",
            "t2.large",
            "t2.xlarge",
            "t2.2xlarge"
          ]
        }
      },
      "required": [
        "ec2_name",
        "pem_key_name"
      ],
      "order": [
        "ec2_name",
        "ec2_instance_type",
        "pem_key_name"
      ]
    },
    "blueprintIdentifier": "ec2Instance"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB_ORG>",
    "repo": "<GITHUB_REPO>",
    "workflow": "create-ec2-instance.yaml",
    "workflowInputs": {
      "pem_key_name": "{{.inputs.\"pem_key_name\"}}",
      "ec2_name": "{{.inputs.\"ec2_name\"}}",
      "ec2_instance_type": "{{.inputs.\"ec2_instance_type\"}}",
      "port_context": {
        "blueprint": "{{.action.blueprint}}",
        "entity": "{{.entity.identifier}}",
        "run_id": "{{.run.id}}",
        "relations": "{{.entity.relations}}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```
</details>

## Let's test it!

1. Head to the [Self Service hub](https://app.getport.io/self-serve)
2. Click on the `Create An EC2 Instance` action
3. Fill the pop-up form with details of the EC2 Instance you wish to create
5. Click on `Execute`
6. Wait for the EC2 Instance to be created in AWS
