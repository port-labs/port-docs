---
displayed_sidebar: null
description: Learn how to manage EKS as a service in Port, ensuring efficient orchestration and scalable Kubernetes deployments.
---

# EKS as a service action (EKSaaS)
This is a guide to integrate Port and Upbound, using their combination as a software catalog and self-service hub for developers, and a platform management tool for the platform team.

At the end of this guide, you should be able to interact with Upbound using Port, provide EKSaaS using Upbound's capabilities and control planes as a backend, while reporting data regarding deployed clusters back to Port.

:::note Clean slate start
The demo starts off on a completely clean slate - an empty Upbound organization, an empty Git repository, and an empty Port environment.
:::

:::info Prerequisites
<h3>Upbound</h3>
Before following the guide, you will need to set up an Upbound organization, initialize it and keep track of some information:
- Save the `Organization ID` for later;
- Set up an EKSaaS configuration in the Upbound organization;
- Deploy a control plane (or many) and save their `identifiers` for later;
- Create an API token and save it for later:
  * Click on the dropdown over your name at the top right corner;
  * Click on "My Account";
  * On the left side menu, select "API Tokens";
  * Click on "Create New Token";
  * Enter a name for your token and click "Create Token";
  * Save the access ID and token for later.

<h3>Port</h3>

- This guide assumes you have a Port account and that you have finished the [onboarding process](/getting-started/overview).
- Save the Port organization's `CLIENT_ID` and `CLIENT_SECRET` for later ([how to find your Port credentials](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/api/#find-your-port-credentials)).

<h3>Git repository</h3>

