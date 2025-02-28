### Setting null properties

When you want to clear a property's value in Port, you can explicitly set it to `null` in your `port.yml` file.  
For example:

```yaml showLineNumbers
identifier: myEntity
title: My Entity
blueprint: myBlueprint
properties:
  description: null  
  owner: null
```

:::tip Difference between null and omitting
When you omit a property entirely from the `port.yml`, Port will keep its existing value. Setting a property to `null` explicitly tells Port to clear that property's value.
:::