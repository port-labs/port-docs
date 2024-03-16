---
title: Setup Actions
---

import ApiRef from "../../api-reference/\_learn_more_reference.mdx";

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Setup frontend

<center>

<iframe width="60%" height="400" src="https://www.youtube.com/embed/DhDQ_lucdgM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>

</center>
<br/>

After selecting the blueprint you want to add an action to, we need to define the action's frontend - its structure and interface.

## Steps 

1. **Define [action information](#structure-table)** - the action's title, icon, and description.
2. **Select the [user inputs](#userinputs---form--wizard-ui)** - create a wizard-like experience for your developers by specifying the input types they will need to fill, while also including input validations.
3. **Choose the [action's type](#trigger--action-type)** - Create/Day-2/Delete.
4. **Connect the action to a [backend](#invocationmethod---connect-to-a-backend)** - for every action you create in Port, you define the backend responsible for handling its logic. This is called the **invocation method**, Port supports various invocation methods for different use cases and environments.
5. **Configure [RBAC and guardrails](/create-self-service-experiences/set-self-service-actions-rbac/) (optional)** - this step allows you to choose who can trigger an action, does the action require manual approval from an admin, and who has the permissions to approve or dismiss execution requests.

## Action structure

Each action is represented by a [Json schema](https://json-schema.org/) that looks like this:

<details>
<summary><b>Action schema (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "myIdentifier",
  "title": "My title",
  "description": "My description",
  "icon": "My icon",
  "userInputs": {
    "properties": {
      "myInput1": {
        "type": "my_type",
        "title": "My input"
      },
      "myInput2": {
        "type": "my_special_type",
        "title": "My special input"
      }
    },
    "required": []
  },
  "invocationMethod": {
    "type": "myInvocationType"
  },
  "trigger": "myActionTrigger",
  "requiredApproval": false
}
```

</details>

:::note actions array
Actions configured for a blueprint are saved as an array, in the JSON example above you can see the schema of a single action, in order to save this action definition in your blueprint, remember to wrap it in square brackets (`[]`) to include it as part of the array:

```json showLineNumbers
[
  {
  "identifier": "myIdentifier",
  "title": "My title",
  "description": "My description",
  "icon": "My icon",
  "userInputs": {
    "properties": {
  ... action definition
    }
  }
]
```

:::

### Structure table

An action consists of several properties:

| Field              | Description                                                                                                                       | Notes                                                                                                                                                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | Internal action ID                                                                                                                | An internal ID Port assigns to each action. Immutable. The `id` field will be added to the action JSON automatically after creating the action.                                                                                         |
| `identifier`       | Unique identifier                                                                                                                 | **Required**. The identifier is used for API calls, programmatic access and distinguishing between different actions.                                                                                                                  |
| `title`            | Name                                                                                                                              | A human-readable name for the action.                                                                                                                                                                                                     |
| `description`      | Description                                                                                                                       | The value is visible on the action card in the [self-service page](https://app.getport.io/self-serve) and also as a tooltip to users when hovering over the action in the UI.                                                                                                 |
| `icon`             | Action icon                                                                                                                       | See the full icon list [here](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/setup-blueprint.md#full-icon-list).                                                                              |
| `trigger`          | The type of the action: `CREATE`, `DAY-2` or `DELETE`                                                                             | The action type is sent by Port to the action backend as part of the action metadata.<br/>In addition, Port separates actions in the [self-service page](https://app.getport.io/self-serve) by type for convenience.|
| `userInputs`       | An object that defines the action's inputs | See the [user inputs page](./user-inputs/user-inputs.md#structure) for details. |
| `requiredApproval` | Whether the action requires approval or not                                                                                       |
| `invocationMethod` | The invocation method for the action                                                                                              | Defines the action's backend type, see [invocation method](#invocation-method) for details.                                                                                                     |

### `userInputs` - Form & Wizard UI

Port actions support a variety of user inputs which make it easy to create UI forms and wizards.

By using user inputs, you can specify to your users exactly what information your backend requires to handle the action request. In addition, the user inputs provide validation support out-of-the-box, making it easy to put guardrails in place and make sure that input values are standardized.

To learn more about user inputs, refer to the [user inputs](./user-inputs/user-inputs.md) page.

### `trigger` - Action type

Port offers 3 action types:

- **Create** - the action will result in the creation of a new Entity in Port by triggering a provisioning process in your infrastructure. Since these actions create a new entity, they are not tied to an existing entity in your software catalog.
- **Delete** - the action will result in the deletion of an existing Entity by triggering delete logic in your infrastructure.
- **Day-2** - the action will trigger logic in your infrastructure to update or modify an existing Entity in your catalog.

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

