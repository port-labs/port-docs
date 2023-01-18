---
sidebar_position: 6
title: Exporting all repositories
---

:::note Prerequisites

- [Please install our Bitbucket app](./installation).

:::

# Exporting all repositories

In this tutorial you will learn how to create a `microservice` Blueprint that contains the properties `repository URL`, `Workspace` and `Project`, which are automatically synced from Bitbucket to Port Entity.

1. Create a `microservice` Blueprint and `port-app-config.yml` configuration file.

To export your Bitbucket `repositories` to Port, you can use the following Port Blueprints definitions, and `port-app-config.yml`:

<details>
<summary> Microservice Blueprint </summary>

```json showLineNumbers
{
  "identifier": "microservice",
  "title": "Microservice",
  "icon": "Service",
  "schema": {
    "properties": {
      "url": {
        "title": "URL",
        "format": "url",
        "type": "string"
      },
      "workspace": {
        "type": "string",
        "title": "Project"
      },
      "project": {
        "type": "string",
        "title": "Workspace"
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

Place the `port-app-config.yml` in the repository's root folder.

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
          identifier: ".name" # The Entity identifier will be the repository name + the pull request ID. After the Entity is created, the exporter will send `PATCH` requests to update this pull request within Port.
          title: ".name"
          blueprint: '"microservice"'
          properties:
            url: ".links.html.href" # fetch the repository URL from the Bitbucket metadata and inject it as a URL property.
            project: ".project" # fetch the project from the Bitbucket metadata and inject it as a property.
            workapce: ".workspace" # fetch the workspace from the Bitbucket metadata and inject it as a property.
```

</details>

:::info

- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform Bitbucket objects to Port Entities.
- Click [Here](https://support.atlassian.com/bitbucket-cloud/docs/event-payloads/#Repository) for the Bitbucket repository object structure.

:::

2. Push `port-app-config.yml` to your default branch.

That's it! after the push is complete, the exporter will start ingesting the Entities on the next commit to the repository.

![Developer Portal Microservice](../../../static/img/integrations/bitbucket-app/BitbucketMicroservices.png)
