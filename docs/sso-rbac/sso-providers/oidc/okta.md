---
title: "Okta (OIDC)"
sidebar_position: 2
description: Integrate Okta with Port
---

import ScimFunctionality from "/docs/sso-rbac/sso-providers/_scim_functionality_list.mdx"
import ScimLimitation from "/docs/sso-rbac/sso-providers/oidc/_scim_oidc_limitation.mdx"
import SSOEndpoints from "/docs/generalTemplates/_sso_auth0_endpoints.md"
import DirectUrl from "/docs/generalTemplates/_sso_direct_url.md"

# Okta

Follow this step-by-step guide to configure the integration between Port and Okta.

:::info Contact us
In order to complete the process you will need to contact us, the exact information we need to provide, as well as the information Port requires from you is listed in this doc.
Contact us using chat/Slack/mail to [support.port.io](http://support.port.io/).
:::

## Port-Okta integration benefits

- Connect to the Port application via an Okta app.
- Your Okta teams will be synced with Port, automatically upon user sign-in.
- Set granular permissions on Port according to your Okta groups.

## How to configure the Okta app integration for Port​

### Step #1: Create a new Okta application

1. In the Admin Console, go to Applications -> Applications.
2. Click `Create App Integration`.

   <img src="/img/sso/okta/OktaCreateApp.png" width="100%" border="1px" />

3. Create an OIDC app integration. Select **OIDC - OpenID Connect** in the Wizard.

   <img src="/img/sso/okta/OktaCreateAppIntegration.png" width="100%" border="1px" />

4. Choose **Single-Page application** as your application type.

   <img src="/img/sso/okta/OktaSetAppType.png" width="100%" border="1px" />

Click `Next`.

### Step #2: Configure your Okta application

Under `General Settings`:

1. Choose an `app integration name` (a specific name that will appear on your Okta apps).

2. Under `Grant type` mark all options.

3. Under `Sign-in redirect URIs`, choose the value that matches your Port region:

   - EU organizations: `https://auth.getport.io/login/callback`
   - US organizations: `https://auth.us.getport.io/login/callback`

      :::caution Redirect URI must match your region
      Using the EU callback for a US-hosted org (or vice versa) causes a 400 error during the Okta sign-in flow. Double-check the value before saving.
      :::

   - The Sign-in redirect URI is where Okta sends the authentication response and ID token for the sign-in request.

4. Remove the sign-out redirect URIs.

5. Under `Assignments`: Set `Allow everyone in your organization to access`.

   <img src="/img/sso/okta/AppIntegrationSettings.png" width="100%" border="1px" />
   <img src="/img/sso/okta/AppSettingsAssignments.png" width="100%" border="1px" />

### Step #3: Configure OIDC settings

Get your `Okta Domain` by clicking on your user mail at the top-right corner of the Okta management interface, hovering on the okta domain (will be in the format `{YOUR_COMPANY_NAME}.okta.com`) and clicking on `Copy to clipboard`:

<img src="/img/sso/okta/OktaGetDomain.png" width="40%" border="1px" />

Under `General` tab:

1. Copy the `Client ID` and send it to Port along with the `Okta Domain` from the previous step (using chat/Slack/mail to [support.port.io](http://support.port.io/)).

      <img src="/img/sso/okta/OktaAppSettingsPage.png" width="100%" border="1px" />

2. Click on the `Edit` button on the `General Settings` tab.

   2.1 Set the `Login initiated by` option to `Either Okta or App`:

      <img src="/img/sso/okta/OktaAppLoginInitiation.png" width="100%" border="1px" />

   2.2 Check all the options in `Application visibility`:

      <img src="/img/sso/okta/OktaAppVisibilitySettings.png" width="100%" border="1px" />

   2.3 Check `Login flow` to be `Redirect to app to initiate login (OIDC Compliant)`

   2.4 Under `initiate login URI` paste the following URI:

      <SSOEndpoints/>


      <img src="/img/sso/okta/OktaAppLoginflowSettings.png" width="100%" border="1px" />

      
   2.5 Click `Save` and you’re done! now you’ll have the Port app on your Okta dashboard.

  
      <img src="/img/sso/okta/OktaDashboard.png" width="100%" border="1px" />


   <DirectUrl/>

## How to allow pulling Okta groups to Port

:::info Optional step
This stage is **OPTIONAL** and is required only if you wish to pull all of your Okta groups into Port inherently.

**Benefit:** managing permissions and user access on Port.  
**Outcome:** for every user that logs in, we will automatically get their associated Okta groups, according to your definition in the settings below.
:::

To allow automatic Okta group support in Port, please follow these steps:

1. Under the `Application` page, select Port App and go to the `Sign On` tab:

   <img src="/img/sso/okta/OktaAppSignOnSettings.png" width="100%" border="1px" />

2. Under `OpenID Connect Token` click `Edit`:

   <img src="/img/sso/okta/OktaAppConnectToken.png" width="100%" border="1px" />

3. Add a `Groups claim type` and choose the option `filter`, then:

   3.1 Value = `groups`

   3.2 Select the required regex phrase to your needs.

      :::info Importing all groups
      To import all groups, insert `Matches regex` with the `.*` value.
      :::

      <img src="/img/sso/okta/OktaAppSetGroupClaims.png" width="100%" border="1px" />

   3.3 Click `Save`.