---
title: "Self-serve SSO setup"
sidebar_position: 1
description: Set up SSO for your organization directly from the portal
---

# Self-serve SSO

Port allows company admins to configure SSO (Single Sign-On) directly from the portal.  
This self-serve flow guides you through connecting your identity provider (IdP) to Port.

## Prerequisites

- This feature is available for **enterprise accounts** only.
- Your account must have migrated to [multi-organization](/sso-rbac/multi-organization).
- You must be a **company admin** to configure SSO.
- You need access to your identity provider's admin console to create and configure applications.

## Setup

Let's configure SSO for your company:

### Step 1: Initiate the SSO setup

1. Go to the [Builder page](https://app.getport.io/settings/data-model) of your portal.
2. Click on **Organization settings** in the left sidebar.
3. Navigate to the **SSO** tab.
4. Click the **Setup SSO Connection** button.

:::info URL validity
A unique SSO setup link will be generated for you, it will be valid for 5 hours after you first open it, or 5 days if you don't open it. You can copy and save the link to complete the setup later.
:::

### Step 2: Configure your identity provider

After clicking the setup button, you will be guided to configure the SSO connection. The following identity providers are supported:

- Okta
- Entra ID
- Keycloak
- ADFS
- Google Workspace
- PingFederate
- [Custom SAML](/sso-rbac/sso/sso-providers/saml/)
- [Custom OIDC](/sso-rbac/sso/sso-providers/oidc/)

Complete the configuration in your identity provider's admin console following the on-screen instructions.

### Step 3: Monitor the connection status

While configuring your IdP, the Port UI displays the current status of your SSO connection:

| Status indicator | Description |
| :----------------: | ----------- |
| <img src="/img/sso/self-serve/sso-status-pending.png" width="50px" border='1px' style={{borderRadius:'6px'}}/> | The setup process is in progress or hasn't been verified yet. |
| <img src="/img/sso/self-serve/sso-status-success.png" width="50px" border='1px' style={{borderRadius:'6px'}}/> | The SSO connection was successfully created and verified. |
| <img src="/img/sso/self-serve/sso-status-failed.png" width="50px" border='1px' style={{borderRadius:'6px'}}/> | The SSO connection setup failed. See the [troubleshooting](#troubleshooting) section below for resolution options. |

Once you have completed the configuration in your identity provider, click the **Setup is Done** button in Port to indicate that the process is finished.

### Step 4: Finalize your SSO settings

After the SSO connection is successfully established, you can configure the following options:

<img src="/img/sso/self-serve/sso-connection-ready.png" width="50%" border='1px' style={{borderRadius:'6px'}}/>

1. **Set group filters** - Click `Set Group Filters` to control which IdP groups sync into Port teams. You can use regular expressions (RegEx) to define allowed and blocked group patterns.

   :::info Group filter playground
   The group filter configuration in Port is a playground for testing your RegEx patterns. It does not modify the actual groups in your IdP - group management should always be done in your identity provider's admin console. Groups that are already synced to Port will appear by default in the playground, allowing you to test how your filters would affect them.
   :::

2. **Block social login for domains** - Your configured domains are displayed here. You can toggle social login blocking per domain. When enabled for a domain, users with email addresses from that domain must sign in through your SSO provider and cannot use social login methods (such as Google or GitHub sign-in). To add more domains, use `Edit Connection`.

3. **Session settings** - Click `Session Settings` to configure session timeout settings for your SSO users. You can set the following:
   - **Max session TTL** - The maximum session duration in minutes.
   - **Idle session TTL** - The idle timeout duration in minutes before a session expires due to inactivity.

4. **Edit connection** - Click `Edit Connection` to open the Auth0 management interface where you can modify your SSO configuration, including adding or managing domains associated with your SSO connection.

:::info Organization-level setting
The SSO configuration and access settings apply at the organization level, not the company level.
:::

## Limitations

- Terraform is not supported for self-serve SSO setup.

## Troubleshooting

If you click **Setup is Done** and encounter an error, use the following table to identify and resolve the issue:

| Error | Cause | Resolution |
| ----- | ----- | ---------- |
| Connection not created | The SSO connection was not created successfully. | Click **Start Again** to generate a new setup URL and repeat the configuration process. |
| Mapping failed | The connection mapping failed. | Click **Edit Connection** to review and fix the configuration. |
| Linking failed | The SSO provider is connected, but linking to the company in Port failed. | Contact [Port's support team](http://support.port.io/) for assistance. |

## FAQ

<details>
<summary><b>Can we use multiple SSO providers (e.g., Okta and Azure)? (click to expand)</b></summary>

No. Port supports only one SSO provider per company at a time.

</details>

<details>
<summary><b>How do we switch providers (e.g., from Okta to Azure)? (click to expand)</b></summary>

You need to **delete** the existing connection and start the setup process from the beginning. There is no migration path between SSO providers.

</details>

<details>
<summary><b>Can clients rotate (update) the SSO secret via API? (click to expand)</b></summary>

No, you should rotate the SSO secret via the Auth0 UI. Port can provide the link to the Auth0 UI via API, but the actual rotation must be done in Auth0's interface.
<!-- TODO: which path is this? -->
</details>

<details>
<summary><b>Does the Okta setup include SCIM? Will it work? (click to expand)</b></summary>

Not until the company is set as SCIM enabled. Contact [Port's support team](http://support.port.io/) to enable SCIM for your organization.

</details>

<details>
<summary><b>Does self-serve SSO support all protocols? (click to expand)</b></summary>

No. OIDC and SAML are supported. For LDAP, refer to the [LDAP documentation](/sso-rbac/sso/sso-providers/ldap/) for manual setup.

</details>

<details>
<summary><b>Is the manual creation flow still available? (click to expand)</b></summary>

Yes. You can still request manual SSO setup by contacting [Port's support team](http://support.port.io/).

<!-- TODO: ask Naama, if this is still possible, if we remove the SSO providers section, they will find it hard to do it without them. -->
</details>
