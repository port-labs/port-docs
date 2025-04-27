---
sidebar_position: 4
sidebar_label: "3. Set up automatic discovery"
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import LogoImage from '/src/components/guides-section/LogoImage/LogoImage.jsx';

# Set up automatic discovery

As part of the onboarding process, Port allows you to create new `services`, `workloads`, `environments`, `users`, and `teams` via the UI.  
This involves manually selecting the components related to the new <PortTooltip id="entity">entity</PortTooltip>.

These are routine actions that most organizations perform on a regular basis, which is why this manual process is not efficient or scalable.

This guide will walk you through automating the process of creating and updating these entities in a way that suits your organization's standards.

:::tip Component definitions
Not sure what these entities mean? See their definitions [here](/getting-started/default-components).
:::

## Discovery methods

This page describes two methods you can use to automatically discover and update entities in your catalog:

1. Define one of your external tools as a "source of truth" for the resources you want to ingest.
2. Use metadata from your external tools (e.g. labels, naming conventions) to identify and update an <PortTooltip id="entity">entity</PortTooltip> in Port.

All methods require modifying the [mapping configuration](/build-your-software-catalog/customize-integrations/configure-mapping) of the relevant integration.  

<details>
<summary>**How to modify a mapping configuration (click to expand)**</summary>
1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Under "Exporters", find the relevant integration and click on it.
3. A window will open, containing the mapping configuration. Use the editor in the bottom-left corner to update the configuration.
4. Click on the "Save & Resync" button to save the changes and resync the integration.
</details>

## 1. Define a source of truth

This approach is useful when you want to create entities of a specific type (e.g. services, environments, teams, users) based on resources from a specific external tool.  

### Full example

One example that works for many organizations is to define a **Git repository** as a source of truth for `services`, and automatically create a new `service` in Port for each repository in your Git provider.  

To achieve this, we need to update the mapping configuration of the Git integration to include an entry for the `service` <PortTooltip id="blueprint">blueprint</PortTooltip>.  
Here is an example using the `GitHub` integration:

```yaml showLineNumbers
- kind: repository
  selector:
    query: 'true'
    teams: true
  port:
    entity:
      mappings:
        identifier: .full_name
        title: .name
        blueprint: '"githubRepository"'
        properties:
          readme: file://README.md
          url: .html_url
          defaultBranch: .default_branch
        relations:
          githubTeams: '[.teams[].id | tostring]'
# highlight-start
- kind: repository
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .full_name
        title: .full_name
        blueprint: '"service"'
        relations:
          repository: .full_name
# highlight-end
```

The first `kind` block is the default mapping when installing the GitHub integration. The meaning of this block is:  
*For every repository in the GitHub organization, create a new `githubRepository` entity in Port with the specified properties*.

The second `kind` block is the one we need to add. The meaning of this block is:  
*For every repository in the GitHub organization, create a new `service` entity in Port, and relate it to the relevant `githubRepository` entity*.

With this approach, `services` will always have a related repository upon creation, and can later be enriched with additional data from other assets in your catalog.

### Additional examples by integration

Just like the example above, the blocks in the examples below can be added to the mapping configuration of the relevant integration to automatically create entities in your catalog.

<Tabs groupId="sot-examples" queryString>
<TabItem value="Services">
Common examples for resources that can be used as a source of truth for `services`:
<details>
<summary><LogoImage logo="GitHub" /> **GitHub repository (click to expand)**</summary>
```yaml showLineNumbers
- kind: repository
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .full_name
        title: .full_name
        blueprint: '"service"'
        relations:
          repository: .full_name
```

<h4>Monorepo support</h4>
If you are using a monorepo, see the [working with monorepos](/build-your-software-catalog/sync-data-to-catalog/git/working-with-monorepos?git-provider=github) page to learn how to tweak the mapping configuration to create entities for each folder in the repository.  

Once you have done this, you can add the following block to the mapping configuration to create a `service` entity for each folder in the repository, and relate it to the relevant `githubRepository` entity:

