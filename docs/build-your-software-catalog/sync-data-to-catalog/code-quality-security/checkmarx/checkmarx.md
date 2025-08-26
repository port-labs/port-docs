import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../../templates/_ocean_helm_prerequisites_block.mdx"
import AdvancedConfig from '../../../../generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"
import MetricsAndSyncStatus from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_metrics_and_sync_status.mdx"
import FindCredentials from "/docs/build-your-software-catalog/custom-integration/api/_template_docs/_find_credentials.mdx"

# Checkmarx One

Port's Checkmarx One integration allows you to model Checkmarx One resources in your software catalog and ingest data into them.

## Overview

This integration allows you to:

- Map and organize your desired Checkmarx One resources and their metadata in Port (see supported resources below).

### Supported Resources

The resources that can be ingested from Checkmarx One into Port are listed below. It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [`Project`](https://checkmarx.stoplight.io/docs/checkmarx-one-api-reference-guide/j4vd1fubv8m4z-retrieve-list-of-projects)
- [`Scan`](https://checkmarx.stoplight.io/docs/checkmarx-one-api-reference-guide/1wnhzwk5inwup-retrieve-list-of-scans)
- [`Scan Result`](https://checkmarx.stoplight.io/docs/checkmarx-one-api-reference-guide/branches/main/whqbw17zn6rg1-retrieve-scan-results-all-scanners)

## Setup

### Prerequisites

1. A Checkmarx One enterprise account.
2. A Port organization with admin permissions.

:::info Checkmarx One API Access
The Checkmarx One API is available for enterprise customers. You need an API key to authenticate with the Checkmarx One API.
:::

### Port Credentials

<FindCredentials />

### Checkmarx One Credentials

You need the following connection details to configure Checkmarx One:

- **Checkmarx One Base URL**: The API endpoint URL for your region
- **Checkmarx One IAM URL**: The IAM authentication URL for your region  
- **Tenant Name**: Your Checkmarx One tenant name
- **API Key**: Your Checkmarx One API key

:::info Regional URLs
Checkmarx One provides different URLs based on your region:

- **US**: `https://ast.checkmarx.net/api` / `https://iam.checkmarx.net`
- **EU**: `https://eu.ast.checkmarx.net/api` / `https://eu.iam.checkmarx.net`
- **US2**: `https://us.ast.checkmarx.net/api` / `https://us.iam.checkmarx.net`
- **EU2**: `https://eu-2.ast.checkmarx.net/api` / `https://eu-2.iam.checkmarx.net`
- **DEU**: `https://deu.ast.checkmarx.net/api` / `https://deu.iam.checkmarx.net`
- **ANZ**: `https://anz.ast.checkmarx.net/api` / `https://anz.iam.checkmarx.net`
- **IND**: `https://ind.ast.checkmarx.net/api` / `https://ind.iam.checkmarx.net`
- **SNG**: `https://sng.ast.checkmarx.net/api` / `https://sng.iam.checkmarx.net`
- **UAE**: `https://mea.ast.checkmarx.net/api` / `https://mea.iam.checkmarx.net`
:::

<br />

1. **Finding Your Checkmarx One Base URL and IAM URL**:
   - Login to your Checkmarx One account
   - Navigate to **Settings** > **Identity and Access Management**
   - The base URL and IAM URL will be displayed based on your region
   - Copy and save both URLs for use in the integration configuration

2. **Getting Your Tenant Name**:
   - Your tenant name is typically part of your login URL
   - It can also be found in your account settings
   - Copy and save your tenant name

3. **Generating an API Key**:
   - Login to Checkmarx One with admin permissions
   - Navigate to **Settings** > **Identity and Access Management** > **API Keys**
   - Click **Add API Key**
   - Provide a descriptive name for the API key
   - Select the appropriate permissions (read access to projects, scans, and results)
   - Click **Create API Key**
   - Copy and securely store the generated API key

:::warning API Key Security
Store your API key securely and never share it. The API key provides access to your Checkmarx One data.
:::

Choose one of the following installation methods:  
Not sure which method is right for your use case? Check the available [installation methods](/build-your-software-catalog/sync-data-to-catalog/#installation-methods).

<Tabs groupId="installation-methods" queryString="installation-methods">

<TabItem value="hosted-by-port" label="Hosted by Port" default>

<OceanSaasInstallation integration="Checkmarx One" />

</TabItem>

<TabItem value="real-time-self-hosted" label="Real-time (self-hosted)">

Using this installation option means that the integration will be able to update Port in real time using polling.

<h2>Prerequisites</h2>

<Prerequisites />

For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm">

<OceanRealtimeInstallation integration="Checkmarx One" />

<PortApiRegionTip/>

</TabItem>

<TabItem value="argocd" label="ArgoCD" default>

To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-checkmarx-one-integration` in your git repository with the content:

```yaml showLineNumbers
initializePortResources: true
scheduledResyncInterval: 120
integration:
  identifier: my-ocean-checkmarx-one-integration
  type: checkmarx-one
  eventListener:
    type: POLLING
  config:
    checkmarxBaseUrl: https://ast.checkmarx.net/api
    checkmarxIamUrl: https://iam.checkmarx.net
    checkmarxTenant: YOUR_TENANT_NAME
  secrets:
    checkmarxApiKey: YOUR_API_KEY
```

<br/>

2. Create an ArgoCD application manifest file `my-ocean-checkmarx-one-integration.yaml`:

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-ocean-checkmarx-one-integration
  namespace: argocd
spec:
  project: default
  source:
    repoURL: YOUR_GIT_REPO_URL
    targetRevision: main
    path: argocd/my-ocean-checkmarx-one-integration
  destination:
    server: https://kubernetes.default.svc
    namespace: my-ocean-checkmarx-one-integration
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

<br/>

3. Apply your application manifest with `kubectl`:
```bash
kubectl apply -f my-ocean-checkmarx-one-integration.yaml
```

</TabItem>
</Tabs>

This table summarizes the available parameters for the installation.
Note the parameters specific to this integration, they are last in the table.

| Parameter                                        | Description                                                                                                                                             | Required |
|--------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| `port.clientId`                                  | Your port client id ([Get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials))     | ✅        |
| `port.clientSecret`                              | Your port client secret ([Get the credentials](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)) | ✅        |
| `port.baseUrl`                                   | Your Port API URL - `https://api.getport.io` for EU, `https://api.us.getport.io` for US                                                                 | ✅        |
| `integration.identifier`                         | Change the identifier to describe your integration                                                                                                      | ✅        |
| `integration.type`                               | The integration type                                                                                                                                     | ✅        |
| `integration.config.appHost`                     | The host of the Port Ocean app. Used to set up the integration endpoint for real-time updates via polling                            | ✅        |
| `integration.eventListener.type`                 | The event listener type                                                                                                                                  | ✅        |
| `scheduledResyncInterval`                        | The number of minutes between each resync                                                                                                               | ❌        |
| `initializePortResources`                        | Default true, When set to true the integration will create default blueprints and the port App config Mapping                                           | ❌        |
| `sendRawDataExamples`                            | Enable sending raw data examples from the third party API to port for testing and managing the integration mapping. Default is true                     | ❌        |
| `integration.config.checkmarxBaseUrl`            | The Checkmarx One API base URL for your region                                                                                                          | ✅        |
| `integration.config.checkmarxIamUrl`             | The Checkmarx One IAM URL for your region                                                                                                               | ✅        |
| `integration.config.checkmarxTenant`             | Your Checkmarx One tenant name                                                                                                                           | ✅        |
| `integration.secrets.checkmarxApiKey`            | Your Checkmarx One API key                                                                                                                               | ✅        |

<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="Scheduled (CI)">

This workflow/pipeline will run the Checkmarx One integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time using polling you should use the [Real-time (self-hosted)](?installation-methods=real-time-self-hosted#setup) installation option.
:::

<Tabs groupId="cicd-method" queryString="cicd-method">
<TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

| Secret Name                                    | Description                                    |
|------------------------------------------------|------------------------------------------------|
| `OCEAN__PORT__CLIENT_ID`                       | Your Port client ID                            |
| `OCEAN__PORT__CLIENT_SECRET`                   | Your Port client secret                        |
| `OCEAN__INTEGRATION__CONFIG__CHECKMARX_BASE_URL` | Your Checkmarx One API base URL               |
| `OCEAN__INTEGRATION__CONFIG__CHECKMARX_IAM_URL`  | Your Checkmarx One IAM URL                    |
| `OCEAN__INTEGRATION__CONFIG__CHECKMARX_TENANT`   | Your Checkmarx One tenant name                |
| `OCEAN__INTEGRATION__SECRETS__CHECKMARX_API_KEY` | Your Checkmarx One API key                    |

<br/>

Here is an example for `checkmarx-one-integration.yml` workflow file:

```yaml showLineNumbers
name: Checkmarx One Exporter Workflow

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
          type: 'checkmarx-one'
          port_client_id: ${{ secrets.OCEAN__PORT__CLIENT_ID }}
          port_client_secret: ${{ secrets.OCEAN__PORT__CLIENT_SECRET }}
          port_base_url: https://api.getport.io
          config: |
            checkmarx_base_url: ${{ secrets.OCEAN__INTEGRATION__CONFIG__CHECKMARX_BASE_URL }}
            checkmarx_iam_url: ${{ secrets.OCEAN__INTEGRATION__CONFIG__CHECKMARX_IAM_URL }}
            checkmarx_tenant: ${{ secrets.OCEAN__INTEGRATION__CONFIG__CHECKMARX_TENANT }}
            checkmarx_api_key: ${{ secrets.OCEAN__INTEGRATION__SECRETS__CHECKMARX_API_KEY }}
```

</TabItem>

<TabItem value="jenkins" label="Jenkins">

:::tip
Your Jenkins agent should be able to run docker commands.
:::

<br />

Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/)
of `Secret Text` type:

| Credential ID                                   | Description                                    |
|------------------------------------------------|------------------------------------------------|
| `OCEAN__PORT__CLIENT_ID`                        | Your Port client ID                            |
| `OCEAN__PORT__CLIENT_SECRET`                    | Your Port client secret                        |
| `OCEAN__INTEGRATION__CONFIG__CHECKMARX_BASE_URL` | Your Checkmarx One API base URL               |
| `OCEAN__INTEGRATION__CONFIG__CHECKMARX_IAM_URL`  | Your Checkmarx One IAM URL                    |
| `OCEAN__INTEGRATION__CONFIG__CHECKMARX_TENANT`   | Your Checkmarx One tenant name                |
| `OCEAN__INTEGRATION__SECRETS__CHECKMARX_API_KEY` | Your Checkmarx One API key                    |

<br/>

Here is an example for `Jenkinsfile` groovy pipeline file:

```text showLineNumbers
pipeline {
    agent any

    stages {
        stage('Run Checkmarx One Integration') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCEAN__PORT__CLIENT_ID', variable: 'OCEAN__PORT__CLIENT_ID'),
                        string(credentialsId: 'OCEAN__PORT__CLIENT_SECRET', variable: 'OCEAN__PORT__CLIENT_SECRET'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__CHECKMARX_BASE_URL', variable: 'OCEAN__INTEGRATION__CONFIG__CHECKMARX_BASE_URL'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__CHECKMARX_IAM_URL', variable: 'OCEAN__INTEGRATION__CONFIG__CHECKMARX_IAM_URL'),
                        string(credentialsId: 'OCEAN__INTEGRATION__CONFIG__CHECKMARX_TENANT', variable: 'OCEAN__INTEGRATION__CONFIG__CHECKMARX_TENANT'),
                        string(credentialsId: 'OCEAN__INTEGRATION__SECRETS__CHECKMARX_API_KEY', variable: 'OCEAN__INTEGRATION__SECRETS__CHECKMARX_API_KEY'),
                    ]) {
                        sh('''
                            #Set Docker image and run the container
                            integration_type="checkmarx-one"
                            version="latest"
                            image_name="ghcr.io/port-labs/port-ocean-${integration_type}:${version}"
                            docker run -i --rm --platform=linux/amd64 \
                                -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
                                -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
                                -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
                                -e OCEAN__INTEGRATION__CONFIG__CHECKMARX_BASE_URL=$OCEAN__INTEGRATION__CONFIG__CHECKMARX_BASE_URL \
                                -e OCEAN__INTEGRATION__CONFIG__CHECKMARX_IAM_URL=$OCEAN__INTEGRATION__CONFIG__CHECKMARX_IAM_URL \
                                -e OCEAN__INTEGRATION__CONFIG__CHECKMARX_TENANT=$OCEAN__INTEGRATION__CONFIG__CHECKMARX_TENANT \
                                -e OCEAN__INTEGRATION__SECRETS__CHECKMARX_API_KEY=$OCEAN__INTEGRATION__SECRETS__CHECKMARX_API_KEY \
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
Your Azure DevOps agent should be able to run docker commands.
:::

<br />

Make sure to configure the following [Azure DevOps Variables](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/variables?view=azure-devops&tabs=yaml%2Cbatch)
as secret variables:

| Variable Name                                   | Description                                    |
|------------------------------------------------|------------------------------------------------|
| `OCEAN__PORT__CLIENT_ID`                        | Your Port client ID                            |
| `OCEAN__PORT__CLIENT_SECRET`                    | Your Port client secret                        |
| `OCEAN__INTEGRATION__CONFIG__CHECKMARX_BASE_URL` | Your Checkmarx One API base URL               |
| `OCEAN__INTEGRATION__CONFIG__CHECKMARX_IAM_URL`  | Your Checkmarx One IAM URL                    |
| `OCEAN__INTEGRATION__CONFIG__CHECKMARX_TENANT`   | Your Checkmarx One tenant name                |
| `OCEAN__INTEGRATION__SECRETS__CHECKMARX_API_KEY` | Your Checkmarx One API key                    |

<br/>

Here is an example for `checkmarx-one-integration.yml` pipeline file:

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
    integration_type="checkmarx-one"
    version="latest"

    image_name="ghcr.io/port-labs/port-ocean-$integration_type:$version"

    docker run -i --rm \
        -e OCEAN__EVENT_LISTENER='{"type":"ONCE"}' \
        -e OCEAN__INITIALIZE_PORT_RESOURCES=true \
        -e OCEAN__SEND_RAW_DATA_EXAMPLES=true \
        -e OCEAN__INTEGRATION__CONFIG__CHECKMARX_BASE_URL=$(OCEAN__INTEGRATION__CONFIG__CHECKMARX_BASE_URL) \
        -e OCEAN__INTEGRATION__CONFIG__CHECKMARX_IAM_URL=$(OCEAN__INTEGRATION__CONFIG__CHECKMARX_IAM_URL) \
        -e OCEAN__INTEGRATION__CONFIG__CHECKMARX_TENANT=$(OCEAN__INTEGRATION__CONFIG__CHECKMARX_TENANT) \
        -e OCEAN__INTEGRATION__SECRETS__CHECKMARX_API_KEY=$(OCEAN__INTEGRATION__SECRETS__CHECKMARX_API_KEY) \
        -e OCEAN__PORT__CLIENT_ID=$(OCEAN__PORT__CLIENT_ID) \
        -e OCEAN__PORT__CLIENT_SECRET=$(OCEAN__PORT__CLIENT_SECRET) \
        -e OCEAN__PORT__BASE_URL='https://api.getport.io' \
        $image_name
```

</TabItem>
</Tabs>

</TabItem>
</Tabs>

<MetricsAndSyncStatus />

## Configuration

### Default mapping configuration

This is the default mapping configuration for this integration:

<details>
<summary><b>Default mapping configuration (Click to expand)</b></summary>

```yaml showLineNumbers
createMissingRelatedEntities: true
deleteDependentEntities: true
resources:
  - kind: project
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"checkmarxProject"'
          identifier: .id
          title: .name
          properties:
            name: .name
            createdAt: .createdAt
            updatedAt: .updatedAt
            tags: (.tags // {})
            repoUrl: .repoUrl
            mainBranch: .mainBranch
            origin: .origin
            criticality: .criticality

  - kind: scan
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          blueprint: '"checkmarxScan"'
          identifier: .id
          title: '(.projectId + "-" + .id)'
          properties:
            status: .status
            branch: .branch
            createdAt: .createdAt
            updatedAt: .updatedAt
            projectId: .projectId
            userAgent: .userAgent
            configs: (.configs // {})
            statusDetails: (.statusDetails // [])
          relations:
            project: .projectId

  - kind: scan_result
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .description
          # Blueprint name → checkmarx + Type (with leading char upper‑cased)
          blueprint: >
            "checkmarx" +
            (.type        | .[0:1] | ascii_upcase) +
            (.type        | .[1:])
          properties:
            type: .type
            severity: .severity
            state: .state
            confidenceLevel: .confidenceLevel
            description: .description
            cweId: (.vulnerabilityDetails.cweId // empty)
            fileName: (.data.nodes[0].fileName // empty)
            line: (.data.nodes[0].line // empty)
        relations:
          scan: .__scan_id
```

</details>

## Examples

Examples of blueprints and the relevant integration configurations:

### Project

<details>
<summary>Project blueprint</summary>

```json showLineNumbers
{
  "identifier": "checkmarxProject",
  "title": "Checkmarx Project",
  "icon": "Checkmarx",
  "schema": {
    "properties": {
      "name": {
        "type": "string",
        "title": "Project Name"
      },
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Created At"
      },
      "updatedAt": {
        "type": "string",
        "format": "date-time",
        "title": "Updated At"
      },
      "tags": {
        "type": "object",
        "title": "Tags"
      },
      "repoUrl": {
        "type": "string",
        "title": "Repository URL"
      },
      "mainBranch": {
        "type": "string",
        "title": "Main Branch"
      },
      "origin": {
        "type": "string",
        "title": "Origin"
      },
      "criticality": {
        "type": "string",
        "title": "Criticality"
      }
    },
    "required": ["name"]
  },
  "relations": {}
}
```

</details>

### Scan

<details>
<summary>Scan blueprint</summary>

```json showLineNumbers
{
  "identifier": "checkmarxScan",
  "title": "Checkmarx Scan",
  "icon": "Checkmarx",
  "schema": {
    "properties": {
      "status": {
        "type": "string",
        "title": "Status",
        "enum": ["Running", "Completed", "Failed", "Canceled", "Queued"]
      },
      "branch": {
        "type": "string",
        "title": "Branch"
      },
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Created At"
      },
      "updatedAt": {
        "type": "string",
        "format": "date-time",
        "title": "Updated At"
      },
      "projectId": {
        "type": "string",
        "title": "Project ID"
      },
      "userAgent": {
        "type": "string",
        "title": "User Agent"
      },
      "configs": {
        "type": "object",
        "title": "Configurations"
      },
      "statusDetails": {
        "type": "array",
        "items": {
          "type": "object"
        },
        "title": "Status Details"
      }
    },
    "required": ["status", "projectId"]
  },
  "relations": {
    "project": {
      "title": "Project",
      "target": "checkmarxProject",
      "many": false,
      "required": true
    }
  }
}
```

</details>

### Scan Result

<details>
<summary>Scan Result blueprint</summary>

```json showLineNumbers
{
  "identifier": "checkmarxSscs-secret-detection",
  "title": "Checkmarx Scan Result for SSCS",
  "icon": "Checkmarx",
  "schema": {
    "properties": {
      "type": {
        "type": "string",
        "title": "Type",
        "enum": [
          "sast",
          "sca",
          "kics",
          "containers",
          "sscs-secret-detection",
          "sscs-scorecard"
        ]
      },
      "severity": {
        "type": "string",
        "title": "Severity",
        "enum": [
          "LOW",
          "MEDIUM",
          "HIGH",
          "CRITICAL",
          "INFO"
        ]
      },
      "state": {
        "type": "string",
        "title": "State",
        "enum": [
          "TO_VERIFY",
          "CONFIRMED",
          "URGENT",
          "NOT_EXPLOITABLE",
          "PROPOSED_NOT_EXPLOITABLE",
          "FALSE_POSITIVE"
        ]
      },
      "confidenceLevel": {
        "type": "number",
        "title": "Confidence Level",
        "minimum": 0,
        "maximum": 100
      },
      "description": {
        "type": "string",
        "title": "Description"
      },
      "cweId": {
        "type": "string",
        "title": "CWE ID"
      },
      "fileName": {
        "type": "string",
        "title": "File Name"
      },
      "line": {
        "type": "number",
        "title": "Line Number"
      },
      "status": {
        "type": "string",
        "title": "Status",
        "enum": [
          "NEW",
          "RECURRENT",
          "FIXED"
        ]
      },
      "created": {
        "type": "string",
        "format": "date-time",
        "title": "Created At"
      },
      "firstFoundAt": {
        "type": "string",
        "format": "date-time",
        "title": "First Found At"
      },
      "foundAt": {
        "type": "string",
        "format": "date-time",
        "title": "Found At"
      },
      "similarityId": {
        "type": "string",
        "title": "Similarity ID"
      },
      "cvssScore": {
        "type": "number",
        "title": "CVSS Score"
      },
      "cveName": {
        "type": "string",
        "title": "CVE Name"
      },
      "packageName": {
        "type": "string",
        "title": "Package Name"
      },
      "packageVersion": {
        "type": "string",
        "title": "Package Version"
      },
      "imageName": {
        "type": "string",
        "title": "Image Name"
      },
      "imageTag": {
        "type": "string",
        "title": "Image Tag"
      },
      "ruleId": {
        "type": "string",
        "title": "Rule ID"
      },
      "ruleName": {
        "type": "string",
        "title": "Rule Name"
      },
      "remediation": {
        "type": "string",
        "title": "Remediation"
      },
      "remediationLink": {
        "type": "string",
        "format": "url",
        "title": "Remediation Link"
      }
    },
    "required": [
      "type",
      "severity",
      "state",
      "description"
    ]
  },
  "relations": {
    "scan": {
      "title": "Scan",
      "target": "checkmarxScan",
      "many": false,
      "required": false
    }
  }
}
```

</details>

### Resource Configuration

The Checkmarx One integration supports filtering and configuration for different resource types:

#### Scan Results Configuration

You can configure scan results with the following filters:

- **Severity**: Filter by severity level (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`)
- **State**: Filter by state (`TO_VERIFY`, `CONFIRMED`, `URGENT`, `NOT_EXPLOITABLE`, `PROPOSED_NOT_EXPLOITABLE`, `FALSE_POSITIVE`)
- **Status**: Filter by status (`NEW`, `RECURRENT`, `FIXED`)
- **Exclude Result Types**: Filter to exclude dev and test dependencies (`DEV_AND_TEST`, `NONE`)

#### Scan Configuration

You can configure scans to filter by specific project IDs:

- **Project IDs**: Limit search to specific project IDs

### Blueprint Structure

The integration creates the following blueprints:

#### Checkmarx Project
- **Identifier**: `checkmarxProject`
- **Properties**: name, createdAt, updatedAt, tags, repoUrl, mainBranch, origin, criticality

#### Checkmarx Scan
- **Identifier**: `checkmarxScan`
- **Properties**: status, branch, createdAt, updatedAt, projectId, userAgent, configs, statusDetails
- **Relations**: project (links to checkmarxProject)

#### Checkmarx Scan Results
- **Identifier**: `checkmarx{Type}` (dynamically generated based on result type)
- **Properties**: type, severity, state, confidenceLevel, description, cweId, fileName, line
- **Relations**: scan (links to checkmarxScan)

:::info Dynamic Blueprint Names
Scan result blueprints are dynamically named based on the result type. For example:
- `checkmarxSast` for SAST results
- `checkmarxSca` for SCA results
- `checkmarxKics` for KICS results
- `checkmarxContainers` for container scan results
- `checkmarxSscs-secret-detection` for SSCS secret detection results
:::

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure your API key is valid and has the correct permissions
2. **Regional URL Issues**: Verify you're using the correct base URL and IAM URL for your region
3. **Tenant Name Issues**: Make sure your tenant name is correctly specified
4. **Permission Issues**: Ensure your API key has read access to projects, scans, and results

### Logs and Debugging

The integration provides detailed logging for debugging:

- Check the integration logs for authentication and API request details
- Verify that the correct URLs and credentials are being used
- Monitor for any rate limiting or permission errors

For more detailed troubleshooting, refer to the [Checkmarx One API documentation](https://checkmarx.stoplight.io/docs/checkmarx-one-api-reference-guide).