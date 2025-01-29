---
sidebar_position: 4
sidebar_label: "3. Set up automatic discovery"
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import LogoImage from '/src/components/guides-section/LogoImage/LogoImage.jsx';

# Set up automatic discovery

As part of the onboarding process, Port provides you with a set of self-service actions to create new `services`, `workloads`, `environments`, `users`, and `teams`.  
These actions involve manually selecting the components related to the new entity.

These are routine tasks that most organizations perform on a regular basis, which is why the manual process of using these actions is not efficient or scalable.

This guide will walk you through automating the process of creating and updating these entities in a way that suits your organization's standards.

:::tip Component definitions
Not sure what these entities mean? See their definitions [here](/getting-started/default-components).
:::

## Choose discovery type

Automatic discovery can be configured using one of two approaches:
1. Define one of your external tools as a "source of truth" for the resources you want to ingest.
2. Use metadata from your external tools (e.g. labels) to identify and update an entity in Port.

Both options require modifying the [mapping configuration](https://docs.port.io/build-your-software-catalog/customize-integrations/configure-mapping) of the relevant integration.  

<details>
<summary>**How to modify a mapping configuration (click to expand)**</summary>
1. Go to the [data sources](https://app.getport.io/settings/data-sources) page of your portal.
2. Under "Exporters", find the relevant integration and click on it.
3. A window will open, containing the mapping configuration. Use the editor in the bottom-left corner to update the configuration.
4. Click on the "Save & Resync" button to save the changes and resync the integration.
</details>

### Option 1: Define a source of truth

This approach is useful when you want to create entities of a specific type (e.g. services, environments, teams, users) based on resources from a specific external tool.  

#### Full example

One example that works for many organizations is to define a **Git repository** as a source of truth for `services`, and automatically create a new `service` in Port for each repository in your Git provider.  

To achieve this, we need to update the mapping configuration of the Git integration to include an entry for the `service` blueprint.  
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

#### Additional examples by integration

Just like the example above, the blocks in the examples below can be added to the mapping configuration of the relevant integration to automatically create entities in your catalog.

<Tabs>
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
</details>

<details>
<summary><LogoImage logo="Bitbucket" /> **Bitbucket repository (click to expand)**</summary>
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
</details>

<details>
<summary><LogoImage logo="AzureDevOps" /> **Azure DevOps repository (click to expand)**</summary>
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
        blueprint: '"service"'
        relations:
          pager_duty_service: .id
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
        sentry_project: .id | tostring
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
            .metadata.name + "-Deployment-" + .metadata.namespace + "-" +
            env.CLUSTER_NAME
          title: .metadata.name
          blueprint: '"workload"'
          relations:
            k8s_workload: >-
            .metadata.name + "-Deployment-" + .metadata.namespace + "-" +
            env.CLUSTER_NAME
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
        relations:
          argo_application: .metadata.uid
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
<summary><LogoImage logo="AzureDevOps" /> **Azure DevOps team (click to expand)**</summary>
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

### Option 2: Use predefined metadata

Another way to automatically update your catalog is to use data from your external tools to identify a specific entity in Port.  
This approach is useful when you want to update entities of a specific type (e.g. services, environments, teams, users) based on a tag, label, or other piece of metadata in a specific external tool.  

Note that this approach requires you to have a way to identify the Port entity that you want to update.  
This is usually achieved by adding a tag or label to the resource in the external tool, with an indicative key (for example, prefixed with `port-`).

#### Full example

After installing the `ArgoCD` integration and ingesting our ArgoCD applications, we may want to automatically connect them to their corresponding `service` entities.

To achieve this, we need to update the mapping configuration of the ArgoCD integration to include an entry for the `service` blueprint.

This example assumes that each ArgoCD application has a label named `portService` with the value being the identifier of the relevant `service` entity in Port.

```yaml showLineNumbers
  - kind: application
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .metadata.labels.portService
          blueprint: '"service"'
          relations:
            argocdApplication: .metadata.uid
```

The meaning of this configuration is:  
*For every application ingested from ArgoCD, update the `service` entity with the identifier matching the `portService` label, relating it to this `argocdApplication` entity*.

#### Map by property

If the label's value is not an identifier, but some other property of the entity, you can use a [query rule](/search-and-query/#rules) to find the relevant entity and update it.

For example, say each ArgoCD application has a label named `portService` with the value being the `title` of the `service` entity in Port. We can use the following mapping configuration:

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
            argocdApplication: .metadata.uid
```

The meaning of this configuration is:  
*For every application ingested from ArgoCD, update the `service` entity with the title matching the `portService` label, relating it to this `argocdApplication` entity*.
