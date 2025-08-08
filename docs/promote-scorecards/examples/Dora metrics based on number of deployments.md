### DORA metrics based on number of deployments

To assess the deployment frequency of a `service`, simply checking the `deployment` relation is not enough — we need to know the exact number of deployments. To achieve this, we can:

- Add an [aggregation property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/aggregation-property.md) to the `service` blueprtint that counts the number of related `deployment` entities.
- Add a scorecard with a rule based on the new aggregation property:

```json showLineNumbers
{ 
  "title": "DORA Metrics",
  "identifier": "dora_metrics",
  "rules": [
    {
      "identifier": "deployFreqBronze",
      "title": "Deployment frequency > 2",
      "level": "Bronze",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "operator": ">",
            "property": "deployment_frequency",
            "value": 3
          }
        ]
      }
    },
    {
      "identifier": "deployFreqSilver",
      "title": "Deployment frequency > 4",
      "level": "Silver",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "operator": ">",
            "property": "deployment_frequency",
            "value": 4
          }
        ]
      }
    }
  ]
}
```