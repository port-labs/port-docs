import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_azure_premise.mdx"
import HelmParameters from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean-advanced-parameters-helm.mdx"
import DockerParameters from "./\_github_copilot_one_time_docker_parameters.mdx"
import AdvancedConfig from '/docs/generalTemplates/\_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"

# GitHub Copilot

Port's Github Copilot integration allows you to ingest your Github Copilot usage metrics into your software catalog.


## Supported aggregation hierarchies

Some aggregation hierarchies of Github Copilot usage metrics can be ingested into Port, they are listed below.  
It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [copilot-team-metrics](https://docs.github.com/en/rest/copilot/copilot-metrics?apiVersion=2022-11-28#get-copilot-metrics-for-a-team)
- [copilot-organization-metrics](https://docs.github.com/en/rest/copilot/copilot-metrics?apiVersion=2022-11-28#get-copilot-metrics-for-an-organization)

## Setup

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation integration="Github Copilot"/>

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-Time (self-hosted)">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

<h2> Prerequisites </h2>

<Prerequisites />

For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>

<OceanRealtimeInstallation integration="Github Copilot" />

<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-github-copilot-integration` in your git repository with the content:

:::note
Remember to replace the placeholder for `GITHUB_TOKEN`.
:::

```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-github-copilot-integration
  type: github-copilot
  eventListener:
    type: POLLING
  secrets:
  // highlight-start
    githubToken: GITHUB_TOKEN
  // highlight-end
```

<br/>

1. Install the `my-ocean-github-copilot-integration` ArgoCD Application by creating the following `my-ocean-github-copilot-integration.yaml` manifest:

:::note Replace placeholders

Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.  
Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).

:::

<details>
  <summary>ArgoCD Application</summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-ocean-github-copilot-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-github-copilot-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-github-copilot-integration/values.yaml
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
kubectl apply -f my-ocean-github-copilot-integration.yaml
```

</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.

| Parameter                          | Description                                                                                                                                                                                                                                                                                    | Example                          | Required |
|------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|----------|
| `port.clientId`                    | Your port [client id](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                                  |                                  | ✅        |
| `port.clientSecret`                | Your port [client secret](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                              |                                  | ✅        |
| `port.baseUrl`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                                                        |                                  | ✅        |
| `integration.secrets.githubToken` | Github [token](https://github.com/settings/tokens/new) used to query Github api                                                                                                                                               |                                  | ✅        |
| `integration.config.githubHost`       | The host of the Github api instance                                                                                                                                                                           | https://api.github.com | ✅        |
| `integration.eventListener.type`   | The event listener type. Read more about [event listeners](https://ocean.getport.io/framework/features/event-listener)                                                                                                                                                                         |                                  | ✅        |
| `integration.type`                 | The integration to be installed                                                                                                                                                                                                                                                                |                                  | ✅        |
| `scheduledResyncInterval`          | The number of minutes between each resync. When not set the integration will resync for each event listener resync event. Read more about [scheduledResyncInterval](https://ocean.getport.io/develop-an-integration/integration-configuration/#scheduledresyncinterval---run-scheduled-resync) |                                  | ❌        |
| `initializePortResources`          | Default true, When set to true the integration will create default blueprints and the port App config Mapping. Read more about [initializePortResources](https://ocean.getport.io/develop-an-integration/integration-configuration/#initializeportresources---initialize-port-resources)       |                                  | ❌        |
| `sendRawDataExamples`              | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                                                                                                                                            |                                  | ❌        |

<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the Github Copilot integration once and then exit, this is useful for **scheduled** ingestion of data.

  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

| Parameter                   | Description                                                                                                                                                                                                                                                                              | Example | Required |
|-----------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|----------|
| `port_client_id`            | Your Port client ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) id                                                                                                                               |         | ✅        |
| `port_client_secret`        | Your Port client ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret                                                                                                                           |         | ✅        |
| `port_base_url`             | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                                                  |         | ✅        |
| `config -> githubToken`  | Github [token](https://github.com/settings/tokens/new) used to query Github api                                                                                                                                         |         | ✅        |
| `initialize_port_resources` | Default true, When set to true the integration will create default blueprints and the port App config Mapping. Read more about [initializePortResources](https://ocean.getport.io/develop-an-integration/integration-configuration/#initializeportresources---initialize-port-resources) |         | ❌        |
| `identifier`                | The identifier of the integration that will be installed                                                                                                                                                                                                                                 |         | ❌        |
| `version`                   | The version of the integration that will be installed                                                                                                                                                                                                                                    | latest  | ❌        |`
| `sendRawDataExamples`       | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                                                                                                                                      | true    |          | ❌       |
<br/>

:::tip Ocean Sail Github Action
The following example uses the **Ocean Sail** Github Action to run the Github Copilot integration.
For further information about the action, please visit the [Ocean Sail Github Action](https://github.com/marketplace/actions/ocean-sail)
:::

<br/>

Here is an example for `github-copilot-integration.yml` workflow file:

```yaml showLineNumbers
name: Github Copilot Exporter Workflow

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
          type: 'github-copilot'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            githubToken: ${{ secrets.OCEAN__INTEGRATION__CONFIG__GITHUB_TOKEN }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">

:::tip Tip for Jenkins agent
Your Jenkins agent should be able to run docker commands.
:::


Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/) of `Secret Text` type:

<DockerParameters/>

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```yml showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run Github Copilot Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__GITHUB_TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__GITHUB_TOKEN'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="github-copilot"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__GITHUB_TOKEN=$OCEAN__INTEGRATION__CONFIG__GITHUB_TOKEN \
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
<AzurePremise />

<DockerParameters />

<br/>

Here is an example for `github-copilot-integration.yml` pipeline file:

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
      integration_type="github-copilot"
      version="latest"

      image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

      docker run -i --rm \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
        -e OCEAN__INTEGRATION__CONFIG__GITHUB_TOKEN=$(OCEAN__INTEGRATION__CONFIG__GITHUB_TOKEN) \
        -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
        -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $image_name

      exit $?
    displayName: "Ingest Data into Port"
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
  INTEGRATION_TYPE: github-copilot
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
        -e OCEAN__INTEGRATION__CONFIG__GITHUB_TOKEN=$OCEAN__INTEGRATION__CONFIG__GITHUB_TOKEN \
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
entityDeletionThreshold: 0
resources:
- kind: copilot-team-metrics
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: (.__team.slug + "@" + .date)
        title: (.__team.slug + " copilot-metrics " + .date)
        blueprint: '"github_copilot_usage"'
        properties:
          record_date: .date  + "T00:00:00Z"
          breakdown: .
          total_suggestions_count: '[.copilot_ide_code_completions.editors[]?.models[]?.languages[]?.total_code_suggestions] | map(select(. != null) ) | add'
          total_acceptances_count: '[.copilot_ide_code_completions.editors[]?.models[]?.languages[]?.total_code_acceptances] | map(select(. != null)) | add'
          total_lines_suggested: '[.copilot_ide_code_completions.editors[]?.models[]?.languages[]?.total_code_lines_suggested] | map(select(. != null)) | add'
          total_lines_accepted: '[.copilot_ide_code_completions.editors[]?.models[]?.languages[]?.total_code_lines_accepted] | map(select(. != null)) | add'
          total_active_users: .total_active_users
          total_chat_acceptances: |-
            [
              (.copilot_ide_chat.editors[]?.models[]?.total_chat_copy_events // 0),
              (.copilot_ide_chat.editors[]?.models[]?.total_chat_insertion_events // 0)
            ] | map(select(. != null)) | add
          total_chat_turns: '[.copilot_ide_chat.editors[]?.models[]?.total_chats // 0] | map(select(. != null)) | add'
          total_active_chat_users: '[.copilot_ide_chat.editors[]?.total_engaged_users // 0] | map(select(. != null)) | add'
          git_hub_org: .__organization.login
          git_hub_team: .__team.slug
- kind: copilot-organization-metrics
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: (.__organization.login + "@" + .date)
        title: (.__organization.login + " copilot-metrics " + .date)
        blueprint: '"github_copilot_usage"'
        properties:
          record_date: .date  + "T00:00:00Z"
          breakdown: .
          total_suggestions_count: '[.copilot_ide_code_completions.editors[]?.models[]?.languages[]?.total_code_suggestions] | map(select(. != null) ) | add'
          total_acceptances_count: '[.copilot_ide_code_completions.editors[]?.models[]?.languages[]?.total_code_acceptances] | map(select(. != null)) | add'
          total_lines_suggested: '[.copilot_ide_code_completions.editors[]?.models[]?.languages[]?.total_code_lines_suggested] | map(select(. != null)) | add'
          total_lines_accepted: '[.copilot_ide_code_completions.editors[]?.models[]?.languages[]?.total_code_lines_accepted] | map(select(. != null)) | add'
          total_active_users: .total_active_users
          total_chat_acceptances: |-
            [
              (.copilot_ide_chat.editors[]?.models[]?.total_chat_copy_events // 0),
              (.copilot_ide_chat.editors[]?.models[]?.total_chat_insertion_events // 0)
            ] | map(select(. != null)) | add
          total_chat_turns: '[.copilot_ide_chat.editors[]?.models[]?.total_chats // 0] | map(select(. != null)) | add'
          total_active_chat_users: '[.copilot_ide_chat.editors[]?.total_engaged_users // 0] | map(select(. != null)) | add'
          git_hub_org: .__organization.login

```

</details>



## Permissions

Port's Github Copilot integration requires a classic Github token **generated by organization owners or parent enterprise owners and billing managers** with at least one of the following scopes to be enabled:
-  `manage_billing:copilot`.
- `read:org`.
- `read:enterprise`.

In addition, the Copilot Metrics API access policy must be enabled for the organization within GitHub settings. 

## Examples

To view and test the integration's mapping against examples of the third-party API responses, use the jq playground in your [data sources page](https://app.getport.io/settings/data-sources).  
Find the integration in the list of data sources and click on it to open the playground.

Additional examples of blueprints and the relevant integration configurations:

<details>
<summary>GitHub Copilot Usage Blueprint</summary>

```json showLineNumbers
{
    "identifier": "github_copilot_usage",
    "title": "GitHub Copilot Usage",
    "icon": "Github",
    "schema": {
      "properties": {
        "record_date": {
          "type": "string",
          "title": "Record Date",
          "format": "date-time"
        },
        "breakdown": {
          "type": "object",
          "title": "Breakdown"
        },
        "total_suggestions_count": {
          "type": "number",
          "title": "Total Suggestions Count"
        },
        "total_acceptances_count": {
          "type": "number",
          "title": "Total Acceptances Count"
        },
        "total_lines_suggested": {
          "type": "number",
          "title": "Total Lines Suggested"
        },
        "total_lines_accepted": {
          "type": "number",
          "title": "Total Lines Accepted"
        },
        "total_active_users": {
          "type": "number",
          "title": "Total Active Users"
        },
        "total_chat_acceptances": {
          "type": "number",
          "title": "Total Chat Acceptances"
        },
        "total_chat_turns": {
          "type": "number",
          "title": "Total Chat Turns"
        },
        "total_active_chat_users": {
          "type": "number",
          "title": "Total Active Chat Users"
        },
        "git_hub_org": {
          "type": "string",
          "title": "GitHub Org"
        },
        "git_hub_team": {
          "type": "string",
          "title": "GitHub Team"
        }
      },
      "required": []
    },
    "calculationProperties": {
      "acceptance_rate": {
        "title": "Acceptance Rate",
        "icon": "DefaultProperty",
        "calculation": "if (.properties.total_suggestions_count == 0)  then 0  else    ((.properties.total_acceptances_count / .properties.total_suggestions_count) * 100     | round)  end",
        "type": "number"
      }
    },
    "relations": {}
  }
```

</details>

## Team hierarchy metrics

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
entityDeletionThreshold: 0
resources:
  - kind: copilot-team-metrics
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: (.__team.slug + "@" + .date)
          title: (.__team.slug + " copilot-metrics " + .date)
          blueprint: '"github_copilot_usage"'
          properties:
            record_date: .date  + "T00:00:00Z"
            breakdown: .
            total_suggestions_count: >-
              [.copilot_ide_code_completions.editors[]?.models[]?.languages[]?.total_code_suggestions]
              | map(select(. != null) ) | add
            total_acceptances_count: >-
              [.copilot_ide_code_completions.editors[]?.models[]?.languages[]?.total_code_acceptances]
              | map(select(. != null)) | add
            total_lines_suggested: >-
              [.copilot_ide_code_completions.editors[]?.models[]?.languages[]?.total_code_lines_suggested]
              | map(select(. != null)) | add
            total_lines_accepted: >-
              [.copilot_ide_code_completions.editors[]?.models[]?.languages[]?.total_code_lines_accepted]
              | map(select(. != null)) | add
            total_active_users: .total_active_users
            total_chat_acceptances: >-
              [
                (.copilot_ide_chat.editors[]?.models[]?.total_chat_copy_events // 0),
                (.copilot_ide_chat.editors[]?.models[]?.total_chat_insertion_events // 0)
              ]
              | map(select(. != null)) | add
            total_chat_turns: >-
              [.copilot_ide_chat.editors[]?.models[]?.total_chats // 0]
              | map(select(. != null)) | add
            total_active_chat_users: >-
              [.copilot_ide_chat.editors[]?.total_engaged_users // 0]
              | map(select(. != null)) | add
            git_hub_org: .__organization.login
            git_hub_team: .__team.slug
```
</details>

## Organization hierarchy metrics

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
entityDeletionThreshold: 0
resources:
  - kind: copilot-organization-metrics
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: (.__organization.login + "@" + .date)
          title: (.__organization.login + " copilot-metrics " + .date)
          blueprint: '"github_copilot_usage"'
          properties:
            record_date: .date  + "T00:00:00Z"
            breakdown: .
            total_suggestions_count: >-
              [.copilot_ide_code_completions.editors[]?.models[]?.languages[]?.total_code_suggestions]
              | map(select(. != null) ) | add
            total_acceptances_count: >-
              [.copilot_ide_code_completions.editors[]?.models[]?.languages[]?.total_code_acceptances]
              | map(select(. != null)) | add
            total_lines_suggested: >-
              [.copilot_ide_code_completions.editors[]?.models[]?.languages[]?.total_code_lines_suggested]
              | map(select(. != null)) | add
            total_lines_accepted: >-
              [.copilot_ide_code_completions.editors[]?.models[]?.languages[]?.total_code_lines_accepted]
              | map(select(. != null)) | add
            total_active_users: .total_active_users
            total_chat_acceptances: >-
              [
                (.copilot_ide_chat.editors[]?.models[]?.total_chat_copy_events // 0),
                (.copilot_ide_chat.editors[]?.models[]?.total_chat_insertion_events // 0)
              ]
              | map(select(. != null)) | add
            total_chat_turns: >-
              [.copilot_ide_chat.editors[]?.models[]?.total_chats // 0]
              | map(select(. != null)) | add
            total_active_chat_users: >-
              [.copilot_ide_chat.editors[]?.total_engaged_users // 0]
              | map(select(. != null)) | add
            git_hub_org: .__organization.login
```
</details>