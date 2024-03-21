---
sidebar_position: 1
description: ArgoCD deployment and image relation
---

# Connect ArgoCD deployment to image

This guide aims to demonstrate how to connect an ArgoCD deployment to an image blueprint in Port. By linking your ArgoCD deployment to a specific container image, you gain visibility into the images used by each ArgoCD application.

:::tip Prerequisites
- Ensure you have ingested container images into your software catalog using our [ECR Images script](https://github.com/port-labs/example-ecr-images) or [GCR Images script](https://github.com/port-labs/example-gcr-images)
- Ensure you have [ArgoCD ocean integration](/build-your-software-catalog/sync-data-to-catalog/kubernetes/argocd/) installed and configured in your environment
- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/)
- [Helm](https://helm.sh/docs/intro/install/) - required to install a relevant integration
:::

<br/>

1. Create an ArgoCD deployment blueprint to represent a deployment:

<details>
<summary><b>ArgoCD deployment blueprint (click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "argocdDeployment",
  "description": "This blueprint represents an ArgoCD deployment",
  "title": "ArgoCD Deployment",
  "icon": "Argo",
  "schema": {
    "properties": {},
    "required": []
  },
  "mirrorProperties": {
    "health_status": {
      "title": "Health Status",
      "path": "application.healthStatus"
    },
    "sync_status": {
      "title": "Sync Status",
      "path": "application.syncStatus"
    }
  },
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "image": {
      "title": "Deployed Image",
      "target": "image",
      "required": false,
      "many": false
    },
    "application": {
      "title": "Application",
      "target": "argocdApplication",
      "required": false,
      "many": false
    }
  }
}
```
</details>

2. Add a new `managed-resource` kind to the ArgoCD integration to map the deployment to the image entities using the following YAML block. Then click Save & Resync:

<details>
<summary><b>ArgoCD managed resources configuration (click to expand)</b></summary>

```yaml showLineNumbers
  - kind: managed-resource
    selector:
      query: .kind == "Deployment"
    port:
      entity:
        mappings:
          identifier: .name
          title: .name
          blueprint: '"argocdDeployment"'
          properties: {}
          relations:
            image: .liveState | fromjson | .spec.template.spec.containers[0].image
            application: .__application.uid

```
</details>

:::tip Configuration details
The `managed-resource` kind contains information about all the kubernetes resources managed by the ArgoCD application. The configuration above uses the `selector.query` property to filter all kubernetes deployment resources.  It then uses the jq code `.liveState | fromjson | .spec.template.spec.containers[0].image` to parse the `liveState` property of the managed resources and extract the container image attached to the deployment. It finally links each deployment to the ArgoCD application using the `.__application` metadata object, and in this case, the `uid`.
:::

Below is an example showing a successful linkage of ArgoCD deployment to image:
<img src="/img/build-your-software-catalog/sync-data-to-catalog/kubernetes/exampleArgoCDDeployedImages.png" border="1px" width="80%" />
