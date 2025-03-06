---
sidebar_position: 20
description: Ingest CodeCov coverage into your catalog
---

import CodecovCoverageBlueprint from "./resources/codecov/\_example_coverage_blueprint.mdx";
import CodecovWebhookConfiguration from "./resources/codecov/\_example_webhook_config.mdx";
import CodecovPythonScript from "./resources/codecov/\_example_codecov_python_script.mdx";

# Codecov

In this example you are going to create a webhook integration between [Codecov](https://docs.codecov.com/docs/quick-start) and Port. The integration will facilitate the ingestion of coverage entities into Port.

## Port configuration

Create the following blueprint definitions:

<details>
<summary>Codecov coverage blueprint</summary>

<CodecovCoverageBlueprint/>

</details>

Create the following webhook configuration [using Port's UI](/build-your-software-catalog/custom-integration/webhook/?operation=ui#configuring-webhook-endpoints):

<details>
<summary>Codecov webhook configuration</summary>

1. **Basic details** tab - fill the following details:
   1. Title : `Codecov Mapper`;
   2. Identifier : `codecov_mapper`;
   3. Description : `A webhook configuration to map Codecov coverage to Port`;
   4. Icon : `Git`;
2. **Integration configuration** tab - fill the following JQ mapping:

   <CodecovWebhookConfiguration/>
    :::note Webhook URL
    Take note of, and copy the Webhook URL that is provided in this tab
    :::

3. Click **Save** at the bottom of the page.

</details>

## Create a webhook in Codecov
1. From your Codecov account, open **Settings**;
2. Click on the **Global YAML** tab at the left sidebar menu;
3. In the YAML editor, add the following Codecov configuration to notify Port anytime an event occurs in your code repositories:

    ```yaml
    coverage:
    notify:
        webhook:
        default:
            only_pulls: false
            url: YOUR_PORT_WEBHOOK
    ```
    :::note Webhook URL replacement
    Remember to replace `YOUR_PORT_WEBOOK` with the value of the `URL` you received after creating the webhook configuration in Port.
    :::

    :::tip notification service customization
    For more information on customizing the notification service, follow this [guide](https://docs.codecov.com/docs/notifications#standard-notification-fields)
    :::

3. Click **Save changes** to save the webhook configuration.

For more information on customizing the notification service, follow [this documentation](https://docs.codecov.com/docs/notifications#standard-notification-fields)

All set! When any changes occur in your Codecov account, a webhook event will be triggered to the URL provided by Port. Port will then parse the events based on the mapping and subsequently update the catalog entities.

## Import historical Codecov coverage

In this example you are going to use the provided Python script to fetch coverage data from Codecov REST API and ingest it to Port.

### Prerequisites

This example utilizes the same [blueprint and webhook](#port-configuration) definition from the previous section.

In addition, provide the following environment variables:

- `PORT_CLIENT_ID` - Your Port client id
- `PORT_CLIENT_SECRET` - Your Port client secret
- `CODECOV_TOKEN` - Codecov API access token
- `CODECOV_SERVICE_PROVIDER` - Git hosting service provider. Accepts values such as `github`, `github_enterprise`, `bitbucket`, `bitbucket_server`, `gitlab` and `gitlab_enterprise`
- `CODECOV_SERVICE_PROVIDER_ACCOUNT_NAME` - Username from the Git service provider

:::info Credentials
Find your Port credentials using this [guide](https://docs.port.io/build-your-software-catalog/custom-integration/api/#find-your-port-credentials)

Find your Codecov API token using this [guide](https://docs.codecov.com/reference/overview)
:::

Use the following Python script to ingest historical Codecov coverage into port:

<details>
<summary>Codecov Python script</summary>

<CodecovPythonScript/>

</details>

### Running the python script

To ingest coverage data from your Codecov account to Port, run the following commands:

```bash
export PORT_CLIENT_ID=<ENTER CLIENT ID>
export PORT_CLIENT_SECRET=<ENTER CLIENT SECRET>
export CODECOV_TOKEN=<ENTER CODECOV TOKEN>
export CODECOV_SERVICE_PROVIDER=<ENTER CODECOV SERVICE PROVIDER>
export CODECOV_SERVICE_PROVIDER_ACCOUNT_NAME=<ENTER CODECOV SERVICE PROVIDER ACCOUNT NAME>

git clone https://github.com/port-labs/example-codecov-test-coverage.git

cd example-codecov-test-coverage

pip install -r ./requirements.txt

python app.py
```

:::tip Python script information
Find more information about the python script [here](https://github.com/port-labs/example-codecov-test-coverage)
:::

Done! you are now able to import historical coverage from Codecov into Port. Port will parse the objects according to the mapping and update the catalog entities accordingly.

## Let's Test It

This section includes a sample response data from Codecov. In addition, it includes the entity created from the resync event based on the Ocean configuration provided in the previous section.

### Payload

Here is an example of the payload structure from Codecov:

<details>
<summary><b>Coverage response data (Click to expand)</b></summary>

```json showLineNumbers
{
  "body": {
    "repo": {
      "url": "https://app.codecov.io/gh/slanks/codecov-example",
      "service_id": "742056150",
      "name": "codecov-example",
      "private": false
    },
    "head": {
      "author": {
        "username": "slanks",
        "service_id": "15999660",
        "email": "slanks@email.com",
        "service": "github",
        "name": "PagesCoffy"
      },
      "url": "https://app.codecov.io/gh/slanks/codecov-example/commit/a7794fc92007d3a1b99066c8f6ec66a393bf3520",
      "timestamp": "2024-02-02T14:21:35",
      "totals": {
        "files": 3,
        "lines": 36,
        "hits": 35,
        "misses": 1,
        "partials": 0,
        "coverage": "97.22222",
        "branches": 0,
        "methods": 0,
        "messages": 0,
        "sessions": 2,
        "complexity": 0,
        "complexity_total": 0,
        "diff": [0, 0, 0, 0, 0, null, 0, 0, 0, 0, null, null, 0]
      },
      "commitid": "a7794fc92007d3a1b99066c8f6ec66a393bf3520",
      "service_url": "https://github.com/slanks/codecov-example/commit/a7794fc92007d3a1b99066c8f6ec66a393bf3520",
      "branch": "slanks-patch-11",
      "message": "Update sonarqube.yml"
    },
    "base": {
      "author": {
        "username": "slanks",
        "service_id": "15999660",
        "email": "slanks@email.com",
        "service": "github",
        "name": "PagesCoffy"
      },
      "url": "https://app.codecov.io/gh/slanks/codecov-example/commit/ce38c96963e6c7100f668503da2ce4e7500de739",
      "timestamp": "2024-02-02T14:17:51",
      "totals": {
        "files": 3,
        "lines": 36,
        "hits": 35,
        "misses": 1,
        "partials": 0,
        "coverage": "97.22222",
        "branches": 0,
        "methods": 0,
        "messages": 0,
        "sessions": 2,
        "complexity": 0,
        "complexity_total": 0,
        "diff": [0, 0, 0, 0, 0, null, 0, 0, 0, 0, null, null, 0]
      },
      "commitid": "ce38c96963e6c7100f668503da2ce4e7500de739",
      "service_url": "https://github.com/slanks/codecov-example/commit/ce38c96963e6c7100f668503da2ce4e7500de739",
      "branch": "slanks-patch-10",
      "message": "Update sonarqube.yml"
    },
    "compare": {
      "url": "https://app.codecov.io/gh/slanks/codecov-example/pull/11",
      "message": "no change",
      "coverage": "0.00",
      "notation": ""
    },
    "owner": {
      "username": "slanks",
      "service_id": "15999660",
      "service": "github"
    },
    "pull": {
      "head": {
        "commit": "a7794fc92007d3a1b99066c8f6ec66a393bf3520",
        "branch": "master"
      },
      "number": "11",
      "base": {
        "commit": "ce38c96963e6c7100f668503da2ce4e7500de739",
        "branch": "master"
      },
      "open": true,
      "id": 11,
      "merged": false
    }
  }
}
```

</details>

### Mapping Result

The combination of the sample payload and the Ocean configuration generates the following Port entity:

<details>
<summary><b>Coverage entity in Port (Click to expand)</b></summary>

```json showLineNumbers
{
  "identifier": "codecov-example",
  "title": "codecov-example",
  "blueprint": "codecov_coverage",
  "properties": {
    "repository": "https://app.codecov.io/gh/slanks/codecov-example",
    "coverage": "97.22222",
    "service": "github",
    "author": "PagesCoffy",
    "createdAt": "2024-02-02T14:21:35Z",
    "files": 3,
    "lines": 36,
    "branch": "slanks-patch-11",
    "report": {
      "files": 3,
      "lines": 36,
      "hits": 35,
      "misses": 1,
      "partials": 0,
      "coverage": "97.22222",
      "branches": 0,
      "methods": 0,
      "messages": 0,
      "sessions": 2,
      "complexity": 0,
      "complexity_total": 0,
      "diff": [0, 0, 0, 0, 0, null, 0, 0, 0, 0, null, null, 0]
    }
  },
  "relations": {},
  "filter": true
}
```

</details>