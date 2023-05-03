---
sidebar_position: 2
---

# Quickstart

Let's dive in to a walkthrough on how to install the Port execution agent in your Kubernetes cluster.

:::info
You can observe the helm chart with the full installation [here](https://github.com/port-labs/helm-charts/tree/main/charts/port-agent).
:::

:::note prerequisites

- The [Helm](https://helm.sh) must be installed to use the chart. Please refer to
  the Helm's [documentation](https://helm.sh/docs) for further details on the installation;
- The connection credentials to Kafka are provided to you by Port.

:::

1. Add Port's Helm repo by using the following command:

```bash showLineNumbers
helm repo add port-labs https://port-labs.github.io/helm-charts
```

If you already added this repo earlier, run `helm repo update` to retrieve
the latest versions of the charts. You can then run `helm search repo port-labs` to see the charts.

2. Install the `port-agent` chart by using the following command:

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

3. Follow one of the guides below:

- [Self-Service Actions Deep Dive](../../../self-service-actions-deep-dive/self-service-actions-deep-dive.md) - set up a Blueprint and Self-Service Actions.
- [Changelog Listener](../examples/changelog-listener.md) - create a Blueprint with `changelogDestination` to listen and act on changes in the software catalog.

When using the execution agent, in the `url` field you need to provide a URL to a service (for example, a REST API) that will accept the invocation event.

- The service can be a private service running inside your private network;
- Or, it can be a public accessible service from the public internet (**note** in this scenario, the execution agent needs corresponding outbound network rules that will allow it to contact the public service).

:::note
**IMPORTANT**: To make use of the **Port execution agent**, you need to configure:

<!-- TODO: add back the URLs here for changelog destination -->

- [Self-Service Action invocation method](../../../self-service-actions-deep-dive/self-service-actions-deep-dive.md#invocation-method-structure-fields) / Change Log destination `type` field value should be equal to `WEBHOOK`.
- [Self-Service Action invocation method](../../../self-service-actions-deep-dive/self-service-actions-deep-dive.md#invocation-method-structure-fields) / Change Log `agent` field value should be equal to `true`.

For example:

```json showLineNumbers
{ "type": "WEBHOOK", "agent": true, "url": "URL_TO_API_INSIDE_YOUR_NETWORK" }
```

:::

Well Done! **Port Agent** is now running in your environment and will trigger any webhook that you've configured (for self-service actions, or changes in the software catalog).

When a new invocation is detected, the agent will pull it from your Kafka topic and forward it to the internal API in your private network.

![Port Execution Agent Logs](../../../../../static/img/self-service-actions/port-execution-agent/portAgentLogs.png)
