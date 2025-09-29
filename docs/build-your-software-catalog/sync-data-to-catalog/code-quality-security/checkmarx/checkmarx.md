import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import Prerequisites from "../../templates/_ocean_helm_prerequisites_block.mdx"
import AdvancedConfig from '../../../../generalTemplates/_ocean_advanced_configuration_note.md'
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import OceanSaasInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_saas_installation.mdx"
import OceanRealtimeInstallation from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_ocean_realtime_installation.mdx"
import MetricsAndSyncStatus from "/docs/build-your-software-catalog/sync-data-to-catalog/templates/_metrics_and_sync_status.mdx"
import FindCredentials from "/docs/build-your-software-catalog/custom-integration/api/_template_docs/_find_credentials.mdx"
import DockerParameters from "./_checkmarx_docker_parameters.mdx"

# Checkmarx One
This integration allows you to model Checkmarx One resources in your software catalog and ingest data into them.  
It lets you map and organize the desired Checkmarx One resources and their metadata in Port (see supported resources below).

### Supported Resources

The resources that can be ingested from Checkmarx One into Port are listed below. It is possible to reference any field that appears in the API responses linked below in the mapping configuration.

- [`Project`](https://checkmarx.stoplight.io/docs/checkmarx-one-api-reference-guide/j4vd1fubv8m4z-retrieve-list-of-projects) - Project information and metadata
- [`Scan`](https://checkmarx.stoplight.io/docs/checkmarx-one-api-reference-guide/1wnhzwk5inwup-retrieve-list-of-scans) - Security scan execution details and status
- [`SAST`](https://checkmarx.stoplight.io/docs/checkmarx-one-api-reference-guide/branches/main/whqbw17zn6rg1-retrieve-scan-results-all-scanners) - Static Application Security Testing results
- [`SCA`](https://checkmarx.stoplight.io/docs/checkmarx-one-api-reference-guide/branches/main/whqbw17zn6rg1-retrieve-scan-results-all-scanners) - Software Composition Analysis results
- [`KICS`](https://checkmarx.stoplight.io/docs/checkmarx-one-api-reference-guide/branches/main/whqbw17zn6rg1-retrieve-scan-results-all-scanners) - Infrastructure as Code Security results
- [`Container Security`](https://checkmarx.stoplight.io/docs/checkmarx-one-api-reference-guide/branches/main/whqbw17zn6rg1-retrieve-scan-results-all-scanners) - Container security scan results
- [`API Security`](https://checkmarx.stoplight.io/docs/checkmarx-one-api-reference-guide/branches/main/whqbw17zn6rg1-retrieve-scan-results-all-scanners) - API security risks and vulnerabilities

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

<OceanSaasInstallation integration="CheckmarxOne" />

</TabItem>

<TabItem value="real-time-self-hosted" label="Self-hosted">

Using this installation option means that the integration will be able to update Port in real time using polling.

<h2>Prerequisites</h2>

<Prerequisites />

For details about the available parameters for the installation, see the table below.

<Tabs groupId="deploy" queryString="deploy">

<TabItem value="helm" label="Helm">

<OceanRealtimeInstallation integration="CheckmarxOne" />

<PortApiRegionTip/>

</TabItem>

<TabItem value="argocd" label="ArgoCD" default>

To install the integration using ArgoCD:

1. Create a `values.yaml` file in `argocd/my-ocean-checkmarx-one-integration` in your git repository with the content:

:::note Configuration Placeholders
Remember to replace the placeholders for `checkmarxTenant` and checkmarxApiKey.
:::

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
    checkmarxTenant: CHECKMARX_TENANT_NAME
  secrets:
    checkmarxApiKey: CHECKMARX_API_KEY
```

<br/>

2. Install the `my-ocean-checkmarx-one-integration` ArgoCD Application by creating the following `my-ocean-checkmarx-one-integration.yaml` manifest:

:::note ArgoCD Application Placeholders
Remember to replace the placeholders for `YOUR_PORT_CLIENT_ID` `YOUR_PORT_CLIENT_SECRET` and `YOUR_GIT_REPO_URL`.
:::

Multiple sources ArgoCD documentation can be found [here](https://argo-cd.readthedocs.io/en/stable/user-guide/multiple_sources/#helm-value-files-from-external-git-repository).
:::

<details>
  <summary><b>ArgoCD Application (click to expand)</b></summary>

```yaml showLineNumbers
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: my-ocean-checkmarx-one-integration
  namespace: argocd
spec:
  destination:
    server: https://kubernetes.default.svc
    namespace: my-ocean-checkmarx-one-integration
  project: default
  sources:
    - repoURL: 'https://port-labs.github.io/helm-charts/'
      chart: port-ocean
      targetRevision: 0.9.5
      helm:
        valueFiles:
        - $values/argocd/
        my-ocean-checkmarx-one-integration/values.yaml
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
| `integration.secrets.webhookSecret`            | A secret to secure webhooks from Checkmarx One. This is optional but highly recommended for security if you enable live-events.                                                                                                                               | ❌        |

<br/>

<AdvancedConfig/>

</TabItem>

<TabItem value="one-time-ci" label="CI">

This workflow/pipeline will run the Checkmarx One integration once and then exit, this is useful for **scheduled** ingestion of data.

:::warning Real-time updates
If you want the integration to update Port in real time using polling you should use the [Self-hosted](?installation-methods=real-time-self-hosted#setup) installation option.
:::

<Tabs groupId="cicd-method" queryString="cicd-method">
<TabItem value="github" label="GitHub">

Make sure to configure the following [Github Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions):

<DockerParameters />

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

:::tip Jenkins Docker Requirements
Your Jenkins agent should be able to run docker commands.
:::

<br />

Make sure to configure the following [Jenkins Credentials](https://www.jenkins.io/doc/book/using/using-credentials/)
of `Secret Text` type:

<DockerParameters />

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

:::tip Azure DevOps Docker Requirements
Your Azure DevOps agent should be able to run docker commands.
:::

<br />

Make sure to configure the following [Azure DevOps Variables](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/variables?view=azure-devops&tabs=yaml%2Cbatch)
as secret variables:

<DockerParameters />

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
    exit $?
  displayName: 'Ingest Data into Port'
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
<summary><b>Default mapping configuration (click to expand)</b></summary>

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

  - kind: sast
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .resultHash
          title: .queryName
          blueprint: '"checkmarxSast"'
          properties:
            firstScanId: .firstScanID
            status: .status
            state: .state
            severity: (.severity // empty)
            confidenceLevel: .confidenceLevel
            created: .firstFoundAt
            nodes: (.nodes // empty)
            cweId: (.cweID // empty)
          relations:
            scan: .scanID

  - kind: sca
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .data.packageIdentifier
          blueprint: '"checkmarxSCA"'
          properties:
            firstScanId: .firstScanId
            status: .status
            state: .state
            severity: .severity
            created: .created
            description: .description
            packageIdentifier: .data.packageIdentifier
            recommendations: .data.recommendations
            recommendedVersion: .data.recommendedVersion
            packageData: .data.packageData
            cweId: .vulnerabilityDetails.cweId
          relations:
            scan: .__scan_id

  - kind: kics
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .description
          blueprint: '"checkmarxKics"'
          properties:
            type: .type
            firstScanId: .firstScanId
            id: .id
            status: .status
            state: .state
            severity: (.severity // empty)
            confidenceLevel: .confidenceLevel
            created: .created
            description: .description
            fileName: (.data.fileName // empty)
            line: (.data.line // empty)
            platform: (.data.platform // empty)
            issueType: (.data.issueType // empty)
            expectedValue: (.data.expectedValue // empty)
            value: (.data.value // empty)
        relations:
          scan: .__scan_id

  - kind: containers
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .id
          title: .id
          blueprint: '"checkmarxContainerSecurity"'
          properties:
            firstScanId: .firstScanId
            status: .status
            state: .state
            severity: .severity
            confidenceLevel: .confidenceLevel
            created: .created
            description: .description
            packageName: .data.packageName
            packageVersion: .data.packageVersion
            imageName: .data.imageName
            imageTag: .data.imageTag
            imageFilePath: .data.imageFilePath
            cweId: .vulnerabilityDetails.cweId
          relations:
            scan: .__scan_id

  - kind: apisec
    selector:
      query: 'true'
    port:
      entity:
        mappings:
          identifier: .risk_id
          title: .name
          blueprint: '"checkmarxApiSec"'
          properties:
            riskId: .risk_id
            apiId: .api_id
            severity: (.severity // empty)
            name: .name
            status: .status
            httpMethod: .http_method
            url: .url
            origin: .origin
            documented: .documented
            authenticated: .authenticated
            discoveryDate: .discovery_date
            scanId: .scan_id
            sastRiskId: (.sast_risk_id // empty)
            projectId: .project_id
            state: .state
        relations:
          scan: .scan_id
```
</details>

:::tip Deep links to Checkmarx One dashboard
If you need to ingest deep links back to the Checkmarx One dashboard, you can construct them using jq expressions in your mapping configuration. Combine your Checkmarx One UI base URL with relevant path parameters from the data returned by the API.

For example, to create a dashboard link for a project:
```yaml
dashboardUrl: '"https://your-region.ast.checkmarx.net/projects/" + .id'
```

Or for a specific scan result:
```yaml
scanUrl: '"https://your-region.ast.checkmarx.net/projects/" + .projectId + "/scans/" + "?id=" + .id'
```

Replace `your-region` with your actual Checkmarx One region (e.g., `eu`, `us`, `deu`, etc.) and adjust the path structure based on your Checkmarx One dashboard URL format.
:::

<MetricsAndSyncStatus />

## Examples

To view and test the integration's mapping against examples of the third-party API responses, use the jq playground in your data sources page. Find the integration in the list of data sources and click on it to open the playground.

Examples of blueprints and the relevant integration configurations can be found on the [Checkmarx examples page](./examples).

### Resource Configuration

The Checkmarx One integration supports filtering and configuration for different resource types:

#### Project Resources

Projects can be synchronized without additional filtering options.

#### Scan Resources

Scans can be filtered using the following scan filter options:

- **Project Names** (`projectIds`): Filter scans by their project name
- **Branches**: Filter results by the name of the Git branch that was scanned
- **Statuses**: Filter results by the execution status of the scans (case insensitive, OR operator for multiple statuses):
  - `Queued`
  - `Running` 
  - `Completed`
  - `Failed`
  - `Partial`
  - `Canceled`
- **Since**: Filter results by the date and time when the scan was created (UNIX timestamp in seconds, default: 90 days)

#### Security Scan Results (SCA/Containers) Configuration

You can configure security scan results (SCA, Container Security) with the following filters:

- **Scan Filter**: Apply the same scan filtering options as above
- **Severity**: Filter by severity level (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`)
- **State**: Filter by state:
  - `TO_VERIFY`
  - `CONFIRMED`
  - `URGENT`
  - `NOT_EXPLOITABLE`
  - `PROPOSED_NOT_EXPLOITABLE`
  - `FALSE_POSITIVE`
- **Status**: Filter by status (`NEW`, `RECURRENT`, `FIXED`)
- **Exclude Result Types**: Filter to exclude dev and test dependencies (`DEV_AND_TEST`, `NONE`)

#### SAST (Static Application Security Testing) Configuration

SAST results can be configured with comprehensive filtering options:

- **Scan Filter**: Apply the same scan filtering options as above
- **Compliance**: Filter by compliance standard (exact match, case insensitive)
- **Group**: Filter by vulnerability group (substring match)
- **Include Nodes**: Include or omit node data (default: `true`)
- **Language**: Filter by language (exact match, case insensitive)
- **Result ID**: Filter by unique result hash
- **Severity**: Filter by severity level (`critical`, `high`, `medium`, `low`, `info`)
- **Status**: Filter by status (`new`, `recurrent`, `fixed`)
- **Category**: Filter by comma separated list of categories
- **State**: Filter by state:
  - `to_verify`
  - `not_exploitable`
  - `proposed_not_exploitable`
  - `confirmed`
  - `urgent`

#### KICS (Infrastructure as Code Security) Configuration

KICS results can be configured with the following filters:

- **Scan Filter**: Apply the same scan filtering options as above
- **Severity**: Filter KICS results by severity levels (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`)
- **Status**: Filter KICS results by status (`NEW`, `RECURRENT`, `FIXED`)

#### API Security Configuration

API security results can be configured with:

- **Scan Filter**: Apply the same scan filtering options as above


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


## Alternative installation via webhook

While the Ocean integration described above is the recommended installation method, you may prefer to use a webhook to ingest data from Checkmarx One. If so, use the following instructions:

**Note** that when using the webhook installation method, data will be ingested into Port only when the webhook is triggered.

<details>

<summary><b>Webhook installation (click to expand)</b></summary>

In this example you are going to create a webhook integration between [Checkmarx One](https://checkmarx.com/) and Port, which will ingest Checkmarx One scan events and results.

<h2> Port configuration </h2>

Create the following blueprint definitions:

<details>
<summary><b>Checkmarx Scan blueprint (click to expand)</b></summary>

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
        "enum": [
          "Queued",
          "Running",
          "Completed",
          "Failed",
          "Partial",
          "Canceled"
        ],
        "description": "The status of the scan. Possible values: Queued, Running, Completed, Failed, Partial, Canceled."
      },
      "branch": {
        "type": "string",
        "title": "Branch",
        "description": "The branch of the repository that was scanned."
      },
      "createdAt": {
        "type": "string",
        "format": "date-time",
        "title": "Created At",
        "description": "The date and time when the scan was created."
      },
      "updatedAt": {
        "type": "string",
        "format": "date-time",
        "title": "Updated At",
        "description": "The date and time when the scan was last updated."
      },
      "projectId": {
        "type": "string",
        "title": "Project ID",
        "description": "The identifier of the project to which this scan belongs."
      },
      "userAgent": {
        "type": "string",
        "title": "User Agent",
        "description": "The user agent used to initiate the scan."
      }
    },
    "required": ["status", "projectId"]
  },
  "relations": {}
}
```

</details>

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints)

<details>
<summary><b>Checkmarx One webhook configuration (click to expand)</b></summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Checkmarx One mapper`;
   2. Identifier : `checkmarx_one_mapper`;
   3. Description : `A webhook configuration to map Checkmarx One scan events to Port`;
   4. Icon : `Checkmarx`;
2. **Integration configuration** tab - fill the following JQ mapping:

```json showLineNumbers
{
  "mappings": [
    {
      "blueprint": "checkmarxScan",
      "itemsToParse": ".body",
      "entity": {
        "identifier": ".item.scanId",
        "title": "(.item.projectId + \"-\" + .item.scanId)",
        "properties": {
          "status": ".item.status",
          "branch": ".item.branch",
          "createdAt": ".item.createdAt",
          "updatedAt": ".item.updatedAt",
          "projectId": ".item.projectId",
          "userAgent": ".item.userAgent"
        }
      }
    }
  ],
  "enabled": true,
  "security": {}
}
```

3. Click **Save** at the bottom of the page.

</details>

<h2> Create a webhook in Checkmarx One </h2>

You can follow the instruction in [Checkmarx One's webhook documentation](https://checkmarx.stoplight.io/docs/checkmarx-one-api-reference-guide), they are also outlined here for reference:

1. Log in to Checkmarx One with admin permissions.
2. Navigate to **Settings** > **Webhooks**.
3. Click **Add Webhook**.
4. Input the following details:
   1. `Name` - use a meaningful name such as Port Webhook.
   2. `Payload URL` - enter the value of the `url` key you received after creating the webhook configuration.
   3. Under `Events` - select the following events:
      - `Project Created`
      - `Completed Scan`
      - `Failed Scan`
      - `Partial Scan`
5. Click **Create Webhook** at the bottom of the page.

:::tip Checkmarx One events and payload
In order to view the different payloads and events available in Checkmarx One webhooks, [look here](https://docs.checkmarx.com/en/34965-68538-configuring-projects.html#UUID-1a1413d4-5d19-ddc0-aa35-51ff05ef0ade_UUID-a11c3b46-abfa-c26f-026b-0a9c04a79a46)
:::

Done! any project creation and scan completion event (successful, failed, or partial) will trigger a webhook event that Checkmarx One will send to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.

<h2> Webhook Configuration Options </h2>

Checkmarx One supports two types of webhook configurations with different scoping levels:

### Tenant-Level Webhooks
- **Scope**: Receive events from all projects within your Checkmarx One tenant
- **Use Case**: When you want to monitor all security scans across your entire organization
- **Configuration**: Set up the webhook at the tenant level in Checkmarx One settings
- **Events**: All scan events (`scan_completed_successfully`, `scan_failed`, `scan_partial`) from any project

### Project-Scoped Webhooks
- **Scope**: Receive events only from specific projects you select
- **Use Case**: When you want to monitor only certain critical projects or applications
- **Configuration**: Set up the webhook at the project level in Checkmarx One settings
- **Events**: Scan events only from the selected project(s)

:::tip Choosing the Right Scope
- Use **tenant-level webhooks** for comprehensive security monitoring across your organization
- Use **project-scoped webhooks** when you need granular control or want to reduce noise from non-critical projects
:::

<h2> Let's Test It </h2>

This section includes a sample webhook event sent from Checkmarx One when a scan is completed. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

<h3> Payload </h3>

Here is an example of the payload structure sent to the webhook URL when a Checkmarx One scan is completed:

<details>
<summary><b>Webhook event payload (click to expand)</b></summary>

```json showLineNumbers
{
  "id": "f62213cb-183b-4a48-b880-56640d45d209",
  "status": "Running",
  "branch": "main",
  "createdAt": "2025-09-08T17:39:31.344557Z",
  "updatedAt": "2025-09-08T17:39:31.448929Z",
  "projectId": "6ace8769-7ad3-4812-8990-0d4111ba0156",
  "projectName": "Test-Project/test-repo",
  "userAgent": "grpc-java-netty/1.63.0",
  "initiator": "user@company.org",
  "tags": {},
  "metadata": {
    "id": "f62213cb-183b-4a48-b880-56640d45d209",
    "type": "git",
    "Handler": {
      "GitHandler": {
        "branch": "main",
        "repo_url": "https://github.com/Test-Org/test-repo",
        "credentials": {
          "type": "apiKey",
          "value": "*****",
          "username": "*****"
        }
      }
    },
    "configs": [
      {
        "type": "sast",
        "value": {
          "presetName": "",
          "incremental": "false"
        }
      },
      {
        "type": "sca"
      },
      {
        "type": "kics"
      },
      {
        "type": "apisec"
      }
    ],
    "project": {
      "id": "6ace8769-7ad3-4812-8990-0d4111ba0156"
    },
    "created_at": {
      "nanos": 128635019,
      "seconds": 1757353171
    }
  },
  "engines": [
    "sast",
    "sca",
    "kics",
    "apisec"
  ],
  "sourceType": "github",
  "sourceOrigin": "Project Scan"
}
```

</details>

<h3> Mapping Result </h3>

The combination of the sample payload and the webhook configuration generates the following Port entity:

```json showLineNumbers
{
  "identifier": "f62213cb-183b-4a48-b880-56640d45d209",
  "title": "6ace8769-7ad3-4812-8990-0d4111ba0156-f62213cb-183b-4a48-b880-56640d45d209",
  "blueprint": "checkmarxScan",
  "properties": {
    "status": "Running",
    "branch": "main",
    "createdAt": "2025-09-08T17:39:31.344557Z",
    "updatedAt": "2025-09-08T17:39:31.448929Z",
    "projectId": "6ace8769-7ad3-4812-8990-0d4111ba0156",
    "userAgent": "grpc-java-netty/1.63.0",
    "configs": {},
    "statusDetails": []
  },
  "relations": {
    "project": "6ace8769-7ad3-4812-8990-0d4111ba0156"
  }
}
```

</details>
