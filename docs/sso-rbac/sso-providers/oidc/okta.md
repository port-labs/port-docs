---
title: "Okta (OIDC)"
sidebar_position: 2
description: Integrate Okta with Port
---

import ScimFunctionality from "/docs/sso-rbac/sso-providers/_scim_functionality_list.mdx"
import ScimLimitation from "/docs/sso-rbac/sso-providers/oidc/_scim_oidc_limitation.mdx"
import SSOEndpoints from "/docs/generalTemplates/_sso_auth0_endpoints.md"
import DirectUrl from "/docs/generalTemplates/_sso_direct_url.md"

# How to configure Okta

Follow this step-by-step guide to configure the integration between Port and Okta.

:::info
In order to complete the process you will need to contact us, the exact information we need to provide, as well as the information Port requires from you is listed in this doc.
:::

## Port-Okta integration benefits

- Connect to the Port application via an Okta app.
- Your Okta teams will be synced with Port, automatically upon user sign-in.
- Set granular permissions on Port according to your Okta groups.

## How to configure the Okta app integration for Port​

### Step #1: Create a new Okta application

1. In the Admin Console, go to Applications -> Applications.
2. Click `Create App Integration`.

![Okta new application wizard](/img/sso/okta/OktaCreateApp.png)

3. Create an OIDC app integration. Select **OIDC - OpenID Connect** in the Wizard.

![Okta new application OIDC integration](/img/sso/okta/OktaCreateAppIntegration.png)

4. Choose **Single-Page application** as your application type.

![Okta new application type](/img/sso/okta/OktaSetAppType.png)

Click `Next`.

### Step #2: Configure your Okta application

Under `General Settings`:

1. Choose an `app integration name` (a specific name that will appear on your Okta apps).
2. Add an application logo (optional).

   ![Port's logo](/img/sso/general-assets/PortLogo.png)

3. Under `Grant type` mark all options.

4. Under `Sign-in redirect URIs` set: `https://auth.getport.io/login/callback`.

   - The Sign-in redirect URI is where Okta sends the authentication response and ID token for the sign-in request.

5. Remove the sign-out redirect URIs.

6. Under `Assignments`: Set `Allow everyone in your organization to access`.

   ![Okta app settings](/img/sso/okta/AppIntegrationSettings.png)
   ![Okta app settings assignments](/img/sso/okta/AppSettingsAssignments.png)

### Step #3: Configure OIDC settings

Get your `Okta Domain` by clicking on your user mail at the top-right corner of the Okta management interface, hovering on the okta domain (will be in the format `{YOUR_COMPANY_NAME}.okta.com`) and clicking on `Copy to clipboard`:

![Get Okta domain](/img/sso/okta/OktaGetDomain.png)

Under `General` tab:

1. Copy the `Client ID` and send it to Port along with the `Okta Domain` from the previous step (using chat/Slack/mail to [support@getport.io](mailto:support@getport.io)).

   ![Okta app settings](/img/sso/okta/OktaAppSettingsPage.png)

2. Click on the `Edit` button on the `General Settings` tab.

   2.1 Set the `Login initiated by` option to `Either Okta or App`:

   ![Okta app settings](/img/sso/okta/OktaAppLoginInitiation.png)

   2.2 Check all the options in `Application visibility`:

   ![Okta app settings](/img/sso/okta/OktaAppVisibilitySettings.png)

   2.3 Check `Login flow` to be `Redirect to app to initiate login (OIDC Compliant)`

   2.4 Under `initiate login URI` paste the following URI:

   <SSOEndpoints/>

   :::note
   We will provide your `{CONNECTION_NAME}` (Contact us using chat/Slack/mail to [support@getport.io](mailto:support@getport.io)).
   :::

   ![Okta app settings login flow](/img/sso/okta/OktaAppLoginflowSettings.png)

   2.5 Click `Save` and you’re done! now you’ll have the Port app on your Okta dashboard.

   ![Okta dashboard with Port app](/img/sso/okta/OktaDashboard.png)

   <DirectUrl/>

## How to allow pulling Okta groups to Port

:::note
This stage is **OPTIONAL** and is required only if you wish to pull all of your Okta groups into Port inherently.

**Benefit:** managing permissions and user access on Port.  
**Outcome:** for every user that logs in, we will automatically get their associated Okta groups, according to your definition in the settings below.
:::

To allow automatic Okta group support in Port, please follow these steps:

1. Under the `Application` page, select Port App and go to the `Sign On` tab:

   ![Okta application sign-on settings](/img/sso/okta/OktaAppSignOnSettings.png)

2. Under `OpenID Connect Token` click `Edit`:

   ![Okta application connect id token](/img/sso/okta/OktaAppConnectToken.png)

3. Add a `Groups claim type` and choose the option `filter`, then:

   3.1 Value = `groups`

   3.2 Select the required regex phrase to your needs.

   :::note
   To import all groups, insert `Matches regex` with the `.*` value.
   :::

   ![Okta application set group claims](/img/sso/okta/OktaAppSetGroupClaims.png)

   3.3 Click `Save`.


## SCIM Configuration (beta)

<ScimLimitation/>

Okta OIDC applications support [SCIM](https://auth0.com/docs/authenticate/protocols/scim).

<ScimFunctionality/>

### Setup SCIM

To use [SCIM](https://auth0.com/docs/authenticate/protocols/scim) with your Okta OIDC SSO setup, you will need to create an additional Okta application according to the following instructions:

1. Create a new SSO application, of type SWA, and fill the form as below:
   <img src="/img/sso/okta/OktaSWA.png" width="80%" border="1px" />
   <br/><br/>
   <img src="/img/sso/okta/Okta_OIDC_SCIM.png" width="80%" border="1px" />
      - `App's login page URL`
        - Organizations hosted in the EU: `https://app.getport.io`
        - Organizations hosted in the US: `https://app.us.getport.io`
      - `Who sets the credentials` - Administrator sets username, password is the same as user's Okta password
      - `Application username` - Okta username
      - `Update application username on` - Create and update

2. Edit the App Settings, and enable `Enable SCIM provisioning`

   <img src="/img/sso/okta/OktaSCIMSecond.png" width="80%" border="1px" />


After completing these steps, reach out to Port's team. You will be provided with:

- An SCIM `endpoint`
- An SCIM `token`

The `endpoint` and `token` will be used to complete the setup of the new SWA application.

3. Open the Provisioning tab in your application, and under `Integration` fill the following:
   - SCIM connector base URL: The `endpoint` you received from Port.
   - Unique identifier field for users: `userName`.
   - Supported provisioning actions: `Push New Users`, `Push Profile Updates`.
   - Authentication Mode: `HTTP Header`.
   - Authorization: The `token` you received from Port.
       <br/><br/>
      <img src="/img/sso/okta/OKTASCIMconf.png" width="80%" border="1px" />

    After configuration, press the `Test Connector Configuration` and confirm the integration was configured correctly.

4. Go to the newly created `To App` settings, and enable the following:
   - Create Users
   - Update User Attributes
   - Deactivate Users
   <br/>
   <img src="/img/sso/okta/OktaSCIMapp.png" width="80%" />