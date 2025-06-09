import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_helm_prerequisites_block.mdx"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation_oauth.mdx"
import AdvancedConfig from '/docs/generalTemplates/\_ocean_advanced_configuration_note.md'
import AzurePremise from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean_azure_premise.mdx"
import DockerParameters from "/docs/build-your-software-catalog/sync-data-to-catalog/project-management/jira/_jira_one_time_docker_parameters.mdx"
import HelmParameters from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/\_ocean-advanced-parameters-helm.mdx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import JiraIssueBlueprint from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/jira/\_example_jira_issue_blueprint.mdx"
import JiraIssueConfiguration from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/jira/\_example_jira_issue_configuration.mdx"
import JiraIssueConfigurationPython from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/jira/\_example_jira_issue_configuration_python.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"
import JiraUserExampleResponse from "/docs/build-your-software-catalog/sync-data-to-catalog/project-management/jira/examples/_jira_user_example_response.mdx"
import JiraUserEntity from "/docs/build-your-software-catalog/sync-data-to-catalog/project-management/jira/examples/_jira_user_example_entity.mdx"
import JiraIssueEntity from "/docs/build-your-software-catalog/sync-data-to-catalog/project-management/jira/examples/_jira_issue_example_entity.mdx"
import JiraTeamExampleResponse from "/docs/build-your-software-catalog/sync-data-to-catalog/project-management/jira/examples/_jira_team_example_response.mdx"
import JiraTeamEntity from "/docs/build-your-software-catalog/sync-data-to-catalog/project-management/jira/examples/_jira_team_example_entity.mdx"

# Jira

Port's Jira integration allows you to model Jira resources in your software catalog and ingest data into them.

