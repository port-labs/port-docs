---
sidebar_position: 3
description: Ingest Golang packages into your catalog
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PackageBlueprint from './resources/golang/\_example_package_blueprint.mdx'
import PackageWebhookConfig from './resources/golang/\_example_package_webhook_config.mdx'

# Golang

In this example, you will create a webhook integration between Go and Port. This integration will ingest Go modules, versions, and dependencies into Port and map them to your `package` blueprint. Finally, you will add some script to transform your go.mod file into a format required by the webhook. Finally, you will configure your Gitlab to create/update your entities in Port every time a deployment or commit is made to a specified branch such as main or dev.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>Package blueprint</summary>
<PackageBlueprint/>
</details>

<details>
<summary>Package webhook configuration</summary>

<PackageWebhookConfig/>

</details>

## Working with Port's API and Bash Script

<details>

<summary>Go Bash script</summary>

```bash showLineNumbers
#!/bin/bash

# Get environment variables
WEBHOOK_URL="$WEBHOOK_URL"

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
            package_name: $pn,
            package_url: $pu,
            version: $v,
            indirect: $i
        }')

    # Add the package JSON to the output file
    jq --argjson p "$package_json" '. += [$p]' output.json > temp.json && mv temp.json output.json

    # Send the package JSON to the webhook
    curl --location '$WEBHOOK_URL' \
        --header 'Content-Type: application/json' \
        --data "$package_json"
done
```

</details>

## Script Usage

1. Copy the script into a file in the root of your Go project. Make sure your go.mod file is also located in the root of the project;
2. Make the script executable. For instance, if you named the script ingest.sh, you would use the following command;
   ```bash showLineNumbers
   chmod +x ingest.sh
   ```
3. Run the script:
   ```bash showLineNumbers
   ./ingest.sh
   ```

Done! After the script has run, it will automatically injest Go packages into Port via HTTP Request
