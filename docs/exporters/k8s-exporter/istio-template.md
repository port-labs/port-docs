# Istio Template

An ArgoCD Application is an Argo CRD which is responsible for managing different k8s objects, while a ArgoCD project clusters Applications.

:::info
The files to this Exporter Template can be found **[here](https://github.com/port-labs/port-k8s-exporter-use-cases/tree/main/istio)**
:::

Using this template, you can easily create `gateway` and `virtualServices` Blueprints, and configure your K8s exporter to query your Istio resources.

:::note
Blueprints created in this template define Relations to Blueprints which are referenced in the [Full Kubernetes Exporter](../../complete-use-cases/full-kubernetes-exporter.md) docs.

This template covers ArgoCD Applications with relations to Deployments and Services, like ArgoCD's [Getting Started](https://argo-cd.readthedocs.io/en/stable/getting_started/) application `guestbook-ui`.
:::

![Blueprints](../../../static/img/integrations/k8s-exporter/AuditLog.png)
