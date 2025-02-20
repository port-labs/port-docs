---
title: Ingest Okta data into Port via Airbyte, S3 and Webhook
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import AirbyteS3DestinationSetup from "/docs/generalTemplates/_airbyte_s3_destination_setup.md"


# Ingest Okta data into Port via Airbyte, S3 and Webhook

This guide will demonstrate how to ingest Okta data into Port using Airbyte, S3 and Webhook integration.

## Prerequisites

- Ensure you have a Port account and have completed the [onboarding process](https://docs.port.io/quickstart).
- Contact us using Intercom/Slack/mail to [support@getport.io](mailto:support@getport.io) to set up the integration and get Access keys and S3 Bucket name.
- Access to available Airbyte app (can be cloud or self-hosted) - for reference, follow the [quick start guide](https://docs.airbyte.com/using-airbyte/getting-started/oss-quickstart)
- You have generated Okta Personal API Token to retrieve data


## Data model setup


### Add Blueprints 

Add the `Okta Permission` blueprint:

1. **Go to the [Builder](https://app.getport.io/settings/data-model)** in your Port portal.
2. **Click on "+ Blueprint"**.
3. **Click on the `{...}` button** in the top right corner, and choose "Edit JSON".
4. **Add this JSON schema**:

<details>
<summary><b>Okta Permission (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "okta_permission",
  "description": "Represents an Okta permission.",
  "title": "Okta Permission",
  "icon": "Okta",
  "schema": {
    "properties": {
      "created": {
        "type": "string",
        "format": "date-time",
        "description": "Creation timestamp of the permission."
      },
      "conditions": {
        "type": "object",
        "description": "Conditions associated with the permission (can be null)."
      },
      "_links": {
        "type": "object",
        "description": "Links related to the permission."
      }
    },
    "required": [
      "created"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```

</details>


Add the `Okta Role` blueprint:

1. **Go to the [Builder](https://app.getport.io/settings/data-model)** in your Port portal.
2. **Click on "+ Blueprint"**.
3. **Click on the `{...}` button** in the top right corner, and choose "Edit JSON".
4. **Add this JSON schema**:

<details>
<summary><b>Okta Role (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "okta_role",
  "description": "Represents an Okta role.",
  "title": "Okta Role",
  "icon": "Okta",
  "schema": {
    "properties": {
      "description": {
        "type": "string",
        "description": "Description of the role."
      },
      "created": {
        "type": "string",
        "format": "date-time",
        "description": "Creation timestamp of the role."
      },
      "_links": {
        "type": "object",
        "description": "Links related to the role."
      }
    },
    "required": [
      "created"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "permissions": {
      "title": "Permissions",
      "target": "okta_permission",
      "required": false,
      "many": true
    }
  }
}
```

</details>


Add the `Okta Role Assignment` blueprint:

1. **Go to the [Builder](https://app.getport.io/settings/data-model)** in your Port portal.
2. **Click on "+ Blueprint"**.
3. **Click on the `{...}` button** in the top right corner, and choose "Edit JSON".
4. **Add this JSON schema**:

<details>
<summary><b>Okta Role Assignment (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "okta_role_assignment",
  "description": "Represents an assignment of a role to a user in Okta.",
  "title": "Okta Role Assignment",
  "icon": "Okta",
  "schema": {
    "properties": {
      "type": {
        "type": "string",
        "description": "Type of role (e.g., SUPER_ADMIN)."
      },
      "status": {
        "type": "string",
        "description": "Status of the role assignment (e.g., ACTIVE)."
      },
      "created": {
        "type": "string",
        "format": "date-time",
        "description": "Creation timestamp of the role assignment."
      },
      "assignmentType": {
        "type": "string",
        "description": "Type of assignment (e.g., USER)."
      },
      "_links": {
        "type": "object",
        "description": "Links related to the role assignment."
      },
      "userId": {
        "type": "string",
        "description": "ID of the assigned user."
      }
    },
    "required": [
      "type",
      "status",
      "created",
      "assignmentType",
      "userId"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```

</details>

Add the `Okta User` blueprint:

1. **Go to the [Builder](https://app.getport.io/settings/data-model)** in your Port portal.
2. **Click on "+ Blueprint"**.
3. **Click on the `{...}` button** in the top right corner, and choose "Edit JSON".
4. **Add this JSON schema**:

<details>
<summary><b>Okta User (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "okta_user",
  "description": "Represents an Okta user.",
  "title": "Okta User",
  "icon": "Okta",
  "schema": {
    "properties": {
      "status": {
        "type": "string",
        "description": "Status of the user (e.g., ACTIVE)."
      },
      "created": {
        "type": "string",
        "format": "date-time",
        "description": "Creation timestamp of the user."
      },
      "activated": {
        "type": "string",
        "format": "date-time",
        "description": "Activation timestamp of the user."
      },
      "statusChanged": {
        "type": "string",
        "format": "date-time",
        "description": "Timestamp when the user's status last changed."
      },
      "lastLogin": {
        "type": "string",
        "format": "date-time",
        "description": "Timestamp of the user's last login."
      },
      "passwordChanged": {
        "type": "string",
        "format": "date-time",
        "description": "Timestamp when the user's password was last changed."
      },
      "type": {
        "type": "object",
        "description": "Type information for the user.",
        "properties": {
          "id": {
            "type": "string",
            "description": "ID of the user type."
          }
        }
      },
      "profile": {
        "type": "object",
        "description": "User profile information."
      },
      "_links": {
        "type": "object",
        "description": "Links related to the user.",
        "properties": {
          "self": {
            "type": "object",
            "properties": {
              "href": {
                "type": "string",
                "format": "url",
                "description": "Link to the user itself."
              }
            }
          }
        }
      }
    },
    "required": [
      "status",
      "created",
      "activated",
      "statusChanged",
      "type",
      "profile"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "role_assignments": {
      "title": "Role Assignments",
      "target": "okta_role_assignment",
      "required": false,
      "many": true
    }
  }
}
```

</details>

Add the `Okta Event` blueprint:

1. **Go to the [Builder](https://app.getport.io/settings/data-model)** in your Port portal.
2. **Click on "+ Blueprint"**.
3. **Click on the `{...}` button** in the top right corner, and choose "Edit JSON".
4. **Add this JSON schema**:

<details>
<summary><b>Okta Event (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "okta_event",
  "description": "Represents an Okta event, such as a policy evaluation.",
  "title": "Okta Event",
  "icon": "Okta",
  "schema": {
    "properties": {
      "actor": {
        "type": "object"
      },
      "client": {
        "type": "object"
      },
      "device": {
        "type": "string"
      },
      "authenticationContext": {
        "type": "object"
      },
      "displayMessage": {
        "type": "string"
      },
      "eventType": {
        "type": "string"
      },
      "outcome": {
        "type": "object"
      },
      "published": {
        "type": "string",
        "format": "date-time"
      },
      "securityContext": {
        "type": "object"
      },
      "severity": {
        "type": "string"
      },
      "debugContext": {
        "type": "object"
      },
      "legacyEventType": {
        "type": "string"
      },
      "transaction": {
        "type": "object"
      },
      "uuid": {
        "type": "string"
      },
      "version": {
        "type": "string"
      },
      "request": {
        "type": "object"
      },
      "target": {
        "type": "array",
        "items": {
          "type": "object"
        }
      }
    },
    "required": [
      "actor",
      "client",
      "authenticationContext",
      "eventType",
      "outcome",
      "published",
      "securityContext",
      "severity",
      "debugContext",
      "transaction",
      "uuid",
      "version",
      "request"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "OktaUser": {
      "title": "Actor",
      "target": "okta_user",
      "required": true,
      "many": false
    }
  }
}
```

</details>


<br/>

### Create Webhook Integration

Create Webhook integration to ingest the data into Port:

1. **Go to the [Data-Sources](https://app.getport.io/settings/data-sources)** page in your Port portal.
2. **Click on "+ Data source"**.
3. In the top selection bar, **click on Webhook** and then **Custom Integration**.
4. Enter a **name for your Integration** (for example: "Okta Integration"), a description (optional), and **Click on Next**
5. **Copy the Webhook URL** that was generated and include it when you **contact us** to set up the integration.
6. Scroll down to the **3rd Section - Map the data from the external system into Port** and **Paste** the following mapping:


<details>
<summary><b>Okta Webhook Mapping (Click to expand)</b></summary>

```json showLineNumbers
[
  {
    "blueprint": "okta_role",
    "operation": "create",
    "filter": ".body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[2] | IN(\"custom_roles\")",
    "entity": {
      "identifier": ".body.id",
      "title": ".body.label",
      "properties": {
        "description": ".body.description",
        "created": ".body.created",
        "_links": ".body._links"
      }
    }
  },
  {
    "blueprint": "okta_permission",
    "operation": "create",
    "filter": ".body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[2] | IN(\"permissions\")",
    "entity": {
      "identifier": ".body._links.self.href",
      "title": ".body.label",
      "properties": {
        "created": ".body.created",
        "conditions": ".body.conditions",
        "_links": ".body._links"
      }
    }
  },
  {
    "blueprint": "okta_role_assignment",
    "operation": "create",
    "filter": ".body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[2] | IN(\"user_role_assignments\")",
    "entity": {
      "identifier": ".body.id",
      "title": ".body.label",
      "properties": {
        "type": ".body.type",
        "status": ".body.status",
        "created": ".body.created",
        "assignmentType": ".body.assignmentType",
        "_links": ".body._links",
        "userId": ".body.userId"
      }
    }
  },
  {
    "blueprint": "okta_user",
    "operation": "create",
    "filter": ".body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[2] | IN(\"users\")",
    "entity": {
      "identifier": ".body.id",
      "title": ".body.profile.login",
      "properties": {
        "status": ".body.status",
        "created": ".body.created",
        "activated": ".body.activated",
        "statusChanged": ".body.statusChanged",
        "lastLogin": ".body.lastLogin",
        "passwordChanged": ".body.passwordChanged",
        "type": ".body.type",
        "profile": ".body.profile",
        "_links": ".body._links"
      }
    }
  },
  {
    "blueprint": "okta_event",
    "operation": "create",
    "filter": ".body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[2] | IN(\"logs\")",
    "entity": {
      "identifier": ".body.uuid",
      "title": ".body.eventType",
      "properties": {
        "actor": ".body.actor",
        "client": ".body.client",
        "device": ".body.device",
        "authenticationContext": ".body.authenticationContext",
        "displayMessage": ".body.displayMessage",
        "eventType": ".body.eventType",
        "outcome": ".body.outcome",
        "published": ".body.published",
        "securityContext": ".body.securityContext",
        "severity": ".body.severity",
        "debugContext": ".body.debugContext",
        "legacyEventType": ".body.legacyEventType",
        "transaction": ".body.transaction",
        "uuid": ".body.uuid",
        "version": ".body.version",
        "request": ".body.request",
        "target": ".body.target"
      },
      "relations": {
        "OktaUser": ".body.actor.id"
      }
    }
  }
]
```

</details>

<br/>

## Airbyte Setup

### Set up S3 Destination

If you haven't already set up S3 Destination for Port S3, follow these steps:

<AirbyteS3DestinationSetup/>

### Set up Okta Connection

1. Follow Airbyte's guide to set up [Okta connector](https://docs.airbyte.com/integrations/sources/okta)
2. After the Source is set up, Proceed to Create a "+ New Connection"
3. For Source, choose the Okta source you have set up
4. For Destination, choose the S3 Destination you have set up
5. In the **Select Streams** step, make sure only "channel_members", "channels" and "users" are marked for synchronization
6. In the **Configuration** step, under "Destination Namespace", choose "Custom Format" and enter the value "okta"
7. **Click on Finish & Sync** to apply and start the Integration process!

:::tip Important
  If for any reason you have entered different values than the ones specific listed in this guide,
  inform us of these changes using Intercom/Slack/mail to [support@getport.io](mailto:support@getport.io)
  to ensure the integration will run smoothly.
::: 

By following these steps, you have effectively created and executed a continuous integration of Okta data into Port 🎉.


