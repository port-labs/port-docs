---
title: "LDAP"
sidebar_position: 3
description: Integrate any LDAP system with Port SSO
---

This documentation describes the process of integrating an LDAP system to Port.

Port's login provider (Auth0) integrates with Active Directory using [Auth0's AD/LDAP Connector](https://auth0.com/docs/authenticate/identity-providers/enterprise-identity-providers/active-directory-ldap/ad-ldap-connector), which acts as a bridge between the internal AD/LDAP system and Auth0. This connector is needed because AD/LDAP is typically limited to internal networks.

## Prerequisites
- Contact Port's support regarding the LDAP setup request. The support team will provide a `TICKET_URL` which will be needed as part of the connector installation process.
- A machine with internal network access, with [these prerequisites](https://auth0.com/docs/authenticate/identity-providers/enterprise-identity-providers/active-directory-ldap/ad-ldap-connector/install-configure-ad-ldap-connector#prerequisites). This machine needs HTTPS outbound access to the internet, and RDP access to the internal AD server.


## Setting up the AD/LDAP connector

### 1. Initial installation

To deploy Auth0's LDAP connector, follow Auth0's [connector installation guide](https://auth0.com/docs/authenticate/identity-providers/enterprise-identity-providers/active-directory-ldap/ad-ldap-connector/install-configure-ad-ldap-connector).

When required to insert the `TICKET URL`, use the `TICKET_URL` provided by the Port support team.

### 2. Update user profile mapping

To allow user login, Port's login flow requires the login event to contain an `email` field, which is used as the user login ID.
AD users typically use  the `User Principal Name` (for example `user@corp.domain.com`) as their login ID.

:::note

In case the AD connector was installed on a Linux machine, mapping updates are done by editing the `/opt/auth0-adldap/lib/profileMapper.js` file, and restarting the AD connector service.

:::

To pass the `User Principal Name` (UPN) value in the `email` field in the login event, [update the connector mapping](https://auth0.com/docs/authenticate/identity-providers/enterprise-identity-providers/active-directory-ldap/ad-ldap-connector/map-ad-ldap-profile-attributes-to-auth0), and add the following line of code at the bottom of the attribute update list:

```js showLineNumbers
   // Default mappings
   // ...
   // profile['manager'] = raw_data['manager'];
   // profile['organizationUnits'] = raw_data['organizationUnits'];
   
   // Port custom mapping
   //highlight-next-line
   profile['email'] = raw_data['userPrincipalName'];

```

You can optionally map the user's `given name` and `surname` by adding the following fields to the mapping:

```js showLineNumbers
   // By default, the user's given name is under the `givenName`.
   // Replace in case your mapping is different.
   profile['given_name'] = raw_data['givenName'];
   // By default, the user's surname name is under the `sn`.
   // Replace in case your mapping is different.
   profile['family_name'] = raw_data['sn'];

```

### 3. Update LDAP user query
By default, the AD connector uses `(sAMAccountName={0})` as the default LDAP query to search for the user which is attempting to login.

The query needs to be updated to search the AD server using the user's `UPN` instead. To do this, add the following to the `config.js` file:

```js showLineNumbers

  "LDAP_USER_BY_NAME": "(&(objectClass=user)(userPrincipalName={0}))";

```

:::note

The `config.js` file is placed by default in the following paths:
- Windows machines - `C:\Program Files (x86)\Auth0\AD LDAP Connector\config.js`
- Linux machines - `/opt/auth0-adldap/config.js`

To view the full list of configuration variables for the `config.js` file, click [here](https://auth0.com/docs/authenticate/identity-providers/enterprise-identity-providers/active-directory-ldap/ad-ldap-connector/ad-ldap-connector-config-file-schema).

:::

### 4. **Optional** - Client SSL authentication

In some environments, accessing internal AD servers uses custom client SSL certificate authentication. If your AD environment requires client SSL certificates:
1. Contact Port's support team to request enabling client SSL certificates for your connection.
2. Follow the [Auth0 client SSL certificate guide](https://auth0.com/docs/authenticate/identity-providers/enterprise-identity-providers/active-directory-ldap/ad-ldap-connector/configure-ad-ldap-connector-client-certificates#configure-certificates) explaining how to configure certificates for the connector.
3. Restart the Auth0 Connector service on the machine hosting the AD connector.


:::warning

After client SSL is enabled by Port's support team, if the connector is reset without proper SSL configuration, login attempts might fail.

:::
