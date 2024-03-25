# Add tags to ECR repository

This GitHub action allows you to add tags to an ECR repository via Port Actions with ease.

## Prerequisites

- AWS Access Key and Secret Key pair. Follow [AWS guide on creating access keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey) to create one for your account.
- AWS `AmazonEC2ContainerRegistryFullAccess` policy should be enabled on the account to enable necessary permissions to carry out the action.
- Account ID. Click on the account dropdown settings on the upper right corner in your AWS Console to retrieve it.
- [Port's GitHub app](https://github.com/apps/getport-io) needs to be installed.

## Steps

1. Create the following GitHub action secrets:

- `AWS_REGION` - The region where ECR repositories are located. Available regions can be found on the [Regions, Availability Zones, and Local Zones page](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html#Concepts.RegionsAndAvailabilityZones.Regions) in AWS documentation.
- `AWS_ACCOUNT_ID` - AWS account ID from the [prerequisites step](#prerequisites)
- `AWS_ACCESS_KEY_ID` - AWS Access Key
- `AWS_SECRET_ACCESS_KEY` - AWS Secret Key, also gotten from the access key creation
- `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)

3. Create an AWS ECR repository blueprint in Port using the blueprint below:

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

<!-- :::note Making use of an easy dropdown selection

While this step will ensure the `ecrRepository` blueprint is available, the self-service action supports selecting from the list of ingested repositories instead of having to input the repository name. To allow for this option, follow [Port's guide to ingest images and repositories into Port](https://github.com/port-labs/example-ecr-images).

This option is way easier but if you do not want this, you can simply type in repository names to tag them.

::: -->

4. After creating the blueprint, create the following action with the following JSON file on the `ecrRepository` blueprint:

<details>
<summary><b>Add Tags to ECR Repository Blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "add_tags_to_ecr_repository",
  "title": "Add Tags to ECR Repository",
  "icon": "AWS",
  "userInputs": {
    "properties": {
      "repository": {
        "icon": "DefaultProperty",
        "title": "Repository",
        "type": "string",
        "blueprint": "ecrRepository",
        "description": "Use if respository has been ingested into Port. If both Repository and Repository Name are specified, Repository takes precedence.",
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
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<Enter GitHub organization>",
    "repo": "<Enter GitHub repository>",
    "workflow": "add-tags-to-ecr-repository.yml",
    "omitUserInputs": false,
    "omitPayload": false,
    "reportWorkflowStatus": true
  },
  "trigger": "CREATE",
  "description": "Add tags to a repository on AWS ECR",
  "requiredApproval": false
}
```

</details>

:::note Customisation

Replace the invocation method with your own repository details.

:::

5. Create a workflow file under `.github/workflows/add-tags-to-ecr-repository.yml` with the content below:

<details>
<summary><b>Add Tags to ECR Repository Workflow (Click to expand)</b></summary>

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
      port_payload:
        required: true
        description:
          Port's payload, including details for who triggered the action and
          general context (blueprint, run id, etc...)
        type: string
    secrets:
      AWS_REGION:
        required: true
      AWS_ACCOUNT_ID:
        required: true
      AWS_ACCESS_KEY_ID:
        required: true
      AWS_SECRET_ACCESS_KEY:
        required: true
      PORT_CLIENT_ID:
        required: true
      PORT_CLIENT_SECRET:
        required: true
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
          runId: ${{fromJson(inputs.port_payload).context.runId}}
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
          runId: ${{ fromJson(inputs.port_payload).context.runId }}
          logMessage: Finished adding tags to ECR repository
```

</details>

6. Trigger the action from Port's [Self Serve](https://app.getport.io/self-serve)

7. Done! wait for the ECR repository to be tagged.

Congrats 🎉 You've tagged your ECR repository for the first time from Port!
