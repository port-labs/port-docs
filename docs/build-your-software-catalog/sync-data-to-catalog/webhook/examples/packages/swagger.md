---
sidebar_position: 5
description: Ingest Swagger paths into your catalog
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import SwaggerBlueprint from './resources/swagger/\_example_swagger_blueprint.mdx'
import SwaggerWebhookConfig from './resources/swagger/\_example_swagger_webhook_config.mdx'

# Swagger

In this example you are going to create a `swaggerPath` blueprint that ingests all API paths in your `swagger.json` file using a combination of Port's [API](../../../api/api.md) and [webhook functionality](../../webhook.md).

To ingest the endpoint paths to Port, a script that sends information about API paths according to the webhook configuration is used.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>Swagger path blueprint</summary>
<SwaggerBlueprint/>
</details>

<details>
<summary>Swagger path webhook configuration</summary>

<SwaggerWebhookConfig/>

</details>

## Working with Port's API and Bash script

Here is an example snippet showing how to integrate Port's API and Webhook with your existing pipelines using Python and Bash:

<Tabs groupId="usage" defaultValue="python" values={[
{label: "Python", value: "python"},
{label: "Bash", value: "bash"}
]}>

<TabItem value="python">

Create the following Python script in your repository to create or update Port entities as part of your pipeline:

<details>
  <summary> Python script example </summary>

```python showLineNumbers
## Import the needed libraries

import requests
import json
import os

# Get environment variables using the config object or os.environ["KEY"]
WEBHOOK_URL = os.environ['WEBHOOK_URL'] ## the value of the URL you receive after creating the Port webhook
PATH_TO_SWAGGER_JSON_FILE = os.environ["PATH_TO_SWAGGER_JSON_FILE"]


def add_entity_to_port(entity_object):
    """A function to create the passed entity in Port using the webhook URL

    Params
    --------------
    entity_object: dict
        The entity to add in your Port catalog

    Returns
    --------------
    response: dict
        The response object after calling the webhook
    """
    headers = {"Accept": "application/json"}
    response = requests.post(WEBHOOK_URL, json=entity_object, headers=headers)
    return response.json()


def read_swagger_file(swagger_json_path):
    """This function takes a swagger.json file path, converts the "paths" property into a
    JSON array and then sends this data to Port

    Params
    --------------
    swagger_json_path: str
        The path to the swagger.json file relative to the project's root folder

    Returns
    --------------
    response: dict
        The response object after calling the webhook
    """
    with open(swagger_json_path) as file:
        data = json.load(file)

    project_info = data.get("info")
    project_title = project_info.get("title")
    project_version = project_info.get("version")
    hosted_url = data.get("host")
    base_path = data.get("basePath")

    paths = data.get('paths', {})
    path_list = []
    index = 1
    for path, methods in paths.items():
        for method, method_info in methods.items():
            path_id = f"{project_title}-{index}"
            path_info = {
                "id": path_id,
                "path": path,
                "method": method,
                "summary": method_info.get('summary'),
                "description": method_info.get('description'),
                "parameters": method_info.get("parameters"),
                "responses": method_info.get("responses"),
                "project": project_title,
                "version": project_version,
                "host": "https://" + hosted_url + base_path
            }
            path_list.append(path_info)
            index+=1

    entity_object = {
        "paths": path_list
    }
    webhook_response = add_entity_to_port(entity_object)
    return webhook_response

response = read_swagger_file(PATH_TO_SWAGGER_JSON_FILE)
print(response)
```

</details>

</TabItem>

<TabItem value="bash">

Create the following Bash script in your repository to create or update Port entities as part of your pipeline:

<details>
  <summary> Bash script example </summary>

```bash showLineNumbers
#!/bin/bash

# Set the environment variables
WEBHOOK_URL="$WEBHOOK_URL"
PATH_TO_SWAGGER_JSON_FILE="$PATH_TO_SWAGGER_JSON_FILE"

add_entity_to_port() {
    local entity_object="$1"
    local headers="Accept: application/json"
    local response=$(curl -X POST -H "$headers" -H "Content-Type: application/json" -d "$entity_object" "$WEBHOOK_URL")
    echo "$response"
}

read_swagger_json() {
    local swagger_json_path="$1"
    local data=$(cat "$swagger_json_path")

    local project_info=$(echo "$data" | jq -r '.info')
    local project_title=$(echo "$project_info" | jq -r '.title')
    local project_version=$(echo "$project_info" | jq -r '.version')
    local hosted_url=$(echo "$data" | jq -r '.host')
    local base_path=$(echo "$data" | jq -r '.basePath')
    local paths=$(echo "$data" | jq -r '.paths')

    local path_list=""
    local index=1
    while IFS="=" read -r path methods; do
        while IFS="=" read -r method method_info; do
            local path_id="${project_title}-${index}"
            local summary=$(echo "$method_info" | jq -r '.summary')
            local description=$(echo "$method_info" | jq -r '.description')
            local parameters=$(echo "$method_info" | jq -r '.parameters')
            local responses=$(echo "$method_info" | jq -r '.responses')

            local path_info="{\"id\":\"$path_id\",\"path\":\"$path\",\"method\":\"$method\",\"summary\":\"$summary\",\"description\":\"$description\",\"parameters\":$parameters,\"responses\":$responses,\"project\":\"$project_title\",\"version\":\"$project_version\",\"host\":\"https://${hosted_url}${base_path}\"}"
            path_list="${path_list}${path_info},"
            index=$((index + 1))
        done <<EOF
$(echo "$methods" | jq -r 'to_entries[] | .key + "=" + (.value | @json)')
EOF
    done <<EOF
$(echo "$paths" | jq -r 'to_entries[] | .key + "=" + (.value | @json)')
EOF

    local entity_object="{\"paths\":[${path_list%,}]}"
    local webhook_response=$(add_entity_to_port "$entity_object")
    echo "$webhook_response"
}

response=$(read_swagger_json "$PATH_TO_SWAGGER_JSON_FILE")
echo "$response"
```

</details>

</TabItem>
</Tabs>
