---
title: "Google Workspace"
sidebar_position: 5
description: Integrate Google Workspace with Port
---

import Image from "@theme/IdealImage";
import webAndMobile from "../../../static/img/sso/google-workspace/webAndMobile.png"
import addSamlApp from "../../../static/img/sso/google-workspace/addSamlApp.png"
import appNameAndIcon from "../../../static/img/sso/google-workspace/appNameAndIcon.png"
import urlAndCert from "../../../static/img/sso/google-workspace/urlAndCert.png"
import ACSandEntity from "../../../static/img/sso/google-workspace/ACSandEntity.png"
import SSOandCert from "../../../static/img/sso/google-workspace/SSOandCert.png"
import attributeMapping from "../../../static/img/sso/google-workspace/attributeMapping.png"

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

1. In the [Google Admin Console](https://admin.google.com/), in the sidebar menu, navigate to **Apps** -> **Web and mobile apps**

<center>

<Image img={webAndMobile} style={{ width: 300 }} />

</center>

2. Click on `Add app` followed by `Add custom SAML app`.

<center>

<Image img={addSamlApp} style={{ width: 300 }} />

</center>

3. Define the initial Port application settings:

   1. `App name`: Insert a name of your choice for the Port app, like `Port`.
   2. Add an `App icon` (optional):

   <details>
   <summary>Port Logo</summary>

   ![Port's logo](../../../static/img/sso/general-assets/PortIcon.png)

   </details>

   3. Press `Continue`

<center>

<Image img={appNameAndIcon} style={{ width: 600 }} />

</center>

3. Take note of the following:
   1. Your `SSO URL`;
   2. Your `Certificate`.

<center>

<Image img={SSOandCert} style={{ width: 550 }} />

</center>

Pass these to Port. <br/>

:::note
We will provide your `{CONNECTION_NAME}` (Contact us on Slack/Intercom).
:::

Press `Continue`.

4. You will need to create the following mappings:

_Google Directory attributes_:

- **`Primary email`** -> `email`
- **`First name`** -> `name`

_Google membership_ (optional): This mapping is only relevant if you wish to pass groups to Port.

- **`Google Groups`**(list) -> `groups`

Press `Finish`

<center>

<Image img={attributeMapping} style={{ width: 550 }} />

</center>
