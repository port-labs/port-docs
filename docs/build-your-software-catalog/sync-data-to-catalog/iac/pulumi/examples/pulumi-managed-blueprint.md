---
sidebar_position: 1
title: Pulumi-Managed Blueprint
description: Comprehensive blueprint with properties, relations and mirror properties
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Pulumi-Managed Blueprint Example

This example includes a complete blueprint resource definition in Pulumi, which includes:

- [Blueprint](../../../../define-your-data-model/setup-blueprint/setup-blueprint.md?definition=pulumi#configure-blueprints-in-port) definition examples;
- All [property](../../../../define-your-data-model/setup-blueprint/properties/properties.md) type definitions;
- [Relation](../../../../define-your-data-model/relate-blueprints/relate-blueprints.md?definition=pulumi#configure-relations-in-port) definition example;
- [Mirror property](../../../../define-your-data-model/setup-blueprint/properties/mirror-property/mirror-property.md) definition example;
- [Calculation property](../../../../define-your-data-model/setup-blueprint/properties/calculation-property/calculation-property.md) definition example.

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
    properties=[
        {
            "type": "string",
            "identifier": "myStringProp",
            "title": "My string",
            "required": False,
        }
    ],
)

blueprint = port.Blueprint("myBlueprint",
                           identifier="test-docs",
                           icon="Microservice",
                           title="Test Docs",
                           properties=[
                               {
                                   "identifier": "myStringProp",
                                   "title": "My string",
                                   "required": False,
                                   "type": "string"
                               },
                               {
                                   "identifier": "myNumberProp",
                                   "title": "My number",
                                   "required": False,
                                   "type": "number"
                               },
                               {
                                   "identifier": "myBooleanProp",
                                   "title": "My boolean",
                                   "required": False,
                                   "type": "boolean"
                               },
                               {
                                   "identifier": "myObjectProp",
                                   "title": "My object",
                                   "required": False,
                                   "type": "object"
                               },
                               {
                                   "identifier": "myArrayProp",
                                   "title": "My array",
                                   "required": False,
                                   "type": "array"
                               },
                               {
                                   "identifier": "myUrlProp",
                                   "title": "My url",
                                   "required": False,
                                   "type": "string",
                                   "format": "url"
                               },
                               {
                                   "identifier": "myEmailProp",
                                   "title": "My email",
                                   "required": False,
                                   "type": "string",
                                   "format": "email"
                               },
                               {
                                   "identifier": "myUserProp",
                                   "title": "My user",
                                   "required": False,
                                   "type": "string",
                                   "format": "user"
                               },
                               {
                                   "identifier": "myTeamProp",
                                   "title": "My team",
                                   "required": False,
                                   "type": "string",
                                   "format": "team"
                               },
                               {
                                   "identifier": "myDatetimeProp",
                                   "title": "My datetime",
                                   "required": False,
                                   "type": "string",
                                   "format": "date-time"
                               },
                               {
                                   "identifier": "myTimerProp",
                                   "title": "My timer",
                                   "required": False,
                                   "type": "string",
                                   "format": "timer"
                               },
                               {
                                   "identifier": "myYAMLProp",
                                   "title": "My yaml",
                                   "required": False,
                                   "type": "string",
                                   "format": "yaml"
                               }
                           ],
                           mirror_properties=[
                               {
                                   "identifier": "myMirrorProp",
                                   "title": "My mirror property",
                                   "path": "myRelation.myStringProp"
                               },
                               {
                                   "identifier": "myMirrorPropWithMeta",
                                   "title": "My mirror property of meta property",
                                   "path": "myRelation.$identifier"
                               }
                           ],
                           calculation_properties=[
                               {
                                   "identifier": "myCalculation",
                                   "title": "My calculation property",
                                   "calculation": ".properties.myStringProp + .properties.myStringProp",
                                   "type": "string"
                               },
                               {
                                   "identifier": "myCalculationWithMeta",
                                   "title": "My calculation property with meta properties",
                                   "calculation": ".identifier + \"-\" + .title + \"-\" + .properties.myStringProp",
                                   "type": "string"
                               }
                           ],
                           relations=[
                               {
                                   "target": "test-docs-relation",
                                   "title": "myRelation",
                                   "identifier": "myRelation",
                                   "many": False,
                                   "required": False
                               }
                           ],
                           opts=ResourceOptions(depends_on=[other])
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
  properties: [
    {
      identifier: "myStringProp",
      title: "My string",
      required: false,
      type: "string",
    },
  ],
});

