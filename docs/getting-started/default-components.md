---
sidebar_position: 5
title: Default components
sidebar_label: "Default components"
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import LogoImage from '/src/components/guides-section/LogoImage/LogoImage.jsx';

# Default components

In addition to the components created in the previous steps, Port will create a few default components for you (even if you did not select any tools).

## Blueprints

Several blueprints used to represent common concepts in your organization will be created automatically.

You can view and edit blueprints in the [data model page](https://app.getport.io/settings/data-model) of your portal.

### <img src="/img/icons/service.svg" style={{"vertical-align": "middle"}} className="not-zoom" /> Service

`_service` - a flexible <PortTooltip id="blueprint">blueprint</PortTooltip> representing a piece of software that is owned by a team/group in your organization.  
  
This blueprint serves as a single component with rich context about all the resources related to the software, such as:
- **The code itself** - a repository or a specific folder in a monorepo.
- **Incident management** components, such as a PagerDuty service.
- **Code scanning** components, such as Snyk Targets or Sonar Cloud projects.
- **Project management** components, such as Jira projects and issues.
- **Runtime** components, such as workloads.
  
Services are the core component of R&D operations within a developer portal, providing each team with a unified view of its services and their status across different domains, such as **security**, **stability**, **access management**, and more.

### <img src="/img/icons/environment.svg" style={{"vertical-align": "middle"}} className="not-zoom" /> Environment

`_environment` - represents a deployment environment in your organization.  

In addition to this <PortTooltip id="blueprint">blueprint</PortTooltip>, 3 default <PortTooltip id="entity">entities</PortTooltip> will be created: `Dev`, `Test` and `Prod`.  
You can modify the default environments and/or create additional ones.

### <img src="/img/icons/workload.svg" style={{"vertical-align": "middle"}} className="not-zoom" /> Workload

`_workload` - represents a `service` running in a specific `environment`, with context of the relevant related components.

For example, a `frontend` service in your organization can have `frontend-prod` and `frontend-test` workloads, each with its own Kubernetes namespace, Sentry project, and owning team.

### <LogoImage logo="User" verticalAlign="middle" /> User 

`_user` - represents a user in your organization.  

This blueprint can be related to other "user" blueprints coming from your data sources, such as `github_user`, allowing you to manage a user across multiple tools from a single component.  

### <LogoImage logo="Team" verticalAlign="middle" /> Team

`_team` - represents a team in your organization. 

This blueprint can be related to other "team" blueprints coming from your data sources, such as `github_team`, allowing you to manage a team across multiple tools from a single component.

Users in Port can be assigned to teams, allowing you to implement ownership of components in your portal. 