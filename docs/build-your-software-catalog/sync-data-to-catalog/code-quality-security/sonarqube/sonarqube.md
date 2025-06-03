import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import HelmPrerequisites from "../../templates/\_ocean_helm_prerequisites_block.mdx"
import HelmParameters from "../../templates/\_ocean-advanced-parameters-helm.mdx"
import ResourceMapping from "../../templates/\_resource-mapping.mdx"
import DockerParameters from "../\_docker-parameters.mdx"
import SupportedResources from "../\_supported-resources.mdx"
import AdvancedConfig from '../../../../generalTemplates/\_ocean_advanced_configuration_note.md'
import SonarcloudAnalysisBlueprint from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/sonarqube/\_example_sonarcloud_analysis_blueprint.mdx";
import SonarcloudAnalysisConfiguration from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/sonarqube/\_example_sonarcloud_analysis_configuration.mdx";
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"


# SonarQube

Port's SonarQube integration allows you to model SonarQube resources in your software catalog and ingest data into them.


## Overview

This integration allows you to:

- Map and organize your desired SonarQube resources and their metadata in Port (see supported resources below).
- Watch for SonarQube object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.

## BaseUrl & Webhook Configuration

:::warning AppHost deprecation
**`integration.config.appHost` is deprecated**: Please use `baseUrl` for webhook URL settings instead.
:::


The `baseUrl` parameter enables real-time updates from SonarQube to Port. If not provided:
- The integration will still function normally
- You'll need to use [`scheduledResyncInterval`](https://ocean.getport.io/develop-an-integration/integration-configuration/#scheduledresyncinterval---run-scheduled-resync) for updates
- Manual resyncs can be triggered via Port's UI

The `integration.secrets.webhookSecret` parameter secures your webhooks. If not provided, the integration will process webhooks without validating the source of the events

### Supported Resources

The resources that can be ingested from SonarQube into Port are listed below. It is possible to reference any field that appears in the API responses linked below in the mapping configuration.


