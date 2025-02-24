---
displayed_sidebar: null
description: Learn how to visualize ArgoCD service runtime in Port, enhancing monitoring and management of your Kubernetes applications.
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"


# Visualize your services' Kubernetes runtime using ArgoCD

Port’s ArgoCD integration allows you to model and visualize your Kubernetes deployments managed by ArgoCD, directly in Port.  
This guide will help you set up the integration and visualize your services' Kubernetes runtime.


## Common use cases

- Developers can easily view the health and status of their services' K8s runtime.
- Platform engineers can create custom views and visualizations for different stakeholders in the organization.
- Platform engineers can set, maintain and track standards for K8s resources.
- R&D managers can track any data about services' K8s resources, using tailor-made views and dashboards.

## Prerequisites
- The [Git Integration](/build-your-software-catalog/sync-data-to-catalog/git/) that is relevant for you needs to be installed.
- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/).
- [Helm](https://helm.sh/docs/intro/install/) - required to install Port's ArgoCD integration.


## Set up data model

To visualize your Kubernetes deployment managed by ArgoCD in Port, we'll first install Port's ArgoCD integration which automatically creates ArgoCD-related blueprints and entities in Port. 


### Install Port's ArgoCD integration

1. Go to your [data sources page](https://app.getport.io/settings/data-sources), click on `+ Data source`, find the `Kubernetes Stack` category and select `ArgoCD`.

2. Follow the installation command for your preferred installation method:

    <Tabs groupId="deploy" queryString="deploy">

    <TabItem value="helm" label="Helm" default>

    <OceanRealtimeInstallation integration="Argocd" />

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


2. Create <PortTooltip id="entity">entities</PortTooltip> in your [Software catalog](https://app.getport.io/services). You will see a new page for each <PortTooltip id="blueprint">blueprint</PortTooltip> containing your resources, filled with data from your Kubernetes cluster (according to the default mapping that is defined [here](https://github.com/port-labs/ocean/blob/main/integrations/argocd/.port/resources/port-app-config.yaml)):

    <img src='/img/guides/argoEntitiesCreated.png' width='100%' border='1px' />

    <br/><br/>

3. Create a [dashboard](https://app.getport.io/argocdDashboard) in your software catalog that provides you with some visual views of the data ingested from your K8s cluster.

4. Listen to changes in your ArgoCD resources and update your <PortTooltip id="entity">entities</PortTooltip> accordingly.

<br/>

## Set up automatic discovery

After onboarding, the relationship between the **workload** blueprint and the **service** blueprint is established automatically.   
The next step is to configure automatic discovery to ensure that each **workload** entity is properly related to its respective **service** entity.  

You may have noticed that the service relation is empty for all of our workload entities. This is because we haven't specified which **workload** belongs to which **service**. This can be done manually, or via mapping by using a convention of your choice.

In this guide we will use the following convention:  
An Argo application with a label in the form of `portService: <service-identifier>` will automatically be assigned to a `service` with that identifier.

For example, an ArgoCD application with the label `portService: awesomeService` will be assigned to a `service` with the identifier `awesomeService`.

To achieve this, we need to update the ArgoCD integration's mapping configuration:

1. Go to your [data sources page](https://app.getport.io/settings/data-sources), find the ArgoCD exporter card, click on it and you will see a YAML editor showing the current configuration. Add the following block to the mapping configuration and click `Resync`:

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

2. Go to the [services page](https://app.getport.io/services) of your software catalog. Click on the `service` for which you created the deployment. At the bottom of the page, you will see the `workload` related to this service, along with all of their data:

    <img src='/img/guides/argoEntityAfterIngestion.png' width='100%' border='1px' />

    <br/>


## Visualize data from your Kubernetes environment

We now have a lot of data about our Argo applications, and a dashboard that visualizes it in ways that will benefit the routines of our developers and managers. Since our ArgoCD application(`workload`) blueprint is connected to our `service` blueprint, we can now access some of the application's data directly in the context of the service.  
Let's see an example of how we can add useful visualizations to our dashboard:

    
### Display all degraded workloads for the `AwesomeService` service by team

1. Go to your [ArgoCD dashboard](https://app.getport.io/argocdDashboard), click on the `+ Add` button in the top right corner, then select `Table`.

2. Fill the form out like this, then click `Save`:

    <img src='/img/guides/argoTableDegradedServicesForm.png' width='50%' border='1px' />

3. In your new table, click on the `Filter` icon, then on `+ Add new filter`.  
   Add three filters by filling out the fields like this:

    <img src='/img/guides/argoTableFilterDegraded.png' width='80%' border='1px' />

4. Your table should now display all services belonging to your specified team, whose `Health` is `Degraded`:

    <img src='/img/guides/argoTableDegradedServices.png' width='90%' border='1px' />

## Possible daily routine integrations

- Send a slack message in the R&D channel to let everyone know that a new deployment was created.
- Notify Devops engineers when a service's availability drops.
- Send a weekly/monthly report to R&D managers displaying the health of services' production runtime.

## Conclusion

Kubernetes is a complex environment that requires high-quality observability. Port's ArgoCD integration allows you to easily model and visualize your ArgoCD & Kubernetes resources, and integrate them into your daily routine.  
Customize your views to display the data that matters to you, grouped or filtered by teams, namespaces, or any other criteria. 
