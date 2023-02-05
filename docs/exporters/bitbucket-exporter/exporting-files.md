---
sidebar_position: 5
title: Exporting files
---

:::note Prerequisites

- [Please install our Bitbucket app](./installation).

:::

# Exporting files

In this tutorial you will learn how to create a `microservice` Blueprint that contains an auto-synced README.md file into a Port property.

1. Create a `microservice` Blueprint and `port-app-config.yml` configuration file.

To export your Bitbucket `files` to Port, you can use the following Port Blueprints definitions, and `port-app-config.yml`:

<details>
<summary> Repository Blueprint </summary>

```json showLineNumbers
{
  "identifier": "microservice",
  "title": "Microservice",
  "icon": "Service",
  "schema": {
    "properties": {
      "readme": {
        "title": "README",
        "type": "string",
        "format": "markdown"
      },
      "swagger": {
        "title": "Swagger",
        "type": "object",
        "spec": "open-api"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</details>

You have to place the `port-app-config.yml` in the repository's root folder.

<details>

<summary> Port port-app-config.yml </summary>

```yaml showLineNumbers
resources:
  - kind: repository
    selector:
      query: "true" # a JQ expression that it's output (boolean) determinating wheter to report the current resource or not
    port:
      entity:
        mappings:
          identifier: ".name" # The Entity identifier will be the repository name. After the Entity is created, the exporter will send `PATCH` requests to update this microservice within Port.
          title: ".name"
          blueprint: '"microservice"'
          properties:
            readme: file://README.md # Fetch the README.md file that is within the root folder of the repository and inject it as a markdown property.
```

</details>

:::info

- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform Bitbucket objects to Port Entities.
- Click [Here](https://developer.atlassian.com/cloud/bitbucket/rest/api-group-repositories/#api-repositories-workspace-repo-slug-get) for the Bitbucket repository object structure.

:::

2. Push `port-app-config.yml` to your default branch.

That's it! after the push is complete, the exporter will start ingesting the Entities on the next commit to the repository.

![Developer Portal Microservice](../../../static/img/integrations/bitbucket-app/BitbucketRepositories.png)

Check out the `README.md` in markdown format inside the [Specific Entity Page](../../software-catalog/entity/entity.md#entity-page).

![Developer Portal Bitbucket README](../../../static/img/integrations/github-app/GitHubReadme.png)

You can also have a Swagger component within the [Specific Entity Page](../../software-catalog/entity/entity.md#entity-page). To achieve that all you have to do is to add a `jq` mapping of an `open-api.json` file to the `port-app-config.yml` created above.

<details>

<summary> Port port-app-config.yml with swagger </summary>

```yaml showLineNumbers
resources:
  - kind: repository
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: ".name"
          title: ".name"
          blueprint: '"microservice"'
          properties:
            swagger: file://open-api.json # fetching the open-api file that is within the root folder of the repository and injecting it as a swagger property
            readme: file://README.md # fetching the README.md file that is within the root folder of the repository and injecting it as a markdown property
```

</details>

![Developer Portal GitHub Swagger](../../../static/img/integrations/github-app/GitHubSwagger.png)
