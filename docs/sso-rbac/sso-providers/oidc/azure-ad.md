---
title: "Microsoft Entra ID (AzureAD)"
sidebar_position: 1
description: Integrate AzureAD with Port using OIDC
---

import ScimFunctionality from "/docs/sso-rbac/sso-providers/\_scim_functionality_list.mdx"
import ScimLimitation from "/docs/sso-rbac/sso-providers/oidc/\_scim_oidc_limitation.mdx"
import SSOEndpoints from "/docs/generalTemplates/_sso_auth0_endpoints.md"

# How to configure AzureAD

This guide demonstrates how to configure Single Sign-On (SSO) integration between Port and Microsoft Entra ID (AzureAD) using OIDC.

Once implemented:
- Users can connect to Port via an AzureAD app
- AzureAD teams will be automatically synced with Port upon user sign-in
- You can set granular permissions in Port according to your AzureAD groups

## Prerequisites

Before starting the configuration, ensure you have:

- Access to the Microsoft Azure Portal with permissions to create and configure applications
- Users who need access to Port must have a valid value in their `Email` field in Azure AD
- Contact information ready to share with Port support team for the final configuration steps

To complete the process you will need to contact us to receive the information you require, as well as provide Port with specific application details outlined in this guide.

## Register a new application

<h3> Create the application registration</h3>

1. In the Microsoft Azure Portal, go to `Azure Active Directory`.
2. Click on `App registrations`.

   <img src="/img/sso/azure-ad/AzureADNavBar.png" width="30%" border="1px" />

3. Click on `New registration` at the top of the page

   <img src="/img/sso/azure-ad/AzureNewRegistration.png" width="100%" border="1px" />

4. Define the Port application settings:

   4.1 **Name**: Insert a friendly name for the Port app, like `Port`.

   4.2 **Supported account types**: Please select the option that is appropriate for your organization.

   For most use cases this would be **Accounts in this organizational directory only (Default Directory only - Single tenant)**.

   4.3 **Redirect URI**:
     - Set `Platform` to `Web`
     - Set `URL` to `https://auth.getport.io/login/callback`

       <img src="/img/sso/azure-ad/ApplicationRegistrationForm.png" width="80%" border="1px" />
     

   4.4 Click `Register`.

<h3> Configure authentication settings</h3>

1. On the new Port App page, click `Authentication`.

   <img src="/img/sso/azure-ad/AzureAppNavAuthentication.png" width="40%" border="1px" />

2. Add the **Front-channel logout URL**: paste the following URL:

   ```text showLineNumbers
   https://auth.getport.io/logout
   ```

   Adding the front-channel logout URL will enable single sign-out, meaning when a user logs out from Port, it also logs them out from their identity provider.

   <img src="/img/sso/azure-ad/AzureAppAuthenticationForm.png" width="100%" border="1px" />

3. Click `Save`.

## Configure application branding

1. On the new Port App page, click `Branding & Properties`.

   <img src="/img/sso/azure-ad/AzureAppNavBranding.png" width="30%" border="1px" />

2. Configure the following settings:

   2.1 **Home page URL**: paste the following URL:

   <SSOEndpoints/>

   We will provide your `{CONNECTION_NAME}` (Contact us using chat/Slack/mail to [support@getport.io](mailto:support@getport.io)).

   2.2 **Add the Port logo** (optional):

   <img src="/img/sso/general-assets/PortLogo.png" width="10%" border="1px" />

   2.3 **Publisher domain**: Select the domain matching your user emails (for example `getport.io`).

   <img src="/img/sso/azure-ad/AzureAppBrandingForm.png" width="100%" border="1px" />

3. Click `Save`.

## Set up application permissions

<h3> Add required permissions</h3>

1. On the Port App page, click `API Permissions`.

   <img src="/img/sso/azure-ad/AzureAppNavAPI.png" width="30%" border="1px" />

2. Click `Add a permission`.

   <img src="/img/sso/azure-ad/AzureAppAPIPermissions.png" width="90%" border="1px" />

