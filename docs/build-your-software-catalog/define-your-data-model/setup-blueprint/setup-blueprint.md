---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Setup Blueprint

To build the data model into Port's software catalog you will use the Blueprint component.

## What is a blueprint?

A Blueprint is the generic building block in Port. It represents assets that can be managed in Port, such as `Microservice`, `Environments`, `Packages`, `Clusters`, `Databases`, and many more.

Blueprints are completely customizable, and they support any number of properties the user chooses, all of which can be modified as you go.

## Use cases for blueprints

Blueprints can be used to represent any asset in your software catalog, for example:

- Microservices;
- Packages;
- Packages version;
- CI jobs;
- K8s Clusters;
- Cloud accounts;
- Cloud environments;
- Developer environments;
- Service deployment;
- Pods;
- VMs;
- etc.

In this [live demo](https://demo.getport.io/dev-portal) example, we can see the DevPortal setup page with all of the blueprints.

## Blueprint schema structure

Each blueprint is represented by a [Json schema](https://json-schema.org/), as shown in the following section:

```json showLineNumbers
{
  "identifier": "myBlueprint",
  "title": "My title",
  "description": "My description",
  "icon": "My icon",
  "calculationProperties": {},
  "schema": {
    "properties": {
      "myProp1": {
        "type": "my_type",
        "title": "My title"
      },
      "myProp2": {
        "type": "my_special_type",
        "title": "My special title"
      }
    },
    "required": []
  },
  "relations": {}
}
```

### Structure table

| Field                   | Description                                                                                                               | Notes                                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `identifier`            | Unique identifier                                                                                                         | The identifier is used for API calls, programmatic access and distinguishing between different blueprints |
| `title`                 | Name                                                                                                                      | Human-readable name for the blueprint                                                                     |
| `description`           | Description                                                                                                               | The value is visible as a tooltip to users when hovering over the info icon in the UI                     |
| `icon`                  | Icon for the blueprint and entities of the blueprint.                                                                     | See the full icon list [below](#full-icon-list)                                                           |
| `calculationProperties` | Contains the properties defined using [calculation properties](./properties/calculation-property/calculation-property.md) |                                                                                                           |
| `mirrorProperties`      | Contains the properties defined using [mirror properties](./properties/mirror-property/mirror-property.md)                |                                                                                                           |
| `schema`                | An object containing two nested fields: `properties` and `required`.                                                      | See the schema structure [here](#schema-object)                                                           |

:::tip Available properties
All available properties are listed in the [properties](./properties/properties.md) page
:::

#### Full icon list

:::info Available Icons
`API, Airflow, AmazonEKS, Ansible, ApiDoc, Aqua, Argo, ArgoRollouts, Aws, Azure, BitBucket, Bucket, CPU, CPlusPlus, CSharp, Clickup, Cloud, Cluster, Codefresh, Confluence, Coralogix, Crossplane, Datadog, Day2Operation, DeployedAt, Deployment, DevopsTool, EC2, EU, Environment, Falcosidekick, GKE, GPU, Git, GitLab, GitVersion, Github, GithubActions, Go, Google, GoogleCloud, GoogleCloudPlatform, GoogleComputeEngine, Grafana, Graphql, HashiCorp, Infinity, Istio, Jenkins, Jira, Kafka, Kiali, Kotlin, Lambda, Launchdarkly, Link, Lock, LucidCharts, Matlab, Microservice, MongoDb, Moon, NewRelic, Node, NodeJS, Notion, Okta, Package, Pearl, PostgreSQL, Prometheus, Pulumi, Python, R, React, RestApi, Ruby, S3, SDK, SQL, Scala, Sentry, Server, Service, Slack, Swagger, Swift, TS, Terraform, TwoUsers, Youtrack, Zipkin, checkmarx, css3, html5, java, js, kibana, logz, pagerduty, php, port, sonarqube, spinnaker`
:::

### Schema object

```json showLineNumbers
"schema": {
    "properties": {},
    "required": []
}
```

| Schema field | Description                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `properties` | See the [`properties`](./properties/properties.md) section for more details.                                                          |
| `required`   | A list of the **required** properties, out of the `properties` object list. <br /> These are mandatory fields to fill in the UI form. |

## Configure blueprints in Port

<Tabs groupId="definition" defaultValue="api" values={[
{label: "API", value: "api"},
{label: "UI", value: "ui"},
{label: "Terraform", value: "tf"}
]}>

<TabItem value="api">

```json showLineNumbers
{
  "identifier": "myIdentifier",
  "title": "My title",
  "description": "My description",
  "icon": "My icon",
  "calculationProperties": {},
  "schema": {
    "properties": {},
    "required": []
  },
  "relations": {}
}
```

</TabItem>

<TabItem value="ui">

1. Go to the [DevPortal Setup page](https://app.getport.io/dev-portal)
2. Click on **Add blueprint** at the top right hand corner
3. Configure your blueprint using the from:

![Create New Blueprint](../../../../static/img/quickstart/newBlueprintButton.png)

</TabItem>

<TabItem value="tf">

```hcl showLineNumbers
resource "port-labs_blueprint" "myBlueprint" {
  title      = "My blueprint"
  icon       = "My icon"
  identifier = "myBlueprint"
}
```

</TabItem>
</Tabs>
