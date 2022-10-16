---
sidebar_position: 1
slug: /
---

# Quickstart

## What is Port?

Port is a Developer Platform made to make life easier for developers and DevOps in an organization, by creating a single platform that acts as a single source-of-truth for all of the infrastructure assets and operations existing in the organization's tech stack.

Port then allows engineers to perform actions on these assets in a self-service fashion. From provisioning a dev environment, understanding who is the owner of a microservice, or any unique use case DevOps want to self-serve and automate.

### Port helps you to:

- Create a comprehensive **Software Catalog** by mapping all your software and infrastructure components in one place: microservices, monoliths, deployments, repos, databases, and more.
- Let your developers provision, terminate and perform day 2 operations on any asset exposed (microservice or not) in your catalog, within the policies and guardrails you’ve set, ensuring unified standards and governance over the processes inside your organization.

Port's three core building blocks are _Blueprints_, _Entities_ and _Relations_. This tutorial will walk you through your first steps on the platform and get you started on your Developer Portal journey!🚢

## Define a Blueprint

Blueprints are used to model data in Port. A Blueprint allows us to define what properties and fields an _Entity_ will contain.

Architectures and deployments vary greatly, and so do preferences and standards for data representation and asset structure. Therefore, in Port, You have full control of the way data is presented using any data format you desire, so that the Software Catalog truly represents all you need for the developer portal.

But for now, let's start with a simple example:

Your organization uses a microservice architecture; a single **microservice** can be deployed to multiple **environments** (production, staging, QA, etc.).

To create your Software Catalog, you need to to ingest and track your microservices, track your existing environments, and map out which microservice is deployed at which environment.

In this tutorial you are going to create 3 Blueprints:

- Service;
- Environment;
- Running service.

Note the **Running service** Blueprint - it is meant to represent a running deployment of your **service** in one of your **environments**.

:::tip
During this tutorial, we will demonstrate a way to perform every step both from Port's web UI and using Port's REST API.

This tutorial will include complete examples to interact with Port's API, but for more examples you can visit the [API section](./tutorials/blueprint-basics.md#from-the-api) in [Blueprint basics](./tutorials/blueprint-basics.md).

For readability, snippets to copy and paste and examples will be inside collapsed boxes:

<details>
<summary>Example JSON block</summary>

```json showLineNumbers
{
  "foo": "bar"
}
```

</details>

<details>
<summary>Example code block</summary>

```python showLineNumbers
print("hello world!")
```

</details>

:::

### Service Blueprint

Our service Blueprint is going to include the following properties (among others):

- **Github URL** - a link to the GitHub repository of the microservice;
- **On Call** - the current on-call developer;
- **Last Incident** - the last time an incident occurred in the microservice;
- **Language** - the main programming language used for the microservice;
- **Product** - the business unit category of the microservice;
- **Version** - the latest version of the microservice;
- **Number of JIRA issues** - the number of currently open JIRA issues;
- **Slack notifications** - a URL to the Slack Channel of the team responsible for the microservice.

:::tip
Don't worry if you want to add/remove properties, you can always go back and edit later.
:::

In addition, the `on-call` field will be marked as `required`, so that we always know who is the current on-call for the service.

#### From the UI

Let's head to [Port](https://app.getport.io/blueprints) and look at the Blueprints page, at the top right corner let's click on **Add Blueprint** and configure our first blueprint - **Service** as shown in the image below:

![Developer PortalCreate New Blueprint](../static/img/welcome/quickstart/newBlueprintButton.png)

After clicking the button, you should see a creation form as shown below:

![Developer Portal New Blueprint Text](../static/img/welcome/quickstart/newBlueprintDefaultText.png)

