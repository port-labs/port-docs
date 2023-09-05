---
sidebar_position: 14
title: ⚓️ Meta
---

# ⚓️ Meta-Properties

A meta-property is a property that exists on every entity in Port by default.

## 💡 Common meta-property usage:

Example meta-properties include:

- identifier;
- title;
- createdAt;
- and more.

In this [live demo](https://demo.getport.io/services) example, we can see the `Title` meta-property. 🎬

Meta-properties are always referenced using a dollar sign (`$`) before them, this makes it easier to tell if a property is user-defined or a meta-property.

Here is a short table demonstrating the usage of common mirror properties:

| Meta-property | Description                                                                                                         | Mirror property syntax | Notes                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------- |
| identifier    | **Unique** Entity identifier, used for API calls, programmatic access and distinguishing between different entities | `$identifier`          |                                              |
| title         | Entity title, acts as a human-readable name for the entity                                                          | `$title`               |                                              |
| createdAt     | Entity creation time                                                                                                | `$createdAt`           | Value is set upon creation and never changes |
| updatedAt     | Entity update time                                                                                                  | `$updatedAt`           | Value is updated automatically               |
