---
title: Ingest Any data source into Port via Airbyte, S3 and Webhook
displayed_sidebar: null
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import AirbyteS3DestinationSetup from "/docs/generalTemplates/_airbyte_s3_destination_setup.md"
import S3IntegrationDisclaimer from "/docs/generalTemplates/_s3_integrations_disclaimer.md"
import GenericDataModelSetup from "/docs/generalTemplates/_generic_data_model_setup.md"

# Ingest any data source into Port via Airbyte, S3 and webhook

This guide will demonstrate how to ingest any data source into Port using [Airbyte](https://airbyte.com/), [S3](https://aws.amazon.com/s3/) and a [webhook integration](https://docs.port.io/build-your-software-catalog/custom-integration/webhook/).

<img src="/img/guides/s3integrations-airbyte.png" width="95%" border="1px" />
<br/>
<br/>
<S3IntegrationDisclaimer/>

## Prerequisites

- Ensure you have a Port account and have completed the [onboarding process](https://docs.port.io/quickstart).

- This feature is part of Port's limited-access offering. To obtain the required S3 bucket, please contact our team directly via chat, [Slack](https://www.getport.io/community), or [e-mail](mailto:support@getport.io), and we will create and manage the bucket on your behalf.

- Access to an available Airbyte app (can be cloud or self-hosted) - for reference, follow the [quick start guide](https://docs.airbyte.com/using-airbyte/getting-started/oss-quickstart).


## Airbyte setup

To integrate Airbyte-supported data source into Port, you will need to:

1. Set up the S3 destination (only once).

2. Set up the Data Source - once per data source you wish to integrate. Airbyte provides detailed [documentation](https://docs.airbyte.com/integrations/sources/) on how to generate/receive the appropriate credentials to set each data source.

3. Set up the Connection between the source and destination - in this step you will be able to define what data will be ingested, to which webhook integration in Port (see below "Set up the Connection"), how often will the sync will be executed, and in what mode (full refresh / incremental).  

### Set up S3 Destination

<AirbyteS3DestinationSetup/>

### Set up data source

#### Find the connector in Airbyte

Airbyte supports a wide range of [connectors](https://airbyte.com/connectors?connector-type=Sources).

Setup is often straightforward (such as generating an API key),
and some connectors may require extra steps (like creating a Slack app).

If a connector doesn’t exist yet, you can [request it](https://airbyte.com/connector-requests) from the Airbyte
community or build your own.

### Set up the connection in Airbyte

1. In the Airbyte "Connections" page, create a "+ New Connection".

2. For **Source**, choose your desired data source.

3. For **Destination**, choose the S3 Destination you have set up.

4. In the **Select Streams** step, check the streams you are interested in synchronizing into Port. In this step you can also review the exected schema for each stream:

    <img src="/img/guides/airbyteSelectStreamsScreenshot.png" width="70%" border="1px" />
    <br/>

5. In the **Configuration** step, under "Destination Namespace", choose "Custom Format" and enter the webhook URL you copied when setting up the webhook, for example: "wSLvwtI1LFwQzXXX".

6. **Click on Finish & Sync** to apply and start the Integration process!

<GenericDataModelSetup/>

## Troubleshooting

### Issues with Airbyte->S3 integration

Airbyte provides detailed logs available through the web application on currently running sync processes as well as historical ones.  
After a successful sync has completed, you will be able to see how long ago it was executed, and how many records were loaded to S3 in every stream.

### Issues with S3->Port ingestion

If everything in Airbyte is working properly, and you don't see the data in your Port account, you can follow these steps to diagnose the root cause:

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

If you're sure the Airbyte integration is working properly, there are no records in the Audit Log, and the "Load latest event" button does not produce an event in the corresponding box, there might be an issue with the pipeline set up by Port.  
In this case, contact us using chat/Slack/mail to [support@getport.io](mailto:support@getport.io) and our support team will assist in diagnosing and solving the issue.

## Additional relevant guides

- [Ingest Slack data into port](https://docs.port.io/guides/all/ingest-slack-data-via-airbyte-s3-and-webhook)
- [Ingest Okta data into port](https://docs.port.io/guides/all/ingest-okta-data-via-airbyte-s3-and-webhook)
- [Ingest Hibob data into port](https://docs.port.io/guides/all/ingest-hibob-data-via-airbyte-s3-and-webhook)
- [Ingest Any data into port via Meltano](https://docs.port.io/guides/all/ingest-any-data-via-meltano-s3-and-webhook)
