---
sidebar_position: 3
---

# Multiple organization membership

Multiple organization membership within Port means that users can belong to more than one organization simultaneously, for example, prod and dev. This enables:

- **Cross-organization access**: Users can work across multiple organizations without needing separate accounts.
- **Seamless switching**: Switch between organizations using the [UI](#switch-organization).

:::info Feature availability
The **multi-organization feature** is available on request and must be enabled by Port's support team.  
To group existing organizations under one account, customers need to provide Port with the relevant `OrgIDs` and the SSO connection to use.  
Organizations can be grouped only if they are in the same region.
:::

## Add organizations

As an `account admin` of a paid account, you can create new organizations directly from the UI using the `+ Create new organization` button.
If you wish to grant `account admin` permissions to another user, please contact Port's support team.

## Switch organizations

In order to switch to a different organization:  

1. Go to your [Port application](https://app.port.io).
2. Click on the logo in the top left corner of the page.
3. Click on the organization you want to switch to.

:::info Login behavior
Note that when users log in, they automatically access their **last visited** organization.
:::

## Automatic user access

Automatic user access makes it easy to onboard large groups of users:

- Account admins can mark an organization as publicly accessible to SSO users.
- When users log in via SSO, they automatically get the default `member` role in the organizations.

To enable automatic user access:  

1. Go to the [Builder page](https://app.getport.io/settings/data-model) of your portal.
2. Click on `Organization settings` in the sidebar.
3. Enable the "Automatic user access" for the organization.
4. Click `Save`.

## SSO access to organizations

When users connect with SSO, their access is determined by:

- **Explicit invitations**: Organizations where the user has been explicitly invited.
- **Automatic user access**: Organizations that have "Automatic User Access" enabled.

On login, Port checks which organizations the user has been explicitly invited to, plus which organizations have automatic user access enabled, and grants access to those organizations only.