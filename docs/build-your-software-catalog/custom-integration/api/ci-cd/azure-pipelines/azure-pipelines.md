---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# Azure Pipelines

Using Azure Pipelines, you can easily create/update and query entities in Port.

<br></br>
<br></br>

![Github Illustration](/img/build-your-software-catalog/sync-data-to-catalog/azure-pipelines/azure-pipelines-illustration.jpg)

## 💡 Common Azure Pipelines usage

Port's API allows for easy integration between Port and your Azure Pipeline jobs, for example:

- Report the status of a running **CI job**;
- Update the software catalog about a new **build version** for a **microservice**;
- Get existing **entities**.

## Setup

To interact with Port using Azure Pipelines, you will first need to [define your Port credentials](https://learn.microsoft.com/en-us/azure/devops/pipelines/process/set-secret-variables?view=azure-devops&tabs=yaml%2Cbash#secret-variable-in-the-ui) as variables for your pipeline.
Then, pass the defined variables to your pipeline script, for example, `Python`:

```yaml showLineNumbers
- task: PythonScript@0
  env:
    PORT_CLIENT_ID: $(PORT_CLIENT_ID) # The variable name for your Port clientId
    PORT_CLIENT_SECRET: $(PORT_CLIENT_SECRET) # The variable name for your Port clientSecret
  inputs:
    scriptSource: "filePath"
    scriptPath: "main.py"
```

Make sure you have an existing [Blueprint](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/setup-blueprint.md) in your Port installation to create/update entities.

## Working with Port's API

Here is an example snippet showing how to integrate a job that uses Port's API with your existing Azure pipelines using Python:

Add the following task to your Azure pipeline:

<details>
  <summary> Azure pipeline YAML </summary>

```yaml showLineNumbers
- script: |
    pip install -r port_requirements.txt
- task: PythonScript@0
  env:
    PORT_CLIENT_ID: $(PORT_CLIENT_ID)
    PORT_CLIENT_SECRET: $(PORT_CLIENT_SECRET)
  inputs:
    scriptSource: "filePath"
    scriptPath: "port.py"
```

</details>

<br></br>

:::note
In the following example, we use Python modules which need to be installed. You can use the following `requirements.txt`:

<details>
  <summary> port_requirements.txt </summary>

```
requests>=2.28.2
```

</details>

:::

<Tabs groupId="usage" defaultValue="upsert" values={[
{label: "Create/Update", value: "upsert"},
{label: "Get", value: "get"}
]}>

<TabItem value="upsert">

Create the following Python script in your repository to create or update Port entities as part of your pipeline:

```python showLineNumbers
import os
import requests
import json

# These are the credentials passed by the variables of your pipeline to your tasks and in to your env
CLIENT_ID = os.environ['PORT_CLIENT_ID']
CLIENT_SECRET = os.environ['PORT_CLIENT_SECRET']

credentials = {
    'clientId': CLIENT_ID,
    'clientSecret': CLIENT_SECRET
}
token_response = requests.post(f"{API_URL}/auth/access_token", json=credentials)
access_token = token_response.json()['accessToken']

headers = {
	'Authorization': f'Bearer {access_token}'
}

entity_json = {
        "identifier": "example-entity",
        "properties": {
          "myStringProp": "My value",
          "myNumberProp": 1,
          "myBooleanProp": true,
          "myArrayProp": ["myVal1", "myVal2"],
          "myObjectProp": {"myKey": "myVal", "myExtraKey": "myExtraVal"}
      }
}

# request url : {API_URL}/blueprints/<blueprint_id>/entities
create_response = requests.post(f'{API_URL}/blueprints/test-blueprint/entities?upsert=true', json=entity_json, headers=headers)
print(json.dumps(get_response.json(), indent=4))
```

</TabItem>
<TabItem value="get">

Create the following Python script in your repository to get Port entities as part of your pipeline:

```python showLineNumbers
import os
import requests
import json

# These are the credentials passed by the variables of your pipeline to your tasks and in to your env
CLIENT_ID = os.environ['PORT_CLIENT_ID']
CLIENT_SECRET = os.environ['PORT_CLIENT_SECRET']

credentials = {
    'clientId': CLIENT_ID,
    'clientSecret': CLIENT_SECRET
}
token_response = requests.post(f"{API_URL}/auth/access_token", json=credentials)
access_token = token_response.json()['accessToken']

headers = {
	'Authorization': f'Bearer {access_token}'
}

# request url : {API_URL}/blueprints/<blueprint_id>/entities/<entity_id>
get_response = requests.get(f"{API_URL}/blueprints/test-blueprint/entities/test-entity", headers=headers)
print(json.dumps(get_response.json(), indent=4))
```

</TabItem>
</Tabs>

<PortApiRegionTip/>

## Examples

Refer to the [examples](./examples.md) page for practical examples of working with Port using Azure Pipelines.
