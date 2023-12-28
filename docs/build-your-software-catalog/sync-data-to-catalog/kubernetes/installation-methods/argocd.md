---
sidebar_position: 2
---

import FindCredentials from "../../api/\_template_docs/\_find_credentials_collapsed.mdx";

# ArgoCD

This page will walk you through the installation of the Port Kubernetes exporter in your Kubernetes cluster using ArgoCD, utilizing it's [Helm Capabilities](https://argo-cd.readthedocs.io/en/stable/user-guide/helm/).

:::info
- You can observe the Helm chart and the available parameters [here](https://github.com/port-labs/helm-charts/tree/main/charts/port-k8s-exporter).
- For the full chart versions list refer to the [Releases](https://github.com/port-labs/helm-charts/releases?q=port-k8s-exporter&expanded=true) page.
:::

## Prerequisites

- [kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl) must be installed to apply your installation manifest.
- [Helm](https://helm.sh) must be installed to use the chart. Please refer to the Helm [documentation](https://helm.sh/docs/intro/install/) for further details about the installation.
- [ArgoCD](https://argoproj.github.io/cd/) must be installed in your Kubernetes cluster. Please refer to ArgoCD's [documentation](https://argo-cd.readthedocs.io/en/stable/getting_started/#1-install-argo-cd) for further details about the installation.
- You will need your [Port credentials](/build-your-software-catalog/sync-data-to-catalog/api/api.md#find-your-port-credentials) to install the Kubernetes exporter.

:::tip
<FindCredentials />
:::


## Installation

1. Prepare a [`config.yml`](/build-your-software-catalog/sync-data-to-catalog/kubernetes/#exporter-configyml-file) file that will define which Kubernetes objects to ingest to Port.
We will use the following file in this guide:

```yaml showLineNumbers
resources:
  - kind: apps/v1/replicasets
    selector:
      query: .metadata.namespace | startswith("kube") | not
    port:
      entity:
        mappings:
          - identifier: .metadata.name
            title: .metadata.name
            blueprint: '"deploymentConfig"'
            properties:
              creationTimestamp: .metadata.creationTimestamp
              annotations: .metadata.annotations
              status: .status
```
<br/>

2. In your git repo, create a directory called `argocd`.
```bash
mkdir argocd
```

3. Inside your `argocd` directory create another directory for the current installation. For our example we use `my-port-k8s-exporter`.
```bash
mkdir -p argocd/my-port-k8s-exporter
```

4. Create a `values.yaml` file in your `my-port-k8s-exporter` directory, with the content of your `config.yml` from step 1 to the `configMap.config` key and commit the changes to your git repository:

```yaml showLineNumbers
configMap:
  config: |
    resources:
      - kind: apps/v1/replicasets
        selector:
          query: .metadata.namespace | startswith("kube") | not
        port:
          entity:
            mappings:
              - identifier: .metadata.name
                title: .metadata.name
                blueprint: '"deploymentConfig"'
                properties:
                  creationTimestamp: .metadata.creationTimestamp
                  annotations: .metadata.annotations
                  status: .status
```
<br/>

5. Install the `my-port-k8s-exporter` ArgoCD Application by creating the following `my-port-k8s-exporter.yaml` manifest:
:::note
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.

Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).
:::

<details>
  <summary>ArgoCD Application</summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-port-k8s-exporter
  namespace: argocd
spec:
  destination:
    namespace: my-port-k8s-exporter
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-k8s-exporter
    targetRevision: 0.2.3
    helm:
      valueFiles:
      - $values/argocd/my-port-k8s-exporter/values.yaml
      parameters:
        - name: secret.secrets.portClientId
          value: YOUR_PORT_CLIENT_ID
        - name: secret.secrets.portClientSecret
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
kubectl apply -f my-port-k8s-exporter.yaml
```
Done! The exporter will begin creating and updating objects from your Kubernetes cluster as Port entities shortly.

## Updating exporter configuration

In order to **update** the `config.yml` file deployed on your Kubernetes cluster, simply commit changes to your `values.yaml` file in `argocd/my-port-k8s-exporter/values.yaml`.

ArgoCD will synchronize your new configuration.

## Next Steps

- Refer to the [examples](/build-your-software-catalog/sync-data-to-catalog/kubernetes/basic-example.md) page for practical configurations and their corresponding blueprint definitions.
- Refer to the [advanced](/build-your-software-catalog/sync-data-to-catalog/kubernetes/advanced.md) page for advanced use cases and outputs.