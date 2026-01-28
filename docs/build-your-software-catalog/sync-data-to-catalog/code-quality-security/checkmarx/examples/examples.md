---
sidebar_position: 2
---
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

import ProjectBlueprint from './example-project/_checkmarx_exporter_example_project_blueprint.mdx'
import ProjectConfig from './example-project/_checkmarx_exporter_example_project_port_app_config.mdx'

import ScanBlueprint from './example-scan/_checkmarx_exporter_example_scan_blueprint.mdx'
import ScanConfig from './example-scan/_checkmarx_exporter_example_scan_port_app_config.mdx'

import ProjectScanConfig from './example-project-scan/_checkmarx_exporter_example_project_scan_port_app_config.mdx'

import SastBlueprint from './example-sast/_checkmarx_exporter_example_sast_blueprint.mdx'
import SastConfig from './example-sast/_checkmarx_exporter_example_sast_port_app_config.mdx'

import ScaBlueprint from './example-sca/_checkmarx_exporter_example_sca_blueprint.mdx'
import ScaConfig from './example-sca/_checkmarx_exporter_example_sca_port_app_config.mdx'

import KicsBlueprint from './example-kics/_checkmarx_exporter_example_kics_blueprint.mdx'
import KicsConfig from './example-kics/_checkmarx_exporter_example_kics_port_app_config.mdx'

import ContainerSecurityBlueprint from './example-container-security/_checkmarx_exporter_example_container_security_blueprint.mdx'
import ContainerSecurityConfig from './example-container-security/_checkmarx_exporter_example_container_security_port_app_config.mdx'

import ApiSecurityBlueprint from './example-api-security/_checkmarx_exporter_example_api_security_blueprint.mdx'
import ApiSecurityConfig from './example-api-security/_checkmarx_exporter_example_api_security_port_app_config.mdx'

import ApplicationBlueprint from './example-application/_checkmarx_exporter_example_application_blueprint.mdx'
import ApplicationConfig from './example-application/_checkmarx_exporter_example_application_port_app_config.mdx'

# Resource mapping examples

## Map Checkmarx projects

The following example demonstrates how to ingest your Checkmarx projects to Port:

<ProjectBlueprint/>

<ProjectConfig/>

## Map Checkmarx scans

The following example demonstrates how to ingest your Checkmarx scans to Port:

<ScanBlueprint/>

<ScanConfig/>

:::tip learn more

- Scans represent individual security analysis runs for Checkmarx projects.
- Each scan is linked to its parent project through relations.

:::

## Map Checkmarx projects and scans together

The following example demonstrates how to ingest both Checkmarx projects and their scans to Port in a single configuration:

<ProjectBlueprint/>

<ScanBlueprint/>

<ProjectScanConfig/>

## Map SAST findings

The following example demonstrates how to ingest Checkmarx SAST (Static Application Security Testing) findings to Port:

<SastBlueprint/>

<SastConfig/>

:::tip learn more

- SAST findings represent static code analysis results from Checkmarx scans.
- Each SAST finding is linked to the scan that discovered it.
- The severity levels are: LOW, MEDIUM, HIGH, CRITICAL.

:::

## Map SCA findings

The following example demonstrates how to ingest Checkmarx SCA (Software Composition Analysis) findings to Port:

<ScaBlueprint/>

<ScaConfig/>

:::tip learn more

- SCA findings represent vulnerabilities in third-party dependencies and packages.
- Each SCA finding includes package information and remediation recommendations.
- The findings are linked to the scan that discovered them.

:::

## Map KICS findings

The following example demonstrates how to ingest Checkmarx KICS (Keeping Infrastructure as Code Secure) findings to Port:

<KicsBlueprint/>

<KicsConfig/>

:::tip learn more

- KICS findings represent infrastructure as code security issues.
- Each finding includes file location, expected vs actual values, and platform information.
- The severity levels include: LOW, MEDIUM, HIGH, CRITICAL, INFO.

:::

## Map Container Security findings

The following example demonstrates how to ingest Checkmarx Container Security findings to Port:

<ContainerSecurityBlueprint/>

<ContainerSecurityConfig/>

:::tip learn more

- Container Security findings represent vulnerabilities in container images.
- Each finding includes package information, image details, and file paths.
- Findings are linked to the scan that discovered them.

:::

## Map API Security findings

The following example demonstrates how to ingest Checkmarx API Security findings to Port:

<ApiSecurityBlueprint/>

<ApiSecurityConfig/>

:::tip learn more

- API Security findings represent risks discovered in API endpoints.
- Each finding includes HTTP method, URL, authentication status, and documentation status.
- The state field indicates the verification and remediation status.

:::

## Map Checkmarx applications

The following example demonstrates how to ingest your Checkmarx applications to Port:

<ApplicationBlueprint/>

<ApplicationConfig/>

<Tabs groupId="config" queryString="parameter">

<TabItem label="Name" value="includeName">

The `name` optional selector is used to filter applications based on a partial matching on your application name property.

```yaml
  - kind: application
    selector:
      query: 'true'
      # highlight-next-line
      name: 'port'
```

</TabItem>

<TabItem label="Tag Keys" value="includeTagKeys">

The `tagKeys` optional selector is used to filter applications based on specific tag keys associated with your applications.

```yaml
  - kind: application
    selector:
      query: 'true'
      # highlight-next-line
      tagKeys: ['env', 'scope']
```

</TabItem>

<TabItem label="Tag Values" value="includeTagValues">

The `tagValues` optional selector is used to filter applications based on specific tag values associated with your applications.

```yaml
  - kind: application
    selector:
      query: 'true'
      # highlight-next-line
      tagValues: ['dev', 'frontend']
```

</TabItem>

</Tabs>

:::tip learn more

- Applications in Checkmarx are one logical entity used to group related projects.
- Each application can have multiple projects associated with it and having rules that define how projects are grouped.
- For more information, see [Applications](https://checkmarx.stoplight.io/docs/checkmarx-one-api-reference-guide/branches/main/szojm2v0j748d-applications-service-rest-api) section in the Checkmarx One API Reference Guide.

:::