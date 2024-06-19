---
sidebar_position: 1
---

# Installation

The AWS integration is deployed using Terraform on AWS ECS cluster service.  
It uses our Terraform [Ocean](https://ocean.getport.io) Integration Factory [module](https://registry.terraform.io/modules/port-labs/integration-factory/ocean/latest) to deploy the integration.

:::warning
This installation guide is for the AWS integration only.
It does not take into consideration the **live-events** infrastructure **which is optional**.
The env variables referring to the live events (such as `LIVE_EVENTS_API_KEY`) are optional and can be removed if not needed.
:::

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

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) >= 0.15.0
- [A logged in aws CLI 2](https://aws.amazon.com/cli/)
- [Certificate domain name (Optional)](https://docs.aws.amazon.com/acm/latest/userguide/gs-acm-request-public.html)
- [Permissions (When running on-premise)](#permissions)

## Permissions

In order to successfully deploy the AWS integration, it's crucial to ensure that the user who deploys the integration in the AWS Organization has the appropriate access permissions to create all of the above resources.

## install using terraform

1. Go to Port's [Data Sources](https://app.getport.io/settings/data-sources?section=EXPORTERS) and click on AWS.
2. Edit and copy the installation command.
3. Run the command in your terminal to deploy the AWS integration.

## install using Helm (Kubernetes)

<details>
<summary>Installation</summary>

```bash
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install aws port-labs/port-ocean \
	--set port.clientId="$PORT_CLIENT_ID"  \
	--set port.clientSecret="$PORT_CLIENT_SECRET_ID"  \
	--set port.baseUrl="https://api.getport.io"  \
	--set initializePortResources=true  \
	--set sendRawDataExamples=true  \
	--set integration.identifier="my-aws"  \
	--set integration.type="aws"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.config.liveEventsApiKey="<choose your api key>" \
	--set integration.config.awsAccessKeyId="$AWS_ACCESS_KEY_ID" \
	--set integration.config.awsSecretAccessKey="$AWS_SECRET_ACCESS_KEY" \
```

</details>

## Manual installation (AWS)

1. Create the infrastructure using the [AWS Console](https://aws.amazon.com/console/).
2. For the ECS Service image use the following image: `ghcr.io/port-labs/port-ocean-aws:latest`.
3. Add the following environment variables to the ECS Task Definition:
<details>
<summary>Environment Variables</summary>

| Variable                                             | Description                                                                                                                                                                                                                                                          |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OCEAN__PORT__CLIENT_ID`                             | [The client ID of the Port integration](https://docs.getport.io/configuration-methods/#:~:text=To%20get%20your%20Port%20API,API).                                                                                                                                    |
| `OCEAN__PORT__CLIENT_SECRET`                         | [The client secret of the Port integration](https://docs.getport.io/configuration-methods/#:~:text=To%20get%20your%20Port%20API,API).                                                                                                                                |
| `OCEAN__PORT__BASE_URL`                              | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                              |
| `OCEAN__INTEGRATION__CONFIG__LIVE_EVENTS_API_KEY`    | (Optional) AWS API Key for live events, used to validate the event source for real-time event, it's value is completely up to you                                                                                                                                    |
| `OCEAN__INTEGRATION__CONFIG__ORGANIZATION_ROLE_ARN`  | [(Optional) AWS Organization Role ARN, in case the account the integration is installed on is not the root account, used to read organization accounts for multi-account access](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html). |
| `OCEAN__INTEGRATION__CONFIG__ACCOUNT_READ_ROLE_NAME` | [(Optional) AWS Account Read Role Name, the role name used to read the account in which the integration is not installed on, used for multi-account access.](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html).                                        |
| `OCEAN__EVENT_LISTENER`                              | [The event listener object](https://ocean.getport.io/framework/features/event-listener/).                                                                                                                                                                            |
| `OCEAN__INTEGRATION__IDENTIFIER`                     | The identifier of the integration.                                                                                                                                                                                                                                   |
| `OCEAN__INTEGRATION__TYPE`                           | should be set to `aws`.                                                                                                                                                                                                                                              |

</details>

## Manual installation (on-premise)

1. Create an IAM user with the following permissions:
   - `arn:aws:iam::aws:policy/ReadOnlyAccess`
   - `account:ListRegions`
   - `sts:AssumeRole`
2. Run the following Docker image: `ghcr.io/port-labs/port-ocean-aws:latest`.
3. (For live updates): expose the port `8000` to the internet.
4. Add the following environment variables to the Docker container:

<details>
<summary>Environment Variables</summary>

| Variable                                             | Description                                                                                                                                                                                                                                                          |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OCEAN__PORT__CLIENT_ID`                             | [The client ID of the Port integration](https://docs.getport.io/configuration-methods/#:~:text=To%20get%20your%20Port%20API,API).                                                                                                                                    |
| `OCEAN__PORT__CLIENT_SECRET`                         | [The client secret of the Port integration](https://docs.getport.io/configuration-methods/#:~:text=To%20get%20your%20Port%20API,API).                                                                                                                                |
| `OCEAN__PORT__BASE_URL`                              | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                              |
| `OCEAN__INTEGRATION__CONFIG__AWS_ACCESS_KEY_ID`      | [The AWS Access Key ID of the IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html).                                                                                                                                                      |
| `OCEAN__INTEGRATION__CONFIG__AWS_SECRET_ACCESS_KEY`  | [The AWS Secret Access Key of the IAM user](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html).                                                                                                                                                  |
| `OCEAN__INTEGRATION__CONFIG__LIVE_EVENTS_API_KEY`    | (Optional) AWS API Key for live events, used to validate the event source for real-time event, it's value is completely up to you                                                                                                                                    |
| `OCEAN__INTEGRATION__CONFIG__ORGANIZATION_ROLE_ARN`  | [(Optional) AWS Organization Role ARN, in case the account the integration is installed on is not the root account, used to read organization accounts for multi-account access](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_introduction.html). |
| `OCEAN__INTEGRATION__CONFIG__ACCOUNT_READ_ROLE_NAME` | [(Optional) AWS Account Read Role Name, the role name used to read the account in which the integration is not installed on, used for multi-account access.](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html).                                        |
| `OCEAN__EVENT_LISTENER`                              | [The event listener object](https://ocean.getport.io/framework/features/event-listener/).                                                                                                                                                                            |
| `OCEAN__INTEGRATION__IDENTIFIER`                     | The identifier of the integration.                                                                                                                                                                                                                                   |
| `OCEAN__INTEGRATION__TYPE`                           | should be set to `aws`.                                                                                                                                                                                                                                              |

</details>

## Further Examples

Refer to the [examples](/build-your-software-catalog/sync-data-to-catalog/cloud-providers/aws/examples/) page for practical configurations and their corresponding blueprint definitions.
