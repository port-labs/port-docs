---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortApiRegionTip from "/docs/generalTemplates/_port_region_parameter_explanation_template.md"

# CircleCI workflows

Using CircleCI workflows, you can easily create/update and query entities in Port.

<br></br>
<br></br>

![Github Illustration](/img/build-your-software-catalog/sync-data-to-catalog/circleci/circleci-illustration.jpg)

## 💡 Common CircleCI workflow usage

Port's API allows for easy integration between Port and your CircleCI workflows, for example:

- Report the status of a running **CI job**;
- Update the software catalog about a new **build version** for a **microservice**;
- Get existing **entities**.

## Setup

To interact with Port using Circle CI, you will first need to set up a [CircleCI context](https://circleci.com/docs/contexts/) in order to save your Port credentials, and pass the context to the relevant workflow.

```yaml showLineNumbers
workflows:
  deploy-service:
    jobs:
      # highlight-start
      - report-to-port:
          context:
            # the CircleCI context name of the credentials
            - port
            # highlight-end
```

Make sure you have an existing [Blueprint](/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/setup-blueprint.md) in your Port installation to create/update entities.

## Working with Port's API

Here is an example snippet showing how to integrate a job that uses Port's API with your existing CircleCI pipelines using Python:

Add the following job and workflow to your CircleCI pipeline:

<details>
  <summary> CircleCI Pipeline YAML </summary>

```yaml showLineNumbers
  jobs:
  # ... other jobs
    report-to-port:
      docker:
        - image: cimg/python:3.11
      environment:
        API_URL: https://api.getport.io
      steps:
        - checkout
        - run: pip install -r port_requirements.txt
        - run: python get_port_entity.py

workflows:
  # ... other workflows
  deploy-production-service:
    jobs:
      # ... other jobs
      # highlight-start
      - report-to-port:
        context:
          - port
      # highlight-end

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

# These are the credentials passed by the 'port' context to your environment variables
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

# These are the credentials passed by the 'port' context to your environment variables
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

Refer to the [examples](./examples.md) page for practical examples of working with Port using CircleCI.
