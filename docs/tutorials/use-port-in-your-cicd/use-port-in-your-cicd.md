---
sidebar_position: 7
---

# Use Port in your CI/CD

First, you should look for our existing [integrations](../../integrations/integrations.md), that may assist you with integrating Port within your CI/CD process.

For any custom needs, you can always use our API directly.

## Example - Create new Microservice entity

:::info
In this example, we show how to create entity for the `Microservice` Blueprint from [Creating a Blueprint](../blueprint-basics.md#creating-a-blueprint). Please make sure to create it beforehand.
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

:::note
We suggest to save the JSON in your version control tool, for conveniently use it in your CI/CD process.
:::

Then, as part of your CI/CD, use Port create entities API, to add your new `Microservice`:

```bash showLineNumbers
blueprint_id='microservice'

curl --location --request POST "https://api.getport.io/v1/blueprints/${blueprint_id}/entities" \
    --header "Authorization: Bearer $access_token" \
    --header "Content-Type: application/json" \
    --data @entity.json

# The output of the command contains the content of the resulting entity
```

:::note
Remember that an access token is needed to make API requests, refer back to [Getting an API token](../blueprint-basics.md#getting-an-api-token) if you need to generate a new one.
:::
