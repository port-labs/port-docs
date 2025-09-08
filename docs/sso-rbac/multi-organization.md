---
sidebar_position: 3
---

# Multi-organization support

Port's multi-organization feature introduces a multi-organization model inside Port, where a single user can seamlessly move between different organizations without needing separate logins.
This capability enables better organizational structure management, improved access control across different environments or business units, and streamlined user onboarding.

:::info Feature availability
The **multi-org feature** is available on request and can be enabled only by contacting Port support.
:::

## What is multi-organization?

Multi-organization within Port means that users can belong to more than one organization simultaneously.  
This enables:

- **Cross-organization access**: Users can work across multiple organizations without needing separate accounts.
- **Seamless switching**: Switch between organizations using the [UI](#switch-organization).
- **Unified identity**: Maintain a single identity while accessing multiple organizational contexts.

## Key features

### Switch organization

To add an organization:

1. Go to your [Port application](https://app.port.io).
2. Click on the logo in the top left corner of the page.
3. Choose the organization you want to switch to.

:::info Login behavior
Note that when users log in, they automatically access their last visited organization.
:::

### User lifecycle status

A new `staged` user status has been introduced for better user lifecycle management:

- `Staged`: User exists but hasn't been invited by email.
- `Active`: User has logged into Port and can use the portal normally.
- `Invited`: User was invited to Port via an invitation email.
- `Disabled`: User is disabled and cannot use Port.

:::info Migration required
The Auth0 logic that automatically made `Disabled` statuses `Active` on SSO login has been removed. Customers currently misusing the `Disabled` status will need to migrate to `Staged` status.
:::

## Automatic User Access (Just-in-Time / JIT)

The Automatic User Access enables streamlined onboarding for large groups of users:

- **Organization settings**: Organization admins can mark an organization as publicly accessible to SSO users.
- **SSO login**: When users log in via SSO, they automatically gain default `Member` access to the organizations.

To enable Automatic User Access:

1. Navigate to the organization settings.
2. Enable "Automatic user access" for the organization.
3. Configure default role (typically "Member").
4. `Save` settings.

:::info Default access
Users logging in via SSO will automatically join organizations with Automatic User Access enabled, receiving the default Member role unless they already have a different role assigned.
:::

## SCIM support

SCIM (System for Cross-domain Identity Management) will be supported to:
- Ingest users and teams.
- Manage user and team memberships.
- Delete users and teams.

This ensures seamless integration with existing identity management systems.