---
sidebar_position: 3
sidebar label: Entity Basics
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# Entity Basics

## Creating entities

There are 2 methods to create Entities:

- UI; or
- API.

:::info
We will be creating Entities for the `Microservice` Blueprint from [Creating a Blueprint](./blueprint-basics.md#creating-a-blueprint) and the `package` Blueprint from [Blueprint Next Steps](./blueprint-basics.md#next-steps). Please make sure to create them before reading on so you to follow along.
:::

:::note
An Entity page will be created upon the creation of a new entity.
:::

### From the UI

To create an Entity from the UI, go to the [Page](../platform-overview/port-components/page.md) that matches the Blueprint you want to add an Entity to. You can find the pages list in the sidebar on the left side of Port's UI.

First go to the `Microservices` page:

![Developer Portal Blueprints graph Packages page marked](../../static/img/tutorial/entity-basics/BlueprintsGraphPackagesPageMarked.png)

To create a new `Package` click the `+ Package` button:

![Developer Portal create Package](../../static/img/tutorial/entity-basics/PackagesPageCreatePackageMarked.png)

A UI form will open with the properties we created for the `Microservice` Blueprint:

![Developer Portal create Package creation form](../../static/img/tutorial/entity-basics/CreatePackageModal.png)

#### Creating with the JSON editor

Every entity has a format similar to the one we explained in the [Understanding the structure of an entity](../platform-overview/port-components/entity.md#entity-json-structure), which is viewable via the _JSON mode_ button. In order to create your first `package`, paste in the following content:

```json showLineNumbers
{
  "identifier": "requests-pkg-v2-28",
  "title": "Requests",
  "team": "",
  "blueprint": "Package",
  "properties": {
    "version": "2.28",
    "inHouse": false
  },
  "relations": {}
}
```

### From the API

:::note
Remember that an access token is needed to make API requests, refer back to [Getting an API token](./blueprint-basics.md#getting-an-api-token) if you need to generate a new one.
:::

#### Creating an entity

Let's create a new `Package` using the API. Our entity is based on the `Package` Blueprint structure.

Our first step will be to make a POST request to the URL `https://api.getport.io/v1/blueprints/{blueprint_identifier}/entities`.

:::tip
Note that the URL should contain the Blueprint’s identifier, in this case - `package`.
:::

<Tabs groupId="code-examples" defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "Javascript", value: "javascript"},
{label: "cURL", value: "curl"}
]}>

<TabItem value="python">

```python showLineNumbers
# Dependencies to install:
# $ python -m pip install requests

# the access_token variable should already have the token from the previous example

import requests

API_URL = 'https://api.getport.io/v1'

headers = {
    'Authorization': f'Bearer {access_token}'
}

blueprint_id = 'Package'

entity = {
  'identifier': 'requests-pkg-v2-28',
  'title': 'Requests',
  'team': '',
  'properties': {
    'version': '2.28',
    'inHouse': False
  },
  'relations': {}
}

response = requests.post(f'{API_URL}/blueprints/{blueprint_id}/entities', json=entity, headers=headers)

# response.json() contains the content of the resulting entity

```

</TabItem>

<TabItem value="javascript">

```javascript showLineNumbers
// Dependencies to install:
// $ npm install axios --save

// the accessToken variable should already have the token from the previous example

const axios = require("axios").default;

const API_URL = "https://api.getport.io/v1";

const blueprintId = "Package";

const config = {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
};

const entity = {
  identifier: "requests-pkg-v2-28",
  title: "Requests",
  team: "",
  properties: {
    version: "2.28",
    inHouse: false,
  },
  relations: {},
};

const response = await axios.post(
  `${API_URL}/blueprints/${blueprintId}/entities`,
  entity,
  config
);

// response.data contains the content of the resulting entity
```

</TabItem>

<TabItem value="curl">

