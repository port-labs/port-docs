# Set Catalog RBAC 🔐

Port provides granular control to make sure every user sees only the parts of the catalog that are relevant for them.

## Use cases 💡

Catalog RBAC allows admins to finely control which users have access to which information from the catalog, for example:

- Show a developer only the services that they owns;
- Allow a user to edit just a specific property on an entity;
- Create a fully read-only view for a developer;
- etc.

## Examples

Refer to the [examples](./examples.md) page for practical examples of Port's RBAC.

## UI behavior

User permissions will be reflected in the interface presented to users. The UI also includes indication messages when trying to perform changes. For example:

The `register` and `unregister` buttons will be disabled in the UI, in accordance with the blueprint permissions (unauthorized users/groups will not be able to register or unregister entities).

![Create button disabled without permissions](../../../static/img/software-catalog/role-based-access-control/permissions/memberNoCreatePermission.png)

The `edit property` button will be disabled according to the permissions:

![Edit property disabled without permissions](../../../static/img/software-catalog/role-based-access-control/permissions/memberNoEditPermission.png)

Immutable properties (restricted properties) will be hidden from users when modifying entities.
