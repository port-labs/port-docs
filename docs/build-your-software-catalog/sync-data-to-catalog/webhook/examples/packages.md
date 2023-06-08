---
sidebar_position: 12
description: Ingest packages into your catalog
---

import ServiceBlueprint from './resources/packages/\_example_service_blueprint.mdx'
import PackageBlueprint from './resources/packages/\_example_package_blueprint.mdx'
import PackageWebhookConfig from './resources/packages/\_example_package_webhook_config.mdx'

# Packages

In this example you are going to create `package` blueprint that ingests all third party dependencies and libraries in your package.json, requirements.txt and go.md file using a combination of REST API and Webhook. Also, you will add some script to transform your package file into a format required by the webhook. Finally, you will configure your Gitlab to create/update your entities in Port every time a deployment or commit is made to a specified branch such as main/dev.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>Service blueprint</summary>
<ServiceBlueprint/>
</details>

<details>
<summary>Package blueprint</summary>
<PackageBlueprint/>
</details>

<details>
<summary>Package webhook configuration</summary>

<PackageWebhookConfig/>

</details>

## Ingesting JavaScript Dependencies

In this example you will create a `package` blueprint that ingests all third party dependencies in your package.json file using a combination of REST API and Webhook. You will then relate this blueprint to a `service` blueprint, allowing you to map all the packages used by a service.

For more information, visit:

- [Package.json example](https://github.com/port-labs/package-json-webhook-example)

## Ingesting Python Dependencies

In this example you will create a `package` blueprint that ingests all packages in your requirements.txt file using a combination of REST API and Webhook. You will then relate this blueprint to a `service` blueprint, allowing you to map all the packages used by a service.

For more information, visit:

- [Requirements.txt example](https://github.com/port-labs/requirements-file-webhook-example)

## Ingesting GO Dependencies

In this example, you will set up a webhook to ingest your Golang modules, version and dependencies whenever a Golang application is created or updated, allowing Port to ingest and process the GO entities accordingly.

For more information, visit:

- [Go.mod example](https://github.com/port-labs/golang-packages-webhook-example)
