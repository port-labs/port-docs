---
title: Setup backend
---

import DocCardList from '@theme/DocCardList';
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Setup backend

Port's self-service actions and automations support a variety of backends that can be used when triggered.

The process contains the following steps:

1. **The action is triggered in Port** - the trigger can either be a user executing a self-service action via the UI, or an automation triggering an action.
2. **The payload is sent to your backend** - the payload, as defined by the action's creator, is sent to your backend. The backend can be a URL, a dedicated Kafka topic or one of your CI/CD workflows/pipelines.
3. **Your backend receives the payload and handles the request** - depending on the action, your backend might open a PR, create a cloud resource, provision a new environment, or perform any other logic you would like.
4. **Your backend updates Port on the status of the execution** - You can [enrich the action run object](/actions-and-automations/reflect-action-progress/) in Port by adding logs, attaching links to other workflows or pipelines that help fullfil the request and add a final success/fail status once the action is complete.


## Define the backend

:::tip UI support
Currently, only self-service actions can be created via a wizard in the UI.  
Automations can be created using a JSON definition, which can be found [here](/actions-and-automations/setup-backend/#json-structure).
:::

The action's backend is defined under the `Backend` tab of the action creation form in Port's UI.  
Let's break the definition down to two parts:

### Define your backend's type and metadata

In this section we provide information about the backend logic and its location, so that Port can access and run it.  

Here is an example of a Github workflow backend configuration:

<img src='/img/self-service-actions/setup-backend/action-form-setup-backend.png' width='55%' border='1px' />
<br/>

Depending on the backend you choose, you will need to provide different configuration parameters.  
See the list of supported backends below for more information.

### Define the action's payload

When creating a self-service action or automation, you can construct a JSON payload that will be sent to your backend upon every execution. You can use this to send data about the action that you want your backend to have. 

The payload is defined using JSON, and accessing your data is done using `jq`, wrapping each expression with `{{ }}`.  
For example, this payload contains a timestamp of the execution, and the execution's run id (unique to each execution):

```json
{
  "execution_time": "{{ .trigger.at }}",
  "port_context": {
    "run_id": "{{ .run.id }}"
  }
}
```

#### Trigger data

When a self-service action or automation is executed, Port creates an `actionRun` object that contains data about the execution.  

This entire object is accessible to you when constructing the payload, and due to the difference in triggers, it is structured a bit differently for self-service actions and automations:

<Tabs groupId="triggerData" defaultValue="self-service">
<TabItem value="self-service" label="Self-service actions">

Here is an example of trigger data for a **self-service action**:

```json showLineNumbers
{
  "inputs": {
    "microservice_name": "string",
    "microservice_description": "string",
    "language": "string",
    "version": "string",
    "core": "string",
    "features": "string"
  },
  "trigger": {
    "by": {
      "orgId": "<Your organization's id>",
      "userId": "<Executing user's id>",
      "user": {
        "email": "<Executing user's email>",
        "firstName": "<Executing user's firstName>",
        "lastName": "<Executing user's lastName>",
        "phoneNumber": "<Executing user's phoneNumber>",
        "picture": "",
        "providers": [],
        "status": "ACTIVE",
        "id": "<Executing user's id>",
        "createdAt": "2024-06-06T05:21:00.565Z",
        "updatedAt": "2024-06-06T05:21:00.565Z"
      }
    },
    "origin": "UI",
    "at": "2024-06-06T05:21:00.565Z",
    "operation": "CREATE"
  },
  "event": null,
  "entity": {},
  "action": {
    "identifier": "Microservice_scaffold_a_microservice",
    "blueprint": "Microservice",
    "encryptedProperties": []
  },
  "run": {
    "id": "<The current run's id>"
  }
}
```

You can access any value in this structure and add it to the payload. For example, to add the executing user's name to the payload, you can use the following expression:

```json
{
  "executing_user_email": "{{.trigger.by.user.email}}"
}
```

</TabItem>

<TabItem value="automation" label="Automations">

Here is an example of trigger data for an **automation**:

```json showLineNumbers
{
  "inputs": null,
  "trigger": {
    "by": {
      "orgId": "org_BneDtWovPqXaA2VZ",
      "userId": "auth0|62ceaea697ca00f09d7c4f45",
      "user": {
        "email": "example-user@test.com",
        "firstName": "SomeFirstName",
        "lastName": "SomeLastName",
        "phoneNumber": "",
        "picture": "",
        "providers": [],
        "status": "ACTIVE",
        "id": "auth0|62ceaea697ca00f09d7c4f45",
        "createdAt": "2024-06-09T09:57:50.444Z",
        "updatedAt": "2024-06-09T09:57:50.444Z"
      }
    },
    "origin": "AUTOMATION",
    "at": "2024-06-09T12:28:18.663Z"
  },
  "event": {
    "action": "UPDATE",
    "resourceType": "entity",
    "trigger": {
      "by": {
        "orgId": "org_BneDtWovPqXaA2VZ",
        "userId": "auth0|62ceaea697ca00f09d7c4f45"
      },
      "origin": "UI",
      "at": "2024-06-09T12:28:18.477Z"
    },
    "context": {
      "blueprintIdentifier": "Service",
      "entityIdentifier": "example-service-identifier",
      "propertyIdentifier": null
    },
    "diff": {
      "before": {
        "identifier": "example-service-identifier",
        "title": "Example service",
        "icon": null,
        "blueprint": "Service",
        "team": [
          "Rocket"
        ],
        "properties": {
          "latestVersion": "12.8.2",
          "language": "TypeScript",
          "one_hop_service_language": "Ruby",
          "two_hops_service_language": "Ruby",
          "repo": "https://github.com/some-org/example-service"
        },
        "relations": {
          "using": "rogue-service"
        },
        "createdAt": "2024-06-09T09:57:52.931Z",
        "createdBy": "60EsooJtOqimlekxrNh7nfr2iOgTcyLZ",
        "updatedAt": "2024-06-09T09:57:52.931Z",
        "updatedBy": "60EsooJtOqimlekxrNh7nfr2iOgTcyLZ"
      },
      "after": {
        "identifier": "example-service-identifier",
        "title": "Example service renamed",
        "icon": "Microservice",
        "blueprint": "Service",
        "team": [
          "Rocket"
        ],
        "properties": {
          "latestVersion": "12.8.22",
          "language": "Python",
          "one_hop_service_language": "Ruby",
          "two_hops_service_language": "Ruby",
          "repo": "https://github.com/some-org/example-service"
        },
        "relations": {
          "using": "rogue-service"
        },
        "createdAt": "2024-06-09T09:57:52.931Z",
        "createdBy": "60EsooJtOqimlekxrNh7nfr2iOgTcyLZ",
        "updatedAt": "2024-06-09T12:28:18.628Z",
        "updatedBy": "auth0|62ceaea697ca00f09d7c4f45"
      }
    }
  },
  "entity": null,
  "action": {
    "identifier": "automation"
  },
  "run": {
    "id": "r_k86OUzq80jRlxFV0"
  }
}
```

You can access any value in this structure and add it to the payload. For example, to add the executing user's name to the payload, you can use the following expression:

```json
{
  "executing_user_email": "{{.trigger.by.user.email}}"
}
```
</TabItem>
</Tabs>

Use the `Test JQ` button in the bottom-left corner to test your expressions against your action and ensure you are sending the correct data.

:::tip Pro tip
You can use the `jq` expression `{{ . }}` when testing to see the entire available object, and then drill down to the specific data you need.
:::

#### spreadValue() function

You can use the `spreadValue()` function to add multiple keys to the root of the payload at once. This function will spread all of the keys under a given object.  
A common use case for this function is to add all of the user inputs to the payload:

```json showLineNumbers
{
  "{{ spreadValue() }}": "{{ .inputs }}"
}
```

This will add all of the action's user inputs to the root of the payload, so that they can be accessed directly by your backend.

#### Using `jq` expressions in keys

The keys in the payload can also be `jq` expressions.  
For example, the following expression will add the `ref` key to the payload only if a `ref` input was provided when executing the action:

```json
{
  "{{if (.inputs | has(\"ref\")) then \"ref\" else null end}}": "{{.inputs.ref}}"
}
```
:::warning Using jq in keys
Note that if a **key** in the payload evaluates to `null` for any reason, the entire expression (key + value) will be ommitted from the payload.
:::



## Supported backends

<DocCardList/>

## JSON structure

The action's backend is defined under the `invocationMethod` object:

```json showLineNumbers
{
  "identifier": "unique_id",
  "title": "Title",
  "description": "Action description",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE"
    "userInputs": {
      "properties": {
        "property1": {
          "type": "string",
          "title": "Property title",
          "default": "default value"
        }
      }
    },
  },
  # highlight-start
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://example.com"
  },
  # highlight-end
}
```

### Invocation method structure fields

The **`type`** field defines the action's backend type, and can have one of the following values: `WEBHOOK`, `GITHUB`, `GITLAB`, `KAFKA`, `UPSERT_ENTITY`.

Depending on the backend type you choose, the available fields will be different:

<Tabs groupId="backendType" queryString defaultValue="webhook">

<TabItem value="webhook" label="Webhook">

`invocationMethod.type` should be set to `WEBHOOK`.

| Field     | Type      | Description                                                                                                                                                    | Example values      |
| --------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `agent`   | `boolean` | Defines whether to use [Port Agent](/actions-and-automations/setup-backend/webhook/port-execution-agent/port-execution-agent.md) for execution or not. | `true` or `false`   |
| `url`     | `string`  | Defines the webhook URL to which Port will send the action via an HTTP POST request.                                                                           | https://example.com |
| `headers` | `string`  | An object containing the payload headers to be sent to the webhook in each execution, in `"key":"value"` pairs.                                        |
| `body`    | `string`  | Defines the **payload** that will be sent to the backend upon execution of the action.                                                  |

</TabItem>

<TabItem value="github" label="Github">

`invocationMethod.type` should be set to `GITHUB`.

| Field                  | Type      | Description                                                                                                                                                                                                              | Example values                           |
| ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| `org`                  | `string`  | The GitHub *organization* name.                                                                                                                                | `port-labs`                              |
| `repo`                 | `string`  | The GitHub *repository* name.                                                                                                                                  | `port-docs`                              |
| `workflow`             | `string`  | Defines the GitHub *workflow ID* to run (You can also pass the workflow file name as a string).                                                                | `workflow.yml`                           |  |
| `reportWorkflowStatus` | `boolean` | A flag to control whether to automatically update the Port `run` object status (SUCCESS/FAILURE) at the end of the workflow (default: `true`).                | `true` or `false` |
| `workflowInputs` | `object` | Defines the **payload** that will be sent to the backend upon execution of the action. |  |

</TabItem>

<TabItem value="gitlab" label="Gitlab">

`invocationMethod.type` should be set to `GITLAB`.

| Field                  | Type      | Description                                                                                                                                                                                                              | Example values                           |
| ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| `defaultRef`           | `string`  | The default ref (branch/tag name) we want the action to use. <br></br> `defaultRef` can be overriden dynamically, by adding `ref` as user input. <br></br> Can only be used if `type` is set to `GITLAB`.                |
| `projectName`          | `string`  | The GitLab *project* name.<br></br>Can only be used if `type` is set to `GITLAB`.                                                                                                                                        | `port`                                   |
| `groupName`            | `string`  | The GitLab *group* name.<br></br>Can only be used if `type` is set to `GITLAB`.                                                                                                                                          | `port-labs`                              |
| `pipelineVariables` | `object` | Defines the **payload** that will be sent to the backend upon execution of the action. |  |


</TabItem>

<TabItem value="kafka" label="Kafka">

`invocationMethod.type` should be set to `KAFKA`.

| Field                  | Type      | Description                                                                                                                                                                                                              | Example values                           |
| ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| `payload`              | `object`  | Defines the **payload** that will be sent to the backend upon execution of the action.                                                              |

</TabItem>

<TabItem value="upsertEntity" label="Create/update entity">

`invocationMethod.type` should be set to `UPSERT_ENTITY`.

| Field | Type | Description | Example values |
| --- | --- | --- | --- |
| `blueprintIdentifier` | `string` | The identifier of the blueprint from which the entity will be created/updated. | `service` |
| `mapping` | `object` | Defines the properties of the entity that will be created/updated. | `{"name":"newEntityName"}`


</TabItem>

</Tabs>

