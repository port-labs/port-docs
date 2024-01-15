---
sidebar_position: 14
description: Ingest Grafana alerts into your catalog
---

import GrafanaAlertBlueprint from './resources/grafana/\_example_alert_blueprint.mdx'
import GrafanaAlertWebhookConfig from './resources/grafana/\_example_alert_webhook_configuration.mdx'

# Grafana

In this example you are going to create a webhook integration between [Grafana](https://grafana.com/) and Port, which will ingest alert entities.

## Port configuration

Create the following blueprint definition:

<details>
<summary>Alert blueprint</summary>

<GrafanaAlertBlueprint/>

</details>

Create the following webhook configuration [using Port UI](/build-your-software-catalog/sync-data-to-catalog/webhook/?operation=ui#configuring-webhook-endpoints)

<details>

<summary>Alert webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Grafana Alert Mapper`;
   2. Identifier : `grafana_alert_mapper`;
   3. Description : `A webhook configuration to map Grafana alerts to Port`;
   4. Icon : `Grafana`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <GrafanaAlertWebhookConfig/>

3. Click **Save** at the bottom of the page.

</details>

## Create a webhook in Grafana

1. Go to **Alerting** in your Grafana account;
2. Under **Contact points** click **Add contact point**;
3. Input the following details:
   1. `Name` - use a meaningful name such as Port Webhook;
   2. `Integration` - select `Webhook` from the list;
   3. `URL` - enter the value of the `url` key you received after creating the webhook configuration;
4. Click **Save contact point** to save the contact;
5. Go to **Notification policies** and add the Port Webhook contact point to your **Default policy** and be notified of any alert in Grafana;
6. You can optionally add the contact point to an existing notification policy or create a new policy depending on your use case;
7. Click **Save policy**.

Done! any change that happens to your alerts in Grafana will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.
