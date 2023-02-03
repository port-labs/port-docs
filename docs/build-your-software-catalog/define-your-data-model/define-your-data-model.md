---
sidebar_position: 1
---

# Define Your Data Model 📋

Defining your data model for the software catalog is similar to defining a database structure.
You can also use common data models pre-defined by Port.

There are two main building blocks in setting up the data model:

- Blueprints - Represent an **entity type**. Blueprints hold the schema of the entities you wish to represent in the software catalog. For example: a microservice and an environment blueprint.

- Relations - Allows you to define the dependency model between blueprints. Relations turn Port's catalog into a graph-oriented catalog.

<br></br>
<br></br>

![Basic blueprints relation](../../../static/img/blueprints-relation-basic-example.png)

## Common data models

- C4 (Backstage Style)
- Multi-cloud architecture
- Microservice catalog
- Kubernetes & Argo Catalog

In this [live demo](https://demo.getport.io/dev-portal) example, we can see an example of a classic data model, using Blueprints & Relations. 🎬

## Step 1 - [Setup Blueprints](./setup-blueprint/setup-blueprint.md) 🧱

## Step 2 - [Relate Relations](./relate-blueprints/relate-blueprints.md) 🔀
