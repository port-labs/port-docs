---
displayed_sidebar: null
description: Learn how to monitor and manage your AWS ECS tasks and services using dashboards and self-service actions in Port.
---

# Manage ECS Tasks

This guide demonstrates how to bring your AWS ECS management experience into Port. You will learn how to:

- Ingest ECS cluster and service data into Port's software catalog using **Port's AWS integration**.
- Set up **self-service actions** to manage ECS services (scale tasks up or down, restart services).
- Build **dashboards** in Port to monitor and take action on your ECS deployments.

<img src="/img/guides/ecsTaskDashboard1.png" border="1px" width="100%" />
<img src="/img/guides/ecsTaskDashboard2.png" border="1px" width="100%" />

## Common use cases

- Monitor the health and scaling status of all ECS services across clusters from a single dashboard.
- Quickly scale ECS services up or down based on demand.
- Restart services that are experiencing issues.
- Empower platform teams to manage ECS infrastructure via self-service actions.

## Prerequisites

This guide assumes the following:
- You have a Port account and have completed the [onboarding process](https://docs.port.io/getting-started/overview).
- Port's [AWS integration](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/) is installed in your account.
- You have ECS clusters and services running in your AWS account.

## Set up data model

We'll create blueprints for ECS clusters and services to properly model your containerized infrastructure.

### Create the ECS Cluster blueprint

1. Go to the [Builder](https://app.getport.io/settings/data-model) page of your portal.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

<details>
<summary><b>ECS Cluster blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "ecsCluster",
  "title": "ECS Cluster",
  "icon": "AWS",
  "schema": {
    "properties": {
      "link": {
        "type": "string",
        "title": "Link",
        "format": "url",
        "description": "AWS Console link to the cluster"
      },
      "capacityProviders": {
        "type": "array",
        "title": "Capacity Providers",
        "description": "List of capacity providers for the cluster"
      },
      "activeServicesCount": {
        "type": "number",
        "title": "Active Services",
        "description": "Number of active services in the cluster"
      },
      "runningTasksCount": {
        "type": "number",
        "title": "Running Tasks",
        "description": "Number of currently running tasks"
      },
      "pendingTasksCount": {
        "type": "number",
        "title": "Pending Tasks",
        "description": "Number of pending tasks"
      },
      "tags": {
        "type": "array",
        "title": "Tags"
      },
      "arn": {
        "type": "string",
        "title": "ARN"
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

5. Click `Save` to create the blueprint.

### Create the ECS Service blueprint

1. Click on `+ Blueprint` again.
2. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
3. Add this JSON schema:

<details>
<summary><b>ECS Service blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "ecsService",
  "title": "ECS Service",
  "icon": "Service",
  "schema": {
    "properties": {
      "link": {
        "type": "string",
        "title": "Link",
        "format": "url",
        "description": "AWS Console link to the service"
      },
      "desiredCount": {
        "type": "number",
        "title": "Desired Count",
        "description": "Desired number of tasks for the service"
      },
      "runningCount": {
        "type": "number",
        "title": "Running Count",
        "description": "Number of tasks currently running"
      },
      "pendingCount": {
        "type": "number",
        "title": "Pending Count",
        "description": "Number of tasks pending"
      },
      "taskDefinition": {
        "type": "string",
        "title": "Task Definition",
        "description": "Task definition used by the service"
      },
      "launchType": {
        "type": "string",
        "title": "Launch Type",
        "enum": ["EC2", "FARGATE", "EXTERNAL"],
        "enumColors": {
          "EC2": "blue",
          "FARGATE": "green",
          "EXTERNAL": "orange"
        }
      },
      "status": {
        "type": "string",
        "title": "Status",
        "enum": ["ACTIVE", "DRAINING", "INACTIVE"],
        "enumColors": {
          "ACTIVE": "green",
          "DRAINING": "yellow",
          "INACTIVE": "red"
        }
      },
      "schedulingStrategy": {
        "type": "string",
        "title": "Scheduling Strategy",
        "enum": ["REPLICA", "DAEMON"]
      },
      "platformVersion": {
        "type": "string",
        "title": "Platform Version"
      },
      "loadBalancers": {
        "type": "array",
        "title": "Load Balancers"
      },
      "arn": {
        "type": "string",
        "title": "ARN"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {
    "healthStatus": {
      "title": "Health Status",
      "icon": "DefaultProperty",
      "calculation": ".properties.runningCount == .properties.desiredCount",
      "type": "boolean",
      "colorized": true,
      "colors": {
        "true": "green",
        "false": "red"
      }
    }
  },
  "aggregationProperties": {},
  "relations": {
    "cluster": {
      "title": "Cluster",
      "target": "ecsCluster",
      "required": false,
      "many": false
    }
  }
}
```

</details>

4. Click `Save` to create the blueprint.

## Update the integration mapping

1. Go to the [Data Sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Select your AWS integration.
3. Add the following YAML block into the editor to ingest ECS clusters and services:

<details>
<summary><b>AWS integration configuration (Click to expand)</b></summary>

```yaml showLineNumbers
resources:
  - kind: AWS::ECS::Cluster
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .ClusterName
          title: .ClusterName
          blueprint: '"ecsCluster"'
          properties:
            link: '"https://console.aws.amazon.com/go/view?arn=" + .Arn'
            capacityProviders: .CapacityProviders
            activeServicesCount: .ActiveServicesCount
            runningTasksCount: .RunningTasksCount
            pendingTasksCount: .PendingTasksCount
            tags: .Tags
            arn: .Arn
  - kind: AWS::ECS::Service
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .ServiceName
          title: .ServiceName
          blueprint: '"ecsService"'
          properties:
            link: '"https://console.aws.amazon.com/go/view?arn=" + .ServiceArn'
            desiredCount: .DesiredCount
            runningCount: .RunningCount
            pendingCount: .PendingCount
            taskDefinition: .TaskDefinition | split("/")[-1]
            launchType: .LaunchType
            status: .Status
            schedulingStrategy: .SchedulingStrategy
            platformVersion: .PlatformVersion
            loadBalancers: .LoadBalancers
            arn: .ServiceArn
          relations:
            cluster: .Cluster | split("/")[-1]
```

</details>

4. Click `Save & Resync` to apply the mapping.

## Set up self-service actions

We will create self-service actions in Port to directly interact with the AWS ECS API. These actions let users:

1. Scale ECS service tasks up or down.
2. Restart an ECS service.
3. Update service configuration.

Each action will be configured via JSON and triggered using **GitHub workflows** with AWS credentials. To implement these use-cases, follow the steps below:

### Scale ECS Service

This action allows users to modify the desired count of tasks for an ECS service.

1. Go to the [Self-service](https://app.getport.io/self-serve) page of your portal.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

<details>
<summary><b>Scale ECS Service action (Click to expand)</b></summary>

:::tip Replace placeholders
Replace `<GITHUB-ORG>` and `<GITHUB-REPO-NAME>` with your GitHub organization and repository names.
:::

```json showLineNumbers
{
  "identifier": "scale_ecs_service",
  "title": "Scale ECS Service",
  "icon": "AWS",
  "description": "Scale the desired count of tasks for an ECS service",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {
        "desired_count": {
          "title": "Desired Count",
          "type": "number",
          "description": "Number of tasks to run",
          "minimum": 0,
          "maximum": 100,
          "default": 1
        }
      },
      "required": ["desired_count"],
      "order": ["desired_count"]
    },
    "blueprintIdentifier": "ecsService"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB-ORG>",
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "scale-ecs-service.yml",
    "workflowInputs": {
      "desired_count": "{{.inputs.\"desired_count\"}}",
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

5. Click `Save`.

### Restart ECS Service

This action forces a new deployment of the ECS service, which can help resolve issues with stuck tasks.

1. Click on the `+ New Action` button again.
2. Click on the `{...} Edit JSON` button.
3. Copy and paste the following JSON configuration:

<details>
<summary><b>Restart ECS Service action (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "restart_ecs_service",
  "title": "Restart ECS Service",
  "icon": "Reload",
  "description": "Force a new deployment of the ECS service",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {},
      "required": [],
      "order": []
    },
    "blueprintIdentifier": "ecsService"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB-ORG>",
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "restart-ecs-service.yml",
    "workflowInputs": {
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

4. Click `Save`.

## Create GitHub workflows

Create the following workflow files in your repository under `.github/workflows/`:

### Scale ECS Service workflow

<details>
<summary><b>scale-ecs-service.yml (Click to expand)</b></summary>

```yaml showLineNumbers
name: Scale ECS Service

on:
  workflow_dispatch:
    inputs:
      desired_count:
        description: 'New desired task count'
        required: true
        type: number
      port_context:
        required: true
        description: 'Action and general context (blueprint, run id, etc...)'
        type: string

jobs:
  scale-ecs-service:
    runs-on: ubuntu-latest
    steps:
      - name: Inform Port about workflow start
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Configuring AWS credentials and scaling ECS service

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Scale ECS Service
        run: |
          CLUSTER_NAME="${{ fromJson(inputs.port_context).entity.relations.cluster }}"
          SERVICE_NAME="${{ fromJson(inputs.port_context).entity.identifier }}"
          
          echo "Scaling ECS service $SERVICE_NAME in cluster $CLUSTER_NAME to ${{ github.event.inputs.desired_count }} tasks"
          
          aws ecs update-service \
            --cluster "$CLUSTER_NAME" \
            --service "$SERVICE_NAME" \
            --desired-count "${{ github.event.inputs.desired_count }}"

      - name: Wait for service to stabilize
        run: |
          CLUSTER_NAME="${{ fromJson(inputs.port_context).entity.relations.cluster }}"
          SERVICE_NAME="${{ fromJson(inputs.port_context).entity.identifier }}"
          
          echo "Waiting for service to reach stable state..."
          aws ecs wait services-stable \
            --cluster "$CLUSTER_NAME" \
            --services "$SERVICE_NAME"

      - name: Inform Port about successful scaling
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          status: 'SUCCESS'
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Successfully scaled ECS service ${{ fromJson(inputs.port_context).entity.identifier }} to ${{ github.event.inputs.desired_count }} tasks

      - name: Inform Port about failed scaling
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          status: 'FAILURE'
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Failed to scale ECS service ${{ fromJson(inputs.port_context).entity.identifier }}
```

</details>

### Restart ECS Service workflow

<details>
<summary><b>restart-ecs-service.yml (Click to expand)</b></summary>

```yaml showLineNumbers
name: Restart ECS Service

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: 'Action and general context (blueprint, run id, etc...)'
        type: string

jobs:
  restart-ecs-service:
    runs-on: ubuntu-latest
    steps:
      - name: Inform Port about workflow start
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Configuring AWS credentials and restarting ECS service

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ secrets.AWS_REGION }}

      - name: Force new deployment
        run: |
          CLUSTER_NAME="${{ fromJson(inputs.port_context).entity.relations.cluster }}"
          SERVICE_NAME="${{ fromJson(inputs.port_context).entity.identifier }}"
          
          echo "Forcing new deployment for ECS service $SERVICE_NAME in cluster $CLUSTER_NAME"
          
          aws ecs update-service \
            --cluster "$CLUSTER_NAME" \
            --service "$SERVICE_NAME" \
            --force-new-deployment

      - name: Wait for deployment to complete
        run: |
          CLUSTER_NAME="${{ fromJson(inputs.port_context).entity.relations.cluster }}"
          SERVICE_NAME="${{ fromJson(inputs.port_context).entity.identifier }}"
          
          echo "Waiting for deployment to complete..."
          aws ecs wait services-stable \
            --cluster "$CLUSTER_NAME" \
            --services "$SERVICE_NAME"

      - name: Inform Port about successful restart
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          status: 'SUCCESS'
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Successfully restarted ECS service ${{ fromJson(inputs.port_context).entity.identifier }}

      - name: Inform Port about failed restart
        if: failure()
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          baseUrl: https://api.getport.io
          operation: PATCH_RUN
          status: 'FAILURE'
          runId: ${{fromJson(inputs.port_context).runId}}
          logMessage: Failed to restart ECS service ${{ fromJson(inputs.port_context).entity.identifier }}
```

</details>

### Add GitHub secrets

Add the following secrets to your GitHub repository:

1. Go to your GitHub repository settings.
2. Navigate to **Secrets and variables** > **Actions**.
3. Add the following repository secrets:
   - `PORT_CLIENT_ID`: Your Port client ID
   - `PORT_CLIENT_SECRET`: Your Port client secret
   - `AWS_ACCESS_KEY_ID`: AWS access key with ECS permissions
   - `AWS_SECRET_ACCESS_KEY`: AWS secret access key
   - `AWS_REGION`: Your AWS region (e.g., `us-east-1`)

:::warning AWS Permissions
Ensure your AWS credentials have the following permissions:
- `ecs:UpdateService`
- `ecs:DescribeServices`
- `ecs:ListServices`
- `ecs:DescribeClusters`
:::

## Visualize ECS metrics

With ECS data ingested and actions configured, the next step is building a dashboard to monitor ECS services directly in Port.

### Create a dashboard

1. Navigate to the [Catalog](https://app.getport.io/organization/catalog) page of your portal.
2. Click on the **`+ New`** button in the left sidebar.
3. Select **New dashboard**.
4. Name the dashboard **ECS Task Manager**.
5. Input `A dashboard to monitor and manage ECS services and tasks` under **Description**.
6. Select the `AWS` icon.
7. Click `Create`.

### Add widgets

In the new dashboard, create the following widgets:

<details>
<summary><b>Total ECS Services (Click to expand)</b></summary>

1. Click `+ Widget` and select **Number Chart**.
2. Title: `Total ECS Services` (add the `Service` icon).
3. Select `Count entities` **Chart type** and choose **ECS Service** as the **Blueprint**.
4. Select `count` for the **Function**.
5. Click `Save`.

</details>

<details>
<summary><b>Services by Launch Type (Click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Services by Launch Type` (add the `AWS` icon).
3. Choose the **ECS Service** blueprint.
4. Under `Breakdown by property`, select the **Launch Type** property.
5. Click **Save**.

</details>

<details>
<summary><b>Service Health Status (Click to expand)</b></summary>

1. Click **`+ Widget`** and select **Pie chart**.
2. Title: `Service Health Status` (add the `DefaultProperty` icon).
3. Choose the **ECS Service** blueprint.
4. Under `Breakdown by property`, select the **Health Status** property.
5. Click **Save**.

</details>

<details>
<summary><b>Scale Service Action (Click to expand)</b></summary>

1. Click **`+ Widget`** and select **Action card**.
2. Choose the **Scale ECS Service** action we created.
3. Click **Save**.

</details>

<details>
<summary><b>Restart Service Action (Click to expand)</b></summary>

1. Click **`+ Widget`** and select **Action card**.
2. Choose the **Restart ECS Service** action we created.
3. Click **Save**.

</details>

<details>
<summary><b>All ECS Services Table (Click to expand)</b></summary>

1. Click **`+ Widget`** and select **Table**.
2. Title the widget **All ECS Services**.
3. Choose the **ECS Service** blueprint.
4. Click **Save** to add the widget to the dashboard.
5. Click on the **`...`** button in the top right corner of the table and select **Customize table**.
6. In the top right corner of the table, click on `Manage Properties` and add the following properties:
   - **Status**: The current status of the service
   - **Desired Count**: Target number of tasks
   - **Running Count**: Currently running tasks
   - **Health Status**: Calculated health indicator
   - **Launch Type**: How tasks are launched
   - **Link**: AWS Console link
   - **Cluster**: Related ECS cluster
7. Click on the **save icon** in the top right corner of the widget to save the customized table.

</details>

## Next steps

Now you have a complete ECS management setup in Port! You can:

- **Monitor** all your ECS services from a single dashboard
- **Scale** services up or down based on demand
- **Restart** services that are experiencing issues
- **Track** service health and task distribution

:::tip Advanced configurations
Consider extending this setup with:
- Auto-scaling policies based on CloudWatch metrics
- Integration with application load balancer target groups
- Task definition version management
- Service discovery and networking configuration
:::

## Conclusion

You have successfully set up a comprehensive ECS task management system in Port. Your platform teams can now easily monitor service health, scale workloads, and perform day-2 operations without needing direct AWS console access. The self-service actions provide a controlled way to manage infrastructure while maintaining visibility and audit trails through Port's action logs. 