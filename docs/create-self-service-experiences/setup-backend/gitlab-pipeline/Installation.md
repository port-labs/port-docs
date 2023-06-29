---
sidebar_position: 1
---

# Installation

GitLab pipelines triggering can be done using [Port's execution agent](../port-execution-agent/port-execution-agent.md).

Let's install the agent for GitLab pipelines triggering.

:::note prerequisites

- [Helm](https://helm.sh) must be installed to use the chart. Please refer to
  Helm's [documentation](https://helm.sh/docs) for further details on the installation.
- The connection credentials to Kafka are provided to you by Port.
- If you want to trigger a GitLab Pipeline, you need to have a [GitLab trigger token](https://docs.gitlab.com/ee/ci/triggers/)

:::

1. Add Port's Helm repo by using the following command:

```bash showLineNumbers
helm repo add port-labs https://port-labs.github.io/helm-charts
```

:::note
If you already added this repo earlier, run `helm repo update` to retrieve
the latest versions of the charts. You can then run `helm search repo port-labs` to see the charts.
:::

2. Install the `port-agent` chart by using the following command:

```bash showLineNumbers
helm install my-port-agent port-labs/port-agent \
    --create-namespace --namespace port-agent \
    --set env.normal.PORT_ORG_ID=YOUR_ORG_ID \
    --set env.normal.KAFKA_CONSUMER_GROUP_ID=YOUR_KAFKA_CONSUMER_GROUP \
    --set env.secret.KAFKA_CONSUMER_USERNAME=YOUR_KAFKA_USERNAME \
    --set env.secret.KAFKA_CONSUMER_PASSWORD=YOUR_KAFKA_PASSWORD \
    --set env.secret.<YOUR GITLAB GROUP>_<YOUR GITLAB PROJECT>=YOUR_GITLAB_TOKEN
```

### Trigger Tokens

In order to trigger your GitLab Pipeline you need to provide a GitLab [trigger token](https://docs.gitlab.com/ee/ci/triggers/#create-a-trigger-token) as an environment variable.

To provide the trigger token to the agent, pass the helm chart an environment variable with a name that is the combination of the `GitLab group` and `GitLab project` separated by an underscore (`_`)

For example: `group_project=token`

:::note
You can load multiple trigger tokens, for different groups and projects in your GitLab environment.
:::

### Self Hosted GitLab

If you are using a private GitLab environment, pass the `GITLAB_URL` environment variable to your Port agent installation:

```bash showLineNumbers
--set env.normal.GITLAB_URL
```

Done! **Port Agent** is now running in your environment and will trigger any GitLab pipeline that you've configured.
