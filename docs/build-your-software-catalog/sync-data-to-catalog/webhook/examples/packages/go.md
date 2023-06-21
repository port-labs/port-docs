---
sidebar_position: 3
description: Ingest Golang packages into your catalog
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PackageBlueprint from './resources/golang/\_example_package_blueprint.mdx'
import PackageWebhookConfig from './resources/golang/\_example_package_webhook_config.mdx'
import ServiceBlueprint from './resources/service/\_example_global_service_blueprint.mdx'

# Golang

In this example you are going to create a `package` blueprint that ingests Go modules, versions and dependencies using a combination of Port's [API](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/api/) and [webhook functionality](https://docs.getport.io/build-your-software-catalog/sync-data-to-catalog/webhook/). You will then relate this blueprint to a `service` blueprint, allowing you to map all the packages used by a service.

To ingest the packages to Port, a script that sends information about packages according to the webhook configuration is used.

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

## Working with Port's API and Bash script

Here is an example snippet showing how to integrate Port's API and webhook with your existing pipelines using bash:

<details>

<summary>Go Bash script</summary>

```bash showLineNumbers
#!/bin/bash

# Get environment variables
WEBHOOK_URL="$WEBHOOK_URL"
SERVICE_ID="$SERVICE_ID"

set -e
# Create or clear the output file
echo "[]" > output.json

# Extract require lines from go.mod excluding the first and the last lines
mapfile -t requires < <(sed -n '/require (/,/)/p' go.mod | tail -n +2 | head -n -1)

# Parse each require line into a package JSON
for require in "${requires[@]}"; do
    # Ignore if line is 'require (' or ')'
    if [[ "$require" == "require (" ]] || [[ "$require" == ")" ]]; then
        continue
    fi

    # Split line into an array
    IFS=' ' read -r -a parts <<< "$require"

    # Assign array items to variables
    package_url="${parts[0]}"
    version="${parts[1]}"
    indirect=false

    # Check if line is indirect
    if [[ "${parts[2]}" == "//" && "${parts[3]}" == "indirect" ]]; then
        indirect=true
    fi

    # Extract the package name from the URL
    package_name=$(basename "$package_url")

    # Prepend 'https://' to package URL if not already there and remove any white spaces
    package_url=$(echo "$package_url" | tr -d '[:space:]')
    if [[ "$package_url" != http* ]]; then
        package_url="https://$package_url"
    fi

    # Create the package JSON
    package_json=$(jq -n \
        --arg pn "$package_name" \
        --arg id "$package_name" \
        --arg pu "$package_url" \
        --arg v "$version" \
        --argjson i "$indirect" \
        '{
            identifier: $id,
            packageName: $pn,
            packageUrl: $pu,
            version: $v,
            indirect: $i,
            service: $SERVICE_ID
        }')

    # Add the package JSON to the output file
    jq --argjson p "$package_json" '. += [$p]' output.json > temp.json && mv temp.json output.json

    # Send the package JSON to the webhook
    curl --location '$WEBHOOK_URL' \
        --header 'Content-Type: application/json' \
        --data "$package_json"
done
```

:::note

- The script utilizes the `mapfile` command, which is a built-in command in the Bash shell, to read lines from the `go.mod` file and store them in an array. Please note that this command may not be available in all shells by default. If you are using a different shell such as Dash or Zsh, you may need to switch to Bash or modify the script to achieve a similar functionality.

- The script heavily relies on the `jq` command for manipulating JSON data. It is used to create JSON objects based on the package details extracted from the `go.mod` file and append these objects to an output JSON file. It is important to note that `jq` is a powerful JSON processor for the command-line, but it is not typically included in many systems by default. You may need to install it separately to use it.

:::

</details>
