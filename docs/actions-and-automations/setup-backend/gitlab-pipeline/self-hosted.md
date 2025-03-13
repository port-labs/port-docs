---
sidebar_position: 2
sidebar_label: Self-hosted
---

import CredentialsGuide from "/docs/build-your-software-catalog/custom-integration/api/\_template_docs/\_find_credentials.mdx";

# Self-hosted GitLab

If you use the self-hosted version of GitLab in your organization, you will need to use the Port execution agent to trigger your pipelines from Port.  

<img src="/img/self-service-actions/setup-backend/gitlab-pipeline/gitlab-pipeline-agent-architecture.jpg" width='90%' border='1px' />   
<br/><br/>

The steps shown in the image above are as follows:

1. Port publishes an invoked `action` message containing the pipeline details to a Kafka topic.
2. A secure topic (`ORG_ID.runs`) holds all the action invocations.
3. Port's execution agent pulls the new trigger event from your Kafka topic, and triggers your GitLab Pipeline.

This page will introduce the agent and guide you through the installation and configuration processes.

## Prerequisites

- Connection credentials to Kafka are required. To obtain them, contact us using chat/Slack/mail to [support@getport.io](mailto:support@getport.io).
- [Helm](https://helm.sh) must be installed in order to install the relevant chart.
- In order to trigger a GitLab Pipeline, you need to have a [GitLab trigger token](https://docs.gitlab.com/ee/ci/triggers/).

:::info Trigger Tokens

To provide your trigger token to the agent, pass the helm chart an environment variable with a name that is the combination of the `GitLab group` and `GitLab project`, separated by an underscore (`_`). The name is case sensitive.

For example: `group_project=token`

You can load multiple trigger tokens, for different groups and projects in your GitLab environment.
:::

## Installing the agent

1. Add Port's Helm repo by using the following command:

    ```bash
    helm repo add port-labs https://port-labs.github.io/helm-charts
    ```

    :::note Ensure you have the latest charts
    If you already added this repo earlier, run `helm repo update` to retrieve
    the latest versions of the charts.  
    You can then run `helm search repo port-labs` to see the charts.
    :::

2. Install the `port-agent` chart using the following command:

    ```bash showLineNumbers
    helm install my-port-agent port-labs/port-agent \
        --create-namespace --namespace port-agent \
        --set env.normal.PORT_ORG_ID=YOUR_ORG_ID \
        --set env.normal.KAFKA_CONSUMER_GROUP_ID=YOUR_KAFKA_CONSUMER_GROUP \
        --set env.secret.PORT_CLIENT_ID=YOUR_PORT_CLIENT_ID \
        --set env.secret.PORT_CLIENT_SECRET=YOUR_PORT_CLIENT_SECRET \
        --set env.secret.<YOUR GITLAB GROUP>_<YOUR GITLAB PROJECT>=YOUR_GITLAB_TOKEN \
        --set env.normal.GITLAB_URL=YOUR_GITLAB_URL
    ```

    <CredentialsGuide/>
    <br/>

Done! **Port's execution agent** is now running in your environment and will trigger any GitLab pipeline that you have configured.

## Configure the backend

Once the agent is installed, we can finish setting up the backend in Port. 

1. Make sure that `Run Gitlab Pipeline` is selected as the backend type.
2. Now all we need is to provide the following details:

   <img src="/img/create-self-service-experiences/setup-backend/gitlab/gitlab-backend.png" width='60%' border='1px' />
    <br/>
- **Project** - the name of the GitLab project.  
 The name can be obtained from your project URL: `https://gitlab.com/GROUP/SUBGROUP/PROJECT`.
- **Group/subgroup** - the group and/or subgroup that the project belongs to.  
 Can also be obtained from the project URL: `https://gitlab.com/GROUP/SUBGROUP/PROJECT`.
- **Default ref** - the branch/tag name we want the action/automation to use.

:::tip Create action/automation via API
If you wish to create a self-service action or automation via [Port's API](https://docs.port.io/api-reference/create-an-action-automation), choose the `gitlab` backend type under the `invocationMethod` object.
:::

### Configure the payload

The payload is the data sent to the webhook URL every time the action/automation is executed. It is defined by the action/automation creator and can include any data that is needed by the GitLab pipeline.

When using the `GitLab` backend, the payload is defined under the `pipelineVariables` field.  
- For more information about defining a payload for **self-service actions**, click [here](/actions-and-automations/create-self-service-experiences/setup-the-backend/#define-the-actions-payload).
- For more information about defining a payload for **automations**, click [here](/actions-and-automations/define-automations/setup-action#define-the-payload).