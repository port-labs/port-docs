import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Advanced input configurations

Advanced input settings allow you to create more customizable experiences for users who perform self-service actions. This is done by creating adaptive inputs that change according to data about the entity, the user, and other inputs.

## Common use-cases

- Filter the available options in a dropdown input.
- Create a dependency between inputs to allow the user to select a value based on the value of another input.
- Define dynamic default values based on the logged-in user properties(such as teams, email, role) or the entity that the action is being executed on (for day-2 or delete actions only).

:::info Pulumi Examples' Language
Unless otherwise specified, all **Pulumi** configuration examples are provided in Python. For usage in other languages, please see the Pulumi provider documentation [here](https://www.pulumi.com/registry/packages/port/api-docs/action/).
:::

## Usage

Defining advanced inputs is currently supported in JSON-mode only.

When creating an action, the second step is defining its inputs. After defining at least one input, an `Advanced configuration` section will appear in the bottom of the form. Click on `Edit JSON`, then add your configuration in JSON format.

<img src='/img/self-service-actions/advancedInputsFormExample.png' width='60%' />

### Writing your configuration schema

Port provides a `jqQuery` property that can be used to extract data from the entity, the logged-in user, or the current action's form inputs. It can also be used to perform data manipulations.  

For example, the following `jqQuery` checks the value of another property (`language`) and determines the possible values of the `SDK` property accordingly:

```json showLineNumbers
{
  "properties": {
    "language": {
      "type": "string",
      "enum": ["javascript", "python"]
    },
    "SDK": {
      "type": "string",
      "enum": {
        "jqQuery": "if .form.language == \"javascript\" then [\"Node 16\", \"Node 18\"] else [\"Python 3.8\"] end"
      }
    }
  }
}
```

#### The properties you can access using the "jqQuery" object

<Tabs
groupId="jqquery-properties"
queryString
defaultValue="form"
values={[
{label: 'form', value: 'form'},
{label: 'entity', value: 'entity'},
{label: 'user', value: 'user'},
]}>

<TabItem value="form">

The values of the inputs in the current action form.

Usage:

```json
{
  "jqQuery": ".form.input1"
}
```

The available `form` object(each input is a key in the action's [`userInputs`](/actions-and-automations/create-self-service-experiences/setup-ui-for-action/user-inputs/) object):

```json
{
  "input1": "...",
  "input2": "...",
  "input3": "..."
}
```

</TabItem>
<TabItem value="entity">

The properties of the `entity` on which the action is performed. Entity data is only available in "day-2" and "delete" actions.

Usage:

```json
{
  "jqQuery": ".entity.properties.property1"
}
```

The available `entity` object:

```json
{
  "identifier": "...",
  "title": "...",
  "blueprint": "...",
  "team": ["..."],
  "properties": {
    "property1": "...",
    "property2": "...",
    "property3": "..."
  },
  "relations": {
    "relation1": "...",
    "relation2": "...",
    "relationMany": ["...", "..."]
  },
  "createdAt": "...",
  "createdBy": "...",
  "updatedAt": "...",
  "updatedBy": "...",
  "scorecards": {
    "ResourceQuota": {
      "rules": [
        {
          "identifier": "...",
          "status": "...",
          "level": "..."
        },
        {
          "identifier": "...",
          "status": "...",
          "level": "..."
        }
      ],
      "level": "..."
    },
    "Ownership": {
      "rules": [
        {
          "identifier": "...",
          "status": "...",
          "level": "..."
        },
        {
          "identifier": "...",
          "status": "...",
          "level": "..."
        }
      ],
      "level": "..."
    }
  }
}
```

</TabItem>
<TabItem value="user">

The properties of the user that executed the action.

Usage:

```json
{
  "jqQuery": ".user.email"
}
```

The available logged-in user object:

```json
{
  "picture": "...",
  "userId": "...",
  "email": "...",
  "name": "...",
  "mainRole": "...",
  "roles": [
    {
      "name": "..."
    }
  ],
  "teams": [
    {
      "name": "...",
      "provider": "..."
    },
    {
      "name": "...",
      "provider": "..."
    }
  ]
}
```

</TabItem>
</Tabs>

Keys that are supported with jqQuery expressions:

| Key      | Description                                       |
| -------- | ------------------------------------------------- |
| enum     | any enum of a property                            |
| default  | the default value of any property                 |
| required | the properties which will be required in the form |
| value    | the value inside a "dataset" rule                 |
| visible  | the condition to display any property in the form |

---

#### Additional available properties

You can use these additional properties to create more complex inputs:

<Tabs
defaultValue="visible"
groupId="additional-inputs"
queryString
values={[
{ label: 'visible', value: 'visible', },
{ label: 'dependsOn', value: 'dependsOn', },
{ label: 'dataset', value: 'dataset', },
]}>

<TabItem value="visible">

The `visible` property is used to dynamically hide/show inputs in the form.
The `visible` value could be set to either a boolean (`true` value is always shown, `false` value is always hidden), or to a `jqQuery` which evaluates to a boolean.

In this example, the `runArguments` properties are configured with `visible` so that they only show up in the form when the matching value is selected in the `language` input:

<Tabs
defaultValue="api"
values={[
{label: 'API', value: 'api'},
{label: 'Terraform', value: 'terraform'},
{label: 'Pulumi', value: 'pulumi'}
]}>

<TabItem value="api">

```json showLineNumbers
{
  "properties": {
    "language": {
      "type": "string",
      "enum": ["javascript", "python"]
    },
    "pythonRunArguments": {
      "type": "string",
      "visible": {
        "jqQuery": ".form.language == \"python\""
      }
    },
    "nodeRunArguments": {
      "type": "string",
      "visible": {
        "jqQuery": ".form.language == \"javascript\""
      }
    }
  }
}
```

</TabItem>
<TabItem value="terraform">

```hcl showLineNumbers
resource "port_action" myAction {
  # ...action configuration
  {
    user_properties = {
      string_props = {
        language = {
          enum = ["javascript", "python"]
        }
        pythonRunArguments = {
          visible_jq_query = ".form.language == \"python\""
        }
        nodeRunArguments = {
          visible_jq_query = ".form.language == \"javascript\""
        }
      }
    }
  }
}
```

</TabItem>
<TabItem value="pulumi">

```python showLineNumbers title="pulumi.py"
action = Action(
  # ...action properties
  user_properties={
    "string_props": {
      "language": {
        "enums": ["python", "javascript"],
      },
      "pythonRunArguments": {"visible_jq_query": '.form.language == "python"'},
      "nodeRunArguments": {"visible_jq_query": '.form.language == "javascript"'},
    },
  }
)

```

</TabItem>

</Tabs>

</TabItem>

<TabItem value="dependsOn">

The `dependsOn` property is used to create a dependency between inputs. If input X depends on input Y, input X will be **disabled** until input Y is filled.  
In the example below, the `SDK` input depends on the `Language` input:

<Tabs
defaultValue="api"
values={[
{label: 'API', value: 'api'},
{label: 'Terraform', value: 'terraform'},
{label: 'Pulumi', value: 'pulumi'}
]}>

<TabItem value="api">

```json showLineNumbers
{
  "properties": {
    "language": {
      "type": "string",
      "enum": ["javascript", "python"]
    },
    "SDK": {
      "type": "string",
      "dependsOn": ["language"]
    }
  }
}
```

</TabItem>
<TabItem value="terraform">

```hcl showLineNumbers
resource "port_action" myAction {
  # ...action configuration
  {
    user_properties = {
      string_props = {
        language = {
          enum = ["javascript", "python"]
        }
        SDK = {
          depends_on: ["language"]
        }
      }
    }
  }
}
```
</TabItem>
<TabItem value="pulumi">

```python showLineNumbers title="pulumi.py"
action = Action(
  # ...action properties
  user_properties={
    "string_props": {
      "language": {
        "enums": ["python", "javascript"],
      },
      "SDK": {
        "depends_ons": ["language"]
      },
    },
  }
)

```
</TabItem>
</Tabs>

</TabItem>
<TabItem value="dataset">

The `dataset` property is used to filter the displayed options in an [entity](/actions-and-automations/create-self-service-experiences/setup-ui-for-action/user-inputs/entity) input. It is comprised of two properties:

- `Combinator` - the logical operation to apply between the rules of the dataset. [Read more](/search-and-query/#combinator).
- `Rules` - an array of [rules](/search-and-query/#rules), only entities that pass them will be displayed in the form.
  Note that the `value` key in the dataset can be a constant (string, number, etc) or a "jqQuery" object.

<Tabs
defaultValue="api"
values={[
{label: 'API', value: 'api'},
{label: 'Terraform', value: 'terraform'},
{label: 'Pulumi', value: 'pulumi'}

]}>

<TabItem value="api">

```json showLineNumbers
{
  "namespace": {
    "type": "string",
    "format": "entity",
    "blueprint": "namespace",
    "dataset": {
      "combinator": "and",
      "rules": [
        {
          "property": "$team",
          "operator": "containsAny",
          "value": "value here. this can also be a 'jqQuery' object"
        }
      ]
    }
  }
}
```

</TabItem>
<TabItem value="terraform">

```hcl showLineNumbers
resource "port_action" "myAction" {
  # ...action properties
  user_properties = {
    string_props = {
      "namespace" = {
        format      = "entity"
        blueprint   = "namespace"
        dataset = {
          combinator = "and"
          rules = [
            {
              property = "$team"
              operator = "containsAny"
              value = "value here. this can also be a 'jqQuery' object"
            }
          ]
        }
      }
    }
  }
}
```
</TabItem>
<TabItem value="pulumi">

```python showLineNumbers title="pulumi.py"
action = Action(
  # ...action properties
  user_properties={
    "string_props": {
      "namespace": {
        "format": "entity",
        "blueprint": "namespace",
        "dataset": {
          "combinator": "and",
          "rules": [
            {
              "property": "$team",
              "operator": "containsAny",
              "value": "value here. this can also be a 'jqQuery' object"
            }
          ]
        }
      }
    }
  }
)

```
</TabItem>

</Tabs>

</TabItem>

</Tabs>

---

## Schema examples

### Creating a dependency between two form inputs

This example contains a dependency between the `language` input and the `SDK` input. The `SDK` input's available options are defined according to the selected language (see the `jqQuery` key).

<Tabs
defaultValue="api"
values={[
{label: 'API', value: 'api'},
{label: 'Terraform', value: 'terraform'},
{label: 'Pulumi', value: 'pulumi'},
]}>

<TabItem value="api">

```json showLineNumbers
{
  "properties": {
    "language": {
      "type": "string",
      "enum": ["javascript", "python"]
    },
    "SDK": {
      "type": "string",
      "enum": {
        "jqQuery": "if .form.language == \"javascript\" then [\"Node 16\", \"Node 18\"] else [\"Python 3.8\"] end"
      },
      "dependsOn": ["language"]
    }
  }
}
```

</TabItem>

<TabItem value="terraform">

```hcl showLineNumbers
resource "port_action" myAction {
  # ...action configuration
  {
    user_properties = {
      string_props = {
        language = {
          enum = ["javascript", "python"]
        }
        SDK = {
          enum_jq_query = "if .form.language == \"javascript\" then [\"Node 16\", \"Node 18\"] else [\"Python 3.8\"] end"
          depends_on: ["language"]
        }
      }
    }
  }
}
```

</TabItem>
<TabItem value="pulumi">

```python showLineNumbers title="pulumi.py"
action = Action(
  # ...action properties
  user_properties={
    "string_props": {
      "language": {
        "enums": ["python", "javascript"],
      },
      "SDK": {
        "enum_jq_query": "if .form.language == \"javascript\" then [\"Node 16\", \"Node 18\"] else [\"Python 3.8\"] end"
        "depends_ons": ["language"]
      },
    },
  }
)

```
</TabItem>
</Tabs>

![Cluster And Namespace Action](/img/software-catalog/blueprint/javascriptSDK.png)

### Hiding property based on the executing user's roles

In this example, the `visible` checks if the executing user has the `"admin"` role, and if they don't have this role then the advanced option will be hidden for them. The default value will still be filled in and sent to the backend:

<Tabs
defaultValue="api"
values={[
{label: 'API', value: 'api'},
{label: 'Terraform', value: 'terraform'},
{label: 'Pulumi', value: 'pulumi'},
]}>

<TabItem value="api">

```json showLineNumbers
{
  "properties": {
    "simpleOption": {
      "type": "string",
      "enum": ["option1", "option2"]
    },
    "advancedOption": {
      "type": "string",
      "default": "default advanced value",
      "visible": {
        "jqQuery": ".user.roles | any(.name == \"Admin\")"
      }
    }
  }
}
```

</TabItem>

<TabItem value="terraform">

```hcl showLineNumbers
resource "port_action" myAction {
  # ...action configuration
  {
    user_properties = {
      string_props = {
        simpleOption = {
          enum = ["option1", "option2"]
        }
        advancedOption = {
          visible_jq_query = ".user.roles | any(.name == \"Admin\")"
        }
      }
    }
  }
}
```

</TabItem>

<TabItem value="pulumi">

```python showLineNumbers title="pulumi.py"
action = Action(
  "pulumi-resource-name",
  identifier="action-identifier",
  title="Action Title",
  blueprint="myBlueprint",
  user_properties={
    "string_props": {
      "simpleOption": {
          "enums": ["option1", "option2"]
      },
      "advancedOption": {"visible_jq_query": ".user.roles | any(.name == \"Admin\")"}
    },
  },
  trigger="DAY-2",
  webhook_method={"url": "https://myserver.com"},
)
```

</TabItem>
</Tabs>

This is how the run form would show up for non-admin users:
![What Non-Admins See](/img/software-catalog/blueprint/hiddenPropertyExample.png)

And this is how the form would show up for admin users:
![What Admins See](/img/software-catalog/blueprint/hiddenPropertyShownExample.png)

### Filter the dropdown's available options based on a property

This example contains a filter that will only display the namespaces that are [related to](/search-and-query/#operators-1) the cluster that was selected in the `Cluster` input:

<Tabs
defaultValue="api"
values={[
{label: 'API', value: 'api'},
{label: 'Terraform', value: 'terraform'},
{label: 'Pulumi', value: 'pulumi'},
]}>

<TabItem value="api">

```json showLineNumbers
{
  "properties": {
    "env": {
      "type": "string",
      "format": "entity",
      "blueprint": "environment",
      "dataset": {
        "combinator": "and",
        "rules": [
          {
            "property": "type",
            "operator": "!=",
            "value": "production"
          }
        ]
      }
    }
  }
}
```

</TabItem>

<TabItem value="terraform">

```hcl showLineNumbers
resource "port_action" myAction {
  # ...action configuration
  {
    user_properties = {
      string_props = {
        env = {
          format : "entity",
          blueprint : "environment"
          dataset = {
            combinator = "and"
            rules = [
              {
                property = "type"
                operator = "!="
                value = {
                  jq_query = "'production'"
                }
              }
            ]
          }
        }
      }
    }
  }
}
```
</TabItem>

<TabItem value="pulumi">

```python showLineNumbers title="pulumi.py"
action = Action(
  # ...action properties
  user_properties={
    "string_props": {
      "env": {
        "format": "entity",
        "blueprint": "environment",
        "dataset": {
          "combinator": "and",
          "rules": [
            {
              "property": "type",
              "operator": "!=",
              "value": "production"
            }
          ]
        }
      }
    }
  }
)
```

</TabItem>
</Tabs>

![Only Production Envs](/img/software-catalog/blueprint/onlyNotProductionEnvs.png)

:point_up: only the environments whose type is not `production` will appear in the dropdown. :point_up:

### Filter the dropdown's available options based on a previous input

This example contains a filter that will only display the namespaces that are [related to](/search-and-query/#operators-1) the cluster that was selected in the `Cluster` input:

<Tabs
defaultValue="api"
values={[
{label: 'API', value: 'api'},
{label: 'Terraform', value: 'terraform'},
{label: 'Pulumi', value: 'pulumi'},
]}>

<TabItem value="api">

```json showLineNumbers
{
  "properties": {
    "Cluster": {
      "type": "string",
      "format": "entity",
      "blueprint": "Cluster",
      "title": "Cluster",
      "description": "The cluster to create the namespace in"
    },
    "namespace": {
      "type": "string",
      "format": "entity",
      "blueprint": "namespace",
      "dependsOn": ["Cluster"],
      "dataset": {
        "combinator": "and",
        "rules": [
          {
            "operator": "relatedTo",
            "blueprint": "Cluster",
            "value": {
              "jqQuery": ".form.Cluster.identifier"
            }
          }
        ]
      },
      "title": "namespace",
      "description": "The namespace to create the cluster in"
    }
  }
}
```

</TabItem>

<TabItem value="terraform">

```hcl showLineNumbers
resource "port_action" myAction {
  # ...action configuration
  {
    user_properties = {
      string_props = {
        cluster = {
          format      = "entity",
          blueprint   = "Cluster",
          title       = "Cluster",
          description = "The cluster to create the namespace in"
        }
        namespace = {
          title : "namespace",
          description : "The namespace to create the cluster in"
          format     = "entity",
          blueprint  = "namespace",
          depends_on = ["Cluster"],
          dataset = {
            combinator = "and"
            rules = [
              {
                blueprint = "Cluster"
                operator  = "relatedTo"
                value = {
                  jq_query = ".form.Cluster.identifier"
                }
              }
            ]
          }
        }
      }
    }
  }
}
```

</TabItem>

<TabItem value="pulumi">

```python showLineNumbers title="pulumi.py"
action = Action(
  # ...action properties
  user_properties={
    "string_props": {
      "Cluster": {
        "format": "entity",
        "blueprint": "Cluster",
        "title": "Cluster",
        "description": "The cluster to create the namespace in"
      },
      "namespace": {
        "format": "entity",
        "blueprint": "namespace",
        "dataset": {
          "combinator": "and",
          "rules": [
            {
              "operator": "relatedTo",
              "blueprint": "Cluster",
              "value": {
                "jq_query": ".form.Cluster.identifier"
              }
            }
          ]
        }
      }
    }
  }
)
```

</TabItem>

</Tabs>

![Cluster And Namespace Action](/img/software-catalog/blueprint/clusterNamespaceActionSmallerExample.png)

:point_up: The user will be required to choose a cluster, then the `namespace` input list will be populated with namespace entities related to the chosen cluster. :point_up:

### Filter the dropdown's available options based on properties of the user that executes the action

This example contains a filter that will only display the namespaces that belong to the user's teams (note the value key in the rules object):

<Tabs
defaultValue="api"
values={[
{label: 'API', value: 'api'},
{label: 'Terraform', value: 'terraform'},
{label: 'Pulumi', value: 'pulumi'},
]}>

<TabItem value="api">

```json showLineNumbers
{
  "properties": {
    "namespace": {
      "type": "string",
      "format": "entity",
      "blueprint": "namespace",
      "dataset": {
        "combinator": "and",
        "rules": [
          {
            "property": "$team",
            "operator": "containsAny",
            "value": {
              "jqQuery": "[.user.team]"
            }
          }
        ]
      }
    }
  }
}
```

</TabItem>

<TabItem value="terraform">

```hcl showLineNumbers
resource "port_action" myAction {
  # ...action configuration
  {
    user_properties = {
      string_props = {
        namespace = {
          format : "entity",
          blueprint : "namespace"
          dataset = {
            combinator = "and"
            rules = [
              {
                property = "$team",
                operator = "containsAny",
                value = {
                  jq_query = "[.user.team]"
                }
              }
            ]
          }
        }
      }
    }
  }
}
```
</TabItem>

<TabItem value="pulumi">

```python showLineNumbers title="pulumi.py"
action = Action(
  # ...action properties
  user_properties={
    "string_props": {
      "namespace": {
        "format": "entity",
        "blueprint": "namespace",
        "dataset": {
          "combinator": "and",
          "rules": [
            {
              "property": "$team",
              "operator": "containsAny",
              "value": {
                "jq_query": "[.user.team]"
              }
            }
          ]
        }
      }
    }
  }
)
```

</TabItem>
</Tabs>

<!-- :::info Users and teams as blueprints
If you are using the [manage users and teams as blueprints](/sso-rbac/rbac/#users-and-teams-as-blueprints) feature, there is a small change to make in the `jqQuery` value.  
See more information and an example [here](/sso-rbac/rbac/#consequent-changes).
::: -->

<img src='/img/software-catalog/blueprint/userPropertiesModal.png' width='70%' border='1px' />

:point_up: These are the only namespaces that are associated with the logged-in user's teams. :point_up:

### Filter the dropdown's available options based on the properties of the entity on which the action is performed

This example contains a filter that will only display the namespaces that have similar tags to those of the entity on which the action is performed:

<Tabs
defaultValue="api"
values={[
{label: 'API', value: 'api'},
{label: 'Terraform', value: 'terraform'},
{label: 'Pulumi', value: 'pulumi'},
]}>

<TabItem value="api">

```json showLineNumbers
{
  "properties": {
    "namespace": {
      "type": "string",
      "format": "entity",
      "blueprint": "namespace",
      "dataset": {
        "combinator": "and",
        "rules": [
          {
            "property": "tags",
            "operator": "containsAny",
            "value": {
              "jqQuery": "[.entity.properties.tags[]]"
            }
          }
        ]
      }
    }
  }
}
```

</TabItem>

<TabItem value="terraform">

```hcl showLineNumbers
resource "port_action" myAction {
  # ...action configuration
  {
    user_properties = {
      string_props = {
        namespace = {
          format     = "entity",
          blueprint  = "namespace",
          dataset = {
            combinator = "and"
            rules = [
              {
                property = "tags"
                operator = "containsAny"
                value = {
                  jq_query = "[.entity.properties.tags[]]"
                }
              }
            ]
          }
        }
      }
    }
  }
}
```

</TabItem>

<TabItem value="pulumi">

```python showLineNumbers title="pulumi.py"
action = Action(
  # ...action properties
  user_properties = {
    "string_props": {
      "namespace": {
        "format": "entity",
        "blueprint": "namespace",
        "dataset": {
          "combinator": "and",
          "rules": [
            {
              "property": "tags",
              "operator": "containsAny",
              "value": {
                "jq_query": "[.entity.properties.tags[]]"
              }
            }
          ]
        }
      }
    }
  }
)
```

</TabItem>
</Tabs>

### Setting a default value with the jqQuery

This example contains an array input with a default value that will be equal to the tags of the entity on which the action is performed:

<Tabs
defaultValue="api"
values={[
{label: 'API', value: 'api'},
{label: 'Terraform', value: 'terraform'},
{label: 'Pulumi', value: 'pulumi'},
]}>

<TabItem value="api">

```json showLineNumbers
{
  "properties": {
    "some_input": {
      "type": "array",
      "default": {
        "jqQuery": ".entity.properties.tags"
      }
    }
  }
}
```

</TabItem>

<TabItem value="terraform">

```hcl showLineNumbers
resource "port_action" myAction {
  # ...action configuration
  {
    user_properties = {
      array_props = {
        some_input = {
          default_jq_query = ".entity.properties.tags"
        }
      }
    }
  }
}
```

</TabItem>
<TabItem value="pulumi">

```python showLineNumbers title="pulumi.py"
action = Action(
  # ...action properties
  user_properties={
    "array_props": {
      "some_input": {
        "default_jq_query": ".entity.properties.tags"
      }
    },
  },
  trigger="DAY-2", # CREATE, DAY-2, DELETE
)
```

</TabItem>
</Tabs>

![entity tags action](/img/software-catalog/blueprint/defaultEntityTags.png)

:point_up: The namespace tags are already inserted into the form. :point_up:

### Setting required inputs with the jqQuery

This example contains two user inputs: one will always be required, and the other will be required based on the entity's properties.

<Tabs
defaultValue="api"
values={[
{label: 'API', value: 'api'},
{label: 'Terraform', value: 'terraform'},
{label: 'Pulumi', value: 'pulumi'}
]}>

<TabItem value="api">

```json showLineNumbers
{
  "properties": {
    "alwaysRequiredInput": {
      "type": "string"
    },
    "inputRequiredBasedOnData": {
      "type": "string"
    }
  },
  "required": {
    "jqQuery": "if .entity.properties.conditionBooleanProperty then [\"alwaysRequiredInput\", \"inputRequiredBasedOnData\"] else [\"alwaysRequiredInput\"] end"
  }
}
```

</TabItem>
<TabItem value="terraform">

```hcl showLineNumbers
resource "port_action" myAction {
  # ...action configuration
  {
    user_properties = {
      string_props = {
        alwaysRequiredInput = {}
        inputRequiredBasedOnData = {}
      }
    }
    required_jq_query = "if .entity.properties.conditionBooleanProperty then [\"alwaysRequiredInput\", \"inputRequiredBasedOnData\"] else [\"alwaysRequiredInput\"] end"
  }
}
```

</TabItem>
<TabItem value="pulumi">

```python showLineNumbers title="pulumi.py"
action = Action(
  "budding-action",
  identifier="budding-action",
  title="A Budding Act",
  # ...more action properties
  user_properties={
    "string_props": {
      "alwaysRequiredInput": {},
      "inputRequiredBasedOnData": {}
    },
  },
  required_jq_query='if .entity.properties.conditionBooleanProperty then ["alwaysRequiredInput", "inputRequiredBasedOnData"] else ["alwaysRequiredInput"] end',
  trigger="DAY-2", # CREATE, DAY-2, DELETE
)

pulumi.export("name", action.title)
```

</TabItem>
</Tabs>

## Complete Example

In this example, we will create an action that lets the user select a cluster and a namespace in that cluster. The user will also be able to select a service that is already running in the cluster. The action will then deploy the selected service to the selected namespace in the cluster. The user will only be able to select a service that is linked to his team.

#### the existing model in Port:

![Developer PortalCreate New Blueprint](/img/software-catalog/blueprint/clusterNamespaceBlueprint.png)

#### the action's configuration:

<Tabs
defaultValue="api"
values={[
{label: 'API', value: 'api'},
{label: 'Terraform', value: 'terraform'},
{label: 'Pulumi', value: 'pulumi'},
]}>

<TabItem value="api">

```json showLineNumbers
{
  "identifier": "createRunningService",
  "title": "Deploy running service to a cluster",
  "icon": "Cluster",
  "trigger": {
    "type": "self-service",
    "operation": "CREATE",
    "userInputs": {
      "properties": {
        "Cluster": {
          "type": "string",
          "format": "entity",
          "blueprint": "Cluster",
          "title": "Cluster",
          "description": "The cluster to create the namespace in"
        },
        "namespace": {
          "type": "string",
          "format": "entity",
          "blueprint": "namespace",
          "dependsOn": ["Cluster"],
          "dataset": {
            "combinator": "and",
            "rules": [
              {
                "operator": "relatedTo",
                "blueprint": "Cluster",
                "value": {
                  "jqQuery": ".form.Cluster.identifier"
                }
              }
            ]
          },
          "title": "namespace",
          "description": "The namespace to create the cluster in"
        },
        "service": {
          "type": "string",
          "format": "entity",
          "blueprint": "Service",
          "dataset": {
            "combinator": "and",
            "rules": [
              {
                "property": "$team",
                "operator": "containsAny",
                "value": {
                  "jqQuery": "[.user.team]"
                }
              }
            ]
          },
          "title": "Service"
        }
      },
      "required": ["Cluster", "namespace", "service"]
    },
  },
  "invocationMethod": {
    "type": "WEBHOOK",
    "url": "https://example.com"
  },
  "description": "This will deploy a running service to a cluster"
}
```

</TabItem>

<TabItem value="terraform">

```hcl showLineNumbers
resource "port_action" "createRunningService" {
  title       = "Create Running Service"
  identifier  = "createRunningService"
  description = "This will deploy a running service to a cluster"
  webhook_method = {
    url = "https://example.com"
  }
  self_service_trigger = {
    operation = "CREATE"
    blueprint_identifier = "createRunningService"
    user_properties = {
      string_props = {
        cluster = {
          format      = "entity",
          blueprint   = "Cluster",
          title       = "Cluster"
          description = "The cluster to create the namespace in"
          required    = true
        }
        namespace = {
          title       = "Namespace"
          format      = "entity",
          blueprint   = "namespace",
          description = "The namespace to create the cluster in"
          required    = true
          depends_on  = ["cluster"]
          dataset = {
            combinator = "and"
            rules = [
              {
                blueprint = "Cluster"
                operator  = "relatedTo"
                value = {
                  jq_query = ".form.Cluster.identifier"
                }
              }
            ]
          }
        }
        service = {
          title     = "Service"
          blueprint = "Service",
          required  = true
          dataset = {
            combinator = "and"
            rules = [
              {
                blueprint = "$team"
                operator  = "containsAny"
                value = {
                  jq_query = "[.user.team]"
                }
              }
            ]
          }
        }
      }
    }
  }
}
```

</TabItem>
<TabItem value="pulumi">

<Tabs
defaultValue="python"
values={[
{label: 'Python', value: 'python'},
{label: 'Javascript', value: 'javascript'}
]}>

<TabItem value="python">

```python showLineNumbers
action = Action(
  "create-running-service",
  identifier="createRunningService",
  title="Deploy running service to a cluster",
  icon="Cluster",
  self_service_trigger={
    operation="CREATE"
    blueprint_identifier="createRunningService"
    user_properties={
      "string_props": {
        "Cluster": {
          "format": "entity",
          "blueprint": "Cluster",
          "required": True,
          "title": "Cluster",
          "description": "The cluster to create the namespace in"
        },
        "namespace": {
          "format": "entity",
          "blueprint": "namespace",
          "required": True,
          "depends_ons": ["Cluster"],
          "dataset": {
              "combinator": "and",
              "rules": [
                {
                  "operator": "relatedTo",
                  "blueprint": "Cluster",
                  "value": {
                    "jq_query": ".form.Cluster.identifier"
                  }
                }
              ],
          },
          "title": "namespace",
          "description": "The namespace to create the cluster in"
        },
        "service": {
          "format": "entity",
          "blueprint": "Service",
          "required": True,
          "dataset": {
            "combinator": "and",
            "rules": [
              {
                "blueprint": "$team",
                "operator": "containsAny",
                "value": {
                  "jq_query": "[.user.team]"
                }
              }
            ]
          },
          "title": "Service"
        }
      },
    },
  }
  description="This will deploy a running service to a cluster"
  webhook_method={"url": "https://example.com"},
)

pulumi.export("name", action.title)
```

</TabItem>

<TabItem value="javascript">

```javascript showLineNumbers
"use strict";
const pulumi = require("@pulumi/pulumi");
const port = require("@port-labs/port");

const entity = new Action("create-running-service", {
  identifier: "createRunningService",
  title: "Deploy running service to a cluster",
  icon: "Cluster",
  userProperties: {
    stringProps: {
      "Cluster": {
        "format": "entity",
        "blueprint": "Cluster",
        "required": true,
        "title": "Cluster",
        "description": "The cluster to create the namespace in"
      },
      "namespace": {
        "format": "entity",
        "blueprint": "namespace",
        "required": true,
        "dependsOns": ["Cluster"],
        "dataset": {
          "combinator": "and",
          "rules": [
            {
              "operator": "relatedTo",
              "blueprint": "Cluster",
              "value": {
                "jqQuery": ".form.Cluster.identifier"
              }
            }
          ],
        },
      },
      "service": {
        "format": "entity",
        "blueprint": "Service",
        "required": true,
        "dataset": {
          "combinator": "and",
          "rules": [
            {
              "blueprint": "$team",
              "operator": "containsAny",
              "value": {
                "jqQuery": "[.user.team]"
              }
            }
          ]
        },
        "title": "Service"
      }
    }
  },
  trigger: "CREATE",
  description: "This will deploy a running service to a cluster"
  webhookMethod: {
    "url": "https://example.com"
  },
});

exports.title = entity.title;
```

</TabItem>

</Tabs>

</TabItem>
</Tabs>

#### The action in the developer portal:

![Cluster And Namespace Action](/img/software-catalog/blueprint/clusterNamespaceAction.png)

:point_up: The user will be required to choose a cluster, and then the namespace input list will be populated with namespace entities related to the chosen cluster. The user will only be able to deploy services associated with his team.  
Note the `$` before `team`, this indicates that this is a [metadata property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/meta-properties).
