---
sidebar_position: 1
title: Launchdarkly
description: Launchdarkly integration in Port
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import DockerParameters from "./\_launchdarkly_one_time_docker_parameters.mdx"

# Launchdarkly

Our Launchdarkly integration allows you to import `projects`, `flags`, and `environments` from your Launchdarkly account into Port, according to your mapping and definition.

A `Project` in LaunchDarkly is a collection of feature flags, targeting rules, and environments that correspond to a specific application or service.

A `Flag` in LaunchDarkly represents a feature flag or toggle, which is a central concept in LaunchDarkly. Flags are used to control the visibility and operational state of features in your software without deploying new code.

An `Environment` within a LaunchDarkly project is a logical separation of feature flag states and configurations, typically corresponding to stages in your development lifecycle.


### Common use cases

- Entity Tracking - See all projects and their associated environments and feature flags.

- Real time Synchronization of Infrastructure - Automatically synchronize projects, feature flags, and environments data from Launchdarkly into Port for centralized tracking and management.


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
| `port.baseUrl`                           | Your Port base url, relevant only if not using the default Port app                                           | ❌       |
| `integration.identifier`                 | Change the identifier to describe your integration                                                            | ✅       |
| `integration.type`                       | The integration type                                                                                          | ✅       |
| `integration.eventListener.type`         | The event listener type                                                                                       | ✅       |
| `integration.config.launchdarklyHost` | Your Launchdarkly host. For example https://launchdarkly.com                                                                        | ✅       |
| `integration.config.launchdarklyToken` | The Launchdarkly API token                                                                           | ✅       |
| `integration.config.appHost`             | Your application's host url                                                                                   | ❌       |
| `scheduledResyncInterval`                | The number of minutes between each resync                                                                     | ❌       |
| `initializePortResources`                | Default true, When set to true the integration will create default blueprints and the port App config Mapping | ❌       |

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
	--set integration.identifier="my-launchdarkly-integration"  \
	--set integration.type="launchdarkly"  \
	--set integration.eventListener.type="POLLING"  \
  --set integration.secrets.launchdarklyHost="string" \
	--set integration.secrets.launchdarklyToken="string" \
