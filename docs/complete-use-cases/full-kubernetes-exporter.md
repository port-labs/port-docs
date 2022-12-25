---
sidebar_position: 7
---

# Mapping Kubernetes resources

Kubernetes has become one of the most popular ways to deploy microservice based applications. As the number of your microservices grow, and more clusters are deployed across several regions, it becomes complicated and tedious to keep track of all of your deployments, services, and jobs.

Using Port's Kubernetes Exporter, you can keep track of our K8s resources and export all of the data to Port. We will use K8s' built in metadata to create Entities in Port and keep track of their state.

:::tip
Get to know the basics of our Kubernetes exporter [here!](../exporters/k8s-exporter/quickstart.md)
:::

## Prerequisites

:::note Prerequisites

- [Terraform CLI](https://learn.hashicorp.com/tutorials/terraform/install-cli).
- [Helm](https://helm.sh) must be installed to use the chart. Please refer to
  Helm's [documentation](https://helm.sh/docs) to get started.
- Create a `PORT_CLIENT_ID` and `PORT_CLIENT_SECRET` secrets in your Github Repo, to use in a Github Workflow.
  :::

## Setting up your Blueprints

### Creating Blueprints with Terraform

:::tip
All relevant files and resources for this guide are available [here!](https://github.com/port-labs/port-k8s-exporter)
:::

To set up your Blueprints, use Port's [Terraform provider](../api-providers/terraform.md).

After setting up your `main.tf` file, create the required `.tf` files in your root directory, which will represent your Port Blueprints.

In the Git repository, you can find 10 `.tf` files which will create the following Blueprints:

- Cluster
- ClusterRole
- CronJob
- Deployment
- Namespace
- Node
- Pod
- PodOwner\*
- Role
- Service\*

:::note
`PodOwner` is an abstraction of Kubernetes objects which create and manage pods. By doing so, we don't need a Blueprint per Pod Owner type, which will likely look prettry similar.
Here is the list of kubernetes objects `PodOwner` will replace:

- ReplicaSet
- StatefulSet
- DaemonSet
- Job

`Service` uses selectors to route traffic to pods. Since this is not a direct mapping, relating a service to a specific pod is only possible either by activley mapping pods to their service, or using a strict naming convention. In this use case, you we will only map the service's selectors.
:::

### Updating Blueprints using Github Workflows

Now that you have set your foundations for managing your Blueprints using Terraform, let's make it automatic.

```yaml showLineNumbers
name: Update Port Blueprints

on:
  push:
    paths:
      - "terraform/*.tf"

jobs:
  update-port-blueprints:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          persist-credentials: true
      - uses: hashicorp/setup-terraform@v2
      - name: Apply tf Blueprints
        env:
          PORT_CLIENT_ID: ${{ secrets.PORT_CLIENT_ID }}
          PORT_CLIENT_SECRET: ${{ secrets.PORT_CLIENT_SECRET }}
        run: |
          cd terraform/
          terraform init
          terraform apply -auto-approve
```

This workflow will monitor file changes under `terraform/*.tf`, and on a change the workflow will run and apply the new or changed Blueprints to Port.

## Exporting your Kubernetes cluster
