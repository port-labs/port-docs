---
title: "Manage your SSO connection"
sidebar_position: 4
description: Set up and manage SSO for your organization directly from the portal
---

# Manage your SSO connection

:::info Open Beta
This feature is currently in open beta and available to all organizations.
:::

Port allows company admins to configure SSO (single sign-on) directly from the portal.  
This self-serve flow guides you through connecting your identity provider (IdP) to Port.

## Prerequisites

- This feature is available for **enterprise accounts** only.
- Your account must use the [multi-organization](/sso-rbac/multi-organization) architecture.
- You must be a **company admin** to configure SSO.
- You need access to your identity provider's admin console to create and configure applications.

## Setup

Follow these steps to configure SSO for your company:

### Step 1: Initiate the SSO setup

1. Go to the [Builder page](https://app.getport.io/settings/data-model) of your portal.
2. Click on **Organization settings** in the left sidebar.
3. Navigate to the **SSO** tab.
4. Click the **Set up SSO connection** button.

:::info URL validity
A unique SSO setup link will be generated for you, it will be valid for 5 hours after you first open it, or 5 days if you don't open it. You can copy and save the link to complete the setup later.
:::

### Step 2: Configure your identity provider

After clicking the `continue` button, you will be guided to configure the SSO connection.  
The following identity providers are supported:

- [Okta](https://www.okta.com/)
- [Entra ID](https://www.microsoft.com/en-us/security/business/identity-access/microsoft-entra-id)
- [Keycloak](https://www.keycloak.org/)
- [ADFS](https://learn.microsoft.com/en-us/windows-server/identity/active-directory-federation-services)
- [Google Workspace](https://workspace.google.com/)
- [PingFederate](https://www.pingidentity.com/en/pingone/pingfederate.html)
- Custom SAML
- Custom OIDC

The setup process is guided by Auth0's self-service assistant, which walks you through each step including creating an application in your IdP, configuring the connection, mapping claims, and testing the SSO integration. For a detailed example walkthrough of the assistant flow, see the [Auth0 Self-Service SSO documentation](https://auth0.com/docs/authenticate/enterprise-connections/self-service-SSO#example-self-service-assistant-flow).

Complete the configuration in your identity provider's admin console following the on-screen instructions.

### Step 3: Monitor the connection status

While configuring your IdP, the Port UI displays the current status of your SSO connection:

| Status indicator | Description |
| :----------------: | ----------- |
| <img src="/img/sso/self-serve/sso-not-sure.svg" width="50px"/> | The setup process is in progress or hasn't been verified yet. |
| <img src="/img/sso/self-serve/sso-success.svg" width="50px"/> | The SSO connection was successfully created and verified. |
| <img src="/img/sso/self-serve/sso-issue.svg" width="50px"/> | The SSO connection setup failed. See the [troubleshooting](#troubleshooting) section below for resolution options. |

Once you have completed the configuration in your identity provider, the window should update automatically. Otherwise click the `Setup is Done` button in Port to indicate that the process is finished.

## Manage the connection

After the SSO connection is successfully established, you can configure the following options:

<img src="/img/sso/self-serve/sso-connection-ready.png" width="50%" border='1px' style={{borderRadius:'6px'}}/>

1. **Set group filters** - Click `Set Group Filters` to control which IdP groups sync into Port teams. You can use regular expressions (RegEx) to define allowed and blocked group patterns.

   :::info Group filter playground
   The group filter configuration in Port is a playground for testing your RegEx patterns. Your patterns will be saved, but the groups themselves are not modified. Group management should always be done in your identity provider's admin console. Groups that are already synced to Port will appear by default in the playground, allowing you to test how your filters would affect them.
   :::

2. **Block social login for domains** - Your configured domains are displayed here. You can toggle social login blocking per domain. When enabled for a domain, users with email addresses from that domain must sign in through your SSO provider and cannot use social login methods (such as Google or GitHub sign-in). To add more domains, use `Edit Connection`.

3. **Session settings** - Click `Session Settings` to configure the maximum session duration (in minutes) for your SSO users.

4. **Edit connection** - Click `Edit Connection` to open the Auth0 management interface where you can modify your SSO configuration, including adding or managing domains associated with your SSO connection as well as managing the client secret.

## Limitations

- Terraform is not supported for self-serve SSO setup.

## Troubleshooting

If you encounter one of the following issues, use the table to identify and resolve it:

| Error | Cause | Resolution |
| ----- | ----- | ---------- |
| Connection not created | The SSO connection was not created in Auth0. | Click `Start Again` to generate a new setup URL and repeat the configuration process or click `Setup is Done` once you complete the process. |
| Linking failed | The SSO provider is connected, but linking to the company in Port failed. | Contact [Port's support team](http://support.port.io/) for assistance. |

## FAQs

<details>
<summary><b>Can we use multiple SSO providers? (click to expand)</b></summary>

No. Port supports only one SSO provider per company at a time.

</details>

<details>
<summary><b>How do we switch providers? (click to expand)</b></summary>

You need to **delete** the existing connection and start the setup process from the beginning. There is no migration path between SSO providers.

</details>
