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

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

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

## Let's Test It

This section includes a sample response data from Grafana. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Grafana:

<details>
<summary><b>Webhook response data (Click to expand)</b></summary>

```json showLineNumbers
{
  "status": "firing",
  "labels": {
    "alertname": "High memory usage",
    "team": "blue",
    "zone": "us-1"
  },
  "annotations": {
    "description": "The system has high memory usage",
    "runbook_url": "https://myrunbook.com/runbook/1234",
    "summary": "This alert was triggered for zone us-1"
  },
  "startsAt": "2021-10-12T09:51:03.157076+02:00",
  "endsAt": "0001-01-01T00:00:00Z",
  "generatorURL": "https://play.grafana.org/alerting/1afz29v7z/edit",
  "fingerprint": "c6eadffa33fcdf37",
  "silenceURL": "https://play.grafana.org/alerting/silence/new?alertmanager=grafana&matchers=alertname%3DT2%2Cteam%3Dblue%2Czone%3Dus-1",
  "dashboardURL": "",
  "panelURL": "",
  "values": {
    "B": 44.23943737541908,
    "C": 1
  }
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary><b>Alert entity in Port (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "High memory usage - c6eadffa33fcdf37",
  "title": "High memory usage",
  "blueprint": "grafanaAlert",
  "team": [],
  "icon": "Grafana",
  "properties": {
    "status": "firing",
    "labels": {
      "alertname": "High memory usage",
      "team": "blue",
      "zone": "us-1"
    },
    "description": "The system has high memory usage",
    "summary": "This alert was triggered for zone us-1",
    "runbookURL": "https://myrunbook.com/runbook/1234",
    "createdAt": "2021-10-12T09:51:03.157076+02:00",
    "resolvedAt": "0001-01-01T00:00:00+00:00",
    "values": {
      "B": 44.23943737541908,
      "C": 1
    },
    "generatorURL": "https://play.grafana.org/alerting/1afz29v7z/edit",
    "fingerprint": "c6eadffa33fcdf37",
    "silenceURL": "https://play.grafana.org/alerting/silence/new?alertmanager=grafana&matchers=alertname%3DT2%2Cteam%3Dblue%2Czone%3Dus-1"
  },
  "relations": {},
  "createdAt": "2024-2-6T09:30:57.924Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-2-6T11:49:20.881Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>