3. On the `Microsoft APIs` tab:

   3.1 Click on `Microsoft Graph`.

   <img src="/img/sso/azure-ad/AzureAppMicrosoftGraph.png" width="90%" border="1px" />

   3.2 Click on `Delegate Permissions`.

   <img src="/img/sso/azure-ad/AzureAppAPIdelegatePermissions.png" width="100%" border="1px" />

   3.3 Search and mark the following permissions:
   - `email`, `openid`, `profile`, `User.read`

   If you wish to pull in AzureAD groups into Port, you will also need to add the `Directory.Read.All` permission. See [Permissions required to pull AzureAD groups to Port](#enable-azuread-groups-integration).

   <img src="/img/sso/azure-ad/AzureAppAPIPermissionsSettings.png" width="100%" border="1px" />

   3.4 Click `Add permissions`.

   :::info Grant admin consent
   (OPTIONAL) `Grant admin consent`: when users from your organization will first log in, they will be prompted to confirm the permissions specified here. You can click the `Grant admin consent for Default Directory` to automatically approve their permissions.
   :::



## Configure application claims

<h3> Add optional claims</h3>

1. On the Port App page, click `Token configuration`.

   <img src="/img/sso/azure-ad/AzureAppTokenConfigurationTab.png" width="30%" border="1px" />

2. Click `Add optional claim`.

   <img src="/img/sso/azure-ad/AzureAppAddToken.png" width="100%" border="1px" />

3. Select `ID` as the token type and then select the `email` claim, then click `Add`.

   <img src="/img/sso/azure-ad/AzureAppAddingClaims.png" width="60%" border="1px" />

   Repeat the same process for `Access` and `SAML` (3 times total).

4. Your optional claims will look like this:

   <img src="/img/sso/azure-ad/AzureAppPermissionsFinal.png" width="100%" border="1px" />

## Generate application secret

<h3> Create client secret</h3>

1. On the Port App page, click `Certificates & Secrets`.

   <img src="/img/sso/azure-ad/AzureAppCertificationsSecretsNav.png" width="30%" border="1px" />

2. On the `Client secrets` tab, click the `New client secret` button.

   <img src="/img/sso/azure-ad/AzureAppClientSecrets.png" width="90%" border="1px" />

3. Configure the secret:

   3.1 **Description**: Enter a secret description, for example `Port Login Client Secret`.

   3.2 **Expires**: Select when the secret expires.

   **Important**: Be sure to mark on your calendar the expiration date of the secret. The secret needs to be replaced before its expiration, otherwise login to Port will be disabled.

   3.3 Click `Add`.

4. **Copy the secret immediately**: A secret will be created and its Value will appear as shown in the image below. Document the secret's value immediately because it will never appear again after you leave this page.

   <img src="/img/sso/azure-ad/AzureAppSecret.png" width="100%" border="1px" />

## Provide application information to Port

Port needs the following information to complete the integration:

- The `Client Secret` value that you created in the previous step
- The `Application (Client) ID`, which appears on the Port application overview page:

<img src="/img/sso/azure-ad/AzureAppDetailsSection.png" width="100%" border="1px" />

Port will provide you the `CONNECTION_NAME` needed for the homepage URL of the App.

## Distribute the application to users

<h3> Assign users and groups</h3>

After the app setup is complete, you can assign it to your organization's users and groups:

1. Go to `Azure Active Directory`.

2. Go to `Enterprise Applications`.

   <img src="/img/sso/azure-ad/AzureAppEnterpriseNav.png" width="30%" border="1px" />

3. Click on the Port app.

   <img src="/img/sso/azure-ad/AzurePortApp.png" width="100%" border="1px" />

4. Click on `Users and Groups`.

   <img src="/img/sso/azure-ad/AzureAppUserGroupsNav.png" width="50%" border="1px" />

5. Click `Add user/group`.

   <img src="/img/sso/azure-ad/AzureAddUserGroupButton.png" width="100%" border="1px" />

6. Select users and groups you want to grant access to Port, then click `Assign`.

<h3> Make the application visible</h3>

1. Go to `Azure Active Directory` > `Enterprise Applications` > Port app.

2. Click on `Properties`.

   <img src="/img/sso/azure-ad/AzureAppProperties.png" width="40%" border="1px" />

3. Set the application properties:
   - Mark `Enabled for users to sign-in?` as `Yes`
   - Mark `Visible to users?` as `Yes`

   By default the `Assignment required?` flag is set to `No`, meaning any user with the Homepage URL to the Port app can access it, even if the app isn't directly assigned to them. Changing the flag to `Yes` means only users and groups the app is directly assigned to can use and access it.

   <img src="/img/sso/azure-ad/AzureAppPropertiesValues.png" width="100%" border="1px" />

4. You should see the Port app on the [https://myapplications.microsoft.com](https://myapplications.microsoft.com) dashboard:

   <img src="/img/sso/azure-ad/AzureDashboardWithPort.png" width="100%" border="1px" />

Users can also manually access Port by going to the App Homepage URL.

## Multiple Azure AD SSO connections

If you have multiple Port environments, it is possible to setup an OIDC Azure AD SSO connection for each environment.

However, note that in this instance you **will not** be able to use Port's main login page to reliably sign in to a specific environment. When you enter your email address to login, it will take you to one of your Port environments but it is not guaranteed to take you to the same Port environment every time.

In that case you have the following options:

- Use the [https://myapplications.microsoft.com](https://myapplications.microsoft.com) dashboard provided by Azure AD and select the desired Port environment to connect to
- Use the manual login URL for each environment directly, by specifying the desired environment based on its respective `CONNECTION_NAME` value

## Enable AzureAD groups integration

Port can query the group membership of users who log in through the AzureAD SSO, and add their teams as team entities inside Port. This allows platform engineers to take advantage of both existing groups from AzureAD and teams created manually inside Port to manage permissions and access to resources inside Port's catalog.

**Important**: In order to import Azure AD groups into Port, Port will require the connection app to approve the `Directory.Read.All` permission.

## SCIM Configuration (beta)

<ScimLimitation/>

Entra ID (AzureAD) OIDC applications support [SCIM](https://auth0.com/docs/authenticate/protocols/scim).

<ScimFunctionality/>

<h3> Set up SCIM </h3>

To set up SCIM for Entra ID OIDC based applications, contact Port's support team.

You will be provided with:

- An SCIM `endpoint`
- An SCIM `token`

The `endpoint` and `token` will be used to set up the SCIM integration in your identity provider.

After receiving the SCIM `endpoint` and `token`, follow this [step-by-step guide](https://auth0.com/docs/authenticate/protocols/scim/inbound-scim-for-new-azure-ad-connections#configure-scim-in-azure-ad-for-oidc-apps) to enable SCIM. Begin in step 3, by registering a new application.