The actions backend, and the state of the different control planes will be handled in a GitHub repository. For Port to interact with the new GitHub repo, you will need Port's GitHub app to be installed ([install Port's GitHub app](https://docs.port.io/build-your-software-catalog/sync-data-to-catalog/git/github/#setup)).

Create a new git repository, and make sure that Port's GitHub app is installed on it either by:
- Installing Port's GitHub app on all the repositories in the used GitHub organization;
- Or by adding the new repository to the allowed repository list of Port's GitHub app in the organization.

Also make sure that GitHub actions [allow creating and approving pull requests](https://docs.github.com/en/enterprise-cloud@latest/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository#preventing-github-actions-from-creating-or-approving-pull-requests) in your repository.

**Note:** _Save the name of your new repository for later._
:::


After completing the [prerequisites](#prerequisites) step, you can start following the guide.

## Setting up the git repository
### Create all the necessary files and directory structure

- Create a GitHub repository
- Create a folder at `.github/workflows/`
- Create `.yaml` files using the collapsed file contents below:

<details>
<summary><b>Apply Clusters (click to expand)</b></summary>

```yaml showLineNumbers title="apply-clusters.yaml"
name: Apply Cluster changes

on:
  workflow_dispatch:
    inputs:
      port_context:
        type: string

jobs:
  apply-clusters:
    runs-on: ubuntu-latest
    env:
    # highlight-next-line
      UPBOUND_ORG_ID: <ENTER_UPBOUND_ORG_ID> # `Organization ID` we set aside earlier
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: true
          ref: main
      - name: Install Kubectl
        uses: azure/setup-kubectl@v3
        id: install-kubectl
      - name: Install Upbound CLI
        run: |
          curl -sL "https://cli.upbound.io" | sh
          sudo mv up /usr/local/bin/
      - name: Connect to Upbound using CLI and apply manifests to all of the control planes
        run: |
          up login -t ${{ secrets.UPBOUND_TOKEN }}
          cd .up/clusters
          for CONTROL_PLANE in */ ; do
            # Remove trailing slash to get the clean cluster name
            CONTROL_PLANE=${CONTROL_PLANE%/}
          
            # Get the kube config for the specific control plane
            echo "Fetching kubeconfig for ${CONTROL_PLANE}"
            up ctp kubeconfig get -a ${{ env.UPBOUND_ORG_ID }} ${CONTROL_PLANE} -f kubeconfig.yaml --token ${{ secrets.UPBOUND_TOKEN }}
            echo "Applying manifests"
            if find "$CONTROL_PLANE" -maxdepth 1 -type f -name "*.yaml" | read -r; then
              kubectl --kubeconfig kubeconfig.yaml apply -f ./${CONTROL_PLANE}/ --recursive
            else
              echo "Control plane directory is empty"
              # exit 1
            fi
          done
```
</details>

<details>
<summary><b>Approve cluster request (click to expand)</b></summary>

```yaml showLineNumbers title="approve-cluster-request.yaml"
name: Approve new cluster PR

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: "Port's context"
        type: string

jobs:
  approve-cluster-request-call:
    runs-on: ubuntu-latest

    steps:
      - name: Inform starting of approving EKS cluster request
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          logMessage: "Approving EKS cluster request: ${{ fromJson(inputs.port_context).entity.properties.title }}"  

      - uses: actions/checkout@v4
        with:
          persist-credentials: true

      - name: Merge Pull Request
        uses: juliangruber/merge-pull-request-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          number: ${{ fromJson(inputs.port_context).entity.properties.request_pr_number }}
          method: squash

      - name: "Report new EKS cluster to Port"
        if: ${{ always() }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: UPSERT
          identifier: ${{ fromJson(inputs.port_context).entity.properties.title }}
          runId: ${{ fromJson(inputs.port_context).runId }}
          title: ${{ fromJson(inputs.port_context).entity.properties.title }}
          blueprint: eks_cluster
          properties: |
            {
              "node_size": "${{ fromJson(inputs.port_context).entity.properties.node_size }}",
              "node_count": "${{ fromJson(inputs.port_context).entity.properties.node_count }}"
            }
          relations: |
            {
                "upbound_control_plane": "${{ fromJson(inputs.port_context).entity.relations.control_plane }}"
            }

      - name: Inform that EKS cluster request has been approved
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          icon: GitHubActions
          logMessage: "Approved EKS cluster request, and created new Port entity for the EKS cluster🚀 Applying Clusters to Upbound control plane..."

  approve-cluster-request-port:
    runs-on: ubuntu-latest
    steps:
      - uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).context.runId }}
          icon: GitHubActions
          logMessage: "Approving EKS cluster request: ${{ fromJson(inputs.port_context).entity.identifier }}"  
      - uses: actions/checkout@v4
        with:
          persist-credentials: true

      - name: Merge Pull Request
        uses: juliangruber/merge-pull-request-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          number: ${{ fromJson(inputs.port_context).entity.properties.request_pr_number }}
          method: squash
  
      - name: "Report new EKS cluster to Port"
        if: ${{ always() }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          identifier: ${{ fromJson(inputs.port_context).payload.entity.identifier }}
          title: ${{ fromJson(inputs.port_context).payload.entity.identifier }}
          runId: ${{ fromJson(inputs.port_context).context.runId }}
          blueprint: eks_cluster
          properties: | 
            {
              "node_size": "${{ fromJson(inputs.port_context).entity.properties.node_size }}",
              "node_count": ${{ fromJson(inputs.port_context).entity.properties.node_count }}
            }
          relations: |
            {
                "upbound_control_plane": "${{ fromJson(inputs.port_context).entity.relations.upbound_control_plane }}"
            }

      - name: "Approve EKS cluster request"
        if: ${{ always() }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          identifier: ${{ fromJson(inputs.port_context).payload.entity.identifier }}
          blueprint: eks_cluster_request
          runId: ${{ fromJson(inputs.port_context).context.runId }}
          properties: |
            {
              "status": "Approved",
              "eks_cluster": "${{ fromJson(inputs.port_context).payload.entity.identifier }}"
            }
      - uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).context.runId }}
          icon: GitHubActions
          logMessage: "Approved EKS cluster request, and created new Port entity for the EKS cluster🚀 Applying Clusters to Upbound control plane..."

        
  apply-cluster-changes:
    uses: ./.github/workflows/apply-clusters.yaml
    if: ${{ always() }}
    secrets: inherit
    needs:
      - approve-cluster-request-call
      - approve-cluster-request-port

  update-port:
    runs-on: ubuntu-latest
    needs:
      - apply-cluster-changes
    if: ${{ always() }}
    steps:
      - name: Inform cluster applied to Upbound
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          logMessage: "Applied cluster to Upbound successfully✅"        
```

</details>


<details>
<summary><b>Delete cluster (click to expand)</b></summary>

```yaml showLineNumbers title="delete-cluster.yaml"
name: Delete Cluster

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: "Port's payload"
        type: string

jobs:
  delete-cluster:
    runs-on: ubuntu-latest
    env:
      # highlight-next-line
      UPBOUND_ORG_ID: <ENTER_UPBOUND_ORG_ID> # `Organization ID` we set aside earlier
    steps:
      - name: Inform starting of deleting EKS cluster
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          icon: GithubActions
          logMessage: "Initiating deletion job 🏗️"  

      - uses: actions/checkout@v4
        with:
          persist-credentials: true
          ref: main

      - name: Install Kubectl
        uses: azure/setup-kubectl@v3
        id: install-kubectl
      - name: Install Upbound CLI
        run: |
          curl -sL "https://cli.upbound.io" | sh
          sudo mv up /usr/local/bin/

      - uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          icon: GithubActions
          logMessage: "Connecting to Upbound control plane 🛰️"  

      - name: Connect to Upbound using CLI + Fetch kubeconfig
        run: |
          up login -t ${{ secrets.UPBOUND_TOKEN }}
          up ctp kubeconfig get -a ${{ env.UPBOUND_ORG_ID }} ${{ fromJson(inputs.port_context).entity.relations.upbound_control_plane }} -f kubeconfig.yaml --token ${{ secrets.UPBOUND_TOKEN }}

      - uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          icon: GithubActions
          logMessage: |
            ❌ Deleting CRDs from Upbound + claim files from the repository for:
              Control plane: ${{ fromJson(inputs.port_context).entity.relations.upbound_control_plane }}
              Cluster: ${{ fromJson(inputs.port_context).entity }} ❌

      - name: Delete cluster from Upbound
        run: |
          kubectl --kubeconfig kubeconfig.yaml delete -f .up/clusters/${{ fromJson(inputs.port_context).entity.relations.upbound_control_plane }}/${{ fromJson(inputs.port_context).context.entity }}.yaml

      - name: Delete cluster yaml file
        run: | 
          git rm -f .up/clusters/${{ fromJson(inputs.port_context).entity.relations.upbound_control_plane }}/${{ fromJson(inputs.port_context).context.entity }}.yaml
          git status

      - name: Create Pull Request
        id: create-pr
        uses: peter-evans/create-pull-request@v4
        with:
          add-paths: .up/clusters
          branch: "DELETE-CLUSTER-REQUEST-${{ fromJson(inputs.port_context).entity }}"
          title: "Delete cluster request: ${{ fromJson(inputs.port_context).entity }}"
          commit-message: "Delete cluster in upbound called ${{ fromJson(inputs.port_context).entity.identifier }}"

      - name: Merge Pull Request
        uses: juliangruber/merge-pull-request-action@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          number: ${{ steps.create-pr.outputs.pull-request-number }}
          method: squash

      - name: "Delete EKS cluster from Port"
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          identifier: ${{ fromJson(inputs.port_context).entity }}
          runId: ${{ fromJson(inputs.port_context).runId }}
          blueprint: eks_cluster
          operation: DELETE

      - uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          icon: GithubActions
          status: "SUCCESS"
          summary: "Deletion successful🚀"
          logMessage: "Deletion successful ✅ Deleted EKS Cluster Port entity for: ${{ fromJson(inputs.port_context).entity }}"  

```

</details>

<details>
<summary><b>Deny cluster request (click to expand)</b></summary>

```yaml showLineNumbers title="deny-cluster-request.yaml"
name: Deny cluster request

on:
  workflow_dispatch:
    inputs:
      port_context:
        required: true
        description: "Port's payload"
        type: string

jobs:
  deny-cluster-request-port:
    if: github.event.inputs.port_context != ''
    runs-on: ubuntu-latest
    steps:
      - name: Inform starting of denying EKS cluster request
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).context.runId }}
          logMessage: "Denying EKS cluster request: ${{ fromJson(inputs.port_context).entity.identifier }}"  

      - uses: actions/checkout@v4
        with:
          persist-credentials: true

      - name: Close Pull Request
        uses: peter-evans/close-pull@v3
        with:
          pull-request-number: ${{ fromJson(inputs.port_context).entity.properties.request_pr_number }}
          comment: "Cluster request ${{ fromJson(inputs.port_context).entity.identifier }} was denied ❌. Pull request closed."
          delete-branch: false
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: "Deny EKS cluster request"
        if: ${{ always() }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          identifier: ${{ fromJson(inputs.port_context).entity.identifier }}
          blueprint: eks_cluster_request
          runId: ${{ fromJson(inputs.port_context).context.runId }}
          properties: |
            {
              "status": "Denied"
            }

      - name: Inform that EKS cluster request has been denied
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).context.runId }}
          summary: "Request denied."
          status: "SUCCESS"
          logMessage: "Request updated - status 'denied' ❌"

```
</details>


<details>
<summary><b>New cluster request (click to expand)</b></summary>

```yaml showLineNumbers title="new-cluster-request.yaml"
name: Create new cluster PR

on:
  workflow_dispatch:
    inputs:
      control-plane:
        type: string
        required: true
      cluster-name:
        type: string
        required: true
        description: The cluster name to request
      node-count:
        type: string
        required: false
        description: Number of nodes for the cluster
        default: "1"
      node-size:
        required: false
        description: "Node size"
        type: choice
        default: small
        options:
          - small
          - medium
          - large
      port_context:
        type: string
        required: true
        description: Port Payload
  
jobs:
  create-cluster-request:
    runs-on: ubuntu-latest
    outputs:
      pr-id: ${{ steps.create-pr.outputs.pull-request-number }}
    steps:
      - name: Inform starting of creating EKS cluster request
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          icon: GithubActions
          logMessage: "Initiating EKS cluster request job 🏗️"  

      - uses: actions/checkout@v4
        with:
          persist-credentials: true

      - name: Manipulate YAML file
        run: |
          if [[ ! -f ".up/clusters/${{ inputs.control-plane }}/${{ inputs.cluster-name }}.yaml" ]]; then
            mkdir -p .up/clusters/${{ inputs.control-plane }}
            cp .up/examples/cluster.yaml .up/clusters/${{ inputs.control-plane }}/${{ inputs.cluster-name }}.yaml
          else
            echo "This cluster already exists!"
            exit 1
          fi
          yq -i e '.metadata.name = "${{ inputs.cluster-name }}"' .up/clusters/${{ inputs.control-plane }}/${{ inputs.cluster-name }}.yaml 
          yq -i e '.spec.id = "${{ inputs.cluster-name }}"' .up/clusters/${{ inputs.control-plane }}/${{ inputs.cluster-name }}.yaml
          yq -i e '.spec.parameters.nodes.count = ${{ inputs.node-count }}' .up/clusters/${{ inputs.control-plane }}/${{ inputs.cluster-name }}.yaml
          yq -i e '.spec.parameters.nodes.size = "${{ inputs.node-size }}"' .up/clusters/${{ inputs.control-plane }}/${{ inputs.cluster-name }}.yaml 
          yq -i e '.spec.writeConnectionSecretToRef.name = "${{ inputs.cluster-name }}-kubeconfig"' .up/clusters/${{ inputs.control-plane }}/${{ inputs.cluster-name }}.yaml
          
          echo "New cluster's YAML:"
          cat .up/clusters/${{ inputs.control-plane }}/${{ inputs.cluster-name }}.yaml

      - uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          icon: GithubActions
          logMessage: |
            Cluster request information: 
              Upbound control plane name: ${{ inputs.control-plane }}
              Cluster name: ${{ inputs.cluster-name }}
              Node size: ${{ inputs.node-size }}
              Node Count: ${{ inputs.node-count }}

            Creating pull request for the new cluster⏳
            

      - name: Create Pull Request
        id: create-pr
        uses: peter-evans/create-pull-request@v4
        with:
          branch: "CLUSTER-REQUEST-${{ inputs.cluster-name }}"
          title: "New cluster request: ${{ inputs.cluster-name }}"
          commit-message: "Create new cluster in upbound called ${{ inputs.cluster-name }}"

      - name: "Report new EKS cluster request to Port"
        if: ${{ fromJson(inputs.port_context).action == 'request_new_cluster' }}
        uses: port-labs/port-github-action@v1
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          identifier: ${{ inputs.cluster-name }}
          title: ${{ inputs.cluster-name }}
          blueprint: eks_cluster_request
          runId: ${{ fromJson(inputs.port_context).runId }}
          properties: |
            {
              "request_pr_url": "${{ steps.create-pr.outputs.pull-request-url }}",
              "request_pr_number": ${{ steps.create-pr.outputs.pull-request-number }},
              "node_size": "${{ inputs.node-size }}",
              "node_count": "${{ inputs.node-count }}"
            }
          relations: |
            {
                "upbound_control_plane": "${{ inputs.control-plane }}"
            }

      - uses: port-labs/port-github-action@v1
        if: ${{ fromJson(inputs.port_context).action == 'request_new_cluster' }}
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          link: ${{ steps.create-pr.outputs.pull-request-url }}
          icon: GithubActions
          logMessage: "Pull request created: ${{ steps.create-pr.outputs.pull-request-url }}"  

      - uses: port-labs/port-github-action@v1
        if: ${{ fromJson(inputs.port_context).action == 'create_new_cluster' }}
        with:
          clientId: ${{ secrets.PORT_CLIENT_ID }}
          clientSecret: ${{ secrets.PORT_CLIENT_SECRET }}
          operation: PATCH_RUN
          runId: ${{ fromJson(inputs.port_context).runId }}
          icon: GithubActions
          logMessage: "Creation job run, auto-approving cluster request..."  

  force-approve-request:
    uses: ./.github/workflows/approve-cluster-request.yaml
    if: ${{ fromJson(inputs.port_context).action == 'create_new_cluster' }}
    secrets: inherit
    needs: create-cluster-request
    with:
      pr-id: ${{ needs.create-cluster-request.outputs.pr-id }}
      cluster-name: ${{ inputs.cluster-name }}
      node-count: ${{ inputs.node-count }}
      node-size: ${{ inputs.node-size }}
      run-id: ${{ fromJson(inputs.port_context).runId }}
      control-plane: ${{ inputs.control-plane }}
```

</details>

- `.up/clusters/` - Create this folder in the repository. It will hold subdirectories which will correspond to different Upbound control planes. Each subdirectory will hold all the XR manifests to be deployed in the specific control plane.

- `.up/examples/cluster.yaml` - Create this file in the repository and use the content below:

<details>

<summary><b>Upbound cluster file (click to respond)</b></summary>

```yaml showLineNumbers title="cluster.yaml"
apiVersion: k8s.starter.org/v1alpha1
kind: KubernetesCluster
metadata:
  name: my-cluster
  namespace: default
spec:
  id: my-cluster
  parameters:
    nodes:
      count: 3
      size: small
    services:
      operators:
        prometheus:
          version: "34.5.1"
  writeConnectionSecretToRef:
    name: my-cluster-kubeconfig
```

</details>

### Create repository secrets for the GitHub actions to use
Follow GitHub's [guide](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions#creating-secrets-for-a-repository) to add required secrets to the repository. These are the secrets that need to be created:
* `UPBOUND_TOKEN` - The Upbound organization's API token;
* `UPBOUND_ORG_ID` - The Upbound organization's ID;
* `PORT_CLIENT_ID` - The Port organization's client id;
* `PORT_CLIENT_SECRET` - The Port organization's client secret.

## Setting up Port
Starting with a clean Port organization, you will have to create some Port components. These components are Port [blueprints](https://docs.port.io/build-your-software-catalog/define-your-data-model/setup-blueprint/#what-is-a-blueprint) and Port [actions](https://docs.port.io/create-self-service-experiences/).

### Creating blueprints
Create the following blueprints in the order that they appear below:

<details>
<summary><b>Upbound Control Plane (click to expand)</b></summary>

```json showLineNumbers
{
    "identifier": "upbound_control_plane",
    "title": "Upbound Control Plane",
    "icon": "Cluster",
    "schema": {
      "properties": {},
      "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "relations": {}
}
```
</details>

<details>
<summary><b>EKS Cluster (click to expand)</b></summary>

```json showLineNumbers
{
    "identifier": "eks_cluster",
    "title": "EKS Cluster",
    "icon": "Cluster",
    "schema": {
      "properties": {
        "node_count": {
          "icon": "Node",
          "title": "Node Count",
          "type": "number",
          "description": "The cluster's node count"
        },
        "node_size": {
          "icon": "Node",
          "title": "Node Size",
          "description": "The cluster's node size",
          "type": "string",
          "enum": [
            "small",
            "medium",
            "large"
          ],
          "enumColors": {
            "small": "lightGray",
            "medium": "lightGray",
            "large": "lightGray"
          }
        }
      },
      "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {
      "claim_file_url": {
        "title": "Claim file URL",
        "icon": "Github",
        "calculation": "\"https://github.com/port-demo/port-upbound-demo/blob/main/.up/clusters/\" + .identifier + \".yaml\"",
        "type": "string",
        "format": "url"
      }
    },
    "relations": {
      "upbound_control_plane": {
        "title": "Upbound Control Plane",
        "description": "The Upbound control plane for this cluster",
        "target": "upbound_control_plane",
        "required": false,
        "many": false
      }
    }
}
```
</details>

<details>
<summary><b>EKS Cluster Request (click to expand)</b></summary>

```json showLineNumbers
{
        "identifier": "eks_cluster_request",
        "title": "EKS Cluster Request",
        "icon": "Book",
        "schema": {
          "properties": {
            "request_pr_url": {
              "icon": "Github",
              "title": "Request PR URL",
              "type": "string",
              "description": "The cluster request's PR URL",
              "format": "url"
            },
            "request_pr_number": {
              "icon": "Github",
              "title": "Request PR Number",
              "type": "number",
              "minimum": 0
            },
            "node_count": {
              "icon": "Node",
              "title": "Node Count",
              "type": "number",
              "description": "Amount of nodes for this cluster"
            },
            "node_size": {
              "icon": "Node",
              "title": "Node Size",
              "type": "string",
              "description": "The node size for the cluster nodes",
              "enum": [
                "small",
                "medium",
                "large"
              ],
              "enumColors": {
                "small": "lightGray",
                "medium": "lightGray",
                "large": "lightGray"
              }
            },
            "status": {
              "icon": "BlankPage",
              "title": "Status",
              "description": "Status of the cluster request (Pending/Approved)",
              "type": "string",
              "default": "Pending",
              "enum": [
                "Pending",
                "Approved",
                "Denied"
              ],
              "enumColors": {
                "Pending": "yellow",
                "Approved": "green",
                "Denied": "red"
              }
            }
          },
          "required": []
        },
        "mirrorProperties": {},
        "calculationProperties": {},
        "relations": {
          "eks_cluster": {
            "title": "EKS Cluster",
            "description": "The cluster created for this request",
            "target": "eks_cluster",
            "required": false,
            "many": false
          },
          "upbound_control_plane": {
            "title": "Upbound Control Plane",
            "description": "The control plane this cluster was requested for",
            "target": "upbound_control_plane",
            "required": false,
            "many": false
          }
        }
      }
```
</details>
You will need to create these blueprints in your Port organization. 

:::warning Blueprint creation
Blueprint creation may fail if they are not created in the order that they appear above
:::

### Creating actions
Below are self-service actions which define the different actions we need, to trigger the different GitHub workflows.

These actions are defined on their appropriate blueprints.

:::note Customizing GitHub values
Remember to change `CHANGE_TO_YOUR_GITHUB_ORG_NAME` and `CHANGE_TO_YOUR_REPO_NAME` values in the action blueprint. You need to replace these with your appropriate GitHub organization name and repository name.
:::
<details>
<summary><b>Request New Cluster (click to expand)</b></summary>

Creates a EKS Cluster Request to request a new Upbound Cluster

```json showLineNumbers
{
  "identifier": "eks_cluster_request_new_cluster",
  "title": "Request new cluster",
  "icon": "GithubActions",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "cluster-name": {
          "title": "Cluster Name",
          "type": "string"
        },
        "node-size": {
          "title": "Node Size",
          "type": "string",
          "default": "small",
          "enum": [
            "small",
            "medium",
            "large"
          ],
          "enumColors": {
            "small": "lightGray",
            "medium": "lightGray",
            "large": "lightGray"
          }
        },
        "node-count": {
          "icon": "DefaultProperty",
          "title": "Node Count",
          "type": "string",
          "default": "1"
        },
        "control-plane": {
          "icon": "DefaultProperty",
          "title": "Upbound control plane",
          "type": "string",
          "blueprint": "upbound_control_plane",
          "format": "entity"
        }
      },
      "required": [
        "cluster-name",
        "control-plane"
      ],
      "order": [
        "control-plane",
        "cluster-name",
        "node-size",
        "node-count"
      ]
    },
    "blueprintIdentifier": "eks_cluster"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "CHANGE_TO_YOUR_GITHUB_ORG_NAME",
    "repo": "CHANGE_TO_YOUR_REPO_NAME",
    "workflow": "new-cluster-request.yaml",
    "workflowInputs": {
      "cluster-name": "{{.inputs.\"cluster-name\"}}",
      "node-size": "{{.inputs.\"node-size\"}}",
      "node-count": "{{.inputs.\"node-count\"}}",
      "control-plane": "{{.inputs.\"control-plane\" | if type == \"array\" then map(.identifier) else .identifier end}}",
      "port_context": {
        "action": "{{ .action.identifier[(\"eks_cluster_\" | length):] }}",
        "runId": "{{.run.id}}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```

</details>

<details>
<summary><b>Approve Cluster Request (click to expand)</b></summary>

Grants approval to a request to create a new Upbound Cluster

```json showLineNumbers
{
  "identifier": "eks_cluster_request_approve_cluster_request",
  "title": "Approve Cluster Request",
  "icon": "GithubActions",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {},
      "required": []
    },
    "blueprintIdentifier": "eks_cluster_request"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "CHANGE_TO_YOUR_GITHUB_ORG_NAME",
    "repo": "CHANGE_TO_YOUR_REPO_NAME",
    "workflow": "approve-cluster-request.yaml",
    "workflowInputs": {
      "port_context": {
        "runId": "{{.run.id}}",
        "entity": "{{.entity}}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```
</details>

<details>
<summary><b>Deny Cluster Request (click to expand)</b></summary>

Denies a request to create a new Upbound cluster

```json showLineNumbers
{
  "identifier": "eks_cluster_request_deny_cluster_request",
  "title": "Deny cluster request",
  "icon": "Alert",
  "description": "Deny this EKS cluster request",
  "trigger": {
    "type": "self-service",
    "operation": "DAY-2",
    "userInputs": {
      "properties": {},
      "required": []
    },
    "blueprintIdentifier": "eks_cluster_request"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "CHANGE_TO_YOUR_GITHUB_ORG_NAME",
    "repo": "CHANGE_TO_YOUR_REPO_NAME",
    "workflow": "deny-cluster-request.yaml",
    "workflowInputs": {
      "port_context": {
        "entity": "{{.entity}}",
        "runId": "{{.run.id}}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```

</details>

<details>
<summary><b>Create New Cluster (click to expand)</b></summary>

Creates a new Upbound Cluster and an EKS Cluster entity

```json showLineNumbers
{
  "identifier": "eks_cluster_create_new_cluster",
  "title": "Create new cluster",
  "icon": "GithubActions",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "cluster-name": {
          "title": "Cluster Name",
          "type": "string"
        },
        "node-size": {
          "title": "Node Size",
          "type": "string",
          "default": "small",
          "enum": [
            "small",
            "medium",
            "large"
          ],
          "enumColors": {
            "small": "lightGray",
            "medium": "lightGray",
            "large": "lightGray"
          }
        },
        "node-count": {
          "icon": "DefaultProperty",
          "title": "Node Count",
          "type": "string",
          "default": "1"
        },
        "control-plane": {
          "title": "Upbound control plane",
          "type": "string",
          "blueprint": "upbound_control_plane",
          "format": "entity"
        }
      },
      "required": [
        "cluster-name",
        "control-plane"
      ],
      "order": [
        "control-plane",
        "cluster-name",
        "node-size",
        "node-count"
      ]
    },
    "blueprintIdentifier": "eks_cluster"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "CHANGE_TO_YOUR_GITHUB_ORG_NAME",
    "repo": "CHANGE_TO_YOUR_REPO_NAME",
    "workflow": "new-cluster-request.yaml",
    "workflowInputs": {
      "cluster-name": "{{.inputs.\"cluster-name\"}}",
      "node-size": "{{.inputs.\"node-size\"}}",
      "node-count": "{{.inputs.\"node-count\"}}",
      "control-plane": "{{.inputs.\"control-plane\" | if type == \"array\" then map(.identifier) else .identifier end}}",
      "port_context": {
        "action": "{{ .action.identifier[(\"eks_cluster_\" | length):] }}",
        "runId": "{{.run.id}}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": false
}
```

</details>

<details>
<summary><b>Delete EKS Cluster (click to expand)</b></summary>

Deletes an existing Upbound Cluster and its corresponding EKS Cluster entity on Port

```json showLineNumbers
{
  "identifier": "eks_cluster_delete_eks_cluster",
  "title": "Delete EKS Cluster",
  "icon": "Alert",
  "trigger": {
    "type": "self-service",
    "operation": "DELETE",
    "userInputs": {
      "properties": {},
      "required": [],
      "order": []
    },
    "blueprintIdentifier": "eks_cluster"
  },
  "invocationMethod": {
    "type": "GITHUB",
    "org": "CHANGE_TO_YOUR_GITHUB_ORG_NAME",
    "repo": "CHANGE_TO_YOUR_REPO_NAME",
    "workflow": "delete-cluster.yaml",
    "workflowInputs": {
      "port_context": {
        "runId": "{{.run.id}}",
        "entity": "{{.entity}}"
      }
    },
    "reportWorkflowStatus": true
  },
  "requiredApproval": true,
  "approvalNotification": {
    "type": "email"
  }
}
```

</details>

### Creating Upbound control plane Port entities
After setting up the Port blueprints and actions, we need to insert some entities manually.

These entities will represent the different Upbound control planes which were created in your Upbound organisation.

To do this, follow these steps:

1. Navigate to the [Upbound control planes](https://app.getport.io/upbound_control_planes) catalog page.

2. Click the `Manually add Upbound Control Plane` button (or the `+ Upbound Control plane` at the top right of the page).
<img src='/img/create-self-service-experiences/setup-backend/github-workflow/examples/Upbound/addUpboundControlPlaneManually.png' border='1px' />

3. In the `identifier` field, insert the Upbound control plane `identifier` which we saved earlier and click create (do this step multiple times if there are more than 1 control plane).
<img src='/img/create-self-service-experiences/setup-backend/github-workflow/examples/Upbound/setUpboundControlPlaneIdentifier.png' border='1px' />

## Using Port
At this point, everything should be set up. Browse to your [Self-service](https://app.getport.io/self-serve) page to view the different actions you defined in Port, and try them out

<img src='/img/create-self-service-experiences/setup-backend/github-workflow/examples/Upbound/selfServicePage.png' border='1px' />
