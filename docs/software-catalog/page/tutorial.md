---
sidebar_position: 1
sidebar_label: Tutorial
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Page Tutorial

## Page Permissions

Pages has 4 regular CRUD permissions:

- Create, Read, Update and Delete.
- Currently only Read permission can be modified.

## Get a Page Permissions

- Any user can get a specific page permission.

### From the API

:::note
Remember that an access token is needed to make API requests, refer back to [Getting an API token](../blueprint/tutorial.md#getting-an-api-token) if you need to generate a new one.
:::

Use this route with GET request "https://api.getport.io/v1/pages/{Page_Identifier}/permissions";

The response will contains the Roles and Users that allow to Read the requested page.

:::note
Notice: Only Page Permissions of Software Catalog Pages can be requested.
:::

## Update a Page Permissions

- Any user can get a specific page permission.

### From the API

:::note
Remember that an access token is needed to make API requests, refer back to [Getting an API token](../blueprint/tutorial.md#getting-an-api-token) if you need to generate a new one.
:::

Use this route with PATCH request "https://api.getport.io/v1/pages/{Page_Identifier}/permissions";

A request body example:

```
{
    "read": {
      "roles": [
        "Admin",
        "Member"
      ],
      "users": []
    }
}
```

:::note
Notice: <br/>
An update page permission is requested in order to execute this request. <br/>
Only Page Permissions of Software Catalog Pages can be modified.
:::
