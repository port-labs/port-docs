---
sidebar_position: 2
title: Set up backend
---

import BackendTypesJson from '/docs/actions-and-automations/templates/_backend-types-json.md'
import PayloadAdvancedFunctions from '/docs/actions-and-automations/templates/_payload_advanced_functions.mdx'
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Set up backend

The automation's backend is the logic that you want to execute when a trigger event occurs. It will run on all entities tied to the blueprint specified in the automation's definition, whenever the trigger event occurs.

Port uses the same backend types for automations and for [self-service actions](/actions-and-automations/create-self-service-experiences/).

## Define the backend

The automation's backend is defined under the `Backend` tab of the automation creation form in Port's UI.  
Let's break the definition down to two parts:

### Define your backend's type and metadata

In this section we provide information about the backend logic and its location, so that Port can access and run it.  

Port uses the same backend types for both automations and [self-service actions](https://docs.port.io/actions-and-automations/create-self-service-experiences/).  
For more information and examples for the available backend types, check out the [backend types](/actions-and-automations/setup-backend/) page.

Depending on the backend type you choose, you will need to provide different configuration parameters.  

### Define the payload

When creating an automation, you can construct a JSON payload that will be sent to your backend upon every execution. You can use this to send data about the automation that you want your backend to have. 

Still in the `Backend` tab, scroll down to the `Configure the invocation payload` section. This is where we define the automation's payload.

The payload is defined using JSON, and accessing your data is done using `jq`, wrapping each expression with `{{ }}`.  

Here is an example for an automation payload:

```json showLineNumbers
{
  "port_context": {
    "runId": "{{ .run.id }}"
  }
}
```

You may have noticed that the example above also sends `{{ .run.id }}`. This is a unique identifier for each execution of the automation, and can be used to interact with the autmation run in Port from your backend.  

Now you might be thinking - *how do I know what data is available to me when constructing the payload?*  
Enter `trigger data`.

#### Trigger data

When a self-service action or automation is executed, Port creates an object that contains data about the execution.  

This entire object is accessible to you when constructing the payload.  
Depending on the [trigger type](/actions-and-automations/define-automations/setup-trigger), the object's structure will differ:  

<Tabs queryString="type">
<TabItem value="entity" label="Entity trigger">

Below is an example of trigger data for an automation that triggers whenever a `service` entity is **updated**:

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

- `ANY_ENTITY_CHANGE` - The `diff` object will contain `before` and/or `after` data according to the entity change.

- `TIMER_PROPERTY_EXPIRED` - In the `diff` object, there will be an `after` object containing the entity data.

</TabItem>

<TabItem value="action-run" label="Action run trigger">

Below is an example of trigger data for an automation that triggers whenever an action run is **updated**:

```json showLineNumbers
{
  "inputs": null,
  "trigger": {
    "by": {
      "orgId": "org_BneDtWovPqXaA2VZ",
      "userId": "auth0|62ceaaa497ea00f09d7c4f41",
      "user": {
        "email": "test-admin-user@test.com",
        "firstName": "James",
        "lastName": "Hetfield",
        "status": "ACTIVE",
        "id": "auth0|82zea497e300f09d7c1f41",
        "createdAt": "2024-08-15T11:17:02.699Z",
        "updatedAt": "2024-08-15T11:17:02.699Z"
      }
    },
    "origin": "AUTOMATION",
    "at": "2024-08-15T12:30:05.569Z"
  },
  "event": {
    "id": "event_GH2680QIOEzwwNZB",
    "resourceType": "run",
    "action": "UPDATE",
    "trigger": {
      "by": {
        "orgId": "org_BneVtWovPbXaA6V6Z",
        "userId": "auth0|82zea497e300f09d7c1f41"
      },
      "origin": "UI",
      "at": "2024-08-15T12:30:05.505Z"
    },
    "context": {
      "action": {
        "identifier": "myActionId",
        "title": "Some action title",
        "trigger": {
          "type": "self-service",
          "operation": "CREATE",
          "userInputs": {
            "properties": {},
            "required": [],
            "order": []
          }
        },
        "invocationMethod": {
          "type": "WEBHOOK",
          "url": "https://example.com",
          "agent": false,
          "synchronized": false,
          "method": "POST",
          "headers": {
            "RUN_ID": "{{ .run.id }}"
          },
          "body": {
            "{{ spreadValue() }}": "{{ .inputs }}",
            "port_context": {
              "runId": "{{ .run.id }}"
            }
          }
        },
        "requiredApproval": false,
        "createdBy": "auth0|82zea497e300f09d7c1f41",
        "updatedBy": "auth0|82zea497e300f09d7c1f41",
        "createdAt": "2024-08-15T12:29:45.817Z",
        "updatedAt": "2024-08-15T12:29:45.817Z"
      }
    },
    "diff": {
      "before": {
        "id": "r_Q0YotCZMKxDLdlaU",
        "status": "IN_PROGRESS",
        // "blueprint" and "entity" will be available if the action is tied to a blueprint
        // (meaning that the action run is tied to an entity)
        "blueprint": {
          "identifier": "blueprintIdentifier",
          "title": "blueprintTitle",
          "icon": "blueprintIcon"
        },
        "entity": {
          "identifier": "entityIdentifier",
          "title": "entityTitle",
          "icon": "entityIcon",
        },
        "action": {
          "identifier": "myActionId",
          "title": null,
          "icon": null,
          "deleted": true
        },
        "source": "UI",
        "link": [],
        "requiredApproval": false,
        "properties": {},
        "createdAt": "2024-08-15T12:29:57.379Z",
        "updatedAt": "2024-08-15T12:29:57.379Z",
        "createdBy": "auth0|82zea497e300f09d7c1f41",
        "updatedBy": "auth0|82zea497e300f09d7c1f41",
        "payload": {
          "type": "WEBHOOK",
          "url": "https://example.com",
          "agent": false,
          "synchronized": false,
          "method": "POST",
          "headers": {
            "RUN_ID": "r_Q0YotCZMKxDLdlaU"
          },
          "body": {
            "port_context": {
              "runId": "r_Q0YotCZMKxDLdlaU"
            }
          }
        }
      },
      "after": {
        "id": "r_Q0YotCZMKxDLdlaU",
        "status": "IN_PROGRESS",
        // "blueprint" and "entity" will be available if the action is tied to a blueprint
        // (meaning that the action run is tied to an entity)
        "blueprint": {
          "identifier": "blueprintIdentifier",
          "title": "blueprintTitle",
          "icon": "blueprintIcon"
        },
        "entity": {
          "identifier": "entityIdentifier",
          "title": "entityTitle",
          "icon": "entityIcon",
        },
        "action": {
          "identifier": "myActionId",
          "title": null,
          "icon": null,
          "deleted": true
        },
        "source": "UI",
        "link": [],
        "requiredApproval": false,
        "properties": {},
        "createdAt": "2024-08-15T12:29:57.379Z",
        "updatedAt": "2024-08-15T12:30:05.481Z",
        "createdBy": "auth0|82zea497e300f09d7c1f41",
        "updatedBy": "auth0|82zea497e300f09d7c1f41",
        "payload": {
          "type": "WEBHOOK",
          "url": "https://example.com",
          "agent": false,
          "synchronized": false,
          "method": "POST",
          "headers": {
            "RUN_ID": "r_Q0YotCZMKxDLdlaU"
          },
          "body": {
            "port_context": {
              "runId": "r_Q0YotCZMKxDLdlaU"
            }
          }
        }
      }
    }
  },
  "entity": null,
  "action": {
    "identifier": "automation"
  },
  "run": {
    "id": "r_au3aJdlOHUO3d99n"
  }
}
```

The example above is for an automation that uses the `RUN_UPDATED` trigger event. The `event.diff` object contains data from `before` and `after` the update.  

The other trigger events have the same structure, with the following differences:

- `RUN_CREATED` - In the `diff` object, `before` will be `null`, and `after` will contain the new action run data.

- `ANY_RUN_CHANGE` - The `diff` object will contain `before` and/or `after` data according to the entity change.

</TabItem>
</Tabs>

You can access any value in this structure and add it to the payload. For example, to add the executing user's name to the payload, you can use the following expression:

```json
{
  "executing_user_email": "{{.trigger.by.user.email}}"
}
```

Use the `Test JQ` button in the bottom-left corner to test your expressions against your automation and ensure you are sending the correct data.

:::tip Inspect the Full Object in `jq`
You can use the `jq` expression `{{ . }}` when testing to see the entire available object, and then drill down to the specific data you need.
:::

<PayloadAdvancedFunctions />

## Backend JSON structure

In some cases, you may prefer to define the backend configuration using a JSON object.  
The backend is defined under the `invocationMethod` object in the automation's JSON structure.

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



