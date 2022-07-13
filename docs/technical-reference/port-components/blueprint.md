---
sidebar_position: 1.1
sidebar_label: Blueprint
---
# The Blueprint Component

## What is a Blueprint?

A **blueprint** is *the most basic* building block in Port. It represents assets that can be managed in Port, such as `microservice`, `environments`, `packages`, `clusters`, `databases`, and many more. 

Blueprints are completely customizable, and they support any number of properties the user chooses, all of which can be modified as you go. 


## Defining your Blueprints

Before you start, there are a few important steps when trying to define your blueprints:

1. **What assets do you want to manage** - What will your organization benefit from? For example, in one organization, managing microservices (with clusters, deployments, etc...) is a big issue. In another, it could be understating what environments the organization has in a given moment.  

2. **What properties characterize your assets** - For example, a microservice might have its owner, a link to its Github repository, the slack channel of the responsible team and a health check status.  

3. **What are the relationships between the different assets** - For example, we would like to create a relation between microservices and deployments to track where each microservice is deployed.

:::note
By the end of this section, you should have something like this in mind:

![Example Blueprints and Relations Layout](../../../static/img/setup-your-port/self-service-portal/blueprints/exampleBlueprintsAndRelationsLayout.png)
:::

## Blueprint's Structure

### Blueprint's JSON schema

Each blueprint is represented by a **Json schema**, as shown in the following section:

```json
{
    "identifier": "UniqueID",
    "title": "Title",
    "icon": "one of Airflow, Ansible, Argo, Aws, Azure, Blueprint, Bucket, Cloud, Cluster, CPU, Customer, Datadog, DefaultEntity, DefaultProperty, DeployedAt, Deployment, DevopsTool, Docs, Environment, Git, Github, GitVersion, GoogleCloud, GPU, Grafana, Jenkins, Lambda, Link, Lock, Microservice, Moon, Node, Okta, Package, Permission, Server, Service, Terraform",
    "dataSource": "Port",
    "formulaProperties": {},
    "schema": {
        "properties": {
            "foo": {
                "type": "string",
                "title": "Foo"
            },
            "bar": {
                "type": "number",
                "title": "Bar"
            },
            "date": {
                "type": "string",
                "format": "date-time",
                "title": "Date"
            }
        },
        "required": []
    }
}

```
---
### Structure Table

