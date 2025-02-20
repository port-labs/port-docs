---
displayed_sidebar: null
description: Learn how to create a new AWS account for GitLab in Port, ensuring seamless integration and cloud management.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Automate AWS Account Creation with GitLab

This guide provides a step-by-step process to automate the creation of a new AWS account and associated resources using GitLab and Port.

:::info Prerequisites
This guide assumes you have:
- A Port account and that you have completed the [onboarding process](/getting-started/overview).
- A GitLab account with a repository set up for CI/CD.
:::

<br/>

## Step 1: Copy Configuration Files

First, copy the following files into your GitLab repository:

`.gitlab-ci.yml`
<details>
<summary><b>Click to expand</b></summary>

```yaml
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
  AWS_ACCESS_KEY_ID: ${TF_USER_AWS_KEY}
  AWS_SECRET_ACCESS_KEY : ${TF_USER_AWS_SECRET}
  AWS_DEFAULT_REGION: ${TF_USER_AWS_REGION}
  PORT_CLIENT_ID: ${PORT_CLIENT_ID}
  PORT_CLIENT_SECRET: ${PORT_CLIENT_SECRET}

before_script:
  - rm -rf .terraform
  - export AWS_ACCESS_KEY=${AWS_ACCESS_KEY_ID}
  - export AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
  - export AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}
  - apk update
  - apk add --upgrade curl jq -q

fetch-port-access-token:
  stage: prerequisites
  except:
    - pushes
  script:
    - |
      echo "Getting access token from Port API"
      accessToken=$(curl -X POST \
        -H 'Content-Type: application/json' \
        -d '{"clientId": "'"$PORT_CLIENT_ID"'", "clientSecret": "'"$PORT_CLIENT_SECRET"'"}' \
        -s 'https://api.getport.io/v1/auth/access_token' | jq -r '.accessToken')
  
      echo "ACCESS_TOKEN=$accessToken" >> data.env
      cat $TRIGGER_PAYLOAD 
      runId=$(cat $TRIGGER_PAYLOAD | jq -r '.RUN_ID')
      ACCOUNT_NAME=$(cat $TRIGGER_PAYLOAD | jq -r '.account_name')
      EMAIL=$(cat $TRIGGER_PAYLOAD | jq -r '.email')
      IAM_ROLE_NAME=$(cat $TRIGGER_PAYLOAD | jq -r '.role_name')
      echo "RUN_ID=$runId" >> data.env
      echo "ACCOUNT_NAME=$ACCOUNT_NAME" >> data.env
      echo "EMAIL=$EMAIL" >> data.env
      echo "IAM_ROLE_NAME=$IAM_ROLE_NAME" >> data.env
      curl -X POST \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $accessToken" \
        -d '{"message":"🏃‍♂️ Starting action to create an AWS account"}' \
        "https://api.getport.io/v1/actions/runs/$runId/logs"
      curl -X PATCH \
        -H 'Content-Type: application/json' \
        -H "Authorization: Bearer $accessToken" \
        -d '{"link":"'"$CI_PIPELINE_URL"'"}' \
        "https://api.getport.io/v1/actions/runs/$runId"
  artifacts:
    reports:
      dotenv: data.env

create-aws-account:
  stage: terraform
  needs:
    - job: fetch-port-access-token
      artifacts: true
  script:
    - echo "Creating AWS account and IAM role..."
    - terraform init
    - terraform apply -auto-approve -var "account_name=${ACCOUNT_NAME}" -var "email=${EMAIL}" -var "iam_role_name=${IAM_ROLE_NAME}"

send-data-to-port:
  stage: port-update
  dependencies:
    - fetch-port-access-token
  script:
    - |
      curl -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d "{\"identifier\": \"${EMAIL}\", \
             \"title\": \"${ACCOUNT_NAME}\", \
             \"properties\": { \
               \"account_name\": \"${ACCOUNT_NAME}\", \
               \"email\": \"${EMAIL}\", \
               \"iam_role_name\": \"${IAM_ROLE_NAME}\", \
               \"additional_data\": \"Your additional data here\" \
             }, \
             \"relations\": {}}" \
        "https://api.getport.io/v1/blueprints/awsAccountBlueprint/entities?run_id=$RUN_ID"
      
      curl -X PATCH \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $ACCESS_TOKEN" \
        -d '{"status": "SUCCESS", "message": {"run_status": "Run completed successfully!"}}' \
        "https://api.getport.io/v1/actions/runs/$RUN_ID"
```

