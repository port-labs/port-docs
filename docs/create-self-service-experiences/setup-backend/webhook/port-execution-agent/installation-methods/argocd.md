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


## Installation

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


## Next Steps

- [Usage](/create-self-service-experiences/self-service-actions-deep-dive/self-service-actions-deep-dive.md) guide Set up a webhook.
