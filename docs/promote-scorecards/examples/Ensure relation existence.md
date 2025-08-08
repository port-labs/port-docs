### Ensure relation existence

Say we have a `service` blueprint that has a relation to another blueprint named `domain`.  
We can define a scorecard that checks that all of our services have a related domain. Services with empty `domain` relations will fail this check:

```json showLineNumbers
{
  "title": "Domain definition",
  "identifier": "domain_definition",
  "rules": [
    {
      "identifier": "hasDomain",
      "title": "Has domain",
      "level": "Bronze",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "operator": "isNotEmpty",
            "relation": "domain"
          }
        ]
      }
    }
  ]
}
```