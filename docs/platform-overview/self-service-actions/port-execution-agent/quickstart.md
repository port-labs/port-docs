---
sidebar_position: 2
---

# Quickstart

This is a walkthrough of how to install the Port Execution Agent in your Kubernetes Cluster.

:::info
The helm chart with full installation guide can be found [here](https://github.com/port-labs/helm-charts/tree/main/charts/port-agent).
:::

:::note Prerequisites

- [Helm](https://helm.sh) must be installed to use the chart. Please refer to
  Helm's [documentation](https://helm.sh/docs) to get started.
- Connection credentials to Kafka, provided to you by Port.

:::

1. Add Port's Helm repo by using the following command:

```
helm repo add port-labs https://port-labs.github.io/helm-charts
```

If you already added this repo earlier, run `helm repo update` to retrieve
the latest versions of the charts. You can then run `helm search repo port-labs` to see the charts.

2. Install the `port-agent` chart by using the following command:

:::note
Remember to replace the placeholders for `YOUR_ORG_ID`, `YOUR_KAFKA_CONSUMER_GROUP`, `YOUR_KAFKA_USERNAME` and `YOUR_KAFKA_PASSWORD`.
:::

```
helm install my-port-agent port-labs/port-agent \
    --create-namespace --namespace port-agent \
    --set env.normal.PORT_ORG_ID=YOUR_ORG_ID
    --set env.normal.KAFKA_CONSUMER_GROUP_ID=YOUR_KAFKA_CONSUMER_GROUP \
    --set env.secret.KAFKA_CONSUMER_USERNAME=YOUR_KAFKA_USERNAME \
    --set env.secret.KAFKA_CONSUMER_PASSWORD=YOUR_KAFKA_PASSWORD
```

3. Follow one of the following guides:

- [Setting Self-Service Actions In Port](../setting-self-service-actions-in-port) - to set up a Blueprint and Self-Service Actions.
- [Changelog Listener](../../../tutorials/self-service-actions/webhook-actions/changelog-listener) - to create a Blueprint with `changelogDestination` to listen and act on changes in the Software Catalog.

:::note
**IMPORTANT**: To make use of the **Port Execution Agent**, you need to configure:

- [Self-Service Action](../setting-self-service-actions-in-port#invocation-method-structure-fields) / [Change Log](../../port-components/blueprint#changelog-destination) destination `type` field value should be equal to `WEBHOOK`.
- [Self-Service Action](../setting-self-service-actions-in-port#invocation-method-structure-fields) / [Change Log](../../port-components/blueprint#changelog-destination) `agent` field value should be equal to `true`.

For example:

```
{ "type": "WEBHOOK", "agent": true, "url": "YOUR URL" }
```

:::

Well Done! **Port Agent** is now running in your environment, and will trigger any Webhook that you've configured (for Self-Service Actions, or changes in the Software Catalog).

![Port Execution Agent Logs](../../../../static/img/platform-overview/self-service-actions/port-execution-agent/portAgentLogs.png)
