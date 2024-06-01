import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Automate AWS Account Creation with GitLab

This guide provides a step-by-step process to automate the creation of a new AWS account and associated resources using GitLab and Port.

:::tip Prerequisites
This guide assumes you have:
- A GitLab account with a repository set up for CI/CD.
- Required secrets configured in GitLab as listed in the requirements file.
- A Port account with necessary blueprints and self-service actions.
:::

<br/>

## Step 1: Copy Configuration Files

First, copy the following files into your GitLab repository:

- `.gitlab-ci.yml`
- `main.tf`
- `variables.tf`
- `outputs.tf`

These files contain the necessary Terraform and GitLab CI configurations to automate AWS account creation.

## Step 2: Configure GitLab Secrets

In GitLab, navigate to your project's **Settings** > **CI / CD** > **Variables** and add the required secrets as listed in the requirements file. These secrets are necessary for the Terraform scripts to execute correctly.

## Step 3: Add AWS Account Blueprint in Port

Next, create a new blueprint in Port using the `new_account_blueprint_example.json` file. This blueprint represents an AWS account in your software catalog.

### Example Blueprint: `new_account_blueprint_example.json`

<details>
<summary><b>Click to expand</b></summary>

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
</details>
Step 4: Create Self-Service Action in Port
Create a new self-service action using the self-service-action.json file. This action will trigger the AWS account creation process.

Example Self-Service Action: self-service-action.json
<details>
<summary><b>Click to expand</b></summary>
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
  "requiredApproval": false,
  "publish": true
}
</details>
Include the Run ID
Ensure that you include the RUN_ID in the body of the webhook, as illustrated in the example above. This ID is crucial for tracking the execution of the self-service action.

Conclusion
By following these steps, you can automate the creation of new AWS accounts using GitLab CI/CD and Port self-service actions.

Relevant guides and examples:

Port's Documentation on Blueprint Creation
Example GitLab CI/CD Pipelines

</summary>