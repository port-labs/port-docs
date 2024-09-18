---
sidebar_position: 2
---

# Examples

### Ownership scorecard

The following example demonstrates an ownership scorecard.

It has one filter defined:

- Only evaluate entities that are related to production (indicated by checking that the `is_production` property is set to `true`).

It has two rules:

- Check that a defined on-call exists and that the number of `open_incidents` is lower than 5;
- Check if a team exists.

```json showLineNumbers
[
  {
    "title": "Ownership",
    "identifier": "ownership",
    "filter": {
      "combinator": "and",
      "conditions": [
        {
          "property": "is_production",
          "operator": "=",
          "value": true
        }
      ]
    },
    "rules": [
      {
        "title": "Has on call?",
        "identifier": "has_on_call",
        "level": "Gold",
        "query": {
          "combinator": "and",
          "conditions": [
            {
              "operator": "isNotEmpty",
              "property": "on_call"
            },
            {
              "operator": "<",
              "property": "open_incidents",
              "value": 5
            }
          ]
        }
      },
      {
        "title": "Has a team?",
        "identifier": "has_team",
        "level": "Silver",
        "query": {
          "combinator": "and",
          "conditions": [
            {
              "operator": "isNotEmpty",
              "property": "$team"
            }
          ]
        }
      }
    ]
  }
]
```

### Ensure relation existence

Say we have a `Service` blueprint that has a relation to another blueprint named `Domain`.  
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

### Validate number of related entities

We want to track the deployment frequency of a team, and set rules to it. Checking the `Deployment` relation to the `Team` is not enough, we want to see how many there are.
To achieve this, we will:
1. Create an [aggregation property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/aggregation-property.md) to count the number of related entities (for example, the number of deployments in the past week)
2. Add a scorecard with a rule based on that property.

```json showLineNumbers
{
  "title": "DORA Metrics",
  "identifier": "dora_metrics",
  "rules": [
    {
      "identifier": "deploymentFrequency",
      "title": "Deployment frequency > 2",
      "level": "Bronze",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "operator": ">",
            "property": "deployment_frequency",
            "valu": 3
          }
        ]
      }
    },
    {
      "identifier": "deploymentFrequency",
      "title": "Deployment frequency > 4",
      "level": "Silver",
      "query": {
        "combinator": "and",
        "conditions": [
          {
            "operator": ">",
            "property": "deployment_frequency",
            "valu": 4
          }
        ]
      }
    }
  ]
}
```