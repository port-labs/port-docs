---
displayed_sidebar: null
description: Use Port AI agents with GitHub Copilot to streamline Infrastructure as Code (IaC) by automatically provisioning cloud resources like S3 buckets
---

# Streamline IaC with AI

Creating new infrastructure should be fast, consistent, and policy-driven. Instead of manually writing Terraform for every new S3 bucket, you can let an AI coding agent generate the Terraform files, open a PR against your IaC repo, and surface the change for review — all from Port.

This guide demonstrates how to create a self-service action that allows developers to request new S3 buckets through Port, which then automatically creates a GitHub issue that gets assigned to GitHub Copilot for Terraform code generation and PR creation.

<img src='/img/guides/ai-iac-workflow.jpg' border="1px" width="100%" />

## Prerequisites

This guide assumes you have:

- Completed the [onboarding process](/getting-started/overview)
- A Port account with [AI agents feature enabled](/ai-interfaces/ai-agents/overview#access-to-the-feature)
- [Port's GitHub app](/build-your-software-catalog/sync-data-to-catalog/git/github/) installed in your account
- Completed the setup in the [Trigger GitHub Copilot from Port guide](/guides/all/trigger-github-copilot-from-port)
- An existing Terraform repository for your infrastructure code
- AWS resources synced into Port (e.g., via [AWS integration](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/))

:::tip Alternative coding agents
While this guide uses GitHub Copilot as the coding agent, you can easily substitute it with other AI coding assistants like [Claude Code](/guides/all/trigger-claude-code-from-port) or [Google Gemini](/guides/all/trigger-gemini-assistant-from-port). Simply update the action's webhook URL and payload structure in the automation to match your preferred coding agent's API.
:::

## Set up data model

First, you need to ensure your data model includes the necessary blueprints for S3 buckets and AWS accounts.

When installing the AWS integration in Port, the `AWS Account` blueprint is created by default.  
However, the `S3` blueprint is not created automatically so we will need to create it manually.

### Create S3 bucket blueprint

1. Go to the [builder](https://app.getport.io/settings/data-model) page of your portal
2. Click on `+ Blueprint`
3. Click on the `{...} Edit JSON` button
4. Copy and paste the following JSON configuration:

<details>
<summary><b>S3 bucket blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "awsS3Bucket",
  "description": "This blueprint represents an AWS S3 bucket in our software catalog",
  "title": "S3",
  "icon": "Bucket",
  "schema": {
    "properties": {
      "link": {
        "format": "url",
        "type": "string",
        "title": "Link"
      },
      "regionalDomainName": {
        "type": "string",
        "title": "Regional Domain Name"
      },
      "versioningStatus": {
        "type": "string",
        "title": "Versioning Status",
        "enum": [
          "Enabled",
          "Suspended"
        ]
      },
      "encryption": {
        "type": "array",
        "title": "Encryption"
      },
      "lifecycleRules": {
        "type": "array",
        "title": "Lifecycle Rules"
      },
      "publicAccessConfig": {
        "type": "object",
        "title": "Public Access"
      },
      "tags": {
        "type": "array",
        "title": "Tags"
      },
      "arn": {
        "type": "string",
        "title": "ARN"
      },
      "region": {
        "type": "string",
        "title": "Region"
      },
      "blockPublicAccess": {
        "type": "boolean",
        "title": "Block Public Access"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "account": {
      "title": "account",
      "target": "awsAccount",
      "required": false,
      "many": false
    }
  }
}
```
</details>

5. Click `Create` to save the blueprint

### Update integration mapping

1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal
2. Find your AWS integration and click on it
3. Go to the `Mapping` tab
4. Add the following YAML configuration:

<details>
<summary><b>AWS integration mapping (Click to expand)</b></summary>

```yaml showLineNumbers
deleteDependentEntities: true
createMissingRelatedEntities: true
enableMergeEntity: true
resources:
  - kind: AWS::Organizations::Account
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .Id
          title: .Name
          blueprint: '"awsAccount"'
          properties:
            arn: .Arn
            email: .Email
            status: .Status
            joined_method: .JoinedMethod
            joined_timestamp: .JoinedTimestamp | sub(" "; "T")
  - kind: AWS::S3::Bucket
    selector:
      query: 'true'
    useGetResourceAPI: true
    port:
      entity:
        mappings:
          identifier: .Identifier
          title: .Identifier
          blueprint: '"awsS3Bucket"'
          properties:
            regionalDomainName: .Properties.RegionalDomainName
            encryption: .Properties.BucketEncryption.ServerSideEncryptionConfiguration
            lifecycleRules: .Properties.LifecycleConfiguration.Rules
            publicAccessConfig: .Properties.PublicAccessBlockConfiguration
            blockPublicAccess: >-
              .Properties.PublicAccessBlockConfiguration | (.BlockPublicAcls and
              .IgnorePublicAcls and .BlockPublicPolicy and
              .RestrictPublicBuckets)
            tags: .Properties.Tags
            arn: .Properties.Arn
            region: .Properties.RegionalDomainName | capture(".*\\.(?<region>[^\\.]+)\\.amazonaws\\.com") | .region
            link: .Properties | select(.Arn != null) | "https://console.aws.amazon.com/go/view?arn=" + .Arn
          relations:
            account: .__AccountId
```
</details>

5. Click `Save & Resync` to apply the mapping


## Create self-service action

Next, you'll create a self-service action that allows developers to request new S3 buckets. This action will collect the necessary information and create a GitHub issue for the AI agent to process.

1. Go to the [self-service](https://app.getport.io/self-serve) page of your portal
2. Click on `+ New Action`
3. Click on the `{...} Edit JSON` button
4. Copy and paste the following JSON configuration:

<details>
<summary><b>Create S3 bucket request action (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "create_s_3_bucket",
  "title": "Create S3 Bucket",
  "icon": "S3",
  "description": "Request a new S3 bucket to be provisioned via Terraform",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "prompt": {
          "type": "string",
          "title": "Description",
          "description": "Describe the S3 bucket you want to create. Include details like bucket name, region, encryption requirements, versioning, lifecycle rules, tags, and any other specific requirements",
          "format": "markdown"
        },
        "terraform_repository": {
          "type": "string",
          "description": "The repository entity that contains your terraform configuration",
          "title": "Terraform Repository",
          "blueprint": "service",
          "format": "entity"
        }
      },
      "required": [
        "prompt",
        "terraform_repository"
      ],
      "order": [
        "prompt",
        "terraform_repository"
      ]
    }
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://api.getport.io/v1/actions/create_github_issue/runs",
    "agent": false,
    "synchronized": true,
    "method": "POST",
    "headers": {
      "RUN_ID": "{{ .run.id }}",
      "Content-Type": "application/json"
    },
    "body": {
      "entity": "{{ .inputs.terraform_repository.identifier }}",
      "properties": {
        "title": "Create an S3 bucket",
        "body": "## S3 Bucket Request\n\n**Terraform Repository:** {{ .inputs.terraform_repository.identifier }}\n\nYou are an expert Terraform author. A user requested a new S3 bucket. Here is the requested configuration:\n\n{{ .inputs.prompt }}\n\nGenerate a set of Terraform files to CREATE an AWS S3 bucket that matches these constraints and engineering best practices:\n\n1) Create a resource \"aws_s3_bucket\" with the provided or suitable name.\n2) Ensure server-side encryption is enabled per the `encryption` field.\n3) Ensure `public_access_block` is enabled (block public ACLs and block public policies) if requested.\n4) Enable versioning when `versioning` is true.\n5) If `lifecycle_rules` are present, translate them into bucket lifecycle rules.\n6) Add required tags from `tags` and ensure tags include `created_by = \"port-ai\"` and `managed_by = \"terraform\"`.\n7) Output the bucket ARN and bucket domain name as Terraform outputs.\n\nFile layout rules:\n- Do not modify unrelated files.\n- If the repo contains a `modules/s3` module, prefer creating a new file that uses that module. If not, create a new file named `s3_<bucket-name>.tf` (sanitize the name to remove invalid chars).\n- Provide a short PR title and description explaining what was created and why.",
        "labels": [
          "infrastructure",
          "terraform",
          "auto_assign"
        ],
        "assign_to_copilot": true
      }
    }
  },
  "requiredApproval": false
}
```
</details>

5. Click `Save` to create the action.


## Test your workflow

Now it's time to test your complete S3 bucket provisioning workflow:

1. Click on the `Request S3 Bucket` action in the [self-service](https://app.getport.io/self-serve) page of your portal
2. Fill out the `prompt` field with your S3 bucket requirements, for example:
   ```
   Create an S3 bucket named "my-kafka-log-east-1-bucket" in the us-east-1 region for development environment.
   
   Requirements:
   - Enable server-side encryption with AWS KMS
   - Enable versioning
   - Block all public access
   - Add tags: Environment=dev, Project=kafka-logs, Owner=platform-team
   ```
3. Select the repository containing your terraform configuration.
4. Click **Execute**

The workflow will then:

1. Create a GitHub issue in your `terraform` repository with the S3 bucket requirements
2. Automatically assign the issue to GitHub Copilot (handled by the prerequisites setup)
3. Copilot generates Terraform code based on the detailed prompt
4. Open a pull request with the generated Terraform files
5. Link the PR back to the original issue for traceability


## Related guides

- [Trigger Claude Code from Port](/guides/all/trigger-claude-code-from-port)
- [Trigger Google Gemini from Port](/guides/all/trigger-gemini-assistant-from-port)
- [Track AI-driven pull requests](/guides/all/track-ai-driven-pull-requests)