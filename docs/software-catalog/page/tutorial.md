---
sidebar_position: 1
sidebar_label: Tutorial
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Page Tutorial

## Page permissions

Pages have 4 regular CRUD permissions:

- Create, Read, Update and Delete.
- Currently only Read permission can be modified.

## Get page permissions

- Any user can get the permissions of a specific page.

### From the API

:::note
Remember that an access token is needed to make API requests, refer back to [Getting an API token](../blueprint/tutorial.md#getting-an-api-token) if you need to generate a new one.
:::

Make an **HTTP GET** request to the URL: `https://api.getport.io/v1/pages/{Page_Identifier}/permissions`.

The response will contain the roles and users that are allowed to read (view) the requested page.

:::note
Only Page Permissions of Software Catalog Pages can be requested.
:::

## Update page permissions

- Only users with the admin role can update the permissions of a specific page;
- Only page permissions of software catalog pages can be modified.

### From the API

:::note
Remember that an access token is needed to make API requests, refer back to [Getting an API token](../blueprint/tutorial.md#getting-an-api-token) if you need to generate a new one.
:::

Make an **HTTP PATCH** request to the following URL: `https://api.getport.io/v1/pages/{Page_Identifier}/permissions`.

Here is an example request body:

```json showLineNumbers
{
  "read": {
    "roles": ["Admin", "Member"],
    "users": []
  }
}
```

:::info
When updating the permissions of a page, be sure to include the list of roles and users that need permissions in every request. Any role or user that does not appear in the request body will lose permissions to the page (this is effectively how you deny permissions to a page from a user)

For example, given the following permissions for a page:

```json showLineNumbers
{
  "read": {
    "roles": ["Admin", "Member"],
    "users": []
  }
}
```

Making an HTTP PATCH request with the following body will remove the `Member` roles' permission to view the page:

```json showLineNumbers
{
  "read": {
    "roles": ["Admin"],
    "users": []
  }
}
```

Making an HTTP PATCH request with the following body will give the `Services-Moderator` role permissions to view the page:

```json showLineNumbers
{
  "read": {
    "roles": ["Admin", "Member", "Services-Moderator"],
    "users": []
  }
}
```

:::
