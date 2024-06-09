---
sidebar_position: 2
title: Setup action
---

# Setup action

An ations is the logic that you want to execute when a trigger event occurs. Actions will run on all entities tied to the blueprint specified in the automation's definition, whenever the trigger event occurs.

Port uses the same actions for automations and for [self-service actions](/actions-and-automations/create-self-service-experiences/).

## Available actions

Any backend option available for self-service actions can be used in automations as well. The available backends can be found [here](/actions-and-automations/setup-backend/#supported-backends).

## JSON structure

The action is defined under the `invocationMethod` key in the automation's JSON structure. The available invocation methods and their JSON structures can be found [here](/actions-and-automations/setup-backend/?backendType=webhook#json-structure).


```json showLineNumbers
{
  "identifier": "unique_id",
  "title": "Title",
  "icon": "icon_identifier",
  "description": "automation description",
  "trigger": {
    "type": "automation",
    "event": {
      "type": "event_type",
      "blueprintIdentifier": "blueprint_id",
    },
    "condition": {
      "type": "JQ",
      "expressions": ["expression1", "expression2"],
      "combinator": "and"
    }
  },
  # highlight-start
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://example.com",
    "headers": {
      "RUN_ID": "{{ .run.id }}"
    },
    "body": {
      "payload_key": "{{ some-jq-value }}"
    }
  },
  # highlight-end
  "publish": false
}
```

### Payload

Similar to self-service actions, you need to define the [payload](/actions-and-automations/setup-backend/#define-the-actions-payload) that will be sent to the backend when an action is triggered.  

The payload is an object that can contain any number of key-value pairs, where the key is the name of the payload field and the value is a `jq` expression used to access data from the action JSON structure.

The payload is defined under the `invocationMethod` key in the action's JSON structure, and its structure depends on the [backend](/actions-and-automations/setup-backend/#json-structure) you are using. 
