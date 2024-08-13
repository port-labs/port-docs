---
sidebar_position: 14
description: String is a primitive data type used to save text data
sidebar_class_name: "custom-sidebar-item sidebar-property-string"
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# String

String is a primitive data type used to save text data.

## 💡 Common string usage

The string property type can be used to store any text based data, for example:

- Image tags
- Variable keys
- Commit SHA
- File names

In this [live demo](https://demo.getport.io/service_catalog) example, we can see the `Language` string property. 🎬

## API definition

<Tabs groupId="api-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array", value: "array"},
{label: "Enum Array", value: "enumArray"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myStringProp": {
    "title": "My string",
    "icon": "My icon",
    "description": "My string property",
    // highlight-start
    "type": "string",
    // highlight-end
    "default": "My default"
  }
}
```

</TabItem>
<TabItem value="enum">

```json showLineNumbers
{
  "myStringEnum": {
    "title": "My string enum",
    "icon": "My icon",
    "description": "My string enum",
    "type": "string",
    // highlight-next-line
    "enum": ["my-option-1", "my-option-2"],
    "enumColors": {
      "my-option-1": "red",
      "my-option-2": "green"
    }
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myStringArray": {
    "title": "My string array",
    "icon": "My icon",
    "description": "My string array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "string"
    }
    // highlight-end
  }
}
```

</TabItem>
<TabItem value="enumArray">

```json showLineNumbers
{
  "myStringArray": {
    "title": "My string enum array",
    "icon": "My icon",
    "description": "My string enum array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "string",
      "enum": ["my-option-1", "my-option-2"],
      "enumColors": {
        "my-option-1": "red",
        "my-option-2": "green"
      }
    }
    // highlight-end
  }
}
```

</TabItem>
</Tabs>

<ApiRef />

## Terraform definition

<Tabs groupId="tf-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties = {
    string_props = {
      "myStringProp" = {
        title      = "My string"
        required   = false
      }
    }
  }
  # highlight-end
}
```

</TabItem>

<TabItem value="enum">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties = {
    string_props = {
      "myStringProp" = {
        title      = "My string"
        required   = false
        enum       = ["my-option-1", "my-option-2"]
        enum_colors = {
          "my-option-1" = "red"
          "my-option-2" = "green"
        }
      }
    }
  }
  # highlight-end
}

```

</TabItem>

<TabItem value="array">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties = {
    array_props = {
      "myStringArray" = {
        title        = "My string array"
        string_items = {} # Pass an empty object only sets the type to string
      }
      "myStringArrayWithDefault" = {
        title = "My string array with default"
        string_items = {
          default = ["my-default-1", "my-default-2"]
        }
      }
    }
    # highlight-end
  }
}

```

</TabItem>
</Tabs>

## Pulumi definition

<Tabs groupId="pulumi-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Enum", value: "enum"},
{label: "Array - coming soon", value: "array"}
]}>

<TabItem value="basic">

<Tabs groupId="pulumi-definition-string-basic" queryString defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "TypeScript", value: "typescript"},
{label: "JavaScript", value: "javascript"},
{label: "GO", value: "go"}
]}>

<TabItem value="python">

```python showLineNumbers
"""A Python Pulumi program"""

import pulumi
from port_pulumi import Blueprint,BlueprintPropertiesArgs,BlueprintPropertiesStringPropsArgs

blueprint = Blueprint(
    "myBlueprint",
    identifier="myBlueprint",
    title="My Blueprint",
    # highlight-start
    properties=BlueprintPropertiesArgs(
        string_props={
            "myStringProp": BlueprintPropertiesStringPropsArgs(
                title="My string", required=False
            )
    ),
    # highlight-end
    relations={}
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
  // highlight-start
  properties: {
    stringProps: {
      myStringProp: {
        title: "My string",
        required: true,
      },
    },
  },
  // highlight-end
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
  // highlight-start
  properties: {
    stringProps: {
      myStringProp: {
        title: "My string",
        required: true,
      },
    },
  },
  // highlight-end
  relations: {},
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
      // highlight-start
			Properties: port.BlueprintPropertiesArgs{
				StringProps: port.BlueprintPropertiesStringPropsMap{
					"myStringProp": &port.BlueprintPropertiesStringPropsArgs{
                        Title:      pulumi.String("My String"),
                        Required:   pulumi.Bool(true),
                    },
                },
			},
      // highlight-end
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

</TabItem>

<TabItem value="enum">

<Tabs groupId="pulumi-definition-string-enum" queryString defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "TypeScript", value: "typescript"},
{label: "JavaScript", value: "javascript"},
{label: "GO", value: "go"}
]}>

<TabItem value="python">

```python showLineNumbers
"""A Python Pulumi program"""

