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

When using the execution agent, in the `url` field you need to provide a URL to a service (for example, a REST API) that will accept the invocation event.

- The service can be a private service running inside your private network;
- Or, it can be a public accessible service from the public internet (**note** in this scenario, the execution agent needs corresponding outbound network rules that will allow it to contact the public service).

:::note
**IMPORTANT**: To make use of the **Port execution agent**, you need to configure:

<!-- TODO: add back the URLs here for changelog destination -->

- [Self-Service Action invocation method](/create-self-service-experiences/self-service-actions-deep-dive/self-service-actions-deep-dive.md#invocation-method-structure-fields) / Change Log destination `type` field value should be equal to `WEBHOOK`.
- [Self-Service Action invocation method](/create-self-service-experiences/self-service-actions-deep-dive/self-service-actions-deep-dive.md#invocation-method-structure-fields) / Change Log `agent` field value should be equal to `true`.

For example:

```json showLineNumbers
{ "type": "WEBHOOK", "agent": true, "url": "URL_TO_API_INSIDE_YOUR_NETWORK" }
```

:::

Well Done! **Port Agent** is now running in your environment and will trigger any webhook that you've configured (for self-service actions, or changes in the software catalog).

When a new invocation is detected, the agent will pull it from your Kafka topic and forward it to the internal API in your private network.

![Port Execution Agent Logs](/img/self-service-actions/port-execution-agent/portAgentLogs.png)

### Next steps

Follow one of the guides below:

- [Self-Service Actions Deep Dive](/create-self-service-experiences/self-service-actions-deep-dive/self-service-actions-deep-dive.md) - Set up a blueprint and self-service actions.
- [Changelog Listener](/create-self-service-experiences/setup-backend/webhook/examples/changelog-listener.md) - Create a blueprint with `changelogDestination` to listen and act on changes in the software catalog.
- [GitLab Pipeline Trigger](/create-self-service-experiences/setup-backend/gitlab-pipeline/gitlab-pipeline.md) - Create an action that triggers GitLab Pipeline execution.


# Advanced configuration
Some environments require special configuration when working with the Port agent. This includes working with self-signed certificates and/or proxies.

Port's agent uses Python's [requests](https://requests.readthedocs.io/en/latest/) library. This allows passing advanced configuration using environment variables.

To add an environment variable using the agent's Helm chart, either:

1. Using Helm's `--set` flag:
```sh showLineNumbers
helm upgrade --install <MY_INSTALLATION_NAME> port-labs/port-ocean \
  # Standard installation flags
  # ...
  --set env.normal.VAR_NAME=VAR_VALUE 
```

2. The Helm `values.yaml` file:
```yaml showLineNumbers
# The rest of the configuration
# ...
env:
  normal:
    VAR_NAME: VAR_VALUE
```

## Proxy configuration

### `HTTP_PROXY`,`HTTPS_PROXY` & `ALL_PROXY`
`HTTP_PROXY`, `HTTPS_PROXY`, and `ALL_PROXY` are environment variables used to specify a proxy server for handling HTTP, HTTPS, or all types of requests, respectively. The values assigned to these settings should be the URL of the proxy server.

For example:
```sh showLineNumbers
HTTP_PROXY=http://my-proxy.com:1111
HTTS_PROXY=http://my-proxy.com:2222
ALL_PROXY=http://my-proxy.com:3333
```

### `NO_PROXY`

`NO_PROXY` allows blacklisting certain addresses from being handled through a proxy. This vairable accepts a comma-seperated list of hostnames or urls.

For example:
```sh showLineNumbers
NO_PROXY=http://127.0.0.1,google.com
```

For more information take a look at the Requests [proxy configuration documentation](https://requests.readthedocs.io/en/latest/user/advanced/#proxies).

## SSL Environment Configuration

### `REQUESTS_CA_BUNDLE`

`REQUESTS_CA_BUNDLE` is an environment variable used to specify a custom Certificate Authority (CA) bundle for verifying SSL/TLS certificates in HTTPS requests.

Set `REQUESTS_CA_BUNDLE` to the file path of your CA bundle, which should contain one or more CA certificates in PEM format.

For example:
```sh
REQUESTS_CA_BUNDLE=/path/to/cacert.pem
```

This configuration directs the `requests` library to use the specified CA bundle for SSL/TLS certificate verification, overriding default system settings. It's useful for trusting self-signed certificates or certificates from a private CA.