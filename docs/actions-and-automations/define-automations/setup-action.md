---
sidebar_position: 2
title: Setup backend
---

import BackendTypesJson from '/docs/actions-and-automations/templates/_backend-types-json.md'
import PayloadAdvancedFunctions from '/docs/actions-and-automations/templates/_payload_advanced_functions.mdx'

# Setup backend

The automation's backend is the logic that you want to execute when a trigger event occurs. It will run on all entities tied to the blueprint specified in the automation's definition, whenever the trigger event occurs.

Port uses the same backend types for automations and for [self-service actions](/actions-and-automations/create-self-service-experiences/).

The backend is defined under the `invocationMethod` key in the automation's JSON structure:

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
      "blueprintIdentifier": "blueprint_id"
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

## Supported backends

<BackendTypesJson />

To read more about each backend type, see the [backend types](/actions-and-automations/setup-backend/) page.

### Define the payload

When creating a self-service action or automation, you can construct a JSON payload that will be sent to your backend upon every execution. You can use this to send data about the automation that you want your backend to have. 

The payload is defined under the `invocationMethod` object in the automation's JSON structure. The key under which the payload is defined depends on the backend you are using (see the table above).

The payload is defined using JSON, and accessing your data is done using `jq`, wrapping each expression with `{{ }}`.  

For example, the following payload definition will send a timestamp of when the execution was triggered:

```json showLineNumbers
{
  "execution_time": "{{ .trigger.at }}",
  "port_context": {
    "run_id": "{{ .run.id }}"
  }
}
```

You may have noticed that the example above also sends `{{ .run.id }}`. This is a unique identifier for each execution of the action, and can be used to [interact with the action run](/actions-and-automations/reflect-action-progress/) in Port from your backend.  

The data that is available to you when constructing the payload is detailed in the `Trigger data` section below.  

#### Trigger data

When a self-service action or automation is executed, Port creates an object that contains data about the execution.  

This entire object is accessible to you when constructing the payload.  
Here is an example of what trigger data could look like for an automation that triggers whenever a `service` entity is **updated**:

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
      "blueprintIdentifier": "service",
      "entityIdentifier": "example-service-identifier",
      "propertyIdentifier": null
    },
    "diff": {
      "before": {
        "identifier": "example-service-identifier",
        "title": "Example service",
        "icon": null,
        "blueprint": "service",
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
        "blueprint": "service",
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

The example above is for an automation that uses the `ENTITY_UPDATED` trigger event. The `event.diff` object contains data from `before` and `after` the update.  

The other trigger events have the same structure, with the following differences:

- `ENTITY_CREATED` - In the `diff` object, `before` will be `null`, and `after` will contain the new entity data.

- `ENTITY_DELETED` - In the `diff` object, `before` will contain the entity data before deletion, and `after` will be `null`.

- `ANY_ENTITY_CHANGE` - The `diff` object will contain `before` and `after` data according to the entity change.

- `TIMER_PROPERTY_EXPIRED` - In the `diff` object, there will be an `after` object containing the entity data.

<PayloadAdvancedFunctions />