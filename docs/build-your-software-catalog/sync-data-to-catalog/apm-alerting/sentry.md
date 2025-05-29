import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import AzurePremise from "../templates/\_ocean_azure_premise.mdx"
import DockerParameters from "./\_sentry-docker-parameters.mdx"
import AdvancedConfig from '../../../generalTemplates/\_ocean_advanced_configuration_note.md'
import SentryCommentsBlueprint from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/sentry/\_example_sentry_comments_blueprint.mdx";
import SentryCommentsConfiguration from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/sentry/\_example_sentry_comment_webhook_configuration.mdx"
import SentryIssuesBluePrint from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/sentry/\_example_sentry_issue_event_blueprint.mdx"
import SentryIssuesConfiguration from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/sentry/\_example_sentry_issue_event_webhook_configuration.mdx"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"


# Sentry

Port's Sentry integration allows you to model Sentry resources in your software catalog and ingest data into them.


## Overview

This integration allows you to:

- Map and organize your desired Sentry resources and their metadata in Port (see supported resources below).
- Watch for Sentry object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in Port.

### Supported Resources

The resources that can be ingested from Sentry into Port are listed below. It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [`User`](https://docs.sentry.io/api/organizations/list-an-organizations-members/)
- [`Team`](https://docs.sentry.io/api/teams/list-an-organizations-teams/) - when enabled, the integration enrich the team resource with members using the [team member API](https://docs.sentry.io/api/teams/list-a-teams-members/)
- [`Project`](https://docs.sentry.io/api/projects/list-your-projects/)
- [`Issue`](https://docs.sentry.io/api/events/list-a-projects-issues/)
- [`Project Tag`](https://docs.sentry.io/api/projects/list-a-tags-values/)
- [`Issue Tag`](https://docs.sentry.io/api/events/list-a-tags-values-related-to-an-issue/)

## Setup

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation/>

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)">

Using this installation option means that the integration will be able to update Port in real time using webhooks.


<h2> Prerequisites </h2>

<Prerequisites />

For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>

<OceanRealtimeInstallation integration="Sentry" />

<PortApiRegionTip/>

</TabItem>

<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-sentry-integration` in your git repository with the content:

:::note
Remember to replace the placeholders for `SENTRY_HOST` `SENTRY_ORGANIZATION` and `SENTRY_TOKEN`.
:::
```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-sentry-integration
  type: sentry
  eventListener:
    type: POLLING
  config:
  // highlight-start
    sentryHost: SENTRY_HOST
    sentryOrganization: SENTRY_ORGANIZATION
  // highlight-end
  secrets:
  // highlight-next-line
    sentryToken: SENTRY_TOKEN
```
<br/>

2. Install the `my-ocean-sentry-integration` ArgoCD Application by creating the following `my-ocean-sentry-integration.yaml` manifest:
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
  name: my-ocean-sentry-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-sentry-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.1.14
    helm:
      valueFiles:
      - $values/argocd/my-ocean-sentry-integration/values.yaml
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
kubectl apply -f my-ocean-sentry-integration.yaml
```
</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.
Note the parameters specific to this integration, they are last in the table.

| Parameter                               | Description                                                                                                                                            | Required |
|-----------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `port.clientId`                         | Your port client id                                                                                                                                    | ✅        |
| `port.clientSecret`                     | Your port client secret                                                                                                                                | ✅        |
| `port.baseUrl`                          | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                | ✅        |
| `integration.identifier`                | Change the identifier to describe your integration                                                                                                     | ✅        |
| `integration.type`                      | The integration type                                                                                                                                   | ✅        |
| `integration.eventListener.type`        | The event listener type                                                                                                                                | ✅        |
| `scheduledResyncInterval`               | The number of minutes between each resync                                                                                                              | ❌        |
| `initializePortResources`               | Default true, When set to true the integration will create default blueprints and the port App config Mapping                                          | ❌        |
| `integration.secrets.sentryToken`       | The Sentry API [token](https://docs.sentry.io/api/guides/create-auth-token/). The token requires `read` permissions for `Member`, `Team`, `Organization`, `Project` and `Issue & Event` | ✅        |
| `integration.config.sentryHost`         | The Sentry host. For example https://sentry.io                                                                                                         | ✅        |
| `integration.config.sentryOrganization` | The Sentry organization slug. For example `acme` from `https://acme.sentry.io`                                                                         | ✅        |


<br/>

<AdvancedConfig/>

<h3>Event listener</h3>

The integration uses polling to pull the configuration from Port every minute and check it for changes. If there is a change, a resync will occur.

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the Sentry integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates 
If you want the integration to update Port in real time you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option
:::

 <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `sentry-integration.yml` workflow file:

```yaml showLineNumbers
name: Sentry Exporter Workflow

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
          type: 'sentry'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            sentry_token: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN }}
            sentry_host: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SENTRY_HOST }}
            sentry_organization: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">

:::tip
Your Jenkins agent should be able to run docker commands.
:::

Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/) of `Secret Text` type:

<DockerParameters />

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```yml showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run Sentry Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__SENTRY_HOST', variable: 'OCEAN__INTEGRATION__CONFIG__SENTRY_HOST'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION', variable: 'OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="sentry"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN=$OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN \
                                -e OCEAN__INTEGRATION__CONFIG__SENTRY_HOST=$OCEAN__INTEGRATION__CONFIG__SENTRY_HOST \
                                -e OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION=$OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION \
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

Here is an example for `sentry-integration.yml` pipeline file:

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
    integration_type="sentry"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm \
       -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
      -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
      -e OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN=$(OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN) \
      -e OCEAN__INTEGRATION__CONFIG__SENTRY_HOST=$(OCEAN__INTEGRATION__CONFIG__SENTRY_HOST) \
      -e OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION=$(OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION) \
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
  INTEGRATION_TYPE: sentry
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
        -e OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN=$OCEAN__INTEGRATION__CONFIG__SENTRY_TOKEN \
        -e OCEAN__INTEGRATION__CONFIG__SENTRY_HOST=$OCEAN__INTEGRATION__CONFIG__SENTRY_HOST \
        -e OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION=$OCEAN__INTEGRATION__CONFIG__SENTRY_ORGANIZATION \
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
- kind: user
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .email
        title: .user.name
        blueprint: '"sentryUser"'
        properties:
          username: .user.username
          isActive: .user.isActive
          dateJoined: .user.dateJoined
          lastLogin: .user.lastLogin
          orgRole: .orgRole
          inviteStatus: .inviteStatus
- kind: user
  selector:
    query: 'true'
  port:
    entity:
      mappings:
        identifier: .email
        blueprint: '"_user"'
        relations:
          sentry_user: .email
- kind: project-tag
  selector:
    query: 'true'
    tag: environment
  port:
    entity:
      mappings:
        identifier: .slug + "-" + .__tags.name
        title: .name + "-" + .__tags.name
        blueprint: '"sentryProjectEnvironment"'
        properties:
          dateCreated: .dateCreated
          platform: .platform
          status: .status
          link: .organization.links.organizationUrl + "/projects/" + .name
- kind: issue-tag
  selector:
    query: 'true'
    tag: environment
  port:
    itemsToParse: .__tags
    entity:
      mappings:
        identifier: .id + "-" + .item.name
        title: .title + " -" + " " + .item.name
        blueprint: '"sentryIssue"'
        properties:
          link: .permalink + "?environment=" + .item.name
          status: .status
          isUnhandled: .isUnhandled
        relations:
          projectEnvironment: (.project.slug as $slug | .item | "\($slug)-\(.name)")
          assignee:
            combinator: '"and"'
            rules:
            - operator: '"="'
              property: '"$identifier"'
              value: .assignedTo.email
- kind: team
  selector:
    query: 'true'
    includeMembers: true
  port:
    entity:
      mappings:
        identifier: .slug
        title: .name
        blueprint: '"sentryTeam"'
        properties:
          dateCreated: .dateCreated
          memberCount: .memberCount
          roles: .teamRole
          projects: .projects | map (.slug)
        relations:
          members: if .__members != null then .__members | map(.user.email) | map(select(. != null)) else [] end
```

</details>




## Examples

Examples of blueprints and the relevant integration configurations:

### User

<details>
<summary>User blueprint</summary>

```json showLineNumbers
{
  "identifier": "sentryUser",
  "description": "This blueprint represents a Sentry user in our software catalog.",
  "title": "Sentry User",
  "icon": "Sentry",
  "schema": {
    "properties": {
      "username": {
        "type": "string",
        "title": "Username"
      },
      "isActive": {
        "type": "boolean",
        "title": "Is Active"
      },
      "dateJoined": {
        "type": "string",
        "format": "date-time",
        "title": "Date Joined"
      },
      "lastLogin": {
        "type": "string",
        "format": "date-time",
        "title": "Last Login"
      },
      "orgRole": {
        "icon": "DefaultProperty",
        "title": "Organization Role",
        "type": "string",
        "enum": [
          "member",
          "admin",
          "owner",
          "manager",
          "biling"
        ],
        "enumColors": {
          "member": "pink",
          "admin": "green",
          "owner": "green",
          "manager": "yellow",
          "biling": "lightGray"
        }
      },
      "inviteStatus": {
        "type": "string",
        "title": "Invite Status",
        "icon": "DefaultProperty"
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
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: user
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .email
          title: .user.name
          blueprint: '"sentryUser"'
          properties:
            username: .user.username
            isActive: .user.isActive
            dateJoined: .user.dateJoined
            lastLogin: .user.lastLogin
            orgRole: .orgRole
            inviteStatus: .inviteStatus
```

</details>


### Team

<details>
<summary>Team blueprint</summary>

```json showLineNumbers
{
  "identifier": "sentryTeam",
  "description": "This blueprint represents an Sentry team in our software catalog",
  "title": "Sentry Team",
  "icon": "Sentry",
  "schema": {
    "properties": {
      "dateCreated": {
        "type": "string",
        "title": "Date Created",
        "format": "date-time"
      },
      "memberCount": {
        "type": "number",
        "title": "Number of Members"
      },
      "roles": {
        "type": "string",
        "title": "Roles"
      },
      "projects": {
        "items": {
          "type": "string"
        },
        "type": "array",
        "title": "Projects"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "members": {
      "title": "Members",
      "target": "sentryUser",
      "required": false,
      "many": true
    }
  }
}
```

</details>

<details>
<summary>Integration configuration</summary>

:::tip Enable Team Members
The `includeMembers` flag is used to decide enrich the teams response with details about the members of the team. To turn this feature off, set it to `false`.
:::

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: team
    selector:
      query: 'true'
      includeMembers: true
    port:
      entity:
        mappings:
          identifier: .slug
          title: .name
          blueprint: '"sentryTeam"'
          properties:
            dateCreated: .dateCreated
            memberCount: .memberCount
            roles: .teamRole
            projects: .projects | map (.slug)
          relations:
            members: if .__members != null then .__members | map(.user.email) | map(select(. != null)) else [] end
```

</details>


### Project

<details>
<summary>Project blueprint</summary>

```json showLineNumbers
{
  "identifier": "sentryProject",
  "title": "Sentry Project",
  "icon": "Sentry",
  "schema": {
    "properties": {
      "dateCreated": {
        "title": "Date Created",
        "type": "string",
        "format": "date-time"
      },
      "platform": {
        "type": "string",
        "title": "Platform"
      },
      "status": {
        "title": "Status",
        "type": "string",
        "enum": [
          "active",
          "disabled",
          "pending_deletion",
          "deletion_in_progress"
        ]
      },
      "link": {
        "title": "Link",
        "type": "string",
        "format": "url"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {}
}
```

</details>

<details>
<summary>Integration configuration</summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: project
    selector:
      query: "true"
    port:
      entity:
        mappings:
          identifier: .slug
          title: .name
          blueprint: '"sentryProject"'
          properties:
            dateCreated: .dateCreated
            platform: .platform
            status: .status
            link: .organization.links.organizationUrl + "/projects/" + .name
```

</details>

### Issue

<details>
<summary>Issue blueprint</summary>

```json showLineNumbers
{
  "identifier": "sentryIssue",
  "title": "Sentry Issue",
  "icon": "Sentry",
  "schema": {
    "properties": {
      "link": {
        "title": "Link",
        "type": "string",
        "format": "url"
      },
      "status": {
        "title": "Status",
        "type": "string",
        "enum": [
          "resolved",
          "unresolved",
          "ignored",
          "reprocessing"
        ],
        "enumColors": {
          "resolved": "green",
          "unresolved": "red",
          "ignored": "lightGray",
          "reprocessing": "yellow"
        }
      },
      "isUnhandled": {
        "title": "isUnhandled",
        "type": "boolean"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "projectEnvironment": {
      "title": "Sentry Project",
      "target": "sentryProject",
      "required": false,
      "many": true
    },
    "assignedTo": {
      "title": "Assigned To",
      "target": "sentryUser",
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
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: issue
      selector:
        query: "true"
      port:
        entity:
          mappings:
            identifier: ".id"
            title: ".title"
            blueprint: '"sentryIssue"'
            properties:
              link: ".permalink"
              status: ".status"
              isUnhandled: ".isUnhandled"
            relations:
              projectEnvironment: ".project.slug"
              assignedTo: .assignedTo.email
```

</details>

### Project Environment

<details>
<summary>Project environment blueprint</summary>

```json showLineNumbers
{
  "identifier": "sentryProject",
  "title": "Sentry Project Environment",
  "icon": "Sentry",
  "schema": {
    "properties": {
      "dateCreated": {
        "title": "Date Created",
        "type": "string",
        "format": "date-time"
      },
      "platform": {
        "type": "string",
        "title": "Platform"
      },
      "status": {
        "title": "Status",
        "type": "string",
        "enum": [
          "active",
          "disabled",
          "pending_deletion",
          "deletion_in_progress"
        ]
      },
      "link": {
        "title": "Link",
        "type": "string",
        "format": "url"
      }
    },
    "required": []
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "team": {
      "title": "Team",
      "target": "sentryTeam",
      "required": false,
      "many": false
    }
  }
}
```

</details>

<details>
<summary>Integration configuration</summary>

:::tip Environment tags
The`selector.tag` key in the `project-tag` kind defines which Sentry tag data is synced to Port. In the configuration provided below, you will ingest all `environment` tag from your Sentry account to Port. For instance, if a Sentry project has 3 environments namely development, staging and production, this configuration will create 3 entities in the `Sentry Project Environment` catalog. You will then use the `issue-tag` kind to connect each issue to its environment.
:::

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: project-tag
    selector:
      query: "true"
      tag: "environment"
    port:
      entity:
        mappings:
          identifier: .slug + "-" + .__tags.name
          title: .name + "-" + .__tags.name
          blueprint: '"sentryProject"'
          properties:
            dateCreated: .dateCreated
            platform: .platform
            status: .status
            link: .organization.links.organizationUrl + "/projects/" + .name
          relations:
            team:
              combinator: '"and"'
              rules:
                - property: '"projects"'
                  operator: '"contains"'
                  value: .slug
  - kind: issue-tag
    selector:
      query: "true"
      tag: "environment"
    port:
      entity:
        mappings:
          identifier: .id
          title: .title
          blueprint: '"sentryIssue"'
          properties:
            link: .permalink
            status: .status
            isUnhandled: .isUnhandled
          relations:
            projectEnvironment: '[(.project.slug as $slug | .__tags[] | "\($slug)-\(.name)")]'
            assignedTo: .assignedTo.email
```

</details>

## Let's Test It

This section includes a sample response data from Sentry. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Sentry:

<details>
<summary> User response data</summary>

```json showLineNumbers
{
  "id": "10909027",
  "email": "developer@getport.io",
  "name": "Michael",
  "user": {
    "id": "1722098",
    "name": "Michael",
    "username": "developer@getport.io",
    "email": "developer@getport.io",
    "avatarUrl": "https://gravatar.com/avatar/9645cd28334383caa5efa6a681dddf7cba33f94ddaf234297ba13cb30d5c5718?s=32&d=mm",
    "isActive": true,
    "hasPasswordAuth": true,
    "isManaged": false,
    "dateJoined": "2022-01-18T22:38:13.946094Z",
    "lastLogin": "2024-11-10T23:25:31.826834Z",
    "has2fa": false,
    "lastActive": "2024-11-11T07:32:23.490455Z",
    "isSuperuser": false,
    "isStaff": false,
    "experiments": {},
    "emails": [
      {
        "id": "1861335",
        "email": "developer@getport.io",
        "is_verified": false
      }
    ],
    "avatar": {
      "avatarType": "letter_avatar",
      "avatarUuid": null,
      "avatarUrl": null
    }
  },
  "orgRole": "owner",
  "pending": false,
  "expired": false,
  "flags": {
    "idp:provisioned": false,
    "idp:role-restricted": false,
    "sso:linked": true,
    "sso:invalid": false,
    "member-limit:restricted": false,
    "partnership:restricted": false
  },
  "dateCreated": "2022-01-18T22:33:43.222734Z",
  "inviteStatus": "approved",
  "inviterName": "Port Admin",
  "role": "owner",
  "roleName": "Owner"
}
```

</details>

<details>
<summary> Team response data</summary>

```json showLineNumbers
{
  "id": "1275104",
  "slug": "platform-team",
  "name": "Developer Experience",
  "dateCreated": "2021-11-16T13:25:53.617157Z",
  "isMember": true,
  "teamRole": "contributor",
  "flags": {
    "idp:provisioned": false
  },
  "access": [
    "org:read",
    "alerts:read",
    "project:releases",
    "event:write",
    "event:read",
    "project:read",
    "team:read",
    "member:read"
  ],
  "hasAccess": true,
  "isPending": false,
  "memberCount": 43,
  "avatar": {
    "avatarType": "letter_avatar",
    "avatarUuid": null
  },
  "externalTeams": [],
  "projects": [
    {
      "id": "4504592557998080",
      "slug": "admin-service",
      "name": "admin-service",
      "platform": "node",
      "dateCreated": "2023-01-30T08:35:19.602158Z",
      "isBookmarked": false,
      "isMember": true,
      "features": [
        "first-event-severity-new-escalation",
        "minidump",
        "similarity-indexing",
        "similarity-view",
        "span-metrics-extraction",
        "span-metrics-extraction-addons",
        "releases"
      ],
      "firstEvent": null,
      "firstTransactionEvent": false,
      "access": [
        "org:read",
        "alerts:read",
        "project:releases",
        "event:write",
        "event:read",
        "project:read",
        "team:read",
        "member:read"
      ],
      "hasAccess": true,
      "hasCustomMetrics": false,
      "hasMinifiedStackTrace": false,
      "hasMonitors": false,
      "hasProfiles": false,
      "hasReplays": false,
      "hasFeedbacks": false,
      "hasNewFeedbacks": false,
      "hasSessions": false,
      "hasInsightsHttp": false,
      "hasInsightsDb": false,
      "hasInsightsAssets": false,
      "hasInsightsAppStart": false,
      "hasInsightsScreenLoad": false,
      "hasInsightsVitals": false,
      "hasInsightsCaches": false,
      "hasInsightsQueues": false,
      "hasInsightsLlmMonitoring": false,
      "isInternal": false,
      "isPublic": false,
      "avatar": {
        "avatarType": "letter_avatar",
        "avatarUuid": null
      },
      "color": "#3f8abf",
      "status": "active"
    },
    {
      "id": "4508444173533184",
      "slug": "oauth-service",
      "name": "oauth-service",
      "platform": "node-fastify",
      "dateCreated": "2024-12-10T13:51:48.350544Z",
      "isBookmarked": false,
      "isMember": true,
      "features": [
        "first-event-severity-new-escalation",
        "minidump",
        "similarity-indexing",
        "similarity-view",
        "span-metrics-extraction",
        "span-metrics-extraction-addons",
        "releases"
      ],
      "firstEvent": null,
      "firstTransactionEvent": false,
      "access": [
        "org:read",
        "alerts:read",
        "project:releases",
        "event:write",
        "event:read",
        "project:read",
        "team:read",
        "member:read"
      ],
      "hasAccess": true,
      "hasCustomMetrics": false,
      "hasMinifiedStackTrace": false,
      "hasMonitors": false,
      "hasProfiles": false,
      "hasReplays": false,
      "hasFeedbacks": false,
      "hasNewFeedbacks": false,
      "hasSessions": false,
      "hasInsightsHttp": false,
      "hasInsightsDb": false,
      "hasInsightsAssets": false,
      "hasInsightsAppStart": false,
      "hasInsightsScreenLoad": false,
      "hasInsightsVitals": false,
      "hasInsightsCaches": false,
      "hasInsightsQueues": false,
      "hasInsightsLlmMonitoring": false,
      "isInternal": false,
      "isPublic": false,
      "avatar": {
        "avatarType": "letter_avatar",
        "avatarUuid": null
      },
      "color": "#60bf3f",
      "status": "active"
    },
  ],
  "__members": [
    {
      "id": "11033546",
      "email": "danny@domain.io",
      "name": "danny@domain.io",
      "user": {
        "id": "1823521",
        "name": "danny@domain.io",
        "username": "6032da5ae6c84433bb139023b23e3774",
        "email": "danny@domain.io",
        "avatarUrl": "https://gravatar.com/avatar/6fd8727dde707fd7bbf59ddde0f2a803416b082a2ddf538f6edfb0f9535a6dec?s=32&d=mm",
        "isActive": true,
        "hasPasswordAuth": false,
        "isManaged": false,
        "dateJoined": "2022-03-21T09:44:08.054654Z",
        "lastLogin": "2024-12-09T07:42:25.535883Z",
        "has2fa": false,
        "lastActive": "2024-12-18T13:02:41.565988Z",
        "isSuperuser": false,
        "isStaff": false,
        "experiments": {},
        "emails": [
          {
            "id": "1965065",
            "email": "danny@domain.io",
            "is_verified": false
          }
        ],
        "avatar": {
          "avatarType": "letter_avatar",
          "avatarUuid": null,
          "avatarUrl": null
        }
      },
      "orgRole": "member",
      "pending": false,
      "expired": false,
      "flags": {
        "idp:provisioned": false,
        "idp:role-restricted": false,
        "sso:linked": true,
        "sso:invalid": false,
        "member-limit:restricted": false,
        "partnership:restricted": false
      },
      "dateCreated": "2022-03-21T09:44:09.037845Z",
      "inviteStatus": "approved",
      "inviterName": null,
      "role": "member",
      "roleName": "Member",
      "teamRole": null,
      "teamSlug": "getport"
    }

  ]
}
```

</details>

<details>
<summary> Project response data</summary>

```json showLineNumbers
{
  "id": "4504931759095808",
  "slug": "python-fastapi",
  "name": "python-fastapi",
  "platform": "python-fastapi",
  "dateCreated": "2023-03-31T06:18:37.290732Z",
  "isBookmarked": false,
  "isMember": false,
  "features": [
    "alert-filters",
    "minidump",
    "race-free-group-creation",
    "similarity-indexing",
    "similarity-view",
    "span-metrics-extraction",
    "span-metrics-extraction-resource",
    "releases"
  ],
  "firstEvent": "2023-03-31T06:25:54.666640Z",
  "firstTransactionEvent": false,
  "access": [],
  "hasAccess": true,
  "hasMinifiedStackTrace": false,
  "hasMonitors": false,
  "hasProfiles": false,
  "hasReplays": false,
  "hasFeedbacks": false,
  "hasSessions": false,
  "isInternal": false,
  "isPublic": false,
  "avatar": {
    "avatarType": "letter_avatar",
    "avatarUuid": null
  },
  "color": "#913fbf",
  "status": "active",
  "organization": {
    "id": "4504931754901504",
    "slug": "test-org",
    "status": {
      "id": "active",
      "name": "active"
    },
    "name": "Test Org",
    "dateCreated": "2023-03-31T06:17:33.619189Z",
    "isEarlyAdopter": false,
    "require2FA": false,
    "requireEmailVerification": false,
    "avatar": {
      "avatarType": "letter_avatar",
      "avatarUuid": null,
      "avatarUrl": null
    },
    "features": [
      "performance-tracing-without-performance",
      "performance-consecutive-http-detector",
      "performance-large-http-payload-detector",
      "escalating-issues",
      "minute-resolution-sessions",
      "performance-issues-render-blocking-assets-detector",
      "event-attachments"
    ],
    "links": {
      "organizationUrl": "https://test-org.sentry.io",
      "regionUrl": "https://us.sentry.io"
    },
    "hasAuthProvider": false
  }
}
```

</details>

<details>
<summary> Issue response data</summary>

```json showLineNumbers
{
  "id": "4605173695",
  "shareId": "None",
  "shortId": "PYTHON-FASTAPI-2",
  "title": "ZeroDivisionError: division by zero",
  "culprit": "index",
  "permalink": "https://test-org.sentry.io/issues/4605173695/",
  "logger": "None",
  "level": "error",
  "status": "unresolved",
  "statusDetails": {},
  "substatus": "new",
  "isPublic": false,
  "platform": "python",
  "project": {
    "id": "4504931759095808",
    "name": "python-fastapi",
    "slug": "python-fastapi",
    "platform": "python-fastapi"
  },
  "type": "error",
  "metadata": {
    "value": "division by zero",
    "type": "ZeroDivisionError",
    "filename": "app.py",
    "function": "index",
    "display_title_with_tree_label": false,
    "in_app_frame_mix": "mixed"
  },
  "numComments": 0,
  "assignedTo": {
    "email": "danny@domain.io",
    "id": "11033546",
    "name": "danny@domain.io"
  },
  "isBookmarked": false,
  "isSubscribed": false,
  "subscriptionDetails": "None",
  "hasSeen": false,
  "annotations": [],
  "issueType": "error",
  "issueCategory": "error",
  "isUnhandled": true,
  "count": "1",
  "userCount": 0,
  "firstSeen": "2023-11-06T08:31:27.058163Z",
  "lastSeen": "2023-11-06T08:31:27.058163Z",
  "stats": {
    "24h": [
      [1699174800, 0],
      [1699178400, 0],
      [1699182000, 0],
      [1699250400, 0],
      [1699254000, 0],
      [1699257600, 1]
    ]
  }
}
```

</details>

<details>
<summary> Project environment response data</summary>

```json showLineNumbers
{
   "id":"4504931759095808",
   "slug":"python-fastapi",
   "name":"python-fastapi",
   "platform":"python-fastapi",
   "dateCreated":"2023-03-31T06:18:37.290732Z",
   "isBookmarked":false,
   "isMember":false,
   "features":[
      "alert-filters",
      "minidump",
      "race-free-group-creation",
      "similarity-indexing",
      "similarity-view",
      "span-metrics-extraction",
      "span-metrics-extraction-resource",
      "releases"
   ],
   "firstEvent":"2023-03-31T06:25:54.666640Z",
   "firstTransactionEvent":false,
   "access":[
      
   ],
   "hasAccess":true,
   "hasMinifiedStackTrace":false,
   "hasMonitors":false,
   "hasProfiles":false,
   "hasReplays":false,
   "hasFeedbacks":false,
   "hasSessions":false,
   "isInternal":false,
   "isPublic":false,
   "avatar":{
      "avatarType":"letter_avatar",
      "avatarUuid":null
   },
   "color":"#913fbf",
   "status":"active",
   "organization":{
      "id":"4504931754901504",
      "slug":"pages-org",
      "status":{
         "id":"active",
         "name":"active"
      },
      "name":"Pages Org",
      "dateCreated":"2023-03-31T06:17:33.619189Z",
      "isEarlyAdopter":false,
      "require2FA":false,
      "requireEmailVerification":false,
      "avatar":{
         "avatarType":"letter_avatar",
         "avatarUuid":null,
         "avatarUrl":null
      },
      "links":{
         "organizationUrl":"https://pages-org.sentry.io",
         "regionUrl":"https://us.sentry.io"
      },
      "hasAuthProvider":false
   },
   "__tags":{
      "key":"environment",
      "name":"production",
      "value":"production",
      "count":10,
      "lastSeen":"2024-03-04T17:17:33Z",
      "firstSeen":"2024-03-04T17:14:22Z"
   }
}
```

</details>


### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> User entity in Port</summary>

```json showLineNumbers
{
  "identifier": "developer@getport.io",
  "title": "Michael",
  "blueprint": "sentryUser",
  "icon": "Sentry",
  "team": [],
  "properties": {
    "username": "developer@getport.io",
    "isActive": true,
    "dateJoined": "2022-01-18T22:38:13.946094Z",
    "lastLogin": "2024-11-10T23:25:31.826834Z",
    "orgRole": "owner",
    "inviteStatus": "approved"
  },
  "relations": {},
  "createdAt": "2024-11-06T08:49:17.700Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-11-06T08:59:11.446Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary> Team entity in Port</summary>

```json showLineNumbers
{
    "identifier": "platform-team",
    "title": "Developer Experience",
    "blueprint": "sentryTeam",
    "icon": "Sentry",
    "properties": {
      "dateCreated": "2022-11-16T13:25:53.617157Z",
      "memberCount": 1,
      "roles": "contributor",
      "projects": [
        "admin-service",
        "oauth-service"
      ]
    },
    "relations": {
      "members": [
        "danny@domain.io"
      ]
    },
  "createdAt": "2023-11-06T08:49:17.700Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-11-06T08:59:11.446Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>


<details>
<summary> Project entity in Port</summary>

```json showLineNumbers
{
  "identifier": "python-fastapi",
  "title": "python-fastapi",
  "icon": "Sentry",
  "blueprint": "sentryProject",
  "team": [],
  "properties": {
    "dateCreated": "2023-03-31T06:18:37.290732Z",
    "platform": "python-fastapi",
    "status": "active",
    "link": "https://test-org.sentry.io/projects/python-fastapi"
  },
  "relations": {},
  "createdAt": "2023-11-06T08:49:17.700Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-11-06T08:59:11.446Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary> Issue entity in Port</summary>

```json showLineNumbers
{
  "identifier": "4605173695",
  "title": "ZeroDivisionError: division by zero",
  "icon": "Sentry",
  "blueprint": "sentryIssue",
  "team": [],
  "properties": {
    "link": "https://test-org.sentry.io/issues/4605173695/",
    "status": "unresolved",
    "isUnhandled": true
  },
  "relations": {
    "project": "python-fastapi"
    "assignedTo": "danny@domain.io"
  },
  "createdAt": "2023-11-06T08:49:20.406Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2023-11-06T08:49:20.406Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

<details>
<summary> Project environment entity in Port</summary>

```json showLineNumbers
{
  "identifier": "python-fastapi-production",
  "title": "python-fastapi-production",
  "icon": "Sentry",
  "blueprint": "sentryProjectEnvironment",
  "team": [],
  "properties": {
    "dateCreated": "2023-03-31T06:18:37.290732Z",
    "platform": "python-fastapi",
    "status": "active",
    "link": "https://test-org.sentry.io/projects/python-fastapi"
  },
  "relations": {
    "team": [
      "platform-team"
    ]
  },
  "createdAt": "2024-03-07T12:18:17.111Z",
  "createdBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW",
  "updatedAt": "2024-03-07T12:31:52.041Z",
  "updatedBy": "hBx3VFZjqgLPEoQLp7POx5XaoB0cgsxW"
}
```

</details>

## Alternative installation via webhook

While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest data from Sentry. If so, use the following instructions:

<details>

<summary><b>Webhook installation (click to expand)</b></summary>

In this example you are going to create a webhook integration between [Sentry](https://sentry.io) and Port, which will ingest issues entities.

<h2>Port configuration</h2>

Create the following blueprint definition:

<details>

<summary>Sentry issue blueprint</summary>
<SentryIssuesBluePrint/>

</details>

Create the following webhook configuration [using Port UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints):

<details>

<summary>Sentry issue webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Sentry issue mapper`;
   2. Identifier : `sentry_issue_mapper`;
   3. Description : `A webhook configuration to map Sentry Issues to Port`;
   4. Icon : `Sentry`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <SentryIssuesConfiguration/>

3. Scroll down to **Advanced settings** and input the following details:
   1. Signature Header Name : `sentry-hook-signature`;
   2. Signature Algorithm : Select `sha256` from dropdown option;
   3. Click **Save** at the bottom of the page.

</details>

:::tip
We have left out the `secret` field from the security object in the webhook configuration because the secret value is generated by Sentry when creating the webhook.
So when following this example, please first create the webhook configuration in Port. Use the webhook URL from the response and create the webhook in Sentry.
After getting the secret from Sentry, you can go back to Port and update the [webhook configuration](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints) with the secret.
:::

<h2>Create a webhook in Sentry</h2>

1. Log in to Sentry with your organization's credentials;
2. Click the gear icon (Setting) at the left sidebar of the page;
3. Choose **Developer Settings**;
4. At the upper corner of this page, click on **Create New Integration**;
5. Sentry provides two types of integrations: Internal and Public. For the purpose of this guide, choose **Internal Integration** and click on the **Next** button;
6. Input the following details:
   1. `Name` - use a meaningful name such as Port Webhook;
   2. `Webhook URL` - enter the value of the `url` key you received after creating the webhook configuration;
   3. `Overview` - enter a description for the webhook;
   4. `Permissions` - Grant your webhook **Read** permissions for the **Issue & Event** category;
   5. `Webhooks` - Under this section, enable the issues checkbox to allow Sentry to report issue events to Port;
7. Click **Save Changes** at the bottom of the page.

:::tip
Now that the webhook is created, you can take the secret value generated by Sentry and use it to update the `security` object in your Port webhook configuration
:::

<h2>Relate comments to Issues</h2>

The following example adds a `sentryComment` blueprint, in addition to the `sentryIssue` blueprint shown in the previous example. In addition, it also adds a `sentryIssue` relation. The webhook will create or update the relation between the 2 existing entities, allowing you to map which issue a comment is made on:

<details>

<summary>Sentry comments blueprint (including the sentryIssue relation)</summary>
<SentryCommentsBlueprint/>

</details>

Create the following webhook configuration [using Port UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints):

<details>

<summary>Sentry comments webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Sentry comment mapper`;
   2. Identifier : `sentry_comment_mapper`;
   3. Description : `A webhook configuration to map Sentry Comments to Port`;
   4. Icon : `Sentry`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <SentryCommentsConfiguration/>

3. Scroll down to **Advanced settings** and input the following details:
   1. Signature Header Name : `sentry-hook-signature`;
   2. Signature Algorithm : Select `sha256` from dropdown option;
   3. Click **Save** at the bottom of the page.

</details>

:::tip
In order to view the different payloads and events available in Sentry webhooks, [click here](https://docs.sentry.io/product/integrations/integration-platform/webhooks/)
:::

Done! any issue and comment in Sentry will trigger a webhook event. Port will parse the events according to the mapping and update the catalog entities accordingly.

<h2>Let's Test It</h2>

This section includes a sample webhook event sent from Sentry when an issue or comment is created. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

<h3>Payload</h3>

Here is an example of the payload structure sent to the webhook URL when a Sentry issue or comment is created:

<details>
<summary> Sentry issue webhook event payload</summary>

```json showLineNumbers
{
  "action": "created",
  "installation": {
    "uuid": "54a3e698-f389-4d86-b9f8-50093a228449"
  },
  "data": {
    "issue": {
      "id": "4253613038",
      "shareId": "None",
      "shortId": "PYTHON-B",
      "title": "NameError: name 'total' is not defined",
      "culprit": "__main__ in <module>",
      "permalink": "None",
      "logger": "None",
      "level": "error",
      "status": "unresolved",
      "statusDetails": {},
      "substatus": "new",
      "isPublic": false,
      "platform": "python",
      "project": {
        "id": "4504989602480128",
        "name": "python",
        "slug": "python",
        "platform": "python"
      },
      "type": "error",
      "metadata": {
        "value": "name 'total' is not defined",
        "type": "NameError",
        "filename": "sentry.py",
        "function": "<module>",
        "display_title_with_tree_label": false
      },
      "numComments": 0,
      "assignedTo": "None",
      "isBookmarked": false,
      "isSubscribed": false,
      "subscriptionDetails": "None",
      "hasSeen": false,
      "annotations": [],
      "issueType": "error",
      "issueCategory": "error",
      "isUnhandled": true,
      "count": "1",
      "userCount": 0,
      "firstSeen": "2023-06-15T17:10:09.914274Z",
      "lastSeen": "2023-06-15T17:10:09.914274Z"
    }
  },
  "actor": {
    "type": "application",
    "id": "sentry",
    "name": "Sentry"
  }
}
```

</details>

<details>
<summary> Sentry comment webhook event payload</summary>

```json showLineNumbers
{
  "action": "created",
  "installation": {
    "uuid": "d5a2de51-0138-496a-8e79-c17747c3a40d"
  },
  "data": {
    "comment_id": "1729635072",
    "issue_id": "4253613038",
    "project_slug": "python",
    "timestamp": "2023-06-15T17:15:53.383120Z",
    "comment": "Hello admin please take a look at this"
  },
  "actor": {
    "type": "user",
    "id": 2683666,
    "name": "user@domain.com"
  }
}
```

</details>

<h3>Mapping Result</h3>

The combination of the sample payload and the webhook configuration generates the following Port `sentryIssue` entity:

```json showLineNumbers
{
  "identifier": "4253613038",
  "title": "NameError: name 'total' is not defined",
  "blueprint": "sentryIssue",
  "icon": "Sentry",
  "properties": {
    "action": "created",
    "level": "error",
    "platform": "python",
    "status": "unresolved",
    "projectID": "4504989602480128"
  },
  "relations": {}
}
```

In addition, the following Port `sentryComment` entity will be generated:

```json showLineNumbers
{
  "identifier": "1729635072",
  "title": "Comment Event",
  "blueprint": "sentryComment",
  "properties": {
    "action": "created",
    "comment": "Hello admin please take a look at this",
    "project": "python",
    "issue_id": "4253613038",
    "timestamp": "2023-06-15T17:15:53.383120Z"
  },
  "relations": {
    "sentryIssue": "4253613038"
  }
}
```
</details>
