import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

The **`type`** field defines the action's backend type, and can have one of the following values: `WEBHOOK`, `GITHUB`, `GITLAB`, `KAFKA`, `UPSERT_ENTITY`.

Depending on the backend type you choose, the available fields will be different:

<Tabs groupId="backendType" queryString defaultValue="webhook">

<TabItem value="webhook" label="Webhook">

`invocationMethod.type` should be set to `WEBHOOK`.

| Field     | Type      | Description                                                                                                                                                    | Example values      |
| --------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `agent`   | `boolean` | Defines whether to use [Port Agent](/actions-and-automations/setup-backend/webhook/port-execution-agent/port-execution-agent.md) for execution or not. | `true` or `false`   |
| `url`     | `string`  | Defines the webhook URL to which Port will send the action via an HTTP POST request.                                                                           | https://example.com |
| `method`  | `string`  | Defines the HTTP method to be used for the request.                                                                                                           | `POST`, `PUT`, `DELETE`, `PATCH` |
| `synchronized` | `boolean` | If true, the action will be executed [synchronously](https://docs.port.io/create-self-service-experiences/setup-backend/webhook/#sync-vs-async-execution). | `true` or `false` |
| `headers` | `object`  | An object containing the payload headers to be sent to the webhook in each execution, in `"key":"value"` pairs.                                        |
| `body`    | `object`  | Defines the **payload** that will be sent to the backend upon execution of the action.<br/>An object containing `"key":"value"` pairs.                                                  |

</TabItem>

<TabItem value="github" label="Github">

`invocationMethod.type` should be set to `GITHUB`.

| Field                  | Type      | Description                                                                                                                                                                                                              | Example values                           |
| ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| `org`                  | `string`  | The GitHub *organization* name.                                                                                                                                | `port-labs`                              |
| `repo`                 | `string`  | The GitHub *repository* name.                                                                                                                                  | `port-docs`                              |
| `workflow`             | `string`  | Defines the GitHub *workflow ID* to run (You can also pass the workflow file name as a string).                                                                | `workflow.yml`                           |  |
| `reportWorkflowStatus` | `boolean` | A flag to control whether to automatically update the Port `run` object status (SUCCESS/FAILURE) at the end of the workflow (default: `true`).                | `true` or `false` |
| `workflowInputs` | `object` | Defines the **payload** that will be sent to the backend upon execution of the action.<br/>An object containing `"key":"value"` pairs. |  |

</TabItem>

<TabItem value="gitlab" label="Gitlab">

`invocationMethod.type` should be set to `GITLAB`.

| Field                  | Type      | Description                                                                                                                                                                                                              | Example values                           |
| ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| `defaultRef`           | `string`  | The default ref (branch/tag name) we want the action to use. <br></br> `defaultRef` can be overridden dynamically, by adding `ref` as user input. <br></br> Can only be used if `type` is set to `GITLAB`.                |
| `projectName`          | `string`  | The GitLab *project* name.<br></br>Can only be used if `type` is set to `GITLAB`.                                                                                                                                        | `port`                                   |
| `groupName`            | `string`  | The GitLab *group* name.<br></br>Can only be used if `type` is set to `GITLAB`.                                                                                                                                          | `port-labs`                              |
| `pipelineVariables` | `object` | Defines the **payload** that will be sent to the backend upon execution of the action.<br/>An object containing `"key":"value"` pairs. |  |


</TabItem>

<TabItem value="azure-devops" label="Azure DevOps">

`invocationMethod.type` should be set to `AZURE_DEVOPS`.

| Field | Type | Description | Example values |
| --- | --- | --- | --- |
| `webhook` | `string` | The name of the webhook resource in the Azure YAML pipeline file. | |
| `org` | `string` | The Azure DevOps organization in which the pipeline is located. | `port-labs` |
| `payload` | `object` | Defines the **payload** that will be sent to the backend upon execution of the action.<br/>An object containing `"key":"value"` pairs. |  |

</TabItem>

<TabItem value="kafka" label="Kafka">

`invocationMethod.type` should be set to `KAFKA`.

| Field                  | Type      | Description                                                                                                                                                                                                              | Example values                           |
| ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------- |
| `payload`              | `object`  | Defines the **payload** that will be sent to the backend upon execution of the action.<br/>An object containing `"key":"value"` pairs.                                                              |

</TabItem>

<TabItem value="upsertEntity" label="Create/update entity">

`invocationMethod.type` should be set to `UPSERT_ENTITY`.

| Field | Type | Description | Example values |
| --- | --- | --- | --- |
| `blueprintIdentifier` | `string` | The identifier of the blueprint from which the entity will be created/updated. | `service` |
| `mapping` | `object` | Defines the properties of the entity that will be created/updated. | `{"name":"newEntityName"}`


</TabItem>

</Tabs>