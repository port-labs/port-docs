---
sidebar_position: 2
title: Getting started
sidebar_label: Getting started
sidebar_class_name: custom-sidebar-item sidebar-menu-getting-started
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Getting started

After [signing up](https://app.getport.io) to Port, you will be prompted to follow an onboarding process that includes ingesting your Git repositories into your developer portal.  

After completing the onboarding process, Port will create some components for you (using your real data 😎) in order to show you the potential of your portal.  

We highly recommend completing the onboarding process in order to get a basic understanding of Port and an idea of how a good developer portal can help you and your developers.  

:::info onboarding skipped
If you chose to **skip** the onboarding process, you can still have these components created for you by connecting Port to your desired Git provider:
- Go to the [data-sources page](https://app.getport.io/dev-portal/data-sources) of your portal.
- Click on `+ Data source` in the top right corner, and choose your desired Git provider.
:::

## Initial portal experience

<br/>
<center>

<iframe width="60%" height="400" src="https://www.youtube.com/embed/ggXL2ZsPVQM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>

</center>
<br/>
In this walkthrough, we will go over the components in your portal and learn about the different pillars of Port.

### Homepage

Let's start in our [homepage](https://app.getport.io/organization/home). The homepage serves as a hub that accommodates your developers' routines. It is a fully-customizable dashboard, where you can create widgets to visualize & track data that matters to you and your developers.  

Initially, your homepage contains two widgets:
1. A markdown file that introduces the portal and its contents. Such a widget can be used to relay information to your developers or describe actions, blueprints and entities in the portal.
2. An iframe widget with a walkthrough video.

**Learn more:**

- [Dashboard widgets](https://docs.getport.io/customize-pages-dashboards-and-plugins/dashboards/#widget-types)

---

### Blueprints

A blueprint is Port's basic building block, used to model any data source you would like to add to your software catalog.  
Head over to your [builder](https://app.getport.io/dev-portal/data-model) - this is where you create, edit and relate blueprints.  

As you can see, after connecting your Git provider to Port, a new `Service` blueprint is automatically created. This blueprint represents a service in your organization, implemented in a Git repository. It comes with some predefined [properties](https://docs.getport.io/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/).

**Learn more:**

- [Setup blueprints](https://docs.getport.io/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/)
- [Relate Blueprints](https://docs.getport.io/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/)

---

### Data sources

Data sources are the different integrations and/or methods that Port uses to ingest data from your tools and platforms.  
They are created and configured in the [data sources](https://app.getport.io/dev-portal/data-sources) page of your portal.

After connecting your Git provider to Port, a data source will be automatically created for you, with default configuration that tells Port where to get the data and where to map it to in Port.

**Learn more:**

- [Configure mapping](https://docs.getport.io/build-your-software-catalog/customize-integrations/configure-mapping)

---

### Entities

An entity is an instance of a blueprint, representing the data defined by that blueprint's properties. Entities are displayed in the [software catalog](https://app.getport.io/services) page of the portal.  

After connecting your Git provider to Port, you will see all of your services (Git repositories) in the `Services` page of the catalog.

**Learn more:**

- [Creating entities](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/#creating-entities)

---

### Self-service actions

Port allows you to create flexible, permission-controlled actions for your developers to use. Actions are created and executed from the [self-service](https://app.getport.io/self-serve) page of the portal.  

You should see several actions in your portal. An action in Port has two parts:
- A frontend - this is where you define the action type and its inputs.
- A backend - this is where the action's logic is triggered. Port supports a variety of backends.

:::info completing your actions
The existing actions in your portal only have their frontends defined. To finish setting up an action, click on the link attached to it to follow a dedicated guide.
:::

**Learn more:**

- [Self-service experiences](https://docs.getport.io/create-self-service-experiences/)

---

### Scorecards

Another one of Port's main pillars is scorecards. Scorecards are used to define and track metrics for your resources, and can be used to enforce standards in your organization.  
Scorecards are defined per blueprint, and can be created/modified from the blueprint itself in your [builder](https://app.getport.io/dev-portal/data-model).

Take a look at your `Service` blueprint, it has a `Production Readiness` scorecard that defines and track three rules.  

**Learn more:**

- [Promote scorecards](https://docs.getport.io/promote-scorecards/)

---

### Dashboards

In addition to your [homepage](#homepage), you can also create dashboards in your [software catalog](https://app.getport.io/services). These are used to track and visualize data about your [entities](#entities).

Your software catalog should already have two dashboard pages:

#### Services overview

This dashboard contains widgets with real data about your services. It is completely customizable, and serves as an example of how you can use dashboards to track and visualize data about your entities.

#### Scorecard dashboard

This dashboard also visualizes data about your services, but this time the focus is on the services' scorecards. It serves as an example of how you can use dashboards to track metrics and easily see how well your standards are enforced across your resources.

**Learn more:**

- [Dashboard page](https://docs.getport.io/customize-pages-dashboards-and-plugins/page/dashboard-page)
- [Dashboard widgets](https://docs.getport.io/customize-pages-dashboards-and-plugins/dashboards/)

---

## What's next?

Now that you have a basic understanding of Port's main pillars, you can start customizing your portal to suit your needs. Here are some great ways to begin:

&nbsp;&nbsp;&nbsp; ❇️ Finish setting up your [self-service actions](#self-service-actions) and take them for a spin.  
&nbsp;&nbsp;&nbsp; ❇️ Complete one of our [guides](https://docs.getport.io/guides-and-tutorials) to learn how to use Port to address real use-cases.  
&nbsp;&nbsp;&nbsp; ❇️ Join our [community Slack](https://www.getport.io/community) to ask questions and share your experience with Port.  
&nbsp;&nbsp;&nbsp; ❇️ Working with **monorepos**? See our [quick guide](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/git/working-with-monorepos) on how to adjust your configuration.
