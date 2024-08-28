---
title: "SAML"
sidebar_position: 1
description: Integrate any SSO with Port using SAML application
---



import DocCardList from '@theme/DocCardList';

This documentation will describe the process of integrating a SAML application with Port, along with some examples for specific identity providers.

In order to integrate Port with a SAML SSO application, you will need to do the following:

1. Create a new SAML application in your identity provider.
2. Share with us the following information about your SSO application: X509 certificate (`.pem` file) and Signin URL (as defined in the application).
3. Port will provide you with a metadata XML file that you can upload in the SAML application to complete the connection.
4. Update the application with the following attributes (Port expects the IdP to send the following attributes and their values in the authentication request, for example: `firstname` is the attribute in the IdP provider, and `given_name` is the key Port expects to receive that data in the authorization mapping):
    - User attribute mappings - `target attribute name (Port)`: `source attribute name (SSO app)`:
        - `email`: `email`
        - `given_name`: `firstname`
        - `family_name`: `lastname`
    - Constant attributes:
        - `email_verified`: `true`

If your login provider does not support metadata files, use the following information:

- IdP EntityID: `https://auth.getport.io`
- SP EntityID: The EntityDescriptor field in the XML, looks like : `urn:auth0:port-prod:{CONNECTION_NAME}` where the `{CONNECTION_NAME}` is the connection name as provided to you by Port.
- callback URL: The AssertionConsumerService binding field in the XML, looks like: `https://auth.getport.io/login/callback?connection={CONNECTION_NAME}` where the `{CONNECTION_NAME}` is the connection name as provided to you by Port.

<DocCardList/>

<!-- 

## SCIM Configuration (beta)

Most SAML SSO applications support [SCIM](https://auth0.com/docs/authenticate/protocols/scim). 

:::tip

If you are unsure whether or not your SSO provider support SCIM, reach out to the Port team.

:::

To set up SCIM for SAML based applications, contact Port's support team. You will be provided with an SCIM `endpoint` and `token` which are required to set up the SCIM integration.

After receiving the SCIM `endpoint` and `token`, enable SCIM in your SAML app in and pass the SCIM endpoint and token. -->