- [`Project`](https://next.sonarqube.com/sonarqube/web_api/api/projects/search) - represents a SonarQube project. Retrieves data
  from [`components`](https://next.sonarqube.com/sonarqube/web_api/api/components), [`measures`](https://next.sonarqube.com/sonarqube/web_api/api/measures),
  and [`branches`](https://next.sonarqube.com/sonarqube/web_api/api/project_branches).
- [`Issue`](https://next.sonarqube.com/sonarqube/web_api/api/issues) -  represents a SonarQube issue
- `Saas Analysis` - represents analysis and latest activity in your SonarCloud environment.
- `On-premise Analysis` - since SonarQube doesn't offer a straightforward API
  for fetching analysis and latest activity in on-premise installations,
  Port's integration provides an alternative solution for on-premise installation.  
By utilizing the [pull requests](https://next.sonarqube.com/sonarqube/web_api/api/project_pull_requests) and [measures](https://next.sonarqube.com/sonarqube/web_api/api/measures) APIs,
  you can now visualize the results of scan analyses for each pull request.


## Setup

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation integration="SonarQube"/>

</TabItem>

<TabItem value="real-time-self-hosted" label="Rea-time (self-hosted)">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

<h2> Prerequisites </h2>

<HelmPrerequisites />

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>

<OceanRealtimeInstallation integration="Sonarqube" />

<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-sonarqube-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `MY_ORG_KEY`, `IS_ON_PREMISE`, and `MY_API_TOKEN`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-sonarqube-integration
  type: sonarqube
  eventListener:
    type: POLLING
  config:
  // highlight-start
    sonarOrganizationId: MY_ORG_KEY
    sonarIsOnPremise: IS_ON_PREMISE
  // highlight-end
  secrets:
  // highlight-next-line
    sonarApiToken: MY_API_TOKEN
```
<br/>

2. Install the `my-ocean-sonarqube-integration` ArgoCD Application by creating the following `my-ocean-sonarqube-integration.yaml` manifest:
:::note
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.

Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).
:::

<details>
  <summary><b>ArgoCD Application (Click to expand)</b></summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-ocean-sonarqube-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-sonarqube-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-sonarqube-integration/values.yaml
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
kubectl apply -f my-ocean-sonarqube-integration.yaml
```
</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.

| Parameter                                | Description                                                                                                                                                                                  | Example                          | Required |
|------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|----------|
| `port.clientId`                          | Your port client id ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))                                   |                                  | ✅        |
| `port.clientSecret`                      | Your port client secret ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))                               |                                  | ✅        |
| `port.baseUrl`                           | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                      |                                  | ✅        |
| `integration.secrets.sonarApiToken`      | The [SonarQube API token](https://docs.sonarsource.com/sonarqube/9.8/user-guide/user-account/generating-and-using-tokens/#generating-a-token)                                                |                                  | ✅        |
| `integration.config.sonarOrganizationId` | The SonarQube [organization Key](https://docs.sonarsource.com/sonarcloud/appendices/project-information/#project-and-organization-keys) (Not required when using on-prem sonarqube instance) | myOrganization                   | ✅        |
| `integration.config.sonarIsOnPremise`    | A boolean value indicating whether the SonarQube instance is on-premise. The default value is `false`                                                                                        | false                            | ✅        |
| `baseUrl`             | A URL bounded to the integration container that can be accessed by sonarqube. When used the integration will create webhooks on top of sonarqube to listen to any live changes in the data   | https://my-ocean-integration.com | ❌         |
| `integration.config.sonarUrl`            | Required if using **On-Prem**, Your SonarQube instance URL                                                                                                                                   | https://my-sonar-instance.com    | ❌        |
| `integration.secrets.webhookSecret`    | A secret token used to secure webhooks between SonarQube and the integration.                                                                  |         | ❌ |

<HelmParameters />

<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the SonarQube integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time using webhooks you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option.
:::

  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">

Make sure to configure the
following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `sonarqube-integration.yml` workflow file:

```yaml showLineNumbers
name: SonarQube Exporter Workflow

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
          type: 'sonarqube'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            sonar_api_token: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SONAR_API_TOKEN }}
            sonar_organization_id: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SONAR_ORGANIZATION_ID }}
            sonar_is_on_premise: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SONAR_IS_ON_PREMISE }}
            sonar_url: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SONAR_URL }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">

:::tip
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
        stage('Run SonarQube Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__SONAR_API_TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__SONAR_API_TOKEN'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__SONAR_ORGANIZATION_ID', variable: 'OCEAN__INTEGRATION__CONFIG__SONAR_ORGANIZATION_ID'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__SONAR_IS_ON_PREMISE', variable: 'OCEAN__INTEGRATION__CONFIG__SONAR_IS_ON_PREMISE'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="sonarqube"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__SONAR_API_TOKEN=$OCEAN__INTEGRATION__CONFIG__SONAR_API_TOKEN \
                                -e OCEAN__INTEGRATION__CONFIG__SONAR_ORGANIZATION_ID=$OCEAN__INTEGRATION__CONFIG__SONAR_ORGANIZATION_ID \
                                -e OCEAN__INTEGRATION__CONFIG__SONAR_IS_ON_PREMISE=$OCEAN__INTEGRATION__CONFIG__SONAR_IS_ON_PREMISE \
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

:::tip
Your Azure Devops agent should be able to run docker commands.
:::


Make sure to configure the following variables using [Azure Devops variable groups](https://learn.microsoft.com/en-us/azure/devops/pipelines/library/variable-groups?view=azure-devops&tabs=yaml). Add them into in a variable group named `port-ocean-credentials`:

<DockerParameters />

<br/>

Here is an example for `sonar-integration.yml` pipeline file:

```yaml showLineNumbers
trigger:
- main

pool:
  vmImage: "ubuntu-latest"

variables:
  - group: port-ocean-credentials


steps:
- script: |
    echo Add other tasks to build, test, and deploy your project.
    # Set Docker image and run the container
    integration_type="sonarqube"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm \
    -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
    -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
    -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
    -e OCEAN__INTEGRATION__CONFIG__SONAR_API_TOKEN=$(OCEAN__INTEGRATION__CONFIG__SONAR_API_TOKEN) \
    -e OCEAN__INTEGRATION__CONFIG__SONAR_ORGANIZATION_ID=$(OCEAN__INTEGRATION__CONFIG__SONAR_ORGANIZATION_ID) \
    -e OCEAN__INTEGRATION__CONFIG__SONAR_IS_ON_PREMISE=$(OCEAN__INTEGRATION__CONFIG__SONAR_IS_ON_PREMISE) \
    -e OCEAN__INTEGRATION__CONFIG__SONAR_URL=$(OCEAN__INTEGRATION__CONFIG__SONAR_URL) \
    -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
    -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
    -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
    $image_name

    exit $?
  displayName: 'Ingest SonarQube Data into Port'

```

  </TabItem>
<TabItem value="gitlab" label="GitLab">


Make sure to [configure the following GitLab variables](https://docs.gitlab.com/ee/ci/variables/#for-a-project):

<DockerParameters />

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
  INTEGRATION_TYPE: sonarqube
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
        -e OCEAN__INTEGRATION__CONFIG__SONAR_API_TOKEN=$OCEAN__INTEGRATION__CONFIG__SONAR_API_TOKEN \
        -e OCEAN__INTEGRATION__CONFIG__SONAR_ORGANIZATION_ID=$OCEAN__INTEGRATION__CONFIG__SONAR_ORGANIZATION_ID \
        -e OCEAN__INTEGRATION__CONFIG__SONAR_IS_ON_PREMISE=$OCEAN__INTEGRATION__CONFIG__SONAR_IS_ON_PREMISE \
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
deleteDependentEntities: true
createMissingRelatedEntities: true
enableMergeEntity: true
resources:
- kind: projects_ga
  selector:
    query: 'true'
    apiFilters:
      qualifier:
      - TRK
    metrics:
    - code_smells
    - coverage
    - bugs
    - vulnerabilities
    - duplicated_files
    - security_hotspots
    - new_violations
    - new_coverage
    - new_duplicated_lines_density
  port:
    entity:
      mappings:
        identifier: .key
        title: .name
        blueprint: '"sonarQubeProject"'
        properties:
          organization: .organization
          link: .__link
          qualityGateStatus: .__branch.status.qualityGateStatus
          lastAnalysisDate: .analysisDate
          numberOfBugs: .__measures[]? | select(.metric == "bugs") | .value
          numberOfCodeSmells: .__measures[]? | select(.metric == "code_smells") | .value
          numberOfVulnerabilities: .__measures[]? | select(.metric == "vulnerabilities") | .value
          numberOfHotSpots: .__measures[]? | select(.metric == "security_hotspots") | .value
          numberOfDuplications: .__measures[]? | select(.metric == "duplicated_files") | .value
          coverage: .__measures[]? | select(.metric == "coverage") | .value
          mainBranch: .__branch.name
          revision: .revision
          managed: .managed
        relations:
          group: '"all_teams"'
- kind: issues
  selector:
    query: 'true'
    apiFilters:
      resolved: 'false'
    projectApiFilters: {}
  port:
    entity:
      mappings:
        identifier: .key
        title: .message
        blueprint: '"sonarQubeIssue"'
        properties:
          type: .type
          severity: .severity
          link: .__link
          status: .status
          assignees: .assignee
          tags: .tags
          createdAt: .creationDate
        relations:
          sonarQubeProject: .project
```

</details>





## Examples

To view and test the integration's mapping against examples of the third-party API responses,
use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources).
Find the integration in the list of data sources and click on it to open the playground.

Examples of blueprints and the relevant integration configurations can be found on the sonarqube [examples page](examples.md)



## Let's Test It

This section includes a sample response data from SonarQube when a code repository is scanned for quality assurance. In
addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous
section.

### Payload

Here is an example of the payload structure from SonarQube:

<details>
<summary><b>Project response data (Click to expand)</b></summary>

```json showLineNumbers
{
  "organization": "peygis",
  "key": "PeyGis_Chatbot_For_Social_Media_Transaction",
  "name": "Chatbot_For_Social_Media_Transaction",
  "isFavorite": true,
  "visibility": "public",
  "eligibilityStatus": "COMPLETED",
  "eligible": true,
  "isNew": false,
  "lastAnalysisDate": "2017-03-02T15:21:47+0300",
  "revision": "7be96a94ac0c95a61ee6ee0ef9c6f808d386a355",
  "managed": false,
  "__measures": [
    {
      "metric": "bugs",
      "value": "6",
      "bestValue": false
    },
    {
      "metric": "code_smells",
      "value": "216",
      "bestValue": false
    },
    {
      "metric": "duplicated_files",
      "value": "2",
      "bestValue": false
    },
    {
      "metric": "vulnerabilities",
      "value": "1",
      "bestValue": false
    },
    {
      "metric": "security_hotspots",
      "value": "8",
      "bestValue": false
    }
  ],
  "__branch": {
    "name": "master",
    "isMain": true,
    "type": "LONG",
    "status": {
      "qualityGateStatus": "ERROR",
      "bugs": 6,
      "vulnerabilities": 1,
      "codeSmells": 216
    },
    "analysisDate": "2023-09-07T14:38:41+0200",
    "commit": {
      "sha": "5b01b6dcb200df0bfd1c66df65be30f9ea5423d8",
      "author": {
        "name": "Username",
        "login": "Username@github",
        "avatar": "9df2ac1caa70b0a67ff0561f7d0363e5"
      },
      "date": "2023-09-07T14:38:36+0200",
      "message": "Merge pull request #21 from PeyGis/test-sonar"
    }
  },
  "__link": "https://sonarcloud.io/project/overview?id=PeyGis_Chatbot_For_Social_Media_Transaction"
}
```

</details>

<details>
<summary><b>Issue response data (Click to expand)</b></summary>

```json showLineNumbers
{
  "key": "AYhnRlhI0rLhE5EBPGHW",
  "rule": "xml:S1135",
  "severity": "INFO",
  "component": "PeyGis_Chatbot_For_Social_Media_Transaction:node_modules/json-schema/draft-zyp-json-schema-04.xml",
  "project": "PeyGis_Chatbot_For_Social_Media_Transaction",
  "line": 313,
  "hash": "8346d5371c3d1b0d1d57937c7b967090",
  "textRange": {
    "startLine": 313,
    "endLine": 313,
    "startOffset": 3,
    "endOffset": 56
  },
  "flows": [],
  "status": "OPEN",
  "message": "Complete the task associated to this \"TODO\" comment.",
  "effort": "0min",
  "debt": "0min",
  "assignee": "Username@github",
  "author": "email@gmail.com",
  "tags": [],
  "creationDate": "2018-04-06T02:44:46+0200",
  "updateDate": "2023-05-29T13:30:14+0200",
  "type": "CODE_SMELL",
  "organization": "peygis",
  "cleanCodeAttribute": "COMPLETE",
  "cleanCodeAttributeCategory": "INTENTIONAL",
  "impacts": [
    {
      "softwareQuality": "MAINTAINABILITY",
      "severity": "LOW"
    }
  ],
  "__link": "https://sonarcloud.io/project/issues?open=AYhnRlhI0rLhE5EBPGHW&id=PeyGis_Chatbot_For_Social_Media_Transaction"
}
```

</details>

<details>
<summary><b>Analysis response data (Click to expand)</b></summary>

```json showLineNumbers
{
  "analysisId": "AYpvptJNv89mE9ClYP-q",
  "firstAnalysis": false,
  "measures": {
    "violations_added": "0",
    "violations_fixed": "0",
    "coverage_change": "0.0",
    "duplicated_lines_density_change": "0.0",
    "ncloc_change": "0"
  },
  "branch": {
    "analysisDate": "2023-09-07T12:38:41.279Z",
    "isMain": true,
    "name": "master",
    "commit": {
      "sha": "5b01b6dcb200df0bfd1c66df65be30f9ea5423d8",
      "author": {
        "avatar": "9df2ac1caa70b0a67ff0561f7d0363e5",
        "login": "Username@github",
        "name": "Username"
      },
      "date": "2023-09-07T12:38:36Z",
      "message": "Merge pull request #21 from PeyGis/test-sonar"
    },
    "type": "LONG",
    "status": {
      "qualityGateStatus": "ERROR"
    }
  },
  "__branchName": "master",
  "__analysisDate": "2023-09-07T12:38:41.279Z",
  "__commit": {
    "sha": "5b01b6dcb200df0bfd1c66df65be30f9ea5423d8",
    "author": {
      "avatar": "9df2ac1caa70b0a67ff0561f7d0363e5",
      "login": "Username@github",
      "name": "Username"
    },
    "date": "2023-09-07T12:38:36Z",
    "message": "Merge pull request #21 from PeyGis/test-sonar"
  },
  "__project": "PeyGis_Chatbot_For_Social_Media_Transaction"
}
```

</details>

<details>
<summary><b>Portfolio response data (Click to expand)</b></summary>

```json showLineNumbers
{
  "key": "GetPort_SelfService",
  "name": "GetPort SelfService",
  "desc": "Test",
  "qualifier": "VW",
  "visibility": "public",
  "selectionMode": "NONE",
  "subViews": [
    {
      "key": "GetPort_SelfService_Second",
      "name": "GetPort SelfService Second",
      "qualifier": "SVW",
      "selectionMode": "NONE",
      "subViews": [
        {
          "key": "GetPort_SelfService_Third",
          "name": "GetPort SelfService Third",
          "qualifier": "SVW",
          "selectionMode": "NONE",
          "subViews": [],
          "referencedBy": []
        },
        {
          "key": "Port_Test",
          "name": "Port Test",
          "qualifier": "SVW",
          "selectionMode": "NONE",
          "subViews": [],
          "referencedBy": []
        }
      ],
      "referencedBy": []
    },
    {
      "key": "Python",
      "name": "Python",
      "qualifier": "SVW",
      "selectionMode": "NONE",
      "subViews": [
        {
          "key": "Time",
          "name": "Time",
          "qualifier": "SVW",
          "selectionMode": "NONE",
          "subViews": [
            {
              "key": "port_ayodeji",
              "name": "port-ayodeji",
              "qualifier": "SVW",
              "selectionMode": "NONE",
              "subViews": [
                {
                  "key": "port_ayodeji:REferenced",
                  "name": "REferenced",
                  "qualifier": "VW",
                  "visibility": "public",
                  "originalKey": "REferenced"
                }
              ],
              "referencedBy": []
            }
          ],
          "referencedBy": []
        }
      ],
      "referencedBy": []
    },
    {
      "key": "GetPort_SelfService:Authentication_Application",
      "name": "Authentication Application",
      "desc": "For auth services",
      "qualifier": "APP",
      "visibility": "private",
      "selectedBranches": [
        "main"
      ],
      "originalKey": "Authentication_Application"
    }
  ],
  "referencedBy": [
    {
      "key": "GetPort_SelfService:Authentication_Application",
      "name": "Authentication Application",
      "desc": "For auth services",
      "qualifier": "VW",
      "visibility": "private",
      "selectedBranches": [
        "main"
      ],
      "originalKey": "Authentication_Application"
    }
  ]
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary><b>Project entity in Port (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "PeyGis_Chatbot_For_Social_Media_Transaction",
  "title": "Chatbot_For_Social_Media_Transaction",
  "blueprint": "sonarQubeProject",
  "team": [],
  "properties": {
    "organization": "peygis",
    "link": "https://sonarcloud.io/project/overview?id=PeyGis_Chatbot_For_Social_Media_Transaction",
    "lastAnalysisDate": "2023-09-07T12:38:41.000Z",
    "numberOfBugs": 6,
    "numberOfCodeSmells": 216,
    "numberOfVulnerabilities": 1,
    "numberOfHotSpots": 8,
    "numberOfDuplications": 2,
    "mainBranch": "master",
    "mainBranchLastAnalysisDate": "2023-09-07T12:38:41.000Z",
    "revision": "7be96a94ac0c95a61ee6ee0ef9c6f808d386a355",
    "managed": true
  },
  "relations": {},
  "icon": "sonarqube"
}
```

</details>

<details>
<summary><b>Issue entity in Port (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "AYhnRlhI0rLhE5EBPGHW",
  "title": "Complete the task associated to this \"TODO\" comment.",
  "blueprint": "sonarQubeIssue",
  "team": [],
  "properties": {
    "type": "CODE_SMELL",
    "severity": "INFO",
    "link": "https://sonarcloud.io/project/issues?open=AYhnRlhI0rLhE5EBPGHW&id=PeyGis_Chatbot_For_Social_Media_Transaction",
    "status": "OPEN",
    "assignees": "Username@github",
    "tags": [],
    "createdAt": "2018-04-06T00:44:46.000Z"
  },
  "relations": {
    "sonarQubeProject": "PeyGis_Chatbot_For_Social_Media_Transaction"
  },
  "icon": "sonarqube"
}
```

</details>

<details>
<summary><b>Analysis entity in Port (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "AYpvptJNv89mE9ClYP-q",
  "title": "Merge pull request #21 from PeyGis/test-sonar",
  "blueprint": "sonarQubeAnalysis",
  "team": [],
  "properties": {
    "branch": "master",
    "fixedIssues": 0,
    "newIssues": 0,
    "coverage": 0,
    "duplications": 0,
    "createdAt": "2023-09-07T12:38:41.279Z"
  },
  "relations": {
    "sonarQubeProject": "PeyGis_Chatbot_For_Social_Media_Transaction"
  },
  "icon": "sonarqube"
}
```

</details>

<details>
<summary><b>Portfolio entity in Port (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "GetPort_SelfService",
  "title": "GetPort SelfService",
  "blueprint": "sonarQubePortfolio",
  "properties": {
    "description": null,
    "visibility": "PUBLIC",
    "selectionMode": "NONE",
    "disabled": null
  },
  "relations": {
    "subPortfolios": [
      "GetPort_SelfService_Second",
      "Python"
    ],
    "referencedBy": [
      "GetPort_SelfService:Authentication_Application"
    ]
  }
}
```

</details>

## Migration from SonarQube integration version `<=0.1.121`
Versions prior to `v0.1.115` used SonarQube's internal API for components to retrieve projects. Since this API is internal and subject to change, it is not globally available and not recommended for new users.

To remedy this, we have switched to the globally available API for projects instead for new users of the SonarQube integration. This comes with a few changes that are listed below.

### Changes to the SonarQube integration

- The `project` kind is deprecated in support for the `projects_ga` kind. *Deprecation effective: 2024-02-23*

- Since the `tags` property is only available with the internal API, it will read `null` for existing users of the SonarQube integration.

- Minor but backwards compatible changes have been made to the `sonarQubeProject` blueprint:


<details>

<summary><b>`<=v0.1.121` `sonarqubeProject` blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
    "identifier": "sonarQubeProject",
    "title": "SonarQube Project",
    "icon": "sonarqube",
    "schema": {
      "properties": {
        "organization": {
          "type": "string",
          "title": "Organization",
          "icon": "TwoUsers"
        },
        "link": {
          "type": "string",
          "format": "url",
          "title": "Link",
          "icon": "Link"
        },
        "lastAnalysisDate": {
          "type": "string",
          "format": "date-time",
          "icon": "Clock",
          "title": "Last Analysis Date"
        },
        "qualityGateStatus": {
          "title": "Quality Gate Status",
          "type": "string",
          "enum": [
            "OK",
            "WARN",
            "ERROR"
          ],
          "enumColors": {
            "OK": "green",
            "WARN": "yellow",
            "ERROR": "red"
          }
        },
        "numberOfBugs": {
          "type": "number",
          "title": "Number Of Bugs"
        },
        "numberOfCodeSmells": {
          "type": "number",
          "title": "Number Of CodeSmells"
        },
        "numberOfVulnerabilities": {
          "type": "number",
          "title": "Number Of Vulnerabilities"
        },
        "numberOfHotSpots": {
          "type": "number",
          "title": "Number Of HotSpots"
        },
        "numberOfDuplications": {
          "type": "number",
          "title": "Number Of Duplications"
        },
        "coverage": {
          "type": "number",
          "title": "Coverage"
        },
        "mainBranch": {
          "type": "string",
          "icon": "Git",
          "title": "Main Branch"
        },
        "tags": {
          "type": "array",
          "title": "Tags"
        }
      },
      "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {
      "criticalOpenIssues": {
        "title": "Number Of Open Critical Issues",
        "type": "number",
        "target": "sonarQubeIssue",
        "query": {
          "combinator": "and",
          "rules": [
            {
              "property": "status",
              "operator": "in",
              "value": ["OPEN", "REOPENED"]
            },
            {
              "property": "severity",
              "operator": "=",
              "value": "CRITICAL"
            }
          ]
        },
        "calculationSpec": {
          "calculationBy": "entities",
          "func": "count"
        }
      },
      "numberOfOpenIssues": {
        "title": "Number Of Open Issues",
        "type": "number",
        "target": "sonarQubeIssue",
        "query": {
          "combinator": "and",
          "rules": [
            {
              "property": "status",
              "operator": "in",
              "value": [
                "OPEN",
                "REOPENED"
              ]
            }
          ]
        },
        "calculationSpec": {
          "calculationBy": "entities",
          "func": "count"
        }
      }
    },
    "relations": {}
  }
```

</details>

<details>

<summary><b>`>=v0.1.115` `sonarqubeProject` blueprint (Click to expand)</b></summary>

```json showLineNumbers
{
    "identifier": "sonarQubeProject",
    "title": "SonarQube Project",
    "icon": "sonarqube",
    "schema": {
      "properties": {
        "organization": {
          "type": "string",
          "title": "Organization",
          "icon": "TwoUsers"
        },
        "link": {
          "type": "string",
          "format": "url",
          "title": "Link",
          "icon": "Link"
        },
        "lastAnalysisDate": {
          "type": "string",
          "format": "date-time",
          "icon": "Clock",
          "title": "Last Analysis Date"
        },
        "qualityGateStatus": {
          "title": "Quality Gate Status",
          "type": "string",
          "enum": [
            "OK",
            "WARN",
            "ERROR"
          ],
          "enumColors": {
            "OK": "green",
            "WARN": "yellow",
            "ERROR": "red"
          }
        },
        "numberOfBugs": {
          "type": "number",
          "title": "Number Of Bugs"
        },
        "numberOfCodeSmells": {
          "type": "number",
          "title": "Number Of CodeSmells"
        },
        "numberOfVulnerabilities": {
          "type": "number",
          "title": "Number Of Vulnerabilities"
        },
        "numberOfHotSpots": {
          "type": "number",
          "title": "Number Of HotSpots"
        },
        "numberOfDuplications": {
          "type": "number",
          "title": "Number Of Duplications"
        },
        "coverage": {
          "type": "number",
          "title": "Coverage"
        },
        "mainBranch": {
          "type": "string",
          "icon": "Git",
          "title": "Main Branch"
        },
        "mainBranchLastAnalysisDate": {
          "type": "string",
          "format": "date-time",
          "icon": "Clock",
          "title": "Main Branch Last Analysis Date"
        },
        "revision": {
          "type": "string",
          "title": "Revision"
        },
        "managed": {
          "type": "boolean",
          "title": "Managed"
        }
      },
      "required": []
    },
    "mirrorProperties": {},
    "calculationProperties": {},
    "aggregationProperties": {
      "criticalOpenIssues": {
        "title": "Number Of Open Critical Issues",
        "type": "number",
        "target": "sonarQubeIssue",
        "query": {
          "combinator": "and",
          "rules": [
            {
              "property": "status",
              "operator": "in",
              "value": ["OPEN", "REOPENED"]
            },
            {
              "property": "severity",
              "operator": "=",
              "value": "CRITICAL"
            }
          ]
        },
        "calculationSpec": {
          "calculationBy": "entities",
          "func": "count"
        }
      },
      "numberOfOpenIssues": {
        "title": "Number Of Open Issues",
        "type": "number",
        "target": "sonarQubeIssue",
        "query": {
          "combinator": "and",
          "rules": [
            {
              "property": "status",
              "operator": "in",
              "value": [
                "OPEN",
                "REOPENED"
              ]
            }
          ]
        },
        "calculationSpec": {
          "calculationBy": "entities",
          "func": "count"
        }
      }
    },
    "relations": {}
  }

```

</details>

- If you however, choose to stick with the internal API with the `project` kind, use any of the blueprints with the following mapping:


<details>

<summary><b>Project mapping for `project` kind(Click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: projects
    selector:
      query: 'true'
      apiFilters:
        filter:
          qualifier: TRK
      metrics:
        - code_smells
        - coverage
        - bugs
        - vulnerabilities
        - duplicated_files
        - security_hotspots
        - new_violations
        - new_coverage
        - new_duplicated_lines_density
    port:
      entity:
        mappings:
        // highlight-next-line
          blueprint: '"sonarQubeProject"' # or any other blueprint you decide to use
          identifier: .key
          title: .name
          properties:
            organization: .organization
            link: .__link
            qualityGateStatus: .__branch.status.qualityGateStatus
            lastAnalysisDate: .__branch.analysisDate
            numberOfBugs: .__measures[]? | select(.metric == "bugs") | .value
            numberOfCodeSmells: .__measures[]? | select(.metric == "code_smells") | .value
            numberOfVulnerabilities: .__measures[]? | select(.metric == "vulnerabilities") | .value
            numberOfHotSpots: .__measures[]? | select(.metric == "security_hotspots") | .value
            numberOfDuplications: .__measures[]? | select(.metric == "duplicated_files") | .value
            coverage: .__measures[]? | select(.metric == "coverage") | .value
            mainBranch: .__branch.name
            tags: .tags
```


</details>

## Alternative installation via webhook

While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest data from SonarQube. If so, use the following instructions:

<details>

<summary><b><b>Webhook installation (click to expand)</b> (Click to expand)</b></summary>

In this example you are going to create a webhook integration between [SonarQube's SonarCloud](https://www.sonarsource.com/products/sonarcloud/) and Port, which will ingest SonarQube code quality `analysis` entities.

<h2> Port configuration </h2>

Create the following blueprint definition:

<details>
<summary><b>SonarQube analysis blueprint (Click to expand)</b></summary>

<SonarcloudAnalysisBlueprint/>

</details>

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints):

<details>
<summary><b>SonarQube analysis webhook configuration (Click to expand)</b></summary>

1. **Basic details** tab - fill the following details:

   1. Title : `SonarQube mapper`;
   2. Identifier : `sonarqube_mapper`;
   3. Description : `A webhook configuration to map SonarQube alerts to Port`;
   4. Icon : `sonarqube`;

2. **Integration configuration** tab - fill the following JQ mapping:

   <SonarcloudAnalysisConfiguration/>

3. Scroll down to **Advanced settings** and input the following details:

   1. secret: `WEBHOOK_SECRET`;
   2. Signature Header Name : `x-sonar-webhook-hmac-sha256`;
   3. Signature Algorithm : Select `sha256` from dropdown option;
   4. Click **Save** at the bottom of the page.

   Remember to replace the `WEBHOOK_SECRET` with the real secret you specify when creating the webhook in SonarCloud.

</details>

<h2> Create a webhook in SonarCloud </h2>

1. Go to [SonarCloud](https://sonarcloud.io/projects) and select a project you want to configure a webhook for;
2. Click on **Administration** at the bottom left of the page and select **Webhooks**;
3. Click on **Create**
4. Input the following details:
   1. `Name` - use a meaningful name such as Port Webhook;
   2. `URL` - enter the value of the `url` key you received after creating the webhook configuration;
   3. `Secret` - enter the secret value you specified when creating the webhook;
5. Click **Create** at the bottom of the page.

:::tip
In order to view the different payloads and events available in SonarQube webhooks, [look here](https://docs.sonarqube.org/latest/project-administration/webhooks/)
:::

Done! any new analysis you run (for example, on new PRs or changes to PRs) will trigger a webhook event that SonarCloud will send to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

<h2> Let's Test It </h2>

This section includes a sample webhook event sent from SonarQube when a code repository is scanned for quality assurance. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

<h3> Payload </h3>

Here is an example of the payload structure sent to the webhook URL when a SonarQube repository is scanned:

<details>
<summary><b>Webhook event payload (Click to expand)</b></summary>

```json showLineNumbers
{
  "serverUrl": "https://sonarcloud.io",
  "taskId": "AYi_1w1fcGD_RU1S5-r_",
  "status": "SUCCESS",
  "analysedAt": "2023-06-15T16:15:05+0000",
  "revision": "575718d8287cd09630ff0ff9aa4bb8570ea4ef29",
  "changedAt": "2023-06-15T16:15:05+0000",
  "project": {
    "key": "Username_Test_Python_App",
    "name": "Test_Python_App",
    "url": "https://sonarcloud.io/dashboard?id=Username_Test_Python_App"
  },
  "branch": {
    "name": "master",
    "type": "LONG",
    "isMain": true,
    "url": "https://sonarcloud.io/dashboard?id=Username_Test_Python_App"
  },
  "qualityGate": {
    "name": "My Quality Gate",
    "status": "ERROR",
    "conditions": [
      {
        "metric": "code_smells",
        "operator": "GREATER_THAN",
        "value": "217",
        "status": "ERROR",
        "errorThreshold": "5"
      },
      {
        "metric": "ncloc",
        "operator": "GREATER_THAN",
        "value": "8435",
        "status": "ERROR",
        "errorThreshold": "20"
      },
      {
        "metric": "new_branch_coverage",
        "operator": "LESS_THAN",
        "status": "NO_VALUE",
        "errorThreshold": "1"
      },
      {
        "metric": "new_sqale_debt_ratio",
        "operator": "GREATER_THAN",
        "value": "1.0303030303030303",
        "status": "OK",
        "errorThreshold": "5"
      },
      {
        "metric": "new_violations",
        "operator": "GREATER_THAN",
        "value": "3",
        "status": "ERROR",
        "errorThreshold": "1"
      }
    ]
  },
  "properties": {}
}
```

</details>

<h3> Mapping Result </h3>

The combination of the sample payload and the webhook configuration generates the following Port entity:

```json showLineNumbers
{
  "identifier": "AYi_1w1fcGD_RU1S5-r_",
  "title": "Test_Python_App-AYi_1w1fcGD_RU1S5-r_",
  "blueprint": "sonarCloudAnalysis",
  "properties": {
    "serverUrl": "https://sonarcloud.io",
    "status": "SUCCESS",
    "projectName": "Test_Python_App",
    "projectUrl": "https://sonarcloud.io/dashboard?id=Username_Test_Python_App",
    "branchName": "master",
    "branchType": "LONG",
    "branchUrl": "https://sonarcloud.io/dashboard?id=Username_Test_Python_App",
    "qualityGateName": "My Quality Gate",
    "qualityGateStatus": "ERROR",
    "qualityGateConditions": [
      {
        "metric": "code_smells",
        "operator": "GREATER_THAN",
        "value": "217",
        "status": "ERROR",
        "errorThreshold": "5"
      },
      {
        "metric": "ncloc",
        "operator": "GREATER_THAN",
        "value": "8435",
        "status": "ERROR",
        "errorThreshold": "20"
      },
      {
        "metric": "new_branch_coverage",
        "operator": "LESS_THAN",
        "status": "NO_VALUE",
        "errorThreshold": "1"
      },
      {
        "metric": "new_sqale_debt_ratio",
        "operator": "GREATER_THAN",
        "value": "1.0303030303030303",
        "status": "OK",
        "errorThreshold": "5"
      },
      {
        "metric": "new_violations",
        "operator": "GREATER_THAN",
        "value": "3",
        "status": "ERROR",
        "errorThreshold": "1"
      }
    ]
  },
  "relations": {}
}
```
</details>
