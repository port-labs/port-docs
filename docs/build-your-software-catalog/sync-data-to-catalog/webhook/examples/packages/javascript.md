---
sidebar_position: 1
description: Ingest Javascript packages into your catalog
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import ServiceBlueprint from './resources/javascript/\_example_service_blueprint.mdx'
import PackageBlueprint from './resources/javascript/\_example_package_blueprint.mdx'
import PackageWebhookConfig from './resources/javascript/\_example_package_webhook_config.mdx'

# JavaScript

In this example you are going to create `package` blueprint that ingests all third party dependencies and libraries in your package.json file using a combination of REST API and Webhook. You will then relate this blueprint to a `service` blueprint, allowing you to map all the packages used by a service. Finally, you will add some script to transform your package file into a format required by the webhook.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>Service blueprint</summary>
<ServiceBlueprint/>
</details>

<details>
<summary>Package blueprint</summary>
<PackageBlueprint/>
</details>

<details>
<summary>Package webhook configuration</summary>

<PackageWebhookConfig/>

</details>

## Working with Port's API

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
import requests
import json

# Get environment variables using the config object or os.environ["KEY"]
WEBHOOK_URL = os.environ['WEBHOOK_URL'] ## the value of the URL you receive after creating the Port webhook
SERVICE_ID = os.environ['SERVICE_ID'] ## The identifier of your service in Port
PATH_TO_PACKAGE_JSON_FILE = os.environ['PATH_TO_PACKAGE_JSON_FILE']


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


def convert_package_json(package_json_path):
    """This function takes a package.json file path, converts the "dependencies" property into a
    JSON array using three keys (name, version, and id). It then sends the data to Port

    Params
    --------------
    package_json_path: str
        The path to the package.json file relative to the project's root folder

    Returns
    --------------
    response: dict
        The response object after calling the webhook
    """
    with open(package_json_path) as file:
        data = json.load(file)

    dependencies = data.get('dependencies', {})

    converted_dependencies = []
    for index, (name, version) in enumerate(dependencies.items(), start=1):
        pkg_id = f"pkg-{index}"
        converted_dependencies.append({
            'name': name,
            'version': version,
            'id': pkg_id
        })

    entity_object = {
        "service": SERVICE_ID,
        "dependencies": converted_dependencies
    }
    webhook_response = add_entity_to_port(entity_object)
    return webhook_response

converted_data = convert_package_json(PATH_TO_PACKAGE_JSON_FILE)
print(converted_data)
```

</details>

</TabItem>

<TabItem value="bash">

Create the following Bash script in your repository to create or update Port entities as part of your pipeline:

<details>
  <summary> Bash script example </summary>

```bash showLineNumbers
#!/bin/sh

# Get environment variables
WEBHOOK_URL="$WEBHOOK_URL"
SERVICE_ID="$SERVICE_ID"
PATH_TO_PACKAGE_JSON_FILE="$PATH_TO_PACKAGE_JSON_FILE"

add_entity_to_port() {
    local entity_object="$1"
    local headers="Accept: application/json"
    local response=$(curl -X POST -H "$headers" -H "Content-Type: application/json" -d "$entity_object" "$WEBHOOK_URL")
    echo "$response"
}

# This function takes a package.json file path, converts the "dependencies" property into a
# JSON array using three keys (name, version, and id). It then sends this data to Port
convert_package_json() {
    local package_json_path="$1"
    local data=$(cat "$package_json_path")
    local dependencies=$(echo "$data" | jq -r '.dependencies // {}')

    local converted_dependencies=""
    local index=1
    while IFS="=" read -r dep_name version; do
        pkg_id="pkg-$index"
        converted_dependencies="$converted_dependencies{\"name\":\"$dep_name\",\"version\":\"$version\",\"id\":\"$pkg_id\"},"
        index=$((index + 1))
    done <<EOF
$(echo "$dependencies" | jq -r 'to_entries[] | .key + "=" + .value')
EOF

    local entity_object="{\"service\":\"$SERVICE_ID\",\"dependencies\":[${converted_dependencies%,}]}"
    local webhook_response=$(add_entity_to_port "$entity_object")
    echo "$webhook_response"
}

converted_data=$(convert_package_json "$PATH_TO_PACKAGE_JSON_FILE")
echo "$converted_data"
```

</details>

</TabItem>
</Tabs>

For more information on how to adapt this tutorial with your existing Gitlab CI pipelines, visit:

- [Package.json example](https://github.com/port-labs/package-json-webhook-example)
