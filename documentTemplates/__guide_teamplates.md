---
sidebar_position: 1
tags:
  - Relevant
  - Tags
  - For
  - Guide
---

# Guide Title (subject / usecase)

## Overview

A short overview of this guide. This should include:
- Why this use-case is important.
- Short explanation on what the end goal is / what you will achieve when this guide is complete.
- Short explanation on what will be done in the guide.

EXAMPLE:
Developers need access to do ... . With all of your ... being exported to Port, you can create an experience that allows your developers to do ... using Port.

It is important to be able to keep track of ..., whether it is ..., or what ....

In this step-by-step guide, we will create Port blueprints and actions, which will allow you to.... You will also be able to...

## Prerequisites

A List of prerequisites this guide has. Some common examples:
- Prepare your Port organization's `Client ID` and `Client Secret`. To find your Port credentials, click [here](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials).
- In your GitHub organization, create a new repository called `XXXXXX`. You will use this repository to maintain your GitHub workflows, and other dependency files.
- In this guide, we will be deploying X using Helm. Prepare a K8s cluster.


## Data Model
Most of the Port guides will have some sort of data model implemented, either manually created or automatically created via an integration.
In both cases, we want to provide a short explanation of the data model, including a recap of each blueprint and what it is responsible for.


EXAMPLE:
For this guide, we will be creating <PortTooltip id="blueprint">blueprints</PortTooltip> responsible for managing and keeping track of X...

Let's create the following blueprints in your Port organization:

<details>
    <summary>`My Blueprints` blueprint</summary>

    The entities of this blueprint will represent different XXXXXX.
    
    ```json showLineNumbers
    {
        "identifier": "my_blueprint",
        "title": "My Blueprint",
        "icon": "AWS",
        "schema": {
            "properties": {
                "prop1": {
                    "items": {
                        "type": "object"
                    },
                    "title": "Prop1",
                    "type": "array",
                    "icon": "DefaultProperty"
                },
                "prop2": {
                    "icon": "DefaultProperty",
                    "title": "Prop2",
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

### Actions backend - <Backend type>
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
  do-y:
    name: Do Y
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "Doing X"
  do-z:
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
Click [here](/docs/actions-and-automations/create-self-service-experiences/setup-ui-for-action/?configure=ui#configuring-actions-in-port)!
:::

Let's create the Port actions to trigger the workflows we just created:
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
Now after everything is set up, we just need to create a few entities.

### Defining entities for the usecase
We will be using entities from blueprint `X` to handle our ..... Navigate to the [X](https://app.getport.io/X) catalog page to create some entities.

<!-- Picture of entity creation form -->
<p align="center">
<img src='/path/to/png.png' width='50%' border='1px' />
</p>

We are all set!

### Using the use-case
After the use-case setup is complete, we want to instruct the reader how to use the use-case. This includes running the actions, updating entities, aquiring data regarding his entities, etc...

EXAMPLE:
Now that we finished setting up our Port environment, and our action backends, we are ready to do X,Y,Z.

#### Doing X
Let's start by running action ...

Click on the `...` at the top right of the entity screen -> click `RUN ACTION` -> choose an `INPUT`  -> click `Execute`.

This will trigger a new action run which will appear in the right action runs bar. Click on the action run to navigate to the run page.

When the Port action run ends, you will get action logs which will show you info regarding:
- A
- B
- C

The action will also create a new `X` entity which you can see in the [X](https://app.getport.io/X) catalog page.

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

