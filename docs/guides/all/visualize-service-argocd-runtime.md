---
sidebar_position: 5
displayed_sidebar: null
description: Learn how to visualize ArgoCD service runtime in Port, enhancing monitoring and management of your Kubernetes applications.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Visualize your services' Kubernetes runtime using ArgoCD

This guide takes 10 minutes to complete, and aims to demonstrate the value of Port's integration with ArgoCD.

:::info Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/getting-started/overview). We will use the `Service` blueprint that was created during the onboarding process.
- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/).
- [Helm](https://helm.sh/docs/intro/install/) - required to install Port's ArgoCD integration.

:::

<br/>

### The goal of this guide

In this guide we will model and visualize our services' Kubernetes resources (via ArgoCD).

After completing it, you will get a sense of how it can benefit different personas in your organization:

- Developers will be able to easily view the health and status of their services' K8s runtime.
- Platform engineers will be able to create custom views and visualizations for different stakeholders in the organization.
- Platform engineers will be able to set, maintain and track standards for K8s resources.
- R&D managers will be able to track any data about services' K8s resources, using tailor-made views and dashboards.

<br/>

### Install Port's ArgoCD integration

1. Go to your [data sources page](https://app.getport.io/settings/data-sources), click on `+ Data source`, find the `Kubernetes Stack` category and select `ArgoCD`.

2. Follow the installation command for your preferred installation method:

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

  :::tip Variable replacement
   Remember to replace the following placeholders with your own values:
   - `YOUR_PORT_CLIENT_ID` -  Your [Port client ID](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)
   - `YOUR_PORT_CLIENT_SECRET` - Your [Port client secret](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)
   - `YOUR_ARGOCD_TOKEN` - Your [ArgoCD API token](https://argo-cd.readthedocs.io/en/stable/developer-guide/api-docs/#authorization). Ensure that the token has sufficient permissions to read ArgoCD resources. You can configure the RBAC policy for the token user by following [this guide](https://argo-cd.readthedocs.io/en/stable/operator-manual/rbac/)
   - `YOUR_ARGOCD_SERVER_URL` - The server url of your ArgoCD instance
   :::

```bash showLineNumbers
# The following script will install an Ocean integration in your K8s cluster using helm
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install argocd port-labs/port-ocean \
	--set port.clientId="YOUR_PORT_CLIENT_ID"  \
	--set port.clientSecret="YOUR_PORT_CLIENT_SECRET"  \
	--set port.baseUrl="https://api.getport.io"  \
	--set initializePortResources=true  \
	--set integration.identifier="argocd"  \
	--set integration.type="argocd"  \
	--set integration.eventListener.type="POLLING"  \
	--set integration.secrets.token="YOUR_ARGOCD_TOKEN"  \
	--set integration.config.serverUrl="YOUR_ARGOCD_SERVER_URL" 
```

<PortApiRegionTip/>

</TabItem>

<TabItem value="argocd" label="ArgoCD">
To install the integration using ArgoCD, follow these steps:

1. Create a `values.yaml` file in `argocd/my-ocean-argocd-integration` in your git repository with the content:

:::tip Variable Replacement 
Remember to replace the placeholders for `TOKEN` and `SERVER_URL`, which represents your ArgoCD API token and server url respectively. Ensure that the token has sufficient permissions to read ArgoCD resources. You can configure the RBAC policy for the token user by following [this guide](https://argo-cd.readthedocs.io/en/stable/operator-manual/rbac/)
:::

```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-argocd-integration
  type: argocd
  eventListener:
    type: POLLING
  config:
  // highlight-next-line
    serverUrl: SERVER_URL
  secrets:
  // highlight-next-line
    token: TOKEN
```
<br/>

2. Install the `my-ocean-argocd-integration` ArgoCD Application by creating the following `my-ocean-argocd-integration.yaml` manifest:
:::tip Variable Replacement 
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.

Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).
:::

<details>
  <summary>ArgoCD Application</summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-ocean-argocd-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-argocd-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.18
    helm:
      valueFiles:
      - $values/argocd/my-ocean-argocd-integration/values.yaml
      // highlight-start
      parameters:
        - name: port.clientId
          value: YOUR_PORT_CLIENT_ID
        - name: port.clientSecret
          value: YOUR_PORT_CLIENT_SECRET
        - name: port.baseUrl
          value: https://api.getport.io
  - repoURL: YOUR_GIT_REPO_URL
  // highlight-end
    targetRevision: main
    ref: values
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

<PortApiRegionTip/>
</details>
<br/>

3. Apply your application manifest with `kubectl`:
```bash
kubectl apply -f my-ocean-argocd-integration.yaml
```
</TabItem>
</Tabs>

#### What does the integration do?

After installation, the integration will:

1. Create <PortTooltip id="blueprint">blueprints</PortTooltip> in your [Builder](https://app.getport.io/settings/data-model) (as defined [here](https://github.com/port-labs/ocean/blob/main/integrations/argocd/.port/resources/blueprints.json)) that represent ArgoCD resources:

<img src='/img/guides/argoBlueprintsCreated.png' width='100%' border='1px' />

<br/><br/>

<!-- :::info Note

`Workload` is an abstraction of Kubernetes objects which create and manage pods (e.g. `Deployment`, `StatefulSet`, `DaemonSet`).

::: -->

2. Create <PortTooltip id="entity">entities</PortTooltip> in your [Software catalog](https://app.getport.io/services). You will see a new page for each <PortTooltip id="blueprint">blueprint</PortTooltip> containing your resources, filled with data from your Kubernetes cluster (according to the default mapping that is defined [here](https://github.com/port-labs/ocean/blob/main/integrations/argocd/.port/resources/port-app-config.yaml)):

<img src='/img/guides/argoEntitiesCreated.png' width='100%' border='1px' />

<br/><br/>

3. Create a [dashboard](https://app.getport.io/argocdDashboard) in your software catalog that provides you with some visual views of the data ingested from your K8s cluster.

4. Listen to changes in your ArgoCD resources and update your <PortTooltip id="entity">entities</PortTooltip> accordingly.

<br/>

### Define the connection between workloads and services

Now that we have our <PortTooltip id="blueprint">blueprints</PortTooltip> set up, we want to model the logical connection between our ArgoCD resources and the `Service` blueprint that already exists in our builder. This will grant us some helpful context in our software catalog, allowing us to see relevant ArgoCD application/s in a `Service`'s context, and their corresponding data.

In this guide we will create a relation named `Service` for the `Running Service` blueprint, which represents the service a workload is running.

1. Go to your [Builder](https://app.getport.io/settings/data-model), expand the `Running Service` blueprint, and click on `New relation`.

2. Fill out the form like this, then click `Create`:

<img src='/img/guides/createServiceRelation.png' width='50%' border='1px' />


<br/><br/>

### Map your workloads to their services

You may have noticed that the `service` relation is empty for all of our `Running Services`. This is because we haven't specified which `Running service` belongs to which `service`. This can be done manually, or via mapping by using a convention of your choice.

In this guide we will use the following convention:  
An Argo application with a label in the form of `portService: <service-identifier>` will automatically be assigned to a `service` with that identifier.

For example, an ArgoCD application with the label `portService: awesomeService` will be assigned to a `service` with the identifier `awesomeService`.

To achieve this, we need to update the ArgoCD integration's mapping configuration:

1. Go to your [data sources page](https://app.getport.io/settings/data-sources), find the ArgoCD exporter card, click on it and you will see a YAML editor showing the current configuration.  
Add the following block to the mapping configuration and click `Resync`:

```yaml showLineNumbers
  - kind: application
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .metadata.labels.portService
          blueprint: '"service"'
          properties: {}
  - kind: application
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .metadata.uid
          blueprint: '"argocdApplication"'
          properties: {}
          relations:
            service: .metadata.labels.portService
```

<br/>

2. Go to the [services page](https://app.getport.io/services) of your software catalog. Click on the `Service` for which you created the deployment. At the bottom of the page, you will see the `Running Services` related to this service, along with all of their data:

<img src='/img/guides/argoEntityAfterIngestion.png' width='100%' border='1px' />

<br/>

### Visualize data from your Kubernetes environment

We now have a lot of data about our Argo applications, and a dashboard that visualizes it in ways that will benefit the routines of our developers and managers. Since we connected our ArgoCD application(`Running service`) blueprint to our `Service` blueprint, we can now access some of the application's data directly in the context of the service.  
Let's see an example of how we can add useful visualizations to our dashboard:

#### Show all "degraded" workloads of `AwesomeService` service belonging to a specific team

1. Go to your [ArgoCD dashboard](https://app.getport.io/argocdDashboard), click on the `+ Add` button in the top right corner, then select `Table`.

2. Fill the form out like this, then click `Save`:

    <img src='/img/guides/argoTableDegradedServicesForm.png' width='50%' border='1px' />

3. In your new table, click on the `Filter` icon, then on `+ Add new filter`.  
   Add three filters by filling out the fields like this:

    <img src='/img/guides/argoTableFilterDegraded.png' width='80%' border='1px' />

4. Your table should now display all services belonging to your specified team, whose `Health` is `Degraded`:

    <img src='/img/guides/argoTableDegradedServices.png' width='90%' border='1px' />

### Possible daily routine integrations

- Send a slack message in the R&D channel to let everyone know that a new deployment was created.
- Notify Devops engineers when a service's availability drops.
- Send a weekly/monthly report to R&D managers displaying the health of services' production runtime.

### Conclusion

Kubernetes is a complex environment that requires high-quality observability. Port's ArgoCD integration allows you to easily model and visualize your ArgoCD & Kubernetes resources, and integrate them into your daily routine.  
Customize your views to display the data that matters to you, grouped or filtered by teams, namespaces, or any other criteria.  
