---
title: Set Catalog RBAC
sidebar_label: 🔐 Set Catalog RBAC
---

# 🔐 Set Catalog RBAC

Port provides granular control to make sure every user sees only the parts of the catalog that are relevant for them.

:::tip
This section covers the software catalog section of Port's RBAC functionality, while it is not a prerequisite, it is highly recommended you also go over Port's [permission controls](../../sso-rbac/rbac/rbac.md).

In order to manage who can view which pages in Port, check out [page permissions](../../customize-pages-dashboards-and-plugins/page/tutorial.md#page-permissions).
:::

## 💡 Common Catalog RBAC usage

Catalog RBAC allows admins to finely control which users have access to which information from the catalog, for example:

- Show a developer only the services that they owns;
- Allow a user to edit just a specific property on an entity;
- Create a fully read-only view for a developer;
- etc.

## Software catalog RBAC examples

Refer to the [examples](./examples.md) page for practical examples of Port's RBAC.

## FAQ

Since the catalog RBAC can be very granular, in some instances it might not be perfectly clear what the resulting assigned permissions would do, this part aims to provide some real-world examples and the behavior of Port's RBAC in those instances:

### What happens if a user lacks the permissions to edit a required property of the blueprint?

If the user has permissions to edit any property, except for a required property of the blueprint - then the user will not be able to register or update entities as a whole because they can't provide a value for the required property;

### What happens if the `ownedByTeam` setting is enabled for entity registration, but the user can't edit the `team` property?

If the `ownedByTeam` setting is enabled for registration, and the user does not have permissions to edit the `team` property - then the user will not be able to register a new entity since they can't select a value for his team field and mark it as owned by their team.
