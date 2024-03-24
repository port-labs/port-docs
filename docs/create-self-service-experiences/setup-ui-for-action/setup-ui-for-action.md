---
title: Setup Actions
---

import ApiRef from "../../api-reference/\_learn_more_reference.mdx";

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Setup frontend

<center>

<iframe width="60%" height="400" src="https://www.youtube.com/embed/DhDQ_lucdgM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>

</center>
<br/>

After selecting the blueprint you want to add an action to, we need to define the action's frontend - its structure and interface.

This is done in the first two tabs of the action creation form in Port's UI:

<img src='/img/self-service-actions/setup-frontend/action-form-frontend.png' width='60%' border='1px' />
<br/><br/>

Click [here](/create-self-service-experiences/#action-json-structure) for a reminder of an action's JSON structure.

## Basic details

Here we will define the action's `title`, `icon`, and `description`.

We will also choose the action's `type`:

- **Create** - the action will result in the creation of a new <PortTooltip id="entity">entity</PortTooltip> in Port by triggering a provisioning process in your infrastructure. Since these actions create a new entity, they are not tied to an existing entity in your software catalog.
- **Delete** - the action will result in the deletion of an existing entity by triggering delete logic in your infrastructure.
- **Day-2** - the action will trigger logic in your infrastructure to update or modify an existing entity in your catalog.

## User form

Port allows you to create a wizard-like experience for your developers by utilizing a variety of input types they will need to fill, while also including input validations.  

See the [user inputs](./user-inputs/user-inputs.md) page for more details about the available input types.

You can even define more advanced forms with dynamic fields that change according to your data or other inputs in the form. See [advanced input configurations](/create-self-service-experiences/setup-ui-for-action/advanced-form-configurations) for more information and examples.

## Next step

Once the frontend is set up, we will move on to the action's [backend configuration](/create-self-service-experiences/setup-backend/).

## Steps 

1. **Define [action information](#structure-table)** - the action's title, icon, and description.
2. **Select the [user inputs](#userinputs---form--wizard-ui)** - create a wizard-like experience for your developers by specifying the input types they will need to fill, while also including input validations.
3. **Choose the [action's type](#trigger--action-type)** - Create/Day-2/Delete.
4. **Connect the action to a [backend](#invocationmethod---connect-to-a-backend)** - for every action you create in Port, you define the backend responsible for handling its logic. This is called the **invocation method**, Port supports various invocation methods for different use cases and environments.
5. **Configure [RBAC and guardrails](/create-self-service-experiences/set-self-service-actions-rbac/) (optional)** - this step allows you to choose who can trigger an action, does the action require manual approval from an admin, and who has the permissions to approve or dismiss execution requests.


### `invocationMethod` - Connect to a backend

Port actions support a variety of target backends that can be triggered when an action is invoked.

The different backends are denoted and configured via the `invocationMethod` key, the available methods are:

- **Webhook** - setup a webhook URL to receive and handle forms and wizards submissions.
- **Kafka** - subscribe to Kafka topic to listen to messages with forms and wizards submissions.
- **CI Native (Github Workflow)** - setup Port's [GitHub app](/build-your-software-catalog/sync-data-to-catalog/git/github/github.md) to handle forms & wizards submission via Github Workflows.
- **CI Native (Azure Pipeline)**- setup a webhook type service connection to trigger Azure pipelines and handle forms & wizards submission via Github Workflows.
- **Port agent** - setup Port's agent tp receive forms & wizards submissions and forward them to your backend on your internal network.

To learn more about the different available invocation methods and backends, refer to the [setup backend](../setup-backend/setup-backend.md) page.

### `requireApproval` - Require manual approval (optional)

Port actions support a manual approval process. Manual approvals let you control who can approve an action invocation request, and also handle notifying the relevant personas when an action request is awaiting their review.

Refer to the [self-service actions RBAC](../set-self-service-actions-rbac/set-self-service-actions-rbac.md) page to learn more.

