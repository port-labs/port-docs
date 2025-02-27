---
sidebar_position: 2
displayed_sidebar: null
---

# Add a Disk to an AWS EC2 Instance

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

## Overview

In the following guide, you are going to create a self-service action in Port that executes a [GitLab pipeline](/actions-and-automations/setup-backend/gitlab-pipeline/) to add a disk to an EC2 Instance in AWS using Terraform templates.

:::tip Complementary guide
This guide complements the [Creating an EC2 Instance](/guides/all/create-an-ec2-instance-gitlab) guide.
:::

## Prerequisites
1. A Gitlab project to contain your action resources i.e. the gitlab pipeline file.

2. An AWS Account or IAM user with permission to create access keys. [Learn more](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)

3. An SSH Key Pair to connect with the provisioned instance. [Learn more](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/create-key-pairs.html#having-ec2-create-your-key-pair)

4. In your GitLab project, go to the `Settings` menu at the sidebar on the left, select `CI/CD` and create the following `Variables`:
    * `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
    * `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
    * `AWS_ACCESS_KEY_ID` - An aws access key with the right iam permission to create an ec2 instance [learn more](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)
    * `AWS_SECRET_ACCESS_KEY` - An aws access key secret with permission to create an ec2 instance [learn more](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)
    * `AWS_DEFAULT_REGION` - The aws region where you would like to provision your ec2 instances.


## GitLab Pipeline

1. Create a gitlab project to host the terraform template files and the `.gitlab-ci.yaml` file.

2. Create the terraform templates ( `main.tf`, `variables.tf` and `outputs.tf` ) at the root of your gitlab project.

<details>

:::tip Understanding EBS Device Names in AWS
When attaching an EBS volume to an EC2 instance, the `device_name` parameter has to be unique to the instance.  This name determines how the volume appears inside your instance. 

Valid names depend on your instance's operating system and virtualization type:
  - Linux (most instances): Typically start with `/dev/sd` and a letter (e.g., `/dev/sda`, `/dev/sdb`)
  - Linux (PV virtualization): `/dev/xvd` followed by a letter.
  - Windows: Often follow the format `\\.\PhysicalDriveN` (N represents a number).

This guide covers attaching a single EBS volume to an instance. To attach multiple volumes on a single EC2 instance, adjust the terraform code to ensure that it generates unique device names.
:::

  <summary><b>main.tf</b></summary>

```hcl showLineNumbers title="main.tf"
# Configure the providers
terraform {
  required_providers {
    port = {
      source  = "port-labs/port-labs"
      version = "~> 2.0.3"
    }
    aws = {
      source = "hashicorp/aws"
    }
  }

  required_version = ">= 1.1.0"
}


provider "aws" {
  region = var.aws_region
}

data "aws_instance" "entity" {
  instance_id = var.instance_id
}

resource "aws_ebs_volume" "new_volume" {
  availability_zone = data.aws_instance.entity.availability_zone
  size              = var.volume_size
  type              = var.volume_type

  tags = {
    Name = var.disk_name
  }
}

# Attach the EBS volume
resource "aws_volume_attachment" "new_volume" {
  // highlight-start
  device_name = "/dev/sdf"
  //highlight-end
  volume_id   = aws_ebs_volume.new_volume.id
  instance_id = var.instance_id
}
```
</details>

<details>
  <summary><b>variables.tf</b></summary>

```hcl showLineNumbers title = "variables.tf"
variable "aws_region" {
  type    = string
  default = "eu-west-1"
}

variable "port_run_id" {
  type = string
}

variable "instance_id" {
  type = string
}

variable "availability_zone" {
  type    = string
  default = "eu-west-1a"
}

variable "volume_size" {
  type = number
  default = 10
}

variable "volume_type" {
  type    = string
  default = "gp2"
}

variable "disk_name" {
  type = string
}
```
</details>

<details>
  <summary><b>outputs.tf</b></summary>

```hcl showLineNumbers title="outputs.tf"
output "ebs_volume_id" {
  description = "The ID of the created EBS volume"
  value       = aws_ebs_volume.new_volume.id
}
```
</details>

<br />

3. Create a `GitLab Workflow` file under `.gitlab-ci.yaml` with the following content:

<details>


<summary><b>GitLab workflow</b></summary>


```yml showLineNumbers title="gitlab-ci.yaml"
stages:
  - prerequisites
  - terraform
  - port-update

image:
  name: hashicorp/terraform:light
  entrypoint:
    - '/usr/bin/env'
    - 'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'

variables:
  AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
  AWS_SECRET_ACCESS_KEY : ${AWS_SECRET_ACCESS_KEY}
  AWS_DEFAULT_REGION: ${AWS_DEFAULT_REGION}
  PORT_CLIENT_ID: ${PORT_CLIENT_ID}
  PORT_CLIENT_SECRET: ${PORT_CLIENT_SECRET}

before_script:
  - rm -rf .terraform
  - export AWS_ACCESS_KEY=${AWS_ACCESS_KEY_ID}
  - export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
  - export AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}
 
fetch-port-access-token:
  stage: prerequisites
  except:
    - pushes
  before_script:
    - apk update
    - apk add --upgrade curl jq -q
  script:
    - |
      echo "Getting access token from Port API"
      accessToken=$(curl -X POST \
        -H 'Content-Type: application/json' \
        -d '{"clientId": "'"$PORT_CLIENT_ID"'", "clientSecret": "'"$PORT_CLIENT_SECRET"'"}' \
        -s 'https://api.getport.io/v1/auth/access_token' | jq -r '.accessToken')
  
      echo "ACCESS_TOKEN=$accessToken" >> data.env
      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.context.runId')
      instanceId=$(cat $TRIGGER_PAYLOAD | jq -r '.context.entity')
      
      echo "RUN_ID=$runId" >> data.env
      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $accessToken" \
        -d '{"message":"🏃‍♂️ Starting action to add a disk to the EC2 instance: '$instanceId'"}' \
        "https://api.getport.io/v1/actions/runs/$runId/logs"
      curl -X PATCH \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $accessToken" \
        -d '{"link":"'"$CI_PIPELINE_URL"'"}' \
        "https://api.getport.io/v1/actions/runs/$runId"
  artifacts:
    reports:
      dotenv: data.env

check-quota:
  stage: prerequisites
  image: registry.gitlab.com/gitlab-org/cloud-deploy/aws-base:latest
  except:
    - pushes
  needs:
    - job: fetch-port-access-token
      artifacts: true
  script:
    - |
      echo "Checking AWS quota for EBS storage..."
      EC2_COUNT=1

      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.context.runId')

      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"statusLabel": "Checking Quota", "message":"🔍 Checking AWS quota for storage..."}' \
        "https://api.getport.io/v1/actions/runs/$runId/logs"


      echo "All quotas are sufficient for deployment." 
  artifacts:
    reports:
      dotenv: data.env

apply:
  stage: terraform
  needs:
    - job: check-quota
      artifacts: true
  except:
    - pushes
  before_script:
    - apk update
    - apk add --upgrade curl jq -q
    - terraform --version
    - terraform init
    - export TF_VAR_instance_id=$(cat $TRIGGER_PAYLOAD | jq -r '.context.entity')
    - export TF_VAR_volume_size=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.size')
    - export TF_VAR_disk_name=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.disk_name')
    - export TF_VAR_availability_zone=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.entity.properties.availability_zone')
    - export TF_VAR_aws_region=${AWS_DEFAULT_REGION}
    - export TF_VAR_port_run_id=$(cat $TRIGGER_PAYLOAD | jq -r '.context.runId')
  script:
    - terraform validate
    - terraform plan -out="planfile"
    - | 
      disk_type_string=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.disk_type')
      disk_type=$(echo "$disk_type_string" | sed -n 's/.*(\([^)]*\)).*/\1/p')
      export TF_VAR_volume_type=$disk_type

      accessToken=$(curl -X POST \
        -H 'Content-Type: application/json' \
        -d '{"clientId": "'"$PORT_CLIENT_ID"'", "clientSecret": "'"$PORT_CLIENT_SECRET"'"}' \
        -s 'https://api.getport.io/v1/auth/access_token' | jq -r '.accessToken')
      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.context.runId')

      curl -X POST \
          -H 'Content-Type: application/json' \
          -H "Authorization: Bearer $accessToken" \
          -d '{"statusLabel": "Creating Volume", "message":"🚀 Creating and attaching the volume to the instance"}' \
          "https://api.getport.io/v1/actions/runs/$runId/logs"

      terraform apply -input=false "planfile"
      
      volumeId=$(terraform output -raw ebs_volume_id)

      echo "VOLUME_ID=$volumeId" >> data.env
      echo "Volume ID: $volumeId"

  artifacts:
    reports:
      dotenv: data.env

create-entity:
  stage: port-update
  needs:
    - job: apply
      artifacts: true
  except:
    - pushes
  before_script:
    - apk update
    - apk add --upgrade curl jq -q
  script:
    - |
      echo "Creating Port entity for the volume"
      accessToken=$(curl -X POST \
        -H 'Content-Type: application/json' \
        -d '{"clientId": "'"$PORT_CLIENT_ID"'", "clientSecret": "'"$PORT_CLIENT_SECRET"'"}' \
        -s 'https://api.getport.io/v1/auth/access_token' | jq -r '.accessToken')

      INSTANCE_ID=$(cat $TRIGGER_PAYLOAD | jq -r '.context.entity')
      BLUEPRINT=$(cat $TRIGGER_PAYLOAD | jq -r '.context.blueprint')
      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.context.runId')

      echo "INSTANCE_ID=${INSTANCE_ID}" >> data.env

      curl -X POST \
          -H 'Content-Type: application/json' \
          -H "Authorization: Bearer $accessToken" \
          -d '{"statusLabel": "Updating Entity", "message":"🚀 Updating the instance with the new disk definition!"}' \
          "https://api.getport.io/v1/actions/runs/$runId/logs"

      log='{"identifier": "'"$INSTANCE_ID"'", "properties": {"disks": ["'"$VOLUME_ID"'"]}}'

      echo "VOLUME_ID=$VOLUME_ID" >> data.env

      curl --location --request PATCH "https://api.getport.io/v1/blueprints/$BLUEPRINT/entities/$INSTANCE_ID?create_missing_related_entities=false&run_id=$runId" \
        -H "Authorization: Bearer $accessToken" \
        -H "Content-Type: application/json" \
        -d "$log"

update-run-status:
  stage: port-update
  needs:
    - job: create-entity
      artifacts: true
  except:
    - pushes
  before_script:
    - apk update
    - apk add --upgrade curl jq -q
  script:
    - |
      echo "Updating Port action run status and final logs"
      accessToken=$(curl -X POST \
        -H 'Content-Type: application/json' \
        -d '{"clientId": "'"$PORT_CLIENT_ID"'", "clientSecret": "'"$PORT_CLIENT_SECRET"'"}' \
        -s 'https://api.getport.io/v1/auth/access_token' | jq -r '.accessToken')
      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.context.runId')

      INSTANCE_ID=$(cat $TRIGGER_PAYLOAD | jq -r '.context.entity')

      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $accessToken" \
        -d '{"terminationStatus":"SUCCESS", "message":"✅ Added the volume '"$VOLUME_ID"' successfully to 🔗 Instance ID: '"$INSTANCE_ID"'!"}' \
        "https://api.getport.io/v1/actions/runs/$runId/logs"
```
</details>


## Port Configuration

1. Head over to the [Builder](https://app.getport.io/settings/data-model) page to create the following <PortTooltip id="blueprint">blueprint</PortTooltip>:
    - Click on the `+ Blueprint` button.
    - Click on the `{...} Edit JSON` button.
    - Copy and paste the following JSON configuration into the editor.
    - Click Save.

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

<br />


2. To create the Port action, go to the [self-service page](https://app.getport.io/self-serve):
    - Click on the `+ New Action` button.
    - Choose the `EC2 Instance` blueprint and click `Next`.
    - Click on the `{...} Edit JSON` button.
    - Copy and paste the following JSON configuration into the editor.

<details>
  <summary> <b> Port Action: Add Disk </b> </summary>
:::tip modification required

- `<PROJECT_ID>` - your project ID.
- `<PIPELINE_TRIGGER_TOKEN>` - your pipeline trigger token. Learn [more](https://docs.gitlab.com/ee/ci/triggers/#create-a-pipeline-trigger-token).
:::

```json showLineNumbers
{
  "identifier": "ec2Instance_add_disk",
  "title": "Add Disk",
  "description": "Add a disk to the EC2 instance",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "disk_type": {
          "type": "string",
          "title": "Disk Type",
          "default": "General Purpose SSD (gp3)",
          "description": "Amazon EBS volume types",
          "enum": [
            "General Purpose SSD (gp3)",
            "General Purpose SSD (gp2)",
            "Provisioned IOPS SSD (io1)",
            "Provisioned IOPS SSD (io2)",
            "Cold HDD (sc1)",
            "Throughput Optimized HDD (st1)",
            "Magnetic (standard)"
          ],
          "enumColors": {
            "General Purpose SSD (gp3)": "lightGray",
            "General Purpose SSD (gp2)": "lightGray",
            "Provisioned IOPS SSD (io1)": "lightGray",
            "Provisioned IOPS SSD (io2)": "lightGray",
            "Cold HDD (sc1)": "lightGray",
            "Throughput Optimized HDD (st1)": "lightGray",
            "Magnetic (standard)": "lightGray"
          }
        },
        "disk_name": {
          "type": "string",
          "title": "Disk Name",
          "description": "The disk name"
        },
        "size": {
          "icon": "DefaultProperty",
          "type": "number",
          "title": "Size",
          "default": 5
        }
      },
      "required": [
        "disk_type",
        "disk_name",
        "size"
      ],
      "order": [
        "disk_type",
        "disk_name",
        "size"
      ]
    },
    "blueprintIdentifier": "ec2Instance"
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://gitlab.com/api/v4/projects/<PROJECT_ID>/ref/main/trigger/pipeline?token=<PIPELINE_TRIGGER_TOKEN>",
    "agent": false,
    "synchronized": false,
    "method": "POST",
    "body": {
      "action": "{{ .action.identifier[(\"ec2Instance_\" | length):] }}",
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
            "url": "https://gitlab.com/api/v4/projects/<PROJECT_ID>/ref/main/trigger/pipeline?token=<PIPELINE_TRIGGER_TOKEN>",
            "agent": false,
            "synchronized": false,
            "method": "POST"
          },
          "trigger": "{{.trigger.operation}}"
        },
        "properties": {
          "{{if (.inputs | has(\"disk_type\")) then \"disk_type\" else null end}}": "{{.inputs.\"disk_type\"}}",
          "{{if (.inputs | has(\"disk_name\")) then \"disk_name\" else null end}}": "{{.inputs.\"disk_name\"}}",
          "{{if (.inputs | has(\"size\")) then \"size\" else null end}}": "{{.inputs.\"size\"}}"
        },
        "censoredProperties": "{{.action.encryptedProperties}}"
      }
    }
  },
  "requiredApproval": false
}
```
</details>

- Fill out the `backend` form section with your values:
    - For the Endpoint URL you need to add a URL in the following format:
        - To create a pipeline trigger token, follow this [guide](https://docs.gitlab.com/ee/ci/triggers/#create-a-pipeline-trigger-token).
    ```bash
        https://gitlab.com/api/v4/projects/{PROJECT_ID}/ref/main/trigger/pipeline?token={PIPELINE_TRIGGER_TOKEN}
    ```
    - Set HTTP method to `POST`.
    - Set Request type to `Async`.
    - Set Use self-hosted agent to No.

<img src="/img/self-service-actions/setup-backend/gitlab-pipeline/backendGitlabTerraform.png" width="70%" border="1px" />


## Let's test it!

1. Head to the [Self Service hub](https://app.getport.io/self-serve)
2. Click on the `Add Disk` action
3. Fill the pop-up form with details

<img src="/img/self-service-actions/setup-backend/gitlab-pipeline/testAddingDisk.png" width="70%" border="1px" />

4. Click on `Execute`
5. Wait for the disk to be added to the instance.

Congrats 🎉 You can now add a disk to an EC2 Instance in Port 🔥
