import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import BitbucketResources from './\_bitbucket_integration_supported_resources.mdx'


# Bitbucket

Port's Bitbucket integration allows you to model Bitbucket cloud resources in your software catalog and ingest data into them.

:::info Bitbucket Server (Self-Hosted)
This documentation covers Port's integration with **Bitbucket Cloud**. 
For information about integrating with Bitbucket Server (Self-Hosted), please refer to the [Bitbucket Server integration documentation](/build-your-software-catalog/custom-integration/webhook/examples/bitbucket-server/bitbucket-server.md).
:::


## Overview

This integration allows you to:

- Map and organize your desired Bitbucket cloud resources and their metadata in Port (see supported resources below).
- Watch for Bitbucket object changes (create/update/delete) in real-time, and automatically apply the changes to your software catalog.
- Map and ingest monorepo repositories.
- Manage port entities using GitOps.

### Supported resources

The resources that can be ingested from Bitbucket into Port are listed below.  
It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

<BitbucketResources/>


## Setup

To install Port's Bitbucket cloud integration, see the [installation](./installation.md#setup) page.


## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Default mapping configuration

This is the default mapping configuration for this integration:

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
resources:
- kind: project
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .uuid | gsub("[{-}]"; "")
        title: .name
        blueprint: '"bitbucketProject"'
        properties:
          private: .is_private
          description: .description
          type: .type
          url: .links.html.href
- kind: repository
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .name
        title: .name
        blueprint: '"bitbucketRepository"'
        properties:
          url: .links.html.href
          defaultBranch: .mainbranch.name
          readme: file://README.md
        relations:
          project: .project.uuid | gsub("[{-}]"; "")
- kind: pull-request
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .destination.repository.name + (.id|tostring)
        title: .title
        blueprint: '"bitbucketPullRequest"'
        properties:
          creator: .author.display_name
          assignees: '[.participants[].user.display_name]'
          reviewers: '[.reviewers[].user.display_name]'
          status: .state
          createdAt: .created_on
          updatedAt: .updated_on
          link: .links.html.href
        relations:
          repository: .destination.repository.name
```

</details>




## Capabilities

### Ingesting Git objects

By using Port's Bitbucket integration, you can automatically ingest Bitbucket resources into Port based on real-time events.

The integration allows you to ingest a variety of objects resources provided by the Bitbucket API, including repositories, pull requests and files. It also allows you to perform "extract, transform, load (ETL)" on data from the Bitbucket API into the desired software catalog data model.

When you install the integration, Port will automatically create a `bitbucketProject`, `bitbucketRepository` and `bitbucketPullRequest` blueprints in your catalog (representing a BitBucket project, repository and pull request respectively). 

The YAML configuration mapping will also be added to the [data sources](https://app.getport.io/settings/data-sources) page of your portal where you can manage the integration.

### Ingest files from your repositories

Port allows you to fetch `JSON` and `YAML` files from your repositories, and create entities from them in your software catalog. This is done using the `file` kind in your Bitbucket mapping configuration. Changes to the files are tracked through repository `push` events and periodic resyncs.

For example, say you want to manage your `package.json` files in Port. One option is to create a `manifest` blueprint, with each of its entities representing a `package.json` file.

The following configuration fetches all `package.json` files from "MyRepo" and "MyOtherRepo", and creates an entity for each of them, based on the `manifest` blueprint:

```yaml showLineNumbers
resources:
  - kind: file
    selector:
      query: 'true'
      files:
        # Note that glob patterns are not supported, so you can use only '*' wildcard to match multiple directories and subdirectories
        path: '/*'
        filenames:
          - package.json
        # The `repos` key can be used to filter the repositories from which the files will be fetched
        repos:
          - "MyRepo"
          - "MyOtherRepo"
        skipParsing: false
    port:
      entity:
        mappings:
          identifier: .file.path
          title: .file.name
          blueprint: '"manifest"'
          properties:
            project_name: .content.name
            project_version: .content.version
            license: .content.license
