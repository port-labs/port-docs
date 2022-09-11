---
sidebar_position: 2
---

# Quickstart

## What is Port?

Port is a Developer Platform made to make life easier for developers and DevOps in an organization, by creating a single platform that acts as a single source-of-truth for all of the infrastructure assets and operations existing in the organization's tech stack.

Port then allows engineers to perform actions on these assets in a self-service fashion. From provisioning a dev environment, understanding who is the owner of a microservice, or any unique use case DevOps want to self-serve and automate.

### Port helps you to:

- Create a comprehensive **Software Catalog** by mapping all your software and infrastructure components in one place: microservices, monoliths, deployments, repos, databases, and more.
- Let your developers provision, terminate and perform day 2 operations on any asset exposed (microservice or not) in your catalog, within the policies and guardrails you’ve set, ensuring unified standards and governance over the processes inside your organization.

Port's three core building blocks are _Blueprints_, _Entities_ and _Relations_. This tutorial will walk you through your first steps on the platform and get you started on your Developer Portal journey!🚢

## Define a blueprint

Blueprints are used to model data in Port. A Blueprint allows us to define what properties and fields an _Entity_ will contain.

Architectures and deployments vary greatly, and so do preferences and standards for data representation and asset structure. Therefore, in Port, You have full control of the way data is presented using any data format you desire, so that the Software Catalog truly represents all you need for the developer portal.

But for now, let's start with a simple example:

Your organization uses a microservice architecture; different microservices use packages to manage code reused by various microservices.

To create your Software Catalog, you need to to ingest and track your microservices, track which package (and which version) is used in which microservice, and which package is used in multiple microservices.

Let's head to [Port](https://app.getport.io/blueprints) and look at the Blueprints page, at the top right corner let's click on **Add Blueprint** and configure our first blueprint - **Microservice** as shown in the image below:

![Create New Blueprint](/img/welcome/quickstart/newBlueprintButton.png)

After clicking the button, you should see a creation form as shown below:

![New Blueprint Text](/img/welcome/quickstart/newBlueprintDefaultText.png)

Our microservice Blueprint is going to include the following properties:

- **Repo** - A URL to the source code repository storing the microservice code.
- **Slack Channel** - A URL to the Slack Channel of the team responsible for the Microservice

:::note
Don't worry if you want to add more properties to the Blueprint, you can always go back and edit later.
:::

In order to create a Blueprint using the properties, use the following JSON body:

```json showLineNumbers
{
  "identifier": "microservice",
  "title": "Microservice",
  "icon": "Microservice",
  "formulaProperties": {},
  "schema": {
    "properties": {
      "slackChannel": {
        "type": "string",
        "title": "Slack Channel",
        "description": "The channel of the microservice's maintainers"
      },
      "repoUrl": {
        "type": "string",
        "format": "url",
        "title": "Repository URL",
        "description": "A URL to the Git repository of the microservice"
      }
    },
    "required": []
  }
}
```

Click on the `save` button, and you should see your new Blueprint in the Blueprints graph:

![Blueprints graph with new Microservice](../../static/img/welcome/quickstart/blueprintGraphWithMicroserviceClosed.png)

Click on the `expand` button as shown in the image below:

![Blueprints graph with new Microservice And Expand Makred](../../static/img/welcome/quickstart/blueprintGraphWithMicroserviceClosedAndExpandMarked.png)

You should see an expanded view of the blueprint you just created, with all of its properties listed alongside the types you provided:

![Blueprints graph with new Microservice open](../../static/img/welcome/quickstart/blueprintGraphWithMicroserviceOpen.png)

Congratulations! you have just created your first Blueprint! 🎉

In the next part, we will start creating Entities that match this new Blueprint, making the Software Catalog come together!

## Create your first entities

Now that we have a Blueprint for `Microservice`, we can add some _Entities_.

An **Entity** is an object that matches to a type of a certain Blueprint. In our case, every Entity we create under the microservice Blueprint, is a microservice in our organization.

Let's create our first Entity to make things clearer.

Click on the microservices page on the left sidebar:

![Blueprints graph with new Microservice open and Microservices page marked](../../static/img/welcome/quickstart/blueprintGraphWithMicroserviceOpenAndMicroservicesPageMarked.png)

On the microservices page, click on the `+ Microservice` button to start creating a new Entity:

![Microservice Entity page with create entity button marked](../../static/img/welcome/quickstart/microserviceEntityPageWithCreateEntityMarked.png)

After clicking the button a new microservice form will appear. Let's fill it up with the following details:

```
Title: Login Service
Team: - leave blank -
# For identifier, click on the "Auto generate" toggle to enter a custom identifier
Identifier: loginService
slackChannel: #login-service
repoUrl: https://www.github.com
```

After filling all of the above, your creation page should look like this:

![Microservice Entity filled with create entity button marked](../../static/img/welcome/quickstart/microserviceEntityCreateFilledAndCreateMarked.png)

You can go ahead and press the `Create` button at the bottom right corner (as shown in the image above), and witness your new microservice appear in the microservices page:

