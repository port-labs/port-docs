---
title: "Microsoft Entra ID (AzureAD)"
sidebar_position: 1
description: Integrate AzureAD with Port
---

import ScimFunctionality from "/docs/sso-rbac/sso-providers/\_scim_functionality_list.mdx"
import ScimLimitation from "/docs/sso-rbac/sso-providers/oidc/\_scim_oidc_limitation.mdx"
import SSOEndpoints from "/docs/generalTemplates/_sso_auth0_endpoints.md"

# How to configure AzureAD

Follow this step-by-step guide to configure the integration between Port and Azure Active Directory.

:::info
In order to complete the process you will need to contact us to receive the information you require, as well as the [information Port requires from you](https://docs.port.io/sso-rbac/sso-providers/oidc/azure-ad#step-6-providing-the-application-information-to-port). Read below for more information.

:::

## Port-AzureAd integration benefits

- Connect to the Port application via an AzureAD app.
- Your AzureAD teams will be automatically synced with Port upon a user sign-in.
- Set granular permissions on Port according to your AzureAD groups.

## How to configure a Port application in Azure AD

:::info

**Prerequisites**

To make the **Port** app connection work, users who have access need to have a legal value in their `Email` field in Azure AD.

:::

### Step #1: Register a new application

1. In the Microsoft Azure Portal, go to `Azure Active Directory`.
2. Click on `App registrations`.

   ![AzureAD new application wizard](/img/sso/azure-ad/AzureADNavBar.png)

3. Click on `New registration` at the top of the page

   ![AzureAD new application wizard](/img/sso/azure-ad/AzureNewRegistration.png)

4. Define the Port application settings:

   4.1 `Name`: Insert a friendly name for the Port app, like `Port`.

   4.2 `Supported account types`: Please select the option that is appropriate for your organization.

   :::note
   For most use cases this would be **Accounts in this organizational directory only (Default Directory only - Single tenant)**.
   :::

   4.3 `Redirect URI`:

   - Set `Platform` to `Web`.
   - Set `URL` to `https://auth.getport.io/login/callback`.

   ![AzureAD new application wizard](/img/sso/azure-ad/ApplicationRegistrationForm.png)

   4.4 Click `Register`.

   4.5 On the new Port App page, click `Authentication`.

   ![Azure navigation bar authentication](/img/sso/azure-ad/AzureAppNavAuthentication.png)

   4.6 `Front-channel logout URL`: paste the following URL:

   ```text showLineNumbers
   https://auth.getport.io/logout
   ```

   :::tip single sign-out
   Adding the front-channel logout URL will enable single sign-out, meaning when a user logs our from Port, it also logs him out from his identity provider.
   :::

   ![Azure app authentication form](/img/sso/azure-ad/AzureAppAuthenticationForm.png)

   4.7 Click `Save`.

### Step #2: Customize your Port app with Login URL and Logo

1.  On the new Port App page, click `Branding & Properties`.

    ![Azure navigation bar Branding and Properties](/img/sso/azure-ad/AzureAppNavBranding.png)

    1.1 `Home page URL`: paste the following URL:

    <SSOEndpoints/>

    :::note
    We will provide your `{CONNECTION_NAME}` (Contact us using chat/Slack/mail to [support@getport.io](mailto:support@getport.io)).
    :::

    1.2 Add the Port logo (optional):

    ![Port's logo](/img/sso/general-assets/PortLogo.png)

    1.3 `Publisher domain`: Select the domain matching **your** user emails (for example `getport.io`).

    ![Azure app branding form](/img/sso/azure-ad/AzureAppBrandingForm.png)

    1.4 Click `Save`.

### Step #3: Configuring the application permissions

1. On the Port App page, click `API Permissions`.

   ![Azure navigation bar API permissions](/img/sso/azure-ad/AzureAppNavAPI.png)

2. Click `Add a permission`:

   ![Azure navigation bar API permissions](/img/sso/azure-ad/AzureAppAPIPermissions.png)

3. On the `Microsoft APIs` tab:

   3.1 Click on `Microsoft Graph`

   ![Azure API permissions Microsoft APIs](/img/sso/azure-ad/AzureAppMicrosoftGraph.png)

   3.2 Click on `Delegate Permissions`

   ![Azure Microsoft APIs delegate permissions](/img/sso/azure-ad/AzureAppAPIdelegatePermissions.png)

   3.3 Search and mark the following permissions:

   - `email`, `openid`, `profile`, `User.read`.


   :::info AzureAD groups
   If you wish to pull in AzureAD groups into Port, you will also need to add the `Directory.Read.All` permission. See [Permissions required to pull AzureAD groups to Port](#permissions-required-to-pull-azuread-groups-to-port).
   :::

   ![Azure API set permissions](/img/sso/azure-ad/AzureAppAPIPermissionsSettings.png)

   3.4 Click `Add permissions`.

   :::note
   (OPTIONAL) `Grant admin consent`: when users from your organization will first log in, they will be prompted to confirm the permissions specified here. You can click the `Grant admin consent for Default Directory` to automatically approve their permissions.
   :::

### Step #4: Configuring the application claims

1. On the Port App page, click `Token configuration`:

   ![Azure application token configuration](/img/sso/azure-ad/AzureAppTokenConfigurationTab.png)

2. Click `Add optional claim`:

   ![Azure app token adding a claim button](/img/sso/azure-ad/AzureAppAddToken.png)

3. Select `ID` as the token type and then select the `email` claim, then click `Add`:

   ![Azure app token adding a claim](/img/sso/azure-ad/AzureAppAddingClaims.png)

   :::note
   Repeat the same process for `Access` and `SAML` (3 times total).
   :::

4. Your optional claims will look like this:

   ![Azure app permissions summary](/img/sso/azure-ad/AzureAppPermissionsFinal.png)

### Step #5: Configuring application secret

1. On the Port App page, click `Certificates & Secrets`:

   ![Azure application certification and secrets button](/img/sso/azure-ad/AzureAppCertificationsSecretsNav.png)

2. On the `Client secrets` tab, click the `New client secret` button:

   ![Azure application client secrets button](/img/sso/azure-ad/AzureAppClientSecrets.png)

   2.1 `Description`: Enter a secret description, for example `Port Login Client Secret`.

   2.2 `Expires`: Select when will the secret expires.

   :::danger
   Be sure to mark on your calendar the expiration date of the secret. The secret needs to be replaced before its expiration, otherwise login to Port will be disabled.
   :::

   2.3 Click `Add`.

   A secret will be created and its Value will appear as shown in the image below. Immediately document the secret’s value because we will need it for our next step.

   :::danger COPY YOUR SECRET NOW
   Be advised that your secret will never appear again after you leave this page.
   :::

   ![Azure application display secrets](/img/sso/azure-ad/AzureAppSecret.png)

### Step #6: Providing the application information to Port

Port needs the following information for this process:

- The `Client Secret` value that you created on [Step 5: Configuring application secret](#step-5-configuring-application-secret).
- The `Application (Client) ID`, which appears on the Port application overview page:

![Azure application display secrets](/img/sso/azure-ad/AzureAppDetailsSection.png)

:::note
**Port** will provide you the `CONNECTION_NAME` needed for the homepage URL of the App, as described on [Step 2](#step-2-customize-your-port-app-with-login-url-and-logo).
:::

### Step #7: Exposing the application to your organization

1. Assigning the App to organization users and groups

   After the app setup is complete, you can proceed to assign it to your organization’s users and groups, by distributing it in your organization:

   1.1 Go to `Azure Active Directory`.

   1.2 Go to `Enterprise Applications`:

   ![Azure AD enterprise applications](/img/sso/azure-ad/AzureAppEnterpriseNav.png)

2. Click on the Port app:

   ![Azure all application port app](/img/sso/azure-ad/AzurePortApp.png)

3. Click on `Users and Groups`:

   ![Azure AD users and groups](/img/sso/azure-ad/AzureAppUserGroupsNav.png)

4. Click `Add user/group`:

   ![Azure AD users and groups](/img/sso/azure-ad/AzureAddUserGroupButton.png)

   4.1 Select users and groups you want to grant access to Port.

   4.2 Click `Assign`.

5. Make the Port application visible on the `myapplications` page:

   5.1 Go to `Azure Active Directory`.

   5.2 Go to `Enterprise Applications`.

   5.3 Click on the Port app.

   5.4 Click on `Properties`:

   ![Azure application properties](/img/sso/azure-ad/AzureAppProperties.png)

   5.5 Set the application properties:

   - Mark `Enabled for users to sign-in?` as `Yes`.

   - Mark `Visible to users?` as `Yes`.

   :::note
   By default the `Assignment required?` flag is set to `No`, meaning any user with the Homepage URL to the Port app can access it, even if the app isn’t directly assigned to them.
   Changing the flag to `Yes` means only users and groups the app is directly assigned to can use and access it.

   :::

   ![Azure application properties form](/img/sso/azure-ad/AzureAppPropertiesValues.png)

   You should see the Port app on the [https://myapplications.microsoft.com](https://myapplications.microsoft.com) dashboard:

   ![Azure application dashboard](/img/sso/azure-ad/AzureDashboardWithPort.png)

   :::note manual URL based login
   Users can also manually access Port by going to the App Homepage URL (The URL configured in [step 1.1](#step-2-customize-your-port-app-with-login-url-and-logo) here).
   :::

:::warning Multiple Azure AD SSO connections
In case you have multiple Port environments, it is possible to setup an OIDC Azure AD SSO connection for each of those environments.

However, note that in this instance you **will not** be able to use Port's main login page to reliably sign in to a specific environment, when you enter your email address to login, it will take you to one of your Port environments but it is not guaranteed to take you to the same Port environment every time.

In that case you have the following options:

- Use the [https://myapplications.microsoft.com](https://myapplications.microsoft.com) dashboard provided by Azure AD and select the desired Port environment to connect to.
- Use the manual login URL for each environment directly, by specifying the desired environment based on its respective `CONNECTION_NAME` value
  :::

## Permissions required to pull AzureAD groups to Port

Port can query the group membership of users who log in through the AzureAD SSO, and add their teams as team entities inside Port. This allows the platform engineers to take advantage of both existing groups from AzureAD and teams created manually inside Port to manage permissions and access to resources inside Port's catalog.

**Important:** In order to import Azure AD groups into Port, Port will require the connection app to approve the `Directory.Read.All` permission

## SCIM Configuration (beta)

<ScimLimitation/>

Entra ID (AzureAD) OIDC applications support [SCIM](https://auth0.com/docs/authenticate/protocols/scim).

<ScimFunctionality/>

### Setup SCIM

To set up SCIM for Entra ID OIDC based applications, contact Port's support team.

You will be provided with:

- An SCIM `endpoint`
- An SCIM `token`

The `endpoint` and `token` will be used to set up the SCIM integration in your identity provider.

After receiving the SCIM `endpoint` and `token`, follow this [step-by-step guide](https://auth0.com/docs/authenticate/protocols/scim/inbound-scim-for-new-azure-ad-connections#configure-scim-in-azure-ad-for-oidc-apps) to enable SCIM. Begin in step 3, by registering a new application.
