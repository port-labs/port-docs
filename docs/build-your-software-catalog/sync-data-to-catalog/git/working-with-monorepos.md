---
sidebar_position: 4
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Working with monorepos

<br/>
After [connecting your Git provider](/build-your-software-catalog/sync-data-to-catalog/git/) to Port, Port will automatically create an <PortTooltip id="entity">entity</PortTooltip> for each repository in the organization in which you installed the integration.  

If you're working with a **monorepo** and would like to create an entity for each microservice in a single repository instead, you can do that by making an adjustment to your Git integration's mapping:

1. Go to the [data-sources page](https://app.getport.io/settings/data-sources) of your portal.
2. Under `Exporters`, click on the Git provider you would like to edit, for example:

<img src='/img/sync-data-to-catalog/monorepoDataSourcesExample.png' width='50%' />

<br/><br/>

3. A window will open with a YAML mapping of the integration.  
Use the following snippet as needed for your use-case (either add the `folder` entry to the `resources` array, or replace the entire YAML with it):

:::info Choose repos and folders to include
In the snippet below, change the `path` and `repos` fields to your desired values before copying.
:::

<Tabs groupId="git-provider" queryString values={[
  { value: 'github', label: 'GitHub' },
  { value: 'gitlab', label: 'GitLab' },
  { value: 'bitbucket', label: 'BitBucket' },
  { value: 'azure-devops', label: 'Azure DevOps (coming soon)' },]}>

<TabItem value="github">

```yaml showLineNumbers
resources:
  - kind: folder
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
      folders: # Specify the repositories and folders to include under this relative path.
        #highlight-start
        - path: apps/* # Relative path to the folders within the repositories.
          repos: # List of repositories to include folders from.
            - backend-service
            - frontend-service
        #highlight-end
    port:
      entity:
        mappings:
          identifier: ".folder.name"
          title: ".folder.name"
          blueprint: '"githubRepository"'
          properties:
            url: .repo.html_url + "/tree/" + .repo.default_branch  + "/" + .folder.path
            readme: file://README.md
```

</TabItem>

<TabItem value="gitlab">

```yaml showLineNumbers
resources:
  - kind: folder
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
      folders: # Specify the repositories and folders to include under this relative path.
        #highlight-start
        - path: "apps/" # Relative path to the folders within the repositories.
          repos: # List of repositories to include folders from.
            - backend-service
            - frontend-service
        #highlight-end
    port:
      entity:
        mappings:
          identifier: .folder.name
          title: .folder.name
          blueprint: '"gitlabRepository"'
          properties:
            url: >-
              .repo.web_url + "/tree/" + .repo.default_branch  + "/" +
              .folder.path
            language: .repo.__languages | to_entries | max_by(.value) | .key
            readme: file://README.md
```

</TabItem>

<TabItem value="bitbucket">

```yaml showLineNumbers
resources:
  - kind: folder
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
      folders: # Specify the repositories and folders to include under this relative path.
        #highlight-start
        - path: apps/* # Relative path to the folders within the repositories.
          repos: # List of repositories to include folders from.
            - backend-service
            - frontend-service
        #highlight-end
    port:
      entity:
        mappings:
          identifier: .folder.name
          blueprint: '"bitbucketRepository"'
          properties:
            url: .repo.links.html.href + "/src/" + .repo.mainbranch.name + "/" + .folder.path
            readme: file://README.md
```

</TabItem>
<TabItem value="azure-devops">

:::info Azure DevOps support
Currently monorepo support is available for the Git providers listed below.  
Support for Azure DevOps is coming soon. Stay tuned!
:::

</TabItem>

</Tabs>

4. Click on `Resync` to apply the changes.

5. Head back to your [catalog](https://app.getport.io/organization/catalog), as you can see Port has now created an entity for each folder in the specified repositories, instead of creating an entity for each repository.