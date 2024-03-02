---
sidebar_position: 16
description: Ingest Prometheus alerts into your catalog
---

import AlertBlueprint from './resources/prometheus/\_example_alert_blueprint.mdx'
import AlertWebhookConfig from './resources/prometheus/\_example_alert_webhook_config.mdx'

# Prometheus

In this example you are going to create a webhook integration between [Prometheus Alertmanager](https://prometheus.io/docs/alerting/latest/alertmanager/) and Port, which will ingest alert entities.

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
   1. Title : `Prometheus Alert Mapper`;
   2. Identifier : `prometheus_alert_mapper`;
   3. Description : `A webhook configuration to map Prometheus alerts to Port`;
   4. Icon : `Prometheus`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <AlertWebhookConfig/>

3. Click **Save** at the bottom of the page.

</details>

## Configure Alertmanager to send webhook

1. Ensure you have the Prometheus Alertmanager installed as described in [prometheus/alertmanager](https://github.com/prometheus/alertmanager#installation);
2. Configure the Alertmanager to send alert information from your server to Port. Edit your Alertmanager configuration file (`alertmanager.yaml`) to add the generated webhook from Port as a **receivers**;

   1. Create a new **receivers** object called `port_webhook`. Paste the webhook `URL` into the `url` field and set the `send_resolved` value to `true`.
   2. Add the `port_webhook` **receivers** to the **route** object;

   <details>

   <summary>Example configuration file.</summary>

   ```yaml showLineNumbers
   global:
     resolve_timeout: 20s

   route:
     group_wait: 30s
     group_interval: 5m
     repeat_interval: 3h
     receiver: port_webhook

   receivers:
    - name: port_webhook
    webhook_configs:
    - url: https://port-webhook-url
       send_resolved: true
   ```

   </details>

3. Save the `alertmanager.yaml` file and restart the alertmanager to apply the changes.

Done! Any change that happens to your alerts in your server will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.
