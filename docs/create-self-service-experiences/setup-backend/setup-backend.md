---
title: Setup backend
---

import DocCardList from '@theme/DocCardList';
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Setup backend

<center>

<iframe width="60%" height="400" src="https://www.youtube.com/embed/cU7W3xYbsEw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>

</center>
<br/>

Port's self-service actions support a variety of backends that can be triggered when a user invokes an action.

Here is the basic backend model:

<img src='/img/self-service-actions/setup-backend/backend-flow-diagram.png' width='90%' border='1px' />
<br/><br/>

When creating an action, you can define the payload that will be sent every time it is executed. The payload can include any data about the action that you want your backend to have access to.

Executing a self-service action involves the following steps:

1. **The action is triggered in Port** - the trigger can either be a user executing an action via the UI, or an automation triggering an action via Port's API.
2. **The payload is sent to your backend** - the payload, as defined by the action's creator, is sent to your backend. The backend can be a URL, a dedicated Kafka topic or one of your CI/CD workflows/pipelines.
3. **Your backend receives the payload and handles the request** - depending on the action, your backend might open a PR, create a cloud resource, provision a new environment, or perform any other logic you would like.
4. **Your backend updates Port on the status of the execution** - You can [enrich the action run object](/create-self-service-experiences/reflect-action-progress/) in Port by adding logs, attaching links to other workflows or pipelines that help fullfil the request and add a final success/fail status once the action is complete.


## Define the backend

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

In this section, you can construct a JSON payload that will be sent to your backend upon every execution of the action. You can use this to send the action's user inputs and/or any data you want your backend to have. 

Accessing your data is done using `jq`, wrapping each expression with `{{ }}`.  
For example, this payload contains a user input, and the action's run id (unique to each execution of the action):
<img src='/img/self-service-actions/setup-backend/action-form-backend-payload.png' width='85%' border='1px' />
<br/><br/>

You can access any key in your action's JSON structure and add it to the payload. Use the `Test JQ` button to test your expressions against your action and ensure you are sending the correct data.

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

The **`type`** field defines the action's backend type, and can have one of the following values: `WEBHOOK`, `GITHUB`, `GITLAB`, `KAFKA`.

Depending on the backend type you choose, the available fields will be different:

<Tabs groupId="backendType" queryString defaultValue="webhook">

<TabItem value="webhook" label="Webhook">

| Field     | Type      | Description                                                                                                                                                    | Example values      |
| --------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `agent`   | `boolean` | Defines whether to use [Port Agent](/create-self-service-experiences/setup-backend/webhook/port-execution-agent/port-execution-agent.md) for execution or not. | `true` or `false`   |
| `url`     | `string`  | Defines the webhook URL to which Port will send the action via an HTTP POST request.                                                                           | https://example.com |
| `headers` | `string`  | An object containing the payload headers to be sent to the webhook in each execution, in `"key":"value"` pairs.                                        |
| `body`    | `string`  | Defines the **payload** that will be sent to the backend upon execution of the action.                                                  |

</TabItem>

<TabItem value="github" label="Github">

| Field                  | Type      | Description                                                                                                                                                                                                              | Example values                           |
| ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| `org`                  | `string`  | The GitHub *organization* name.                                                                                                                                | `port-labs`                              |
| `repo`                 | `string`  | The GitHub *repository* name.                                                                                                                                  | `port-docs`                              |
| `workflow`             | `string`  | Defines the GitHub *workflow ID* to run (You can also pass the workflow file name as a string).                                                                | `workflow.yml`                           |  |
| `reportWorkflowStatus` | `boolean` | A flag to control whether to automatically update the Port `run` object status (SUCCESS/FAILURE) at the end of the workflow (default: `true`).                | `true` or `false` |
| `workflowInputs` | `object` | Defines the **payload** that will be sent to the backend upon execution of the action. |  |

</TabItem>

<TabItem value="gitlab" label="Gitlab">

| Field                  | Type      | Description                                                                                                                                                                                                              | Example values                           |
| ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| `defaultRef`           | `string`  | The default ref (branch/tag name) we want the action to use. <br></br> `defaultRef` can be overriden dynamically, by adding `ref` as user input. <br></br> Can only be used if `type` is set to `GITLAB`.                |
| `projectName`          | `string`  | The GitLab *project* name.<br></br>Can only be used if `type` is set to `GITLAB`.                                                                                                                                        | `port`                                   |
| `groupName`            | `string`  | The GitLab *group* name.<br></br>Can only be used if `type` is set to `GITLAB`.                                                                                                                                          | `port-labs`                              |
| `pipelineVariables` | `object` | Defines the **payload** that will be sent to the backend upon execution of the action. |  |


</TabItem>

<TabItem value="kafka" label="Kafka">

| Field                  | Type      | Description                                                                                                                                                                                                              | Example values                           |
| ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| `payload`              | `object`  | Defines the **payload** that will be sent to the backend upon execution of the action.                                                              |

</TabItem>

</Tabs>

___

## Next step

Once the backend is set up, the action is ready to be used.  
Optionally, you can [configure permissions and/or manual approval](/create-self-service-experiences/set-self-service-actions-rbac/) for your actions to control who is allowed to execute them.