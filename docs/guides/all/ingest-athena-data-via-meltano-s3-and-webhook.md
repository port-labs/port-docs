---
title: Ingest Athena data into Port via Meltano, S3 and Webhook
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import MeltanoS3DestinationSetup from "/docs/generalTemplates/_meltano_s3_destination_setup.md"
import S3IntegrationDisclaimer from "/docs/generalTemplates/_s3_integrations_disclaimer.md"
import MeltanoPrerequisites from "/docs/generalTemplates/_meltano_prerequisites.md"

# Ingest Athena data into Port via Meltano, S3 and webhook

This guide will demonstrate how to ingest [Athena](https://aws.amazon.com/athena/) into Port using [Meltano](https://meltano.com/), [S3](https://aws.amazon.com/s3/) and a [webhook integration](https://docs.port.io/build-your-software-catalog/custom-integration/webhook/).

<S3IntegrationDisclaimer/>

## Prerequisites

<MeltanoPrerequisites/>

- Access to AWS credentials with query access to your account's Athena - follow [AWS guide for security management in Athena](https://docs.aws.amazon.com/athena/latest/ug/security-iam-athena.html).

## Data model setup

### Add Blueprints

Since Athena is a data source with dynamic schema, this guide cannot include the target blueprints for your use-case in advance.
You will need to create the target blueprints to replicate the data schema as is OR add some tranformations in the target schema in Port.

Once you have decided on the desired blueprints you wish to set up, you can refer to the [blueprint creation docs](https://docs.port.io/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/?definition=ui) to set them up in your account.

### Create webhook integration

Since Athena is a data source with dynamic schema, this guide cannot include the mapping configuration for your use-case in advance.
Once you have decided on the mappings you wish to set up, you can refer to the [webhook creation docs](https://docs.port.io/build-your-software-catalog/custom-integration/webhook/) to set them up in your portal.

:::tip Important
It is important that you use the generated webhook URL when setting up the Connection, otherwise the data will not be automatically ingested into Port from S3.
:::

## Meltano Setup

:::info Recommended
Refer to this [GitHub Repository](https://github.com/port-labs/pending-repo) to view examples and prepared code sample for this integration.
:::

### Set up S3 Destination

If you haven't already set up S3 Destination for Port S3, follow these steps:

<MeltanoS3DestinationSetup/>

### Set up Athena Connection

1. Install and configure a Athena extractor, for more information go to: [Athena extractor](https://hub.meltano.com/extractors/tap-athena).

  Add the tap-ahena extractor to your project using meltano add :

    ```shell
    meltano add extractor tap-athena
    ```

  Configure the tap-Athena settings using meltano config :

    ```shell
    meltano config tap-athena set --interactive
    ```

  Test that extractor settings are valid using meltano config :

    ```shell
    meltano config tap-athena test
    ```

    *Optional*:
    Since Athena is a data source with dynamic catalog, you can use the built-in with the `discover` capability, which lets you extract the stream catalog:

    ```shell
    meltano invoke tap-athena --discover > extract/athena-catalog.json
    ```

    This will enable you to manually alter the catalog file to manage stream selection.
    A common use-case, for example, is to limit the catalog to a specific schema, using `jq`:

    ```shell
    jq '{streams: [.streams[] | select(.tap_stream_id | startswith("<SCHEMA_NAME>-"))]}' extract/athena-catalog.json > extract/athena-filtered-catalog.json
    ```

  And setting the loader to use this catalog in the configuration file using the `catalog` extra field, for example:

    ```yaml
      - name: tap-athena
        variant: meltanolabs
        pip_url: git+https://github.com/MeltanoLabs/tap-athena.git
        catalog: extract/athena-filtered-catalog.json
    ```

2. Create a specific target-s3 loader for the webhook you created, and **enter the Webhook URL you have copied when setting up the webhook** as the part of the `prefix` configuration field, for example: "`data/wSLvwtI1LFwQzXXX`".

    ```shell
    meltano add loader target-s3--athenaintegration --inherit-from target-s3
    meltano config target-s3--athenaintegration set prefix data/<WEBHOOK_URL>
    meltano config target-s3--athenaintegration set format format_type jsonl
    ```

3. Run the connection:

    ```shell
    meltano el tap-athena target-s3--athenaintegration
    ```

## Additional relevant guides

- [Ingest Any data into port via Airbyte](https://docs.port.io/guides/all/ingest-any-data-via-airbyte-s3-and-webhook)
- [Ingest Any data into port via Meltano](https://docs.port.io/guides/all/ingest-any-data-via-meltano-s3-and-webhook)
