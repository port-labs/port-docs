---
sidebar_position: 3
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Examples

This page provides practical examples of using search and query syntax across different areas of Port.

## Catalog pages

Initial filters for catalog pages are configured when creating or editing a catalog page in your [software catalog](https://app.getport.io/organization/catalog). These filters pre-filter which entities appear when the page loads, improving performance and showing only relevant data.

Filters are especially useful when dealing with blueprints that have a large number of entities (such as Snyk vulnerabilities), where the request may time out without filtering.

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

## Entity pages

Filters for related entity tabs are configured when creating custom tabs on any entity page. Go to the **Related Entities** tab of the entity, click the `+` button, then under **Additional filters**, click the filters button to add your query. These filters control which related entities appear in the custom tab.

Additional filters are particularly useful for related entities tabs where the number of related entities is very large. Applying filters improves performance and makes the data more manageable.

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

## Dashboard widgets

Widget-specific filters are configured in the widget creation/edit form. These filters control which entities are included in calculations and visualizations for individual data widgets.

<Tabs groupId="widget-filters" defaultValue="basic" values={[
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

## Self-service actions

Configure these options when creating or editing an action in the [self-service actions](https://app.getport.io/self-serve) page.

**Action conditions** - Determine which entities an action appears on, ensuring actions are only available for relevant entities. Configure this in the **Basic Details** tab of the action form. Note: Only available for DAY-2 and DELETE operations.

<!-- TODO: Add example -->

**Entity input datasets** - Filter dropdown options in action forms, showing only relevant entities based on properties, relations, or user context.

Configure this in the **User Form** tab when setting up entity-type inputs. This is useful for filtering entity options based on the logged-in user or their teams.

<!-- TODO: Add example - filter entity input by logged in user or user's teams -->

**Dynamic permissions** - Dynamically control who can execute or approve actions based on entity properties and user context.

After creating an action, edit it and click **Edit JSON** → **Permissions** tab to configure query-based permissions. This allows you to create complex permission rules using search queries combined with the action's blueprint permissions configuration.

:::tip Understanding permissions policies
The permissions policy system can be complex. The `policy` object works together with the `roles`, `users`, and `teams` fields to determine final access. When a `policy` is defined, the roles/users/teams control **visibility**, while the policy controls **execution/approval** permissions.
:::

<!-- TODO: Add example - permissions policy with search queries explaining how it works with other permission factors -->

## Automations

You can configure automation conditions in the [automations page](https://app.getport.io/settings/automations) when creating or editing an automation. The conditions field is found in the **Trigger** tab.

**Trigger conditions** - Filter which entities trigger an automation, ensuring automations only run for entities that meet specific criteria.

<!-- TODO: Add example -->

## RBAC

You can configure these permission policies in the [data model](https://app.getport.io/settings/data-model) page. For blueprint permissions, click on a blueprint and go to the **Permissions** tab. For action permissions, go to the action settings and navigate to the **Permissions** tab.

**Blueprint read permissions** - Create dynamic read access rules, granting users access to entities based on their properties and team membership.

<!-- TODO: Add example -->

**Action permissions** - Define complex execution and approval logic for actions, controlling who can perform actions based on entity and user properties.

<!-- TODO: Add example -->

## Scorecards

You can configure scorecard rule filters in the [scorecards page](https://app.getport.io/settings/scorecards) when creating or editing a scorecard rule. The filter field appears in the rule configuration form.

**Scorecard rule filters** - Determine which entities a scorecard rule evaluates, applying quality checks only to relevant entities.

<!-- TODO: Add example -->

## API

You can use search and query syntax with the following API routes: [search entities](/api-reference/search-entities) and [search a blueprint's entities](/api-reference/search-a-blueprints-entities).

:::info United States region
The examples below use the EU region API.  
If you wish to use the US region API, replace `https://api.getport.io` with `https://api.us.getport.io`.
:::

The following examples provide a foundation to begin using the search route. Remember that you can always change the content of the `rules` array to the search query that fits your search.

<Tabs groupId="code-examples" defaultValue="python" values={[
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

## Limitations and operator availability

Different areas of Port may have specific limitations or operator restrictions when using search & query syntax. This section outlines any unique constraints for each usage location.

<!-- TODO: Add section documenting limitations (available operators, restrictions, etc) unique to different areas where search & query can be used -->
