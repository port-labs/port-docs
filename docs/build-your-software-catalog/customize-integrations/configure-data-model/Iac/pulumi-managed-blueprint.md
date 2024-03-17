---
sidebar_position: 1
title: Pulumi
description: Comprehensive blueprint with properties, relations and mirror properties
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Pulumi-Managed Blueprint Example

This example includes a complete [blueprint](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/setup-blueprint.md) resource definition in Pulumi, which includes:

- [Blueprint](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/setup-blueprint.md?definition=pulumi#configure-blueprints-in-port) definition examples;
- All [property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/properties.md) type definitions;
- [Relation](/build-your-software-catalog/customize-integrations/configure-data-model/relate-blueprints/relate-blueprints.md?definition=pulumi#configure-relations-in-port) definition example;
- [Mirror property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/mirror-property) definition example;
- [Calculation property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/calculation-property/calculation-property.md) definition example.

Here is the example definition in all the supported languages:

<Tabs groupId="pulumi-definition" queryString defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "TypeScript", value: "typescript"},
{label: "JavaScript", value: "javascript"},
{label: "GO", value: "go"}
]}>

<TabItem value="python">

```python showLineNumbers
from pulumi import ResourceOptions
import port_pulumi as port

other = port.Blueprint(
    "other",
    identifier="test-docs-relation",
    icon="Microservice",
    title="Test Docs Relation",
    properties=port.BlueprintPropertiesArgs(
        string_props={
            "myStringProp": port.BlueprintPropertiesStringPropsArgs(
                title="My string", required=False
            )
        }
    ),
)

blueprint = port.Blueprint(
    "myBlueprint",
    identifier="test-docs",
    icon="Microservice",
    title="Test Docs",
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
        },
        number_props={
            "myNumberProp": port.BlueprintPropertiesNumberPropsArgs(
                title="My number", required=False,
            )
        },
        boolean_props={
            "myBooleanProp": port.BlueprintPropertiesBooleanPropsArgs(
                title="My boolean", required=False
            )
        },
        object_props={
            "myObjectProp": port.BlueprintPropertiesObjectPropsArgs(
                title="My object", required=False
            )
        },
        array_props={
            "myArrayProp": port.BlueprintPropertiesArrayPropsArgs(
                title="My array", required=False
            )
        }
    ),
    mirror_properties={
        "myMirrorProp": port.BlueprintMirrorPropertiesArgs(
            title="My mirror property", path="myRelation.myStringProp"
        ),
        "myMirrorPropWithMeta": port.BlueprintMirrorPropertiesArgs(
            title="My mirror property of meta property", path="myRelation.$identifier"
        ),
    },
    calculation_properties={
        "myCalculation": port.BlueprintCalculationPropertiesArgs(
            title="My calculation property", calculation=".properties.myStringProp + .properties.myStringProp", type="string",
        ),
        "myCalculationWithMeta": port.BlueprintCalculationPropertiesArgs(
            title="My calculation property with meta properties", calculation='.identifier + "-" + .title + "-" + .properties.myStringProp', type="string",
        ),
    },
    relations={
        "myRelation": port.BlueprintRelationsArgs(
            title="My relation", target="test-docs-relation", many=False, required=False,
        ),
    },
    opts=ResourceOptions(depends_on=[other]),
)
```

</TabItem>

<TabItem value="typescript">

