---
sidebar_position: 3
---

import PortTooltip from "/src/components/tooltip/tooltip.jsx";

# Create and manage Kubernetes clusters

This guide provides a step-by-step walkthrough for creating Kubernetes clusters with the use of Crossplane and ArgoCD.

<center>

<iframe width="65%" height="400" src="https://www.youtube.com/embed/UnNQYghc8uU?si=nv2jbn2Y_VPIpFhh" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

</center>

## Prerequisites

1. Prior knowledge of Port Actions is essential for following this guide. Learn more about them [here](/create-self-service-experiences/setup-ui-for-action/).
2. A Control plane that will be used to create clusters and other infrastructure. We will use [crossplane](https://docs.crossplane.io/latest/software/install/).
3. A GitOps operator for automatically running operations on our cluster based on changes in our manifests repository. We will be using [ArgoCD](https://argo-cd.readthedocs.io/en/stable/).
4. [Install Helm](https://helm.sh/docs/intro/install/).
5. A GitHub repository to contain your resources i.e. the github workflow file, port resources, and infrastructure manifests. 


:::tip Starter Repository
Copy the `crossplane` folder from our examples repository [here](https://github.com/port-labs/self-service-actions-examples) to follow along through the guide. The repository contains the following folders:
- `.github`: contains the github workflows.
- `argocd`: contains the ArgoCD application manifests. This is where we define the application that automates our process through GitOps.
- `compositions`: contains the crossplane compositions that define what a cluster is.
- `crossplane-config`: manifests for installing crossplane into your management cluster.
- `infra`: will contain the cluster manifests created by the automation.
- `port`: contains the Port blueprints and action definitions.
- `scripts`: contains the script that the GitHub workflow uses to create cluster manifests.
:::


## 1. Control Plane Setup

:::tip Creating a Kubernetes cluster
If you don’t have a Kubernetes cluster create one locally with [kind](https://kind.sigs.k8s.io/docs/user/quick-start/).
:::

- Install Crossplane into what will be your management cluster.

```bash
helm repo add crossplane-stable https://charts.crossplane.io/stable

helm repo update

helm upgrade --install crossplane crossplane-stable/crossplane --namespace crossplane-system --create-namespace --wait
```

<br /> 

- Now, let's install ArgoCD into the cluster.

```bash
kubectl create namespace argocd

kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

kubectl get pods -n argocd
```

ArgoCD comes with a default user: `admin`

To get the password, type the command below:

```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

To access the UI, Kubectl port-forwarding can also be used to connect to the API server without exposing the service.

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```
The API server can then be accessed using https://localhost:8080

<br /> 

- Create the following Crossplane compositions, in the `crossplane-config` folder, to define the set of resources required to create a new cluster.

:::info What are Crossplane Compositions?
Compositions are templates for creating multiple managed resources as a single object. Learn more about them [here](https://docs.crossplane.io/latest/concepts/compositions/).
:::

<details>

<summary>`crossplane-config/provider-kubernetes-incluster.yaml`</summary>

```yaml showLineNumbers title="provider-kubernetes-incluster.yaml"
---

apiVersion: v1
kind: ServiceAccount
metadata:
  name: crossplane-provider-kubernetes
  namespace: crossplane-system
  annotations:
    argocd.argoproj.io/sync-wave: "-1"

---

apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: crossplane-provider-kubernetes
  annotations:
    argocd.argoproj.io/sync-wave: "-1"
subjects:
- kind: ServiceAccount
  name: crossplane-provider-kubernetes
  namespace: crossplane-system
roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: rbac.authorization.k8s.io

---

apiVersion: pkg.crossplane.io/v1alpha1
kind: ControllerConfig
metadata:
  name: crossplane-provider-kubernetes
  annotations:
    argocd.argoproj.io/sync-wave: "-1"
spec:
  serviceAccountName: crossplane-provider-kubernetes

---

apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: crossplane-provider-kubernetes
  annotations:
    argocd.argoproj.io/sync-wave: "-1"
    argocd.argoproj.io/sync-options: SkipDryRunOnMissingResource=true
spec:
  package: xpkg.upbound.io/crossplane-contrib/provider-kubernetes:v0.9.0
  controllerConfigRef:
    name: crossplane-provider-kubernetes
```
</details>

<details>

<summary>`crossplane-config/provider-helm-incluster.yaml`</summary>

```yaml showLineNumbers title="provider-helm-incluster.yaml"
---

apiVersion: v1
kind: ServiceAccount
metadata:
  name: crossplane-provider-helm
  namespace: crossplane-system

---

apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: crossplane-provider-helm
subjects:
- kind: ServiceAccount
  name: crossplane-provider-helm
  namespace: crossplane-system
roleRef:
  kind: ClusterRole
  name: cluster-admin
  apiGroup: rbac.authorization.k8s.io

---

apiVersion: pkg.crossplane.io/v1alpha1
kind: ControllerConfig
metadata:
  name: crossplane-provider-helm
spec:
  serviceAccountName: crossplane-provider-helm

---

apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: crossplane-provider-helm
spec:
  package: xpkg.upbound.io/crossplane-contrib/provider-helm:v0.14.0
  controllerConfigRef:
    name: crossplane-provider-helm
```
</details>


```bash
kubectl apply --filename ./crossplane-config/provider-kubernetes-incluster.yaml

kubectl apply --filename ./crossplane-config/provider-helm-incluster.yaml

kubectl wait --for=condition=healthy provider.pkg.crossplane.io --all --timeout=300s
```
<br /> 

- Design a template to create a new cluster with desired properties. This is what the GitHub action will copy and use to define the cluster manifest.

```yaml showLineNumbers title="cluster-template.yaml"
---
apiVersion: devopstoolkitseries.com/v1alpha1
kind: ClusterClaim
metadata:
  name: NAME
  namespace: infra
spec:
  id: NAME
  compositionSelector:
    matchLabels:
      provider: PROVIDER
      cluster: CLUSTER
  parameters:
    nodeSize: SIZE
    minNodeCount: 1
```


## 2. Workflow Creation

- Create a GitHub workflow named `create-cluster.yaml` to checkout code, execute the `create-cluster.sh` script, and push changes back to the repository.

<details>

<summary>Create Cluster Workflow</summary>

```yaml showLineNumbers
name: Create a cluster
on:
  workflow_dispatch:
    inputs:
      name:
        required: true
        description: "The name of the cluster"
      provider:
        required: true
        description: "The provider where the cluster is hosted"
        default: "aws"
      cluster:
        required: true
        description: "The type of the cluster"
      node-size:
        required: true
        description: "The size of the nodes"
        default: "small"
      min-node-count:
        required: true
        description: "The minimum number of nodes (autoscaler might increase this number)"
        default: "1"
jobs:
  deploy-app:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          persist-credentials: false
          fetch-depth: 0
      - name: Create cluster
        run: |
          chmod +x scripts/create-cluster.sh
          ./scripts/create-cluster.sh ${{ inputs.name }} ${{ inputs.provider }} ${{ inputs.cluster }} ${{ inputs.node-size }} ${{ inputs.min-node-count }}
      - name: Commit changes
        run: |
          git config --local user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add .
          git commit -m "Create cluster ${{ inputs.name }}"
      - name: Push changes
        uses: ad-m/github-push-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          branch: ${{ github.ref }}
```
</details>

<br /> 

- Create a script named `create-cluster.sh` in the `scripts` folder of your repository to copy the template claim to the `infra` directory and replace placeholders with user inputs from Port.

```bash showLineNumbers title="create-cluster.sh"
NAME=$1
PROVIDER=$2
CLUSTER=$3
NODE_SIZE=$4
MIN_NODE_COUNT=$5

FILE_PATH=infra/${NAME}-cluster.yaml

cp crossplane/cluster-template.yaml $FILE_PATH
yq --inplace ".metadata.name = \"${NAME}\"" $FILE_PATH
yq --inplace ".spec.id = \"${NAME}\"" $FILE_PATH
yq --inplace ".spec.compositionSelector.matchLabels.provider = \"${PROVIDER}\"" $FILE_PATH
yq --inplace ".spec.compositionSelector.matchLabels.cluster = \"${CLUSTER}\"" $FILE_PATH
yq --inplace ".spec.parameters.nodeSize = \"${NODE_SIZE}\"" $FILE_PATH
yq --inplace ".spec.parameters.minNodeCount = ${MIN_NODE_COUNT}" $FILE_PATH
```
<br /> 

- Create another workflow named `delete-cluster.yaml` to delete the cluster file and push changes to the repository.

<details>

<summary>Delete Cluster Workflow</summary>

```yaml showLineNumbers title="delete-cluster.yaml"
name: Delete the cluster
on:
  workflow_dispatch:
    inputs:
      name:
        required: true
        description: "The name of the cluster"
jobs:
  deploy-app:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          persist-credentials: false
          fetch-depth: 0
      - name: Delete cluster
        run: |
          rm infra/${{ inputs.name }}.yaml
      - name: Commit changes
        run: |
          git config --local user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add .
          git commit -m "Delete cluster ${{ inputs.name }}"
      - name: Push changes
        uses: ad-m/github-push-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          branch: ${{ github.ref }}
```
</details>

## 3. Port Configuration

- Create a Port blueprint that defines a data model for the cluster in the UI.

<details>

<summary>Blueprint</summary>

```json showLineNumbers title="cluster-blueprint.json"
{
  "identifier": "cluster",
  "description": "This blueprint represents a Kubernetes Cluster",
  "title": "Cluster",
  "icon": "Cluster",
  "schema": {
    "properties": {
      "provider": {
        "type": "string",
        "title": "Provider",
        "default": "aws",
        "description": "The provider where the cluster is hosted",
        "enum": ["aws", "gcp"]
      },
      "node-size": {
        "type": "string",
        "title": "Node Size",
        "default": "small",
        "description": "The size of the nodes",
        "enum": ["small", "medium", "large"]
      },
      "min-node-count": {
        "type": "number",
        "title": "Minimum number of nodes",
        "default": 1,
        "description": "The minimun number of nodes (autoscaler might increase this number)"
      },
      "kube-config": {
        "type": "string",
        "title": "Kube config",
        "description": "Kube config"
      },
      "status": {
        "type": "string",
        "title": "Status",
        "description": "The status of the cluster"
      }
    },
    "required": ["provider", "node-size", "min-node-count"]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</details>

<br /> 
- On the [self-service](https://app.getport.io/self-serve) page, create Port actions to trigger GitHub actions for creating and deleting clusters.

<details>

<summary>Create Cluster Action</summary>

```json showLineNumbers title="cluster-create-action.json"
{
  "identifier": "create-cluster",
  "title": "Create a cluster",
  "userInputs": {
    "properties": {
      "name": {
        "type": "string",
        "title": "Name",
        "description": "The name of the cluster"
      },
      "provider": {
        "type": "string",
        "title": "Provider",
        "default": "aws",
        "description": "The provider where the cluster is hosted",
        "enum": ["aws", "azure"]
      },
      "node-size": {
        "type": "string",
        "title": "Node Size",
        "default": "small",
        "description": "The size of the nodes",
        "enum": ["small", "medium", "large"]
      },
      "min-node-count": {
        "type": "string",
        "title": "Minimum number of nodes",
        "default": "1",
        "description": "The minimun number of nodes (autoscaler might increase this number)"
      }
    },
    "required": ["name", "provider", "node-size", "min-node-count"]
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB_ORG_ID>",
    "repo": "<GITHUB_REPO_ID>",
    "workflow": "create-cluster.yaml",
    "omitPayload": true
  },
  "trigger": "CREATE",
  "description": "Create a new cluster."
}
```

</details>

<details>

<summary>Delete Cluster Action</summary>

```json showLineNumbers title="cluster-delete-action.json"
{
  "identifier": "delete-cluster",
  "title": "Delete the cluster",
  "userInputs": {
    "properties": {
      "name": {
        "type": "string",
        "title": "Name",
        "description": "Confirm by typing the name of the cluster"
      }
    },
    "required": ["name"]
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "<GITHUB_ORG_ID>",
    "repo": "<GITHUB_REPO_ID>",
    "workflow": "delete-cluster.yaml",
    "omitPayload": true
  },
  "trigger": "DELETE",
  "description": "Delete the cluster."
}
```

</details>

## 4. GitOps Setup
- Now to add the final piece in our automation, create an ArgoCD application that will be responsible for syncing the GitHub repository state into the management cluster so that crossplane creates the resources.

```bash
kubectl apply --filename apps.yaml
```

<details>

<summary>ArgoCD Application</summary>

:::tip
- Change the `repoURL` to your repository.
- Create or set your namespace.
:::

```yaml showLineNumbers title="apps.yaml"
---
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: production-infra
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: production
  source:
    repoURL: https://github.com/port-labs-labs/crossplane-demo
    targetRevision: HEAD
    path: infra
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      selfHeal: true
      prune: true
      allowEmpty: true
```
</details>


## 5. Let's test it.

- On the [self-service](https://app.getport.io/self-serve) page, go to the create cluster action and fill in the cluster properties.
- Click the execute button to trigger the creation process.
- GitHub actions will generate a manifest and copy it to the `infra` folder of your repository.
- ArgoCD will synchronize the manifest within the control plane cluster.
- Crossplane will create the cluster resources in the specified provider.

Done! 🎉 You can now create and delete clusters from Port.