```

:::tip Test your mapping
After adding the `file` kind to your mapping configuration, click on the `Resync` button. When you open the mapping configuration again, you will see real examples of files fetched from your Bitbucket organization.  

This will help you see what data is available to use in your `jq` expressions.   
Click on the `Test mapping` button to test your mapping against the example data.

In any case, the structure of the available data looks like this:
<details>
<summary><b>Available data example (click to expand)</b></summary>

```json showLineNumbers
{
  "content":{
    "name":"my-awesome-project",
    "version":"1.0.0",
    "description":"A sample Node.js project",
    "main":"index.js",
    "scripts":{
      "start":"node index.js",
      "test":"echo \"Error: no test specified\" && exit 1"
    },
    "dependencies":{
      "express":"^4.17.1"
    }
  },
  "metadata":{
    "path":"package.json",
    "commit":{
      "hash":"fe0dce2d09e1545068b8f5b4b95807c12b49c1f4",
      "links":{
        "self":{
          "href":"https://api.bitbucket.org/2.0/repositories/port-test/port-repo-3/commit/fe0dce2d09e1545068b8f5b4b95807c12b49c1f4"
        },
        "html":{
          "href":"https://bitbucket.org/port-test/port-repo-3/commits/fe0dce2d09e1545068b8f5b4b95807c12b49c1f4"
        }
      },
      "type":"commit",
      "repository":{
        "type":"repository",
        "full_name":"port-test/port-repo-3",
        "links":{
          "self":{
            "href":"https://api.bitbucket.org/2.0/repositories/port-test/port-repo-3"
          },
          "html":{
            "href":"https://bitbucket.org/port-test/port-repo-3"
          },
          "avatar":{
            "href":"https://bytebucket.org/ravatar/%7B14892ea7-2241-4b96-a37a-93ab59b6479b%7D?ts=default"
          }
        },
        "name":"port-repo-3",
        "uuid":"{14892ea7-2241-4b96-a37a-93ab59b6479b}",
        "mainbranch":{
          "name":"new"
        }
      }
    },
    "type":"commit_file",
    "links":{
      "self":{
        "href":"https://api.bitbucket.org/2.0/repositories/port-test/port-repo-3/src/fe0dce2d09e1545068b8f5b4b95807c12b49c1f4/package.json"
      }
    }
  },
  "repo":{
    "type":"repository",
    "full_name":"port-test/port-repo-3",
    "links":{
      "self":{
        "href":"https://api.bitbucket.org/2.0/repositories/port-test/port-repo-3"
      },
      "html":{
        "href":"https://bitbucket.org/port-test/port-repo-3"
      },
      "avatar":{
        "href":"https://bytebucket.org/ravatar/%7B14892ea7-2241-4b96-a37a-93ab59b6479b%7D?ts=default"
      }
    },
    "name":"port-repo-3",
    "uuid":"{14892ea7-2241-4b96-a37a-93ab59b6479b}",
    "mainbranch":{
      "name":"main"
    }
  },
  "branch":"main"
}
```
</details>
:::

#### Create multiple entities from a single file

In some cases, we would like to parse a single JSON/YAML file and create multiple entities from it.  
For this purpose, we can use the `itemsToParse` key in our mapping configuration.

For example, say you want to track/manage a project's dependencies in Port. One option is to create a `package` blueprint, with each of its entities representing a dependency from a `package.json` file.

The following configuration fetches a `package.json` file from a specific repository, and creates an entity for each of the dependencies in the file, based on the `package` blueprint:

```yaml showLineNumbers
resources:
  - kind: file
    selector:
      query: 'true'
      files:
        path: '/*'
        filenames:
          - package.json
        # Note that in this case we are fetching from a specific repository
        repos:
          - "MyRepo"
        skipParsing: false
    port:
      itemsToParse: .content.dependencies | to_entries
      entity:
        mappings:
          # Since identifier cannot contain special characters, we are using jq to remove them
          identifier: >-
            .item.key + "_" + if (.item.value | startswith("^")) then
            .item.value[1:] else .item.value end
          title: .item.key + "@" + .item.value
          blueprint: '"package"'
          properties:
            package: .item.key
            version: .item.value
          relations: {}
```

The `itemsToParse` key is used to specify the path to the array of items you want to parse from the file. In this case, we are parsing the `dependencies` array from the `package.json` file.  
Once the array is parsed, we can use the `item` key to refer to each item in the array.

#### Multi-document YAML files

For multi-document YAML files (a single file containing multiple YAML documents separated by `---`), `.content` will not resolve to an object, but to an array of objects.

You can use one of these methods to ingest multi-document YAML files:

1. Use the `itemsToParse` key to create multiple entities from such a file (see example above).
2. Map the result to an `array` property.

:::tip Mixed YAML types
If you have both single-document and multi-document YAML files in your repositories, you can use the `itemsToParse` key like this to handle both cases:

```yaml
itemsToParse: .file.content | if type== "object" then [.] else . end
```
:::

#### Path Structure

Files are referenced using paths relative to the repository root. For example:

✅ Valid paths:
- `/`
- `integrations/*`
- `docs/`
- `src/config/`
- `deployment/k8s/`

❌ Invalid paths:
- `/README.md` (leading slash)
- `C:/repo/config.json` (absolute path)
- `../other-repo/file.txt` (parent directory reference)
- `**/*.yaml` (unsupported glob pattern)

#### Best Practices

For optimal performance and maintainability:

- Limit the number of tracked files per repository
- Use the `repos` selector to scope file ingestion to specific repositories
- Use `skipParsing: true` for non-JSON/YAML files

#### Limitations

The following limitations apply to the file mapping feature in the Bitbucket integration:

- **File Size**: Files must be 320kb or smaller to be ingested
- **Path Patterns**: Only the `*` wildcard is supported in paths. Other glob patterns (e.g., `**/*.json`) are not supported
- **Branch Support**: Only files from the default branch can be ingested
- **Special Characters**: Special characters in filenames are automatically stripped by the API


## Permissions

Port's Bitbucket integration requires the following scopes to be enabled on either a workspace token or app password:

- `workspace`: `read`;
- `project`: `read`;
- `repository`: `read`;
- `pullrequest`: `read`;
- `webhooks`.

:::tip Default permissions
You will be prompted to add these permissions while creating a new workspace token or app password.
:::

## Examples

Refer to the [examples](./examples.md) page for practical configurations and their corresponding blueprint definitions.

## Relevant Guides

For relevant guides and examples, see the [guides section](https://docs.port.io/guides?tags=BitBucket).

## GitOps

Port's Bitbucket integration also provides GitOps capabilities, refer to the [GitOps](./gitops/gitops.md) page to learn more.

## Advanced

For advanced configuration options and use cases, refer to the [advanced](./advanced.md) page.
