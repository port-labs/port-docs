---
title: "Self-serve SSO setup"
sidebar_position: 1
description: Set up SSO for your organization without contacting Port support
---

# Self-serve SSO setup

Port allows company admins to configure SSO (Single Sign-On) directly from the portal.  
This self-serve flow guides you through connecting your identity provider (IdP) to Port.

## Prerequisites

- This feature is available for **enterprise accounts** only.
- You must be a **company admin** to configure SSO.
- You need access to your identity provider's admin console to create and configure applications.

## Set up SSO

Follow these steps to configure SSO for your organization:

### Step 1: Initiate the SSO setup

1. Go to the [Builder page](https://app.getport.io/settings) of your portal.
2. Click on **Organization settings** in the left sidebar.
3. Navigate to the **SSO** tab.
4. Click the **Setup SSO Connection** button.

:::info URL validity
A unique setup URL will be generated for you, it will be valid for 5 hours after you first open it, or 5 days if you don't open it. You can copy and save the link to complete the setup later.
:::

### Step 2: Configure your identity provider

After clicking the setup button, you will be guided to configure the SSO connection using one of the following options:

- **Pre-configured identity providers** - Select from popular IdPs such as Okta, Azure AD, Google Workspace, and others.
- **Custom SAML** - Configure a custom SAML 2.0 connection for any SAML-compatible identity provider. Refer to the [SAML documentation](/sso-rbac/sso/sso-providers/saml/saml) for more details.
- **Custom OIDC** - Configure a custom OpenID Connect connection for any OIDC-compatible identity provider. Refer to the [OIDC documentation](/sso-rbac/sso/sso-providers/oidc/oidc) for more details.

Follow the instructions to complete the configuration in your identity provider's admin console.

### Step 3: Monitor the connection status

While configuring your IdP, the Port UI displays the current status of your SSO connection:

| Status indicator | Description |
| :----------------: | ----------- |
| <img src="/img/sso/self-serve/sso-status-pending.png" width="50px" border='1px' style={{borderRadius:'6px'}}/> | The setup process is in progress or hasn't been verified yet. |
| <img src="/img/sso/self-serve/sso-status-success.png" width="50px" border='1px' style={{borderRadius:'6px'}}/> | The SSO connection was successfully created and verified. |
| <img src="/img/sso/self-serve/sso-status-failed.png" width="50px" border='1px' style={{borderRadius:'6px'}}/> | The SSO connection setup failed. See the [troubleshooting](#troubleshooting) section below for resolution options. |

Once you have completed the configuration in your identity provider, click the button in Port to indicate that the process is finished.

### Step 4: Finalize your SSO settings

After the SSO connection is successfully established:

1. **Block social logins** (optional) - You can choose to block social login methods (such as Google or GitHub sign-in) and require all users to authenticate through your SSO provider. This setting is reversible.

2. **Access tab enabled** - Once SSO is configured, the **Access** tab becomes available in your organization settings. This allows you to manage SSO-related access controls for your organization.

:::info Organization-level setting
The SSO configuration and access settings apply at the organization level, not the company level.
:::

## Troubleshooting

If you click **Setup is Done** and encounter an error, use the following table to identify and resolve the issue:

| Error | Cause | Resolution |
| ----- | ----- | ---------- |
| Connection not created | The SSO connection was not created in Auth0. | Click **Start Again** to generate a new setup URL and repeat the configuration process. |
| Mapping failed | The mapping between Auth0 and Port failed. | Click **Edit Connection** to review and fix the configuration. |
| Linking failed | Auth0 is connected, but linking to the company in Port failed. | Contact [Port's support team](https://www.getport.io/community) for assistance. |