```typescript showLineNumbers
import * as pulumi from "@pulumi/pulumi";
import * as port from "@port-labs/port";

const other = new port.Blueprint("other", {
  identifier: "test-docs-relation",
  icon: "Microservice",
  title: "Test Docs Relation",
  properties: {
    stringProps: {
      myStringProp: {
        title: "My string",
        required: false,
      },
    },
  },
});

const myBlueprint = new port.Blueprint(
  "myBlueprint",
  {
    identifier: "test-docs",
    icon: "Microservice",
    title: "Test Docs",
    properties: {
      stringProps: {
        myStringProp: {
          title: "My string",
          required: false,
        },
        myUrlProp: {
          title: "My url",
          required: false,
          format: "url",
        },
        myEmailProp: {
          title: "My email",
          required: false,
          format: "email",
        },
        myUserProp: {
          title: "My user",
          required: false,
          format: "user",
        },
        myTeamProp: {
          title: "My team",
          required: false,
          format: "team",
        },
        myDatetimeProp: {
          title: "My datetime",
          required: false,
          format: "date-time",
        },
        myTimerProp: {
          title: "My timer",
          required: false,
          format: "timer",
        },
        myYAMLProp: {
          title: "My yaml",
          required: false,
          format: "yaml",
        },
      },
      numberProps: {
        myNumberProp: {
          title: "My number",
          required: false,
        },
      },
      booleanProps: {
        myBooleanProp: {
          title: "My boolean",
          required: false,
        },
      },
      objectProps: {
        myObjectProp: {
          title: "My object",
          required: false,
        },
      },
      arrayProps: {
        myArrayProp: {
          title: "My array",
          required: false,
        },
      },
    },
    mirrorProperties: {
      myMirrorProp: {
        title: "My mirror property",
        path: "myRelation.myStringProp",
      },
      myMirrorPropWithMeta: {
        title: "My mirror property of meta property",
        path: "myRelation.$identifier",
      },
    },
    calculationProperties: {
      myCalculation: {
        title: "My calculation property",
        calculation: ".properties.myStringProp + .properties.myStringProp",
        type: "string",
      },
      myCalculationWithMeta: {
        title: "My calculation property with meta properties",
        calculation:
          '.identifier + "-" + .title + "-" + .properties.myStringProp',
        type: "string",
      },
    },
    relations: {
      myRelation: {
        title: "My relation",
        target: "test-docs-relation",
        many: false,
        required: false,
      },
    },
  },
  { dependsOn: [other] }
);
```

</TabItem>

<TabItem value="javascript">

