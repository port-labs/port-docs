# ArgoCD Template

An ArgoCD Application is an Argo CRD which is responsible for managing different k8s objects, while an ArgoCD project is an Argo CRD which clusters Applications.

:::info
The files to this Exporter Template can be found **[here](https://github.com/port-labs/port-k8s-exporter-use-cases/tree/main/argocd)**
:::

Using this template, you can easily create `argocdApp` and `argocdAppProject` Blueprints, and configure your K8s exporter to query your ArgoCD resources.

:::note
Blueprints created in this template define Relations to Blueprints which are referenced in the [Full Kubernetes Exporter](../../../complete-use-cases/full-kubernetes-exporter.md) docs.

This template covers ArgoCD Applications with Relations to Deployments and Services, like ArgoCD's [Getting Started](https://argo-cd.readthedocs.io/en/stable/getting_started/) application `guestbook-ui`.
:::

![Blueprints](../../../../static/img/integrations/k8s-exporter/argocd/blueprints.png)
