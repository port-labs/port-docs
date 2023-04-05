---
sidebar_position: 6
description: Ingest Sentry comments into your catalog
---

import SentryCommentsBlueprint from "./resources/sentry/\_example_sentry_comments_blueprint.mdx";
import SentryCommentsConfiguration from "./resources/sentry/\_example_sentry_comment_webhook_configuration.mdx"

# Sentry

In this example you are going to create a webhook integration between [Sentry](https://sentry.io) and Port, which will ingest comment entities.

## Prerequisites

Create the following blueprint definitions and webhook configuration:

<details>

<summary>Sentry comment blueprint</summary>
<SentryCommentsBlueprint/>

</details>

<details>

<summary>Sentry comment webhook configuration</summary>
<SentryCommentsConfiguration/>

</details>

:::tip
We have left out the `secret` field from the security object in the webhook configuration. This is because we only get this value after creating the webhook integration. That said, follow the guide on [configuring webhook endpoint](../webhook.md#configuring-webhook-endpoints) to get your webhook URL and proceed to the below section.
:::

## Create the Sentry webhook

1. Log in to Sentry with your organization's credentials;
2. Click the gear icon (Setting) at the left sidebar of the page;
3. Choose **Developer Settings**;
4. At the upper corner of this page, click on **Create New Integration**;
5. Sentry provides two types of integrations: Internal and Public. For this purpose of this guide, choose **Internal Integration** and click on the **Next** button
6. Input the following details:
   1. `Name` - use a meaningful name such as Port Webhook;
   2. `Webhook URL` - enter the value of the `url` key you received after creating the webhook configuration;
   3. `Overview` - enter a description for the webhook;
   4. `Permissions` - Grant your webhook the appropriate permissions based on the event you want to report;
   5. `Webhooks` - Under this section, enable the comments checkbox to allow Sentry to report comment events to Port;
7. Click **Save Changes** at the bottom of the page.

## Updating Webhook Configuration with Secret

Once successful, navigate to the integration you created and copy the client secret from the **Credentials** section on your Sentry page. Follow the guide on how to [configure webhook endpoint](../webhook.md#configuring-webhook-endpoints) to update the `secret` field we left blank when defining the webhook configuration yml file.

Done! any comments you make on an issue in Sentry will trigger a webhook event. Port will parse the events according to the mapping and update the catalog entities accordingly.
