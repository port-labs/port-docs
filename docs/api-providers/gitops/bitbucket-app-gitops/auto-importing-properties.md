---
sidebar_position: 6
---

# Auto importing properties

### Introduction

With our Bitbucket app you can auto import properties from a Bitbucket repository, like TODO: complete examples here...

### Auto importable properties

| Field  | Description                                                                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `repo` | Link to the repository that the `port.yml` file is located in. <br/><br/> \* When there are multiple `port.yml` files the link will point to each `port.yml` file's parent directory. |

### Using auto importable properties

In order to use auto importable properties, add the JSON below to your [Blueprint schema](../../../software-catalog/blueprint/blueprint.md#blueprints-properties). If you still don't have a Blueprint with Bitbucket integration, please refer to the [Quickstart](./quickstart) section to create one.

:::tip
You can choose to include only a subset of the auto importable properties shown above, or all of them.

:::

```json showLineNumbers
{
  "identifier": "Microservice",
  "title": "Microservice",
  "icon": "Microservice",
  "calculationProperties": {},
  "schema": {
    "properties": {
      "repo": {
        "title": "Repo",
        "type": "string",
        "format": "url",
        "description": "Link to the service repo on Bitbucket"
      }
    },
    "required": []
  }
}
```

:::caution
When adding these properties, make sure to add them to the set of Blueprint properties, and not to overwrite the existing properties of the Blueprint.
:::