```yaml showLineNumbers
# Be sure to change the `path` and `repos` values to match your monorepo structure
- kind: folder
  selector:
    query: "true"
    folders: # Specify the repositories and folders to include under this relative path
      - path: apps/* # Relative path to the folders within the repositories
        repos: # List of repositories to include folders from
          - backend-service
          - frontend-service
  port:
    entity:
      mappings:
        identifier: ".folder.name"
        title: ".folder.name"
        blueprint: '"service"'
        relations:
          repository: ".folder.name"
```
</details>

<details>
<summary><LogoImage logo="GitLab" /> **GitLab project (click to expand)**</summary>
```yaml showLineNumbers
- kind: project
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .path_with_namespace | gsub(" "; "")
        title: .name
        blueprint: '"service"'
        relations:
          git_lab_repositry: .path_with_namespace | gsub(" "; "")
```

<h4>Monorepo support</h4>
If you are using a monorepo, see the [working with monorepos](/build-your-software-catalog/sync-data-to-catalog/git/working-with-monorepos?git-provider=gitlab) page to learn how to tweak the mapping configuration to create entities for each folder in the repository.  

Once you have done this, you can add the following block to the mapping configuration to create a `service` entity for each folder in the repository, and relate it to the relevant `gitlabRepository` entity:

```yaml showLineNumbers
# Be sure to change the `path` and `repos` values to match your monorepo structure
- kind: folder
  selector:
    query: "true"
    folders: # Specify the repositories and folders to include under this relative path
      - path: "apps/" # Relative path to the folders within the repositories
        repos: # List of repositories to include folders from
          - backend-service
          - frontend-service
  port:
    entity:
      mappings:
        identifier: .folder.name
        title: .folder.name
        blueprint: '"service"'
        relations:
          git_lab_repositry: .folder.name
```
</details>

<details>
<summary><LogoImage logo="BitBucket" /> **Bitbucket repository (click to expand)**</summary>
```yaml showLineNumbers
- kind: repository
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .name
        title: .name
        blueprint: '"service"'
        relations:
          bitbucketRepository: .name
```

<h4>Monorepo support</h4>
If you are using a monorepo, see the [working with monorepos](/build-your-software-catalog/sync-data-to-catalog/git/working-with-monorepos?git-provider=bitbucket) page to learn how to tweak the mapping configuration to create entities for each folder in the repository.  

Once you have done this, you can add the following block to the mapping configuration to create a `service` entity for each folder in the repository, and relate it to the relevant `bitbucketRepository` entity:

```yaml showLineNumbers
# Be sure to change the `path` and `repos` values to match your monorepo structure
- kind: folder
  selector:
    query: "true"
    folders: # Specify the repositories and folders to include under this relative path
      - path: apps/* # Relative path to the folders within the repositories
        repos: # List of repositories to include folders from
          - backend-service
          - frontend-service
  port:
    entity:
      mappings:
        identifier: .folder.name
        blueprint: '"service"'
        relations:
          bitbucketRepository: .folder.name
```
</details>

<details>
<summary><LogoImage logo="AzureDevops" /> **Azure DevOps repository (click to expand)**</summary>
```yaml showLineNumbers
- kind: repository
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .project.name + "/" + .name | gsub(" "; "")
        title: .name
        blueprint: '"service"'
        relations:
          azureDevopsRepository: .project.name + "/" + .name | gsub(" "; "")
```
</details>

<details>
<summary><LogoImage logo="SonarQube" /> **SonarQube project (click to expand)**</summary>
```yaml showLineNumbers
- kind: projects_ga
  selector:
    query: 'true'
    apiFilters:
      qualifier:
        - TRK
    metrics:
      - code_smells
      - coverage
      - bugs
      - vulnerabilities
      - duplicated_files
      - security_hotspots
      - new_violations
      - new_coverage
      - new_duplicated_lines_density
  port:
    entity:
      mappings:
        identifier: .key
        title: .name
        blueprint: '"service"'
        relations:
          sonar_project: .key
```
</details>

