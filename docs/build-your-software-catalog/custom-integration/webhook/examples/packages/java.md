---
sidebar_position: 4
description: Ingest Maven Dependencies into your catalog
---

import MavenBlueprint from "./resources/java/\_example_maven_blueprint.mdx";
import MavenConfiguration from "./resources/java/\_example_maven_webhook_configuration.mdx"
import MavenShell from "./resources/java/\_example_maven_bash.mdx"

# Java

In this example you are going to create a `mavenDependencies` blueprint that ingests Maven packages using a combination of Port's [API](/build-your-software-catalog/custom-integration/api) and [webhook functionality](/build-your-software-catalog/custom-integration/webhook).

To ingest the Maven dependencies to Port, a script that sends information about packages according to the webhook configuration is used.

## Prerequisites

Create the following blueprint definitions and webhook configuration:

<details>
<summary>Maven dependency blueprint</summary>
<MavenBlueprint/>
</details>

<details>
<summary>Maven webhook configuration</summary>
<MavenConfiguration/>
</details>

<details>
<summary>Maven Bash script</summary>
<MavenShell/>
</details>

## Parsing `pom.xml` file and sending dependency data to Port

The following section outlines how to use the mapper script to send data from the `pom.xml` file to Port.

### Script Usage

1. Copy the script into a file in the root of your Java project. Make sure your `pom.xml` file is also located in the root of the project;
2. Make the script executable. For instance, if you named the script `parse_and_send.sh`, you would use the following command:

   ```bash showLineNumbers
   chmod +x parse_and_send.sh
   ```

3. Run the script:

   ```bash showLineNumbers
   ./parse_and_send.sh
   ```

Done! After the script has run, it will automatically injest Maven dependencies into Port via HTTP Requests
