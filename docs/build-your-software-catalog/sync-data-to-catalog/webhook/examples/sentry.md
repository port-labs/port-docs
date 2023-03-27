---
sidebar_position: 2
description: Ingest issues, errors and comments into your catalog
---

# Sentry

In this example you are going to create a webhook integration between [Sentry](https://sentry.io) and Port, which will ingest issues, errors and comment entities.

## Prerequisites

Create the following blueprint definitions and webhook configuration:

<details>
<summary> Issue blueprint </summary>

</details>

<details>
<summary> Error blueprint </summary>

</details>

<details>
<summary> Comment blueprint </summary>

</details>

<details>
<summary> Complete webhook configuration </summary>

Remember to update the `WEBHOOK_SECRET` with the real secret Sentry generates after you create the webhook integration.

</details>

## Create the Sentry webhook

1. Go to `https://{YOUR_SENTRY}.sentry.io/settings/integrations/`;
2. Select **Create New Integration**;
3. Select **Internal Integration** and click **Next**;
4. Input the following details:
   1. `Name` - use a meaningful name such as Port Webhook;
   2. `Webhook URL` - enter the value of the `url` key you received after creating the webhook configuration;
   3. `Overview` - enter a description for the webhook;
   4.
