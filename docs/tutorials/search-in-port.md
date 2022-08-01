---
sidebar_position: 4
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Search In Port

The Port API comes with a built-in search route that allows you to quickly and easily find what you're looking for in the Service Catalog.

Using the search route, you can search for Entities using various filters and rules.

## Search basics

Search in Port is performed by writing simple querying rules which can be combined together to construct a more complex and precise query.

The base search route is `https://api.getport.io/entities/search`, it receives `HTTP POST` requests.

## Search request

A search request defines the logical relation between the different search rules, and contains a list search rules used to match and filter entities.

Each search request is represented by a **JSON object**, as shown in the following section:

```json showLineNumbers
{
    "combinator": "and",
    "rules": [
        {
            "property": "$blueprint",
            "operator": "=",
            "value": "Microservice"
        },
        {
            "property": "$identifier",
            "operator": "contains",
            "value": "admin"
        }
    ]
}
```

```json showLineNumbers
{
    "combinator": "or",
    "rules": [
        {
            "property": "environment",
            "operator": "=",
            "value": "production"
        },
        {
            "property": "environment",
            "operator": "=",
            "value": "staging"
        }
    ]
}
```


---

### Search request structure table

| Field | Description 
|---|---|
| `combinator` | Defines whether the query performs a logical `and` or an `or` between the different conditions 
| `rules` | An array of search rules to filter results with 

## Search rules

A search rule is a small filtering unit, used to control the output 

Here is an example search rule:

```json showLineNumbers
{
    "property": "$blueprint",
    "operator": "=",
    "value": "Microservice"
}
```
---

### Search rule structure table

| Field | Description 
|---|---|
| `operator` | The search operator to use when evaluating this rule, see a list of available operators below 
| `property` | The property to filter according to its value, can be an internal property such as `$identifier` or a standard property such as `slack_channel` 
| `value` | The value to filter by 

## Search operators

Search currently supports the following operators:

| Operator | Description 
|---|---|
| `=` | Equality operator
| `!=` | Inequality operator
| `>`,`>=`,`<`,`<=` | Numeric comparison operators
| `between` | Date range matching
| `contains` | String pattern matching
| `relatedTo` | Returns entities that have a relation with our rule target 
| `dependedOn` | Returns entities that the rule target depends on 

## Operator examples

Here are examples for each available search rule operator:

### `=` operator

The following rule will return entities whose identifier is `port-api`:

```json showLineNumbers
{
    "operator": "=",
    "property": "$identifier",
    "value": "port-api"
}
```

:::info Available properties
We can search over a variety of properties:

- "meta-properties" such as `$identifier`, `$title`, `$createdAt` and more
- user-defined properties that appear under the `properties` key in the `blueprint` definition
:::

### `!=` operator

The following rule will return entities whose identifier **is not** `port-api`:

```json showLineNumbers
{
    "operator": "!=",
    "property": "$identifier",
    "value": "port-api"
}
```

### `>`,`>=`,`<`,`<=` operators

The following rule will return entities whose version value is less than `5`:

```json showLineNumbers
{
    "operator": "<",
    "property": "version",
    "value": 5
}
```

### `between` operator

The following rule will return entities which were created in the last week:

```json showLineNumbers
{
    "operator": "between",
    "property": "$createdAt",
    "value": {
        "preset": "lastWeek"
    }
}
```

**Available Presets:**

- tomorrow
- today
- yesterday
- lastWeek
- lastMonth

The `between` operator also supports standard date ranges:

```json showLineNumbers
{
    "combinator": "and",
    "rules": [
        {
            "operator": "between",
            "property": "$createdAt",
            "value": {
                "from": "2022-07-26T16:38:06.839Z",
                "to": "2022-07-29T17:00:28.006Z"
            }
        }
    ]
}
```

### `contains` operator

The following rule will return entities whose environment property contains the word `prod`:

```json showLineNumbers
{
    "operator": "contains",
    "property": "environment",
    "value": "prod"
}
```

### `relatedTo` operator

The following rule will return all entities that have a relation graph with `port-api` entity:

```json showLineNumbers
{
    "operator": "relatedTo",
    "value": "port-api"
}
```

