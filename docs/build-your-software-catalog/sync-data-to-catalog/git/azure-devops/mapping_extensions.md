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

In the following example you will define and export your Azure Devops projects and their **README.md** file contents to Port:

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
          identifier: .project.name + "/" + .name
          title: .name
          blueprint: '"azureDevopsRepository"'
          properties:
            url: .url
            // highlight-next-line
            readme: file://README.md
```