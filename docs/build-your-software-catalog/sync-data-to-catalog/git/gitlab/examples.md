---
sidebar_position: 2
---

import MicroserviceBlueprint from '../\_git_exporter_example_microservice_blueprint.mdx'
import PRBlueprint from './\_gitlab_exporter_example_merge_request_blueprint.mdx'
import PortAppConfig from './\_gitlab_exporter_example_port_app_config.mdx'
import GitlabResources from './\_gitlab_exporter_supported_resources.mdx'

import PipelineBlueprint from './example-pipeline-job/\_git_exporter_example_pipeline_blueprint.mdx'
import JobBlueprint from './example-pipeline-job/\_git_exporter_example_job_blueprint.mdx'
import PortPipelineJobAppConfig from './example-pipeline-job/\_gitlab_exporter_example_pipeline_job_port_app_config.mdx'

import IssueBlueprint from './example-issue/\_git_exporter_example_issue_blueprint.mdx'
import PortIssueAppConfig from './example-issue/\_gitlab_exporter_example_issue_port_app_config.mdx'

# Examples

## Mapping projects, file contents and merge requests

In the following example you will ingest your Gitlab projects, their README.md file contents and pull requests to Port, you may use the following Port blueprint definitions and `integration configuration`:

<MicroserviceBlueprint/>

<PRBlueprint/>

<PortAppConfig/>

:::tip

- Refer to the [setup](gitlab.md#setup) section to learn more about the `integration configuration` setup process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform Gitlab objects to Port Entities;
- Click [Here](https://docs.gitlab.com/ee/api/groups.html#list-a-groups-projects) for the Gitlab project object structure.
- Click [Here](https://docs.gitlab.com/ee/api/merge_requests.html#list-project-merge-requests) for the Gitlab merge request object structure.

:::

After creating the blueprints and saving the `integration configuration`, you will see new entities in Port matching your projects alongside their README.md file contents and pull requests.

## Mapping projects, pipelines and jobs

In the following example you will ingest your Gitlab projects, their pipelines and jobs runs to Port, you may use the following Port blueprint definitions and `integration configuration`:

<MicroserviceBlueprint/>

<PipelineBlueprint/>

<JobsBlueprint/>

<PortPipelineJobAppConfig/>

:::tip

- Refer to the [setup](gitlab.md#setup) section to learn more about the `integration configuration` setup process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform Gitlab objects to Port Entities;
- Click [Here](https://docs.gitlab.com/ee/api/groups.html#list-a-groups-projects) for the Gitlab project object structure.
- Click [Here](https://docs.gitlab.com/ee/api/pipelines.html#list-project-pipelines) for the Gitlab pipeline object structure.
- Click [Here](https://docs.gitlab.com/ee/api/jobs.html#list-project-jobs) for the Gitlab job object structure.

:::

After creating the blueprints and saving the `integration configuration`, you will see new entities in Port matching your projects alongside their pipelines and jobs.

## Mapping projects and issues

In the following example you will ingest your Gitlab projects and their issue to Port, you may use the following Port blueprint definitions and `integration configuration`:

<MicroserviceBlueprint/>

<IssueBlueprint/>

<PortIssueAppConfig/>

:::tip

- Refer to the [setup](gitlab.md#setup) section to learn more about the `integration configuration` setup process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform Gitlab objects to Port Entities;
- Click [Here](https://docs.gitlab.com/ee/api/groups.html#list-a-groups-projects) for the Gitlab project object structure.
- Click [Here](https://docs.gitlab.com/ee/api/issues.html#list-project-issues) for the Gitlab issue object structure.

:::

After creating the blueprints and saving the `integration configuration`, you will see new entities in Port matching your projects alongside their issues.

## Mapping supported resources

The above example shows a specific use case, but Port's Gitlab integration supports the ingestion of many other Gitlab objects, to adapt the example above, use the Gitlab API reference to learn about the available fields for the different supported objects:

<GitlabResources/>

When adding the ingestion of other resources, remember to add a entry to the `resources` array and change the value provided to the `kind` key accordingly.
