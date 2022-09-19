---
sidebar_position: 1
---

# Changelog Listener

A common use case of Self-Service Actions is listening to changes in the software catalog and reacting to them.

For example:

- When the CPU utilization % of a DB crosses the 80% mark, you might want to trigger a job that closes stale connections, kills stalled queries or just makes sure that everything is behaving correctly.
- When the healthcheck status of a microservice deployment goes from `healthy` to `degraded`, you might want to perform some scale-up or scale-out operation, or maybe send an alert message to the slack channel of the team that owns the microservice to make sure the on-call is aware of the issue.

## Goal

In the following example, you will create a changelog listener that can react to changes in Port in a way that works for you.

To implement the listener, you will use:

- python with [FastAPI](https://fastapi.tiangolo.com/) - to setup a REST API that will handle webhook requests.
- [smee.io](https://smee.io) and [pysmee](https://pypi.org/project/pysmee/) - to redirect webhook requests to your local API.
- Port's changelog capabilities - to send an event to your REST API every time something changes in your software catalog.
- Slack's webhooks - to send a message to your slack server, alerting your users of the change.

Your API will trigger every time a change happens to your `deploymentConfig` Blueprint, or one of it's Entities.

## Creating a webhook URL with Smee

Go to [smee.io](https://smee.io) and click on `Start a new channel`, you should see your `Webhook proxy URL` at the top of the page. You are going to use it to specify the webhook destination in the next section.

## Creating the deployment config Blueprint

A deployment config is used to represent a deployment of a service, in a specific environment in your infrastructure. A deployment config has multiple `deployments` tied to it, each representing a new version of the deployed code of the matching service, in the matching environment.

A deployment config is also just what it sounds like - a `config`, that means it is a good place to store runtime variables and values, links to logging, tracing or dashboard tools and more static data that does not change between deployments.

For this limited example, the `deployment config` Blueprint will include mostly status properties that are likely to change frequently, thus showing Port's changelog listener capabilities:

<details>
<summary>Deployment Config Blueprint JSON</summary>

```json showLineNumbers
{
  "identifier": "DeploymentConfig",
  "title": "Deployment Config",
  "icon": "Microservice",
  "schema": {
    "properties": {
      "healthStatus": {
        "type": "string",
        "title": "Health Status",
        "enum": ["Healthy", "Degraded", "Crashed", "Restarting"],
        "enumColors": {
          "Healthy": "green",
          "Degraded": "orange",
          "Crashed": "red",
          "Restarting": "yellow"
        }
      },
      "cpuUtil": {
        "type": "number",
        "title": "CPU Utilization"
      },
      "memoryUtil": {
        "type": "number",
        "title": "Memory Utilization"
      },
      "newRelicUrl": {
        "type": "string",
        "format": "url",
        "title": "New Relic",
        "description": "Link to the new relic dashboard of the service"
      },
      "sentryUrl": {
        "type": "string",
        "format": "url",
        "title": "Sentry URL",
        "description": "Link to the new sentry dashboard of the service"
      },
      "prometheusUrl": {
        "type": "string",
        "format": "url",
        "title": "Prometheus URL"
      },
      "locked": {
        "type": "boolean",
        "title": "Locked",
        "default": false,
        "description": "Are deployments currently allowed for this configuration",
        "icon": "Lock"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "formulaProperties": {},
  "relations": {},
  "changelogDestination": {
    "type": "WEBHOOK",
    "url": "YOUR_WEBHOOK_URL"
  }
}
```

</details>

In addition, here is a `deployment config` Entity matching the Blueprint schema:

<details>
<summary>Deployment Config Entity JSON</summary>

```json showLineNumbers
{
  "identifier": "notification-service-prod",
  "title": "Notification Service Production",
  "properties": {
    "healthStatus": "Healthy",
    "cpuUtil": 25,
    "memoryUtil": 30,
    "newRelicUrl": "https://newrelic.com",
    "sentryUrl": "https://sentry.io/",
    "prometheusUrl": "https://prometheus.io",
    "locked": false
  },
  "relations": {}
}
```

</details>

Below is a `python` code snippet to create both the deployment config Blueprint and Entity:

:::note
Remember to replace the placeholders for `YOUR_CLIENT_ID`, `YOUR_CLIENT_SECRET` and `YOUR_WEBHOOK_URL` with your Port client ID, secret and your Webhook URL (or Smee proxy URL).
:::

<details>
<summary>Click here to see the code</summary>

```python showLineNumbers
import requests

CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'
WEBHOOK_URL = 'YOUR_WEBHOOK_URL'

API_URL = 'https://api.getport.io/v1'

target_blueprint = 'DeploymentConfig'

credentials = {'clientId': CLIENT_ID, 'clientSecret': CLIENT_SECRET}

token_response = requests.post(f'{API_URL}/auth/access_token', json=credentials)

access_token = token_response.json()['accessToken']

headers = {
    'Authorization': f'Bearer {access_token}'
}

blueprint = {
    "identifier": "DeploymentConfig",
    "title": "Deployment Config",
    "icon": "Microservice",
    "schema": {
        "properties": {
            "healthStatus": {
                "type": "string",
                "title": "Health Status",
                "enum": ["Healthy", "Degraded", "Crashed", "Restarting"],
                "enumColors": {
                    "Healthy": "green",
                    "Degraded": "orange",
                    "Crashed": "red",
                    "Restarting": "yellow"
                }
            },
            "cpuUtil": {
                "type": "number",
                "title": "CPU Utilization"
            },
            "memoryUtil": {
                "type": "number",
                "title": "Memory Utilization"
            },
            "newRelicUrl": {
                "type": "string",
                "format": "url",
                "title": "New Relic",
                "description": "Link to the new relic dashboard of the service"
            },
            "sentryUrl": {
                "type": "string",
                "format": "url",
                "title": "Sentry URL",
                "description": "Link to the new sentry dashboard of the service"
            },
            "prometheusUrl": {
                "type": "string",
                "format": "url",
                "title": "Prometheus URL"
            },
            "locked": {
                "type": "boolean",
                "title": "Locked",
                "default": False,
                "description": "Are deployments currently allowed for this configuration",
                "icon": "Lock"
            }
        },
        "required": []
    },
    "mirrorProperties": {},
    "formulaProperties": {},
    "relations": {},
    "changelogDestination": {
        "type": "WEBHOOK",
        "url": WEBHOOK_URL
    }
}

entity = {
    "identifier": "notification-service-prod",
    "title": "Notification Service Production",
    "properties": {
        "healthStatus": "Healthy",
        "cpuUtil": 25,
        "memoryUtil": 30,
        "newRelicUrl": "https://newrelic.com",
        "sentryUrl": "https://sentry.io/",
        "prometheusUrl": "https://prometheus.io",
        "locked": False
    },
    "relations": {}
}

blueprint_response = requests.post(f'{API_URL}/blueprints', headers=headers, json=blueprint)
print(blueprint_response.json())

entity_response = requests.post(f'{API_URL}/blueprints/{target_blueprint}/entities', json=entity, headers=headers)

print(entity_response.json())
```

</details>

## Setting up a slack webhook

Now head to your [slack apps](https://api.slack.com/apps) and create a new app (or go to one of your existing apps). Then go to the `Incoming Webhooks` page and create a new webhook, you will need to specify a target channel on your server where messages sent to the slack webhook are delivered.

Copy the Webhook URL, you will use it to set up your python FastAPI in the next step.

## Setting up a webhook target

Now you're going to set up a basic API fully ready to receive changelog events from your software catalog in Port.

### Prerequisites

Please use `pip` to install:

- pysmee
- fastapi

```bash showLineNumbers
pip install fastapi pysmee
```

All of the code shown below is also available in the [changelog-listener-example-api](https://github.com/port-labs/changelog-listener-example-api) repository.

```
.
├── actions
│   ├── __init__.py
│   └── create_bucket.py
├── api
│   ├── __init__.py
│   ├── deps.py
│   └── endpoints
│       ├── __init__.py
│       └── bucket.py
├── clients
│   ├── __init__.py
│   ├── aws_s3.py
│   └── port.py
├── core
│   ├── __init__.py
│   └── config.py
├── main.py
└── schemas
    ├── __init__.py
    └── webhook.py
```
