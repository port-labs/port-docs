---
sidebar_position: 1
---

# Helm

This page will walk you through the installation of the Port execution agent in your Kubernetes cluster using Helm.

:::info
You can observe the helm chart and the available parameters [here](https://github.com/port-labs/helm-charts/tree/main/charts/port-agent).
:::

:::note prerequisites

- [Helm](https://helm.sh) must be installed to use the chart. Please refer to the Helm [documentation](https://helm.sh/docs/intro/install/) for further details about the installation.
- The connection credentials to Kafka are provided to you by Port.
- If you want to trigger a GitLab Pipeline, you need to have a [GitLab trigger token](https://docs.gitlab.com/ee/ci/triggers/)

:::

## Installation

1. Add Port's Helm repo by using the following command:

```bash
helm repo add port-labs https://port-labs.github.io/helm-charts
helm repo update
```

You can then run `helm search repo port-labs` to see the charts.

2. Install the `port-agent` chart by using the following command:


:::note
Remember to replace the placeholders for `YOUR_ORG_ID`, `YOUR_KAFKA_CONSUMER_GROUP`, `YOUR_PORT_CLIENT_ID` and `YOUR_PORT_CLIENT_SECRET`.
:::

```bash showLineNumbers
helm install my-port-agent port-labs/port-agent \
    --create-namespace --namespace port-agent \
    --set env.normal.PORT_ORG_ID=YOUR_ORG_ID \
    --set env.normal.KAFKA_CONSUMER_GROUP_ID=YOUR_KAFKA_CONSUMER_GROUP \
    --set env.secret.PORT_CLIENT_ID=YOUR_PORT_CLIENT_ID \
    --set env.secret.PORT_CLIENT_SECRET=YOUR_PORT_CLIENT_SECRET
```

## Next Steps

- Refer to the [usage guide](/actions-and-automations/setup-backend/webhook/port-execution-agent/usage.md) to set up a self-service action that sends a webhook.
- Customize the [payload mapping](/actions-and-automations/setup-backend/webhook/port-execution-agent/control-the-payload.md?installationMethod=helm) to control the payload sent to the target.