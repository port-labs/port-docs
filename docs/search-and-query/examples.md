---
sidebar_position: 3
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Examples

This page provides practical examples of using search and query syntax across different areas of Port.

## Catalog pages

You can find these options when creating or editing a catalog page in your [software catalog](https://app.getport.io/organization/catalog).

Search & query can be used in the following places:

**Initial filters for catalog pages** - Pre-filter which entities appear when the catalog page loads, improving performance and showing only relevant data.

<!-- TODO: Add example -->

**Initial filters for tables** - Limit which entities are displayed in table widgets, reducing load times and focusing on specific data subsets.

<!-- TODO: Add example -->

## Entity pages

You can add filters when creating custom related entity tabs on any entity page. Click the `+` button above the related entities table to add a new tab.

Search & query can be used in the following places:

**Filters for related entity tabs** - Filter which related entities appear in custom tabs, showing only entities that meet specific criteria.

<!-- TODO: Add example -->

## Dashboard widgets

You can find these filter options when creating or editing widgets in any dashboard. Dashboard-level filters are accessible at the top of the dashboard page, while widget-specific filters are configured in the widget creation/edit form.

Search & query can be used in the following places:

**Dashboard-level filters** - Apply filters across all supported widgets in a dashboard simultaneously, providing a consistent view of filtered data.

<!-- TODO: Add example -->

**Widget-specific filters** - Filter data in individual widgets like number charts, pie charts, and tables, controlling which entities are included in calculations and visualizations.

<!-- TODO: Add example -->

## Self-service actions

You can configure these options in the [self-service actions](https://app.getport.io/self-serve) page when creating or editing an action. Conditions are found in the **Trigger** tab, datasets are in the **User Form** tab when configuring entity inputs, and dynamic permissions are in the **Permissions** section.

Search & query can be used in the following places:

**Action conditions** - Determine which entities an action appears on, ensuring actions are only available for relevant entities.

<!-- TODO: Add example -->

**Entity input datasets** - Filter dropdown options in action forms, showing only relevant entities based on properties, relations, or user context.

<!-- TODO: Add example -->

**Dynamic permissions** - Dynamically control who can execute or approve actions based on entity properties and user context.

<!-- TODO: Add example -->

## Automations

You can configure automation conditions in the [automations page](https://app.getport.io/settings/automations) when creating or editing an automation. The conditions field is found in the **Trigger** tab.

Search & query can be used in the following places:

**Trigger conditions** - Filter which entities trigger an automation, ensuring automations only run for entities that meet specific criteria.

<!-- TODO: Add example -->

## RBAC

You can configure these permission policies in the [data model](https://app.getport.io/settings/data-model) page. For blueprint permissions, click on a blueprint and go to the **Permissions** tab. For action permissions, go to the action settings and navigate to the **Permissions** tab.

Search & query can be used in the following places:

**Blueprint read permissions** - Create dynamic read access rules, granting users access to entities based on their properties and team membership.

<!-- TODO: Add example -->

**Action permissions** - Define complex execution and approval logic for actions, controlling who can perform actions based on entity and user properties.

<!-- TODO: Add example -->

## Scorecards

You can configure scorecard rule filters in the [scorecards page](https://app.getport.io/settings/scorecards) when creating or editing a scorecard rule. The filter field appears in the rule configuration form.

Search & query can be used in the following places:

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
