---
sidebar_position: 2
description: Ingest issue events and comments into your catalog
---

# Sentry

In this example you are going to create a webhook integration between [Sentry](https://sentry.io) and Port, which will ingest issue events and comment entities.

## Prerequisites

Create the following blueprint definitions and webhook configuration:

<details>
<summary> Issue event blueprint </summary>

</details>

<details>
<summary> Error blueprint </summary>

</details>

<details>
<summary> Comment blueprint </summary>

</details>

<details>
<summary> Complete Sentry webhook configuration </summary>

Remember to update the `WEBHOOK_SECRET` with the real secret Sentry generates after you create the webhook integration.

:::info
Note that in this example, we create a mapping that includes 2 different possible entities, and we use the `filter` key to make sure that the correct mapping is used for each payload type.

If you want to create 2 different webhook integrations, that is also possible, simply create 2 separate configurations, each one with a single mapping from the `mappings` array.
:::

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
