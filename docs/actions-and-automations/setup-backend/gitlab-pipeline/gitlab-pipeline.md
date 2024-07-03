# GitLab pipeline

The GitLab backend allows you to trigger GitLab pipelines for your self-service actions and automations. 

<img src="/img/self-service-actions/setup-backend/gitlab-pipeline/gitlab-pipeline-agent-architecture.jpg" width='90%' border='1px' />   
<br/><br/>

The steps shown in the image above are as follows:

1. Port publishes an invoked `action` message containing the pipeline details to a Kafka topic.
2. A secure topic (`ORG_ID.runs`) holds all the action invocations.
3. Port's execution agent pulls the new trigger event from your Kafka topic, and triggers your GitLab Pipeline.

## SaaS vs. self-hosted

Depending on your GitLab setup, it is recommended to use a different method to trigger your pipelines.

- For [**GitLab SaaS**](/actions-and-automations/setup-backend/gitlab-pipeline/saas), the webhook backend is a simple and secure choice.
- For [**GitLab self-hosted**](/actions-and-automations/setup-backend/gitlab-pipeline/self-hosted), the Port execution agent is the preferred method.

Click on the relevant method above for more information and detailed instructions.  