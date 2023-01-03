---
sidebar_position: 5
title: Exporting repositories
---

:::note Prerequisites

- [Please install our Bitbucket app](./installation).

:::

# Exporting repositories

By the end of this tutorial, we will have a `microservice` Blueprint that contains an auto-synced `REAMDE.md` file and `repository URL` from Bitbucket to Port properties.

1. Create a `microservice` Blueprint and `port-app-config.yml` configuration file.

To export your Bitbucket `repositories` to Port, you can use the following Port Blueprints definitions, and `port-app-config.yml`:

:::note

If you don't have a `README.md` file within the selected example repository for this tutorial, then delete the `readme` property from the Blueprint below.

:::

<details>
<summary> Repository Blueprint </summary>

```json showLineNumbers
{
  "identifier": "repository",
  "title": "Repository",
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
      },
      "url": {
        "title": "URL",
        "format": "url",
        "type": "string"
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
      query: "true"
    port:
      entity:
        mappings:
          identifier: ".name" # The Entity identifier will be the repository name + the pull request ID. After the Entity is created, the exporter will send `PATCH` requests to update this pull request within Port. 
          title: ".name"
          blueprint: '"repository"'
          properties:
            readme: file://README.md # Fetch the README.md file that is within the root folder of the repository and inject it as a markdown property.
            url: ".links.html.href" # fetch the repository URL from the Bitbucket metadata and inject it as a URL property.
```

</details>

:::info

- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform Bitbucket objects to Port Entities.
- Click [Here](https://support.atlassian.com/bitbucket-cloud/docs/event-payloads/#Repository) for the Bitbucket repository object structure.

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
          identifier: ".name" # the Entity identifier will be the repository name + the pull request ID. After the creation of the Entity, the exporter will send `PATCH` requests to update this pull request within Port.
          title: ".name"
          blueprint: '"repository"'
          properties:
            swagger: file://open-api.json # fetching the open-api file that is within the root folder of the repository and injecting it as a swagger property
            readme: file://README.md # fetching the README.md file that is within the root folder of the repository and injecting it as a markdown property
            url: ".links.html.href" # fetching from Bitbucket metadata the repository url and injecting it as a url proeprty
```

</details>

![Developer Portal GitHub Swagger](../../../static/img/integrations/github-app/GitHubSwagger.png)
