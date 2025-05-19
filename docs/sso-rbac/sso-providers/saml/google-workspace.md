---
title: "Google Workspace"
sidebar_position: 4
description: Integrate Google Workspace with Port using SAML
---

import Image from "@theme/IdealImage";
import webAndMobile from "/static/img/sso/google-workspace/webAndMobile.png"
import addSamlApp from "/static/img/sso/google-workspace/addSamlApp.png"
import appNameAndIcon from "/static/img/sso/google-workspace/appNameAndIcon.png"
import urlAndCert from "/static/img/sso/google-workspace/urlAndCert.png"
import ACSandEntity from "/static/img/sso/google-workspace/ACSandEntity.png"
import SSOandCert from "/static/img/sso/google-workspace/SSOandCert.png"
import attributeMapping from "/static/img/sso/google-workspace/attributeMapping.png"
import userAccessInApp from "/static/img/sso/google-workspace/userAccessInApp.png"
import turnAccessOn from "/static/img/sso/google-workspace/turnAccessOn.png"
import loginUsingApp from "/static/img/sso/google-workspace/loginUsingApp.png"
import acsURLandEntityID from "/static/img/sso/google-workspace/acsURLandEntityID.png"
import DirectUrl from "/docs/generalTemplates/_sso_direct_url.md"

# How to configure Google Workspace

Follow this step-by-step guide to configure the integration between Port and Google Workspace.

:::info
In order to complete the process you will need to contact us to receive the information you require, as well as the information Port requires from you. All is elaborated below.

:::

## Port-Google Workspace integration benefits

- Connect to the Port application via your Google Workspace Application.
- Your Google Workspace teams will be automatically synced with Port upon a user sign-in.
- Set granular permissions on Port according to your Google Workspace groups.

## Create your Google Workspace application

1. In the [Google Admin Console](https://admin.google.com/), in the sidebar menu, navigate to **Apps** -> **Web and mobile apps**:

<center>

<Image img={webAndMobile} style={{ width: 300 }} />

</center>

<br/>

2. Click on `Add app` followed by `Add custom SAML app`:

<center>

<Image img={addSamlApp} style={{ width: 300 }} />

</center>

<br/>

3. Define the initial Port application settings:

   1. `App name`: Insert a name of your choice for the Port app, like `Port`.
   2. Add an `App icon` (optional):

   <details>
   <summary>Port Logo</summary>

   ![Port's logo](/img/sso/general-assets/PortIcon.png)

   </details>

   3. Press `Continue`

<center>

<Image img={appNameAndIcon} style={{ width: 600 }} />

</center>

<br/>

4. Take note of the following:
   1. Your `SSO URL`;
   2. Your `Certificate`.

<center>

<Image img={SSOandCert} style={{ width: 550 }} />

</center>

<br/>

Pass these to Port. <br/>

Press `Continue`.

5. Configure your new application as shown below:

- `ACS URL` - `https://auth.getport.io/login/callback?connection={CONNECTION_NAME}`
- `Entity ID` - `urn:auth0:port-prod:{CONNECTION_NAME}`

:::note
We will provide your `{CONNECTION_NAME}` (Contact us using chat/Slack/mail to [support@getport.io](mailto:support@getport.io)).
:::

Press `Continue`

<center>

<Image img={acsURLandEntityID} style={{ width: 600 }} />

</center>

<br/>

6. Create the following mappings (email_verified needs to be a constant for all users, with the value `true` ):

_Google Directory attributes_:

- **`Primary email`** -> `email`
- **`First name`** -> `name`
- **`email_verified`** -> `email_verified`

_Google membership_ (optional): This mapping is only relevant if you wish to pass groups to Port.

- **`Google Groups`**(list) -> `groups`

Press `Finish`

<center>

<Image img={attributeMapping} style={{ width: 550 }} />

</center>

<br/>

7. Specify permissions to the application:

After creating the app, you need to set up permissions for who has access to this application.

Navigate to your your new application's page, and click **User access**:

<center>

<Image img={userAccessInApp} style={{ width: 550 }} />

</center>

<br/>

Then choose from the left side menu, either to enable the app for `Everyone`, for `Groups` or for `Organizational units`.

Make sure that for any of the options you would like to enable the app for, you check the `ON` checkbox:

<center>

<Image img={turnAccessOn} style={{ width: 550 }} />

</center>

<br/>

7. Log in with using your new Google app:

<center>

<Image img={loginUsingApp} style={{ width: 250 }} />

</center>

<DirectUrl/>
