---
title: Ingest Okta data into Port via Airbyte, S3 and Webhook
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import AirbyteS3DestinationSetup from "/docs/generalTemplates/_airbyte_s3_destination_setup.md"
import S3IntegrationDisclaimer from "/docs/generalTemplates/_s3_integrations_disclaimer.md"


# Ingest Okta data into Port via Airbyte, S3 and webhook

This guide will demonstrate how to ingest Okta data into Port using [Airbyte](https://airbyte.com/), [S3](https://aws.amazon.com/s3/) and a [webhook integration](https://docs.port.io/build-your-software-catalog/custom-integration/webhook/).

<S3IntegrationDisclaimer/>


## Prerequisites

- Ensure you have a Port account and have completed the [onboarding process](https://docs.port.io/quickstart).

- This feature is part of Port's limited-access offering. To obtain the required S3 bucket, please contact our team directly via chat, [Slack](https://www.getport.io/community), or [e-mail](mailto:support@getport.io), and we will create and manage the bucket on your behalf.

- Access to an available Airbyte app (can be cloud or self-hosted) - for reference, follow the [quick start guide](https://docs.airbyte.com/using-airbyte/getting-started/oss-quickstart).

- An Okta **Personal API Token** used to retrieve data.


## Data model setup

### Add Blueprints 

Add the `Okta Permission` blueprint:

1. Go to the [Builder page](https://app.getport.io/settings/data-model) of your portal.

2. Click on "+ Blueprint".

3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".

4. Paste the following JSON schema into the editor:

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
      "links": {
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
<br/>

Add the `Okta Role` blueprint in the same way:

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
      "links": {
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
<br/>

Add the `Okta Role Assignment` blueprint in the same way:

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
      "links": {
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
<br/>
Add the `Okta User` blueprint in the same way:

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
      "links": {
        "type": "object",
        "description": "Links related to the user."
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

<br/>

### Create Webhook Integration

Create a webhook integration to ingest the data into Port:

1. Go to the [Data sources page](https://app.getport.io/settings/data-sources) of your portal.

2. Click on "+ Data source".

3. In the top selection bar, click on Webhook, then select `Custom Integration`.

4. Enter a **name** for your Integration (for example: "Okta Integration"), enter a **description** (optional), then click on `Next`.

5. Copy the Webhook URL that was generated and include set up the airbyte connection (see Below).

6. Scroll down to the section titled "Map the data from the external system into Port" and paste the following mapping:

<details>
<summary><b>Okta Webhook Mapping (Click to expand)</b></summary>

```json showLineNumbers
[
  {
    "blueprint": "okta_role",
    "operation": "create",
    "filter": "(.body | has(\"_PORT_SOURCE_OBJECT_KEY\")) and (.body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[2] | IN(\"custom_roles\"))",
    "entity": {
      "identifier": ".body.id",
      "title": ".body.label",
      "properties": {
        "description": ".body.description",
        "created": ".body.created",
        "links": ".body._links"
      }
    }
  },
  {
    "blueprint": "okta_permission",
    "operation": "create",
    "filter": "(.body | has(\"_PORT_SOURCE_OBJECT_KEY\")) and (.body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[2] | IN(\"permissions\"))",
    "entity": {
      "identifier": ".body._links.self.href",
      "title": ".body.label",
      "properties": {
        "created": ".body.created",
        "conditions": ".body.conditions",
        "links": ".body._links"
      }
    }
  },
  {
    "blueprint": "okta_role_assignment",
    "operation": "create",
    "filter": "(.body | has(\"_PORT_SOURCE_OBJECT_KEY\")) and (.body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[2] | IN(\"user_role_assignments\"))",
    "entity": {
      "identifier": ".body.id",
      "title": ".body.label",
      "properties": {
        "type": ".body.type",
        "status": ".body.status",
        "created": ".body.created",
        "assignmentType": ".body.assignmentType",
        "links": ".body._links",
        "userId": ".body.userId"
      }
    }
  },
  {
    "blueprint": "okta_user",
    "operation": "create",
    "filter": "(.body | has(\"_PORT_SOURCE_OBJECT_KEY\")) and (.body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[2] | IN(\"users\"))",
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
        "links": ".body._links"
      }
    }
  }
]
```

</details>

## Airbyte Setup

### Set up S3 Destination

If you haven't already set up S3 Destination for Port S3, follow these steps:

<AirbyteS3DestinationSetup/>

### Set up Okta Connection

1. Follow Airbyte's guide to set up [Okta connector](https://docs.airbyte.com/integrations/sources/okta).

2. After the Source is set up, proceed to create a "+ New Connection".

3. For **Source**, choose the Okta source you have set up.

4. For **Destination**, choose the S3 Destination you have set up.

5. In the **Select Streams** step, make sure only "custom_roles", "permissions", "user_role_assignments" and "users" are marked for synchronization.

6. In the **Configuration** step, under "Destination Namespace", choose "Custom Format" and **enter the Webhook URL you have copied when setting up the webhook"**, for example: "wSLvwtI1LFwQzXXX".

7. Click on **Finish & Sync** to apply and start the Integration process!

:::tip Important
  If for any reason you have entered different values than the ones specified in this guide,
  inform us so we can assist to ensure the integration will run smoothly.
::: 

### Additional relevant guides
- [Ingest Any data into port](https://docs.port.io/guides/all/ingest-any-data-via-airbyte-s3-and-webhook/)