---
sidebar_position: 9
title: Meta
sidebar_class_name: "custom-sidebar-item sidebar-property-meta"
---

# Meta-Properties

A meta-property is a property that exists on every entity in Port by default.

Meta-properties are always referenced using a dollar sign (`$`) before them, this makes it easier to tell if a property is user-defined or a meta-property.

The following table lists all of the available meta-properties: 

| Meta-property | Description | Notes |
| ------------- | ----------- | ----- |
| `$identifier` | **Unique** Entity identifier, used for API calls, programmatic access and distinguishing between different entities | 
| `$title` | A human-readable name for the entity | |
| `$team`       | The team this entity belongs to| |
| `$icon`       | The entity's icon | |
| `$createdAt`  | The entity's creation time | Value is set upon creation and never changes |
| `$updatedAt`  | The entity's last update time | Value is updated automatically |
| `$createdBy`  | The user who created the entity |  Value is set upon creation and never changes |
| `$updatedBy`  | The user who last updated the entity |   Value is updated automatically |
| `$blueprint`  | The entity's blueprint | |

