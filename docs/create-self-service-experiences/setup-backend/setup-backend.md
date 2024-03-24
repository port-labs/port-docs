---
title: Setup backend
---

import DocCardList from '@theme/DocCardList';

# Setup backend

<center>

<iframe width="60%" height="400" src="https://www.youtube.com/embed/cU7W3xYbsEw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>

</center>
<br/>

Port's self-service actions support a variety of backends that can be triggered when a user invokes an action.

Here is the basic backend model:

<img src='/img/self-service-actions/setup-backend/backend-flow-diagram.png' width='100%' border='1px' />
<br/><br/>

Executing a self-service action involves the following steps:

1. **The action is triggered in Port** - the trigger can either be a user executing an action via the UI, or an automation triggering an action via Port's API.
2. **Port generates the event payload** - the payload includes metadata about the invoked action and its inputs.
3. **The payload is sent to your backend** - the backend can be a URL, a dedicated Kafka topic or one of your CI/CD workflows/pipelines.
4. **Your backend receives the payload and handles the request** - depending on the action, your backend might open a PR, create a cloud resource, provision a new environment, or perform any other logic you would like.
5. **Your backend updates Port on the status of the execution** - You can [enrich the action run object](/create-self-service-experiences/reflect-action-progress/) in Port by adding logs, attaching links to other workflows or pipelines that help fullfil the request and add a final success/fail status once the action is complete.


## Define the backend

The action's backend is defined under the `Backend` tab of the action creation form in Port's UI:

<img src='/img/self-service-actions/setup-backend/action-form-setup-backend.png' width='50%' border='1px' />
<br/><br/>

Depending on the backend you choose, you will need to provide different configuration parameters.  
See the list of supported backends below for more information.

## Supported backends

<DocCardList/>

## JSON structure

The action's backend is defined under the `invocationMethod` object:

```json showLineNumbers
{
  "identifier": "unique_id",
  "title": "Title",
  "userInputs": {
    "properties": {
      "property1": {
        "type": "string",
        "title": "Property title",
        "default": "default value"
      }
    }
  },
  # highlight-start
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://example.com"
  },
  # highlight-end
  "trigger": "CREATE",
  "description": "Action description"
}
```

### Invocation method structure fields

| Field                  | Type      | Description                                                                                                                                                                                                                                                                                                     | Example values                                  |
| ---------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `type`                 | `string`  | Defines the backend of the action.                                                                                                                                                                                                                                                                | `WEBHOOK`, `KAFKA`, `GITHUB` or `GITLAB` |
| `agent`                | `boolean` | Defines whether to use [Port Agent](/create-self-service-experiences/setup-backend/webhook/port-execution-agent/port-execution-agent.md) for execution or not. <br></br> Can only be used if `type` is set to `WEBHOOK` or `GITLAB`.                                                                                                                  | `true` or `false`                        |
| `url`                  | `string`  | Defines the webhook URL to which Port will send the action via an HTTP POST request. <br></br> Can only be used if `type` is set to `WEBHOOK`.                                                                                                                                                            | `https://example.com`                           |
| `org`                  | `string`  | The GitHub *organization* name. <br></br> Can only be used if `type` is set to `GITHUB`.                                                                                                                                                                                                                  | `port-labs`                                     |
| `repo`                 | `string`  | The GitHub *repository* name. <br></br> Can only be used if `type` is set to `GITHUB`.                                                                                                                                                                                                                    | `port-docs`                                     |
| `workflow`             | `string`  | Defines the GitHub *workflow ID* to run (You can also pass the workflow file name as a string). <br></br> Can only be used if `type` is set to `GITHUB`.                                                                                                                                                          | `workflow.yml`                                     |
| `omitPayload`          | `boolean` | A flag to control whether to add the [`port_payload`](#action-message-structure) JSON string to the GitHub/GitLab workflow trigger payload (default: `false`). <br></br> Can only be used if `type` is set to `GITHUB` or `GITLAB`.                                                                                   | `false`                                         |
| `omitUserInputs`       | `boolean` | A flag to control whether to send the user inputs of the action as isolated parameters to the GitHub/GitLab workflow (default: `false`). When disabled, you can still get the user inputs from the `port_payload` (unless omitted too). <br></br> Can only be used if `type` is set to `GITHUB` or `GITLAB`. | `false`                                         |
| `reportWorkflowStatus` | `boolean` | A flag to control whether to automatically update the Port `run` object status (SUCCESS/FAILURE) at the end of the workflow (default: `true`). <br></br> Can be added only if `type` is set to `GITHUB`.                                                                                                                             |
| `defaultRef`           | `string`  | The default ref (branch/tag name) we want the action to use. <br></br> `defaultRef` can be overriden dynamically, by adding `ref` as user input. <br></br> Can only be used if `type` is set to `GITLAB`.                                                                                            |
| `projectName`          | `string`  | The GitLab *project* name.<br></br>Can only be used if `type` is set to `GITLAB`.                                                                                                                                                                                                                          | `port`                                          |
| `groupName`            | `string`  | The GitLab *group* name.<br></br>Can only be used if `type` is set to `GITLAB`.                                                                                                                                                                                                                          | `port-labs`                                     |

## Next step

Once the backend is set up, the action is ready to be used.  
Optionally, you can [configure permissions and/or manual approval](/create-self-service-experiences/set-self-service-actions-rbac/) for your actions to control who is allowed to execute them.