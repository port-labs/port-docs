---
sidebar_position: 9
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Broadcast message to API consumers

In this guide, we will create a self-service action in Port that executes a GitHub workflow to broadcast a Slack message to all service owners who consume an API. The required form input for this action is a text box with information about the broadcast message.

## Prerequisites
1. Install Port's GitHub app by clicking [here](https://github.com/apps/getport-io/installations/new).
2. Configure a [Slack app](https://api.slack.com/apps) that can post a message to a Slack channel. 
   - The app should have a `chat:write` bot scope under **OAuth & Permissions**. 
   - Then, go to the Incoming Webhooks page and create a new webhook, specifying the target channel for the messages.
3. A GitHub repository in which you can trigger a workflow that we will use in this guide.

Below you can find the JSON for the `Service` and `API` blueprints required for the guide:

<details>
<summary><b>Service blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "service",
  "title": "Service",
  "icon": "Microservice",
  "schema": {
    "properties": {
      "readme": {
        "title": "README",
        "type": "string",
        "format": "markdown",
        "icon": "Book"
      },
      "url": {
        "title": "URL",
        "format": "url",
        "type": "string",
        "icon": "Link"
      },
      "language": {
        "type": "string",
        "title": "Language",
        "icon": "Git"
      },
      "badges": {
        "type": "array",
        "title": "Badges",
        "icon": "Git"
      },
      "slack": {
        "icon": "Slack",
        "type": "string",
        "title": "Slack",
        "format": "url"
      },
      "tier": {
        "title": "Tier",
        "type": "string",
        "description": "How mission-critical the service is",
        "enum": [
          "Mission Critical",
          "Customer Facing",
          "Internal Service",
          "Other"
        ],
        "enumColors": {
          "Mission Critical": "turquoise",
          "Customer Facing": "green",
          "Internal Service": "darkGray",
          "Other": "yellow"
        },
        "icon": "DefaultProperty"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "consumes_api": {
      "title": "Consumes API",
      "target": "api",
      "required": false,
      "many": true
    }
  }
}
```
</details>

<details>
<summary><b>API blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "api",
  "title": "API",
  "icon": "RestApi",
  "schema": {
    "properties": {
      "status": {
        "icon": "DefaultProperty",
        "title": "Status",
        "type": "string",
        "default": "Active",
        "enum": [
          "Active",
          "Deprecated",
          "Development",
          "Scheduled for Deprecation"
        ],
        "enumColors": {
          "Active": "green",
          "Deprecated": "red",
          "Development": "turquoise",
          "Scheduled for Deprecation": "orange"
        }
      },
      "description": {
        "title": "Description",
        "type": "string",
        "icon": "DefaultProperty"
      },
      "tags": {
        "title": "Tags",
        "type": "array",
        "items": {
          "enum": [
            "Payments",
            "Transactions",
            "Refunds",
            "Credit Card"
          ],
          "enumColors": {
            "Payments": "blue",
            "Transactions": "turquoise",
            "Refunds": "orange",
            "Credit Card": "purple"
          },
          "type": "string"
        },
        "icon": "DefaultProperty"
      },
      "visibility": {
        "icon": "DefaultProperty",
        "title": "Visibility",
        "type": "string",
        "default": "Internal",
        "enum": [
          "Public",
          "Internal"
        ],
        "enumColors": {
          "Public": "blue",
          "Internal": "pink"
        }
      },
      "documentation": {
        "title": "Documentation",
        "icon": "Confluence",
        "type": "string",
        "format": "url"
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

:::note How it works
Our Service blueprint has a relation to the API blueprint called `consumes_api`. When the action is triggered on an `API` entity, we will get all `Service` entities that are related and send the message to the slack webhook urls configured in them.
:::

## Create Github workflow

Follow these steps to get started:

1. Create the following GitHub Action secrets:
    - `PORT_CLIENT_ID` - Port Client ID [learn more](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#get-api-token)
    - `PORT_CLIENT_SECRET` - Port Client Secret [learn more](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#get-api-token)

<br />

2. Create the Port action in the [self-service page](https://app.getport.io/self-serve) on the `API` blueprint with the following JSON definition:

<details>

  <summary><b>Port Action: Send Announcement (click to expand)</b></summary>
   :::tip
- `<GITHUB-ORG>` - your GitHub organization or user name.
- `<GITHUB-REPO-NAME>` - your GitHub repository name.
:::


```json showLineNumbers
{
  "identifier": "send_announcement",
  "title": "Send Announcement",
  "icon": "Slack",
  "userInputs": {
    "properties": {
      "message": {
        "title": "Message",
        "type": "string"
      }
    },
    "required": [],
    "order": []
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB-ORG>",
    "repo": "<GITHUB-REPO-NAME>",
    "workflow": "send-announcement.yml",
    "omitUserInputs": false,
    "omitPayload": false,
    "reportWorkflowStatus": true
  },
  "trigger": "DAY-2",
  "description": "Send Announcement to the consumers of the API",
  "requiredApproval": false
}
```

</details>

<br />


3. In your Github repository, create a python script file under `/scripts/broadcast_messages.py` with the following content:

<details>

<summary><b>Python script to broadcast message (click to expand)</b></summary>

:::tip Using Block Kit to design the message layout
Whereas you can simply send a message with the *text* field, the [block kit framework](https://api.slack.com/block-kit) provides a rich pool of components and layouts to design your message and allows you to add interactivity. Try it out [here](https://app.slack.com/block-kit-builder/) to compose your own blocks. You can then replace the `blocks` field in the request below.
:::

```python showLineNumbers title="broadcast_messages.py"
import logging
import os
import requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PortClient:
    def __init__(self, client_id: str, client_secret: str):
        self.api_url = "https://api.getport.io"
        self.access_token = self.get_token(client_id, client_secret)
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "User-Agent": "port-message-service",
        }

    def get_token(self, client_id, client_secret):
        credentials = {"clientId": client_id, "clientSecret": client_secret}
        token_response = requests.post(
            f"{self.api_url}/v1/auth/access_token", json=credentials
        )
        token_response.raise_for_status()
        return token_response.json()["accessToken"]

    def search_entities(self, query):
        search_req = requests.post(
            f"{self.api_url}/v1/entities/search",
            json=query,
            headers=self.headers,
            params={},
        )
        search_req.raise_for_status()
        return search_req.json()["entities"]


def send_notification(entity, message, api):
    title = entity["title"]
    slack_webhook = entity["properties"].get("slack")

    if slack_webhook:
        payload = {
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"Hi _*{title.lower()}*_ team! :wave: We've made an update to the *{api}*:",
                    },
                },
                {"type": "divider"},
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f":white_large_square: *Details* \n{message}.",
                    },
                },
            ],
        }
        requests.post(slack_webhook, json=payload)
    else:
        print(f"No Slack webhook found for: {title}")


