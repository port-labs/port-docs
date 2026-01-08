---
sidebar_position: 1
title: Setup
description: Install the Ocean custom integration in your own infrastructure
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Setup

Using this installation option means that the integration will run in your own infrastructure, giving you full control over resources and configuration. You can deploy it using Helm or Docker, and it will run continuously in your environment to keep your data synchronized with Port.

:::warning High-scale environments
For high-scale environments with large datasets, allocate sufficient CPU and memory based on your data volume.
:::

## Installation

Choose your preferred deployment method:

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>

To install the integration using Helm:

1. Go to the [custom data source page](https://app.getport.io/settings/data-sources?section=EXPORTERS&provider=Custom) in your portal.

2. Select the **Real-time and always on** method:

<img src="/img/sync-data-to-catalog/selfHostedMethod.png" width="40%" border='1px' />

3. A `helm` command will be displayed, with default values already filled out (e.g. your Port client ID, client secret, etc). Copy the command, replace the placeholders with your values, then run it in your terminal to install the integration.

Alternatively, you can install manually using the following steps:

1. Add Port's Helm chart repository:

```bash
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
```

2. Install the Helm chart with your configuration:

```bash showLineNumbers
helm install ocean-custom port-labs/port-ocean \
  --set port.clientId="<PORT_CLIENT_ID>" \
  --set port.clientSecret="<PORT_CLIENT_SECRET>" \
  --set port.baseUrl="https://api.getport.io" \
  --set initializePortResources=true \
  --set scheduledResyncInterval=60 \
  --set integration.identifier="ocean-custom" \
  --set integration.type="custom" \
  --set integration.eventListener.type="POLLING" \
  --set integration.config.baseUrl="https://api.yourcompany.com" \
  --set integration.config.authType="bearer_token" \
  --set integration.secrets.apiToken="<YOUR_API_TOKEN>" \
  --set integration.config.paginationType="page" \
  --set integration.config.pageSize=100
```

<PortApiRegionTip/>

</TabItem>

<TabItem value="docker" label="Docker">

To install the integration using Docker:

1. Pull the Docker image:

```bash
docker pull ghcr.io/port-labs/port-ocean-custom:latest
```

2. Run the container with your configuration:

```bash showLineNumbers
docker run -i --rm \
  -e OCEAN__PORT__CLIENT_ID="<PORT_CLIENT_ID>" \
  -e OCEAN__PORT__CLIENT_SECRET="<PORT_CLIENT_SECRET>" \
  -e OCEAN__PORT__BASE_URL="https://api.getport.io" \
  -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
  -e OCEAN__SCHEDULED_RESYNC_INTERVAL=60 \
  -e OCEAN__INTEGRATION__IDENTIFIER="ocean-custom" \
  -e OCEAN__INTEGRATION__TYPE="custom" \
  -e OCEAN__EVENT_LISTENER='{"type":"POLLING"}' \
  -e OCEAN__INTEGRATION__CONFIG__BASE_URL="https://api.yourcompany.com" \
  -e OCEAN__INTEGRATION__CONFIG__AUTH_TYPE="bearer_token" \
  -e OCEAN__INTEGRATION__CONFIG__API_TOKEN="<YOUR_API_TOKEN>" \
  -e OCEAN__INTEGRATION__CONFIG__PAGINATION_TYPE="page" \
  -e OCEAN__INTEGRATION__CONFIG__PAGE_SIZE=100 \
  ghcr.io/port-labs/port-ocean-custom:latest
```

<PortApiRegionTip/>

</TabItem>

</Tabs>

## Configuration parameters

This table summarizes the available parameters for the installation.

| Parameter                                | Description                                                                                                                                                                                                                                                                                    | Example                          | Required |
|------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|----------|
| `port.clientId`                          | Your port [client id](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                                  |                                  | ✅        |
| `port.clientSecret`                      | Your port [client secret](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                              |                                  | ✅        |
| `port.baseUrl`                           | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                                                        |                                  | ✅        |
| `integration.config.baseUrl`             | The root URL of your API (e.g., `https://api.yourcompany.com`)                                                                                                                                                                                                                                 | https://api.yourcompany.com       | ✅        |
| `integration.config.authType`            | Authentication type: `bearer_token`, `api_key`, `basic_auth`, or `none`                                                                                                                                                                                                                       | bearer_token                      | ✅        |
| `integration.secrets.apiToken`           | Bearer token for authentication (required when `authType` is `bearer_token`)                                                                                                                                                                                                                  |                                  | ❌        |
| `integration.config.paginationType`      | Pagination type: `offset`, `page`, `cursor`, or `none`                                                                                                                                                                                                                                        | page                              | ❌        |
| `integration.config.pageSize`            | Number of items per page (for offset/page pagination)                                                                                                                                                                                                                                        | 100                               | ❌        |
| `integration.config.timeout`             | Request timeout in seconds (default: 30)                                                                                                                                                                                                                                                       | 30                                | ❌        |
| `integration.eventListener.type`         | The event listener type. Read more about [event listeners](https://ocean.getport.io/framework/features/event-listener)                                                                                                                                                                         | POLLING                           | ✅        |
| `integration.type`                       | The integration to be installed                                                                                                                                                                                                                                                                | custom                            | ✅        |
| `scheduledResyncInterval`                 | The number of minutes between each resync. When not set the integration will resync for each event listener resync event. Read more about [scheduledResyncInterval](https://ocean.getport.io/develop-an-integration/integration-configuration/#scheduledresyncinterval---run-scheduled-resync) | 60                                | ❌        |
| `initializePortResources`                | Default true, When set to true the integration will create default blueprints and the port App config Mapping. Read more about [initializePortResources](https://ocean.getport.io/develop-an-integration/integration-configuration/#initializeportresources---initialize-port-resources)       | true                              | ❌        |
| `sendRawDataExamples`                    | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                                                                                                                                            | true                              | ❌        |

## Ready to build?

Head to [build your integration](/build-your-software-catalog/custom-integration/ocean-custom-integration/installation-types/self-hosted/build-your-integration) for a step-by-step guide with an interactive configuration builder.

## More resources

For all configuration options, code examples, and advanced use cases, check out the [Ocean custom integration repository on GitHub](https://github.com/port-labs/ocean/tree/main/integrations/custom).

