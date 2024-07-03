---
sidebar_position: 2
sidebar_label: Self-hosted
---

import CredentialsGuide from "/docs/build-your-software-catalog/custom-integration/api/\_template_docs/\_find_credentials.mdx";

# Self-hosted GitLab

If you use the self-hosted version of GitLab in your organization, you will need to use the Port execution agent to trigger your pipelines from Port.  

This page will introduce the agent and guide you through the installation and configuration processes.

## Prerequisites

- Connection credentials to Kafka are required. To obtain them, contact us via the intercom bubble in the bottom-right corner, or via our [community Slack](https://www.getport.io/community).
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

### Control the payload

The Port agent allows you to control the payload that is sent to the GitLab API when triggering a pipeline.

By customizing the payload you can control which data is sent to GitLab, and ensure that your backend has the information it needs to execute the pipeline correctly.

See the [Control the payload](/actions-and-automations/setup-backend/webhook/port-execution-agent/control-the-payload.md) page for more information and instructions.

## Define the backend

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
If you wish to create a self-service action or automation via [Port's API](https://docs.getport.io/api-reference/create-an-action-automation), choose the `gitlab` backend type under the `invocationMethod` object.
:::