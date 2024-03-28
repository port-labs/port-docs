import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import HelmPrerequisites from "../templates/\_ocean_helm_prerequisites_block.mdx"
import HelmParameters from "../templates/\_ocean-advanced-parameters-helm.mdx"
import ResourceMapping from "../templates/\_resource-mapping.mdx"
import DockerParameters from "./\_docker-parameters.mdx"
import SupportedResources from "./\_supported-resources.mdx"
import AdvancedConfig from '../../../generalTemplates/\_ocean_advanced_configuration_note.md'
import SonarcloudAnalysisBlueprint from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/sonarqube/\_example_sonarcloud_analysis_blueprint.mdx";
import SonarcloudAnalysisConfiguration from "/docs/build-your-software-catalog/custom-integration/webhook/examples/resources/sonarqube/\_example_sonarcloud_analysis_configuration.mdx";

# SonarQube

Our SonarQube integration (powered by [Ocean](https://ocean.getport.io)) allows you to import `projects`, `issues` and `analyses` from your SonarQube account into
Port, according to your mapping and definitions.

## Common use cases

- Map `projects`, `issues` and `analyses` in your SonarQube organization environment.
- Watch for object changes (create/update/delete) in real-time, and automatically apply the changes to your entities in
  Port.
- Create/delete SonarQube objects using self-service actions.

## Prerequisites

<HelmPrerequisites />

## Installation

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="real-time-always-on" label="Real Time & Always On" default>

Using this installation option means that the integration will be able to update Port in real time using webhooks.

This table summarizes the available parameters for the installation.
Set them as you wish in the script below, then copy it and run it in your terminal:

| Parameter                                | Description                                                                                                                                                                                  | Example                             | Required |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- | -------- |
| `port.clientId`                          | Your port client id ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))                                 |                                     | ✅       |
| `port.clientSecret`                      | Your port client secret ([How to get the credentials](https://docs.getport.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))                             |                                     | ✅       |
| `integration.secrets.sonarApiToken`      | The [SonarQube API token](https://docs.sonarsource.com/sonarqube/9.8/user-guide/user-account/generating-and-using-tokens/#generating-a-token)                                                |                                     | ✅       |
| `integration.config.sonarOrganizationId` | The SonarQube [organization Key](https://docs.sonarsource.com/sonarcloud/appendices/project-information/#project-and-organization-keys) (Not required when using on-prem sonarqube instance) | myOrganization                      | ✅       |
| `integration.config.sonarIsOnPremise` | A boolean value indicating whether the SonarQube instance is on-premise. The default value is `false` | false                      | ✅       |
| `integration.config.appHost`             | A URL bounded to the integration container that can be accessed by sonarqube. When used the integration will create webhooks on top of sonarqube to listen to any live changes in the data   | https://my-ocean-integration.com    | ❌       |
| `integration.config.sonarUrl`            | Required if using **On-Prem**, Your SonarQube instance URL                                                                                                                                   | https://my-sonar-instance.com | ❌       |

<HelmParameters />

<br/>
<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm" default>
To install the integration using Helm, run the following command:

```bash showLineNumbers
helm repo add --force-update port-labs https://port-labs.github.io/helm-charts
helm upgrade --install my-sonarqube-integration port-labs/port-ocean \
  --set port.clientId="PORT_CLIENT_ID"  \
  --set port.clientSecret="PORT_CLIENT_SECRET"  \
  --set initializePortResources=true  \
  --set scheduledResyncInterval=120  \
  --set integration.identifier="my-sonarqube-integration"  \
  --set integration.type="sonarqube"  \
  --set integration.eventListener.type="POLLING"  \
  --set integration.config.sonarIsOnPremise="<ENTER BOOLEAN VALUE>"  \
  --set integration.secrets.sonarApiToken="<ENTER API TOKEN>"  \
  --set integration.config.sonarOrganizationId="<ENTER ORGANIZATION ID>"
```
</TabItem>
<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD, follow these steps:

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
  <summary>ArgoCD Application</summary>

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
kubectl apply -f my-ocean-sonarqube-integration.yaml
```
</TabItem>
</Tabs>

</TabItem>

<TabItem value="one-time" label="Scheduled">

  <Tabs groupId="cicd-method" queryString="cicd-method">
  <TabItem value="github" label="GitHub">
This workflow will run the SonarQube integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning
If you want the integration to update Port in real time using webhooks you should use
the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option
:::

Make sure to configure the
following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

<br/>

Here is an example for `sonarqube-integration.yml` workflow file:

```yaml showLineNumbers
name: SonarQube Exporter Workflow

# This workflow responsible for running SonarQube exporter.

on:
  workflow_dispatch:

jobs:
  run-integration:
    runs-on: ubuntu-latest

    steps:
      - uses: port-labs/ocean-sail@v1
        with:
          type: 'sonarqube'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          config: |
            sonar_api_token: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SONAR_API_TOKEN }}
            sonar_organization_id: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SONAR_ORGANIZATION_ID }}
            sonar_is_on_premise: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SONAR_IS_ON_PREMISE }}
            sonar_url: ${{ secrets.OCEAN__INTEGRATION__CONFIG__SONAR_URL }}
