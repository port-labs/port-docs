---
sidebar_position: 3
title: Import and Manage an Integration
description: Learn how to import and manage integrations in Port, streamlining your workflows and enhancing system connectivity.
displayed_sidebar: null
---

import FindCredentials from "/docs/build-your-software-catalog/custom-integration/api/\_template_docs/\_find_credentials_collapsed.mdx";
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"
import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"


# Manage integration mapping using Terraform

In this example we'll use the Import State feature of Terraform, then manage our Port integration's mapping with Terraform.


## Prerequisites

The [Kubernetes](/guides/all/visualize-service-k8s-runtime) integration needs to be installed.


:::info  Installation Id
Take note of the installation Id of the Kubernetes integration when installing it.
:::


## Getting started

In order to interact with the API you will need an **API token**.

To get an **API token** you need to:

1. Find your Port API credentials.
2. Make an API request to generate a valid token.

### Find your Port API credentials

<FindCredentials />

### Download your integration configuration into a file

Here are some code examples showing how to download the integration configuration in various programming languages:

<Tabs groupId="code-examples" defaultValue="curl" values={[
{label: "cURL", value: "curl"},
{label: "Python", value: "python"},
{label: "Javascript", value: "js"}
]}>

<TabItem value="curl">

```bash showLineNumbers
#/usr/bin/env bash

# Dependencies to install:
# For apt:
# $ sudo apt-get install jq
# For yum:
# $ sudo yum install jq

INSTALLATION_ID="YOUR_INSTALLATION_ID"
CLIENT_ID="YOUR_CLIENT_ID"
CLIENT_SECRET="YOUR_CLIENT_SECRET"

ACCESS_TOKEN=$(curl -s --location -X POST 'https://api.getport.io/v1/auth/access_token' \
--header 'Content-Type: application/json' \
--data-raw """{
    \"clientId\": \"${CLIENT_ID}\",
    \"clientSecret\": \"${CLIENT_SECRET}\"
}""" | jq -r '.accessToken')

curl -s -X GET \
  "https://api.getport.io/v1/integration/${INSTALLATION_ID}?byField=installationId" \
  -H 'accept: */*' \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" \
  | jq '.integration.config' > ./${INSTALLATION_ID}.json

```

</TabItem>

<TabItem value="python">

```python showLineNumbers
# Dependencies to install:
# $ python -m pip install requests

import json
import requests

CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'
INSTALLATION_ID = 'YOUR_INSTALLATION_ID'

API_URL = 'https://api.getport.io/v1'

credentials = {'clientId': CLIENT_ID, 'clientSecret': CLIENT_SECRET}

token_response = requests.post(f'{API_URL}/auth/access_token', json=credentials)

access_token = token_response.json()['accessToken']

headers = {
    'Authorization': f'Bearer {access_token}'
}

integration_response = requests.get(
    f'{API_URL}/integration/{INSTALLATION_ID}?byField=installationId',
    headers=headers)

with open(f'{INSTALLATION_ID}.json', 'w') as file:
    file.write(json.dumps(integration_response.json()['integration']['config']))
```

</TabItem>

<TabItem value="js">

```javascript showLineNumbers
// Dependencies to install:
// $ npm install axios --save


const fs = require('node:fs/promises');
const axios = require("axios").default;

const CLIENT_ID = "YOUR_CLIENT_ID";
const CLIENT_SECRET = "YOUR_CLIENT_SECRET";
const INSTALLATION_ID = "YOUR_INSTALLATION_ID";

const API_URL = "https://api.getport.io/v1";

(async () => {
  const response = await axios.post(`${API_URL}/auth/access_token`, {
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  });

  const accessToken = response.data.accessToken;
  const config = {
      headers: {
          Authorization: `Bearer ${accessToken}`,
      }
  };

  const integrationResponse = await axios.post(
      `${API_URL}/v1/integration/${INSTALLATION_ID}?byField=installationId`, 
      config)

  await fs.writeFile(
    `./${INSTALLATION_ID}.json`, 
    JSON.stringify(integrationResponse.data.integration.config)
  )
})();
```

</TabItem>

</Tabs>

<PortApiRegionTip/>

Here is the complete `main.tf` file:

:::note `main.tf` dependency
Notice that the `main.tf` file references the downloaded file generated in the previous command

See the `file("${path.module}/...")` function
:::

<details>
<summary>Complete Terraform definition file</summary>

```hcl showLineNumbers
terraform {
  required_providers {
    port = {
      source  = "port-labs/port-labs"
      version = "~> 2.0.3"
    }
  }

  provider "port" {
  client_id = "YOUR_CLIENT_ID"     # or set the environment variable PORT_CLIENT_ID
  secret    = "YOUR_CLIENT_SECRET" # or set the environment variable PORT_CLIENT_SECRET
  base_url  = "https://api.getport.io"
}

resource "port_integration" "tf_{my-installation-id}" {
  installation_id       = "{my-installation-id}"
  installation_app_type = "{my-installation-type}"
  title                 = "{my-installation-title}"
  version               = ""
  # The reason for the jsonencode|jsondecode is
  # to preserve the exact syntax as terraform expects,
  # this resolves conflicts in the state caused by indents
  config                = jsonencode(jsondecode(file("${path.module}/{my-installation-id}.json")))
}

```

<PortApiRegionTip/>

</details>

Let's break down the definition file and understand the different parts:

## Module imports

This part includes importing and setting up the required Terraform providers and modules:

```hcl showLineNumbers
terraform {
  required_providers {
    port = {
      source  = "port-labs/port-labs"
      version = "~> 2.0.3"
    }
  }
}

provider "port" {
  client_id = "YOUR_CLIENT_ID"     # or set the environment variable PORT_CLIENT_ID
  secret    = "YOUR_CLIENT_SECRET" # or set the environment variable PORT_CLIENT_SECRET
  base_url  = "https://api.getport.io"
}
```

<PortApiRegionTip/>

## Port Terraform Provider Integration Resource

This part includes declaring the Port integration and pointing the downloaded json file as the source of the integration configuration

```hcl showLineNumbers
resource "port_integration" "tf_{my-installation-id}" {
  installation_id       = "{my-installation-id}"
  installation_app_type = "{my-installation-type}"
  title                 = "{my-installation-title}"
  version               = ""
  # The reason for the jsonencode|jsondecode is
  # to preserve the exact syntax as terraform expects,
  # this resolves conflicts in the state caused by indents
  config                = jsonencode(jsondecode(file("${path.module}/{my-installation-id}.json")))
}

```

:::note Terraform JSON formatting
Since Terraform is very explicit when writing and reading the state, we use `jsonencode` and `jsondecode` on the raw JSON file to make sure we do not have a conflict simply by having a bit different formatting than the Terraform JSON formatting.
:::

To use this example yourself, simply replace the placeholders for `installation_id`, `client_id` and `secret` and then run the following commands to setup terraform, import the state and verifying that everything was imported:

```shell showLineNumbers
# install modules and create an initial state
terraform init
# import state from the Port API
terraform import port_integration.tf_{my-installation-id} {my-installation-id}
# To view Terraform's planned changes based on your .tf definition file:
terraform plan
```




## Result

After running `terraform plan` you should see that there are not changes from the imported state.

