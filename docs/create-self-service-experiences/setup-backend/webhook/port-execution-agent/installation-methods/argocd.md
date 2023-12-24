---
sidebar_position: 2
---

# ArgoCD

Let's dive in to a walkthrough on how to install the Port execution agent in your Kubernetes cluster.

:::info
You can observe the helm chart with the full installation [here](https://github.com/port-labs/helm-charts/tree/main/charts/port-agent).
:::

:::note prerequisites

- [ArgoCD](https://argoproj.github.io/cd/) must be installed in your Kubernetes cluster. Please refer to
  ArgoCD's [documentation](https://argo-cd.readthedocs.io/en/stable/) for further details on the installation;
- The connection credentials to Kafka are provided to you by Port.
- If you want to trigger a GitLab Pipeline, you need to have a [GitLab trigger token](https://docs.gitlab.com/ee/ci/triggers/)

:::


## Install for Webhook invocation

Install the `my-port-agent` ArgoCD Application by using the following yaml:
:::note
Remember to replace the placeholders for `YOUR_ORG_ID`, `YOUR_KAFKA_CONSUMER_GROUP`, `YOUR_PORT_CLIENT_ID` and `YOUR_PORT_CLIENT_SECRET`.
:::

<details>
  <summary>ArgoCD Application</summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-port-agent
spec:
  destination:
    name: ''
    namespace: my-port-agent
    server: 'https://kubernetes.default.svc'
  source:
    path: ''
    repoURL: 'https://port-labs.github.io/helm-charts'
    targetRevision: 0.7.2
    chart: port-agent
    helm:
      parameters:
        - name: env.normal.KAFKA_CONSUMER_GROUP_ID
          value: YOUR_KAFKA_CONSUMER_GROUP
        - name: env.normal.PORT_ORG_ID
          value: YOUR_ORG_ID
        - name: env.secret.PORT_CLIENT_ID
          value: YOUR_PORT_CLIENT_ID
        - name: env.secret.PORT_CLIENT_SECRET
          value: YOUR_PORT_CLIENT_SECRET
  sources: []
  project: default
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

</details>
<br/>


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
