---
sidebar_position: 2
---

# Action Runs Tutorial

Invoking a Port Self-Service Action creates an `actionRun` object inside Port.

You can find all existing Action Runs in one of three ways:

1. By going to the Audit Log page and selecting the Runs tab
2. By going to a [Specific Entity Page](../software-catalog/entity/entity.md#entity-page) and selecting Runs tab of the Entity
3. When invoking a Self-Service Action from the UI, a toast will appear on the page, with the link to the action run that corresponds to the run of the Self-Service Action.

This tutorial will teach you how to use Port's API to get existing Action Runs, update them with additional metadata and information about the results of the invoked Self-Service Action and also mark them action runs as completed or failed to keep a consistent history of invoked Self-Service Actions and their status.

## Setup

During this tutorial, you will interact with action runs that were created from a basic `create microservice` Self-Service Action that was added to a `microservice` Blueprint.

To follow along, the Blueprint definition and Self-Service Action definition are provided:

<details>
<summary>Microservice Blueprint</summary>

```json showLineNumbers
{
  "identifier": "microservice",
  "description": "This blueprint represents service in our software catalog",
  "title": "Service",
  "icon": "Microservice",
  "schema": {
    "properties": {
      "region": {
        "type": "string",
        "title": "Region"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "formulaProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</details>

<details>
<summary>Create microservice Self-Service Action</summary>

```json showLineNumbers
{
  "id": "action_ed2B0O9CbEYkuqvN",
  "identifier": "create_microservice",
  "title": "Create Microservice",
  "userInputs": {
    "properties": {
      "name": {
        "title": "Service name",
        "type": "string"
      },
      "region": {
        "title": "Cloud Region",
        "type": "string"
      }
    }
  },
  "invocationMethod": {
    "url": "https://smee.io/HWbNEEngVPEQRJA",
    "agent": false,
    "type": "WEBHOOK"
  },
  "trigger": "CREATE",
  "description": "Create new microservice"
}
```

</details>

:::note
The Blueprint and Self-Service Action are purposefully minimal because they are not the focus of this tutorial, but they can easily be extended to include extra properties you might require.
:::

## Action run Structure

After performing a simple invocation of the Self-Service Action with the following parameters:

```json showLineNumbers
{
  "name": "my-microservice",
  "region": "eu-west-1"
}
```

The following action invocation body is sent to the Webhook/Kafka topic:

```json showLineNumbers
{
  "payload": {
    "action": "create_microservice",
    "resourceType": "run",
    "status": "TRIGGERED",
    "trigger": {
      "by": {
        "orgId": "org_7SDeR821bunhS8es",
        "userId": "auth0|638879fa62c686d381b36ecb"
      },
      "origin": "UI",
      "at": "2022-12-07T12:53:52.916Z"
    },
    "context": {
      "entity": null,
      "blueprint": "microservice",
      // highlight-next-line
      "runId": "r_QOz6WoOB1Q2lmhZZ"
    },
    "payload": {
      "entity": null,
      "action": {
        "id": "action_ed2B0O9CbEYkuqvN",
        "identifier": "create_microservice",
        "title": "Create Microservice",
        "userInputs": {
          "properties": {
            "name": { "title": "Service name", "type": "string" },
            "region": { "title": "Cloud Region", "type": "string" }
          }
        },
        "invocationMethod": {
          "url": "https://smee.io/HWbNEEngVPEQRJA",
          "agent": false,
          "type": "WEBHOOK"
        },
        "trigger": "CREATE",
        "description": "Create new microservice",
        "blueprint": "microservice",
        "createdAt": "2022-12-07T09:48:28.659Z",
        "createdBy": "auth0|638879fa62c686d381b36ecb",
        "updatedAt": "2022-12-07T09:48:28.659Z",
        "updatedBy": "auth0|638879fa62c686d381b36ecb"
      },
      "properties": { "name": "my-microservice", "region": "eu-west-1" }
    }
  }
}
```

Note that the `runId` of the invoked Self-Service Action is: `r_QOz6WoOB1Q2lmhZZ`.

By making a request to `https://api.getport.io/v1/actions/runs/{run_id}` where `run_id=r_QOz6WoOB1Q2lmhZZ`, you get the following response:

```json showLineNumbers
{
  "ok": true,
  "run": {
    "id": "r_QOz6WoOB1Q2lmhZZ",
    "status": "IN_PROGRESS",
    "blueprint": {
      "identifier": "microservice",
      "title": "Service"
    },
    "action": "create_microservice",
    "endedAt": null,
    "source": "UI",
    "relatedEntityExists": false,
    "relatedBlueprintExists": true,
    "properties": {
      "name": "my-microservice",
      "region": "eu-west-1"
    },
    "createdAt": "2022-12-07T12:53:52.916Z",
    "updatedAt": "2022-12-07T12:53:52.916Z",
    "createdBy": "auth0|638879fa62c686d381b36ecb",
    "updatedBy": "auth0|638879fa62c686d381b36ecb"
  }
}
```

:::info
Some important fields to note in the action run object are:

- `status` - Shows the current status of the action, when a Self-Service Action is invoked, the value is automatically set to `IN_PROGRESS`, but it is also possible to update the action run status to `SUCCESS` or `FAILURE`;
- `endedAt` - Currently shows `null` because the action run status is `IN_PROGRESS`, but it will automatically update when the status of the action run is changed to either `SUCCESS` or `FAILURE`.

:::

## Updating an action run

Now let's take this action run and update its information, all updates to an action run can be performed by sending a `PATCH` request to the `https://api.getport.io/v1/actions/runs/{run_id}` endpoint.

Our different update options are:

- Set the action run status - `SUCCESS`, `FAILURE`;
- Add a link to an external log of the job runner - AWS Cloudwatch logs, Github Workflow job, Jenkins job, etc.;
- Add a message JSON object which contains additional metadata, runtime or debug information.

Let's update our action run with the following `PATCH` request body:

```json showLineNumbers
{
  "status": "SUCCESS",
  "link": "https://github.com/actions/toolkit/actions/runs/3617893813",
  "message": {
    "run_status": "Run completed successfully!"
  }
}
```

The API returns the following response:

```json showLineNumbers
{
  "ok": true,
  "run": {
    "id": "r_QOz6WoOB1Q2lmhZZ",
    "status": "SUCCESS",
    "blueprint": {
      "identifier": "microservice",
      "title": "Service"
    },
    "action": "create_microservice",
    "endedAt": "2022-12-07T14:51:52.796Z",
    "source": "UI",
    "link": "https://github.com/actions/toolkit/actions/runs/3617893813",
    "message": {
      "run_status": "Run completed successfully!"
    },
    "relatedEntityExists": false,
    "relatedBlueprintExists": true,
    "properties": {
      "name": "my-microservice",
      "region": "eu-west-1"
    },
    "createdAt": "2022-12-07T12:53:52.916Z",
    "updatedAt": "2022-12-07T14:51:52.796Z",
    "createdBy": "auth0|638879fa62c686d381b36ecb",
    "updatedBy": "KZ5zDPudPshQMShUb4cLopBEE1fNSJGE"
  }
}
```

:::info
Note how our action run has updated:

- `status` - has been updated to `SUCCESS`;
- `endedAt` - now correctly shows the time that the action run was updated;
- `link` - now includes the link we provided, and that link will also appear in the page matching the action run in Port;
- `message` - now includes the additional info we provided and it will also appear in the page matching the action run in Port.

:::

## Tying Entities to an action run

You can also add additional context and metadata to an action run, every API route that creates or changes an Entity (i.e. `POST`, `PUT`, `PATCH` and `DELETE` requests to the `https://api.getport.io/v1/blueprints/{blueprint_id}/entities/{entity_id}` route) can be sent with an additional `run_id` query parameter. By adding the `run_id` parameter, you reflect the change made to the Entity as part of the set of steps the action run performed during its runtime.

:::tip
Tying Entities to an action run is only possible when an action run is in the `IN_PROGRESS` status.
:::

For example, let's invoke another action run and use the following python snippet to create a new microservice Entity which matches our triggered Self-Service Action, and add the `run_id` query parameter to mark that the Self-Service Action was responsible for the creation of the new microservice:

<details>
<summary>Click here to see the Python code</summary>

```python showLineNumbers
# Dependencies to install:
# $ python -m pip install requests
from pprint import pprint
import requests

CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'

API_URL = 'https://api.getport.io/v1'

RUN_ID = 'YOUR_RUN_ID'

TARGET_BLUEPRINT_ID = 'microservice'


def get_auth_token():
    credentials = {'clientId': CLIENT_ID, 'clientSecret': CLIENT_SECRET}
    token_response = requests.post(f'{API_URL}/auth/access_token', json=credentials)
    return token_response.json()['accessToken']


def get_run_id(access_token, run_id):
    headers = {
        'Authorization': f'Bearer {access_token}'
    }

    run_id_resp = requests.get(f'{API_URL}/actions/runs/{run_id}', headers=headers)
    return run_id_resp.json()['run']


def create_entity(access_token, run_id, properties):
    headers = {
        'Authorization': f'Bearer {access_token}'
    }

    query = {
        "run_id": run_id,
        "upsert": "true"
    }

    body = {
        "identifier": f"{properties['name'].replace(' ','_')}",
        "title": f"{properties['name']}",
        "properties": {
            "region": f"{properties['region']}"
        }
    }

    entity_resp = requests.post(f"{API_URL}/blueprints/{TARGET_BLUEPRINT_ID}/entities", headers=headers, params=query, json=body)
    pprint(entity_resp.json()['entity'])
    return entity_resp.json()['entity']['identifier']


def mark_action_run_as_successful(access_token, run_id, entity_id, additional_message):
    headers = {
        'Authorization': f'Bearer {access_token}'
    }

    body = {
        "status": "SUCCESS",
        "link": "https://github.com/actions/toolkit/actions/runs/3617893813",
        "message": {
            "run_status": additional_message,
            "new_entity": entity_id
        }
    }

    action_update_resp = requests.patch(f'{API_URL}/actions/runs/{run_id}', headers=headers, json=body)
    pprint(action_update_resp.json()['run'])


def main():
    access_token = get_auth_token()

    run = get_run_id(access_token, RUN_ID)
    props = run['properties']
    entity_id = create_entity(access_token, RUN_ID, props)
    mark_action_run_as_successful(access_token, RUN_ID, entity_id, 'New Entity created!')


if __name__ == '__main__':
    main()

```

</details>

Now when you look at the run log of the action run, you will see the information of the newly created Entity:

![Developer portal action run log](../../static/img/self-service-actions/action_run_log.png)

:::tip
In the example above we created just one Entity, but it is possible to create, update or delete multiple Entities as part of the steps taken by a single action run, and all of these changes will be reflected in the action run log.
:::
