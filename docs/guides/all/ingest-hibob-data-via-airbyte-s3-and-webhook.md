---
title: Ingest Hibob data into Port via Airbyte, S3 and Webhook
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Ingest HiBob data into Port via Airbyte, S3 and Webhook

This guide will demonstrate how to ingest HiBob data into Port using Airbyte, S3 and Webhook integration.

## Prerequisites

- Ensure you have a Port account and have completed the [onboarding process](https://docs.port.io/quickstart).
- Ensure you have access to Port S3 integrations (contact us to gain access), and have S3 Access & Secret Keys, and Bucket name.
- Access to available Airbyte app (can be cloud or self-hosted)
- Setup Hibob API Service User - [Hibob Guide](https://apidocs.hibob.com/docs/api-service-users#step-1-create-a-new-api-service-user)



<br/>

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
      "about": {
        "type": "object"
      },
      "personal": {
        "type": "object"
      },
      "id": {
        "type": "string"
      },
      "employee": {
        "type": "object"
      },
      "email": {
        "type": "string",
        "format": "email"
      },
      "home": {
        "type": "object"
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
      "internal": {
        "type": "object"
      },
      "firstname": {
        "type": "string"
      },
      "peopleanalytics": {
        "type": "object"
      },
      "avatarurl": {
        "type": "string",
        "format": "url"
      },
      "financial": {
        "type": "object"
      },
      "about": {
        "type": "object"
      },
      "emergency": {
        "type": "object"
      },
      "employee": {
        "type": "object"
      },
      "eeo": {
        "type": "object"
      },
      "companyid": {
        "type": "string"
      },
      "identification": {
        "type": "object"
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
      "temporaryaddress": {
        "type": "object"
      },
      "address": {
        "type": "object"
      },
      "creationdatetime": {
        "type": "string",
        "format": "date-time"
      },
      "work": {
        "type": "object"
      },
      "personal": {
        "type": "object"
      },
      "actualpayment": {
        "type": "object"
      },
      "home": {
        "type": "object"
      },
      "secondname": {
        "type": "string"
      },
      "displayname": {
        "type": "string"
      },
      "coverimageurl": {
        "type": "string",
        "format": "url"
      },
      "payroll": {
        "type": "object"
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
        "internal": ".body.internal",
        "firstname": ".body.firstName",
        "peopleanalytics": ".body.peopleAnalytics",
        "avatarurl": ".body.avatarUrl",
        "financial": ".body.financial",
        "about": ".body.about",
        "emergency": ".body.emergency",
        "employee": ".body.employee",
        "eeo": ".body.eeo",
        "companyid": ".body.companyId",
        "identification": ".body.identification",
        "surname": ".body.surname",
        "state": ".body.state",
        "id": ".body.id",
        "email": ".body.email",
        "temporaryaddress": ".body.temporaryAddress",
        "address": ".body.address",
        "creationdatetime": ".body.creationDatetime",
        "work": ".body.work",
        "personal": ".body.personal",
        "actualpayment": ".body.actualPayment",
        "home": ".body.home",
        "secondname": ".body.secondName",
        "displayname": ".body.displayname",
        "coverimageurl": ".body.coverImageUrl",
        "payroll": ".body.payroll",
        "fullname": ".body.fullName"
      }
    }
  },
  {
    "blueprint": "hibob_profile",
    "operation": "create",
    "filter": ".body._PORT_SOURCE_OBJECT_KEY | split(\"/\") | .[2] | IN(\"profile\")",
    "entity": {
      "identifier": ".body.id",
      "title": ".body.displayName",
      "properties": {
        "companyid": ".body.companyId",
        "firstname": ".body.firstName",
        "work": ".body.work",
        "surname": ".body.surname",
        "displayname": ".body.displayName",
        "about": ".body.about",
        "personal": ".body.personal",
        "id": ".body.id",
        "employee": ".body.employee",
        "email": ".body.email",
        "home": ".body.home"
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


### Set up Hibob Connection

1. Follow Airbyte's guide to set up [Hibob connector](https://docs.airbyte.com/integrations/sources/hibob)
2. After the Source is set up, Proceed to Create a "+ New Connection"
3. For Source, choose the Hibob source you have set up
4. For Destination, choose the S3 Destination you have set up
5. In the **Select Streams** step, make sure only "channel_members", "channels" and "users" are marked for synchronization
6. In the **Configuration** step, under "Destination Namespace", choose "Custom Format" and enter the value "hibob"
7. **Click on Finish & Sync** to apply and start the Integration process!

::: 
  If for any reason you have entered different values than the ones specific listed in this guide,
  make sure to inform your Port account manager about any of these changes to ensure the integration will run smoothly.
::: 

By following these steps, you have effectively created and executed a continuous integration of Hibob data into Port 🎉.


