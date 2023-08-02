---
sidebar_position: 5
description: Ingest SonarQube analysis into your catalog
---

import SonarcloudAnalysisBlueprint from "./resources/sonarqube/\_example_sonarcloud_analysis_blueprint.mdx";
import SonarcloudAnalysisConfiguration from "./resources/sonarqube/\_example_sonarcloud_analysis_configuration.mdx";

# SonarQube

In this example you are going to create a webhook integration between [SonarQube's SonarCloud](https://www.sonarsource.com/products/sonarcloud/) and Port, which will ingest SonarQube code quality analysis entities.

## Port configuration

Create the following blueprint definition:

<details>
<summary>SonarQube analysis blueprint</summary>

<SonarcloudAnalysisBlueprint/>

</details>

Create the following webhook configuration [using Port ui](../../?operation=ui#configuring-webhook-endpoints):

<details>
<summary>SonarQube analysis webhook configuration</summary>

1. **Basic details** tab - fill the following details:

   1. Title : `SonarQube mapper`;
   2. Identifier : `sonarqube_mapper`;
   3. Description : `A webhook configuration to map SonarQube alerts to Port`;
   4. Icon : `sonarqube`;

2. **Integration configuration** tab - fill the following JQ mapping:

   <SonarcloudAnalysisConfiguration/>

3. Scroll down to **Advanced settings** and input the following details:

   1. secret: `WEBHOOK_SECRET`;
   2. Signature Header Name : `X-Sonar-Webhook-HMAC-SHA256`;
   3. Signature Algorithm : Select `sha256` from dropdown option;
   4. Click **Save** at the bottom of the page.

   Remember to replace the `WEBHOOK_SECRET` with the real secret you specify when creating the webhook in SonarCloud.

</details>

## Create a webhook in SonarCloud

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

## Let's Test It

This section includes a sample webhook event sent from SonarQube when a code repository is scanned for quality assurance. In addition, it includes the entity created from the event based on the webhook configuration provided in the previous section.

### Payload

Here is an example of the payload structure sent to the webhook URL when a SonarQube repository is scanned:

<details>
<summary> Webhook event payload</summary>

```json showLineNumbers
{
  "serverUrl": "https://sonarcloud.io",
  "taskId": "AYi_1w1fcGD_RU1S5-r_",
  "status": "SUCCESS",
  "analysedAt": "2023-06-15T16:15:05+0000",
  "revision": "575718d8287cd09630ff0ff9aa4bb8570ea4ef29",
  "changedAt": "2023-06-15T16:15:05+0000",
  "project": {
    "key": "Username_Test_Python_App",
    "name": "Test_Python_App",
    "url": "https://sonarcloud.io/dashboard?id=Username_Test_Python_App"
  },
  "branch": {
    "name": "master",
    "type": "LONG",
    "isMain": true,
    "url": "https://sonarcloud.io/dashboard?id=Username_Test_Python_App"
  },
  "qualityGate": {
    "name": "My Quality Gate",
    "status": "ERROR",
    "conditions": [
      {
        "metric": "code_smells",
        "operator": "GREATER_THAN",
        "value": "217",
        "status": "ERROR",
        "errorThreshold": "5"
      },
      {
        "metric": "ncloc",
        "operator": "GREATER_THAN",
        "value": "8435",
        "status": "ERROR",
        "errorThreshold": "20"
      },
      {
        "metric": "new_branch_coverage",
        "operator": "LESS_THAN",
        "status": "NO_VALUE",
        "errorThreshold": "1"
      },
      {
        "metric": "new_sqale_debt_ratio",
        "operator": "GREATER_THAN",
        "value": "1.0303030303030303",
        "status": "OK",
        "errorThreshold": "5"
      },
      {
        "metric": "new_violations",
        "operator": "GREATER_THAN",
        "value": "3",
        "status": "ERROR",
        "errorThreshold": "1"
      }
    ]
  },
  "properties": {}
}
```

</details>

### Mapping Result

The combination of the sample payload and the webhook configuration generates the following Port entity:

```json showLineNumbers
{
  "identifier": "AYi_1w1fcGD_RU1S5-r_",
  "title": "Test_Python_App-AYi_1w1fcGD_RU1S5-r_",
  "blueprint": "sonarCloudAnalysis",
  "properties": {
    "serverUrl": "https://sonarcloud.io",
    "status": "SUCCESS",
    "projectName": "Test_Python_App",
    "projectUrl": "https://sonarcloud.io/dashboard?id=Username_Test_Python_App",
    "branchName": "master",
    "branchType": "LONG",
    "branchUrl": "https://sonarcloud.io/dashboard?id=Username_Test_Python_App",
    "qualityGateName": "My Quality Gate",
    "qualityGateStatus": "ERROR",
    "qualityGateConditions": [
      {
        "metric": "code_smells",
        "operator": "GREATER_THAN",
        "value": "217",
        "status": "ERROR",
        "errorThreshold": "5"
      },
      {
        "metric": "ncloc",
        "operator": "GREATER_THAN",
        "value": "8435",
        "status": "ERROR",
        "errorThreshold": "20"
      },
      {
        "metric": "new_branch_coverage",
        "operator": "LESS_THAN",
        "status": "NO_VALUE",
        "errorThreshold": "1"
      },
      {
        "metric": "new_sqale_debt_ratio",
        "operator": "GREATER_THAN",
        "value": "1.0303030303030303",
        "status": "OK",
        "errorThreshold": "5"
      },
      {
        "metric": "new_violations",
        "operator": "GREATER_THAN",
        "value": "3",
        "status": "ERROR",
        "errorThreshold": "1"
      }
    ]
  },
  "relations": {}
}
```
