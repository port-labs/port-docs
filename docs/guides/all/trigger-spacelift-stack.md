---
displayed_sidebar: null
description: Learn how to trigger a Spacelift stack in Port to automate infrastructure workflows
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Trigger a Spacelift stack

This guide demonstrates how to implement a self-service action in Port that allows you to trigger a Spacelift stack directly from Port and automate your infrastructure deployment workflows seamlessly.

## Use cases
- Empower engineering teams to deploy infrastructure on demand without needing direct access to Spacelift.
- Automate provisioning or destruction of environments (e.g., staging, preview, QA) via a single click in Port.


## Prerequisites

- Complete the [onboarding process](/getting-started/overview).
- Access to your Spacelift organization with permissions to manage stacks.

## Set up data model

You will need to manually create a blueprint in Port to represent your Spacelift stacks. 

### Create the Spacelift stack blueprint

1. Go to your [Builder](https://app.getport.io/settings/data-model) page.
2. Click on `+ Blueprint`.
3. Click on the `{...}` button in the top right corner, and choose `Edit JSON`.
4. Add this JSON schema:

    <details>
    <summary><b>Spacelift Stack Blueprint (Click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "space_lift_stack",
        "title": "SpaceLift Stack",
        "icon": "IaC",
        "schema": {
            "properties": {
                "space": {
                    "type": "string",
                    "title": "Space"
                },
                "label": {
                    "items": {
                        "type": "string"
                    },
                    "type": "array",
                    "title": "Label"
                },
                "description": {
                    "type": "string",
                    "title": "Description"
                },
                "repository": {
                    "type": "string",
                    "title": "Repository"
                },
                "link": {
                    "icon": "DefaultProperty",
                    "type": "string",
                    "title": "Link",
                    "format": "url"
                },
                "state": {
                    "type": "string",
                    "title": "State"
                },
                "git_provider": {
                    "type": "string",
                    "title": "Git Provider"
                },
                "branch": {
                    "type": "string",
                    "title": "Branch"
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

5. Click `Save` to create the blueprint.

## Set up self-service action

You can trigger Spacelift stack by leveraging Port's **synced webhooks** and **secrets** to directly interact with Spacelift's API. 

<h3>Add Port secrets</h3>

To add these secrets to your portal:

1. Click on the `...` button in the top right corner of your Port application.

2. Click on **Credentials**.

3. Click on the `Secrets` tab.

4. Click on `+ Secret` and add the following secrets:
    - `SPACELIFT_API_KEY_ID`: Your Spacelift API key ID. [How to generate it](https://docs.spacelift.io/integrations/api#spacelift-api-key-token).
    - `SPACELIFT_API_SECRET`: The secret from the file downloaded when the API key was created.
    - `SPACELIFT_TOKEN`: A JWT token generated using the API key and secret. Use the curl command below:

        <details>
        <summary><b>Curl command to generate jwt token</b></summary>

        ```bash showLineNumbers
        curl --location 'https://<your-account>.app.spacelift.io/graphql' \
        --header 'Content-Type: application/json' \
        --data '{"query":"mutation GetSpaceliftToken($id: ID!, $secret: String!) {\n  apiKeyUser(id: $id, secret: $secret) {\n    jwt\n  }\n}\n","variables":{"id":"<YOUR_SPACELIFT_API_KEY_ID>","secret":"<YOUR_SPACELIFT_API_SECRET>"}}'
        ```
        </details>

<h3>Create self service action</h3>

To create the self-service action that will trigger the Spacelift stack:

1. Head to the [self-service](https://app.getport.io/self-serve) page.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Trigger Spacelift Stack Action (Click to expand)</b></summary>

    :::tip Replace your credentials
    Replace `<YOUR_SPACELIFT_API_URL>` with your actual Spacelift GraphQL API URL. The url follow this pattern: `https://<your_org_id>.app.spacelift.io/graphql`
    :::

    ```json showLineNumbers
    {
        "identifier": "trigger_spacelift_stack",
        "title": "Trigger Spacelift Stack",
        "icon": "Git",
        "description": "A self service action to trigger Spacelift stack",
        "trigger": {
            "type": "self-service",
            "operation": "CREATE",
            "userInputs": {
                "properties": {
                    "stack": {
                        "title": "Stack",
                        "icon": "DefaultProperty",
                        "type": "string",
                        "blueprint": "space_lift_stack",
                        "sort": {
                            "property": "$title",
                            "order": "ASC"
                        },
                        "format": "entity"
                    }
                },
                "required": [
                    "stack"
                ],
                "order": [
                    "stack"
                ]
            }
        },
        "invocationMethod": {
            "type": "WEBHOOK",
            "url": "<YOUR_SPACELIFT_API_URL>",
            "agent": false,
            "synchronized": true,
            "method": "POST",
            "headers": {
                "Authorization": "Bearer {{.secrets.SPACELIFT_TOKEN}}",
                "Content-Type": "application/json"
            },
            "body": {
                "query": "mutation ($stackId: ID!) { runTrigger(stack: $stackId) { id title type state createdAt updatedAt branch triggeredBy driftDetection } }",
                "variables": {
                    "stackId": "{{.inputs.stack.identifier}}"
                }
            }
        },
        "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Trigger Spacelift Stack` action in the self-service page. 🎉

## Ingest existing stacks from Spacelift 

When you attempt to trigger a Spacelift stack, you might notice the entity dropdown is empty. This is because no `Spacelift Stacks` have been ingested into Port yet.

Use the Python script below to pull in your Spacelift stacks and sync them to Port.

<details>
<summary><b>Python script to ingest Spaclift stack</b></summary>
:::tip Running the script

1. Install dependencies:

```bash showLineNumbers
pip install loguru httpx
```
2. Export the required environment variables:

```bash showLineNumbers
export SPACELIFT_API_KEY_ENDPOINT=https://your-account.app.spacelift.io/graphql
export SPACELIFT_API_KEY_ID=Your Spacelift API key ID
export SPACELIFT_API_KEY_SECRET=Your Spacelift API secret
export PORT_CLIENT_ID=Your Port client ID
export PORT_CLIENT_SECRET=Your Port client secret
```
3. Save the script to a .py file and run it.

:::

```python showLineNumbers
import os
import httpx
from loguru import logger

# Spacelift API credentials from environment variables
SPACELIFT_API_ENDPOINT = os.environ.get("SPACELIFT_API_KEY_ENDPOINT")
SPACELIFT_API_KEY_ID = os.environ.get("SPACELIFT_API_KEY_ID")
SPACELIFT_API_KEY_SECRET = os.environ.get("SPACELIFT_API_KEY_SECRET")

# Port API credentials
PORT_CLIENT_ID = os.environ.get("PORT_CLIENT_ID", "your id")
PORT_CLIENT_SECRET = os.environ.get("PORT_CLIENT_SECRET", "your secret")
PORT_API_URL = "https://api.getport.io/v1"
PORT_BLUEPRINT_ID = "space_lift_stack"

# === GraphQL Token Mutation ===
TOKEN_MUTATION = """
mutation GetSpaceliftToken($apiKeyId: ID!, $apiKeySecret: String!) {
  apiKeyUser(id: $apiKeyId, secret: $apiKeySecret) {
    jwt
  }
}
"""
TOKEN_MUTATION_VARIABLES = {
    "apiKeyId": SPACELIFT_API_KEY_ID,
    "apiKeySecret": SPACELIFT_API_KEY_SECRET
}

# === Default Stack Query ===
LIST_STACK_QUERY = """
{
  stacks {
    id
    name
    space
    administrative
    state
    description
    repository
    repositoryURL
    provider
    labels
    branch
    namespace
    entityCount
  }
}
"""


async def get_spacelift_jwt_token():
    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPACELIFT_API_ENDPOINT,
            json={"query": TOKEN_MUTATION, "variables": TOKEN_MUTATION_VARIABLES},
        )
        response.raise_for_status()
        jwt = response.json()["data"]["apiKeyUser"]["jwt"]
        logger.success("Successfully fetched Spacelift JWT token")
        return jwt


async def get_spacelift_stacks(jwt_token: str):
    headers = {"Authorization": f"Bearer {jwt_token}"}
    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPACELIFT_API_ENDPOINT,
            json={"query": LIST_STACK_QUERY},
            headers=headers,
        )
        response.raise_for_status()
        logger.success("Successfully fetched stacks data from Spacelift")
        return response.json()["data"]["stacks"]


async def get_port_access_token():
    credentials = {"clientId": PORT_CLIENT_ID, "clientSecret": PORT_CLIENT_SECRET}
    async with httpx.AsyncClient() as client:
        response = await client.post(f"{PORT_API_URL}/auth/access_token", json=credentials)
        response.raise_for_status()
        token = response.json()["accessToken"]
        logger.success("Successfully fetched Port access token")
        return token


async def create_port_entity(access_token: str, stack: dict):
    headers = {"Authorization": f"Bearer {access_token}"}

    entity = {
        "identifier": stack["id"],
        "title": stack["name"],
        "properties": {
            "space": stack.get("space", ""),
            "label": stack.get("labels", []),
            "description": stack.get("description", ""),
            "repository": stack.get("repository", ""),
            "state": stack.get("state", ""),
            "git_provider": stack.get("provider", ""),
            "branch": stack.get("branch", "")
        },
        "relations": {}
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PORT_API_URL}/blueprints/{PORT_BLUEPRINT_ID}/entities?upsert=true",
            json=entity,
            headers=headers
        )
        response.raise_for_status()
        logger.info(f"Upserted entity to Port: {stack['id']}")
        return response.json()


async def main():
    try:
        jwt_token = await get_spacelift_jwt_token()
        stacks = await get_spacelift_stacks(jwt_token)
        access_token = await get_port_access_token()

        for stack in stacks:
            await create_port_entity(access_token, stack)

        logger.success("Finished syncing all stacks to Port")
    except Exception as e:
        logger.error(f"Failed: {e}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```
</details>

## Let's test it!

1. Head to the [self-service page](https://app.getport.io/self-serve) of your portal.

2. Choose the `Trigger Spacelift Stack` action.

3. Select a stack entity.

4. Click on `Execute`.

5. You're done! Your stack will be triggered in Spacelift.  🎉
    
    <img src="/img/guides/spaceliftStackTrigger.png" width="600px" border="1px" />

## Refreshing your Spacelift token
According to [Spacelift's documentation](https://docs.spacelift.io/integrations/api#insomnia-setup), JWT tokens expire after 10 hours. If your action fails with a 401 Unauthorized error, you need to refresh the token. Follow the steps below to automate this process:

<h3>Step 1: Create a self-service action to refresh token</h3>

1. Head to the [self-service](https://app.getport.io/self-serve) page.
2. Click on the `+ New Action` button.
3. Click on the `{...} Edit JSON` button.
4. Copy and paste the following JSON configuration into the editor.

    <details>
    <summary><b>Refresh Spacelift Token Action (Click to expand)</b></summary>

    :::tip Replace your credentials
    Replace `<YOUR_SPACELIFT_API_URL>` with your actual Spacelift GraphQL API URL.
    The url follow this pattern: `https://<your_org_id>.app.spacelift.io/graphql`
    :::

    ```json showLineNumbers
    {
        "identifier": "refresh_spacelift_token",
        "title": "Refresh Spacelift Token",
        "icon": "Git",
        "description": "A self service action to refresh Spacelift token",
        "trigger": {
            "type": "self-service",
            "operation": "CREATE",
            "userInputs": {
                "properties": {},
                "required": [],
                "order": []
            }
        },
        "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://<your-account>.app.spacelift.io/graphql",
            "agent": false,
            "synchronized": true,
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": {
                "query": "mutation GetSpaceliftToken($id: ID!, $secret: String!) { apiKeyUser(id: $id, secret: $secret) { jwt } }",
                "variables": {
                    "id": "{{.secrets.SPACELIFT_API_KEY_ID}}",
                    "secret": "{{.secrets.SPACELIFT_API_KEY_SECRET}}"
                }
            }
        },
        "requiredApproval": false
    }
    ```
    </details>

5. Click `Save`.

Now you should see the `Refresh Spacelift Token` action in the self-service page. 🎉

<h3> Step 2: Create an automation to update token</h3>

Next, you'll create an automation that runs when the `Refresh Spacelift Token` action completes successfully. This automation captures the new token from the action’s response and updates the `SPACELIFT_TOKEN` secret in Port. To set it up:

1. Head to the [automation](https://app.getport.io/settings/automations) page.
2. Click on the `+ Automation` button.
3. Copy and paste the following JSON configuration into the editor.
    <details>
    <summary><b>Spacelift Token Refresh Automation (Click to expand)</b></summary>

    ```json showLineNumbers
    {
        "identifier": "spacelift_token_refresh_sync",
        "title": "Refresh Spacelift Token",
        "description": "Updates the Port secret with the new Spacelift jwt token",
        "trigger": {
            "type": "automation",
            "event": {
                "type": "RUN_UPDATED",
                "actionIdentifier": "refresh_spacelift_token"
            },
            "condition": {
                "type": "JQ",
                "expressions": [
                    ".diff.after.status == \"SUCCESS\""
                ],
                "combinator": "and"
            }
        },
        "invocationMethod": {
            "type": "WEBHOOK",
            "url": "https://api.port.io/v1/organization/secrets/SPACELIFT_TOKEN",
            "agent": false,
            "synchronized": true,
            "method": "PATCH",
            "headers": {},
            "body": {
                "secretValue": "{{ .event.diff.after.response.data.apiKeyUser.jwt  }}",
                "description": "Refreshed Spacelift API token"
            }
        },
        "publish": true
    }
    ```
    </details>

4. Click `Save`.

Now, every time you run the `Refresh Spacelift Token` action and it succeeds, your `SPACELIFT_TOKEN` secret in Port will be automatically updated with the new token.


## Ingest stacks via webhook

In this example we will create a webhook integration between [Spacelift](https://spacelift.io/) and Port, which will ingest stack entities in real time.

### Port configuration

Create the following blueprint definition:

<details>
<summary>Spacelift stack blueprint</summary>

```json showLineNumbers
{
    "identifier": "space_lift_stack",
    "title": "SpaceLift Stack",
    "icon": "IaC",
    "schema": {
        "properties": {
            "space": {
                "type": "string",
                "title": "Space"
            },
            "label": {
                "items": {
                    "type": "string"
                },
                "type": "array",
                "title": "Label"
            },
            "description": {
                "type": "string",
                "title": "Description"
            },
            "repository": {
                "type": "string",
                "title": "Repository"
            },
            "link": {
                "icon": "DefaultProperty",
                "type": "string",
                "title": "Link",
                "format": "url"
            },
            "state": {
                "type": "string",
                "title": "State"
            },
            "git_provider": {
                "type": "string",
                "title": "Git Provider"
            },
            "branch": {
                "type": "string",
                "title": "Branch"
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

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

<details>

<summary>Stack webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Spacelift Stack Mapper`.
   2. Identifier : `spacelift_stack_mapper`.
   3. Description : `A webhook configuration to map Spacelift stacks to Port`.
   4. Icon : `Git`.
2. **Integration configuration** tab - fill the following JQ mapping:

   ```json showLineNumbers
    [
      {
        "blueprint": "space_lift_stack",
        "operation": "create",
        "filter": "true",
        "entity": {
        "identifier": ".body.stack.id | tostring",
        "title": ".body.stack.name | tostring",
        "properties": {
            "label": ".body.stack.labels",
            "description": ".body.stack.description",
            "link": ".body.stack.url",
            "git_provider": ".body.stack.vcs",
            "repository": ".body.stack.repository",
            "branch": ".body.run.branch",
            "state": ".body.state"
        }
        }
      }
    ]
    ```

3. Click **Save** at the bottom of the page.

</details>

### Create a webhook in Spacelift

To send webhook events from Spacelift to an external system like Port, we must first create a webhook and then link it to a notification policy. Follow the steps below to complete the setup:

1. Go to **Webhooks** in your Spacelift account.
2. Click **Create webhook**.
3. Input the following details:
   1. `Name` - use a meaningful name such as Port Webhook.
   2. `Endpoint URL` - enter the value of the `url` key you received after creating the webhook configuration.
   3. `Space` - select the space that should have access to the webhook.
4. Enable the **Webhook** toggle.
5. Click **Create** to create the webhook.

### Sending notifications

Webhook events in Spacelift are triggered through notification policies. To set this up, we need the webhook ID that Spacelift assigns when you create a webhook.

#### How to find your webhook ID

1. In your Spacelift account, go to **Webhooks**.

2. Locate the webhook you created.

3. Click the **three dots (...)** next to the webhook.

4. Select **Copy webhook ID** to copy the webhook's unique identifier.

We’ll use this ID when configuring the notification policy.

#### Creating a notification policy

1. Go to **Policies** in Spacelift.
2. Click **Create policy**.
3. Input the following details:
   1. `Name` - use a meaningful name such as Port Webhook Notification.
   2. `Type` - select `Notification policy` from the list.
   3. `Space` - select the space that should have access to the policy.
   4. `Description` - add a detailed description.
4. Click **Continue** to open the YAML editor where you can bind the notification to the webhook.
5. Add one of the following configurations:

    <details>
    <summary><b>Notification policy configuration (click to expand)</b></summary>

    :::tip Webhook identifier replacement
    Be sure to replace `<YOUR-WEBHOOK-ID>` with the ID you copied from the Spacelift webhook you created
    :::

    ```yaml showLineNumbers
    # Option 1: Trigger on tracked runs finishing

    webhook[{"endpoint_id": "<YOUR-WEBHOOK-ID>"}] {
    input.run_updated.run.type == "TRACKED"
    input.run_updated.run.state == "FINISHED"
    }

    # Option 2: Trigger on any run update

    webhook[{"endpoint_id": "<YOUR-WEBHOOK-ID>"}] {
    input.run_updated != null
    }
    ```
    </details>

6. Click **Create policy**.

Done! any change that happens to your stacks in Spacelift will trigger a webhook event to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

### Let's Test It

This section includes a sample response data from Spacelift. In addition, it includes the entity created from the event based on the configuration provided in the previous section.

#### Payload

Here is an example of the payload structure from Spacelift:

<details>
<summary><b>Webhook response data (Click to expand)</b></summary>

```json showLineNumbers
{
  "body": {
    "account": "peygis",
    "state": "FINISHED",
    "stateVersion": 5,
    "timestamp": 1745599888,
    "timestamp_millis": 1745599888383,
    "run": {
      "id": "01JSPXRQR2F3Y06HD85YYXRSZ7",
      "branch": "main",
      "commit": {
        "authorLogin": "PeyGis",
        "authorName": "PagesCoffy",
        "hash": "87c5ffdcf063445657c7082a447cb6a7d60f2c9d",
        "message": "Merge pull request #2 from PeyGis/PeyGis-patch-2",
        "timestamp": 1745516998,
        "url": "https://github.com/PeyGis/argocd-app/commit/87c5ffdcf063445657c7082a447cb6a7d60f2c9d"
      },
      "createdAt": 1745599880,
      "delta": {
        "added": 0,
        "changed": 0,
        "deleted": 0,
        "resources": 0
      },
      "driftDetection": false,
      "triggeredBy": "api::01JSMHTFM9TXWW1XK4AZN1SA8K",
      "type": "TRACKED",
      "url": "https://peygis.app.spacelift.io/stack/ai-agent/run/01JSPXRQR2F3Y06HD85YYXRSZ7"
    },
    "stack": {
      "id": "ai-agent",
      "name": "ai-agent",
      "description": "here is the node",
      "labels": [
        "node"
      ],
      "repository": "PeyGis/argocd-app",
      "url": "https://peygis.app.spacelift.io/stack/ai-agent",
      "vcs": "GITHUB"
    },
    "workerPool": {
      "public": true,
      "labels": [],
      "id": "",
      "name": ""
    },
    "event_source": "spacelift",
    "event_type": "run_state_changed_event"
  },
  "headers": {
    "Host": "ingest.getport.io",
    "User-Agent": "Go-http-client/2.0",
    "Content-Length": "1063",
    "Accept-Encoding": "gzip",
    "Content-Type": "application/json",
    "Traceparent": "00-000000000000000045dc17949932896c-7363f5faf7992244-01",
    "Tracestate": "dd=s:1;p:3705f90ce0614b5d",
    "X-Datadog-Parent-Id": "3964848880668986205",
    "X-Datadog-Sampling-Priority": "1",
    "X-Datadog-Trace-Id": "5033924410486196588",
    "X-Forwarded-Host": "ingest.getport.io",
    "X-Forwarded-Server": "public-traefik-5649595896-pgqbw",
    "X-Real-Ip": "10.0.30.189",
    "X-Replaced-Path": "/xI35fItWHlrYpVQE",
    "X-Signature": "sha1=dd9dc0209c2791f029ccd0cfce0a2548a3e448df",
    "X-Signature-256": "sha256=52a747571c1e7f464424cb4211331f195105bd6dba39aa9a2f4b7124fe747d36",
    "host": "ingest.getport.io",
    "user-agent": "Go-http-client/2.0",
    "content-length": "1063",
    "accept-encoding": "gzip",
    "content-type": "application/json",
    "traceparent": "00-000000000000000045dc17949932896c-7363f5faf7992244-01",
    "tracestate": "dd=s:1;p:3705f90ce0614b5d",
    "x-datadog-parent-id": "3964848880668986205",
    "x-datadog-sampling-priority": "1",
    "x-datadog-trace-id": "5033924410486196588",
    "x-forwarded-host": "ingest.getport.io",
    "x-forwarded-server": "public-traefik-5649595896-pgqbw",
    "x-real-ip": "10.0.30.189",
    "x-replaced-path": "/xI35fItWHlrYpVQE",
    "x-signature": "sha1=dd9dc0209c2791f029ccd0cfce0a2548a3e448df",
    "x-signature-256": "sha256=52a747571c1e7f464424cb4211331f195105bd6dba39aa9a2f4b7124fe747d36"
  },
  "queryParams": {}
}
```

</details>

#### Mapping Result

The combination of the sample payload and the webhook configuration generates the following Port entity:

<details>
<summary><b>Stack entity in Port (Click to expand)</b></summary>

```json showLineNumbers
{
  "blueprint": "space_lift_stack",
  "identifier": "ai-agent",
  "createdAt": "2025-04-24T17:57:01.014Z",
  "updatedBy": "space_lift_stack_mapper",
  "createdBy": "space_lift_stack_mapper",
  "team": [],
  "title": "ai-agent",
  "relations": {},
  "properties": {
    "link": "https://peygis.app.spacelift.io/stack/ai-agent",
    "description": "AI agent stack",
    "git_provider": "GITHUB",
    "label": [
      "ai",
      "llm"
    ],
    "state": "FINISHED",
    "repository": "PeyGis/codecov-example",
    "branch": "main",
    "space": null
  },
  "updatedAt": "2025-04-25T13:36:08.155Z"
}
```
</details>
