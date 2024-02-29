---
sidebar_position: 4
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Connect Cloud Resources to Services

This guide demonstrates how to connect a Cloud Resource to a service or list of services by relying on the tags property and using JQ mapping.

:::tip Prerequisites
- This guide assumes that you have a Port account, with a user role of `Admin`, and that you have finished the [onboarding process](/quickstart).
- You will need your [Port credentials](/build-your-software-catalog/sync-data-to-catalog/api/api.md#find-your-port-credentials) to install the AWS exporter.
- Terraform for ingesting the AWS resources.
:::

## Ingest Cloud Resources and Services

1. Follow this [guide](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/git/github/installation) to ingest your GitHub repositories into Port. Port will create for you a `service` blueprint that will be using subsequently.


<details>
<summary>Service Blueprint</summary>

```json showLineNumbers
{
  "identifier": "service",
  "title": "Service",
  "icon": "Github",
  "schema": {
    "properties": {
      "readme": {
        "title": "README",
        "type": "string",
        "format": "markdown",
        "icon": "Book"
      },
      "url": {
        "title": "URL",
        "format": "url",
        "type": "string",
        "icon": "Link"
      },
      "language": {
        "type": "string",
        "title": "Language",
        "icon": "Git"
      },
      "slack": {
        "icon": "Slack",
        "type": "string",
        "title": "Slack",
        "format": "url"
      },
      "tier": {
        "title": "Tier",
        "type": "string",
        "description": "How mission-critical the service is",
        "enum": [
          "Mission Critical",
          "Customer Facing",
          "Internal Service",
          "Other"
        ],
        "enumColors": {
          "Mission Critical": "turquoise",
          "Customer Facing": "green",
          "Internal Service": "darkGray",
          "Other": "yellow"
        },
        "icon": "DefaultProperty"
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

2. Let us now ingest some cloud resources into Port. We will use AWS for this guide but you can easily replicate this for [Azure](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/azure/examples) and [GCP](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/gcp/examples/). For the sake of this guide, we will only ingest S3 buckets:


```bash showLineNumbers
# Export your Port credentials
export PORT_CLIENT_ID=YOUR-PORT-CLIENT-ID
export PORT_CLIENT_SECRET=YOUR-PORT-CLIENT-SECRET

# Clone the terraform template
git clone https://github.com/port-labs/template-assets.git

cd template-assets/aws

# Initialize the Terraform requirements
terraform init

# Deploy the aws exporter and provide the resources you want to export
terraform apply -var 'resources=["s3_bucket"]'
```

<br />

Your [data model](https://app.getport.io/dev-portal/data-model) should now contain these blueprints:

<img src='/img/guides/connectCloudServiceBlueprints.png' width="45%" />


:::info Ingesting AWS Resources.
You can find the complete AWS exporter guide [here](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/Installation).
:::

## Create the Cloud Resource-Service relation

Now that Port is synced with your `s3_bucket` and `service` blueprints, let's map the two together.

1. Add a tag to the bucket with the key `service` and a value representing the identifier of the service. For instance, if your service has an indentifier of `webapp`, create a tag on the bucket with `{ "service": "webapp" }`. 

Refer to the [AWS guide](https://docs.aws.amazon.com/AmazonS3/latest/userguide/tagging-managing.html) for more details on tagging resources in S3.


<img src='/img/guides/connectCloudServiceTagging.png' width="75%" />

<br />
<br />

2. Go to the `template-assets/aws/s3_bucket` folder from the [ingestion step](/guides-and-tutorials/connect-cloud-resource-to-service#ingest-cloud-resources-and-services). We are going to add a relation from our S3 bucket configuration to the `Service` blueprint by editing two files:
   - `blueprint.tf`: We will define the relation to `service` in the S3 bucket blueprint.
   - `config.json`: We then write the mapping logic to define how a service is linked to a bucket based on tags.

<br />

<details>

<summary>S3 Bucket Blueprint</summary>

```hcl showLineNumbers title="blueprint.tf"
terraform {
  required_providers {
    port-labs = {
      source  = "port-labs/port-labs"
      version = "0.10.4"
    }
  }
}

resource "port-labs_blueprint" "s3_bucket" {
  title      = "S3 Bucket"
  icon       = "Bucket"
  identifier = "s3_bucket"

  // ... other properties

  properties {
    identifier = "tags"
    type       = "array"
    title      = "Tags"
  }

// highlight-start
  relations {
    target     = "service"
    title      = "Consuming Service"
    identifier = "consumingService"
    many       = false
    required   = false
  }
// highlight-end
}
```

</details>

<details>

<summary>Mapping Logic</summary>

```json showLineNumbers title="config.json"
{
  "kind": "AWS::S3::Bucket",
  "port": {
    "entity": {
      "mappings": [
        {
          "identifier": ".BucketName",
          "title": ".BucketName",
          "blueprint": "s3_bucket",
          "properties": {
            "link": "\"https://console.aws.amazon.com/go/view?arn=\" + .Arn",
            "regionalDomainName": ".RegionalDomainName",
            "versioningStatus": ".VersioningConfiguration.Status",
            "encryption": ".BucketEncryption.ServerSideEncryptionConfiguration",
            "lifecycleRules": ".LifecycleConfiguration.Rules",
            "publicAccess": ".PublicAccessBlockConfiguration",
            "tags": ".Tags",
            "arn": ".Arn"
          },
          // highlight-start
          "relations": {
            "consumingService": ".Tags[] | select(.Key == \"service\") | .Value"
          }
          // highlight-end
        }
      ]
    }
  }
}
```

</details>

<br />

3. Run terraform again to apply the changes


```hcl
# Run the aws exporter again.

terraform apply -var 'resources=["s3_bucket"]' 
```


## View the relation

You can view the relation in your [data model](https://app.getport.io/dev-portal/data-model)

<img src='/img/guides/connectCloudServiceRelation.png' width="75%" />

<br /> 
<br />

Now go to your [catalog](https://app.getport.io/s3_buckets), and click on the S3 bucket you used in this guide. You will see it connected to the service.

<img src='/img/guides/connectCloudServiceFinal.png' width="100%" />

<br /> 
<br />

Done! 🎉 