![Microservice Entity page with first entity](../../static/img/welcome/quickstart/microserviceEntityPageWithFirstEntity.png)

Let's repeat that process again, add another microservice, but this time add an entity using JSON by clicking the JSON mode button:

![Microservice Create Entity page with json mode marked](../../static/img/welcome/quickstart/createMicroserviceBlueprintJsonModeMarked.png)

After clicking the button, a JSON editor will appear, similar to the one we saw in the blueprints page. Paste in the following content:

```json showLineNumbers
{
  "identifier": "dataQueryService",
  "title": "Data Query Service",
  "team": "",
  "blueprint": "microservice",
  "properties": {
    "slackChannel": "#data-query",
    "repoUrl": "https://www.github.com"
  },
  "relations": {}
}
```

Then click on the create button at the bottom right corner:

![Microservice Create Entity page with json filled and create marked](../../static/img/welcome/quickstart/createMicroserviceEntityWithJsonAndCeateMarked.png)

Now you should see your 2 microservices displayed in the page as shown in the image below:

![Microservice Entity page with 2 models](../../static/img/welcome/quickstart/microservicePageWithTwoModels.png)

Amazing! You have just created 2 awesome entities 🎉

To conclude your first steps with Port, we use Blueprints to define our data model, and Entities to store actual objects with data.

In the next part, we will look at our last building block - _Relations_. Let's get to it!

## Create a relation

A **Relation** is a connection between two Blueprints and the Entities that are based on them. Using Relations you can create a connection graph between multiple Entities, the connection graph helps you understand the structure of your infrastructure and gain easier access to the data of related Entities.

Currently our Software Catalog only has Microservices, but everybody knows microservices use all sorts of packages and libraries, therefore our Package Blueprint will contain the following fields:

- **Version** - The package version
- **In-House** - Whether the package was developed in house or externally

In addition, this time around, you will mark the `version` field as `required`, so we can make sure that our package has a version value.

so let's go ahead and create a **Package Blueprint**:

- Go back to the Blueprints page.
- Click on the New Blueprint button.
- Paste the content shown below and then click create:

```json showLineNumbers
{
  "identifier": "package",
  "title": "Package",
  "icon": "Package",
  "formulaProperties": {},
  "schema": {
    "properties": {
      "version": {
        "type": "string",
        "title": "Version",
        "description": "The version of the package"
      },
      "inHouse": {
        "type": "boolean",
        "title": "In-House?",
        "description": "Whether the package was developed in house"
      }
    },
    "required": ["version"]
  }
}
```

