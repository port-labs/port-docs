---
sidebar_position: 1
---

# Define Your Data Model :building_construction:

Defining your data model for the software catalog is similar to defining a database structure.
Port provides two main building blocks to define the structure of your choice:

- Blueprint - Represent an **entity type**. A blueprint hold the schema of the entity you wish to represent in the software catalog. For example: a microservice or an environment blueprint

- Relation - Allows you to define the dependency model between blueprints. Which makes Port's catalog a graph-oriented catalog.

<br></br>
<br></br>

![Basic blueprints relation](../../../static/img/blueprints-relation-basic-example.png)

## Common data models

- C4 (Backstage Style)
- Multi-cloud architecture
- Microservice catalog
- Kubernetes & Argo SDLC

In this [live demo](https://demo.getport.io/dev-portal) example, we can see an example of a classic data model, using Blueprints & Relations. 🎬

## Step 1 - [Setup Blueprints](./setup-blueprint/setup-blueprint.md)

## Step 2 - [Relate Relations](./relate-blueprints/relate-blueprints.md)
