---
sidebar_position: 12
description: Ingest GO Modules and Dependencies into your catalog
---

import GoBlueprint from "./resources/go/\_example_go_blueprint.mdx";
import GoConfiguration from "./resources/go/\_example_go_webhook_configuration.mdx"
import GoShell from "./resources/go/\_example_go_bash.mdx"

# GO

In this example you are going to create a webhook integration between [GO](https://go.dev/) and Port, which will ingest GO Modules,Version and Dependencies to Port and map them to your Blueprint entities. This integration will involve setting up a webhook to keep track of module,version and dependencies of your Golang application whenever a go lang application is created or updated, allowing Port to ingest and process the GO entities accordingly.

## Prerequisites

Create the following blueprint definitions and webhook configuration:

<details>
<summary>GO module blueprint</summary>
<GoBlueprint/>
</details>

<details>
<summary>GO webhook configuration</summary>
<GoConfiguration/>
</details>

<details>
<summary>GO Bash Script</summary>
<GoShell/>
</details>

## Parsing go.mod file and sending dependency data to Port

### Script Usage

1. Copy the script into a file in the root of your Go project. Make sure your go.mod file is also located in the root of the project;
2. Make the script executable. For instance, if you named the script parse_and_send.sh, you would use the following command;
   ```bash showLineNumbers
   chmod +x parse_and_send.sh
   ```
3. Run the script:
   ```bash showLineNumbers
   ./parse_and_send.sh
   ```

Done! After the script has run, it will automatically injest Go packages into Port via HTTP Request
