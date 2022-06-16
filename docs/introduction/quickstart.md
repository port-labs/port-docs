---
sidebar_position: 2
---

# Quickstart

## What is Port

**Port** is a Developer Platform meant to make life easier for Developers and DevOps in an organization, by creating a single Platform that acts as a Source-Of-Truth for all of the infrastructure and operations that happen in the organization's tech stack.

### Port helps you

* Map all your software and infrastructure components (microservices, monoliths, deployments, repos, databases, and more) and see all of them in one place
* Create a self-service portal for your internal customers in order to empower them to perform actions and reduce toil on the DevOps team, while ensuring unified standards and governance over the processes inside your organization 
* Create a **comprehensive catalog** by mapping all your software and infrastructure components (microservices, monoliths, deployments, repos, databases, and more) and see all of them in one place
* Make your **catalog active** by assigning to it actions that can be used by you and your internal customers, while ensuring unified standards and governance over the processes inside your organization

Port's 3 core building blocks are *Blueprints*, *Entities* and *Relations*. This tutorial will walk you through your first steps on the platform and get you started on your DevPortal journey!🚢 

## Define a Blueprint

We use Blueprints to model our data in Port. A Blueprint allows us to define what properties and fields an *Entity* will have.

In Port, you control how the data looks, any data format you can think of can be represented, but for now, let's start with a simple example:

You are a large car manufacturer 🛠 , and you want to manage your different car models in Port, so you can easily track all of your car models and variants, different engines and more.

Let's head to [Port](https://app.getport.io/blueprints) and look at the Blueprints page, at the top right corner let's click on **New Blueprint** and configure our first blueprint - **Car Model** as shown in the image below:

![Create New Blueprint](/img/introduction/quickstart/newBlueprintButton.png)

After clicking the button, you should see a creation form similar to what is shown in the image below:

![New Blueprint Text](/img/introduction/quickstart/newBlueprintDefaultText.png)

Our Car Model Blueprint is going to include the following fields:

- **Name** - The name of the car model
- **Year** - The year the car model was produced

In order to create a Blueprint with the following properties, we will use the following JSON body:

```json
{
    "identifier": "car_model",
    "title": "Car Model",
    "dataSource": "Port",
    "schema": {
        "properties": {
            "name": {
                "type": "string",
                "title": "Name",
                "description": "The name of the car model"
            },
            "year": {
                "type": "number",
                "title": "Year",
                "description": "The year the car model was produced"
            }
        },
        "required": []
    }
}
```

Click on the save button, and you should see your new Blueprint in the Blueprints graph

## Create Your First Entities

## Create a Relation

## Next Steps

1. Map all your software and infrastructure components (microservices, monoliths, deployments, repos, databases, and more) and see all of them in one place
2. Create a self-service portal for your internal customers in order to empower them to perform actions and reduce toil on the DevOps team, while ensuring unified standards and governance over the processes inside your organization
3. Create a **comprehensive catalog** by mapping all your software and infrastructure components (microservices, monoliths, deployments, repos, databases, and more) and see all of them in one place
4. Make your **catalog active** by assigning to it actions that can be used by you and your internal customers, while ensuring unified standards and governance over the processes inside your organization

In this tutorial, we will show you how to use Port to better understand what your software and infrastructure are made of, and manage all the components in one place.

## 1. Define Your Entity Types

Port’s two main building blocks are entity types and entities.

In this section, we will define the entity types that our entities will be based on.

### Entity Types & Properties

Let’s start by choosing the **entity types according to what we want to manage in Port.**

Please pick a relevant scenario, and perform the API call to create the entity types:

```jsx
Here we will have a list of scenarios (microservice management, environments..).
When the user chooses a scenario, a **diagram** will be displayed with the **API code**
and a copy button
```

### Relationship Definition

The next step after creating the entity types will be to **define the relationships between them.**

According to the scenario you have selected above, perform the relevant API call to create the relationships:

```jsx
Here we will have a list of scenarios (microservice management, environments..).
When the user chooses a scenario, a diagram will be displayed with the API code
and a copy button
```

:::note
💡 Got confused for some reason? you can delete all data and start again by using this API call - add here
:::


**Great! 🥳**  now we have a **model** that represents the entities that we want to manage in Port

**Click here to see the entity model inside your system**

## 2. Create Your First Entities

Now we will **create entities based on our entity types.**

According to the scenario you have selected above, perform the relevant API call to create some entities:

```jsx
Here we will have a list of scenarios (microservice management, environments..).
When the user chooses a scenario, a diagram will be displayed with the API code
and a copy button
```

## 3. View The Data You Created!

All done! 🎊  you have created -

1. A **model (entity types and relationships)** that represents your organization
2. Entities based on this model

In addition, a **page for each entity** type is automatically created for you.

You can view it all in **your system**

:::tip
💡 You can create more pages that display information about your entities. For further information please see the [pages section](https://www.notion.so/Pages-8e026b983f2d40cb8f9b3c04b9b50c03)

:::

### What Now?

1. **Create your own entities by integrating Port with your processes**
    1. This can be done by adding our API call to your workflow. For example - create a new environment in Port through a Terraform script. Check out the **[Templates Section](https://www.notion.so/Templates-6f16be20ed234ed5a77952e2494b7c26)** to get inspiration on what you could manage with Port and also start with one click!
    2. Further explanation on how to create and manage your entities catalog can be found here -

        [Setup Entity Catalog](https://www.notion.so/Setup-Entity-Catalog-bf55227428414e309a5a76ede04d5fff)

2. **Turn your catalog to an active portal by assigning actions to your entities**
    1. Further explanation here -
