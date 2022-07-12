---
sidebar_position: 1.1
---
# Blueprint

## What is a Blueprint?

A **blueprint** is *the most basic* building block in Port. It represents assets that can be managed in Port, such as `microservice`, `environments`, `packages`, `clusters`, `databases`, and many more. 

Blueprints are completely customizable, and they support any number of properties the user chooses, all of which can be modified as you go. 


## Define your Blueprints

There are a few important steps when trying to define your blueprints:

1. **Think about the Entities that you want to manage** - What will your organization benefit from? For example, in one organization, managing microservices (with clusters, deployments, etc...) is a big issue. In another, it could be understating what environments the organization has in a given moment.
2. **What properties characterize your entities** - For example, a microservice might have a link to the Github repository, the slack channel of the responsible team and a health check status.
3. **What are the relationships between the different entities** - For example, we would like to create a relation between microservices and deployments to track where each microservice is deployed.

By the end of this section, you should have something like this in mind:

![Example Blueprints and Relations Layout](../../../static/img/setup-your-port/self-service-portal/blueprints/exampleBlueprintsAndRelationsLayout.png)


## Blueprint's Structure

### Blueprint's JSON schema

Each blueprint is represented by a Json schema, as shown in the following section:

```json
{
    "identifier": "UniqueID",
    "title": "Title",
    "icon": "one of Airflow, Ansible, Argo, Aws, Azure, Blueprint, Bucket, Cloud, Cluster, CPU, Customer, Datadog, DefaultEntity, DefaultProperty, DeployedAt, Deployment, DevopsTool, Docs, Environment, Git, Github, GitVersion, GoogleCloud, GPU, Grafana, Jenkins, Lambda, Link, Lock, Microservice, Moon, Node, Okta, Package, Permission, Server, Service, Terraform",
    "dataSource": "Port",
    "formulaProperties": {},
    "schema": {
        "properties": {
            "foo": {
                "type": "string",
                "title": "Foo"
            },
            "bar": {
                "type": "number",
                "title": "Bar"
            },
            "date": {
                "type": "string",
                "format": "date-time",
                "title": "Date"
            }
        },
        "required": []
    }
}

```

| Link | Description | Optional Values |
| ----------- | ----------- | ----- |
| `identifier` | A unique identifier (Note that while the identifier is unique, it can be changed after creation) |
| `title` | A nicely written name for the blueprint |
| `icon` | An icon to visually distinguish from other blueprints, can be one of the following:  | `Airflow, Ansible, Argo, Aws, Azure, Blueprint, Bucket, Cloud, Cluster, CPU, Customer, Datadog, DefaultEntity, DefaultProperty, DeployedAt, Deployment, DevopsTool, Docs, Environment, Git, Github, GitVersion, GoogleCloud, GPU, Grafana, Jenkins, Lambda, Link, Lock, Microservice, Moon, Node, Okta, Package, Permission, Server, Service, Terraform` |
| `dataSource` | The source from which entity data is ingested, can be either `Port` or `Github` |
| Contact Us | Directly to our Slack channel |
| Status Page | TBD |

### Blueprint's Properties



## Creating a Blueprint

### From the UI

### From the API


## Updating a Blueprint


## Deleting a Blueprint