:::note
When you click on `Add Blueprint`, you will see a template for a `microservice` Blueprint which is identical to the one you will create. So you can just click `save` and skip to [Environment Blueprint](#environment-blueprint).
:::

In order to create a the service Blueprint, use the following JSON body:

<details>
<summary>Service Blueprint JSON</summary>

```json showLineNumbers
{
  "identifier": "microservice",
  "description": "This blueprint represents service in our software catalog",
  "title": "Service",
  "icon": "Microservice",
  "schema": {
    "properties": {
      "on-call": {
        "type": "string",
        "icon": "Okta",
        "title": "On Call",
        "format": "email",
        "default": "develoepr@getport.io"
      },
      "language": {
        "type": "string",
        "icon": "Git",
        "title": "Language",
        "default": "Node",
        "enum": ["GO", "Python", "Node"],
        "enumColors": {
          "GO": "red",
          "Python": "green",
          "Node": "blue"
        }
      },
      "locked": {
        "type": "boolean",
        "title": "Locked",
        "icon": "Lock",
        "default": false
      },
      "number-of-open-jira-issues": {
        "type": "number",
        "icon": "DevopsTool",
        "title": "Number of JIRA Issues",
        "default": 42
      },
      "product": {
        "title": "Product",
        "type": "string",
        "icon": "Docs",
        "default": "Analytics",
        "enum": ["SaaS", "Control Panel", "Analytics"],
        "description": "Choose product unit related to the service"
      },
      "url": {
        "type": "string",
        "title": "Github URL",
        "icon": "Github",
        "format": "url",
        "default": "https://git.com",
        "description": "the link to the repo in our github"
      },
      "config": {
        "title": "Service Config",
        "type": "object",
        "icon": "Argo",
        "default": {
          "foo": "bar"
        }
      },
      "monitor-links": {
        "title": "Monitor Tooling",
        "type": "array",
        "icon": "Datadog",
        "items": {
          "type": "string",
          "format": "url"
        },
        "default": [
          "https://grafana.com",
          "https://prometheus.com",
          "https://datadog.com"
        ]
      },
      "last-incident": {
        "icon": "CPU",
        "type": "string",
        "title": "Last Incident",
        "format": "date-time",
        "default": "2022-04-18T11:44:15.345Z"
      },
      "version": {
        "type": "string",
        "icon": "Package",
        "title": "Version",
        "pattern": "[a-zA-Z0-9.]",
        "description": "A property that supports values specified by a regex pattern",
        "default": "Port1337"
      },
      "ip": {
        "title": "IPv4 Property",
        "icon": "Cluster",
        "type": "string",
        "format": "ipv4",
        "description": "An IPv4 property",
        "default": "127.0.0.1"
      }
    },
    "required": ["on-call"]
  },
  "mirrorProperties": {},
  "formulaProperties": {
    "slack-notifications": {
      "title": "Slack Notifications",
      "icon": "Link",
      "formula": "https://slack.com/{{$identifier}}"
    },
    "on-call-plus-version": {
      "title": "On Call + Version",
      "icon": "Jenkins",
      "formula": "{{on-call}} + {{version}}"
    },
    "launch-darkly": {
      "title": "Launch Darkly",
      "icon": "Customer",
      "formula": "https://launchdarkly.com/{{$title}}"
    }
  },
  "relations": {}
}
```

</details>

Click on the `save` button, and [you should see](#the-results) your new Blueprint in the Blueprints graph.

#### From the API

To interact with Port's API, we will use python, the only package requirement is the [requests](https://pypi.org/project/requests/) library which you can install by running:

```bash showLineNumbers
python -m pip install requests
```

:::note
For the next part, you will need your Port `CLIENT_ID` and `CLIENT_SECRET`.

To find your Port API credentials go to [Port](https://app.getport.io), click on `Crednetials` at the bottom left corner and you will be able to view and copy your `CLIENT_ID` and `CLIENT_SECRET`:

<center>

![Port Developer Portal Credentials Modal](../static/img/tutorial/credentials-modal.png)

</center>

:::

In order to perform any action with Port's API, you first need an **access token**:

<details>
<summary>Get an API access token</summary>

```python showLineNumbers
# Dependencies to install:
# $ python -m pip install requests

import requests

CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'

API_URL = 'https://api.getport.io/v1'

credentials = {'clientId': CLIENT_ID, 'clientSecret': CLIENT_SECRET}

token_response = requests.post(f'{API_URL}/auth/access_token', json=credentials)

access_token = token_response.json()['accessToken']

# You can now use the value in access_token when making further requests

```

:::tip
For examples in other languages you can visit the [API section](./tutorials/blueprint-basics.md#from-the-api) in [Blueprint basics](./tutorials/blueprint-basics.md).

:::

</details>

Now that you have an access token, you can use it for every interaction you make with Port's API. You will also use in the section below to create the `Service` Blueprint:

<details>
<summary>Create the service Blueprint</summary>

Note this example assumes the token is saved in the `access_token` variable.

```python showLineNumbers
# Dependencies to install:
# $ python -m pip install requests
import json
import requests

# the access_token variable should already have the token from the previous example

API_URL = 'https://api.getport.io/v1'

headers = {
    'Authorization': f'Bearer {access_token}'
}

blueprint = {
    "identifier": "microservice",
    "description": "This blueprint represents service in our software catalog",
    "title": "Service",
    "icon": "Microservice",
    "schema": {
        "properties": {
            "on-call": {
                "type": "string",
                "icon": "Okta",
                "title": "On Call",
                "format": "email",
                "default": "develoepr@getport.io"
            },
            "language": {
                "type": "string",
                "icon": "Git",
                "title": "Language",
                "default": "Node",
                "enum": ["GO", "Python", "Node"],
                "enumColors": {
                    "GO": "red",
                    "Python": "green",
                    "Node": "blue"
                }
            },
            "locked": {
                "type": "boolean",
                "title": "Locked",
                "icon": "Lock",
                "default": False
            },
            "number-of-open-jira-issues": {
                "type": "number",
                "icon": "DevopsTool",
                "title": "Number of JIRA Issues",
                "default": 42
            },
            "product": {
                "title": "Product",
                "type": "string",
                "icon": "Docs",
                "default": "Analytics",
                "enum": ["SaaS", "Control Panel", "Analytics"],
                "description": "Choose product unit related to the service"
            },
            "url": {
                "type": "string",
                "title": "Github URL",
                "icon": "Github",
                "format": "url",
                "default": "https://git.com",
                "description": "the link to the repo in our github"
            },
            "config": {
                "title": "Service Config",
                "type": "object",
                "icon": "Argo",
                "default": {
                    "foo": "bar"
                }
            },
            "monitor-links": {
                "title": "Monitor Tooling",
                "type": "array",
                "icon": "Datadog",
                "items": {
                    "type": "string",
                    "format": "url"
                },
                "default": ["https://grafana.com", "https://prometheus.com", "https://datadog.com"]
            },
            "last-incident": {
                "icon": "CPU",
                "type": "string",
                "title": "Last Incident",
                "format": "date-time",
                "default": "2022-04-18T11:44:15.345Z"
            },
            "version": {
                "type": "string",
                "icon": "Package",
                "title": "Version",
                "pattern": "[a-zA-Z0-9.]",
                "description": "A property that supports values specified by a regex pattern",
                "default": "Port1337"
            },
            "ip": {
                "title": "IPv4 Property",
                "icon": "Cluster",
                "type": "string",
                "format": "ipv4",
                "description": "An IPv4 property",
                "default": "127.0.0.1"
            }
        },
        "required": ["on-call"]
    },
    "mirrorProperties": {},
    "formulaProperties": {
        "slack-notifications": {
            "title": "Slack Notifications",
            "icon": "Link",
            "formula": "https://slack.com/{{$identifier}}"
        },
        "on-call-plus-version": {
            "title": "On Call + Version",
            "icon": "Jenkins",
            "formula": "{{on-call}} + {{version}}"
        },
        "launch-darkly": {
            "title": "Launch Darkly",
            "icon": "Customer",
            "formula": "https://launchdarkly.com/{{$title}}"
        }
    },
    "relations": {}
}

response = requests.post(f'{API_URL}/blueprints', json=blueprint, headers=headers)
# response.json() contains the content of the resulting blueprint

print(json.dumps(response.json(), indent=2))

```

</details>

#### The results

![Developer Portal Blueprints graph with new Service Blueprint](../static/img/welcome/quickstart/blueprintGraphWithServiceClosed.png)

Click on the `expand` button as shown in the image below:

![Developer Portal Blueprints graph with new Service Blueprint And Expand Marked](../static/img/welcome/quickstart/blueprintGraphWithServiceClosedAndExpandMarked.png)

You should see an expanded view of the blueprint you just created, with all of its properties listed alongside the types you provided:

![Developer Portal Blueprints graph with new Service open](../static/img/welcome/quickstart/blueprintGraphWithServiceOpen.png)

Congratulations! you have just created your first Blueprint! 🎉

### Environment Blueprint

Our environment Blueprint is going to include the following properties:

- **Environment type** - the type of the environment (production, staging, QA, etc.);
- **Cloud provider** - the cloud provider where the cluster is deployed;
- **Region** - The cloud region where the cluster is deployed.

In addition the Blueprint is going to include the following formula property:

- **Grafana URL** - link to the Grafana dashboard of the environment.

:::tip
For more information about formula properties check out [this](./platform-overview/port-components/formula-properties.md) document
:::

<!-- COntinue working on the blueprint schema, add enum colors for cloud providers, add formula properties for grafana, prometheus -->

In addition, the `environment type` field will be marked as `required`, so we can make sure that our environments are tagged correctly.

In order to create a the environment Blueprint, use the following JSON body:

<details>
<summary>Environment Blueprint JSON</summary>

```json showLineNumbers
{
  "identifier": "environment",
  "description": "This blueprint represents an environment in our software catalog",
  "title": "Environment",
  "icon": "Environment",
  "schema": {
    "properties": {
      "type": {
        "type": "string",
        "title": "Environment type",
        "enum": ["Integration", "Production", "Staging", "Security", "QA"]
      },
      "cloud-provider": {
        "type": "string",
        "title": "Cloud Provider",
        "enum": ["AWS", "GCP", "Azure", "Oracle"],
        "enumColors": {
          "AWS": "orange",
          "GCP": "green",
          "Azure": "blue",
          "Oracle": "red"
        }
      },
      "region": {
        "type": "string",
        "title": "Region",
        "enum": [
          "eu-west-1",
          "eu-west-2",
          "us-west-1",
          "us-east-1",
          "us-east-2"
        ]
      }
    },
    "required": ["type"]
  },
  "mirrorProperties": {},
  "formulaProperties": {
    "grafanaUrl": {
      "title": "Grafana URL",
      "formula": "https://grafana.com/{$identifier}"
    }
  },
  "relations": {}
}
```

</details>

#### From the UI

To create the environment Blueprint from the UI, repeat the steps you took in [creating a service Blueprint from the UI](#from-the-ui) using the environment JSON.

#### From the API

To create the environment Blueprint from the API, use the following code snippet (remember that an access token is required):

<details>
<summary>Create the environment Blueprint</summary>

Note this example assumes the token is saved in the `access_token` variable.

```python showLineNumbers
# Dependencies to install:
# $ python -m pip install requests
import json
import requests

# the access_token variable should already have the token from the previous example

API_URL = 'https://api.getport.io/v1'

headers = {
    'Authorization': f'Bearer {access_token}'
}

blueprint = {
    "identifier": "environment",
    "description": "This blueprint represents an environment in our software catalog",
    "title": "Environment",
    "icon": "Environment",
    "schema": {
        "properties": {
            "type": {
                "type": "string",
                "title": "Environment type",
                "enum": [
                    "Integration",
                    "Production",
                    "Staging",
                    "Security",
                    "QA"
                ]
            },
            "cloud-provider": {
                "type": "string",
                "title": "Cloud Provider",
                "enum": [
                    "AWS",
                    "GCP",
                    "Azure",
                    "Oracle"
                ],
                "enumColors": {
                    "AWS": "orange",
                    "GCP": "green",
                    "Azure": "blue",
                    "Oracle": "red"
                }
            },
            "region": {
                "type": "string",
                "title": "Region",
                "enum": [
                    "eu-west-1",
                    "eu-west-2",
                    "us-west-1",
                    "us-east-1",
                    "us-east-2"
                ]
            }
        },
        "required": [
            "type"
        ]
    },
    "mirrorProperties": {},
    "formulaProperties": {
        "grafanaUrl": {
            "title": "Grafana URL",
            "formula": "https://grafana.com/{$identifier}"
        }
    },
    "relations": {}
}

response = requests.post(f'{API_URL}/blueprints', json=blueprint, headers=headers)
# response.json() contains the content of the resulting blueprint

print(json.dumps(response.json(), indent=2))
```

</details>

#### The results

![Developer Portal Blueprints graph with new Environment Blueprint](../static/img/welcome/quickstart/blueprintGraphWithEnvironmentClosed.png)

Click on the `expand` button as shown in the image below:

![Developer Portal Blueprints graph with new Environment Blueprint And Expand Marked](../static/img/welcome/quickstart/blueprintGraphWithEnvironmentClosedAndExpandMarked.png)

You should see an expanded view of the blueprint you just created, with all of its properties listed alongside the types you provided:

![Developer Portal Blueprints graph with new Environment open](../static/img/welcome/quickstart/blueprintGraphWithEnvironmentOpen.png)

In the next part, we will start creating Entities that match these new Blueprints, making the Software Catalog come together!

## Create your first Entities

Now that we have Blueprints for `environment` and `service`, we can add some _Entities_.

An **Entity** is an object that matches a type of a certain Blueprint. In our case, every Entity we create under the service Blueprint, is a microservice in our organization. And every environment we create under the environment Blueprint, is a different environment where our code is running.

Let's create some initial Entities to make things clearer.

### Service Entity

#### From the UI

Click on the services page on the left sidebar:

![Developer Portal Blueprints graph with new Service and Services page marked](../static/img/welcome/quickstart/blueprintGraphWithServicesPageMarked.png)

On the services page, click on the `+ Service` button to start creating a new Entity:

![Developer Portal Service Entity page with create entity button marked](../static/img/welcome/quickstart/serviceEntityPageWithCreateEntityMarked.png)

After clicking the button a new service form will appear. Let's fill it up with the following details:

<details>
<summary>Notification service Entity JSON</summary>

```json showLineNumbers
{
  "properties": {
    "on-call": "mor@getport.io",
    "language": "Python",
    "locked": false,
    "number-of-open-jira-issues": 21,
    "product": "Analytics",
    "url": "https://github.com/port/notification-service",
    "config": {
      "enable_analytics": true
    },
    "monitor-links": ["https://grafana.com", "https://datadog.com"],
    "last-incident": "2022-04-18T11:44:15.345Z",
    "version": "1.0.0",
    "ip": "8.8.8.8"
  },
  "relations": {},
  "title": "Notification Service",
  "identifier": "notification-service"
}
```

:::tip
You can either switch the creation form to Json Mode using the toggle, or you can just manually type the values into the fields.
:::

</details>

After filling all of the above, your creation page should look like this:

![Developer Portal Service Entity filled with create entity button marked](../static/img/welcome/quickstart/serviceEntityCreateFilledAndCreateMarked.png)

You can go ahead and press the `Create` button at the bottom right corner (as shown in the image above).

Now to create an environment Entity, repeat these same steps, but this time go to the environments page:

![Developer Portal Blueprints graph with new Environment and Environments page marked](../static/img/welcome/quickstart/blueprintGraphWithEnvironmentsPageMarked.png)

And use the following data for the environment Entity:

<details>
<summary>Production environment Entity JSON</summary>

```json showLineNumbers
{
  "properties": {
    "type": "Production",
    "cloud-provider": "AWS",
    "region": "eu-west-1"
  },
  "relations": {},
  "title": "Production",
  "identifier": "production"
}
```

</details>

Now you can [witness your new service and environment](#the-results-2) Entities appear in the services page and environments page respectively.

#### From the API

To create both the service Entity and the environment Entity from the API, use the following code snippet (remember that an access token is required):

<details>
<summary>Create the service Entity and the environment Entity</summary>

Note this example assumes the token is saved in the `access_token` variable.

```python showLineNumbers
# Dependencies to install:
# $ python -m pip install requests
import json
import requests

# the access_token variable should already have the token from the previous example

API_URL = 'https://api.getport.io/v1'

headers = {
    'Authorization': f'Bearer {access_token}'
}

service_blueprint_identifier = 'microservice'

env_blueprint_identifier = 'environment'

service_entity = {
    "properties": {
        "on-call": "mor@getport.io",
        "language": "Python",
        "locked": False,
        "number-of-open-jira-issues": 21,
        "product": "Analytics",
        "url": "https://github.com/port/notification-service",
        "config": {
            "enable_analytics": True
        },
        "monitor-links": [
            "https://grafana.com",
            "https://datadog.com"
        ],
        "last-incident": "2022-04-18T11:44:15.345Z",
        "version": "1.0.0",
        "ip": "8.8.8.8"
    },
    "relations": {},
    "title": "Notification Service",
    "identifier": "notification-service"
}

env_entity = {
    "properties": {
        "type": "Production",
        "cloud-provider": "AWS",
        "region": "eu-west-1"
    },
    "relations": {},
    "title": "Production",
    "identifier": "production"
}

service_response = requests.post(f'{API_URL}/blueprints/{service_blueprint_identifier}/entities', json=service_entity, headers=headers)

print(json.dumps(service_response.json(), indent=2))

env_response = requests.post(f'{API_URL}/blueprints/{env_blueprint_identifier}/entities', json=env_entity, headers=headers)

print(json.dumps(env_response.json(), indent=2))

```

</details>

#### The results

The respective pages for each of our Blueprints will now show the Entities we created:

![Developer Portal Service Entity page with first entity](../static/img/welcome/quickstart/serviceEntityPageWithFirstEntity.png)

![Developer Portal Environment Entity page with first entity](../static/img/welcome/quickstart/environmentEntityPageWithFirstEntity.png)

Amazing! You have just created 2 awesome entities 🎉

To conclude your first steps with Port, we use Blueprints to define our data model, and Entities to store data objects that match the type of our Blueprints.

In the next part, we will look at our last building block - _Relations_. Let's get to it!

## Create a Relation

A **Relation** is a connection between two Blueprints and the Entities that are based on them. Using Relations you can create a connection graph between multiple Entities, the connection graph helps you understand the structure of your infrastructure and gain easier access to the data of related Entities.

Currently our Software Catalog has services and environments, but in practice everybody knows packages are just the building blocks for larger applications and services, so we'll now create a microservice Blueprint to represent the application that will make use of our packages. Our Microservice Blueprint will contain the following fields:

In addition, our **Relation** will list the packages used by the microservice.

so let's go ahead and create a **Microservice Blueprint**:

- Go back to the Blueprints page;
- Click on the Add Blueprint button;
- Paste the content shown below and then click create:

```json showLineNumbers
{
  "identifier": "microservice",
  "title": "Microservice",
  "icon": "Microservice",
  "schema": {
    "properties": {
      "repoUrl": {
        "type": "string",
        "format": "url",
        "title": "Repository URL",
        "description": "A URL to the Git repository of the microservice"
      },
      "slackChannel": {
        "type": "string",
        "title": "Slack Channel",
        "description": "The channel of the microservice\\'s maintainers"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "formulaProperties": {},
  "relations": {}
}
```

:::tip
**Remember**, if you are having trouble at any point, you performed the exact same steps with the **Package** Blueprint in the [Define a Blueprint section](#define-a-blueprint), so feel free to go back for reference.
:::

After you're done, your blueprints page should look like this:

![Developer Portal Blueprints Page with microservice and package](../static/img/welcome/quickstart/blueprintsPageWithMicroserviceAndPackage.png)

Now we'll create our microservice to package Relation.

### Microservice to package Relation

Our goal is to know what packages are used in each microservice, therefore you will map that Relation between the Blueprints according to the following steps:

Go to the Blueprints page, hover over the `microservice` Blueprint and click on the `pencil` icon as shown below:

![Developer Portal Blueprints page with Create Relation Marked](../static/img/welcome/quickstart/blueprintsPageWithMicroservicePackageAndEditPackageMarked.png)

In the edit form that appears, you will notice a `relations` key that is currently empty, paste the following content inside it:

```json showLineNumbers
"packages": {
    "title": "Package",
    "target": "package",
    "description": "Package(s) used by the microservice",
    "many": true,
    "required": true
}
```

Then click the `save` button at the bottom right corner.

Now your Blueprints graph should look like this:

![Developer Portal Blueprints Graph With Package Microservice Relation](../static/img/welcome/quickstart/blueprintsGraphWithPackageMicroserviceRelation.png)

:::note
Look at the connection graph you have just created. You modeled the relationship between your Blueprints in a way that shows which Blueprint depends on the other.
:::

Now that we have a relationship, it's time to use it to show which package is used in which microservice. To do that, you are going to create a new microservice Entity and specify the package Entities it uses:

### Mapping Packages to Microservices

You already have 2 packages Entities that you created - those are `SQL Alchemy v1.4.39` and `Requests v2.28.1`.

You are now going to create a microservice Entity and map these packages to it using the Relation you created.

The microservice Entity you are going to create is for the `notification service` of your application, here is its JSON:

```json showLineNumbers
{
  "identifier": "notification-microservice",
  "title": "Notification Service",
  "properties": {
    "repoUrl": "https://www.github.com/User/notification",
    "slackChannel": "#notification-service"
  },
  "relations": {
    "packages": ["requests-pkg-v2-28", "sqlAlchemy_v1_4_39"]
  }
}
```

To create the microservice, follow these steps:

- Go to the Microservices page;
- Click the `+ Microservice` button;
- Type the values matching the JSON above (or just switch to JSON mode and paste);
- Click the create button at the bottom right corner.

:::note
If you choose to type the values manually, in order to input the packages used by the microservice, click the `expand` icon next to the `Package` field, a new JSON form with an empty array (`[]`) will appear, you can type the identifiers of the package Entities you created there, the form will also auto-complete you and only show you legal package values:

![Developer Portal Package Relation Array](../static/img/welcome/quickstart/EditPackagesArrayProperty.png)
:::

Now you should see your new microservice Entity, and if you look at the package column, you will see multiple package values:

![Developer Portal Microservice with multiple packages marked](../static/img/welcome/quickstart/MicroserviceWithManyPackages.png)

Click on the `Notification Service` link in the marked column and you will see what we call the **specific Entity page**. This page allows you to see the complete details and dependency graph of a specific entity.

![Microservice specific entity page after relation](../static/img/welcome/quickstart/microserviceSpecificEntityPageAfterRelation.png)

:::info
In our case, the specific entity page for a microservice will also show us a tab with all of the Packages that it uses because that is the Relation we mapped.
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

1. Create [Blueprints](./platform-overview/port-components/blueprint.md) for your software and infrastructure components;
2. Map out the [Relations](./platform-overview/port-components/relation.md) between your Blueprints;
3. Ingest data to your catalog by creating [Entities](./platform-overview/port-components/entity.md) based on your Blueprints via Port's UI or using our API;
4. Define [Self-Service Actions](./platform-overview/self-service-actions/self-service-actions.md) that can be used by you and your developers.

### Diving deeper

If you want to learn more about Port's capabilities in a specific area, you can check out any of these resources:

- [Blueprints deep dive](./platform-overview/port-components/blueprint.md)
- [Relations deep dive](./platform-overview/port-components/relation.md)
- [Entities deep dive](./platform-overview/port-components/entity.md)
- [Pages deep dive](./platform-overview/port-components/page.md)
- [Self-Service Actions deep dive](./platform-overview/self-service-actions/self-service-actions.md)

### Using the API

If you want to make use of Port's REST API Interface, take a look at these resources:

- [Port API Reference](./api-reference/).
