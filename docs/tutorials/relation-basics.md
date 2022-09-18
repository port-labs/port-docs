---
sidebar_position: 2
sidebar_label: Relation Basics
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Relation Basics

## Creating relations

Relations can be created using two methods:

- UI; or
- API.

:::info
A Relation is created between 2 Blueprints. So if you haven't created the `microservice` and `package` Blueprints, in [Creating a Blueprint](./blueprint-basics.md#creating-a-blueprint) and [Blueprint basics Next Steps](./blueprint-basics.md#next-steps), please make sure to do so in order to follow along.
:::

### From the UI

In order to create a relation from the UI, go to the Blueprints graph and click the pencil icon on the Blueprint that will be the `source` Blueprint of the Relation (for example, in the `package-microservice` Relation, `package` is the `source` Blueprint):

![Blueprints page with Create Relation Marked](../../static/img/welcome/quickstart/blueprintsPageWithMicroservicePackageAndEditPackageMarked.png)

An editor window will open with the current schema of the Blueprint. Because there is no Relation configured on the Blueprint right now, the `relations` key in the JSON will be empty. Paste in the following content in the `relations` key to create the `package-microservice` Relation:

```json showLineNumbers
"relations": {
  "package-microservice": {
      "title": "Used In",
      "target": "microservice",
      "required": false
  }
}
```

### From the API

:::note
Remember that an access token is necessary in order to make API requests. If you need to generate a new token, refer back to [Getting an API token](./blueprint-basics.md#getting-an-api-token).
:::

In order to create a relation from the API, you will make a PUT request to the URL `https://api.getport.io/v1/{source_blueprint_identifier}`.

The request flow is:

1. Construct the Relation object
2. Get the existing Blueprint schema from Port API
3. Add the new Relation object to the `relations` key of the existing Blueprint
4. Send a PUT request with the complete Blueprint schema

Here are some request examples that will create our `package-microservice` relation:

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

source_blueprint_name = 'package'

target_blueprint_name = 'microservice'

relation_name = 'package-microservice'

relation = {
    'title': 'Used In',
    'target': target_blueprint_name,
    'required': False
}

headers = {
    'Authorization': f'Bearer {access_token}'
}

blueprint_response = requests.get(f'{API_URL}/blueprints/{source_blueprint_name}', headers=headers)

blueprint = blueprint_response.json()['blueprint']

blueprint['relations'][relation_name] = relation

response = requests.post(f'{API_URL}/blueprints/{source_blueprint_name}', json=blueprint, headers=headers)

# response.json() contains the content of the resulting relation

```

</TabItem>

<TabItem value="javascript">

```javascript showLineNumbers
// Dependencies to install:
// $ npm install axios --save

// the accessToken variable should already have the token from previous examples

const axios = require("axios").default;

const API_URL = "https://api.getport.io/v1";

const sourceBlueprintName = "package";

const targetBlueprintName = "microservice";

const relationName = "package-microservice";

const relation = {
  title: "Used In",
  target: targetBlueprintName,
  required: false,
};

const config = {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
};

const blueprintResponse = await axios.get(
  `${API_URL}/blueprints/${sourceBlueprintName}`,
  config
);

const blueprint = blueprintResponse.data.blueprint;

const updatedBlueprint = {
  ...blueprint,
  relations: {
    ...blueprint.relations,
    [relationName]: relation,
  },
};

const response = await axios.post(
  `${API_URL}/blueprints/${source_blueprint_name}`,
  updatedBlueprint,
  config
);

console.log(response.data);

// response.data contains the content of the resulting relation
```

</TabItem>

</Tabs>

After creating the Relation, you will see a visual indicator in the Blueprints graph:

![Blueprints Graph with Relations Line](../../static/img/platform-overview/port-components/relations/graphPackageMicroserviceWithRelationLine.png)

## Updating relations

When updating a Relation, it is only possible to update the `title`, `required` and `many` keys.

:::caution
When making a request to update a relation, if you try to change the identifier of a Relation, it will effectively delete the old Relation and create a new one under the new identifier
:::

Just like before, you can update a Relation from the UI or from the API.

### From the UI

In order to update a Relation from the UI, go to the Blueprints graph, hover over the `source` Blueprint and click on the pencil icon that appears:

![Graph relations edit marked](../../static/img/platform-overview/port-components/relations/graphRelationEditMarked.png)

An editor window will open with the current schema of the Blueprint. In order to update the Relation, simply edit the value of the `title`, `required` or `many` properties as needed in the `package-microservice` Relation object

After editing the Relation, click on `save` at the bottom right corner of the editor and view the updated Blueprint and its Relation.

### From the API

In order to update a Relation from the API, you will make a PUT request to the URL `https://api.getport.io/v1/{source_blueprint_identifier}`.

The request body will include the existing body of the Blueprint, alongside the updated `relations` object, after the desired updates to the existing Relation have been applied.

## Deleting relations

:::danger
A Relation cannot be restored after deletion!
:::

In order to delete a Relation you can:

- Delete the object of the specific Relation in the Blueprint schema editor;
- Make a REST PUT request to the URL `https://api.getport.io/v1/{source_blueprint_identifier}` after removing the specific Relation object from `relations` key in the Blueprint schema.

## Next steps

Now that we understand **Relations**, we can begin to see how Port helps us understand and manage our infrastructure layout.

In the next section we will talk about **Entities**, which are objects that match the type of Blueprints we defined, and the final building block in creating our Software Catalog.
