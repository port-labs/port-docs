### Setting null properties

When you want to clear a property's value in Port, you can explicitly set it to `null` in your `port.yml` file. Let's see how to do this:

```yaml showLineNumbers
identifier: myEntity
title: My Entity
blueprint: myBlueprint
properties:
  description: null  
  owner: null
```

This is particularly useful when you want to:
- Remove a previously set property value.
- Reset a property to its default state.
- Clear optional properties that are no longer relevant.

:::tip Difference between null and omitting
When you omit a property entirely from the `port.yml`, Port will keep its existing value. Setting a property to `null` explicitly tells Port to clear that property's value.
:::