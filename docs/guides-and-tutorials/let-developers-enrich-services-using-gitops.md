---
sidebar_position: 5
title: Let developers enrich services using Gitops
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Let developers enrich services using Gitops

This guide takes 10 minutes to complete, and aims to demonstrate Port's flexibility when working with Gitops.

:::tip Prerequisites

- This guide assumes you have a Port account and a basic knowledge of working with Port. If you haven't done so, go ahead and complete the [quickstart](/quickstart).
- You will need a Github repository in which you can place a workflow that we will use in this guide. If you don't have one, we recommend [creating a new repository](https://docs.github.com/en/get-started/quickstart/create-a-repo) named `Port-actions`.
- You will need to have [Port's Github app](https://github.com/apps/getport-io) installed in your Github organization (the one that contains the repository you'll work with).

:::

### The goal of this guide

In this guide we will enrich a service in Port using Gitops. In reality, this can be used by developers to independently add additional valuable data about their services to Port.

After completing it, you will get a sense of how your organization's daily routine could look like:

- Developers will be able to enrich their services without needing to nag devops engineers.
- Platform engineers will be able to create RBAC-controlled actions for developers, empowering their independence.
- R&D managers will be able to track additional, valuable data about services in the organization.

### Model domains for your services

Services that share a business purpose (e.g. payments, shipping) are often grouped together using domains. Let's create a blueprint to represent a domain in Port:

1. Go to your [Builder](https://app.getport.io/dev-portal/data-model), click on the `Add` button in the top right corner, then choose `Custom blueprint`:

<img src='/img/quickstart/builderAddCustomBlueprint.png' width='30%' />

<br/><br/>

2. Click on the `Edit JSON` button in the top right corner, replace the content with the following definition, then click `Create`:

<details>
<summary><b>Blueprint JSON (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "domain",
  "title": "Domain",
  "icon": "TwoUsers",
  "schema": {
    "properties": {
      "architecture": {
        "title": "Architecture",
        "type": "string",
        "format": "url",
        "spec": "embedded-url"
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

### Connect your services to their domains

Now that we have a blueprint to represent a domain, let's connect it to our services. We will do this by adding a relation to the `Service` blueprint:

1. Go to your [Builder](https://app.getport.io/dev-portal/data-model), expand the `Service` blueprint, and click on `New relation`:

<img src='/img/guides/serviceCreateRelation.png' width='30%' />

<br/><br/>

2. Fill out the form like this, then click `Create`:

<img src='/img/guides/gitopsDomainRelationForm.png' width='50%' />

### Create domains via Gitops

Now that we have a `Domain` blueprint, we can create some domains in Port. This can be done manually from the UI, or via Gitops which is the method we will use in this guide.

1. In a Github repository, create a new file named `port.yml` in the root directory, and use the following snippet as its content:

<details>
<summary><b>port.yml (click to expand)</b></summary>

```yaml showLineNumbers
- identifier: payment
  title: Payment
  blueprint: domain
  properties:
    architecture: https://lucid.app/documents/embedded/533f05ad-aa68-43ce-9499-c5f767dc8ea5
- identifier: shipping
  title: Shipping
  blueprint: domain
  properties:
    architecture: https://lucid.app/documents/embedded/533f05ad-aa68-43ce-9499-c5f767dc8ea5
```

</details>

2. Head back to your [software catalog](https://app.getport.io/domains), you will see that Port created two new `domain` entities:

<img src='/img/guides/gitopsDomainEntities.png' width='50%' />

The `architecture` property is a URL to a Lucidchart diagram. This is a handy way to track a domain's architecture in your software catalog.

### Create an action to enrich services

As platform engineers, we want to enable our developers to perform certain actions on their own. Let's create an action that developers can use to add data to a service, and allocate it to a domain.

#### Create the action's frontend

1. Go to your [Self-service page](https://app.getport.io/self-serve), click on the `Add` button in the top right corner, then choose `Create self-service action`:

### Possible daily routine integrations

- Send a slack message in the R&D channel to let everyone know that a new deployment was created.
- Notify Devops engineers when a service's availability drops.
- Send a weekly/monthly report to R&D managers displaying the health of services' production runtime.

### Conclusion

Kubernetes is a complex environment that requires high-quality observability. Port's Kubernetes integration allows you to easily model and visualize your Kubernetes resources, and integrate them into your daily routine.  
Customize your views to display the data that matters to you, grouped or filtered by teams, namespaces, or any other criteria.  
With Port, you can seamlessly fit your organization's needs, and create a single source of truth for your Kubernetes resources.

More guides & tutorials will be available soon, in the meantime feel free to reach out with any questions via our [community slack](https://www.getport.io/community) or [Github project](https://github.com/port-labs?view_as=public).
