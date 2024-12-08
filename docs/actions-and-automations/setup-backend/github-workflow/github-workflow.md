# GitHub workflow

The GitHub backend allows you to trigger GitHub workflows for your self-service actions and automations, using [Port's GitHub application](/build-your-software-catalog/sync-data-to-catalog/git/github/installation.md).  

:::tip GitHub app types
The GitHub backend is available for both the standard Port [GitHub app](/build-your-software-catalog/sync-data-to-catalog/git/github/github.md), and the [self-hosted version](/build-your-software-catalog/sync-data-to-catalog/git/github/self-hosted-installation.md).
:::

<img src="/img/self-service-actions/portGithubWorkflowArchitecture.png" width='90%' border='1px' />
<br/><br/>

The steps shown in the image above are as follows:

1. Port publishes an invoked `action` message to a topic.
2. A secure topic (`ORG_ID.github.runs`) holds all the action invocations.
3. A listener implemented in Port's GitHub application receives the new topic message and runs the GitHub workflow defined by the creator of the self-service action/automation.

An example flow would be:

1. A developer asks to deploy a new version of an existing `Microservice`, using a self-service action.
2. The `create` action is sent to the `github.runs` topic.
3. Port's GitHub application event handler is triggered by this new action message.
4. Port's GitHub application triggers the GitHub workflow that deploys a new version of the service.
5. As part of the workflow, the new microservice `Deployment` is reported back to Port.
6. When the workflow is done, Port's GitHub application reports back to Port about the status of the action run (`SUCCESS` or `FAILURE`), according to workflow's status.

:::info triggering workflow chains
A workflow triggered using the `workflow_dispatch` trigger is self-contained. This means its actions and effects over the repository cannot trigger other automatic workflows.

1. A developer invokes a "provision new microservice in monorepo" workflow.
2. The workflow opens a new PR in the target repository based on a pre-defined template.
3. The repository also has a workflow which is automatically triggered using the `on: pull_request: types: "opened"` trigger.
4. In this instance, the automatic PR workflow will not be triggered.

:::

## Configuration

When using this backend, you need to provide the GitHub organization and repository where the workflow is located, as well as the workflow name.  
The workflow must reside in the repository's `.github/workflows/` directory.

### Specify a branch

By default, the integration will look for the workflow in the `main` branch of the repository.  

To use a different branch, simply pass the `ref` key under the `Configure the invocation payload` section (or `workflowInputs` in the JSON object) with the desired branch name as the value:

```json
{
  "ref": "my-branch-name"
}
```

### Automatic workflow status update

Additionally, you can define whether or not Port should automatically use the workflow's end status (`SUCCESS`/`FAILURE`) to update the action/automation status in Port.  

By default, this is set to `true`. To disable this option, set the `reportWorkflowStatus` field to `true` in the `invocationMethod` object, or set the `Report workflow status` option to `No` if using the UI.

## Examples

For complete examples of self-service actions using a GitHub workflow as the backend, check out the [guides section](/guides?tags=GitHub&tags=Actions). 
