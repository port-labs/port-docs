---
sidebar_position: 3
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_statuspage_docker_parameters.mdx"
import HelmParameters from "../templates/\_ocean-advanced-parameters-helm.mdx"
import AdvancedConfig from '../../../generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"

# Statuspage

Port's [Atlassian Statuspage](https://www.atlassian.com/software/statuspage) integration allows you to import `page`, `component_group`, `component`, `incident`, and `incident_update` resources from your Statuspage instance into Port, according to your mapping and definitions.

## Common use cases

- Map  `page`, `component_group`, `component`, `incident`, and `incident_update` resources in your Statuspage account.
- Watch for object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.

## Prerequisites

<Prerequisites />

## Installation

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation/>

</TabItem>

<TabItem value="real-time-always-on" label="Real Time & Always On">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                                | Description                                                                                                                                                      | Required |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `port.clientId`                          | Your Port client id ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))     | ✅       |
| `port.clientSecret`                      | Your Port client secret ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) | ✅       |
| `port.baseUrl`                           | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US      | ✅       |
| `integration.identifier`                 | Change the identifier to describe your integration                                           | ✅       |
| `integration.secrets.statuspageApiKey`    | API key used to query the Statuspage.io API. [Get your Statuspage API Key](https://support.atlassian.com/statuspage/docs/create-and-manage-api-keys/)  | ✅       |
| `integration.config.statuspageIds`      | Comma-separated list of Statuspage.io page IDs to query e.g. `'["statuspage-id-1","statuspage-id-2"]'`. If not specified, all pages will be queried     | ❌       |
| `integration.config.statuspageHost`      | The host of the Statuspage.io API. Defaults to https://api.statuspage.io                     | ❌       |

<HelmParameters />

<br/>

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-statuspage-integration port-labs/port-ocean \
  --set port.clientId="CLIENT_ID"  \
  --set port.clientSecret="CLIENT_SECRET"  \
  --set port.baseUrl="https://api.getport.io"  \
  --set initializePortResources=true  \
  --set integration.identifier="my-statuspage-integration"  \
  --set integration.type="statuspage"  \
  --set integration.eventListener.type="POLLING"  \
  --set integration.secrets.statuspageApiKey="<STATUSPAGE_API_KEY>"
```
<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

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
  <summary>ArgoCD Application (Click to exapnd)</summary>

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

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time" label="Scheduled">
  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">

This workflow will run the Statuspage integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real Time Updates in Port
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `statuspage-integration.yml` workflow file:

```yaml showLineNumbers
name: Statuspage Exporter Workflow

# This workflow responsible for running Statuspage exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

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
This pipeline will run the Statuspage integration once and then exit, this is useful for **scheduled** ingestion of data.

:::tip Jenkins Agent capabilities
Your Jenkins agent should be able to run docker commands.
:::
:::warning Real Time Updates in Port
If you want the integration to update Port in real time using webhooks you should use
the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
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
<AzurePremise name="Statuspage" />

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
This workflow will run the Statuspage integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Realtime updates in Port
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

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

## Ingesting Statuspage objects

The Statuspage integration uses a YAML configuration to describe the process of loading data into the developer portal. See [examples](#examples) below.

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Statuspage's API events.

### Configuration structure

The integration configuration determines which resources will be queried from [Statuspage](https://developer.statuspage.io), and which entities and properties will be created in Port.

:::tip Supported resources and more
The following resources can be used to map data from [Statuspage](https://developer.statuspage.io), it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`Page`](https://developer.statuspage.io/#tag/pages)
- [`Component Group`](https://developer.statuspage.io/#tag/component-groups)
- [`Component`](https://developer.statuspage.io/#tag/components)
- [`Incident`](https://developer.statuspage.io/#tag/incidents)
- [`Incident Update`](https://developer.statuspage.io/#tag/incident-updates)

:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: incident
      selector:
      ...
  ```

- The `kind` key is a specifier for a Statuspage object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: incident
        selector:
        ...
  ```

- The `selector` and the `query` keys allow you to filter which objects of the specified `kind` will be ingested into your software catalog:

  ```yaml showLineNumbers
  resources:
    - kind: incident
      # highlight-start
      selector:
        query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
      # highlight-end
      port:
  ```

- The `port`, `entity` and the `mappings` keys are used to map the Statuspage object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

  ```yaml showLineNumbers
  resources:
    - kind: incident
      selector:
        query: "true"
      port:
        # highlight-start
        entity:
          mappings: # Mappings between one Statuspage object to a Port entity. Each value is a JQ query.
            identifier: .id
            title: .name
            blueprint: '"statuspageIncident"'
            properties:
              status: .status
              impact: .impact
        # highlight-end
    - kind: incident # In this instance incident is mapped again with a different filter
      selector:
        query: '.status == "in_progress"'
      port:
        entity:
          mappings: ...
  ```

  :::tip Blueprint key
  Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
  :::

### Ingest data into Port

To ingest Statuspage objects using the [integration configuration](#configuration-structure), follow the steps below:

1. Go to the [Builder page](https://app.getport.io/dev-portal/data-model) of your portal.
2. Select the `Data Sources` tab in the left sidebar.
3. Click on the `+ Data Source` button in the top right corner.
4. Select `Statuspage` under the `Incident Management` category.
5. Modify the [configuration](#configuration-structure) according to your needs.
6. Run the installation command.
7. Click `Next`, you can view the integration configuration and update it as necessary.

## Examples

Examples of blueprints and the relevant integration configurations:

### Page

<details>
<summary><b>Page blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "statuspage",
  "title": "Status Page",
  "description": "A Statuspage for communicating service status and incidents.",
  "schema": {
    "properties": {
      "page_description": {
        "type": "string",
        "title": "Page Description",
        "description": "Description of the page (optional)."
      },
      "headline": {
        "type": "string",
        "title": "Headline",
        "description": "A short headline for the Statuspage (optional)."
      },
      "branding": {
        "type": "string",
        "title": "Branding",
        "description": "Branding level of the Statuspage (e.g., 'basic')."
      },
      "status_indicator": {
        "type": "string",
        "title": "Status Indicator",
        "enum": ["none", "minor", "major", "critical"],
        "enumColors": {
          "none": "green",
          "minor": "yellow",
          "major": "orange",
          "critical": "red"
        },
        "description": "The current status of the page."
      },
      "status_description": {
        "type": "string",
        "title": "Status Description",
        "description": "Description of the current status (optional)."
      },
      "subdomain": {
        "type": "string",
        "title": "Subdomain",
        "description": "The subdomain used for the Statuspage URL (e.g., 'appcellon')."
      },
      "domain": {
        "type": "string",
        "title": "Custom Domain",
        "description": "Custom domain name for the Statuspage (optional)."
      },
      "url": {
        "type": "string",
        "format": "url",
        "title": "Statuspage URL",
        "description": "Full URL of the Statuspage (optional)."
      },
      "allow_page_subscribers": {
        "type": "boolean",
        "title": "Allow Page Subscribers",
        "description": "Whether to allow users to subscribe to page updates."
      },
      "allow_incident_subscribers": {
        "type": "boolean",
        "title": "Allow Incident Subscribers",
        "description": "Whether to allow users to subscribe to specific incidents."
      },
      "allow_email_subscribers": {
        "type": "boolean",
        "title": "Allow Email Subscribers",
        "description": "Whether to allow email subscriptions."
      },
      "allow_sms_subscribers": {
        "type": "boolean",
        "title": "Allow SMS Subscribers",
        "description": "Whether to allow SMS subscriptions."
      },
      "allow_rss_atom_feeds": {
        "type": "boolean",
        "title": "Allow RSS/Atom Feeds",
        "description": "Whether to allow RSS or Atom feeds."
      },
      "allow_webhook_subscribers": {
        "type": "boolean",
        "title": "Allow Webhook Subscribers",
        "description": "Whether to allow webhook subscriptions."
      },
      "time_zone": {
        "type": "string",
        "title": "Time Zone",
        "description": "The time zone used for the Statuspage."
      },
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Created At",
        "description": "When the Statuspage was created."
      },
      "updatedAt": {
        "type": "string",
        "format": "date-time",
        "title": "Last Updated At",
        "description": "When the Statuspage was last updated."
      }
    }
  },
  "calculationProperties": {},
  "aggregationProperties": {
    "criticalOpenIssues": {
      "title": "Services with Degraded Performance",
      "type": "number",
      "target": "statuspageComponent",
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "status",
            "operator": "=",
            "value": "degraded_performance"
          }
        ]
      },
      "calculationSpec": {
        "calculationBy": "entities",
        "func": "count"
      }
    }
  }
}
```

</details>

<details>
<summary><b>Integration configuration (Click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: statuspage
    selector:
      query: "true"
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
```

</details>

### Component Group

<details>
<summary><b>Component Group blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "statuspageComponentGroup",
  "title": "Statuspage Component Group",
  "description": "A group of related components on a Statuspage.",
  "schema": {
    "properties": {
      "description": {
        "type": "string",
        "title": "Description",
        "description": "Description of the group (optional)."
      },
      "position": {
        "type": "number",
        "title": "Position",
        "description": "Order of the group on the Statuspage."
      },
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Created At",
        "description": "When the group was created."
      },
      "updatedAt": {
        "type": "string",
        "format": "date-time",
        "title": "Last Updated At",
        "description": "When the group was last updated."
      }
    }
  },
  "calculationProperties": {},
  "relations": {
    "statuspage": {
      "target": "statuspage",
      "required": false,
      "title": "Status Page",
      "many": false
    }
  }
}
```

</details>

<details>
<summary><b>Integration configuration (Click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: component_group
    selector:
      query: "true"
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
```

</details>

### Component

<details>
<summary><b>Component blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "statuspageComponent",
  "title": "Statuspage Component",
  "icon": "Box",
  "description": "A component representing a specific part of a system or service on a Statuspage.",
  "schema": {
    "properties": {
      "description": {
        "type": "string",
        "title": "Description",
        "description": "Description of the component (optional)."
      },
      "status": {
        "type": "string",
        "title": "Current Status",
        "enum": [
          "operational",
          "degraded_performance",
          "partial_outage",
          "major_outage"
        ],
        "enumColors": {
          "operational": "green",
          "degraded_performance": "yellow",
          "partial_outage": "orange",
          "major_outage": "red"
        },
        "description": "The operational status of the component."
      },
      "position": {
        "type": "number",
        "title": "Position",
        "description": "Order of the component within its group."
      },
      "showcase": {
        "type": "boolean",
        "title": "Showcase",
        "description": "Whether to display the component prominently."
      },
      "only_show_if_degraded": {
        "type": "boolean",
        "title": "Only Show If Degraded",
        "description": "Whether to display the component only when degraded."
      },
      "startDate": {
        "type": "string",
        "format": "date-time",
        "title": "Start Date",
        "description": "The date when the component tracking started."
      },
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Created At",
        "description": "When the component was created."
      },
      "updatedAt": {
        "type": "string",
        "format": "date-time",
        "title": "Last Updated At",
        "description": "When the component was last updated."
      }
    }
  },
  "calculationProperties": {},
  "relations": {
    "componentGroup": {
      "target": "statuspageComponentGroup",
      "required": false,
      "title": "Component Group",
      "many": false
    },
    "statuspage": {
      "target": "statuspage",
      "required": false,
      "title": "Status Page",
      "many": false
    }
  }
}
```

</details>

<details>
<summary><b>Integration configuration (Click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: component
    selector:
      query: ".group == false"
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
            startDate: '.start_date | if . == null then null else (strptime("%Y-%m-%d") | todateiso8601) end'
            createdAt: .created_at
            updatedAt: .updated_at
          relations:
            componentGroup: .group_id
            statuspage: .page_id
```

</details>

### Incident

<details>
<summary><b>Incident blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "statuspageIncident",
  "title": "Statuspage Incident",
  "icon": "Alert",
  "description": "An incident reported on a Statuspage.",
  "schema": {
    "properties": {
      "status": {
        "type": "string",
        "title": "Current Status",
        "enum": [
          "investigating",
          "identified",
          "monitoring",
          "resolved",
          "postmortem",
          "scheduled",
          "in_progress",
          "verifying",
          "completed"
        ],
        "enumColors": {
          "investigating": "blue",
          "identified": "orange",
          "monitoring": "yellow",
          "resolved": "green",
          "postmortem": "purple",
          "scheduled": "lightGray",
          "in_progress": "blue",
          "verifying": "yellow",
          "completed": "green"
        },
        "description": "Current status of the incident."
      },
      "impact": {
        "type": "string",
        "title": "Impact",
        "enum": ["none", "minor", "major", "critical"],
        "enumColors": {
          "none": "green",
          "minor": "yellow",
          "major": "orange",
          "critical": "red"
        },
        "description": "The impact level of the incident."
      },
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Created At",
        "description": "When the incident was first reported."
      },
      "updatedAt": {
        "type": "string",
        "format": "date-time",
        "title": "Last Updated At",
        "description": "When the incident was last updated."
      },
      "startedAt": {
        "type": "string",
        "format": "date-time",
        "title": "Started At",
        "description": "When the incident actually began."
      },
      "resolvedAt": {
        "type": "string",
        "format": "date-time",
        "title": "Resolved At",
        "description": "When the incident was resolved (null if ongoing)."
      },
      "shortlink": {
        "type": "string",
        "format": "url",
        "title": "Short Link",
        "description": "A shortened URL for sharing the incident status page."
      },
      "postmortemPublishedAt": {
        "type": "string",
        "format": "date-time",
        "title": "Postmortem Published At",
        "description": "When the postmortem analysis was published (null if not yet published)."
      },
      "scheduled_for": {
        "type": "string",
        "format": "date-time",
        "title": "Scheduled For",
        "description": "Start time for a scheduled incident (null if not scheduled)."
      },
      "scheduled_until": {
        "type": "string",
        "format": "date-time",
        "title": "Scheduled Until",
        "description": "End time for a scheduled incident (null if not scheduled)."
      },
      "scheduled_remind_prior": {
        "type": "boolean",
        "title": "Scheduled Remind Prior",
        "description": "Whether to send a reminder before a scheduled incident."
      },
      "scheduled_reminded_at": {
        "type": "string",
        "format": "date-time",
        "title": "Scheduled Reminded At",
        "description": "When the reminder for a scheduled incident was sent (null if not applicable)."
      },
      "scheduled_auto_in_progress": {
        "type": "boolean",
        "title": "Scheduled Auto In Progress",
        "description": "Whether to automatically transition the incident to 'in progress'."
      },
      "scheduled_auto_completed": {
        "type": "boolean",
        "title": "Scheduled Auto Completed",
        "description": "Whether to automatically mark the incident as completed."
      },
      "metadata": {
        "type": "object",
        "title": "Metadata",
        "description": "Custom metadata associated with the incident."
      },
      "reminder_intervals": {
        "type": "string",
        "title": "Reminder Intervals",
        "description": "Intervals for sending reminders for a scheduled incident (null if not applicable)."
      },
      "postmortem_body": {
        "type": "string",
        "format": "markdown",
        "title": "Postmortem",
        "description": "The content of the postmortem analysis."
      },
      "postmortem_body_last_updated_at": {
        "type": "string",
        "format": "date-time",
        "title": "Postmortem Last Updated At",
        "description": "When the postmortem body was last updated (null if not applicable)."
      },
      "postmortem_ignored": {
        "type": "boolean",
        "title": "Postmortem Ignored",
        "description": "Whether the postmortem has been ignored."
      },
      "postmortem_published_at": {
        "type": "string",
        "format": "date-time",
        "title": "Postmortem Published At",
        "description": "When the postmortem was published (null if not yet published)."
      },
      "postmortem_notified_subscribers": {
        "type": "boolean",
        "title": "Postmortem Notified Subscribers",
        "description": "Whether subscribers were notified about the postmortem."
      },
      "postmortem_notified_twitter": {
        "type": "boolean",
        "title": "Postmortem Notified Twitter",
        "description": "Whether the postmortem was announced on Twitter."
      }
    }
  },
  "calculationProperties": {
    "category": {
      "title": "Category",
      "description": "Category of Incident",
      "calculation": ".properties | .status as $status | if ($status | IN(\"scheduled\", \"in_progress\", \"verifying\", \"completed\")) then \"maintainance\" else \"incident\" end",
      "type": "string",
      "colorized": true,
      "colors": {
        "maintainance": "bronze",
        "incident": "red"
      }
    }
  },
  "relations": {
    "components": {
      "target": "statuspageComponent",
      "required": false,
      "title": "Affected Components",
      "many": true
    },
    "statuspage": {
      "target": "statuspage",
      "required": false,
      "title": "Status Page",
      "many": false
    }
  }
}
```

</details>

<details>
<summary><b>Integration configuration (Click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: incident
    selector:
      query: "true"
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
            components: "[.components[].id]"
            statuspage: .page_id
```

