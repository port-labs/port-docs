---
sidebar_position: 2
---

import FindCredentials from "@site/docs/build-your-software-catalog/sync-data-to-catalog/api/_template_docs/_find_credentials_collapsed.mdx"

# ArgoCD

This page will walk you through the installation of the Port execution agent in your Kubernetes cluster using ArgoCD, utilizing it's [Helm Capabilities](https://argo-cd.readthedocs.io/en/stable/user-guide/helm/).

:::info
- You can observe the Helm chart and the available parameters [here](https://github.com/port-labs/helm-charts/tree/main/charts/port-k8s-exporter).
- For the full chart versions list refer to the [Releases](https://github.com/port-labs/helm-charts/releases?q=port-k8s-exporter&expanded=true) page.
:::

:::note prerequisites
## Prerequisites

- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl) must be installed to apply your installation manifest.
- [Helm](https://helm.sh) must be installed to use the chart. Please refer to the Helm [documentation](https://helm.sh/docs/intro/install/) for further details about the installation.
- [ArgoCD](https://argoproj.github.io/cd/) must be installed in your Kubernetes cluster. Please refer to ArgoCD's [documentation](https://argo-cd.readthedocs.io/en/stable/getting_started/#1-install-argo-cd) for further details about the installation.
- The connection credentials to Kafka are provided to you by Port.
- If you want to trigger a GitLab Pipeline, you need to have a [GitLab trigger token](https://docs.gitlab.com/ee/ci/triggers/)
- You will need your [Port credentials](/build-your-software-catalog/sync-data-to-catalog/api/api.md#find-your-port-credentials) to install the Kubernetes exporter.

:::tip
<FindCredentials />
:::


## Installation

2. In your git repo, create a directory called `argocd`.
```bash
mkdir argocd
```

3. Inside your `argocd` directory create another directory for the current installation. For our example we use `my-port-agent`.

1. Add Port's Helm repo by using the following command:

```bash
helm repo add port-labs https://port-labs.github.io/helm-charts
helm repo update
```

You can then run `helm search repo port-labs` to see the charts.

2. In your git repo, create a directory called `argocd` and changedir into it. Then pull the `port-agent` helm chart:
 ```bash showLineNumbers
mkdir argocd
cd argocd
helm pull port-labs/port-agent --untar
```

3. Commit the changes to your git repository.

4. Install the `my-port-agent` ArgoCD Application by using the following yaml:
:::note
Remember to replace the placeholders for `YOUR_ORG_ID`, `YOUR_KAFKA_CONSUMER_GROUP`, `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.
:::

<details>
  <summary>ArgoCD Application</summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-port-agent
  namespace: argocd
spec:
  destination:
    namespace: my-port-agent
    server: https://kubernetes.default.svc
  project: default
  source:
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
    path: argocd/port-agent
    repoURL: YOUR_GIT_REPO_URL
    targetRevision: main
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

- Refer to the [usage guide](/create-self-service-experiences/setup-backend/webhook/port-execution-agent/usage.md) to set up a webhook.