:::tip
**Remember**, if you are having trouble at any point, you performed the exact same steps with the **Microservice** Blueprint in the [Define a Blueprint section](#define-a-blueprint), so feel free to go back for reference.
:::

After you're done, your blueprints page should look like this:

![Blueprints Page with microservice and package](../../static/img/welcome/quickstart/blueprintsPageWithMicroserviceAndPackage.png)

Next, you will create 3 packages to correspond with your Microservices. In order to do so, go to the newly created **Packages** page, and create them using the JSON bodies written below (remember that you can also create the new packages from the UI, JSON is a bit faster when you already know the contents of your new Entity):

**Requests 2.28.1 Package**

```json showLineNumbers
{
  "identifier": "requests_v2_28_1",
  "title": "Requests v2.28.1",
  "team": "",
  "blueprint": "package",
  "properties": {
    "version": "2.28.1",
    "inHouse": false
  },
  "relations": {}
}
```

**Requests 2.28.0 Package**

```json showLineNumbers
{
  "identifier": "requests_v2_28_0",
  "title": "Requests v2.28.0",
  "team": "",
  "blueprint": "package",
  "properties": {
    "version": "2.28.0",
    "inHouse": false
  },
  "relations": {}
}
```

**SQLAlchemy Package**

```json showLineNumbers
{
  "identifier": "sqlAlchemy_v1_4_39",
  "title": "SQL Alchemy v1.4.39",
  "team": "",
  "blueprint": "package",
  "properties": {
    "version": "1.4.39",
    "inHouse": false
  },
  "relations": {}
}
```

In case you need a reminder on how to create `Package` Entities, refer to the following steps:

- Go to the Packages page
- Click on the `+ Package` button
- Paste (or manually type) the contents of both packages and then click create

:::tip
If you are still having trouble, refer back to the [Create Your First Entities](#create-your-first-entities) section
:::

After you're finished, your Packages page should look like this:

![Package Page with 3 packages](../../static/img/welcome/quickstart/packageEntityPageWithThreePackages.png)

Now that you have two Blueprints with Entities to match, you can create a relation between them.

:::info
Remember that the goal is: to know which `Packages` are used in each `Microservice`
:::

### Package to Microservice relation

Our goal is to know what Packages are used in each microservice, therefore you will map that relation between the Blueprints according to the following steps:

Go to the Blueprints page, hover over the `package` Blueprint and click on the `pencil` icon as shown below:

![Blueprints page with Create Relation Marked](../../static/img/welcome/quickstart/blueprintsPageWithMicroservicePackageAndEditPackageMarked.png)

In the edit form that appears, you will notice a `relations` key that is currently empty, replace it with the following content:

```json showLineNumbers
"relations": {
    "package-to-microservice": {
      "title": "Used In",
      "target": "microservice",
      "required": true,
      "many": false
    }
  }
```

Then click the `save` button at the bottom right corner, as shown in the image below:

![Package Microservice Relation with Save Marked](../../static/img/welcome/quickstart/packageMicroserviceRelationWithSaveMarked.png)

Now your Blueprints graph should look like this:

![Blueprints Graph With Package Microservice Relation](../../static/img/welcome/quickstart/blueprintsGraphWithPackageMicroserviceRelation.png)

:::note
Look at the connection graph you have just created. You modeled the relationship between your Blueprints in a way that shows which Blueprint depends on the other.
:::

Now that we have a relationship, it's time to use it to show which Package is used in which microservice.

### Mapping Packages to Microservices

To use your new relations, go back to the **Packages** page.

You already have 2 packages that you use in our for your **Data Query Service** - those are `SQL Alchemy v1.4.39` and `Requests v2.28.1`.

You also know that the `Requests v2.28.0` is used in your `Login Service`.

At the right side of the page you should see 3 dots (`...`) aligned with each package as shown below:

![Package Page with 3 dots Marked](../../static/img/welcome/quickstart/packagesPageWith3DotsMarked.png)

Click on the 3 dots in the `SQL Alchemy v1.4.39` package line, and an option menu will appear with a button that says `Show all Properties`, as shown below:

![Package Page with show all properties Marked](../../static/img/welcome/quickstart/packagesPageWithShowAllPropertiesMarked.png)

Click on that option and a form to edit the details of your `SQL Alchemy v1.4.39` package will open. Here you will encounter a new `Relations` section at the bottom of the form and a drop-down list under it, which will show you the available microservices:

![Package entity with relations DDL Marked](../../static/img/welcome/quickstart/packageEntityWithRelationsDDLMarked.png)

Select the `Data Query Service` option from the drop-down list and then click on the `Update` button at the bottom right of the page:

![Package entity with relation selected and update marked](../../static/img/welcome/quickstart/packageEntityWithUpdateButtonMarked.png)

Repeat the same process, only this time select the `Requests v2.28.1` package from the table, and in the Relations drop-down select the `Data Query Service` microservice.

And finally, select the `Requests v2.28.0` package, and in the Relations drop-down, select the `Login Service` Microservice and then click `Update`.

After attaching the Packages to the microservices, your Packages page should look like this (notice the marked column and its values):

![Packages page with relations filled and marked](../../static/img/welcome/quickstart/packagesWithRelationsFilledAndMarked.png)

Click on the `Data Query Service` link in the marked column and you will see what we call the **specific Entity page**. This page allows you to see the complete details and dependency graph of a specific entity.

![Microservice specific entity page after relation](../../static/img/welcome/quickstart/microserviceSpecificEntityPageAfterRelation.png)

:::info
In our case, the specific entity page for a microservice will also show us all of the Packages that it uses because that is the relation we mapped.
:::

Feel free to continue exploring the specific entity page and the Packages and microservices pages. Notice the `filter`, `hide`, `sort` and `group by` controls you can find at the top right of Port's table widgets.

## What now?

Congratulations! you just modeled your first environment in Port! 🎉🚢

This quickstart was used to teach you the basic building blocks Port provides. Now, you have all the tools you need to start cataloging and tracking your environment!

You can begin creating Blueprints that describe your `services`, `applications`, `clusters` and `infrastructure resources`.

:::tip Reuse or Restart?
Remember that the blueprints, entities and relations you created here were used as a basic example, but Port always allows you to go back and edit them until they match the infrastructure you want to catalog.

And, if you want to do something completely different, you can simply delete what you created here, and start mapping out Entities exactly the way you want them to be.
:::

### Recommended next steps

:::tip
These suggestions show the basic steps in creating your very own Developer Portal, if you want to learn more about Port before starting your Developer Portal journey, look at [Diving deeper](#diving-deeper) or [Using the API](#using-the-api) below.
:::

1. Create [Blueprints](../platform-overview/port-components/blueprint.md) for your software and infrastructure components
2. Map out the [Relations](../platform-overview/port-components/relation.md) between your Blueprints
3. Ingest data to your catalog by creating [Entities](../platform-overview/port-components/entity.md) based on your Blueprints via Port's UI or using our API
4. Define Self-Service Actions that can be used by you and your developers

### Diving deeper

If you want to learn more about Port's capabilities in a specific area, you can check out any of these resources:

- [Blueprints Deep Dive](../platform-overview/port-components/blueprint.md)
- [Relations Deep Dive](../platform-overview/port-components/relation.md)
- [Entities Deep Dive](../platform-overview/port-components/entity.md)
- [Pages Deep Dive](../platform-overview/port-components/page.md)

### Using the API

If you want to make use of Port's REST API Interface, take a look at these resources:

- [Port API Reference](../api-reference/)
