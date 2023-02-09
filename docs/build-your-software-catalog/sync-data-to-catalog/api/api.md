# API

import FindCredentials from "./\_template_docs/\_find_credentials.mdx";

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

Port's [API](../../../api-reference/api-reference.mdx) is a generic interface to model your software catalog, ingest data, invoke actions, query scorecards and more.

## 💡 Common Port API usage

Since Port API is a generic interface, anything that can be done with Port is possible through the API, for example:

- Create entities in a script;
- Import entities from a CSV file
- Integrate Port with your custom CI/CD;
- Report the status of a running CI job;
- Update the software catalog about a new build version for a microservice;
- Get existing entities.

## Get API Token

In order to interact with the API you will need an API token.

Getting an API token involves 2 steps:

1. Finding your Port API credentials;
2. Making an API request to generate a valid token.

### Find your Port credentials

<FindCredentials />

### Generate an API token

Here are some code examples showing how to generate an API token in various programming languages:

<Tabs groupId="code-examples" defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "Javascript", value: "js"},
{label: "cURL", value: "curl"}
]}>

<TabItem value="python">

```python showLineNumbers
# Dependencies to install:
# $ python -m pip install requests

import requests

CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'

API_URL = 'https://api.getport.io/v1'

credentials = {'clientId': CLIENT_ID, 'clientSecret': CLIENT_SECRET}

token_response = requests.post(f'{API_URL}/auth/access_token', json=credentials)

access_token = token_response.json()['accessToken']

# You can now use the value in access_token when making further requests

```

</TabItem>

<TabItem value="js">

```javascript showLineNumbers
// Dependencies to install:
// $ npm install axios --save

const axios = require("axios").default;

const CLIENT_ID = "YOUR_CLIENT_ID";
const CLIENT_SECRET = "YOUR_CLIENT_SECRET";

const API_URL = "https://api.getport.io/v1";

const response = await axios.post(`${API_URL}/auth/access_token`, {
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
});

const accessToken = response.data.accessToken;

// You can now use the value in accessToken when making further requests
```

</TabItem>

<TabItem value="curl">

```bash showLineNumbers
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
```

</TabItem>

</Tabs>

## Integrate Port with your CI/CD

Since Port is API first, even if your specific CI/CD platform does not already have a first-class integration to Port, it is still possible to create and update entities using simple REST calls.

### Setup

To use Port's REST API in your CI/CD you need to perform the following steps:

1. Find your [Port credentials](../api/get-api-token.mdx#find-your-port-credentials);
2. Save them as secrets or in some other same manner such that you can reference them in your CI/CD flow;
3. Make sure you have an HTTP-capable client in your CI/CD environment.
   1. For example: cURL, python with the requests package, nodejs with fetch/axios, etc.

### Usage

Since you are using Port's REST API directly in your CI/CD, any method that the API provides is at your disposal.

We will focus on two specific use cases:

- Create/Update catalog entities - available by making HTTP POST requests to `https://api.getport.io/v1/blueprints/{blueprint_identifier}/entities/`, receives the identifier and other properties of a new entity or an entity that needs to be updated;
- Get catalog entities - available by making HTTP GET requests to `https://api.getport.io/v1/blueprints/{blueprint_identifier}/entities/`, receives the identifier of an existing entity and retrieves it for use in your CI.

<Tabs groupId="usage" defaultValue="upsert" values={[
{label: "Create/Update", value: "upsert"},
{label: "Get", value: "get"}
]}>

<TabItem value="upsert">

<Tabs groupId="code-examples" defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "Javascript", value: "js"},
{label: "cURL", value: "curl"},
]}>

<TabItem value="python">

```python showLineNumbers
# Dependencies to install:
# $ python -m pip install requests

import requests

# highlight-start
CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'
# highlight-end

API_URL = 'https://api.getport.io/v1'

credentials = {'clientId': CLIENT_ID, 'clientSecret': CLIENT_SECRET}

token_response = requests.post(f'{API_URL}/auth/access_token', json=credentials)

access_token = token_response.json()['accessToken']

# You can now use the value in access_token when making further requests

headers = {
    'Authorization': f'Bearer {access_token}'
}

# highlight-next-line
blueprint_id = 'MY_BLUEPRINT'

# highlight-start
entity = {
  'identifier': 'MY_ENTITY_IDENTIFIER',
  'title': 'MY TITLE',
  'properties': {
    'MY_STRING_PROP': 'MY VALUE',
    'MY_BOOLEAN_PROP': False
  },
  'relations': {}
}
# highlight-end

response = requests.post(f'{API_URL}/blueprints/{blueprint_id}/entities', json=entity, headers=headers)

# response.json() contains the content of the resulting entity
```

</TabItem>

<TabItem value="js">

