---
title: Setup Action
---

Choose what is the name of the action, the icon, and the user inputs you would like the user to fill out.
Port supports various input types, including constructing wizards with conditions and steps to best fit the experience you want for your users.

Action has several definitions:

1.  **Define action** - The title, icon, user inputs and input validations, as well as the type of the action (Create/Day-2/Delete), and the associated Blueprint it affects (Service, Environment, Cluster, etc). Your can optionally Set guardrails - such as manual approval/TTL.
2.  **Connect action to a Backend** - For every action you define in Port, you tell Port what component is responsible to handle an action submission. This is called the Invocation Method, Port support various invocation methods to different usecases.

## Define Action

@Mor, please add a column of Notes describing the use of Id (by API), and the fact that indicating the type of the action, Port will automatically place the action in the right place in the Developer Portal to make it accessible and indicative for the user. The type of the action is part of the metadata provided by Port to the backend implementing the action to know either to Create a new resource, deleting it or affect an existing resource. END COMMENT FOR MOR

An action consist of several properties:

| Field              | Description                                                                                                                                                                                                                                                                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`               | Internal Action ID (@MOR please add notes as its not clear END COMMENT)                                                                                                                                                                                                                                                                                  |
| `identifier`       | Action identifier                                                                                                                                                                                                                                                                                                                                        |
| `title`            | Action title                                                                                                                                                                                                                                                                                                                                             |
| `icon`             | Action icon                                                                                                                                                                                                                                                                                                                                              |
| `trigger`          | The type of the action: `CREATE`, `DAY-2` or `DELETE`                                                                                                                                                                                                                                                                                                    |
| `userInputs`       | An object containing `properties` and `required` keys following the standard JSON schema format as seen in [Blueprint structure](../../build-your-software-catalog/define-your-data-model/setup-blueprint/setup-blueprint.md#blueprint-structure) (@MOR dont compare to the blueprint schema, but to the new section created for the inputs END COMMENT) |
| `requiredApproval` | Whether the action requires approval or not                                                                                                                                                                                                                                                                                                              |
| `description`      | Action description                                                                                                                                                                                                                                                                                                                                       |
| `invocationMethod` | Defines the destination where invocations of the Self-Service Action will be delivered, see [invocation method](#invocation-method) for details                                                                                                                                                                                                          |

@MOR add a schema of an action (not for a specific action, a generic structure), and add the API, TF, UI options to setup

### `trigger`- Action type

### `userInputs` - Form & Wizard UI

@MOR - Explain shortly and refer to the input types section END COMMENT

### `invocationMethod` - Connect to a backend

@MOR - Explain shortly and mention the following options (for the CI native please ask Yonatan for the list of supported CI native):

- **Webhook** - Setup a webhook to handle forms and wizards submissions + link
- **Kafka** - Subscribe to Kafka topic to handle forms and wizards submissions + link
- **CI Native (Github Workflow)**- Setup Port's CI agent to handle forms & wizards submission via Github Workflows
- **CI Native (Jenkins)**- Setup Port's CI agent to handle forms & wizards submission via Github Workflows
- CI Native (X)- Setup Port's CI agent to handle forms & wizards submission via X

### Invocation method structure fields

| Field                  | Type      | Description                                                                                                                                                                                                                                                                                  | Example values                      |
| ---------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `type`                 | `string`  | Defines the self-service action destination type                                                                                                                                                                                                                                             | Either `WEBHOOK`, `KAFKA`, `GITHUB` |
| `agent`                | `boolean` | Defines whether to use [Port Agent] for execution or not. <br></br> Can only be added if `type` is set to `WEBHOOK`                                                                                                                                                                          | Either `true` or `false`            |
| `url`                  | `string`  | Defines the webhook URL to which Port sends self-service actions to via HTTP POST request. <br></br> Can be added only if `type` is set to `WEBHOOK`                                                                                                                                         | `https://example.com`               |
| `org`                  | `string`  | Defines the GitHub organization name. <br></br> Can be added only if `type` is set to `GITHUB`                                                                                                                                                                                               | `port-labs`                         |
| `repo`                 | `string`  | Defines the GitHub repository name. <br></br> Can be added only if `type` is set to `GITHUB`                                                                                                                                                                                                 | `port-docs`                         |
| `workflow`             | `string`  | Defines the GitHub workflow ID to run (You can also pass the workflow file name as a string). <br></br> Can be added only if `type` is set to `GITHUB`                                                                                                                                       | `blank.yml`                         |
| `omitPayload`          | `boolean` | Flag to control whether to send [`port_payload`](#action-message-structure) JSON string as an additional parameter to the GitHub workflow (default: `false`). <br></br> Can be added only if `type` is set to `GITHUB`                                                                       | `false`                             |
| `omitUserInputs`       | `boolean` | Flag to control whether to send the user inputs of the Port action as isolated parameters to the GitHub workflow (default: `false`). When disabled, you can still get the user inputs from the `port_payload` (unless omitted too). <br></br> Can be added only if `type` is set to `GITHUB` | `false`                             |
| `reportWorkflowStatus` | `boolean` | Flag to control whether to automatically update the Port `run` object status at the end of the workflow (default: `true`). <br></br> Can be added only if `type` is set to `GITHUB`                                                                                                          | `true`                              |

Add a generic json with the structure
END COMMENT

### `requireApproval` - Require manual approval (optional)

@MOR add a few examples END COMMENT
