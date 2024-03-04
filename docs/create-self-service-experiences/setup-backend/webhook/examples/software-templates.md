---
sidebar_position: 4
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Software Templates

A software template allows you to generate a customized skeleton of a new resource (e.g. service), usually based on community best practices.

There are a few open source projects out there that enable you to create a project from a software template, such as [Cookiecutter](https://github.com/cookiecutter/cookiecutter).

In the next section we are going to present an example.

:::tip
All relevant files and resources for this guide are available [**Here for GitHub**](https://github.com/port-labs/port-cookiecutter-example), and [**Here for GitLab**](https://github.com/port-labs/port-cookiecutter-gitlab-example).
:::

## Example - create a new service repository

The following example utilizes Port [webhook-actions](/build-your-software-catalog/custom-integration/webhook) to create a new service repository from a software template.

First, you need to create a simple `Service` blueprint.

<details>
<summary>Service blueprint JSON</summary>

```json showLineNumbers
{
  "identifier": "service",
  "title": "Service",
  "icon": "Service",
  "schema": {
    "properties": {
      "description": {
        "type": "string",
        "title": "Description"
      },
      "url": {
        "type": "string",
        "format": "url",
        "title": "URL"
      }
    },
    "required": []
  },
  "mirrorProperties": {}
}
```

</details>

Then, add `Create` Self-Service Actions to the blueprint, in order to support the creation of multiple services from different frameworks.

In this case, we add actions to provision [Django](https://github.com/cookiecutter/cookiecutter-django), [C++](https://github.com/DerThorsten/cpp_cookiecutter) and [Go](https://github.com/lacion/cookiecutter-golang) services.

The action will receive the following user inputs:

<Tabs groupId="actions" defaultValue="github" values={[
{label: "GitHub", value: "github"},
{label: "GitLab", value: "gitlab"}
]}>

<TabItem value="github">

- GitHub organization and repository to host the created service project;
- Template specific parameters, such as `project_name` and `description`.

:::note
In the following JSON, you need to replace the `<WEBHOOK_URL>` placeholders with your URL.

For local setup, look at this [example](../local-debugging-webhook.md#creating-the-vm-create-action).
:::

<details>
<summary>Self-Service Actions JSON</summary>

```json showLineNumbers
[
  {
    "identifier": "CreateDjangoService",
    "title": "Create Django",
    "icon": "Service",
    "userInputs": {
      "properties": {
        "github_organization": {
          "type": "string"
        },
        "github_repository": {
          "type": "string"
        },
        "project_name": {
          "type": "string"
        },
        "description": {
          "type": "string"
        }
      },
      "required": ["github_organization", "github_repository"]
    },
    "invocationMethod": {
      "type": "WEBHOOK",
      "url": "<WEBHOOK_URL>"
    },
    "trigger": "CREATE",
    "description": "Creates a new Django service"
  },
  {
    "identifier": "CreateCPPService",
    "title": "Create C++",
    "icon": "Service",
    "userInputs": {
      "properties": {
        "github_organization": {
          "type": "string"
        },
        "github_repository": {
          "type": "string"
        },
        "project_name": {
          "type": "string"
        },
        "description": {
          "type": "string"
        }
      },
      "required": ["github_organization", "github_repository"]
    },
    "invocationMethod": {
      "type": "WEBHOOK",
      "url": "<WEBHOOK_URL>"
    },
    "trigger": "CREATE",
    "description": "Creates a new C++ service"
  },
  {
    "identifier": "CreateGoService",
    "title": "Create Go",
    "icon": "Service",
    "userInputs": {
      "properties": {
        "github_organization": {
          "type": "string"
        },
        "github_repository": {
          "type": "string"
        },
        "app_name": {
          "type": "string"
        },
        "project_short_description": {
          "type": "string"
        }
      },
      "required": ["github_organization", "github_repository"]
    },
    "invocationMethod": {
      "type": "WEBHOOK",
      "url": "<WEBHOOK_URL>"
    },
    "trigger": "CREATE",
    "description": "Creates a new Go service"
  }
]
```

</details>

</TabItem>

<TabItem value="gitlab">

- Repository to host the created service project;
- Template specific parameters, such as `project_name` and `description`.

:::note
In the following JSON, you need to replace the `<WEBHOOK_URL>` placeholders with your URL.

For local setup, look at this [example](../local-debugging-webhook.md#creating-the-vm-create-action).
:::

<details>
<summary>Self-Service Actions JSON</summary>

```json showLineNumbers
[
  {
    "identifier": "CreateDjangoService",
    "title": "Create Django",
    "icon": "Service",
    "userInputs": {
      "properties": {
        "repository_name": {
          "type": "string"
        },
        "project_name": {
          "type": "string"
        },
        "description": {
          "type": "string"
        }
      },
      "required": ["repository_name"]
    },
    "invocationMethod": {
      "type": "WEBHOOK",
      "url": "<WEBHOOK_URL>"
    },
    "trigger": "CREATE",
    "description": "Creates a new Django service"
  },
  {
    "identifier": "CreateCPPService",
    "title": "Create C++",
    "icon": "Service",
    "userInputs": {
      "properties": {
        "repository_name": {
          "type": "string"
        },
        "project_name": {
          "type": "string"
        },
        "description": {
          "type": "string"
        }
      },
      "required": ["repository_name"]
    },
    "invocationMethod": {
      "type": "WEBHOOK",
      "url": "<WEBHOOK_URL>"
    },
    "trigger": "CREATE",
    "description": "Creates a new C++ service"
  },
  {
    "identifier": "CreateGoService",
    "title": "Create Go",
    "icon": "Service",
    "userInputs": {
      "properties": {
        "repository_name": {
          "type": "string"
        },
        "app_name": {
          "type": "string"
        },
        "project_short_description": {
          "type": "string"
        }
      },
      "required": ["repository_name"]
    },
    "invocationMethod": {
      "type": "WEBHOOK",
      "url": "<WEBHOOK_URL>"
    },
    "trigger": "CREATE",
    "description": "Creates a new Go service"
  }
]
```

</details>

</TabItem>

</Tabs>

Next, in order to listen to the webhook events, you need to set up a simple backend.

Within the backend, you are going to generate the project from the Cookiecutter template (with the provided user parameters), and push it to the GitHub repository you specified.

A full example with a backend, can be found [here for GitHub](https://github.com/port-labs/port-cookiecutter-example) or [here for GitLab](https://github.com/port-labs/port-cookiecutter-gitlab-example).

:::info
The above example also creates a new Service entity in Port, and updates the action run details.

These steps are highly recommended to keep track over time, of the action run, its logs the resulting resources.
:::

That's it! You can now use the provisioned actions, as shown here:

![create-service.png](../../../../../static/img/complete-use-cases/software-templates/create-service.png)

## Summary

Software templates are extremely useful, in order to keep a high velocity of development while maintaining high quality.

Using Port Self-Service Actions, you can conveniently create and record new projects from public or private templates.
