# Webhook

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Image from "@theme/IdealImage";
import WebhookArchitecture from '../../../../static/img/build-your-software-catalog/sync-data-to-catalog/webhook/webhook-architecture.png';
import ExampleGithubPRWebhook from './examples/resources/\_example_github_pr_configuration.mdx';

By using Port's generic webhook integration you can ingest data into the software catalog from any source or service that provides outgoing webhooks, even if Port doesn't provide a native integration for that source.

<center>

<Image img={WebhookArchitecture}></Image>

</center>

## 💡 Webhook common use cases

Our generic webhook makes it easy to fill the software catalog with live data directly from your 3rd-party services, for example:

- Map all of your **Snyk vulnerabilities**, **Jira issues**, **SonarQube reports** and other data sources;
- Make event-based real-time updates to the software catalog;
- Create a single view for all of the data provided by the 3rd-party services you use;
- etc.

## How it works

Port provides you with custom webhook endpoints, which you can use as the target for custom integrations provided by services you use (for example [GitHub](https://docs.github.com/en/webhooks-and-events/webhooks/about-webhooks), [Sentry](https://docs.sentry.io/product/integrations/integration-platform/webhooks/), etc.)

Each webhook endpoint can receive a [custom mapping](#mapping-configuration), making it easy to turn the payload of events from your 3rd-party services into entities inside your software catalog.

The custom mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the webhook payload.

## Webhook configuration

The webhook configuration is how you specify:

- The basic [metadata](#metadata-configuration) of the custom webhook integration;
- The [mapping configuration](#mapping-configuration) controlling which entities are created from the payload;
- The [security configuration](#security-configuration) used to make sure that payloads that arrive to Port were really sent by a 3rd party you authorized.

Here is an example webhook configuration:

<ExampleGithubPRWebhook/>

## Configuration structure

### Metadata configuration

The metadata configuration of the webhook includes all properties related to the visibility and displaying of the webhook inside Port's UI, in addition to controlling whether the webhook is active or not.

Here is an example metadata configuration:

```json showLineNumbers
{
  // highlight-start
  "identifier": "pullRequestMapper",
  "title": "Pull Request Mapper",
  "description": "A webhook configuration for pull-request events from GitHub",
  "icon": "Github",
  "enabled": true,
  // highlight-end
  "mappings": {
    ...
  },
  "security": {
    ...
  }
}
```

#### Structure table

| Field         | Description           | Notes                                                                                                    |
| ------------- | --------------------- | -------------------------------------------------------------------------------------------------------- |
| `identifier`  | Unique identifier     | The identifier is used for API calls, programmatic access and distinguishing between different webhooks  |
| `title`       | Name                  | **Required**. Human-readable name for the webhook                                                        |
| `description` | Description           |                                                                                                          |
| `icon`        | Icon for the webhook  | See the [full icon list](../../define-your-data-model/setup-blueprint/setup-blueprint.md#full-icon-list) |
| `enabled`     | Is the webhook active | If the integration id disabled (`"enabled": false`) then any incoming event will be dropped              |

### Mapping configuration

The mapping configuration of the webhook defines how the webhook event payload is mapped to one (or more) Port entities.

The mapping configuration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to extract information from the event payload into Port entity properties.

Here is an example mapping configuration:

```json showLineNumbers
{
  "identifier": "pullRequestMapper",
  "title": "Pull Request Mapper",
  "enabled": true,
  ...
  // highlight-start
  "mappings": [
    {
      "blueprint": "pullRequest",
      "filter": ".headers.\"X-GitHub-Event\" == \"pull_request\"",
      "entity": {
        "identifier": ".body.pull_request.id | tostring",
        "title": ".body.pull_request.title",
        "properties": {
          "author": ".body.pull_request.user.login",
          "url": ".body.pull_request.html_url"
        }
      }
    }
  ],
  // highlight-end
  "security": {
    ...
  }
}
```

#### Structure

- The root key of the mapping configuration is the `mappings` key:

```json showLineNumbers
{
  ...
  // highlight-next-line
  "mappings": [
    {
      # mapping
    }
  ]
  ...
}
```

The mappings key stores an **array** of mappings, making it possible to create multiple entities in multiple blueprints from the same payload.

Now let's explore the structure of a single mapping object:

- The `blueprint` key is used to specify the identifier of the blueprint to create/update an entity of based on the webhook payload:

```json showLineNumbers
{
  ...
  "mappings": [
    {
      // highlight-next-line
      "blueprint": "pullRequest",
      "filter": ".headers.\"X-GitHub-Event\" == \"pull_request\"",
      ...
    }
  ]
  ...
}
```

- The `filter` key lets you filter exactly which payloads sent to the webhook are processed:

```json showLineNumbers
{
  ...
  "mappings": [
    {
      "blueprint": "pullRequest",
      // highlight-next-line
      "filter": ".headers.\"X-GitHub-Event\" == \"pull_request\"" # JQ boolean query. If evaluated to false - skip the payload.
      ...
    }
  ]
  ...
}
```

- The `entity` key is used to map information from the webhook payload to Port entity properties using JQ:

```json showLineNumbers
{
  ...
  "mappings": [
    {
      ...
      "filter": ".headers.\"X-GitHub-Event\" == \"pull_request\"",
      // highlight-start
      "entity": {
        "identifier": ".body.pull_request.id | tostring",
        "title": ".body.pull_request.title",
        "properties": {
          "author": ".body.pull_request.user.login",
          "url": ".body.pull_request.html_url"
        }
      }
      // highlight-end
    }
  ]
  ...
}
```

### Security configuration

When 3rd party services send payload to a specified webhook URL, they will also include a header containing the hashed signature of the payload.

The hashed signature is generated by running a SHA-X (for example SHA-1 or SHA-256) hashing function on the payload, combined with a secret value specified by the user or provided by the 3rd party service at the time of webhook creation.

The security configuration of the webhook is used to tell Port how to verify the hashed signature sent with the request from the 3rd party.

Here is an example security configuration:

```json showLineNumbers
{
  "identifier": "pullRequestMapper",
  ...
  "mappings": [
    ...
  ],
  // highlight-start
  "security": {
    "secret": "WEBHOOK_SECRET",
    "signatureHeaderName": "X-Hub-Signature-256",
    "signatureAlgorithm": "sha256",
    "signaturePrefix": "sha256=",
    "requestIdentifierPath": ".headers.\"X-GitHub-Delivery\""
  }
  // highlight-end
}
```

:::tip
The security configuration is not mandatory, but it does provide an additional layer of security, making sure that Port only processes payloads that were actually sent from one of your 3rd party webhooks.

If you do not want to supply a security configuration with your webhook configuration, simply pass an empty object: `"security": {}` with your webhook configuration.
:::

#### Structure

- The root of the security configuration is the `security` key:

```json showLineNumbers
{
  ...
  // highlight-next-line
  "security": {
    "secret": "WEBHOOK_SECRET",
    "signatureHeaderName": "X-Hub-Signature-256",
    "signatureAlgorithm": "sha256",
    "signaturePrefix": "sha256=",
    "requestIdentifierPath": ".headers.\"X-GitHub-Delivery\""
  }
  ...
}
```

- The `secret` key is used to specify the secret value used to validate the hashed signature of the received payload:
  - Depending on the service, the secret value might be autogenerated by the 3rd party or manually provided to the 3rd party by you.

```json showLineNumbers
  ...
  "security": {
    // highlight-next-line
    "secret": "WEBHOOK_SECRET",
    "signatureHeaderName": "X-Hub-Signature-256",
    "signatureAlgorithm": "sha256",
    "signaturePrefix": "sha256=",
    "requestIdentifierPath": ".headers.\"X-GitHub-Delivery\""
  }
  ...
}
```

- The `signatureHeaderName` key is used to specify the name of the header that stores the hashed signature of the payload:
  - When a webhook endpoint receives a new payload, it will compare the value of this header with the hashed signature it will calculate from the received payload.

```json showLineNumbers
  ...
  "security": {
    "secret": "WEBHOOK_SECRET",
    // highlight-next-line
    "signatureHeaderName": "X-Hub-Signature-256",
    "signatureAlgorithm": "sha256",
    "signaturePrefix": "sha256=",
    "requestIdentifierPath": ".headers.\"X-GitHub-Delivery\""
  }
  ...
}
```

- The `signatureAlgorithm` key is used to specify the hashing algorithm used to create the payloads' hashed signature:
  - **Available values:** `sha1`, `sha256`;
  - When a webhook endpoint receives a new payload, it will use the specified algorithm to calculate the hashed signature of the received payload.

```json showLineNumbers
  ...
  "security": {
    "secret": "WEBHOOK_SECRET",
    "signatureHeaderName": "X-Hub-Signature-256",
    // highlight-next-line
    "signatureAlgorithm": "sha256",
    "signaturePrefix": "sha256=",
    "requestIdentifierPath": ".headers.\"X-GitHub-Delivery\""
  }
  ...
}
```

- The `signaturePrefix` key is used to specify a static prefix string that appears before the hashedSignature in the `signatureHeaderName` key:
  - For example, in GitHub webhooks, the header containing the hashed signature always starts with `sha256=`, so the webhook should be configured with: `"signaturePrefix": "sha256"`;

```json showLineNumbers
  ...
  "security": {
    "secret": "WEBHOOK_SECRET",
    "signatureHeaderName": "X-Hub-Signature-256",
    "signatureAlgorithm": "sha256",
    // highlight-next-line
    "signaturePrefix": "sha256=",
    "requestIdentifierPath": ".headers.\"X-GitHub-Delivery\""
  }
  ...
}
```

- The `requestIdentifierPath` key is used to specify a JQ pattern resulting in a unique identifier of the webhook payload:
  - This key is used to prevent Port from processing an event more than once;
  - For example, in GitHub webhooks, the `X-GitHub-Delivery` header contains a GUID used to identify the delivery. So the webhook should be configured with: `"requestIdentifierPath": ".headers.\"X-GitHub-Delivery\""`;

```json showLineNumbers
  ...
  "security": {
    "secret": "WEBHOOK_SECRET",
    "signatureHeaderName": "X-Hub-Signature-256",
    "signatureAlgorithm": "sha256",
    "signaturePrefix": "sha256=",
    // highlight-next-line
    "requestIdentifierPath": ".headers.\"X-GitHub-Delivery\""
  }
  ...
}
```

## Configuring webhook endpoints

<Tabs queryString="operation">

<TabItem label="Create webhook" value="create">

To create a new webhook, make an HTTP POST request to `https://api.getport.io/v1/webhooks` with your [webhook configuration](#configuration-structure) in the request body.

The API response will include the complete configuration of the webhook, including the following important fields:

- `webhookKey` - this is the unique identifier used for the new generic webhook route you created;
- `url` - this is the complete URL you need to pass to your 3rd party webhook configuration. Event payloads matching the webhook configuration you created should be sent to this URL;
  - The `url` will be of the format: `https://ingest.getport.io/{webhookKey}`;
  - **Note:** The `https://ingest.getport.io` is constant, only the `webhookKey` will change between webhooks configurations.

</TabItem>

<TabItem label="Update webhook" value="update">

To update an existing webhook, make an HTTP PATCH request to `https://api.getport.io/v1/webhooks/{WEBHOOK_IDENTIFIER}` with your updated [webhook configuration](#configuration-structure) in the request body.

When updating the webhook configuration, partial updates are supported, meaning you can pass only keys that need to be updated in the request body. Any key you do not specify will remain unchanged.

The API response will include the updated configuration of the webhook.

</TabItem>

<TabItem label="Delete webhook" value="delete">

To delete an existing webhook, make an HTTP DELETE request to `https://api.getport.io/v1/webhooks/{WEBHOOK_IDENTIFIER}`.

</TabItem>

</Tabs>

## Using the custom webhook

After creating and configuring your custom webhook, go to your 3rd party provider (i.e. GitHub, Sentry, Jira, etc.) and follow these steps to complete the webhook setup:

- Go to the new webhook setup menu in your 3rd party provider
  - For example in GitHub: go to your desired organization/repository -> Settings -> Webhooks -> Add webhook.
- Paste the webhook URL you received from Port (`https://ingest.getport.io/{webhookKey}`) in the field specifying the webhook target URL;
  - For example in GitHub: paste the webhook URL in the `Payload URL` field.
- For content type, select `application/json` (if applicable);
- In case the `secret` value is generated by your 3rd party, be sure to go back and [update](?operation=update#configuring-webhook-endpoints) your [security configuration](#security-configuration) with the secret value.

## Examples

Refer to the [examples](./examples/examples.md) page for practical configurations and their corresponding blueprint definitions.
