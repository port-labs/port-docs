---
sidebar_position: 1
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

# CircleCI workflows

Using CircleCI workflows, you can easily create/update and query entities in Port.

<br></br>
<br></br>

![Github Illustration](../../../../../static/img/github-action-illustration.png)

## 💡 Common CircleCI workflow usage

Port's API allows for easy integration between Port and your CircleCI workflows, for example:

- Report the status of a running **CI job**;
- Update the software catalog about a new **build version** for a **microservice**;
- Get existing **entities**.

## Installation

1. To interact with Port using Circle CI, you will first need to set up a [CircleCI context](https://circleci.com/docs/contexts/) in order to save your Port credentials, and pass the context to the relevant workflow.
   1. This step is not mandatory, but it is recommended in order to not pass the `CLIENT_ID` and `CLIENT_SECRET` in plaintext in your builds;

```yaml showLineNumbers
workflows:
  deploy-service:
    jobs:
      - report-to-port:
          context:
            - port
```

2. An example of how you'd interact with Port using CircleCI, is using Python. Add the following codeblock to your Python code:

```python showLineNumbers
import os
import requests
import json

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

get_response = requests.get(f"{API_URL}/blueprints/test-blueprint/entities/test-entity",
                        headers=headers)
print(json.dumps(get_response.json(), indent=4))
```

## Examples

Refer to the [examples](./examples.md) page for practical examples of working with Port using CircleCI.
