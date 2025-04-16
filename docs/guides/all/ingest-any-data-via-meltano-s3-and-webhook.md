---
title: Ingest Any data source into Port via Meltano, S3 and Webhook
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import MeltanoS3DestinationSetup from "/docs/generalTemplates/_meltano_s3_destination_setup.md"
import S3IntegrationDisclaimer from "/docs/generalTemplates/_s3_integrations_disclaimer.md"
import GenericDataModelSetup from "/docs/generalTemplates/_generic_data_model_setup.md"
import MeltanoPrerequisites from "/docs/generalTemplates/_meltano_prerequisites.md"

# Ingest any data source into Port via Meltano, S3 and webhook

This guide will demonstrate how to ingest any data source into Port using [Meltano](https://Meltano.com/), [S3](https://aws.amazon.com/s3/) and a [webhook integration](https://docs.port.io/build-your-software-catalog/custom-integration/webhook/).

<img src="/img/guides/s3integrations-meltano.png" width="95%" border="1px" />
<br/>
<br/>
<S3IntegrationDisclaimer/>

## Prerequisites

<MeltanoPrerequisites/>

## Meltano setup

:::info Recommended
Refer to this [GitHub Repository](https://github.com/port-experimental/meltano-integration-examples) to view examples and prepared code sample for various integrations.
:::

To integrate any data source supported by Meltano into Port, you will need to:

- ### Set up the Meltano S3 loader (Only once):

<MeltanoS3DestinationSetup/>

- ### Set up the Data Source extractor (Once per data source you wish to integrate):

Meltano provides detailed [documentation](https://hub.meltano.com/extractors/) on how to generate/receive the appropriate credentials to set each extractor, as well as alternate implementation options. Once the appropriate credentials are prepared, you may set up the meltano extractor:

<Tabs groupId="Install Meltano Extractor" queryString values={[{label: "shell", value: "shell"}]}>
<TabItem value="shell" label="shell">

1. Navigate to your meltano environment:

    ```shell showLineNumbers
    cd path/to/your/meltano/project/
    ```

2. Install the source plugin you wish to extract data from:

    ```shell
    meltano add extractor <extractor-name>
    ```

3. Configure the plugin using the interactive CLI prompt:

    ```shell
    meltano config <extractor-name> set --interactive
    ```

4. [Optional] - Some extractors can be tested using this command:

    ```shell
    meltano config <extractor-name> test
    ```

</TabItem>
</Tabs>

- ### Set up the Connection between the extractor and destination

In this step you will be able to define what data will be ingested and to which webhook integration in Port.

First, we will first create a specific target-s3 for the webhook we created:

```shell
meltano add loader target-s3-X --inherit-from target-s3
meltano config target-s3-X set prefix data/<WEBHOOK_URL>
meltano config target-s3-X set format format_type jsonl
```

Running the connection:

```shell
meltano el <extract-name> target-s3-X
```

### Stream selection

Select streams (by default - meltano will attempt to extract all available streams):

```shell
meltano select <extractor-name> --list
meltano select <extractor-name> <stream-name>.<stream-field>
```

### Discoverable Taps

Some taps are built with the `discover` capability, which lets you extract the stream schema for dynamical data sources, such as databases.
This is useful in controlling which data will be extracted from these taps, to discover a schema:

```shell
meltano invoke <extractor-name> --discover > extract/catalog.json
```

This will enable you to manually alter the catalog file to manage stream selection.
A common use-case, for example, is to limit the catalog to a specific schema, using `jq`:

```shell
jq '{streams: [.streams[] | select(.tap_stream_id | startswith("<SCHEMA_NAME>-"))]}' extract/catalog.json > extract/filtered-catalog.json
```

And setting the loader to use this catalog in the configuration file using the `catalog` extra field, for example:

```yaml
  - name: tap-athena
    variant: meltanolabs
    pip_url: git+https://github.com/MeltanoLabs/tap-athena.git
    catalog: extract/athena-filtered-catalog.json
```

<GenericDataModelSetup/>

## Troubleshooting

### Issues with Meltano->S3 integration

Meltano provides detailed logs available through the web application on currently running sync processes as well as historical ones.  
After a successful sync has completed, you will be able to see how long ago it was executed, and how many records were loaded to S3 in every stream.

To further diagnose issues in case of a failed operation, you may set the `log_level` to `DEBUG` when running meltano commands:

```shell
meltano --log-level=debug ...
```

#### Meltano Error - Package ```<plugin-name>``` requires a different Python...

If the Python version you are using in your environment is not compatible with the version required to run a specific plugin, you can use the "python" plugin parameter to direct meltano to use a specific Python binary file. This can be done either before the installation, by adding the --python argument:

```shell
meltano add <plugin-type> <plugin-name> --python /path/to/python3.X
```

Or by adding the python field to the ```meltano.yaml```, for example:

```yaml
plugins:
  loaders:
  - name: <plugin-name>
    python: /path/to/python3.X
    config:
      X: Y
```

More info in [Meltano's settings reference](https://docs.meltano.com/reference/settings#python)

### Issues with S3->Port ingestion

If everything in Meltano is working properly, and you don't see the data in your Port account, you can follow these steps to diagnose the root cause:

#### Issues in the Webhook

1. Navigate to [Data Sources page](https://app.getport.io/settings/data-sources) in your port account.

2. Locate the Webhook integration you have set for the ingestion, and click on it.

3. In the pop-up interface, under "Add test Event" click on "Load latest event".

4. You should now see an example event that was received from the ingestion pipeline (in case you don't - scroll down to the below section in this guide: Data in S3 is not propagating to Port).

5. Scroll down to the section "Test Mapping" and click on the "Test Mapping" button at the bottom of the pop-up interface.  
You should see the result of the mapping applied on the latest event that was received by the webhook URL in the text box above the "Test Mapping" button.  
If you encounter a jq error - it means you have a syntax error or the source's schema does not match the mapping you have set and you will need to adjust the mapping properly.  
If you encounter a JSON document list, it means the mapping is working properly, but it could be that the filters you have set in it all result in "false" (which means no entity will be created).  
In this case you will need to look over the appropriate element in the document (with the relevant blueprint for the loaded event) and adjust the mapping so that the "filter" field will result to "true".

#### Issues in the blueprint definition

1. Navigate to the [Data Sources page](https://app.getport.io/settings/data-sources) of your port account.

2. Locate the webhook integration you have set for the ingestion, and click on it.

3. In the pop-up interface, in the top pane menu click on "Audit Log".

4. You can now browse for issues in ingestion of specific entities in the audit log, or apply a filter where **Status != "Success"**.  
If any entities were created but failed to ingest, you will see an indicative error that may lead you to the issue in the blueprint definition.

#### Data is not propagating from S3 to Port

If you're sure the Meltano integration is working properly, there are no records in the Audit Log, and the "Load latest event" button does not produce an event in the corresponding box, there might be an issue with the pipeline set up by Port.  
In this case, contact us using chat/Slack/mail to [support@getport.io](mailto:support@getport.io) and our support team will assist in diagnosing and solving the issue.

### Additional relevant guides

- [Ingest Slack data into port](https://docs.port.io/guides/all/ingest-slack-data-via-meltano-s3-and-webhook)
- [Ingest Athena data into port](https://docs.port.io/guides/all/ingest-athena-data-via-meltano-s3-and-webhook)
- [Ingest Any data into port via Airbyte](https://docs.port.io/guides/all/ingest-any-data-via-airbyte-s3-and-webhook)
