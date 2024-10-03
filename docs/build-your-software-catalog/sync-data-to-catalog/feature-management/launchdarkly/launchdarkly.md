---
sidebar_position: 1
title: LaunchDarkly
description: LaunchDarkly integration in Port
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import DockerParameters from "./\_launchdarkly_one_time_docker_parameters.mdx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"

# LaunchDarkly

Our LaunchDarkly integration allows you to import `projects`, `flags`, and `environments` from your LaunchDarkly account into Port, according to your mapping and definition.

A `Project` in LaunchDarkly is a collection of feature flags, targeting rules, and environments that correspond to a specific application or service.

A `Flag` in LaunchDarkly represents a feature flag or toggle, which is a central concept in LaunchDarkly. Flags are used to control the visibility and operational state of features in your software without deploying new code.

An `Environment` within a LaunchDarkly project is a logical separation of feature flag states and configurations, typically corresponding to stages in your development lifecycle.

A `Flag Status` lets you know when a flag is active or inactive.


## Capabilities

- Entity Tracking - See all projects and their associated environments and feature flags.
- Real time Synchronization of Infrastructure - Automatically synchronize projects, feature flags, and environments data from LaunchDarkly into Port for centralized tracking and management.


### Supported Resources

The resources that can be ingested from LaunchDarkly into Port are listed below.  
It is possible to reference any field that appears in the API responses linked below in the mapping configuration.
- [`Project`](https://apidocs.launchdarkly.com/tag/Projects)
- [`Flag`](https://apidocs.launchdarkly.com/tag/Feature-flags)
- [`Environment`](https://apidocs.launchdarkly.com/tag/Environments)
- [`Flag Status`](https://apidocs.launchdarkly.com/tag/Feature-flags#operation/getFeatureFlagStatusAcrossEnvironments)



## Setup

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation/>

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-time (Self-hosted)">

<h2> Prerequisites </h2>

To install the integration, you need a Kubernetes cluster that the integration's container chart will be deployed to.

Please make sure that you have [`kubectl`](https://kubernetes.io/docs/tasks/tools/#kubectl) and [`helm`](https://helm.sh/) installed on your machine, and that your `kubectl` CLI is connected to the Kubernetes cluster where you plan to install the integration.


Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                                | Description                                                                                                   | Required |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------- |
| `port.clientId`                          | Your Port client id                                                                                           | ✅      |
| `port.clientSecret`                      | Your Port client secret                                                                                       | ✅      |
| `port.baseUrl`                | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US | ✅      |
| `integration.identifier`                 | Change the identifier to describe your integration                                                            | ✅      |
| `integration.type`                       | The integration type                                                                                          | ✅      |
| `integration.eventListener.type`         | The event listener type                                                                                       | ✅      |
| `integration.config.launchdarklyHost` | Your LaunchDarkly host. For example https://app.launchdarkly.com for the default endpoint                                                                        | ✅      |
| `integration.config.launchdarklyToken` | The LaunchDarkly API token                                                                           | ✅      |
| `integration.config.appHost`             | Your application's host url                                                                                   | ✅       |
| `scheduledResyncInterval`                | The number of minutes between each resync                                                                     | ❌      |
| `initializePortResources`                | Default true, When set to true the integration will create default blueprints and the port App config Mapping | ❌      |
| `sendRawDataExamples` | Default, true, Enable sending raw data examples from the third part API to port for testing and managing the integration mapping |  ❌   | 

<br/>
<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm">
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install launchdarkly port-labs/port-ocean \
  --set port.clientId="PORT_CLIENT_ID"  \
  --set port.clientSecret="PORT_CLIENT_SECRET"  \
  --set port.baseUrl="https://api.getport.io"  \
  --set initializePortResources=true  \
  --set sendRawDataExamples=true \
  --set integration.identifier="my-launchdarkly-integration"  \
  --set integration.type="launchdarkly"  \
  --set integration.eventListener.type="POLLING"  \
  --set integration.secrets.launchdarklyHost="string" \
  --set integration.secrets.launchdarklyToken="string" \
```

<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

1. Create a `values.yaml` file in `argocd/my-ocean-launchdarkly-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for  `LAUNCHDARKLY_HOST` and `LAUNCHDARKLY_TOKEN`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-launchdarkly-integration
  type: launchdarkly
  eventListener:
    type: POLLING
  secrets:
  // highlight-start
    launchdarklyHost: LAUNCHDARKLY_HOST
    launchdarklyToken: LAUNCHDARKLY_TOKEN
  // highlight-end
```
<br/>

2. Install the `my-ocean-launchdarkly-integration` ArgoCD Application by creating the following `my-ocean-launchdarkly-integration.yaml` manifest:
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
  name: my-ocean-launchdarkly-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-launchdarkly-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-launchdarkly-integration/values.yaml
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
kubectl apply -f my-ocean-launchdarkly-integration.yaml
```
</TabItem>
</Tabs>

<h3>Event listener</h3>

The integration uses polling to pull the configuration from Port every minute and check it for changes. If there is a change, a resync will occur.

</TabItem>


<TabItem value="one-time-ci" label="One-time (CI)">

 <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the LaunchDarkly integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters/>

<br/>

Here is an example for `launchdarkly-integration.yml` workflow file:

```yaml showLineNumbers
name: LaunchDarkly Exporter Workflow

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

    steps:
      - uses: port-labs/ocean-sail@v1
        with: 
          type: "launchdarkly"
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            launchdarkly_host: ${{ secrets.OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_HOST }}
            launchdarkly_token: ${{ secrets.OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_TOKEN }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the LaunchDarkly integration once and then exit, this is useful for **scheduled** ingestion of data.

:::tip
Your Jenkins agent should be able to run docker commands.
:::
:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

Make sure to configure the following [LaunchDarkly Credentials](https://www.jenkins.io/doc/book/using/using-credentials/) of `Secret Text` type:

<DockerParameters/>

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```yml showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run LaunchDarkly Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_HOST', variable: 'OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_HOST'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_TOKEN'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET')
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="launchdarkly"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_HOST=$OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_HOST \
                                -e OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_TOKEN=$OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_TOKEN \
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
    <TabItem value="gitlab" label="GitLab">
This workflow will run the LaunchDarkly integration once and then exit, this is useful for **scheduled** ingestion of data.

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
  INTEGRATION_TYPE: launchdarkly
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
        -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
        -e OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_HOST=$OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_HOST \
        -e OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_TOKEN=$OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_TOKEN \
        -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
        -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $IMAGE_NAME

  rules: # Run only when changes are made to the main branch
    - if: '$CI_COMMIT_BRANCH == "main"'
    - when: manual
```

</TabItem>

  </Tabs>

<PortApiRegionTip/>
</TabItem>

</Tabs>

## Configuration

Port integrations use a [YAML mapping block](/build-your-software-catalog/customize-integrations/configure-mapping#configuration-structure) to ingest data from the third-party api into Port.

The mapping makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from the integration API.




## Examples

To view and test the integration's mapping against examples of the third-party API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

Additional examples of blueprints and the relevant integration configurations:

### Project

<details>
<summary>Project blueprint</summary>

```json showLineNumbers
  {
    "identifier": "launchDarklyProject",
    "description": "This blueprint represents a project in LaunchDarkly.",
    "title": "LaunchDarkly Project",
    "icon": "Launchdarkly",
    "schema": {
      "properties": {
        "tags": {
          "type": "array",
          "title": "Tags",
          "description": "Tags associated with the project for organizational purposes."
        }
      },
      "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {}
  }
```
</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
resources:
  - kind: project
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .key
          title: .name
          blueprint: '"launchDarklyProject"'
          properties:
            tags: .tags
```
</details>

### Feature Flag

<details>
<summary>Feature Flag blueprint</summary>

```json showLineNumbers
  {
    "identifier": "launchDarklyFeatureFlag",
    "description": "This blueprint represents a feature flag in LaunchDarkly.",
    "title": "LaunchDarkly Feature Flag",
    "icon": "Launchdarkly",
    "schema": {
      "properties": {
        "kind": {
          "type": "string",
          "title": "Flag Kind",
          "description": "The type of the feature flag (e.g., boolean)."
        },
        "description": {
          "type": "string",
          "title": "Description",
          "description": "A description of what the flag controls."
        },
        "creationDate": {
          "type": "string",
          "format": "date-time",
          "title": "Creation Date",
          "description": "The date and time when the flag was created."
        },
        "clientSideAvailability": {
          "type": "object",
          "title": "Client-Side Availability",
          "description": "Availability of the flag for client-side applications."
        },
        "temporary": {
          "type": "boolean",
          "title": "Temporary Flag",
          "description": "Indicates if the flag is temporary."
        },
        "tags": {
          "type": "array",
          "title": "Tags",
          "description": "Tags associated with the feature flag."
        },
        "maintainer": {
          "type": "string",
          "title": "Maintainer",
          "description": "Email address of the maintainer of the flag."
        },
        "customProperties": {
          "type": "object",
          "title": "Custom Properties",
          "description": "Custom properties associated with the flag."
        },
        "archived": {
          "type": "boolean",
          "title": "Archived",
          "description": "Indicates if the flag is archived."
        },
        "deprecated": {
          "type": "boolean",
          "title": "Deprecated",
          "description": "Indicates if the flag is deprecated."
        },
        "variations": {
          "type": "array",
          "title": "Variations",
          "description": "An array of possible variations for the flag"
        }
      },
      "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {
      "project": {
        "title": "Project",
        "target": "launchDarklyProject",
        "required": true,
        "many": false
      }
    }
  }
```
</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
- kind: flag
  selector:
    query: "true"
  port:
    entity:
      mappings:
        identifier: .key + "-" + .__projectKey
        title: .name
        blueprint: '"launchDarklyFeatureFlag"'
        properties:
          kind: .kind
          description: .description
          creationDate: .creationDate / 1000 | strftime("%Y-%m-%dT%H:%M:%SZ")
          clientSideAvailability: .clientSideAvailability
          temporary: .temporary
          tags: .tags
          maintainer: ._maintainer.email
          deprecated: .deprecated
          variations: .variations
          customProperties: .customProperties
          archived: .archived
        relations:
          project: .__projectKey
```
</details>

### Environment

<details>
<summary>Environment blueprint</summary>

```json showLineNumbers
{
  "identifier": "launchDarklyEnvironment",
  "description": "This blueprint represents an environment in LaunchDarkly",
  "title": "LaunchDarkly Environment",
  "icon": "Launchdarkly",
  "schema": {
    "properties": {
      "defaultTtl": {
        "type": "number",
        "title": "Default TTL",
        "description": "The default time-to-live (in minutes) for feature flag settings in this environment."
      },
      "secureMode": {
        "type": "boolean",
        "title": "Secure Mode",
        "description": "Indicates whether Secure Mode is enabled for the environment, enhancing security by verifying user tokens."
      },
      "defaultTrackEvents": {
        "type": "boolean",
        "title": "Default Track Events",
        "description": "Indicates whether event tracking is enabled by default for all flags in this environment."
      },
      "requireComments": {
        "type": "boolean",
        "title": "Require Comments",
        "description": "Indicates whether comments are required for changes made in this environment."
      },
      "confirmChanges": {
        "type": "boolean",
        "title": "Confirm Changes",
        "description": "Indicates whether changes need to be confirmed before being applied in this environment."
      },
      "tags": {
        "type": "array",
        "title": "Tags",
        "description": "A list of tags associated with the environment for organizational purposes."
      },
      "critical": {
        "type": "boolean",
        "title": "Critical Environment",
        "description": "Indicates whether this environment is considered critical, which may affect change management and notifications."
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "project": {
      "title": "Project",
      "target": "launchDarklyProject",
      "required": true,
      "many": false
    }
  }
}
```
</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
- kind: environment
  selector:
    query: "true"
  port:
    entity:
      mappings:
        identifier: .key + "-" + .__projectKey
        title: .name
        blueprint: '"launchDarklyEnvironment"'
        properties:
          defaultTtl: .defaultTtl
          secureMode: .secureMode
          defaultTrackEvents: .defaultTrackEvents
          requireComments: .requireComments
          confirmChanges: .confirmChanges
          tags: .tags
          critical: .critical
        relations:
          project: .__projectKey
```
</details>

### Feature Flags In Environment

<details>
<summary>Feature Flags In Environment blueprint</summary>

```json showLineNumbers
{
    "identifier": "launchDarklyFFInEnvironment",
    "description": "This blueprint represents a feature flag in LaunchDarkly Environment.",
    "title": "Feature Flag In Environment",
    "icon": "Launchdarkly",
    "schema": {
      "properties": {
        "status": {
          "type": "string",
          "title": "Status",
          "description": "Status of the feature flag"
        }
      },
      "required": []
    },
    "mirrorProperties": {
      "kind": {
        "title": "Kind",
        "path": "featureFlag.kind"
      },
      "description": {
        "title": "Description",
        "path": "featureFlag.description"
      },
      "deprecated": {
        "title": "Deprecated",
        "path": "featureFlag.deprecated"
      }
    },
    "calculationProperties": {},
    "aggregationProperties": {},
    "relations": {
      "environment": {
        "title": "Environment",
        "target": "launchDarklyEnvironment",
        "required": false,
        "many": false
      },
      "featureFlag": {
        "title": "Feature Flag",
        "target": "launchDarklyFeatureFlag",
        "required": false,
        "many": false
      }
    }
  }
```
</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
- kind: flag-status
  selector:
    query: "true"
  port:
    entity:
      mappings:
        identifier: >-
          . as $root | ._links.self.href | split("/") | last as $last |
          "\($last)-\($root.__environmentKey)"
        title: >-
          . as $root | ._links.self.href | split("/") | last as $last |
          "\($last)-\($root.__environmentKey)"
        blueprint: '"launchDarklyFFInEnvironment"'
        properties:
          status: .name
        relations:
          environment: .__environmentKey + "-" + .__projectKey
          featureFlag: . as $input | $input._links.self.href | split("/") | .[-1] + "-" + $input.__projectKey
```

</details>


## Relevant Guides

- For relevant guides and examples, see the [guides section](https://docs.getport.io/guides?tags=Launchdarkly).
