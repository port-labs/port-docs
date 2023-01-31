# Search & Query

Port’s API comes with a built-in search route that allows you to navigate your Service Catalog with ease.

Using the search route’s filters and rules, you can search different Entities.

## Usecases

- x
- y
- z

## Search Request

The base search route is https://api.getport.io/v1/entities/search, it receives HTTP POST requests.

A search request defines the logical Relation between different search rules, and contains filters and rules to find suitable Entities.
Each search request is represented by a JSON object, as shown in the following example:

```json showLineNumbers
{
  "combinator": "and",
  "rules": [
    {
      "property": "$blueprint",
      "operator": "=",
      "value": "microservice"
    },
    {
      "property": "$identifier",
      "operator": "contains",
      "value": "admin"
    }
  ]
}
```

Query for all entities from type `microservice` that their `identifier` contains the string `admin`

### Search request elements

| Field        | Description                                                        |
| ------------ | ------------------------------------------------------------------ |
| `combinator` | Defines the query’s logical Relations between different conditions |
| `rules`      | An array of search rules to filter results with                    |

## Combinator

And Or

## Rules

A search rule is a small filtering unit, used to control the output

Here is an example search rule:

```json showLineNumbers
{
  "property": "$blueprint",
  "operator": "=",
  "value": "microservice"
}
```

---
