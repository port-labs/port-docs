---
sidebar_position: 2
---

import FindCredentials from "@site/docs/build-your-software-catalog/custom-integration/api/_template_docs/_find_credentials_collapsed.mdx"

# ArgoCD

This page will walk you through the installation of the Port execution agent in your Kubernetes cluster using ArgoCD, utilizing its [Helm Capabilities](https://argo-cd.readthedocs.io/en/stable/user-guide/helm/).

:::info
- You can observe the Helm chart and the available parameters [here](https://github.com/port-labs/helm-charts/tree/main/charts/port-agent).
- For the full chart versions list refer to the [Releases](https://github.com/port-labs/helm-charts/releases?q=port-agent&expanded=true) page.
:::

## Prerequisites

- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl) must be installed to apply your installation manifest.
- [Helm](https://helm.sh) must be installed to use the chart. Please refer to the Helm [documentation](https://helm.sh/docs/intro/install/) for further details about the installation.
- [ArgoCD](https://argoproj.github.io/cd/) must be installed in your Kubernetes cluster. Please refer to ArgoCD's [documentation](https://argo-cd.readthedocs.io/en/stable/getting_started/#1-install-argo-cd) for further details about the installation.
- You will need your [Port credentials](/build-your-software-catalog/custom-integration/api/api.md#find-your-port-credentials).
- The connection credentials to Kafka are provided to you by Port.
- If you want to trigger a GitLab Pipeline, you need to have a [GitLab trigger token](https://docs.gitlab.com/ee/ci/triggers/)

:::tip
<FindCredentials />
:::


## Installation

1. In your git repo, create a directory called `argocd`.
```bash
mkdir argocd
```

2. Inside your `argocd` directory create another directory for the current installation. For our example we use `my-port-agent`.
```bash
mkdir -p argocd/my-port-agent
```

3. Create a `values.yaml` file in your `my-port-agent` directory, you can use it to override the helm chart values. Commit the changes to your git repository.

4. Install the `my-port-agent` ArgoCD Application by creating the following `my-port-agent.yaml` manifest:
:::note
Remember to replace the placeholders for `YOUR_ORG_ID`, `YOUR_KAFKA_CONSUMER_GROUP`, `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.

Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).
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
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-agent
    targetRevision: 0.7.2
    helm:
      valueFiles:
        - $values/argocd/my-port-agent/values.yaml
      parameters:
        - name: env.normal.KAFKA_CONSUMER_GROUP_ID
          value: YOUR_KAFKA_CONSUMER_GROUP
        - name: env.normal.PORT_ORG_ID
          value: YOUR_ORG_ID
        - name: env.secret.PORT_CLIENT_ID
          value: YOUR_PORT_CLIENT_ID
        - name: env.secret.PORT_CLIENT_SECRET
          value: YOUR_PORT_CLIENT_SECRET
  - repoURL: YOUR_GIT_REPO_URL
    targetRevision: main
    ref: values
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

</details>
<br/>

6. Apply your application manifest with `kubectl`:
```bash
kubectl apply -f my-port-agent.yaml
```
Done! The exporter will begin creating and updating objects from your Kubernetes cluster as Port entities shortly.

## Next Steps

- Refer to the [usage guide](/actions-and-automations/setup-backend/webhook/port-execution-agent/usage.md) to set up a self-service action that sends a webhook.
- Customize the [payload mapping](/actions-and-automations/setup-backend/webhook/port-execution-agent/control-the-payload.md?installationMethod=argo) to control the payload sent to the target.