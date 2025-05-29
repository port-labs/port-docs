---
title: Set catalog RBAC
sidebar_label: Set catalog RBAC
---

import OwnershipTemplate from "./\_ownership_explanation_template.mdx";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

# Set catalog RBAC

<center>

<iframe width="568" height="320" src="https://www.youtube.com/embed/p-pNcvVfdUE" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>

</center>
<br/>

Port provides granular control to ensure that every user only sees the parts of the catalog that are relevant to them.

Port's catalog RBAC capabilities are enabled by utilizing [permissions controls](/sso-rbac/rbac/rbac.md).

:::tip Page permissions

In order to manage who can view certain **pages** in Port, check out [page permissions](/customize-pages-dashboards-and-plugins/page/page-permissions.md).
:::

## Common Catalog RBAC usage

Catalog RBAC allows admins to finely control which users have access to specific information in the software catalog, for example:

- Allow a user to edit a single specific property on an entity.
- Create a fully read-only view for a developer.

## Set *global* access controls to catalog data

The default permissions assigned to every blueprint upon creation specify that users with the `admin` role, and users with the specific blueprint `moderator` role, can perform any action on a blueprint.  
See [RBAC permissions](/sso-rbac/rbac/) for more information about the different roles.

It is possible to assign global permissions controls on **entities**, using these steps:
1. Go to the [Builder page](https://app.getport.io/settings/data-model) of your portal.
2. Select your desired blueprint, click on the `...` button in the top-right corner, and select `Permissions`:

    <img src='/img/software-catalog/role-based-access-control/permissions/editEntityPermissions.png' width='30%' border='1px' />
3. A JSON editor will open, where you can set the permissions for the blueprint.  


<Tabs groupId="permission" defaultValue="read" queryString="permission">

<TabItem value="read" label="Read">

To assign permissions to read (view) an entity, give the desired persona permissions under the `read` object as shown below:

<Tabs groupId="target" defaultValue="role">

<TabItem value="role" label="Role">

To give `read` permissions to another role, add it to the `roles` array:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "read": {
      // highlight-next-line
      "roles": ["my-blueprint-moderator", "Admin", "my-role"], // added my-role
      "users": [],
      "teams": [],
      "ownedByTeam": false
    }
  }
}
```

</TabItem>

<TabItem value="user" label="User">

To give `read` permissions to another user, add it to the `users` array:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "read": {
      "roles": ["my-blueprint-moderator", "Admin"],
      // highlight-next-line
      "users": ["my-user@example.com"], // added my-user@example.com
      "teams": [],
      "ownedByTeam": false
    }
  }
}
```

</TabItem>

<TabItem value="team" label="Team">

To give `read` permissions to another team, add it to the `teams` array:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "read": {
      "roles": ["my-blueprint-moderator", "Admin"],
      "users": [],
      // highlight-next-line
      "teams": ["my-team"], // added my-team
      "ownedByTeam": false
    }
  }
}
```

</TabItem>

<TabItem value="ownership" label="Ownership">

<OwnershipTemplate />

To give `read` permissions to members of the owning team of an entity, change the `ownedByTeam` key:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "read": {
      "roles": ["my-blueprint-moderator", "Admin"],
      "users": [],
      "teams": [],
      // highlight-next-line
      "ownedByTeam": true // changed from false
    }
  }
}
```

</TabItem>

<TabItem value="policy" label="Policy">

:::info Closed beta feature
This capability is currently in closed beta, and is not yet generally available.  
If you would like to join the beta, please reach out to us.
:::

The `policy` key allows you to give **dynamic** `read` permissions to users, by using [search queries](/search-and-query/#rules).

You can also use [contextual query rules](/search-and-query/#contextual-query-rules) to get the context of the user executing the query.

In the following example, `on-call` users are granted `read` access only to entities that share the same `region` as one of their owning teams:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "read": {
      "roles": ["my-blueprint-moderator", "Admin"],
      "users": [],
      "teams": [],
      "ownedByTeam": false,
      // highlight-start
      "policy": {
        "combinator": "and",
        "rules": [
          {
            "property": {
              "context" : "user",
              "property": "isOnCall"
            },
            "operator": "=",
            "value": "true"
          },
          {
            "property": "region",
            "operator": "containsAny",
            "value": {
              "context" : "userTeams",
              "property": "region"
            }
          },
        ]
      }
      // highlight-end
    }
  }
}
```

:::info Policy usage
The `policy` key will take effect only if the user is not affected by any other `read` permission keys.  
For example, if the user has full `read` permissions or `ownedByTeam` permissions, this query will not take effect.
:::

</TabItem>
</Tabs>

**Note** that assigning `create`, `update`, or `delete` permissions to a user or team will automatically grant them `read` permissions as well, as they need to be able to see the entities they are allowed to interact with.

:::tip Affected components
Setting `read` permissions on entities takes effect at the API level, meaning that any component in Port that fetches entities will be affected by these permissions.  
For example, a table widget that displays entities will only show entities that the user has read permissions for.
:::

</TabItem>

<TabItem value="create" label="Create (register)">

To assign permissions to create an entity, give the desired persona permissions under the `register` object as shown below:

<Tabs groupId="target" defaultValue="role">

<TabItem value="role" label="Role">

To give `create` permissions to another role, add it to the `roles` array:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "register": {
      // highlight-next-line
      "roles": ["my-blueprint-moderator", "Admin", "my-role"], // added my-role
      "users": [],
      "teams": [],
      "ownedByTeam": false
    }
  }
}
```