<details>
<summary><LogoImage logo="Snyk" /> **Snyk target (click to expand)**</summary>
```yaml showLineNumbers
- kind: target
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id
        title: .attributes.display_name
        blueprint: '"service"'
        relations:
          snyk_target: .id
```
</details>

<details>
<summary><LogoImage logo="PagerDuty" /> **PagerDuty service (click to expand)**</summary>
```yaml showLineNumbers
- kind: services
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id
        title: .name
        blueprint: '"service"'
        relations:
          pager_duty_service: .id
```
</details>

<details>
<summary><LogoImage logo="OpsGenie" /> **OpsGenie service (click to expand)**</summary>
```yaml showLineNumbers
- kind: service
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id
        title: .name
        blueprint: '"service"'
        relations:
          _opsGenieService: .id
```
</details>

</TabItem>

<TabItem value="Environments">
Common examples for resources that can be used as a source of truth for `environments`:

<details>
<summary><LogoImage logo="Kubernetes" /> **Kubernetes cluster (click to expand)**</summary>
```yaml showLineNumbers
- kind: v1/namespaces
  selector:
    query: .metadata.name | contains("kube-system")
  port:
    entity:
      mappings:
        - identifier: env.CLUSTER_NAME
          title: env.CLUSTER_NAME
          blueprint: '"environment"'
          relations:
            k8s_cluster: env.CLUSTER_NAME
```
</details>

<details>
<summary><LogoImage logo="ArgoCD" /> **ArgoCD cluster (click to expand)**</summary>
```yaml showLineNumbers
- kind: cluster
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .name
        title: .name
        blueprint: '"environment"'
        relations:
          argo_cluster: .name
```
</details>

</TabItem>


<TabItem value="Workloads">
Common examples for resources that can be used as a source of truth for `workloads`:

<details>
<summary><LogoImage logo="Kubernetes" /> **Kubernetes workload (click to expand)**</summary>
```yaml showLineNumbers
- kind: apps/v1/deployments
  selector:
    query: .metadata.namespace | startswith("kube") | not
  port:
    entity:
      mappings:
        - identifier: >-
            .metadata.name + "-Deployment-" + .metadata.namespace + "-" + env.CLUSTER_NAME
          title: .metadata.name
          blueprint: '"workload"'
          relations:
            k8s_workload: .metadata.name + "-Deployment-" + .metadata.namespace + "-" + env.CLUSTER_NAME
```
</details>

<details>
<summary><LogoImage logo="ArgoCD" /> **ArgoCD application (click to expand)**</summary>
```yaml showLineNumbers
- kind: application
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .metadata.uid
        title: .metadata.name
        blueprint: '"workload"'
        properties:
            version: .status.summary.images[0] | split(":")[-1]
        relations:
          argo_application: .metadata.uid
```
</details>

<details>
<summary><LogoImage logo="Datadog" /> **Datadog service (click to expand)**</summary>
```yaml showLineNumbers
- kind: service
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .attributes.schema."dd-service"
        title: .attributes.schema."dd-service"
        blueprint: '"workload"'
        relations:
          datadog_service: .attributes.schema."dd-service"
```
</details>

<details>
<summary><LogoImage logo="Sentry" /> **Sentry project (click to expand)**</summary>
```yaml showLineNumbers
- kind: project-tag
  selector:
    query: 'true'
    tag: environment
  port:
    entity:
      mappings:
        identifier: .slug + "-" + .__tags.name
        title: .name + "-" + .__tags.name
        blueprint: '"workload"'
        relations:
          sentry_project: .slug + "-" + .__tags.name
```
</details>

<details>
<summary><LogoImage logo="Dynatrace" /> **Dynatrace entity (click to expand)**</summary>
```yaml showLineNumbers
- kind: entity
  selector:
    query: 'true'
    entityFields: firstSeenTms,lastSeenTms,tags
    entityTypes:
      - APPLICATION
      - SERVICE
  port:
    entity:
      mappings:
        identifier: .entityId
        title: .displayName
        blueprint: '"workload"'
        relations:
          dynatrace_entity: .entityId
```
</details>

