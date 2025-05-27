import PortApiRegion from "/docs/generalTemplates/_port_api_available_regions.md"

# Reflect action progress

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

Once a self-service action or automation has been executed, an `actionRun` object will be created in Port.

This page will teach you how to use Port's API to obtain existing action runs and update them with additional metadata and information about the run. You can use this interaction to mark actions as completed or failed, and keep a consistent history of executed actions and their status.

## Where to find your action runs

### Non-admin roles

`Members` and `moderators` can find their existing/finished action runs using one of the following methods:

- The `My latest runs` list - click on the <img src="/img/icons/auditLogButton.svg" style={{"vertical-align": "text-top"}} className="not-zoom" /> button in the top-right corner of the page.  
  
  This will display the latest action runs that have been executed by the logged-in user:  
  <img src='/img/self-service-actions/reflect-action-progress/myLatestRuns.png' width='35%' border='1px' />

  You can also click on the `My run history` button to see a table with all of the user's previous action runs.

- After executing an action from the [self-service page](https://app.getport.io/self-serve), the `My latest runs` list will open automatically, showing the newly created action run.

### Admin role

In addition to the methods mentioned above, `admins` can find action runs using one of the following methods:

- The dedicated `Runs history` table:
  - **Self-service actions** - go to the [self-service page](https://app.getport.io/self-serve) of your portal, then click on the <img src="/img/icons/auditLogButton.svg" style={{"vertical-align": "text-top"}} className="not-zoom" /> button in the top-right corner.
  - **Automations** - go to the [automations page](https://app.getport.io/settings/automations) of your portal, then click on the <img src="/img/icons/auditLogButton.svg" style={{"vertical-align": "text-top"}} className="not-zoom" /> button in the top-right corner.
- Go to the [audit logs](https://app.getport.io/settings/AuditLog) page of your portal, then select the `Runs` tab.  
   This page will display all action runs that have been executed in your organization.

- Go the [entity page](/customize-pages-dashboards-and-plugins/page/entity-page.md) of your desired entity, then select the `Runs` tab.  
   This page will display all action runs that have been executed for the selected Entity.

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

The `runId` will be returned in the response body of the [action run request](/actions-and-automations/reflect-action-progress/#action-run-json-structure), under the `context.runId` key:

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

You can obtain the details of an action run by making a [`GET` request](/api-reference/get-an-action-runs-details) to Port's API with the relevant `{run_id}`.

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

### Update a run

You can use Port's API to update an the following properties of an action run:
- `status` - The status of the action run. Initial value is `IN_PROGRESS`, can be set to `SUCCESS` or `FAILURE`.
- `statusLabel` - A custom message used to add information to the status of the action run.
- `link` - One or more links to external logs/jobs related to the action run.
- `logs` - Log entries that will be displayed in the action run's page in Port.
- `summary` - A summary of the action run, which will be displayed in the run's page in Port.

:::info Auto-update status
When using a `Github workflow` as the action backend, a `Report workflow status` option will be available and set to `Yes` by default. When using this option, Port will automatically update the `status` of the action run to `SUCCESS` or `FAILURE` according to the result of the Github workflow, so no manual update is required.

When using a `Webhook` as the action backend, a [`Request type` option](/actions-and-automations/setup-backend/webhook/#sync-vs-async-execution) will be available. When set to `sync`, Port will automatically update the status of the action run according to the HTTP response code.
:::

#### Run details

By sending a [`PATCH` request](/api-reference/patch-an-action-run) to Port's API, you can do the following:

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

By sending a [`POST` request](/api-reference/add-a-log-to-an-action-run) to Port's API, you can do the following:

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

You can also add additional context and metadata to an action run by attaching a `run_id` query parameter to every API route that creates or changes an entity (i.e. [`POST`](/api-reference/create-an-entity), [`PUT`](/api-reference/change-an-entity), [`PATCH`](/api-reference/patch-an-entity) and [`DELETE`](/api-reference/delete-an-entity) entity requests).  

By adding the `run_id` parameter, you reflect the change made to the Entity as part of the set of steps the action run performed during its runtime.

:::tip
Tying Entities to an action run is only possible when an action run is in the `IN_PROGRESS` status.
:::

For example, say you send a `POST` request to create a new entity, and add your `run_id` as a query parameter. An example python function that achieves this may look like this:

<details>
<summary><b>Python create entity example (click to expand)</b></summary>

```python showLineNumbers
def create_entity():
    headers = {
        'Authorization': 'Bearer [YOUR_ACCESS_TOKEN]'
    }

    query = {
        "run_id": "[RUN_ID]",
        "upsert": "true"
    }

    body = {
        "identifier": "[ENTITY_IDENTIFIER]",
        "title": "[ENTITY_TITLE]",
    }

    entity_resp = requests.post("https://api.getport.io/v1/blueprints/[TARGET_BLUEPRINT_ID]/entities", headers=headers, params=query, json=body)
    pprint(entity_resp.json()['entity'])
    return entity_resp.json()['entity']['identifier']
```

<PortApiRegion />

</details>

Now when you look at the action run page in Port, you will see the new Entity listed under the `Affected Entities` tab:

<img src='/img/self-service-actions/reflect-action-progress/affectedEntitiesExample.png' width='100%' border='1px' />

:::tip Multiple entities
It is possible to create, update or delete multiple entities as part of the steps taken by a single action run, and all of these changes will be reflected in the action run page.
:::
