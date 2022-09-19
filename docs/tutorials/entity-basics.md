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

![Main screen Microservices page marked](../../static/img/platform-overview/port-components/entities/GoToMicroservicePage.png)

To create a new `Microservice` click the `+ Microservice` button:

![Microservices page marked](../../static/img/platform-overview/port-components/entities/CreateNewMsUI.png)

A UI form will open with the properties we created for the `Microservice` Blueprint:

![Microservices creation form](../../static/img/platform-overview/port-components/entities/EntityFormUI.png)

#### Creating with the JSON editor

Every entity has a format similar to the one we explained in the [Understanding the structure of an entity](../platform-overview/port-components/entity.md#entity-json-structure), which is viewable via the _JSON mode_ button. In order to create your first `microservice`, paste in the following content:

```json showLineNumbers
{
  "identifier": "notification-microservice",
  "title": "Notification Service",
  "blueprint": "microservice",
  "properties": {
    "repoUrl": "https://www.github.com/User/notification",
    "slackChannel": "#notification-service"
  },
  "relations": {}
}
```

![Json creator mode](../../static/img/platform-overview/port-components/entities/CreateMicroserviceJSONForm.png)

### From the API

:::note
Remember that an access token is needed to make API requests, refer back to [Getting an API token](./blueprint-basics.md#getting-an-api-token) if you need to generate a new one.
:::

#### Creating an entity

Let's create a new `Microservice` using the API. Our entity is based on the `Microservice` Blueprint structure.

Our first step will be to make a POST request to the URL `https://api.getport.io/v1/blueprints/{blueprint_identifier}/entities`.

:::tip
Note that the URL should contain the Blueprint’s identifier, in this case - `microservice`.
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

blueprint_id = 'microservice'

entity = {
    'identifier': 'notification-microservice',
    'title': 'Notification Service',
    'properties': {
        'repoUrl': 'https://www.github.com/User/notification',
        'slackChannel': '#notification-service'
    }
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

const blueprintId = "microservice";

const config = {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
};

const entity = {
  identifier: "notification-microservice",
  title: "Notification Service",
  properties: {
    slackChannel: "#notification-service",
    repoUrl: "https://www.github.com/user/notification",
  },
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

blueprint_id='microservice'

curl --location --request POST "https://api.getport.io/v1/blueprints/${blueprint_id}/entities" \
	--header "Authorization: Bearer $access_token" \
	--header "Content-Type: application/json" \
	--data-raw "{
    \"identifier\": \"notification-microservice\",
    \"title\": \"Notification Service\",
    \"blueprint\": \"microservice\",
    \"properties\": {
            \"repoUrl\": \"https://www.github.com/user/notification\",
            \"slackChannel\": \"#notification-service\"
    }
}"

# The output of the command contains the content of the resulting entity
```

</TabItem>

</Tabs>

You will have a new Entity called `Notification Service` on the Microservice page:

![New Microservice entity marked](../../static/img/platform-overview/port-components/entities/NewMSEntity.png)

## Updating an entity

You can change any mutable Entity, and edit/delete its property values.

### From the UI

- Click the Pencil icon in each of the table columns;
- Click the `...` button at the right side of an Entity listing, then click `show all properties`.

![Edit Microservice entity](../../static/img/platform-overview/port-components/entities/EditEntityButtons.png)

### From the API

The API offers several methods to update an existing Entity:

- Make a **REST POST** request to the URL `https://api.getport.io/v1/blueprints/{blueprint_identifier}/entities?upsert=true`

  This request with the `upsert` flag set to `true` will update a matching Entity if one exists, if no matching Entity is found, a new one will be created.

  The request body is the same as creating a new entity, just with the additional flag `upsert=true`.

- Make a **REST PUT** request to the URL `https://api.getport.io/v1/blueprints/{blueprint_identifier}/entities/{entity_identifier}`

  A PUT request has the same body as a POST request and it will simply overwrite the entity if it exists. It will return an error code if the entity does not exist (based on identifier-match).

- Make a **REST PATCH** request to the URL `https://api.getport.io/v1/blueprints/{blueprint_identifier}/entities/{entity_identifier}`

A PATCH request has a specific format that allows precise changes in an existing Entity, for example:

To Edit a specific property, for example: `slackChannel`, send a PATCH request with the following body:

```json showLineNumbers
'properties': {"slackChannel": "#my-awesome-channel"}
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

First, let's create a new `Package` entity (If you haven't created a `Package` blueprint yet, please refer to the [Next steps](blueprint-basics.md#next-steps) section in [Blueprint basics](./blueprint-basics.md).

We will go to the `Packages` page:

![Create a package on the Packages page](../../static/img/platform-overview/port-components/entities/CreatePackageButton.png)

After clicking the `+ package` button, a UI form will open with the properties we created for the `Package` Blueprint:

![A New Package creation form](../../static/img/platform-overview/port-components/entities/NewPackageForm.png)

:::note
Since `Package` is **Related** to `Microservice` when creating a new package we will see an additional field(s) representing the Relation(s). Selecting a related Entity is done according to the Entity title (via the UI), or according to the Entity identifier (via the JSON editor).
:::

#### From the UI

We would like to connect our newly created `Package` Entity to the `Microservice` Entity we created above.

![Connect package to microservice](../../static/img/platform-overview/port-components/entities/ConnectMStoPKG.png)

#### Code Format

We can also paste the following content to create our first `Package`, in `JSON mode`.

```json showLineNumbers
{
  "identifier": "requests-pkg-v2-28",
  "title": "Requests",
  "team": "",
  "blueprint": "package",
  "properties": {
    "version": "2.28",
    "inhouse": "false"
  },
  "relations": {
    "package-microservice": "notification-microservice"
  }
}
```

Once we click the `Create` button, we will see our newly created entity in the `Packages` table:

![Packages' page with the new package](../../static/img/platform-overview/port-components/entities/PackageFirstListing.png)
