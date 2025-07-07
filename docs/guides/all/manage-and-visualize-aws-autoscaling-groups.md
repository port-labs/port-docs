---
displayed_sidebar: null
description: Learn how to manage your AWS Auto Scaling Groups using self-service actions in Port.
---

import GithubActionModificationHint from '/docs/guides/templates/github/_github_action_modification_required_hint.mdx'
import GithubDedicatedRepoHint from '/docs/guides/templates/github/_github_dedicated_workflows_repository_hint.mdx'


# Manage your AWS Auto Scaling Groups

This guide demonstrates how to bring your AWS Auto Scaling Group management experience into Port. You will learn how to:

- Ingest Auto Scaling Group data into Port's software catalog using **Port's AWS** integration.
- Set up **self-service action** to manage Auto Scaling Groups (scale up/down by changing desired capacity).

<img src="/img/guides/autoscalingDashboard1.png" border="1px" width="100%" />


## Common use cases

- Monitor the capacity and scaling configuration of all Auto Scaling Groups across accounts from a single view.
- Empower platform teams to automate scaling operations via GitHub workflow.


## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [AWS integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/) is installed in your account.

<GithubDedicatedRepoHint/>


## Set up data model

When installing the AWS integration in Port, the `AWS Account` blueprint is created by default.  
However, the `Auto Scaling Group` blueprint is not created automatically so we will need to create it manually.


