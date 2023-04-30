---
sidebar_position: 5
description: Ingest SonarQube analysis into your catalog
---

import SonarcloudAnalysisBlueprint from "./resources/sonarqube/\_example_sonarcloud_analysis_blueprint.mdx";
import SonarcloudAnalysisConfiguration from "./resources/sonarqube/\_example_sonarcloud_analysis_configuration.mdx";

# SonarQube

In this example you are going to create a webhook integration between [SonarQube's SonarCloud](https://www.sonarsource.com/products/sonarcloud/) and Port, which will ingest SonarQube code quality analysis entities.

## Prerequisites

Create the following blueprint definition and webhook configuration:

<details>
<summary>SonarQube analysis blueprint</summary>

<SonarcloudAnalysisBlueprint/>

</details>

<details>
<summary>SonarQube analysis webhook configuration</summary>

Remember to replace the `WEBHOOK_SECRET` with the real secret you specify when creating the webhook in SonarCloud.

<SonarcloudAnalysisConfiguration/>

</details>

## Create the SonarCloud webhook

1. Go to [SonarCloud](https://sonarcloud.io/projects) and select a project you want to configure a webhook for;
2. Click on **Administration** at the bottom left of the page and select **Webhooks**;
3. Click on **Create**
4. Input the following details:
   1. `Name` - use a meaningful name such as Port Webhook;
   2. `URL` - enter the value of the `url` key you received after creating the webhook configuration;
   3. `Secret` - enter the secret value you specified when creating the webhook;
5. Click **Create** at the bottom of the page.

:::tip
In order to view the different payloads and events available in SonarQube webhooks, [look here](https://docs.sonarqube.org/latest/project-administration/webhooks/)
:::

Done! any new analysis you run (for example, on new PRs or changes to PRs) will trigger a webhook event that SonarCloud will send to the webhook URL provided by Port. Port will parse the events according to the mapping and update the catalog entities accordingly.
