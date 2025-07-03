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

Now let us create a self-service action to manage your Auto Scaling Groups directly from Port using GitHub Actions. You will implement a workflow to scale an Auto Scaling Group by changing its desired capacity.

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
      desired_capacity:
        required: true
        description: 'The desired capacity for the Auto Scaling Group'
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
          logMessage: Configuring AWS credentials to scale Auto Scaling Group ${{ fromJson(inputs.port_context).entity.title }} to desired capacity ${{ inputs.desired_capacity }}

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Validate desired capacity
        run: |
          MIN_SIZE=${{ fromJson(inputs.port_context).entity.properties.minSize }}
          DESIRED_CAPACITY=${{ inputs.desired_capacity }}
          
          # Convert to integer for comparison
          DESIRED_INT=$(echo "$DESIRED_CAPACITY" | bc)
          MIN_INT=$(echo "$MIN_SIZE" | bc)
          
          if [ "$DESIRED_INT" -lt "$MIN_INT" ]; then
            echo "❌ Desired capacity $DESIRED_CAPACITY cannot be lower than minimum size $MIN_SIZE"
            exit 1
          fi
          
          echo "✅ Desired capacity $DESIRED_CAPACITY validation passed"

      - name: Scale Auto Scaling Group
        run: |
          MAX_SIZE=${{ fromJson(inputs.port_context).entity.properties.maxSize }}
          DESIRED_CAPACITY=${{ inputs.desired_capacity }}
          
          # Convert to integers for comparison
          DESIRED_INT=$(echo "$DESIRED_CAPACITY" | bc)
          MAX_INT=$(echo "$MAX_SIZE" | bc)
          
          # If desired capacity exceeds max size, update both desired and max
          if [ "$DESIRED_INT" -gt "$MAX_INT" ]; then
            echo "📈 Desired capacity $DESIRED_CAPACITY exceeds max size $MAX_SIZE. Updating both values..."
            aws autoscaling update-auto-scaling-group \
              --auto-scaling-group-name ${{ fromJson(inputs.port_context).entity.title }} \
              --desired-capacity $DESIRED_CAPACITY \
              --max-size $DESIRED_CAPACITY
          else
            echo "📊 Updating desired capacity to $DESIRED_CAPACITY..."
            aws autoscaling update-auto-scaling-group \
              --auto-scaling-group-name ${{ fromJson(inputs.port_context).entity.title }} \
              --desired-capacity $DESIRED_CAPACITY
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
          logMessage: ✅ Auto Scaling Group ${{ fromJson(inputs.port_context).entity.title }} scaled to desired capacity ${{ inputs.desired_capacity }} successfully
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
          logMessage: ❌ Failed to scale Auto Scaling Group ${{ fromJson(inputs.port_context).entity.title }} to desired capacity ${{ inputs.desired_capacity }}
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
      "identifier": "scale_autoscaling_group",
      "title": "Scale Auto Scaling Group",
      "icon": "AWS",
      "description": "The desired capacity for the Auto Scaling Group (must be at least the minimum size; max size will be automatically increased if needed)",
      "trigger": {
        "type": "self-service",
        "operation": "DAY-2",
        "userInputs": {
          "properties": {
            "desired_capacity": {
              "icon": "DefaultProperty",
              "type": "number",
              "title": "Desired Capacity",
              "description": "The desired capacity for the Auto Scaling Group"
            }
          },
          "required": [
            "desired_capacity"
          ],
          "order": [
            "desired_capacity"
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
          "desired_capacity": "{{ .inputs.desired_capacity | tostring}}",
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

Now you should see the `Scale Auto Scaling Group` action in the self-service page. 🎉

:::tip AWS Auto Scaling behavior
The configuration validates that the desired capacity is at least the minimum size. If the desired capacity exceeds the maximum size, the workflow will automatically update both the desired capacity and maximum size to match your input, just like in the AWS console.
:::

## Related guides
- [Manage and visualize your EC2 instances](/guides/all/visualize-and-manage-aws-ec2-instances)
- [Manage and visualize your ECS tasks](/guides/all/manage-and-visualize-ecs-tasks)