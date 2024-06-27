---
sidebar_position: 1
title: LaunchDarkly
description: LaunchDarkly integration in Port
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import DockerParameters from "./\_launchdarkly_one_time_docker_parameters.mdx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# LaunchDarkly

Our LaunchDarkly integration allows you to import `projects`, `flags`, and `environments` from your LaunchDarkly account into Port, according to your mapping and definition.

A `Project` in LaunchDarkly is a collection of feature flags, targeting rules, and environments that correspond to a specific application or service.

A `Flag` in LaunchDarkly represents a feature flag or toggle, which is a central concept in LaunchDarkly. Flags are used to control the visibility and operational state of features in your software without deploying new code.

An `Environment` within a LaunchDarkly project is a logical separation of feature flag states and configurations, typically corresponding to stages in your development lifecycle.

A `Flag Status` lets you know when a flag is active or inactive.


### Common use cases

- Entity Tracking - See all projects and their associated environments and feature flags.

- Real time Synchronization of Infrastructure - Automatically synchronize projects, feature flags, and environments data from LaunchDarkly into Port for centralized tracking and management.


## Prerequisites

To install the integration, you need a Kubernetes cluster that the integration's container chart will be deployed to.

Please make sure that you have [`kubectl`](https://kubernetes.io/docs/tasks/tools/#kubectl) and [`helm`](https://helm.sh/) installed on your machine, and that your `kubectl` CLI is connected to the Kubernetes cluster where you plan to install the integration.

## Installation

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-always-on" label="Real Time & Always On" default>

Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                                | Description                                                                                                   | Required |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| `port.clientId`                          | Your Port client id                                                                                           | ✅       |
| `port.clientSecret`                      | Your Port client secret                                                                                       | ✅       |
| `port.baseUrl`                | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US | ✅       |
| `integration.identifier`                 | Change the identifier to describe your integration                                                            | ✅       |
| `integration.type`                       | The integration type                                                                                          | ✅       |
| `integration.eventListener.type`         | The event listener type                                                                                       | ✅       |
| `integration.config.launchdarklyHost` | Your LaunchDarkly host. For example https://app.launchdarkly.com for the default endpoint                                                                        | ✅       |
| `integration.config.launchdarklyToken` | The LaunchDarkly API token                                                                           | ✅       |
| `integration.config.appHost`             | Your application's host url                                                                                   | ❌       |
| `scheduledResyncInterval`                | The number of minutes between each resync                                                                     | ❌       |
| `initializePortResources`                | Default true, When set to true the integration will create default blueprints and the port App config Mapping | ❌       |
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

</TabItem>

<TabItem value="one-time" label="Scheduled">

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

### Event listener

The integration uses polling to pull the configuration from Port every minute and check it for changes. If there is a change, a resync will occur.

## Ingesting LaunchDarkly objects

The LaunchDarkly integration uses a YAML configuration to describe the process of loading data into the developer portal.

Here is an example snippet from the config which demonstrates the process for getting `Projects` from LaunchDarkly:

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

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from LaunchDarkly's API events.

### Configuration structure

The integration configuration determines which resources will be queried from LaunchDarkly, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from LaunchDarkly, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`Project`](https://apidocs.launchdarkly.com/tag/Projects)
- [`Flag`](https://apidocs.launchdarkly.com/tag/Feature-flags)
- [`Environment`](https://apidocs.launchdarkly.com/tag/Environments)
- [`Flag Status`](https://apidocs.launchdarkly.com/tag/Feature-flags#operation/getFeatureFlagStatusAcrossEnvironments)
:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: project
      selector:
      ...
  ```

- The `kind` key is a specifier for a LaunchDarkly object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: project
        selector:
        ...
  ```

- The `port`, `entity` and the `mappings` keys are used to map the LaunchDarkly object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

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

:::tip Blueprint key
Note the value of the `blueprint` key - if you want to use a hardcoded string, you need to encapsulate it in 2 sets of quotes, for example use a pair of single-quotes (`'`) and then another pair of double-quotes (`"`)
:::

### Ingest data into Port

To ingest LaunchDarkly objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using LaunchDarkly.
3. Choose the **Ingest Data** option from the menu.
4. Select LaunchDarkly under the Feature Management category.
5. Add the contents of your [integration configuration](#configuration-structure) to the editor.
6. Click `Resync`.

## Examples

Examples of blueprints and the relevant integration configurations:

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
## Let's Test It

This section includes a sample response data from LaunchDarkly. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from LaunchDarkly:

<details>
<summary> Project response data</summary>

```json showLineNumbers
{
  "_links": {
    "environments": {
      "href": "/api/v2/projects/fourth-project/environments",
      "type": "application/json"
    },
    "flagDefaults": {
      "href": "/api/v2/projects/fourth-project/flag-defaults",
      "type": "application/json"
    },
    "self": {
      "href": "/api/v2/projects/fourth-project",
      "type": "application/json"
    }
  },
  "_id": "666b298cc671e81012b578c6",
  "key": "fourth-project",
  "includeInSnippetByDefault": false,
  "defaultClientSideAvailability": {
    "usingMobileKey": false,
    "usingEnvironmentId": false
  },
  "name": "Fourth Project",
  "tags": []
}
```
</details>


<details>
<summary> Feature Flag response data</summary>

```json showLineNumbers
{
  "_links": {
    "parent": {
      "href": "/api/v2/flags/fourth-project",
      "type": "application/json"
    },
    "self": {
      "href": "/api/v2/flags/fourth-project/randomflag",
      "type": "application/json"
    }
  },
  "_maintainer": {
    "_id": "6669b0f34162860fefd6d724",
    "_links": {
      "self": {
        "href": "/api/v2/members/6669b0f34162860fefd6d724",
        "type": "application/json"
      }
    },
    "email": "example@gmail.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "owner"
  },
  "_version": 1,
  "archived": false,
  "clientSideAvailability": {
    "usingEnvironmentId": false,
    "usingMobileKey": false
  },
  "creationDate": 1718299647527,
  "customProperties": {},
  "defaults": {
    "offVariation": 1,
    "onVariation": 0
  },
  "deprecated": false,
  "description": "",
  "environments": {
    "fourth-env": {
      "_environmentName": "fourth-env",
      "_site": {
        "href": "/fourth-project/fourth-env/features/randomflag",
        "type": "text/html"
      },
      "_summary": {
        "prerequisites": 0,
        "variations": {
          "0": {
            "contextTargets": 0,
            "isFallthrough": true,
            "nullRules": 0,
            "rules": 0,
            "targets": 0
          },
          "1": {
            "contextTargets": 0,
            "isOff": true,
            "nullRules": 0,
            "rules": 0,
            "targets": 0
          }
        }
      },
      "archived": false,
      "lastModified": 1718299647539,
      "on": false,
      "salt": "c713989066a446febf07a42d488221e8",
      "sel": "6d7c3692dd9d4ffa8eee8e2d96b6fd2c",
      "trackEvents": false,
      "trackEventsFallthrough": false,
      "version": 1
    },
    "new-env": {
      "_environmentName": "new env",
      "_site": {
        "href": "/fourth-project/new-env/features/randomflag",
        "type": "text/html"
      },
      "_summary": {
        "prerequisites": 0,
        "variations": {
          "0": {
            "contextTargets": 0,
            "isFallthrough": true,
            "nullRules": 0,
            "rules": 0,
            "targets": 0
          },
          "1": {
            "contextTargets": 0,
            "isOff": true,
            "nullRules": 0,
            "rules": 0,
            "targets": 0
          }
        }
      },
      "archived": false,
      "lastModified": 1718299647539,
      "on": false,
      "salt": "caa436a38411406491f0da9230349bb3",
      "sel": "8bcf1667ab2f4f628fc26ad31966f045",
      "trackEvents": false,
      "trackEventsFallthrough": false,
      "version": 1
    },
    "new-project": {
      "_environmentName": "new_project",
      "_site": {
        "href": "/fourth-project/new-project/features/randomflag",
        "type": "text/html"
      },
      "_summary": {
        "prerequisites": 0,
        "variations": {
          "0": {
            "contextTargets": 0,
            "isFallthrough": true,
            "nullRules": 0,
            "rules": 0,
            "targets": 0
          },
          "1": {
            "contextTargets": 0,
            "isOff": true,
            "nullRules": 0,
            "rules": 0,
            "targets": 0
          }
        }
      },
      "archived": false,
      "lastModified": 1718299647539,
      "on": false,
      "salt": "f79c8849d22d497d8a519fbb6263aeda",
      "sel": "257f0acaf18f4252b40258f8aa93b966",
      "trackEvents": false,
      "trackEventsFallthrough": false,
      "version": 1
    },
    "production": {
      "_environmentName": "Production",
      "_site": {
        "href": "/fourth-project/production/features/randomflag",
        "type": "text/html"
      },
      "_summary": {
        "prerequisites": 0,
        "variations": {
          "0": {
            "contextTargets": 0,
            "isFallthrough": true,
            "nullRules": 0,
            "rules": 0,
            "targets": 0
          },
          "1": {
            "contextTargets": 0,
            "isOff": true,
            "nullRules": 0,
            "rules": 0,
            "targets": 0
          }
        }
      },
      "archived": false,
      "lastModified": 1718299647539,
      "on": false,
      "salt": "28c5efba5fd445d5896a8b9f7f8fbff6",
      "sel": "28a317cdf3aa4d40b8a0b1c6f56be4c9",
      "trackEvents": false,
      "trackEventsFallthrough": false,
      "version": 1
    },
    "shadow": {
      "_environmentName": "shadow",
      "_site": {
        "href": "/fourth-project/shadow/features/randomflag",
        "type": "text/html"
      },
      "_summary": {
        "prerequisites": 0,
        "variations": {
          "0": {
            "contextTargets": 0,
            "isFallthrough": true,
            "nullRules": 0,
            "rules": 0,
            "targets": 0
          },
          "1": {
            "contextTargets": 0,
            "isOff": true,
            "nullRules": 0,
            "rules": 0,
            "targets": 0
          }
        }
      },
      "archived": false,
      "lastModified": 1718311480830,
      "on": false,
      "salt": "cb214aeac84f48d08ff136514c589b11",
      "sel": "00b5f9ae56a547db9c4e5e619bdb39f3",
      "trackEvents": false,
      "trackEventsFallthrough": false,
      "version": 1
    },
    "some-random-env": {
      "_environmentName": "some-random-env",
      "_site": {
        "href": "/fourth-project/some-random-env/features/randomflag",
        "type": "text/html"
      },
      "_summary": {
        "prerequisites": 0,
        "variations": {
          "0": {
            "contextTargets": 0,
            "isFallthrough": true,
            "nullRules": 0,
            "rules": 0,
            "targets": 0
          },
          "1": {
            "contextTargets": 0,
            "isOff": true,
            "nullRules": 0,
            "rules": 0,
            "targets": 0
          }
        }
      },
      "archived": false,
      "lastModified": 1718300514123,
      "on": false,
      "salt": "0618861de85c48a5a77c360db7a8847b",
      "sel": "5ae511fe5630469084453c2c4d45f719",
      "trackEvents": false,
      "trackEventsFallthrough": false,
      "version": 1
    },
    "staging": {
      "_environmentName": "staging",
      "_site": {
        "href": "/fourth-project/staging/features/randomflag",
        "type": "text/html"
      },
      "_summary": {
        "prerequisites": 0,
        "variations": {
          "0": {
            "contextTargets": 0,
            "isFallthrough": true,
            "nullRules": 0,
            "rules": 0,
            "targets": 0
          },
          "1": {
            "contextTargets": 0,
            "isOff": true,
            "nullRules": 0,
            "rules": 0,
            "targets": 0
          }
        }
      },
      "archived": false,
      "lastModified": 1718300902420,
      "on": false,
      "salt": "bc27ddc205984379a4863f5f1323bdb0",
      "sel": "2762811a62734de79277544ff4362f8c",
      "trackEvents": false,
      "trackEventsFallthrough": false,
      "version": 1
    },
    "test": {
      "_environmentName": "Test",
      "_site": {
        "href": "/fourth-project/test/features/randomflag",
        "type": "text/html"
      },
      "_summary": {
        "prerequisites": 0,
        "variations": {
          "0": {
            "contextTargets": 0,
            "isFallthrough": true,
            "nullRules": 0,
            "rules": 0,
            "targets": 0
          },
          "1": {
            "contextTargets": 0,
            "isOff": true,
            "nullRules": 0,
            "rules": 0,
            "targets": 0
          }
        }
      },
      "archived": false,
      "lastModified": 1718299647539,
      "on": false,
      "salt": "fac0fe470f844433986166f3d570415d",
      "sel": "8e8ae9542dc94f35b1ac64c845277d8a",
      "trackEvents": false,
      "trackEventsFallthrough": false,
      "version": 1
    }
  },
  "experiments": {
    "baselineIdx": 0,
    "items": []
  },
  "goalIds": [],
  "includeInSnippet": false,
  "key": "randomflag",
  "kind": "boolean",
  "maintainerId": "6669b0f34162860fefd6d724",
  "name": "randomflag",
  "tags": [],
  "temporary": true,
  "variationJsonSchema": null,
  "variations": [
    {
      "_id": "8868f0d9-8b1d-4575-9436-827188276792",
      "value": true
    },
    {
      "_id": "8929317b-d2aa-479c-9249-e6c0ec5dc415",
      "value": false
    }
  ],
  "__projectKey": "fourth-project"
}
```

</details>

<details>
<summary> Environment response data</summary>

```json showLineNumbers
{
  "_links": {
    "analytics": {
      "href": "https://app.launchdarkly.com/snippet/events/v1/666b2a74cbdbfb108f3fc911.js",
      "type": "text/html"
    },
    "apiKey": {
      "href": "/api/v2/projects/fourth-project/environments/fourth-env/apiKey",
      "type": "application/json"
    },
    "mobileKey": {
      "href": "/api/v2/projects/fourth-project/environments/fourth-env/mobileKey",
      "type": "application/json"
    },
    "self": {
      "href": "/api/v2/projects/fourth-project/environments/fourth-env",
      "type": "application/json"
    },
    "snippet": {
      "href": "https://app.launchdarkly.com/snippet/features/666b2a74cbdbfb108f3fc911.js",
      "type": "text/html"
    }
  },
  "_id": "666b2a74cbdbfb108f3fc911",
  "_pubnub": {
    "channel": "b4f644c56dbbfe88a4028cb2d2142c258926f9b7a9add263d105202f0cd6599c",
    "cipherKey": "9571e2de187881614fe9b6b94d13a99fbdb056e508c9226e6c6bb7d0be117725"
  },
  "key": "fourth-env",
  "name": "fourth-env",
  "apiKey": "sdk-1b3cf928-acae-4553-aab3-c956b7f04219",
  "mobileKey": "mob-87679d8a-698d-4c5f-9ec1-05e368975afe",
  "color": "e2e6ff",
  "defaultTtl": 0,
  "secureMode": false,
  "defaultTrackEvents": false,
  "requireComments": false,
  "confirmChanges": false,
  "tags": [],
  "approvalSettings": {
    "required": false,
    "bypassApprovalsForPendingChanges": false,
    "minNumApprovals": 1,
    "canReviewOwnRequest": false,
    "canApplyDeclinedChanges": true,
    "serviceKind": "launchdarkly",
    "serviceConfig": {},
    "requiredApprovalTags": []
  },
  "critical": false,
  "__projectKey": "fourth-project"
}
```

</details>


<details>
<summary> Feature Flag In Environment response data</summary>

```json showLineNumbers
{
  "_links": {
    "parent": {
      "href": "/api/v2/flags/fourth-project/olulufe",
      "type": "application/json"
    },
    "self": {
      "href": "/api/v2/flag-statuses/fourth-project/shadow/olulufe",
      "type": "application/json"
    }
  },
  "name": "new",
  "lastRequested": null,
  "__environmentKey": "shadow",
  "__projectKey": "fourth-project"
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> Project entity in Port</summary>

```json showLineNumbers
{
  "identifier": "fourth-project",
  "title": "Fourth Project",
  "blueprint": "launchDarklyProject",
  "properties": {
    "tags": []
  },
  "relation": {
    "service": "fourth-project"
  }
}
```
</details>

<details>
<summary> Feature Flag entity in Port</summary>

```json showLineNumbers
{
  "identifier": "randomflag-fourth-project",
  "title": "randomflag",
  "blueprint": "launchDarklyFeatureFlag",
  "properties": {
    "kind": "boolean",
    "description": "",
    "creationDate": "2024-06-13T17:27:27Z",
    "clientSideAvailability": {
      "usingEnvironmentId": false,
      "usingMobileKey": false
    },
    "temporary": true,
    "tags": [],
    "maintainer": "example@gmail.com",
    "deprecated": false,
    "variations": [
      {
        "_id": "8868f0d9-8b1d-4575-9436-827188276792",
        "value": true
      },
      {
        "_id": "8929317b-d2aa-479c-9249-e6c0ec5dc415",
        "value": false
      }
    ],
    "customProperties": {},
    "archived": false
  },
  "relations": {
    "project": "fourth-project"
  }
}
```

</details>

<details>
<summary> Environment entity in Port</summary>

```json showLineNumbers
{
    "identifier": "fourth-env-fourth-project",
    "title": "fourth-env",
    "blueprint": "launchDarklyEnvironment",
    "properties": {
      "defaultTtl": 0,
      "secureMode": false,
      "defaultTrackEvents": false,
      "requireComments": false,
      "confirmChanges": false,
      "tags": [],
      "critical": false
    },
    "relations": {
      "project": "fourth-project"
    }
  }
```

</details>

<details>
<summary> Feature Flag In Environment entity in Port</summary>

```json showLineNumbers
{
    "identifier": "olulufe-shadow",
    "title": "olulufe-shadow",
    "blueprint": "launchDarklyFFInEnvironment",
    "properties": {
      "status": "new"
    },
    "relations": {
      "environment": "shadow-fourth-project",
      "featureFlag": "olulufe-fourth-project"
    }
  }
```
</details>