</TabItem>

<TabItem value="Users">
Common examples for resources that can be used as a source of truth for `users`:
<details>
<summary><LogoImage logo="GitHub" /> **GitHub user (click to expand)**</summary>
```yaml showLineNumbers
- kind: user
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .login
        title: .login
        blueprint: '"_user"'
        relations:
          git_hub_user: .login
```
</details>

<details>
<summary><LogoImage logo="GitLab" /> **GitLab user (click to expand)**</summary>
```yaml showLineNumbers
- kind: user
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .username
        title: .username
        blueprint: '"_user"'
```
</details>

</TabItem>

<TabItem value="Teams">
Common examples for resources that can be used as a source of truth for `teams`:

<details>
<summary><LogoImage logo="GitHub" /> **GitHub team (click to expand)**</summary>
```yaml showLineNumbers
- kind: team
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id | tostring
        title: .name
        blueprint: '"_team"'
        relations:
          git_hub_team: .id | tostring
```
</details>

<details>
<summary><LogoImage logo="GitLab" /> **GitLab team (click to expand)**</summary>
```yaml showLineNumbers
- kind: group-with-members
  selector:
    query: 'true'
    includeBotMembers: 'true'
  port:
    entity:
      mappings:
        identifier: .full_path
        title: .name
        blueprint: '"_team"'
        relations:
          gitlab_group: .full_path
```
</details>

<details>
<summary><LogoImage logo="AzureDevops" /> **Azure DevOps team (click to expand)**</summary>
```yaml showLineNumbers
- kind: team
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id
        title: .name
        blueprint: '"_team"'
        relations:
          azure_devops_team: .id
```
</details>
</TabItem>

</Tabs>

## 2. Use predefined metadata

In addition to defining "sources of truth", you can use data from your external tools to identify and update entities in Port.  
This is useful when you want to update entities of a specific type (e.g. services, environments, teams, users) based on a label, naming convention, or other piece of metadata in a specific external tool.  

See below for various examples of how to implement this.

### Identifier is **known**

The most straightforward way to identify and update an <PortTooltip id="entity">entity</PortTooltip> is to have its identifier somewhere in the metadata of the external tool, for instance:
- In a label/tag.
- Using a naming convention, e.g. naming all PagerDuty services with the prefix `service-<identifier>`.

Here are some examples:
<Tabs groupId="metadata-examples" queryString>
<TabItem value="Service">
After installing the `PagerDuty` integration and ingesting our PagerDuty services, we may want to automatically connect them to their corresponding `service` <PortTooltip id="entity">entities</PortTooltip>.

To achieve this, we need to update the mapping configuration of the PagerDuty integration to include an entry for the `service` <PortTooltip id="blueprint">blueprint</PortTooltip>.

This example assumes that each PagerDuty service has a label named `portService` with the value being the identifier of the relevant `service` <PortTooltip id="entity">entity</PortTooltip> in Port.

```yaml showLineNumbers
- kind: services
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .metadata.labels.portService
        blueprint: '"service"'
        relations:
          pager_duty_service: .id
```

The meaning of this configuration is:  
*For every PagerDuty service ingested from PagerDuty, update the `service` entity with the identifier matching the `portService` label, relating it to this `pagerdutyService` entity*.

</TabItem>

<TabItem value="Workload">
After installing the `Kubernetes` integration and ingesting our Kubernetes workloads, we may want to automatically connect them to their corresponding `workload` <PortTooltip id="entity">entities</PortTooltip>.

To achieve this, we need to update the mapping configuration of the Kubernetes integration to include an entry for the `workload` <PortTooltip id="blueprint">blueprint</PortTooltip>.

This example assumes that each Kubernetes workload has a label named `portWorkload` with the value being the identifier of the relevant `workload` <PortTooltip id="entity">entity</PortTooltip> in Port.

