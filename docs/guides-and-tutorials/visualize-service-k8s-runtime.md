---
sidebar_position: 4
sidebar_label: Visualize services' k8s runtime
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

# Visualize your services' k8s runtime

This guide takes 10 minutes to complete, and aims to demonstrate the value of Port's integration with Kubernetes.

:::tip Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart). We will use the `Service` blueprint that was created during the onboarding process.
- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/).
- [Helm](https://helm.sh/docs/intro/install/) - required to install Port's Kubernetes exporter.

:::

<br/>

### The goal of this guide

In this guide we will model and visualize out services' Kubernetes resources.

After completing it, you will get a sense of how it can benefit different personas in your organization:

- Developers will be able to easily view the health and status of their services' K8s runtime.
- Platform engineers will be able to create custom views and visualizations for different stakeholders in the organization.
- Platform engineers will be able to set, maintain and track standards for K8s resources.
- R&D managers will be able to track any data about services' K8s resources, using tailor-made views and dashboards.

<br/>

### Install Port's Kubernetes exporter

1. Go to your [data sources page](https://app.getport.io/dev-portal/data-sources), click on `+ Data source`, find the `Kubernetes Stack` category and select `Kubernetes`:

2. Copy the installation command after specifying your cluster's name, it should look something like this:

```bash showLineNumbers
# The following script will install a K8s integration at your K8s cluster using helm
# Change the stateKey to describe your integration.
# For example, the name of the cluster it will be installed on.
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-cluster port-labs/port-k8s-exporter \
  --create-namespace --namespace port-k8s-exporter \
	--set secret.secrets.portClientId="YOUR_PORT_CLIENT_ID"  \
	--set secret.secrets.portClientSecret="YOUR_PORT_CLIENT_SECRET"  \
	--set portBaseUrl="https://api.getport.io"  \
	--set stateKey="my-cluster"  \
	--set eventListenerType="POLLING"  \
	--set "extraEnv[0].name"="CLUSTER_NAME"  \
	--set "extraEnv[0].value"="my-cluster"
```

#### What does the exporter do?

After installation, the exporter will:

1. Create <PortTooltip id="blueprint">blueprints</PortTooltip> in your [Builder](https://app.getport.io/dev-portal/data-model) (as defined [here](https://github.com/port-labs/port-k8s-exporter/blob/main/assets/defaults/blueprints.json)) that represent Kubernetes resources:

<img src='/img/guides/k8sBlueprintsCreated.png' width='95%' />

<br/><br/>

:::info Note

`Workload` is an abstraction of Kubernetes objects which create and manage pods (e.g. `Deployment`, `StatefulSet`, `DaemonSet`).

:::

<br/>

2. Create <PortTooltip id="entity">entities</PortTooltip> in your [Software catalog](https://app.getport.io/services). You will see a new page for each <PortTooltip id="blueprint">blueprint</PortTooltip> containing your resources, filled with data from your Kubernetes cluster (according to the default mapping that is defined [here](https://github.com/port-labs/port-k8s-exporter/blob/main/assets/defaults/appConfig.yaml)):

<img src='/img/guides/k8sEntitiesCreated.png' width='100%' />

<br/><br/>

3. Create <PortTooltip id="scorecard">scorecards</PortTooltip> for the blueprints that represent your K8s resources (as defined [here](https://github.com/port-labs/port-k8s-exporter/blob/main/assets/defaults/scorecards.json)). These scorecards define rules and checks over the data ingested from your K8s cluster, making it easy to check that your K8s resources meet your standards.

4. Create dashboards that provide you with a visual view of the data ingested from your K8s cluster.

5. Listen to changes in your Kubernetes cluster and update your <PortTooltip id="entity">entities</PortTooltip> accordingly.

<br/>

### Define the connection between services and workloads

Now that we have our <PortTooltip id="blueprint">blueprints</PortTooltip> set up, we want to model the logical connection between them by relating the `Service` blueprint to the `Workload` blueprint. This will grant us some helpful context in our Software catalog, allowing us to see relevant `Workloads` in a `Service`'s context, or a `Workload`'s property directly in its corresponding `Service`.

In this guide we will create one relation named `Prod_runtime` which will represent the production environment of a service. In a real-world setting, we could have another relation for our staging environment, for example.

1. Go to your [Builder](https://app.getport.io/dev-portal/data-model), expand the `Service` blueprint, and click on `New relation`.

2. Fill out the form like this, then click `Create`:

<img src='/img/guides/k8sCreateRelation.png' width='50%' />

<br/><br/>

When looking at a `Service`, some of its `Workload` properties may be especially important to us, and we would like to see them directly in the `Service's` context. This can be achieved using [mirror properties](https://docs.getport.io/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/mirror-property/), so let's create some:

3. The first one will be the workload's health. Under the relation we just created, click on `New mirror property`:

<img src='/img/guides/k8sCreateMirrorProp.png' width='50%' />

<br/><br/>

4. Fill the form out like this, then click `Create`:

<img src='/img/guides/k8sCreateMirrorPropHealth.png' width='50%' />

<br/><br/>

5. The second one will be the workload's image tag/s. Create another mirror property, fill the form out like this, then click `Create`:

<img src='/img/guides/k8sCreateMirrorPropImages.png' width='50%' />

<br/><br/>

### Map your workloads to their services

You may have noticed that the `Prod_runtime` property and the mirror properties we created are empty for all of our `services`. This is because we haven't specified which `workload` belongs to which `service`. This can be done manually, or via mapping by using a convention of your choice.

In this guide we will use the following convention:  
A `workload` with a label in the form of `portService: <service-identifier>` will automatically be assigned to a `service` with that identifier.

For example, a k8s deployment with the label `portService: myService` will be assigned to a `service` with the identifier `myService`.

We achieved this by adding a [mapping definition](https://github.com/port-labs/template-assets/blob/main/kubernetes/full-configs/k8s-guide/k8s_guide_config.yaml#L111-L123) in the configuration YAML we used when installing the exporter. The definition uses `jq` to perform calculations between properties.

**Let's see this in action:**

1. Create a `Deployment` resource in your cluster with a label matching the identifier of a `service` in your [Software catalog](https://app.getport.io/services).  
   You can use the simple example below and change the `metadata.labels.portService` value to match your desired `service`. Copy it into a file named `deployment.yaml`, then apply it:

```bash
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

2. To see the new data, we need to update the mapping configuration that the K8s exporter uses to ingest data.  
To edit the mapping, go to your [data sources page](https://app.getport.io/dev-portal/data-sources), find the K8s exporter card, click on it and you will see a YAML editor showing the current configuration.  
Add the following block to the mapping configuration and click `Resync`:

```yaml showLineNumbers
resources:
  # ... Other resource mappings installed by the K8s exporter
  - kind: apps/v1/deployments
    selector:
      query: .metadata.namespace | startswith("kube") | not
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
```

<br/>

3. Go to your [Software catalog](https://app.getport.io/services), and click on `Services`. Click on the `Service` for which you created the deployment, and you should see the `Prod_runtime` property filled, along with the `Health` and `Images` properties that we mirrored:

<img src='/img/guides/k8sEntityAfterIngestion.png' width='80%' />

<br/><br/>

### Visualize data from your Kubernetes environment

We now have a lot of data about our workloads, and some metrics to track their quality. Let's see how we can visualize this information in ways that will benefit the routine of our developers and managers.

#### Add an "Unhealthy services" table to your homepage

In the configuration provided for this guide, a `workload` is considered `Healthy` if its defined number of replicas is equal to its available replicas (of course, you can change this definition).

1. Go to your [homepage](https://app.getport.io/home), click on the `+ Add` button in the top right corner, then select `Table`.

2. Fill the form out like this, then click `Save`:

<img src='/img/guides/k8sHomepageTableUnhealthyServices.png' width='50%' />

<br/><br/>

3. In your new table, click on `Filter`, then on `+ Add new filter`. Fill out the fields like this:

<img src='/img/guides/k8sHomepageTableFilterUnhealthy.png' width='50%' />

<br/><br/>

Now you can keep track of services that need your attention right from your homepage.

<img src='/img/guides/k8sHomepageTableUnhealthyFilter.png' width='40%' />

_These services were not included in this guide, but serve to show an example of how this table might look._

#### Use your scorecards to get a clear overview of your workloads' availability

In the configuration provided for this guide, the availability metric is defined like this:

- Bronze: >=1 replica
- Silver: >=2 replicas
- Gold: >=3 replicas

To get an overall picture of our workloads' availability, we can use a table operation.

1. Go to the [`Workloads` catalog page](https://app.getport.io/workloads).

2. Click on the `Group by` button, then choose `High availability` from the dropdown:

<img src='/img/guides/k8sGroupByAvailability.png' width='40%' />

<br/><br/>

3. Click on any of the metric levels to see the corresponding workloads:

<img src='/img/guides/k8sWorkloadsAfterGroupByAvailability.png' width='90%' />

<br/><br/>

Note that you can also set this as the default view by click on the `Save this view` button 📝

### Possible daily routine integrations

- Send a slack message in the R&D channel to let everyone know that a new deployment was created.
- Notify Devops engineers when a service's availability drops.
- Send a weekly/monthly report to R&D managers displaying the health of services' production runtime.

### Conclusion

Kubernetes is a complex environment that requires high-quality observability. Port's Kubernetes integration allows you to easily model and visualize your Kubernetes resources, and integrate them into your daily routine.  
Customize your views to display the data that matters to you, grouped or filtered by teams, namespaces, or any other criteria.  
With Port, you can seamlessly fit your organization's needs, and create a single source of truth for your Kubernetes resources.

More guides & tutorials will be available soon, in the meantime feel free to reach out with any questions via our [community slack](https://www.getport.io/community) or [Github project](https://github.com/port-labs?view_as=public).
