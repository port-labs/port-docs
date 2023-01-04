---
sidebar_position: 3
---

# Export Templates

As shown in the [Mapping Kubernetes resources](../../../complete-use-cases/full-kubernetes-exporter.md) use case, mapping Kubernetes objects to Port is easy using Port's K8s exporter.
CRDs are also mappable using the exporter. To obtain all of the resource types you can query in your cluster, you can run:

```bash showLineNumbers
kubectl api-resources
```

For example, to figure out how to map your ArgoCD resources, you can run:

```bash showLineNumbers
$ kubectl api-resources | grep -i argo
applications                      app,apps           argoproj.io/v1alpha1                   true         Application
applicationsets                   appset,appsets     argoproj.io/v1alpha1                   true         ApplicationSet
appprojects                       appproj,appprojs   argoproj.io/v1alpha1                   true         AppProject
```

Then, in order to map `applications`, your `config.yaml` will contain:

```yaml
# highlight-next-line
- kind: argoproj.io/v1alpha1/applications
  identifier: .metadata.name
  blueprint: '"argoApp"'
  properties:
  ...
```

We created some pre-built Port K8s exporter templates covering different applications.
Each template will include:

- Blueprints for the application, both in `JSON` and in `.tf` format for use with Port's [Terraform provider](../../../api-providers/terraform.md).
- A `config.yaml` with mapping to the corresponding Blueprints.

#### Export Templates:

- [ArgoCD](./argocd-template.md)