</details>

### Incident Update

<details>
<summary><b>Incident Update blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "statuspageIncidentUpdate",
  "title": "Statuspage Incident Update",
  "icon": "Alert",
  "description": "An update to a Statuspage incident.",
  "schema": {
    "properties": {
      "status": {
        "type": "string",
        "title": "Update Status",
        "enum": [
          "investigating",
          "identified",
          "monitoring",
          "resolved",
          "postmortem",
          "scheduled",
          "in_progress",
          "verifying",
          "completed"
        ],
        "enumColors": {
          "investigating": "blue",
          "identified": "orange",
          "monitoring": "yellow",
          "resolved": "green",
          "postmortem": "purple",
          "scheduled": "lightGray",
          "in_progress": "blue",
          "verifying": "yellow",
          "completed": "green"
        },
        "description": "The status of the incident at the time of the update."
      },
      "body": {
        "type": "string",
        "title": "Update",
        "description": "The message content of the update."
      },
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Created At",
        "description": "When the update was created."
      },
      "displayAt": {
        "type": "string",
        "format": "date-time",
        "title": "Display At",
        "description": "When the update was displayed on the Statuspage."
      },
      "deliverNotifications": {
        "type": "boolean",
        "title": "Deliver Notifications",
        "description": "Whether notifications were sent for this update."
      },
      "wantsTwitterUpdate": {
        "type": "boolean",
        "title": "Wants Twitter Update",
        "description": "Whether a Twitter update was requested."
      },
      "tweet_id": {
        "type": "string",
        "title": "Tweet ID",
        "description": "The ID of the tweet associated with this update (if any)."
      },
      "custom_tweet": {
        "type": "string",
        "title": "Custom Tweet",
        "description": "The custom text used for the tweet (if applicable)."
      }
    }
  },
  "calculationProperties": {
    "category": {
      "title": "Category",
      "description": "Category of Incident",
      "calculation": ".properties | .status as $status | if ($status | IN(\"scheduled\", \"in_progress\", \"verifying\", \"completed\")) then \"maintainance\" else \"incident\" end",
      "type": "string",
      "colorized": true,
      "colors": {
        "maintainance": "bronze",
        "incident": "red"
      }
    }
  },
  "relations": {
    "incident": {
      "target": "statuspageIncident",
      "required": true,
      "title": "Incident",
      "many": false
    },
    "affectedComponents": {
      "target": "statuspageComponent",
      "required": false,
      "title": "Affected Components",
      "many": true
    }
  }
}
```

</details>

<details>
<summary><b>Integration configuration (Click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: incident_update
    selector:
      query: "true"
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
            affectedComponents: "[.affected_components[].code]"
```

</details>

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
  "icon": null,
  "blueprint": "statuspage",
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
  "icon": null,
  "blueprint": "statuspageComponentGroup",
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
  "icon": null,
  "blueprint": "statuspageComponent",
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
  "icon": null,
  "blueprint": "statuspageIncident",
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
  "icon": null,
  "blueprint": "statuspageIncidentUpdate",
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
