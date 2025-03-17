---
title: Ingest Slack channels data into Port via Airbyte, S3 and Webhook
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import AirbyteS3DestinationSetup from "/docs/generalTemplates/_airbyte_s3_destination_setup.md"
import S3IntegrationDisclaimer from "/docs/generalTemplates/_s3_integrations_disclaimer.md"


# Ingest Slack channels data into Port via Airbyte, S3 and webhook

This guide will demonstrate how to ingest Slack channels and channel membership data into Port using [Airbyte](https://airbyte.com/), [S3](https://aws.amazon.com/s3/) and a [webhook integration](https://docs.port.io/build-your-software-catalog/custom-integration/webhook/).

<S3IntegrationDisclaimer/>


## Prerequisites

- Ensure you have a Port account and have completed the [onboarding process](https://docs.port.io/quickstart).

- This feature is part of Port's limited-access offering. To obtain the required S3 bucket, please contact our team directly via chat, [Slack](https://www.getport.io/community), or [e-mail](mailto:support@getport.io), and we will create and manage the bucket on your behalf.

- Access to an available Airbyte app (can be cloud or self-hosted) - for reference, follow the [quick start guide](https://docs.airbyte.com/using-airbyte/getting-started/oss-quickstart).

- Setup a Slack Airbyte exporter app - follow [Airbyte's guide for slack connector](https://docs.airbyte.com/integrations/sources/slack).

  :::tip Include email data
  If you wish to include email data, in addition to the permissions listed in the guide above, you will need to include `user.email:read` in the app's permissions.
  :::

  
## Data model setup

### Add Blueprints 

Add the `Slack Channel Membership` blueprint:

1. Go to the [Builder page](https://app.getport.io/settings/data-model) of your portal.

2. Click on "+ Blueprint".

3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".

4. Paste the following JSON schema into the editor:

<details>
<summary><b>Slack Channel Membership (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "slack_channel_membership",
  "description": "Slack Channel Membership",
  "title": "Slack Channel Membership",
  "icon": "Slack",
  "schema": {
    "properties": {
      "member_id": {
        "type": "string",
        "description": "ID of the user who is a member of the channel."
      },
      "channel_id": {
        "type": "string",
        "description": "ID of the channel the user belongs to."
      }
    },
    "required": [
      "member_id",
      "channel_id"
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

Add the `Slack Channel` blueprint in the same way:

<details>
<summary><b>Slack Channel (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "slack_channel",
  "description": "Slack Channel",
  "title": "Slack Channel",
  "icon": "Slack",
  "schema": {
    "properties": {
      "is_private": {
        "type": "boolean",
        "description": "Indicates if the channel is private."
      },
      "context_team_id": {
        "type": "string",
        "description": "ID of the team the channel belongs to."
      },
      "is_channel": {
        "type": "boolean",
        "description": "Indicates if this is a channel (true) or a direct message (false)."
      },
      "is_shared": {
        "type": "boolean",
        "description": "Indicates if the channel is shared across teams."
      },
      "previous_names": {
        "type": "array",
        "description": "List of previous names of the channel."
      },
      "creator": {
        "type": "string",
        "description": "ID of the user who created the channel."
      },
      "createdAt": {
        "type": "number",
        "description": "Timestamp of when the channel was created."
      },
      "is_ext_shared": {
        "type": "boolean",
        "description": "Indicates if the channel is externally shared."
      },
      "is_group": {
        "type": "boolean",
        "description": "Indicates if this is a group DM."
      },
      "is_archived": {
        "type": "boolean",
        "description": "Indicates if the channel is archived."
      },
      "shared_team_ids": {
        "type": "array",
        "description": "List of teams the channel is shared with."
      },
      "is_org_shared": {
        "type": "boolean",
        "description": "Indicates if the channel is shared across the entire organization."
      },
      "num_members": {
        "type": "number",
        "title": "num_members"
      },
      "purpose": {
        "type": "string",
        "description": "Information about the channel's purpose."
      },
      "topic": {
        "type": "string",
        "description": "Information about the channel's topic."
      }
    },
    "required": []
  },
  "mirrorProperties": {
    "member_id": {
      "title": "member_id",
      "path": "users.member_id"
    }
  },
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "users": {
      "title": "Users",
      "target": "slack_channel_membership",
      "required": false,
      "many": true
    }
  }
}
```

</details>
<br/>

Add the `Slack User` blueprint in the same way:

<details>
<summary><b>Slack User (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "slack_user",
  "description": "Slack User",
  "title": "Slack User",
  "icon": "Slack",
  "schema": {
    "properties": {
      "tz": {
        "type": "string",
        "description": "The user's time zone."
      },
      "is_restricted": {
        "type": "boolean",
        "description": "Indicates if the user is restricted."
      },
      "is_primary_owner": {
        "type": "boolean",
        "description": "Indicates if the user is the primary owner."
      },
      "real_name": {
        "type": "string",
        "description": "The user's real name."
      },
      "team_id": {
        "type": "string",
        "description": "The user's team ID."
      },
      "is_admin": {
        "type": "boolean",
        "description": "Indicates if the user is an admin."
      },
      "is_app_user": {
        "type": "boolean",
        "description": "Indicates if the user is an app user."
      },
      "deleted": {
        "type": "boolean",
        "description": "Indicates if the user is deleted."
      },
      "is_bot": {
        "type": "boolean",
        "description": "Indicates if the user is a bot."
      },
      "email": {
        "type": "string",
        "title": "email"
      }
    },
    "required": []
  },
  "mirrorProperties": {
    "channel_id": {
      "title": "channel_id",
      "path": "membership.channel_id"
    }
  },
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "user": {
      "title": "User",
      "target": "_user",
      "required": false,
      "many": false
    },
    "membership": {
      "title": "membership",
      "target": "slack_channel_membership",
      "required": false,
      "many": true
    }
  }
}
```

</details>

### Create Webhook Integration

Create a webhook integration to ingest the data into Port:

1. Go to the [Data sources page](https://app.getport.io/settings/data-sources) of your portal.

2. Click on "+ Data source".

3. In the top selection bar, click on Webhook, then select `Custom Integration`.

4. Enter a **name** for your Integration (for example: "Slack Integration"), enter a **description** (optional), then click on `Next`.

5. Copy the Webhook URL that was generated and include set up the airbyte connection (see Below).

6. Scroll down to the section titled "Map the data from the external system into Port" and paste the following mapping:

<details>
<summary><b>Slack Webhook Mapping (Click to expand)</b></summary>

```json showLineNumbers
[
  {
    "blueprint": "slack_channel",
    "operation": "create",
    "filter": "(.body | has(\"_PORT_SOURCE_OBJECT_KEY\")) and (.body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[2] | IN(\"channels\"))",
    "entity": {
      "identifier": ".body.id | tostring",
      "title": ".body.name_normalized | tostring",
      "properties": {
        "is_private": ".body.is_private",
        "purpose": ".body.purpose.value",
        "context_team_id": ".body.context_team_id",
        "is_shared": ".body.is_shared",
        "previous_names": ".body.previous_names",
        "creator": ".body.creator",
        "createdAt": ".body.created",
        "is_ext_shared": ".body.is_ext_shared",
        "is_group": ".body.is_group",
        "is_archived": ".body.is_archived",
        "num_members": ".body.num_members | tonumber? // .",
        "topic": ".body.topic.value",
        "shared_team_ids": ".body.shared_team_ids",
        "is_org_shared": ".body.is_org_shared"
      },
      "relations": {
        "users": {
          "combinator": "'and'",
          "rules": [
            {
              "property": "'channel_id'",
              "operator": "'='",
              "value": ".body.id | tostring"
            }
          ]
        }
      }
    }
  },
  {
    "blueprint": "slack_user",
    "operation": "create",
    "filter": "(.body | has(\"_PORT_SOURCE_OBJECT_KEY\")) and (.body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[2] | IN(\"users\"))",
    "entity": {
      "identifier": ".body.id | tostring",
      "title": ".body.name | tostring",
      "properties": {
        "tz": ".body.tz",
        "is_restricted": ".body.is_restricted",
        "is_primary_owner": ".body.is_primary_owner",
        "real_name": ".body.real_name",
        "team_id": ".body.team_id",
        "is_admin": ".body.is_admin",
        "is_app_user": ".body.is_app_user",
        "deleted": ".body.deleted",
        "is_bot": ".body.is_bot",
        "email": ".body.profile.email"
      },
      "relations": {
        "user": ".body.profile.email"
      }
    }
  },
  {
    "blueprint": "slack_channel_membership",
    "operation": "create",
    "filter": "(.body | has(\"_PORT_SOURCE_OBJECT_KEY\")) and (.body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[2] | IN(\"channel_members\"))",
    "entity": {
      "identifier": ".body.channel_id + \"_\" + .body.member_id | tostring",
      "title": ".body.channel_id + \"_\" + .body.member_id | tostring",
      "properties": {
        "member_id": ".body.member_id",
        "channel_id": ".body.channel_id"
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


### Set up Slack Connection

1. Follow Airbyte's guide to set up a [Slack connector](https://docs.airbyte.com/integrations/sources/slack).

    :::tip Private Channels
      Airbyte will not read information from private channels by default. 
      If you wish to include private channels: tick the "include private channels" option, 
      and manually add the Slack-export App to your desired private channels.
    ::: 

2. After the Source is set up, proceed to create a "+ New Connection".

3. For **Source**, choose the Slack source you have set up.

4. For **Destination**, choose the S3 Destination you have set up.

5. In the **Select Streams** step, make sure only "channel_members", "channels" and "users" are marked for synchronization.

6. In the **Configuration** step, under "Destination Namespace", choose "Custom Format" and **enter the Webhook URL you have copied when setting up the webhook"**, for example: "wSLvwtI1LFwQzXXX".

7. **Click on Finish & Sync** to apply and start the Integration process!

:::tip Important
  If for any reason you have entered different values than the ones specified in this guide,
  inform us so we can assist to ensure the integration will run smoothly.
::: 

### Additional relevant guides
- [Ingest Any data into port](https://docs.port.io/guides/all/ingest-any-data-via-airbyte-s3-and-webhook/)