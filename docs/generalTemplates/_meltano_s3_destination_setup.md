import Tabs from "@theme/Tabs"
import TabItem from "@theme/TabItem"

Meltano provides detailed [documentation](https://hub.meltano.com/loaders/target-s3) on how to generate/receive the appropriate credentials to set the s3-target loader. 
Once the appropriate credentials are prepared, you may set up the meltano extractor:

<Tabs groupId="Install Meltano S3 Loader" queryString values={[{label: "shell", value: "shell"}]}>
<TabItem value="shell" label="shell">

1. Navigate to your meltano environment:

   ```shell showLineNumbers
   cd path/to/your/meltano/project/
   ```

2. Install the source plugin you wish to extract data from:

   ```shell
   meltano add loader target-s3
   ```

3. Configure the plugin using the interactive CLI prompt:

   ```shell
   meltano config target-s3 set --interactive
   ```

   Or set the configuration parameters individually using the CLI:

   ```shell
   # required
   meltano config target-s3 set cloud_provider.aws.aws_access_key_id $AWS_ACCESS_KEY_ID 
   meltano config target-s3 set cloud_provider.aws.aws_secret_access_key $AWS_SECRET_ACCESS_KEY 
   meltano config target-s3 set cloud_provider.aws.aws_bucket $AWS_BUCKET 
   meltano config target-s3 set cloud_provider.aws.aws_region $AWS_REGION
   # recommended
   meltano config target-s3 set append_date_to_filename_grain microsecond
   meltano config target-s3 set partition_name_enabled true
   meltano config target-s3 set prefix 'data/'
   ```

</TabItem>
</Tabs>
