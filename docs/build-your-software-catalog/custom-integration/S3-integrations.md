---
title: S3 bucket
---

import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"
import PortTooltip from "/src/components/tooltip/tooltip.jsx"
import AirbyteS3DestinationSetup from "/docs/generalTemplates/_airbyte_s3_destination_setup.md"
import S3IntegrationDisclaimer from "/docs/generalTemplates/_s3_integrations_disclaimer.md"

# S3 bucket

Port allows you to ingest any data source by using [Airbyte](https://airbyte.com/), storing the data temporarily in [S3 bucket](https://aws.amazon.com/s3/), and then triggering ingestion via a [Webhook](https://docs.port.io/build-your-software-catalog/custom-integration/webhook/).  

This flow is useful for syncing external data sources where no direct integration exists yet or where you need to have control over the ingestion process.

<img src="/img/guides/s3integrations.png" width="95%" border="1px" />
<br/>
<br/>
<S3IntegrationDisclaimer/>

## Detailed examples

The following guides walk you through ingesting specific data sources into Port using Airbyte, S3 and webhook:
- [Ingest Slack data into Port](https://docs.port.io/guides/all/ingest-slack-data-via-airbyte-s3-and-webhook)
- [Ingest Okta data into Port](https://docs.port.io/guides/all/ingest-okta-data-via-airbyte-s3-and-webhook)
- [Ingest Hibob data into Port](https://docs.port.io/guides/all/ingest-hibob-data-via-airbyte-s3-and-webhook)

## How it works

Airbyte connects to your data source, which can be any of Airbyte’s supported connectors.  
The extracted data is then written to an Amazon S3 bucket, and is ready to be picked up for ingestion.

Once the data is in S3, Port’s webhook integration can be triggered, either manually or automatically, to fetch it.

Finally, the webhook fetches the data from S3, transforms it based on your blueprint and mapping, and ingests it into Port.

## Airbyte setup

To integrate Airbyte-supported data source into Port, you will need to:
1. Set up the S3 destination (only once).

2. Set up the Data Source - once per data source you wish to integrate. Airbyte provides detailed [documentation](https://docs.airbyte.com/integrations/sources/) on how to generate/receive the appropriate credentials to set each data source.

3. Set up the Connection between the source and destination - in this step you will be able to define what data will be ingested, to which webhook integration in Port (see below "Set up the Connection"), how often will the sync will be executed, and in what mode (full refresh / incremental).  

### Set up S3 Destination

<AirbyteS3DestinationSetup/>

### Set up data source

<h3>Find the connector in Airbyte</h3>

Airbyte supports a wide range of [connectors](https://airbyte.com/connectors?connector-type=Sources).

Setup is often straightforward (such as generating an API key),
and some connectors may require extra steps (like creating a Slack app).

If a connector doesn’t exist yet, you can [request it](https://airbyte.com/connector-requests) from the Airbyte
community or build your own.

### Set up the connection in Airbyte

1. In the Airbyte "Connections" page, create a "+ New Connection".

2. For **Source**, choose your desired data source.

3. For **Destination**, choose the S3 Destination you have set up.

4. In the **Select Streams** step, check the streams you are interested in synchronizing into Port.

5. In the **Configuration** step, under "Destination Namespace", choose "Custom Format" and enter the webhook URL you copied when setting up the webhook, for example: "wSLvwtI1LFwQzXXX".

6. **Click on Finish & Sync** to apply and start the Integration process!


## Data model setup

### Figure out the target schema and mapping

To define the data model, you will need to know the schema of the data you want to ingest.  
If you are unsure about the schema that the connector extracts, you can always set up the Airbyte connection to S3 first,
and during the **Select Streams** step in the connection setup, review the expected schema for each stream and construct the appropriate blueprints and mappings:

<img src="/img/guides/airbyteSelectStreamsScreenshot.png" width="70%" border="1px" />
<br/>

Alternatively, you can set up the connection and start the sync, then download the extracted files from S3, review them, and construct the appropriate blueprints and mappings.

:::tip Resync Airbyte After Port Setup
If you set up a connection to S3 before setting the target blueprints and mappings, you will have to execute a "resync" 
in airbyte after the resources in Port have been properly set up.
:::

**To download the extracted S3 files:**

<Tabs groupId="Download S3 files extracted by Airbyte" queryString values={
[{label: "AWS CLI", value: "aws_cli"},{label: "Python (Boto3)", value: "python_boto3"}]
}>

<TabItem value="aws_cli" label="AWS CLI">

1. Install AWS CLI:
Download and install the AWS CLI from [AWS’s official page](https://aws.amazon.com/cli/).

2. Configure Your Credentials:
Run the command below and input your `ACCESS_KEY`, `SECRET_KEY`, and `region`:

```code showLineNumbers
aws configure
```
Alternatively, you can set the environment variables `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_DEFAULT_REGION`.

3. Download Files from S3:
Use the following command, replacing the placeholders with your bucket name and file prefix:

```code showLineNumbers
aws s3 cp s3://<bucket-name>/<file-prefix> ./local-folder --recursive
```
for example:
``` code showLineNumbers
aws s3 cp s3://org-XXX/data/abc123/ ./my_extracted_data --recursive
```

This command copies all files that start with your specified prefix into the local folder (create it if needed).

</TabItem>

<TabItem value="python_boto3" label="Python (Boto3)">

Run the following command to install boto3 if you haven’t already:

``` code showLineNumbers
pip install boto3
```

Copy and paste this code into a file (e.g., download_s3.py), replacing the placeholders with your actual details:

``` code showLineNumbers
import boto3

# Initialize the S3 client with your credentials and region
s3 = boto3.client(
    's3',
    aws_access_key_id='YOUR_ACCESS_KEY_ID',
    aws_secret_access_key='YOUR_SECRET_ACCESS_KEY',
    region_name='YOUR_REGION'
)

bucket_name = 'your-bucket-name'
prefix = 'your/file/prefix/'  # Ensure this ends with '/' if you want a folder-like behavior

# List objects within the specified prefix
response = s3.list_objects_v2(Bucket=bucket_name, Prefix=prefix)

# Download each file found
for obj in response.get('Contents', []):
    key = obj['Key']
    # Define a local filename (you might want to recreate the directory structure)
    local_filename = key.split('/')[-1]
    print(f"Downloading {key} to {local_filename}...")
    s3.download_file(bucket_name, key, local_filename)
```

Execute your script from the terminal:

``` code showLineNumbers
python download_s3.py
```

</TabItem>

</Tabs>

Once the files are in your local device you can use your preferred text editor to review it's content and
construct the appropriate blueprints and mappings for your data.


### Create blueprints 

Once you have decided on the desired blueprints you wish to set up, you can refer to the [blueprint creation docs](https://docs.port.io/build-your-software-catalog/customize-integrations/configure-data-model/setup-blueprint/?definition=ui) to set them up in your account.


### Create webhook integration

Once you have decided on the mappings you wish to set up, you can refer to the [webhook creation docs](https://docs.port.io/build-your-software-catalog/custom-integration/webhook/) to set them up in your portal.

:::tip Using the generated webhook URL 
It is important that you use the generated webhook URL when setting up the Connection in Airbyte, otherwise the data will not be automatically ingested into Port from S3.
:::


## Troubleshooting

### Issues with Airbyte->S3 integration

Airbyte provides detailed logs available through the web application on currently running sync processes as well as historical ones.  
After a successful sync has completed, you will be able to see how long ago it was executed, and how many records were loaded to S3 in every stream.

### Issues with S3->Port ingestion

If everything in Airbyte is working properly, and you don't see the data in your Port account, you can follow these steps to diagnose the root cause:

<h3>Issues with the webhook</h3>
1. Navigate to [Data Sources page](https://app.getport.io/settings/data-sources) in your port account.

2. Locate the Webhook integration you have set for the ingestion, and click on it.

3. In the pop-up interface, under "Add test Event" click on "Load latest event". 

4. You should now see an example event that was received from the ingestion pipeline (in case you don't - scroll down to the below section in this guide: Data in S3 is not propagating to Port).

5. Scroll down to the section "Test Mapping" and click on the "Test Mapping" button at the bottom of the pop-up interface.  
You should see the result of the mapping applied on the latest event that was received by the webhook URL in the text box above the "Test Mapping" button.  
If you encounter a jq error - it means you have a syntax error or the source's schema does not match the mapping you have set and you will need to adjust the mapping properly.  
If you encounter a JSON document list, it means the mapping is working properly, but it could be that the filters you have set in it all result in "false" (which means no entity will be created).  
In this case you will need to look over the appropriate element in the document (with the relevant blueprint for the loaded event) and adjust the mapping so that the "filter" field will result to "true".

<h3>Issues with the blueprint definition</h3>
1. Navigate to the [Data Sources page](https://app.getport.io/settings/data-sources) of your port account.

2. Locate the webhook integration you have set for the ingestion, and click on it.

3. In the pop-up interface, in the top pane menu click on "Audit Log".

4. You can now browse for issues in ingestion of specific entities in the audit log, or apply a filter where **Status != "Success"**.  
If any entities were created but failed to ingest, you will see an indicative error that may lead you to the issue in the blueprint definition.

<h3>Data is not propagating from S3 to Port</h3>
If you're sure the Airbyte integration is working properly, there are no records in the Audit Log, and the "Load latest event" button does not produce an event in the corresponding box, there might be an issue with the pipeline set up by Port.  
In this case, contact us using chat/Slack/mail to [support@getport.io](mailto:support@getport.io) and our support team will assist in diagnosing and solving the issue.