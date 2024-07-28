# Port secrets

Port provides a secure way to store sensitive data, such as tokens, passwords, and other secrets used in different Port components. 

:::warning Feature support
Currently, using secrets is supported only in [Port-hosted integrations](/build-your-software-catalog/sync-data-to-catalog/apm-alerting/datadog?installation-methods=hosted-by-port&deploy=argocd&cicd-method=github#installation).  
*Support for secrets in self-service actions and automations coming soon!*
:::

## Usage

To create a new secret:

1. In your [Port application](https://app.getport.io), click on the `...` button in the top right corner, and select `Credentials`.

2. In the `Credentials` window, choose the `Secrets` tab.

3. Click on the `+ Secret` button.
    <img src="/img/secrets/secretsTabExample.png" width="50%" border="1px" />

:::info One-time view
After creating a secret, you will be able to view its value only once.  
Afterwards, you will be able to delete the secret or edit its value, but not to view it.
:::

## Security

- Port secrets reside in Port's infrastructure (hosted on AWS), **per organization**, meaning that no other organization has any access to your secrets.
- Secrets are `AES-256` encrypted at rest, and are only decrypted when needed.
- Secrets are encrypted in transit using `TLS 1.2`.

