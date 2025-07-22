---
displayed_sidebar: null
description: Learn how to automate AWS account creation through Port using GitLab CI/CD, enabling streamlined cloud infrastructure provisioning with self-service actions.
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Automate AWS Account Creation with GitLab

## Overview
This guide demonstrates how to implement a self-service action in Port to automates the creation of new AWS accounts and associated resources using GitLab CI/CD and Terraform.


## Common use cases

- **Multi-account strategy**: Enable teams to quickly spin up dedicated AWS accounts for different projects or environments.
- **Development environments**: Provide developers with isolated AWS accounts for testing and development.
- **Client onboarding**: Streamline the process of creating dedicated AWS accounts for new clients or business units.
- **Compliance and security**: Maintain standardized account configurations with proper IAM roles and policies.
- **Cost management**: Enable better cost tracking and resource isolation through dedicated accounts.

## Prerequisites

This guide assumes you have:
- Complete the [onboarding process](/getting-started/overview).
- A GitLab account with a repository set up for CI/CD.
- AWS Organizations access with permissions to create new accounts.
- AWS IAM permissions for Terraform operations.
- Port's [AWS integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/) is installed in your account.
- Port Client ID and Client Secret ([learn more](/build-your-software-catalog/custom-integration/api/#get-api-token)).


## Set up data model

We'll create a blueprint to represent AWS accounts in your Port catalog.

### Create the AWS Account blueprint

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.

2. Click on `+ Blueprint`.

3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.

4. Add this JSON schema:

    <details>
    <summary><b>AWS Account blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
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

5. Click `Save` to create the blueprint.

## Implementation

### Add GitLab secrets

In your GitLab project, go to **Settings > CI/CD > Variables** and add the following variables:

- `PORT_CLIENT_ID` - Port Client ID [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](/build-your-software-catalog/custom-integration/api/#get-api-token).
- `TF_USER_AWS_KEY` - AWS Access Key ID with Organizations permissions.
- `TF_USER_AWS_SECRET` - AWS Secret Access Key.
- `TF_USER_AWS_REGION` - AWS region for resource creation (e.g., `us-east-1`).

### Set up Terraform configuration

Create the following Terraform files in your GitLab repository to define the AWS account creation infrastructure.

<h4> Main Terraform configuration</h4>

Create `main.tf`:

<details>
<summary><b>Terraform main configuration (Click to expand)</b></summary>

```hcl showLineNumbers
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
  name      = var.name
  email     = var.email
  role_name = var.role_name
  close_on_deletion = true
  
  lifecycle {
    ignore_changes = [role_name]
  }
}
```

</details>

<h4> Create Terraform variables</h4>

Create `variables.tf`:

<details>
<summary><b>Terraform variables configuration (Click to expand)</b></summary>

```hcl showLineNumbers
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

<h4>Create Terraform outputs</h4>

Create `outputs.tf`:

<details>
<summary><b>Terraform outputs configuration (Click to expand)</b></summary>

```hcl showLineNumbers
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

### Add GitLab pipeline

Create `.gitlab-ci.yml` in your repository:

<details>
<summary><b>GitLab CI/CD pipeline (Click to expand)</b></summary>

```yaml showLineNumbers
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

### Configure GitLab webhook

1. In your GitLab project, go to **Settings > CI/CD > Pipeline trigger tokens**.

2. Click **Add trigger token** to create a new token.

3. Copy the webhook URL from the **Use webhook** section under **View trigger token usage examples**.

4. Keep this URL for the next step - you'll need it for the Port self-service action.

### Set up self-service action

Now we'll create a self-service action that triggers the AWS account creation workflow.

1. Head to the [self-service](https://app.getport.io/self-serve) page.

2. Click on the `+ New Action` button.

3. Click on the `{...} Edit JSON` button.

4. Copy and paste the following JSON configuration into the editor.

    :::tip GitLab webhook configuration
    Make sure to replace `WEBHOOK-URL-FROM-GITLAB` with the actual webhook URL you obtained from GitLab in the previous step.
    :::

    <details>
    <summary><b>Create AWS Account action (Click to expand)</b></summary>

    ```json showLineNumbers
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
              "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
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
          "account_name": "{{ .inputs.\"account_name\" }}",
          "email": "{{ .inputs.\"email\" }}",
          "iam_role_name": "{{ .inputs.\"iam_role_name\" }}"
        }
      },
      "requiredApproval": false
    }
    ```

    </details>

5. Click `Save`.

Now you should see the `Create An AWS Account with GitLab` action in the self-service page. 🎉

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal

2. Click on the `Create An AWS Account with GitLab` action

3. Fill in the account details:
   - **Account Name**: Enter a descriptive name for your new AWS account.
   - **Email**: Provide a unique email address (must be different from existing AWS accounts).
   - **IAM Role Name**: Specify the name for the IAM role (optional).

4. Click on `Execute`

5. Monitor the process:
   - Watch the GitLab pipeline execution through the provided link.
   - Check the logs in Port for real-time updates.
   - Verify Terraform operations in the GitLab CI/CD pipeline.

6. Verify completion:
   - Check that a new AWS account entity appears in your Port catalog.
   - Verify the account was created in your AWS Organizations console.
   - Confirm all properties are correctly populated in the Port entity.

## Conclusion

By following these steps, you can automate the creation of new AWS accounts using GitLab CI/CD and Port self-service actions.
