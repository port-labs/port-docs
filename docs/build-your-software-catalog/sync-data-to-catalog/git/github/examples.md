---
sidebar_position: 2
---

import MicroserviceBlueprint from '../\_git_exporter_example_microservice_blueprint.mdx'
import PRBlueprint from './\_github_exporter_example_pull_request_blueprint.mdx'
import PortAppConfig from './\_github_exporter_example_port_app_config.mdx'
import GitHubResources from './\_github_exporter_supported_resources.mdx'

import WorkflowBlueprint from './example-workflow-workflowrun/\_git_exporter_example_workflow_blueprint.mdx'
import WorkflowRunBlueprint from './example-workflow-workflowrun/\_git_exporter_example_workflow_run_blueprint.mdx'
import PortWfWfrAppConfig from './example-workflow-workflowrun/\_github_exporter_example_wf_wfr_port_app_config.mdx'

import PortMonoRepoAppConfig from './example-monorepo/\_github_exporter_example_monorepo_port_app_config.mdx'

import IssueBlueprint from './example-issue/\_git_exporter_example_issue_blueprint.mdx'
import PortIssueAppConfig from './example-issue/\_github_exporter_example_issue_port_app_config.mdx'

# Examples

## Mapping repositories, file contents and pull requests

In the following example you will ingest your GitHub repositories, their README.md file contents and pull requests to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<MicroserviceBlueprint/>

<PRBlueprint/>

<PortAppConfig/>

:::tip

- Refer to the [setup](github.md#setup) section to learn more about the `port-app-config.yml` setup process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitHub objects to Port Entities;
- Click [Here](https://docs.github.com/en/rest/repos/repos#get-a-repository) for the GitHub repository object structure.
- Click [Here](https://docs.github.com/en/rest/pulls/pulls#get-a-pull-request) for the GitHub pull request object structure.

:::

After creating the blueprints and committing the `port-app-config.yml` file to your `.github-private` or to a specific repository, you will see new entities in Port matching your repositories alongside their README.md file contents and pull requests. (Remember that the `port-app-config.yml` file has to be in the **default branch** of the repository to take effect).

## Mapping repositories, workflows and workflow runs

In the following example you will ingest your GitHub repositories, their workflows and workflow runs to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<MicroserviceBlueprint/>

<WorkflowBlueprint/>

<WorkflowRunBlueprint/>

<PortWfWfrAppConfig/>

:::tip

- Refer to the [setup](github.md#setup) section to learn more about the `port-app-config.yml` setup process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitHub objects to Port Entities;
- Click [Here](https://docs.github.com/en/rest/repos/repos#get-a-repository) for the GitHub repository object structure.
- Click [Here](https://docs.github.com/en/rest/actions/workflows#get-a-workflow) for the GitHub workflow object structure.
- Click [Here](https://docs.github.com/en/rest/actions/workflow-runs#get-a-workflow-run) for the GitHub workflow run object structure.

:::

After creating the blueprints and committing the `port-app-config.yml` file to your `.github-private` or to a specific repository, you will see new entities in Port matching your repositories alongside their workflows and workflow runs. (Remember that the `port-app-config.yml` file has to be in the **default branch** of the repository to take effect).

## Mapping repositories and issues

In the following example you will ingest your GitHub repositories and their issues to Port, you may use the following Port blueprint definitions and `port-app-config.yml`:

<MicroserviceBlueprint/>

<IssueBlueprint/>

<PortIssueAppConfig/>

:::tip

- Refer to the [setup](github.md#setup) section to learn more about the `port-app-config.yml` setup process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitHub objects to Port Entities;
- Click [Here](https://docs.github.com/en/rest/repos/repos#get-a-repository) for the GitHub repository object structure.
- Click [Here](https://docs.github.com/en/rest/issues/issues#get-an-issue) for the GitHub issue object structure.

:::

After creating the blueprints and committing the `port-app-config.yml` file to your `.github-private` or to a specific repository, you will see new entities in Port matching your repositories alongside their issues. (Remember that the `port-app-config.yml` file has to be in the **default branch** of the repository to take effect).

## Mapping repositories and monorepos

In the following example you will ingest your GitHub repositories and their folders to Port. By following this example you can map your different services, packages and libraries from your monorepo into separate entities in Port. you may use the following Port blueprint definitions and `port-app-config.yml`:

<MicroserviceBlueprint/>

<PortMonoRepoAppConfig/>

:::tip
To retrieve the root folders of your monorepo, you can use this following syntax in your `port-app-config.yml`:

```yaml
- kind: folder
    selector:
      query: "true" # JQ boolean query. If evaluated to false - skip syncing the object.
      folders: # Specify the repositories and folders to include under this relative path.
        - path: "*" # Relative path to the folders within the repositories.
          repos: # List of repositories to include folders from.
            - backend-service
            - frontend-service
```

:::
:::tip

- Refer to the [setup](github.md#setup) section to learn more about the `port-app-config.yml` setup process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitHub objects to Port Entities;
- Click [Here](https://docs.github.com/en/rest/repos/repos#get-a-repository) for the GitHub repository object structure.
- Click [Here](https://docs.github.com/en/rest/git/trees#get-a-tree) for the GitHub folder object structure.

:::

## Mapping supported resources

The above examples shows a specific use cases, but Port's GitHub app supports the ingestion of many other GitHub objects, to adapt the examples above, use the GitHub API reference to learn about the available fields for the different supported objects:

<GitHubResources/>

When adding the ingestion of other resources, remember to add an entry to the `resources` array and change the value provided to the `kind` key accordingly.
