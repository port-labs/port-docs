---
displayed_sidebar: null
description: Learn how to automatically discover and sync your software catalog
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Set up automatic discovery

As part of the onboarding process, Port provides you with a set of self-service actions to create new services, workloads, environments, users, and teams.  
These actions involve manually selecting the components related to the new entity.

These are routine tasks that most organizations perform on a regular basis, which is why the manual process of using these actions is not efficient or scalable.

This guide will walk you through automating the process of creating these entities in a way that suits your organization's standards.


## Prerequisites

This guide assumes you have a Port account with permissions to create blueprints and self-service actions.

## Choose discovery type

Automatic discovery can be configured using one of two approaches:
1. Define one of your external tools as a "source of truth" for the resources you want to ingest.
2. Use the integration's <PortTooltip content="mapping">mapping</PortTooltip> to create resources from the integration.

### 1. Define a source of truth

This approach is useful when you want to create entities of a specific type (e.g. services, environments, teams, users) based on resources from a specific external tool.  

#### Examples

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
        identifier: .name
        title: .name
        blueprint: '"service"'
        relations:
          repository: .full_name
# highlight-end
```

The first `kind` block is the default mapping when installing the GitHub integration. The meaning of this block is:  
*For every repository in the GitHub organization, create a new `githubRepository` entity in Port with the specified properties*.

The second `kind` block is the one we need to add. The meaning of this block is:  
*For every repository in the GitHub organization, create a new `service` entity in Port, and relate it to the relevant `githubRepository` entity*.

With this approach, `services` will be will always have a related repository upon creation, and can later be enriched with additional data from other assets in your catalog.

### 2. Use predefined metadata

Another way to automatically update your catalog is to use data from your external tools to identify a specific entity in Port.  
This approach is useful when you want to update entities of a specific type (e.g. services, environments, teams, users) based on a tag, label, or other piece of metadata in a specific external tool.  

Note that this approach requires you to have a way to identify the Port entity that you want to update.  
This is usually achieved by adding a tag or label to the resource in the external tool, with an indicative key (for example, prefixed with `port-`).

#### Examples

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
            # combinator: '"and"'
            # rules:
            #   - operator: '"="'
            #     property: '"$identifier"'
            #     value: .metadata.labels.portService
          blueprint: '"service"'
          relations:
            argocdApplication: .metadata.uid
```

The meaning of this configuration is:  
*For every application in the ArgoCD , update the `service` entity with the identifier matching the `portService` label, relating it to this `argocdApplication` entity*.



## Possible enhancements

This guide provides a basic setup for announcements in your portal.  
You can further enhance the announcements mechanism by customizing the actions and widgets, for example:
- **Customize the announcement template**: You can customize the default message template in the `Announce message` action to include your own message format.
- **Add more properties to the announcement blueprint**: You can add more properties to the announcement blueprint to include additional information, such as the author of the announcement or a link to more details.
- **Send announcements to specific users**: You can modify the `Announce message` action to allow users to select specific users or teams to send the announcement to.
- **Send announcements to additional channels**: You can modify the `Announce message` action to send announcements via email, Slack, or other channels in addition to the portal homepage.