const myBlueprint = new port.Blueprint(
  "myBlueprint",
  {
    identifier: "test-docs",
    icon: "Microservice",
    title: "Test Docs",
    properties: [
      {
        identifier: "myStringProp",
        title: "My string",
        required: false,
        type: "string",
      },
      {
        identifier: "myNumberProp",
        title: "My number",
        required: false,
        type: "number",
      },
      {
        identifier: "myBooleanProp",
        title: "My boolean",
        required: false,
        type: "boolean",
      },
      {
        identifier: "myObjectProp",
        title: "My object",
        required: false,
        type: "object",
      },
      {
        identifier: "myArrayProp",
        title: "My array",
        required: false,
        type: "array",
      },
      {
        identifier: "myUrlProp",
        title: "My url",
        required: false,
        type: "string",
        format: "url",
      },
      {
        identifier: "myEmailProp",
        title: "My email",
        required: false,
        type: "string",
        format: "email",
      },
      {
        identifier: "myUserProp",
        title: "My user",
        required: false,
        type: "string",
        format: "user",
      },
      {
        identifier: "myTeamProp",
        title: "My team",
        required: false,
        type: "string",
        format: "team",
      },
      {
        identifier: "myDatetimeProp",
        title: "My datetime",
        required: false,
        type: "string",
        format: "date-time",
      },
      {
        identifier: "myTimerProp",
        title: "My timer",
        required: false,
        type: "string",
        format: "timer",
      },
      {
        identifier: "myYAMLProp",
        title: "My yaml",
        required: false,
        type: "string",
        format: "yaml",
      },
    ],
    mirrorProperties: [
      {
        identifier: "myMirrorProp",
        title: "My mirror property",
        path: "myRelation.myStringProp",
      },
      {
        identifier: "myMirrorPropWithMeta",
        title: "My mirror property of meta property",
        path: "myRelation.$identifier",
      },
    ],
    calculationProperties: [
      {
        identifier: "myCalculation",
        title: "My calculation property",
        calculation: ".properties.myStringProp + .properties.myStringProp",
        type: "string",
      },
      {
        identifier: "myCalculationWithMeta",
        title: "My calculation property with meta properties",
        calculation:
          '.identifier + "-" + .title + "-" + .properties.myStringProp',
        type: "string",
      },
    ],
    relations: [
      {
        identifier: "myRelation",
        title: "myRelation",
        target: "test-docs-relation",
        many: false,
        required: false,
      },
    ],
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
  properties: [
    {
      identifier: "myStringProp",
      title: "My string",
      required: false,
      type: "string",
    },
  ],
});

