---
sidebar_position: 0
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Installation

## Permissions

- To get Port API credentials, you check out the [Port API documentation](/build-your-software-catalog/custom-integration/api/#find-your-port-credentials).
- In order to successfully deploy the AWS integration, it's crucial to ensure that the user who deploys the integration in the AWS Organization has the appropriate access permissions to create all of the relevant resources (ECS, IAM, and VPC).

:::tip Multiple Account Support
To do the following:

1. Enable multiple accounts for the integration.
2. View account data.

Make sure you set up properly using our [Multiple Accounts guide](./multi_account.md)
:::

Choose one of the following installation methods:
<Tabs groupId="installation-platforms" queryString="installation-platforms" defaultValue="helm">
<TabItem value="helm" label="Helm (Scheduled)">
The AWS integration is deployed using Helm on you cluster.
You can check out the Helm chart [here](https://github.com/port-labs/helm-charts/tree/main/charts/port-ocean).

## Prerequisites

### IAM User

- [create IAM user with the following permissions](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html):
  - `arn:aws:iam::aws:policy/ReadOnlyAccess`
  - `account:ListRegions`
  - `sts:AssumeRole`
- [Helm 3](https://helm.sh/docs/intro/install/)
- [A logged in aws CLI 2](https://aws.amazon.com/cli/)
- [AWS Access Key ID and Secret Access Key](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users.html#id_users_creds)

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install aws port-labs/port-ocean \
  --set port.clientId="$PORT_CLIENT_ID"  \
  --set port.clientSecret="$PORT_CLIENT_SECRET_ID"  \
  --set port.baseUrl="https://api.getport.io"  \
  --set initializePortResources=true  \
  --set sendRawDataExamples=true  \
  --set scheduledResyncInterval=1440 \
  --set integration.identifier="my-aws"  \
  --set integration.type="aws"  \
  --set integration.eventListener.type="POLLING"  \
  --set integration.config.awsAccessKeyId="$AWS_ACCESS_KEY_ID" \
  --set integration.config.awsSecretAccessKey="$AWS_SECRET_ACCESS_KEY"  \
  --set integration.config.maximumConcurrentAccounts=50
```

### IRSA

If you are using [IRSA](https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html).
You'll need to:

- [create an IAM role with the following permissions](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-service.html):
  - `arn:aws:iam::aws:policy/ReadOnlyAccess`
  - `account:ListRegions`
  - `sts:AssumeRole`
- create a service account in your K8s cluster.
  Then you can set the following values, after [assigning the appropriate IAM role to the service account](https://docs.aws.amazon.com/eks/latest/userguide/associate-service-account-role.html):

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install aws port-labs/port-ocean \
  --set port.clientId="$PORT_CLIENT_ID"  \
  --set port.clientSecret="$PORT_CLIENT_SECRET_ID"  \
  --set port.baseUrl="https://api.getport.io"  \
  --set initializePortResources=true  \
  --set sendRawDataExamples=true  \
  --set scheduledResyncInterval=1440 \
  --set integration.identifier="my-aws"  \
  --set integration.type="aws"  \
  --set integration.eventListener.type="POLLING"  \
  --set integration.maximumConcurrentAccounts=50  \
  --set podServiceAccount.name="$SERVICE_ACCOUNT"
```

### Multiple account support

For running the AWS integration using helm, you'll need to make sure that you have the following: (Check out our [multiple accounts guide](./multi_account.md) for how to get them)

1. An organization role ARN
2. A Role with Read permissions set-up across your AWS accounts
3. IRSA or a user with the previous read-permissions role bound to them.

Then, you'll be able to run the integration: (You can switch the `podServiceAccount.name` configuration to your `integration.config.awsAccessKeyId`, `integration.config.awsSecretAccessKey` configurations)

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install aws port-labs/port-ocean \
  --set port.clientId="$PORT_CLIENT_ID"  \
  --set port.clientSecret="$PORT_CLIENT_SECRET_ID"  \
  --set port.baseUrl="https://api.getport.io"  \
  --set initializePortResources=true  \
  --set sendRawDataExamples=true  \
  --set scheduledResyncInterval=1440 \
  --set integration.identifier="my-aws"  \
  --set integration.type="aws"  \
  --set integration.eventListener.type="POLLING"  \
  --set podServiceAccount.name="$SERVICE_ACCOUNT"  \ 
  --set integration.config.accountReadRoleName="$YOUR_ACCOUNT_READ_ROLE_NAME"  \ 
  --set integration.config.organizationRoleArn="$YOUR_ORGANIZATION_ROLE_ARN"  \
  --set integration.config.maximumConcurrentAccounts=50
```

  </TabItem>
  <TabItem value="terraform" label="Terraform (Real Time)">
  The AWS integration is deployed using Terraform on AWS ECS cluster service.  
  It uses our Terraform [Ocean](https://ocean.getport.io) Integration Factory [module](https://registry.terraform.io/modules/port-labs/integration-factory/ocean/latest) to deploy the integration.

<h2>Prerequisites</h2>

- [Terraform](https://www.terraform.io/downloads.html) >= 1.9.1
- [A logged in aws CLI 2](https://aws.amazon.com/cli/)
- [Certificate domain name (Optional)](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-request-public.html)

:::warning Live-Events
This installation guide is for the AWS integration only.
It does not take into consideration the **live-events** infrastructure **which is optional**.
The env variables referring to the live events (such as `LIVE_EVENTS_API_KEY`) are optional and can be removed if not needed.
:::

```bash showLineNumbers
	# Logging into you AWS account
	aws sso login
	# Copying the following module into a main.tf file
	echo 'module "aws" {
	source = "port-labs/integration-factory/ocean//examples/aws_container_app"
	version = ">=0.0.24"
	port = {
		client_id = "$PORT_CLIENT_ID"
		client_secret = "$PORT_CLIENT_SECRET_ID"
		base_url = "https://api.getport.io"
	}
	initialize_port_resources = true # When set to true the integration will create default blueprints + JQ Mappings
	scheduled_resync_interval = 1440
	integration = {
		identifier = "my-aws-integration" # Change the identifier to describe your integration
		config = {
			live_events_api_key = "$YOUR_CUSTOM_API_KEY" # AWS API Key for custom events, used to validate the event source for real-time event updates.
		}
	}
	event_listener = {
		type = "POLLING"
	}
	allow_incoming_requests = true # Whether to allow incoming requests
	create_default_sg = false # Whether to create the default security group
	subnets = ["subnet-1","subnet-2","subnet-3"] # The subnets to deploy the LB to
	vpc_id = "vpc-1" # The LB VPC ID
	cluster_name = "port-ocean-aws-exporter" # The ECS cluster name
	}' > main.tf
	# Initializing Terraform and Providers
	terraform init
	# Creating the resources
	terraform apply
```

<details>
<summary>Variables</summary>
| Variable | Description |
| --- | --- |
| subnets | List of subnet IDs where the ECS tasks will run.  |
| port.client_id | The client ID for the Port integration.  |
| port.client_secret | The client secret for the Port integration.  |
| integration.identifier | The identifier for the integration.  |
| integration.config.live_events_api_key | A user-defined API key for authenticating with the live events API, for example "my-secret".  |
| integration.config.organization_role_arn (optional) | ARN of the role used to assume the organization role.  |
| integration.config.account_read_role_name (optional) | Name of the role used to assume the read role in the account.  |
| integration.config.maximum_concurrent_accounts (optional) | Maximum number of accounts to sync concurrently. |
| cluster_name (optional) | Name of the ECS cluster.  |
| vpc_id | VPC ID where the cluster will be created.  |
| initialize_port_resources | Boolean to initialize Port resources.  |
| scheduled_resync_interval | The interval to resync the integration in minutes.  |
| create_default_sg | Boolean to create a default security group.  |
| allow_incoming_requests | Boolean to allow incoming requests to the ECS tasks.  |

</details>
## Infrastructure

The AWS integration uses the following AWS infrastructure:

- [AWS ECS Cluster Service](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs_services.html).
- [AWS ECS Cluster (creates a new one by default)](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/clusters.html).
- [AWS ECS Task Role](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task-iam-roles.html).
- [AWS ECS Task Execution Role](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/task_execution_IAM_role.html).
- [AWS EC2 Load Balancer](https://aws.amazon.com/elasticloadbalancing).
- [AWS SSM Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).
- [AWS API Gateway](https://aws.amazon.com/api-gateway).
- [AWS EventBridge Rules](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-rules.html).

<details>
   <summary>Live events diagram</summary>
   <center style={{'backgroundColor': 'white'}} >
      <img src='/img/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/live-events-diagram.svg' width='60%' border='1px' />
   </center>
</details>
</TabItem>
<TabItem value="on-prem" label="On Prem (Once)">

<h2>Prerequisites</h2>

- Create an IAM user with the following permissions:
  - `arn:aws:iam::aws:policy/ReadOnlyAccess`
  - `account:ListRegions`
  - `sts:AssumeRole`
- Run the following Docker image: `ghcr.io/port-labs/port-ocean-aws:latest`.
- (For live updates): expose the port `8000` to the internet.
- Add the following environment variables to the Docker container:

<details>
<summary>Environment Variables</summary>

| Variable                                             | Description                                                                                                                                                                                                                                                          |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OCEAN__PORT__CLIENT_ID`                             | Your Port client ID. |
| `OCEAN__PORT__CLIENT_SECRET`                         | Your Port client secret. |
| `OCEAN__PORT__BASE_URL`                              | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                              |
| `OCEAN__INTEGRATION__CONFIG__AWS_ACCESS_KEY_ID`      | [The AWS Access Key ID of the IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html).                                                                                                                                                      |
| `OCEAN__INTEGRATION__CONFIG__AWS_SECRET_ACCESS_KEY`  | [The AWS Secret Access Key of the IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html).                                                                                                                                                  |
| `OCEAN__INTEGRATION__CONFIG__LIVE_EVENTS_API_KEY`    | (Optional) AWS API Key for live events, used to validate the event source for real-time event, it's value is completely up to you                                                                                                                                    |
| `OCEAN__INTEGRATION__CONFIG__ORGANIZATION_ROLE_ARN`  | [(Optional) AWS Organization Role ARN, in case the account the integration is installed on is not the root account, used to read organization accounts for multi-account access](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html). |
| `OCEAN__INTEGRATION__CONFIG__ACCOUNT_READ_ROLE_NAME` | [(Optional) AWS Account Read Role Name, the role name used to read the account in which the integration is not installed on, used for multi-account access.](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html).                                        |
| `OCEAN__INTEGRATION__CONFIG__MAXIMUM_CONCURRENT_ACCOUNTS` | (Optional) `Maximum Concurrent Account` controls the maximum number of accounts synced concurrently.                                       |
| `OCEAN__EVENT_LISTENER`                              | [The event listener object](https://ocean.getport.io/framework/features/event-listener/).                                                                                                                                                                            |
| `OCEAN__INTEGRATION__IDENTIFIER`                     | The identifier of the integration.                                                                                                                                                                                                                                   |
| `OCEAN__INTEGRATION__TYPE`                           | should be set to `aws`.                                                                                                                                                                                                                                              |

</details>

For example:

```bash
docker run -i --rm --platform=linux/amd64 \
  -e OCEAN__PORT__CLIENT_ID="$PORT_CLIENT_ID" \
  -e OCEAN__PORT__CLIENT_SECRET="$PORT_CLIENT_SECRET" \
  -e OCEAN__PORT__BASE_URL="https://api.getport.io" \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
  -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
  -e OCEAN__EVENT_LISTENER='{"type": "ONCE"}' \
  -e OCEAN__INTEGRATION__CONFIG__AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
  -e OCEAN__INTEGRATION__CONFIG__AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  -e OCEAN__INTEGRATION__CONFIG__MAXIMUM_CONCURRENT_ACCOUNTS=50
ghcr.io/port-labs/port-ocean-aws:latest
```

</TabItem>
</Tabs>

## Further Examples

Refer to the [examples](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/examples/) page for practical configurations and their corresponding blueprint definitions.