</details>
`main.tf`
<details>
<summary><b>Click to expand</b></summary>

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}
provider "aws" {
  region = var.region
}
resource "aws_organizations_account" "account" {
  name  = var.name
  email = var.email
  role_name = var.role_name
  close_on_deletion = true
  lifecycle {
    ignore_changes = [role_name]
  }
}
```

</details>
`variables.tf`
<details>
<summary><b>Click to expand</b></summary>

```hcl
variable "region" {
  description = "AWS region where resources will be created"
  type        = string
  default     = "us-east-1"
}
variable "name" {
  description = "Name of the AWS account to be created"
  type        = string
  default     = "newAccount"
}
variable "email" {
  description = "Email to attach to the AWS account"
  type        = string
  default     = "example@example.com"
}
variable "role_name" {
  description = "Name of the IAM role to attach"
  type        = string
  default     = "IAMRole"
}
```

</details>
`outputs.tf`
<details>
<summary><b>Click to expand</b></summary>

```hcl
output "account_name" {
  value = aws_organizations_account.account.name
}
output "email" {
  value = aws_organizations_account.account.email
}
output "role_name" {
  value = aws_organizations_account.account.role_name
}
```

</details>

These files contain the necessary Terraform and GitLab CI configurations to automate AWS account creation.

## Step 2: Configure GitLab Secrets

In GitLab, navigate to your project's **Settings** > **CI / CD** > **Variables** and add the required secrets.

- PORT_CLIENT_ID
- PORT_CLIENT_SECRET
- TF_USER_AWS_KEY
- TF_USER_AWS_REGION
- TF_USER_AWS_SECRET 

These secrets are necessary for the Terraform scripts to execute correctly.

## Step 3: Configure GitLab Webhook

In GitLab, navigate to your project's **Settings** > **CI / CD** > **Pipeline trigger tokens** and add new token. Then in **View trigger token usage examples** you can find the Webhook URL address ander **Use webhook** 

This URL is necessary for triggering the Pipeline from the Self Service Action.

## Step 4: Add AWS Account Blueprint in Port

Next, create a new blueprint in Port using the `aws_account.json` file. This blueprint represents an AWS account in your software catalog.

### Example Blueprint: `aws_account.json`

<details>
<summary><b>Click to expand</b></summary>

```json
{
  "identifier": "awsAccountBlueprint",
  "description": "This blueprint represents an AWS account in our software catalog.",
  "title": "AWS account",
  "icon": "AWS",
  "schema": {
    "properties": {
      "role_name": {
        "type": "string",
        "title": "Role Name",
        "description": "The name of the IAM role."
      },
      "account_name": {
        "type": "string",
        "title": "Account Name",
        "description": "The name for the account."
      },
      "email": {
        "type": "string",
        "title": "Email",
        "description": "The email for the account."
      }
    },
    "required": [
      "email",
      "account_name"
    ]
  },
  "relations": {}
}
```

</details>

## Step 5: Create Self-Service Action in Port

Create a new self-service action using the `self-service-action.json` file. This action will trigger the AWS account creation process.

### Example Self-Service Action: `self-service-action.json`

<details>
<summary><b>Click to expand</b></summary>
:::info Prerequisites
Make sure to change 'WEBHOOK-URL-FROM-GITLAB' into your webhook URL from gitlab.
:::

```json
{
  "identifier": "gitlabAwsAccountBlueprint_create_an_aws_account",
  "title": "Create An AWS Account with GitLab",
  "icon": "AWS",
  "description": "Automate the creation of a new AWS account and associated resources.",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "account_name": {
          "icon": "AWS",
          "title": "Account Name",
          "description": "The desired name for the new AWS account",
          "type": "string"
        },
        "email": {
          "icon": "DefaultProperty",
          "title": "Email",
          "description": "The email address associated with the new AWS account",
          "type": "string",
          "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        },
        "iam_role_name": {
          "title": "IAM Role Name",
          "description": "The name of the IAM role to be created for management purposes",
          "type": "string"
        }
      },
      "required": [
        "account_name",
        "email"
      ],
      "order": [
        "account_name",
        "email",
        "iam_role_name"
      ]
    },
    "blueprintIdentifier": "awsAccountBlueprint"
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "WEBHOOK-URL-FROM-GITLAB",
    "method": "POST",
    "headers": {
      "RUN_ID": "{{ .run.id }}"
    },
    "body": {
      "RUN_ID": "{{ .run.id }}",
      "account_name": "{{ .inputs."account_name" }}",
      "email": "{{ .inputs."email" }}",
      "iam_role_name": "{{ .inputs."iam_role_name" }}"
    }
  },
  "requiredApproval": false
  
}
```

</details>

## Include the Run ID

Ensure that you include the RUN_ID in the body of the webhook, as illustrated in the example above. This ID is crucial for tracking the execution of the self-service action.

## Conclusion

By following these steps, you can automate the creation of new AWS accounts using GitLab CI/CD and Port self-service actions.