```

  </TabItem>
  <TabItem value="jenkins" label="Jenkins">
This pipeline will run the SonarQube integration once and then exit, this is useful for **scheduled** ingestion of data.

:::tip
Your Jenkins agent should be able to run docker commands.
:::
:::warning
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
                                -e OCEAN__INTEGRATION__CONFIG__SONAR_API_TOKEN=$OCEAN__INTEGRATION__CONFIG__SONAR_API_TOKEN \
                                -e OCEAN__INTEGRATION__CONFIG__SONAR_ORGANIZATION_ID=$OCEAN__INTEGRATION__CONFIG__SONAR_ORGANIZATION_ID \
                                -e OCEAN__INTEGRATION__CONFIG__SONAR_IS_ON_PREMISE=$OCEAN__INTEGRATION__CONFIG__SONAR_IS_ON_PREMISE \
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

  <TabItem value="azure" label="Azure Devops">
This pipeline will run the SonarQube integration once and then exit, this is useful for **scheduled** ingestion of data.

:::tip
Your Azure Devops agent should be able to run docker commands.
:::
:::warning
If you want the integration to update Port in real time using webhooks you should use
the [Real Time & Always On](?installation-methods=real-time-always-on#installation) installation option.
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
    -e OCEAN__INTEGRATION__CONFIG__SONAR_API_TOKEN=${OCEAN__INTEGRATION__CONFIG__SONAR_API_TOKEN} \
    -e OCEAN__INTEGRATION__CONFIG__SONAR_ORGANIZATION_ID=${OCEAN__INTEGRATION__CONFIG__SONAR_ORGANIZATION_ID} \
    -e OCEAN__INTEGRATION__CONFIG__SONAR_IS_ON_PREMISE=${OCEAN__INTEGRATION__CONFIG__SONAR_IS_ON_PREMISE} \
    -e OCEAN__INTEGRATION__CONFIG__SONAR_URL=${OCEAN__INTEGRATION__CONFIG__SONAR_URL} \
    -e OCEAN__PORT__CLIENT_ID=${OCEAN__PORT__CLIENT_ID} \
    -e OCEAN__PORT__CLIENT_SECRET=${OCEAN__PORT__CLIENT_SECRET} \
    $image_name

    exit $?
  displayName: 'Ingest SonarQube Data into Port'

```

  </TabItem>
  </Tabs>

</TabItem>

</Tabs>

<AdvancedConfig/>

## Ingesting SonarQube objects

The SonarQube integration uses a YAML configuration to describe the process of loading data into the developer portal.

Here is an example snippet from the config which demonstrates the process for getting `project` data from SonarQube:

