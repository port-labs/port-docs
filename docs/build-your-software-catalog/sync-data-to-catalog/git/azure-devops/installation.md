---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../../templates/\_ocean_helm_prerequisites_block.mdx"
import HelmParameters from "../../templates/\_ocean-advanced-parameters-helm.mdx"
import DockerParameters from "./\_azuredevops_one_time_docker_parameters.mdx"
import AdvancedConfig from '../../../../generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"
import AzureDevopsTroubleshootingLink from '/docs/generalTemplates/azure-devops/_azure_devops_troubleshooting_link.mdx'



# Installation

This page details how to install Port's Azure DevOps integration (powered by the Ocean framework). It outlines the following steps:

- How to [create](#create-a-personal-access-token) a personal access token to give the integration permissions to query your Azure DevOps account.
- How to [configure](#configure-the-integration) and customize the integration before deploying it.
- How to [deploy](#deploy-the-integration) the integration in the configuration that fits your use case.

## Prerequisites

- An Azure DevOps account with admin privileges.
- If you choose the real time & always on installation method, you will need a kubernetes cluster on which to install the integration.
- Your Port user role is set to `Admin`.


## Setup

### Create a personal access token

The integration requires a personal access token to authenticate with your Azure DevOps account.  
You can create one by following [these steps](https://learn.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows#create-a-pat).  

The token should either have `admin` permissions, or `read` permissions for each of the supported resources you want to ingest into Port.


## BaseUrl & webhook configuration

:::warning AppHost deprecation
**`integration.config.appHost` is deprecated**: Please use `baseUrl` for webhook URL settings instead.
:::

In order for the Azure Devops integration to update the data in Port on every change in the Azure Devops repository, you need to specify the `baseUrl` parameter.
The `baseUrl` parameter should be set to the `url` of your Azure Devops integration instance. In addition, your Azure Devops instance (whether it is Azure Devops SaaS or a self-hosted version of Azure Devops) needs to have the option to send webhook requests to the Azure Devops integration instance, so please configure your network accordingly.

If `baseUrl` is not provided, the integration will continue to function correctly. In such a configuration, to retrieve the latest information from the target system, the [`scheduledResyncInterval`](https://ocean.getport.io/develop-an-integration/integration-configuration/#scheduledresyncinterval---run-scheduled-resync) parameter has to be set, or a manual resync will need to be triggered through Port's UI.

The `integration.secrets.webhookSecret` parameter secures your webhooks. If not provided, the integration will process webhooks without validating the source of the events.

## Deploy the integration

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation  integration="AzureDevOps"/>

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

<h2> Prerequisites </h2>

<Prerequisites />

For details about the available parameters for the installation, see the table below.


<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>

<OceanRealtimeInstallation integration="Azure-devops" />

<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-azure-devops-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `AZURE_PAT`, and `organizationName`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-azure-devops-integration
  type: azure-devops
  eventListener:
    type: POLLING
  secrets:
  // highlight-next-line
    personalAccessToken: AZURE_PAT
  config:
    organizationUrl: https://dev.azure.com/organizationName
```
<br/>

2. Install the `my-ocean-azure-devops-integration` ArgoCD Application by creating the following `my-ocean-azure-devops-integration.yaml` manifest:
:::note
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.

Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).
:::

<details>
  <summary>ArgoCD Application</summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-ocean-azure-devops-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-azure-devops-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-azure-devops-integration/values.yaml
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

1. Apply your application manifest with `kubectl`:
```bash
kubectl apply -f my-ocean-azure-devops-integration.yaml
```
</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.

| Parameter                                 | Description                                                                                                                                                                                                                                                                                    | Example                                | Required |
|-------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|----------|
| `port.clientId`                           | Your port [client id](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                                  |                                        | ✅        |
| `port.clientSecret`                       | Your port [client secret](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                              |                                        | ✅        |
| `port.baseUrl`                            | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                                                        |                                        | ✅        |
| `integration.secrets.personalAccessToken` | The [personal access token](#create-a-personal-access-token) used to query authenticate with your Azure Devops account                                                                                                                                                                         |                                        | ✅        |
| `integration.secrets.organizationUrl`     | The URL of your Azure DevOps organization                                                                                                                                                                                                                                                      | https://dev.azure.com/organizationName | ✅        |
| `integration.secrets.isProjectsLimited`   | If using a project-scoped personal access token, this setting is enabled to create webhooks for individual projects. Enabled by default                                                                                                                                                        |                                        | ❌        |
| `integration.config.appHost` (deprecated)              | The host of the Port Ocean app. Used to set up the integration endpoint as the target for webhooks created in Azure DevOps                                                                                                                                                                     | https://my-ocean-integration.com       | ❌        |
| `integration.eventListener.type`          | The event listener type. Read more about [event listeners](https://ocean.getport.io/framework/features/event-listener)                                                                                                                                                                         |                                        | ✅        |
| `integration.type`                        | The integration to be installed                                                                                                                                                                                                                                                                |                                        | ✅        |
| `scheduledResyncInterval`                 | The number of minutes between each resync. When not set the integration will resync for each event listener resync event. Read more about [scheduledResyncInterval](https://ocean.getport.io/develop-an-integration/integration-configuration/#scheduledresyncinterval---run-scheduled-resync) |                                        | ❌        |
| `initializePortResources`                 | Default true, When set to true the integration will create default blueprints and the port App config Mapping. Read more about [initializePortResources](https://ocean.getport.io/develop-an-integration/integration-configuration/#initializeportresources---initialize-port-resources)       |                                        | ❌        |
| `sendRawDataExamples`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                                                                                                                                            |                                        | ❌        |
| `integration.secrets.webhookSecret`   | Webhook secret for authenticating incoming events. [Learn more](https://learn.microsoft.com/en-us/azure/devops/service-hooks/services/webhooks)                                                                                                                                                                                                   |                                  | ❌        |
| `baseUrl`                | The host of the Port Ocean app. Used to set up the integration endpoint as the target for webhooks created in Azure DevOps                                                                                                                                                                          | https://my-ocean-integration.com | ❌        |


<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This pipeline will run the Azure DevOps integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time using webhooks you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option.
:::

<Tabs groupId="cicd-method" queryString="cicd-method">

  <TabItem value="azure-pipeline" label="Azure Pipeline">

:::tip Azure pipeline agent check
Your Azure pipeline agent should be able to run docker commands.
:::

Make sure to configure the following variables using [Azure DevOps variable groups](https://learn.microsoft.com/en-us/azure/devops/pipelines/library/variable-groups?view=azure-devops&tabs=yaml). Add them into in a variable group named `port-ocean-credentials`:

  <DockerParameters />

  <br/>

Here is an example for `azure-devops-integration.yml` pipeline file:

```yaml showLineNumbers
trigger:
- main

pool:
  vmImage: "ubuntu-latest"

variables:
  - group: port-ocean-credentials


steps:
- script: |
    # Set Docker image and run the container
    integration_type="azure-devops"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"
    
    docker run -i --rm --platform=linux/amd64 \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
        -e OCEAN__INTEGRATION__CONFIG__PERSONAL_ACCESS_TOKEN=${OCEAN__INTEGRATION__CONFIG__PERSONAL_ACCESS_TOKEN} \
        -e OCEAN__INTEGRATION__CONFIG__ORGANIZATION_URL=${OCEAN__INTEGRATION__CONFIG__ORGANIZATION_URL} \
        -e OCEAN__PORT__CLIENT_ID=${OCEAN__PORT__CLIENT_ID} \
        -e OCEAN__PORT__CLIENT_SECRET=${OCEAN__PORT__CLIENT_SECRET} \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $image_name

    exit $?
  displayName: 'Ingest Azure DevOps Data into Port'

```

<PortApiRegionTip/>

  </TabItem>

  </Tabs>

<AdvancedConfig/>

</TabItem>

</Tabs>


<AzureDevopsTroubleshootingLink/>