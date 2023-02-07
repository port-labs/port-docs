---
sidebar_position: 3
---

# Custom GitOps Integration

If Port's available GitOps providers do not fit your use-case, you can create a custom GitOps integration by using our API.

:::tip
Before writing custom logic to integrate Port into your GitOps process, you should check our existing [GitOps providers](./gitops.md), [exporters](../git-provider/git-provider.md) and [CI/CD integrations](../ci-cd/ci-cd.md).
:::

## Use-case

You want to use GitOps in Port to manage and regularly update your microservice Entities.

To do so, add a `json` file in your microservice repository containing the microservice Entity JSON.

Then, whenever your CI/CD process runs, an automatic check will review whether the contents of the file changed, and will send the new file contents to Port's API using a simple API call, thus always keeping your microservice Entity up to date.

## Code example

:::info
In this example, you will create an Entity for the `Microservice` Blueprint from [the quickstart](../../../quickstart.md#define-a-blueprint). Please make sure to create it beforehand.
:::

Create a local JSON file, named `entity.json`, with the following content:

```json showLineNumbers
{
  "identifier": "notification-microservice",
  "title": "Notification Service",
  "properties": {
    "url": "https://www.github.com/user/notification"
  }
}
```

Save this file to your version control repository. Then as part of your CI/CD, use the Port API [create entities](../understand-entities-structure/tutorial.md#create-entities) route, to add your new `Microservice`:

```bash showLineNumbers
blueprint_id='microservice'

curl --location --request POST "https://api.getport.io/v1/blueprints/${blueprint_id}/entities" \
    --header "Authorization: Bearer $access_token" \
    --header "Content-Type: application/json" \
    --data @entity.json

# The output of the command contains the content of the resulting entity
```

Now, whenever your CI/CD runs, it will report the latest definition of the Entity to Port, giving you the latest information directly in Port.

:::note
Remember that an access token is needed to make API requests, refer back to [Getting an API token](../api/get-api-token.mdx) if you need to generate a new one.
:::