| Field | Type | Description | Optional Values |
| ----------- | ----------- | ----------- | ----------- |
| `identifier` | `String` | A unique identifier (Note that while the identifier is unique, it can be changed after creation) |
| `title` | `String` | A nicely written name for the blueprint |One of the list:  `Airflow, Ansible, Argo, Aws, Azure, Blueprint, Bucket, Cloud,...` See the full icon list [below.](#full-icon-list) |
| `dataSource` | `String` | The source from which entity data is ingested, can be either `Port` or `Github` | `Port` or `Github` | 
| `formulaProperties` | `Object` | Contains the properties that are defined using formula templating | Example: "`repo-link`": "`https://github.com/{{$identifier}}`"|
| `schema` | {     `properties`: {},     `required`: [] } | An object containing two more nested fields | See [`properties`](#blueprints-properties) for more details. |


#### Full Icon list
:::note Available Icons
`Airflow, Ansible, Argo, Aws, Azure, Blueprint, Bucket, Cloud, Cluster, CPU, Customer, Datadog, DefaultEntity, DefaultProperty, DeployedAt, Deployment, DevopsTool, Docs, Environment, Git, Github, GitVersion, GoogleCloud, GPU, Grafana, Jenkins, Lambda, Link, Lock, Microservice, Moon, Node, Okta, Package, Permission, Server, Service, Terraform`
:::

## Blueprint's Properties

Each blueprint has a `properties` section under its `schema`. In this section, you can define all of the unique properties that describe your asset.

For Example:

```json showLineNumbers
"string_prop": {
    "title": "My String Property",
    "type": "string",
    "default": "foo",
    "description": "This is a string property"
}
```

Now let's look at the structure of this property definition and also explore the entire set of options for a single property:

| Field | Type | Description |
| ----------- | ----------- | ----------- | 
| `title` | `String` | A nicely written name for the property |
| `type` | `String` | **A mandatory Field.** The data type of the property. You can explore all available types in the [Property Types](#property-types) section |
| `format` | `String` | A specific data format to pair with some of the available types. You can explore all formats in the [String Formats](#string-property-formats) section | 
| `default` | Should match the `type` | A default value for this property in case an entity is created without explicitly providing a value. |
| `description` | `String` | A description of the property. This value is visible via in info node from the UI. It provides detailed information about the use of a specific property. |


:::tip
we highly recommend you set a `description`, so your developers will have the context of the property.
:::

![Property Description Tooltip Example](../../../static/img/technical-reference/port-components/propertyDescriptionTooltipExample.png)


## Property Types

```json {3} showLineNumbers
"string_prop": {
    "title": "My String Property",
    "type": "string",
    "default": "foo",
    "description": "This is a string property"
}
```
We currently support the following types:

| `type:` | Description |
| ----------- | ----------- | 
| `string` | A nicely written name for the property |
| `number` | Numeric field (including integers, doubles, floats, etc...) - `1`, `2.3`, `5e3`,... |
| `boolean` | A `true` or `false` |
| `object` | A well formatted object (i.e. python dictionary, javascript object, JSON, etc...) |
| `array` | A multi-element array - `[1,2,3]`, `["a","b","c"]` |

:::note
Those are the `properties` that our API supports. See [API reference](../api-reference).
:::

### Examples

Here is how property definitions look for all available types (remember that only the `type` field is mandatory):

<details>
<summary> See Property Type Examples </summary>
<div>

### String

```json
{
    "title": "String Property",
    "type": "string",
    "description": "A string property",
    "default": "foo"
}
```

### Number

```json
{
    "title": "Number Property",
    "type": "number",
    "description": "A number property",
    "default": 42
}
```

### Boolean

```json
{
    "title": "Boolean Property",
    "type": "boolean",
    "description": "A boolean property",
    "default": true
}
```

### Object

```json
{
    "title": "Object Property",
    "type": "object",
    "description": "An object property",
    "default": {
        "foo": "bar"
    }
}
```

### Array

```json
{
    "title": "Array Property",
    "type": "array",
    "description": "An array property",
    "default": [1, 2, 3]
}
```

### Objects Array

```json
{
    "title": "Array of Objects",
    "type": "array",
    "items:" {
        "type": "object"
    }
    "description": "An array property"
}
```

### Enum

```json
{
    "title": "Enum field",
    "type": "string",
    "enum": [
            "Option 1",
            "Option 2",
            "Option 3"
    ],
    "description": "Enum dropdown menu"
}
```

</div>
</details>


## String Property Formats

```json {3-4} showLineNumbers
"string_prop": {
    "title": "My String Property",
    "type": "string",
    "format": "url",
    "default": "foo",
    "description": "This is a string property"
}
```
We currently support the following `string` formats:

| `format:` | Description | 
| ----------- | ----------- | 
| `url` | A formatted URL, for example `"https://getport.io"` |
| `email` | A formatted Email, for example `"port@getport.io"` |
| `date-time` | A formatted ISO string datetime, for example `"2022-04-18T11:44:15.345Z"` |
| `ipv4` | A standard IPv4 address, for example `127.0.0.1` |
| `ipv6` | A standard IPv6 address, for example `FE80:CD00:0A20:0CDE:1257:1C34:211E:729C` |

:::note
Those are the `format` types that our API supports. See [API reference](../api-reference).
:::

### Examples

Here is how property formats are used:

<details>
<summary> See String Format Examples </summary>
<div>

### URL

```json
{
    "title": "URL Property",
    "type": "string",
    "format": "url",
    "description": "A URL property",
    "default": "https://getport.io"
}
```

### Email

```json
{
    "title": "Email Property",
    "type": "string",
    "format": "email",
    "description": "An Email property",
    "default": "mor@getport.io"
}
```

### Date Time

```json
{
    "title": "Datetime Property",
    "type": "string",
    "format": "date-time",
    "description": "A datetime property",
    "default": "2022-04-18T11:44:15.345Z"
}
```

### IPv4

```json
{
    "title": "IPv4 Property",
    "type": "string",
    "format": "ipv4",
    "description": "An IPv4 property",
    "default": "127.0.0.1"
}
```

### IPv6

```json
{
    "title": "IPv6 Property",
    "type": "string",
    "format": "ipv6",
    "description": "An IPv6 property",
    "default": "0000:0000:0000:0000:0000:0000:0000:0000"
}
```
</div>
</details>


## Creating a Blueprint

### From the UI

### From the API


## Updating a Blueprint


## Deleting a Blueprint


:::tip Explore How to Create, Edit, and Delete Blueprints [ ➡️ ](../api-reference)
:::
:::danger Explore Advanced Operations on Blueprint with our API [ ➡️ ](../api-reference)
:::