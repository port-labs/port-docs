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

## RBAC UI indications

User permissions will be reflected in the interface presented to users. The UI also includes indication messages when trying to perform changes. For example:

The `create` and `delete` buttons will be disabled in the UI, in accordance with the blueprint permissions (unauthorized users/groups will not be able to register or unregister entities).

:::tip
When a `CREATE` self-service action is defined, the default `create` button will be replaced with the `register` button.
:::

![Create button disabled without permissions](../../../static/img/software-catalog/role-based-access-control/permissions/memberNoCreatePermission.png)

The `edit property` button will be disabled according to the permissions:

![Edit property disabled without permissions](../../../static/img/software-catalog/role-based-access-control/permissions/memberNoEditPermission.png)

Immutable properties (restricted properties) will be hidden from users when modifying entities.

## Software catalog RBAC examples

Refer to the [examples](./examples.md) page for practical examples of Port's RBAC.
