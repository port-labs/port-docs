---
sidebar_position: 6
description: Ingest Sentry issue events into your catalog
---

import SentryIssueBlueprint from './resources/sentry/\_example_sentry_issue_blueprint.mdx'
import SentryIssueWebhookConfig from './resources/sentry/\_example_sentry_issue_configuration.mdx'

# Sentry

In this example you are going to create a webhook integration between [Sentry](https://sentry.io) and Port, which will ingest issue events and comment entities.

## Prerequisites

Create the following blueprint definitions and webhook configuration:

<details>
<summary> Issue event blueprint </summary>

<SentryIssueBlueprint/>

</details>

<details>
<summary> Issue Sentry webhook configuration </summary>

Remember to update the `WEBHOOK_SECRET` with the real secret Sentry generates after you create the webhook integration.

<SentryIssueWebhookConfig/>

</details>

## Create the Sentry webhook

1. Go to `https://{YOUR_SENTRY_ORGANIZATION-SLUG}.sentry.io/settings/developer-settings/`;
2. You can select your exisitng Integration(Internal or Public integration) you can also Select **Create New Integration** to create a new Integration;
3. Select **Internal Integration** and click **Next**;
4. Input the following details:
   1. `Name` - use a meaningful name such as Port Webhook;
   2. `Webhook URL` - enter the value of the `url` key you received after creating the webhook configuration;
   3. `Overview` - enter a description for the webhook;
   4. `Permission` - Assign the right permission for this integration;
   5. `Webhooks` - Tick the box for every Webhook you need.
5.  Click on **Save Changes** (Click on your newly created Integration to see tokens and Client Secret)


Done! any issues trigger in Sentry (created, resolved, assigned, ignored) will trigger a webhook event that Sentry wull send to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.