if __name__ == "__main__":
    port_client_id = os.environ.get("PORT_CLIENT_ID")
    port_client_secret = os.environ.get("PORT_CLIENT_SECRET")
    message = os.environ.get("MESSAGE")
    sending_api = os.environ.get("SENDING_API")

    print("Initializing Port client", port_client_id, port_client_secret)
    port_client = PortClient(port_client_id, port_client_secret)
    
    logger.info(f"Fetching entities for query: sending_api {sending_api},")
    search_query = {
        "combinator": "and",
        "rules": [
            {"property": "$blueprint", "operator": "=", "value": "service"},
            {
                "blueprint": "api",
                "operator": "relatedTo",
                "value": sending_api,
            },
        ],
    }

    entities = port_client.search_entities(search_query)

    print(f"Found {len(entities)} entities for {sending_api}")

    for entity in entities:
        print(f"Sending notification to {entity['title']}")
        send_notification(entity, message, sending_api)
```

</details>
<br />

4. Then, create a workflow file under `.github/workflows/lock-service.yml` with the following content:

<details>

<summary><b>GitHub workflow to call python script (click to expand)</b></summary>

```yaml showLineNumbers title="send-announcement.yml"
name: Send Message to Service Owners

on:
  workflow_dispatch:
    inputs:
      message:
        description: "Message to send to service owners"
        required: true
        type: string
      port_payload:
        required: true
        description: "Port's payload, including details for who triggered the action and general context (blueprint, run id, etc...)"
        type: string

jobs:
  notify_api_consumers:
    runs-on: ubuntu-latest
    steps:
      - name: checkout
        uses: actions/checkout@v4
      - name: Run python script
        env:
          MESSAGE: ${{ github.event.inputs.message }}
          SENDING_API: ${{ fromJson(github.event.inputs.port_payload).payload.entity.identifier }}
          PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
          PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
        run: |
          python3 ./scripts/broadcast_messages.py
```

</details>
<br />


5. Trigger the actions from the [self-service](https://app.getport.io/self-serve) page of your Port application.

<img src='/img/self-service-actions/setup-backend/github-workflow/apiBroadcast.png' width='85%' />


Done! You can now broadcast a message to all consumers of an API.