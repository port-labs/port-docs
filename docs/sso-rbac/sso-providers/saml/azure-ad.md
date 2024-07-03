---
title: "Azure Active Directory (SAML)"
sidebar_position: 1
description: Integrate Azure AD with Port using SAML
---

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
5. Under `SAML certificates` (step 3), Click the Edit button to expand the certificates section. Click the 3 dot icon next to the Active certificate, and choose `PEM certificate download`.

Send the **PEM certificate file** along with the **application ID** (Which can be found in the properties tab of the application) to Port.

After that, Port will provide you with a metadata XML file for your connection.

At the top of the SAML configuration page, click on the `upload metadata file` button and upload the file provided to you by Port to complete the connection configuration.

## Expose groups

In order to expose your Azure groups to Port via the application, do the following:
1. Head to the `Single sign on` section in the application configuration, and edit the `Attributes & Claims`.
2. Press the `Add a group claim` button
3. Select `Groups assigned to the application` and in the source attribute select `Cloud-only group display names`.
4. Assign the relevant groups you want to expose to the application, these will be ingested into Port as teams you can use to manage user permissions and RBAC in your Port account.