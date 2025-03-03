---
sidebar_position: 4
sidebar_label: Page Permissions
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Page permissions

Page permissions are used to control access to [catalog pages](/customize-pages-dashboards-and-plugins/page/catalog-page) and [dashboard pages](/customize-pages-dashboards-and-plugins/page/dashboard-page) in the software catalog.

Using these permissions, you can control which users and/or teams can **view** or **edit** a specific page.

## Update page permissions

Only users with the `admin` role can update the permissions of a catalog page.

Admins can:
- Define which users and/or teams can **view** the page.
- Define which users and/or teams can **edit** the page.
- Allow all users in the organization to **view** the page.

Update page permissions using one of the following methods:

<Tabs groupId="edit-permissions" queryString values={[
{label: "UI", value: "ui"},
{label: "API", value: "api"},
{label: "Terraform", value: "terraform"},
{label: "Pulumi", value: "pulumi"}
]}>

<TabItem value="ui">

Click on the permissions <img src="/img/icons/permissions.svg" style={{"vertical-align": "text-top"}} className="not-zoom" /> button in the top-right corner of the page.

Choose the user/s or team/s that you would like to give `view` or `edit` permissions to, then click on `Done`.

To allow all users in the organization to view the page, use the toggle in the bottom of the permissions modal.

</TabItem>

<TabItem value="api">

To update page permissions, you will need to specify the roles, teams or users that should have permissions for the page.

To perform an update, make an **HTTP PATCH** request to the following URL: `https://api.getport.io/v1/pages/{page_identifier}/permissions`.

Here is an example request body that updates the permissions to allow all users in the organization to **view** the page:

```json showLineNumbers
{
  "read": {
    "roles": ["Admin", "Member"]
  }
}
````

Here is another example that updates the permissions to allow a specific user and team to **edit** the page:

```json showLineNumbers
{
  "update": {
    "users": ["user1@example.com"],
    "teams": ["team1"]
  }
}
````

:::tip Page permissions API

The `PATCH` API will perform updates only to keys that are specified in the request body. Be sure to include only the relevant keys in the request body (users, roles or teams)

If you do not specify a specific key (for example `users` in the request, user permissions to the specific page will remain unchanged).

When making changes to permissions, any role, user or team that does not appear in the corresponding key in the request body will lose permissions to the page (this is how you remove permissions).

:::

</TabItem>

<TabItem value="terraform">

See the [Terraform provider documentation](https://registry.terraform.io/providers/port-labs/port-labs/latest/docs/resources/port_page_permissions#example-usage) for examples.

</TabItem>

<TabItem value="pulumi">

:::info Port Pulumi
See all the supported variables in the Port Pulumi [documentation](https://www.pulumi.com/registry/packages/port/api-docs/pagepermissions/#create)
:::

<Tabs groupId="pulumi-update-permissions" queryString values={[
{label: "Python", value: "python"},
{label: "Typescript", value: "typescript"},
{label: "Golang", value: "go"}
]}>

<TabItem value="python">
```python showLineNumbers
from port_pulumi import Page, PagePermissions

# Allow read access to all admins and a specific user and team:
microservices_permissions = PagePermissions(
    "microservices_permissions",
    page_identifier="microservice_blueprint_page",
    read={
        "roles": [
            "Admin",
        ],
        users: ["normaluser@gmail.com"],
        teams: ["Super Team"],
    },
)
```
</TabItem>

<TabItem value="typescript">
```typescript showLineNumbers
import * as port from "@port/pulumi";

// Allow read access to all admins and a specific user and team:
const microservicesPermissions = new port.PagePermissions("microservices_permissions", {
    pageIdentifier: "microservice_blueprint_page",
    read: {
        roles: ["Admin"],
        users: ["normaluser@gmail.com"],
        teams: ["Super Team"],
    },
});
````
</TabItem>

<TabItem value="go">
```go showLineNumbers
package main

import (
	"github.com/port-labs/pulumi-port/sdk/go/port"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	ctx := pulumi.NewContext()
	
	// Allow read access to all admins and a specific user and team:
	microservicesPermissions, err := port.NewPagePermissions(ctx, "microservices_permissions", &port.PagePermissionsArgs{
		PageIdentifier: pulumi.String("microservice_blueprint_page"),
		Read: &port.PagePermissionsReadArgs{
			Roles: pulumi.StringArray{
				pulumi.String("Admin"),
			},
			Users: pulumi.StringArray{
				pulumi.String("normaluser@gmail.com"),
			},
			Teams: pulumi.StringArray{
				pulumi.String("Super Team"),
			},
		},
	})
	if err != nil {
		// Handle error
	}
	// You can use the microservicesPermissions variable as needed in your code.
}

````

</TabItem>

</Tabs>

</TabItem>

</Tabs>

### Examples

Let's present a set of page permissions and then explore how different `PATCH` request bodies change the effective permissions of the page.

Given the following permissions for a page:

```json showLineNumbers
{
  "read": {
    "roles": ["Admin", "Member"],
    "users": [],
    "teams": []
  }
}
```

#### Add permissions to role

Making an **HTTP PATCH** request with the following body will give the `Services-Moderator` role permissions to view the page (without removing the permissions of any existing role):

```json showLineNumbers
{
  "read": {
    "roles": ["Admin", "Member", "Services-Moderator"]
  }
}
```

#### Remove permissions from role

Making an **HTTP PATCH** request with the following body will remove the `Member` roles' permissions to view the page:

```json showLineNumbers
{
  "read": {
    "roles": ["Admin"]
  }
}
```

#### Add permissions to user

Making an **HTTP PATCH** request with the following body will give the specified users permissions to view the page (without changing the permissions of existing `roles`):

```json showLineNumbers
{
  "read": {
    "users": ["exampleUser1@example.com", "exampleUser2@example.com"]
  }
}
```

#### Add permissions to team

Making an **HTTP PATCH** request with the following body will give the specified teams permissions to view the page (without changing the permissions of existing `roles`):

```json showLineNumbers
{
  "read": {
    "teams": ["team1", "team2"]
  }
}
```

:::info
It is possible to update multiple permission keys (`roles`, `teams` and/or `users`) in a single `PATCH` request, just keep in mind that any `role`, `team` or `user` that is not specified and previously had permissions to the page, will lose those permissions.
:::

## Lock pages

Locking the page affects widgets that have Filter and/or Hide functionality.

See the section below for the different methods to lock a page:

<Tabs values={[
{label: "UI", value: "ui"},
{label: "API", value: "api"},
]}>

<TabItem value="ui">

Users that have permissions to update a page (usually users with the `admin` role) can lock the page's widgets.

1. Save the page in the desired view by clicking the `save page` button.
2. Open the page menu and click on `lock page`.

</TabItem>

<TabItem value="api">

To lock a page, make an **HTTP PATCH** request to the following URL: `https://api.getport.io/v1/pages/{page_identifier}`

with the following body:

```json showLineNumbers
{
  "locked": true
}
```

</TabItem>

</Tabs>

A locked page will have the `Lock` icon next to the page's title:

<img src="/img/software-catalog/pages/LockedPage.png" border='1px' width='30%' />


