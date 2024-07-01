# GitLab pipeline

The GitLab backend allows you to trigger GitLab pipelines for your self-service actions and automations. 

Port's GitLab Pipeline Action can trigger a [GitLab Pipeline](https://docs.gitlab.com/ee/ci/pipelines/) using a customer provided input and [`port_payload`](/actions-and-automations/reflect-action-progress/#action-run-json-structure), for both self-service actions and automations.

<img src="/img/self-service-actions/setup-backend/gitlab-pipeline/gitlab-pipeline-agent-architecture.jpg" width='90%' border='1px' />   
<br/><br/>

The steps shown in the image above are as follows:

1. Port publishes an invoked `action` message containing the pipeline details to a topic.
2. A secure topic (`ORG_ID.runs`) holds all the action invocations.
3. Port's execution agent pulls the new trigger event from your Kafka topic, and triggers your GitLab Pipeline.

## Further steps

- See the [Scaffold repositories example](/guides-and-tutorials/scaffold-a-new-service.md?git-provider=gitlab) for GitLab pipelines.
- Contact us through Intercom to set up a Kafka topic for your organization.
- [Install the Port execution agent to triggering the GitLab pipelines](./Installation.md).
- [Learn how to customize the payload sent to gitlab api](./Installation.md#control-the-payload).
