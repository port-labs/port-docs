import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../../templates/_ocean_helm_prerequisites_block.mdx"
import AdvancedConfig from '../../../../generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"
import MetricsAndSyncStatus from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_metrics_and_sync_status.mdx"

# ArmorCode

Port's ArmorCode integration allows you to model ArmorCode resources in your software catalog and ingest data into them.

## Overview

This integration allows you to:

- Track security vulnerabilities and findings from ArmorCode in Port.
- Map products, sub-products, and their security findings.
- Monitor security posture across your software catalog.

### Supported Resources

The resources that can be ingested from ArmorCode into Port are listed below. It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [`Products`](https://docs.armorcode.com/api/products) - ArmorCode products representing applications or services.
- [`Sub-Products`](https://docs.armorcode.com/api/sub-products) - Repositories or components within products.
- [`Findings`](https://docs.armorcode.com/api/findings) - Security vulnerabilities and issues detected by ArmorCode.

## Setup

Choose one of the following installation methods:

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation integration="ArmorCode" />

</TabItem>

<TabItem value="real-time-self-hosted" label="Self-hosted">

Using this installation option means that the integration will be able to update Port in real time using webhooks.

<h2>Prerequisites</h2>

<Prerequisites />

For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm">

<OceanRealtimeInstallation integration="ArmorCode" />

<PortApiRegionTip/>

</TabItem>

<TabItem value="argocd" label="ArgoCD" default>
To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-armorcode-integration` in your git repository with the content:

:::note Default behaviour
Remember to replace the placeholder for `ARMORCODE_API_TOKEN`, `ARMORCODE_API_URL`.
:::

```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-armorcode-integration
  type: armorcode
  eventListener:
    type: POLLING
  config:
  // highlight-start
    armorcodeApiUrl: ARMORCODE_API_URL
  // highlight-end
  secrets:
  // highlight-start
    armorcodeApiToken: ARMORCODE_API_TOKEN
  // highlight-end
```
<br/>

2. Install the `my-ocean-armorcode-integration` ArgoCD Application by creating the following `my-ocean-armorcode-integration.yaml` manifest:
:::note Configuration variable replacement
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.

Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).
:::

<details>
<summary><b>ArgoCD Application (click to expand)</b></summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-ocean-armorcode-integration
  namespace: argocd
spec:
  destination:
    namespace: my-ocean-armorcode-integration
    server: https://kubernetes.default.svc
  project: default
  sources:
  - repoURL: 'https://port-labs.github.io/helm-charts/'
    chart: port-ocean
    targetRevision: 0.8.5
    helm:
      valueFiles:
      - $values/argocd/my-ocean-armorcode-integration/values.yaml
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
kubectl apply -f my-ocean-armorcode-integration.yaml
```
</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.

| Parameter                           | Description                                                                                                                         | Required |
|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------|----------|
| `port.clientId`                     | Your Port client id                                                                                                                 | ✅        |
| `port.clientSecret`                 | Your Port client secret                                                                                                             | ✅        |
| `port.baseUrl`                      | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                             | ✅        |
| `integration.identifier`            | Change the identifier to describe your integration                                                                                  | ✅        |
| `integration.type`                  | The integration type                                                                                                                | ✅        |
| `integration.eventListener.type`    | The event listener type                                                                                                             | ✅        |
| `integration.secrets.armorcodeApiToken` | The ArmorCode API Token                                                                                                            | ✅        |
| `integration.config.armorcodeApiUrl` | The ArmorCode API URL. If not specified, the default will be https://api.armorcode.com                                              | ❌        |
| `scheduledResyncInterval`           | The number of minutes between each resync                                                                                           | ❌        |
| `initializePortResources`           | Default true, When set to true the integration will create default blueprints and the port App config Mapping                       | ❌        |

<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the ArmorCode integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time using webhooks you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option
:::

  <Tabs groupId="cicd-method" queryString="cicd-method">
   <TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

| Parameter                                     | Description                                                                                                                                                      | Required |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_TOKEN` | The ArmorCode API Token                                                                                                                                          | ✅       |
| `OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_URL`   | The ArmorCode API URL. If not specified, the default will be https://api.armorcode.com                                                                          | ❌       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`            | Default true, When set to false the integration will not create default blueprints and the port App config Mapping                                               | ❌       |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                       | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`              | Change the identifier to describe your integration, if not set will use the default one                                                                          | ❌       |
| `OCEAN__PORT__CLIENT_ID`                      | Your port client id ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))     | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                  | Your port client ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret | ✅       |
| `OCEAN__PORT__BASE_URL`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                          | ✅       |

<br/>

Here is an example for `armorcode-integration.yml` workflow file:

```yaml showLineNumbers
name: ArmorCode Exporter Workflow

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
          type: 'armorcode'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            armorcode_api_token: ${{ secrets.OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_TOKEN }}
            armorcode_api_url: ${{ secrets.OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_URL }}
```

</TabItem>
   <TabItem value="jenkins" label="Jenkins">

:::tip
Your Jenkins agent should be able to run docker commands.
:::

Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/)
of `Secret Text` type:

| Parameter                                     | Description                                                                                                                                                      | Required |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_TOKEN` | The ArmorCode API Token                                                                                                                                          | ✅       |
| `OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_URL`   | The ArmorCode API URL. If not specified, the default will be https://api.armorcode.com                                                                          | ❌       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`            | Default true, When set to false the integration will not create default blueprints and the port App config Mapping                                               | ❌       |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                       | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`              | Change the identifier to describe your integration, if not set will use the default one                                                                          | ❌       |
| `OCEAN__PORT__CLIENT_ID`                      | Your port client id ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))     | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                  | Your port client ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret | ✅       |
| `OCEAN__PORT__BASE_URL`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                          | ✅       |
| `OCEAN__BASE_URL`                     | The host of the Port Ocean app. Used to set up the integration endpoint as the target for webhooks created in ArmorCode                                                                          | ❌       |

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```yml showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run ArmorCode Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_TOKEN', variable: 'OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_TOKEN'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_URL', variable: 'OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_URL'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="armorcode"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_TOKEN=$OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_TOKEN \
                                -e OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_URL=$OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_URL \
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

| Parameter                                     | Description                                                                                                                                                      | Required |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_TOKEN` | The ArmorCode API Token                                                                                                                                          | ✅       |
| `OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_URL`   | The ArmorCode API URL. If not specified, the default will be https://api.armorcode.com                                                                          | ❌       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`            | Default true, When set to false the integration will not create default blueprints and the port App config Mapping                                               | ❌       |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                       | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`              | Change the identifier to describe your integration, if not set will use the default one                                                                          | ❌       |
| `OCEAN__PORT__CLIENT_ID`                      | Your port client id ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))     | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                  | Your port client ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret | ✅       |
| `OCEAN__PORT__BASE_URL`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                          | ✅       |

