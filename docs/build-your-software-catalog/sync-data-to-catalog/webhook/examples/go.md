---
sidebar_position: 12
description: Ingest Go modules and dependencies into your catalog
---

import GoBlueprint from "./resources/go/\_example_go_blueprint.mdx";
import GoConfiguration from "./resources/go/\_example_go_webhook_configuration.mdx"
import GoShell from "./resources/go/\_example_go_bash.mdx"

# Go

In this example you will create a webhook integration that will injest [Go](https://go.dev/) modules, versions and dependencies to Port.

The integration includes setting up a webhook to keep track of the dependencies defined in your Golang application, allowing Port to ingest and process the Go entities accordingly.

## Prerequisites

Create the following blueprint definitions and webhook configuration:

<details>
<summary>Go module blueprint</summary>
<GoBlueprint/>
</details>

<details>
<summary>Go webhook configuration</summary>
<GoConfiguration/>
</details>

<details>
<summary>Go Bash script</summary>
<GoShell/>
</details>

## Parsing `go.mod` file and sending dependency data to Port

### Script usage

1. Copy the script into a file in the root of your Go project. Make sure your go.mod file is also located in the root of the project;
2. Make the script executable. For instance, if you named the script `parse_and_send.sh`, use the following command;
   ```bash showLineNumbers
   chmod +x parse_and_send.sh
   ```
3. Run the script:
   ```bash showLineNumbers
   ./parse_and_send.sh
   ```

:::note

- The script uses `mapfile`, a bash built-in command, to read lines from the `go.mod` file into an array. This command might not be available in all shells by default. If you're using a different shell (like Dash or Zsh), you might need to switch to Bash or adapt the script to use a similar functionality.
- `jq` is another command that the script uses extensively for handling JSON data. It's utilized to create JSON objects from the package details extracted from the `go.mod` file, and to append these objects to an output JSON file. `jq` is a powerful command-line JSON processor, but it's not included by default in many systems. You may need to install it separately.

:::

Done! After the script completes, You will see Go dependency entities in Port.
