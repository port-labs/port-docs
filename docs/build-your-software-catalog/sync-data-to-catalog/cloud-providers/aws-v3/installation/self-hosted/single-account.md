---
sidebar_position: 1
sidebar_label: Single account
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import IntegrationVersion from "/src/components/IntegrationVersion/IntegrationVersion"

# Single account installation

<IntegrationVersion integration="aws-v3" />

This guide walks you through deploying the AWS integration to sync resources from a single AWS account into Port. The integration runs as a container that authenticates with AWS, discovers resources, and syncs them to your software catalog on a configurable schedule.

## Prerequisites

- [Port API credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials) (`PORT_CLIENT_ID` and `PORT_CLIENT_SECRET`).

## Choose your authentication method

<Tabs groupId="single-account-auth" queryString="single-account-auth" defaultValue="iam-role">

<TabItem value="iam-role" label="IAM Role (Recommended)">

IAM roles use temporary credentials that AWS rotates automatically, eliminating the need to manage static access keys.

**Prerequisites:** Permissions to create IAM roles and deploy CloudFormation stacks.

<Tabs groupId="iac-method" queryString="iac-method" defaultValue="cloudformation">

<TabItem value="cloudformation" label="CloudFormation">

Choose your compute environment:

<Tabs groupId="deployment-method-cloudformation" queryString="deployment-method-cloudformation" defaultValue="ecs">

<TabItem value="ecs" label="ECS Fargate">

<h4>Step 1: Deploy the CloudFormation stack</h4>

