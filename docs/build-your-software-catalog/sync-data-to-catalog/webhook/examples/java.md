---
sidebar_position: 13
description: Ingest Maven Dependencies into your catalog
---

import MavenBlueprint from "./resources/java/\_example_maven_blueprint.mdx";
import MavenConfiguration from "./resources/java/\_example_maven_webhook_configuration.mdx"
import MavenShell from "./resources/java/\_example_maven_bash.mdx"

# Java

In this guide, we will establish an integration between [Apache Maven](https://maven.apache.org/) and Port using a webhook, enabling the ingestion of Maven dependencies into Port. This will allow you to keep track of your Java application's dependencies in a structured and accessible manner.

This integration works by mapping Maven dependencies to entities in your defined Blueprint within Port. This happens each time a Maven-based Java application is created or updated, ensuring that your Port entities are always up-to-date with your application's current dependencies. Consequently, this provides a seamless way to monitor and manage your application's dependencies within the Port ecosystem.

By integrating Maven with Port, you can:

1. Automatically ingest and update Maven dependencies in Port as they change within your Java application.
2. Leverage Port's powerful features to monitor, manage, and understand your application's dependencies.
3. Map these dependencies to custom entities within your Port Blueprint, providing a structured view of your application's dependencies.

## Prerequisites

Create the following blueprint definitions and webhook configuration:

<details>
<summary>Maven module blueprint</summary>
<MavenBlueprint/>
</details>

<details>
<summary>Maven webhook configuration</summary>
<MavenConfiguration/>
</details>

<details>
<summary>Maven Bash Script</summary>
<MavenShell/>
</details>

## Parsing pom.xml file and sending dependency data to Port

### Script Usage

1. Copy the script into a file in the root of your Java project. Make sure your pom.xml file is also located in the root of the project;
2. Make the script executable. For instance, if you named the script parse_and_send.sh, you would use the following command;
   ```bash showLineNumbers
   chmod +x parse_and_send.sh
   ```
3. Run the script:
   ```bash showLineNumbers
   ./parse_and_send.sh
   ```

Done! After the script has run, it will automatically injest Maven dependencies into Port via HTTP Request