import pulumi
from port_pulumi import Blueprint,BlueprintPropertiesArgs

blueprint = Blueprint(
    "myBlueprint",
    identifier="myBlueprint",
    title="My Blueprint",
    # highlight-start
    properties=BlueprintPropertiesArgs(
        string_props={
            "myStringProp": {
                "title": "My String",
                "required": True,
                "enum": ["my-option-1", "my-option-2"],
                "enum_colors": {
                    "my-option-1": "red",
                    "my-option-2": "green"
                }
            }
        }
    ),
    # highlight-end
    relations={}
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
  // highlight-start
  properties: {
    stringProps: {
      myStringProp: {
        title: "My String",
        required: true,
        enums: ["my-option-1", "my-option-2"],
        enumColors: {
          "my-option-1": "red",
          "my-option-2": "green",
        },
      },
    },
  },
  // highlight-end
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
  // highlight-start
  properties: {
    stringProps: {
      myStringProp: {
        title: "My String",
        required: true,
        enums: ["my-option-1", "my-option-2"],
        enumColors: {
          "my-option-1": "red",
          "my-option-2": "green",
        },
      },
    },
  },
  // highlight-end
  relations: {},
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
      // highlight-start
			Properties: port.BlueprintPropertiesArgs{
				StringProps: port.BlueprintPropertiesStringPropsMap{
					"myStringProp": port.BlueprintPropertiesStringPropsArgs{
                        Title:      pulumi.String("My String"),
                        Required:   pulumi.Bool(false),
                        Type:       pulumi.String("string"),
                        Enums: pulumi.StringArray{
                            pulumi.String("my-option-1"),
                            pulumi.String("my-option-2"),
                        },
                        EnumColors: pulumi.StringMap{
                            "my-option-1": pulumi.String("red"),
                            "my-option-2": pulumi.String("green"),
                        },
                    },
                },
			},
      // highlight-end
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

</TabItem>
</Tabs>

## Validate string

String validations support the following operators:

- `minLength` - enforce minimal string length.
- `maxLength` - enforce maximal string length.
- `pattern` - enforce Regex patterns.

<Tabs groupId="validation-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"},
{label: "Terraform", value: "tf"},
{label: "Pulumi", value: "pulumi"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myStringProp": {
    "title": "My string",
    "icon": "My icon",
    "description": "My string property",
    "type": "string",
    // highlight-start
    "minLength": 1,
    "maxLength": 32,
    "pattern": "^[a-zA-Z0-9-]*-service$"
    // highlight-end
  }
}
```

</TabItem>

<TabItem value="array">

```json showLineNumbers
{
  "myStringArray": {
    "title": "My string array",
    "icon": "My icon",
    "description": "My string array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "string",
      "minLength": 1,
      "maxLength": 32,
      "pattern": "^[a-zA-Z0-9-]*-service$"
    }
    // highlight-end
  }
}
```

</TabItem>

<TabItem value="tf">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  properties = {
    string_props = {
      "myStringProp" = {
        title      = "My string"
        required   = false
        // highlight-start
        min_length = 1
        max_length = 32
        pattern    = "^[a-zA-Z0-9-]*-service$"
        // highlight-end
      }
    }
  }
}
```

</TabItem>

<TabItem value="pulumi">

```typescript showLineNumbers
export const blueprint = new port.Blueprint("myBlueprint", {
  // ...blueprint properties
  properties: {
    stringProps: {
      myStringProp: {
        // highlight-start
        maxLength: 32,
        minLength: 1,
        pattern: "^[a-zA-Z0-9-]*-service$"
        // highlight-end
      }
    }
  }
});
```

</TabItem>

</Tabs>

## Available enum colors

Properties defined using [enum](#api-definition) can also include specific colors for the different values available in the property definition, the available enum colors are:

```text showLineNumbers
blue
turquoise
orange
purple
pink
yellow
green
red
darkGray
lightGray
bronze
```
