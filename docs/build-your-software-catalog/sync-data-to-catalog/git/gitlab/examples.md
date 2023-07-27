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

In the following example you will ingest your GitLab projects, their README.md file contents and merge requests to Port, you may use the following Port blueprint definitions and integration configuration:

<MicroserviceBlueprint/>

<PRBlueprint/>

<PortAppConfig/>

:::tip

- Refer to the [setup](gitlab.md#setup) section to learn more about the integration configuration setup process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities;
- Click [Here](https://docs.gitlab.com/ee/api/groups.html#list-a-groups-projects) for the GitLab project object structure.
- Click [Here](https://docs.gitlab.com/ee/api/merge_requests.html#list-project-merge-requests) for the GitLab merge request object structure.

:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your projects alongside their `README.md` file contents and merge requests.

## Mapping projects, pipelines and jobs

In the following example you will ingest your GitLab projects, their pipelines and jobs runs to Port, you may use the following Port blueprint definitions and integration configuration:

<MicroserviceBlueprint/>

<PipelineBlueprint/>

<JobBlueprint/>

<PortPipelineJobAppConfig/>

:::tip

- Refer to the [setup](gitlab.md#setup) section to learn more about the integration configuration setup process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities;
- Click [Here](https://docs.gitlab.com/ee/api/groups.html#list-a-groups-projects) for the GitLab project object structure.
- Click [Here](https://docs.gitlab.com/ee/api/pipelines.html#list-project-pipelines) for the GitLab pipeline object structure.
- Click [Here](https://docs.gitlab.com/ee/api/jobs.html#list-project-jobs) for the GitLab job object structure.

:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your projects alongside their pipelines and jobs.

## Mapping projects and issues

In the following example you will ingest your GitLab projects and their issues to Port, you may use the following Port blueprint definitions and integration configuration:

<MicroserviceBlueprint/>

<IssueBlueprint/>

<PortIssueAppConfig/>

:::tip

- Refer to the [setup](gitlab.md#setup) section to learn more about the integration configuration setup process;
- We leverage [JQ JSON processor](https://stedolan.github.io/jq/manual/) to map and transform GitLab objects to Port entities;
- Click [Here](https://docs.gitlab.com/ee/api/groups.html#list-a-groups-projects) for the GitLab project object structure.
- Click [Here](https://docs.gitlab.com/ee/api/issues.html#list-project-issues) for the GitLab issue object structure.

:::

After creating the blueprints and saving the integration configuration, you will see new entities in Port matching your projects alongside their issues.

## Mapping supported resources

The above examples shows a specific use cases, but Port's GitLab integration supports the ingestion of many other GitLab objects, to adapt the examples above, use the GitLab API reference to learn about the available fields for the different supported objects:

<GitlabResources/>

When adding the ingestion of other resources, remember to add an entry to the `resources` array and change the value provided to the `kind` key accordingly.
