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

You can create, edit, or delete scorecards either from the catalog page or the Data model page.

<Tabs queryString="ui-method" defaultValue="catalog">

<TabItem value="catalog" label="From the catalog page">

Whether you create, edit, or delete a scorecard, follow the next steps, then proceed with the relevant section below.

1. Navigate to the [Software Catalog](https://app.getport.io/catalog) page.

2. Go to a Scorecard catalog page in your catalog section.  
   :::tip Creating a scorecards catalog page
   If you don't have a scorecards catalog page, you can create one. To learn more, refer to the catalog page [documentation](/customize-pages-dashboards-and-plugins/page/catalog-page).
   :::

**To create a new scorecard:**

1. Click the `+ Scorecard` button in the top right corner of the page.

    <img src="/img/scorecards/create-sorecard-in-catalog-page.png" border='1px' width='90%' style={{borderRadius:'8px'}} />

2. In the **Basic Details** tab, specify the scorecard's basic details:

    - `Title` - The scorecard's title.
    - `Identifier` - The scorecard's unique identifier (must be unique among all scorecards).
    - `Blueprint` - Select the blueprint you want to add the scorecard to.
    - `Filter` - Filter which entities the scorecard applies to.

3. In the **Rules** tab, define the scorecard's rules:

     - Add or remove [levels](/scorecards/concepts-and-structure#levels), as well as edit their names and colors. 
     - Add [rule elements](/scorecards/concepts-and-structure#rule-elements) to each level:
       - `Title` - The rule's title.
       - `Identifier` - The rule's identifier.
       - `Description` - The rule's description.
       - `Conditions` - The rule's [conditions](/scorecards/concepts-and-structure#conditions).

4. Click `Save` to create the scorecard.

**To edit an existing scorecard:**

1. Click on the `...` button in line that represents your scorecard in the table, then choose `Edit`.

    <img src="/img/scorecards/edit-scorecard-in-catalog-page.png" border='1px' width='90%' style={{borderRadius:'8px'}} />

2. Edit the scorecard.

3. Click `Save` to apply your changes.

**To delete a scorecard:**

:::danger Irreversible delete
A Scorecard cannot be restored after deletion!
:::

1. Click on the `...` button in line that represents your scorecard in the table, then choose `Delete`.

    <img src="/img/scorecards/delete-scorecard-in-catalog-page.png" border='1px' style={{borderRadius:'8px'}} />

2. Confirm the deletion in the pop-up window.

</TabItem>

<TabItem value="data-model" label="From the Data model page">

Whether you create, edit, or delete a scorecard, follow the next steps, then proceed with the relevant section below.

1. Go to the [Data model](https://app.getport.io/settings/data-model) page of your portal.

2. Expand the relevant blueprint, and click on the `Scorecards` tab.

**To create a new scorecard:**

1. Click on the `+ New scorecard` button.

    <img src="/img/scorecards/create-scorecard-datamodel-page.png" border='1px' width='50%' style={{borderRadius:'8px'}} />

2. In the **Basic Details** tab, specify the scorecard's basic details:

    - `Title` - The scorecard's title.
    - `Identifier` - The scorecard's unique identifier (must be unique among all scorecards).
    - `Blueprint` - This field will already be preselected and non-editable, set to the blueprint you expanded.
    - `Filter` - Filter which entities the scorecard applies to.

3. In the **Rules** tab, define the scorecard's rules:

     - Add or remove [levels](/scorecards/concepts-and-structure#levels), as well as edit their names. 
     - Add [rule elements](/scorecards/concepts-and-structure#rule-elements) to each level:
       - `Title` - The rule's title.
       - `Identifier` - The rule's identifier.
       - `Description` - The rule's description.
       - `Conditions` - The rule's [conditions](/scorecards/concepts-and-structure#conditions).

4. Click `Save` to create the scorecard.

**To edit an existing scorecard**

1. Click on the `...` button in line that represents your scorecard, then choose `Edit`.

    <img src="/img/scorecards/edit-scorecard-datamodel-page.png" border='1px' width='50%' style={{borderRadius:'8px'}} />

2. Make your changes to the scorecard.

3. Click `Save` to apply your changes.

**To delete a scorecard:**

:::danger Irreversible delete
A Scorecard cannot be restored after deletion!
:::

1. Click on the `...` button in line that represents your scorecard, then choose `Delete`.

    <img src="/img/scorecards/delete-scorecard-datamodel-page.png" border='1px' width='50%' style={{borderRadius:'8px'}} />

2. Confirm the deletion in the pop-up window.

</TabItem>

</Tabs>

**Scorecard JSON structure**

Instead of using the form, you can also create or edit scorecards in JSON format.  
Click on the `{...} Edit JSON` button in the top right corner of the scorecard creation or editing form. 

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

In order to create a scorecard from the API, you will make a `POST` request to the following URL: `https://api.port.io/v1/blueprints/{blueprint_identifier}/entities`.

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
        
  blueprint_name = '_scorecard'

  scorecard_definition = {
      'identifier': 'Ownership',
      'title': 'Ownership',
      'properties': {
          'blueprint': 'blueprint_identifier', # The blueprint the scorecard belongs to
          'rules': [
              {
                  'identifier': 'hasSlackChannel',
                  'title': 'Has Slack Channel',
                  'level': 'Silver',
                  'query': {
                      'combinator': 'and',
                      'conditions': [
                          {'operator': 'isNotEmpty', 'property': 'slackChannel'}
                      ],
                  },
              },
              {
                  'identifier': 'hasTeam',
                  'title': 'Has Team',
                  'level': 'Bronze',
                  'query': {
                      'combinator': 'and',
                      'conditions': [
                          {'operator': 'isNotEmpty', 'property': '$team'}
                      ],
                  },
              },
          ],
      }
  }

  headers = { 'Authorization': f'Bearer {access_token}'}

  response = requests.post(f'{API_URL}/blueprints/{blueprint_name}/entities', json=scorecard_definition, headers=headers,)

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

    const blueprintName = "_scorecard";

    const scorecard_definition =  {
            identifier: "Ownership",
            title: "Ownership",
            properties: {
              blueprint: "blueprint_identifier", // The blueprint the scorecard belongs to
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
            }
        };

    const config = {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    };

    const response = await axios.post(
        `${API_URL}/blueprints/${blueprintName}/entities`,
        scorecard_definition,
        config
    );
    ```
</details>

</TabItem>

</Tabs>

After creating the scorecards, you will see a new tab in the profile entity page of each of your blueprint's entities, showing the various scorecards levels.

For example, we can [create the entity below](/build-your-software-catalog/sync-data-to-catalog/sync-data-to-catalog.md#entities):

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

And then look at the [specific page](https://app.getport.io/MicroserviceEntity?identifier=cart-service&activeTab=3) of this entity, on the scorecards tab.

 <img src="/img/software-catalog/scorecard/tutorial/ScorecardsTab.png" width='100%' border='1px' />
 <br></br>
 <br></br>

We can see that the `hasSlackChannel` rule passed because we provided one to that entity, while the `hasTeam` failed because we didn't provide any team.

Therefore the level of the entity is `Bronze` because it passed all the rules in the `Bronze` level (hasSlackChannel).

___


**Update scorecards**

To update a scorecard you can use two different URLs:

1. Update a single Scorecard using the URL `https://api.port.io/v1/blueprints/{blueprint_identifier}/entities/{entity_identifier}`. The request body will be the full Scorecard + the wanted changed values
2. Make a PUT request to the URL `https://api.port.io/v1/blueprints/{blueprint_identifier}/entities/{entity_identifier}`. to multiple scorecards at once

The request body will include the existing body of the Scorecard, after the desired updates to the existing scorecard have been applied.

:::note New identifier on scorecard update 
When using the multiple update Scorecards `https://api.getport.io/v1/blueprints/{blueprint_identifier}/scorecards` PUT request, keep in mind that you will see a new `id` property. This is used via Port to identify the scorecard in order to be able to update its properties.
:::

___

**Delete scorecards**

:::danger Irreversible delete
A Scorecard cannot be restored after deletion!
:::

-   Make an HTTP PUT request and remove it from the array of the scorecards via the URL `https://api.getport.io/v1/blueprints/{blueprint_identifier}/scorecards`.
-   Make an HTTP DELETE request to the URL `https://api.port.io/v1/blueprints/{blueprint_identifier}/entities/{entity_identifier}` the `blueprint_identifier` is the identifier of the scorecard's blueprint, and the `entity_identifier` is the identifier of the scorecard we want to delete.

:::info Using scorecards API
Scorecards can be managed either with the entities API endpoints mentioned above, or by the dedicated **Scorecards API** endpoints: [create](/api-reference/create-a-scorecard), [update](/api-reference/change-scorecards), [delete](/api-reference/delete-a-scorecard), etc. Note that if you are extending the scorecards data model you **should** use the entities endpoints.
:::


</TabItem>

<TabItem value="Terraform">

**Create scorecards**

In order to create a scorecard from the [Terraform provider](/build-your-software-catalog/custom-integration/iac/terraform/) , you will need to use the `port_entity` resource.

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

___

**Update scorecards**

In order to update a scorecard with the Terraform provider, you will need to run the `terraform apply -target=port_scorecard.<resourceId>` command with the updated scorecard resource.

___

**Delete Scorecards**

:::danger Irreversible delete
A Scorecard cannot be restored after deletion!
:::

In order to delete a scorecard using the Terraform provider, use the `terraform destroy -target=port_scorecard.<resourceId>` command with the scorecard resource you want to delete. (remember that it is also possible to remove the definition of the `port_scorecard` resource from the `.tf` file and run `terraform apply`)

</TabItem>

</Tabs>

## Next steps

- Explore [scorecard use-cases](/scorecards/examples/scorecard-use-cases) and [automation use-cases](/scorecards/examples/automation-use-cases) for examples you can implement in your environment.
- [Dive into advanced operations on Scorecards with our API ➡️ ](/api-reference/port-api)