---
title: "Microsoft Entra ID (AzureAD)"
sidebar_position: 1
description: Integrate Azure AD with Port using SAML
---

import ScimFunctionality from "/docs/sso-rbac/sso-providers/_scim_functionality_list.mdx"
import DirectUrl from "/docs/generalTemplates/_sso_direct_url.md"

# How to configure Azure AD

Follow this step-by-step guide to configure the integration between Port and Azure AD using a SAML application

:::info
In order to complete the process you will need to contact us to receive the information you require, as well as the information Port requires from you. All is elaborated below in the following section.

:::

## Port-AzureAd integration benefits

- Connect to the Port application via an AzureAD app.
- Your AzureAD teams will be automatically synced with Port upon a user sign-in.
- Set granular permissions on Port according to your AzureAD groups.

## Register a new application and generate the required credentials

1. Head to your Azure portal and enter the Entra ID portal.
2. Click on `Enterprise Applications` and create a new application.
3. Click on `Create your own application` and select `Integrate any other application you don't find in the gallery (Non-gallery)`.
4. In the getting started section, select the `Set up Single Sign On` button, and choose the SAML method.
5. Edit the Basic SAML Configuration (step 1) and add the following information (Reach out to Port to receive your `{CONNECTION_NAME}` value):
    ![AD first step](/img/sso/azure-saml/azure-saml-first-step.png)
    * Identifier (Entity ID): `urn:auth0:port-prod:{CONNECTION_NAME}`
    * Reply URL (Assertion Consumer Service URL): `https://auth.getport.io/login/callback?connection={CONNECTION_NAME}`
    * Logout URL (This is optional): `https://auth.getport.io/logout`

:::info
The details listed are for organizations hosted in EU.

For US, you will need to use `https://auth.us.getport.io/login/callback?connection={CONNECTION_NAME}` and `https://auth.us.getport.io/logout`.
:::
6. In the `Single sign-on` tab, head to the 2nd section (Attributes & Claims), Click on `Edit` and add a new claim:
    - `Name`: `email_verified`
    - `Source attribute`: `user.accountenabled`
7. Under `SAML certificates` (step 3), Click the Edit button to expand the certificates section. Click the 3 dot icon next to the Active certificate, and choose `PEM certificate download`.

Send the **PEM certificate file** along with the **Login URL** (Which can be found in the Single Sign-on section, Card 4 (Set up)) to Port.

    ![AD first third](/img/sso/azure-saml/azure-saml-third-step.png)

After that, Port will provide you with a metadata XML file for your connection.

At the top of the SAML configuration page, click on the `upload metadata file` button and upload the file provided to you by Port to complete the connection configuration.

<DirectUrl/>

## Expose groups

In order to expose your Azure groups to Port via the application, do the following:
1. Head to the `Single sign on` section in the application configuration, and edit the `Attributes & Claims`.
2. Press the `Add a group claim` button
3. Select `Groups assigned to the application` and in the source attribute select `Cloud-only group display names`.
4. Assign the relevant groups you want to expose to the application, these will be ingested into Port as teams you can use to manage user permissions and RBAC in your Port account.

Alternatively, if you are syncing your groups from an on-prem AD into Entra, configure the group claim like so (sAMAccountName as source attribute, and box checked):

<img src="/img/sso/azure-saml/azureSamlGroups.png" width="60%" border="1px" />

## SCIM Configuration (beta)

AzureAD SAML applications support [SCIM](https://auth0.com/docs/authenticate/protocols/scim). 

<ScimFunctionality/>

### Setup SCIM

To set up SCIM for AzureAD SAML based applications, contact Port's support team.

You will be provided with:

- An SCIM `endpoint`
- An SCIM `token`

 The `endpoint` and `token` will be used to set up the SCIM integration in your identity provider.

After receiving the SCIM `endpoint` and `token`, follow this [step-by-step guide](https://auth0.com/docs/authenticate/protocols/scim/inbound-scim-for-azure-ad-saml-connections#configure-scim-in-azure-ad-for-saml-apps) to enable SCIM.
