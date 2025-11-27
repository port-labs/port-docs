import GitHubWorkflowCommon from '/docs/actions-and-automations/templates/_github-workflow-common.md'
import GitHubWorkflowLimitations from '/docs/actions-and-automations/templates/_github-workflow-limitations.md'

# GitHub workflow

The GitHub backend allows you to trigger GitHub workflows for your self-service actions and automations, using [Port's GitHub application](/build-your-software-catalog/sync-data-to-catalog/git/github/#setup).  

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

## Configuration

When using this backend, you need to provide the GitHub **organization** and **repository** where the workflow is located, as well as the workflow **name**.  

<GitHubWorkflowCommon />

<GitHubWorkflowLimitations />

## Examples

For complete examples of self-service actions using a GitHub workflow as the backend, check out the [guides section](/guides?tags=GitHub&tags=Actions). 
