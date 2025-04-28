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

<h3>Create the Spacelift stack blueprint</h3>

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

## Refreshing Spacelift token
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