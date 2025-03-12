---
title: "OIDC"
sidebar_position: 1
description: Integrate any SSO with Port using OIDC application
---

import SSOEndpoints from "/docs/generalTemplates/_sso_auth0_endpoints.md"
import DirectUrl from "/docs/generalTemplates/_sso_direct_url.md"
import DocCardList from '@theme/DocCardList';

This documentation describes the process of integrating an OIDC application with Port, along with some examples for specific identity providers.
In order to integrate Port with an OIDC SSO application, you will need to do the following:

1. Create a new OIDC application in your identity provider and provide an app integration name, like `Port`.
2. Configure the application with the following details:
   - Redirect URI: `https://auth.getport.io/login/callback`
   - Login URI: 
     <SSOEndpoints/>
     :::note
     We will provide your `{CONNECTION_NAME}` (Contact us using chat/Slack/mail to [support@getport.io](mailto:support@getport.io)).
     :::
3. Expose the application to your organization by either granting access to everyone or restricting it to specific roles.
4. Share information about your SSO application:
   - Provide Port with the following details:
   	 - `Client ID`: The client identifier for your OIDC application.
   	 - `Client Secret`: The client secret for your OIDC application.
5. Add a custom property `email_verified` and configure the OpenID Claims in your identity provider to ensure that Port receives the value `true` for this attribute as part of the connection process. This step may be required specifically for certain identity providers such as [OneLogin](/sso-rbac/sso-providers/oidc/onelogin.md#step-4-add-email_verified-custom-property-to-all-users).
6. Configure the Groups claim in the OpenID Connect Token settings to enable automatic groups or roles support in Port.<br></br><br></br>
   :::note
   This step is OPTIONAL and is required only if you wish to pull all of your groups or roles into Port inherently.
   :::   
<br></br>
<DocCardList/>
