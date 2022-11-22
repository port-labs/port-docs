---
sidebar_position: 8
---

# Use Port in your CI/CD

Port can be easily integrated into your existing CI/CD process by using our API.

:::tip
Before writing custom logic to integrate Port into your CI/CD, you should check our existing [exporters](../exporters/exporters.md) and [API Providers](../api-providers/api-providers.md).
:::

## Scenario

You want to use your existing CI/CD to report your microservice Entities to Port.

## Code example

:::info
In this example, you will create an Entity for the `Microservice` Blueprint from [creating a Blueprint](./blueprint-basics.md#creating-a-blueprint). Please make sure to create it beforehand.
:::

Create a local JSON file, named `entity.json`, with the following content:

```json showLineNumbers
{
  "identifier": "notification-microservice",
  "title": "Notification Service",
  "properties": {
    "repoUrl": "https://www.github.com/user/notification",
    "slackChannel": "#notification-service"
  }
}
```

Save this file to your version control repository. Then as part of your CI/CD, use the Port API `create entities` route, to add your new `Microservice`:

```bash showLineNumbers
blueprint_id='microservice'

curl --location --request POST "https://api.getport.io/v1/blueprints/${blueprint_id}/entities" \
    --header "Authorization: Bearer $access_token" \
    --header "Content-Type: application/json" \
    --data @entity.json

# The output of the command contains the content of the resulting entity
```

:::note
Remember that an access token is needed to make API requests, refer back to [Getting an API token](./blueprint-basics.md#getting-an-api-token) if you need to generate a new one.
:::
