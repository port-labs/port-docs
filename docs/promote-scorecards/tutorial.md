---
sidebar_position: 1
sidebar_label: Tutorial
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Scorecards tutorial

## Create Scorecards

Scorecards can be created by two methods:

- UI
- API

<!-- TODO: fix this back to some actual blueprint -->

:::info
A Scorecard is created upon blueprint. So if you haven't created the `microservice` blueprint in the [Quickstart](../quickstart.md#service-blueprint), please make sure to do so to follow along.
:::

### From the UI

To create a scorecard from the UI, go to the DevPortal Builder page and click the 3 dots icon on the `microservice` Blueprint.

An editor window will open with the current JSON array of the defined Scorecards. Since there is no Scorecard configured on the Blueprint at the moment, the `scorecard` arrays will be empty. Paste the following content inside the editor to create the scorecards of this example:

```json showLineNumbers
[
  {
    "identifier": "Ownership",
    "title": "Ownership",
    "rules": [
      {
        "identifier": "hasSlackChannel",
        "title": "Has Slack Channel",
        "level": "Silver",
        "query": {
          "combinator": "and",
          "conditions": [
            {
              "operator": "isNotEmpty",
              "property": "slackChannel"
            }
          ]
        }
      },
      {
        "identifier": "hasTeam",
        "title": "Has Team",
        "level": "Bronze",
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

### From the API

:::note
Remember that an access token is necessary in order to make API requests. If you need to generate a new token, refer to [Getting an API token](../build-your-software-catalog/sync-data-to-catalog/api/api.md#get-api-token).
:::

In order to create a scorecard from the API, you will make a PUT request to the URL `https://api.getport.io/v1/{blueprint_identifier}/scorecards`.

Here are some request examples that will create the Scorecard of Ownership on the `microservice` Blueprint:

<Tabs groupId="code-examples" defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "Javascript", value: "javascript"}
]}>

<TabItem value="python">

```python showLineNumbers
# Dependencies to install:
# $ python -m pip install requests

# the access_token variable should already have the token from previous examples

import requests

API_URL = 'https://api.getport.io/v1'

blueprint_name = 'microservice'

scorecards = [
  {
    'identifier': 'Ownership',
    'title': 'Ownership',
    'rules': [
      {
        'identifier': 'hasSlackChannel',
        'title': 'Has Slack Channel',
        'level': 'Silver',
        'query': {
          'combinator': 'and',
          'conditions': [{'operator': 'isNotEmpty', 'property': 'slackChannel'}]
        }
      },
      {
        'identifier': 'hasTeam',
        'title': 'Has Team',
        'level': 'Bronze',
        'query': {
          'combinator': 'and',
          'conditions': [{'operator': 'isNotEmpty', 'property': '$team'}]
        }
      }
    ]
  }
]

headers = {
    'Authorization': f'Bearer {access_token}'
}

response = requests.put(f'{API_URL}/blueprints/{blueprint_name}/scorecards', json=scorecards, headers=headers)

```

</TabItem>

<TabItem value="javascript">

```javascript showLineNumbers
// Dependencies to install:
// $ npm install axios --save

// the accessToken variable should already have the token from previous examples

const axios = require("axios").default;

const API_URL = "https://api.getport.io/v1";

const blueprintName = "microservice";

const scorecards = [
  {
    identifier: "Ownership",
    title: "Ownership",
    rules: [
      {
        identifier: "hasSlackChannel",
        title: "Has Slack Channel",
        level: "Bronze",
        query: {
          combinator: "and",
          conditions: [
            {
              operator: "isNotEmpty",
              property: "slackChannel",
            },
          ],
        },
      },
      {
        identifier: "hasTeam",
        title: "Has Team",
        level: "Silver",
        query: {
          combinator: "and",
          conditions: [
            {
              operator: "isNotEmpty",
              property: "$team",
            },
          ],
        },
      },
    ],
  },
];

const config = {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
};

const response = await axios.put(
  `${API_URL}/blueprints/${blueprintName}/scorecards`,
  scorecards,
  config
);
```

</TabItem>

</Tabs>

After creating the Scorecards, you will see a new tab in the profile Entity page of each of your Blueprint's Entities, showing the various scorecards levels.

For example, we can [create the entity below](../build-your-software-catalog/sync-data-to-catalog/sync-data-to-catalog.md#creating-entities)

```json showLineNumbers
{
  "identifier": "cart-service",
  "title": "Cart Service",
  "icon": "Microservice",
  "properties": {
    "slackChannel": "https://slack.com",
    "repoUrl": "https://github.com"
  },
  "relations": {}
}
```

And then look at the [specific page](https://app.getport.io/MicroserviceEntity?identifier=cart-service&activeTab=3) of this entity, on the scorecards tab

![Developer Portal Scorecards Tab](../../static/img/software-catalog/scorecard/tutorial/ScorecardsTab.png)

We can see that the `hasSlackChannel` rule passed because we provided one to that entity, while the `hasTeam` failed because we didn't provide any team.

Therefore the level of the entity is `Bronze` because it passed all the rules in the `Bronze` level (hasSlackChannel)

## Update Scorecards

To update Scorecards, we can use the same URL and payload we have used before with the `id` that the backend generated for that scorecard.

And just as we have shown earlier in the tutorial, you can update a Scorecard from the UI or from the API.

### From the UI

In order to update a Scorecard from the UI, go to the DevPortal Builder page, click on the 3 dots icon and select Scorecards.

An editor window will open with the current scorecards of the Blueprint. In order to update the Scorecard, change the wanted scorecard within the scorecards array, click on `save` at the bottom right corner of the editor and view the updated Scorecards.

### From the API

To update a scorecard you can use 2 different URLs:

1. Update a single Scorecard using the URL `https://api.getport.io/v1/{blueprint_identifier}/scorecards/{scorecard_identifier}`. The request body will be the full Scorecard + the wanted changed values
2. Make a PUT request to the URL `https://api.getport.io/v1/{blueprint_identifier}/scorecards`. to multiple scorecards at once

The request body will include the existing body of the Scorecard, after the desired updates to the existing Scorecard have been applied.

## Delete Scorecards

:::danger
A Scorecard cannot be restored after deletion!
:::

There are two ways to delete a Scorecard:

- Make an HTTP PUT request and remove it from the array of the scorecards via the URL `https://api.getport.io/v1/{blueprint_identifier}/scorecards`
- Make an HTTP DELETE request to the URL `https://api.getport.io/v1/blueprints/{blueprint_identifier}/scorecards/{scorecard_identifier}` the `scorecard_identifier` is the identifier of the scorecard we want to delete

:::note
When using the multiple update Scorecards `https://api.getport.io/v1/{blueprint_identifier}/scorecards` PUT request, keep in mind that you will see a new `id` property. This is used via Port to identify the Scorecard in order to be able to update its properties
:::
