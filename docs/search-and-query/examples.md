---
sidebar_position: 3
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Examples

This page provides practical examples of using search and query syntax across different areas of Port.

## Catalog pages

Initial filters for [catalog pages](/customize-pages-dashboards-and-plugins/page/catalog-page) are configured when creating or editing a catalog page in your [software catalog](https://app.getport.io/organization/catalog). These filters pre-filter which entities appear when the page loads, improving performance and showing only relevant data.

Filters are especially useful when dealing with blueprints that have a large number of entities (such as Snyk vulnerabilities), where the request may time out without filtering.

<Tabs groupId="catalog-filters" queryString defaultValue="basic" values={[
{label: "Basic example", value: "basic"},
{label: "Advanced example", value: "advanced"}
]}>

<TabItem value="basic">

This example demonstrates how to filter a Snyk vulnerability catalog page, showing only `high` and `critical` severity vulnerabilities:

```json showLineNumbers
{
  "combinator": "and",
  "rules": [
    {
      "value": [
        "high",
        "critical"
      ],
      "property": "severity",
      "operator": "in"
    }
  ]
}
```

</TabItem>

<TabItem value="advanced">

This example demonstrates how to filter a service catalog page with multiple conditions, showing only production services owned by specific teams that were updated within a specific date range:

```json showLineNumbers
{
  "combinator": "and",
  "rules": [
    {
      "value": "production",
      "property": "environment",
      "operator": "="
    },
    {
      "value": [
        "platform_team",
        "developers_team"
      ],
      "property": "$team",
      "operator": "containsAny"
    },
    {
      "property": "last_push",
      "operator": "between",
      "value": {
        "from": "<START_DATE>",
        "to": "<END_DATE>"
      }
    }
  ]
}
```

</TabItem>

</Tabs>

## Entity pages

Filters for related entity tabs are configured when creating custom tabs on any [entity page](/customize-pages-dashboards-and-plugins/page/entity-page). Go to the **Related Entities** tab of the entity, click the `+` button, then under **Additional filters**, click the filters button to add your query. These filters control which related entities appear in the custom tab.

Additional filters are particularly useful for related entities tabs where the number of related entities is very large. Applying filters improves performance and makes the data more manageable.

<Tabs groupId="entity-filters" queryString defaultValue="basic" values={[
{label: "Basic example", value: "basic"},
{label: "Advanced example", value: "advanced"}
]}>

<TabItem value="basic">

This example demonstrates how to filter related pull requests for a repository entity, showing only PRs with an `open` status:

```json showLineNumbers
{
  "combinator": "and",
  "rules": [
    {
      "value": "open",
      "property": "status",
      "operator": "="
    }
  ]
}
```

</TabItem>

<TabItem value="advanced">

<!-- TODO: Test this example in your environment -->

This example demonstrates how to filter related alerts for a service entity with multiple conditions, showing only critical alerts that were created in the last 24 hours and are still unresolved:

```json showLineNumbers
{
  "combinator": "and",
  "rules": [
    {
      "property": "severity",
      "operator": "=",
      "value": "critical"
    },
    {
      "property": "status",
      "operator": "in",
      "value": [
        "open",
        "investigating",
        "identified"
      ]
    },
    {
      "property": "createdAt",
      "operator": "between",
      "value": {
        "preset": "last24Hours"
      }
    }
  ]
}
```

</TabItem>

</Tabs>

## Dashboard widgets

Widget-specific filters are configured in the widget creation/edit form for [dashboard widgets](/customize-pages-dashboards-and-plugins/dashboards/overview). These filters control which entities are included in calculations and visualizations for individual data widgets.

<Tabs groupId="widget-filters" queryString defaultValue="basic" values={[
{label: "Basic property filter", value: "basic"},
{label: "Filter by contextual data", value: "contextual"},
{label: "Filter by relation-path", value: "relation"}
]}>

<TabItem value="basic">

This example demonstrates how to filter overdue pull requests, showing only PRs with an `open` status that were created in the `past 90 days`:

```json showLineNumbers
{
  "combinator": "and",
  "rules": [
    {
      "value": "open",
      "property": "status",
      "operator": "="
    },
    {
      "property": "createdAt",
      "operator": "between",
      "value": {
        "preset": "last3Months"
      }
    }
  ]
}
```

</TabItem>

<TabItem value="contextual">

:::info JSON mode required
Contextual queries using the `context` field require JSON mode. You cannot configure these through the UI form.
:::

**Filter by logged-in user**

This example demonstrates how to filter entities owned by the logged-in user:

```json showLineNumbers
{
  "combinator": "and",
  "rules": [
    {
      "operator": "matchAny",
      "property": {
        "path": ["relationID_1"]
      },
      "value": {
        "context": "user",
        "property": "$identifier"
      }
    }
  ]
}
```

**Filter by user's teams**

This example demonstrates how to filter entities by the logged-in user's owning teams:

```json showLineNumbers
{
  "combinator": "and",
  "rules": [
    {
      "value": {
        "context": "user",
        "property": "$team"
      },
      "property": "$team",
      "operator": "containsAny"
    }
  ]
}
```

</TabItem>

<TabItem value="relation">

<!-- TODO: come back to this example and test it and all -->

This example demonstrates how to filter entities using relation paths to query related entities. It filters services that are related to a cluster in the `production` environment:

```json showLineNumbers
{
  "combinator": "and",
  "rules": [
    {
      "operator": "relatedTo",
      "blueprint": "cluster",
      "value": {
        "combinator": "and",
        "rules": [
          {
            "property": "environment",
            "operator": "=",
            "value": "production"
          }
        ]
      }
    }
  ]
}
```

</TabItem>

</Tabs>

## Blueprint read permissions

Blueprint read permissions can be configured with dynamic `policy` rules using search and query syntax. Configure these in the [data model](https://app.getport.io/settings/data-model) page by clicking on a blueprint and going to the **Permissions** tab.

The `policy` key allows you to create dynamic read access rules, granting users access to entities based on their properties, team membership, and contextual user data. This controls which entities users can see in catalog pages.

For detailed examples and information about blueprint permissions with search queries, see the [Policy tab](/build-your-software-catalog/set-catalog-rbac/set-catalog-rbac#read) in the catalog RBAC documentation.

## Aggregation properties

Configure filters when creating or editing an [aggregation property](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/properties/aggregation-property) in the [data model](https://app.getport.io/settings/data-model) page. The search and query filter is defined under the `query` section of the aggregation property.

This example demonstrates how to define an aggregation property to a `service` blueprint that calculates the number of open high-severity vulnerabilities for each service, filtering only vulnerabilities with `severity` set to `high` and `status` set to `open`:

```json showLineNumbers
{
  "aggregationProperties": {
    "numberOfOpenHighVulnerabilities": {
      "title": "Number of open high severity vulnerabilities",
      "target": "vulnerability",
      "calculationSpec": {
        "calculationBy": "entities",
        "func": "count"
      },
      "query": {
        "combinator": "and",
        "rules": [
          {
            "property": "severity",
            "operator": "=",
            "value": "high"
          },
          {
            "property": "status",
            "operator": "=",
            "value": "open"
          }
        ]
      }
    }
  }
}
```

## Scorecards

Configure filters when creating or editing a scorecard. [Filters](/scorecards/concepts-and-structure#filter-elements) determine which entities the rule evaluates, filtering out irrelevant entities and performing checks only on entities that pass the filtering.

:::info Scorecards use conditions
Scorecard filters use `conditions` instead of `rules`, but follow the same structure with `combinator`, `property`, `operator`, and `value`.
:::

This example demonstrates how to filter a scorecard to apply only to production services owned by specific teams. This ensures the quality check only runs on critical services:

```json showLineNumbers
"filter": {
  "combinator": "and",
  "conditions": [
    {
      "value": [
        "builder_team",
        "developers_team"
      ],
      "operator": "containsAny",
      "property": "$team"
    },
    {
      "value": "production",
      "operator": "=",
      "property": "environment"
    }
  ]
}
```

:::tip Supported operators
For a complete list of the available operators in scorecard filters, see the available operators section under the [rule elements](/scorecards/concepts-and-structure#rule-elements) documentation.
:::

## Self-service actions

Configure these options when creating or editing an action in the [self-service actions](https://app.getport.io/self-serve) page.

<Tabs groupId="action-filters" queryString defaultValue="conditions" values={[
{label: "Action conditions", value: "conditions"},
{label: "Entity input datasets", value: "datasets"},
{label: "Dynamic permissions", value: "permissions"}
]}>

<TabItem value="conditions">

Action conditions determine which entities an action appears on, ensuring actions are only available for relevant entities. Configure this in the **Basic Details** tab of the action form.

:::info DAY-2 and DELETE only
Action conditions are only available for DAY-2 and DELETE operations.
:::

This example demonstrates how to conditionally display an action based on entity properties. It shows the action only on entities where the `environment` property equals `production`:

```json showLineNumbers
{
  "type": "SEARCH",
  "rules": [
    {
      "operator": "=",
      "property": "environment",
      "value": "production"
    }
  ],
  "combinator": "and"
}
```

</TabItem>

<TabItem value="datasets">

Filter dropdown options in action forms to show only relevant entities based on properties, relations, or user context. 

To configure this, go to the **User Form** tab when setting up entity-type inputs, then expand the [advanced configuration](/actions-and-automations/create-self-service-experiences/setup-ui-for-action/advanced-form-configurations) section where you can define a dataset filter. This is particularly useful for filtering entity options based on the logged-in user or their teams.

This example demonstrates how to filter an entity input dropdown to show only environments owned by the logged-in user's teams. This ensures users can only select environments they have access to:

```json showLineNumbers
{
  "properties": {
    "environment": {
      "type": "string",
      "format": "entity",
      "blueprint": "environment",
      "dataset": {
        "combinator": "and",
        "rules": [
          {
            "property": "team_mirror", // Need to add a mirror property of the Owning team 
            "operator": "in",          // to the environment blueprint
            "value": {
              "jqQuery": ".user.team"
            }
          }
        ]
      }
    }
  }
}
```

</TabItem>

<TabItem value="permissions">

[Dynamic permissions](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/dynamic-permissions) control who can execute or approve actions based on entity properties and user context. When creating or editing an action, go to the **Permissions** tab to configure query-based permissions.

For examples of dynamic action permissions using search and query syntax, see the [examples section](/actions-and-automations/create-self-service-experiences/set-self-service-actions-rbac/dynamic-permissions#examples) of the Dynamic permissions page.

</TabItem>

</Tabs>

## API

You can use search and query syntax with the following API routes: [search entities](/api-reference/search-entities) and [search a blueprint's entities](/api-reference/search-a-blueprints-entities).

:::info United States region
The examples below use the EU region API.  
If you wish to use the US region API, replace `https://api.getport.io` with `https://api.us.getport.io`.
:::

The following examples provide a foundation to begin using the search route. Remember that you can always change the content of the `rules` array to the search query that fits your search.

<Tabs groupId="code-examples" queryString defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "Javascript", value: "javascript"},
{label: "cURL", value: "curl"}
]}>

<TabItem value="python">

```python showLineNumbers
# Dependencies to install:
# $ python -m pip install requests

import json
import requests

CLIENT_ID = "YOUR_CLIENT_ID"
CLIENT_SECRET = "YOUR_CLIENT_SECRET"

API_URL = "https://api.getport.io/v1"

credentials = {"clientId": CLIENT_ID, "clientSecret": CLIENT_SECRET}

token_response = requests.post(f"{API_URL}/auth/access_token", json=credentials)

access_token = f"Bearer {token_response.json()['accessToken']}"

# You can now use the value in access_token when making further requests

headers = {
    'Authorization': access_token
}

query = {
    "combinator": "or",
    "rules": [
        {
            "property": "$title",
            "operator": "=",
            "value": "admin-prod"
        },
        {
            "property": "$title",
            "operator": "=",
            "value": "admin-test"
        }
    ]
}

search_req = requests.post(f"{API_URL}/entities/search", headers=headers, json=query)

search_entities = search_req.json()['entities']

for entity in search_entities:
    print(json.dumps(entity))
```

</TabItem>

<TabItem value="javascript">

```javascript showLineNumbers
// Dependencies to install:
// $ npm install axios --save

const axios = require("axios").default;

const CLIENT_ID = "YOUR_CLIENT_ID";
const CLIENT_SECRET = "YOUR_CLIENT_SECRET";

const API_URL = "https://api.getport.io/v1";

(async () => {
  const tokenResp = await axios.post(`${API_URL}/auth/access_token`, {
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  });

  const accessToken = tokenResp.data.accessToken;

  // You can now use the value in accessToken when making further requests

  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const query = {
    combinator: "or",
    rules: [
      {
        property: "$title",
        operator: "=",
        value: "admin-prod",
      },
      {
        property: "$title",
        operator: "=",
        value: "admin-test",
      },
    ],
  };

  const response = await axios.post(
    `${API_URL}/entities/search`,
    query,
    config
  );

  console.log(response.data["entities"]);
})();
```

</TabItem>

<TabItem value="curl">

```bash showLineNumbers
#!/bin/bash

# Dependencies to install:
# For apt:
# $ sudo apt-get install jq
# For yum:
# $ sudo yum install jq

access_token=$(curl --location --request POST 'https://api.getport.io/v1/auth/access_token' \
--header 'Content-Type: application/json' \
--data-raw '{
    "clientId": "CLIENT_ID",
    "clientSecret": "CLIENT_SECRET"
}' | jq '.accessToken' | sed 's/"//g')

# The token will be available in the access_token variable

curl --location --request POST 'https://api.getport.io/v1/entities/search?attach_title_to_relation=true&exclude_calculated_properties=false' \
	--header "Authorization: Bearer $access_token" \
	--header 'Content-Type: application/json' \
	--data-raw '{
    "combinator": "or",
    "rules": [
        {
            "property": "$title",
            "operator": "=",
            "value": "admin-prod"
        },
        {
            "property": "$title",
            "operator": "=",
            "value": "admin-test"
        }
    ]
}'

```

</TabItem>

</Tabs>