```yaml showLineNumbers
- kind: apps/v1/deployments
  selector:
    query: .metadata.namespace | startswith("kube") | not
  port:
    entity:
      mappings:
        - identifier: .metadata.labels.portWorkload
          title: .metadata.name
          blueprint: '"workload"'
          relations:
            k8s_workload: .metadata.name + "-Deployment-" + .metadata.namespace + "-" + env.CLUSTER_NAME
```

The meaning of this configuration is:  
*For every Kubernetes workload ingested from Kubernetes, update the `workload` entity with the identifier matching the `portWorkload` label, relating it to this `k8s_workload` entity*.

</TabItem>

</Tabs>

### Identifier is **unknown**

If the metadata in your external tool is not an identifier, but some other property of the <PortTooltip id="entity">entity</PortTooltip> you want to update, you can use a [query rule](/search-and-query/#rules) to find the relevant entity and update it.

Let's see some examples:

<Tabs groupId="metadata-examples" queryString>
<TabItem value="Service">

The following example assumes that each PagerDuty service has a label named `portService` with the value being the `title` of the `service` entity in Port:

```yaml showLineNumbers
- kind: application
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier:
          combinator: '"and"'
          rules:
            - operator: '"="'
              property: '"$title"'
              value: .metadata.labels.portService
        blueprint: '"service"'
        relations:
          pager_duty_service: .id
```

The meaning of this configuration is:  
*For every PagerDuty service ingested from PagerDuty, update the `service` entity with the title matching the `portService` label, relating it to this `pagerdutyService` entity*.

</TabItem>

<TabItem value="Workload">
The following example assumes that each Kubernetes workload has a label named `portWorkload` with the value being the `title` of the `workload` entity in Port:

```yaml showLineNumbers
- kind: apps/v1/deployments
  selector:
    query: .metadata.namespace | startswith("kube") | not
  port:
    entity:
      mappings:
        identifier:
          combinator: '"and"'
          rules:
            - operator: '"="'
              property: '"$title"'
              value: .metadata.labels.portWorkload
        blueprint: '"workload"'
        relations:
          k8s_workload: .metadata.name + "-Deployment-" + .metadata.namespace + "-" + env.CLUSTER_NAME
```

The meaning of this configuration is:  
*For every workload ingested from Kubernetes, update the `workload` entity with the title matching the `portWorkload` label, relating it to this `k8s_workload` entity*.

</TabItem>

</Tabs>

## Connect workloads to their respective services

The methods above demonstrate how to connect `services` and `workloads` to their respective resources.  
To complete our service catalog, we need to connect `workloads` to their respective `services`.  

This too is achieved by updating the mapping configuration of the relevant integration, and adding an entry for the `workload` <PortTooltip id="blueprint">blueprint</PortTooltip>.  
One common way to match workloads to services is to use a label.  

For example, say we use ArgoCD applications to represent our workloads, and we have a label on each ArgoCD application that matches the identifier of the relevant `service` <PortTooltip id="entity">entity</PortTooltip> in Port.  
We can then update the mapping configuration of the ArgoCD integration like this:

```yaml showLineNumbers
- kind: application
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .metadata.uid
        blueprint: '"workload"'
        # highlight-start
        relations:
          service: .metadata.labels.portService
        # highlight-end
```

Note that you do not need a separate entry for this relation in the mapping configuration.  
This page separates the steps for clarity, but you can add multiple relations in the same mapping configuration block.  

For example, this is what the mapping configuration for Kubernetes workloads may look like if we added both the `service` and `k8s_workload` relations at once:

```yaml showLineNumbers
- kind: apps/v1/deployments
  selector:
    query: .metadata.namespace | startswith("kube") | not
  port:
    entity:
      mappings:
        - identifier: .metadata.labels.portWorkload
          title: .metadata.name
          blueprint: '"workload"'
          relations:
            k8s_workload: .metadata.name + "-Deployment-" + .metadata.namespace + "-" + env.CLUSTER_NAME
            service: .metadata.labels.portService
```