</TabItem>

<TabItem value="user" label="User">

To give `create` permissions to another user, add it to the `users` array:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "register": {
      "roles": ["my-blueprint-moderator", "Admin"],
      // highlight-next-line
      "users": ["my-user@example.com"], // added my-user@example.com
      "teams": [],
      "ownedByTeam": false
    }
  }
}
```

</TabItem>

<TabItem value="team" label="Team">

To give `create` permissions to another team, add it to the `teams` array:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "register": {
      "roles": ["my-blueprint-moderator", "Admin"],
      "users": [],
      // highlight-next-line
      "teams": ["my-team"], // added my-team
      "ownedByTeam": false
    }
  }
}
```

</TabItem>

<TabItem value="ownership" label="Ownership">

<OwnershipTemplate />

To give `create` permissions to members of the owning team of an entity, change the `ownedByTeam` key:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "register": {
      "roles": ["my-blueprint-moderator", "Admin"],
      "users": [],
      "teams": [],
      // highlight-next-line
      "ownedByTeam": true // changed from false
    }
  }
}
```

:::tip
In the context of the `create` permission, owned by team means that a user can only create a new entity if he assigns to it a team that he is a member of.
:::

</TabItem>

</Tabs>

</TabItem>

<TabItem value="update" label="Update">

To assign permissions to update an entity, give the desired persona permissions under the `update` object as shown below:

<Tabs groupId="target" defaultValue="role">

<TabItem value="role" label="Role">

To give `update` permissions to another role, add it to the `roles` array:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "update": {
      // highlight-next-line
      "roles": ["my-blueprint-moderator", "Admin", "my-role"], // added my-role
      "users": [],
      "teams": [],
      "ownedByTeam": false
    }
  }
}
```

</TabItem>

<TabItem value="user" label="User">

To give `update` permissions to another user, add it to the `users` array:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "update": {
      "roles": ["my-blueprint-moderator", "Admin"],
      // highlight-next-line
      "users": ["my-user@example.com"], // added my-user@example.com
      "teams": [],
      "ownedByTeam": false
    }
  }
}
```

</TabItem>

<TabItem value="team" label="Team">

To give `update` permissions to another team, add it to the `teams` array:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "update": {
      "roles": ["my-blueprint-moderator", "Admin"],
      "users": [],
      // highlight-next-line
      "teams": ["my-team"], // added my-team
      "ownedByTeam": false
    }
  }
}
```

</TabItem>

<TabItem value="ownership" label="Ownership">

<OwnershipTemplate />

To give `update` permissions to members of the owning team of an entity, change the `ownedByTeam` key:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "update": {
      "roles": ["my-blueprint-moderator", "Admin"],
      "users": [],
      "teams": [],
      // highlight-next-line
      "ownedByTeam": true // changed from false
    }
  }
}
```

</TabItem>

</Tabs>

</TabItem>

<TabItem value="delete" label="Delete (unregister)">

To assign permissions to delete an entity, give the desired persona permissions under the `delete` object as shown below:

<Tabs groupId="target" default ="role">

<TabItem value="role" label="Role">

To give `delete` permissions to another role, add it to the `roles` array:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "unregister": {
      // highlight-next-line
      "roles": ["my-blueprint-moderator", "Admin", "my-role"], // added my-role
      "users": [],
      "teams": [],
      "ownedByTeam": false
    }
  }
}
```

</TabItem>

<TabItem value="user" label="User">

To give `delete` permissions to another user, add it to the `users` array:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "unregister": {
      "roles": ["my-blueprint-moderator", "Admin"],
      // highlight-next-line
      "users": ["my-user@example.com"], // added my-user@example.com
      "teams": [],
      "ownedByTeam": false
    }
  }
}
```

</TabItem>

<TabItem value="team" label="Team">

To give `delete` permissions to another team, add it to the `teams` array:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "unregister": {
      "roles": ["my-blueprint-moderator", "Admin"],
      "users": [],
      // highlight-next-line
      "teams": ["my-team"], // added my-team
      "ownedByTeam": false
    }
  }
}
```

</TabItem>

<TabItem value="ownership" label="Ownership">

<OwnershipTemplate />

