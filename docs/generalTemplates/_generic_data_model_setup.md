import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

## Data model setup

### Figure out the target schema and mapping

To define the data model, you will need to know the schema of the data you want to ingest.  
If you are unsure about the schema that the connector extracts, you can always set up the connection, and during the **stream selection** step, review the expected schema.

Alternatively, you can set up the connection and start the sync, then download the extracted files from S3, review them, and construct the appropriate blueprints and mappings.

:::tip Important
If you set up a connection to S3 before setting the target blueprints and mappings, you will have to execute a "resync" after the resources in Port have been properly set up.
:::

**To download the extracted S3 files:**

<Tabs groupId="Download files extracted to S3" queryString values={[{label: "AWS CLI", value: "aws_cli"},{label: "Python (Boto3)", value: "python_boto3"}]}>

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

:::tip Important
It is important that you use the generated webhook URL when setting up the Connection, otherwise the data will not be automatically ingested into Port from S3.
:::