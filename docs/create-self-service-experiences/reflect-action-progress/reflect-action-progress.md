# Reflect action progress

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

Invoking a Port Self-Service Action creates an `actionRun` object inside Port.

:::tip
To learn more about configuring Self-Service Actions, refer to the [setup UI for actions](../setup-ui-for-action/setup-ui-for-action.md) page. After configuring a Self-Service Action, invoking it will generate an `actionRun` which you can learn more about in this tutorial.
:::

You can find all existing action runs in one of the following methods:

1. Select the Runs tab on the Audit Log page;
2. Select the Runs tab of a specific Entity on its [specific entity page](../../customize-pages-dashboards-and-plugins/page/entity-page.md);
3. When you invoke a Self-Service Action from the UI, a toast will appear on the page, with the link to the action run that corresponds to the run of the Self-Service Action.

This tutorial will teach you how to use Port's API to obtain existing action runs, update them with additional metadata and information about the results of the invoked Self-Service Action, and mark them as completed or failed to keep a consistent history of invoked Self-Service Actions and their status.

## Setup

During this tutorial, you will interact with action runs that were created from a basic `create microservice` Self-Service Action that was added to a `microservice` Blueprint.

The Blueprint definition and Self-Service Action we will use in this tutorial are detailed below:

:::note
The Blueprint and Self-Service Action are intentionally minimalistic since they are not the focus of this tutorial. If needed, they can easily be extended to include extra properties you require.
:::

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
  "calculationProperties": {},
  "relations": {}
}
```

</details>

<details>
<summary>Create microservice Self-Service Action</summary>

```json showLineNumbers
[
  {
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
      "url": "https://getport.io",
      "agent": false,
      "type": "WEBHOOK"
    },
    "trigger": "CREATE",
    "description": "Create new microservice"
  }
]
```

</details>

<details>
<summary>2nd day operation microservice Self-Service Action</summary>

```json showLineNumbers
[
  {
    "identifier": "deploy_microservice",
    "title": "Deploy Microservice",
    "userInputs": {
      "properties": {
        "environment": {
          "title": "Environment",
          "type": "string"
        }
      }
    },
    "invocationMethod": {
      "url": "https://getport.io",
      "agent": false,
      "type": "WEBHOOK"
    },
    "trigger": "DAY-2",
    "description": "Deploy the microservice in a specified environment"
  }
]
```

</details>

## Action run structure

### `CREATE` action trigger

Let's invoke a `CREATE` Self-Service Action with the following parameters:

```json showLineNumbers
{
  "name": "my-microservice",
  "region": "eu-west-1"
}
```

By invoking the Self-Service Action, the following action invocation body is sent:

```json showLineNumbers
{
  "action": "create_microservice",
  "resourceType": "run",
  "status": "TRIGGERED",
  "trigger": {
    "by": {
      "orgId": "org_7SDeR821bunhS8es",
      "userId": "auth0|638879fa62c686d381b36ecb",
      "user": {
        "email": "test@test.com",
        "firstName": "test",
        "lastName": "test",
        "id": "auth0|638879fa62c686d381b36ecb"
      }
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
        "url": "https://getport.io",
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
```

Note that the `runId` of the invoked Self-Service Action is: `r_QOz6WoOB1Q2lmhZZ`.

#### Interacting with runs

<Tabs groupId="interact" queryString="interact">

<TabItem value="info" label="Run info">

By making a GET request to `https://api.getport.io/v1/actions/runs/{run_id}` where `run_id=r_QOz6WoOB1Q2lmhZZ`, you get the following response:

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
In the action run object, pay attention to the following:

- `status` - current status of the action. When a Self-Service Action is invoked, the value is automatically set to `IN_PROGRESS`, but you can alter it to `SUCCESS` or `FAILURE` according to the run's progress;
- `endedAt` - shows `null` because the action run status is `IN_PROGRESS`, but it will automatically update when the status of the action run is changed to either `SUCCESS` or `FAILURE`.

:::

</TabItem>

<TabItem value="logs" label="Run logs">

By making a GET request to `https://api.getport.io/v1/actions/runs/{run_id}/logs` where `run_id=r_QOz6WoOB1Q2lmhZZ`, you get the following response:

```json showLineNumbers
{
  "ok": true,
  "runLogs": []
}
```

</TabItem>

</Tabs>

### `DAY-2` action trigger

An action run of a `DAY-2` Self-Service Action is very similar to an action run of a `CREATE` Self-Service Action, the main difference being that the Entity the action was invoked for is also provided in the action run object.

For example, after performing a simple invocation of the `DAY-2` Self-Service Action with the following parameters:

```json showLineNumbers
{
  "environment": "production"
}
```

The following action invocation body is sent (existing Entity is highlighted):

```json showLineNumbers
{
  "payload": {
    "action": "deploy_microservice",
    "resourceType": "run",
    "status": "TRIGGERED",
    "trigger": {
      "by": {
        "orgId": "org_7SDeR821bunhS8es",
        "userId": "auth0|638879fa62c686d381b36ecb",
        "user": {
          "email": "test@test.com",
          "firstName": "test",
          "lastName": "test",
          "id": "auth0|638879fa62c686d381b36ecb"
        }
      },
      "origin": "UI",
      "at": "2022-12-08T10:07:09.886Z"
    },
    "context": {
      "entity": "my-microservice",
      "blueprint": "microservice",
      // highlight-next-line
      "runId": "r_z0nJYJv0wCm2ASTR"
    },
    "payload": {
      // highlight-start
      "entity": {
        "identifier": "my-microservice",
        "title": "my-microservice",
        "icon": null,
        "blueprint": "microservice",
        "properties": {
          "region": "eu-west-1"
        },

        "relations": {},
        "createdAt": "2022-12-07T15:25:28.677Z",
        "createdBy": "KZ5zDPudPshQMShUb4cLopBEE1fNSJGE",
        "updatedAt": "2022-12-07T15:30:24.660Z",
        "updatedBy": "KZ5zDPudPshQMShUb4cLopBEE1fNSJGE"
      },
      // highlight-end
      "action": {
        "id": "action_AOLZfMmE3YUeBlMt",
        "identifier": "deploy_microservice",
        "title": "Deploy Microservice",
        "userInputs": {
          "properties": {
            "environment": {
              "title": "Environment",
              "type": "string"
            }
          }
        },
        "invocationMethod": {
          "url": "https://getport.io",
          "agent": false,
          "type": "WEBHOOK"
        },
        "trigger": "DAY-2",
        "description": "Deploy the microservice in a specified environment",
        "blueprint": "microservice",
        "createdAt": "2022-12-08T10:05:54.935Z",
        "createdBy": "auth0|638879fa62c686d381b36ecb",
        "updatedAt": "2022-12-08T10:05:54.935Z",
        "updatedBy": "auth0|638879fa62c686d381b36ecb"
      },
      "properties": {
        "environment": "production"
      }
    }
  }
}
```

Note that the `runId` of the invoked Self-Service Action is: `r_z0nJYJv0wCm2ASTR`.

#### Interacting with runs

<Tabs groupId="interact" queryString="interact">

<TabItem value="info" label="Run info">

By making a `GET` request to `https://api.getport.io/v1/actions/runs/{run_id}` where `run_id=r_z0nJYJv0wCm2ASTR`, you receive the following response:

```json showLineNumbers
{
  "ok": true,
  "run": {
    "id": "r_z0nJYJv0wCm2ASTR",
    "status": "IN_PROGRESS",
    "blueprint": {
      "identifier": "microservice",
      "title": "Service"
    },
    "entity": {
      "identifier": "my-microservice",
      "title": "my-microservice"
    },
    "action": "deploy_microservice",
    "endedAt": null,
    "source": "UI",
    "relatedEntityExists": true,
    "relatedBlueprintExists": true,
    "properties": {
      "environment": "production"
    },
    "createdAt": "2022-12-08T10:07:09.860Z",
    "updatedAt": "2022-12-08T10:07:09.860Z",
    "createdBy": "auth0|638879fa62c686d381b36ecb",
    "updatedBy": "auth0|638879fa62c686d381b36ecb"
  }
}
```

</TabItem>

<TabItem value="logs" label="Run Logs">

By making a `GET` request to `https://api.getport.io/v1/actions/runs/{run_id}/logs` where `run_id=r_z0nJYJv0wCm2ASTR`, you receive the following response:

```json showLineNumbers
{
  "ok": true,
  "runLogs": []
}
```

</TabItem>

</Tabs>

## Updating an action run

You can use Port's API to update an the following properties of an action run:
- `status` - The status of the action run. Initial value is `IN_PROGRESS`, can be set to `SUCCESS` or `FAILURE`.
- `statusLabel` - A custom message used to add information to the status of the action run.
- `logs` - Log entries that will be displayed in the action run's page in Port.

:::info Github backend
When using a `Github workflow` as the action backend, a `Report workflow status` option will be available and set to `Yes` by default. When using this option, Port will automatically update the status of the action run to `SUCCESS` or `FAILURE` according to the result of the Github workflow, so no manual update is required.
:::

### Run details

By sending a `PATCH` request to the `https://api.getport.io/v1/actions/runs/{run_id}` endpoint, you can do the following:

1. Update the run's status, by using the `status` key with one of these values: `SUCCESS`, `FAILURE`.  
   This will mark the run as completed and show a visual indicator, for example:
    <img src='/img/self-service-actions/reflect-action-progress/actionStatusSuccess.png' width='35%' border='1px' />
   
2. Update the run's status label, by using the `statusLabel` key with a custom message.  
   If a label and a status are both provided, the custom message will be displayed with the status' color. For example, the following request body:
   ```json showLineNumbers
   {
     "status": "FAILURE",
     "statusLabel": "Wrong personal token provided"
   }
   ```
   will display the following status label: 
    <img src='/img/self-service-actions/reflect-action-progress/actionStatusFailureLabel.png' width='45%' border='1px' />
   When providing a label only, the status will remain as `IN_PROGRESS` and the label will be displayed with its neutral color.

3. Add links to external logs of the job runners, by using the `link` key - AWS Cloudwatch logs, Github Workflow job, Jenkins job, etc.

:::tip Multiple and partial updates
You can make a `PATCH` request to the endpoint as many times as you need until the action run has finished (as long as you don't terminate the run by changing the `status`).  

Note that every patch request will override the previous information that was available for a given key. For example, when updating the `link` key multiple times, only the last provided value will be displayed in the action run.
:::

### Run logs

By sending a `POST` request to the `https://api.getport.io/v1/actions/runs/{run_id}/logs` endpoint, you can do the following:

1. Add log entries to the run's log, by using the `message` key.
2. Update the run's status via the `terminationStatus` key with one of these values: `SUCCESS`, `FAILURE`.
3. Update the run's status label, by using the `statusLabel` key.

For example, let's update our action run log with the following `POST` request body:

```json showLineNumbers
{
  "message": "my new log message"
}
```

Back in Port, the new log message will be displayed in the action run's page:

<img src='/img/self-service-actions/reflect-action-progress/actionLogExample.png' width='85%' border='1px' />

<br/><br/>

If we want to add a final log entry and also mark the action run as successful, we can use the following request body:

```json showLineNumbers
{
  "message": "my new log message with final status",
  "terminationStatus": "SUCCESS",
  "statusLabel": "Completed successfully!"
}
```

A log message with the `terminationStatus` key can only be sent once for an action run. After it is sent, the run status is marked accordingly and the run can no longer be modified.

## Tying Entities to an action run

You can also add additional context and metadata to an action run by attaching a `run_id` query parameter to every API route that creates or changes an Entity (i.e. `POST`, `PUT`, `PATCH` and `DELETE` requests to the `https://api.getport.io/v1/blueprints/{blueprint_id}/entities/{entity_id}` route). By adding the `run_id` parameter, you reflect the change made to the Entity as part of the set of steps the action run performed during its runtime.

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

def add_action_run_log_entry(access_token, run_id, message):
    headers = {
        'Authorization': f'Bearer {access_token}'
    }

    body = {
        "message": message
    }

    action_update_resp = requests.post(f'{API_URL}/actions/runs/{run_id}/logs', headers=headers, json=body)


def mark_action_run_as_successful(access_token, run_id):
    headers = {
        'Authorization': f'Bearer {access_token}'
    }

    body = {
        "status": "SUCCESS",
        "link": ["https://github.com/actions/toolkit/actions/runs/3617893813"]
    }

    action_update_resp = requests.patch(f'{API_URL}/actions/runs/{run_id}', headers=headers, json=body)
    pprint(action_update_resp.json()['run'])


def main():
    access_token = get_auth_token()

    run = get_run_id(access_token, RUN_ID)
    props = run['properties']
    entity_id = create_entity(access_token, RUN_ID, props)
    add_action_run_log_entry(access_token, RUN_ID, f'new entity: {entity_id}')
    add_action_run_log_entry(access_token, RUN_ID, f'New entity created!')
    mark_action_run_as_successful(access_token, RUN_ID)


if __name__ == '__main__':
    main()

```

</details>

Now when you look at the run log of the action run, you will see the information of the newly created Entity:

![Developer portal action run log](../../../static/img/self-service-actions/action_run_log.png)

:::tip
In the example above we created just one Entity, but it is possible to create, update or delete multiple Entities as part of the steps taken by a single action run, and all of these changes will be reflected in the action run log.
:::
