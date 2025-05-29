---
sidebar_position: 3
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_statuspage_docker_parameters.mdx"
import HelmParameters from "../../templates/\_ocean-advanced-parameters-helm.mdx"
import AdvancedConfig from '../../../../generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"


# Statuspage

Port's Statuspage integration allows you to model Statuspage resources in your software catalog and ingest data into them.

## Overview

This integration allows you to:

- Map and organize your desired Statuspage resources and their metadata in Port (see supported resources below).
- Watch for Statuspage object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.

### Supported Resources

The resources that can be ingested from Statuspage into Port are listed below. It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [`Page`](https://developer.statuspage.io/#tag/pages)
- [`Component Group`](https://developer.statuspage.io/#tag/component-groups)
- [`Component`](https://developer.statuspage.io/#tag/components)
- [`Incident`](https://developer.statuspage.io/#tag/incidents)
- [`Incident Update`](https://developer.statuspage.io/#tag/incident-updates)


## Setup

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation/>

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

<h2>Prerequisites</h2>

<Prerequisites />

For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>

<OceanRealtimeInstallation integration="Statuspage" />

<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-statuspage-integration` in your git repository with the content:

:::note Replace the placeholder
Remember to replace the placeholder for `STATUSPAGE_API_KEY`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-statuspage-integration
  type: statuspage
  eventListener:
    type: POLLING
  secrets:
  // highlight-next-line
    statuspageApiKey: STATUSPAGE_API_KEY
```
<br/>

2. Install the `my-ocean-statuspage-integration` ArgoCD Application by creating the following `my-ocean-statuspage-integration.yaml` manifest:
:::note Replace the placeholders
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.

Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).
:::

<details>
  <summary>ArgoCD Application (Click to expand)</summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-ocean-statuspage-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-statuspage-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-statuspage-integration/values.yaml
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
kubectl apply -f my-ocean-statuspage-integration.yaml
```
</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.

| Parameter                              | Description                                                                                                                                                                                                                                                                                    | Required |
|----------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `port.clientId`                        | Your Port client id ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))                                                                                                                                     | ✅        |
| `port.clientSecret`                    | Your Port client secret ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))                                                                                                                                 | ✅        |
| `port.baseUrl`                         | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                                                        | ✅        |
| `integration.identifier`               | Change the identifier to describe your integration                                                                                                                                                                                                                                             | ✅        |
| `integration.secrets.statuspageApiKey` | API key used to query the Statuspage.io API. [Get your Statuspage API Key](https://support.atlassian.com/statuspage/docs/create-and-manage-api-keys/)                                                                                                                                          | ✅        |
| `integration.config.statuspageIds`     | Comma-separated list of Statuspage.io page IDs to query e.g. `'["statuspage-id-1","statuspage-id-2"]'`. If not specified, all pages will be queried                                                                                                                                            | ❌        |
| `integration.config.statuspageHost`    | The host of the Statuspage.io API. Defaults to https://api.statuspage.io                                                                                                                                                                                                                       | ❌        |
| `integration.eventListener.type`       | The event listener type. Read more about [event listeners](https://ocean.getport.io/framework/features/event-listener)                                                                                                                                                                         | ✅        |
| `integration.type`                     | The integration to be installed                                                                                                                                                                                                                                                                | ✅        |
| `scheduledResyncInterval`              | The number of minutes between each resync. When not set the integration will resync for each event listener resync event. Read more about [scheduledResyncInterval](https://ocean.getport.io/develop-an-integration/integration-configuration/#scheduledresyncinterval---run-scheduled-resync) | ❌        |
| `initializePortResources`              | Default true, When set to true the integration will create default blueprints and the port App config Mapping. Read more about [initializePortResources](https://ocean.getport.io/develop-an-integration/integration-configuration/#initializeportresources---initialize-port-resources)       | ❌        |
| `sendRawDataExamples`                  | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                                                                                                                                            | ❌        |

<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the Statuspage integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time using webhooks you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option
:::

  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `statuspage-integration.yml` workflow file:

```yaml showLineNumbers
name: Statuspage Exporter Workflow

on:
  workflow_dispatch:
  schedule:
    - cron: '0 */1 * * *' # Determines the scheduled interval for this workflow. This example runs every hour.

jobs:
  run-integration:
    runs-on: ubuntu-latest
    timeout-minutes: 30 # Set a time limit for the job

    steps:
      - uses: port-labs/ocean-sail@v1
        with: 
          type: 'statuspage'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            statuspage_api_key: ${{ secrets.OCEAN__INTEGRATION__CONFIG__STATUSPAGE_API_KEY }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">

:::tip Jenkins Agent capabilities
Your Jenkins agent should be able to run docker commands.
:::

Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/)
of `Secret Text` type:

<DockerParameters />

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```text showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run Statuspage Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__STATUSPAGE_API_KEY', variable: 'OCEAN__INTEGRATION__CONFIG__STATUSPAGE_API_KEY'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="statuspage"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__INTEGRATION__CONFIG__STATUSPAGE_API_KEY=$OCEAN__INTEGRATION__CONFIG__STATUSPAGE_API_KEY \
                                -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
                                -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
                                -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
                                $image_name

                            exit $?
                        ''')
                    }
                }
            }
        }
    }
}
```

  </TabItem>
   <TabItem value="azure" label="Azure Devops">
<AzurePremise  />

<DockerParameters />

<br/>

Here is an example for `statuspage-integration.yml` pipeline file:

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
    integration_type="statuspage"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm --platform=linux/amd64 \
      -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
      -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
      -e OCEAN__INTEGRATION__CONFIG__STATUSPAGE_API_KEY=$(OCEAN__INTEGRATION__CONFIG__STATUSPAGE_API_KEY) \
      -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
      -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
      -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
      $image_name

    exit $?
  displayName: 'Ingest Data into Port'

```

  </TabItem>
 <TabItem value="gitlab" label="GitLab">

Make sure to [configure the following GitLab variables](https://docs.gitlab.com/ee/ci/variables/#for-a-project):

<DockerParameters/>

<br/>


Here is an example for `.gitlab-ci.yml` pipeline file:

```yaml showLineNumbers
default:
  image: docker:24.0.5
  services:
    - docker:24.0.5-dind
  before_script:
    - docker info
    
variables:
  INTEGRATION_TYPE: statuspage
  VERSION: latest

stages:
  - ingest

ingest_data:
  stage: ingest
  variables:
    IMAGE_NAME: ghcr.io/port-labs/port-ocean-$INTEGRATION_TYPE:$VERSION
  script:
    - |
      docker run -i --rm --platform=linux/amd64 \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__INTEGRATION__CONFIG__STATUSPAGE_API_KEY=$OCEAN__INTEGRATION__CONFIG__STATUSPAGE_API_KEY \
        -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
        -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $IMAGE_NAME

  rules: # Run only when changes are made to the main branch
    - if: '$CI_COMMIT_BRANCH == "main"'
```

</TabItem>
  </Tabs>

<PortApiRegionTip/>

<AdvancedConfig/>

</TabItem>

</Tabs>


## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.

### Default mapping configuration

This is the default mapping configuration for this integration:

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>


```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
- kind: statuspage
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id
        title: .name
        blueprint: '"statuspage"'
        properties:
          page_description: .page_description
          headline: .headline
          branding: .branding
          status_indicator: .status_indicator
          status_description: .status_description
          subdomain: .subdomain
          domain: .domain
          url: .url
          allow_page_subscribers: .allow_page_subscribers
          allow_incident_subscribers: .allow_incident_subscribers
          allow_email_subscribers: .allow_email_subscribers
          allow_sms_subscribers: .allow_sms_subscribers
          allow_rss_atom_feeds: .allow_rss_atom_feeds
          allow_webhook_subscribers: .allow_webhook_subscribers
          time_zone: .time_zone
          createdAt: .created_at
          updatedAt: .updated_at
- kind: component_group
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id
        title: .name
        blueprint: '"statuspageComponentGroup"'
        properties:
          description: .description
          position: .position
          createdAt: .created_at
          updatedAt: .updated_at
        relations:
          statuspage: .page_id
- kind: component
  selector:
    query: .group == false
  port:
    entity:
      mappings:
        identifier: .id
        title: .name
        blueprint: '"statuspageComponent"'
        properties:
          description: .description
          position: .position
          status: .status
          showcase: .showcase
          only_show_if_degraded: .only_show_if_degraded
          startDate: .start_date | if . == null then null else (strptime("%Y-%m-%d") | todateiso8601) end
          createdAt: .created_at
          updatedAt: .updated_at
        relations:
          componentGroup: .group_id
          statuspage: .page_id
- kind: incident
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id
        title: .name
        blueprint: '"statuspageIncident"'
        properties:
          status: .status
          impact: .impact
          createdAt: .created_at
          updatedAt: .updated_at
          startedAt: .started_at
          resolvedAt: .resolved_at
          shortlink: .shortlink
          scheduled_for: .scheduled_for
          scheduled_until: .scheduled_until
          scheduled_remind_prior: .scheduled_remind_prior
          scheduled_reminded_at: .scheduled_reminded_at
          impact_override: .impact_override
          scheduled_auto_in_progress: .scheduled_auto_in_progress
          scheduled_auto_completed: .scheduled_auto_completed
          metadata: .metadata
          reminder_intervals: .reminder_intervals
          postmortem_body: .postmortem_body
          postmortem_body_last_updated_at: .postmortem_body_last_updated_at
          postmortem_ignored: .postmortem_ignored
          postmortem_published_at: .postmortem_published_at
          postmortem_notified_subscribers: .postmortem_notified_subscribers
          postmortem_notified_twitter: .postmortem_notified_twitter
        relations:
          components: '[.components[].id]'
          statuspage: .page_id
- kind: incident_update
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .id
        title: .body
        blueprint: '"statuspageIncidentUpdate"'
        properties:
          status: .status
          body: .body
          createdAt: .created_at
          displayAt: .display_at
          deliverNotifications: .deliver_notifications
          wantsTwitterUpdate: .wants_twitter_update
          tweet_id: .tweet_id
          custom_tweet: .custom_tweet
        relations:
          incident: .incident_id
          affectedComponents: '[.affected_components[].code]'
```

</details>



## Examples


To view and test the integration's mapping against examples of the third-party API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

 Examples of blueprints and the relevant integration configurations can be found on the statuspage [examples page](examples.md)




## Let's Test It

This section includes a sample response data from Statuspage. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Statuspage:

<details>
<summary><b>Page response data (Click to expand)</b></summary>

```json showLineNumbers
{
    "id": "8m2l51279rpl",
    "created_at": "2024-06-07T01:12:00Z",
    "updated_at": "2024-06-26T03:49:25Z",
    "name": "Ctrlv Solutions",
    "page_description": null,
    "headline": null,
    "branding": "basic",
    "subdomain": "ctrlvsolutions",
    "domain": null,
    "url": null,
    "support_url": null,
    "hidden_from_search": false,
    "allow_page_subscribers": true,
    "allow_incident_subscribers": true,
    "allow_email_subscribers": true,
    "allow_sms_subscribers": true,
    "allow_rss_atom_feeds": true,
    "allow_webhook_subscribers": false,
    "notifications_from_email": null,
    "notifications_email_footer": "You received this email because you are subscribed to Ctrlv Solutions's service status notifications.",
    "activity_score": 499,
    "twitter_username": null,
    "viewers_must_be_team_members": false,
    "ip_restrictions": null,
    "city": null,
    "state": null,
    "country": null,
    "time_zone": "UTC",
    "css_body_background_color": "ffffff",
    "css_font_color": "333333",
    "css_light_font_color": "757575",
    "css_greens": "1e8542",
    "css_yellows": "f1c40f",
    "css_oranges": "b35e14",
    "css_blues": "207ab6",
    "css_reds": "de2f1b",
    "css_border_color": "E0E0E0",
    "css_graph_color": "3498db",
    "css_link_color": "207ab6",
    "css_no_data": "b3bac5",
    "favicon_logo": {
        "updated_at": null,
        "size": null,
        "url": ""
    },
    "transactional_logo": {
        "updated_at": null,
        "original_url": "",
        "size": null,
        "normal_url": "",
        "retina_url": ""
    },
    "hero_cover": {
        "updated_at": null,
        "original_url": "",
        "size": null,
        "normal_url": "",
        "retina_url": ""
    },
    "email_logo": {
        "updated_at": null,
        "original_url": "",
        "size": null,
        "normal_url": "",
        "retina_url": ""
    },
    "twitter_logo": {
        "updated_at": null,
        "size": null,
        "url": ""
    }
}

```

</details>

<details>
<summary><b>Component Group response data (Click to expand)</b></summary>

```json showLineNumbers
{
    "id": "9w477s340zqt",
    "page_id": "8m2l51279rpl",
    "name": "Backend",
    "description": null,
    "components": [
        "3chbmx8qmlny"
    ],
    "position": 7,
    "created_at": "2024-06-06T15:51:24Z",
    "updated_at": "2024-06-06T15:51:24Z"
}
```
</details>

<details>
<summary><b>Component response data (Click to expand)</b></summary>

```json showLineNumbers
{
  "id": "y6ssccsqgy8s",
  "page_id": "8m2l51279rpl",
  "group_id": null,
  "created_at": "2024-06-07T01:12:00Z",
  "updated_at": "2024-06-07T01:12:00Z",
  "group": false,
  "name": "API Gateway",
  "description": null,
  "position": 1,
  "status": "operational",
  "showcase": true,
  "only_show_if_degraded": false,
  "automation_email": "component+4912b1b6b16b44f7be966d1389ca7dd1@notifications.statuspage.io",
  "start_date": "2024-06-07"
}
```
</details>

<details>
<summary><b>Incident response data (Click to expand)</b></summary>

```json showLineNumbers
{
  "id": "f5v3b6dr7k53",
  "components": [
    {
      "id": "7ddtptqkb02y",
      "page_id": "8m2l51279rpl",
      "group_id": null,
      "created_at": "2024-06-06T15:47:06Z",
      "updated_at": "2024-06-06T15:47:06Z",
      "group": false,
      "name": "API Gateway",
      "description": null,
      "position": 1,
      "status": "operational",
      "showcase": true,
      "only_show_if_degraded": false,
      "automation_email": "component+249149b3d4f94d599179e9a5a2f9762d@notifications.statuspage.io",
      "start_date": "2024-06-06"
    },
    {
      "id": "3chbmx8qmlny",
      "page_id": "8m2l51279rpl",
      "group_id": "9w477s340zqt",
      "created_at": "2024-06-06T15:51:24Z",
      "updated_at": "2024-06-06T15:51:24Z",
      "group": false,
      "name": "Fraud Detection Service",
      "description": null,
      "position": 1,
      "status": "operational",
      "showcase": true,
      "only_show_if_degraded": false,
      "automation_email": "component+3224d887fad941c8a39a87c6a67efcc4@notifications.statuspage.io",
      "start_date": "2024-06-06"
    },
    {
      "id": "kvpxtsp2k1lf",
      "page_id": "8m2l51279rpl",
      "group_id": null,
      "created_at": "2024-06-06T15:49:37Z",
      "updated_at": "2024-06-07T01:04:38Z",
      "group": false,
      "name": "Payment Service",
      "description": null,
      "position": 5,
      "status": "partial_outage",
      "showcase": true,
      "only_show_if_degraded": false,
      "automation_email": "component+e9ed656c064e4d15935fc611dd4c04db@notifications.statuspage.io",
      "start_date": "2024-06-06"
    },
    {
      "id": "3h6c0mc56qdr",
      "page_id": "8m2l51279rpl",
      "group_id": null,
      "created_at": "2024-06-06T15:52:14Z",
      "updated_at": "2024-06-06T15:52:14Z",
      "group": false,
      "name": "Jira Administration",
      "description": null,
      "position": 8,
      "status": "operational",
      "showcase": false,
      "only_show_if_degraded": false,
      "automation_email": "component+3cf3309f51f14f3aa7b024cf4982edda@notifications.statuspage.io",
      "start_date": null
    }
  ],
  "created_at": "2024-06-07T01:00:17Z",
  "impact": "major",
  "impact_override": "major",
  "incident_updates": [
    {
      "id": "rgm45b89jz31",
      "incident_id": "f5v3b6dr7k53",
      "affected_components": [
        {
            "code": "7ddtptqkb02y",
            "name": "API Gateway",
            "old_status": "operational",
            "new_status": "operational"
        },
        {
            "code": "kvpxtsp2k1lf",
            "name": "Payment Service",
            "old_status": "partial_outage",
            "new_status": "partial_outage"
        },
        {
            "code": "3chbmx8qmlny",
            "name": "Backend - Fraud Detection Service",
            "old_status": "operational",
            "new_status": "operational"
        },
        {
            "code": "3h6c0mc56qdr",
            "name": "Jira Administration",
            "old_status": "operational",
            "new_status": "operational"
        }
      ],
      "body": "Resolved",
      "created_at": "2024-06-07T22:26:34.370Z",
      "custom_tweet": null,
      "deliver_notifications": true,
      "display_at": "2024-06-07T22:26:34.370Z",
      "status": "resolved",
      "tweet_id": null,
      "twitter_updated_at": null,
      "updated_at": "2024-06-07T22:26:34.370Z",
      "wants_twitter_update": false
    },
    {
      "id": "p19ll31ysh49",
      "incident_id": "f5v3b6dr7k53",
      "affected_components": [
        {
            "code": "7ddtptqkb02y",
            "name": "API Gateway",
            "old_status": "operational",
            "new_status": "operational"
        },
        {
            "code": "kvpxtsp2k1lf",
            "name": "Payment Service",
            "old_status": "partial_outage",
            "new_status": "partial_outage"
        },
        {
            "code": "3chbmx8qmlny",
            "name": "Backend - Fraud Detection Service",
            "old_status": "operational",
            "new_status": "operational"
        }
      ],
      "body": "checking components",
      "created_at": "2024-06-07T22:22:28.761Z",
      "custom_tweet": null,
      "deliver_notifications": true,
      "display_at": "2024-06-07T22:22:28.761Z",
      "status": "monitoring",
      "tweet_id": null,
      "twitter_updated_at": null,
      "updated_at": "2024-06-07T22:22:28.761Z",
      "wants_twitter_update": false
    },
    {
      "id": "gkjdpm52nm97",
      "incident_id": "f5v3b6dr7k53",
      "affected_components": null,
      "body": "We are currently experiencing timeout errors with our API Gateway. Some API requests may fail or take longer to process. Our team is investigating the issue.",
      "created_at": "2024-06-07T01:00:17.309Z",
      "custom_tweet": null,
      "deliver_notifications": true,
      "display_at": "2024-06-07T01:00:17.309Z",
      "status": "investigating",
      "tweet_id": null,
      "twitter_updated_at": null,
      "updated_at": "2024-06-07T01:00:17.309Z",
      "wants_twitter_update": false
    }
  ],
  "metadata": {
      "port": {
          "runId": "r_hUFsDXiY5DzF3sjf",
          "trigger": "Object"
      }
  },
  "monitoring_at": "2024-06-07T22:22:28Z",
  "name": "API Gateway Timeout Errors",
  "page_id": "8m2l51279rpl",
  "postmortem_body": null,
  "postmortem_body_last_updated_at": null,
  "postmortem_ignored": false,
  "postmortem_notified_subscribers": false,
  "postmortem_notified_twitter": false,
  "postmortem_published_at": null,
  "resolved_at": "2024-06-07T22:26:34Z",
  "scheduled_auto_completed": false,
  "scheduled_auto_in_progress": false,
  "scheduled_for": null,
  "auto_transition_deliver_notifications_at_end": null,
  "auto_transition_deliver_notifications_at_start": null,
  "auto_transition_to_maintenance_state": null,
  "auto_transition_to_operational_state": null,
  "scheduled_remind_prior": false,
  "scheduled_reminded_at": null,
  "scheduled_until": null,
  "shortlink": "https://stspg.io/t4szpmm54wxx",
  "status": "resolved",
  "updated_at": "2024-06-07T22:26:34Z",
  "reminder_intervals": null
}
```

</details>

<details>
<summary><b>Incident Update response data (Click to expand)</b></summary>

```json showLineNumbers
{
  "id": "gkjdpm52nm97",
  "incident_id": "f5v3b6dr7k53",
  "affected_components": null,
  "body": "We are currently experiencing timeout errors with our API Gateway. Some API requests may fail or take longer to process. Our team is investigating the issue.",
  "created_at": "2024-06-07T01:00:17.309Z",
  "custom_tweet": null,
  "deliver_notifications": true,
  "display_at": "2024-06-07T01:00:17.309Z",
  "status": "investigating",
  "tweet_id": null,
  "twitter_updated_at": null,
  "updated_at": "2024-06-07T01:00:17.309Z",
  "wants_twitter_update": false
}
```
</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary><b>Page entity in Port (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "8m2l51279rpl",
  "title": "Ctrlv Solutions",
  "blueprint": "statuspage",
  "icon": "StatusPage",
  "team": [],
  "properties": {
    "time_zone": "UTC",
    "updatedAt": "2024-06-21T01:31:52Z",
    "allow_sms_subscribers": true,
    "allow_webhook_subscribers": false,
    "allow_page_subscribers": true,
    "allow_rss_atom_feeds": true,
    "branding": "basic",
    "allow_incident_subscribers": true,
    "subdomain": "ctrlvsolutions",
    "createdAt": "2024-06-07T01:12:00Z",
    "allow_email_subscribers": true
  },
  "relations": {},
  "createdAt": "2024-06-25T07:59:28.716Z",
  "createdBy": "<port-client-id>",
  "updatedAt": "2024-06-25T07:59:28.716Z",
  "updatedBy": "<port-client-id>"
}
```

</details>

<details>
<summary><b>Component Group entity in Port (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "9w477s340zqt",
  "title": "Backend",
  "blueprint": "statuspageComponentGroup",
  "icon": "StatusPage",
  "team": [],
  "properties": {
    "updatedAt": "2024-06-06T15:51:24Z",
    "position": 7,
    "createdAt": "2024-06-06T15:51:24Z"
  },
  "relations": {
    "statuspage": "8m2l51279rpl"
  },
  "createdAt": "2024-06-25T07:59:33.363Z",
  "createdBy": "<port-client-id>",
  "updatedAt": "2024-06-25T07:59:33.363Z",
  "updatedBy": "<port-client-id>"
}
```
</details>

<details>
<summary><b>Component entity in Port (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "y6ssccsqgy8s",
  "title": "API Gateway",
  "blueprint": "statuspageComponent",
  "icon": "StatusPage",
  "team": [],
  "properties": {
    "startDate": "2024-06-07T00:00:00Z",
    "only_show_if_degraded": false,
    "status": "operational",
    "updatedAt": "2024-06-07T01:12:00Z",
    "position": 1,
    "showcase": true,
    "createdAt": "2024-06-07T01:12:00Z"
  },
  "relations": {
    "statuspage": "8m2l51279rpl",
    "componentGroup": null
  },
  "createdAt": "2024-06-25T07:59:35.830Z",
  "createdBy": "<port-client-id>",
  "updatedAt": "2024-06-25T07:59:35.830Z",
  "updatedBy": "<port-client-id>"
}
```
</details>

<details>
<summary><b>Incident entity in Port (Click to respond)</b></summary>

```json showLineNumbers
{
  "identifier": "f5v3b6dr7k53",
  "title": "API Gateway Timeout Errors",
  "blueprint": "statuspageIncident",
  "icon": "StatusPage",
  "team": [],
  "properties": {
    "scheduled_auto_completed": false,
    "createdAt": "2024-06-07T01:00:17.239Z",
    "metadata": {
      "port": {
        "runId": "r_hUFsDXiY5DzF3sjf",
        "trigger": "Object"
      }
    },
    "impact": "major",
    "updatedAt": "2024-06-07T22:26:34.383Z",
    "status": "resolved",
    "shortlink": "https://stspg.io/t4szpmm54wxx",
    "postmortem_ignored": false,
    "startedAt": "2024-06-07T01:00:17.228Z",
    "scheduled_auto_in_progress": false,
    "postmortem_notified_subscribers": false,
    "scheduled_remind_prior": false,
    "resolvedAt": "2024-06-07T22:26:34.370Z",
    "postmortem_notified_twitter": false,
    "category": "incident"
  },
  "relations": {
    "components": [
      "7ddtptqkb02y",
      "3chbmx8qmlny",
      "kvpxtsp2k1lf",
      "3h6c0mc56qdr"
    ],
    "statuspage": "8m2l51279rpl"
  },
  "createdAt": "2024-06-25T08:00:39.222Z",
  "createdBy": "<port-client-id>",
  "updatedAt": "2024-06-25T08:00:39.222Z",
  "updatedBy": "<port-client-id>"
}
```
</details>


<details>
<summary><b>Incident Update entity in Port (Click to expand)</b>t</summary>

```json showLineNumbers
{
  "identifier": "gkjdpm52nm97",
  "title": "We are currently experiencing timeout errors with our API Gateway. Some API requests may fail or take longer to process. Our team is investigating the issue.",
  "blueprint": "statuspageIncidentUpdate",
  "icon": "StatusPage",
  "team": [],
  "properties": {
    "status": "investigating",
    "wantsTwitterUpdate": false,
    "body": "We are currently experiencing timeout errors with our API Gateway. Some API requests may fail or take longer to process. Our team is investigating the issue.",
    "deliverNotifications": true,
    "createdAt": "2024-06-07T01:00:17.309Z",
    "displayAt": "2024-06-07T01:00:17.309Z",
    "category": "incident"
  },
  "relations": {
    "incident": "f5v3b6dr7k53",
    "affectedComponents": []
  },
  "createdAt": "2024-06-25T08:00:46.083Z",
  "createdBy": "<port-client-id>",
  "updatedAt": "2024-06-25T08:00:46.083Z",
  "updatedBy": "<port-client-id>"
}
```
</details>
