---
displayed_sidebar: null
description: Effortlessly add tags to your S3 buckets in Port, enabling enhanced resource organization and efficient management.
---

# Add tags to S3 Bucket

This GitHub action allows you to add tags to an S3 Bucket via Port Actions with ease.

## Prerequisites

- AWS Access Key and Secret Key pair. Follow [AWS guide on creating access keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey) to create one for your account.
- AWS `AmazonS3FullAccess` policy should be enabled on the account to enable necessary permissions to carry out the action.
- [Port's GitHub app](https://github.com/apps/getport-io) needs to be installed.

## Steps

1. Create the following GitHub action secrets:

- `AWS_REGION` - The region where S3 buckets are located. Available regions can be found on the [Regions, Availability Zones, and Local Zones page](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html#Concepts.RegionsAndAvailabilityZones.Regions) in AWS documentation.
- `AWS_ACCESS_KEY_ID` - AWS Access Key
- `AWS_SECRET_ACCESS_KEY` - AWS Secret Key, also gotten from the access key creation
- `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token)

3. Create an AWS S3 Bucket blueprint in Port using the blueprint below:

:::tip Ingest AWS Resources
Use our [AWS exporter](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-exporter/installation#terraform-installation-recommended) to ingest different kinds of resources from your AWS account. For instance, leverage it to [automatically generate the S3 blueprint and import all existing buckets](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/aws-exporter/examples#s3-buckets) within your AWS account.
:::

<details>
<summary><b>S3 Bucket Blueprint</b></summary>

```json showLineNumbers
{
  "identifier": "s3_bucket",
  "description": "",
  "title": "S3 Bucket",
  "icon": "Bucket",
  "schema": {
    "properties": {
      "arn": {
        "type": "string",
        "title": "ARN"
      },
      "encryption": {
        "type": "array",
        "title": "Encryption"
      },
      "lifecycleRules": {
        "type": "array",
        "title": "Lifecycle Rules"
      },
      "link": {
        "type": "string",
        "title": "Link",
        "format": "url"
      },
      "publicAccess": {
        "type": "object",
        "title": "Public Access"
      },
      "regionalDomainName": {
        "type": "string",
        "title": "Regional Domain Name"
      },
      "tags": {
        "type": "array",
        "title": "Tags"
      },
      "versioningStatus": {
        "type": "string",
        "title": "Versioning Status",
        "enum": ["Enabled", "Suspended"]
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

4. After creating the blueprint, create the following action with the following JSON file on the `s3_bucket` blueprint:

<details>
<summary><b>Port Action: Add Tags to S3 Bucket</b></summary>

:::note Customisation
Replace the invocation method with your own repository details.

- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
  :::

```json showLineNumbers
{
  "identifier": "add_tags_to_s3_bucket",
  "title": "Add Tags to S3 Bucket",
  "icon": "AWS",
  "description": "Add tags to an S3 bucket",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "tags": {
          "icon": "DefaultProperty",
          "title": "Tags",
          "type": "object",
          "description": "Tags should be in key-value pairs like so: {\"key\": \"value\"}"
        }
      },
      "required": ["tags"],
      "order": ["tags"]
    },
    "blueprintIdentifier": "s3_bucket"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB-ORG>",
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "add-tags-to-s3-bucket.yml",
    "workflowInputs": {
      "tags": "{{ .inputs.tags }}",
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

5. Create a workflow file under `.github/workflows/add-tags-to-s3-bucket.yml` with the content below:

<details>
<summary><b>Add Tags to S3 Bucket Workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Add Tags to S3 Bucket

on:
  workflow_dispatch:
    inputs:
      tags: # json object
        required: true
        type: string
      port_context:
        required: true
        type: string

jobs:
  tag-s3-bucket:
    runs-on: ubuntu-latest
    steps:
      - name: Inform starting of action
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          logMessage: |
            Starting a GitHub workflow to tag the AWS resource: ${{fromJson(inputs.port_context).entity.identifier}} ... ⛴️

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v1
        if: always()
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Add Tags to S3 Bucket
        env:
          BUCKET_NAME: ${{ fromJson(inputs.port_context).entity.identifier }}
          TAGS_JSON: ${{ github.event.inputs.tags }}
        run: |
          # Extract key-value pairs from the JSON object
          # {
          #   "env": "test",
          #   "team": "beta"
          # }

          TAGS=$(echo "${TAGS_JSON}" | jq -r 'to_entries | map("\(.key)=\(.value)") | join(" ")')

          aws s3api put-bucket-tagging \
            --bucket ${BUCKET_NAME} \
            --tagging "TagSet=${TAGS}"

      - name: Create a log message
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Added tags to ${{fromJson(inputs.port_context).entity.identifier}}
```

</details>

6. Trigger the action from Port's [self-service](https://app.getport.io/self-serve) page.

Done 🎉 You've tagged your S3 Bucket for the first time from Port!
