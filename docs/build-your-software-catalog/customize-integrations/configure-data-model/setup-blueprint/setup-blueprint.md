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

1. Go to your [Builder page](https://app.getport.io/settings).
2. Expand your desired blueprint by double-clicking on it.
3. Here you can add, remove, or edit this blueprint's [properties](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/) and [relations](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/).
4. To edit the blueprint's metadata (title, icon, etc.), click on the `...` icon in the top right corner of the blueprint card, and choose `Edit blueprint`.


<h4>To create a new blueprint:</h4>

1. Go to your [Builder page](https://app.getport.io/settings).
2. Click on `+ Blueprint`:

<img src='/img/software-catalog/customize-integrations/newBlueprintButton.png' width='40%' border='1px' />

<br/><br/>

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

`AWS,
Airflow,
AmazonEKS,
AmazonRDS,
Ansible,
ApiDoc,
AppRunner,
Aqua,
Argo,
ArgoRollouts,
Armis,
Azure,
AzureAD,
AzureDevops,
AzurePipline,
AzureProvider,
BitBucket,
BitBucketGitops,
BlankPage,
Buddy,
CICD,
CPlusPlus,
CSharp,
CircleCI,
Clickup,
CloudFormation,
Cluster,
Codacy,
Codecov,
Codefresh,
Confluence,
Cookiecutter,
Coralogix,
Crossplane,
Datadog,
Day2Operation,
Dependabot,
Docker,
DrawIO,
Dynatrace,
EC2,
EU,
Ecs,
ElasticSearch,
Environments,
Falcosidekick,
Figma,
FireHydrant,
Flagsmith,
Fluentd,
Fluxcd,
GCE,
GKE,
Git,
GitIssue,
GitLab,
GitLabGitops,
GitPullRequest,
GitSubIcon,
GitVersion,
Github,
GithubActions,
GithubGitops,
Go,
Google,
GoogleCloud,
GoogleCloudPlatform,
GoogleMaps,
Grafana,
Graphql,
HashiCorp,
Helm,
Istio,
JFrog,
Javascript,
Jenkins,
JfrogXray,
Jira,
JumpCloudProvider,
Jupyter,
KNative,
Kafka,
KafkaUI,
Kiali,
Komodor,
Kotlin,
Kubecost,
Kyverno,
Lambda,
Lastpass,
Launchdarkly,
Linear,
Logz,
LucidCharts,
Matlab,
Microservices,
MicrosoftEntraID,
Miro,
Mixpanel,
MongoDb,
Neo4j,
NewRelic,
NodeJS,
Notion,
Ocean,
Okta,
OneLogin,
Opencost,
OpsGenie,
Perl,
Port,
PostgreSQL,
Prometheus,
Pulumi,
Python,
      :,
Rancher,
React,
RedhatOpenshift,
Redis,
Ruby,
S3,
SDK,
SNS,
SQL,
SalesForce,
Scala,
SendGrid,
Sensu,
Sentry,
Servicenow,
Sinch,
SingleStore,
Slack,
Snyk,
StackOverflow,
Stackhawk,
StatusPage,
Stripe,
Swagger,
Swift,
Tableau,
TeamCity,
Terraform,
Thanos,
Trivy,
Twilio,
TwoUsers,
Typescript,
USA,
Unleash,
Webhook,
Wiz,
Youtrack,
Zipkin,
checkmarx,
css3,
html5,
java,
js,
kibana,
pagerduty,
php,
sonarqube,
spinnaker,
APIEndpoint,
Actions,
Add,
AddUser,
Alert,
Apps,
AuditLog,
Bar,
Blueprint,
Bolt,
Book,
Box,
Branch,
Bucket,
Bulb,
CPU,
CSV,
Calendar,
Catalog,
Chat,
Clock,
ClosedFolder,
Cloud,
Code,
Columns,
Commit,
Cost,
Database,
DefaultBlueprint,
DefaultProperty,
Delete,
DeployedAt,
Details,
DevopsTool,
Docs,
DownArrow,
Download,
Drive,
Edit,
EmptyBox,
Environment,
Euro,
Exporter,
FitView,
Flag,
GPU,
General,
GroupBy,
Health,
Help,
Home,
HourGlass,
HourGlassExpired,
IaC,
Infinity,
Instance,
Job,
JsonEditor,
Key,
Learn,
LeftArrow,
LineChart,
Link,
LinkOut,
Lock,
LogOut,
Mail,
Manager,
Markdown,
Metric,
Microservice,
Migrate,
Misconfiguration,
Moon,
Move,
NewPage,
Node,
OpenFolder,
Organization,
Package,
Permissions,
Pie,
Pipeline,
Plug,
PlugOff,
Properties,
Register,
Relation,
Reminder,
Repeat,
Reset,
RestAPI,
RightArrow,
Rocket,
Rope,
Score,
Search,
Server,
Service,
Settings,
Share,
Shield,
Siren,
Sort,
Speed,
Star,
Store,
Support,
Sync,
Table,
Team,
Template,
Travel,
Unavailable,
Unlock,
UpArrow,
Updates,
Url,
User,
Users,
Version,
Vulnerability`

</details>