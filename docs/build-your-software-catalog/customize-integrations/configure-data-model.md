---
sidebar_position: 1
sidebar_label: Configure your data model
---

# Configure your data model

An integration's data model defines the properties and relationships of the data ingested from the integrated tool. It allows you to specify:

- How your data is represented in Port. 
- The relationships between the integration and other data models in your catalog.
- The properties of the data ingested from the integrated tool and their types.

## How to configure your data model

After installing an integration, you can configure its data model in the [builder page](https://app.getport.io/dev-portal/data-model) of your portal. 

To understand how an integration's data model works, let's take a look at an example.  
After you complete the [onboarding](/quickstart) and connect your Git provider to Port, you will see a `service` blueprint that represents a microservice in your organization (implemented in a Git repository):

<img src='/img/software-catalog/customize-integrations/serviceBlueprint.png' width='35%' border='1px' />

As you can see, this blueprint has several defined properties that will be filled with the ingested data from the Git provider.

### Add/remove/edit a property

Even though Port provides default properties for each blueprint, you can create, delete, or edit any property in your builder.

ADD SCREENSHOTS