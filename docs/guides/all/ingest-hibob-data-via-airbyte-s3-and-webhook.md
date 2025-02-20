---
title: Ingest Hibob data into Port via Airbyte, S3 and Webhook
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import AirbyteS3DestinationSetup from "/docs/generalTemplates/_airbyte_s3_destination_setup.md"

# Ingest HiBob data into Port via Airbyte, S3 and Webhook

This guide will demonstrate how to ingest HiBob data into Port using Airbyte, S3 and Webhook integration.

## Prerequisites

- Ensure you have a Port account and have completed the [onboarding process](https://docs.port.io/quickstart).
- Contact us using Intercom/Slack/mail to [support@getport.io](mailto:support@getport.io) to set up the integration and get Access keys and S3 Bucket name.
- Access to available Airbyte app (can be cloud or self-hosted) - for reference, follow the [quick start guide](https://docs.airbyte.com/using-airbyte/getting-started/oss-quickstart)
- Setup Hibob API Service User - [Hibob Guide](https://apidocs.hibob.com/docs/api-service-users#step-1-create-a-new-api-service-user)


## Data model setup


### Add Blueprints 
Add the `Hibob Profile` blueprint:

1. **Go to the [Builder](https://app.getport.io/settings/data-model)** in your Port portal.
2. **Click on "+ Blueprint"**.
3. **Click on the `{...}` button** in the top right corner, and choose "Edit JSON".
4. **Add this JSON schema**:

<details>
<summary><b>Hibob Profile (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "hibob_profile",
  "description": "Represents an employee record.",
  "title": "Hibob Profile",
  "icon": "User",
  "schema": {
    "properties": {
      "companyid": {
        "type": "string"
      },
      "firstname": {
        "type": "string"
      },
      "work": {
        "type": "object"
      },
      "surname": {
        "type": "string"
      },
      "displayname": {
        "type": "string"
      },
      "id": {
        "type": "string"
      },
      "email": {
        "type": "string",
        "format": "email"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```

</details>


Add the `Hibob Payroll` blueprint:

1. **Go to the [Builder](https://app.getport.io/settings/data-model)** in your Port portal.
2. **Click on "+ Blueprint"**.
3. **Click on the `{...}` button** in the top right corner, and choose "Edit JSON".
4. **Add this JSON schema**:

<details>
<summary><b>Hibob Payroll (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "hibob_payroll",
  "description": "Represents an employee record.",
  "title": "Hibob Payroll",
  "icon": "Service",
  "schema": {
    "properties": {
      "creationdate": {
        "type": "string",
        "format": "date-time"
      },
      "firstname": {
        "type": "string"
      },
      "avatarurl": {
        "type": "string",
        "format": "url"
      },
      "companyid": {
        "type": "string"
      },
      "surname": {
        "type": "string"
      },
      "state": {
        "type": "string"
      },
      "id": {
        "type": "string"
      },
      "email": {
        "type": "string",
        "format": "email"
      },
      "creationdatetime": {
        "type": "string",
        "format": "date-time"
      },
      "displayname": {
        "type": "string"
      },
      "coverimageurl": {
        "type": "string",
        "format": "url"
      },
      "fullname": {
        "type": "string"
      }
    },
    "required": []
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
4. Enter a **name for your Integration** (for example: "Hibob Integration"), a description (optional), and **Click on Next**
5. **Copy the Webhook URL** that was generated and include it when you **contact us** to set up the integration.
6. Scroll down to the **3rd Section - Map the data from the external system into Port** and **Paste** the following mapping:


<details>
<summary><b>Hibob Webhook Mapping (Click to expand)</b></summary>

```json showLineNumbers
[
  {
    "blueprint": "hibob_payroll",
    "operation": "create",
    "filter": ".body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[2] | IN(\"payroll\")",
    "entity": {
      "identifier": ".body.id",
      "title": ".body.displayName",
      "properties": {
        "creationdate": ".body.creationDate",
        "firstname": ".body.firstName",
        "avatarurl": ".body.avatarUrl",
        "companyid": ".body.companyId",
        "surname": ".body.surname",
        "state": ".body.state",
        "id": ".body.id",
        "email": ".body.email",
        "creationdatetime": ".body.creationDatetime",
        "displayname": ".body.displayname",
        "coverimageurl": ".body.coverImageUrl",
        "fullname": ".body.fullName"
      }
    }
  },
  {
    "blueprint": "hibob_profile",
    "operation": "create",
    "filter": ".body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[2] | IN(\"profiles\")",
    "entity": {
      "identifier": ".body.id",
      "title": ".body.displayName",
      "properties": {
        "companyid": ".body.companyId",
        "firstname": ".body.firstName",
        "work": ".body.work",
        "surname": ".body.surname",
        "displayname": ".body.displayName",
        "id": ".body.id",
        "email": ".body.email"
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


### Set up Hibob Connection

1. Follow Airbyte's guide to set up [Hibob connector](https://docs.airbyte.com/integrations/sources/hibob)
2. After the Source is set up, Proceed to Create a "+ New Connection"
3. For Source, choose the Hibob source you have set up
4. For Destination, choose the S3 Destination you have set up
5. In the **Select Streams** step, make sure only "channel_members", "channels" and "users" are marked for synchronization
6. In the **Configuration** step, under "Destination Namespace", choose "Custom Format" and enter the value "hibob"
7. **Click on Finish & Sync** to apply and start the Integration process!

:::tip Important
  If for any reason you have entered different values than the ones specific listed in this guide,
  inform us of these changes using Intercom/Slack/mail to [support@getport.io](mailto:support@getport.io)
  to ensure the integration will run smoothly.
::: 

By following these steps, you have effectively created and executed a continuous integration of Hibob data into Port 🎉.


