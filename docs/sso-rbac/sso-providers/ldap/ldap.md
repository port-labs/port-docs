---
title: "LDAP"
sidebar_position: 3
description: Integrate any LDAP system with Port SSO
---

This documentation describes the process of integrating an LDAP system to Port.

Port's login provider (Auth0) integrates with Active Directory using [Auth0's AD/LDAP Connector](https://auth0.com/docs/authenticate/identity-providers/enterprise-identity-providers/active-directory-ldap/ad-ldap-connector), which acts as a bridge between your internal AD/LDAP system and Auth0. This connector is needed because AD/LDAP is typically limited to internal networks.

## Prerequisites
- Contact Port's support regarding the LDAP setup request. The support team will provide you with a `TICKET_URL` which will be needed as part of the connector installation process.
- A machine with internal network access, with [these prerequisites](https://auth0.com/docs/authenticate/identity-providers/enterprise-identity-providers/active-directory-ldap/ad-ldap-connector/install-configure-ad-ldap-connector#prerequisites). This machine should have HTTPS outbound access to the internet, and RDP access to your AD server.


## Setting up the AD/LDAP connector

To deploy Auth0's LDAP connector, follow Auth0's [connector installation guide](https://auth0.com/docs/authenticate/identity-providers/enterprise-identity-providers/active-directory-ldap/ad-ldap-connector/install-configure-ad-ldap-connector).

### Enabling client SSL certificate authentication
In some environments, accessing internal AD servers require custom SSL certificate authentication. If your AD environment requires client certificates:
1. Contact Port's support team to request enabling client SSL certificates on your connection.
2. Follow the [Auth0 SSL certificate guide](https://auth0.com/docs/authenticate/identity-providers/enterprise-identity-providers/active-directory-ldap/ad-ldap-connector/configure-ad-ldap-connector-client-certificates#configure-certificates) explaining how to configure certificates for the connector.
3. Restart the Auth0 Connector service on your machine.

:::warning

After client SSL is enabled by Port's support team, if the connector is reset without proper SSL configuration, login attempts might fail.

:::
