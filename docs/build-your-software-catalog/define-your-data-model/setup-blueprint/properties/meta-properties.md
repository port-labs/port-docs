---
sidebar_position: 16
---

# Meta-Properties

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
