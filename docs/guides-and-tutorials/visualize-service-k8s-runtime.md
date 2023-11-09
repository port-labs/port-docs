---
sidebar_position: 4
sidebar_label: Visualize services' k8s runtime
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Visualize your services' k8s runtime

This guide takes 7 minutes to complete, and aims to demonstrate the value of Port's integration with Kubernetes.

:::tip Prerequisites

- This guide assumes you have a Port account and a basic knowledge of working with Port. If you haven't done so, go ahead and complete the [quickstart](/quickstart).

- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/).

- [Helm](https://helm.sh/docs/intro/install/) - required to install Port's Kubernetes exporter.

:::

### The goal of this guide

In this guide we will model and visualize out services' Kubernetes resources.

After completing it, you will get a sense of how your organization's daily routine could look like:

- Developers will be able to easily view the health and status of their services' K8s runtime.
- Platform engineers will be able to create custom views and visualizations for different stakeholders in the organization.
- R&D managers will be able to track any data about services' K8s resources, using tailor-made views and dashboards.

### Install Port's Kubernetes exporter

1. Go to your [Port application](https://app.getport.io/), hover over the `...` in the top right corner, then click `Credentials`. Copy your `Client ID` and `Client secret`.

2. Replace `CLIENT-ID` and `CLIENT-SECRET` in the following snippet, then copy it and run it in your terminal:

```bash showLineNumbers
export CUSTOM_BP_PATH="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/blueprints/lean_kubernetes_usecase_bps.json"
export CONFIG_YAML_URL="https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/full-configs/lean_kubernetes_usecase.yaml"
export CLUSTER_NAME="my-cluster"
export PORT_CLIENT_ID="CLIENT-ID"
export PORT_CLIENT_SECRET="CLIENT-SECRET"
curl -s https://raw.githubusercontent.com/port-labs/template-assets/main/kubernetes/install.sh | bash
```

The Kubernetes exporter is now installed 🚀

- In your [Builder](https://app.getport.io/dev-portal/data-model), you will see 3 new blueprints that represent Kubernetes resources:

<img src='/img/guides/k8sBlueprintsCreated.png' width='95%' />

- In your [Software catalog](https://app.getport.io/services), you will see a new page for each blueprint containing your resources, filled with data from your Kubernetes cluster:

<img src='/img/guides/k8sEntitiesCreated.png' width='100%' />

### Connect your services to their workloads

Now that we have our blueprints set up, we will relate the `Service` blueprint to the `Workload` blueprint. In this guide we will create one relation named `Prod_runtime` which will represent the production environment of a service. In a real-world setting, we could have another relation for our staging environment, for example.

1. Go to your [Builder](https://app.getport.io/dev-portal/data-model), expand the `Service` blueprint, and click on `New relation`.

2. Fill out the form like this, then click `Create`:

<img src='/img/guides/k8sCreateRelation.png' width='50%' />

When looking at a `Service`, some of its `Workload` properties may be especially important to us, and we would like to see them directly in the `Service's` context. This can be achieved using [mirror properties](https://docs.getport.io/build-your-software-catalog/define-your-data-model/setup-blueprint/properties/mirror-property/), so let's create some:

3. The first one will be the workload's health. Under the relation we just created, click on `New mirror property`:

<img src='/img/guides/k8sCreateMirrorProp.png' width='50%' />

4. Fill the form out like this, then click `Create`:

<img src='/img/guides/k8sCreateMirrorPropHealth.png' width='50%' />

5. The second one will be the workload's image tag/s. Create another mirror property, fill the form out like this, then click `Create`:

<img src='/img/guides/k8sCreateMirrorPropImages.png' width='50%' />

### Map your workloads to their services

Our services now have properties related to their workload, but we need to specify which `workload` belongs to which `service`. This can be done manually, or via mapping by using a convention of your choice.

In this guide we will use the following convention:  
A `workload` with a label in the form of `portService: <service-identifier>` will automatically be assigned to a `service` with that identifier.  
For example, a k8s deployment with the label `portService: myService` will be assigned to a `service` with the identifier `myService`.

We achieved this by adding a mapping definition in the configuration YAML we used when installing the exporter. The definition uses `jq` to calculate the identifier, and looks like this:

```yaml showLineNumbers
- kind: apps/v1/deployments
  port:
    entity:
      mappings:
        - blueprint: '"service"'
          icon: '"Deployment"'
          identifier: .metadata.labels.portService
          properties: {}
          relations:
            prod_runtime: .metadata.name + "-Deployment-" + .metadata.namespace + "-" + "my-cluster"
          title: .metadata.name
  selector:
    query: .metadata.namespace | startswith("kube") | not
```

**Let's see this in action:**

1. Create a `Deployment` resource in your cluster with a label matching the identifier of a `service` in your [Software catalog](https://app.getport.io/services).  
   You can use the simple example below and change the `metadata.labels.portService` value to match your desired `service`. Copy it into a file named `deployment.yaml`, then run the following command in your terminal to apply it:

```bash showLineNumbers
kubectl apply -f deployment.yaml
```

<details>
<summary><b>Deployment example (Click to expand)</b></summary>

```yaml showLineNumbers
apiVersion: apps/v1
kind: Deployment
metadata:
  name: awesomeservice
  labels:
    app: nginx
    portService: AwesomeService
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:1.14.2
          ports:
            - containerPort: 80
```

</details>

<br/>

2. Since we've already added the mapping ahead of time, let's restart the exporter to make sure our changes are applied. Run the following command in your terminal:

```bash
kubectl rollout restart deploy/port-k8s-exporter -n port-k8s-exporter
```

<br/>

3. Go to your [Software catalog](https://app.getport.io/services), and click on `Services`. Click on the `Service` for which you created the deployment, and you should see the `Prod_runtime` property filled, along with the `Health` and `Images` properties that we mirrored:

<img src='/img/guides/k8sEntityAfterIngestion.png' width='80%' />

### Create scorecards for your workloads

Now that all of our k8s data has been ingested into Port, let's create some scorecards to set standards for our workloads. To add a definition of multiple scorecards at once, we can edit the blueprint's JSON directly from the UI:

1. Go to your [Builder](https://app.getport.io/dev-portal/data-model), expand the `Workload` blueprint, click on the `...` button, then click on `Edit JSON`.

2. Click on the `Scorecards` tab, replace the contents with the following definition and click `Save`:

<details>
<summary><b>Scorecard definition (Click to expand)</b></summary>

```json showLineNumbers
[
  {
    "identifier": "configuration",
    "title": "Configuration Checks",
    "rules": [
      {
        "identifier": "notPrivileged",
        "title": "No privilged containers",
        "level": "Bronze",
        "query": {
          "combinator": "and",
          "conditions": [
            {
              "property": "hasPrivileged",
              "operator": "!=",
              "value": true
            }
          ]
        }
      },
      {
        "identifier": "hasLimits",
        "title": "All containers have CPU and Memory limits",
        "level": "Bronze",
        "query": {
          "combinator": "and",
          "conditions": [
            {
              "property": "hasLimits",
              "operator": "=",
              "value": true
            }
          ]
        }
      },
      {
        "identifier": "notDefaultNamespace",
        "title": "Not in 'default' namespace",
        "level": "Bronze",
        "query": {
          "combinator": "and",
          "conditions": [
            {
              "property": "namespace",
              "operator": "!=",
              "value": "default"
            }
          ]
        }
      },
      {
        "identifier": "rolloutStrategy",
        "title": "Using Rolling update strategy",
        "level": "Silver",
        "query": {
          "combinator": "and",
          "conditions": [
            {
              "property": "strategy",
              "operator": "=",
              "value": "RollingUpdate"
            }
          ]
        }
      },
      {
        "identifier": "imageTag",
        "title": "Doesn't have a container with image tag 'latest'",
        "level": "Gold",
        "query": {
          "combinator": "and",
          "conditions": [
            {
              "property": "hasLatest",
              "operator": "!=",
              "value": "false"
            }
          ]
        }
      }
    ]
  },
  {
    "identifier": "highAvailability",
    "title": "High Availability",
    "rules": [
      {
        "identifier": "highAvalabilityB",
        "title": "Highly Available",
        "level": "Bronze",
        "query": {
          "combinator": "and",
          "conditions": [
            {
              "property": "replicas",
              "operator": ">=",
              "value": 1
            }
          ]
        }
      },
      {
        "identifier": "highAvalabilityS",
        "title": "Highly Available",
        "level": "Silver",
        "query": {
          "combinator": "and",
          "conditions": [
            {
              "property": "replicas",
              "operator": ">=",
              "value": 2
            }
          ]
        }
      },
      {
        "identifier": "highAvalabilityG",
        "title": "Highly Available",
        "level": "Gold",
        "query": {
          "combinator": "and",
          "conditions": [
            {
              "property": "replicas",
              "operator": ">=",
              "value": 3
            }
          ]
        }
      }
    ]
  }
]
```

</details>

<img src='/img/guides/k8sAddScorecardJson.png' width='80%' />

<br/><br/>

We now have 2 scorecards configured - one for the workload's configuration, and another for its availability 😎

### Visualize your Kubernetes runtime

### Possible daily routine integrations

- Send a slack message in the R&D channel to let everyone know that a new service was created.
- Send a weekly/monthly report for managers showing all the new services created in this timeframe and their owners.

### Conclusion

Creating a service is not just a periodic task developers undertake, but a vital step that can occur on a monthly basis. However, it's crucial to recognize that this is only a fragment of the broader experience that we're striving to create for developers.  
Our ultimate goal is to facilitate a seamless transition from ideation to production. In doing so, we aim to eliminate the need for developers to navigate through a plethora of tools, reducing friction and accelerating the time-to-production.  
In essence, we're not just building a tool, but sculpting an ecosystem that empowers developers to bring new features to life with utmost efficiency.

More guides & tutorials will be available soon, in the meantime feel free to reach out with any questions via our [community slack](https://www.getport.io/community) or [Github project](https://github.com/port-labs?view_as=public).
