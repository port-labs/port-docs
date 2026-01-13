---
sidebar_position: 21
description: Labeled URL is an object type used to store URLs with custom display labels
sidebar_class_name: "custom-sidebar-item sidebar-property-object"
---

import ApiRef from "/docs/api-reference/\_learn_more_reference.mdx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Labeled URL

Labeled URL is an object type used to store URLs with custom display labels. This property allows you to associate a human-readable label with a URL, making it easier to display meaningful link text in the UI instead of showing icons only.

## Common labeled URL usage

The labeled URL property type can be used to store links with descriptive labels, for example:

- Documentation links with descriptive titles.
- External service dashboards with custom names.
- Related resources with meaningful descriptions.
- Pull request links with PR titles.
- Monitoring dashboards with environment names.

## Schema structure

A labeled URL object contains two fields:

| Field   | Type   | Required | Description                                      |
| ------- | ------ | -------- | ------------------------------------------------ |
| `url`   | string | Yes      | The URL to link to (internal or external).       |
| `displayText` | string | No | The display text to show for the link.           |

### Example value

```json showLineNumbers
{
  "url": "https://app.datadoghq.com/dashboard/abc123",
  "displayText": "Production Metrics Dashboard"
}
```

## Display behavior

Labeled URLs are rendered intelligently based on the URL type:

- **Internal links**: Displayed as navigable links within Port.
- **External links**: Displayed as buttons that open in a new tab.

## API definition

<Tabs groupId="api-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```json showLineNumbers
{
  "myLabeledUrlProp": {
    "title": "My labeled URL",
    "icon": "Link",
    "description": "My labeled URL property",
    // highlight-start
    "type": "object",
    "format": "labeled-url"
    // highlight-end
  }
}
```

</TabItem>
<TabItem value="array">

```json showLineNumbers
{
  "myLabeledUrlArray": {
    "title": "My labeled URL array",
    "icon": "Link",
    "description": "My labeled URL array",
    // highlight-start
    "type": "array",
    "items": {
      "type": "object",
      "format": "labeled-url"
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
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

```hcl showLineNumbers
resource "port_blueprint" "myBlueprint" {
  # ...blueprint properties
  # highlight-start
  properties = {
    object_props = {
      "myLabeledUrlProp" = {
        title       = "My labeled URL"
        description = "My labeled URL property"
        format      = "labeled-url"
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
      "myLabeledUrlArray" = {
        title       = "My labeled URL array"
        description = "My labeled URL array"
        object_items = {
          format = "labeled-url"
        }
      }
    }
  }
  # highlight-end
}
```

</TabItem>
</Tabs>

## Pulumi definition

<Tabs groupId="pulumi-definition" queryString defaultValue="basic" values={[
{label: "Basic", value: "basic"},
{label: "Array", value: "array"}
]}>

<TabItem value="basic">

<Tabs groupId="pulumi-definition-labeled-url-basic" queryString defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "TypeScript", value: "typescript"},
{label: "JavaScript", value: "javascript"},
{label: "GO", value: "go"}
]}>

<TabItem value="python">

```python showLineNumbers
"""A Python Pulumi program"""

import pulumi
from port_pulumi import Blueprint,BlueprintPropertiesArgs,BlueprintPropertiesObjectPropsArgs

blueprint = Blueprint(
    "myBlueprint",
    identifier="myBlueprint",
    title="My Blueprint",
    # highlight-start
    properties=BlueprintPropertiesArgs(
        object_props={
            "myLabeledUrlProp": BlueprintPropertiesStringPropsArgs(
                title="My labeled URL",
                required=False,
                format="labeled-url",
            )
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
    objectProps: {
      myLabeledUrlProp: {
        title: "My labeled URL",
        required: false,
        format: "labeled-url",
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
    objectProps: {
      myLabeledUrlProp: {
        title: "My labeled URL",
        required: false,
        format: "labeled-url",
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
	"github.com/port-labs/pulumi-port/sdk/v2/go/port"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		blueprint, err := port.NewBlueprint(ctx, "myBlueprint", &port.BlueprintArgs{
			Identifier: pulumi.Object("myBlueprint"),
			Title:      pulumi.Object("My Blueprint"),
      // highlight-start
			Properties: port.BlueprintPropertiesArgs{
				objectProps: port.BlueprintPropertieObjectPropsMap{
					"myLabeledUrlProp": port.BlueprintPropertiesObjectPropsArgs{
						Title:    pulumi.Object("My labeled URL"),
						Required: pulumi.Bool(false),
						Format:   pulumi.Object("labeled-url"),
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

<TabItem value="array">

<Tabs groupId="pulumi-definition-labeled-url-array" queryString defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "TypeScript", value: "typescript"},
{label: "JavaScript", value: "javascript"},
{label: "GO", value: "go"}
]}>

<TabItem value="python">

```python showLineNumbers
"""A Python Pulumi program"""

import pulumi
from port_pulumi import Blueprint,BlueprintPropertiesArgs,BlueprintPropertiesArrayPropsArgs

blueprint = Blueprint(
    "myBlueprint",
    identifier="myBlueprint",
    title="My Blueprint",
    # highlight-start
    properties=BlueprintPropertiesArgs(
        array_props={
            "myLabeledUrlArray": BlueprintPropertiesArrayPropsArgs(
                title="My labeled URL array",
                required=False,
                object_items={
                    "format": "labeled-url"
                }
            )
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
    arrayProps: {
      myLabeledUrlArray: {
        title: "My labeled URL array",
        required: false,
        objectItems: {
          format: "labeled-url",
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
    arrayProps: {
      myLabeledUrlArray: {
        title: "My labeled URL array",
        required: false,
        objectItems: {
          format: "labeled-url",
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
	"github.com/port-labs/pulumi-port/sdk/v2/go/port"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		blueprint, err := port.NewBlueprint(ctx, "myBlueprint", &port.BlueprintArgs{
			Identifier: pulumi.Object("myBlueprint"),
			Title:      pulumi.Object("My Blueprint"),
      // highlight-start
			Properties: port.BlueprintPropertiesArgs{
				ArrayProps: port.BlueprintPropertiesArrayPropsMap{
					"myLabeledUrlArray": port.BlueprintPropertiesArrayPropsArgs{
						Title:    pulumi.Object("My labeled URL array"),
						Required: pulumi.Bool(false),
						ObjectItems: port.BlueprintPropertiesArrayPropsObjectItemsArgs{
							Format: pulumi.Object("labeled-url"),
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

## Using labeled URLs in self-service actions

You can use labeled URL properties as user inputs in self-service actions and automations. The input form provides a JSON editor with schema validation to ensure proper structure.

### Example action input

```json showLineNumbers
{
  "documentationLink": {
    "title": "Documentation Link",
    "description": "Link to the service documentation",
    // highlight-start
    "type": "object",
    "format": "labeled-url"
    // highlight-end
  }
}
```

### Example entity data

When populating an entity with labeled URL data:

```json showLineNumbers
{
  "identifier": "my-service",
  "title": "My Service",
  "properties": {
    // highlight-start
    "documentationLink": {
      "url": "https://docs.example.com/my-service",
      "label": "Service Documentation"
    },
    "relatedLinks": [
      {
        "url": "https://github.com/org/my-service",
        "label": "GitHub Repository"
      },
      {
        "url": "https://app.datadoghq.com/dashboard/xyz",
        "label": "Monitoring Dashboard"
      }
    ]
    // highlight-end
  }
}
```