:::info entity page and search
The output received from the `relatedTo` operator without any other rule added to the search, is the same output you will receive when viewing the [entity page](../platform-overview/port-components/page.md#entity-page) of the entity you specified in the `value` field
:::

### `dependedOn` operator

## Search route query parameters

The search route also supports several query parameters which affect the returned output:

| Parameter | Description | Available values | Default value
|---|---|---|---|
| `attach_title_to_identifier` | Only relevant when not attaching all properties to identifier recursively <br></br><br></br> `true`: Both the identifier and the title of the related entity will appear under the relation key <br></br><br></br> `false`: Only the identifier of the related entity will appear under the relation key  | `true`/`false` | `false`
| `exclude_mirror_properties` | Should [mirror properties](../platform-overview/port-components/blueprint.md#mirror-properties) be returned with the result | `true`/`false` | `false`
| `attach_all_properties_to_identifier_recurse` | `true`: related entities are returned in full under relation key <br></br><br></br> `false`: only the related entity's `identifier` will appear under the relation key | `true`/`false` | `false`

### `attach_title_to_identifier` example

Here is a search response with `attach_title_to_identifier=true` and `attach_all_properties_to_identifier_recurse=false`:

```json showLineNumbers
{
    "ok": true,
    "matchingBlueprints": [
        "Region",
        "deployment",
        "vm",
        "microservice",
        "k8sCluster",
        "permission",
        "RunningService"
    ],
    "entities": [
        {
            "identifier": "e_vb9EPyW1zOamcbT1",
            "title": "cart-deployment",
            "blueprint": "deployment",
            "team": "Team BE",
            "properties": {
                "version": "1.4",
                "user": "yonatan",
                "status": "failed",
                "github-action-url": "https://a.com",
                "RunningService": {
                    "identifier": "e_47MwTvQj03MpVyBx",
                    "title": "admin-test"
                },
                "Region": "AWS"
            },
            "createdAt": "2022-07-27T17:11:04.344Z",
            "createdBy": "auth0|6278b02000955c006f9132d3",
            "updatedAt": "2022-07-27T17:11:04.344Z",
            "updatedBy": "auth0|6278b02000955c006f9132d3"
        }
    ]
}
```

And here is the same search response with `attach_title_to_identifier=false` and `attach_all_properties_to_identifier_recurse=false`:

```json showLineNumbers
{
    "ok": true,
    "matchingBlueprints": [
        "Region",
        "deployment",
        "vm",
        "microservice",
        "k8sCluster",
        "permission",
        "RunningService"
    ],
    "entities": [
        {
            "identifier": "e_vb9EPyW1zOamcbT1",
            "title": "cart-deployment",
            "blueprint": "deployment",
            "team": "Team BE",
            "properties": {
                "version": "1.4",
                "user": "yonatan",
                "status": "failed",
                "github-action-url": "https://a.com",
                "RunningService": "e_47MwTvQj03MpVyBx",
                "Region": "AWS"
            },
            "createdAt": "2022-07-27T17:11:04.344Z",
            "createdBy": "auth0|6278b02000955c006f9132d3",
            "updatedAt": "2022-07-27T17:11:04.344Z",
            "updatedBy": "auth0|6278b02000955c006f9132d3"
        }
    ]
}
```

### `attach_all_properties_to_identifier_recurse` examples

Here is a search response with `attach_all_properties_to_identifier_recurse=true`:

:::info important details
Notice how the `microservice` and `k8sCluster` in the response are complete entity bodies, these are the entities related to our queried `cart-deployment`
:::

```json showLineNumbers
{
    "ok": true,
    "matchingBlueprints": [
        "Region",
        "deployment",
        "vm",
        "microservice",
        "k8sCluster",
        "permission",
        "RunningService"
    ],
    "entities": [
        {
            "identifier": "e_vb9EPyW1zOamcbT1",
            "title": "cart-deployment",
            "blueprint": "deployment",
            "team": "Team BE",
            "properties": {
                "version": "1.4",
                "user": "yonatan",
                "status": "failed",
                "github-action-url": "https://a.com",
                "RunningService": {
                    "identifier": "e_47MwTvQj03MpVyBx",
                    "title": "admin-test",
                    "blueprint": "RunningService",
                    "team": "Team BE",
                    "properties": {
                        "version": "1.2",
                        "status": "healthy",
                        "microservice": {
                            "identifier": "e_0v2AfOlozuPkCNEJ",
                            "title": "checkout",
                            "blueprint": "microservice",
                            "properties": {
                                "repo-link": null,
                                "health-status": null,
                                "apps_chart": "http://google.com",
                                "argocd_app": "http://google.com",
                                "pr_url": [
                                    1,
                                    2,
                                    3,
                                    4
                                ],
                                "env": "Production",
                                "health_status": null,
                                "sync_status": null,
                                "namespace": null,
                                "type": "Platformjs",
                                "values_files_list": null,
                                "links": null,
                                "kibana": "http://google.com",
                                "grafana": null
                            },
                            "createdAt": "2022-07-27T16:56:54.525Z",
                            "createdBy": "auth0|6278b02000955c006f9132d3",
                            "updatedAt": "2022-07-27T16:56:54.525Z",
                            "updatedBy": "auth0|6278b02000955c006f9132d3"
                        },
                        "k8sCluster": {
                            "identifier": "morp",
                            "title": "morp",
                            "blueprint": "k8sCluster",
                            "properties": {
                                "version": 2.1,
                                "type": "EKS",
                                "dasboard": "http://google.com",
                                "Region": {
                                    "identifier": "prod-2-use1",
                                    "title": "prod-use1",
                                    "blueprint": "Region",
                                    "properties": {
                                        "cloud": "AWS"
                                    },
                                    "createdAt": "2022-07-27T16:38:06.839Z",
                                    "createdBy": "auth0|6278b02000955c006f9132d3",
                                    "updatedAt": "2022-07-27T16:59:23.195Z",
                                    "updatedBy": "auth0|6278b02000955c006f9132d3"
                                }
                            },
                            "createdAt": "2022-07-27T16:46:34.248Z",
                            "createdBy": "h2Mf13aRSCYQCUPIcqufoP4XRLwAt8Od@clients",
                            "updatedAt": "2022-07-27T17:17:24.224Z",
                            "updatedBy": "h2Mf13aRSCYQCUPIcqufoP4XRLwAt8Od@clients"
                        }
                    },
                    "createdAt": "2022-07-27T17:07:46.865Z",
                    "createdBy": "auth0|6278b02000955c006f9132d3",
                    "updatedAt": "2022-07-27T17:07:46.865Z",
                    "updatedBy": "auth0|6278b02000955c006f9132d3"
                },
                "Region": "AWS"
            },
            "createdAt": "2022-07-27T17:11:04.344Z",
            "createdBy": "auth0|6278b02000955c006f9132d3",
            "updatedAt": "2022-07-27T17:11:04.344Z",
            "updatedBy": "auth0|6278b02000955c006f9132d3"
        }
    ]
}
```

## Code examples

The following examples provide a base to begin using the search route, remember that you can always switch the content of the `rules` array to the search query that fits your search.

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

API_URL = "https://api.getport.io/v0.1"

credentials = {"client_id": CLIENT_ID, "client_secret": CLIENT_SECRET}

token_response = requests.get(f"{API_URL}/auth/access_token", params=credentials)

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

const axios = require('axios').default;

const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';

const API_URL = 'https://api.getport.io/v0.1';

(async () => {
	const tokenResp = await axios.get(`${API_URL}/auth/access_token`, {
		params: {
			client_id: CLIENT_ID,
			client_secret: CLIENT_SECRET,
		},
	});

	const accessToken = tokenResp.data.accessToken;

	// You can now use the value in accessToken when making further requests

	const config = {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	};

	const query = {
		combinator: 'or',
		rules: [
			{
				property: '$title',
				operator: '=',
				value: 'admin-prod',
			},
			{
				property: '$title',
				operator: '=',
				value: 'admin-test',
			},
		],
	};

	const response = await axios.post(`${API_URL}/entities/search`, query, config);

	console.log(response.data['entities']);
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

access_token=$(curl --location --request GET "https://api.getport.io/v0.1/auth/access_token?client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET" | jq '.accessToken' | sed 's/"//g')

# The token will be available in the access_token variable

curl --location --request POST 'https://api.getport.io/v0.1/entities/search?attach_title_to_identifier=true&exclude_mirror_properties=false&attach_all_properties_to_identifier_recurse=true' \
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