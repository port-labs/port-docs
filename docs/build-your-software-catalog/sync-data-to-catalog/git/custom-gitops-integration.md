---
sidebar_position: 5
---

# Custom GitOps Integration

If Port's available GitOps providers do not fit your use-case, you can create a custom GitOps integration by using our API.

:::tip
Before writing custom logic to integrate Port into your GitOps process, you should check our existing [Git providers](./git.md) and [CI/CD integrations](/build-your-software-catalog/custom-integration/api/ci-cd).
:::

## 💡 Custom GitOps common use cases

- Use your Git provider as the source-of-truth for your **microservices**, **packages**, **libraries** and other software catalog assets.
- Allow developers to keep the catalog up-to-date, by making updates to files in their Git repositories.
- Create a standardized way to document software catalog assets in your organization.

## Managing entities using custom GitOps

To manage entities using GitOps, add a `json` file to microservice repository containing the entity JSON.

Then, whenever your CI/CD process runs, an automated check will review whether the contents of the file changed, and will send the new file contents to Port's API using a simple API call, thus always keeping your microservice entity up to date.

## Example

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

Save this file to your version control repository. Then as part of your CI/CD, use [create entities](../sync-data-to-catalog.md#creating-entities) route, to add your new `Microservice`:

```bash showLineNumbers
blueprint_id='microservice'

curl --location --request POST "https://api.getport.io/v1/blueprints/${blueprint_id}/entities" \
    --header "Authorization: Bearer $access_token" \
    --header "Content-Type: application/json" \
    --data @entity.json

# The output of the command contains the content of the resulting entity
```

Now, whenever your CI/CD runs, it will report the latest definition of the entity to Port, giving you the latest information directly in Port.

:::note
Remember that an access token is needed to make API requests, refer back to [Getting an API token](/build-your-software-catalog/custom-integration/api#get-api-token) if you need to generate a new one.
:::