```yaml showLineNumbers
resources:
  - kind: projects
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"sonarQubeProject"'
          identifier: .key
          title: .name
          properties:
            organization: .organization
            link: .__link
            lastAnalysisStatus: .__branch.status.qualityGateStatus
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

The integration makes use of the [JQ JSON processor](https://stedolan.github.io/jq/manual/) to select, modify,
concatenate, transform and perform other operations on existing fields and values from SonarQube's API events.

<ResourceMapping name="SonarQube" category="Code quality & security providers" components={{
SupportedResources: SupportedResources
}}>

```yaml showLineNumbers
resources:
  - kind: projects
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"sonarQubeProject"'
          identifier: .key
          title: .name
          properties:
            organization: .organization
            link: .__link
            lastAnalysisStatus: .__branch.status.qualityGateStatus
            lastAnalysisDate: .__branch.analysisDate
            numberOfBugs: .__measures[]? | select(.metric == "bugs") | .value
            numberOfCodeSmells: .__measures[]? | select(.metric == "code_smells") | .value
            numberOfVulnerabilities: .__measures[]? | select(.metric == "vulnerabilities") | .value
            numberOfHotSpots: .__measures[]? | select(.metric == "security_hotspots") | .value
            numberOfDuplications: .__measures[]? | select(.metric == "duplicated_files") | .value
            coverage: .__measures[]? | select(.metric == "coverage") | .value
            mainBranch: .__branch.name
            tags: .tags
      # highlight-end
  - kind: projects # In this instance project is mapped again with a different filter
    selector:
      query: '.name == "MyProjectName"'
    port:
      entity:
        mappings: ...
