---
sidebar_position: 5
---

import RepositoryBlueprint from './\_azuredevops_exporter_example_repository_blueprint.mdx'

# Mapping Extensions

## Introduction

The default way to map your data to Port is by using [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform your data to Port entities.

However, in some cases you may want to map data to Port in a way that default JQ mapping is not enough.

Possible Use Cases:

- Map your repository README.md file contents into Port;
- Check if a specific file exists in your repository;
- Check if a specific string exists in your repository;
- Check if a specific version of a package is used in your repository;
- Check if a CI/CD pipeline is configured in your repository;

## Mapping file content into Port

The following example demonstrates how to define and export your Azure Devops projects and their **README.md** file contents to Port:

<RepositoryBlueprint/>

As we can see one of the properties is of type markdown, this means that we need to map the **README.md** file contents into Port.

To do so, we will use the `file://` prefix with the path of the file to tell the Azure Devops exporter that we want to map the contents of a file into Port.

```yaml showLineNumbers
  - kind: repository
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: >-
            "\(.project.name | ascii_downcase | gsub("[ ();]"; ""))/\(.name | ascii_downcase | gsub("[ ();]"; ""))"
          title: .name
          blueprint: '"service"'
          properties:
            url: .remoteUrl
            // highlight-next-line
            readme: file://README.md
```

## Link pipelines to repositories via selector
You can configure your selector to include repository information in the pipeline entity mapping.
This allows you to create a direct relationship between a pipeline and its source repository.

```yaml showLineNumbers
- kind: pipeline
  selector:
    query: 'true'
    # highlight-next-line
    includeRepo: 'true'
  port:
    entity:
      mappings:
        identifier: .id | tostring
        title: .name
        blueprint: '"azureDevOpsPipeline"'
        properties:
          url: .url
          revision: .revision
          folder: .folder
        relations:
          project: .__projectId | gsub(" "; "")
          repository: >-
            if .__repository
            then .__repository.project.name + "/" + .__repository.name | gsub(" "; "")
            else null
            end
```
:::tip Recommendation
Use this only when necessary, as including repository data requires an extra API call per pipeline, which increases the number of requests made and can impact your Azure DevOps API rate limits.

If you don’t require repo-level linkage, it’s more efficient to relate pipelines → projects instead.
:::
