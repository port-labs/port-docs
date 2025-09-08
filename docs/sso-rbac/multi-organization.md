---
sidebar_position: 3
---

# Multi-organization support

Port's multi-organization feature introduces a multi-organization model inside Port, where a single user can seamlessly move between different organizations without needing separate logins. This capability lets companies create multiple organizations, and make it easier to onboard users.

:::info Feature availability
The **multi-organization feature** is available on request and must be enabled by Port support.  
To group existing organizations under one account, customers need to provide Port with the relevant `OrgIDs` and the SSO connection to use.
:::

## What is multi-organization?

Multi-organization within Port means that users can belong to more than one organization simultaneously, for example, prod and dev. This enables:

- **Cross-organization access**: Users can work across multiple organizations without needing separate accounts.
- **Seamless switching**: Switch between organizations using the [UI](#switch-organization).
- **Unified identity**: Maintain a single identity while accessing multiple organizational contexts.

## Key features

### Switch organization

To add an organization:  
(TODO: make sure what are the steps here)

1. Go to your [Port application](https://app.port.io).
2. Click on the logo in the top left corner of the page.
3. Click on the organization you want to switch to.

:::info Login behavior
Note that when users log in, they automatically access their **last visited** organization.
:::

### User lifecycle status

A new `staged` user status has been introduced for better user lifecycle management:

- `Staged`: User exists but hasn't been invited by email.
- `Active`: User has logged into Port and can use the portal normally.
- `Invited`: User was invited to Port via an invitation email.
- `Disabled`: User is disabled and cannot use Port.

:::info Migration required
The Auth0 logic that automatically made `Disabled` statuses `Active` on SSO login has been removed. Customers currently using the `Disabled` status will need to migrate to the `Staged` status.
:::

### Automatic user access

Automatic user access makes it easy to onboard large groups of users:

- Organization admins can mark an organization as publicly accessible to SSO users.
- When users log in via SSO, they automatically get the default `member` role in the organizations.

To enable automatic user access:  
(TODO: make sure what are the steps here)

1. Navigate to the organization settings.
2. Enable "Automatic user access" for the organization.
3. `Save` settings.

### SCIM support

SCIM (System for Cross-domain Identity Management) will be supported to:

- Ingest users and teams.
- Manage user and team memberships.
- Delete users and teams.

This ensures seamless integration with existing identity management systems.