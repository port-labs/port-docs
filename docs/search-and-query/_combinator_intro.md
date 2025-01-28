There are two available combinators:

- `and` - will apply a logical AND operation between all rules, requiring all of them to satisfy for a given asset in order to return it.
- `or` - will apply a logical OR operation between all rules, requiring at least one of them to satisfy for a given asset in order to return it.

:::tip single rule queries
If you only have a single rule in your query, the combinator has no effect. But keep in mind that it still needs to be included to adhere to the query structure.

<details>
<summary>Single rule query example</summary>

In the following example, only a single rule appears in the `rules` array, so the `combinator` field has no effect:

```json showLineNumbers
{
  // highlight-next-line
  "combinator": "and",
  "rules": [
    // highlight-start
    {
      "property": "$blueprint",
      "operator": "=",
      "value": "myBlueprint"
    }
    // highlight-end
  ]
}
```

</details>

:::
