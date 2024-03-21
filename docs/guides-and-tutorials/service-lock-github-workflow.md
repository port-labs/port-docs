---
sidebar_position: 8
sidebar_label: Lock service deployment
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Lock service deployment

During peak periods such as campaigns, holidays, or system outages, it becomes crucial to maintain stability and avoid unexpected changes or disruptions to services. Implementing a service locking mechanism using [Port's Github Action](http://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/ci-cd/github-workflow/) helps to enforce this stability by temporarily preventing deployments during these critical times.


The CI/CD deployment check described in this guide will follow these steps:

1. New code is pushed to the `main` branch of a Git repository
2. A [GitHub workflow](https://docs.github.com/en/actions/using-workflows) is triggered by the push event
3. The Github workflow queries Port's Entity API and returns a response for the service
4. If the value of the `locked_in_prod` field is `true`, the deployment check will fail
5. If the value of the `locked_in_prod` field is `false`, the deployment check will succeed

## Prerequisites
:::tip Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart)
- You will need a GitHub repository in which you can trigger a workflow that we will use in this guide
:::

Below you can find the JSON for the `Service` blueprint required for the guide:
<details>
<summary><b>Service blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "service",
  "title": "Service",
  "icon": "Github",
  "schema": {
    "properties": {
      "readme": {
        "title": "README",
        "type": "string",
        "format": "markdown",
        "icon": "Book"
      },
      "url": {
        "title": "URL",
        "format": "url",
        "type": "string",
        "icon": "Link"
      },
      "language": {
        "icon": "Git",
        "type": "string",
        "title": "Language",
        "enum": [
          "GO",
          "Python",
          "Node",
          "React"
        ],
        "enumColors": {
          "GO": "red",
          "Python": "green",
          "Node": "blue",
          "React": "yellow"
        }
      },
      "slack": {
        "icon": "Slack",
        "type": "string",
        "title": "Slack",
        "format": "url"
      },
      "code_owners": {
        "title": "Code owners",
        "description": "This service's code owners",
        "type": "string",
        "icon": "TwoUsers"
      },
      "type": {
        "title": "Type",
        "description": "This service's type",
        "type": "string",
        "enum": [
          "Backend",
          "Frontend",
          "Library"
        ],
        "enumColors": {
          "Backend": "purple",
          "Frontend": "pink",
          "Library": "green"
        },
        "icon": "DefaultProperty"
      },
      "lifecycle": {
        "title": "Lifecycle",
        "type": "string",
        "enum": [
          "Production",
          "Experimental",
          "Deprecated"
        ],
        "enumColors": {
          "Production": "green",
          "Experimental": "yellow",
          "Deprecated": "red"
        },
        "icon": "DefaultProperty"
      },
      "locked_in_prod": {
        "icon": "DefaultProperty",
        "title": "Locked in Prod",
        "type": "boolean",
        "default": false
      },
      "locked_reason_prod": {
        "icon": "DefaultProperty",
        "title": "Locked Reason Prod",
        "type": "string"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {}
}
```
</details>

:::note Lock property
Our Service blueprint has a property called `locked_in_prod` with a boolean value. We will use the value of this field to determine whether new deployments of the service are allowed.
:::

Now that you have your blueprint created, let's manually create a `Notification Service` entity in our software catalog:

```json showLineNumbers
{
  "identifier": "notification-service",
  "title": "Notification Service",
  "icon": "Github",
  "properties": {
    "url": "https://github.com/my-repo",
    "language": "Python",
    "slack": "https://app.slack.com/client",
    "type": "Backend",
    "lifecycle": "Production",
    "locked_in_prod": true
  },
  "relations": {}
}
```

## Reading the lock status during deployment

In order to use the `locked_in_prod` field in your CI/CD pipeline, you will use Port's [GitHub Action](/build-your-software-catalog/custom-integration/api/ci-cd/github-workflow/).


Let's go ahead and create a GitHub workflow file in a GitHub repository meant for the `Notification Service`:

- Create a GitHub repository (or use an existing one)
- Create a `.github` directory
  - Inside it create a `workflows` directory

Inside the `/.github/workflows` directory create a file called `check-service-lock.yml` with the following content:

<details>
<summary><b> GitHub workflow configuration (click to expand) </b></summary>

```yml showLineNumbers
name: Check Service Lock Status
on:
  push:
    branches:
      - "main"
jobs:
  get-entity:
    runs-on: ubuntu-latest
    outputs:
      entity: ${{ steps.port-github-action.outputs.entity }}
    steps:
      - id: port-github-action
        name: Get entity from Port
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          identifier: notification-service
          blueprint: service
          operation: GET
  check-lock-status:
    runs-on: ubuntu-latest
    needs: get-entity
    steps:
      - name: Get entity lock status
        run: echo "LOCK_STATUS=$(echo '${{needs.get-entity.outputs.entity}}' | jq -r .properties.locked_in_prod)" >> $GITHUB_ENV
      - name: Check lock status 🚧
        if: ${{ env.LOCK_STATUS == 'true' }}
        run: |
          echo "Service in production is locked, stopping deployment"
          exit 1
  run-deployment:
    runs-on: ubuntu-latest
    needs: [check-lock-status]
    steps:
      - name: Run deployment
        run: echo "Service in production is not locked, continuing deployment"
```
</details>

:::tip Secure your credentials
For security reasons it is recommended to save the `PORT_CLIENT_ID` and `PORT_CLIENT_SECRET` as [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets), and access them as shown in the example above.
:::

If you try to push code to your repository when the `locked_in_prod` field is set to `true`, the deployment workflow will stop:

<img src="/img/guides/serviceInProdLocked.png" border="1px" />

When you will look at the step that failed, you will see that the failure is due to the value of the locked field:

<img src="/img/guides/serviceInProdLockedDetails.png" border="1px" />

If you set the value of the `locked_in_prod` field to `false`, the workflow will perform the deployment without any issue:

<img src="/img/guides/serviceInProdNotLocked.png" border="1px" />
