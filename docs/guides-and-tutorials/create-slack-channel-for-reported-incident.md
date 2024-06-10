---
sidebar_position: 12
tags:
  - Automations
  - Pagerduty
  - Slack
  - Incident
  - Github
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Automating incident managment

## Overview

Solving incidents efficiently is a crucial part of any production-ready environment. When managing an incident, there are a base concepts which are important to keep:
- **Real time notifications** - When an incident has been created, either by an alert or manually, it is important that a push notification will be sent the the relvant authoritizes as soon as possible. This can be in the form of a Slack message, email or any other form of communication.
- **Documentation** - When there is an ongoing incident, it is important that different personas across the organization will be aware of it. Hence, it is important to document the incident in relevant places, for example as a Port entity, a Github issue or even a Jira issue
- **Visibility** - While troubleshooting, it is important to provide information both to all relevant personas in the organization. An ideal place to manage an incident would be a group chat with the relevant people.

<!-- TODO: Add link to automations docs -->

In this guide, we will be using Port's [Automations]  capabilities to automate incident management. To do so we will create an automation which will be triggered when a Pagerduty incident entity is created in Port. This automation will:
- Create a Slack channel for managing the incident and providing a place to troubleshoot.
- Send a breif message regarding the incident in the Slack channel for visibility.
- Create a Github issue for documenting the incident.