To give `delete` permissions to members of the owning team of an entity, change the `ownedByTeam` key:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "unregister": {
      "roles": ["my-blueprint-moderator", "Admin"],
      "users": [],
      "teams": [],
      // highlight-next-line
      "ownedByTeam": true // changed from false
    }
  }
}
```

</TabItem>

</Tabs>

</TabItem>

</Tabs>

## Set *granular* access controls to catalog data

It is possible to assign more granular permissions controls on **entities**, allowing you to prevent users from editing certain properties or relations.

<Tabs groupId="permission" defaultValue="updateProp">

<TabItem value="updateProp" label="Update specific property">

To assign permissions to update a specific entity property, give the desired persona permissions under the `updateProperties -> propertyName` object as shown below:

<Tabs groupId="target" defaultValue="role">

<TabItem value="role" label="Role">

To give property `update` permissions to another role, add it to the `roles` array:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "updateProperties": {
      "myProperty": {
        // highlight-next-line
        "roles": ["my-blueprint-moderator", "Admin", "my-role"], // added my-role
        "users": [],
        "teams": [],
        "ownedByTeam": false
      }
    }
  }
}
```

</TabItem>

<TabItem value="user" label="User">

To give property `update` permissions to another user, add it to the `users` array:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "updateProperties": {
      "myProperty": {
        "roles": ["my-blueprint-moderator", "Admin"],
        // highlight-next-line
        "users": ["my-user@example.com"], // added my-user@example.com
        "teams": [],
        "ownedByTeam": false
      }
    }
  }
}
```

</TabItem>

<TabItem value="team" label="Team">

To give property `update` permissions to another team, add it to the `teams` array:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "updateProperties": {
      "myProperty": {
        "roles": ["my-blueprint-moderator", "Admin"],
        "users": [],
        // highlight-next-line
        "teams": ["my-team"], // added my-team
        "ownedByTeam": false
      }
    }
  }
}
```

</TabItem>

<TabItem value="ownership" label="Ownership">

<OwnershipTemplate />

To give property `update` permissions to members of the owning team of an entity, change the `ownedByTeam` key:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "updateProperties": {
      "myProperty": {
        "roles": ["my-blueprint-moderator", "Admin"],
        "users": [],
        "teams": [],
        // highlight-next-line
        "ownedByTeam": true // changed from false
      }
    }
  }
}
```

</TabItem>

</Tabs>

</TabItem>

<TabItem value="updateRel" label="Update specific relation">

To assign permissions to update a specific entity relation, give the desired persona permissions under the `updateRelations -> relationName` object as shown below:

<Tabs groupId="target" defaultValue="role">

<TabItem value="role" label="Role">

To give relation `update` permissions to another role, add it to the `roles` array:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "updateRelations": {
      "myRelation": {
        // highlight-next-line
        "roles": ["my-blueprint-moderator", "Admin", "my-role"], // added my-role
        "users": [],
        "teams": [],
        "ownedByTeam": false
      }
    }
  }
}
```

</TabItem>

<TabItem value="user" label="User">

To give relation `update` permissions to another user, add it to the `users` array:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "updateRelations": {
      "myRelation": {
        "roles": ["my-blueprint-moderator", "Admin"],
        // highlight-next-line
        "users": ["my-user@example.com"], // added my-user@example.com
        "teams": [],
        "ownedByTeam": false
      }
    }
  }
}
```

</TabItem>

<TabItem value="team" label="Team">

To give relation `update` permissions to another team, add it to the `teams` array:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "updateRelations": {
      "myRelation": {
        "roles": ["my-blueprint-moderator", "Admin"],
        "users": [],
        // highlight-next-line
        "teams": ["my-team"], // added my-team
        "ownedByTeam": false
      }
    }
  }
}
```

</TabItem>

<TabItem value="ownership" label="Ownership">

<OwnershipTemplate />

To give relation `update` permissions to members of the owning team of an entity, change the `ownedByTeam` key:

```json showLineNumbers
{
  "entities": {
    ... other permissions
    "updateRelations": {
      "myRelation": {
        "roles": ["my-blueprint-moderator", "Admin"],
        "users": [],
        "teams": [],
        // highlight-next-line
        "ownedByTeam": true // changed from false
      }
    }
  }
}
```

</TabItem>

</Tabs>

</TabItem>

</Tabs>

## Software catalog RBAC examples

Refer to the [examples](./examples.md) page for practical examples of Port's RBAC.

## FAQ

Since the catalog RBAC can be very granular, in some instances it might not be perfectly clear what the resulting assigned permissions would do, this part aims to provide some real-world examples and the behavior of Port's RBAC in those instances.

### What happens if a user lacks the permissions to edit a required property of the blueprint?

In this case the user will not be able to register or update entities as a whole because they can't provide a value for the required property.

### What happens if the `ownedByTeam` setting is enabled for entity registration, but the user can't edit the `team` property?

In this case the user will not be able to register a new entity since they can't select a value for the entity's team field and mark it as owned by their team.