:::info Jira cloud only
This integration supports `Jira Cloud` at the moment. To integrate Port with `Jira Server`, use [Port's webhook integration](/build-your-software-catalog/custom-integration/webhook/examples/jira-server).
:::

## Overview

This integration allows you to:

- Watch for Jira object changes (create/update/delete) in real-time, and automatically apply the changes to your software catalog.
- Define self-service actions that can create/delete Jira objects or perform any other logic on Jira resources.

### Supported Resources

The resources that can be ingested from Jira into Port are listed below.  
It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [`Project`](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-projects/#api-rest-api-3-project-search-get)
- [`User`](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-users/#api-group-users)
- [`Team`](https://developer.atlassian.com/platform/teams/rest/v1/api-group-teams-public-api/#api-group-teams-public-api)
- [`Issue`](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/#api-rest-api-3-search-jql-get)


## Setup

### Required API Token Scopes

:::warning Jira API token deprecation
Jira is deprecating API tokens without scopes. When creating Jira API tokens, you must configure the following required scopes for the integration to function properly.
:::

The Port Jira integration requires the following API token scopes:

| Scope | What it lets the app do | Why the integration needs it |
|-------|-------------------------|------------------------------|
| **read:account** | Read the basic Atlassian ID profile (account ID, display name, avatar). | Map actions and audit trails to the correct end-user and comply with GDPR "right to access/erase". |
| **read:jira-user** | View Jira user profiles (names, emails, avatars). | Display assignees/reporters and resolve user IDs when creating or updating issues. |
| **read:jira-work** | View Jira projects, issues, attachments, comments, worklogs, etc. | Sync Jira data into Port dashboards and run read-only analytics. |
| **write:jira-work** | Create or update issues, comments, worklogs; transition issues. | Push findings or automated actions back into Jira (e.g., open a ticket, add a comment, close an issue). |
| **manage:jira-project** | Create/edit project-level configuration (components, versions, custom fields). | Automatically provision required project settings or keep custom fields in sync. |
| **manage:jira-webhook** | Register, update, or delete dynamic webhooks. | Receive real-time callbacks when issues change instead of polling. |


Choose one of the following installation methods:


<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

:::caution API Token authentication recommended
For production, we recommend using **API Token authentication** for Port’s Jira integration.  
It ensures stable data syncing and prevents issues caused by user account changes.  

OAuth is best suited for the **initial setup** phase, such as configuring mappings.
:::

<OceanSaasInstallation integration="Jira" />

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

<h2> Prerequisites </h2>

<Prerequisites />

For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>

<OceanRealtimeInstallation integration="Jira" />

<PortApiRegionTip/>

</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-jira-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `ATLASSIAN_JIRA_HOST` `ATLASSIAN_USER_EMAIL` and `ATLASSIAN_USER_TOKEN`.
:::

```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-jira-integration
  type: jira
  eventListener:
    type: POLLING
  config:
  // highlight-next-line
    jiraHost: ATLASSIAN_JIRA_HOST
  secrets:
  // highlight-start
    atlassianUserEmail: ATLASSIAN_USER_EMAIL
    atlassianUserToken: ATLASSIAN_USER_TOKEN
  // highlight-end
```

<br/>

2. Install the `my-ocean-jira-integration` ArgoCD Application by creating the following `my-ocean-jira-integration.yaml` manifest:

:::note Replace placeholders

Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.  
Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).

:::

<details>
  <summary>ArgoCD Application (Click to expand)</summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-ocean-jira-integration
  namespace: argocd
spec:
  destination:
    namespace: mmy-ocean-jira-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-jira-integration/values.yaml
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
kubectl apply -f my-ocean-jira-integration.yaml
```

</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.

| Parameter                                | Description                                                                                                                                                                                                                                                                                    | Example                          | Required |
|------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|----------|
| `port.clientId`                          | Your port [client id](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                                  |                                  | ✅        |
| `port.clientSecret`                      | Your port [client secret](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)                                                                                                                                                              |                                  | ✅        |
| `port.baseUrl`                           | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                                                        |                                  | ✅        |
| `integration.secrets.atlassianUserEmail` | The email of the user used to query Jira                                                                                                                                                                                                                                                       | user@example.com                 | ✅        |
| `integration.secrets.atlassianUserToken` | [Jira API token](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/) generated by the user. Make sure to configure the [required scopes](#required-api-token-scopes).                                                                          |                                  | ✅        |
| `integration.config.atlassianOrganizationId` | Your Atlassian Organization ID is required to sync teams and team members. [Follow the Atlassian documentation](https://confluence.atlassian.com/jirakb/what-it-is-the-organization-id-and-where-to-find-it-1207189876.html) on how to find your Organization ID | | ❌ |
| `integration.config.jiraHost`            | The URL of your Jira                                                                                                                                                                                                                                                                           | https://example.atlassian.net    | ✅        |
| `integration.config.appHost`             | The host of the Port Ocean app. Used to set up the integration endpoint as the target for webhooks created in Jira                                                                                                                                                                             | https://my-ocean-integration.com | ✅        |
| `integration.eventListener.type`         | The event listener type. Read more about [event listeners](https://ocean.getport.io/framework/features/event-listener)                                                                                                                                                                         |                                  | ✅        |
| `integration.type`                       | The integration to be installed                                                                                                                                                                                                                                                                |                                  | ✅        |
| `scheduledResyncInterval`                | The number of minutes between each resync. When not set the integration will resync for each event listener resync event. Read more about [scheduledResyncInterval](https://ocean.getport.io/develop-an-integration/integration-configuration/#scheduledresyncinterval---run-scheduled-resync) |                                  | ❌        |
| `initializePortResources`                | Default true, When set to true the integration will create default blueprints and the port App config Mapping. Read more about [initializePortResources](https://ocean.getport.io/develop-an-integration/integration-configuration/#initializeportresources---initialize-port-resources)       |                                  | ❌        |
| `sendRawDataExamples`                    | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                                                                                                                                            |                                  | ❌        |


<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the Jira integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Realtime updates
If you want the integration to update Port in real time using webhooks you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option.
:::

  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

| Parameter                        | Description                                                                                                                                                                                                                                                                              | Example                       | Required |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------|----------|
| `port_client_id`                 | Your Port client ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) id                                                                                                                               |                               | ✅        |
| `port_client_secret`             | Your Port client ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret                                                                                                                           |                               | ✅        |
| `port_base_url`                  | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                                                                                                                                                  |                               | ✅        |
| `config -> jira_host`            | The URL of your Jira                                                                                                                                                                                                                                                                     | https://example.atlassian.net | ✅        |
| `config -> atlassian_user_email` | The email of the user used to query Jira                                                                                                                                                                                                                                                 | user@example.com              | ✅        |
| `config -> atlassian_user_token` | [Jira API token](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/) generated by the user. Make sure to configure the [required scopes](#required-api-token-scopes).                                                                    |                               | ✅        |
| `config -> atlassian_organization_id` |Your Atlassian Organization ID is required to sync teams and team members. [Follow the Atlassian documentation](https://confluence.atlassian.com/jirakb/what-it-is-the-organization-id-and-where-to-find-it-1207189876.html) on how to find your Organization ID |                         | ❌        |
| `initialize_port_resources`      | Default true, When set to true the integration will create default blueprints and the port App config Mapping. Read more about [initializePortResources](https://ocean.getport.io/develop-an-integration/integration-configuration/#initializeportresources---initialize-port-resources) |                               | ❌        |
| `send_raw_data_examples`         | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                                                                                                                                                      |                               | ❌        |
| `identifier`                     | The identifier of the integration that will be installed                                                                                                                                                                                                                                 |                               | ❌        |
| `version`                        | The version of the integration that will be installed                                                                                                                                                                                                                                    | latest                        | ❌        |

<br/>

:::tip Ocean Sail Github Action
The following example uses the **Ocean Sail** Github Action to run the Jira integration.
For further information about the action, please visit the [Ocean Sail Github Action](https://github.com/marketplace/actions/ocean-sail)
:::

<br/>

Here is an example for `jira-integration.yml` workflow file:

```yaml showLineNumbers
name: Jira Exporter Workflow

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
          type: 'jira'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            jira_host: ${{ secrets.OCEAN__INTEGRATION__CONFIG__JIRA_HOST }}
            atlassian_user_email: ${{ secrets.OCEAN__INTEGRATION__CONFIG__ATLASSIAN_USER_EMAIL }}
            atlassian_user_token: ${{ secrets.OCEAN__INTEGRATION__CONFIG__ATLASSIAN_USER_TOKEN }}
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
        stage('Run Jira Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__JIRA_HOST', variable: 'OCEAN__INTEGRATION__CONFIG__JIRA_HOST'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__ATLASSIAN_USER_EMAIL', variable: 'OCEAN__INTEGRATION__CONFIG__ATLASSIAN_USER_EMAIL'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__ATLASSIAN_USER_TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__ATLASSIAN_USER_TOKEN'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="jira"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__JIRA_HOST=$OCEAN__INTEGRATION__CONFIG__JIRA_HOST \
                                -e OCEAN__INTEGRATION__CONFIG__ATLASSIAN_USER_EMAIL=$OCEAN__INTEGRATION__CONFIG__ATLASSIAN_USER_EMAIL \
                                -e OCEAN__INTEGRATION__CONFIG__ATLASSIAN_USER_TOKEN=$OCEAN__INTEGRATION__CONFIG__ATLASSIAN_USER_TOKEN \
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

Here is an example for `jira-integration.yml` pipeline file:

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
      integration_type="jira"
      version="latest"

      image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

      docker run -i --rm \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
        -e OCEAN__INTEGRATION__CONFIG__JIRA_HOST=$(OCEAN__INTEGRATION__CONFIG__JIRA_HOST) \
        -e OCEAN__INTEGRATION__CONFIG__ATLASSIAN_USER_EMAIL=$(OCEAN__INTEGRATION__CONFIG__ATLASSIAN_USER_EMAIL) \
        -e OCEAN__INTEGRATION__CONFIG__ATLASSIAN_USER_TOKEN=$(OCEAN__INTEGRATION__CONFIG__ATLASSIAN_USER_TOKEN) \
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
  INTEGRATION_TYPE: jira
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
        -e OCEAN__INTEGRATION__CONFIG__JIRA_HOST=$OCEAN__INTEGRATION__CONFIG__JIRA_HOST \
        -e OCEAN__INTEGRATION__CONFIG__ATLASSIAN_USER_EMAIL=$OCEAN__INTEGRATION__CONFIG__ATLASSIAN_USER_EMAIL \
        -e OCEAN__INTEGRATION__CONFIG__ATLASSIAN_USER_TOKEN=$OCEAN__INTEGRATION__CONFIG__ATLASSIAN_USER_TOKEN \
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
- kind: user
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .accountId
        title: .displayName
        blueprint: '"jiraUser"'
        properties:
          emailAddress: .emailAddress
          displayName: .displayName
          active: .active
          accountType: .accountType
- kind: project
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .key
        title: .name
        blueprint: '"jiraProject"'
        properties:
          url: (.self | split("/") | .[:3] | join("/")) + "/projects/" + .key
- kind: issue
  selector:
    query: 'true'
    jql: (statusCategory != Done) OR (created >= -1w) OR (updated >= -1w)
  port:
    entity:
      mappings:
        identifier: .key
        title: .fields.summary
        blueprint: '"jiraIssue"'
        properties:
          url: (.self | split("/") | .[:3] | join("/")) + "/browse/" + .key
          status: .fields.status.name
          issueType: .fields.issuetype.name
          components: .fields.components
          creator: .fields.creator.emailAddress
          priority: .fields.priority.name
          labels: .fields.labels
          created: .fields.created
          updated: .fields.updated
          resolutionDate: .fields.resolutiondate
        relations:
          project: .fields.project.key
          parentIssue: .fields.parent.key
          subtasks: .fields.subtasks | map(.key)
          jira_user_assignee: .fields.assignee.accountId
          jira_user_reporter: .fields.reporter.accountId
          assignee:
            combinator: '"or"'
            rules:
            - property: '"jira_user_id"'
              operator: '"="'
              value: .fields.assignee.accountId
            - property: '"$identifier"'
              operator: '"="'
              value: .fields.assignee.email
          reporter:
            combinator: '"or"'
            rules:
            - property: '"jira_user_id"'
              operator: '"="'
              value: .fields.reporter.accountId
            - property: '"$identifier"'
              operator: '"="'
              value: .fields.reporter.email
- kind: issue
  selector:
    query: 'true'
    jql: (statusCategory != Done) OR (created >= -1w) OR (updated >= -1w)
  port:
    entity:
      mappings:
        identifier: .key
        title: .fields.summary
        blueprint: '"jiraIssue"'
        relations:
          pull_request:
            combinator: '"and"'
            rules:
            - property: '"$title"'
              operator: '"contains"'
              value: .key
```

</details>


### JQL support for issues

The Ocean Jira integration supports querying objects from the `issue` kind using [JQL](https://support.atlassian.com/jira-service-management-cloud/docs/use-advanced-search-with-jira-query-language-jql/), making it possible to specifically filter the issues that are queried from Jira and ingested to Port.

To use JQL filtering, add to the `selector` object a `jql` key with your desired JQL query as the value. For example:

```yaml showLineNumbers
resources:
  # highlight-next-line
  - kind: issue # JQL filtering can only be used with the "issue" kind
    selector:
      query: "true" # JQ boolean expression. If evaluated to false - this object will be skipped.
      # highlight-next-line
      jql: "status != Done" # JQL query, will only ingest issues whose status is not "Done"
    port:
```



### Fields support for `issue` kind
The Jira integration allows you to customize what fields are available for ingestion using the `fields` selector. The `fields` selector accepts a comma-separated string containing what fields are available. Possible values are `*all`, `*navigate`, `<field_name>` and `-<field_name>` (specifically for excluding fields).

The default value is set to `*all` which makes all fields available by default.

More details what values the `field` selector allows is available on [Jira's issue API documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-search/#api-rest-api-3-search-get:~:text=string-,fields,array%3Cstring%3E,-expand).


### Ingesting Sprint field for `issue` kind
By default, the Jira integration does not include information on the issues' sprint. To ingest sprint information, a custom field must be added to issues to display sprints. This custom field is then included in the Jira issues mapping configuration.

Follow the steps below:

1. Add Sprint as a custom field to Jira issue on your Jira dashboard. Take note of the custom field ID for the sprints field. This ID can be gotten by calling the [fields API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issue-fields/#api-rest-api-3-field-get) to first retreive the list of fields for issues which returns a payload like so:

<details>
<summary><b>Issues field API response (Click to expand)</b></summary>

```json showLineNumbers
[
  {
      "id": "thumbnail",
      "key": "thumbnail",
      "name": "Images",
      "custom": false,
      "orderable": false,
      "navigable": true,
      "searchable": false,
      "clauseNames": []
  },
  {
      "id": "created",
      "key": "created",
      "name": "Created",
      "custom": false,
      "orderable": false,
      "navigable": true,
      "searchable": true,
      "clauseNames": [
          "created",
          "createdDate"
      ],
      "schema": {
          "type": "datetime",
          "system": "created"
      }
  },
  // highlight-start
  {
      "id": "customfield_11111",
      "key": "customfield_11111",
      "name": "Sprint",
      "untranslatedName": "Sprint",
      "custom": true,
      "orderable": true,
      "navigable": true,
      "searchable": true,
      "clauseNames": [
          "cf[11111]",
          "Sprint"
      ],
      "schema": {
          "type": "array",
          "items": "json",
          "custom": "com.pyxis.greenhopper.jira:gh-sprint",
          "customId": 11111
      }
  }
  // highlight-end
]
```

</details>

Locate the `Sprint` field and take note of the ID - in this case, `customfield_11111`.

2. Extend the default blueprint to include a field for sprint

<details>
<summary><b>Issue blueprint with `sprint` (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "jiraIssue",
  "title": "Jira Issue",
  "icon": "Jira",
  "schema": {
    "properties": {
      "url": {
        "title": "Issue URL",
        "type": "string",
        "format": "url",
        "description": "URL to the issue in Jira"
      },
      "status": {
        "title": "Status",
        "type": "string",
        "description": "The status of the issue"
      },
      "issueType": {
        "title": "Type",
        "type": "string",
        "description": "The type of the issue"
      },
      "components": {
        "title": "Components",
        "type": "array",
        "description": "The components related to this issue"
      },
      "assignee": {
        "title": "Assignee",
        "type": "string",
        "format": "user",
        "description": "The user assigned to the issue"
      },
      "reporter": {
        "title": "Reporter",
        "type": "string",
        "description": "The user that reported to the issue",
        "format": "user"
      },
      "creator": {
        "title": "Creator",
        "type": "string",
        "description": "The user that created to the issue",
        "format": "user"
      },
      "priority": {
        "title": "Priority",
        "type": "string",
        "description": "The priority of the issue"
      },
      // highlight-start
      "sprint": {
        "title": "Sprint",
        "type": "string",
        "description": "The last sprint this issue belongs to"
      },
      // highlight-end
      "created": {
        "title": "Created At",
        "type": "string",
        "description": "The created datetime of the issue",
        "format": "date-time"
      },
      "updated": {
        "title": "Updated At",
        "type": "string",
        "description": "The updated datetime of the issue",
        "format": "date-time"
      }
    }
  },
  "calculationProperties": {
    "handlingDuration": {
      "title": "Handling Duration (Days)",
      "icon": "Clock",
      "description": "The amount of time in days from issue creation to issue resolution",
      "calculation": "if (.properties.resolutionDate != null and .properties.created != null) then ((.properties.resolutionDate[0:19] + \"Z\" | fromdateiso8601) - (.properties.created[0:19] + \"Z\" | fromdateiso8601)) / 86400 else null end",
      "type": "number"
    }
  },
  "mirrorProperties": {},
  "aggregationProperties": {},
  "relations": {
    "project": {
      "target": "jiraProject",
      "title": "Project",
      "description": "The Jira project that contains this issue",
      "required": false,
      "many": false
    },
    "parentIssue": {
      "target": "jiraIssue",
      "title": "Parent Issue",
      "required": false,
      "many": false
    },
    "subtasks": {
      "target": "jiraIssue",
      "title": "Subtasks",
      "required": false,
      "many": true
    },
    "assignee": {
      "target": "jiraUser",
      "title": "Assignee",
      "required": false,
      "many": false
    },
    "reporter": {
      "target": "jiraUser",
      "title": "Reporter",
      "required": false,
      "many": false
    }
  }
}
```

</details>

:::note Sprints field in issues payload response
On the issue response returned by calling the Jira issues API, sprints is returned as an array of sprints:

<details>
<summary><b>Sprints field in Jira API response (Click to expand)</b></summary>

```json showLineNumbers
{
  . . .,
  "customfield_11111": [
      {
          "id": 37,
          "name": "Sprint 32",
          "state": "closed",
          "boardId": 1,
          "goal": "",
          "startDate": "2024-07-08T11:59:07.316Z",
          "endDate": "2024-07-28T21:00:00.000Z",
          "completeDate": "2024-07-29T14:04:34.397Z"
      },
      {
          "id": 38,
          "name": "Sprint 33",
          "state": "closed",
          "boardId": 1,
          "goal": "",
          "startDate": "2024-07-29T14:05:25.295Z",
          "endDate": "2024-08-18T23:06:20.000Z",
          "completeDate": "2024-08-20T09:19:48.396Z"
      },
      {
          "id": 40,
          "name": "Sprint 34",
          "state": "closed",
          "boardId": 1,
          "goal": "",
          "startDate": "2024-08-20T09:20:27.259Z",
          "endDate": "2024-09-08T20:30:00.000Z",
          "completeDate": "2024-09-10T13:50:01.871Z"
      },
      {
          "id": 42,
          "name": "Sprint 35",
          "state": "active",
          "boardId": 1,
          "goal": "",
          "startDate": "2024-09-10T13:51:44.000Z",
          "endDate": "2024-10-15T01:01:00.000Z"
      }
  ],
  . . .
}
```

</details>

For the purpose of this guide, we are simply retrieving the ID of the latest sprint.

:::


3. Add the mapping configuration for the `sprint` field

<details>
<summary><b>Issue with `sprint` field mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: issue
    selector:
      query: "true"
      jql: "statusCategory != Done"
    port:
      entity:
        mappings:
          identifier: .key
          title: .fields.summary
          blueprint: '"jiraIssue"'
          properties:
            url: (.self | split("/") | .[:3] | join("/")) + "/browse/" + .key
            status: .fields.status.name
            issueType: .fields.issuetype.name
            components: .fields.components
            assignee: .fields.assignee.emailAddress
            reporter: .fields.reporter.emailAddress
            creator: .fields.creator.emailAddress
            priority: .fields.priority.name
            // highlight-next-line
            sprint: .fields.customfield_11111[-1].name // ""
            created: .fields.created
            updated: .fields.updated
          relations:
            project: .fields.project.key
            parentIssue: .fields.parent.key
            subtasks: .fields.subtasks | map(.key)
```

Where `customfield_11111` is your sprint field.

</details>


4. Click on "Resync" and watch sprints information being pulled alongside issues data.


### Ingesting issues based on the current sprint

Ingesting only issues from the current sprint can be done by combining the `sprint` property with selector magic:

<details>
<summary><b>Issue from current sprint (Click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: issue
    selector:
      // highlight-next-line
      query: .fields.customfield_11111[-1].name == "Sprint 35"  # Replace "Sprint 35" with the name of the current sprint
      jql: "statusCategory != Done"
    port:
      entity:
        mappings:
          identifier: .key
          title: .fields.summary
          blueprint: '"jiraIssue"'
          properties:
            url: (.self | split("/") | .[:3] | join("/")) + "/browse/" + .key
            status: .fields.status.name
            issueType: .fields.issuetype.name
            components: .fields.components
            assignee: .fields.assignee.emailAddress
            reporter: .fields.reporter.emailAddress
            creator: .fields.creator.emailAddress
            priority: .fields.priority.name
            // highlight-next-line
            sprint: .fields.customfield_11111 | sort_by(.id) | .[-1].name // ""
            created: .fields.created
            updated: .fields.updated
          relations:
            project: .fields.project.key
            parentIssue: .fields.parent.key
            subtasks: .fields.subtasks | map(.key)
```

</details>

:::info Issues with blank Sprint values
If the `createMissingRelatedEntities` is set to `true`, issues with blank `Sprint` values and some empty/null properties will be created in Port.  
To avoid this, set `createMissingRelatedEntities` to `false`.
:::


## Limitations

### Getting user emails from Jira

By default, Jira does not attach user emails to its API responses. For example, when making an API request to Jira to get an issue, fields such as `assignee`, `creator`, `reporter` and other user fields, will only include information such as the internal user ID and user display name, but not the user email.

In order to display the user email in API responses (and also use that data in the mapping from Jira to Port), follow these steps:

**Verify your domain in Jira:**

- Go to the [Jira admin panel](https://admin.atlassian.com/).
- Go to the **Settings** tab.
- Select **Domains** in the sidebar on the left.
- If your domain (for example - `acme.com`) does not appear in the list, click on **Add domain**.
- Enter your domain name and click on **Next**.
- Verify your domain ownership in whichever way is convenient for you.

When you are done, you will see in the domain menu that your domain is listed, and its status is `VERIFIED` under the **Domain status** column.

**Claim your Jira user accounts:**

- Go to the [Jira admin panel](https://admin.atlassian.com/).
- Go to the **Settings** tab.
- Select **Domains** in the sidebar on the left.
- Find your verified domain in the list whose accounts need to be claimed.
- Click the 3 horizontal dots (`...`) under the **Actions** column.
- Select **Claim accounts**.
- You will receive an email from Jira when the claim process is complete.

That's it! Now Jira API responses will include the `emailAddress` field when returning a user from Jira.

:::tip Jira docs
All of the steps outlined here are also available in [Jira's documentation](https://support.atlassian.com/user-management/docs/verify-a-domain-to-manage-accounts/)
:::

### OAuth account password change

When installing the integration [via OAuth](/build-your-software-catalog/sync-data-to-catalog/project-management/jira/?oauth=oauth#setup):  

If the password of the account used to authenticate with Jira changes, the integration will need to be **reinstalled**.  
This is because the Jira API requires the use of an API token for authentication, and the token is generated using the account's password.

## Examples

To view and test the integration's mapping against examples of the third-party API responses, use the **jq playground** in your [data sources page](https://app.getport.io/settings/data-sources). Find the integration in the list of data sources and click on it to open the playground.

Additional examples of blueprints and the relevant integration configurations can be found on the jira [examples page](examples.md)


## Let's Test It

This section includes a sample response data from Jira. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Jira:

<details>
<summary> Project response data (Click to expand)</summary>

```json showLineNumbers
{
  "expand": "description,lead,issueTypes,url,projectKeys,permissions,insight",
  "self": "https://myaccount.atlassian.net/rest/api/3/project/10000",
  "id": "10000",
  "key": "PA",
  "name": "Port-AI",
  "avatarUrls": {
    "48x48": "https://myaccount.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10413",
    "24x24": "https://myaccount.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10413?size=small",
    "16x16": "https://myaccount.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10413?size=xsmall",
    "32x32": "https://myaccount.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10413?size=medium"
  },
  "projectTypeKey": "software",
  "simplified": true,
  "style": "next-gen",
  "isPrivate": false,
  "properties": {},
  "entityId": "7f4f8d6f-705b-4074-84be-46f0d012cd8e",
  "uuid": "7f4f8d6f-705b-4074-84be-46f0d012cd8e"
}
```

</details>

<details>
<summary>User response data (Click to expand)</summary>

<JiraUserExampleResponse/>

</details>


<details>
<summary><b>Team response data (Click to expand)</b></summary>

<JiraTeamExampleResponse/>

</details>

<details>
<summary><b>Issue response data (Click to expand)</b></summary>

```json showLineNumbers
{
  "expand": "operations,versionedRepresentations,editmeta,changelog,customfield_10010.requestTypePractice,renderedFields",
  "id": "10000",
  "self": "https://myaccount.atlassian.net/rest/api/3/issue/10000",
  "key": "PA-1",
  "fields": {
    "statuscategorychangedate": "2023-11-06T11:02:59.341+0000",
    "issuetype": {
      "self": "https://myaccount.atlassian.net/rest/api/3/issuetype/10001",
      "id": "10001",
      "description": "Tasks track small, distinct pieces of work.",
      "iconUrl": "https://myaccount.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10318?size=medium",
      "name": "Task",
      "subtask": false,
      "avatarId": 10318,
      "entityId": "a7309bf9-70c5-4237-bdaf-0261037b6ecc",
      "hierarchyLevel": 0
    },
    "timespent": "None",
    "customfield_10030": "None",
    "project": {
      "self": "https://myaccount.atlassian.net/rest/api/3/project/10000",
      "id": "10000",
      "key": "PA",
      "name": "Port-AI",
      "projectTypeKey": "software",
      "simplified": true,
      "avatarUrls": {
        "48x48": "https://myaccount.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10413",
        "24x24": "https://myaccount.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10413?size=small",
        "16x16": "https://myaccount.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10413?size=xsmall",
        "32x32": "https://myaccount.atlassian.net/rest/api/3/universal_avatar/view/type/project/avatar/10413?size=medium"
      }
    },
    "customfield_10031": "None",
    "customfield_10032": "None",
    "fixVersions": [],
    "aggregatetimespent": "None",
    "resolution": "None",
    "customfield_10027": "None",
    "customfield_10028": "None",
    "customfield_10029": "None",
    "resolutiondate": "None",
    "workratio": -1,
    "watches": {
      "self": "https://myaccount.atlassian.net/rest/api/3/issue/PA-1/watchers",
      "watchCount": 1,
      "isWatching": true
    },
    "lastViewed": "None",
    "created": "2023-11-06T11:02:59.000+0000",
    "customfield_10020": "None",
    "customfield_10021": "None",
    "customfield_10022": "None",
    "priority": {
      "self": "https://myaccount.atlassian.net/rest/api/3/priority/3",
      "iconUrl": "https://myaccount.atlassian.net/images/icons/priorities/medium.svg",
      "name": "Medium",
      "id": "3"
    },
    "customfield_10023": "None",
    "customfield_10024": "None",
    "customfield_10025": "None",
    "labels": ["infra"],
    "customfield_10026": "None",
    "customfield_10016": "None",
    "customfield_10017": "None",
    "customfield_10018": {
      "hasEpicLinkFieldDependency": false,
      "showField": false,
      "nonEditableReason": {
        "reason": "PLUGIN_LICENSE_ERROR",
        "message": "The Parent Link is only available to Jira Premium users."
      }
    },
    "customfield_10019": "0|hzzzzz:",
    "timeestimate": "None",
    "aggregatetimeoriginalestimate": "None",
    "versions": [],
    "issuelinks": [],
    "assignee": {
      "self": "https://myaccount.atlassian.net/rest/api/3/user?accountId=712020%3A05acda87-42da-44d8-b21e-f71a508e5d11",
      "accountId": "712020:05acda87-42da-44d8-b21e-f71a508e5d11",
      "emailAddress": "username@example.com.io",
      "avatarUrls": {
        "48x48": "https://secure.gravatar.com/avatar/0d5d34ceb820d324d69046a1b2f51dc0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-3.png",
        "24x24": "https://secure.gravatar.com/avatar/0d5d34ceb820d324d69046a1b2f51dc0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-3.png",
        "16x16": "https://secure.gravatar.com/avatar/0d5d34ceb820d324d69046a1b2f51dc0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-3.png",
        "32x32": "https://secure.gravatar.com/avatar/0d5d34ceb820d324d69046a1b2f51dc0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-3.png"
      },
      "displayName": "User Name",
      "active": true,
      "timeZone": "UTC",
      "accountType": "atlassian"
    },
    "updated": "2023-11-06T11:03:18.244+0000",
    "status": {
      "self": "https://myaccount.atlassian.net/rest/api/3/status/10000",
      "description": "",
      "iconUrl": "https://myaccount.atlassian.net/",
      "name": "To Do",
      "id": "10000",
      "statusCategory": {
        "self": "https://myaccount.atlassian.net/rest/api/3/statuscategory/2",
        "id": 2,
        "key": "new",
        "colorName": "blue-gray",
        "name": "To Do"
      }
    },
    "components": [],
    "timeoriginalestimate": "None",
    "description": "None",
    "customfield_10010": "None",
    "customfield_10014": "None",
    "customfield_10015": "None",
    "customfield_10005": "None",
    "customfield_10006": "None",
    "security": "None",
    "customfield_10007": "None",
    "customfield_10008": "None",
    "aggregatetimeestimate": "None",
    "customfield_10009": "None",
    "summary": "Setup infra",
    "creator": {
      "self": "https://myaccount.atlassian.net/rest/api/3/user?accountId=712020%3A05acda87-42da-44d8-b21e-f71a508e5d11",
      "accountId": "712020:05acda87-42da-44d8-b21e-f71a508e5d11",
      "emailAddress": "username@example.com.io",
      "avatarUrls": {
        "48x48": "https://secure.gravatar.com/avatar/0d5d34ceb820d324d69046a1b2f51dc0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-3.png",
        "24x24": "https://secure.gravatar.com/avatar/0d5d34ceb820d324d69046a1b2f51dc0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-3.png",
        "16x16": "https://secure.gravatar.com/avatar/0d5d34ceb820d324d69046a1b2f51dc0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-3.png",
        "32x32": "https://secure.gravatar.com/avatar/0d5d34ceb820d324d69046a1b2f51dc0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-3.png"
      },
      "displayName": "User Name",
      "active": true,
      "timeZone": "UTC",
      "accountType": "atlassian"
    },
    "subtasks": [],
    "reporter": {
      "self": "https://myaccount.atlassian.net/rest/api/3/user?accountId=712020%3A05acda87-42da-44d8-b21e-f71a508e5d11",
      "accountId": "712020:05acda87-42da-44d8-b21e-f71a508e5d11",
      "emailAddress": "username@example.com.io",
      "avatarUrls": {
        "48x48": "https://secure.gravatar.com/avatar/0d5d34ceb820d324d69046a1b2f51dc0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-3.png",
        "24x24": "https://secure.gravatar.com/avatar/0d5d34ceb820d324d69046a1b2f51dc0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-3.png",
        "16x16": "https://secure.gravatar.com/avatar/0d5d34ceb820d324d69046a1b2f51dc0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-3.png",
        "32x32": "https://secure.gravatar.com/avatar/0d5d34ceb820d324d69046a1b2f51dc0?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-3.png"
      },
      "displayName": "User Name",
      "active": true,
      "timeZone": "UTC",
      "accountType": "atlassian"
    },
    "aggregateprogress": {
      "progress": 0,
      "total": 0
    },
    "customfield_10001": "None",
    "customfield_10002": "None",
    "customfield_10003": "None",
    "customfield_10004": "None",
    "environment": "None",
    "duedate": "None",
    "progress": {
      "progress": 0,
      "total": 0
    },
    "votes": {
      "self": "https://myaccount.atlassian.net/rest/api/3/issue/PA-1/votes",
      "votes": 0,
      "hasVoted": false
    }
  }
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> Project entity in Port (Click to expand)</summary>

```json showLineNumbers
{
  "identifier": "PA",
  "title": "Port-AI",
  "icon": "Jira",
  "blueprint": "jiraProject",
  "team": [],
  "properties": {
    "url": "https://myaccount.atlassian.net/projects/PA",
    "totalIssues": 100
  },
  "relations": {},
  "createdAt": "2023-11-06T11:22:05.433Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-11-06T11:22:05.433Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary>User entity in Port (Click to expand)</summary>

<JiraUserEntity/>

</details>

<details>
<summary>Team entity in Port</summary>

<JiraTeamEntity/>

</details>

<details>
<summary>Issue entity in Port (Click to expand)</summary>

<JiraIssueEntity/>

</details>


## Relevant Guides

For relevant guides and examples, see the [guides section](https://docs.port.io/guides?tags=Jira).

## Alternative installation via webhook

While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest data from Jira. If so, use the following instructions:

**Note** that when using this method, data will be ingested into Port only when the webhook is triggered.

<details>

<summary><b>Webhook installation (click to expand)</b></summary>

In this example you are going to create a webhook integration between [Jira](https://www.atlassian.com/software/jira) and Port, which will ingest Jira issue entities.

<h2>Port configuration </h2>

Create the following blueprint definition:

<details>
<summary>Jira issue blueprint (Click to expand)</summary>

<JiraIssueBlueprint/>

</details>

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

<details>
<summary>Jira issue webhook configuration (Click to expand)</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Jira mapper`;
   2. Identifier : `jira_mapper`;
   3. Description : `A webhook configuration to map Jira issues to Port`;
   4. Icon : `Jira`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <JiraIssueConfiguration/>

3. Click **Save** at the bottom of the page.

</details>

<h2> Create a webhook in Jira </h2>

1. Log in to Jira as a user with the Administer Jira global permission;
2. Click the gear icon at the top right corner;
3. Choose **System**;
4. At the bottom of the sidebar on the left, under **Advanced**, choose **WebHooks**;
5. Click on **Create a WebHook**
6. Input the following details:
   1. `Name` - use a meaningful name such as Port Webhook;
   2. `Status` - be sure to keep the webhook **Enabled**;
   3. `Webhook URL` - enter the value of the `url` key you received after creating the webhook configuration;
   4. `Description` - enter a description for the webhook;
   5. `Issue related events` - enter a JQL query in this section to filter the issues that get sent to the webhook (if you leave this field empty, all issues will trigger a webhook event);
   6. Under `Issue` - mark created, updated and delete;
7. Click **Create** at the bottom of the page.

:::tip Jira events and payload
In order to view the different payloads and events available in Jira webhooks, [look here](https://developer.atlassian.com/server/jira/platform/webhooks/)
:::

Done! any change you make to an issue (open, close, edit, etc.) will trigger a webhook event that Jira will send to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

<h2>Let's Test It </h2>

This section includes a sample webhook event sent from Jira when an issue is created or updated. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

<h3>Payload </h3>

Here is an example of the payload structure sent to the webhook URL when a Jira issue is created:

<details>
<summary> Webhook event payload (Click to expand)</summary>

```json showLineNumbers
{
  "timestamp": 1686916266116,
  "webhookEvent": "jira:issue_created",
  "issue_event_type_name": "issue_created",
  "user": {
    "self": "https://account.atlassian.net/rest/api/2/user?accountId=557058%3A69f39959-769f-4dac-8a7a-46eb55b03723",
    "accountId": "557058%3A69f39959-769f-4dac-8a7a-46eb55b03723",
    "emailAddress":"shadow@atlassian.com",
    "avatarUrls": {
      "48x48": "https://secure.gravatar.com/avatar/9df2ac1caa70b0a67ff0561f7d0363e5?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-1.png"
    },
    "displayName": "Your Name",
    "active": true,
    "timeZone": "Europe/London",
    "accountType": "atlassian"
  },
  "issue": {
    "id": "10000",
    "self": "https://account.atlassian.net/rest/api/2/10000",
    "key": "PI-1",
    "fields": {
      "statuscategorychangedate": "2023-06-16T11:51:06.277+0000",
      "issuetype": {
        "self": "https://account.atlassian.net/rest/api/2/issuetype/10002",
        "id": "10002",
        "description": "Epics track collections of related bugs, stories, and tasks.",
        "iconUrl": "https://account.atlassian.net/rest/api/2/universal_avatar/view/type/issuetype/avatar/10307?size=medium",
        "name": "Epic",
        "subtask": false,
        "avatarId": 10307,
        "entityId": "66c6d416-6eb4-4b38-92fa-9a7d68c64165",
        "hierarchyLevel": 1
      },
      "timespent": "None",
      "project": {
        "self": "https://account.atlassian.net/rest/api/2/project/10000",
        "id": "10000",
        "key": "PI",
        "name": "Port Integration",
        "projectTypeKey": "software",
        "simplified": true,
        "avatarUrls": {
          "48x48": "https://account.atlassian.net/rest/api/2/universal_avatar/view/type/project/avatar/10413"
        }
      },
      "fixVersions": [],
      "aggregatetimespent": "None",
      "resolution": "None",
      "resolutiondate": "None",
      "workratio": -1,
      "watches": {
        "self": "https://account.atlassian.net/rest/api/2/issue/PI-1/watchers",
        "watchCount": 0,
        "isWatching": false
      },
      "issuerestriction": {
        "issuerestrictions": {},
        "shouldDisplay": true
      },
      "lastViewed": "None",
      "created": "2023-06-16T11:51:05.291+0000",
      "priority": {
        "self": "https://account.atlassian.net/rest/api/2/priority/3",
        "iconUrl": "https://account.atlassian.net/images/icons/priorities/medium.svg",
        "name": "Medium",
        "id": "3"
      },
      "labels": ["cloud", "infra"],
      "issuelinks": [],
      "assignee": {
        "self": "https://account.atlassian.net/rest/api/2/user?accountId=557058%3A69f39947-769f-4dac-8a7a-46eb55b03705",
        "accountId": "557058:69f39947-769f-4dac-8a7a-46eb55b03705",
        "emailAddress":"shadow@atlassian.com",
        "avatarUrls": {
          "48x48": "https://secure.gravatar.com/avatar/9df2ac1caa70b0a67ff0561f7d0363e5?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-1.png"
        },
        "displayName": "Your Name",
        "active": true,
        "timeZone": "Europe/London",
        "accountType": "atlassian"
      },
      "updated": "2023-06-16T11:51:05.291+0000",
      "status": {
        "self": "https://account.atlassian.net/rest/api/2/status/10000",
        "description": "",
        "iconUrl": "https://account.atlassian.net/",
        "name": "To Do",
        "id": "10000",
        "statusCategory": {
          "self": "https://account.atlassian.net/rest/api/2/statuscategory/2",
          "id": 2,
          "key": "new",
          "colorName": "blue-gray",
          "name": "New"
        }
      },
      "components": [],
      "timeoriginalestimate": "None",
      "description": "We need to migrate our current infrastructure from in-house to the cloud",
      "attachment": [],
      "summary": "Migrate Infra to Cloud",
      "creator": {
        "self": "https://account.atlassian.net/rest/api/2/user?accountId=557058%3A69f39947-769f-4dac-8a7a-46eb55b03705",
        "accountId": "557058:69f39947-769f-4dac-8a7a-46eb55b03705",
        "emailAddress":"shadow@atlassian.com",
        "avatarUrls": {
          "48x48": "https://secure.gravatar.com/avatar/9df2ac1caa70b0a67ff0561f7d0363e5?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-1.png"
        },
        "displayName": "Your Name",
        "active": true,
        "timeZone": "Europe/London",
        "accountType": "atlassian"
      },
      "subtasks": [],
      "reporter": {
        "self": "https://account.atlassian.net/rest/api/2/user?accountId=557058%3A69f39947-769f-4dac-8a7a-46eb55b03705",
        "accountId": "557058:69f39947-769f-4dac-8a7a-46eb55b03705",
        "emailAddress":"shadow@atlassian.com",
        "avatarUrls": {
          "48x48": "https://secure.gravatar.com/avatar/9df2ac1caa70b0a67ff0561f7d0363e5?d=https%3A%2F%2Favatar-management--avatars.us-west-2.prod.public.atl-paas.net%2Finitials%2FIC-1.png"
        },
        "displayName": "Your Name",
        "active": true,
        "timeZone": "Europe/London",
        "accountType": "atlassian"
      },
      "aggregateprogress": {
        "progress": 0,
        "total": 0
      },
      "environment": "None",
      "duedate": "2023-06-19",
      "progress": {
        "progress": 0,
        "total": 0
      },
      "votes": {
        "self": "https://account.atlassian.net/rest/api/2/issue/PI-1/votes",
        "votes": 0,
        "hasVoted": false
      }
    }
  },
  "changelog": {
    "id": "10001",
    "items": [
      {
        "field": "status",
        "fieldtype": "jira",
        "fieldId": "status",
        "from": "10000",
        "fromString": "To Do",
        "to": "10001",
        "toString": "In Progress"
      }
    ]
  }
}
```

</details>

<h3>Mapping Result </h3>

The combination of the sample payload and the webhook configuration generates the following Port entity:

```json showLineNumbers
{
  "identifier": "PI-1",
  "title": "PI-1 - Migrate Infra to Cloud",
  "blueprint": "jiraIssue",
  "properties": {
    "summary": "Migrate Infra to Cloud",
    "description": "We need to migrate our current infrastructure from in-house to the cloud",
    "status": "To Do",
    "lastChangeType": "issue_created",
    "changingUser": "Your Name",
    "issueUrl": "https://account.atlassian.net/browse/PI-1",
    "issueType": "Epic"
  },
  "relations": {}
}
```

<h2>Import Jira Historical Issues </h2>

In this example you are going to use the provided Python script to fetch data from the Jira API and ingest it to Port.

<h3>Prerequisites </h3>

This example utilizes the same [blueprint and webhook](#prerequisites) definition from the previous section.

In addition, it requires a Jira API token that is provided as a parameter to the Python script

<h4>Create the Jira API token </h4>

1. Log in to your [Jira account](https://id.atlassian.com/manage-profile/security/api-tokens).
2. Click Create API token.
3. From the dialog that appears, enter a memorable and concise Label for your token and click **Create**.
4. Make sure to configure the [required scopes](#required-api-token-scopes) for the token.
5. Click **Copy** to copy the token to your clipboard, you will not have another opportunity to view the token value after you leave this page.

Use the following Python script to ingest historical Jira issues into port:

<details>
<summary>Jira Python script for historical issues (Click to expand)</summary>

<JiraIssueConfigurationPython/>

:::note Environment variables requirement

The script requires the following environment variables:

- `PORT_URL` - the webhook URL generated by Port after creating the webhook configuration;
- `JIRA_SERVER` - your Jira domain, for example `https://{YOUR_DOMAIN}.atlassian.net`;
- `USERNAMES` - your Jira username;
- `API_TOKEN` - your Jira API token (created in the previous step).

:::

</details>

Done! you can now import historical issues from Jira into Port. Port will parse the issues according to the mapping and update the catalog entities accordingly.

</details>
