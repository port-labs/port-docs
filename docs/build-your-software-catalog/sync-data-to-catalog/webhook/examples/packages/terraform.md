---
sidebar_position: 6
description: Ingest Terraform resources into your catalog
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import TerraformBlueprint from './resources/terraform/\_example_tfstate_blueprint.mdx'
import TerraformWebhookConfig from './resources/terraform/\_example_tfstate_webhook_config.mdx'

# Terraform

In this example you are going to create a `terraformResource` blueprint that ingests all resources in your `terraform.tfstate` file using a combination of Port's [API](../../../api/api.md) and [webhook functionality](../../webhook.md).

To ingest the resources to Port, a script that sends information about resources according to the webhook configuration is used.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>Terraform resources blueprint</summary>
<TerraformBlueprint/>
</details>

<details>
<summary>Terraform resources webhook configuration</summary>

<TerraformWebhookConfig/>

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
import requests
import json
import os

# Get environment variables using the config object or os.environ["KEY"]
WEBHOOK_URL = os.environ['WEBHOOK_URL'] ## the value of the URL you receive after creating the Port webhook
PATH_TO_TERRAFORM_TFSTATE_FILE = os.environ['PATH_TO_TERRAFORM_TFSTATE_FILE']


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


def read_tfstate_file(tfstate_json_path):
    """This function takes a tfstate_json_path file path, converts the "resources" property into a
    JSON array and then sends the data to Port

    Params
    --------------
    tfstate_json_path: str
        The path to the terraform.tfstate file relative to the project's root folder

    Returns
    --------------
    response: dict
        The response object after calling the webhook
    """
    with open(tfstate_json_path) as file:
        data = json.load(file)

    resources = data.get('resources', [])

    tf_resources = []
    index = 1
    for resource in resources:
        resource_id = f"tf-rs-{index}"
        tf_resources.append({
            'name': resource.get('name'),
            'mode': resource.get('mode'),
            'module': resource.get('module'),
            'type': resource.get('type'),
            'provider': resource.get('provider'),
            'instances': resource.get('instances'),
            'id': resource_id
        })
        index+=1

    entity_object = {
        "service": SERVICE_ID,
        "resources": tf_resources
    }
    webhook_response = add_entity_to_port(entity_object)
    return webhook_response

response = read_tfstate_file(PATH_TO_TERRAFORM_TFSTATE_FILE)
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

# Set environment variables
WEBHOOK_URL="$WEBHOOK_URL"
PATH_TO_TERRAFORM_TFSTATE_FILE="$PATH_TO_TERRAFORM_TFSTATE_FILE"

# A function to create the passed entity in Port using the webhook URL
add_entity_to_port() {
  local entity_object_file="$1"
  local headers="Accept: application/json"
  local response=$(curl -X POST -H "$headers" -H "Content-Type: application/json" --data-binary "@$entity_object_file" "$WEBHOOK_URL")
  echo "$response"
}

# This function takes a tfstate_json_path file path, converts the "resources" property into a
# JSON array and then sends the data to Port
read_tfstate_file() {
    local package_json_path="$1"
    local data=$(cat "$package_json_path")
    local resources=$(echo "$data" | jq -c '.resources[]')

    index=1
    tf_resources=()

    while IFS= read -r resource; do
      resource_id="tf-rs-$index"
      resource_name=$(jq -r '.name' <<< "$resource")
      resource_mode=$(jq -r '.mode' <<< "$resource")
      resource_module=$(jq -r '.module' <<< "$resource")
      resource_type=$(jq -r '.type' <<< "$resource")
      resource_provider=$(jq -r '.provider' <<< "$resource")
      resource_instances=$(jq -r '.instances' <<< "$resource")

      tf_resources+=("{\"name\":\"$resource_name\",\"mode\":\"$resource_mode\",\"module\":\"$resource_module\",\"type\":\"$resource_type\",\"provider\":\"$resource_provider\",\"instances\":$resource_instances,\"id\":\"$resource_id\"}")
      ((index++))
    done <<< "$resources"

    local entity_object="{\"resources\":[${tf_resources%,}]}"

    # since some tfstate may be quite large, we can write the data unto a temporary file
    local entity_object_file=$(mktemp)
    echo "$entity_object" > "$entity_object_file"
    local webhook_response=$(add_entity_to_port "$entity_object_file")
    echo "$webhook_response"

    # Clean up the temporary file
    rm "$entity_object_file"
}

response=$(read_tfstate_file "$PATH_TO_TERRAFORM_TFSTATE_FILE")
echo "$response"
```

</details>

</TabItem>
</Tabs>
