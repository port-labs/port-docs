---
sidebar_position: 11
title: Let developers consume Kubernetes API extensions
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Let developers consume Kubernetes API extensions

This guide takes 7 minutes to complete, and aims to demonstrate the power of integrating Kubernetes Custom Resource Definitions (CRDs) with Port and exposing them in the Port UI for developers to use.

### Introduction

Kubernetes provides a great way of extending it's API which is called Custom Resource Definitions (CRDs). CRDs allow you to define your own API objects and controllers to manage them. This is a powerful feature that allows you to extend Kubernetes to manage any kind of resources.
This guide will show you how to integrate Kubernetes CRDs with Port and expose them in the Port UI for developers to use.

:::tip Prerequisites

- Port account
- Kubernetes cluster
- Deployed operator that listens to a CRD
- GitHub account
- ArgoCD (optional - if using gitops for managing k8s resources)
:::

### The goal of this guide

In this guide, we will deploy Port's [Kubernetes Exporter](../build-your-software-catalog/sync-data-to-catalog/kubernetes/kubernetes.md) to export Kubernetes CRDs to Port as <PortTooltip id="blueprint">blueprints</PortTooltip> and the relevant <PortTooltip id="action">actions</PortTooltip> to create, update and delete those resources and listens to changes in those resources and reflect them in Port's UI (without the need of creating a mapping).
Then we will connect a GitHub account using Port's [GitHub integration](../build-your-software-catalog/sync-data-to-catalog/git/github/github.md) to execute these actions and create the resources directly into the Kubernetes cluster, or optionally with gitops + ArgoCD.
After completing it, you will get a sense of how it can benefit different personas in your organization:

- Developers will be able to use any CRDs directly in a UI.
- Platform engineers will be able to query the data and get insights about the usage of the CRDs and kubernetes resources.
- Platform engineers will be able to serve any CRDs to developers in a self-service manner.

<br/>

### (Optional) Creating a Crossplane XRD & Composition

If you already have a CRD that you want to expose in Port, you can skip this step. If you don't have a CRD and you would like to create one, you can use Crossplane's XRD to create a CRD. You can follow the [Crossplane XRD documentation](https://docs.crossplane.io/latest/concepts/composite-resource-definitions/) to create a CRD.
For this guide we followed the [AWS DynamoDB composition example](https://docs.crossplane.io/latest/getting-started/provider-aws-part-2/)

### Installing the Kubernetes Exporter with `crdsToDiscover` flag

The Kubernetes Exporter can be installed with the `crdsToDiscover` flag which is a JQ pattern to discover and export CRDs to Port as blueprints and actions. In this example we will use [Helm](https://helm.sh/) to install the Kubernetes Exporter, but for more installation options please visit the [Kubernetes Exporter documentation](../build-your-software-catalog/sync-data-to-catalog/kubernetes/kubernetes.md#installation)

:::note

With the pattern below, the Kubernetes Exporter will discover CRDs that are managed by [Crossplane's XRD](https://docs.crossplane.io/latest/concepts/composite-resource-definitions/) and that are not namespaced scoped. This is just an example, you can adjust the pattern to match your own CRDs - event if they are managed by a custom operator.
:::

```bash
 helm upgrade --install my-port-k8s-exporter port-labs/port-k8s-exporter \
     --create-namespace --namespace port-k8s-exporter \
     --set secret.secrets.portClientId=YOUR_PORT_CLIENT_ID \
     --set secret.secrets.portClientSecret=YOUR_PORT_CLIENT_SECRET \
     --set stateKey="k8s-exporter"  \
     --set eventListenerType="POLLING"  \
     --set "extraEnv[0].name"="CLUSTER_NAME" \
     --set "extraEnv[0].value"=YOUR_PORT_CLUSTER_NAME \
     # highlight-start
     --set crdsToDiscover=".metadata.ownerReferences[0].kind == \"CompositeResourceDefinition\" and .spec.scope != \"Namespaced\""
     # highlight-end
```


