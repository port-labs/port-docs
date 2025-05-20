---
sidebar_position: 1
displayed_sidebar: null
description: Follow this guide to create an EC2 instance for GitLab in Port, ensuring a seamless and scalable CI/CD environment.
---

# Create An AWS EC2 Instance

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

## Overview

In the following guide, you are going to create a self-service action in Port that executes a [GitLab pipeline](/actions-and-automations/setup-backend/gitlab-pipeline/) to create an EC2 Instance in AWS using Terraform templates.

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


data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/*22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  owners = ["099720109477"] # Canonical
}

locals {
  ami_id = var.ec2_ami != "" ? var.ec2_ami : data.aws_ami.ubuntu.id
}

provider "aws" {
  region = var.aws_region
}

resource "aws_instance" "app_server" {
  ami           = local.ami_id
  instance_type = var.ec2_instance_type

  tags = {
    Name = var.ec2_name
  }
}

resource "port_entity" "ec2_instance" {
  count      = length(aws_instance.app_server) > 0 ? 1 : 0
  identifier = aws_instance.app_server.id
  title      = var.ec2_name
  blueprint  = "ec2Instance"
  run_id     = var.port_run_id
  properties = {
    string_props = {
      "instance_state"   = aws_instance.app_server.instance_state,
      "instance_type"    = aws_instance.app_server.instance_type,
      "availabilityZone" = aws_instance.app_server.availability_zone,
      "public_dns"       = aws_instance.app_server.public_dns,
      "public_ip"        = aws_instance.app_server.public_ip,
      "private_dns"      = aws_instance.app_server.private_dns,
      "private_ip"       = aws_instance.app_server.private_ip,
      "monitoring"       = aws_instance.app_server.monitoring,
      "key_name"         = aws_instance.app_server.key_name,
      "subnet_id"        = aws_instance.app_server.subnet_id
    }
    array_props = {
      "tags"               = aws_instance.app_server.tags,
      "security_group_ids" = aws_instance.app_server.vpc_security_group_ids,
    }
  }
  relations = {
    single_relations = {
      "operatingSystem" = local.ami_id
    }
  }

  depends_on = [aws_instance.app_server]
}
```
</details>

<details>
  <summary><b>variables.tf</b></summary>

```hcl showLineNumbers title = "variables.tf"
variable "ec2_name" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "ec2_instance_type" {
  type = string
}

variable "ec2_ami" {
  type = string
}

variable "port_run_id" {
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

<br />

3. Create a `GitLab Workflow` file under `.gitlab-ci.yaml` with the following content:

<details>
<summary><b>GitLab workflow</b></summary>

:::tip modification required
Replace `QUOTA_CODE` on line 17 with your service quota code for vCPUs. 
  
You can [view your quotas](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-resource-limits.html#view-limits) for each region using the [Service Quotas console](https://console.aws.amazon.com/servicequotas/home/services/ec2/quotas/). 
  
Get the quota code for `Running On-Demand Standard (A, C, D, H, I, M, R, T, Z) instances`
:::

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
  TF_VAR_gitlab_token: ${GITLAB_ACCESS_TOKEN}
  AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
  AWS_SECRET_ACCESS_KEY : ${AWS_SECRET_ACCESS_KEY}
  AWS_DEFAULT_REGION: ${AWS_DEFAULT_REGION}
  // highlight-start
  QUOTA_CODE: "L-1216C47A"
  // highlight-end
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
      echo "RUN_ID=$runId" >> data.env
      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $accessToken" \
        -d '{"message":"🏃‍♂️ Starting action to create an EC2 instance"}' \
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
      echo "Checking AWS quota for CPU, Memory, and storage..."
      EC2_COUNT=1

      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.context.runId')

      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"statusLabel": "Checking Quota", "message":"🔍 Checking AWS quota for CPU, Memory, and storage..."}' \
        "https://api.getport.io/v1/actions/runs/$runId/logs"

      INSTANCE_TYPE=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.size')
      AMI_ID=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.os')

      # Ensure environment variables are available
      if [[ -z "$INSTANCE_TYPE" || -z "$AMI_ID" ]]; then
        echo "Error: INSTANCE_TYPE and AMI_ID environment variables are required."
        exit 1
      fi

      # Get EC2 instance details
      instance_vcpus=$(aws ec2 describe-instance-types --instance-types $INSTANCE_TYPE --query 'InstanceTypes[].VCpuInfo.DefaultVCpus' --output text)
      instance_memory_gb=$(aws ec2 describe-instance-types --instance-types $INSTANCE_TYPE --query 'InstanceTypes[].MemoryInfo.SizeInMiB' --output text | awk '{print $1 / 1024}')
      
      # Get relevant AMI storage requirements (EBS)
      ami_storage_gb=$(aws ec2 describe-images --image-ids $AMI_ID --query 'Images[].BlockDeviceMappings[?DeviceName == `/dev/sda1`].Ebs.VolumeSize' --output text) 

      # Calculate required resources
      required_vcpus=$((instance_vcpus * EC2_COUNT))
      required_memory_gb=$((instance_memory_gb * EC2_COUNT))
      required_storage_gb=$((ami_storage_gb * EC2_COUNT))

      # print required resources
      echo "Required vCPUs: $required_vcpus"
      echo "Required Memory (GB): $required_memory_gb"
      echo "Required Storage (GB): $required_storage_gb"

      # Get EC2 quota 
      ec2_quota=$(aws service-quotas get-service-quota --service-code ec2 --quota-code $QUOTA_CODE --region $AWS_DEFAULT_REGION)
      current_vcpus=$(echo $ec2_quota | jq -r '.Quota.UsageMetric.CurrentUsage.Value // 0') 
      vcpu_limit=$(echo $ec2_quota | jq -r '.Quota.Value')
      

      # Quota data output
      echo "INSTANCE_TYPE=$INSTANCE_TYPE"  >> data.env 
      echo "AMI_ID=$AMI_ID" >> data.env
      echo "EC2_COUNT=$EC2_COUNT" >> data.env
      echo "REQUIRED_VCPUS=$required_vcpus" >> data.env
      echo "REQUIRED_MEMORY_GB=$required_memory_gb" >> data.env
      echo "REQUIRED_STORAGE_GB=$required_storage_gb" >> data.env

      echo "Current vCPUs in use: $current_vcpus"
      echo "vCPU quota limit: $vcpu_limit"
      # ... add similar output for memory and storage

      # Quota Checks
      if [ $current_vcpus -lt $required_vcpus ] && [ $vcpu_limit -ge $required_vcpus ]; then
        echo "vCPU quota is sufficient."
      else 
        echo "Insufficient vCPU quota." 
        curl -X POST \
          -H 'Content-Type: application/json' \
          -H "Authorization: Bearer $ACCESS_TOKEN" \
          -d '{"message":"Insufficient vCPU quota to create EC2 instance"}' \
          "https://api.getport.io/v1/actions/runs/$runId/logs"
        exit 1 # Fail pipeline if needed
      fi
      
      # Get Instance Type EBS Volume Type
      ebs_volume_type=$(aws ec2 describe-images --image-id $AMI_ID --query 'Images[].BlockDeviceMappings[0].Ebs.VolumeType' --output text)
      
      # Get EBS Volume Quota
      ebs_quota=$(aws service-quotas get-service-quota --service-code ec2 --quota-code 'L-1216C47A' --region $AWS_DEFAULT_REGION)
      current_storage_gb=$(echo $ebs_quota | jq -r '.Quota.UsageMetric.CurrentUsage.Value // 0')
      storage_limit_gb=$(echo $ebs_quota | jq -r '.Quota.Value')

      # Quota data output
      echo "EBS_VOLUME_TYPE=$ebs_volume_type" >> data.env
      echo "CURRENT_STORAGE_GB=$current_storage_gb" >> data.env
      echo "STORAGE_LIMIT_GB=$storage_limit_gb" >> data.env

      echo "Current storage in use: $current_storage_gb"
      echo "Storage quota limit: $storage_limit_gb"

      # Check if storage quota is sufficient
      if [ $current_storage_gb -lt $required_storage_gb ] && [ $storage_limit_gb -ge $required_storage_gb ]; then
        echo "Storage quota is sufficient."
      else 
        echo "Insufficient storage quota." 
        curl -X POST \
          -H 'Content-Type: application/json' \
          -H "Authorization: Bearer $ACCESS_TOKEN" \
          -d '{"terminationStatus":"FAILURE", "message":"Insufficient storage quota to create EC2 instance"}' \
          "https://api.getport.io/v1/actions/runs/$runId/logs"
        exit 1 
      fi

      echo "All quotas are sufficient for deployment." 
  artifacts:
    reports:
      dotenv: data.env

search-role-entities:
  stage: prerequisites
  except:
    - pushes
  before_script:
    - apk update
    - apk add --upgrade curl jq -q
  needs:
    - job: check-quota
      artifacts: true
  script: 
    - |
      echo "Searching for role entities in Port"
      accessToken=$(curl -X POST \
        -H 'Content-Type: application/json' \
        -d '{"clientId": "'"$PORT_CLIENT_ID"'", "clientSecret": "'"$PORT_CLIENT_SECRET"'"}' \
        -s 'https://api.getport.io/v1/auth/access_token' | jq -r '.accessToken')

      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.context.runId')
      roleName=$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.role_name')
      blueprint=$(cat $TRIGGER_PAYLOAD | jq -r '.context.blueprint')

      searchQuery='{
        "combinator": "and",
        "rules": [
          {
            "property": "$blueprint",
            "operator": "=",
            "value": "'$blueprint'"
          },
          {
            "property": "$title",
            "operator": "contains",
            "value": "aws-'$roleName'"
          }
        ]
      }'

      roleEntities=$(curl -X POST \
        'https://api.getport.io/v1/entities/search?exclude_calculated_properties=false&attach_title_to_relation=false' \
        -H "Authorization: Bearer $accessToken" \
        -H 'Content-Type: application/json' \
        -d "$searchQuery" | jq -c .)

      echo "ROLE_ENTITIES=$roleEntities" >> data.env

      # Parse the search response to calculate the next available number
      nextNumber=$(echo "$roleEntities" | jq '.entities | length + 1')
      
      # Construct the EC2 machine name
      ec2MachineName="aws-${roleName}-${nextNumber}"
      
      echo "ec2MachineName: $ec2MachineName"
      
      echo "EC2_MACHINE_NAME=$ec2MachineName" >> data.env

      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.context.runId')

      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $accessToken" \
        -d '{"statusLabel": "Provisioning", "message":"🏗️ Creating EC2 instance '$ec2MachineName'"}' \
        "https://api.getport.io/v1/actions/runs/$runId/logs"
  artifacts:
    reports:
      dotenv: data.env

apply:
  stage: terraform
  needs:
    - job: check-quota
      artifacts: true
    - job: search-role-entities
      artifacts: true
  except:
    - pushes
  before_script:
    - apk update
    - apk add --upgrade curl jq -q
    - terraform --version
    - terraform init
    - export TF_VAR_ec2_name=$EC2_MACHINE_NAME
    - export TF_VAR_ec2_instance_type=${SERVICE_NAME:-$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.size')}
    - export TF_VAR_ec2_ami=${AMI_ID:-$(cat $TRIGGER_PAYLOAD | jq -r '.payload.properties.os')}
    - export TF_VAR_aws_region=${AWS_DEFAULT_REGION}
    - export TF_VAR_port_run_id=$(cat $TRIGGER_PAYLOAD | jq -r '.context.runId')
  script:
    - terraform validate
    - terraform plan -out="planfile"
    - | 
      terraform apply -input=false "planfile"

      echo "INSTANCE_ID=$(terraform output -raw instance_id)" >> data.env
      echo "INSTANCE_STATE=$(terraform output -raw instance_state)" >> data.env
      echo "INSTANCE_TYPE=$(terraform output -raw instance_type)" >> data.env
      echo "AVAILABILITY_ZONE=$(terraform output -raw availability_zone)" >> data.env
      echo "PUBLIC_DNS=$(terraform output -raw public_dns)" >> data.env
      echo "PUBLIC_IP=$(terraform output -raw public_ip)" >> data.env
      echo "PRIVATE_DNS=$(terraform output -raw private_dns)" >> data.env
      echo "PRIVATE_IP=$(terraform output -raw private_ip)" >> data.env
      echo "MONITORING=$(terraform output -raw monitoring)" >> data.env
      security_group_ids_json=$(terraform output -json security_group_ids | jq -c .)
      echo "SECURITY_GROUP_IDS=$security_group_ids_json" >> data.env
      echo "KEY_NAME=$(terraform output -raw key_name)" >> data.env
      echo "SUBNET_ID=$(terraform output -raw subnet_id)" >> data.env
      tags=$(terraform output -json tags | jq -c .)
      echo "TAGS=$tags" >> data.env

update-run-status:
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
      echo "Updating Port action run status and final logs"
      accessToken=$(curl -X POST \
        -H 'Content-Type: application/json' \
        -d '{"clientId": "'"$PORT_CLIENT_ID"'", "clientSecret": "'"$PORT_CLIENT_SECRET"'"}' \
        -s 'https://api.getport.io/v1/auth/access_token' | jq -r '.accessToken')
      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.context.runId')

      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $accessToken" \
        -d '{"terminationStatus":"SUCCESS", "message":"✅ Finished creation successfully with 🔗 Instance ID: '$INSTANCE_ID'!"}' \
        "https://api.getport.io/v1/actions/runs/$runId/logs"
```
</details>


## Port Configuration

1. Head over to the [Builder](https://app.getport.io/settings/data-model) page to create the following <PortTooltip id="blueprint">blueprints</PortTooltip>:
    - Click on the `+ Blueprint` button.
    - Click on the `{...} Edit JSON` button.
    - Copy and paste the following JSON configuration into the editor.
    - Click Save.

<details>
<summary><b>AMI Blueprint</b></summary>

```json showLineNumbers
{
  "identifier": "ami",
  "description": "AMIs for creating EC2 instances",
  "title": "Amazon Machine Images",
  "icon": "EC2",
  "schema": {
    "properties": {
      "image_id": {
        "type": "string",
        "title": "Image ID",
        "pattern": "^ami-[0-9a-f]{8,17}$"
      },
      "description": {
        "type": "string",
        "title": "Description"
      }
    },
    "required": [
      "image_id",
      "description"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```
</details>

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
  "relations": {
    "operatingSystem": {
      "title": "Operating System",
      "target": "ami",
      "required": false,
      "many": false
    }
  }
}
```
</details>


:::tip AMI Entities
Before we continue, add some entities onto the AMI blueprint. The **identifier** will be the AMI Image ID.

| AMI Identifier | AMI Title | Description |
|----------------|-----------|-------------|
| ami-0f007bf1d5c770c6e | Amazon Linux 2023 | Amazon Linux 2023 (AL2023) |
| ami-0c1c30571d2dae5c9 | Ubuntu Server 22.04 LTS | Canonical, Ubuntu, 22.04 LTS |
| ami-08e592fbb0f535224 | RHEL 9 | Red Hat Enterprise Linux 9 |

<img src="/img/self-service-actions/setup-backend/gitlab-pipeline/createAMIEntity.png" width="70%" border="1px" />

:::

<br />


2. To create the Port action, go to the [self-service page](https://app.getport.io/self-serve):
    - Click on the `+ New Action` button.
    - Choose the `EC2 Instance` blueprint and click `Next`.
    - Click on the `{...} Edit JSON` button.
    - Copy and paste the following JSON configuration into the editor.

<details>
  <summary> <b> Port Action: Create An EC2 Instance </b> </summary>

:::tip modification required

- `<PROJECT_ID>` - your project ID.
- `<PIPELINE_TRIGGER_TOKEN>` - your pipeline trigger token. Learn [more](https://docs.gitlab.com/ee/ci/triggers/#create-a-pipeline-trigger-token).
:::

```json showLineNumbers
{
  "identifier": "ec2Instance_create_ec_2_instance_with_git_lab",
  "title": "Create EC2 Instance with GitLab",
  "description": "Trigger instance creation with GitLab and Terraform",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "project": {
          "type": "string",
          "title": "Project",
          "description": "AWS Account",
          "default": "851725549828",
          "enum": [
            "851725549828",
            "851745549766"
          ],
          "enumColors": {
            "851725549828": "lightGray",
            "851745549766": "lightGray"
          }
        },
        "size": {
          "icon": "DefaultProperty",
          "title": "Size",
          "type": "string",
          "default": "t2.micro",
          "enum": [
            "t2.micro",
            "t2.small",
            "t2.medium",
            "t2.large"
          ],
          "enumColors": {
            "t2.micro": "lightGray",
            "t2.small": "lightGray",
            "t2.medium": "lightGray",
            "t2.large": "lightGray"
          }
        },
        "role_name": {
          "icon": "DefaultProperty",
          "type": "string",
          "title": "Role Name",
          "minLength": 4,
          "maxLength": 8,
          "pattern": "^[a-z0-9]+$"
        },
        "os": {
          "icon": "EC2",
          "title": "OS",
          "description": "The operating system",
          "type": "string",
          "blueprint": "ami",
          "format": "entity"
        }
      },
      "required": [
        "project",
        "role_name",
        "os",
        "size"
      ],
      "order": [
        "project",
        "os",
        "size",
        "role_name"
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
          "{{if (.inputs | has(\"project\")) then \"project\" else null end}}": "{{.inputs.\"project\"}}",
          "{{if (.inputs | has(\"size\")) then \"size\" else null end}}": "{{.inputs.\"size\"}}",
          "{{if (.inputs | has(\"role_name\")) then \"role_name\" else null end}}": "{{.inputs.\"role_name\"}}",
          "{{if (.inputs | has(\"os\")) then \"os\" else null end}}": "{{.inputs.\"os\" | if type == \"array\" then map(.identifier) else .identifier end}}"
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
2. Click on the `Create An EC2 Instance` action
3. Fill the pop-up form with details of the EC2 Instance you wish to create
<img src="/img/self-service-actions/setup-backend/gitlab-pipeline/testGitlabTerraform.png" width="70%" border="1px" />

4. Click on `Execute`
5. Wait for the EC2 Instance to be created in AWS

## Next Steps

1. [Add a disk to the EC2 instance](/guides/all/add-ec2-volume)