```javascript showLineNumbers
// Dependencies to install:
// $ npm install axios --save

const axios = require("axios").default;

// highlight-start
const CLIENT_ID = "YOUR_CLIENT_ID";
const CLIENT_SECRET = "YOUR_CLIENT_SECRET";
// highlight-end

const API_URL = "https://api.getport.io/v1";

const response = await axios.post(`${API_URL}/auth/access_token`, {
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
});

const accessToken = response.data.accessToken;

// You can now use the value in accessToken when making further requests

// highlight-next-line
const blueprintId = "MY_BLUEPRINT";

const config = {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
};

const entity = {
  // highlight-start
  identifier: "MY_ENTITY_IDENTIFIER",
  title: "MY TITLE",
  properties: {
    MY_STRING_PROP: "MY VALUE",
    MY_BOOLEAN_PROP: false,
  },
  relations: {},
};
// highlight-end

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
# Dependencies to install:
# For apt:
# $ sudo apt-get install jq
# For yum:
# $ sudo yum install jq

access_token=$(curl --location --request POST 'https://api.getport.io/v1/auth/access_token' \
--header 'Content-Type: application/json' \
--data-raw '{
  # highlight-start
    "clientId": "CLIENT_ID",
    "clientSecret": "CLIENT_SECRET"
  # highlight-end
}' | jq '.accessToken' | sed 's/"//g')

# The token will be available in the access_token variable

# highlight-next-line
blueprint_id='MY_BLUEPRINT'

curl --location --request POST "https://api.getport.io/v1/blueprints/${blueprint_id}/entities" \
    --header "Authorization: Bearer $access_token" \
    --header "Content-Type: application/json" \
    --data-raw "{
      # highlight-start
    \"identifier\": \"MY_ENTITY_IDENTIFIER\",
    \"title\": \"MY ENTITY TITLE\",
    \"properties\": {
            \"MY_STRING_PROP\": \"MY VALUE\",
            \"MY_BOOLEAN_PROP\": false
      # highlight-end
    }
}"

# The output of the command contains the content of the resulting blueprint
```

</TabItem>

</Tabs>

</TabItem>

<TabItem value="get">

<Tabs groupId="code-examples" defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "Javascript", value: "js"},
{label: "cURL", value: "curl"},
]}>

<TabItem value="python">

```python showLineNumbers
# Dependencies to install:
# $ python -m pip install requests

import requests

# highlight-start
CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'
# highlight-end

API_URL = 'https://api.getport.io/v1'

credentials = {'clientId': CLIENT_ID, 'clientSecret': CLIENT_SECRET}

token_response = requests.post(f'{API_URL}/auth/access_token', json=credentials)

access_token = token_response.json()['accessToken']

# You can now use the value in access_token when making further requests

headers = {
    'Authorization': f'Bearer {access_token}'
}

# highlight-start
blueprint_id = 'MY_BLUEPRINT'
entity_id = 'MY_ENTITY_IDENTIFIER'
# highlight-end

response = requests.get(f'{API_URL}/blueprints/{blueprint_id}/entities/{entity_id}', headers=headers)

# response.json() contains the content of the resulting entity

```

</TabItem>

<TabItem value="js">

```javascript showLineNumbers
// Dependencies to install:
// $ npm install axios --save

const axios = require("axios").default;

// highlight-start
const CLIENT_ID = "YOUR_CLIENT_ID";
const CLIENT_SECRET = "YOUR_CLIENT_SECRET";
// highlight-end

const API_URL = "https://api.getport.io/v1";

const response = await axios.post(`${API_URL}/auth/access_token`, {
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
});

const accessToken = response.data.accessToken;

// You can now use the value in accessToken when making further requests

// highlight-start
const blueprintId = "MY_BLUEPRINT";
const entityId = "MY_ENTITY_IDENTIFIER";
// highlight-end

const config = {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
};

const response = await axios.get(
  `${API_URL}/blueprints/${blueprintId}/entities/${entityId}`,
  config
);

// response.data contains the content of the resulting entity
```

</TabItem>

<TabItem value="curl">

```bash showLineNumbers
# Dependencies to install:
# For apt:
# $ sudo apt-get install jq
# For yum:
# $ sudo yum install jq

access_token=$(curl --location --request POST 'https://api.getport.io/v1/auth/access_token' \
--header 'Content-Type: application/json' \
--data-raw '{
  # highlight-start
    "clientId": "CLIENT_ID",
    "clientSecret": "CLIENT_SECRET"
  # highlight-end
}' | jq '.accessToken' | sed 's/"//g')

# The token will be available in the access_token variable

# highlight-start
blueprint_id='MY_BLUEPRINT'
entity_id='MY_ENTITY_IDENTIFIER'
# highlight-end

curl --location --request GET "https://api.getport.io/v1/blueprints/${blueprint_id}/entities/${entity_id}" \
    --header "Authorization: Bearer $access_token" \
    --header "Content-Type: application/json"

# The output of the command contains the content of the resulting entity
```

</TabItem>

</Tabs>

</TabItem>

</Tabs>
