---
title: Setup backend
---

import DocCardList from '@theme/DocCardList';
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PayloadAdvancedFunctions from '/docs/actions-and-automations/templates/_payload_advanced_functions.mdx'
import BackendTypesJson from '/docs/actions-and-automations/templates/_backend-types-json.md'
import ExecuteActionLocations from '/docs/actions-and-automations/create-self-service-experiences/templates/_execute_action_locations.mdx'

# Setup backend

<center>

<iframe width="568" height="320" src="https://www.youtube.com/embed/cU7W3xYbsEw" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>

</center>
<br/>

A self-service action's backend is the logic that runs when the action is triggered. The implementation of the backend is done by you, using one of the various backend types that Port supports.

:::tip Identical backends for self-service actions and automations
Port uses the same backend types and configurations for both self-service actions and [automations](/actions-and-automations/define-automations/), so any backend option available for self-service actions can be used in automations as well.
:::

## Define the backend

The action's backend is defined under the `Backend` tab of the action creation form in Port's UI.  
Let's break the definition down to two parts:

### Define your backend's type and metadata

In this section we provide information about the backend logic and its location, so that Port can access and run it.  

Port uses the same backend types for both self-service actions and [automations](/actions-and-automations/define-automations/).  
For more information and examples for the available backend types, check out the [Backend types](/actions-and-automations/setup-backend/) page.

Here is an example of a Github workflow backend configuration:

<img src='/img/self-service-actions/setup-backend/action-form-setup-backend.png' width='55%' border='1px' />
<br/><br/>

Depending on the backend type you choose, you will need to provide different configuration parameters.  

### Define the action's payload

When creating a self-service action or automation, you can construct a JSON payload that will be sent to your backend upon every execution. You can use this to send data about the action that you want your backend to have. 

Still in the `Backend` tab, scroll down to the `Configure the invocation payload` section. This is where we define the action's payload.

The payload is defined using JSON, and accessing your data is done using `jq`, wrapping each expression with `{{ }}`.  

For example, say we have an action with one user input that is the user's name. The following payload definition will send the name provided by the executor to the backend upon every execution:

```json showLineNumbers
{
  "user_name": "{{ .inputs.user_name }}",
  "port_context": {
    "run_id": "{{ .run.id }}"
  }
}
```

You may have noticed that the example above also sends `{{ .run.id }}`. This is a unique identifier for each execution of the action, and can be used to interact with the action run in Port from your backend.  

Now you might be thinking - *how do I know what data is available to me when constructing the payload?*  
Enter `trigger data`.

#### Trigger data

When a self-service action or automation is executed, Port creates an object that contains data about the execution.  

This entire object is accessible to you when constructing the payload.  
Here is an example of what trigger data could look like for a self-service action that scaffolds a new microservice:

```json showLineNumbers
{
  // The action's user inputs
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

Use the `Test JQ` button in the bottom-left corner to test your expressions against your action and ensure you are sending the correct data.

:::tip Pro tip
You can use the `jq` expression `{{ . }}` when testing to see the entire available object, and then drill down to the specific data you need.
:::

<PayloadAdvancedFunctions />

## JSON structure

In some cases, you may prefer to define the backend configuration using a JSON object.  
The backend is defined under the `invocationMethod` object in the action's JSON structure.

<BackendTypesJson />

___

## Next step

Once the backend is set up, the action is ready to be used.  
Optionally, you can [configure permissions and/or manual approval](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/) for your actions to control who is allowed to execute them.

### Execute the action

<ExecuteActionLocations />