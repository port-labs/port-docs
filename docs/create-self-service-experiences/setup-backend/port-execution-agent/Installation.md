---
sidebar_position: 2
---

# Installation

Let's dive in to a walkthrough on how to install the Port execution agent in your Kubernetes cluster.

:::info
You can observe the helm chart with the full installation [here](https://github.com/port-labs/helm-charts/tree/main/charts/port-agent).
:::

:::note prerequisites

- The [Helm](https://helm.sh) must be installed to use the chart. Please refer to
  the Helm's [documentation](https://helm.sh/docs) for further details on the installation;
- The connection credentials to Kafka are provided to you by Port.
- If you want to trigger a GitLab Pipeline, you need to have a [GitLab trigger token](https://docs.gitlab.com/ee/ci/triggers/)

:::

1. Add Port's Helm repo by using the following command:

```bash showLineNumbers
helm repo add port-labs https://port-labs.github.io/helm-charts
```

If you already added this repo earlier, run `helm repo update` to retrieve
the latest versions of the charts. You can then run `helm search repo port-labs` to see the charts.

2. Install the `port-agent` chart by using the following command:

## Install for Webhook invocation

:::note
Remember to replace the placeholders for `YOUR_ORG_ID`, `YOUR_KAFKA_CONSUMER_GROUP`, `YOUR_KAFKA_USERNAME` and `YOUR_KAFKA_PASSWORD`.
:::

```bash showLineNumbers
helm install my-port-agent port-labs/port-agent \
    --create-namespace --namespace port-agent \
    --set env.normal.PORT_ORG_ID=YOUR_ORG_ID \
    --set env.normal.KAFKA_CONSUMER_GROUP_ID=YOUR_KAFKA_CONSUMER_GROUP \
    --set env.secret.KAFKA_CONSUMER_USERNAME=YOUR_KAFKA_USERNAME \
    --set env.secret.KAFKA_CONSUMER_PASSWORD=YOUR_KAFKA_PASSWORD
```

When using the execution agent, in the `url` field you need to provide a URL to a service (for example, a REST API) that will accept the invocation event.

- The service can be a private service running inside your private network;
- Or, it can be a public accessible service from the public internet (**note** in this scenario, the execution agent needs corresponding outbound network rules that will allow it to contact the public service).

:::note
**IMPORTANT**: To make use of the **Port execution agent**, you need to configure:

<!-- TODO: add back the URLs here for changelog destination -->

- [Self-Service Action invocation method](../../self-service-actions-deep-dive/self-service-actions-deep-dive.md#invocation-method-structure-fields) / Change Log destination `type` field value should be equal to `WEBHOOK`.
- [Self-Service Action invocation method](../../self-service-actions-deep-dive/self-service-actions-deep-dive.md#invocation-method-structure-fields) / Change Log `agent` field value should be equal to `true`.

For example:

```json showLineNumbers
{ "type": "WEBHOOK", "agent": true, "url": "URL_TO_API_INSIDE_YOUR_NETWORK" }
```

:::

## Install for GitLab Pipeline invocation

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

In order to trigger your GitLab Pipeline you need to save a trigger token as an environment variable.

The name of the environment variable is a combination of the `GitLab group` and `GitLab project` seperated by `_`

For example: `group_project=token`

:::note
You can load multiple trigger tokens, for different groups and projects in your GitLab environment.
:::

### Self Hosted GitLab

If you are using a private GitLab environment, pass the `GITLAB_URL` environment variable to your Port agent installation:

```bash showLineNumbers
--set env.normal.GITLAB_URL
```

Well Done! **Port Agent** is now running in your environment and will trigger any webhook that you've configured (for self-service actions, or changes in the software catalog).

When a new invocation is detected, the agent will pull it from your Kafka topic and forward it to the internal API in your private network.

![Port Execution Agent Logs](../../../../static/img/self-service-actions/port-execution-agent/portAgentLogs.png)

### Next steps

Follow one of the guides below:

- [Self-Service Actions Deep Dive](../../self-service-actions-deep-dive/self-service-actions-deep-dive.md) - Set up a blueprint and self-service actions.
- [Changelog Listener](../webhook/examples/changelog-listener.md) - Create a blueprint with `changelogDestination` to listen and act on changes in the software catalog.
- [GitLab Pipeline Trigger](../gitlab-pipeline/gitlab-pipeline.md) - Create an action that triggers GitLab Pipeline execution.
