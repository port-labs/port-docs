---
title: "Okta (SAML)"
sidebar_position: 4
description: Integrate Okta with Port using SAML
---

# How to configure Okta

Follow this step-by-step guide to configure the integration between Port and Okta using a SAML application.

:::info
To complete the process, you will need to contact us to receive the necessary information and provide the details Port requires from you. These steps are elaborated in the following section.
:::

## Port-Okta integration benefits

- Connect to the Port application via an Okta app.
- Your Okta groups will be automatically synced with Port upon a user sign-in.
- Set granular permissions on Port according to your Okta groups.

## Register a new application and generate the required credentials

1. Sign in to your Okta Admin Console.
2. Navigate to `Applications` and click on `Applications` again.
3. Click on the `Create App Integration` button.
4. In the pop-up, select `SAML 2.0` and click on `Next`.
5. In the `General Settings`, enter a name for the application and click on `Next`.
6. On the `Configure SAML` page, under `SAML Settings`, you’ll need to fill in some details:
    - **Single sign on URL**: This is where Port’s SAML endpoint URL will go, which you’ll receive from Port.
    - **Audience URI (SP Entity ID)**: This should be set to Port’s Entity ID, also provided by Port.
7. Scroll down to the `Attribute Statements (Optional)` section:
    - Add an attribute statement for `email`, with the `Value` set to `user.email`.
8. Click `Next` and then `Finish` to create the application.

## Generate a Certificate and Send to Port

To secure the SAML integration, you need to generate a certificate and send it to Port:

1. In the Okta Admin Console, navigate to `Applications`, and select the newly created SAML application.
2. Go to the `Sign On` tab and scroll down to the `SAML Signing Certificates` section.
3. Click on `Generate new certificate`.
4. In the dialog, specify the certificate details such as the name and duration, then click `Generate`.
5. After generating the certificate, download it by clicking on the `Actions` button next to the new certificate and selecting `Download certificate`. Choose the `PEM` format.
6. Send the **PEM certificate file** along with the **Identity Provider metadata URL** (available in the `Sign On` tab) to Port.


## Expose Groups

To expose your Okta groups to Port via the application, follow these steps:

1. In the `Sign On` tab of your Okta application, click `Edit`.
2. Scroll down to the `Group Attribute Statements` section.
3. Add a group attribute using the following settings:
    - **Name**: `groups`
    - **Filter**: `Regex`
    - **Value**: Use a regular expression that matches the groups you wish to send to Port (e.g., `.*` for all groups or a specific pattern).
4. Save your changes.

These groups will be ingested into Port as teams, enabling you to manage user permissions and RBAC in your Port account.

## SCIM Configuration

Okta supports [SCIM](https://auth0.com/docs/authenticate/protocols/scim) for SAML applications.

To set up SCIM for Okta SAML-based applications, contact Port's support team. You will be provided with a SCIM `endpoint` and `token` that are required to set up the SCIM integration.

Once you have received the SCIM `endpoint` and `token`, follow Okta’s documentation on [Setting Up SCIM in Okta](https://help.okta.com/en-us/content/topics/apps/apps_app_integration_wizard_scim.htm) to enable SCIM.