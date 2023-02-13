---
sidebar_position: 3
description: Export custom K8s CRDs
---

# Custom CRDs

In addition to resources provided in our export templates, it is also possible to write custom CRD export templates for any additional CRDs you might use in your Kubernetes clusters.

To obtain all of the resource types you can query in your cluster, you can run:

```bash showLineNumbers
$ kubectl api-resources
```

For example, in order to figure out how to map your ArgoCD resources, you can run:

```bash showLineNumbers
$ kubectl api-resources | grep -i argo
applications                      app,apps           argoproj.io/v1alpha1                   true         Application
applicationsets                   appset,appsets     argoproj.io/v1alpha1                   true         ApplicationSet
appprojects                       appproj,appprojs   argoproj.io/v1alpha1                   true         AppProject
```

Then, in order to map ArgoCD `applications`, add the matching resource kind to your `config.yaml`:

```yaml showLineNumbers
- kind: argoproj.io/v1alpha1/applications
  identifier: .metadata.name
  blueprint: '"argoApp"'
  properties:
  ...
```
