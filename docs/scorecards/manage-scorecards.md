---
sidebar_position: 3
title: Manage scorecards
sidebar_label: Manage scorecards
---
import PortTooltip from "/src/components/tooltip/tooltip.jsx"

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Manage scorecards

## Define scorecards

Port offers a variety of ways to create, edit and delete scorecards:

<Tabs queryString="scorecards" defaultValue="UI">

<TabItem value="UI">

To create a scorecard from the UI:

1. Go to the [Data model](https://app.getport.io/settings/data-model) page of your portal.

2. Expand the relevant blueprint, and click on the `Scorecards` tab.

3. Click on the `+ New scorecard` button.

4. In the **Basic Details** tab, specify the scorecard's basic details:

    - `Title` - The scorecard's title.
    - `Identifier` - The scorecard's identifier.
    - `Blueprint` - Set to the blueprint you selected.
    - `Filter` - Filter which entities the scorecard applies to.

5. In the **Rules** tab, define the scorecard's rules:

     - Add or remove [levels](/scorecards/concepts-and-structure#levels), as well as edit their names. 
     - Add [rule elements](/scorecards/concepts-and-structure#rule-elements) to each level:
       - `Title` - The rule's title.
       - `Identifier` - The rule's identifier.
       - `Description` - The rule's description.
       - `Conditions` - The rule's [conditions](/scorecards/concepts-and-structure#conditions).

6. Click `Save` to create the scorecard.

**Scorecard JSON structure**

Instead of using the form, you can also create or edit scorecards in JSON format.  
Click on the `{...} Edit JSON` button in the top right corner of the scorecard creation form. 

Below is an example of a scorecard in JSON format:

<details>
<summary><b>Ownership scorecard example (click to expand)</b></summary>

  ```json showLineNumbers
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
  ```
</details>

</TabItem>

<TabItem value="API">

:::note Access token required
Remember that an access token is necessary in order to make API requests. If you need to generate a new token, refer to [Getting an API token](../build-your-software-catalog/custom-integration/api/api.md#get-api-token).
:::

**Create scorecards**

In order to create a scorecard from the API, you will make a PUT request to the following URL: `https://api.getport.io/v1/blueprints/{blueprint_identifier}/scorecards`.

Here are some request examples that will create the Scorecard of Ownership on the `microservice` Blueprint:

<Tabs groupId="code-examples" defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "Javascript", value: "javascript"}
]}>

<TabItem value="python">

<details>
<summary><b>Create scorecards python example (click to expand)</b></summary>

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
</details>

</TabItem>

<TabItem value="javascript">

<details>
<summary><b>Create scorecards javaScript example (click to expand)</b></summary>

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
</details>

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

**Update scorecards**

To update a scorecard you can use 2 different URLs:

1. Update a single Scorecard using the URL `https://api.getport.io/v1/blueprints/{blueprint_identifier}/scorecards/{scorecard_identifier}`. The request body will be the full Scorecard + the wanted changed values
2. Make a PUT request to the URL `https://api.getport.io/v1/blueprints/{blueprint_identifier}/scorecards`. to multiple scorecards at once

The request body will include the existing body of the Scorecard, after the desired updates to the existing Scorecard have been applied.

**Delete scorecards**

:::danger
A Scorecard cannot be restored after deletion!
:::

-   Make an HTTP PUT request and remove it from the array of the scorecards via the URL `https://api.getport.io/v1/blueprints/{blueprint_identifier}/scorecards`
-   Make an HTTP DELETE request to the URL `https://api.getport.io/v1/blueprints/{blueprint_identifier}/scorecards/{scorecard_identifier}` the `scorecard_identifier` is the identifier of the scorecard we want to delete

:::note
When using the multiple update Scorecards `https://api.getport.io/v1/blueprints/{blueprint_identifier}/scorecards` PUT request, keep in mind that you will see a new `id` property. This is used via Port to identify the Scorecard in order to be able to update its properties
:::

</TabItem>

<TabItem value="Terraform">

**Create scorecards**

In order to create a scorecard from the [Terraform provider](../../build-your-software-catalog/custom-integration/iac/terraform/) , you will need to use the `port_scorecard` resource.

Here is an example of how to create an Ownership scorecard with the Terraform provider:

<details>
<summary><b>Terraform create example (click to expand)</b></summary>

    ```hcl showLineNumbers
    resource "port_scorecard" "ownership" {
      blueprint = "microservice"
      identifier = "Ownership"
      title = "Ownership"
      rules = [
        {
          identifier = "hasSlackChannel"
          title = "Has Slack Channel"
          level = "Silver"
          query = {
            combinator = "and"
            conditions = [
              jsonencode({
                operator = "isNotEmpty"
                property = "slackChannel"
              })
            ]
          }
        },
        {
          identifier = "hasTeam"
          title = "Has Team"
          level = "Bronze"
          query = {
            combinator = "and"
            conditions = [
              jsonencode({
                operator = "isNotEmpty"
                property = "$team"
              })
            ]
          }
        }
      ]
    }
    ```
</details>

**Update scorecards**

In order to update a scorecard with the Terraform provider, you will need to run the `terraform apply -target=port_scorecard.<resourceId>` command with the updated scorecard resource.

**Delete Scorecards**

:::danger
A Scorecard cannot be restored after deletion!
:::

In order to delete a scorecard using the Terraform provider, use the `terraform destroy -target=port_scorecard.<resourceId>` command with the scorecard resource you want to delete. (remember that it is also possible to remove the definition of the `port_scorecard` resource from the `.tf` file and run `terraform apply`)

</TabItem>

</Tabs>

## Next steps

[Dive into advanced operations on Scorecards with our API ➡️ ](/api-reference/port-api)