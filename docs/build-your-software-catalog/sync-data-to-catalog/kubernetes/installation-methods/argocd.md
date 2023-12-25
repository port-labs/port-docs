---
sidebar_position: 2
---

import FindCredentials from "../../api/\_template_docs/\_find_credentials_collapsed.mdx";

# ArgoCD

This page will walk you through the installation of the Port Kubernetes Exporter in your Kubernetes cluster using ArgoCD, utilizing it's [Helm Capabilities](https://argo-cd.readthedocs.io/en/stable/user-guide/helm/).

:::info
You can observe the Helm chart and the available parameters [here](https://github.com/port-labs/helm-charts/tree/main/charts/port-k8s-exporter).
:::

## Prerequisites

- [Helm](https://helm.sh) must be installed to use the chart. Please refer to the Helm [documentation](https://helm.sh/docs/intro/install/) for further details about the installation.
- [ArgoCD](https://argoproj.github.io/cd/) must be installed in your Kubernetes cluster. Please refer to ArgoCD's [documentation](https://argo-cd.readthedocs.io/en/stable/getting_started/#1-install-argo-cd) for further details about the installation.
- You will need your [Port credentials](/build-your-software-catalog/sync-data-to-catalog/api/api.md#find-your-port-credentials) to install the Kubernetes exporter.

:::tip
<FindCredentials />
:::


## Installation

1. Add Port's Helm repo by using the following command:

```bash
helm repo add port-labs https://port-labs.github.io/helm-charts
helm repo update
```

You can then run `helm search repo port-labs` to see the charts.

2. In your git repo, create a directory called `argocd` and changedir into it. Then pull the `port-k8s-exporter` helm chart:
 ```bash showLineNumbers
mkdir argocd
cd argocd
helm pull port-labs/port-k8s-exporter --untar
```

3. Prepare a [`config.yml`](/build-your-software-catalog/sync-data-to-catalog/kubernetes/#exporter-configyml-file) file that will define which Kubernetes objects to ingest to Port.
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

4. Add the contents of your `config.yml` file to the `values.yaml` file in `argocd/port-k8s-exporter/values.yaml` to the `configMap.config` value. 

In our example it looks like that:

```yaml showLineNumbers
configMap:
  annotations: {}
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

5. Commit the changes to your git repository.

6. Install the `my-port-k8s-exporter` ArgoCD Application by using the following yaml:
:::note
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.
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
  source:
    helm:
      parameters:
        - name: secret.secrets.portClientId
          value: YOUR_PORT_CLIENT_ID
        - name: secret.secrets.portClientSecret
          value: YOUR_PORT_CLIENT_SECRET
    path: argocd/port-k8s-exporter
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

Done! the exporter will begin creating and updating objects from your Kubernetes cluster as Port entities shortly.

## Updating exporter configuration

In order to **update** the `config.yml` file deployed on your Kubernetes cluster, simply commit changes to your `values.yaml` file in `argocd/port-k8s-exporter/values.yaml`.

ArgoCD will synchronize your new configuration to the ConfigMap

## Next Steps

- Refer to the [examples](/build-your-software-catalog/sync-data-to-catalog/kubernetes/basic-example.md) page for practical configurations and their corresponding blueprint definitions.
- Refer to the [advanced](/build-your-software-catalog/sync-data-to-catalog/kubernetes/advanced.md) page for advanced use cases and outputs.