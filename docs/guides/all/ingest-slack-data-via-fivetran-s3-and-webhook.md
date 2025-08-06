---
title: Ingest Slack channels data into Port via Fivetran, S3 and Webhook
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import S3IntegrationDisclaimer from "/docs/generalTemplates/_s3_integrations_disclaimer.md"
import S3IntegrationMappingSetup from "/docs/generalTemplates/_s3_integrations_mapping_setup.md"


# Ingest Slack channels data into Port via Fivetran, S3 and webhook

This guide will demonstrate how to ingest Slack channels and channel membership data into Port using [Fivetran](https://Fivetran.com/), [S3](https://aws.amazon.com/s3/) and a [webhook integration](https://docs.port.io/build-your-software-catalog/custom-integration/webhook/).

<S3IntegrationDisclaimer/>

## Prerequisites

- Ensure you have a Port account and have completed the [onboarding process](https://docs.port.io/quickstart).

- This feature is part of Port's limited-access offering. To obtain the required S3 bucket, please contact our team directly via chat, [Slack](https://www.getport.io/community), or the [support site](http://support.port.io/), and we will create and manage the bucket on your behalf.

:::tip Important

  1. In order to configure your Fivetran ARN Role, you will need to provide us the "External ID" that Fivetran will produce
     in the UI when configuring the S3 destinstaion. For that purpose, you can start creating the Destination, copy the External ID value, and Click on "Save for later". You can resume the Destination setup once the rest of the details will
     be provided by Port.

  2. To set up multiple Destinsations with different S3 Prefix Path's for each data source (Fivetran does not allow
     multiple more than one prefix for the same Destination) - you will need to provide the each External ID to Port's
     representative to add it to the IAM Role.
:::

- Access to an available Fivetran Account (for the purpose of this guide, it could be completed within the free trial period)

- Access to Slack account with privileges to approve Fivetran Slack app installation

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
        "type": "string",
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

<S3IntegrationMappingSetup/>

<details>
<summary><b>Slack Webhook Mapping (Click to expand)</b></summary>

```json showLineNumbers
[
  {
    "blueprint": "slack_channel",
    "operation": "create",
    "filter": "(.body | has(\"_PORT_SOURCE_OBJECT_KEY\")) and ( .body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[3] | IN(\"channel\") )",
    "entity": {
      "identifier": ".body.id | tostring",
      "title": ".body.name_normalized | tostring",
      "properties": {
        "purpose": ".body.purpose_value",
        "is_private": ".body.is_private",
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
    "filter": "(.body | has(\"_PORT_SOURCE_OBJECT_KEY\")) and ( .body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[3] | IN(\"users\") )",
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
    "filter": "(.body | has(\"_PORT_SOURCE_OBJECT_KEY\")) and ( .body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[3] | IN(\"channel_member\")  )",
    "entity": {
      "identifier": ".body.channel_id + \"_\" + .body.user_id | tostring",
      "title": ".body.channel_id + \"_\" + .body.user_id | tostring",
      "properties": {
        "member_id": ".body.user_id",
        "channel_id": ".body.channel_id"
      }
    }
  }
]
```

</details>

## Fivetran Setup

### Set up S3 Destination

When using Fivetran with Port's S3-integration, you will have to set up S3 Data Lake Destination for each data source you woul like to integrate:

1. Login to your Fivetran account, and navigate to [Destinations](https://fivetran.com/dashboard/destinations).

2. Click on `Add Destination`.

3. Locate the `S3 Data Lake` option under Fivetran Managed Data Lake Service, and click `set up`.

4. Give the destination a name, and Click `Add`.

5. Input the S3 Credentials provided to you by Port:
   - Under **Storage Provider** select `AWS`.
   - Under **Bucket** enter the bucket name (example: "org-xxx").
   - Under **Fivetran Role ARN** enter your IAM Role ARN.
   - Under **S3 Bucket Path** enter `data/<Webhook URL>` of the Webhook you have copied when setting up the webhook, for example: `data/wSLvwtI1LFwQzXXX`
   - Under **S3 Bucket Region** enter the appropriate region.
   - Keep **Update AWS Glue Catalog** toggled off. Data catalog updates are not supported.
   - Keep **Update Databricks Unity Catalog** toggled off. Data catalog updates are not supported.

5. Click `Save & Test` and wait for Fivetran to confirm the Destination is set up correctly.

<img src="/img/build-your-software-catalog/custom-integration/s3integrations/fivetranDestinationSetupExample.png" width="95%" border="1px" />

### Set up Slack Connection

1. Follow Fivetran's guide to set up a [Slack connector](https://fivetran.com/docs/connectors/applications/slack/setup-guide).

    :::tip Private Channels
      Fivetran will not read information from private channels by default.
      If you wish to include private channels: tick the "include private channels" option,
      and manually add the Slack-export App to your desired private channels.
    :::

2. For **Destination**, choose the S3 Destination you have set up in the previous step.

3. In the **Schema** tab, make sure only "channel", "users" are marked for synchronization.

4. Click **Start Initial Sync** to apply and start the Integration process!

<img src="/img/build-your-software-catalog/custom-integration/s3integrations/fivetranConnectionExample.png" width="95%" border="1px" />


:::tip Important
  If for any reason you have entered different values than the ones specified in this guide,
  inform us so we can assist to ensure the integration will run smoothly.
:::

## Additional relevant guides

- [Ingest Any data into port via Airbyte](https://docs.port.io/build-your-software-catalog/custom-integration/S3-integrations)
- [Ingest Slack data into Port via Airbyte](https://docs.port.io/guides/all/ingest-slack-data-via-airbyte-s3-and-webhook)
