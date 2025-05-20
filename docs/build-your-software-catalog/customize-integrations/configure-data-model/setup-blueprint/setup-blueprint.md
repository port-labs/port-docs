---
sidebar_position: 1
title: Setup Blueprints
sidebar_label: Setup Blueprints
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx";

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Setup Blueprints

<center>

<iframe width="568" height="320" src="https://www.youtube.com/embed/ssBKpPiENQA" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen allow="fullscreen;"></iframe>

</center>

<br/>

Blueprints are the most basic building block in Port. They are used to represent assets in your organization, and the relationships between them.

Blueprints are comprised of [properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties), which are used to define the structure of the data they represent. Port supports a wide variety of property types, allowing you to model your data in the most accurate way possible.

Blueprints are completely customizable, and support any number of properties. They are created and managed in the [builder page](https://app.getport.io/settings) of the portal.

## Common blueprints

Blueprints can be used to represent any asset in your software catalog, some common examples are:

- Microservices
- Packages
- Package versions
- CI jobs
- K8s Clusters
- Cloud accounts
- Cloud environments
- Developer environments
- Service deployment
- Pods
- VMs

Check out our [**live demo**](https://demo.getport.io/settings) to see an example of a fleshed-out builder with a variety of blueprints.

## Configure blueprints in Port

Port offers a variety of ways to create and edit blueprints:

<Tabs groupId="definition" queryString defaultValue="ui" values={[
{label: "UI", value: "ui"},
{label: "API", value: "api"},
{label: "Terraform", value: "tf"},
{label: "Pulumi", value: "pulumi"}
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

<ApiRef />

</TabItem>

<TabItem value="ui">

<h4>To edit an existing blueprint:</h4>

1. Go to your [Builder page](https://app.port.io/settings/data-model).

2. Expand your desired blueprint by double-clicking on it.

3. Here you can add, remove, or edit this blueprint's [properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/) and [relations](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/).

4. To edit the blueprint's metadata (title, icon, etc.), click on the `...` icon in the top right corner of the blueprint card, and choose `Edit blueprint`.


<h4>To create a new blueprint:</h4>

1. Go to your [Builder page](https://app.getport.io/settings).

2. Click on `+ Blueprint`:

3. Choose a title, icon, and description for your blueprint, then click `Create`.

4. Your blueprint has been created, the next step is to [ingest data into it](/build-your-software-catalog/sync-data-to-catalog/).

</TabItem>

<TabItem value="tf">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  title      = "My blueprint"
  icon       = "My icon"
  identifier = "myIdentifier"
  description = "My description"
  properties {
    string_props = {
      "myProperty" = {
        type  = "string"
        title = "My Property"
      }
      "myUrlProperty" = {
        title  = "URL Property"
        format = "url"
      }
    }
  }
}
```

:::tip Full example
For a full example, check the [Terraform-Managed Blueprint Example](../Iac/terraform-managed-blueprint.md) page.
:::

</TabItem>

<TabItem value="pulumi">

<Tabs groupId="pulumi-definition" queryString defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "TypeScript", value: "typescript"},
{label: "JavaScript", value: "javascript"},
{label: "GO", value: "go"}
]}>

<TabItem value="python">

```python showLineNumbers
"""A Python Pulumi program"""

impor t pulumi
from port_pulumi import Blueprint

blueprint = Blueprint(
    "myBlueprint",
    identifier="myBlueprint",
    title="My Blueprint",
    icon="My icon",
    description="My description",
    properties=port.BlueprintPropertiesArgs(
        string_props={
            "myStringProp": port.BlueprintPropertiesStringPropsArgs(
                title="My string", required=False
            ),
            "myUrlProp": port.BlueprintPropertiesStringPropsArgs(
                title="My url", required=False, format="url"
            ),
            "myEmailProp": port.BlueprintPropertiesStringPropsArgs(
                title="My email", required=False, format="email"
            ),
            "myUserProp": port.BlueprintPropertiesStringPropsArgs(
                title="My user", required=False, format="user"
            ),
            "myTeamProp": port.BlueprintPropertiesStringPropsArgs(
                title="My team", required=False, format="team"
            ),
            "myDatetimeProp": port.BlueprintPropertiesStringPropsArgs(
                title="My datetime", required=False, format="date-time"
            ),
            "myTimerProp": port.BlueprintPropertiesStringPropsArgs(
                title="My timer", required=False, format="timer"
            ),
            "myYAMLProp": port.BlueprintPropertiesStringPropsArgs(
                title="My yaml", required=False, format="yaml"
            ),
        }
    )
)
```

</TabItem>

<TabItem value="typescript">

```typescript showLineNumbers
import * as pulumi from "@pulumi/pulumi";
import * as port from "@port-labs/port";

export const blueprint = new port.Blueprint("myBlueprint", {
  identifier: "myBlueprint",
  title: "My Blueprint",
  icon: "My icon",
  description: "My description",
  properties: [
    {
      identifier: "language",
      title: "Language",
      type: "string",
      required: true,
    },
  ],
});
```

</TabItem>

<TabItem value="javascript">

```javascript showLineNumbers
"use strict";
const pulumi = require("@pulumi/pulumi");
const port = require("@port-labs/port");

const entity = new port.Blueprint("myBlueprint", {
  title: "My Blueprint",
  identifier: "myBlueprint",
  icon: "My icon",
  description: "My description",
  properties: [
    {
      name: "language",
      value: "Node",
    },
  ],
});

exports.title = entity.title;
```

</TabItem>
<TabItem value="go">

```go showLineNumbers
package main

import (
	"github.com/port-labs/pulumi-port/sdk/go/port"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		blueprint, err := port.NewBlueprint(ctx, "myBlueprint", &port.BlueprintArgs{
			Identifier: pulumi.String("myBlueprint"),
			Title:      pulumi.String("My Blueprint"),
			Icon:       pulumi.String("My icon"),
			Description: pulumi.String("My description"),
			Properties: port.BlueprintPropertiesArgs{
				StringProps: port.BlueprintPropertiesStringPropsMap{
					"myStringProp": port.BlueprintPropertiesStringPropsArgs{
						Title:    pulumi.String("My string"),
						Required: pulumi.Bool(false),
					},
				},
			},
		})
		ctx.Export("blueprint", blueprint.Title)
		if err != nil {
			return err
		}
		return nil
	})
}

```

</TabItem>

</Tabs>

:::tip Full example
For a full example, check the [Pulumi-Managed Blueprint Example](../Iac/pulumi-managed-blueprint.md) page.
:::

</TabItem>

</Tabs>

## Blueprint structure

Each blueprint is represented by a [Json schema](https://json-schema.org/), as shown in the following section:

```json showLineNumbers
{
  "identifier": "myIdentifier",
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

| Field                   | Description                                                                                                               | Notes                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `identifier`            | Unique identifier                                                                                                         | **Required**. The identifier is used for API calls, programmatic access and distinguishing between different blueprints |
| `title`                 | Name                                                                                                                      | **Required**. Human-readable name for the blueprint                                                                     |
| `description`           | Description                                                                                                               | The value is visible as a tooltip to users when hovering over the info icon in the UI                                   |
| `icon`                  | Icon for the blueprint and entities of the blueprint.                                                                     | See the full icon list [below](#full-icon-list)                                                                         |
| `calculationProperties` | Contains the properties defined using [calculation properties](./properties/calculation-property/calculation-property.md) | **Required**                                                                                                            |
| `mirrorProperties`      | Contains the properties defined using [mirror properties](./properties/mirror-property)                |                                                                                                                         |
| `schema`                | An object containing two nested fields: `properties` and `required`.                                                      | **Required**. See the schema structure [here](#schema-object)                                                           |

:::tip Available properties
All available properties are listed in the [properties](./properties/properties.md) page
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

### Full icon list

<details>
<summary><b>Full icon list (click to expand)</b></summary>

`Actions, Add, AddUser, AI, Airflow, Alert, AmazonEC2, AmazonEKS, AmazonRDS, AmazonS3, Amplication, Ansible, API, APIalt, ApiDocs, APIEndpoint, AppRunner, Apps, Aqua, Argo, ArgoRollouts, Armis, AuditLog, Aws, Azure, AzureAD, AzureDevops, AzurePipline, AzureProvider, Backstage, BadgeAlert, Bar, BitBucket, BitBucketGitops, BlankPage, Blueprint, Bolt, Book, Box, Branch, Bucket, Buddy, Bug, Bulb, Calendar, Catalog, Chat, Checklist, Checkmarx, CICD, CircleCI, Clickup, Clock, ClockLoader, ClosedFolder, Cloud, Cloudflare, CloudFormation, Cluster, Codacy, Code, CodeBlocks, Codecov, Codefresh, Columns, Commit, ConcourseCI, Confluence, Consul, Cookiecutter, Coralogix, Cost, CPlusPlus, CPU, Crossplane, CSharp, Css3, CSV, Customer, Database, Databricks, Datadog, Day2Operation, DBT, DefaultBlueprint, DefaultProperty, Delete, Dependabot, DeployedAt, Deployment, Deployments, Details, DevopsTool, DevTV, Docker, Docs, DownArrow, Download, DrawIO, Drive, DynamicFeed, Dynatrace, Ecs, Edit, ElasticSearch, Emergency, EmptyBox, Environment, Environments, ErrorLogs, EU, Euro, Event, Exporter, Falcosidekick, Figma, Finance, FireHydrant, FitView, Flag, Flagsmith, Fluentd, Fluxcd, Flyway, GCE, General, Git, GitHub, GithubActions, GithubCopilot, GithubGitops, GitIssue, GitLab, GitLabGitops, GitPullRequest, GitSubIcon, GitVersion, GKE, Go, Google, GoogleCloud, GoogleCloudPlatform, GoogleMaps, GPU, Grafana, Graphql, groundcover, GroupBy, HAProxy, HashiCorp, Health, Helm, Help, Home, HourGlass, HourGlassExpired, Html5, Hubspot, Humio, IaC, Infinity, Instance, Istio, Java, Javascript, Jenkins, JFrog, JfrogXray, Jira, Job, Js, JsonEditor, JumpCloudProvider, Jupyter, Kafka, KafkaUI, Key, Kiali, Kibana, KNative, Komodor, Kotlin, Kubecost, Kyverno, Lambda, Lastpass, Launchdarkly, Layers, Learn, LeftArrow, Linear, LineChart, Link, LinkOut, Linux, List, Lock, LogOut, Logz, LucidCharts, Mail, Manager, ManageSearch, Markdown, Matlab, Merge, Metric, Microservice, Microservices, Microsoft, MicrosoftEntraID, Migrate, Miro, Misconfiguration, Mixpanel, MongoDb, Moon, Move, Neo4j, NewPage, NewRelic, Node, NodeJS, Notion, NSQ, Ocean, OctopusDeploy, Okta, OneLogin, Opencost, OpenFolder, OpsGenie, Organization, OutSystems, Package, Pagerduty, Perl, Permissions, Php, Pie, Pipeline, Plug, PlugOff, Port, PostgreSQL, Prometheus, Properties, Pulsar, Pulumi, Python, R, Rancher, React, RedhatOpenshift, Redis, Register, Relation, Reminder, Repeat, Reset, RightArrow, Rocket, Role, Rope, Ruby, SalesForce, Scala, Score, SDK, Search, SendGrid, Sensu, Sentry, Server, Service, Servicenow, Settings, SettingsEthernet, Share, Shield, Sinch, SingleStore, Siren, Slack, Snowflake, SNS, Snyk, SonarCloud, Sonarqube, SonartypeNexusIQ, Sort, Speed, Spinnaker, Spring, SQL, Stack, Stackhawk, StackOverflow, Star, StatusPage, Stonebranch, Stoplight, Store, Stripe, Sun, Supervisor, Support, Swagger, Swift, Sync, Table, Tableau, Team, TeamCity, Template, Terraform, Thanos, Travel, Tribe, Trivy, Twilio, TwoUsers, Typescript, Unavailable, Unleash, Unlock, UpArrow, Updates, Url, USA, User, Users, Version, Vulnerability, Webhook, Widget, Windows, Wiz, Youtrack, Zendesk, Zipkin`

</details>