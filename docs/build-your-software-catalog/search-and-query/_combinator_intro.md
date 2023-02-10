There are two available combinators: `and`/`or`:

- `and` - will apply a logical AND operation between all rules, requiring all of them to satisfy for a given asset in order to return it;
- `or` - will apply a logical OR operation between all rules, requiring at least one of them to satisfy for a given asset in order to return it.

:::tip single rule queries
If you only have a single rule in your query, the combinator has no effect. But keep in mind that it still needs to be included to adhere to the query structure.
:::
