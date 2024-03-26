---
sidebar_position: 18
description: Ingest Falco alerts into your catalog
---

import AlertBlueprint from './resources/falco/\_example_alert_blueprint.mdx'
import AlertWebhookConfig from './resources/falco/\_example_webhook_configuration.mdx'

# Falco Sidekick

In this example you are going to create a webhook integration between [Falco Sidekick](https://github.com/falcosecurity/falcosidekick) and Port, which will ingest alert entities.

## Port configuration

Create the following blueprint definition:

<details>
<summary>Alert blueprint</summary>

<AlertBlueprint/>

</details>

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

<details>

<summary>Alert webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Falco Alert Mapper`;
   2. Identifier : `falco_alert_mapper`;
   3. Description : `A webhook configuration to map Falco sidekicks alerts to Port`;
   4. Icon : `Alert`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <AlertWebhookConfig/>

3. Click **Save** at the bottom of the page.

</details>

## Configure Falco Sidekick to send webhook

1. If you're using Falcosidekick with [Docker](https://github.com/falcosecurity/falcosidekick#with-docker), use the following command for installation. Replace `YOUR_WEBHOOK_URL` with the value of the `url` key you received after creating the webhook configuration;

   ```bash showLineNumbers
   docker run -d -p 2801:2801 -e WEBHOOK_ADDRESS=YOUR_WEBHOOK_URL falcosecurity/falcosidekick
   ```

2. If you prefer installing Falcosidekick with [Helm](https://github.com/falcosecurity/falcosidekick#with-helm), follow these steps:

   1. Add the webhook configuration to your config.yaml file, replacing `YOUR_WEBHOOK_URL` with the actual URL from the webhook setup.

   <details>
   <summary>Example configuration file</summary>

   ```yaml showLineNumbers
   webhook:
     address: YOUR_WEBHOOK_URL
   ```

   </details>

   2. Install or upgrade the Helm chart with the following commands:

   ```bash showLineNumbers
   helm repo add falcosecurity https://falcosecurity.github.io/charts
   helm repo update

   helm install falco --config-file=config.yaml falcosecurity/falco
   ```

Done! Any change that happens to your alerts in your server will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.