1. Open the [AWS CloudFormation console](https://console.aws.amazon.com/cloudformation).
2. Click **Create stack** → **With new resources (standard)**.
3. Select **Amazon S3 URL** and enter:
   ```text
   https://cf-templates-1ucvbilw6hgu4-us-east-1.s3.us-east-1.amazonaws.com/2026-01-26T185519.865Z92i-port-ocean-aws-v3-ecs-complete.yaml
   ```
4. Click **Next**, enter a stack name (for example, `port-aws-integration`).
5. Fill in the required parameters:
   - **PortClientId**: Your Port client ID.
   - **PortClientSecret**: Your Port client secret.
6. Click **Next**, then **Next** again, check the IAM acknowledgment box, and click **Submit**.

<details>
<summary><b>All stack parameters (click to expand)</b></summary>

| Parameter | Default | Description |
|-----------|---------|-------------|
| **PortClientId** | (required) | Your Port client ID. |
| **PortClientSecret** | (required) | Your Port client secret. |
| **PortBaseUrl** | `https://api.getport.io` | Port API endpoint. Use `https://api.us.getport.io` for US region. |
| **IntegrationIdentifier** | `my-aws-v3` | Unique identifier for this integration. |
| **ResyncIntervalMinutes** | `1440` | Resync interval in minutes (24 hours default). |
| **ContainerCpu** | `256` | CPU units (256 = 0.25 vCPU). |
| **ContainerMemory** | `512` | Memory in MB. |
| **DesiredCount** | `1` | Number of task instances. |
| **UseExistingCluster** | `false` | Set to `true` to use an existing ECS cluster. |
| **ExistingClusterName** | (empty) | Name of existing cluster (if applicable). |
| **VpcId** | (empty) | VPC ID. Leave empty for default VPC. |
| **SubnetIds** | (empty) | Comma-separated subnet IDs. Leave empty for default VPC. |

</details>

<details>
<summary><b>What the stack creates (click to expand)</b></summary>

| Resource | Purpose |
|----------|---------|
| **ECS Cluster** | Logical grouping for ECS tasks (optional - can use existing). |
| **ECS Task Definition** | Defines container image, resources, and IAM roles. |
| **ECS Service** | Keeps the task running continuously. |
| **Execution Role** | Allows ECS to pull images and write logs. |
| **Task Role (PortOceanReadRole)** | Grants `ReadOnlyAccess` to discover AWS resources. |
| **Security Group** | Allows outbound HTTPS to Port and AWS APIs. |
| **CloudWatch Log Group** | Stores container logs (7-day retention). |

</details>

<h4>Step 2: Verify the deployment</h4>

1. Wait for stack status to show `CREATE_COMPLETE` (3-5 minutes).
2. Go to **ECS console** → your cluster → `port-ocean-aws-v3` service.
3. Verify the task is `RUNNING`.
4. Check logs at **CloudWatch** → `/ecs/port-ocean-aws-v3`.

The integration immediately begins syncing AWS resources to Port.

</TabItem>

<TabItem value="ec2" label="EC2 (Docker)">

<h4>Step 1: Deploy the CloudFormation stack</h4>

1. Open the [AWS CloudFormation console](https://console.aws.amazon.com/cloudformation).
2. Click **Create stack** → **With new resources (standard)**.
3. Select **Amazon S3 URL** and enter:
   ```text
   https://cf-templates-1ucvbilw6hgu4-us-east-1.s3.us-east-1.amazonaws.com/2026-01-27T084649.483Zj8d-ec2-stack-1.yaml
   ```
4. Click **Next**, enter a stack name (for example, `port-aws-integration-ec2`).
5. Fill in the required parameters:
   - **PortClientId**: Your Port client ID.
   - **PortClientSecret**: Your Port client secret.
6. Click **Next**, then **Next** again, check the IAM acknowledgment box, and click **Submit**.

<details>
<summary><b>All stack parameters (click to expand)</b></summary>

| Parameter | Default | Description |
|-----------|---------|-------------|
| **PortClientId** | (required) | Your Port client ID. |
| **PortClientSecret** | (required) | Your Port client secret. |
| **PortBaseUrl** | `https://api.getport.io` | Port API endpoint. Use `https://api.us.getport.io` for US region. |
| **IntegrationIdentifier** | `my-aws-v3` | Unique identifier for this integration. |
| **ResyncIntervalMinutes** | `1440` | Resync interval in minutes (24 hours default). |
| **InstanceType** | `t3.small` | EC2 instance type. |
| **KeyPairName** | (empty) | EC2 key pair for SSH access (optional). |

</details>

<details>
<summary><b>What the stack creates (click to expand)</b></summary>

| Resource | Purpose |
|----------|---------|
| **EC2 Instance** | Amazon Linux 2023 instance running the integration container. |
| **IAM Role (PortOceanReadRole)** | Grants `ReadOnlyAccess` to discover AWS resources. |
| **Instance Profile** | Links the IAM role to the EC2 instance. |
| **Security Group** | Allows outbound traffic to AWS APIs and Port. |
| **User Data Script** | Installs Docker and runs the container as a systemd service. |

</details>

<h4>Step 2: Verify the deployment</h4>

1. Wait for stack status to show `CREATE_COMPLETE` (3-5 minutes).
2. Go to **EC2 console** → find instance named `{stack-name}-port-ocean`.
3. Verify the instance is `running`.

The integration immediately begins syncing AWS resources to Port.

<details>
<summary><b>Troubleshooting commands (click to expand)</b></summary>

```bash showLineNumbers
# Check service status
sudo systemctl status port-ocean

# View logs
sudo journalctl -u port-ocean -f

# Restart the integration
sudo systemctl restart port-ocean

# Update container image
sudo docker pull ghcr.io/port-labs/port-ocean-aws-v3:latest
sudo systemctl restart port-ocean
```

</details>

</TabItem>

</Tabs>

</TabItem>

</Tabs>

<PortApiRegionTip/>

</TabItem>

<TabItem value="irsa" label="IRSA (Kubernetes)">

[IRSA](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html) enables Kubernetes pods on EKS to assume IAM roles without static credentials.

**Prerequisites:**
- [Helm](https://helm.sh/docs/intro/install/) >= 3.0.0.
- Amazon EKS cluster with [OIDC provider configured](https://docs.aws.amazon.com/eks/latest/userguide/enable-iam-roles-for-service-accounts.html).
- Permissions to create IAM roles and Kubernetes resources.

<h4>Step 1: Get your OIDC provider URL</h4>

```bash showLineNumbers
aws eks describe-cluster \
  --name YOUR_CLUSTER_NAME \
  --region YOUR_REGION \
  --query "cluster.identity.oidc.issuer" \
  --output text
```

<h4>Step 2: Create the IAM role</h4>

1. Go to **AWS Console** → **IAM** → **Roles** → **Create role**.
2. Select **Web identity**, choose your OIDC provider, set audience to `sts.amazonaws.com`.
3. Attach the `ReadOnlyAccess` managed policy.
4. Name the role `PortOceanReadRole` and create it.
5. Note the role ARN: `arn:aws:iam::ACCOUNT_ID:role/PortOceanReadRole`

<details>
<summary><b>Restrict trust policy to specific service account (recommended)</b></summary>

Edit the role's trust policy to limit which service account can assume it:

```json showLineNumbers
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/oidc.eks.REGION.amazonaws.com/id/OIDC_ID"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.REGION.amazonaws.com/id/OIDC_ID:sub": "system:serviceaccount:port-ocean:port-ocean-aws-v3",
          "oidc.eks.REGION.amazonaws.com/id/OIDC_ID:aud": "sts.amazonaws.com"
        }
      }
    }
  ]
}
```

Replace `ACCOUNT_ID`, `REGION`, and `OIDC_ID` with your values.

</details>

<h4>Step 3: Deploy with Helm</h4>

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts

helm upgrade --install aws-v3 port-labs/port-ocean \
  --create-namespace --namespace port-ocean \
  --set port.clientId="$PORT_CLIENT_ID" \
  --set port.clientSecret="$PORT_CLIENT_SECRET" \
  --set port.baseUrl="https://api.getport.io" \
  --set initializePortResources=true \
  --set sendRawDataExamples=true \
  --set scheduledResyncInterval=1440 \
  --set integration.identifier="my-aws-v3" \
  --set integration.type="aws-v3" \
  --set integration.eventListener.type="POLLING" \
  --set podServiceAccount.name="port-ocean-aws-v3" \
  --set podServiceAccount.create=true \
  --set podServiceAccount.annotations."eks\.amazonaws\.com/role-arn"="arn:aws:iam::ACCOUNT_ID:role/PortOceanReadRole" \
  --set integration.config.accountRoleArns='["arn:aws:iam::ACCOUNT_ID:role/PortOceanReadRole"]'
```

Replace `ACCOUNT_ID` with your AWS account ID.

<h4>Step 4: Verify the deployment</h4>

```bash showLineNumbers
kubectl get pods -n port-ocean
kubectl logs -n port-ocean -l app.kubernetes.io/name=port-ocean -f
```

<PortApiRegionTip/>

</TabItem>

<TabItem value="iam-user" label="IAM User (Access Keys)">

Use static access keys when running the integration outside of AWS or for quick testing.

:::caution Secure your credentials
Never commit access keys to version control. Store them in a secrets manager and rotate them regularly.
:::

<h4>Step 1: Create an IAM user</h4>

1. Go to **AWS Console** → **IAM** → **Users** → **Create user**.
2. Enter a username (for example, `port-ocean-integration`).
3. Attach the `ReadOnlyAccess` managed policy.
4. Create the user.

<h4>Step 2: Generate access keys</h4>

1. Go to **Security credentials** → **Create access key**.
2. Select **Application running outside AWS**.
3. Download or copy both the **Access key ID** and **Secret access key**.

<h4>Step 3: Deploy the integration</h4>

<Tabs groupId="deployment-method-iam" queryString="deployment-method-iam" defaultValue="helm">

<TabItem value="helm" label="Helm (Kubernetes)">

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts

helm upgrade --install aws-v3 port-labs/port-ocean \
  --create-namespace --namespace port-ocean \
  --set port.clientId="$PORT_CLIENT_ID" \
  --set port.clientSecret="$PORT_CLIENT_SECRET" \
  --set port.baseUrl="https://api.getport.io" \
  --set initializePortResources=true \
  --set sendRawDataExamples=true \
  --set scheduledResyncInterval=1440 \
  --set integration.identifier="my-aws-v3" \
  --set integration.type="aws-v3" \
  --set integration.eventListener.type="POLLING" \
  --set integration.config.awsAccessKeyId="$AWS_ACCESS_KEY_ID" \
  --set integration.config.awsSecretAccessKey="$AWS_SECRET_ACCESS_KEY"
```

<h4>Verify the deployment</h4>

```bash showLineNumbers
kubectl get pods -n port-ocean
kubectl logs -n port-ocean -l app.kubernetes.io/name=port-ocean -f
```

</TabItem>

<TabItem value="docker" label="Docker">

**One-time sync:**

```bash showLineNumbers
docker run -i --rm --platform=linux/amd64 \
  -e OCEAN__PORT__CLIENT_ID="$PORT_CLIENT_ID" \
  -e OCEAN__PORT__CLIENT_SECRET="$PORT_CLIENT_SECRET" \
  -e OCEAN__PORT__BASE_URL="https://api.getport.io" \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
  -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
  -e OCEAN__EVENT_LISTENER='{"type": "ONCE"}' \
  -e OCEAN__INTEGRATION__CONFIG__AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
  -e OCEAN__INTEGRATION__CONFIG__AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
  -e OCEAN__INTEGRATION__IDENTIFIER="my-aws-v3" \
  -e OCEAN__INTEGRATION__TYPE="aws-v3" \
  ghcr.io/port-labs/port-ocean-aws-v3:latest
```

**Continuous sync:**

```bash showLineNumbers
docker run -d --name port-ocean-aws \
  --restart unless-stopped \
  --platform=linux/amd64 \
  -e OCEAN__PORT__CLIENT_ID="$PORT_CLIENT_ID" \
  -e OCEAN__PORT__CLIENT_SECRET="$PORT_CLIENT_SECRET" \
  -e OCEAN__PORT__BASE_URL="https://api.getport.io" \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
  -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
  -e OCEAN__EVENT_LISTENER='{"type": "POLLING", "resyncInterval": 1440}' \
  -e OCEAN__INTEGRATION__CONFIG__AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID" \
  -e OCEAN__INTEGRATION__CONFIG__AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY" \
  -e OCEAN__INTEGRATION__IDENTIFIER="my-aws-v3" \
  -e OCEAN__INTEGRATION__TYPE="aws-v3" \
  ghcr.io/port-labs/port-ocean-aws-v3:latest
```

<details>
<summary><b>All environment variables (click to expand)</b></summary>

| Variable | Required | Description |
|----------|----------|-------------|
| `OCEAN__PORT__CLIENT_ID` | Yes | Your Port client ID. |
| `OCEAN__PORT__CLIENT_SECRET` | Yes | Your Port client secret. |
| `OCEAN__PORT__BASE_URL` | Yes | Port API URL (`https://api.getport.io` or `https://api.us.getport.io`). |
| `OCEAN__INTEGRATION__CONFIG__AWS_ACCESS_KEY_ID` | Yes | AWS access key ID. |
| `OCEAN__INTEGRATION__CONFIG__AWS_SECRET_ACCESS_KEY` | Yes | AWS secret access key. |
| `OCEAN__INTEGRATION__IDENTIFIER` | Yes | Unique identifier for this integration. |
| `OCEAN__INTEGRATION__TYPE` | Yes | Must be `aws-v3`. |
| `OCEAN__EVENT_LISTENER` | Yes | `{"type": "ONCE"}` or `{"type": "POLLING", "resyncInterval": 1440}`. |

</details>

</TabItem>

</Tabs>

<PortApiRegionTip/>

</TabItem>

</Tabs>

## Troubleshooting

### Common installation issues

**Error**: `No resources discovered`

**Solutions:**
- Verify the IAM user has the `ReadOnlyAccess` policy attached.
- Check that the regions you want to query are not blocked by `regionPolicy`.
- Ensure the integration has network access to AWS APIs.

**Error**: `Invalid credentials`

**Solutions:**
- Verify the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are correct.
- Ensure the access keys haven't expired or been deleted.
- Check that the IAM user has the `ReadOnlyAccess` policy attached.

**Error**: `Docker container exits immediately` (Docker only)

**Solutions:**
- Check Docker logs for error messages.
- Verify all required environment variables are set.
- Ensure the Port API credentials are valid.

**Error**: `Unable to assume role` (IRSA only)

**Solutions:**
- Verify the service account annotation matches the IAM role ARN.
- Ensure the OIDC provider is correctly configured for your EKS cluster.
- Check that the IAM role trust policy allows the service account to assume it.

**Error**: `Service account not found` (IRSA only)

**Solutions:**
- Verify the service account exists in the `port-ocean` namespace.
- Ensure the service account name matches the `podServiceAccount.name` value in your Helm configuration.