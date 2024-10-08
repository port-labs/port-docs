---
description: Ingest vulnerability alerts from Orca Security using a custom webhook integration
title: Orca Security
---


# Ingest vulnerability alerts from Orca Security
This guide shows you how to ingest both historical and realtime alerts in Orca Security. To do this, you will use Port's webhook feature (for realtime alerts) and/or a Python script (for historical data).

For either ingestion types, you will create the `orcaSecurityAlert` blueprint:

<details>
<summary><b>Orca Security Alert blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "orcaSecurityAlert",
  "description": "A representation of an Orca Security Alert",
  "title": "Orca Security Alert",
  "icon": "Alert",
  "schema": {
    "properties": {
      "description": {
        "type": "string",
        "title": "Description",
        "description": "Description of alert"
      },
      "source": {
        "type": "string",
        "title": "Source",
        "description": "The source of the alert"
      },
      "status": {
        "type": "string",
        "title": "Status",
        "description": "Current status of the vulnerability on assets"
      },
      "recommendation": {
        "type": "string",
        "title": "Recommendation",
        "description": "Steps to take to resolve the issue"
      },
      "severity": {
        "type": "string",
        "title": "Severity",
        "description": "Severity of vulnerability on assets"
      },
      "riskLevel": {
        "type": "string",
        "title": "Risk Level",
        "description": "Level of risk exposed to by vulnerability"
      },
      "category": {
        "type": "string",
        "title": "Category",
        "description": "Category of alert"
      },
      "alertLabels": {
        "type": "array",
        "title": "Alert Labels"
      },
      "createdAt": {
        "type": "string",
        "title": "Created At",
        "description": "When the alert first appeared",
        "format": "date-time"
      },
      "lastUpdated": {
        "type": "string",
        "title": "Last Updated",
        "description": "When the alert was last updated",
        "format": "date-time"
      },
      "lastSeen": {
        "type": "string",
        "title": "Last Seen",
        "description": "When the alert was last seen",
        "format": "date-time"
      },
      "assetName": {
        "type": "string",
        "title": "Asset Name",
        "description": "Name of the asset affected by the alert"
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

## Ingest realtime alerts using webhooks

1. Head over to the [Data sources](https://app.getport.io/settings/data-sources) page

2. Click on the "+ Data source" icon at the top right corner

3. Go to the "_Webhook_" tab and click on "Custom integration".

4. Fill in the details of the form like so:

<img src='/img/guides/createOrcaSecurityVulnerabilityAlertWebhook.png' border='1px' />


**Note:** Copy the webhook URL displayed by Port in the next step, you'll need it to set up webhooks on the Orca Security side.

5. In the blueprint mapping section, use the following mapping configuration:

<details>
<summary><b> Orca Security Alert webhook blueprint (Click to expand)</b></summary>

```json showLineNumbers

[
  {
    "blueprint": "orcaSecurityAlert",
    "filter": "true",
    "entity": {
      "identifier": ".body.state.alert_id",
      "title": ".body.state.alert_id + '-' + .body.type_string",
      "properties": {
        "description": ".body.description",
        "assetName": ".body.asset_name",
        "source": ".body.source",
        "status": ".body.state.status",
        "recommendation": ".body.recommendation",
        "severity": ".body.state.severity",
        "riskLevel": ".body.state.risk_level",
        "category": ".body.category",
        "alertLabels": ".body.alert_labels",
        "createdAt": ".body.state.created_at",
        "lastUpdated": ".body.state.last_updated",
        "lastSeen": ".body.state.last_seen"
      },
      "relations": {}
    }
  }
]

```

</details>

6. Click on "Save"

7. Go to your Orca Security dashboard and click on **Settings** at the bottom right corner. Under **Connections**, select **Integrations** then scroll to the **Webhooks** item in the grid.

8. Click on "Configure" -> "Create" and enter the following information:
  - **Name:** Enter a suitable name
  - **Trigger URL:** Enter your Port webhook URL here

Leave the **API Key** field blank. Click on "Save"

9. Test the alert by going to the **Alerts** page, click on one of the alerts -> **Take Action** -> **Notifications** -> **Send to webhook** -> **\<Your created webhook\>**.

You should see the newly created alert entity in your Port catalog:

<img src='/img/guides/orcaSecurityVulnerabilityAlertsCatalog.png' border='1px' />



## Ingest historical vulnerability alerts using Python script
In this example you are going to use the provided Python script to fetch data from the Orca Security REST API and ingest it to Port.

### Prerequisites

This example utilizes the same [blueprint](#ingest-historical-and-realtime-vulnerability-alers-in-orca-security) definition from the previous section.

In addition, you require the following environment variables:

- `PORT_CLIENT_ID` - Your Port client id
- `PORT_CLIENT_SECRET` - Your Port client secret
- `ORCA_SECURITY_API_TOKEN` - Get that by following the steps below
  - Go to **Settings** -> **Users & Permissions** -> **API** -> **API Tokens**
  - Click on **Add API Token**
  - Fill in the details required and select **Shiftleft Alert Manager** for the role.
  - Click on save and copy the API token
- `ORCA_SECURITY_API_URL` - The host URL of your Orca Security dashboard. See the below table for which URL to use depending on your region:

<details>
<summary><b>Orca Security API URL list (Click to expand)</b></summary>


| Region               | URL                                 |
|----------------------|-------------------------------------|
| US                   | https://api.orcasecurity.io/api/    |
| Europe               | https://app.eu.orcasecurity.io/api/ |
| Australia            | https://app.au.orcasecurity.io/api/ |
| India                | https://app.in.orcasecurity.io/api/ |
| Israel               | https://api.il.orcasecurity.io/api/ |
| Brazil               | https://api.sa.orcasecurity.io/api/ |


</details>


:::info
Find your Port credentials using this [guide](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)
:::

### Dependencies
The script assumes `Python >= 3.10` and requires a few dependencies to work which can simply be installed with the command:

```bash
pip3 install loguru requests httpx
```

### Python script
Use the following Python script to ingest historical Orca Security Vulnerability alerts into port:

<details>
<summary><b>Orca Security Python script for historical vulnerability alerts (Click to expand)</b></summary>

```python showLineNumbers
import asyncio
import os
from typing import Any, Generator

import httpx
import requests
from loguru import logger

VULNERABILITY_ALERT_BLUEPRINT = "orcaSecurityAlert"

PORT_API_URL = "https://api.getport.io/v1"
PORT_CLIENT_SECRET = os.getenv("PORT_CLIENT_SECRET")
PORT_CLIENT_ID = os.getenv("PORT_CLIENT_ID")
ORCA_SECURITY_API_TOKEN = os.getenv("ORCA_SECURITY_API_TOKEN")
ORCA_SECURITY_API_URL = os.getenv("ORCA_SECURITY_API_URL")


## Get Port Access Token
credentials = {"clientId": PORT_CLIENT_ID, "clientSecret": PORT_CLIENT_SECRET}

token_response = requests.post(f"{PORT_API_URL}/auth/access_token", json=credentials)
token_response.raise_for_status()
access_token = token_response.json()["accessToken"]

# You can now use the value in access_token when making further requests
headers = {"Authorization": f"Bearer {access_token}"}


async def add_entity_to_port(
    client: httpx.AsyncClient, blueprint_id: str, entity_object: dict[str, Any]
):
    """A function to create the passed entity in Port

    Params
    --------------
    client: httpx.AsyncClient
        The httpx client object

    blueprint_id: str
        The blueprint id to create the entity in Port

    entity_object: dict
        The entity to add in your Port catalog

    Returns
    --------------
    None
    """
    logger.info(f"Adding entity to Port: {entity_object}")
    response = await client.post(
        (
            f"{PORT_API_URL}/blueprints/"
            f"{blueprint_id}/entities?upsert=true&merge=true"
        ),
        json=entity_object,
        headers=headers,
    )
    if response.status_code > 299:
        logger.info("Ingesting {blueprint_id} entity to port failed, skipping...")
    logger.info(f"Added entity to Port: {entity_object}")


def turn_sequence_to_chunks(
    sequence: list[str], chunk_size: int
) -> Generator[list[str], None, None]:
    if chunk_size >= len(sequence):
        yield sequence
        return
    start, end = 0, chunk_size

    while start <= len(sequence) and sequence[start:end]:
        yield sequence[start:end]
        start += chunk_size
        end += chunk_size

    return


async def ingest_alert_as_entity(
    client: httpx.AsyncClient, alert: dict[str, Any]
) -> dict[str, Any]:
    logger.info(f"create alert entity: {alert['state']['alert_id']}")
    data = {
        "identifier": alert["state"]["alert_id"],
        "title": alert["state"]["alert_id"] + "-" + alert["type_string"],
        "properties": {
            "description": alert["description"],
            "assetName": alert["asset_name"],
            "source": alert["source"],
            "status": alert["state"]["status"],
            "recommendation": alert["recommendation"],
            "severity": alert["state"]["severity"],
            "riskLevel": alert["state"]["risk_level"],
            "category": alert["category"],
            "alertLabels": alert["alert_labels"],
            "createdAt": alert["state"]["created_at"],
            "lastUpdated": alert["state"]["last_updated"],
            "lastSeen": alert["state"]["last_seen"],
        },
    }

    await add_entity_to_port(client, VULNERABILITY_ALERT_BLUEPRINT, data)


async def retrieve_alerts(client: httpx.AsyncClient):
    authorization_header = {"Authorization": f"Token {ORCA_SECURITY_API_TOKEN}"}

    response = await client.get(
        f"{ORCA_SECURITY_API_URL}alerts", headers=authorization_header
    )

    if response.is_error:
        logger.error(
            "Something went wrong while trying to"
            " retrieve alerts from Orca Security servers"
        )
        logger.error(response.json())

    return response.json()["data"]


async def main():
    logger.info("Starting Port integration")
    async with httpx.AsyncClient() as client:
        fetched_alerts = await retrieve_alerts(client)

        grouped_alerts = turn_sequence_to_chunks(fetched_alerts, 10)

        for alerts in grouped_alerts:
            await asyncio.gather(
                *[ingest_alert_as_entity(client, alert) for alert in alerts]
            )
    logger.info("Finished Port integration")


if __name__ == "__main__":
    asyncio.run(main())

```

</details>


After running the script, you can see the ingested alerts in your Port dashboard:

<img src='/img/guides/orcaAlertsIngested.png' border='1px' />


:::warning Orca Security API limits
Due to limitations of the Orca Security Alerts API and unavailable pagination, only 1,000 alerts can be ingested by the Python script
:::