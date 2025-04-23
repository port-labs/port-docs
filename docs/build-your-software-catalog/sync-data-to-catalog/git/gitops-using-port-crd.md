---
sidebar_position: 6
---

# GitOps using Port CRDs

You can use GitOps, [Port's K8s exporter](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/kubernetes.md) and [Port's Entity CRDs](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/port-crd.md) to export custom entities in to Port.

:::note
For fully understanding how to use GitOps with Port's CRDs to map entities, make sure you are familiar with:

- [Ports Kubernetes exporter](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/kubernetes.md)
- [Ports Entity CRDs](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/port-crd.md)

:::

## Export entities with GitOps and Kubernetes use cases

- Use your K8s clusters as the source-of-truth for your **microservices**, **packages**, **libraries** and other software catalog assets;
- Update Port in a "Push Only" method, where no elevated permissions are required for Port to interact with your infrastructure;
- Allow developers to keep the catalog up-to-date, by making updates to Kubernetes manifest files in their Git repositories;
- Create a standardized way to document software catalog assets in your organization;
- etc.

## Managing entities defined using CRDs and GitOps

Port's CRDs allow defining and mapping any kind of entity using Kubernetes. You can find an example for doing this in the [Port CRDs - mapping a microservice example](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/port-crd.md#example---mapping-a-microservice-using-port-crds).
Mapping entities can be done using any Continuous Deployment (CD) solution, for example ArgoCD or FluxCD, by deploying the Port custom resources using the CD solution, and mapping their definition to Port using Port's K8s exporter.

To achieve this, follow these general steps for any CD solution:

1. Navigate to [Port's CRDs document](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/port-crd.md#deploying-ports-crds) page to learn how to deploy the CRDs. You can deploy them as part of your CD pipeline by placing the CRD manifests in one of your CD source directory/applications;
2. Define a Kubernetes Port entity manifest using Port's CRD, which contains the data model and data you wish to map to Port, and deploy it to your kubernetes cluster using your CD solution;
3. [Update](/build-your-software-catalog/sync-data-to-catalog/kubernetes-stack/kubernetes/kubernetes.md#updating-exporter-configuration) Port's K8s exporter resource mapping to map the Port CRD you just created.

The entities defined using Port's CRD will appear in your Port environment.