const myBlueprint = new port.Blueprint(
  "myBlueprint",
  {
    identifier: "test-docs",
    icon: "Microservice",
    title: "Test Docs",
    properties: [
      {
        identifier: "myStringProp",
        title: "My string",
        required: false,
        type: "string",
      },
      {
        identifier: "myNumberProp",
        title: "My number",
        required: false,
        type: "number",
      },
      {
        identifier: "myBooleanProp",
        title: "My boolean",
        required: false,
        type: "boolean",
      },
      {
        identifier: "myObjectProp",
        title: "My object",
        required: false,
        type: "object",
      },
      {
        identifier: "myArrayProp",
        title: "My array",
        required: false,
        type: "array",
      },
      {
        identifier: "myUrlProp",
        title: "My url",
        required: false,
        type: "string",
        format: "url",
      },
      {
        identifier: "myEmailProp",
        title: "My email",
        required: false,
        type: "string",
        format: "email",
      },
      {
        identifier: "myUserProp",
        title: "My user",
        required: false,
        type: "string",
        format: "user",
      },
      {
        identifier: "myTeamProp",
        title: "My team",
        required: false,
        type: "string",
        format: "team",
      },
      {
        identifier: "myDatetimeProp",
        title: "My datetime",
        required: false,
        type: "string",
        format: "date-time",
      },
      {
        identifier: "myTimerProp",
        title: "My timer",
        required: false,
        type: "string",
        format: "timer",
      },
      {
        identifier: "myYAMLProp",
        title: "My yaml",
        required: false,
        type: "string",
        format: "yaml",
      },
    ],
    mirrorProperties: [
      {
        identifier: "myMirrorProp",
        title: "My mirror property",
        path: "myRelation.myStringProp",
      },
      {
        identifier: "myMirrorPropWithMeta",
        title: "My mirror property of meta property",
        path: "myRelation.$identifier",
      },
    ],
    calculationProperties: [
      {
        identifier: "myCalculation",
        title: "My calculation property",
        calculation: ".properties.myStringProp + .properties.myStringProp",
        type: "string",
      },
      {
        identifier: "myCalculationWithMeta",
        title: "My calculation property with meta properties",
        calculation:
          '.identifier + "-" + .title + "-" + .properties.myStringProp',
        type: "string",
      },
    ],
    relations: [
      {
        identifier: "myRelation",
        title: "myRelation",
        target: "test-docs-relation",
        many: false,
        required: false,
      },
    ],
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
			Properties: port.BlueprintPropertyArray{
				&port.BlueprintPropertyArgs{
					Identifier: pulumi.String("myStringProp"),
					Title:      pulumi.String("My string"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("string"),
				},
			},
		})

		myBlueprint, err := port.NewBlueprint(ctx, "myBlueprint", &port.BlueprintArgs{
			Identifier: pulumi.String("test-docs"),
			Icon:       pulumi.String("Microservice"),
			Title:      pulumi.String("Test Docs"),
			Properties: port.BlueprintPropertyArray{
				&port.BlueprintPropertyArgs{
					Identifier: pulumi.String("myStringProp"),
					Title:      pulumi.String("My string"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("string"),
				},
				&port.BlueprintPropertyArgs{
					Identifier: pulumi.String("myNumberProp"),
					Title:      pulumi.String("My number"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("number"),
				},
				&port.BlueprintPropertyArgs{
					Identifier: pulumi.String("myBooleanProp"),
					Title:      pulumi.String("My boolean"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("boolean"),
				},
				&port.BlueprintPropertyArgs{
					Identifier: pulumi.String("myObjectProp"),
					Title:      pulumi.String("My object"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("object"),
				},
				&port.BlueprintPropertyArgs{
					Identifier: pulumi.String("myArrayProp"),
					Title:      pulumi.String("My array"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("array"),
				},
				&port.BlueprintPropertyArgs{
					Identifier: pulumi.String("myUrlProp"),
					Title:      pulumi.String("My url"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("string"),
					Format:     pulumi.String("url"),
				},
				&port.BlueprintPropertyArgs{
					Identifier: pulumi.String("myEmailProp"),
					Title:      pulumi.String("My email"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("string"),
					Format:     pulumi.String("email"),
				},
				&port.BlueprintPropertyArgs{
					Identifier: pulumi.String("myUserProp"),
					Title:      pulumi.String("My user"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("string"),
					Format:     pulumi.String("user"),
				},
				&port.BlueprintPropertyArgs{
					Identifier: pulumi.String("myTeamProp"),
					Title:      pulumi.String("My team"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("string"),
					Format:     pulumi.String("team"),
				},
				&port.BlueprintPropertyArgs{
					Identifier: pulumi.String("myDatetimeProp"),
					Title:      pulumi.String("My datetime"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("string"),
					Format:     pulumi.String("date-time"),
				},
				&port.BlueprintPropertyArgs{
					Identifier: pulumi.String("myTimerProp"),
					Title:      pulumi.String("My timer"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("string"),
					Format:     pulumi.String("timer"),
				},
				&port.BlueprintPropertyArgs{
					Identifier: pulumi.String("myYAMLProp"),
					Title:      pulumi.String("My yaml"),
					Required:   pulumi.Bool(false),
					Type:       pulumi.String("string"),
					Format:     pulumi.String("yaml"),
				},
			},
			MirrorProperties: port.BlueprintMirrorPropertyArray{
				&port.BlueprintMirrorPropertyArgs{
					Identifier: pulumi.String("myMirrorProp"),
					Title:      pulumi.String("My mirror property"),
					Path:       pulumi.String("myRelation.myStringProp"),
				},
				&port.BlueprintMirrorPropertyArgs{
					Identifier: pulumi.String("myMirrorPropWithMeta"),
					Title:      pulumi.String("My mirror property of meta property"),
					Path:       pulumi.String("myRelation.$identifier"),
				},
			},
			CalculationProperties: port.BlueprintCalculationPropertyArray{
				&port.BlueprintCalculationPropertyArgs{
					Identifier:  pulumi.String("myCalculation"),
					Title:       pulumi.String("My calculation property"),
					Calculation: pulumi.String(".properties.myStringProp + .properties.myStringProp"),
					Type:        pulumi.String("string"),
				},
				&port.BlueprintCalculationPropertyArgs{
					Identifier:  pulumi.String("myCalculationWithMeta"),
					Title:       pulumi.String("My calculation property with meta properties"),
					Calculation: pulumi.String(".identifier + \"-\" + .title + \"-\" + .properties.myStringProp"),
					Type:        pulumi.String("string"),
				},
			},
			Relations: port.BlueprintRelationArray{
				&port.BlueprintRelationArgs{
					Identifier: pulumi.String("myRelation"),
					Title:      pulumi.String("myRelation"),
					Target:     pulumi.String("test-docs-relation"),
					Many:       pulumi.Bool(false),
					Required:   pulumi.Bool(false),
				},
			},
		}, pulumi.DependsOn([]pulumi.Resource{other}))

		ctx.Export("blueprint", myBlueprint.Title)
		ctx.Export("other", other.Title)
		if err != nil {
			return err
		}
		return nil
	})
}
```

</TabItem>

</Tabs>
```
