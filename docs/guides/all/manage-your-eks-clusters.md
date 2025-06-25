---
displayed_sidebar: null
description: Learn how to manage your AWS EKS clusters using self-service actions in Port.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'

# Manage your EKS clusters

This guide demonstrates how to bring your AWS EKS management experience into Port. You will learn how to:

- Ingest EKS cluster data into Port's software catalog using **Port's AWS** integration.
- Set up **self-service actions** to manage EKS clusters (add tags and delete clusters).

<img src="/img/guides/eksClusterDashboard.png" border="1px" width="100%" />


## Common use cases

- Monitor the status and configuration of all EKS clusters across accounts from a single view.
- Manage cluster lifecycle operations through self-service actions.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [AWS integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/) is installed in your account.

<GithubDedicatedRepoHint/>


## Set up data model

When installing the AWS integration in Port, the `AWS Account` blueprint is created by default.  
However, the `EKS Cluster` blueprint is not created automatically so we will need to create it manually.


### Create the EKS cluster blueprint

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:
    <details>
    <summary><b>AWS EKS Cluster blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "eks_cluster",
      "description": "This blueprint represents an AWS EKS cluster",
      "title": "EKS Cluster",
      "icon": "AWS",
      "schema": {
        "properties": {
          "version": {
            "type": "string",
            "title": "Version"
          },
          "roleArn": {
            "icon": "DefaultProperty",
            "type": "string",
            "title": "Role Arn"
          },
          "endpoint": {
            "type": "string",
            "title": "Endpoint",
            "format": "url"
          },
          "tags": {
            "items": {
              "type": "object"
            },
            "type": "array",
            "title": "Tags"
          },
          "arn": {
            "type": "string",
            "title": "Arn"
          }
        },
        "required": []
      },
      "mirrorProperties": {},
      "calculationProperties": {},
      "aggregationProperties": {},
      "relations": {
        "account": {
          "title": "Account",
          "target": "awsAccount",
          "required": false,
          "many": false
        }
      }
    }
    ```
    </details>

5. Click `Save` to create the blueprint.


### Update the integration mapping

1. Go to the [Data Sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Select the AWS integration.
3. Add the following YAML block into the editor to ingest EKS clusters from your AWS account:

    <details>
    <summary><b>AWS integration configuration (Click to expand)</b></summary>

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
      - kind: AWS::EKS::Cluster
        selector:
          query: 'true'
          useGetResourceAPI: true
        port:
          entity:
            mappings:
              identifier: .Identifier
              title: .Properties.Name
              blueprint: '"eks_cluster"'
              properties:
                tags: .Properties.Tags
                roleArn: .Properties.RoleArn
                arn: .Properties.Arn
                version: .Properties.Version
                endpoint: .Properties.Endpoint
              relations:
                account: .__AccountId
    ```
    </details>
    
4. Click `Save & Resync` to apply the mapping.


## Set up self-service actions

Now let us create self-service actions to manage your EKS clusters directly from Port using GitHub Actions. You will implement workflows to:

1. Add tags to an EKS cluster.
2. Delete an EKS cluster.

To implement these use-cases, follow the steps below:


### Add GitHub secrets

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
- `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `AWS_ACCESS_KEY_ID` - AWS IAM user's access key.
- `AWS_SECRET_ACCESS_KEY` - AWS IAM user's secret access key.
- `AWS_REGION` - AWS region (e.g., `us-east-1`).

:::caution Required permissions
The AWS IAM user must have the following permissions:
- `eks:TagResource` - to add tags to EKS clusters
- `eks:DeleteCluster` - to delete EKS clusters
:::


### Add tags to an EKS cluster

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/add-tags-to-eks.yaml` in the `.github/workflows` folder of your repository.

<details>
<summary><b>Add tags to EKS GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Add Tags to EKS Cluster

on:
  workflow_dispatch:
    inputs:
      resource_tags:
        required: true
        description: 'Metadata that assists with categorization and organization.'
        type: string
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string

jobs:
  tag-eks-cluster:
    runs-on: ubuntu-latest
    steps:
      - name: Inform Port of workflow start
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Configuring AWS credentials to add tags to EKS with domain ${{ fromJson(inputs.port_context).entity.title }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Add tags to EKS
        run: aws eks tag-resource --resource-arn ${{ fromJson(inputs.port_context).entity.properties.arn }} --tags ${{ inputs.resource_tags }}

      - name: Inform Port about EKS tag addition success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ EKS resource with name ${{ fromJson(inputs.port_context).entity.title }} tagged successfully
          summary: EKS tag addition completed successfully

      - name: Inform Port about EKS tag addition failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to add tags to EKS with name ${{ fromJson(inputs.port_context).entity.title }}
          summary: EKS tag addition failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Add tags to EKS action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "add_tags_to_eks",
      "title": "Add Tags to Cluster",
      "icon": "AmazonEKS",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "resource_tags": {
              "type": "string",
              "title": "Resource Tags",
              "description": "The tag to add to the EKS resource following the pattern KeyName1=string,KeyName2=string",
              "default": "KeyName1=string,KeyName2=string"
            }
          },
          "required": [],
          "order": [
            "resource_tags"
          ]
        },
        "blueprintIdentifier": "eks_cluster"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "add-tags-to-eks.yaml",
        "workflowInputs": {
          "{{ spreadValue() }}": "{{ .inputs }}",
          "port_context": {
            "runId": "{{ .run.id }}",
            "entity": "{{ .entity }}"
          }
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Add Tags to EKS` action in the self-service page. 🎉


### Delete an EKS cluster

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/delete-eks-cluster.yaml` in the `.github/workflows` folder of your repository.

<details>
<summary><b>Delete EKS GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Delete EKS Cluster

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string

jobs:
  delete-eks-cluster:
    runs-on: ubuntu-latest
    steps:
      - name: Inform Port of workflow start
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Configuring AWS credentials to delete EKS cluster with domain ${{ fromJson(inputs.port_context).entity.title }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Delete EKS cluster
        run: aws eks delete-cluster --name ${{ fromJson(inputs.port_context).entity.title }}

      - name: Inform Port about EKS cluster deletion success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ EKS cluster with name ${{ fromJson(inputs.port_context).entity.title }} deleted successfully
          summary: EKS cluster deletion completed successfully

      - name: Inform Port about EKS cluster deletion failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to delete EKS cluster with name ${{ fromJson(inputs.port_context).entity.title }}
          summary: EKS cluster deletion failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Delete EKS cluster action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "delete_eks_cluster",
      "title": "Delete EKS Cluster",
      "icon": "AmazonEKS",
      "description": "Delete the Amazon EKS cluster control plane. If you have active services in your cluster that are associated with a load balancer, you must delete those services before deleting the cluster so that the load balancers are deleted properly.",
      "trigger": {
        "type": "self-service",
        "operation": "DELETE",
        "userInputs": {
          "properties": {},
          "required": [],
          "order": []
        },
        "blueprintIdentifier": "eks_cluster"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "delete-eks-cluster.yaml",
        "workflowInputs": {
          "{{ spreadValue() }}": "{{ .inputs }}",
          "port_context": {
            "runId": "{{ .run.id }}",
            "blueprint": "{{ .action.blueprint }}",
            "entity": "{{ .entity }}"
          }
        },
        "reportWorkflowStatus": true
      },
      "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Delete EKS Cluster` action in the self-service page. 🎉


## Related guides
- [Manage and visualize your EC2 instances](/guides/all/visualize-and-manage-aws-ec2-instances)
- [Manage and visualize your ECS tasks](/guides/all/manage-and-visualize-ecs-tasks)
