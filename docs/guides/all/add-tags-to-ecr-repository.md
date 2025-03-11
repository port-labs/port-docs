---
displayed_sidebar: null
description: Master the process of adding tags to your ECR repository in Port with this step-by-step guide for better resource management.
---

# Add tags to ECR repository

This guide demonstrates how to add meaningful tags to your AWS ECR repository using [Port's self-service action](/actions-and-automations/create-self-service-experiences/)

## Prerequisites
1. [Port's GitHub app](https://github.com/apps/getport-io) needs to be installed
2. AWS Access Key and Secret Key pair. Follow [AWS guide on creating access keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey) to create one for your account
3. AWS `AmazonEC2ContainerRegistryFullAccess` policy should be enabled on the account to enable necessary permissions to carry out the action
4. Account ID. Click on the account dropdown settings on the upper right corner in your AWS Console to retrieve it
5. In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:

    - `AWS_REGION` - The region where ECR repositories are located. Available regions can be found on the [Regions, Availability Zones, and Local Zones page](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html#Concepts.RegionsAndAvailabilityZones.Regions) in AWS documentation.
    - `AWS_ACCOUNT_ID` - AWS account ID from the [prerequisites step](#prerequisites)
    - `AWS_ACCESS_KEY_ID` - AWS Access Key ID
    - `AWS_SECRET_ACCESS_KEY` - AWS Secret Access Key
    - `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
    - `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)

6. Optional - Ingest your `AWS ECR Repository` into Port using our [recommended python script](https://github.com/port-labs/example-ecr-images)

:::tip ECR Repository Python Script
This step is not required for this example, but it will create all the blueprint boilerplate for you, and also update the catalog with your repositories.
:::

- `AWS_REGION` - The region where ECR repositories are located. Available regions can be found on the [Regions, Availability Zones, and Local Zones page](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html#Concepts.RegionsAndAvailabilityZones.Regions) in AWS documentation.
- `AWS_ACCOUNT_ID` - AWS account ID from the [prerequisites step](#prerequisites)
- `AWS_ACCESS_KEY_ID` - AWS Access Key
- `AWS_SECRET_ACCESS_KEY` - AWS Secret Key, also gotten from the access key creation
- `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)

<br />

2. Create an AWS ECR repository blueprint in Port using the blueprint below:

<details>
<summary><b>ECR Repository Blueprint</b></summary>

```json showLineNumbers
{
  "identifier": "ecrRepository",
  "description": "This blueprint represents an ECR Repository",
  "title": "ECR Repository",
  "icon": "AWS",
  "schema": {
    "properties": {
      "registryId": {
        "type": "string",
        "title": "Registry ID",
        "description": "The ID of the registry"
      },
      "arn": {
        "type": "string",
        "title": "Repository ARN",
        "description": "The ARN of the repository"
      },
      "uri": {
        "type": "string",
        "title": "Repository URI",
        "description": "The URI of the repository"
      },
      "createdAt": {
        "type": "string",
        "title": "Created At",
        "description": "Date and time the repository was created",
        "format": "date-time"
      },
      "imageTagMutability": {
        "type": "string",
        "title": "Image Tag Mutability",
        "description": "The image tag mutability setting for the repository",
        "enum": ["MUTABLE", "IMMUTABLE"],
        "enumColors": {
          "MUTABLE": "green",
          "IMMUTABLE": "darkGray"
        }
      },
      "configurationScanOnPush": {
        "type": "boolean",
        "title": "Configuration Scan on Push",
        "description": "Image scanning configuration when pushing images to this repository"
      },
      "encryptionType": {
        "type": "string",
        "title": "Encryption Type",
        "description": "The encryption type of the repository",
        "enum": ["AES256", "KMS"],
        "enumColors": {
          "AES256": "green",
          "KMS": "blue"
        }
      },
      "kmsKey": {
        "type": "string",
        "title": "KMS Key",
        "description": "The KMS key used for encryption"
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

While this step will ensure the `ecrRepository` blueprint is available, the self-service action supports selecting from the list of ingested repositories instead of having to input the repository name. To allow for this option, follow [Port's guide to ingest images and repositories into Port](https://github.com/port-labs/example-ecr-images).

This option is way easier but if you do not want this, you can simply type in repository names to tag them.

3. Create the Port action on the `ecrRepository` blueprint:
    - Head to the [self-service](https://app.getport.io/self-serve) page.
    - Click on the `+ New Action` button.
    - Click on the `{...} Edit JSON` button.
    - Copy and paste the following JSON configuration into the editor:
  
<details>
<summary><b>Port Action: Add Tags to ECR Repository</b></summary>

:::tip Modification Required
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::

```json showLineNumbers
{
  "identifier": "ecrRepository_add_tags_to_ecr_repository",
  "title": "Add Tags to ECR Repository",
  "icon": "AWS",
  "description": "Add tags to a repository on AWS ECR",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "repository": {
          "icon": "DefaultProperty",
          "title": "Repository",
          "type": "string",
          "blueprint": "ecrRepository",
          "description": "Use if repository has been ingested into Port. If both Repository and Repository Name are specified, Repository takes precedence.",
          "format": "entity"
        },
        "tags": {
          "icon": "DefaultProperty",
          "title": "Tags",
          "type": "object",
          "description": "Tags should be in key-value pairs like so: {\"key\": \"value\"}"
        }
      },
      "required": [
        "tags",
        "repository"
      ],
      "order": [
        "tags",
        "repository"
      ]
    },
    "blueprintIdentifier": "ecrRepository"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB-ORG>",
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "add-tags-to-ecr-repository.yml",
    "workflowInputs": {
      "repository": "{{ .inputs.\"repository\" }}",
      "tags": "{{ .inputs.\"tags\" }}",
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

<br />


4. Create a workflow file under `.github/workflows/add-tags-to-ecr-repository.yml` with the content below:

<details>
<summary><b>GitHub workflow (click to expand)</b></summary>

```yaml showLineNumbers
name: Add tags to ECR repository
on:
  workflow_dispatch:
    inputs:
      repository:
        type: string
        required: true
      tags:
        type: string
        required: true
        description: 'Tags should be in key-value pairs like so: {"key": "value"}'
      port_context:
        required: true
        description:
          Action and general port_context (blueprint, run id, etc...)
        type: string

jobs:
  create-entity-in-port-and-update-run:
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
          logMessage: Starting request to add tags to ECR repository

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v1
        if: always()
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Install jq
        run: sudo apt-get install jq

      - name: Add Tags to ECR repository
        env:
          TAGS_JSON: ${{ inputs.tags }}
        run: |
          # Extract key-value pairs from the JSON object
          # {
          #   "env": "test",
          #   "team": "beta"
          # }

          TAGS=$(echo "${TAGS_JSON}" | jq -r '. | to_entries[] | "Key=\(.key),Value=\(.value)"' | tr '\n' ' ')

          aws ecr tag-resource \
          --resource-arn arn:aws:ecr:${{ secrets.AWS_REGION }}:${{ secrets.AWS_ACCOUNT_ID }}:repository/${{ inputs.repository }} \
          --tags ${TAGS}

      - name: Create a log message
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          logMessage: Finished adding tags to ECR repository
```
</details>

<br />


5. Trigger the action from Port's [Self Serve](https://app.getport.io/self-serve). 
6. Done! wait for the ECR repository to be tagged.