<br/>

Here is an example for `armorcode-integration.yml` pipeline file:

```yaml showLineNumbers
trigger:
- main

pool:
  vmImage: "ubuntu-latest"

variables:
  - group: port-ocean-credentials # OCEAN__PORT__CLIENT_ID, OCEAN__PORT__CLIENT_SECRET, OCEAN__INTEGRATION__CONFIG__TOKEN

steps:
- script: |
    echo Add other tasks to build, test, and deploy your project.
    # Set Docker image and run the container
    integration_type="armorcode"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm \
    -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
    -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
    -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
    -e OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_TOKEN=$OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_TOKEN \
    -e OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_URL=$OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_URL \
    -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
    -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
    -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
    $image_name

    exit $?
  displayName: 'Ingest ArmorCode Data into Port'

```

  </TabItem>
  <TabItem value="gitlab" label="GitLab">

Make sure to [configure the following GitLab variables](https://docs.gitlab.com/ee/ci/variables/#for-a-project):

| Parameter                                     | Description                                                                                                                                                      | Required |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_TOKEN` | The ArmorCode API Token                                                                                                                                          | ✅       |
| `OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_URL`   | The ArmorCode API URL. If not specified, the default will be https://api.armorcode.com                                                                          | ❌       |
| `OCEAN__INITIALIZE_PORT_RESOURCES`            | Default true, When set to false the integration will not create default blueprints and the port App config Mapping                                               | ❌       |
| `OCEAN__SEND_RAW_DATA_EXAMPLES`                     | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                       | ❌       |
| `OCEAN__INTEGRATION__IDENTIFIER`              | Change the identifier to describe your integration, if not set will use the default one                                                                          | ❌       |
| `OCEAN__PORT__CLIENT_ID`                      | Your port client id ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))     | ✅       |
| `OCEAN__PORT__CLIENT_SECRET`                  | Your port client ([How to get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) secret | ✅       |
| `OCEAN__PORT__BASE_URL`                     | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                          | ✅       |

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
  INTEGRATION_TYPE: armorcode
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
        -e OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_TOKEN=$OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_TOKEN \
        -e OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_URL=$OCEAN__INTEGRATION__CONFIG__ARMORCODE_API_URL \
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
  - kind: product
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"armorcodeProduct"'
          identifier: .id | tostring
          title: .name
          properties:
            name: .name
            description: .description
            businessOwner: .business_owner
            securityOwner: .security_owner
  - kind: sub-product
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"armorcodeSubProduct"'
          identifier: .id | tostring
          title: .name
          properties:
            name: .name
            repoLink: .repo_link
            programmingLanguage: .programming_language
            technologies: .technologies
          relations:
            product: .product_id
  - kind: finding
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"armorcodeFinding"'
          identifier: .id | tostring
          title: .title
          properties:
            source: .source
            description: .description
            mitigation: .mitigation
            severity: .severity
            findingCategory: .finding_category
            status: .status
            productStatus: .product_status
            subProductStatuses: .sub_product_statuses
            title: .title
            toolSeverity: .tool_severity
            createdAt: .created_at
            lastUpdated: .last_updated
            cwe: .cwe
            cve: .cve
            link: .link
            riskScore: .risk_score
            findingScore: .finding_score
          relations:
            product: .product_id
            subProduct: .sub_product_id
```

</details>

<MetricsAndSyncStatus/>

## Examples

Examples of blueprints and the relevant integration configurations:

### Product

<details>
<summary>Product blueprint</summary>

```json showLineNumbers
{
  "identifier": "armorcodeProduct",
  "title": "Armorcode Product",
  "icon": "Package",
  "schema": {
    "properties": {
      "name": {
        "type": "string",
        "title": "Name"
      },
      "description": {
        "type": "string",
        "title": "Description"
      },
      "businessOwner": {
        "type": "string",
        "title": "Business Owner"
      },
      "securityOwner": {
        "type": "string",
        "title": "Security Owner"
      }
    },
    "required": [
      "name"
    ]
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
  - kind: products
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"armorcodeProduct"'
          identifier: .id | tostring
          title: .name
          properties:
            name: .name
            description: .description
            businessOwner: .business_owner
            securityOwner: .security_owner
```

</details>

### Sub-Product

<details>
<summary>Sub-Product blueprint</summary>

```json showLineNumbers
{
  "identifier": "armorcodeSubProduct",
  "title": "Armorcode Sub-Product",
  "icon": "Git",
  "schema": {
    "properties": {
      "name": {
        "type": "string",
        "title": "Name"
      },
      "repoLink": {
        "type": "string",
        "title": "Repository Link",
        "format": "url"
      },
      "programmingLanguage": {
        "type": "string",
        "title": "Language"
      },
      "technologies": {
        "type": "array",
        "title": "Technologies",
        "items": {
          "type": "string"
        }
      }
    },
    "required": [
      "name"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "relations": {
    "product": {
      "title": "Product",
      "target": "armorcodeProduct",
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
  - kind: sub_products
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"armorcodeSubProduct"'
          identifier: .id | tostring
          title: .name
          properties:
            name: .name
            repoLink: .repo_link
            programmingLanguage: .programming_language
            technologies: .technologies
          relations:
            product: .product_id
```

</details>

### Finding

<details>
<summary>Finding blueprint</summary>

```json showLineNumbers
{
  "identifier": "armorcodeFinding",
  "title": "ArmorCode Finding",
  "icon": "Bug",
  "schema": {
    "properties": {
      "source": {
        "title": "Source",
        "type": "string",
        "description": "The security tool that generated this finding"
      },
      "description": {
        "title": "Description",
        "type": "string",
        "description": "Detailed description of the security finding"
      },
      "mitigation": {
        "title": "Mitigation",
        "type": "string",
        "description": "Recommended mitigation steps for this finding"
      },
      "severity": {
        "type": "string",
        "title": "Severity",
        "enum": [
          "CRITICAL",
          "HIGH",
          "MEDIUM",
          "LOW",
          "INFORMATIONAL",
          "UNKNOWN"
        ],
        "enumColors": {
          "CRITICAL": "red",
          "HIGH": "orange",
          "MEDIUM": "yellow",
          "LOW": "darkGray",
          "INFORMATIONAL": "silver",
          "UNKNOWN": "lightGray"
        }
      },
      "findingCategory": {
        "title": "Finding Category",
        "type": "string",
        "description": "Category classification of the finding"
      },
      "status": {
        "type": "string",
        "title": "Status",
        "enum": [
          "OPEN",
          "CLOSED",
          "ACTIVE",
          "IN_PROGRESS",
          "RESOLVED",
          "TRIAGE",
          "CONTROLLED",
          "SUPPRESS",
          "MITIGATED"
        ],
        "enumColors": {
          "OPEN": "paleBlue",
          "ACTIVE": "olive",
          "CLOSED": "lightGray",
          "RESOLVED": "green",
          "IN_PROGRESS": "orange",
          "TRIAGE": "yellow",
          "CONTROLLED": "purple",
          "SUPPRESS": "darkGray",
          "MITIGATED": "lime"
        }
      },
      "productStatus": {
        "title": "Product Status",
        "type": "string",
        "description": "Status of the product containing this finding"
      },
      "subProductStatuses": {
        "title": "Sub-Product Status",
        "type": "string",
        "description": "Status of the sub-product containing this finding"
      },
      "title": {
        "title": "Title",
        "type": "string",
        "description": "Brief title describing the finding"
      },
      "toolSeverity": {
        "title": "Tool Severity",
        "type": "string",
        "description": "Original severity as reported by the security tool"
      },
      "createdAt": {
        "title": "Created At",
        "type": "string",
        "description": "When the finding was first created"
      },
      "lastUpdated": {
        "title": "Last Updated",
        "type": "string",
        "format": "date-time",
        "description": "When the finding was last updated"
      },
      "cwe": {
        "title": "CWE",
        "type": "array",
        "description": "Common Weakness Enumeration identifiers",
        "items": {
          "type": "string"
        }
      },
      "cve": {
        "title": "CVE",
        "type": "array",
        "description": "Common Vulnerabilities and Exposures identifiers",
        "items": {
          "type": "string"
        }
      },
      "link": {
        "title": "Link to Finding",
        "type": "string",
        "format": "url",
        "description": "Direct link to the finding in ArmorCode"
      },
      "riskScore": {
        "title": "Risk Score",
        "type": "number",
        "description": "Calculated risk score for the finding"
      },
      "findingScore": {
        "title": "Finding Score",
        "type": "number",
        "description": "ArmorCode finding score"
      }
    },
    "required": [
      "title",
      "status",
      "severity",
      "source",
      "findingCategory"
    ]
  },
  "mirrorProperties": {},
  "calculationProperties": {},
  "aggregationProperties": {},
  "relations": {
    "product": {
      "title": "Product",
      "target": "armorcodeProduct",
      "required": true,
      "many": false
    },
    "subProduct": {
      "title": "Sub-Product",
      "target": "armorcodeSubProduct",
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
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: findings
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"armorcodeFinding"'
          identifier: .id | tostring
          title: .title
          properties:
            source: .source
            description: .description
            mitigation: .mitigation
            severity: .severity
            findingCategory: .finding_category
            status: .status
            productStatus: .product_status
            subProductStatuses: .sub_product_statuses
            title: .title
            toolSeverity: .tool_severity
            createdAt: .created_at
            lastUpdated: .last_updated
            cwe: .cwe
            cve: .cve
            link: .link
            riskScore: .risk_score
            findingScore: .finding_score
          relations:
            product: .product_id
            subProduct: .sub_product_id
```

</details>

## Let's Test It

This section includes a sample response data from ArmorCode. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from ArmorCode:

<details>
<summary>Product response data</summary>

```json showLineNumbers
{
  "id": 1,
  "name": "E-commerce Platform",
  "description": "Main e-commerce application for online retail",
  "business_owner": "John Smith",
  "security_owner": "Sarah Johnson",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:45:00Z"
}
```

</details>

<details>
<summary>Sub-Product response data</summary>

```json showLineNumbers
{
  "id": 101,
  "name": "payment-service",
  "repo_link": "https://github.com/company/payment-service",
  "programming_language": "Java",
  "technologies": ["Spring Boot", "PostgreSQL", "Redis"],
  "product_id": 1,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-20T14:45:00Z"
}
```

</details>

<details>
<summary>Finding response data</summary>

```json showLineNumbers
{
  "id": 1001,
  "title": "SQL Injection Vulnerability",
  "source": "SAST",
  "description": "Potential SQL injection vulnerability detected in user input validation",
  "mitigation": "Use parameterized queries and input validation",
  "severity": "HIGH",
  "finding_category": "Code Security",
  "status": "OPEN",
  "product_status": "ACTIVE",
  "sub_product_statuses": "ACTIVE",
  "tool_severity": "HIGH",
  "created_at": "2024-01-15T10:30:00Z",
  "last_updated": "2024-01-20T14:45:00Z",
  "cwe": ["CWE-89"],
  "cve": ["CVE-2023-1234"],
  "link": "https://app.armorcode.com/findings/1001",
  "risk_score": 8.5,
  "finding_score": 7.2,
  "product_id": 1,
  "sub_product_id": 101
}
```

</details> 