```bash showLineNumbers
# the access_token variable should already have the token from the previous example

blueprint_id='Package'

curl --location --request POST "https://api.getport.io/v1/blueprints/${blueprint_id}/entities" \
	--header "Authorization: Bearer $access_token" \
	--header "Content-Type: application/json" \
	--data-raw "{
    \"identifier\": \"requests-pkg-v2-28\",
    \"title\": \"Requests\",
    \"properties\": {
            \"version\": \"2.28\",
            \"inHouse\": false
    }
}"

# The output of the command contains the content of the resulting entity
```

</TabItem>

</Tabs>

You will have a new Entity called `Requests` on the Packages page:

![Developer Portal New Package entity marked](../../static/img/tutorial/entity-basics/RequestsNewPackage.png)

## Updating an entity

You can change any mutable Entity, and edit/delete its property values.

### From the UI

- Click the Pencil icon in each of the table columns;
- Click the `...` button at the right side of an Entity listing, then click `show all properties`.

![Developer Portal Edit Package entity](../../static/img/tutorial/entity-basics/PackagesEntityEditMarked.png)

### From the API

The API offers several methods to update an existing Entity:

- Make a **REST POST** request to the URL `https://api.getport.io/v1/blueprints/{blueprint_identifier}/entities?upsert=true`

  This request with the `upsert` flag set to `true` will update a matching Entity if one exists, if no matching Entity is found, a new one will be created.

  The request body is the same as creating a new entity, just with the additional flag `upsert=true`.

- Make a **REST PUT** request to the URL `https://api.getport.io/v1/blueprints/{blueprint_identifier}/entities/{entity_identifier}`

  A PUT request has the same body as a POST request and it will simply overwrite the entity if it exists. It will return an error code if the entity does not exist (based on identifier-match).

- Make a **REST PATCH** request to the URL `https://api.getport.io/v1/blueprints/{blueprint_identifier}/entities/{entity_identifier}`

A PATCH request has a specific format that allows precise changes in an existing Entity, for example:

To Edit a specific property, for example: `version`, send a PATCH request with the following body:

```json showLineNumbers
properties': {"version": "2.29"}
```

## Deleting entities

:::danger
An Entity cannot be restored after deletion!
:::

To delete an Entity you can:

- Click the `...` button at the right end of an Entity listing, then click `Delete`.

![Delete entity button marked](../../static/img/platform-overview/port-components/entities/DeleteEntityButton.png)

- Make a **REST DELETE** request to the URL `https://api.getport.io/v1/blueprints/{blueprint_identifier}/entities/{entity_identifier}`

## Next steps

Now that we understand **Entities**, we can start creating related Entities to model our related data in the infrastructure!

:::tip
Remember that each Entity has a page of its own, as seen in the [Entity page section](../platform-overview/port-components/page.md#entity-page) in [Page](../platform-overview/port-components/page.md).
:::

First, let's create another `package` Entity.

From the UI or using the API create a `package` Entity with the following details:

```json showLineNumbers
{
  "identifier": "sqlAlchemy_v1_4_39",
  "title": "SQL Alchemy v1.4.39",
  "properties": {
    "version": "1.4.39",
    "inHouse": false
  },
  "relations": {}
}
```

Now, let's create a `microservice` Entity (Either from the `microservice` page or using Port's API) that uses the `package` Entities. Create a `microservice` Entity with the following details:

```json showLineNumbers
{
  "identifier": "notification-microservice",
  "title": "Notification Service",
  "properties": {
    "repoUrl": "https://www.github.com/User/notification",
    "slackChannel": "#notification-service"
  },
  "relations": {
    "packages": ["requests-pkg-v2-28", "sqlAlchemy_v1_4_39"]
  }
}
```

:::note
Since `Microservice` is **Related** to `Package` when creating a new package we will see an additional field(s) representing the Relation(s).

- When a Relation is configured `many = false` - selecting a related Entity is done according to the Entity title (via the UI), or according to the Entity identifier (via the JSON editor);
- When a Relation is configured `many = true` - selecting related Entities will open up a new JSON editor with an array format where you can type in the identifiers of the related Entities.

:::

The result is a `microservice` Entity that has 2 different `package` Entities related to it:

![Developer Portal Microservice With Many Package](../../static/img/tutorial/entity-basics/MicroserviceWithManyPackages.png)
