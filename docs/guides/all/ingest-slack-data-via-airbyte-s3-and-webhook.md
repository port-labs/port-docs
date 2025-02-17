---
title: Ingest Slack channels data into Port via Airbyte, S3 and Webhook
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Ingest Slack channels data into Port via Airbyte, S3 and Webhook

This guide will demonstrate how to ingest slack channels and channel membership data into Port using Airbyte, S3 and Webhook integration.

## Prerequisites

- Ensure you have a Port account and have completed the [onboarding process](https://docs.port.io/quickstart).
- Ensure you have access to Port S3 integrations (contact us to gain access), and have S3 Access & Secret Keys, and Bucket name.
- Access to available Airbyte app (can be cloud or self-hosted)
- Setup Slack Airbyte exporter App - follow Airbyte's guide: https://docs.airbyte.com/integrations/sources/slack
::: Tip
If you with to include Email data, in addition to the permissions listed in the guide above, you need to also include user.email:read 
:::


<br/>

## Data model setup


### Add Blueprints 
Add the `Slack Channel` blueprint:

1. **Go to the [Builder](https://app.getport.io/settings/data-model)** in your Port portal.
2. **Click on "+ Blueprint"**.
3. **Click on the `{...}` button** in the top right corner, and choose "Edit JSON".
4. **Add this JSON schema**:

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
      "purpose": {
        "type": "object",
        "description": "Information about the channel's purpose.",
        "properties": {
          "last_set": {
            "type": "integer",
            "description": "Timestamp of the last time the purpose was set."
          },
          "creator": {
            "type": "string",
            "description": "ID of the user who created the channel."
          },
          "value": {
            "type": "string",
            "description": "The purpose of the channel."
          }
        }
      },
      "is_pending_ext_shared": {
        "type": "boolean",
        "description": "Indicates if the channel is pending external sharing."
      },
      "context_team_id": {
        "type": "string",
        "description": "ID of the team the channel belongs to."
      },
      "pending_shared": {
        "type": "array",
        "description": "List of teams pending sharing."
      },
      "is_channel": {
        "type": "boolean",
        "description": "Indicates if this is a channel (true) or a direct message (false)."
      },
      "is_shared": {
        "type": "boolean",
        "description": "Indicates if the channel is shared across teams."
      },
      "id": {
        "type": "string",
        "description": "Unique ID of the channel."
      },
      "previous_names": {
        "type": "array",
        "description": "List of previous names of the channel."
      },
      "pending_connected_team_ids": {
        "type": "array",
        "description": "List of teams pending connection."
      },
      "creator": {
        "type": "string",
        "description": "ID of the user who created the channel."
      },
      "is_im": {
        "type": "boolean",
        "description": "Indicates if this is a direct message (true) or a channel (false)."
      },
      "is_member": {
        "type": "boolean",
        "description": "Indicates if the current user is a member of the channel."
      },
      "is_mpim": {
        "type": "boolean",
        "description": "Indicates if this is a multi-person direct message."
      },
      "created": {
        "type": "number",
        "description": "Timestamp of when the channel was created."
      },
      "name_normalized": {
        "type": "string",
        "description": "Normalized name of the channel."
      },
      "is_ext_shared": {
        "type": "boolean",
        "description": "Indicates if the channel is externally shared."
      },
      "is_group": {
        "type": "boolean",
        "description": "Indicates if this is a group DM."
      },
      "unlinked": {
        "type": "number",
        "description": "Unlinked status of the channel."
      },
      "is_archived": {
        "type": "boolean",
        "description": "Indicates if the channel is archived."
      },
      "is_general": {
        "type": "boolean",
        "description": "Indicates if this is the general channel."
      },
      "name": {
        "type": "string",
        "description": "Name of the channel."
      },
      "topic": {
        "type": "object",
        "description": "Information about the channel's topic.",
        "properties": {
          "last_set": {
            "type": "integer",
            "description": "Timestamp of the last time the topic was set."
          },
          "creator": {
            "type": "string",
            "description": "ID of the user who set the topic."
          },
          "value": {
            "type": "string",
            "description": "The topic of the channel."
          }
        }
      },
      "shared_team_ids": {
        "type": "array",
        "description": "List of teams the channel is shared with."
      },
      "is_org_shared": {
        "type": "boolean",
        "description": "Indicates if the channel is shared across the entire organization."
      },
      "updated": {
        "type": "number",
        "description": "Timestamp of the last time the channel was updated."
      },
      "properties": {
        "type": "object",
        "description": "Custom properties associated with the channel."
      },
      "parent_conversation": {
        "type": "string",
        "description": "ID of the parent conversation (if applicable)."
      },
      "num_members": {
        "type": "number",
        "title": "num_members"
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


Add the `Slack User` blueprint:

1. **Go to the [Builder](https://app.getport.io/settings/data-model)** in your Port portal.
2. **Click on "+ Blueprint"**.
3. **Click on the `{...}` button** in the top right corner, and choose "Edit JSON".
4. **Add this JSON schema**:

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
      "is_ultra_restricted": {
        "type": "boolean",
        "description": "Indicates if the user is ultra restricted."
      },
      "color": {
        "type": "string",
        "description": "The user's color."
      },
      "tz": {
        "type": "string",
        "description": "The user's time zone."
      },
      "is_owner": {
        "type": "boolean",
        "description": "Indicates if the user is the owner."
      },
      "is_restricted": {
        "type": "boolean",
        "description": "Indicates if the user is restricted."
      },
      "tz_label": {
        "type": "string",
        "description": "The user's time zone label."
      },
      "profile": {
        "type": "object",
        "description": "An object containing the user's profile information.",
        "properties": {
          "status_emoji": {
            "type": "string",
            "description": "The user's status emoji."
          },
          "image_32": {
            "type": "string",
            "description": "URL to the user's profile image in size 32x32."
          },
          "image_192": {
            "type": "string",
            "description": "URL to the user's profile image in size 192x192."
          },
          "real_name": {
            "type": "string",
            "description": "The user's real name."
          },
          "api_app_id": {
            "type": "string",
            "description": "The user's API app ID (if applicable)."
          },
          "title": {
            "type": "string",
            "description": "The user's title (if available)."
          },
          "status_text_canonical": {
            "type": "string",
            "description": "The user's status text in canonical format."
          },
          "skype": {
            "type": "string",
            "description": "The user's Skype username (if available)."
          },
          "real_name_normalized": {
            "type": "string",
            "description": "The user's real name in a normalized format."
          },
          "avatar_hash": {
            "type": "string",
            "description": "The hash of the user's avatar image."
          },
          "first_name": {
            "type": "string",
            "description": "The user's first name."
          },
          "bot_id": {
            "type": "string",
            "description": "The user's bot ID (if applicable)."
          },
          "image_512": {
            "type": "string",
            "description": "URL to the user's profile image in size 512x512."
          },
          "status_emoji_display_info": {
            "type": "array",
            "description": "List containing information about the user's status emoji (if available).",
            "items": {
              "type": "object"
            }
          },
          "image_24": {
            "type": "string",
            "description": "URL to the user's profile image in size 24x24."
          },
          "last_name": {
            "type": "string",
            "description": "The user's last name (if available)."
          },
          "image_48": {
            "type": "string",
            "description": "URL to the user's profile image in size 48x48."
          },
          "team": {
            "type": "string",
            "description": "The user's team ID."
          },
          "display_name": {
            "type": "string",
            "description": "The user's display name."
          },
          "always_active": {
            "type": "boolean",
            "description": "Indicates if the user is always active."
          },
          "status_expiration": {
            "type": "string",
            "description": "The expiration time of the user's status (in seconds since epoch)."
          },
          "phone": {
            "type": "string",
            "description": "The user's phone number (if available)."
          },
          "status_text": {
            "type": "string",
            "description": "The user's status text."
          },
          "fields": {
            "type": "string",
            "description": "Currently null."
          },
          "image_72": {
            "type": "string",
            "description": "URL to the user's profile image in size 72x72."
          },
          "display_name_normalized": {
            "type": "string",
            "description": "The user's display name in a normalized format."
          }
        }
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
      "who_can_share_contact_card": {
        "type": "string",
        "description": "Specifies who can share the user's contact card."
      },
      "is_admin": {
        "type": "boolean",
        "description": "Indicates if the user is an admin."
      },
      "is_email_confirmed": {
        "type": "boolean",
        "description": "Indicates if the user's email is confirmed."
      },
      "is_app_user": {
        "type": "boolean",
        "description": "Indicates if the user is an app user."
      },
      "deleted": {
        "type": "boolean",
        "description": "Indicates if the user is deleted."
      },
      "tz_offset": {
        "type": "string",
        "description": "The user's time zone offset in seconds."
      },
      "name": {
        "type": "string",
        "description": "The user's name."
      },
      "id": {
        "type": "string",
        "description": "The user's ID."
      },
      "is_bot": {
        "type": "boolean",
        "description": "Indicates if the user is a bot."
      },
      "updated": {
        "type": "string",
        "description": "The timestamp of the user's last update (in seconds since epoch)."
      },
      "email": {
        "type": "string",
        "title": "email"
      },
      "job_title": {
        "type": "string",
        "title": "job_title"
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


Add the `Slack Channel Membership` blueprint:

1. **Go to the [Builder](https://app.getport.io/settings/data-model)** in your Port portal.
2. **Click on "+ Blueprint"**.
3. **Click on the `{...}` button** in the top right corner, and choose "Edit JSON".
4. **Add this JSON schema**:

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

### Create Webhook Integration

Create Webhook integration to ingest the data into Port:

1. **Go to the [Data-Sources](https://app.getport.io/settings/data-sources)** page in your Port portal.
2. **Click on "+ Data source"**.
3. In the top selection bar, **click on Webhook** and then **Custom Integration**.
4. Enter a **name for your Integration** (for example: "Slack Integration"), a description (optional), and **Click on Next**
5. **Copy the Webhook URL** that was generated and include it when you **contact us** to set up the integration.
6. Scroll down to the **3rd Section - Map the data from the external system into Port** and **Paste** the following mapping:


<details>
<summary><b>Slack Webhook Mapping (Click to expand)</b></summary>

```json showLineNumbers
[
  {
    "blueprint": "slack_channel",
    "operation": "create",
    "filter": ".body.is_channel == true",
    "entity": {
      "identifier": ".body.id | tostring",
      "title": ".body.name_normalized | tostring",
      "properties": {
        "is_private": ".body.is_private",
        "purpose": {
          "last_set": ".body.purpose.last_set",
          "creator": ".body.purpose.creator",
          "value": ".body.purpose.value"
        },
        "is_pending_ext_shared": ".body.is_pending_ext_shared",
        "context_team_id": ".body.context_team_id",
        "pending_shared": ".body.pending_shared",
        "is_channel": ".body.is_channel",
        "is_shared": ".body.is_shared",
        "id": ".body.id",
        "previous_names": ".body.previous_names",
        "pending_connected_team_ids": ".body.pending_connected_team_ids",
        "creator": ".body.creator",
        "is_im": ".body.is_im",
        "is_member": ".body.is_member",
        "is_mpim": ".body.is_mpim",
        "created": ".body.created",
        "name_normalized": ".body.name_normalized",
        "is_ext_shared": ".body.is_ext_shared",
        "is_group": ".body.is_group",
        "unlinked": ".body.unlinked",
        "is_archived": ".body.is_archived",
        "is_general": ".body.is_general",
        "num_members": ".body.num_members | tonumber? // .",
        "name": ".body.name",
        "topic": {
          "last_set": ".body.topic.last_set",
          "creator": ".body.topic.creator",
          "value": ".body.topic.value"
        },
        "shared_team_ids": ".body.shared_team_ids",
        "is_org_shared": ".body.is_org_shared",
        "updated": ".body.updated",
        "properties": ".body.properties",
        "parent_conversation": ".body.parent_conversation"
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
    "filter": ".body | has(\"profile\")",
    "entity": {
      "identifier": ".body.id | tostring",
      "title": ".body.name | tostring",
      "properties": {
        "is_ultra_restricted": ".body.is_ultra_restricted",
        "color": ".body.color",
        "tz": ".body.tz",
        "is_owner": ".body.is_owner",
        "is_restricted": ".body.is_restricted",
        "tz_label": ".body.tz_label",
        "is_primary_owner": ".body.is_primary_owner",
        "real_name": ".body.real_name",
        "team_id": ".body.team_id",
        "who_can_share_contact_card": ".body.who_can_share_contact_card",
        "is_admin": ".body.is_admin",
        "is_email_confirmed": ".body.is_email_confirmed",
        "is_app_user": ".body.is_app_user",
        "deleted": ".body.deleted",
        "tz_offset": ".body.tz_offset",
        "name": ".body.name",
        "id": ".body.id",
        "is_bot": ".body.is_bot",
        "updated": ".body.updated",
        "profile": ".body.profile",
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
    "filter": ".body | has(\"member_id\")",
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

<br/>

## Airbyte Setup

### Set up S3 Destination

If you haven't already set up S3 Destination for Port S3, follow these steps:

<Tabs groupId="S3 Destination" queryString values={
[{label: "User Interface", value: "ui"},{label: "Terraform", value: "terraform"}]
}>

<TabItem value="ui" label="User Interface">

1. **Login** to your Airbyte application (cloud or self-hosted)
2. In the left-side pane, **Click on Destinations**
3. **Click on "+ New Destination"**.
4. Input S3 Credentials that were provided by port: (contact us)
   1. Under **S3 Key ID** enter your S3 Access Key ID
   2. Under **S3 Access Key** enter your S3 Access Key Secret
   3. Under **S3 Bucket Name** enter the bucket name (example: "org-xxx")
   4. Under **S3 Bucket Path** enter "/data"
   5. Under **S3 Bucket Region** enter the appropriate region
   6. For output format, **choose "JSON Lines: Newline-delimited JSON"**
   7. For compression, **choose "GZIP"**
   8. Under Optional Fields, **enter the following in S3 Path Format**: `${NAMESPACE}/${STREAM_NAME}/year=${YEAR}/month=${MONTH}/${DAY}_$${EPOCH}_`
5. **Click Test and save** and wait for Airbyte to confirm the Destination is set up correctly.


</TabItem>

<TabItem value="terraform" label="Terraform">

```code showLineNumbers
terraform {
  required_providers {
    airbyte = {
      source = "airbytehq/airbyte"
      version = "0.6.5"
    }
  }
}

provider "airbyte" {
  username = "<AIRBYTE_USERNAME>"
  password = "<AIRBYTE_PASSWORD>"
  server_url = "<AIRBYTE_API_URL>"
}

resource "airbyte_destination_s3" "puddle-s3" {
  configuration = {
    access_key_id     = "<S3_ACCESS_KEY>"
    secret_access_key = "<S3_SECRET_KEY>"
    s3_bucket_region  = "<S3_REGION>"
    s3_bucket_name    = "<S3_BUCKET>"
    s3_bucket_path    = "data/"
    format = {
      json_lines_newline_delimited_json = {
        compression = { gzip = {} }
        format_type = "JSONL"
      }
    }
    s3_path_format    = `$${NAMESPACE}/$${STREAM_NAME}/year=$${YEAR}/month=$${MONTH}/$${DAY}_$${EPOCH}_`
    destination_type = "s3"
  }
  name          = "port-s3-destination"
  workspace_id  = var.workspace_id
}

variable "workspace_id" {
  default     = "<AIRBYTE_WORKSPACE_ID>"
}
```

</TabItem>

</Tabs>


### Set up Slack Connection

1. Follow Airbyte's guide to set up [Slack connector](https://docs.airbyte.com/integrations/sources/slack)
2. After the Source is set up, Proceed to Create a "+ New Connection"
3. For Source, choose the Slack source you have set up
4. For Destination, choose the S3 Destination you have set up
5. In the **Select Streams** step, make sure only "channel_members", "channels" and "users" are marked for synchronization
6. In the **Configuration** step, under "Destination Namespace", choose "Custom Format" and enter the value "slack"
7. **Click on Finish & Sync** to apply and start the Integration process!

::: 
  If for any reason you have entered different values than the ones specific listed in this guide,
  make sure to inform your Port account manager about any of these changes to ensure the integration will run smoothly.
::: 

By following these steps, you have effectively created and executed a continuous integration of Slack channel & user data into Port 🎉.