```

</ ResourceMapping>

## Examples

Examples of blueprints and the relevant integration configurations:

### Project

<details>
<summary>Projects blueprint</summary>

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
  - kind: projects
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"sonarQubeProject"'
          identifier: .key
          title: .name
          properties:
            organization: .organization
            link: .__link
            lastAnalysisStatus: .__branch.status.qualityGateStatus
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

### Issue

<details>
<summary>Issue blueprint</summary>

```json showLineNumbers
{
  "identifier": "sonarQubeIssue",
  "title": "SonarQube Issue",
  "icon": "sonarqube",
  "schema": {
    "properties": {
      "type": {
        "type": "string",
        "title": "Type",
        "enum": ["CODE_SMELL", "BUG", "VULNERABILITY"]
      },
      "severity": {
        "type": "string",
        "title": "Severity",
        "enum": ["MAJOR", "INFO", "MINOR", "CRITICAL", "BLOCKER"],
        "enumColors": {
          "MAJOR": "orange",
          "INFO": "green",
          "CRITICAL": "red",
          "BLOCKER": "red",
          "MINOR": "yellow"
        }
      },
      "link": {
        "type": "string",
        "format": "url",
        "icon": "Link",
        "title": "Link"
      },
      "status": {
        "type": "string",
        "title": "Status",
        "enum": ["OPEN", "CLOSED", "RESOLVED", "REOPENED", "CONFIRMED"]
      },
      "assignees": {
        "title": "Assignees",
        "type": "string",
        "icon": "TwoUsers"
      },
      "tags": {
        "type": "array",
        "title": "Tags"
      },
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Created At"
      }
    }
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "sonarQubeProject": {
      "target": "sonarQubeProject",
      "required": false,
      "title": "SonarQube Project",
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
  - kind: issues
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"sonarQubeIssue"'
          identifier: .key
          title: .message
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

### Saas Analysis

<details>
<summary>Saas analysis blueprint</summary>

```json showLineNumbers
{
  "identifier": "sonarQubeAnalysis",
  "title": "SonarQube Analysis",
  "icon": "sonarqube",
  "schema": {
    "properties": {
      "branch": {
        "type": "string",
        "title": "Branch",
        "icon": "GitVersion"
      },
      "fixedIssues": {
        "type": "number",
        "title": "Fixed Issues"
      },
      "newIssues": {
        "type": "number",
        "title": "New Issues"
      },
      "coverage": {
        "title": "Coverage",
        "type": "number"
      },
      "duplications": {
        "type": "number",
        "title": "Duplications"
      },
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Created At"
      }
    }
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "sonarQubeProject": {
      "target": "sonarQubeProject",
      "required": false,
      "title": "SonarQube Project",
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
  - kind: saas_analysis
    selector:
      query: "true"
    port:
      entity:
        mappings:
          blueprint: '"sonarQubeAnalysis"'
          identifier: .analysisId
          title: .__commit.message // .analysisId
          properties:
            branch: .__branchName
            fixedIssues: .measures.violations_fixed
            newIssues: .measures.violations_added
            coverage: .measures.coverage_change
            duplications: .measures.duplicated_lines_density_change
            createdAt: .__analysisDate
          relations:
            sonarQubeProject: .__project
```

</details>

### On-Premise Analysis

<details>
<summary>On-premise analysis blueprint</summary>

```json showLineNumbers
{
  "identifier": "sonarQubeAnalysis",
  "title": "SonarQube Analysis",
  "icon": "sonarqube",
  "schema": {
    "properties": {
      "branch": {
        "type": "string",
        "title": "Branch",
        "icon": "GitVersion"
      },
      "fixedIssues": {
        "type": "number",
        "title": "Fixed Issues"
      },
      "newIssues": {
        "type": "number",
        "title": "New Issues"
      },
      "coverage": {
        "title": "Coverage",
        "type": "number"
      },
      "duplications": {
        "type": "number",
        "title": "Duplications"
      },
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Created At"
      }
    }
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "sonarQubeProject": {
      "target": "sonarQubeProject",
      "required": false,
      "title": "SonarQube Project",
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
  - kind: onprem_analysis
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"sonarQubeAnalysis"'
          identifier: .__project + "-" + .key
          title: .title
          properties:
            branch: .branch
            newIssues: .__measures[]? | select(.metric == "new_violations") | .period.value
            coverage: .__measures[]? | select(.metric == "new_coverage") | .period.value
            duplications: .__measures[]? | select(.metric == "new_duplicated_lines_density") | .period.value
            createdAt: .analysisDate
          relations:
            sonarQubeProject: .__project
```

</details>

## Let's Test It

This section includes a sample response data from SonarQube when a code repository is scanned for quality assurance. In
addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous
section.

### Payload

Here is an example of the payload structure from SonarQube:

<details>
<summary> Project response data</summary>

```json showLineNumbers
{
  "organization": "peygis",
  "key": "PeyGis_Chatbot_For_Social_Media_Transaction",
  "name": "Chatbot_For_Social_Media_Transaction",
  "isFavorite": true,
  "tags": [],
  "visibility": "public",
  "eligibilityStatus": "COMPLETED",
  "eligible": true,
  "isNew": false,
  "analysisDateAllBranches": "2023-09-09T03:03:20+0200",
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
<summary> Issue response data</summary>

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
<summary> Analysis response data</summary>

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

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary> Project entity in Port</summary>

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
    "tags": []
  },
  "relations": {},
  "icon": "sonarqube"
}
```

</details>

<details>
<summary> Issue entity in Port</summary>

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
<summary> Analysis entity in Port</summary>

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

## Alternative installation via webhook

While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest data from SonarQube. If so, use the following instructions:

<details>

<summary><b>Webhook installation (click to expand)</b></summary>

In this example you are going to create a webhook integration between [SonarQube's SonarCloud](https://www.sonarsource.com/products/sonarcloud/) and Port, which will ingest SonarQube code quality `analysis` entities.

<h2> Port configuration </h2>

Create the following blueprint definition:

<details>
<summary>SonarQube analysis blueprint</summary>

<SonarcloudAnalysisBlueprint/>

</details>

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints):

<details>
<summary>SonarQube analysis webhook configuration</summary>

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
<summary> Webhook event payload</summary>

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



## Connect SonarQube project to service

This guide aims to demonstrate how to connect a SonarQube project to an existing service in Port.

:::tip Prerequisites

- This guide assumes you have a Port account and that you have finished the [onboarding process](/quickstart). We will use the `Service` blueprint that was created during the onboarding process.
- Ensure you have SonarQube installed and configured in your environment.
- You will need an accessible k8s cluster. If you don't have one, here is how to quickly set-up a [minikube cluster](https://minikube.sigs.k8s.io/docs/start/).
- [Helm](https://helm.sh/docs/intro/install/) - required to install a relevant integration.

:::

<br/>

### Add tags to projects in SonarQube

Tagging projects in SonarQube allows you to categorize and label your projects based on various attributes such as technology stack, business domain, team ownership etc. In this guide, we will add a tag attribute to tell us the name of the service that implements the project:

1. Login to your [SonarQube account](https://www.sonarsource.com/)
2. Once logged in, navigate to the projects panel and choose the project you want to tag
3. Within the project dashboard, locate the **Project Information** tab specific to the selected project
4. Look for a section labeled **Tags** or similar. This is where you can manage tags associated with the project
5. To add a new tag, click on the **plus** icon and type the tag name (`port-auth-service`) into the input field provided. For this guide, let's assume there is a service entity identified by `auth-service` in your `Service` blueprint in Port. 

<img src='/img/guides/sonarProjectAddTags.png' width='60%' />

:::note Control the tag name
Since our `SonarQube project` may already have several tags, we will need a mechanism to control how these tags will be related to our `Service` blueprint. A way to achieve this relation is to prefix the tag name with the keyword `port-`. We will then use JQ to select the tags that starts with this keyword. So, our example tag will be named `port-auth-service`, which will correspond to a Service entity identified by `auth-service` in Port.
:::


### Create the service relation

Now that Port is synced with our SonarQube resources, let's reflect the SonarQube project in our services to display the projects used in a service.
First, we will need to create a [relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/) between our services and the corresponding Sonarqube project.

1. Head back to the [Builder](https://app.getport.io/dev-portal/data-model), choose the `SonarQube Project` <PortTooltip id="blueprint">blueprint</PortTooltip>, and click on `New relation`:

<img src='/img/guides/sonarProjectCreateRelation.png' width='60%' />

<br/><br/>

2. Fill out the form like this, then click `Create`:

<img src='/img/guides/sonarProjectEditRelation.png' width='60%' />

<br/><br/>

Now that the <PortTooltip id="blueprint">blueprints</PortTooltip> are related, we need to assign the relevant SonarQube project to each of our services. This can be done by adding some mapping logic. Go to your [data sources page](https://app.getport.io/dev-portal/data-sources), and click on your SonarQube integration:

<img src='/img/guides/sonarQubeIntegrationDataSources.png' />

<br/><br/>

Under the `resources` key, modify the mapping for the `projects` kind by using the following YAML block. Then click `Save & Resync`:

<details>
<summary>Relation mapping (click to expand)</summary>

```yaml showLineNumbers
  - kind: projects
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .key
          title: .name
          blueprint: '"sonarQubeProject"'
          properties:
            organization: .organization
            link: .__link
            lastAnalysisStatus: .__branch.status.qualityGateStatus
            lastAnalysisDate: .__branch.analysisDate
            numberOfBugs: .__measures[]? | select(.metric == "bugs") | .value
            numberOfCodeSmells: .__measures[]? | select(.metric == "code_smells") | .value
            numberOfVulnerabilities: .__measures[]? | select(.metric == "vulnerabilities") | .value
            numberOfHotSpots: .__measures[]? | select(.metric == "security_hotspots") | .value
            numberOfDuplications: .__measures[]? | select(.metric == "duplicated_files") | .value
            coverage: .__measures[]? | select(.metric == "coverage") | .value
            mainBranch: .__branch.name
          relations:
            service: .tags | map(select(startswith("port"))) | map(sub("port-"; ""; "g")) | .[0]
```

</details>

:::tip JQ explanation

The JQ below selects all tags that start with the keyword `port`. It then removes "port-" from each tag, leaving only the part that comes after it. It then selects the first match, which is equivalent to the service in Port.

```yaml
service: .tags | map(select(startswith("port"))) | map(sub("port-"; ""; "g")) | .[0]
```
:::

What we just did was map the `SonarQube Project` to the relation between it and our `Services`.  
Now, if our `Service` identifier is equal to the SonarQube project tag, the `service` will automatically be linked to it &nbsp;🎉

![entitiesAfterServiceMapping](/img/guides/entitiesAfterServiceMapping.png)

### Conclusion

By following these steps, you can seamlessly connect a SonarQube project with an existing service blueprint in Port using project tags.

More relevant guides and examples:

- [Port's SonarQube integration](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/code-quality-security/sonarqube)
- [Integrate scorecards with Slack](https://docs.getport.io/promote-scorecards/manage-using-3rd-party-apps/slack)