```
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

</details>
<br/>

3. Apply your application manifest with `kubectl`:
```bash
kubectl apply -f my-ocean-launchdarkly-integration.yaml
```
</TabItem>
</Tabs>

</TabItem>

<TabItem value="one-time" label="Scheduled">

 <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the Launchdarkly integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters/>

<br/>

Here is an example for `launchdarkly-integration.yml` workflow file:

```yaml showLineNumbers
name: Launchdarkly Exporter Workflow

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
          config: |
            launchdarkly_host: ${{ secrets.OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_HOST }}
            launchdarkly_token: ${{ secrets.OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_TOKEN }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the Launchdarkly integration once and then exit, this is useful for **scheduled** ingestion of data.

:::tip
Your Jenkins agent should be able to run docker commands.
:::
:::warning
If you want the integration to update Port in real time using webhooks you should use the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
:::

Make sure to configure the following [Launchdarkly Credentials](https://www.jenkins.io/doc/book/using/using-credentials/) of `Secret Text` type:

<DockerParameters/>

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```yml showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run Launchdarkly Integration') {
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
                                -e OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_HOST=$OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_HOST \
                                -e OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_TOKEN=$OCEAN__INTEGRATION__CONFIG__LAUNCHDARKLY_TOKEN \
                                -e OCEAN__PORT__CLIENT_ID=$OCEAN__PORT__CLIENT_ID \
                                -e OCEAN__PORT__CLIENT_SECRET=$OCEAN__PORT__CLIENT_SECRET \
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
  </Tabs>
</TabItem>

</Tabs>

### Event listener

The integration uses polling to pull the configuration from Port every minute and check it for changes. If there is a change, a resync will occur.

## Ingesting Launchdarkly objects

The Launchdarkly integration uses a YAML configuration to describe the process of loading data into the developer portal.

Here is an example snippet from the config which demonstrates the process for getting `Projects` from Launchdarkly:

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

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify, concatenate, transform and perform other operations on existing fields and values from Launchdarkly's API events.

### Configuration structure

The integration configuration determines which resources will be queried from Launchdarkly, and which entities and properties will be created in Port.

:::tip Supported resources
The following resources can be used to map data from Launchdarkly, it is possible to reference any field that appears in the API responses linked below for the mapping configuration.

- [`Project`](https://apidocs.launchdarkly.com/tag/Projects)
- [`Flag`](https://apidocs.launchdarkly.com/tag/Feature-flags)
- [`Environment`](https://apidocs.launchdarkly.com/tag/Environments)

:::

- The root key of the integration configuration is the `resources` key:

  ```yaml showLineNumbers
  # highlight-next-line
  resources:
    - kind: project
      selector:
      ...
  ```

- The `kind` key is a specifier for a Launchdarkly object:

  ```yaml showLineNumbers
    resources:
      # highlight-next-line
      - kind: project
        selector:
        ...
  ```

- The `port`, `entity` and the `mappings` keys are used to map the Launchdarkly object fields to Port entities. To create multiple mappings of the same kind, you can add another item in the `resources` array;

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

To ingest Launchdarkly objects using the [integration configuration](#configuration-structure), you can follow the steps below:

1. Go to the DevPortal Builder page.
2. Select a blueprint you want to ingest using Launchdarkly.
3. Choose the **Ingest Data** option from the menu.
4. Select Launchdarkly under the Feature Management category.
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
          identifier: .key
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
          identifier: .key
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
    "identifier": "featureFlagInEnvironment",
    "description": "This blueprint represents a feature flag in LaunchDarkly Environment.",
    "title": "Feature Flag In Environment",
    "icon": "Launchdarkly",
    "schema": {
      "properties": {},
      "required": []
    },
    "mirrorProperties": {},
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
  - kind: flag
    selector:
      query: "true"
    port:
      itemsToParse: .environments | keys
      entity:
        mappings:
          identifier: .key + "-" + .item
          title: .key + "-" + .item
          blueprint: '"featureFlagInEnvironment"'
          properties: {}
          relations:
            environment: .item
            featureFlag: .key
```

</details>

## Let's Test It

This section includes a sample response data from Launchdarkly. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Launchdarkly:

<details>
<summary> Project response data</summary>

```json showLineNumbers
{
    "_links":{
        "environments":{
          "href":"/api/v2/projects/port-key-123ijk/environments",
          "type":"application/json"
        },
        "flagDefaults":{
          "href":"/api/v2/projects/port-key-123ijk/flag-defaults",
          "type":"application/json"
        },
        "self":{
          "href":"/api/v2/projects/port-key-123ijk",
          "type":"application/json"
        }
    },
    "_id":"65ac6a4c68025d0f31dff3f1",
    "key":"port-key-123ijk",
    "includeInSnippetByDefault":false,
    "defaultClientSideAvailability":{
        "usingMobileKey":true,
        "usingEnvironmentId":false
    },
    "name":"My Project",
    "tags":[

    ]
   }
```
</details>


<details>
<summary> Feature Flag response data</summary>

```json showLineNumbers
{
  "_links":{
      "parent":{
        "href":"/api/v2/flags/default",
        "type":"application/json"
      },
      "self":{
        "href":"/api/v2/flags/default/Test-Flag",
        "type":"application/json"
      }
  },
  "_maintainer":{
      "_id":"65ac52faf4f907102dbb3771",
      "_links":{
        "self":{
            "href":"/api/v2/members/65ac52faf4f907102dbb3771",
            "type":"application/json"
        }
      },
      "email":"example@gmail.com",
      "firstName":"John",
      "lastName":"Doe",
      "role":"owner"
  },
  "_version":1,
  "archived":false,
  "clientSideAvailability":{
      "usingEnvironmentId":true,
      "usingMobileKey":true
  },
  "creationDate":1706601373272,
  "customProperties":{
      
  },
  "defaults":{
      "offVariation":1,
      "onVariation":0
  },
  "deprecated":false,
  "description":"Just a test feature flag for port integration",
  "environments":{
      "production":{
        "_environmentName":"Production",
        "_site":{
            "href":"/default/production/features/Test-Flag",
            "type":"text/html"
        },
        "_summary":{
            "prerequisites":0,
            "variations":{
              "0":{
                  "contextTargets":0,
                  "isFallthrough":true,
                  "nullRules":0,
                  "rules":0,
                  "targets":0
              },
              "1":{
                  "contextTargets":0,
                  "isOff":true,
                  "nullRules":0,
                  "rules":0,
                  "targets":0
              }
            }
        },
        "archived":false,
        "lastModified":1706601373293,
        "on":false,
        "salt":"ae374e0759e24a99adb77423ec5ca63d",
        "sel":"11e557fa46f944d1a2d7cbdb3ab1e7ee",
        "trackEvents":false,
        "trackEventsFallthrough":false,
        "version":1
      },
      "test":{
        "_environmentName":"Test",
        "_site":{
            "href":"/default/test/features/Test-Flag",
            "type":"text/html"
        },
        "_summary":{
            "prerequisites":0,
            "variations":{
              "0":{
                  "contextTargets":0,
                  "isFallthrough":true,
                  "nullRules":0,
                  "rules":0,
                  "targets":0
              },
              "1":{
                  "contextTargets":0,
                  "isOff":true,
                  "nullRules":0,
                  "rules":0,
                  "targets":0
              }
            }
        },
        "archived":false,
        "lastModified":1707303521285,
        "on":true,
        "salt":"01531d4d3bb34f8590a3fc61a75153fe",
        "sel":"e18ca179630444809dbf6b1044f24b65",
        "trackEvents":false,
        "trackEventsFallthrough":false,
        "version":4
      }
  },
  "experiments":{
      "baselineIdx":0,
      "items":[
        
      ]
  },
  "goalIds":[
      
  ],
  "includeInSnippet":true,
  "key":"Test-Flag",
  "kind":"boolean",
  "maintainerId":"65ac52faf4f907102dbb3771",
  "name":"Test-Flag",
  "tags":[
      
  ],
  "temporary":true,
  "variationJsonSchema":"None",
  "variations":[
      {
        "_id":"f5fe4ee4-9375-444f-81ae-ae0fd005614c",
        "name":"Port-1",
        "value":true
      },
      {
        "_id":"580ffaa4-25df-4993-b19d-271acbeff35d",
        "value":false
      }
  ],
  "__projectKey":"default"
}
```

</details>

<details>
<summary> Environment response data</summary>

```json showLineNumbers
{
  "_links":{
      "analytics":{
        "href":"https://app.launchdarkly.com/snippet/events/v1/65ac65a23cf13e0f705afb2f.js",
        "type":"text/html"
      },
      "apiKey":{
        "href":"/api/v2/projects/project-key-123abc/environments/test/apiKey",
        "type":"application/json"
      },
      "mobileKey":{
        "href":"/api/v2/projects/project-key-123abc/environments/test/mobileKey",
        "type":"application/json"
      },
      "self":{
        "href":"/api/v2/projects/project-key-123abc/environments/test",
        "type":"application/json"
      },
      "snippet":{
        "href":"https://app.launchdarkly.com/snippet/features/65ac65a23cf13e0f705afb2f.js",
        "type":"text/html"
      }
  },
  "_id":"65ac65a23cf13e0f705afb2f",
  "_pubnub":{
      "channel":"2eba06aa9ab08f3990f8b05a36b7e7c4a4165348d8993c89572f2ea4885bc148",
      "cipherKey":"2a8a255c63429ee5fc184e1be9c848fa2ced221665aa261dc66683f0227bc085"
  },
  "key":"test",
  "name":"Test",
  "apiKey":"sdk-d2e62422-4348-4302-8160-************",
  "mobileKey":"mob-69006494-96b9-486b-a5cb-1d9dbbd6ae9d",
  "color":"EBFF38",
  "defaultTtl":0,
  "secureMode":false,
  "defaultTrackEvents":false,
  "requireComments":false,
  "confirmChanges":false,
  "tags":[
      
  ],
  "approvalSettings":{
      "required":false,
      "bypassApprovalsForPendingChanges":false,
      "minNumApprovals":1,
      "canReviewOwnRequest":false,
      "canApplyDeclinedChanges":true,
      "serviceKind":"launchdarkly",
      "serviceConfig":{
        
      },
      "requiredApprovalTags":[
        
      ]
  },
  "critical":false,
  "__projectKey":"project-key-123abc"
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> Project entity in Port</summary>

```json showLineNumbers
{
  "identifier": "port-key-123ijk",
  "title": "My Project",
  "team": [],
  "properties": {
    "tags": [],
    "link": "https://app.launchdarkly.com/api/v2/projects/port-key-123ijk"
  },
  "relations": {},
  "icon": "Launchdarkly"
}
```
</details>

<details>
<summary> Feature Flag entity in Port</summary>

```json showLineNumbers
{
  "identifier": "Test-Flag",
  "title": "Test-Flag",
  "team": [],
  "properties": {
    "kind": "boolean",
    "description": "Just a test feature flag for port integration",
    "creationDate": "2024-01-30T07:56:13Z",
    "clientSideAvailability": {
      "usingEnvironmentId": true,
      "usingMobileKey": true
    },
    "temporary": true,
    "tags": [],
    "maintainer": "mikeyarmah@gmail.com",
    "customProperties": {},
    "archived": false,
    "variations": [
      {
        "_id": "f5fe4ee4-9375-444f-81ae-ae0fd005614c",
        "name": "Port-1",
        "value": true
      },
      {
        "_id": "580ffaa4-25df-4993-b19d-271acbeff35d",
        "value": false
      }
    ],
    "deprecated": false
  },
  "relations": {
    "environments": [
      "production",
      "test"
    ]
  },
  "icon": "Launchdarkly"
}
```

</details>

<details>
<summary> Environment entity in Port</summary>

```json showLineNumbers
{
  "identifier": "test",
  "title": "Test",
  "team": [],
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
    "project": "default"
  },
  "icon": "Launchdarkly"
}
```

</details>
