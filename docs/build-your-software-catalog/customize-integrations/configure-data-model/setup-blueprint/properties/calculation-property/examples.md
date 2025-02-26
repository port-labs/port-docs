# Examples

Here are a few examples of calculation properties use cases:

## Basic calculation property

In the following example, we will create a calculation property called `MBMemory` of type `number`, and then transform it into a GB unit:

```json showLineNumbers

"properties":{
    "MBMemory":{
        "type": "number"
    },
},
"calculationProperties" : {
    "GBMemory": {
        "title": "GB Memory",
        "type": "number",
        "calculation": ".properties.MBMemory / 1024"
    }
}
```

In this instance, if you have a `MBMemory` **string** property with the value:

```json showLineNumbers
{
  "MBMemory": 2048
}
```

Then the `GBMemory` calculation property value will be:

```json showLineNumbers
{
  "GBMemory": 2
}
```

This is an example of how calculation properties can be used to perform math equations over data ingested into Port.

## Concatenate strings

Assume you have two `string` properties: one is called `str1` with the value `hello`, the other is called `str2` with the value `world`.
The following calculation will result in `hello world`:

```json showLineNumbers
{
  "title": "Concatenate strings example",
  "type": "string",
  "calculation": ".properties.str1 + .properties.str2"
}
```

:::tip
If you want to provide your own string template to concatenate properties , wrap your template string with single quotes (`'`), such as `'https://' + .properties.str1'`
:::

## Calculate array length

Assume you have an `array` property called `myArr` with the value `["this", "is", "port"]`.

The following calculation will result in `3`:

```json showLineNumbers
{
  "title": "Calculate array length",
  "type": "number",
  "calculation": ".properties.myArr | length"
}
```

## Slice array

Assume you have an `array` property called `array1` with the value `[1,2,3,4]`. You can use the following slicing calculation to get the result `[2,3,4]`:

```json showLineNumbers
{
  "title": "Slice array example",
  "type": "string",
  "calculation": ".properties.array1[1:4]"
}
```

## Merge objects

Assume you have two `object` properties: one called `deployed_config` with the value `{cpu: 200}`, the other called `service_config` with the value `{memory: 400}`. You can merge these two object properties and receive a unified config by using the following calculation:

```json showLineNumbers
"calculationProperties" : {
    "merge_config": {
        "title": "Merge config",
        "type": "object",
        "calculation": ".properties.deployed_config * .properties.service_config",
    }
}
```

The result will be `{cpu: 200, memory: 400}`.

:::info Object merging

- Object merging performs a deep merge, resulting in nested keys from the original objects appearing in the resulting merged object.
- If the same `key` appears in one or more of the merged properties, the last property that appears will have its `keys` take precedence over the `keys` of properties that appeared earlier in the calculation.

For example, Let's assume we have 2 properties with type `object`, and we want to perform a deep merge between them:

```json showLineNumbers
{
  "obj1": {
    "cpu": 200
  },
  "obj2": {
    "cpu": 400
  }
}
```

If the calculation is `".properties.obj1 * .properties.obj2"` , the result will be `{cpu: 400}`,

If the calculation is `".properties.obj2 * .properties.obj1"` , the result will be `{cpu: 200}`,

For merging YAML properties, the merging behavior will be the same, but if you specify `type: "string` and `format: "yaml"`, the result will be a YAML object.
:::

## If-else conditions

Assume that your services use multiple packages, some written in Python and some written in Node.js.

By using an if-else JQ rule, you can specify a different URL for each package, based on its language:

```json showLineNumbers
"calculationProperties" : {
    "package_manager_url": {
        "title": "Package Link",
        "type": "string",
        "format": "url",
        "calculation": "if .properties.language == \"Python\" then \"https://pypi.org/project/\" + .identifier else \"https://www.npmjs.com/package/\" + .identifier end",
    }
}
```

For the following entity:

```json showLineNumbers
{
  "identifier": "requests",
  "properties": {
    "language": "Python"
  }
}
```

The result will be `package_manager_url: "https://pypi.org/project/requests"`.

For the following entity:

```json showLineNumbers
{
  "identifier": "axios",
  "properties": {
    "language": "Nodejs"
  }
}
```

The result will be `package_manager_url: "https://www.npmjs.com/package/axios"`.

## Calculate K8S labels

You can create a calculation property inside your Blueprint to display a specific tag. Looking at the Node Blueprint, you can find the following property:

```json
"properties": {
      ...
      "labels": {
        "type": "object",
        "title": "Labels",
        "description": "Labels of the Node"
      },
```

And the labels object looks like:

```json
{
  "kubernetes.io/metadata.name": "port-k8s-exporter",
  "name": "port-k8s-exporter"
}
```

To display the value of `name`, create a new calculation property within the same Blueprint. then use the following JQ calculation:

```json
.properties.labels."name"
```

The result will be a property that displays `port-k8s-exporter`.

## Calculate Cloud resource tags

Assuming you have a property `tags` in your Blueprint, you can use JQ to display the value of a tag.

In Port's AWS exporter, you can find the following array:

```json
"tags": [
      {
        "Value": "authentication-service",
        "Key": "server-application"
      },
      {
        "Value": "1a23-4bc5d-67efg-89k10",
        "Key": "applyId"
      },
      {
        "Value": "0.0.11",
        "Key": "server-version"
      }
    ]
```

To display a Value of `applyId`, create a new calculation property within the Blueprint of the entity, and use the following JQ calculation:

```json
.properties.tags.[] | select(.Key=="applyId") | .Value
```

The result will be a property that will display `1a23-4bc5d-67efg-89k10`.
