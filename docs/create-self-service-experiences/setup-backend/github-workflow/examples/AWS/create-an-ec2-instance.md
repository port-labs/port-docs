---
sidebar_position: 2
---

# Create An AWS EC2 Instance

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

In the following guide, you are going to create a self-service action in Port that executes a [GitHub workflow](/create-self-service-experiences/setup-backend/github-workflow/github-workflow.md) to create an EC2 Instance in AWS using Terraform templates.

## Prerequisites

1. Create the following GitHub Action secrets:
    * Create the following Port credentials:
        * `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
        * `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
        * Install the Ports GitHub app from [here](https://github.com/apps/getport-io/installations/new).
    
    * Create the following AWS Cloud credentials:   
        :::tip Follow this [guide](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/create-key-pairs.html#having-ec2-create-your-key-pair) to create an SSH key pair to connect with the provisioned instance.
        :::
        * `TF_USER_AWS_KEY` - an aws access key with the right iam permission to create an ec2 instance [learn more](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)
        * `TF_USER_AWS_SECRET` - an aws access key secret with permission to create an ec2 instance [learn more](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)
        * `TF_USER_AWS_REGION` - the aws region where you would like to provision your ec2 instance.

## Steps

1. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).

2. Create a <PortTooltip id="blueprint">blueprint</PortTooltip> in Port for EC2 Instance
<details>
   <summary>Port Blueprint: EC2 Instance</summary>

```json showLineNumbers

{
  "identifier": "ec2Instance",
  "description": "This blueprint represents an AWS EC2 instance in our software catalog",
  "title": "EC2 Instance",
  "icon": "EC2",
  "schema": {
    "properties": {
      "architecture": {
        "type": "string",
        "title": "Architecture",
        "enum": ["i386", "x86_64", "arm64", "x86_64_mac", "arm64_mac"]
      },
      "availabilityZone": {
        "type": "string",
        "title": "Availability Zone"
      },
      "link": {
        "type": "string",
        "title": "Link",
        "format": "url"
      },
      "platform": {
        "type": "string",
        "title": "Platform"
      },
      "state": {
        "type": "string",
        "title": "State",
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
      "tags": {
        "type": "array",
        "title": "Tags"
      },
      "type": {
        "type": "string",
        "title": "Instance Type"
      },
      "vpcId": {
        "type": "string",
        "title": "VPC ID"
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

3. Create a Port action in the [self-service page](https://app.getport.io/self-serve) or with the following JSON definition for the `EC2 Instance` blueprint:

<details>
  <summary>Port Action: Create EC2 Instance</summary>
   :::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::

```json showLineNumbers
[
{
  "identifier": "create_an_ec_2_instance",
  "title": "Create An EC2 Instance",
  "icon": "EC2",
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
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB-ORG>",
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "create-ec2-instance.yaml",
    "omitUserInputs": false,
    "omitPayload": false,
    "reportWorkflowStatus": true
  },
  "trigger": "CREATE",
  "description": "Create An EC2 Instance from Port",
  "requiredApproval": false
}
]
```
</details>

4. Create a workflow file under .github/workflows/create-an-ec2-instance.yaml with the following content:

<details>
<summary>GitHub workflow script</summary>

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
      port_payload:
        required: true
        type: string
jobs:
  provision-ec2:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '14'

      - name: Log starting of EC2 Instance creation 
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
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
          cd terraform
          terraform init
          terraform validate
          terraform plan 
          terraform apply -auto-approve

      - name: Create a log message
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
          logMessage: |
              EC2 Instance created successfully ✅

```
</details>

5. Create the following terraform templates ( main.tf and variables.tf ) in `terraform` folder at the root of your GitHub repository:

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

6. Trigger the action from Port's [Self Serve](https://app.getport.io/self-serve)

Congrats 🎉 You've created your instance in EC2 from Port!