---
sidebar_position: 12
description: Ingest Go Modules and dependencies into your catalog
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
<summary>Go Bash Script</summary>
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

- `mapfile -t` reads lines into an array from the `go.mod` file, creating a collection for iteration.
- Text manipulation and filtering are achieved using `sed`, `tail -n +2`, `head -n -1`, and `tr -d '[:space:]'`. These commands collectively process the text from the file.
- `IFS=' '` is used to set the Internal Field Separator to space, affecting how word splitting occurs.
- `read -r -a` is employed to split lines into arrays, facilitating further processing.
- `basename` is used to extract filenames from paths, reducing the URL to a simpler form.
- JSON handling is done using `jq -n` and `jq --argjson`. These commands allow for the creation of JSON objects and their addition to the output JSON file.

:::

Done! After the script completes, You will see Go dependency entities in Port.