### Create the Auto Scaling Group blueprint

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:
    <details>
    <summary><b>AWS Auto Scaling Group blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
      "identifier": "autoScalingGroup",
      "description": "This blueprint represents an AWS Auto Scaling Group in our software catalog",
      "title": "Auto Scaling Group",
      "icon": "AWS",
      "schema": {
        "properties": {
          "link": {
            "type": "string",
            "format": "url",
            "title": "Link"
          },
          "desiredCapacity": {
            "type": "number",
            "title": "Desired Capacity"
          },
          "minSize": {
            "type": "number",
            "title": "Minimum Size"
          },
          "maxSize": {
            "type": "number",
            "title": "Maximum Size"
          },
          "arn": {
            "type": "string",
            "title": "ARN"
          },
          "role": {
            "type": "string",
            "format": "url",
            "title": "Service Linked Role ARN"
          },
          "tags": {
            "items": {
              "type": "object"
            },
            "type": "array",
            "title": "Tags"
          },
          "region": {
            "type": "string",
            "title": "Region"
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
          "required": true,
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
3. Add the following YAML block into the editor to ingest Auto Scaling Groups from your AWS account:

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
      - kind: AWS::AutoScaling::AutoScalingGroup
        selector:
          query: 'true'
          useGetResourceAPI: 'true'
        port:
          entity:
            mappings:
              identifier: .Identifier
              title: .Properties.AutoScalingGroupName
              blueprint: '"autoScalingGroup"'
              properties:
                link: ("https://console.aws.amazon.com/ec2/home?region=" + .__Region + "#AutoScalingGroupDetails:id=" + .Properties.AutoScalingGroupName + ";view=details" | tostring)
                desiredCapacity: .Properties.DesiredCapacity
                minSize: .Properties.MinSize
                maxSize: .Properties.MaxSize
                arn: .Properties.AutoScalingGroupARN
                role: ("https://console.aws.amazon.com/go/view?arn=" + .Properties.ServiceLinkedRoleARN | tostring)
                tags: .Properties.Tags
                region: .__Region
              relations:
                account: .__AccountId
    ```
    </details>
    
4. Click `Save & Resync` to apply the mapping.


## Set up self-service action

Now let us create a self-service action to manage your Auto Scaling Groups directly from Port using GitHub Actions. You will implement a workflow that provides predefined scaling operations based on the Auto Scaling Group's current configuration.

To implement this use-case, follow the steps below:


### Add GitHub secrets

In your GitHub repository, [go to **Settings > Secrets**](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) and add the following secrets:
- `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#get-api-token).
- `AWS_ACCESS_KEY_ID` - AWS IAM user's access key.
- `AWS_SECRET_ACCESS_KEY` - AWS IAM user's secret access key.
- `AWS_REGION` - AWS region (e.g., `us-east-1`).

:::caution Required permissions
The AWS IAM user must have the following permissions to manage Auto Scaling Groups:
- `autoscaling:UpdateAutoScalingGroup`
- `autoscaling:DescribeScalingPlans`
:::


### Scale Auto Scaling Group

<h4> Add GitHub workflow </h4>

Create the file `.github/workflows/scale-autoscaling-group.yaml` in the `.github/workflows` folder of your repository.

<details>
<summary><b>Scale Auto Scaling Group GitHub workflow (Click to expand)</b></summary>

```yaml showLineNumbers
name: Scale Auto Scaling Group

on:
  workflow_dispatch:
    inputs:
      operation:
        required: true
        description: 'The scaling operation to perform'
        type: string
      port_context:
        required: true
        description: 'Action and general context (blueprint, entity, run id, etc...)'
        type: string

jobs:
  scale-autoscaling-group:
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
          logMessage: Configuring AWS credentials to perform ${{ inputs.operation }} operation on Auto Scaling Group ${{ fromJson(inputs.port_context).entity.title }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Calculate new desired capacity
        run: |
          CURRENT_DESIRED=${{ fromJson(inputs.port_context).entity.properties.desiredCapacity }}
          MIN_SIZE=${{ fromJson(inputs.port_context).entity.properties.minSize }}
          MAX_SIZE=${{ fromJson(inputs.port_context).entity.properties.maxSize }}
          OPERATION="${{ inputs.operation }}"
          
          case $OPERATION in
            "scale up")
              NEW_DESIRED=$((CURRENT_DESIRED + 1))
              echo "📈 Scaling up from $CURRENT_DESIRED to $NEW_DESIRED"
              ;;
            "scale down")
              NEW_DESIRED=$((CURRENT_DESIRED - 1))
              echo "📉 Scaling down from $CURRENT_DESIRED to $NEW_DESIRED"
              ;;
            "scale to max")
              NEW_DESIRED=$MAX_SIZE
              echo "🚀 Scaling to maximum capacity: $NEW_DESIRED"
              ;;
            "scale to min")
              NEW_DESIRED=$MIN_SIZE
              echo "📉 Scaling to minimum capacity: $NEW_DESIRED"
              ;;
            *)
              echo "❌ Unknown operation: $OPERATION"
              exit 1
              ;;
          esac
          
          # Validate the new desired capacity
          if [ "$NEW_DESIRED" -lt "$MIN_SIZE" ]; then
            echo "❌ Cannot scale down below minimum size $MIN_SIZE"
            exit 1
          fi
          
          echo "NEW_DESIRED=$NEW_DESIRED" >> $GITHUB_ENV
          echo "MAX_SIZE=$MAX_SIZE" >> $GITHUB_ENV
          echo "✅ New desired capacity calculated: $NEW_DESIRED"

      - name: Scale Auto Scaling Group
        run: |
          
          # Convert to integers for comparison
          NEW_DESIRED_INT=$(echo "$NEW_DESIRED" | bc)
          MAX_SIZE_INT=$(echo "$MAX_SIZE" | bc)
          
          # If desired capacity exceeds max size, update both desired and max
          if [ "$NEW_DESIRED_INT" -gt "$MAX_SIZE_INT" ]; then
            echo "📈 Desired capacity $NEW_DESIRED_INT exceeds max size $MAX_SIZE_INT. Updating both values..."
            aws autoscaling update-auto-scaling-group \
              --auto-scaling-group-name ${{ fromJson(inputs.port_context).entity.title }} \
              --desired-capacity $NEW_DESIRED \
              --max-size $NEW_DESIRED
          else
            echo "📊 Updating desired capacity to $NEW_DESIRED..."
            aws autoscaling update-auto-scaling-group \
              --auto-scaling-group-name ${{ fromJson(inputs.port_context).entity.title }} \
              --desired-capacity $NEW_DESIRED
          fi

      - name: Inform Port about Auto Scaling Group scaling success
        if: success()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'SUCCESS'
          logMessage: ✅ Auto Scaling Group ${{ fromJson(inputs.port_context).entity.title }} ${{ inputs.operation }} operation completed successfully
          summary: Auto Scaling Group scaling completed successfully

      - name: Inform Port about Auto Scaling Group scaling failure
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          status: 'FAILURE'
          logMessage: ❌ Failed to perform ${{ inputs.operation }} operation on Auto Scaling Group ${{ fromJson(inputs.port_context).entity.title }}
          summary: Auto Scaling Group scaling failed
```
</details>

<h4> Create Port action </h4>

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Scale Auto Scaling Group action (Click to expand)</b></summary>

    <GithubActionModificationHint/>

    ```json showLineNumbers
    {
      "identifier": "scale_auto_scaling_group",
      "title": "Scale Auto Scaling Group",
      "icon": "AWS",
      "description": "Set the size of the specified Auto Scaling group",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "operation": {
              "type": "string",
              "title": "Operation",
              "enum": [
                "scale up",
                "scale down",
                "scale to max",
                "scale to min"
              ],
              "enumColors": {
                "scale up": "lightGray",
                "scale down": "lightGray",
                "scale to max": "lightGray",
                "scale to min": "lightGray"
              }
            }
          },
          "required": [],
          "order": [
            "operation"
          ]
        },
        "blueprintIdentifier": "autoScalingGroup"
      },
      "invocationMethod": {
        "type": "GITHUB",
        "org": "<GITHUB-ORG>",
        "repo": "<GITHUB-REPO>",
        "workflow": "scale-autoscaling-group.yaml",
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

Now you should see the `Scale Auto Scaling Groups` action in the self-service page. 🎉

:::tip Predefined scaling operations
The action provides four simple scaling operations that automatically calculate the appropriate desired capacity based on the Auto Scaling Group's current configuration and limits.
:::


## Related guides
- [Manage and visualize your EC2 instances](/guides/all/visualize-and-manage-aws-ec2-instances)
- [Manage and visualize your ECS tasks](/guides/all/manage-and-visualize-ecs-tasks)