---
title: Ingest Hibob data into Port via Airbyte, S3 and Webhook
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import AirbyteS3DestinationSetup from "/docs/generalTemplates/_airbyte_s3_destination_setup.md"
import AirbyteLocalSetup from "/docs/generalTemplates/_airbyte_local_setup.md"
import S3IntegrationDisclaimer from "/docs/generalTemplates/_s3_integrations_disclaimer.md"
import S3IntegrationMappingSetup from "/docs/generalTemplates/_s3_integrations_mapping_setup.md"


# Ingest HiBob data into Port via Airbyte, S3 & webhook

This guide will demonstrate how to ingest HiBob data into Port using [Airbyte](https://airbyte.com/), [S3](https://aws.amazon.com/s3/) and a [webhook integration](https://docs.port.io/build-your-software-catalog/custom-integration/webhook/).

<S3IntegrationDisclaimer/>

## Prerequisites

- Ensure you have a Port account and have completed the [onboarding process](https://docs.port.io/quickstart).

- This feature is part of Port's limited-access offering. To obtain the required S3 bucket, please contact our team directly via chat, [Slack](https://www.getport.io/community), or the[support site](http://support.port.io/), and we will create and manage the bucket on your behalf.

- Access to an available Airbyte app (can be cloud or self-hosted) - for reference, follow the [quick start guide](https://docs.airbyte.com/using-airbyte/getting-started/oss-quickstart).

<AirbyteLocalSetup/>

- Setup a Hibob API service user - [Hibob Guide](https://apidocs.hibob.com/docs/api-service-users#step-1-create-a-new-api-service-user).

## Data model setup

### Create blueprints

Create the `Hibob Payroll` blueprint:

1. Go to the [Builder page](https://app.getport.io/settings/data-model) of your portal.

2. Click on "+ Blueprint".

3. Click on the `{...}` button in the top right corner, and choose "Edit JSON".

4. Paste the following JSON schema into the editor:

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
      "email": {
        "type": "string",
        "format": "email"
      },
      "creationdatetime": {
        "type": "string",
        "format": "date-time"
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

Create the `Hibob Profile` blueprint in the same way:

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
      "surname": {
        "type": "string"
      },
      "email": {
        "type": "string",
        "format": "email"
      },
      "is_manager": {
        "type": "boolean",
        "title": "is_manager"
      },
      "duration_of_employment": {
        "type": "string",
        "title": "duration_of_employment"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "payroll": {
      "title": "Payroll",
      "target": "hibob_payroll",
      "required": false,
      "many": false
    }
  }
}
```

</details>

<S3IntegrationMappingSetup/>

<details>
<summary><b>Hibob Webhook Mapping (Click to expand)</b></summary>

```json showLineNumbers
[
  {
    "blueprint": "hibob_payroll",
    "operation": "create",
    "filter": "(.body | has(\"_PORT_SOURCE_OBJECT_KEY\")) and (.body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[2] | IN(\"payroll\"))",
    "entity": {
      "identifier": ".body.id",
      "title": ".body.displayName",
      "properties": {
        "creationdate": "(.body.creationDate? // null) | if type == \"string\" then strptime(\"%Y-%m-%d\") | strftime(\"%Y-%m-%dT%H:%M:%SZ\") else null end",
        "firstname": ".body.firstName",
        "avatarurl": ".body.avatarUrl",
        "companyid": ".body.companyId",
        "surname": ".body.surname",
        "state": ".body.state",
        "email": ".body.email",
        "creationdatetime": ".body.creationDatetime",
        "coverimageurl": ".body.coverImageUrl",
        "fullname": ".body.fullName"
      }
    }
  },
  {
    "blueprint": "hibob_profile",
    "operation": "create",
    "filter": "(.body | has(\"_PORT_SOURCE_OBJECT_KEY\")) and (.body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[2] | IN(\"profiles\"))",
    "entity": {
      "identifier": ".body.id",
      "title": ".body.displayName",
      "properties": {
        "companyid": ".body.companyId",
        "firstname": ".body.firstName",
        "is_manager": ".body.work.isManager",
        "duration_of_employment": ".body.work.durationOfEmployment.humanize",
        "surname": ".body.surname",
        "email": ".body.email"
      },
      "relations": {
        "payroll": ".body.id"
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

1. Follow Airbyte's guide to set up [Hibob connector](https://docs.airbyte.com/integrations/sources/hibob). 
  More information on [setting source connectors](http://docs.port.io/build-your-software-catalog/custom-integration/S3-integrations#set-up-data-source)

2. After the Source is set up, proceed to create a "+ New Connection".

3. For **Source**, choose the Hibob source you have set up.

4. For **Destination**, choose the S3 Destination you have set up.

5. In the **Select Streams** step, make sure only "payroll" and "profiles" are marked for synchronization.

6. In the **Configuration** step, under **Destination Namespace**, choose "Custom Format" and enter the Webhook URL you have copied when setting up the webhook, for example: "wSLvwtI1LFwQzXXX".

7. Click on **Finish & Sync** to apply and start the Integration process!

:::tip Important
  If for any reason you have entered different values than the ones specified in this guide,
  inform us so we can assist to ensure the integration will run smoothly.
:::

## Additional relevant guides

- [Ingest Any data into port via Airbyte](https://docs.port.io/build-your-software-catalog/custom-integration/S3-integrations)