```javascript showLineNumbers
"use strict";
const pulumi = require("@pulumi/pulumi");
const port = require("@port-labs/port");

const other = new port.Blueprint("other", {
  identifier: "test-docs-relation",
  icon: "Microservice",
  title: "Test Docs Relation",
  properties: {
    stringProps: {
      myStringProp: {
        title: "My string",
        required: false,
      },
    },
  },
});

const myBlueprint = new port.Blueprint(
  "myBlueprint",
  {
    identifier: "test-docs",
    icon: "Microservice",
    title: "Test Docs",
    properties: {
      stringProps: {
        myStringProp: {
          title: "My string",
          required: false,
        },
        myUrlProp: {
          title: "My url",
          required: false,
          format: "url",
        },
        myEmailProp: {
          title: "My email",
          required: false,
          format: "email",
        },
        myUserProp: {
          title: "My user",
          required: false,
          format: "user",
        },
        myTeamProp: {
          title: "My team",
          required: false,
          format: "team",
        },
        myDatetimeProp: {
          title: "My datetime",
          required: false,
          format: "date-time",
        },
        myTimerProp: {
          title: "My timer",
          required: false,
          format: "timer",
        },
        myYAMLProp: {
          title: "My yaml",
          required: false,
          format: "yaml",
        },
      },
      numberProps: {
        myNumberProp: {
          title: "My number",
          required: false,
        },
      },
      booleanProps: {
        myBooleanProp: {
          title: "My boolean",
          required: false,
        },
      },
      objectProps: {
        myObjectProp: {
          title: "My object",
          required: false,
        },
      },
      arrayProps: {
        myArrayProp: {
          title: "My array",
          required: false,
        },
      },
    },
    mirrorProperties: {
      myMirrorProp: {
        title: "My mirror property",
        path: "myRelation.myStringProp",
      },
      myMirrorPropWithMeta: {
        title: "My mirror property of meta property",
        path: "myRelation.$identifier",
      },
    },
    calculationProperties: {
      myCalculation: {
        title: "My calculation property",
        calculation: ".properties.myStringProp + .properties.myStringProp",
        type: "string",
      },
      myCalculationWithMeta: {
        title: "My calculation property with meta properties",
        calculation:
          '.identifier + "-" + .title + "-" + .properties.myStringProp',
        type: "string",
      },
    },
    relations: {
      myRelation: {
        title: "My relation",
        target: "test-docs-relation",
        many: false,
        required: false,
      },
    },
  },
  { dependsOn: [other] }
);
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

		other, err := port.NewBlueprint(ctx, "other", &port.BlueprintArgs{
			Identifier: pulumi.String("test-docs-relation"),
			Icon:       pulumi.String("Microservice"),
			Title:      pulumi.String("Test Docs Relation"),
			Properties: port.BlueprintPropertiesArgs{
				StringProps: port.BlueprintPropertiesStringPropsMap{
					"myStringProp": port.BlueprintPropertiesStringPropsArgs{
						Title:    pulumi.String("My string"),
						Required: pulumi.Bool(false),
					},
				},
			},
		})
		if err != nil {
			return err
		}

		myBlueprint, err := port.NewBlueprint(ctx, "myBlueprint", &port.BlueprintArgs{
			Identifier: pulumi.String("test-docs"),
			Icon:       pulumi.String("Microservice"),
			Title:      pulumi.String("Test Docs"),
			Properties: port.BlueprintPropertiesArgs{
				StringProps: port.BlueprintPropertiesStringPropsMap{
					"myStringProp": port.BlueprintPropertiesStringPropsArgs{
						Title:    pulumi.String("My string"),
						Required: pulumi.Bool(false),
					},
					"myUrlProp": port.BlueprintPropertiesStringPropsArgs{
						Title:    pulumi.String("My url"),
						Required: pulumi.Bool(false),
						Format:   pulumi.String("url"),
					},
					"myEmailProp": port.BlueprintPropertiesStringPropsArgs{
						Title:    pulumi.String("My email"),
						Required: pulumi.Bool(false),
						Format:   pulumi.String("email"),
					},
					"myUserProp": port.BlueprintPropertiesStringPropsArgs{
						Title:    pulumi.String("My user"),
						Required: pulumi.Bool(false),
						Format:   pulumi.String("user"),
					},
					"myTeamProp": port.BlueprintPropertiesStringPropsArgs{
						Title:    pulumi.String("My team"),
						Required: pulumi.Bool(false),
						Format:   pulumi.String("team"),
					},
					"myDatetimeProp": port.BlueprintPropertiesStringPropsArgs{
						Title:    pulumi.String("My datetime"),
						Required: pulumi.Bool(false),
						Format:   pulumi.String("date-time"),
					},
					"myTimerProp": port.BlueprintPropertiesStringPropsArgs{
						Title:    pulumi.String("My timer"),
						Required: pulumi.Bool(false),
						Format:   pulumi.String("timer"),
					},
					"myYAMLProp": port.BlueprintPropertiesStringPropsArgs{
						Title:    pulumi.String("My yaml"),
						Required: pulumi.Bool(false),
						Format:   pulumi.String("yaml"),
					},
				},
				NumberProps: port.BlueprintPropertiesNumberPropsMap{
					"myNumberProp": port.BlueprintPropertiesNumberPropsArgs{
						Title:    pulumi.String("My number"),
						Required: pulumi.Bool(false),
					},
				},
				BooleanProps: port.BlueprintPropertiesBooleanPropsMap{
					"myBooleanProp": port.BlueprintPropertiesBooleanPropsArgs{
						Title:    pulumi.String("My boolean"),
						Required: pulumi.Bool(false),
					},
				},
				ObjectProps: port.BlueprintPropertiesObjectPropsMap{
					"myObjectProp": port.BlueprintPropertiesObjectPropsArgs{
						Title:    pulumi.String("My object"),
						Required: pulumi.Bool(false),
					},
				},
				ArrayProps: port.BlueprintPropertiesArrayPropsMap{
					"myArrayProp": port.BlueprintPropertiesArrayPropsArgs{
						Title:    pulumi.String("My array"),
						Required: pulumi.Bool(false),
					},
				},
			},
			MirrorProperties: port.BlueprintMirrorPropertiesMap{
				"myMirrorProp": port.BlueprintMirrorPropertiesArgs{
					Title: pulumi.String("My mirror property"),
					Path:  pulumi.String("myRelation.myStringProp"),
				},
				"myMirrorPropWithMeta": port.BlueprintMirrorPropertiesArgs{
					Title: pulumi.String("My mirror property of meta property"),
					Path:  pulumi.String("myRelation.$identifier"),
				},
			},
			CalculationProperties: port.BlueprintCalculationPropertiesMap{
				"myCalculation": port.BlueprintCalculationPropertiesArgs{
					Title:       pulumi.String("My calculation property"),
					Calculation: pulumi.String(".properties.myStringProp + .properties.myStringProp"),
					Type:        pulumi.String("string"),
				},
				"myCalculationWithMeta": port.BlueprintCalculationPropertiesArgs{
					Title:       pulumi.String("My calculation property with meta properties"),
					Calculation: pulumi.String(".identifier + \"-\" + .title + \"-\" + .properties.myStringProp"),
					Type:        pulumi.String("string"),
				},
			},
			Relations: port.BlueprintRelationsMap{
				"myRelation": &port.BlueprintRelationsArgs{
					Title:    pulumi.String("My relation"),
					Target:   pulumi.String("test-docs-relation"),
					Many:     pulumi.Bool(false),
					Required: pulumi.Bool(false),
				},
			},
		}, pulumi.DependsOn([]pulumi.Resource{other}))

		if err != nil {
			return err
		}
		return nil
	})
}
```

</TabItem>

</Tabs>
