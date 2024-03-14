# Reflect action progress

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

Once you execute a self-service action, an `actionRun` object will be created in Port.

This page will teach you how to use Port's API to obtain existing action runs and update them with additional metadata and information about the run. You can use this interaction to mark actions as completed or failed, and keep a consistent history of executed actions and their status.

## Where to find your action runs

You can find your existing action runs using one of the following methods:

- Go to the [audit logs](https://app.getport.io/organization/AuditLog) page of your portal, then select the `Runs` tab.  
   This page will display all action runs that have been executed in your organization.

- Go the [entity page](/customize-pages-dashboards-and-plugins/page/entity-page.md) of your desired Entity, then select the `Runs` tab.  
   This page will display all action runs that have been executed for the selected Entity.

- After executing an action [from the UI](https://app.getport.io/self-serve), a toast will appear in the top of the page, with a link to the newly created action run.

## Interacting with action runs

Once an `actionRun` is created, it will have a unique `runId`. Using this id, you can interact with the action run using Port's API.

### Obtain a run's id

How to obtain the `runId` of an action by method:

<Tabs groupId="execution-method" defaultValue="ui" values={[
{label: "UI", value: "ui"},
{label: "API", value: "api"}
]}>

<TabItem value="ui">

The `runId` will be shown in top-left corner of the action run page:

<img src='/img/self-service-actions/reflect-action-progress/runIdUi.png' width='40%' border='1px' />

</TabItem>

<TabItem value="api">

The `runId` will be returned in the response body of the action run request, under the `context.runId` key:

```json showLineNumbers
{
  ...
  "context": {
    "entity": null,
    "blueprint": "microservice",
    "runId": "r_QOz6WoOB1Q2lmhZZ"
  },
  ...
}
```

</TabItem>

</Tabs>

### Get a run's details

You can obtain the details of an action run by making a `GET` request to the `https://api.getport.io/v1/actions/runs/{run_id}` endpoint, where `{run_id}` is the id of the action run.

You will receive a response that looks like this:

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
    "createdAt": "2023-12-07T12:53:52.916Z",
    "updatedAt": "2023-12-07T12:53:52.916Z",
    "createdBy": "auth0|638879fa62c686d381b36ecb",
    "updatedBy": "auth0|638879fa62c686d381b36ecb"
  }
}
```

:::info Create vs Day-2 actions
An action run of a `day-2` action is very similar to that of a `create` action, with one main difference:  
Since `day-2` actions are always tied to an `entity`, the entity itself is also provided in the action run object, under the `payload.entity` key.
:::

### Update a run

You can use Port's API to update an the following properties of an action run:
- `status` - The status of the action run. Initial value is `IN_PROGRESS`, can be set to `SUCCESS` or `FAILURE`.
- `statusLabel` - A custom message used to add information to the status of the action run.
- `logs` - Log entries that will be displayed in the action run's page in Port.

:::info Github backend
When using a `Github workflow` as the action backend, a `Report workflow status` option will be available and set to `Yes` by default. When using this option, Port will automatically update the status of the action run to `SUCCESS` or `FAILURE` according to the result of the Github workflow, so no manual update is required.
:::

#### Run details

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

#### Run logs

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