## Prerequisites
- Install Port's [Github app](https://github.com/apps/getport-io) in your Github organization.
- Install Port's [Pagerduty integration](../build-your-software-catalog/sync-data-to-catalog/incident-management/pagerduty.md) for real-tiome incident ingestion to Port. This integration will in turn trigger our automation when a new incident is created in Pagerduty.
- [Ingest Github issues](../build-your-software-catalog/sync-data-to-catalog/git/github/examples/resource-mapping-examples.md#mapping-repositories-and-issues) using Port's Github app.
- Prepare your Port organization's `Client ID` and `Client Secret`. To find you Port credentials, click [here](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials).
- In your GitHub organization, create a new repository called `port-actions`. You will use this repository to maintain your GitHub workflows, and other dependency files.


## Data Model
For this guide, we will be making a few modifications to our pre-existing blueprints in order to support our use-case:


<details>
    <summary>`Pagerduty Incidents` blueprint</summary>

    Add the following property:

    ```json showLineNumbers
    "slack_channel": {
        "type": "string",
        "title": "The Slack Channel opened for troubleshooting this incident",
        "icon": "Slack",
        "format": "url"
    }
    ```

    Add the following relations:

    ```json showLineNumbers
    "service": {
        "title": "Service",
        "description": "The service this incident is related to",
        "target": "service",
        "required": false,
        "many": false
    },
    "issue": {
        "target": "githubIssue",
        "many": false,
        "required": false,
        "description": "The issue created for documenting this incident"
    }
    ```
</details>

<!-- Add an image of the final data model -->
<p align="center">
<img src='/path/to/data-model/png' width='75%' border='1px' />
</p>

## Installations - optional
If you guide includes any installation, either integrations or any 3rd pary application, inser this section.
Add a short explanation that we will be using X,Y,Z in this guide.

EXAMPLE:
In this guide we will be installing Port's Jira integration, and also set up Port's Github app.
<details>
    <summary>Installing Port's Jira integration</summary>

We will be using Port's Jira issue to connect our Jira data to our Github data.
To install Port's Jira integration, run the fo

```bash showLineNumbers title="Installation command"

```
</details>

## Actions - Optional
If your guide includes setting up Port actions and action backends, insert this section.
Provide a short explanation on why we need the Port actions. 


EXAMPLE:
We want to be able to do X from Port. To do so, we will need to create some <PortTooltip id="action">actions</PortTooltip> in our Port organization, and set up some action backends.

### Actions backend - 
Provide a small summary of the backend you are planning to use.
For each action backend you create (for example, different workflows, pipelines, URL trigger link etc...), provide a short explanation, with a codeblock of the action logic.

If there are any dependencies for the actions, for example template files, also define them here with a short example, and the file in a codeblock.

EXAMPLE:
Create the following files your `XXXXXXXXX` repository, in the correct path as it appears in the filename:

<details>
    <summary>`Do X,Y,Z` GitHub workflow</summary>

This workflow is responsible for Doing X,Y,Z

```yaml showLineNumbers title=".github/workflows/do-x-y-z.yaml"
name: Do X, Y, Z
on:
  workflow_dispatch:
    inputs:
      port_payload:
        type: string
        required: true
        description: The Port Payload for triggering this action                

jobs:
  do-x:
    name: Do X
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "Doing X"
  do-x:
    name: Do Y
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "Doing X"
  do-x:
    name: Do Z
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "Doing X"
```
</details>

<details>
    <summary>`...` template file</summary>

    This file will act as a template for ....
    

    ```json showLineNumbers title=".github/templates/X_template.yaml"
    {
        "key": "value"
    }

    ```

</details> 

### Creating the Port actions
This section should be an explanation of how to create the Port actions using the UI.
It should provide short explanations for each Port action, and the JSON definition for it.

EXAMPLE:
After creating our backend in ..., we need to create the Port actions to trigger the workflows we created.
We will create the Port actions using the Port UI.

:::tip Creating actions with JSON
Don't know how to create Port actions using JSONs in the Port UI?
Click [here](/docs/create-self-service-experiences/setup-ui-for-action/?configure=ui#configuring-actions-in-port)!
:::

Let's create the Port actions to tirgger the workflows we just created:
<details>
    <summary>`...` Port action</summary>

    This is a `DAY-2` action on the `...` blueprint, for doing ....

    ```json showLineNumbers
    {
        "identifier": "cool_action",
        "title": "Cool Action",
        "icon": "Unlock",
        "userInputs": {
            "properties": {
                "inputA": {
                    "title": "InputA",
                    "type": "string"
            },
            "required": [],
            "order": []
        },
        "invocationMethod": {
            "type": "GITHUB",
            "org": "<YOUR_GITHUB_ORG>",
            "repo": "<YOUR_REPO>",
            "workflow": "....yaml",
            "omitUserInputs": true,
            "omitPayload": false,
            "reportWorkflowStatus": true
        },
        "trigger": "DAY-2",
        "description": "....",
        "requiredApproval": false
    }
    ```
</details>

## Final touches
In this section, everything is set up and ready to use. We just need to create a few entities or copy-pase some configuration for an integration.


EXAMPLE:
Now after evething is set up, we just need to create a few entities.

### Defining entities for the usecase
We will be using entities from blueprint `X` to handle our ..... Navigate to the [X](https://app.getport.io/X) catalog page to create some entities.

<!-- Picture of entity creation form -->
<p align="center">
<img src='/path/to/png.png' width='50%' border='1px' />
</p>

We are all set!

### Using the use-case
After the use-case setup is complete, we want to instruct the reader how to use the use-case. This include running the actions, updating entities, aquiring data regarding his entities etc...

EXAMPLE:
Now that we finished setting up our Port environment, and our action backends, we are ready to do X,Y,Z.

#### Doing X
Let's start by ruuning action ...

Click on the `...` at the top right of the entity screen -> click `RUN ACTION` -> choose an `INPUT`  -> click `Execute`.

This will trigger a new action run which will appear in the right action runs bar. Click on the action run to navigate to the run page.

When the Port action run will end, you will get action logs which will show you info regarding:
- A
- B
- C

The actoin will also create a new `X` entity which you can see in the [X](https://app.getport.io/X) catalog page.

Click the link the the action logs to do reach X.

You have now achieved your goal!

<!-- Picutre of achived goal -->
<p align="center">
<img src='/path/to/goal.png' width='75%' border='1px' />
</p>


## Summary 
Provide a short summary of what was achieved in the guide.

EXAMPLE:
That's it! You are all set up to do X,Y,Z using Port!🚀

Feel free to further experiment with the use-case by doing X,Y,Z.

See the [Next Steps](#next-steps) section to understand how to take this guide one step further with your Port environment.

## Next Steps
Provide ideas for extra steps for this use-case. It doesn't have to be technical, but just pointers for interesting extentions of this guide.

Some examples:
- How can this guide be connected to a standart Port account
- Provide more ways to ingest data to the catalog
- Add interesting properties
- Create dashboards to view 1,2,3

