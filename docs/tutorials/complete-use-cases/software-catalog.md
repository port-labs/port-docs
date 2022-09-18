---
sidebar_position: 1
---

# Software Catalog

A software catalog keeps track of all of your cloud and development resources and assets. A software catalog gives your developers a complete understanding of your development infrastructure and who is responsible for which microservice.

:::tip
You can read more about software catalogs on our [blog](https://www.getport.io/blog/microservice-catalog-isnt-enough-why-software-catalogs-with-resources-inside-are-the-right-approach-for-developer-portal)
:::

## Goal

In this guide you will setup an initial software catalog. This guide will show you how to use:

- Port's [Terraform provider](../../integrations/terraform.md) - to document your cloud resources
- Port's [GitHub App](../../integrations/github/app/introduction.md) - to document your microservices
- Port's [GitHub Action](../../integrations/github/github-action.md) - to document your microservice deployments

By the end of this guide, you will have an initial environment as shown below:

![software catalog layout](../../../static/img/tutorial/complete-use-cases/software-catalog/software-catalog-layout.png)

Let's go over the different [Blueprints](../../platform-overview/port-components/blueprint.md) shown above and how we will create [Entities](../../platform-overview/port-components/entity.md) for each of them:

- **Deployment** - a new version deployment of a microservice, will be reported using Port's GitHub Action as part of the deployment process.
- **Deployment Config** - a version of a microservice, running in a specific environment in your infrastructure, will be reported manually in this guide.
- **Environment** - a logical cloud environment where your services live (for example, a Kubernetes namespace), will be reported using Port's Terraform Provider.
- **Microservice** - a microservice providing part of your product's service, will be reported by Port's GitHub App.

Now that you know the end-result of this guide, let's start by creating the Blueprints and [Relations](../../platform-overview/port-components/relation.md) of your software catalog

## Blueprints and Relations

Below you can find the JSON for all of the Blueprints you need to create to follow this guide:

:::note
The Blueprint JSON provided below already includes the Relations between the different Blueprints, so please create them in the order that they appear.
:::

<details>
<summary>Microservice Blueprint JSON</summary>

```json showLineNumbers
{
  "identifier": "Microservice",
  "title": "Microservice",
  "icon": "Microservice",
  "schema": {
    "properties": {
      "slackChannel": {
        "type": "string",
        "format": "url",
        "title": "Slack Channel"
      },
      "repo": {
        "type": "string",
        "title": "Repository URL",
        "format": "url",
        "description": "Link to the microservice repo on GitHub"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "formulaProperties": {},
  "relations": {}
}
```

</details>

<details>
<summary>Environment Blueprint JSON</summary>

```json showLineNumbers
{
  "identifier": "Environment",
  "title": "Environment",
  "icon": "Environment",
  "schema": {
    "properties": {
      "awsRegion": {
        "type": "string",
        "enum": ["eu-west-1", "us-west-1"],
        "title": "AWS Region"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "formulaProperties": {},
  "relations": {}
}
```

</details>

<details>
<summary>Deployment Config Blueprint JSON</summary>

```json showLineNumbers
{
  "identifier": "DeploymentConfig",
  "title": "Deployment Config",
  "icon": "Service",
  "schema": {
    "properties": {
      "locked": {
        "type": "boolean",
        "title": "Locked",
        "default": false,
        "description": "Are deployments currently allowed for this configuration",
        "icon": "Lock"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "formulaProperties": {},
  "relations": {
    "deployedAt": {
      "title": "Environment",
      "target": "Environment",
      "required": false,
      "many": false
    },
    "instanceOf": {
      "title": "Microservice",
      "target": "Microservice",
      "required": false,
      "many": false
    }
  }
}
```

</details>

<details>
<summary>Deployment Blueprint JSON</summary>

```json showLineNumbers
{
  "identifier": "Deployment",
  "title": "Deployment",
  "icon": "Deployment",
  "schema": {
    "properties": {
      "jobUrl": {
        "type": "string",
        "format": "url",
        "title": "Job URL"
      },
      "commitSha": {
        "type": "string",
        "title": "Commit SHA"
      }
    },
    "required": []
  },
  "mirrorProperties": {
    "awsRegion": {
      "title": "AWS Region",
      "path": "instanceOf.deployedAt.awsRegion"
    }
  },
  "formulaProperties": {},
  "relations": {
    "instanceOf": {
      "title": "Deployment Config",
      "target": "DeploymentConfig",
      "required": false,
      "many": false
    }
  }
}
```

</details>

:::tip
Remember that Blueprints can be created both from the [UI](../blueprint-basics.md#from-the-ui) and from the [API](../blueprint-basics.md#from-the-api)
:::

Now that you have your Blueprints created, connected and ready to go, time to create your Entities:

## Entities

### Environment - Terraform provider

To keep things short and simple, let's assume you only have a production environment, we'll use Port's Terraform provider to create an Entity for the production environment.

:::info
In a real environment, this terraform file would also include actual provisioning of cloud resources, such as the kubernetes namespace corresponding to the environment Entity.
:::

Create a file called `env.tf` with the following content:

```hcl showLineNumbers
terraform {
  required_providers {
    port-labs = {
      source  = "port-labs/port-labs"
      version = "~> 0.4.5"
    }
  }
}

provider "port-labs" {
  client_id = "{YOUR CLIENT ID}"     # or set the env var PORT_CLIENT_ID
  secret    = "{YOUR CLIENT SECRET}" # or set the env var PORT_CLIENT_SECRET
}

software "port-labs_entity" "production" {
  identifier = "production"
  title      = "Production"
  blueprint  = "Environment"
  properties {
    name  = "aws_region"
    value = "eu-west-1"
  }
}
```

:::note
Remember to replace the placeholders for `YOUR_CLIENT_ID` and `YOUR_CLIENT_SECRET` with your Port client ID and secret.
:::

Now, in the same directory as the one you created `env.tf` in, run the following commands:

```bash showLineNumbers
terraform init
terraform plan
terraform apply
```

Now that you have your environment ready, it's time to create a microservice.

### Microservice - GitHub app

To create your microservice, you will connect Port's [GitHub app](../../integrations/github/app/installation.md) to your microservice repository, and add a `port.yml` file describing the microservice you want to create an Entity for in Port.

Here is an example `port.yml` file for a microservice called `Notification Service`:

```yml showLineNumbers
identifier: notification-service
title: Notification Service
blueprint: Microservice
properties:
  slackChannel: "https://yourslack.slack.com/archives/CHANNEL-ID"
```

:::tip
You don't need to manually include the `repo` property in the `port.yml` file, `repo` is one of the GitHub App's [auto-imported properties](../../integrations/github/app/auto-importing-properties.md), so it will be added to the microservice Entity automatically.
:::

After you commit the `port.yml` file to your repository, you should now see your microservice in Port.

### Deployment Config - Port API

A deployment config is used to represent a deployment of a microservice, in a specific environment in your infrastructure. A deployment config is a logical object which doesn't translate to a real Entity in your infrastructure. Instead, a deployment config has multiple `deployments` tied to it, each representing a new version of the deployed code of the matching microservice, in the matching environment.

Let's manually create a deployment config Entity for the `Notification Service` microservice in the `Production` environment:

```json showLineNumbers
{
  "identifier": "notification-service-prod",
  "title": "Notification Service Production",
  "properties": {
    "locked": false
  },
  "relations": {
    "deployedAt": "production",
    "instanceOf": "notification-service"
  }
}
```

Below is a `python` code snippet to create this deployment config:

<details>
<summary>Click here to see the code</summary>

```python showLineNumbers
import requests

CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'

API_URL = 'https://api.getport.io/v1'

target_blueprint = 'DeploymentConfig'

credentials = {'clientId': CLIENT_ID, 'clientSecret': CLIENT_SECRET}

token_response = requests.post(f'{API_URL}/auth/access_token', json=credentials)

access_token = token_response.json()['accessToken']

headers = {
    'Authorization': f'Bearer {access_token}'
}

entity = {
    "identifier": "notification-service-prod",
    "title": "Notification Service Production",
    "properties": {
        "locked": False
    },
    "relations": {
        "deployedAt": "production",
        "instanceOf": "notification-service"
    }
}


response = requests.post(f'{API_URL}/blueprints/{target_blueprint}/entities', json=entity, headers=headers)

print(response.json())
```

</details>

Time to move on to the final piece: consistent deployment reporting.

### Deployment - GitHub Action

In order to keep track of your microservice, you will implement a [Github Workflow](https://docs.github.com/en/actions/using-workflows) that will create a new deployment Entity every time code is merged to the `main` branch of your microservice repo.

:::tip
The example we're working with here assumes you only have one microservice in your repository, but the workflow file we are going to create can be the template for a workflow file that creates a specific deployment Entity based on provided parameters.
:::

In your repository create a directory called `.github` under the repository root, inside the new directory, create a `workflows` directory.

Now inside the `/.github/workflows` directory create a file called `report-deployment.yml` with the following content:

```yml showLineNumbers
name: Report Deployment

on:
  push:
    branches:
      - "main"

jobs:
  report-deployment:
    name: Report new deployment Entity
    runs-on: ubuntu-latest
    steps:
      - name: Extract SHA short
        run: echo "SHA_SHORT=${GITHUB_SHA:0:7}" >> $GITHUB_ENV
      - name: "Report deployment Entity to port 🚢"
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          identifier: notification-service-prod-${{ env.SHA_SHORT }}
          title: Notification-Service-Production-${{ env.SHA_SHORT }}
          blueprint: Deployment
          properties: |
            {
               "jobUrl": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}",
               "commitSha": "${{ env.SHA_SHORT }}"
            }
          relations: |
            {
               "instanceOf": "notification-service-prod"
            }
```

## Summary

At this point, you should have a basic software catalog up and running, with new deployments Entities being created in Port, allowing you to keep track of how your code changes across your different environments.

This guide acts as a base for your complete software catalog - go ahead and add more environments, more microservices and more cloud infrastructure resources to give your developers a complete image of your infrastructure.

Then, begin providing [Self-Service](../../platform-overview/self-service-actions/self-service-actions.md) capabilities to your developers.
