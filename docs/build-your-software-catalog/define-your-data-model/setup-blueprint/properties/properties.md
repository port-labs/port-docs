---
sidebar_position: 1
---

# Properties

Each blueprint has a `properties` section under its `schema`. In this section, you can define all of the unique properties that describe your asset.

## Use cases

Example use cases for the various property types:

- `string` - for IDs and file names;
- `number` - for Core counts and Memory sizes;
- `boolean` - to denote locked environments;
- etc.

## Structure

```json showLineNumbers
{
  "myStringProp": {
    "title": "My string",
    "icon": "My icon",
    "description": "My string property",
    "type": "string",
    "default": "My default"
  }
}
```

The different components that make up a basic property definition are listed in the following table:

| Field         | Description                                                                                                                                                                        |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `title`       | Property name                                                                                                                                                                      |
| `type`        | **Mandatory field.** The data type of the property.                                                                                                                                |
| `icon`        | Icon for the property <br /><br />See the full icon list.                                                                                                                          |
| `description` | Description of the property.<br /> This value is visible to users when hovering on the info icon in the UI. It provides detailed information about the use of a specific property. |
| `default`     | Default value for this property in case an entity is created without explicitly providing a value.                                                                                 |

## Available properties

import DocCardList from '@theme/DocCardList';

<DocCardList />

## Meta-properties

A meta-property is a property that exists on every entity in Port, the user can control its value, but he can not choose not to add it to the entity or blueprint definition.

Example meta-properties include:

- identifier;
- title;
- createdAt;
- and more.

Meta-properties are always referenced using a dollar sign (`$`) before them, this makes it easier to tell if a property is user-defined or a meta-property.

Here is a short table demonstrating the usage of common mirror properties:

| Meta-property | Description          | Mirror property syntax |
| ------------- | -------------------- | ---------------------- |
| identifier    | Entity identifier    | `$identifier`          |
| title         | Entity title         | `$title`               |
| createdAt     | Entity creation time | `$createdAt`           |
| updatedAt     | Entity update time   | `$updatedAt`           |
